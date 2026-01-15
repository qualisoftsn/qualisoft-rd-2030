/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldAlert, CheckCircle2, Clock, Users, 
  Target, Loader2, User, Printer, Plus 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PAQPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/paq/dashboard');
      setData(res.data);
    } catch (error) {
      console.error("Erreur Dashboard PAQ:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#0B0F1A] ml-72">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
      <p className="text-blue-500 font-black uppercase italic text-[10px] tracking-widest">Chargement du SMI...</p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-8 ml-72 text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER AVEC BOUTONS D'ACTION */}
        <header className="flex justify-between items-end border-b border-white/5 pb-8">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
              PLAN D&apos;ACTIONS <span className="text-blue-500">QUALITÉ</span>
            </h1>
            <p className="text-blue-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-3 italic">
              Pilotage de la Performance & Amélioration Continue
            </p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => router.push('/dashboard/paq/report')}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl border border-white/10 hover:bg-white/5 text-slate-400 font-black uppercase italic text-[10px] transition-all"
            >
              <Printer size={16} /> Rapport PDF
            </button>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] transition-all shadow-lg shadow-blue-900/20">
              <Plus size={18} /> Nouvelle Action
            </button>
          </div>
        </header>

        {/* COMPTEURS */}
        <div className="grid grid-cols-4 gap-6">
          <StatCard title="Total Actions" value={data?.total || 0} icon={Target} color="blue" />
          <StatCard title="En Retard" value={data?.enRetard?.length || 0} icon={ShieldAlert} color="red" />
          <StatCard title="En Attente" value={data?.aValider?.length || 0} icon={Clock} color="orange" />
          <StatCard title="Clôturées" value={data?.cloturees?.length || 0} icon={CheckCircle2} color="emerald" />
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* ACTIONS PRIORITAIRES */}
          <div className="col-span-2 bg-slate-900/30 border border-white/5 p-10 rounded-[40px]">
            <h3 className="text-lg font-black uppercase italic mb-8 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-red-500 rounded-full"></span> 
              Urgences & Retards
            </h3>
            <div className="space-y-4">
              {data?.enRetard?.length > 0 ? (
                data.enRetard.map((action: any) => (
                  <ActionRow key={action.ACT_Id} action={action} />
                ))
              ) : (
                <div className="text-center py-12 border border-dashed border-white/5 rounded-3xl text-slate-500 uppercase italic font-bold text-[10px]">
                  Aucun retard critique détecté
                </div>
              )}
            </div>
          </div>

          {/* CHARGE PAR PILOTE */}
          <div className="bg-slate-900/60 border border-white/5 rounded-[40px] p-10 shadow-2xl">
            <h3 className="text-lg font-black uppercase italic mb-8 text-blue-400 flex items-center gap-2">
              <Users size={20} /> Charge Pilotes
            </h3>
            <div className="space-y-7">
              {data?.chargeTravail?.map(([name, count]: any) => (
                <div key={name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-slate-300 uppercase italic">{name}</span>
                    <span className="text-[10px] font-black text-blue-500">{count} act.</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${(count / (data.total || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  };
  return (
    <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[35px] hover:scale-[1.02] transition-all">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-4xl font-black italic tracking-tighter">{value}</p>
    </div>
  );
}

function ActionRow({ action }: any) {
  return (
    <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-transparent hover:border-white/5 transition-all cursor-pointer">
      <div className="flex gap-5 items-center">
        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center font-black text-red-500 italic border border-red-500/20 text-[10px]">!</div>
        <div>
          <p className="text-sm font-black uppercase italic">{action.ACT_Title}</p>
          <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase italic mt-1">
            <User size={10} /> {action.ACT_Responsable?.U_LastName || 'N/A'}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black text-red-500 italic uppercase">{new Date(action.ACT_Deadline).toLocaleDateString()}</p>
        <p className="text-[8px] font-black uppercase text-slate-500 mt-1">{action.ACT_Priority}</p>
      </div>
    </div>
  );
}