/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Scale, AlertCircle, Loader2, Plus, Edit3, Trash2, 
  CheckCircle2, Clock, ShieldAlert, Save, X, Info, Filter, Link2
} from 'lucide-react';

// --- TYPES ALIGNÉS SUR LE SCHÉMA PRISMA ---
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

export default function CompliancePage() {
  const [data, setData] = useState<GovernanceActivity[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // État du formulaire
  const [form, setForm] = useState({
    GA_Title: '',
    GA_DatePlanned: new Date().toISOString().split('T')[0],
    GA_Deadline: '',
    GA_Status: 'PLANNED',
    GA_Observations: '',
    GA_Type: 'VEILLE_REGLEMENTAIRE',
    processId: ''
  });

  // 1️⃣ CHARGEMENT DES DONNÉES SÉCURISÉ
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
      console.error("Erreur de synchronisation du noyau de conformité");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 2️⃣ ACTIONS MÉTIER (CRUD)
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
    } catch (e) { alert("Erreur d'enregistrement"); }
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

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette exigence de la veille ?")) return;
    await apiClient.delete(`/gouvernance/planning/${id}`);
    fetchData();
  };

  const resetForm = () => {
    setForm({ GA_Title: '', GA_DatePlanned: '', GA_Deadline: '', GA_Status: 'PLANNED', GA_Observations: '', GA_Type: 'VEILLE_REGLEMENTAIRE', processId: '' });
    setEditingId(null);
  };

  // 3️⃣ CALCULS DE RISQUE (VALUE ADDED)
  const stats = {
    total: data.length,
    critical: data.filter(v => v.GA_Status !== 'DONE' && v.GA_Deadline && new Date(v.GA_Deadline) < new Date()).length,
    compliant: data.filter(v => v.GA_Status === 'DONE').length
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500">
      <Loader2 className="animate-spin mb-4" size={40} />
      <span className="italic font-black uppercase tracking-[0.5em] text-[10px]">Analyse de conformité légale...</span>
    </div>
  );

  return (
    <div className="ml-72 p-10 bg-[#0B0F1A] min-h-screen text-white italic text-left font-sans relative">
      
      {/* HEADER STRATÉGIQUE */}
      <header className="mb-12 flex justify-between items-end border-b border-white/5 pb-10">
        <div>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
            Veille <span className="text-blue-500">Légale</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4 italic">
            Maîtrise des exigences & Surveillance des risques de non-conformité
          </p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-3 transition-all shadow-2xl shadow-blue-900/20"
        >
          <Plus size={18} /> Nouvelle Exigence
        </button>
      </header>

      {/* TABLEAU DE BORD DE CONFORMITÉ (VALUE ADDED) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] text-left">
          <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2 italic">Exigences Surveillées</p>
          <p className="text-5xl font-black italic tracking-tighter">{stats.total}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[3rem] text-left">
          <p className="text-[9px] font-black uppercase text-red-500 tracking-widest mb-2 italic">Écarts / Retards</p>
          <p className="text-5xl font-black italic tracking-tighter text-red-500">{stats.critical}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[3rem] text-left">
          <p className="text-[9px] font-black uppercase text-emerald-500 tracking-widest mb-2 italic">Taux de Conformité</p>
          <p className="text-5xl font-black italic tracking-tighter text-emerald-500">
            {stats.total > 0 ? ((stats.compliant / stats.total) * 100).toFixed(0) : 0}%
          </p>
        </div>
      </div>

      {/* LISTE DYNAMIQUE DES EXIGENCES */}
      <div className="space-y-6">
        {data.map((v) => {
          const isLate = v.GA_Status !== 'DONE' && v.GA_Deadline && new Date(v.GA_Deadline) < new Date();
          return (
            <div key={v.GA_Id} className={`bg-slate-900/40 border p-10 rounded-[4rem] transition-all flex items-center justify-between group ${isLate ? 'border-red-500/30 bg-red-500/5' : 'border-white/5 hover:border-blue-500/30'}`}>
              <div className="flex gap-10 items-center">
                <div className={`w-20 h-20 rounded-3xl flex flex-col items-center justify-center border ${isLate ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-blue-600/10 border-blue-500/20 text-blue-500'}`}>
                  <span className="text-[10px] font-black uppercase">{new Date(v.GA_DatePlanned).toLocaleString('fr', {month: 'short'})}</span>
                  <span className="text-3xl font-black leading-none">{new Date(v.GA_DatePlanned).getDate()}</span>
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-4">{v.GA_Title}</h3>
                  <div className="flex gap-4">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase text-slate-400 flex items-center gap-2 italic">
                      <Link2 size={12} className="text-blue-500"/> {v.GA_Processes?.[0]?.PR_Code || 'TRANSVERSE'}
                    </span>
                    <span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase italic border ${v.GA_Status === 'DONE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-600/10 text-blue-500 border-blue-500/20'}`}>
                      {v.GA_Status}
                    </span>
                  </div>
                  {v.GA_Observations && (
                    <p className="mt-4 text-[11px] text-slate-500 font-bold italic uppercase max-w-xl line-clamp-2">
                      <Info size={12} className="inline mr-2 text-slate-600"/> {v.GA_Observations}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-10">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-600 uppercase italic mb-2 tracking-widest">Échéance</p>
                  <div className={`flex items-center gap-3 font-black italic ${isLate ? 'text-red-500' : 'text-slate-300'}`}>
                    {isLate && <ShieldAlert size={18} className="animate-pulse" />}
                    <span className="text-xl">{v.GA_Deadline ? new Date(v.GA_Deadline).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleEdit(v)} className="p-4 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all shadow-xl"><Edit3 size={18}/></button>
                  <button onClick={() => handleDelete(v.GA_Id)} className="p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all shadow-xl"><Trash2 size={18}/></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE SAISIE / ÉDITION (VALUE ADDED) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-3xl rounded-[4rem] p-12 shadow-3xl">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                {editingId ? 'Modifier' : 'Déclarer'} une <span className="text-blue-500">Exigence</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)}><X size={32} className="text-slate-500 hover:text-white" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic">Libellé de l&apos;exigence</label>
                  <input 
                    required type="text" value={form.GA_Title} 
                    onChange={e => setForm({...form, GA_Title: e.target.value})}
                    placeholder="Ex: Mise à jour Veille Convention Collective..."
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 italic font-bold"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic text-left">Processus Impacté</label>
                  <select 
                    value={form.processId} onChange={e => setForm({...form, processId: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 italic font-bold appearance-none"
                  >
                    <option value="">Sélectionner un processus</option>
                    {processes.map(p => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic">Statut Actuel</label>
                  <select 
                    value={form.GA_Status} onChange={e => setForm({...form, GA_Status: e.target.value as any})}
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 italic font-bold"
                  >
                    <option value="PLANNED">Planifié</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="DONE">Conforme / Terminé</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic">Date de Veille</label>
                  <input 
                    type="date" value={form.GA_DatePlanned} onChange={e => setForm({...form, GA_DatePlanned: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic">Échéance Limite</label>
                  <input 
                    type="date" value={form.GA_Deadline} onChange={e => setForm({...form, GA_Deadline: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-red-500 font-bold text-red-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic">Observations & Preuves de conformité</label>
                <textarea 
                  rows={3} value={form.GA_Observations} onChange={e => setForm({...form, GA_Observations: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 italic font-bold"
                  placeholder="Détails sur l'exigence ou lien vers le texte de loi..."
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 p-6 rounded-3xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3">
                <Save size={20}/> Enregistrer l&apos;exigence légale
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}