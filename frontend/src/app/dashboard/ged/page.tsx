/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 📂 MODULE : GESTION ÉLECTRONIQUE DES DOCUMENTS (GED) — ÉDITION ÉLITE RD 2030
 * -------------------------------------------------------------------------
 * RÔLE : Maîtrise des informations documentées (§7.5 ISO 9001).
 * ARCHITECTURE : Multi-Tenant SDE Matrix Isolation (Sovereign Data).
 * RÉFÉRENTIEL : types/elite-sde.ts (Prisma Core).
 * CAPACITÉS : Indexation, Workflow de validation, Traçabilité des versions.
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  FileText, Plus, Search, Archive, Download, 
  ShieldCheck, X, Save, Loader2, FileUp, 
  History, CheckCircle2, Eye, Hash, Calendar, 
  FileType, Filter, MoreVertical, Trash2, 
  ArrowUpRight, Fingerprint, Activity, Clock
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { 
  Document as IDocument, 
  Processus as IProcessus, 
  User as IUser 
} from '@/types/elite-sde';

// --- 🛠️ UTILITAIRES DE CONSTRUCTION SDE ---
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

/**
 * 🛡️ COMPOSANT : BADGE DE STATUT DOCUMENTAIRE
 * @description Signalétique visuelle du cycle de vie (§7.5.3).
 */
const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, string> = {
    'BROUILLON': 'text-slate-400 border-slate-400/20 bg-slate-400/5',
    'EN_REVUE': 'text-amber-500 border-amber-500/20 bg-amber-500/5',
    'APPROUVE': 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
    'ARCHIVE': 'text-red-400 border-red-400/20 bg-red-400/5'
  };
  return (
    <span className={cn("px-5 py-2 rounded-xl text-[9px] font-black border uppercase italic tracking-[0.2em] whitespace-nowrap", config[status] || config.BROUILLON)}>
      {status?.replace('_', ' ') || 'INCONNU'}
    </span>
  );
};

/**
 * 📈 COMPOSANT : MÉTRIQUE GED HAUTE DÉFINITION
 */
const MetricCard = ({ title, val, icon: LucideIcon, color }: { title: string, val: number, icon: any, color: 'blue' | 'emerald' | 'amber' | 'slate' }) => {
  const colors = {
    blue: 'text-blue-500 bg-blue-500/5 border-blue-500/10 hover:border-blue-500/40',
    emerald: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/40',
    amber: 'text-amber-500 bg-amber-500/5 border-amber-500/10 hover:border-amber-500/40',
    slate: 'text-slate-400 bg-white/2 border-white/5 hover:border-white/20'
  };

  return (
    <div className={cn("p-10 rounded-[3rem] border transition-all duration-700 relative overflow-hidden group shadow-2xl backdrop-blur-md flex flex-col justify-between h-64", colors[color])}>
      <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-1000">
        <LucideIcon size={180} strokeWidth={1} />
      </div>
      <div className="flex items-center gap-5 relative z-10">
        <div className={cn("p-4 rounded-2xl border shadow-inner", colors[color])}>
          <LucideIcon size={24} strokeWidth={2.5} />
        </div>
        <p className="text-[11px] text-slate-500 tracking-[0.4em] font-black uppercase italic leading-none">{title}</p>
      </div>
      <p className="text-7xl font-black text-white leading-none tracking-tighter relative z-10 italic">{val}</p>
    </div>
  );
};

/**
 * 📂 PAGE PRINCIPALE : GESTION ÉLECTRONIQUE DES DOCUMENTS (§7.5)
 */
export default function GEDPage() {
  // --- 📦 ÉTATS DE DONNÉES SCELLÉS ---
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [processus, setProcessus] = useState<IProcessus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // --- 🖥️ ÉTATS INTERFACE ---
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  /**
   * 📡 SYNCHRONISATION DU NOYAU MATRIX
   * @description Récupère les documents et les processus rattachés au tenant.
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resDoc, resPr] = await Promise.all([
        apiClient.get('/documents'),
        apiClient.get('/processus')
      ]);
      
      const extract = (res: any) => res.data?.data || res.data || [];
      setDocuments(extract(resDoc));
      setProcessus(extract(resPr));
    } catch (err: unknown) {
      console.error("❌ Rupture Sync GED:", err);
      toast.error("SYNCHRONISATION INTERROMPUE : ÉCHEC DU NOYAU MATRIX");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * 🔢 MÉMOÏSATION ANALYTIQUE
   */
  const nextAutoRef = useMemo(() => `SAG-GED-${String(documents.length + 1).padStart(3, '0')}`, [documents]);

  const stats = useMemo(() => ({
    total: documents.length,
    approved: documents.filter(d => d.DOC_Status === 'APPROUVE').length,
    review: documents.filter(d => d.DOC_Status === 'EN_REVUE').length,
    archived: documents.filter(d => d.DOC_IsArchived).length
  }), [documents]);

  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      const matchSearch = (d.DOC_Title || "").toLowerCase().includes(search.toLowerCase()) || 
                          (d.DOC_Reference || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || d.DOC_Category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [documents, search, categoryFilter]);

  /**
   * 💾 SOUMISSION SDE (§7.5.3)
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return toast.error("CONTRÔLE §7.5.3 : FICHIER PHYSIQUE MANQUANT");

    const formData = new FormData(e.currentTarget);
    formData.append('file', selectedFile);
    if (!formData.get('DOC_Reference')) formData.set('DOC_Reference', nextAutoRef);

    const tid = toast.loading("INDEXATION DANS LE SDE...");
    try {
      await apiClient.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("DOCUMENT SCELLÉ DANS LE SMI", { id: tid });
      setIsModalOpen(false);
      setSelectedFile(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ERREUR DE RÉCEPTION MATRIX", { id: tid });
    }
  };

  // --- ÉTAT DE CHARGEMENT ÉLITE ---
  if (loading && documents.length === 0) return (
    <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] gap-8">
       <Loader2 className="animate-spin text-blue-600" size={60} strokeWidth={1.5} />
       <p className="font-black italic uppercase tracking-[0.6em] text-blue-500 animate-pulse">Noyau GED Actif...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col overflow-x-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors />
      
      {/* 🧩 GLOBAL STYLE OVERRIDE */}
      <style jsx global>{`
        ::-webkit-scrollbar { display: none !important; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>

      {/* 🔝 HEADER COCKPIT DOCUMENTAIRE (FULL WIDTH) */}
      <header className="px-12 py-10 border-b border-white/5 flex justify-between items-end sticky top-0 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 shadow-2xl">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-4 text-blue-500 bg-blue-500/5 w-fit px-5 py-2 rounded-full border border-blue-500/10">
            <Fingerprint size={16} className="animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Sovereign Documentation Protocol</span>
          </div>
          <h1 className="text-5xl tracking-tighter italic leading-none font-black uppercase">
            Système <span className="text-blue-600">GED</span>
          </h1>
          <p className="text-slate-500 text-[11px] tracking-[0.5em] mt-3 flex items-center gap-3 italic font-black uppercase opacity-60">
            ISO 9001 §7.5 • Maîtrise de l&apos;Information Documentée
          </p>
        </div>
        
        <div className="flex gap-8 items-center">
          <div className="relative w-125 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              placeholder="RECHERCHER RÉFÉRENCE, TITRE OU MOT-CLÉ..." 
              className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-[12px] outline-none focus:border-blue-600 focus:bg-white/10 transition-all font-black italic uppercase text-white shadow-inner"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-white hover:text-slate-900 px-12 py-6 rounded-4xl text-[11px] flex items-center gap-4 transition-all active:scale-95 shadow-[0_20px_60px_rgba(37,99,235,0.3)] border-none text-white cursor-pointer font-black italic uppercase"
          >
            <Plus size={24} strokeWidth={3} /> Nouveau Document
          </button>
        </div>
      </header>

      

      <main className="p-12 space-y-16 flex-1 w-full max-w-500 mx-auto">
        
        {/* 📊 DASHBOARD GED (§9.1.1) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <MetricCard title="Total Registre" val={stats.total} icon={FileText} color="blue" />
          <MetricCard title="Validité Scellée" val={stats.approved} icon={CheckCircle2} color="emerald" />
          <MetricCard title="Flux de Revue" val={stats.review} icon={History} color="amber" />
          <MetricCard title="Archives SDE" val={stats.archived} icon={Archive} color="slate" />
        </section>

        {/* 🗂️ FILTRES DE SEGMENTATION SMI */}
        <div className="flex justify-between items-center gap-10 border-y border-white/5 py-8">
           <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {['ALL', 'PROCEDURE', 'MANUEL', 'ENREGISTREMENT', 'CONSIGNE', 'RAPPORT'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "px-10 py-5 rounded-2xl text-[11px] font-black transition-all border whitespace-nowrap uppercase italic cursor-pointer tracking-widest",
                  categoryFilter === cat ? "bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-900/40" : "bg-white/5 border-white/10 text-slate-500 hover:border-blue-600 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase italic tracking-widest bg-white/5 px-6 py-4 rounded-2xl border border-white/10">
            <Filter size={16} /> Tri par pertinence SDE
          </div>
        </div>

        {/* 📋 REGISTRE MATRIX (FULL SPACE) */}
        <div className="bg-[#0F172A]/40 border border-white/5 rounded-[4rem] overflow-hidden backdrop-blur-3xl shadow-4xl transition-all hover:border-blue-600/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[12px] text-slate-600 border-b border-white/5 italic font-black uppercase tracking-[0.3em] bg-white/2">
                <th className="p-12">Identification Matrix</th>
                <th className="p-12">Ancrage Processus</th>
                <th className="p-12">Échéance Revue</th>
                <th className="p-12">Index Version</th>
                <th className="p-12">Status SMI</th>
                <th className="p-12 text-right px-16">Pilotage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
                <tr key={doc.DOC_Id} className="hover:bg-blue-600/5 transition-all group animate-in fade-in duration-500">
                  <td className="p-12">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <Hash size={12} className="text-blue-600" />
                        <span className="text-[11px] text-blue-500 font-black tracking-widest italic uppercase">{doc.DOC_Reference}</span>
                      </div>
                      <span className="text-xl text-white font-black italic tracking-tighter leading-none">{doc.DOC_Title}</span>
                      <div className="flex items-center gap-3 mt-1">
                        <FileType size={14} className="text-slate-700" />
                        <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{doc.DOC_Category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-12">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">
                        <Activity size={18} />
                      </div>
                      <span className="text-[11px] font-black uppercase italic text-slate-400">
                        {doc.DOC_ProcessusId ? 'SCELLÉ AU PROCESSUS' : 'SEGMENT TRANSVERSAL'}
                      </span>
                    </div>
                  </td>
                  <td className="p-12">
                    <div className="flex items-center gap-3 text-[11px] text-amber-500/80 font-black italic tracking-tight bg-amber-500/5 px-4 py-2 rounded-xl border border-amber-500/10 w-fit">
                      <Clock size={16} />
                      {doc.DOC_NextReviewDate ? new Date(doc.DOC_NextReviewDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'NON PLANIFIÉE'}
                    </div>
                  </td>
                  <td className="p-12">
                    <div className="flex items-baseline gap-2">
                      <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest opacity-50 italic">Version</span>
                      <span className="font-black text-white text-3xl italic tracking-tighter leading-none">{doc.DOC_CurrentVersion}</span>
                    </div>
                  </td>
                  <td className="p-12">
                    <StatusBadge status={doc.DOC_Status} />
                  </td>
                  <td className="p-12 text-right px-16">
                    <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 translate-x-10 group-hover:translate-x-0 transition-all duration-500">
                      <button className="p-5 bg-white/5 hover:bg-blue-600 transition-all rounded-2xl text-slate-400 hover:text-white border border-white/5 cursor-pointer shadow-xl"><Eye size={22}/></button>
                      <button className="p-5 bg-white/5 hover:bg-emerald-600 transition-all rounded-2xl text-slate-400 hover:text-white border border-white/5 cursor-pointer shadow-xl"><Download size={22}/></button>
                      <button className="p-5 bg-white/5 hover:bg-red-600 transition-all rounded-2xl text-slate-400 hover:text-white border border-white/5 cursor-pointer shadow-xl"><Trash2 size={22}/></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="p-48 text-center bg-slate-900/10">
                    <Archive size={120} className="mx-auto text-slate-900 mb-10 opacity-10 animate-pulse" />
                    <p className="text-slate-700 font-black uppercase italic tracking-[1em] text-sm">
                       Architecture Vierge : Néant Documentaire SDE
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
        <div className="fixed inset-0 z-100 bg-black/98 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in duration-300">
          <form 
            onSubmit={handleSubmit}
            className="bg-[#0B0F1A] border border-white/10 rounded-[5rem] w-full max-w-4xl p-20 space-y-12 shadow-[0_0_200px_rgba(37,99,235,0.15)] animate-in zoom-in-95 duration-500 italic text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none rotate-12"><FileText size={300} /></div>

            <div className="flex justify-between items-center border-b border-white/10 pb-12 relative z-10">
                <div className="flex items-center gap-8 text-left">
                  <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-2xl animate-pulse"><ShieldCheck size={40} strokeWidth={2.5} /></div>
                  <div>
                    <h2 className="text-5xl italic font-black uppercase tracking-tighter leading-none text-white">Indexation <span className="text-blue-600">SMI</span></h2>
                    <p className="text-[11px] text-slate-500 uppercase tracking-[0.5em] mt-4 font-black">ISO 9001 §7.5.3 • Protocole de Captage Numérique</p>
                  </div>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-5 bg-white/5 hover:bg-red-600/20 text-slate-500 hover:text-red-500 transition-all rounded-3xl border-none cursor-pointer"><X size={44} strokeWidth={1} /></button>
            </div>

            <div className="space-y-10 relative z-10">
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="text-[12px] text-slate-500 ml-8 italic font-black uppercase tracking-[0.3em]">Classification SDE *</label>
                  <select required name="DOC_Category" className="w-full bg-slate-900 border border-white/10 p-8 rounded-3xl text-[13px] text-white outline-none focus:border-blue-600 font-black uppercase italic cursor-pointer shadow-inner appearance-none">
                    <option value="PROCEDURE">PROCÉDURE OPÉRATIONNELLE</option>
                    <option value="MANUEL">MANUEL DE MANAGEMENT</option>
                    <option value="ENREGISTREMENT">ENREGISTREMENT QUALITÉ</option>
                    <option value="CONSIGNE">CONSIGNE TECHNIQUE</option>
                    <option value="RAPPORT">RAPPORT ANALYTIQUE</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[12px] text-slate-500 ml-8 italic font-black uppercase tracking-[0.3em]">Référence Automatique</label>
                  <div className="relative">
                    <input name="DOC_Reference" readOnly className="w-full bg-blue-600/5 border border-blue-600/20 p-8 rounded-3xl text-[13px] text-blue-400 outline-none font-black uppercase italic tracking-[0.4em] shadow-inner" value={nextAutoRef} />
                    <Hash className="absolute right-8 top-1/2 -translate-y-1/2 text-blue-600/30" size={24} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[12px] text-slate-500 ml-8 italic font-black uppercase tracking-[0.3em]">Désignation Officielle du Document *</label>
                <input required name="DOC_Title" className="w-full bg-slate-900 border border-white/10 p-8 rounded-3xl text-[15px] text-white outline-none focus:border-blue-600 uppercase font-black italic tracking-tight shadow-inner" placeholder="EX: PROTOCOLE DE MAÎTRISE DES RISQUES..." />
              </div>

              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="text-[12px] text-slate-500 ml-8 italic font-black uppercase tracking-[0.3em]">Processus de Rattachement</label>
                  <select name="DOC_ProcessusId" className="w-full bg-slate-900 border border-white/10 p-8 rounded-3xl text-[13px] text-white outline-none focus:border-blue-600 font-black uppercase italic cursor-pointer shadow-inner appearance-none">
                    <option value="">-- SEGMENT TRANSVERSAL --</option>
                    {processus.map(pr => (
                      <option key={pr.PR_Id} value={pr.PR_Id}>{pr.PR_Libelle}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[12px] text-slate-500 ml-8 italic font-black uppercase tracking-[0.3em]">Version d&apos;Indexation</label>
                  <input name="DOC_CurrentVersion" defaultValue="1" className="w-full bg-slate-900 border border-white/10 p-8 rounded-3xl text-[13px] text-white outline-none focus:border-blue-600 font-black italic uppercase shadow-inner text-center" />
                </div>
              </div>

              {/* ZONE DE CAPTURE PHYSIQUE (§7.5.3) */}
              <div className="relative group">
                <label 
                  htmlFor="ged-upload"
                  className={cn(
                    "flex flex-col items-center justify-center border-4 border-dashed rounded-[4rem] p-20 transition-all cursor-pointer bg-blue-600/5 shadow-2xl",
                    selectedFile ? "border-emerald-500 bg-emerald-500/5 shadow-emerald-500/10" : "border-white/5 hover:border-blue-600 hover:bg-blue-600/10"
                  )}
                >
                  <FileUp size={80} className={cn("mb-8 transition-transform group-hover:scale-110 duration-700", selectedFile ? "text-emerald-500" : "text-blue-600")} />
                  <p className="text-[14px] text-slate-200 font-black italic uppercase text-center tracking-[0.3em] px-16 leading-relaxed">
                    {selectedFile ? `CAPTURE RÉUSSIE : ${selectedFile.name.toUpperCase()}` : "DÉPOSEZ LE FICHIER PHYSIQUE (PDF/DOCX) POUR SCELLAGE SDE"}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-6 font-black uppercase tracking-[0.5em]">Taille max : 50MB • Format ISO standard</p>
                </label>
                <input id="ged-upload" type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              </div>
            </div>

            {/* ACTION : VALIDATION SOUVERAINE */}
            <button 
              type="submit" 
              className="w-full bg-blue-600 py-12 rounded-[2.5rem] font-black text-[13px] tracking-[0.8em] flex items-center justify-center gap-6 hover:bg-white hover:text-slate-900 transition-all shadow-4xl shadow-blue-600/20 active:scale-95 italic border-none text-white cursor-pointer group"
            >
              <Save size={32} className="group-hover:rotate-12 transition-transform" /> 
              SCELLER DANS LE REGISTRE SMI
            </button>
          </form>
        </div>
      )}
    </div>
  );
}