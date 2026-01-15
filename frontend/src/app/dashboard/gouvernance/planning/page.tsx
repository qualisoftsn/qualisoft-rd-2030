/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Calendar, CheckCircle2, Clock, AlertTriangle, 
  BarChart3, Plus, Filter, ArrowUpRight
} from 'lucide-react';

export default function PerformancePlanning() {
  const [activities, setActivities] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // On charge les données et la performance en parallèle
    Promise.all([
      apiClient.get('/governance/planning'),
      apiClient.get('/governance/performance')
    ]).then(([resPlan, resPerf]) => {
      setActivities(resPlan.data);
      setStats(resPerf.data.stats);
    });
  }, []);

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans text-left">
      
      {/* 1. KPI COCKPIT : PERFORMANCE DU CHRONOGRAMME */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        <KpiMini title="Taux Réalisation" value={`${stats?.completionRate || 0}%`} color="blue" />
        <KpiMini title="Ponctualité" value={`${stats?.punctualityRate || 0}%`} color="emerald" />
        <KpiMini title="En Retard" value={stats?.late || 0} color="red" />
        <KpiMini title="Total Activités" value={stats?.total || 0} color="slate" />
      </div>

      <div className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-10 shadow-2xl">
        <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
          <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
             <Calendar className="text-blue-500" /> Chronogramme Dynamique
          </h2>
          <div className="flex gap-4">
            <button className="p-4 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all shadow-xl"><Plus size={20}/></button>
          </div>
        </div>

        {/* LISTE DYNAMIQUE DES ACTIVITÉS */}
        <div className="space-y-4">
          {activities.map((act, i) => (
            <div key={i} className="flex items-center justify-between p-6 bg-white/2 border border-white/5 rounded-4xl hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-6">
                <div className="text-center min-w-15">
                   <span className="text-[8px] font-black text-slate-500 uppercase">{act.GA_Num}</span>
                   <p className="text-xl font-black text-white">{new Date(act.GA_DatePlanned).getDate()}</p>
                   <p className="text-[8px] font-black text-blue-500 uppercase">{new Date(act.GA_DatePlanned).toLocaleString('fr', {month: 'short'})}</p>
                </div>
                <div>
                   <span className="text-[7px] font-black uppercase bg-blue-600/10 text-blue-500 px-2 py-0.5 rounded-full border border-blue-500/20">{act.GA_Type}</span>
                   <h4 className="text-lg font-black uppercase italic text-white tracking-tighter mt-1">{act.GA_Title}</h4>
                   <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 italic">
                     {act.GA_Theme ? `Thème : ${act.GA_Theme}` : `Analyse IP : ${act.GA_AnalysisPeriod}`}
                   </p>
                </div>
              </div>

              <div className="flex items-center gap-10">
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-600 uppercase">Limite IP / Tard</p>
                  <p className="text-[10px] font-bold text-amber-500/50 italic">
                    {act.GA_IpDate ? new Date(act.GA_IpDate).toLocaleDateString() : (act.GA_Deadline ? new Date(act.GA_Deadline).toLocaleDateString() : '---')}
                  </p>
                </div>
                <div className={`px-4 py-1.5 rounded-xl border text-[8px] font-black uppercase italic ${
                  act.GA_Status === 'DONE' ? 'border-emerald-500/20 text-emerald-500' : 'border-blue-500/20 text-blue-500'
                }`}>
                  {act.GA_Status}
                </div>
                <button className="text-slate-500 hover:text-white transition-all"><ArrowUpRight size={20}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiMini({ title, value, color }: any) {
  const colors: any = { blue: 'text-blue-500 bg-blue-500/5', emerald: 'text-emerald-500 bg-emerald-500/5', red: 'text-red-500 bg-red-500/5', slate: 'text-slate-500 bg-white/5' };
  return (
    <div className={`${colors[color]} border border-white/5 p-6 rounded-4xl shadow-xl text-center`}>
      <p className="text-[9px] font-black uppercase tracking-widest mb-2 italic opacity-60">{title}</p>
      <p className="text-3xl font-black italic">{value}</p>
    </div>
  );
}