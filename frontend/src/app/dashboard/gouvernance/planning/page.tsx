/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { Calendar, Plus, CheckCircle2, AlertCircle, Trash2, Save, X, Loader2, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface IGovernanceActivity {
  GA_Id: string;
  GA_Title: string;
  GA_Type: string;
  GA_DatePlanned: string;
  GA_Deadline: string | null;
  GA_Status: 'PLANNED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  GA_Theme: string | null;
}

export default function PerformancePlanning() {
  const [activities, setActivities] = useState<IGovernanceActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    GA_Title: '', GA_Type: 'REVUE_PROCESSUS',
    GA_DatePlanned: new Date().toISOString().split('T')[0],
    GA_Deadline: '', GA_Status: 'PLANNED', GA_Theme: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/gouvernance/planning');
      setActivities(res.data);
    } catch (e) {
      console.error("Erreur de chargement du chronogramme");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = activities.length;
    if (total === 0) return { completion: 0, late: 0 };
    const done = activities.filter(a => a.GA_Status === 'DONE').length;
    const late = activities.filter(a => a.GA_Status !== 'DONE' && a.GA_Deadline && new Date(a.GA_Deadline) < new Date()).length;
    return { completion: Math.round((done / total) * 100), late };
  }, [activities]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/gouvernance/planning', form);
      setIsModalOpen(false);
      fetchData();
      toast.success("Activité programmée");
    } catch { toast.error("Erreur système"); }
  };

  const updateStatus = async (id: string, current: string) => {
    const next = current === 'PLANNED' ? 'IN_PROGRESS' : current === 'IN_PROGRESS' ? 'DONE' : 'PLANNED';
    await apiClient.patch(`/gouvernance/planning/${id}`, { GA_Status: next });
    fetchData();
  };

  if (loading) return <div className="ml-72 h-screen flex items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase">Synchronisation Chronogramme...</div>;

  return (
    <div className="ml-72 p-10 bg-[#0B0F1A] min-h-screen text-white italic text-left">
      <header className="mb-12 border-b border-white/5 pb-10 flex justify-between items-end">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic">Chronogramme <span className="text-blue-500">Master</span></h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2 italic">Pilotage temporel du SMI RD 2030</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 px-8 py-4 rounded-3xl font-black uppercase text-[10px] flex items-center gap-3 shadow-2xl hover:bg-blue-500 transition-all">
          <Plus size={20} /> Nouvelle Activité
        </button>
      </header>

      <div className="grid grid-cols-3 gap-8 mb-16">
        <KpiCard title="Réalisation" value={`${stats.completion}%`} icon={CheckCircle2} color="text-emerald-500" />
        <KpiCard title="Retards Actifs" value={stats.late} icon={AlertCircle} color="text-red-500" />
        <KpiCard title="Total Instances" value={activities.length} icon={Target} color="text-blue-500" />
      </div>

      <div className="space-y-6">
        {activities.map((act) => (
          <div key={act.GA_Id} className="bg-slate-900/40 border border-white/5 p-8 rounded-[3.5rem] flex items-center justify-between group hover:border-blue-500/30 transition-all">
            <div className="flex gap-10 items-center">
              <div className="w-20 h-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex flex-col items-center justify-center text-blue-500 font-black uppercase">
                <span className="text-[10px]">{new Date(act.GA_DatePlanned).toLocaleString('fr', {month: 'short'})}</span>
                <span className="text-3xl">{new Date(act.GA_DatePlanned).getDate()}</span>
              </div>
              <div>
                <span className="text-[8px] font-black uppercase text-slate-500 border border-white/10 px-3 py-1 rounded-full">{act.GA_Type}</span>
                <h4 className="text-3xl font-black uppercase italic tracking-tighter mt-2">{act.GA_Title}</h4>
              </div>
            </div>
            <div className="flex items-center gap-10">
              <button onClick={() => updateStatus(act.GA_Id, act.GA_Status)} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase border transition-all ${act.GA_Status === 'DONE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'border-white/10 text-slate-400 hover:text-white'}`}>
                {act.GA_Status}
              </button>
              <button onClick={async () => { if(confirm("Supprimer?")) { await apiClient.delete(`/gouvernance/planning/${act.GA_Id}`); fetchData(); } }} className="opacity-0 group-hover:opacity-100 p-3 bg-white/5 rounded-xl hover:bg-red-600 transition-all"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL PROGRAMMATION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 italic">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-xl rounded-[4rem] p-12 shadow-3xl text-left">
             <div className="flex justify-between mb-10 items-center">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Planifier <span className="text-blue-500">SMI</span></h2>
                <button onClick={() => setIsModalOpen(false)}><X size={30}/></button>
             </div>
             <form onSubmit={handleSave} className="space-y-6">
                <input required placeholder="OBJET DE L'ACTIVITÉ" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-black uppercase outline-none focus:border-blue-600" onChange={e => setForm({...form, GA_Title: e.target.value})} />
                <div className="grid grid-cols-2 gap-6">
                   <select className="bg-white/5 border border-white/10 p-5 rounded-2xl font-black uppercase outline-none" onChange={e => setForm({...form, GA_Type: e.target.value})}>
                      <option value="REVUE_PROCESSUS">Revue Processus</option>
                      <option value="REVUE_DIRECTION">Revue Direction</option>
                      <option value="AUDIT_INTERNE">Audit Interne</option>
                   </select>
                   <input type="date" className="bg-white/5 border border-white/10 p-5 rounded-2xl font-black uppercase outline-none" onChange={e => setForm({...form, GA_DatePlanned: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-blue-600 p-6 rounded-3xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl italic">Valider le Chronogramme</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] text-left relative overflow-hidden group">
      <Icon className={`absolute -right-4 -bottom-4 opacity-5 ${color}`} size={140} />
      <p className="text-[10px] font-black uppercase text-slate-500 mb-2 italic tracking-widest">{title}</p>
      <span className={`text-5xl font-black italic tracking-tighter ${color}`}>{value}</span>
    </div>
  );
}