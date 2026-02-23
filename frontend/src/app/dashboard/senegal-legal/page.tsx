/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  FileText, Plus, CheckCircle, XCircle, AlertTriangle, 
  Search, Calendar, ShieldCheck, X, Save, Loader2, Scale,
  Activity, BookOpen, RefreshCw
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- 🏗️ TYPES ---
type ComplianceStatus = 'A_RESPECTER' | 'RESPECTEE' | 'NON_CONFORME' | 'EN_COURS';

interface SenegalLegalRequirement {
  SLR_Id: string;
  SLR_Category: string;
  SLR_Title: string;
  SLR_Description: string;
  SLR_Reference: string;
  SLR_Authority: string;
  SLR_Deadline: string | null;
  SLR_Status: ComplianceStatus;
}

// --- 🛠️ COMPOSANTS MINIATURES ---
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function SenegalLegalPage() {
  const [requirements, setRequirements] = useState<SenegalLegalRequirement[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    SLR_Category: 'Travail', SLR_Title: '', SLR_Description: '',
    SLR_Reference: '', SLR_Authority: '', SLR_Deadline: '', SLR_Evidence: '', SLR_Comment: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/senegal-legal');
      const data = res.data?.data || res.data;
      const reqs = Array.isArray(data) ? data : [];
      setRequirements(reqs);

      const total = reqs.length;
      const compliant = reqs.filter((r: any) => r.SLR_Status === 'RESPECTEE').length;
      setStats({
        total,
        compliant,
        nonCompliant: reqs.filter((r: any) => r.SLR_Status === 'NON_CONFORME').length,
        rate: total > 0 ? Math.round((compliant / total) * 100) : 100
      });
    } catch (e) {
      toast.error('LIAISON MATRIX INTERROMPUE');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return requirements.filter(r => r.SLR_Title.toLowerCase().includes(t) || r.SLR_Reference.toLowerCase().includes(t));
  }, [requirements, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/senegal-legal', formData);
      toast.success('EXIGENCE SCELLÉE.');
      setIsModalOpen(false);
      fetchData();
    } catch (e) { toast.error('ERREUR DE SCELLAGE'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="text-blue-500 font-black uppercase italic text-[10px] tracking-[0.5em] animate-pulse">Synchronisation Légale...</p>
    </div>
  );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white font-sans italic flex flex-col p-6 overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER COMPACT */}
      <header className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 shrink-0">
        <div>
          <div className="flex gap-2 mb-2">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase italic tracking-widest">Sénégal Légal</span>
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[8px] font-black uppercase italic tracking-widest">ISO 9001 §6.1.3</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter m-0 flex items-center gap-3">
            <Scale className="text-blue-600" size={24} /> Conformité <span className="text-blue-600">Légale</span>
          </h1>
        </div>
        
        <div className="flex gap-3">
            <div className="relative w-64 group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] font-black uppercase outline-none focus:border-blue-600 italic"
                    placeholder="RECHERCHER UN TEXTE..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-white hover:text-blue-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border-none cursor-pointer transition-all italic text-white shadow-lg">
                <Plus size={14} strokeWidth={3} /> INDEXER EXIGENCE
            </button>
        </div>
      </header>

      {/* 📊 STATS COMPACTES */}
      <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
        <StatMini label="Registre" value={stats?.total} color="blue" icon={<BookOpen size={16}/>} />
        <StatMini label="Conformes" value={stats?.compliant} color="emerald" icon={<CheckCircle size={16}/>} />
        <StatMini label="Écarts" value={stats?.nonCompliant} color="rose" icon={<XCircle size={16}/>} />
        <StatMini label="Indice SMI" value={`${stats?.rate}%`} color="amber" icon={<Activity size={16}/>} />
      </div>

      {/* 🏛️ REGISTRE (FLEX-1 AVEC SCROLL INTERNE) */}
      <div className="flex-1 min-h-0 bg-[#151A2D] border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#151A2D] z-10 border-b border-white/10">
              <tr className="text-[9px] text-slate-500 uppercase tracking-widest font-black">
                <th className="p-4">Référence & Texte</th>
                <th className="p-4">Autorité</th>
                <th className="p-4">Échéance</th>
                <th className="p-4 text-center">Statut</th>
                <th className="p-4 text-right px-8"><RefreshCw size={12} className="cursor-pointer" onClick={fetchData}/></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(req => (
                <tr key={req.SLR_Id} className="hover:bg-white/5 group transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-blue-500 uppercase">{req.SLR_Category}</span>
                      <span className="text-sm font-black text-white uppercase truncate max-w-md">{req.SLR_Title}</span>
                      <span className="text-[9px] text-slate-500 font-bold">{req.SLR_Reference}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[10px] font-black text-slate-400 uppercase">{req.SLR_Authority}</td>
                  <td className="p-4">
                    {req.SLR_Deadline ? (
                       <span className="text-[10px] font-black text-amber-500 flex items-center gap-1">
                         <Calendar size={12}/> {new Date(req.SLR_Deadline).toLocaleDateString()}
                       </span>
                    ) : <span className="text-[8px] text-slate-600">PERMANENTE</span>}
                  </td>
                  <td className="p-4 text-center"><StatusBadge status={req.SLR_Status} /></td>
                  <td className="p-4 text-right px-8">
                     <button className="bg-white/5 border-none p-2 rounded-lg text-slate-500 hover:text-blue-500 cursor-pointer transition-colors">
                       <ShieldCheck size={18} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📟 MODALE INDEXATION (Optimisée One-Pager) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151A2D] border border-white/10 rounded-[2.5rem] w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
              <h2 className="text-xl font-black uppercase m-0 flex items-center gap-3">
                <Plus className="text-blue-600" size={20} /> Indexer <span className="text-blue-600">Exigence</span>
              </h2>
              <X className="cursor-pointer text-slate-500 hover:text-white" onClick={() => setIsModalOpen(false)} />
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Domaine SDE *</label>
                <select value={formData.SLR_Category} onChange={e => setFormData({...formData, SLR_Category: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-black text-white outline-none focus:border-blue-600">
                  {['Travail', 'Environnement', 'Fiscalité', 'Social'].map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Autorité de Régulation</label>
                <input value={formData.SLR_Authority} onChange={e => setFormData({...formData, SLR_Authority: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-black text-white outline-none focus:border-blue-600" placeholder="EX: DGID, ANSD..." />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Libellé de l&apos;Exigence *</label>
                <input required value={formData.SLR_Title} onChange={e => setFormData({...formData, SLR_Title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-black text-white outline-none focus:border-blue-600" placeholder="NOM DU TEXTE..." />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Référence Légale *</label>
                <input required value={formData.SLR_Reference} onChange={e => setFormData({...formData, SLR_Reference: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-black text-blue-400 outline-none focus:border-blue-600" placeholder="EX: LOI N° 2024-..." />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Échéance de Conformité</label>
                <input type="date" value={formData.SLR_Deadline} onChange={e => setFormData({...formData, SLR_Deadline: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-black text-white outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Preuve (URL Archive)</label>
                <input value={formData.SLR_Evidence} onChange={e => setFormData({...formData, SLR_Evidence: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-black text-emerald-500 outline-none" placeholder="HTTP://..." />
              </div>
              <button disabled={submitting} type="submit" className="col-span-2 bg-blue-600 py-4 rounded-2xl font-black text-xs tracking-widest text-white border-none cursor-pointer hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-3">
                {submitting ? <Loader2 className="animate-spin"/> : <Save size={18}/>} VALIDER L&apos;EXIGENCE AU REGISTRE LÉGAL
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb; }
      `}</style>
    </div>
  );
}

function StatMini({ label, value, color, icon }: any) {
  const colors: any = { 
    blue: 'text-blue-500 bg-blue-500/5 border-blue-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
    rose: 'text-rose-500 bg-rose-500/5 border-rose-500/10',
    amber: 'text-amber-500 bg-amber-500/5 border-amber-500/10'
  };
  return (
    <div className={cn("p-4 rounded-2xl border flex items-center justify-between", colors[color])}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-black/20 rounded-lg">{icon}</div>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <span className="text-2xl font-black italic">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    'A_RESPECTER': 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    'RESPECTEE': 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
    'NON_CONFORME': 'text-rose-500 border-rose-500/20 bg-rose-500/5',
    'EN_COURS': 'text-amber-500 border-amber-500/20 bg-amber-500/5'
  };
  return <span className={cn("px-3 py-1 rounded-full text-[8px] border uppercase font-black italic", (config as any)[status])}>{status.replace('_', ' ')}</span>;
}