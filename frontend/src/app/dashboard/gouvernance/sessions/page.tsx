/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🎙️ MODULE : SÉANCES PROCESSUS (MATRIX CORE)
 * Rôle : Traçabilité §9.3 • Arbitrages opérationnels et décisions SMI.
 * Fix : Restauration du multiselect de processus et sécurité sync.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 02:40 GMT
 */

"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Presentation, Calendar, Loader2, Plus, Edit3, Trash2, 
  Save, X, MapPin, Target, AlertTriangle, RefreshCcw, Database, ShieldAlert
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function SeancesPage() {
  const [data, setData] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [form, setForm] = useState({ GA_Title: '', GA_Theme: '', GA_DatePlanned: new Date().toISOString().split('T')[0], GA_Deadline: '', GA_Location: '', GA_Status: 'PLANNED' as any, GA_Observations: '', GA_Type: 'SEANCE_PROCESSUS', processIds: [] as string[] });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setSyncError(null);
      const [res, resProc] = await Promise.all([
        apiClient.get('/gouvernance/planning?type=SEANCE_PROCESSUS'),
        apiClient.get('/processus')
      ]);
      setData(res.data?.data || res.data || []);
      setProcesses(resProc.data?.data || resProc.data || []);
    } catch (err: any) { setSyncError("ERREUR DE LIAISON MASTER NODE"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Ouverture de session...");
    try {
      if (editingId) await apiClient.patch(`/gouvernance/planning/${editingId}`, form);
      else await apiClient.post('/gouvernance/planning', form);
      toast.success("SÉANCE INDEXÉE DANS LE SMI", { id: tid });
      setIsModalOpen(false); resetForm(); fetchData();
    } catch { toast.error("ÉCHEC PROTOCOLE MATRIX", { id: tid }); }
  };

  const handleEdit = (s: any) => {
    setEditingId(s.GA_Id);
    setForm({ GA_Title: s.GA_Title, GA_Theme: s.GA_Theme || '', GA_DatePlanned: s.GA_DatePlanned.split('T')[0], GA_Deadline: s.GA_Deadline || '', GA_Location: s.GA_Location || '', GA_Status: s.GA_Status, GA_Observations: s.GA_Observations || '', GA_Type: 'SEANCE_PROCESSUS', processIds: s.GA_Processes?.map((p: any) => p.PR_Id) || [] });
    setIsModalOpen(true);
  };

  const resetForm = () => { setForm({ GA_Title: '', GA_Theme: '', GA_DatePlanned: new Date().toISOString().split('T')[0], GA_Deadline: '', GA_Location: '', GA_Status: 'PLANNED', GA_Observations: '', GA_Type: 'SEANCE_PROCESSUS', processIds: [] }); setEditingId(null); };

  if (loading) return (
    <div className="ml-0 lg:ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500">
      <Loader2 className="animate-spin mb-4" size={48} />
      <span className="italic font-black uppercase tracking-[0.5em] text-[10px] animate-pulse m-0">Ouverture du Registre Séances...</span>
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 p-6 lg:p-12 bg-[#0B0F1A] min-h-screen text-white italic text-left font-sans selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {syncError && (
        <div className="mb-10 p-8 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-between animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-6 text-red-500 text-left shrink-0"><ShieldAlert size={32} /><div><p className="text-[11px] font-black uppercase tracking-widest leading-none m-0">{syncError}</p></div></div>
          <button onClick={fetchData} className="p-4 bg-red-500/20 rounded-2xl hover:bg-red-500 transition-all text-white border-none cursor-pointer"><RefreshCcw size={20}/></button>
        </div>
      )}

      <header className="mb-16 flex flex-col xl:flex-row justify-between xl:items-end border-b border-white/5 pb-10 gap-8 mt-12 lg:mt-0">
        <div className="text-left">
          <h1 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter leading-none m-0">Sessions <span className="text-blue-600">Processus</span></h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-6 italic m-0 leading-none">Surveillance Opérationnelle §9.3 • Matrix CORE</p>
        </div>
        <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs flex items-center gap-4 transition-all shadow-3xl border-none cursor-pointer italic shrink-0">
          <Plus size={20} /> Programmer Séance
        </button>
      </header>

      <div className="grid gap-8">
        {data.length > 0 ? data.map((s) => (
          <div key={s.GA_Id} className="bg-slate-900/50 border border-white/5 p-8 lg:p-12 rounded-[3rem] lg:rounded-[4.5rem] hover:border-blue-500/40 transition-all group backdrop-blur-sm relative">
            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-8">
              <div className="flex flex-col sm:flex-row gap-12 items-center text-left">
                <div className="w-24 h-24 rounded-[2.5rem] flex flex-col items-center justify-center border border-blue-500/20 bg-blue-600/10 text-blue-500 shadow-2xl shrink-0">
                  <span className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">{new Date(s.GA_DatePlanned).toLocaleString('fr', {month: 'short'}).toUpperCase()}</span>
                  <span className="text-4xl font-black leading-none italic m-0">{new Date(s.GA_DatePlanned).getDate()}</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-6 mb-4">
                    <span className="bg-blue-600/20 text-blue-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/20 italic">{s.GA_Num || 'SM-S'}</span>
                    <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase italic tracking-widest leading-none"><MapPin size={14} className="text-blue-500"/> {s.GA_Location || 'LIEU À DÉFINIR'}</span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tighter mb-6 group-hover:text-blue-400 transition-colors leading-none m-0">{s.GA_Title}</h2>
                  <div className="flex flex-wrap gap-3">
                    {s.GA_Processes?.map((p: any) => (
                      <span key={p.PR_Id} className="text-[9px] font-black text-blue-500 border border-blue-500/20 px-4 py-1.5 rounded-xl uppercase italic bg-blue-500/5 tracking-widest leading-none"><Target size={12} className="inline mr-2"/> {p.PR_Code}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                <button onClick={() => handleEdit(s)} className="p-5 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all border-none text-white cursor-pointer"><Edit3 size={20}/></button>
                <button onClick={async () => { if(confirm("Supprimer séance?")) { await apiClient.delete(`/gouvernance/planning/${s.GA_Id}`); fetchData(); } }} className="p-5 bg-white/5 rounded-2xl hover:bg-red-600 transition-all border-none text-white cursor-pointer"><Trash2 size={20}/></button>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[5rem] group bg-white/2">
             <Database className="mx-auto text-slate-800 mb-8 opacity-20 group-hover:scale-110 transition-transform duration-1000" size={80} />
             <p className="text-slate-600 font-black uppercase italic tracking-[0.5em] text-sm m-0">Registre des séances vierge §9.3 Matrix CORE.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-100 flex items-center justify-center p-6 animate-in zoom-in-95 duration-300 italic font-black uppercase">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-4xl rounded-[5rem] p-12 lg:p-16 shadow-4xl overflow-y-auto max-h-[90vh] text-left">
            <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-10">
              <h2 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tighter leading-none m-0 text-white">{editingId ? 'Modifier' : 'Animer'} <span className="text-blue-600">Séance</span></h2>
              <X size={36} className="cursor-pointer text-slate-500 hover:text-white" onClick={() => setIsModalOpen(false)} />
            </div>
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3 md:col-span-2 text-left"><label className="text-[11px] font-black text-slate-500 ml-6 tracking-widest leading-none">Objet Séance Processus *</label><input required type="text" value={form.GA_Title} onChange={e => setForm({...form, GA_Title: e.target.value.toUpperCase()})} placeholder="REVUE PR-01..." className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl outline-none focus:border-blue-500 font-black text-white italic tracking-tight" /></div>
                <div className="space-y-3 text-left"><label className="text-[11px] font-black text-slate-500 ml-6 tracking-widest leading-none">Lieu / Plateforme</label><input type="text" value={form.GA_Location} onChange={e => setForm({...form, GA_Location: e.target.value.toUpperCase()})} placeholder="SALLE PILOTAGE..." className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl outline-none focus:border-blue-500 font-black text-white italic" /></div>
                <div className="space-y-3 text-left"><label className="text-[11px] font-black text-slate-500 ml-6 tracking-widest leading-none">Date Planifiée</label><input required type="date" value={form.GA_DatePlanned} onChange={e => setForm({...form, GA_DatePlanned: e.target.value})} className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl outline-none focus:border-blue-500 font-black text-blue-500 italic" /></div>
              </div>
              <div className="space-y-5 text-left"><label className="text-[11px] font-black text-slate-500 ml-6 tracking-widest leading-none">Périmètre Processus Matrix (§4.4)</label><div className="flex flex-wrap gap-3 p-8 bg-white/2 border border-white/10 rounded-[3rem] shadow-inner">{processes.map(p => (<button type="button" key={p.PR_Id} onClick={() => setForm(f => ({ ...f, processIds: f.processIds.includes(p.PR_Id) ? f.processIds.filter(id => id !== p.PR_Id) : [...f.processIds, p.PR_Id] }))} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase italic border transition-all cursor-pointer ${form.processIds.includes(p.PR_Id) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-transparent border-white/10 text-slate-500 hover:text-white'}`}>{p.PR_Code}</button>))}</div></div>
              <div className="space-y-3 text-left"><label className="text-[11px] font-black text-slate-500 ml-6 tracking-widest leading-none">Ordre du jour & Arbitrages</label><textarea rows={4} value={form.GA_Observations} onChange={e => setForm({...form, GA_Observations: e.target.value})} className="w-full bg-white/5 border border-white/10 p-8 rounded-[3rem] outline-none focus:border-blue-600 font-black text-white uppercase resize-none leading-relaxed" placeholder="CONSIGNER LES ARBITRAGES..." /></div>
              <button type="submit" className="w-full bg-blue-600 p-10 rounded-[3rem] font-black uppercase italic tracking-[0.4em] shadow-3xl flex items-center justify-center gap-6 border-none text-white cursor-pointer hover:bg-white hover:text-blue-600 transition-all active:scale-95 group"><Save size={28} /> Enregistrer Séance Matrix</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}