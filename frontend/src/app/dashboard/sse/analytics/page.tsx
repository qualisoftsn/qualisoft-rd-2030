/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Loader2, Activity, ShieldAlert, Clock, 
  PieChart as PieIcon, BarChart3, Info, AlertCircle
} from 'lucide-react';

const COLORS = ['#F97316', '#EF4444', '#3B82F6', '#10B981', '#6366F1'];

export default function SseAnalytics() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Paramètre de calcul (Source : Paramètres Direction)
  const HEURES_TRAVAILLEES = 250000; 

  // 1. CHARGEMENT SÉCURISÉ
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiClient.get('/sse')
      .then(res => {
        if (isMounted) {
          setData(Array.isArray(res.data) ? res.data : []);
          setError(false);
        }
      })
      .catch(() => {
        if (isMounted) setError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // 2. MÉMOÏSATION DES CALCULS (Évite les boucles de rendu)
  const metrics = useMemo(() => {
    if (!data.length) return { tf: "0.00", tg: "0.000", count: 0, days: 0 };
    
    const count = data.filter(e => e.SSE_AvecArret).length;
    const days = data.reduce((sum, e) => sum + (Number(e.SSE_NbJoursArret) || 0), 0);
    
    return {
      count,
      days,
      tf: ((count * 1000000) / HEURES_TRAVAILLEES).toFixed(2),
      tg: ((days * 1000) / HEURES_TRAVAILLEES).toFixed(3)
    };
  }, [data]);

  const typeData = useMemo(() => {
    if (!data.length) return [];
    return data.reduce((acc: any[], curr: any) => {
      const typeName = curr.SSE_Type || 'AUTRE';
      const found = acc.find(item => item.name === typeName);
      if (found) found.value++;
      else acc.push({ name: typeName, value: 1 });
      return acc;
    }, []);
  }, [data]);

  // 3. ÉTATS DE CHARGEMENT / ERREUR
  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center italic">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
      <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Analyse de l&apos;accidentologie...</p>
    </div>
  );

  if (error) return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-red-500">
      <AlertCircle size={40} className="mb-4" />
      <p className="font-black uppercase italic text-xs">Échec de synchronisation des données SSE</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 italic">
      
      <header className="flex justify-between items-end border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 text-orange-500 mb-4">
            <Activity size={18} />
            <span className="text-[11px] font-black uppercase tracking-[0.5em]">Analytics Sécurité</span>
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter text-white leading-none">
            Statistiques <span className="text-orange-500">SSE</span>
          </h1>
        </div>
      </header>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-slate-900/40 rounded-[2.5rem] border border-orange-500/20">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Taux de Fréquence (TF)</p>
          <div className="flex items-end gap-3">
            <h2 className="text-5xl font-black text-white">{metrics.tf}</h2>
            <span className="text-orange-500 text-[10px] font-bold mb-2 uppercase">/ 1M H</span>
          </div>
        </div>

        <div className="p-8 bg-slate-900/40 rounded-[2.5rem] border border-blue-500/20">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Taux de Gravité (TG)</p>
          <div className="flex items-end gap-3">
            <h2 className="text-5xl font-black text-white">{metrics.tg}</h2>
            <span className="text-blue-500 text-[10px] font-bold mb-2 uppercase">/ 1K H</span>
          </div>
        </div>

        <div className="p-8 bg-linear-to-br from-orange-600 to-orange-700 rounded-[2.5rem] shadow-xl shadow-orange-900/20">
          <Clock className="text-white/40 mb-4" size={32} />
          <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Exposition Totale</p>
          <h2 className="text-3xl font-black text-white mt-1">{HEURES_TRAVAILLEES.toLocaleString()} H</h2>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] h-100 flex flex-col">
          <h3 className="text-xs font-black uppercase italic mb-8 flex items-center gap-2 text-white">
            <PieIcon size={16} className="text-orange-500" /> Répartition par Type
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {typeData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '15px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] h-100 flex flex-col">
          <h3 className="text-xs font-black uppercase italic mb-8 flex items-center gap-2 text-white">
            <BarChart3 size={16} className="text-blue-500" /> Jours Perdus / Site
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="SSE_Lieu" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '15px' }} />
                <Bar dataKey="SSE_NbJoursArret" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}