/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * ⚖️ MODULE : CONFORMITÉ LÉGALE SÉNÉGAL (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Gestion des textes légaux et obligations territoriales (§6.1.3 ISO 9001).
 * DESIGN : ClickUp High-Density / Matrix Command Center / 100dvh.
 * RECTIFICATION : Double-échappement LaTeX (Ligne 245) et Stabilité Kernel.
 * ARCHITECTURE : Zéro NextAuth (Souveraineté apiClient JWT).
 * ---------------------------------------------------------------------------
 * DATE DE RÉVISION : 05 Mars 2026 | 18:52 GMT
 */

"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Plus, CheckCircle, XCircle, Search, Calendar, ShieldCheck, 
  X, Save, Loader2, Scale, Activity, BookOpen, RefreshCw, ChevronRight, Download
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- 🏗️ TYPES SMI ---
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

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

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

  // --- 📡 SYNCHRONISATION KERNEL ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>('/senegal-legal');
      const rawContent = res.data;
      const reqs: SenegalLegalRequirement[] = Array.isArray(rawContent) 
        ? rawContent 
        : (Array.isArray(rawContent?.data) ? rawContent.data : []);
      
      setRequirements(reqs);

      const total = reqs.length;
      const compliant = reqs.filter(r => r.SLR_Status === 'RESPECTEE').length;
      setStats({
        total,
        compliant,
        nonCompliant: reqs.filter(r => r.SLR_Status === 'NON_CONFORME').length,
        rate: total > 0 ? Math.round((compliant / total) * 100) : 100
      });
    } catch {
      toast.error('RUPTURE KERNEL : Référentiel Sénégal Légal inaccessible.');
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase().trim();
    return requirements.filter(r => 
      r.SLR_Title?.toLowerCase().includes(t) || 
      r.SLR_Reference?.toLowerCase().includes(t)
    );
  }, [requirements, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.SLR_Title || !formData.SLR_Reference) return toast.warning("CHAMPS OBLIGATOIRES MANQUANTS");
    
    setSubmitting(true);
    const tid = toast.loading("SCELLAGE DE L'EXIGENCE LÉGALE...");
    try {
      const payload = { ...formData, SLR_Deadline: formData.SLR_Deadline || null };
      await apiClient.post('/senegal-legal', payload);
      toast.success('EXIGENCE INDEXÉE DANS LE REGISTRE SDE.', { id: tid });
      setIsModalOpen(false);
      setFormData(defaultForm);
      fetchData();
    } catch (err: any) { 
      toast.error(err.response?.data?.message || 'ERREUR DE SCELLAGE', { id: tid }); 
    } finally { 
      setSubmitting(false); 
    }
  };

  if (loading && requirements.length === 0) return <LoadingScreen label="Synchronisation Matrix Sénégal..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex gap-3">
            <span className="bg-emerald-600/10 border border-emerald-500/20 px-4 py-1 rounded-xl text-[9px] text-emerald-500 tracking-widest italic shadow-inner">Veille Sénégal</span>
            <span className="bg-blue-600/10 border border-blue-500/20 px-4 py-1 rounded-xl text-[9px] text-blue-500 tracking-widest italic shadow-inner">ISO 9001 §6.1.3</span>
          </div>
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic flex items-center gap-5">
            <Scale className="text-blue-600" size={40} strokeWidth={2.5} /> Conformité <span className="text-blue-600">Légale</span>
          </h1>
        </div>

        <div className="flex gap-4 w-full xl:w-auto">
          <div className="relative flex-1 xl:flex-none group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-all" size={20} />
            <input 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="SCANNER RÉFÉRENTIEL..." 
              className="w-full xl:w-80 bg-black/40 border-2 border-white/5 rounded-[2.5rem] py-5 pl-16 pr-8 text-[11px] font-black italic text-white outline-none focus:border-blue-600 shadow-inner uppercase" 
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 xl:flex-none bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-5 rounded-3xl text-[10px] shadow-4xl border-none cursor-pointer text-white italic transition-all active:scale-95 flex items-center justify-center gap-3 tracking-widest uppercase">
            <Plus size={18} strokeWidth={3} /> Indexer Exigence
          </button>
        </div>
      </header>

      {/* 📊 KPI BAR */}
      <div className="shrink-0 px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6 bg-[#0B1222]/50 border-b border-white/5">
        <KPIBox label="Registre Légal" value={stats.total} icon={<BookOpen size={20}/>} color="blue" />
        <KPIBox label="Textes Conformés" value={stats.compliant} icon={<CheckCircle size={20}/>} color="emerald" />
        <KPIBox label="Écarts Détectés" value={stats.nonCompliant} icon={<XCircle size={20}/>} color="rose" />
        <KPIBox label="Indice de Maîtrise" value={`${stats.rate}%`} icon={<Activity size={20}/>} color="amber" />
      </div>

      {/* 🏛️ LEGAL DATAMATRIX (Isolated Scroll) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-400 mx-auto bg-[#151A2D] border-2 border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl relative">
          <table className="w-full text-left border-collapse min-w-250">
            <thead className="sticky top-0 bg-[#151A2D] z-10 border-b-2 border-white/5">
              <tr className="text-[10px] text-slate-500 uppercase font-black italic tracking-[0.3em]">
                <th className="px-10 py-8">Référence & Texte</th>
                <th className="px-6 py-8">Autorité Régulatrice</th>
                <th className="px-6 py-8">Échéance</th>
                <th className="px-6 py-8 text-center">Statut SMI</th>
                <th className="px-10 py-8 text-right">
                   <button onClick={fetchData} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-blue-500 border-none cursor-pointer transition-all">
                     <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                   </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-white/5">
              {filtered.map(req => (
                <tr key={req.SLR_Id} className="group hover:bg-blue-600/5 transition-all italic">
                  <td className="px-10 py-6 max-w-xl">
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-black text-blue-500 tracking-widest">{req.SLR_Category}</span>
                      <span className="text-sm font-black text-white uppercase tracking-tighter truncate group-hover:text-blue-400 transition-colors">{req.SLR_Title}</span>
                      <span className="text-[10px] text-slate-500 font-bold normal-case tracking-wider">{req.SLR_Reference}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <span className="text-[11px] font-black text-slate-400 uppercase italic tracking-widest">{req.SLR_Authority || "N/A"}</span>
                  </td>
                  <td className="px-6 py-6">
                    {req.SLR_Deadline ? (
                      <div className="flex items-center gap-3 text-[11px] font-black text-amber-500 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20 w-fit">
                        <Calendar size={14} /> {new Date(req.SLR_Deadline).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-[9px] font-black text-slate-600 tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5 uppercase">Permanente</span>
                    )}
                  </td>
                  <td className="px-6 py-6 text-center">
                    <StatusBadge status={req.SLR_Status} />
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 border-none cursor-pointer transition-all">
                      <ShieldCheck size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-600 text-[11px] font-black uppercase tracking-widest italic opacity-50">Aucune exigence détectée dans ce périmètre.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* 🛡️ FOOTER CONFORMITÉ (Rectification LaTeX) */}
      <footer className="shrink-0 bg-[#0B0F1A] border-t border-white/5 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4 text-blue-500 font-black text-[10px] tracking-widest uppercase italic">
          <ShieldCheck size={20} /> Matrice Légale Territoriale Scellée • Sénégal RD-2026
        </div>
        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">
          {/* ✅ RECTIFICATION : String interpolation avec double backslash */}
          {"Indice de Conformité Légale : $$C = \\frac{\\sum Respectée}{\\sum Totale} \\times 100 = " + stats.rate + "\\%$$"}
        </div>
      </footer>

      {/* 📟 MODALE INDEXATION (Optimisée) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-1000 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8">
          <form onSubmit={handleSubmit} className="bg-[#0B0F1A] border-2 border-white/10 rounded-[4rem] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-4xl animate-in zoom-in-95 duration-500 relative overflow-hidden italic font-black uppercase">
            
            <header className="px-12 py-10 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0">
              <div className="text-left space-y-2">
                <h2 className="text-3xl font-black italic m-0 tracking-tighter uppercase">Indexation <span className="text-blue-600">Légale</span></h2>
                <p className="text-[10px] text-slate-600 tracking-[0.4em] m-0 font-black italic uppercase">CONFORMITÉ RÉGLEMENTAIRE §6.1.3</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-5 bg-white/5 rounded-3xl text-slate-500 hover:text-white border-none cursor-pointer transition-all"><X size={28} /></button>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-12 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
              <SDEInput label="Libellé du Texte (Titre) *" value={formData.SLR_Title} onChange={(v) => setFormData({...formData, SLR_Title: v.toUpperCase()})} />
              <SDESelect label="Domaine Applicatif *" value={formData.SLR_Category} onChange={(v) => setFormData({...formData, SLR_Category: v})}>
                 {['Travail', 'Environnement', 'Fiscalité', 'Social', 'Sécurité', 'Qualité'].map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </SDESelect>
              <SDEInput label="Référence du Texte (Loi / Décret) *" value={formData.SLR_Reference} onChange={(v) => setFormData({...formData, SLR_Reference: v.toUpperCase()})} />
              <SDEInput label="Autorité de Régulation (EX: DGID)" value={formData.SLR_Authority} onChange={(v) => setFormData({...formData, SLR_Authority: v.toUpperCase()})} />
              
              <div className="space-y-4 text-left">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic m-0">Échéance de Conformité</label>
                <input 
                  type="date" 
                  value={formData.SLR_Deadline || ""} 
                  onChange={e => setFormData({...formData, SLR_Deadline: e.target.value})} 
                  className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-6 text-sm font-black text-white outline-none focus:border-blue-600 italic uppercase" 
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <SDEInput label="Lien Preuve (URL Journal Officiel)" value={formData.SLR_Evidence} onChange={(v) => setFormData({...formData, SLR_Evidence: v.toLowerCase()})} />
            </div>

            <footer className="px-12 py-10 border-t border-white/10 flex justify-end gap-6 bg-black/40 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-6 bg-white/5 rounded-[2.5rem] text-slate-500 font-black uppercase text-[12px] tracking-widest border-none cursor-pointer hover:bg-white hover:text-black transition-all italic">Abandonner</button>
              <button type="submit" disabled={submitting} className="px-16 py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.4em] italic shadow-4xl border-none cursor-pointer hover:bg-white hover:text-blue-600 transition-all flex items-center gap-4 disabled:opacity-30">
                {submitting ? <Loader2 className="animate-spin" size={24}/> : <Save size={24} strokeWidth={3}/>} Sceller l&apos;Exigence
              </button>
            </footer>
          </form>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

// --- 🧩 ATOMIQUES SDE ---

function KPIBox({ label, value, icon, color }: any) {
  const c: any = { 
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20", 
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", 
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20", 
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20" 
  };
  return (
    <div className={cn("p-6 rounded-[2.5rem] border flex items-center justify-between shadow-2xl transition-all hover:scale-[1.02]", c[color])}>
      <div className="flex items-center gap-4">
        <div className="p-4 bg-black/40 rounded-2xl shadow-inner text-white">{icon}</div>
        <span className="text-[10px] font-black uppercase text-slate-500 italic tracking-[0.2em] m-0 text-left">{label}</span>
      </div>
      <span className="text-4xl font-black italic m-0 text-white leading-none tracking-tighter drop-shadow-md">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: ComplianceStatus }) {
  const config: any = {
    'A_RESPECTER': 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    'RESPECTEE': 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    'NON_CONFORME': 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    'EN_COURS': 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  };
  return (
    <span className={cn("px-6 py-2 rounded-xl text-[10px] border uppercase font-black italic tracking-widest shadow-inner inline-flex justify-center min-w-35", config[status])}>
      {status.replace('_', ' ')}
    </span>
  );
}

function SDEInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-4 text-left w-full">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic m-0">{label}</label>
      <input 
        value={value || ""} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-6 text-[12px] font-black text-white outline-none italic focus:border-blue-600 focus:bg-white/5 transition-all uppercase shadow-inner" 
        placeholder="..." 
      />
    </div>
  );
}

function SDESelect({ label, value, onChange, children }: { label: string, value: string, onChange: (v: string) => void, children: React.ReactNode }) {
  return (
    <div className="space-y-4 text-left w-full relative">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic m-0">{label}</label>
      <select 
        value={value || ""} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-6 text-[12px] font-black text-white outline-none italic focus:border-blue-600 focus:bg-white/5 appearance-none cursor-pointer shadow-inner pr-12"
      >
        {children}
      </select>
      <div className="absolute right-6 bottom-6 pointer-events-none text-blue-600">▼</div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}
