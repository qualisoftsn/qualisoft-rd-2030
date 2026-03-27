/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📊 MODULE : MOTEUR ANALYTIQUE ACCIDENTOLOGIE (ISO 45001)
 * RÔLE : Calcul scellé des indices TF (Fréquence) et TG (Gravité)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useEffect, useState, useMemo } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, ShieldAlert, Clock, BarChart3, TrendingUp, ChevronLeft, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface SSEEvent {
  SSE_Id: string;
  SSE_Type: string;
  SSE_Lieu: string;
  SSE_DateEvent: string;
  SSE_AvecArret: boolean;
  SSE_NbJoursArret: number;
  SSE_Description?: string;
  SSE_Severity?: string;
  SSE_Status?: string;
}

export interface SSEStats {
  ST_HeuresTravaillees: number;
  ST_TotalAccidents?: number;
  ST_TotalJoursPerdus?: number;
}

export interface AnalyticScoreCardProps {
  label: string;
  value: string | number;
  unit: string;
  color: 'orange' | 'blue' | 'rose' | 'emerald';
  icon: React.ReactNode;
}

export interface ChartData {
  SSE_Lieu: string;
  SSE_NbJoursArret: number;
}

export interface PieChartData {
  name: string;
  value: number;
}

export interface LoadingScreenProps {
  label: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const COLORS = ['#F97316', '#3B82F6', '#EF4444', '#10B981', '#A855F7'];

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: LoadingScreenProps) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-orange-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : ANALYTIC SCORE CARD
// ============================================================================

function AnalyticScoreCard({ label, value, unit, color, icon }: AnalyticScoreCardProps) {
  const colorClasses: Record<AnalyticScoreCardProps['color'], string> = {
    orange: "text-orange-400",
    blue: "text-blue-400",
    rose: "text-red-400",
    emerald: "text-emerald-400"
  };

  return (
    <article 
      className="bg-[#0F172A] p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] border-2 border-white/5 shadow-2xl text-left relative overflow-hidden group focus-within:ring-2 focus-within:ring-orange-400"
      role="article"
      aria-label={`${label}: ${value}`}
    >
      <div className="absolute -right-2 md:-right-4 -bottom-2 md:-bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform" aria-hidden="true">
        {icon}
      </div>
      <p className="text-[9px] md:text-[10px] text-slate-500 font-black tracking-widest mb-3 md:mb-4 italic leading-none m-0 uppercase">{label}</p>
      <h2 className={cn("text-3xl md:text-4xl lg:text-5xl font-black italic tracking-tighter m-0 leading-none", colorClasses[color])}>
        {value}
      </h2>
      <p className="text-[8px] md:text-[9px] text-slate-500 font-black tracking-widest mt-3 md:mt-4 opacity-50 m-0 uppercase">{unit}</p>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function SseAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<{ events: SSEEvent[]; stats: SSEStats | SSEStats[] }>({ events: [], stats: [] });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [resEvents, resStats] = await Promise.all([
        apiClient.get<SSEEvent[]>('/sse'),
        apiClient.get<SSEStats | SSEStats[]>('/sse/stats/global').catch(() => ({  { ST_HeuresTravaillees: 200000 } }))
      ]);
      setData({ 
        events: Array.isArray(resEvents.data) ? resEvents.data : (Array.isArray(resEvents.data?.data) ? resEvents.data.data : []),
        stats: resStats.data?.data || resStats.data || { ST_HeuresTravaillees: 200000 }
      });
    } catch (error) {
      console.error('❌ Erreur chargement analytics:', error);
      toast.error("RUPTURE KERNEL : Moteur analytique offline.");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { if (typeof window !== 'undefined') fetchAnalytics(); }, []);

  const metrics = useMemo(() => {
    const statsArray = Array.isArray(data.stats) ? data.stats : [data.stats];
    const totalHours = statsArray.reduce((sum: number, s: SSEStats) => sum + (Number(s.ST_HeuresTravaillees) || 0), 0) || 200000;
    const accidentsWithLeave = data.events.filter((e: SSEEvent) => e.SSE_AvecArret).length;
    const totalLostDays = data.events.reduce((sum: number, e: SSEEvent) => sum + (Number(e.SSE_NbJoursArret) || 0), 0);

    const tf = totalHours > 0 ? ((accidentsWithLeave * 1000000) / totalHours).toFixed(2) : "0.00";
    const tg = totalHours > 0 ? ((totalLostDays * 1000) / totalHours).toFixed(3) : "0.000";

    return { tf, tg, totalHours, accidentsWithLeave, totalLostDays, count: data.events.length };
  }, [data]);

  const barChartData: ChartData[] = useMemo(() => {
    const grouped = data.events.reduce((acc: Record<string, number>, event: SSEEvent) => {
      const lieu = event.SSE_Lieu || 'NON SPÉCIFIÉ';
      acc[lieu] = (acc[lieu] || 0) + (event.SSE_NbJoursArret || 0);
      return acc;
    }, {});
    
    return Object.entries(grouped).map(([lieu, jours]) => ({
      SSE_Lieu: lieu,
      SSE_NbJoursArret: jours
    }));
  }, [data.events]);

  const pieChartData: PieChartData[] = useMemo(() => {
    return [
      { name: 'Avec Arrêt', value: metrics.accidentsWithLeave },
      { name: 'Sans Arrêt', value: metrics.count - metrics.accidentsWithLeave }
    ];
  }, [metrics]);

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Extraction de l'Intelligence Accidentologie..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-orange-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 bg-black/40 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left w-full sm:w-auto">
          <button 
            type="button"
            onClick={() => router.back()} 
            className="flex items-center gap-1.5 md:gap-2 text-slate-500 hover:text-orange-400 transition-colors font-black text-[9px] md:text-[10px] mb-3 md:mb-4 border-none bg-transparent cursor-pointer p-0 focus:outline-none focus:ring-2 focus:ring-orange-400 rounded px-2 py-1"
            aria-label="Retour au hub SSE"
          >
            <ChevronLeft size={16} className="w-4 h-4" aria-hidden="true" /> 
            <span className="hidden sm:inline">Retour au Hub SSE</span>
          </button>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic">
            Analytics <span className="text-orange-400">Accidentologie</span>
          </h1>
        </div>
        
        <div className="text-left sm:text-right w-full sm:w-auto" role="img" aria-label="Formule de calcul du taux de fréquence">
          <p className="text-[8px] md:text-[9px] text-slate-500 tracking-widest m-0">
            Indice TF : (N_Acc × 10⁶) / H_Trav
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <div className="max-w-[100rem] mx-auto space-y-6 md:space-y-8">
          
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8" role="list" aria-label="Indicateurs de performance SSE">
            <AnalyticScoreCard 
              label="Fréquence (TF)" 
              value={metrics.tf} 
              unit="ACCIDENTS / 10⁶ H" 
              color="orange" 
              icon={<Activity size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />} 
            />
            <AnalyticScoreCard 
              label="Gravité (TG)" 
              value={metrics.tg} 
              unit="JOURS PERDUS / 10³ H" 
              color="blue" 
              icon={<ShieldAlert size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />} 
            />
            <AnalyticScoreCard 
              label="Jours Perdus" 
              value={metrics.totalLostDays} 
              unit="JOURS SCELLÉS" 
              color="rose" 
              icon={<Clock size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />} 
            />
            <AnalyticScoreCard 
              label="Heures Registre" 
              value={metrics.totalHours.toLocaleString('fr-SN')} 
              unit="HEURES TRAVAILLÉES" 
              color="emerald" 
              icon={<BarChart3 size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />} 
            />
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <article 
              className="bg-white/5 border-2 border-white/5 p-4 md:p-6 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[4rem] h-[350px] md:h-[400px] lg:h-[500px] flex flex-col shadow-2xl relative overflow-hidden"
              aria-labelledby="severity-chart-title"
            >
              <h3 id="severity-chart-title" className="text-lg md:text-xl font-black italic mb-6 md:mb-8 lg:mb-10 flex items-center gap-3 md:gap-4 text-left m-0 uppercase tracking-tighter">
                <TrendingUp className="text-orange-400 w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" /> 
                Sévérité par Implantation
              </h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis 
                      dataKey="SSE_Lieu" 
                      stroke="#64748b" 
                      fontSize={10} 
                      fontStyle="italic" 
                      fontWeight="900" 
                      tick={{ fill: '#64748b', fontSize: 10, fontStyle: 'italic', fontWeight: 900 }}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10} 
                      fontStyle="italic" 
                      fontWeight="900"
                      tick={{ fill: '#64748b', fontSize: 10, fontStyle: 'italic', fontWeight: 900 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#ffffff05' }} 
                      contentStyle={{ 
                        backgroundColor: '#0F172A', 
                        border: 'none', 
                        borderRadius: '20px', 
                        fontWeight: '900',
                        fontStyle: 'italic'
                      }} 
                    />
                    <Bar dataKey="SSE_NbJoursArret" fill="#F97316" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article 
              className="bg-white/5 border-2 border-white/5 p-4 md:p-6 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[4rem] h-[350px] md:h-[400px] lg:h-[500px] flex flex-col items-center justify-center shadow-2xl relative overflow-hidden"
              aria-labelledby="typology-chart-title"
            >
              <h3 id="typology-chart-title" className="text-lg md:text-xl font-black italic mb-6 md:mb-8 lg:mb-10 self-start flex items-center gap-3 md:gap-4 text-left m-0 uppercase tracking-tighter">
                <Activity className="text-blue-400 w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" /> 
                Typologie du Risque
              </h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieChartData} 
                      innerRadius={60} 
                      outerRadius={100} 
                      paddingAngle={10} 
                      dataKey="value"
                      stroke="none"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieChartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0F172A', 
                        border: 'none', 
                        borderRadius: '20px', 
                        fontWeight: '900',
                        fontStyle: 'italic'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>
        </div>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(249,115,22,0.3);border-radius:10px}:focus-visible{outline:2px solid #f97316;outline-offset:2px}`}</style>
    </div>
  );
}