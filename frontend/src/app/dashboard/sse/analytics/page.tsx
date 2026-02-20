/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * NOM ABSOLU : src/app/dashboard/sse/analytics/page.tsx
 * FONCTION : Moteur de calcul statistique de l'accidentologie.
 * LOGIQUE : Calcul des taux TF et TG (§9.1 ISO 45001).
 * FORMULES : 
 * - TF = (Nombre d'accidents avec arrêt / Heures travaillées) * 1 000 000
 * - TG = (Nombre de jours perdus / Heures travaillées) * 1 000
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell} from 'recharts';
import { 
  Loader2, Activity, ShieldAlert, Clock, 
  PieChart as PieIcon, BarChart3, TrendingUp, ChevronLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const COLORS = ['#F97316', '#EF4444', '#3B82F6', '#10B981', '#6366F1', '#A855F7'];

export default function SseAnalytics() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [statsBase, setStatsBase] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * 📡 SYNCHRONISATION DU MOTEUR ANALYTIQUE
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resEvents, resStats] = await Promise.all([
          apiClient.get('/sse'),
          apiClient.get('/sse/stats/global')
        ]);
        setEvents(Array.isArray(resEvents.data) ? resEvents.data : []);
        setStatsBase(Array.isArray(resStats.data) ? resStats.data : []);
      } catch (err) {
        toast.error("Échec de synchronisation du moteur analytique.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /**
   * 🧮 MOTEUR DE CALCULS SÉCURITÉ (§SMI)
   */
  const metrics = useMemo(() => {
    const totalHours = statsBase.reduce((sum, s) => sum + (Number(s.ST_HeuresTravaillees) || 0), 0) || 200000;
    const accidentsWithLeave = events.filter(e => e.SSE_AvecArret).length;
    const totalLostDays = events.reduce((sum, e) => sum + (Number(e.SSE_NbJoursArret) || 0), 0);

    // Calcul scellé du Taux de Fréquence et de Gravité
    const tf = ((accidentsWithLeave * 1000000) / totalHours).toFixed(2);
    const tg = ((totalLostDays * 1000) / totalHours).toFixed(3);

    return { tf, tg, totalHours, accidentsWithLeave, totalLostDays, totalEvents: events.length };
  }, [events, statsBase]);

  // Distribution par type d'incident (Pie Chart)
  const typeDistribution = useMemo(() => {
    const map = events.reduce((acc: any, curr: any) => {
      acc[curr.SSE_Type] = (acc[curr.SSE_Type] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(map).map(key => ({ name: key.replace(/_/g, ' '), value: map[key] }));
  }, [events]);

  // Sévérité par implantation (Bar Chart)
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
      <Loader2 className="animate-spin text-orange-500 mb-8" size={60} />
      <p className="text-orange-500 font-black uppercase italic text-[11px] tracking-[0.6em] animate-pulse">Extraction de l&apos;Intelligence Accidentologie...</p>
    </div>
  );

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans italic text-left selection:bg-orange-500/30 overflow-x-hidden">
      
      {/* HEADER ANALYTIQUE */}
      <header className="flex justify-between items-end border-b border-white/5 pb-10 mb-12">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-3 text-slate-500 hover:text-orange-500 transition-colors font-black uppercase italic text-[10px] mb-8 border-none bg-transparent cursor-pointer">
            <ChevronLeft size={16} /> Retour au Hub SSE
          </button>
          <div className="flex items-center gap-4 text-orange-500 mb-4 font-black uppercase tracking-[0.5em] text-[11px]">
            <TrendingUp size={22} /> MOTEUR DE CALCULS ISO 45001
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none italic">
            ANALYTICS <span className="text-orange-500">ACCIDENTOLOGIE</span>
          </h1>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] mt-6 italic">Données consolidées basées sur {metrics.totalHours.toLocaleString()} heures travaillées au registre.</p>
        </div>
      </header>

      {/* CARTES DE CALCUL ISO SCELLÉES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        <AnalyticsCard label="Taux de Fréquence (TF)" value={metrics.tf} unit="ACCIDENTS / 10⁶ H" color="orange" icon={<Activity size={40} />} />
        <AnalyticsCard label="Taux de Gravité (TG)" value={metrics.tg} unit="JOURS PERDUS / 10³ H" color="blue" icon={<ShieldAlert size={40} />} />
        <AnalyticsCard label="Arrêts de Travail" value={metrics.accidentsWithLeave} unit="ÉVÉNEMENTS SÉLECT" color="slate" icon={<Clock size={40} />} />
        <div className="p-10 bg-orange-600 rounded-[4rem] shadow-3xl shadow-orange-900/40 flex flex-col justify-between">
          <p className="text-white/60 text-[11px] font-black uppercase tracking-widest italic leading-none">Total Heures Travaillées</p>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{metrics.totalHours.toLocaleString()} H</h2>
        </div>
      </div>

      {/* MATRICE DES GRAPHIQUES §SMI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-slate-900/40 border border-white/5 p-12 rounded-[4.5rem] h-160 flex flex-col shadow-4xl backdrop-blur-3xl">
          <h3 className="text-2xl font-black uppercase italic mb-12 flex items-center gap-5 tracking-tighter leading-none">
            <PieIcon size={28} className="text-orange-500" /> Typologie du Risque
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeDistribution} innerRadius={100} outerRadius={150} paddingAngle={10} dataKey="value" stroke="none">
                  {typeDistribution.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '25px', fontSize: '12px', fontWeight: '900', color: '#fff', textTransform: 'uppercase' }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-6 mt-10">
              {typeDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                   <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                   <span className="text-[10px] font-black uppercase text-slate-400 italic tracking-widest truncate">{item.name}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-white/5 p-12 rounded-[4.5rem] h-160 flex flex-col shadow-4xl backdrop-blur-3xl">
          <h3 className="text-2xl font-black uppercase italic mb-12 flex items-center gap-5 tracking-tighter leading-none">
            <BarChart3 size={28} className="text-blue-500" /> Sévérité par Implantation
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={siteDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight="900" tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={11} fontWeight="900" tickLine={false} axisLine={false} dx={-10} />
                <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '25px', textTransform: 'uppercase', fontWeight: '900' }} />
                <Bar dataKey="days" fill="#3B82F6" radius={[15, 15, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsCard({ label, value, unit, color, icon }: any) {
  const themes: any = {
    orange: "border-orange-500/20 text-orange-500",
    blue: "border-blue-500/20 text-blue-500",
    slate: "border-white/10 text-slate-500"
  };
  return (
    <div className={`p-10 bg-slate-900/40 rounded-[4rem] border shadow-4xl relative overflow-hidden group backdrop-blur-md ${themes[color]}`}>
      <p className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em] mb-6 italic leading-none">{label}</p>
      <h2 className="text-6xl font-black text-white italic tracking-tighter leading-none">{value}</h2>
      <p className={`text-[10px] font-black mt-4 uppercase tracking-widest italic ${themes[color]}`}>{unit}</p>
      <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 text-white">
        {icon}
      </div>
    </div>
  );
}