/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 CE QUE FAIT CETTE PAGE :
 * --------------------------
 * RÔLE : Registre Souverain de Veille Légale et Réglementaire.
 * CONFORMITÉ : Assure l'identification et l'évaluation de la conformité (§6.1.3 & §9.1.2 ISO).
 * ARCHITECTURE SDE :
 * - Page "One-Pager" : Cadrée sur 100vh, sans scroll global (densité maximale).
 * - Typage Strict : Utilisation de l'entité Requirement (REQ_) au lieu de champs inventés.
 * - Validation : Contrôle d'intégrité avant insertion dans la Matrix.
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Scale, AlertCircle, Loader2, Plus, Edit3, Trash2, 
  CheckCircle2, ShieldAlert, Save, X, Info, Link2, RefreshCcw,
  BookOpen, Target
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// ============================================================================
// 🛡️ TYPES STRICTS (RÉFÉRENTIEL SDE MATRIX - elite-sde.ts)
// ============================================================================
export interface ComplianceRequirement {
  REQ_Id: string;
  REQ_Title: string;
  REQ_Source: string; // Ex: Journal Officiel, Code du Travail
  REQ_Status: 'CONFORME' | 'NON_CONFORME' | 'A_EVALUER' | 'HORS_PERIMETRE';
  REQ_Deadline: string | null;
  REQ_Observations: string;
  REQ_ProcessusId: string;
  REQ_Processus?: { PR_Id: string; PR_Code: string; PR_Libelle: string };
}

export interface ProcessusBase {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
}

export default function CompliancePage() {
  // --- 📦 ÉTATS DU COCKPIT ---
  const [data, setData] = useState<ComplianceRequirement[]>([]);
  const [processes, setProcesses] = useState<ProcessusBase[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- ÉTATS DU FORMULAIRE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Formulaire local strict
  const [form, setForm] = useState({
    REQ_Title: '',
    REQ_Source: '',
    REQ_Deadline: '',
    REQ_Status: 'A_EVALUER',
    REQ_Observations: '',
    REQ_ProcessusId: ''
  });

  /**
   * 🔄 SYNCHRONISATION AVEC LE NOYAU LÉGAL
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resReq, resProc] = await Promise.all([
        apiClient.get<ComplianceRequirement[]>('/requirements').catch(() => ({ data: [] })),
        apiClient.get<ProcessusBase[]>('/processus').catch(() => ({ data: [] }))
      ]);
      setData(resReq.data);
      setProcesses(resProc.data);
    } catch (e) {
      toast.error("RUPTURE DE LIAISON AVEC LE NOYAU LÉGAL SDE.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * 📊 CALCULATEUR DE RISQUE (MATRICE D'ACCEPTABILITÉ)
   */
  const stats = useMemo(() => {
    const total = data.length;
    const compliant = data.filter(r => r.REQ_Status === 'CONFORME').length;
    // Est critique si 'NON_CONFORME' ou si échéance dépassée sans être conforme
    const critical = data.filter(r => {
      if (r.REQ_Status === 'NON_CONFORME') return true;
      if (r.REQ_Status !== 'CONFORME' && r.REQ_Status !== 'HORS_PERIMETRE' && r.REQ_Deadline) {
        return new Date(r.REQ_Deadline) < new Date();
      }
      return false;
    }).length;

    return { total, compliant, critical };
  }, [data]);

  /**
   * 🛡️ MOTEUR DE VALIDATION STRICTE
   */
  const validateForm = () => {
    if (!form.REQ_Title.trim()) { toast.error("Le libellé de l'exigence est obligatoire."); return false; }
    if (!form.REQ_Source.trim()) { toast.error("La source légale (loi, décret, norme) est requise."); return false; }
    if (!form.REQ_ProcessusId) { toast.error("Le rattachement à un processus est obligatoire."); return false; }
    return true;
  };

  /**
   * 💾 SOUMISSION SCÉLLÉE
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const tid = toast.loading("Scellement de l'exigence légale...");
    try {
      // Nettoyage de la date si vide
      const payload = { ...form, REQ_Deadline: form.REQ_Deadline || null };

      if (editingId) {
        await apiClient.patch(`/requirements/${editingId}`, payload);
      } else {
        await apiClient.post('/requirements', payload);
      }
      
      toast.success("REGISTRE LÉGAL MIS À JOUR.", { id: tid });
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (e) { 
      toast.error("ÉCHEC DE L'INDEXATION DANS LA MATRIX.", { id: tid }); 
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 📝 PRÉPARATION ÉDITION
   */
  const handleEdit = (req: ComplianceRequirement) => {
    setEditingId(req.REQ_Id);
    setForm({
      REQ_Title: req.REQ_Title,
      REQ_Source: req.REQ_Source || '',
      REQ_Deadline: req.REQ_Deadline ? req.REQ_Deadline.split('T')[0] : '',
      REQ_Status: req.REQ_Status,
      REQ_Observations: req.REQ_Observations || '',
      REQ_ProcessusId: req.REQ_ProcessusId || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setForm({ REQ_Title: '', REQ_Source: '', REQ_Deadline: '', REQ_Status: 'A_EVALUER', REQ_Observations: '', REQ_ProcessusId: '' });
    setEditingId(null);
  };

  if (loading) return (
    <div className="ml-80 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500">
      <Loader2 className="animate-spin mb-4" size={40} />
      <span className="italic font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Audit du Noyau Légal...</span>
    </div>
  );

  return (
    // 📏 Cadrage One-Pager (h-screen, overflow-hidden)
    <div className="ml-80 p-6 bg-[#0B0F1A] h-screen flex flex-col text-white italic text-left font-sans relative selection:bg-blue-600/30 overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER STRATÉGIQUE (Compact) */}
      <header className="shrink-0 mb-4 flex justify-between items-end border-b border-white/5 pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic border border-blue-500/20">
               <Scale size={12} /> Compliance Tracker
             </span>
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none m-0">
            Veille <span className="text-blue-500">Légale</span>
          </h1>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] m-0">
            IDENTIFICATION DES EXIGENCES & SURVEILLANCE DES RISQUES (§6.1.3)
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={fetchData} 
            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:text-blue-500 transition-all cursor-pointer shadow-inner"
            title="Rafraîchir la matrice"
          >
            <RefreshCcw size={16}/>
          </button>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-900/40 border-none cursor-pointer italic"
          >
            <Plus size={16} strokeWidth={3} /> Indexer Exigence
          </button>
        </div>
      </header>

      {/* 📊 DASHBOARD KPIs (Compact, Hauteur Fixe) */}
      <div className="shrink-0 grid grid-cols-3 gap-4 mb-4 h-24 animate-in fade-in duration-500">
        <div className="bg-[#151A2D] border border-white/10 p-5 rounded-3xl flex flex-col justify-center shadow-inner group">
          <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2 flex items-center gap-2 italic m-0"><BookOpen size={12}/> Volume Exigences</p>
          <p className="text-3xl font-black italic tracking-tighter leading-none m-0 text-white">{stats.total}</p>
        </div>
        <div className="bg-rose-950/20 border border-rose-500/20 p-5 rounded-3xl flex flex-col justify-center shadow-inner group">
          <p className="text-[9px] font-black uppercase text-rose-500 tracking-widest mb-2 flex items-center gap-2 italic m-0"><AlertCircle size={12}/> Non-Conformités / Retards</p>
          <p className="text-3xl font-black italic tracking-tighter leading-none m-0 text-rose-500">{stats.critical}</p>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-3xl flex flex-col justify-center shadow-inner group">
          <p className="text-[9px] font-black uppercase text-emerald-500 tracking-widest mb-2 flex items-center gap-2 italic m-0"><CheckCircle2 size={12}/> Taux de Conformité</p>
          <div className="flex items-center gap-3">
             <p className="text-3xl font-black italic tracking-tighter leading-none m-0 text-emerald-500">
               {stats.total > 0 ? ((stats.compliant / stats.total) * 100).toFixed(0) : 0}%
             </p>
             <div className="flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${stats.total > 0 ? (stats.compliant / stats.total) * 100 : 0}%` }} />
             </div>
          </div>
        </div>
      </div>

      {/* 📋 LISTE DYNAMIQUE DES EXIGENCES (Zone Extensible et Scrollable) */}
      <div className="flex-1 min-h-0 bg-[#151A2D] border border-white/5 rounded-4xl p-4 flex flex-col shadow-4xl backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4 px-2 shrink-0">
           <Target className="text-blue-500" size={16} />
           <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] m-0">Registre des Textes Applicables</h3>
        </div>
        
        {/* Container avec Scroll Interne */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
          {data.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
               <Scale size={48} className="mb-4" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em]">Le registre légal est vide.</p>
            </div>
          ) : (
            data.map((req) => {
              const isLate = req.REQ_Status !== 'CONFORME' && req.REQ_Status !== 'HORS_PERIMETRE' && req.REQ_Deadline && new Date(req.REQ_Deadline) < new Date();
              const isNonCompliant = req.REQ_Status === 'NON_CONFORME';
              const isDanger = isLate || isNonCompliant;

              function cn(arg0: string, arg1: string): string | undefined {
                throw new Error('Function not implemented.');
              }

              return (
                <div key={req.REQ_Id} className={cn(
                  "p-5 rounded-2xl transition-all flex items-center justify-between group border border-white/5 bg-black/20 hover:bg-black/40",
                  isDanger ? 'border-rose-500/30 bg-rose-950/10' : ''
                )}>
                  <div className="flex gap-5 items-center flex-1 min-w-0">
                    {/* Statut Visuel */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center border shrink-0",
                      req.REQ_Status === 'CONFORME' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                      isDanger ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                    )}>
                      {req.REQ_Status === 'CONFORME' ? <CheckCircle2 size={20} /> :
                       isDanger ? <ShieldAlert size={20} className="animate-pulse" /> : <Loader2 size={20} />}
                    </div>
                    
                    {/* Détails Exigence */}
                    <div className="text-left flex-1 min-w-0">
                      <h3 className="text-sm font-black uppercase italic tracking-tighter leading-none mb-2 group-hover:text-blue-400 transition-colors truncate m-0">
                        {req.REQ_Title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-black/60 border border-white/10 rounded-lg text-[8px] font-black uppercase text-blue-400 flex items-center gap-1.5 italic whitespace-nowrap">
                          <BookOpen size={10}/> {req.REQ_Source}
                        </span>
                        <span className="px-3 py-1 bg-black/60 border border-white/10 rounded-lg text-[8px] font-black uppercase text-slate-400 flex items-center gap-1.5 italic whitespace-nowrap">
                          <Link2 size={10}/> {req.REQ_Processus?.PR_Code || 'TRANSVERSE'}
                        </span>
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[8px] font-black uppercase italic border whitespace-nowrap",
                          req.REQ_Status === 'CONFORME' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                          isDanger ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        )}>
                          {req.REQ_Status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Échéance & Actions */}
                  <div className="flex items-center gap-8 shrink-0 ml-4">
                    <div className="text-right hidden xl:block">
                      <p className="text-[8px] font-black text-slate-600 uppercase italic mb-1 tracking-[0.2em] m-0">Échéance Conformité</p>
                      <p className={cn("text-xs font-black italic m-0", isLate ? 'text-rose-500' : 'text-slate-300')}>
                        {req.REQ_Deadline ? new Date(req.REQ_Deadline).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(req)} className="p-2.5 bg-black/40 rounded-lg hover:bg-blue-600 hover:text-white text-slate-400 transition-all border border-white/5 cursor-pointer"><Edit3 size={14}/></button>
                      <button onClick={() => { if(confirm("Supprimer l'exigence légale ?")) apiClient.delete(`/requirements/${req.REQ_Id}`).then(fetchData); }} className="p-2.5 bg-black/40 rounded-lg hover:bg-rose-600 hover:text-white text-slate-400 transition-all border border-white/5 cursor-pointer"><Trash2 size={14}/></button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 🧾 MODAL SÉCURISÉ D'INDEXATION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#0B0F1A] border border-white/10 w-full max-w-2xl rounded-[3rem] p-10 shadow-4xl italic flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-8 shrink-0">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none m-0 flex items-center gap-3">
                <Scale className="text-blue-500" size={24} />
                {editingId ? 'Modifier' : 'Sceller'} <span className="text-blue-500">Exigence</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-black/40 p-3 rounded-xl border border-white/5 text-slate-500 hover:text-white hover:bg-rose-500/20 cursor-pointer transition-colors"><X size={20} strokeWidth={3}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[9px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">Libellé de l&apos;exigence (§6.1.3)</label>
                  <input type="text" value={form.REQ_Title} onChange={e => setForm({...form, REQ_Title: e.target.value})} placeholder="EX: DÉCRET 2024-XXX SUR L'ENVIRONNEMENT..." className="w-full bg-[#151A2D] border border-white/5 p-4 rounded-2xl outline-none focus:border-blue-500 italic font-black text-white uppercase text-xs" />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">Source (Loi, Norme, Arrêté)</label>
                  <input type="text" value={form.REQ_Source} onChange={e => setForm({...form, REQ_Source: e.target.value})} placeholder="EX: JOURNAL OFFICIEL..." className="w-full bg-[#151A2D] border border-white/5 p-4 rounded-2xl outline-none focus:border-blue-500 italic font-black text-white uppercase text-xs" />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">Processus Applicable</label>
                  <select value={form.REQ_ProcessusId} onChange={e => setForm({...form, REQ_ProcessusId: e.target.value})} className="w-full bg-[#151A2D] border border-white/5 p-4 rounded-2xl outline-none focus:border-blue-500 italic font-black text-slate-300 appearance-none cursor-pointer text-xs">
                    <option value="" className="bg-[#0B0F1A]">-- SÉLECTIONNER PROCESSUS --</option>
                    {processes.map(p => <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0B0F1A]">{p.PR_Code} - {p.PR_Libelle}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">Statut de Conformité</label>
                  <select value={form.REQ_Status} onChange={e => setForm({...form, REQ_Status: e.target.value as any})} className="w-full bg-[#151A2D] border border-white/5 p-4 rounded-2xl outline-none focus:border-blue-500 italic font-black text-slate-300 appearance-none cursor-pointer text-xs">
                    <option value="A_EVALUER" className="bg-[#0B0F1A]">À ÉVALUER</option>
                    <option value="CONFORME" className="bg-[#0B0F1A]">CONFORME</option>
                    <option value="NON_CONFORME" className="bg-[#0B0F1A]">NON CONFORME</option>
                    <option value="HORS_PERIMETRE" className="bg-[#0B0F1A]">HORS PÉRIMÈTRE</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase ml-4 italic tracking-widest text-amber-500">Échéance de mise en conformité</label>
                  <input type="date" value={form.REQ_Deadline} onChange={e => setForm({...form, REQ_Deadline: e.target.value})} className="w-full bg-[#151A2D] border border-white/5 p-4 rounded-2xl outline-none focus:border-amber-500 font-black text-amber-500 text-xs cursor-pointer color-scheme-dark" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[9px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">Analyse & Observations</label>
                  <textarea rows={3} value={form.REQ_Observations} onChange={e => setForm({...form, REQ_Observations: e.target.value})} className="w-full bg-[#151A2D] border border-white/5 p-4 rounded-2xl outline-none focus:border-blue-500 italic font-bold text-slate-300 resize-none text-xs" placeholder="Note d'analyse d'impact..." />
                </div>
              </div>
              
              <div className="pt-6 shrink-0 border-t border-white/5 mt-6">
                 <button type="submit" disabled={submitting} className="w-full bg-blue-600 p-5 rounded-4xl font-black uppercase italic tracking-[0.2em] flex items-center justify-center gap-3 border-none text-white cursor-pointer shadow-lg hover:bg-blue-500 transition-all text-xs disabled:opacity-50">
                   {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18}/>} 
                   Indexer dans la matrice légale
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🧪 INJECTION CSS SOUVERAIN */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}</style>
    </div>
  );
}