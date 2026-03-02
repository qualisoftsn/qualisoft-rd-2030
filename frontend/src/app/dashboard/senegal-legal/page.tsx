/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/**
 * ⚖️ MODULE : CONFORMITÉ LÉGALE SÉNÉGAL (ISO 9001 §6.1.3)
 * ---------------------------------------------------------------------------
 * DESIGN : Elite High-Density / Cockpit Légal / Responsive
 * SÉCURITÉ : Zéro NextAuth (100% apiClient)
 * DATE DE RÉVISION : 02 Mars 2026 | 14:21 GMT
 * ---------------------------------------------------------------------------
 */

"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Plus, CheckCircle, XCircle, Search, Calendar, ShieldCheck, 
  X, Save, Loader2, Scale, Activity, BookOpen, RefreshCw
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- 🏗️ TYPES ---
type ComplianceStatus = 'A_RESPECTER' | 'RESPECTEE' | 'NON_CONFORME' | 'EN_COURS';

interface SenegalLegalRequirement {
  SLR_Id?: string;
  SLR_Category: string;
  SLR_Title: string;
  SLR_Description: string;
  SLR_Reference: string;
  SLR_Authority: string;
  SLR_Deadline: string | null;
  SLR_Evidence: string;
  SLR_Status: ComplianceStatus;
}

// --- 🛠️ UTILITAIRES ---
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export default function SenegalLegalPage() {
  const [requirements, setRequirements] = useState<SenegalLegalRequirement[]>([]);
  const [stats, setStats] = useState({ total: 0, compliant: 0, nonCompliant: 0, rate: 100 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const defaultForm: SenegalLegalRequirement = {
    SLR_Category: 'Travail', SLR_Title: '', SLR_Description: '',
    SLR_Reference: '', SLR_Authority: '', SLR_Deadline: '', SLR_Evidence: '',
    SLR_Status: 'A_RESPECTER'
  };
  const [formData, setFormData] = useState<SenegalLegalRequirement>(defaultForm);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/senegal-legal');
      const data = res.data?.data || res.data;
      const reqs: SenegalLegalRequirement[] = Array.isArray(data) ? data : [];
      setRequirements(reqs);

      const total = reqs.length;
      const compliant = reqs.filter(r => r.SLR_Status === 'RESPECTEE').length;
      setStats({
        total,
        compliant,
        nonCompliant: reqs.filter(r => r.SLR_Status === 'NON_CONFORME').length,
        rate: total > 0 ? Math.round((compliant / total) * 100) : 100
      });
    } catch (e) {
      toast.error('LIAISON MATRIX INTERROMPUE : Référentiel Légal inaccessible.');
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return requirements.filter(r => 
      r.SLR_Title.toLowerCase().includes(t) || 
      r.SLR_Reference.toLowerCase().includes(t)
    );
  }, [requirements, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const tid = toast.loading("SCELLAGE DE L'EXIGENCE...");
    try {
      // Normalisation de la date avant envoi
      const payload = { ...formData, SLR_Deadline: formData.SLR_Deadline || null };
      await apiClient.post('/senegal-legal', payload);
      toast.success('EXIGENCE SCELLÉE DANS LE REGISTRE.', { id: tid });
      setIsModalOpen(false);
      setFormData(defaultForm);
      fetchData();
    } catch (e: any) { 
      toast.error(e.response?.data?.message || 'ERREUR DE SCELLAGE', { id: tid }); 
    } finally { 
      setSubmitting(false); 
    }
  };

  if (loading && requirements.length === 0) return (
    <div className="ml-0 lg:ml-72 min-h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" strokeWidth={2} />
      <p className="text-blue-500 font-black uppercase italic text-[10px] tracking-[0.5em] animate-pulse">Synchronisation Légale...</p>
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 min-h-screen lg:h-screen bg-[#0B0F1A] text-white font-sans italic flex flex-col p-4 lg:p-6 overflow-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER COMPACT */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-4 mb-6 shrink-0 gap-4">
        <div>
          <div className="flex gap-2 mb-3">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase italic tracking-widest rounded-md">Sénégal Légal</span>
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase italic tracking-widest rounded-md">ISO 9001 §6.1.3</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter m-0 flex items-center gap-3 leading-none">
            <Scale className="text-blue-600" size={28} /> Conformité <span className="text-blue-600">Légale</span>
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
            <div className="relative w-full sm:w-64 group">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-[10px] md:text-[11px] font-black uppercase outline-none focus:border-blue-600 focus:bg-white/5 italic transition-all shadow-inner"
                    placeholder="RECHERCHER UN TEXTE..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase flex items-center justify-center gap-2 border-none cursor-pointer transition-all italic text-white shadow-[0_5px_20px_rgba(37,99,235,0.3)]">
                <Plus size={16} strokeWidth={3} /> INDEXER EXIGENCE
            </button>
        </div>
      </header>

      

      {/* 📊 STATS COMPACTES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 shrink-0">
        <StatMini label="Registre" value={stats.total} color="blue" icon={<BookOpen size={18}/>} />
        <StatMini label="Conformes" value={stats.compliant} color="emerald" icon={<CheckCircle size={18}/>} />
        <StatMini label="Écarts" value={stats.nonCompliant} color="rose" icon={<XCircle size={18}/>} />
        <StatMini label="Indice SMI" value={`${stats.rate}%`} color="amber" icon={<Activity size={18}/>} />
      </div>

      {/* 🏛️ REGISTRE LÉGAL (FLEX-1 AVEC SCROLL INTERNE) */}
      <div className="flex-1 min-h-100 bg-[#151A2D] border border-white/5 rounded-4xl lg:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl relative">
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse min-w-200">
            <thead className="sticky top-0 bg-[#151A2D] z-10 border-b border-white/10 shadow-sm">
              <tr className="text-[9px] text-slate-500 uppercase tracking-widest font-black italic">
                <th className="p-5 pl-6">Référence & Texte</th>
                <th className="p-5">Autorité de Régulation</th>
                <th className="p-5">Échéance</th>
                <th className="p-5 text-center">Statut</th>
                <th className="p-5 text-right pr-8"><RefreshCw size={14} className="cursor-pointer hover:text-blue-500 transition-colors" onClick={fetchData} title="Rafraîchir"/></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(req => (
                <tr key={req.SLR_Id} className="hover:bg-blue-600/5 group transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex flex-col max-w-sm lg:max-w-md">
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">{req.SLR_Category}</span>
                      <span className="text-xs lg:text-sm font-black text-white uppercase truncate" title={req.SLR_Title}>{req.SLR_Title}</span>
                      <span className="text-[10px] text-slate-400 font-bold mt-1 tracking-wider">{req.SLR_Reference}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-wider">{req.SLR_Authority || "N/A"}</td>
                  <td className="p-4">
                    {req.SLR_Deadline ? (
                       <span className="text-[10px] lg:text-[11px] font-black text-amber-500 flex items-center gap-1.5 tracking-wider bg-amber-500/10 px-3 py-1.5 rounded-lg w-fit">
                         <Calendar size={12}/> {new Date(req.SLR_Deadline).toLocaleDateString()}
                       </span>
                    ) : (
                      <span className="text-[9px] font-black text-slate-500 tracking-widest bg-white/5 px-3 py-1.5 rounded-lg">PERMANENTE</span>
                    )}
                  </td>
                  <td className="p-4 text-center"><StatusBadge status={req.SLR_Status} /></td>
                  <td className="p-4 text-right pr-8">
                     <button className="bg-white/5 border border-white/5 p-2.5 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 cursor-pointer transition-colors shadow-sm" title="Évaluer Conformité">
                       <ShieldCheck size={18} />
                     </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-600 text-[11px] font-black uppercase tracking-widest">
                    Aucune exigence légale identifiée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📟 MODALE INDEXATION (Optimisée One-Pager Responsive) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-600 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#151A2D] border border-white/10 rounded-[2.5rem] w-full max-w-4xl flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 lg:p-8 border-b border-white/5 flex justify-between items-center bg-black/40 shrink-0">
              <h2 className="text-xl lg:text-2xl font-black uppercase m-0 flex items-center gap-3 italic tracking-tighter">
                <Plus className="text-blue-600" size={24} /> Indexer <span className="text-blue-600">Exigence</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border-none cursor-pointer transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 lg:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 overflow-y-auto max-h-[75vh] custom-scrollbar">
              
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2 tracking-widest">Domaine SDE *</label>
                <div className="relative">
                  <select required value={formData.SLR_Category} onChange={e => setFormData({...formData, SLR_Category: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 lg:p-5 text-xs font-black text-white outline-none focus:border-blue-600 focus:bg-white/5 transition-colors appearance-none cursor-pointer shadow-inner">
                    {['Travail', 'Environnement', 'Fiscalité', 'Social', 'Sécurité', 'Qualité'].map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2 tracking-widest">Autorité de Régulation</label>
                <input value={formData.SLR_Authority} onChange={e => setFormData({...formData, SLR_Authority: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 lg:p-5 text-xs font-black text-white outline-none focus:border-blue-600 focus:bg-white/5 transition-colors uppercase shadow-inner" placeholder="EX: DGID, ANSD, INSPECTION DU TRAVAIL..." />
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2 tracking-widest">Libellé de l&apos;Exigence (Titre) *</label>
                <input required value={formData.SLR_Title} onChange={e => setFormData({...formData, SLR_Title: e.target.value.toUpperCase()})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 lg:p-5 text-xs font-black text-white outline-none focus:border-blue-600 focus:bg-white/5 transition-colors shadow-inner" placeholder="NOM DU TEXTE APPLICABLE..." />
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2 tracking-widest">Référence Légale Exacte *</label>
                <input required value={formData.SLR_Reference} onChange={e => setFormData({...formData, SLR_Reference: e.target.value.toUpperCase()})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 lg:p-5 text-xs font-black text-blue-400 outline-none focus:border-blue-600 focus:bg-white/5 transition-colors shadow-inner" placeholder="EX: LOI N° 2024-..." />
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2 tracking-widest">Échéance de Conformité</label>
                <input type="date" value={formData.SLR_Deadline || ""} onChange={e => setFormData({...formData, SLR_Deadline: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 lg:p-5 text-xs font-black text-white outline-none focus:border-blue-600 transition-colors shadow-inner" style={{ colorScheme: 'dark' }} />
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2 tracking-widest">Preuve (URL Archive / Journal Officiel)</label>
                <input value={formData.SLR_Evidence} onChange={e => setFormData({...formData, SLR_Evidence: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 lg:p-5 text-xs font-black text-emerald-500 outline-none focus:border-blue-600 transition-colors shadow-inner lowercase" placeholder="https://..." />
              </div>

              <div className="md:col-span-2 pt-6 border-t border-white/5 mt-2">
                <button disabled={submitting} type="submit" className="w-full bg-blue-600 py-5 rounded-2xl font-black text-[10px] lg:text-[11px] tracking-[0.3em] text-white border-none cursor-pointer hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-3 italic shadow-[0_10px_30px_rgba(37,99,235,0.3)] disabled:opacity-50">
                  {submitting ? <Loader2 className="animate-spin w-5 h-5"/> : <Save className="w-5 h-5"/>} VALIDER L&apos;EXIGENCE AU REGISTRE LÉGAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}</style>
    </div>
  );
}

// --- 🧩 COMPOSANTS ATOMIQUES ---

function StatMini({ label, value, color, icon }: { label: string, value: string | number, color: string, icon: React.ReactNode }) {
  const colors: Record<string, string> = { 
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
  };
  return (
    <div className={cn("p-4 lg:p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-lg gap-2 sm:gap-0", colors[color])}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-black/40 rounded-xl shadow-inner">{icon}</div>
        <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{label}</span>
      </div>
      <span className="text-2xl lg:text-3xl font-black italic">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: ComplianceStatus }) {
  const config: Record<ComplianceStatus, string> = {
    'A_RESPECTER': 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    'RESPECTEE': 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    'NON_CONFORME': 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    'EN_COURS': 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  };
  return (
    <span className={cn("px-4 py-1.5 rounded-lg text-[9px] border uppercase font-black italic tracking-widest whitespace-nowrap shadow-inner inline-flex justify-center", config[status])}>
      {status.replace('_', ' ')}
    </span>
  );
}