/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { Calendar, Plus, CheckCircle2, AlertCircle, Trash2, Save, X, Loader2, Target, RefreshCcw, ShieldCheck } from 'lucide-react';
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

/**
 * 📅 CHRONOGRAMME MASTER SMI
 * Rôle : Pilotage temporel et ordonnancement des instances de gouvernance §9.3.
 */
export default function PerformancePlanning() {
  const [activities, setActivities] = useState<IGovernanceActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    GA_Title: '', GA_Type: 'REVUE_PROCESSUS',
    GA_DatePlanned: new Date().toISOString().split('T')[0],
    GA_Deadline: '', GA_Status: 'PLANNED' as any, GA_Theme: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/gouvernance/planning');
      setActivities(res.data);
    } catch (e) {
      toast.error("Rupture de liaison Chronogramme");
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
    const tid = toast.loading("Indexation temporelle...");
    try {
      await apiClient.post('/gouvernance/planning', form);
      setIsModalOpen(false);
      fetchData();
      toast.success("Activité Master programmée", { id: tid });
    } catch { toast.error("Échec du scellage", { id: tid }); }
  };

  const updateStatus = async (id: string, current: string) => {
    const next = current === 'PLANNED' ? 'IN_PROGRESS' : current === 'IN_PROGRESS' ? 'DONE' : 'PLANNED';
    try {
      await apiClient.patch(`/gouvernance/planning/${id}`, { GA_Status: next });
      fetchData();
    } catch { toast.error("Erreur d'état"); }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500">
      <Loader2 className="animate-spin mb-4" size={40} />
      <span className="italic font-black uppercase tracking-[0.5em] text-[10px]">Synchronisation Master Chronos...</span>
    </div>
  );

  return (
    <div className="ml-72 p-10 bg-[#0B0F1A] min-h-screen text-white italic text-left selection:bg-blue-600/30">
      
      {/* HEADER COCKPIT */}
      <header className="mb-12 border-b border-white/5 pb-10 flex justify-between items-end animate-in fade-in duration-700">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Chronogramme <span className="text-blue-500 text-6xl">Master</span></h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4 italic">Pilotage temporel du SMI RD 2030 • ISO 9001 §9.3</p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchData} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:text-blue-500 transition-all border-none text-white cursor-pointer"><RefreshCcw size={18}/></button>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 px-10 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 shadow-2xl hover:bg-blue-500 transition-all border-none text-white italic cursor-pointer">
            <Plus size={20} /> Nouvelle Activité
          </button>
        </div>
      </header>

      {/* DASHBOARD INDICATORS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
        <KpiCard title="Taux de Réalisation" value={`${stats.completion}%`} icon={CheckCircle2} color="text-emerald-500" />
        <KpiCard title="Retards Actifs" value={stats.late} icon={AlertCircle} color="text-red-500" />
        <KpiCard title="Instances Programmées" value={activities.length} icon={Target} color="text-blue-500" />
      </div>

      

      {/* LISTE CHRONOLOGIQUE */}
      <div className="space-y-8">
        {activities.length > 0 ? activities.map((act) => (
          <div key={act.GA_Id} className="bg-slate-900/40 border border-white/5 p-10 rounded-[4rem] flex items-center justify-between group hover:border-blue-500/30 transition-all backdrop-blur-sm animate-in fade-in slide-in-from-left duration-500">
            <div className="flex gap-12 items-center text-left">
              <div className="w-24 h-24 rounded-4xl bg-blue-600/10 border border-blue-500/20 flex flex-col items-center justify-center text-blue-500 font-black uppercase italic shadow-2xl">
                <span className="text-[11px] tracking-widest leading-none mb-1">{new Date(act.GA_DatePlanned).toLocaleString('fr', {month: 'short'})}</span>
                <span className="text-4xl leading-none">{new Date(act.GA_DatePlanned).getDate()}</span>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-slate-500 border border-white/10 px-4 py-1.5 rounded-full italic tracking-widest">{act.GA_Type.replace('_', ' ')}</span>
                <h4 className="text-3xl font-black uppercase italic tracking-tighter mt-4 group-hover:text-blue-400 transition-colors leading-none">{act.GA_Title}</h4>
              </div>
            </div>
            <div className="flex items-center gap-10">
              <button 
                onClick={() => updateStatus(act.GA_Id, act.GA_Status)} 
                className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase border transition-all italic border-none cursor-pointer ${act.GA_Status === 'DONE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-white/5 text-slate-400 hover:text-white'}`}
              >
                {act.GA_Status.replace('_', ' ')}
              </button>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button onClick={async () => { if(confirm("Supprimer l'instance?")) { await apiClient.delete(`/gouvernance/planning/${act.GA_Id}`); fetchData(); } }} className="p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all border-none text-white cursor-pointer"><Trash2 size={18}/></button>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[4rem] group">
              <Calendar className="mx-auto text-slate-800 mb-8 opacity-20 group-hover:scale-110 transition-transform duration-700" size={80} />
              <p className="text-slate-600 font-black uppercase italic tracking-[0.5em] text-sm">Chronogramme Vierge : Noyau Master en attente d&apos;indexation.</p>
          </div>
        )}
      </div>

      {/* MODAL PROGRAMMATION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-100 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-2xl rounded-[4rem] p-16 shadow-4xl text-left italic">
             <div className="flex justify-between mb-12 items-center border-b border-white/5 pb-8">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Planifier <span className="text-blue-500">SMI</span></h2>
                <button onClick={() => setIsModalOpen(false)} className="bg-transparent border-none text-slate-500 hover:text-white cursor-pointer transition-colors"><X size={36}/></button>
             </div>
             <form onSubmit={handleSave} className="space-y-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-6 tracking-widest italic">Objet de l&apos;activité stratégique</label>
                  <input required placeholder="EX: REVUE DE DIRECTION ANNUELLE..." className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl font-black uppercase outline-none focus:border-blue-600 italic text-white" onChange={e => setForm({...form, GA_Title: e.target.value.toUpperCase()})} />
                </div>
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-3 text-left">
                     <label className="text-[10px] font-black uppercase text-slate-500 ml-6 tracking-widest italic">Typologie d&apos;Instance</label>
                     <select className="w-full bg-[#0F172A] border border-white/10 p-6 rounded-3xl font-black uppercase outline-none focus:border-blue-600 italic text-white appearance-none cursor-pointer" onChange={e => setForm({...form, GA_Type: e.target.value})}>
                        <option value="REVUE_PROCESSUS">Revue Processus</option>
                        <option value="REVUE_DIRECTION">Revue Direction</option>
                        <option value="AUDIT_INTERNE">Audit Interne</option>
                        <option value="SÉANCE_GPEC">Séance GPEC</option>
                     </select>
                   </div>
                   <div className="space-y-3 text-left">
                     <label className="text-[10px] font-black uppercase text-slate-500 ml-6 tracking-widest italic">Date Prévisionnelle</label>
                     <input type="date" className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl font-black uppercase outline-none focus:border-blue-600 text-blue-500" onChange={e => setForm({...form, GA_DatePlanned: e.target.value})} />
                   </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 p-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] hover:bg-blue-500 transition-all shadow-3xl italic border-none text-white cursor-pointer group active:scale-95">
                  <ShieldCheck size={24} className="inline mr-3 group-hover:rotate-12 transition-transform" /> Valider le Chronogramme Matrix
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-10 rounded-[3.5rem] text-left relative overflow-hidden group shadow-2xl backdrop-blur-sm">
      <Icon className={`absolute -right-6 -bottom-6 opacity-5 transition-transform duration-1000 group-hover:scale-125 ${color}`} size={180} />
      <p className="text-[11px] font-black uppercase text-slate-500 mb-4 italic tracking-widest leading-none">{title}</p>
      <span className={`text-6xl font-black italic tracking-tighter leading-none ${color}`}>{value}</span>
    </div>
  );
}