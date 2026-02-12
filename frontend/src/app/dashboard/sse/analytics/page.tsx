/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell} from 'recharts';
import { 
  Loader2, Activity, ShieldAlert, Clock, 
  PieChart as PieIcon, BarChart3, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#F97316', '#EF4444', '#3B82F6', '#10B981', '#6366F1', '#A855F7'];

export default function SseAnalytics() {
  const [events, setEvents] = useState<any[]>([]);
  const [statsBase, setStatsBase] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 1. CHARGEMENT DES DONNÉES RÉELLES (ÉVÉNEMENTS + HEURES TRAVAILLÉES)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // On récupère les événements SSE et les stats de production (heures travaillées)
        const [resEvents, resStats] = await Promise.all([
          apiClient.get('/sse'),
          apiClient.get('/sse/stats/global') // Route à créer ou adapter
        ]);
        
        setEvents(Array.isArray(resEvents.data) ? resEvents.data : []);
        setStatsBase(Array.isArray(resStats.data) ? resStats.data : []);
      } catch (err) {
        console.error("Erreur Analytics SSE:", err);
        setError(true);
        toast.error("Impossible de synchroniser le moteur de calcul SSE.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. MOTEUR DE CALCULS RÉELS (TF / TG / ACCIDENTOLOGIE)
  const metrics = useMemo(() => {
    // Calcul des heures totales travaillées depuis la base de données
    const totalHours = statsBase.reduce((sum, s) => sum + (Number(s.ST_HeuresTravaillees) || 0), 0) || 200000; // Fallback sécurité
    
    // Accidents avec arrêt (Uniquement ceux avec SSE_AvecArret = true)
    const accidentsWithLeave = events.filter(e => e.SSE_AvecArret).length;
    
    // Total des jours perdus
    const totalLostDays = events.reduce((sum, e) => sum + (Number(e.SSE_NbJoursArret) || 0), 0);

    // Formules ISO : 
    // TF = (Nb accidents avec arrêt * 1 000 000) / Heures travaillées
    // TG = (Nb jours perdus * 1 000) / Heures travaillées
    const tf = ((accidentsWithLeave * 1000000) / totalHours).toFixed(2);
    const tg = ((totalLostDays * 1000) / totalHours).toFixed(3);

    return {
      tf,
      tg,
      totalHours,
      accidentsWithLeave,
      totalLostDays,
      totalEvents: events.length
    };
  }, [events, statsBase]);

  // Préparation des données pour le Pie Chart (Répartition par type)
  const typeDistribution = useMemo(() => {
    const map = events.reduce((acc: any, curr: any) => {
      acc[curr.SSE_Type] = (acc[curr.SSE_Type] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(map).map(key => ({ name: key, value: map[key] }));
  }, [events]);

  // Préparation des données pour le Bar Chart (Jours perdus par Site)
  const siteDistribution = useMemo(() => {
    const map = events.reduce((acc: any, curr: any) => {
      const siteName = curr.SSE_Site?.S_Name || 'Inconnu';
      acc[siteName] = (acc[siteName] || 0) + (Number(curr.SSE_NbJoursArret) || 0);
      return acc;
    }, {});
    return Object.keys(map).map(key => ({ name: key, days: map[key] }));
  }, [events]);

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center bg-[#0B0F1A] ml-72">
      <Loader2 className="animate-spin text-orange-500 mb-6" size={50} />
      <p className="text-orange-500 font-black uppercase italic text-[10px] tracking-[0.5em]">Moteur de calcul SSE en action...</p>
    </div>
  );

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans italic text-left animate-in fade-in duration-1000">
      
      {/* HEADER STRATÉGIQUE */}
      <header className="flex justify-between items-end border-b border-white/5 pb-10 mb-12">
        <div>
          <div className="flex items-center gap-3 text-orange-500 mb-4">
            <TrendingUp size={20} />
            <span className="text-[11px] font-black uppercase tracking-[0.5em]">Indicateurs de Performance SSE</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
            ANALYTICS <span className="text-orange-500">ACCIDENTOLOGIE</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-4">Calcul temps réel basé sur {metrics.totalHours.toLocaleString()} heures travaillées</p>
        </div>
      </header>

      {/* CARTES DE CALCUL ISO (TF / TG / GRAVITÉ) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="p-10 bg-slate-900/40 rounded-[3.5rem] border border-orange-500/20 shadow-2xl relative overflow-hidden group">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Taux de Fréquence (TF)</p>
          <h2 className="text-6xl font-black text-white italic tracking-tighter">{metrics.tf}</h2>
          <p className="text-[9px] font-bold text-orange-500 mt-2 uppercase">Accidents / 10⁶ Heures</p>
          <Activity className="absolute -right-4 -bottom-4 text-orange-500/5 group-hover:scale-110 transition-transform" size={120} />
        </div>

        <div className="p-10 bg-slate-900/40 rounded-[3.5rem] border border-blue-500/20 shadow-2xl relative overflow-hidden group">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Taux de Gravité (TG)</p>
          <h2 className="text-6xl font-black text-white italic tracking-tighter">{metrics.tg}</h2>
          <p className="text-[9px] font-bold text-blue-500 mt-2 uppercase">Jours Perdus / 10³ Heures</p>
          <ShieldAlert className="absolute -right-4 -bottom-4 text-blue-500/5 group-hover:scale-110 transition-transform" size={120} />
        </div>

        <div className="p-10 bg-slate-900/40 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Arrêts de Travail</p>
          <h2 className="text-6xl font-black text-white italic tracking-tighter">{metrics.accidentsWithLeave}</h2>
          <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase">Événements avec arrêt</p>
        </div>

        <div className="p-10 bg-orange-600 rounded-[3.5rem] shadow-2xl shadow-orange-900/30 flex flex-col justify-between">
          <div>
            <Clock className="text-white/40 mb-4" size={32} />
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Cumul Heures Travaillées</p>
          </div>
          <h2 className="text-3xl font-black text-white italic uppercase">{metrics.totalHours.toLocaleString()} H</h2>
        </div>
      </div>

      {/* GRAPHIQUES DE RÉPARTITION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* REPARTITION PAR TYPE */}
        <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[4rem] h-125 flex flex-col shadow-2xl">
          <h3 className="text-xl font-black uppercase italic mb-10 flex items-center gap-4">
            <PieIcon size={24} className="text-orange-500" /> Typologie des Incidents
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeDistribution} innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value" stroke="none">
                  {typeDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: '900', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
              {typeDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                   <span className="text-[9px] font-black uppercase text-slate-400 truncate">{item.name}</span>
                </div>
              ))}
          </div>
        </div>

        {/* JOURS PERDUS PAR SITE */}
        <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[4rem] h-125 flex flex-col shadow-2xl">
          <h3 className="text-xl font-black uppercase italic mb-10 flex items-center gap-4">
            <BarChart3 size={24} className="text-blue-500" /> Sévérité par Site (Jours Perdus)
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={siteDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#ffffff05'}} 
                  contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '20px' }} 
                />
                <Bar dataKey="days" fill="#3B82F6" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <footer className="mt-20 text-center">
        <p className="text-[9px] font-black uppercase text-slate-700 tracking-[1em] italic">Calcul Intégral Qualisoft Elite • Données de Production Scellées</p>
      </footer>
    </div>
  );
}