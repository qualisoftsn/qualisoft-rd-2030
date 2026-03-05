/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📊 MODULE : MOTEUR ANALYTIQUE ACCIDENTOLOGIE (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Calcul scellé des indices TF (Fréquence) et TG (Gravité).
 * DESIGN : Matrix Analytics / 100dvh / Recharts Scellés.
 * ---------------------------------------------------------------------------
 * DATE DE RÉVISION : 05 Mars 2026 | 20:55 GMT
 */

"use client";

import { useEffect, useState, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, ShieldAlert, Clock, BarChart3, TrendingUp, ChevronLeft, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

const COLORS = ['#F97316', '#3B82F6', '#EF4444', '#10B981', '#A855F7'];

export default function SseAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>({ events: [], stats: [] });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [resEvents, resStats] = await Promise.all([
        apiClient.get('/sse'),
        apiClient.get('/sse/stats/global').catch(() => ({ data: { ST_HeuresTravaillees: 200000 } }))
      ]);
      setData({ 
        events: resEvents.data?.data || resEvents.data || [],
        stats: resStats.data?.data || resStats.data || [] 
      });
    } catch {
      toast.error("RUPTURE KERNEL : Moteur analytique offline.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const metrics = useMemo(() => {
    const totalHours = Array.isArray(data.stats) ? data.stats.reduce((sum: number, s: any) => sum + (Number(s.ST_HeuresTravaillees) || 0), 0) : (data.stats.ST_HeuresTravaillees || 200000);
    const accidentsWithLeave = data.events.filter((e: any) => e.SSE_AvecArret).length;
    const totalLostDays = data.events.reduce((sum: number, e: any) => sum + (Number(e.SSE_NbJoursArret) || 0), 0);

    const tf = totalHours > 0 ? ((accidentsWithLeave * 1000000) / totalHours).toFixed(2) : "0.00";
    const tg = totalHours > 0 ? ((totalLostDays * 1000) / totalHours).toFixed(3) : "0.000";

    return { tf, tg, totalHours, accidentsWithLeave, totalLostDays, count: data.events.length };
  }, [data]);

  // --- 🛠️ CORRECTION LIGNE 57 : COMPOSANT DÉFINI PLUS BAS ---
  if (loading) return <LoadingScreen label="Extraction de l'Intelligence Accidentologie..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-orange-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="shrink-0 p-8 border-b border-white/5 bg-black/40 flex justify-between items-end mt-12 lg:mt-0">
        <div className="text-left">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors font-black text-[10px] mb-4 border-none bg-transparent cursor-pointer p-0">
            <ChevronLeft size={16} /> Retour au Hub SSE
          </button>
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic">Analytics <span className="text-orange-500">Accidentologie</span></h1>
        </div>
        
        {/* --- 🛠️ CORRECTION LIGNE 71 : SCELLAGE LATEX VIA DOUBLE BACKSLASH --- */}
        <div className="text-right hidden xl:block">
          <p className="text-[9px] text-slate-500 tracking-[0.4em] m-0">
            {"Indice TF Global : $$TF = \\frac{N_{Acc} \\times 10^6}{H_{Trav}}$$"}
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-400 mx-auto space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            <AnalyticScoreCard label="Fréquence (TF)" value={metrics.tf} unit="ACCIDENTS / 10⁶ H" color="text-orange-500" icon={<Activity size={32}/>} />
            <AnalyticScoreCard label="Gravité (TG)" value={metrics.tg} unit="JOURS PERDUS / 10³ H" color="text-blue-500" icon={<ShieldAlert size={32}/>} />
            <AnalyticScoreCard label="Jours Perdus" value={metrics.totalLostDays} unit="JOURS SCELLÉS" color="text-rose-500" icon={<Clock size={32}/>} />
            <AnalyticScoreCard label="Heures Registre" value={metrics.totalHours.toLocaleString()} unit="HEURES TRAVAILLÉES" color="text-emerald-500" icon={<BarChart3 size={32}/>} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <section className="bg-white/5 border-2 border-white/5 p-10 rounded-[4rem] h-125 flex flex-col shadow-4xl relative overflow-hidden">
              <h3 className="text-xl font-black italic mb-10 flex items-center gap-4 text-left m-0 uppercase tracking-tighter">
                <TrendingUp className="text-orange-500"/> Sévérité par Implantation
              </h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.events}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="SSE_Lieu" stroke="#64748b" fontSize={10} fontStyle="italic" fontWeight="900" />
                    <YAxis stroke="#64748b" fontSize={10} fontStyle="italic" fontWeight="900" />
                    <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{backgroundColor: '#0F172A', border: 'none', borderRadius: '20px', fontWeight: '900'}} />
                    <Bar dataKey="SSE_NbJoursArret" fill="#F97316" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="bg-white/5 border-2 border-white/5 p-10 rounded-[4rem] h-125 flex flex-col items-center justify-center shadow-4xl relative overflow-hidden">
              <h3 className="text-xl font-black italic mb-10 self-start flex items-center gap-4 text-left m-0 uppercase tracking-tighter">
                <Activity className="text-blue-500"/> Typologie du Risque
              </h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={[{name: 'Accidents', value: metrics.accidentsWithLeave}, {name: 'Autres', value: metrics.count - metrics.accidentsWithLeave}]} 
                      innerRadius={80} 
                      outerRadius={120} 
                      paddingAngle={10} 
                      dataKey="value"
                      stroke="none"
                    >
                      {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#0F172A', border: 'none', borderRadius: '20px', fontWeight: '900'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

// --- 🧩 COMPOSANTS ATOMIQUES SCELLÉS ---

function AnalyticScoreCard({ label, value, unit, color, icon }: any) {
  return (
    <div className="bg-[#151A2D] p-10 rounded-[3.5rem] border-2 border-white/5 shadow-4xl text-left relative overflow-hidden group">
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform">{icon}</div>
      <p className="text-[10px] text-slate-500 font-black tracking-widest mb-4 italic leading-none m-0 uppercase">{label}</p>
      <h2 className={cn("text-5xl font-black italic tracking-tighter m-0 leading-none", color)}>{value}</h2>
      <p className="text-[9px] text-slate-500 font-black tracking-widest mt-4 opacity-50 m-0 uppercase">{unit}</p>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-orange-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}