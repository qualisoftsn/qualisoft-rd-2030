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

// --- INTERFACES STRICTES (SANS ANY) ---
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

  // 1️⃣ RÉCUPÉRATION SÉCURISÉE (CATCH TYPÉ)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setSyncError(null);
      
      // Tentative de récupération parallèle
      const [res, resProc] = await Promise.all([
        apiClient.get<IGovernanceActivity[]>('/gouvernance/planning?type=SEANCE_PROCESSUS'),
        apiClient.get<IProcessus[]>('/processus')
      ]);

      setData(res.data || []);
      setProcesses(resProc.data || []);

    } catch (err: unknown) {
      // Gestion propre de l'erreur sans warning rouge
      let msg = "Erreur de liaison réseau";
      if (err instanceof Error) msg = err.message;
      setSyncError(msg);
      console.error("Qualisoft Sync Crash:", msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 2️⃣ GESTION DES LIEUX DYNAMIQUE
  const existingLocations = useMemo(() => {
    const locs = data.map(s => s.GA_Location).filter(Boolean) as string[];
    return Array.from(new Set([...locs, "Teams", "Salle de Pilotage", "Siège Social"]));
  }, [data]);

  // 3️⃣ ACTIONS CRUD
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.patch(`/gouvernance/planning/${editingId}`, form);
      } else {
        await apiClient.post('/gouvernance/planning', form);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de sauvegarde";
      alert(`PROTOCOLE ÉCHOUÉ : ${msg}`);
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
    setForm({ GA_Title: '', GA_Theme: '', GA_DatePlanned: '', GA_Deadline: '', GA_Location: '', GA_Status: 'PLANNED', GA_Observations: '', GA_Type: 'SEANCE_PROCESSUS', processIds: [] });
    setEditingId(null);
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500">
      <Loader2 className="animate-spin mb-4" size={40} />
      <span className="italic font-black uppercase tracking-[0.5em] text-[10px]">Synchronisation Qualisoft Elite...</span>
    </div>
  );

  return (
    <div className="ml-72 p-10 bg-[#0B0F1A] min-h-screen text-white italic text-left font-sans">
      
      {/* ALERTE DE SYNCHRONISATION (VALUE ADDED) */}
      {syncError && (
        <div className="mb-10 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-4 text-red-500">
            <ShieldAlert size={24} />
            <p className="text-[10px] font-black uppercase tracking-widest leading-none">
              Défaut de liaison Noyau : {syncError}
            </p>
          </div>
          <button onClick={fetchData} className="p-3 bg-red-500/20 rounded-xl hover:bg-red-500 transition-all text-white"><RefreshCcw size={16}/></button>
        </div>
      )}

      <header className="mb-12 flex justify-between items-end border-b border-white/5 pb-10">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
            Sessions <span className="text-blue-600 text-6xl">Processus</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4 italic">
            Surveillance Opérationnelle & Pilotage du Temps Qualité
          </p>
        </div>
        <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-3 transition-all shadow-2xl shadow-blue-900/40">
          <Plus size={18} /> Programmer Séance
        </button>
      </header>

      {/* LISTE DES SÉANCES */}
      <div className="grid gap-6">
        {data.length > 0 ? data.map((s) => (
          <div key={s.GA_Id} className="bg-slate-900/50 border border-white/5 p-10 rounded-[3.5rem] hover:border-blue-500/40 transition-all group">
            <div className="flex justify-between items-start">
              <div className="flex gap-10 items-center">
                <div className="w-20 h-20 rounded-3xl flex flex-col items-center justify-center border border-blue-500/20 bg-blue-600/10 text-blue-500">
                  <span className="text-[10px] font-black uppercase">{new Date(s.GA_DatePlanned).toLocaleString('fr', {month: 'short'})}</span>
                  <span className="text-3xl font-black leading-none">{new Date(s.GA_DatePlanned).getDate()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="bg-blue-600/20 text-blue-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{s.GA_Num || 'SM-S'}</span>
                    <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase italic"><MapPin size={12}/> {s.GA_Location}</span>
                  </div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">{s.GA_Title}</h2>
                  <div className="flex flex-wrap gap-2">
                    {s.GA_Processes?.length > 0 ? s.GA_Processes.map((p) => (
                      <span key={p.PR_Id} className="text-[8px] font-black text-blue-500 border border-blue-500/20 px-3 py-1 rounded-lg uppercase italic bg-blue-500/5">
                        <Target size={10} className="inline mr-1"/> {p.PR_Code}
                      </span>
                    )) : <span className="text-[8px] text-slate-600 uppercase italic">Aucun processus lié</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => handleEdit(s)} className="p-4 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600">
                <Edit3 size={18}/></button>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[4rem]">
             <Database className="mx-auto text-slate-800 mb-6" size={60} />
             <p className="text-slate-600 font-black uppercase italic tracking-widest text-sm">Aucune donnée synchronisée avec le Noyau.</p>
          </div>
        )}
      </div>

      {/* MODAL DE SAISIE AVEC PROCESSUS DÉBLOQUÉS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-4xl rounded-[4.5rem] p-12 shadow-3xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">{editingId ? 'Modifier' : 'Animer'} <span className="text-blue-600">Séance</span></h2>
              <button onClick={() => setIsModalOpen(false)}><X size={32} className="text-slate-500" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">Titre de la Séance</label>
                  <input required type="text" value={form.GA_Title} onChange={e => setForm({...form, GA_Title: e.target.value})} className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl outline-none focus:border-blue-500 font-bold" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">Lieu (Saisie libre)</label>
                  <input list="locs" type="text" value={form.GA_Location} onChange={e => setForm({...form, GA_Location: e.target.value})} className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl outline-none font-bold" />
                  <datalist id="locs">{existingLocations.map(l => <option key={l} value={l} />)}</datalist>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">Date Prévue</label>
                  <input required type="date" value={form.GA_DatePlanned} onChange={e => setForm({...form, GA_DatePlanned: e.target.value})} className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl outline-none font-bold text-blue-500" />
                </div>
              </div>

              {/* LISTE DES PROCESSUS (VÉRIFIEZ L'API /PROCESSUS) */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">Processus Impactés</label>
                {processes.length > 0 ? (
                  <div className="flex flex-wrap gap-3 p-6 bg-white/2 border border-white/5 rounded-[2.5rem]">
                    {processes.map(p => (
                      <button 
                        type="button" key={p.PR_Id}
                        onClick={() => setForm(f => ({ ...f, processIds: f.processIds.includes(p.PR_Id) ? f.processIds.filter(id => id !== p.PR_Id) : [...f.processIds, p.PR_Id] }))}
                        className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase italic border transition-all ${form.processIds.includes(p.PR_Id) ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-transparent border-white/10 text-slate-500 hover:text-white'}`}
                      >
                        {p.PR_Code}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 border border-amber-500/20 bg-amber-500/5 rounded-3xl flex items-center gap-4 text-amber-500">
                    <AlertTriangle size={20} />
                    <p className="text-[9px] font-black uppercase italic">Aucun processus détecté sur le Noyau. Vérifiez l&apos;onglet Cartographie.</p>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full bg-blue-600 p-8 rounded-[2.5rem] font-black uppercase italic tracking-[0.2em] shadow-3xl flex items-center justify-center gap-4">
                <Save size={24}/> Enregistrer la Séance Processus
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}