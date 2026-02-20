/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  FileText, Plus, Search, Archive, Download, 
  ShieldCheck, X, Save, Loader2, FileUp, 
  History, CheckCircle2, Eye, Hash, Calendar, FileType
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * 💡 UTILITAIRE DE CONCATÉNATION DE CLASSES
 */
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

/**
 * 🛡️ COMPOSANT : BADGE DE STATUT DOCUMENTAIRE
 * Gère la signalétique visuelle du cycle de vie d'un document (Workflow §7.5.3).
 */
const StatusBadge = ({ status }: { status: string }) => {
  const config: any = {
    'BROUILLON': 'text-slate-400 border-slate-400/20 bg-slate-400/5',
    'EN_REVUE': 'text-amber-500 border-amber-500/20 bg-amber-500/5',
    'APPROUVE': 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
    'ARCHIVE': 'text-red-400 border-red-400/20 bg-red-400/5'
  };
  return (
    <span className={cn("px-4 py-1.5 rounded-full text-[8px] font-black border uppercase italic tracking-widest", config[status] || config.BROUILLON)}>
      {status?.replace('_', ' ') || 'INCONNU'}
    </span>
  );
};

/**
 * 📈 COMPOSANT : MÉTRIQUE GED
 * Visualisation des indicateurs de performance documentaire.
 */
const MetricCard = ({ title, val, icon: LucideIcon, color }: any) => {
  const colors: any = {
    blue: 'text-blue-500 bg-blue-500/5 border-blue-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
    amber: 'text-amber-500 bg-amber-500/5 border-amber-500/10',
    slate: 'text-slate-500 bg-slate-500/5 border-white/10'
  };

  return (
    <div className={cn("p-8 rounded-[2.5rem] border bg-white/2 relative overflow-hidden group hover:border-blue-600 transition-all duration-500 shadow-2xl backdrop-blur-sm", colors[color])}>
      {/* Background Icon pour l'esthétique Matrix */}
      {LucideIcon && <LucideIcon className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-all duration-700" size={120} />}
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className={cn("p-3 rounded-xl border", colors[color])}>
            {LucideIcon && <LucideIcon size={18} />}
        </div>
        <p className="text-[9px] text-slate-500 tracking-[0.3em] font-black uppercase italic leading-none">{title}</p>
      </div>
      <p className="text-5xl font-black text-white leading-none tracking-tighter relative z-10 italic">{val}</p>
    </div>
  );
};

/**
 * 📂 PAGE PRINCIPALE : GESTION ÉLECTRONIQUE DES DOCUMENTS
 * Assure la conformité à l'ISO 9001 §7.5 (Information documentée).
 */
export default function GEDPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  /**
   * 📡 PROTOCOLE DE SYNCHRONISATION
   * Récupère le registre exhaustif depuis le Noyau Matrix.
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/documents');
      const rawData = res.data?.documents || res.data || [];
      setDocuments(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      console.error("Erreur Sync GED:", err);
      toast.error("SYNCHRONISATION INTERROMPUE");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * 🔢 GÉNÉRATEUR DE RÉFÉRENCE UNIQUE
   * Format standard Qualisoft : SAG-GED-XXX
   */
  const nextAutoRef = useMemo(() => {
    const count = documents.length + 1;
    return `SAG-GED-${String(count).padStart(3, '0')}`;
  }, [documents]);

  /**
   * 📊 MOTEUR ANALYTIQUE (KPIs)
   */
  const stats = useMemo(() => ({
    total: documents.length,
    approved: documents.filter(d => d.DOC_Status === 'APPROUVE').length,
    review: documents.filter(d => d.DOC_Status === 'EN_REVUE').length,
    archived: documents.filter(d => d.DOC_IsArchived).length
  }), [documents]);

  /**
   * 🔍 FILTRAGE DYNAMIQUE
   * Gère la recherche textuelle et le tri par catégorie de conformité.
   */
  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      const matchSearch = (d.DOC_Title || "").toLowerCase().includes(search.toLowerCase()) || 
                          (d.DOC_Reference || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || d.DOC_Category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [documents, search, categoryFilter]);

  /**
   * 💾 SOUMISSION ET INDEXATION (§7.5.3)
   * Prépare le payload FormData pour le transfert multipart des fichiers physiques.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return toast.error("FICHIER PHYSIQUE REQUIS (§7.5.3)");

    const formData = new FormData(e.currentTarget);
    formData.append('file', selectedFile);
    
    // Application de la référence automatique si le champ est vide
    if (!formData.get('DOC_Reference')) {
      formData.set('DOC_Reference', nextAutoRef);
    }

    const tid = toast.loading("INDEXATION DANS LE SMI...");
    try {
      await apiClient.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success("DOCUMENT INDEXÉ AVEC SUCCÈS", { id: tid });
      setIsModalOpen(false);
      setSelectedFile(null);
      await fetchData(); // Rafraîchissement du flux Matrix

    } catch (err: any) {
      console.error("Erreur Upload:", err);
      toast.error(err.response?.data?.message || "ERREUR DE RÉCEPTION", { id: tid });
    }
  };

  // --- ÉTAT DE PRÉ-CHARGEMENT QUANTIQUE ---
  if (loading && documents.length === 0) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] text-blue-600 font-black italic uppercase tracking-[0.5em]">
       <Loader2 className="animate-spin mr-6" size={35} /> NOYAU GED ACTIF...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col uppercase font-black overflow-x-hidden relative selection:bg-blue-600/30">
      
      {/* 🧩 INJECTION DE STYLE POUR MASQUER LES SCROLLBARS */}
      <style jsx global>{`
        ::-webkit-scrollbar { display: none !important; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>

      {/* 🔝 HEADER COCKPIT DOCUMENTAIRE */}
      <header className="p-10 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 shadow-2xl">
        <div className="text-left">
          <h1 className="text-4xl tracking-tighter italic leading-none font-black">SYSTÈME <span className="text-blue-600">GED</span></h1>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] mt-3 flex items-center gap-2 italic font-black uppercase">
            <ShieldCheck size={14} className="text-emerald-500" /> ISO 9001 §7.5 • MAÎTRISE DOCUMENTAIRE
          </p>
        </div>
        <div className="flex gap-6">
          <div className="relative w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              placeholder="RECHERCHER RÉFÉRENCE OU TITRE..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[11px] outline-none focus:border-blue-600 transition-all font-black italic uppercase text-white"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-2xl text-[10px] flex items-center gap-3 transition-all active:scale-95 shadow-3xl shadow-blue-900/40 border-none text-white cursor-pointer font-black italic"
          >
            <Plus size={20} strokeWidth={3} /> NOUVEAU DOCUMENT
          </button>
        </div>
      </header>

      

      <main className="p-12 space-y-12 flex-1">
        
        {/* 📊 SECTION DES INDICATEURS HAUTE FIDÉLITÉ */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <MetricCard title="Total Documents" val={stats.total} icon={FileText} color="blue" />
          <MetricCard title="Approuvés" val={stats.approved} icon={CheckCircle2} color="emerald" />
          <MetricCard title="En Revue" val={stats.review} icon={History} color="amber" />
          <MetricCard title="Archivés" val={stats.archived} icon={Archive} color="slate" />
        </section>

        {/* 🗂️ FILTRES DE CATÉGORIES (SMI Classification) */}
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
          {['ALL', 'PROCEDURE', 'MANUEL', 'ENREGISTREMENT', 'CONSIGNE', 'RAPPORT'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-8 py-4 rounded-2xl text-[10px] font-black transition-all border whitespace-nowrap uppercase italic cursor-pointer",
                categoryFilter === cat ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-900/40" : "bg-white/5 border-white/10 text-slate-500 hover:border-blue-600 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 📋 REGISTRE SMI (Tableau Matrix) */}
        <div className="bg-slate-900/20 border border-white/5 rounded-[4rem] overflow-hidden backdrop-blur-xl shadow-2xl transition-all hover:border-blue-500/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] text-slate-600 border-b border-white/5 italic font-black uppercase tracking-widest bg-white/2">
                <th className="p-10">Identification / Référence</th>
                <th className="p-10">Prochaine Revue</th>
                <th className="p-10">État Version</th>
                <th className="p-10">Niveau Statut</th>
                <th className="p-10 text-right">Actions de Pilotage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
                <tr key={doc.DOC_Id} className="hover:bg-blue-600/5 transition-all group animate-in fade-in duration-500">
                  <td className="p-10">
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-blue-500 mb-2 font-black tracking-tighter italic uppercase">{doc.DOC_Reference}</span>
                      <span className="text-base text-white font-black italic tracking-tight">{doc.DOC_Title}</span>
                      <span className="text-[9px] text-slate-600 lowercase mt-2 font-bold flex items-center gap-2">
                        <FileType size={12} /> {doc.DOC_Category}
                      </span>
                    </div>
                  </td>
                  <td className="p-10">
                    <div className="flex items-center gap-2 text-[10px] text-amber-500/80 font-black italic">
                      <Calendar size={14} />
                      {doc.DOC_NextReviewDate ? new Date(doc.DOC_NextReviewDate).toLocaleDateString() : 'INDÉTERMINÉE'}
                    </div>
                  </td>
                  <td className="p-10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-slate-500 text-[10px] font-black">REV.</span>
                      <span className="font-black text-white text-lg italic tracking-tighter">{doc.DOC_CurrentVersion}</span>
                    </div>
                  </td>
                  <td className="p-10">
                    <StatusBadge status={doc.DOC_Status} />
                  </td>
                  <td className="p-10 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button className="p-4 bg-white/5 hover:bg-blue-600 transition-all rounded-2xl text-slate-400 hover:text-white border-none cursor-pointer"><Eye size={20}/></button>
                      <button className="p-4 bg-white/5 hover:bg-emerald-600 transition-all rounded-2xl text-slate-400 hover:text-white border-none cursor-pointer"><Download size={20}/></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-32 text-center">
                    <Archive size={64} className="mx-auto text-slate-800 mb-8 opacity-20" />
                    <p className="text-slate-600 font-black uppercase italic tracking-[0.5em] text-xs leading-relaxed">
                       AUCUN DOCUMENT RÉPERTORIÉ DANS CE PÉRIMÈTRE
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* 📥 MODALE D'INDEXATION QUANTIQUE (§7.5.3) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <form 
            onSubmit={handleSubmit}
            className="bg-[#0B0F1A] border border-white/10 rounded-[4rem] w-full max-w-3xl p-16 space-y-10 shadow-4xl animate-in zoom-in-95 duration-500 italic text-left"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-10">
               <div className="text-left">
                  <h2 className="text-4xl italic font-black uppercase tracking-tighter leading-none text-white">INDEXATION <span className="text-blue-600">SMI</span></h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] mt-3 font-black">PROTOCOLE DE CAPTURE DOCUMENTAIRE</p>
               </div>
               <button type="button" onClick={() => setIsModalOpen(false)} className="p-4 bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-500 transition-all rounded-2xl border-none cursor-pointer"><X size={32}/></button>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[11px] text-slate-500 ml-6 italic font-black uppercase tracking-widest">CATÉGORIE MÉTIER *</label>
                  <select required name="DOC_Category" className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-[12px] text-white outline-none focus:border-blue-600 font-black uppercase italic cursor-pointer shadow-inner">
                    <option value="PROCEDURE">PROCÉDURE</option>
                    <option value="MANUEL">MANUEL QUALITÉ</option>
                    <option value="ENREGISTREMENT">ENREGISTREMENT</option>
                    <option value="CONSIGNE">CONSIGNE DE SÉCURITÉ</option>
                    <option value="RAPPORT">RAPPORT D&apos;AUDIT</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] text-slate-500 ml-6 italic font-black uppercase tracking-widest">RÉFÉRENCE (AUTO-GÉNÉRÉE)</label>
                  <div className="relative">
                    <input name="DOC_Reference" className="w-full bg-blue-600/5 border border-blue-600/20 p-6 rounded-2xl text-[12px] text-blue-400 outline-none font-black uppercase italic tracking-widest" placeholder={nextAutoRef} />
                    <Hash className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-600/30" size={20} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] text-slate-500 ml-6 italic font-black uppercase tracking-widest">DÉSIGNATION OFFICIELLE *</label>
                <input required name="DOC_Title" className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-[12px] text-white outline-none focus:border-blue-600 uppercase font-black italic tracking-tight shadow-inner" placeholder="EX: PROCÉDURE DE GESTION DES REJETS..." />
              </div>

              {/* ZONE DE DROP NUMÉRIQUE (§7.5.3) */}
              <div className="relative group mt-8">
                <label 
                  htmlFor="ged-upload"
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed rounded-[3.5rem] p-16 transition-all cursor-pointer bg-blue-600/5 shadow-inner",
                    selectedFile ? "border-emerald-500 bg-emerald-500/5" : "border-white/10 hover:border-blue-600"
                  )}
                >
                  <FileUp size={64} className={cn("mb-6 transition-transform group-hover:scale-110 duration-500", selectedFile ? "text-emerald-500 animate-bounce" : "text-blue-500")} />
                  <p className="text-[11px] text-slate-400 font-black italic uppercase text-center tracking-[0.2em] px-10 leading-relaxed">
                    {selectedFile ? `DOCUMENT CAPTURÉ : ${selectedFile.name}` : "DÉPOSER LE FICHIER PHYSIQUE PDF / DOCX (§7.5.3)"}
                  </p>
                </label>
                <input id="ged-upload" type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              </div>
            </div>

            {/* ACTION : VALIDATION SOUVERAINE */}
            <button 
              type="submit" 
              className="w-full bg-blue-600 py-10 rounded-[3rem] font-black text-sm tracking-[0.6em] flex items-center justify-center gap-4 hover:bg-blue-500 transition-all shadow-3xl shadow-blue-900/40 active:scale-95 italic border-none text-white cursor-pointer group"
            >
              <Save size={28} className="group-hover:rotate-12 transition-transform" /> VALIDER L&apos;INDEXATION DOCUMENTAIRE
            </button>
          </form>
        </div>
      )}
    </div>
  );
}