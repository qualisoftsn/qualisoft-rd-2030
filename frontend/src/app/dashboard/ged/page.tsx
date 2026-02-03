/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  FileText, Plus, Search, Archive, Download, 
  ShieldCheck, X, Save, Loader2, FileUp, 
  History, CheckCircle2, Eye, Hash 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

// --- COMPOSANTS DE STYLE (Définis hors du cycle pour éviter "Illegal constructor") ---

const StatusBadge = ({ status }: { status: string }) => {
  const config: any = {
    'BROUILLON': 'text-slate-400 border-slate-400/20 bg-slate-400/5',
    'EN_REVUE': 'text-amber-500 border-amber-500/20 bg-amber-500/5',
    'APPROUVE': 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
    'ARCHIVE': 'text-red-400 border-red-400/20 bg-red-400/5'
  };
  return (
    <span className={cn("px-4 py-1.5 rounded-full text-[8px] font-black border uppercase italic", config[status] || config.BROUILLON)}>
      {status?.replace('_', ' ') || 'INCONNU'}
    </span>
  );
};

const MetricCard = ({ title, val, icon: LucideIcon, color }: any) => {
  const colors: any = {
    blue: 'text-blue-500 bg-blue-500/5 border-blue-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
    amber: 'text-amber-500 bg-amber-500/5 border-amber-500/10',
    slate: 'text-slate-500 bg-slate-500/5 border-white/10'
  };

  return (
    <div className={cn("p-8 rounded-[2.5rem] border bg-white/2 relative overflow-hidden group hover:border-blue-600 transition-all", colors[color])}>
      {/* On rend l'icône de manière sécurisée */}
      {LucideIcon && <LucideIcon className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-all" size={120} />}
      <div className="flex items-center gap-4 mb-4">
        <div className={cn("p-3 rounded-xl border", colors[color])}>
            {LucideIcon && <LucideIcon size={18} />}
        </div>
        <p className="text-[9px] text-slate-500 tracking-widest font-black uppercase italic">{title}</p>
      </div>
      <p className="text-4xl font-black text-white leading-none tracking-tighter">{val}</p>
    </div>
  );
};

// --- COMPOSANT PRINCIPAL ---

export default function GEDPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 1. SYNCHRONISATION REGISTRE
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/documents');
      const rawData = res.data?.documents || res.data || [];
      setDocuments(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      toast.error("SYNCHRONISATION INTERROMPUE");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 2. RÉFÉRENCE AUTO (SAG-GED-XXX)
  const nextAutoRef = useMemo(() => {
    const count = documents.length + 1;
    return `SAG-GED-${String(count).padStart(3, '0')}`;
  }, [documents]);

  // 3. KPI & FILTRAGE
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

  // 4. SOUMISSION & AUTO-REFRESH
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return toast.error("FICHIER PHYSIQUE REQUIS (§7.5.3)");

    const formData = new FormData(e.currentTarget);
    formData.append('file', selectedFile);
    
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
      await fetchData(); // Force l'affichage immédiat

    } catch (err: any) {
      toast.error(err.response?.data?.message || "ERREUR DE RÉCEPTION", { id: tid });
    }
  };

  if (loading && documents.length === 0) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] text-blue-600 font-black italic uppercase tracking-[0.5em]">
       <Loader2 className="animate-spin mr-6" size={48} /> NOYAU GED ACTIF...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col uppercase font-black overflow-x-hidden relative">
      <style jsx global>{`::-webkit-scrollbar { display: none !important; }`}</style>

      {/* HEADER COCKPIT */}
      <header className="p-10 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div>
          <h1 className="text-5xl tracking-tighter italic leading-none">SYSTÈME <span className="text-blue-600">GED</span></h1>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] mt-3 flex items-center gap-2 italic">
            <ShieldCheck size={14} className="text-emerald-500" /> ISO 9001 §7.5 • MAÎTRISE DOCUMENTAIRE
          </p>
        </div>
        <div className="flex gap-6">
          <div className="relative w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              placeholder="RECHERCHER RÉFÉRENCE OU TITRE..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[11px] outline-none focus:border-blue-600 transition-all font-black italic uppercase"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-2xl text-[10px] flex items-center gap-3 transition-all active:scale-95 shadow-3xl shadow-blue-900/40"
          >
            <Plus size={20} strokeWidth={3} /> NOUVEAU DOCUMENT
          </button>
        </div>
      </header>

      <main className="p-10 space-y-12 flex-1">
        
        {/* KPI SECTION */}
        <section className="grid grid-cols-4 gap-8">
          <MetricCard title="Documents" val={stats.total} icon={FileText} color="blue" />
          <MetricCard title="Approuvés" val={stats.approved} icon={CheckCircle2} color="emerald" />
          <MetricCard title="En Revue" val={stats.review} icon={History} color="amber" />
          <MetricCard title="Archivés" val={stats.archived} icon={Archive} color="slate" />
        </section>

        {/* FILTRES D'AFFICHAGE */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {['ALL', 'PROCEDURE', 'MANUEL', 'ENREGISTREMENT', 'CONSIGNE', 'RAPPORT'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-6 py-3 rounded-xl text-[9px] font-black transition-all border whitespace-nowrap uppercase italic",
                categoryFilter === cat ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/40" : "bg-white/5 border-white/10 text-slate-500 hover:border-blue-600"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* REGISTRE SMI */}
        <div className="bg-slate-900/20 border border-white/5 rounded-[3.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-slate-600 border-b border-white/5 italic font-black uppercase">
                <th className="p-10">RÉFÉRENCE / TITRE</th>
                <th className="p-10">PROCHAINE REVUE</th>
                <th className="p-10">VERSION</th>
                <th className="p-10">STATUT</th>
                <th className="p-10 text-right">PILOTAGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDocs.map((doc) => (
                <tr key={doc.DOC_Id} className="hover:bg-blue-600/5 transition-all group animate-in fade-in duration-500">
                  <td className="p-10">
                    <p className="text-[10px] text-blue-500 mb-1 font-black">{doc.DOC_Reference}</p>
                    <p className="text-sm text-white font-black">{doc.DOC_Title}</p>
                    <p className="text-[9px] text-slate-600 lowercase mt-1 font-bold">{doc.DOC_Category}</p>
                  </td>
                  <td className="p-10 text-[10px] text-amber-500/80 font-black">
                     {doc.DOC_NextReviewDate ? new Date(doc.DOC_NextReviewDate).toLocaleDateString() : '---'}
                  </td>
                  <td className="p-10 font-black text-slate-400 text-sm italic">V{doc.DOC_CurrentVersion}</td>
                  <td className="p-10">
                    <StatusBadge status={doc.DOC_Status} />
                  </td>
                  <td className="p-10 text-right">
                    <div className="flex justify-end gap-3">
                      <button className="p-4 bg-white/5 hover:bg-blue-600 transition-all rounded-2xl text-slate-400 hover:text-white"><Eye size={18}/></button>
                      <button className="p-4 bg-white/5 hover:bg-emerald-600 transition-all rounded-2xl text-slate-400 hover:text-white"><Download size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODALE D'INDEXATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6">
          <form 
            onSubmit={handleSubmit}
            className="bg-[#0B0F1A] border border-white/10 rounded-[4rem] w-full max-w-2xl p-12 space-y-8 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-10">
               <h2 className="text-3xl italic">INDEXATION <span className="text-blue-600">SMI</span></h2>
               <button type="button" onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all rounded-full"><X size={36}/></button>
            </div>

            <div className="space-y-6 text-left">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-500 ml-5 italic">CATÉGORIE *</label>
                  <select required name="DOC_Category" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-[11px] text-white outline-none focus:border-blue-600 font-black uppercase italic">
                    <option value="PROCEDURE">PROCÉDURE</option>
                    <option value="MANUEL">MANUEL QUALITÉ</option>
                    <option value="ENREGISTREMENT">ENREGISTREMENT</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-500 ml-5 italic">RÉFÉRENCE (AUTO)</label>
                  <div className="relative">
                    <input name="DOC_Reference" className="w-full bg-blue-600/5 border border-blue-600/20 p-5 rounded-2xl text-[11px] text-blue-400 outline-none font-black uppercase italic" placeholder={nextAutoRef} />
                    <Hash className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-600/30" size={16} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-slate-500 ml-5 italic">TITRE DU DOCUMENT *</label>
                <input required name="DOC_Title" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-[11px] text-white outline-none focus:border-blue-600 uppercase font-black italic" placeholder="DÉSIGNATION OFFICIELLE..." />
              </div>

              <div className="relative group mt-6">
                <label 
                  htmlFor="ged-upload"
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed rounded-[2.5rem] p-12 transition-all cursor-pointer bg-blue-600/5",
                    selectedFile ? "border-emerald-500 bg-emerald-500/5" : "border-white/10 hover:border-blue-600"
                  )}
                >
                  <FileUp size={48} className={cn("mb-5 transition-transform group-hover:scale-110", selectedFile ? "text-emerald-500 animate-pulse" : "text-blue-500")} />
                  <p className="text-[10px] text-slate-400 font-black italic uppercase text-center tracking-widest px-6">
                    {selectedFile ? `CAPTÉR : ${selectedFile.name}` : "DÉPOSER LE FICHIER PDF / DOCX (§7.5.3)"}
                  </p>
                </label>
                <input id="ged-upload" type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 py-8 rounded-[2rem] font-black text-xs tracking-[0.5em] flex items-center justify-center gap-4 hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/30 active:scale-95 italic"
            >
              <Save size={24}/> VALIDER L&apos;INDEXATION
            </button>
          </form>
        </div>
      )}
    </div>
  );
}