/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Scale, AlertCircle, Loader2, Plus, Edit3, Trash2, 
  CheckCircle2, Clock, ShieldAlert, Save, X, Info, Filter, Link2, RefreshCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- TYPES STRICTS ---
interface GovernanceActivity {
  GA_Id: string;
  GA_Title: string;
  GA_DatePlanned: string;
  GA_Deadline: string | null;
  GA_Status: 'PLANNED' | 'IN_PROGRESS' | 'DONE' | 'POSTPONED' | 'CANCELLED';
  GA_Observations: string | null;
  GA_Type: string;
  GA_Processes: { PR_Id: string; PR_Code: string }[];
}

/**
 * ⚖️ REGISTRE DE VEILLE RÉGLEMENTAIRE
 * Assure l'identification et l'accès aux exigences légales §6.1.3.
 */
export default function CompliancePage() {
  const [data, setData] = useState<GovernanceActivity[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Formulaire local
  const [form, setForm] = useState({
    GA_Title: '',
    GA_DatePlanned: new Date().toISOString().split('T')[0],
    GA_Deadline: '',
    GA_Status: 'PLANNED',
    GA_Observations: '',
    GA_Type: 'VEILLE_REGLEMENTAIRE',
    processId: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [res, resProc] = await Promise.all([
        apiClient.get('/gouvernance/planning?type=VEILLE_REGLEMENTAIRE'),
        apiClient.get('/processus')
      ]);
      setData(res.data);
      setProcesses(resProc.data);
    } catch (e) {
      toast.error("Rupture de liaison avec le Noyau de Conformité");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Calcul du risque en temps réel (Matrice d'acceptabilité)
  const stats = useMemo(() => ({
    total: data.length,
    critical: data.filter(v => v.GA_Status !== 'DONE' && v.GA_Deadline && new Date(v.GA_Deadline) < new Date()).length,
    compliant: data.filter(v => v.GA_Status === 'DONE').length
  }), [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Scellage de l'exigence...");
    try {
      if (editingId) {
        await apiClient.patch(`/gouvernance/planning/${editingId}`, form);
      } else {
        await apiClient.post('/gouvernance/planning', form);
      }
      toast.success("Registre de Veille mis à jour", { id: tid });
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (e) { toast.error("Échec de l'indexation", { id: tid }); }
  };

  const handleEdit = (activity: GovernanceActivity) => {
    setEditingId(activity.GA_Id);
    setForm({
      GA_Title: activity.GA_Title,
      GA_DatePlanned: activity.GA_DatePlanned.split('T')[0],
      GA_Deadline: activity.GA_Deadline ? activity.GA_Deadline.split('T')[0] : '',
      GA_Status: activity.GA_Status,
      GA_Observations: activity.GA_Observations || '',
      GA_Type: 'VEILLE_REGLEMENTAIRE',
      processId: activity.GA_Processes?.[0]?.PR_Id || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setForm({ GA_Title: '', GA_DatePlanned: new Date().toISOString().split('T')[0], GA_Deadline: '', GA_Status: 'PLANNED', GA_Observations: '', GA_Type: 'VEILLE_REGLEMENTAIRE', processId: '' });
    setEditingId(null);
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500">
      <Loader2 className="animate-spin mb-4" size={40} />
      <span className="italic font-black uppercase tracking-[0.5em] text-[10px]">Audit du Noyau Légal...</span>
    </div>
  );

  return (
    <div className="ml-72 p-10 bg-[#0B0F1A] min-h-screen text-white italic text-left font-sans relative selection:bg-blue-600/30">
      
      {/* HEADER STRATÉGIQUE */}
      <header className="mb-12 flex justify-between items-end border-b border-white/5 pb-10">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
            Veille <span className="text-blue-500 text-6xl block">Légale</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4 italic">
            Identification des exigences & Surveillance des risques de non-conformité
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchData} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:text-blue-500 transition-all italic uppercase font-black text-[10px]"><RefreshCcw size={18}/></button>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-3 transition-all shadow-2xl shadow-blue-900/40 border-none cursor-pointer italic"
          >
            <Plus size={18} /> Nouvelle Exigence
          </button>
        </div>
      </header>

      {/* DASHBOARD KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-in fade-in duration-500">
        <div className="bg-white/5 border border-white/10 p-10 rounded-[3.5rem] text-left backdrop-blur-sm group hover:border-blue-500/20 transition-all">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4 italic">Exigences Surveillées</p>
          <p className="text-6xl font-black italic tracking-tighter leading-none">{stats.total}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 p-10 rounded-[3.5rem] text-left group hover:bg-red-500/20 transition-all">
          <p className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-4 italic flex items-center gap-2"><AlertCircle size={14}/> Écarts / Retards</p>
          <p className="text-6xl font-black italic tracking-tighter text-red-500 leading-none">{stats.critical}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-[3.5rem] text-left group hover:bg-emerald-500/20 transition-all">
          <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-4 italic flex items-center gap-2"><CheckCircle2 size={14}/> Taux de Conformité</p>
          <p className="text-6xl font-black italic tracking-tighter text-emerald-500 leading-none">
            {stats.total > 0 ? ((stats.compliant / stats.total) * 100).toFixed(0) : 0}%
          </p>
        </div>
      </div>

      {/* LISTE DYNAMIQUE DES EXIGENCES */}
      <div className="space-y-6">
        {data.map((v) => {
          const isLate = v.GA_Status !== 'DONE' && v.GA_Deadline && new Date(v.GA_Deadline) < new Date();
          return (
            <div key={v.GA_Id} className={`bg-slate-900/40 border p-10 rounded-[4rem] transition-all flex items-center justify-between group backdrop-blur-sm ${isLate ? 'border-red-500/30 bg-red-500/5' : 'border-white/5 hover:border-blue-500/30'}`}>
              <div className="flex gap-10 items-center">
                <div className={`w-24 h-24 rounded-4xl flex flex-col items-center justify-center border transition-all ${isLate ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-blue-600/10 border-blue-500/20 text-blue-500'}`}>
                  <span className="text-[10px] font-black uppercase italic tracking-widest">{new Date(v.GA_DatePlanned).toLocaleString('fr', {month: 'short'})}</span>
                  <span className="text-4xl font-black leading-none italic">{new Date(v.GA_DatePlanned).getDate()}</span>
                </div>
                <div className="text-left">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-4 group-hover:text-blue-400 transition-colors">{v.GA_Title}</h3>
                  <div className="flex gap-4">
                    <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase text-slate-400 flex items-center gap-2 italic">
                      <Link2 size={12} className="text-blue-500"/> {v.GA_Processes?.[0]?.PR_Code || 'TRANSVERSE'}
                    </span>
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase italic border ${v.GA_Status === 'DONE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-600/10 text-blue-500 border-blue-500/20'}`}>
                      {v.GA_Status.replace('_', ' ')}
                    </span>
                  </div>
                  {v.GA_Observations && (
                    <p className="mt-5 text-[11px] text-slate-500 font-bold italic uppercase max-w-xl line-clamp-2 leading-relaxed">
                      <Info size={12} className="inline mr-2 text-slate-600"/> {v.GA_Observations}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-12">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-600 uppercase italic mb-2 tracking-[0.2em]">Échéance Critique</p>
                  <div className={`flex items-center gap-3 font-black italic ${isLate ? 'text-red-500' : 'text-slate-300'}`}>
                    {isLate && <ShieldAlert size={20} className="animate-pulse" />}
                    <span className="text-2xl tracking-tighter">{v.GA_Deadline ? new Date(v.GA_Deadline).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleEdit(v)} className="p-4 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all shadow-xl border-none cursor-pointer text-white"><Edit3 size={18}/></button>
                  <button onClick={() => { if(confirm("Supprimer l'exigence?")) apiClient.delete(`/gouvernance/planning/${v.GA_Id}`).then(fetchData); }} className="p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all shadow-xl border-none cursor-pointer text-white"><Trash2 size={18}/></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL INDEXATION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-100 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-3xl rounded-[4rem] p-16 shadow-4xl italic overflow-hidden relative">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-left">
                {editingId ? 'Modifier' : 'Déclarer'} une <span className="text-blue-500">Exigence</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-transparent border-none text-slate-500 hover:text-white cursor-pointer transition-colors"><X size={36} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-10 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-6 italic tracking-widest">Libellé de l&apos;exigence (ISO §6.1.3)</label>
                  <input required type="text" value={form.GA_Title} onChange={e => setForm({...form, GA_Title: e.target.value})} placeholder="Ex: MISE À JOUR VEILLE CONVENTION COLLECTIVE..." className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl outline-none focus:border-blue-500 italic font-black text-white uppercase" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-6 italic tracking-widest">Processus Impacté</label>
                  <select value={form.processId} onChange={e => setForm({...form, processId: e.target.value})} className="w-full bg-[#0F172A] border border-white/10 p-6 rounded-3xl outline-none focus:border-blue-500 italic font-black text-white appearance-none cursor-pointer">
                    <option value="">SÉLECTIONNER UN AXE</option>
                    {processes.map(p => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-6 italic tracking-widest">Statut du Workflow</label>
                  <select value={form.GA_Status} onChange={e => setForm({...form, GA_Status: e.target.value as any})} className="w-full bg-[#0F172A] border border-white/10 p-6 rounded-3xl outline-none focus:border-blue-500 italic font-black text-white appearance-none cursor-pointer">
                    <option value="PLANNED">PLANIFIÉ</option>
                    <option value="IN_PROGRESS">EN COURS</option>
                    <option value="DONE">CONFORME / SCELLÉ</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-6 italic tracking-widest">Date d&apos;entrée en veille</label>
                  <input type="date" value={form.GA_DatePlanned} onChange={e => setForm({...form, GA_DatePlanned: e.target.value})} className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl outline-none focus:border-blue-500 font-black text-white" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase ml-6 italic tracking-widest text-red-500">Échéance de conformité</label>
                  <input type="date" value={form.GA_Deadline} onChange={e => setForm({...form, GA_Deadline: e.target.value})} className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl outline-none focus:border-red-500 font-black text-red-500" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-6 italic tracking-widest">Preuves de conformité & Observations</label>
                <textarea rows={4} value={form.GA_Observations} onChange={e => setForm({...form, GA_Observations: e.target.value})} className="w-full bg-white/5 border border-white/10 p-6 rounded-4xl outline-none focus:border-blue-500 italic font-black text-white uppercase resize-none" placeholder="DÉTAILLER L'ANALYSE D'IMPACT..." />
              </div>
              <button type="submit" className="w-full bg-blue-600 p-8 rounded-[2.5rem] font-black uppercase italic tracking-[0.3em] flex items-center justify-center gap-4 border-none text-white cursor-pointer shadow-3xl hover:bg-blue-500 transition-all">
                <Save size={24}/> Indexer l&apos;exigence légale Matrix
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}