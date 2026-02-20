/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Presentation, Calendar, Loader2, Plus, Edit3, Trash2, 
  Save, X, Info, MapPin, MessageSquare, 
  Target, AlertTriangle, RefreshCcw, Database,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- INTERFACES SCELLÉES ---
interface IProcessus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
}

interface IGovernanceActivity {
  GA_Id: string;
  GA_Num: string | null;
  GA_Title: string;
  GA_Theme: string | null;
  GA_DatePlanned: string;
  GA_Deadline: string | null;
  GA_Location: string | null;
  GA_Status: 'PLANNED' | 'IN_PROGRESS' | 'DONE' | 'POSTPONED' | 'CANCELLED';
  GA_Observations: string | null;
  GA_Processes: IProcessus[];
}

/**
 * 🎙️ GESTION DES SÉANCES ET REVUES DE PROCESSUS
 * Rôle : Traçabilité des arbitrages opérationnels et des décisions SMI.
 */
export default function SeancesPage() {
  const [data, setData] = useState<IGovernanceActivity[]>([]);
  const [processes, setProcesses] = useState<IProcessus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [form, setForm] = useState({
    GA_Title: '',
    GA_Theme: '',
    GA_DatePlanned: new Date().toISOString().split('T')[0],
    GA_Deadline: '',
    GA_Location: '',
    GA_Status: 'PLANNED' as IGovernanceActivity['GA_Status'],
    GA_Observations: '',
    GA_Type: 'SEANCE_PROCESSUS',
    processIds: [] as string[]
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setSyncError(null);
      const [res, resProc] = await Promise.all([
        apiClient.get<IGovernanceActivity[]>('/gouvernance/planning?type=SEANCE_PROCESSUS'),
        apiClient.get<IProcessus[]>('/processus')
      ]);
      setData(res.data || []);
      setProcesses(resProc.data || []);
    } catch (err: any) {
      setSyncError(err.message || "Erreur de liaison Master Node");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const existingLocations = useMemo(() => {
    const locs = data.map(s => s.GA_Location).filter(Boolean) as string[];
    return Array.from(new Set([...locs, "SÉANCE TEAMS", "SALLE DE PILOTAGE", "SIÈGE SOCIAL", "PLATEAU TECHNIQUE"]));
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Ouverture de session...");
    try {
      if (editingId) {
        await apiClient.patch(`/gouvernance/planning/${editingId}`, form);
      } else {
        await apiClient.post('/gouvernance/planning', form);
      }
      toast.success("Séance indexée avec succès", { id: tid });
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      toast.error("Échec du protocole d'animation", { id: tid });
    }
  };

  const handleEdit = (s: IGovernanceActivity) => {
    setEditingId(s.GA_Id);
    setForm({
      GA_Title: s.GA_Title,
      GA_Theme: s.GA_Theme || '',
      GA_DatePlanned: s.GA_DatePlanned.split('T')[0],
      GA_Deadline: s.GA_Deadline ? s.GA_Deadline.split('T')[0] : '',
      GA_Location: s.GA_Location || '',
      GA_Status: s.GA_Status,
      GA_Observations: s.GA_Observations || '',
      GA_Type: 'SEANCE_PROCESSUS',
      processIds: s.GA_Processes?.map(p => p.PR_Id) || []
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setForm({ GA_Title: '', GA_Theme: '', GA_DatePlanned: new Date().toISOString().split('T')[0], GA_Deadline: '', GA_Location: '', GA_Status: 'PLANNED', GA_Observations: '', GA_Type: 'SEANCE_PROCESSUS', processIds: [] });
    setEditingId(null);
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500">
      <Loader2 className="animate-spin mb-4" size={48} />
      <span className="italic font-black uppercase tracking-[0.5em] text-[10px]">Ouverture du Registre des Séances...</span>
    </div>
  );

  return (
    <div className="ml-72 p-12 bg-[#0B0F1A] min-h-screen text-white italic text-left font-sans selection:bg-blue-600/30">
      
      {/* SYNC ALERTE */}
      {syncError && (
        <div className="mb-10 p-8 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-between animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-6 text-red-500 text-left">
            <ShieldAlert size={32} />
            <div>
               <p className="text-[11px] font-black uppercase tracking-widest leading-none">Défaut de liaison Noyau Matrix : {syncError}</p>
               <p className="text-[9px] font-bold uppercase mt-2 opacity-60">Le pilotage en temps réel est momentanément dégradé.</p>
            </div>
          </div>
          <button onClick={fetchData} className="p-4 bg-red-500/20 rounded-2xl hover:bg-red-500 transition-all text-white border-none cursor-pointer"><RefreshCcw size={20}/></button>
        </div>
      )}

      {/* HEADER COCKPIT */}
      <header className="mb-16 flex justify-between items-end border-b border-white/5 pb-10">
        <div className="text-left">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
            Sessions <span className="text-blue-600 text-6xl block mt-2">Processus</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-6 italic">
            Surveillance Opérationnelle & Arbitrage du Temps Qualité §9.3
          </p>
        </div>
        <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs flex items-center gap-4 transition-all shadow-3xl shadow-blue-900/40 border-none cursor-pointer italic">
          <Plus size={20} /> Programmer une Séance
        </button>
      </header>

      {/* LISTE DES SÉANCES */}
      <div className="grid gap-8">
        {data.length > 0 ? data.map((s) => (
          <div key={s.GA_Id} className="bg-slate-900/50 border border-white/5 p-12 rounded-[4.5rem] hover:border-blue-500/40 transition-all group backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <div className="flex gap-12 items-center text-left">
                <div className="w-24 h-24 rounded-[2.5rem] flex flex-col items-center justify-center border border-blue-500/20 bg-blue-600/10 text-blue-500 shadow-2xl">
                  <span className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">{new Date(s.GA_DatePlanned).toLocaleString('fr', {month: 'short'})}</span>
                  <span className="text-4xl font-black leading-none italic">{new Date(s.GA_DatePlanned).getDate()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-6 mb-4">
                    <span className="bg-blue-600/20 text-blue-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/20 italic">{s.GA_Num || 'SM-S'}</span>
                    <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase italic tracking-widest"><MapPin size={14} className="text-blue-500"/> {s.GA_Location}</span>
                  </div>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-6 group-hover:text-blue-400 transition-colors leading-none">{s.GA_Title}</h2>
                  <div className="flex flex-wrap gap-3">
                    {s.GA_Processes?.length > 0 ? s.GA_Processes.map((p) => (
                      <span key={p.PR_Id} className="text-[9px] font-black text-blue-500 border border-blue-500/20 px-4 py-1.5 rounded-xl uppercase italic bg-blue-500/5 tracking-widest">
                        <Target size={12} className="inline mr-2"/> {p.PR_Code}
                      </span>
                    )) : <span className="text-[9px] text-slate-600 uppercase italic tracking-widest">Axe transversal</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button onClick={() => handleEdit(s)} className="p-5 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all border-none text-white cursor-pointer shadow-xl"><Edit3 size={20}/></button>
                <button onClick={async () => { if(confirm("Supprimer la séance?")) { await apiClient.delete(`/gouvernance/planning/${s.GA_Id}`); fetchData(); } }} className="p-5 bg-white/5 rounded-2xl hover:bg-red-600 transition-all border-none text-white cursor-pointer shadow-xl"><Trash2 size={20}/></button>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[5rem] group bg-white/2">
             <Database className="mx-auto text-slate-800 mb-8 opacity-20 group-hover:scale-110 transition-transform duration-1000" size={80} />
             <p className="text-slate-600 font-black uppercase italic tracking-[0.5em] text-sm leading-relaxed">Le registre des séances est vierge.<br/>En attente de synchronisation avec le Noyau Master.</p>
          </div>
        )}
      </div>

      {/* MODAL ANIMATION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-100 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-4xl rounded-[5rem] p-16 shadow-4xl overflow-y-auto max-h-[90vh] italic text-left relative">
            <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-10">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
                {editingId ? 'Modifier' : 'Animer'} <span className="text-blue-600">Séance</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-transparent border-none text-slate-500 hover:text-white cursor-pointer transition-colors"><X size={36} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3 md:col-span-2">
                  <label className="text-[11px] font-black uppercase text-slate-500 ml-6 italic tracking-widest">Objet de la Séance Processus</label>
                  <input required type="text" value={form.GA_Title} onChange={e => setForm({...form, GA_Title: e.target.value.toUpperCase()})} placeholder="EX: REVUE DE PERFORMANCE PR-01..." className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl outline-none focus:border-blue-500 font-black text-white italic tracking-tight" />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase text-slate-500 ml-6 italic tracking-widest">Lieu / Plateforme</label>
                  <input list="locs" type="text" value={form.GA_Location} onChange={e => setForm({...form, GA_Location: e.target.value.toUpperCase()})} placeholder="EX: SALLE DE PILOTAGE..." className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl outline-none focus:border-blue-500 font-black text-white italic" />
                  <datalist id="locs">{existingLocations.map(l => <option key={l} value={l} />)}</datalist>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase text-slate-500 ml-6 italic tracking-widest">Date Planifiée</label>
                  <input required type="date" value={form.GA_DatePlanned} onChange={e => setForm({...form, GA_DatePlanned: e.target.value})} className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl outline-none focus:border-blue-500 font-black text-blue-500 italic" />
                </div>
              </div>

              {/* SÉLECTEUR DE PROCESSUS MATRICIEL */}
              <div className="space-y-5">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-6 italic tracking-widest">Périmètre des Processus (§4.4)</label>
                {processes.length > 0 ? (
                  <div className="flex flex-wrap gap-3 p-8 bg-white/2 border border-white/10 rounded-[3rem] shadow-inner">
                    {processes.map(p => (
                      <button 
                        type="button" key={p.PR_Id}
                        onClick={() => setForm(f => ({ ...f, processIds: f.processIds.includes(p.PR_Id) ? f.processIds.filter(id => id !== p.PR_Id) : [...f.processIds, p.PR_Id] }))}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase italic border transition-all cursor-pointer ${form.processIds.includes(p.PR_Id) ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/30 scale-105' : 'bg-transparent border-white/10 text-slate-500 hover:text-white'}`}
                      >
                        {p.PR_Code}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border border-amber-500/20 bg-amber-500/5 rounded-[2.5rem] flex items-center gap-6 text-amber-500 shadow-sm animate-pulse">
                    <AlertTriangle size={24} />
                    <p className="text-[10px] font-black uppercase italic tracking-widest">Aucun axe détecté sur le Noyau Master. Indexation impossible.</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-6 italic tracking-widest">Ordre du jour & Observations</label>
                <textarea rows={4} value={form.GA_Observations} onChange={e => setForm({...form, GA_Observations: e.target.value})} className="w-full bg-white/5 border border-white/10 p-8 rounded-[3rem] outline-none focus:border-blue-500 italic font-black text-white uppercase resize-none leading-relaxed" placeholder="CONSIGNER LES POINTS CLÉS DE LA SÉANCE..." />
              </div>

              <button type="submit" className="w-full bg-blue-600 p-10 rounded-[3rem] font-black uppercase italic tracking-[0.4em] shadow-3xl flex items-center justify-center gap-6 border-none text-white cursor-pointer hover:bg-blue-500 transition-all active:scale-95 group">
                <Save size={28} className="group-hover:rotate-12 transition-transform" /> Enregistrer la Séance Processus Matrix
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}