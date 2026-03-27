/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📊 MODULE : REPORTING ANALYTIQUE PAQ (ISO 9001 §9.1.3)
 * RÔLE : Analyse et évaluation de la performance
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useEffect, useState, useCallback } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { 
  ShieldAlert, CheckCircle2, Clock, Users, Target, 
  Printer, BarChart3, TrendingUp, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface UserRef {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
}

export interface ActionItem {
  ACT_Id: string;
  ACT_Title: string;
  ACT_Deadline: string;
  ACT_Status: string;
  ACT_Priority: string;
  ACT_ResponsableId: string;
  ACT_Responsable?: UserRef;
}

export interface PilotCharge {
  name: string;
  count: number;
}

export interface DashboardStats {
  total: number;
  enRetard: ActionItem[];
  aValider: ActionItem[];
  tauxEfficacite: number;
  chargeTravail: PilotCharge[];
}

export interface StatBadgeProps {
  label: string;
  val: string | number;
  icon: React.ElementType;
  color: 'blue' | 'red' | 'orange' | 'emerald';
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : STAT BADGE
// ============================================================================

function StatBadge({ label, val, icon: Icon, color }: StatBadgeProps) {
  const themes: Record<StatBadgeProps['color'], string> = { 
    blue: "text-blue-400 border-blue-500/10", 
    red: "text-red-400 border-red-500/10", 
    orange: "text-orange-400 border-orange-500/10", 
    emerald: "text-emerald-400 border-emerald-500/10" 
  };
  
  return (
    <article className={cn(
      "bg-[#0F172A] p-6 md:p-8 rounded-2xl md:rounded-3xl border-2 flex items-center gap-4 md:gap-6 shadow-2xl transition-all hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-400",
      themes[color]
    )}>
      <div className="p-3 md:p-4 bg-black/40 rounded-xl md:rounded-2xl border border-white/5 shadow-inner">
        <Icon size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
      </div>
      <div className="text-left">
        <p className="text-3xl md:text-4xl font-black italic m-0 tracking-tighter text-white leading-none">{val}</p>
        <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest mt-1 md:mt-2 m-0 uppercase font-black italic">{label}</p>
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function PAQReportPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<DashboardStats>('/paq/dashboard');
      setData(res.data?.data || res.data || null);
    } catch (error) {
      console.error('❌ Erreur chargement reporting PAQ:', error);
      toast.error("RUPTURE DU FLUX ANALYTIQUE MATRIX");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchDashboard(); }, [fetchDashboard]);

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Compilation de l'Index de Performance §9.1.3..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 lg:gap-8 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic">Reporting <span className="text-blue-400 italic">Analytique</span></h1>
          <p className="text-blue-400 font-bold text-[9px] md:text-[10px] tracking-widest m-0 italic opacity-80 uppercase">Performance & Amélioration Continue (§9.1.3)</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <button 
            type="button"
            onClick={() => window.print()} 
            className="flex-1 xl:flex-none p-2.5 md:p-3 lg:p-5 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl lg:rounded-3xl border border-white/10 text-slate-400 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Imprimer le rapport"
          >
            <Printer size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
          </button>
          <button 
            type="button"
            onClick={() => router.push('/dashboard/paq')} 
            className="flex-1 xl:flex-none bg-blue-600 hover:bg-white hover:text-blue-700 px-4 md:px-6 lg:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl text-[9px] md:text-[10px] shadow-2xl border-none cursor-pointer text-white italic transition-all font-black uppercase focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Fermer le rapport et retourner au PAQ"
          >
            Fermer Rapport
          </button>
        </div>
      </header>

      {/* 📊 KPI ROW */}
      <section className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pb-0 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" aria-label="Statistiques de performance PAQ">
        <StatBadge label="Actions Totales" val={data?.total || 0} icon={Target} color="blue" />
        <StatBadge label="Retards" val={data?.enRetard?.length || 0} icon={ShieldAlert} color="red" />
        <StatBadge label="En Attente" val={data?.aValider?.length || 0} icon={Clock} color="orange" />
        <StatBadge label="Taux de Clôture" val={`${data?.tauxEfficacite || 0}%`} icon={CheckCircle2} color="emerald" />
      </section>

      {/* 📋 WORKZONE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pt-0 md:pt-4">
        <div className="max-w-[100rem] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 lg:gap-8 pb-10 md:pb-16 lg:pb-20">
          
          {/* Radar des Écarts */}
          <section className="col-span-12 xl:col-span-8 bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-6 md:p-8 lg:p-12 shadow-2xl flex flex-col gap-6 md:gap-8 lg:gap-10" aria-labelledby="ecarts-title">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-4 md:pb-6 lg:pb-8 gap-3 md:gap-4">
               <h3 id="ecarts-title" className="text-lg md:text-xl lg:text-2xl m-0 tracking-tighter italic flex items-center gap-3 md:gap-4">
                 <div className="w-1.5 md:w-2 h-6 md:h-8 bg-red-600 rounded-full animate-pulse" aria-hidden="true" /> 
                 Analyse des Écarts Critiques
               </h3>
               <span className="text-[9px] md:text-[10px] text-red-400 font-black tracking-widest">
                 {data?.enRetard?.length || 0} RETARDS DÉTECTÉS
               </span>
            </div>
            <div className="space-y-3 md:space-y-4" role="list" aria-label="Liste des actions en retard">
              {data?.enRetard && data.enRetard.length > 0 ? data.enRetard.map((action) => (
                <article 
                  key={action.ACT_Id} 
                  className="bg-black/40 border border-white/5 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[3rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 lg:gap-8 group hover:border-red-600/30 transition-all focus-within:border-red-600/30 focus:outline-none focus:ring-2 focus:ring-red-400"
                  role="listitem"
                  tabIndex={0}
                  aria-label={`Action en retard: ${action.ACT_Title}`}
                >
                  <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-red-600/10 text-red-400 flex items-center justify-center border border-red-600/20 font-black text-lg md:text-xl italic group-hover:bg-red-600 group-hover:text-white transition-all shadow-lg shrink-0" aria-hidden="true">!</div>
                    <div className="text-left min-w-0">
                       <h4 className="text-base md:text-lg lg:text-xl m-0 tracking-tighter group-hover:text-red-400 transition-colors uppercase italic truncate">{action.ACT_Title}</h4>
                       <p className="text-[8px] md:text-[9px] text-slate-500 mt-1 md:mt-2 m-0 tracking-widest uppercase italic truncate">
                         {action.ACT_Responsable?.U_FirstName || 'Non'} {action.ACT_Responsable?.U_LastName || 'assigné'}
                       </p>
                    </div>
                  </div>
                  <div className="text-right w-full md:w-auto">
                    <p className="text-[9px] md:text-[10px] text-red-400 m-0 tracking-widest font-black italic uppercase">
                      Échéance dépassée : {new Date(action.ACT_Deadline).toLocaleDateString('fr-SN')}
                    </p>
                  </div>
                </article>
              )) : (
                <div className="text-center py-8 md:py-12 text-slate-600" role="status">
                  <CheckCircle2 size={32} className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-3 opacity-20" aria-hidden="true" />
                  <p className="text-[9px] md:text-[10px] tracking-widest">Aucun retard détecté</p>
                </div>
              )}
            </div>
          </section>

          {/* Effort Pilotes & Index */}
          <aside className="col-span-12 xl:col-span-4 space-y-4 md:space-y-6 lg:space-y-8 flex flex-col">
            <article className="bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-6 md:p-8 lg:p-10 shadow-2xl relative overflow-hidden flex-1" aria-labelledby="pilotes-title">
               <TrendingUp className="absolute -right-4 md:-right-6 -top-4 md:-top-6 opacity-5 text-blue-400 w-32 h-32 md:w-40 md:h-40" aria-hidden="true" />
               <h3 id="pilotes-title" className="text-[10px] md:text-[11px] text-blue-400 tracking-widest m-0 mb-6 md:mb-8 lg:mb-10 italic flex items-center gap-2 md:gap-3 uppercase font-black">
                 <Users size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" /> 
                 Effort par Pilote
               </h3>
               <div className="space-y-4 md:space-y-6 lg:space-y-8" role="list" aria-label="Charge de travail par pilote">
                  {data?.chargeTravail && data.chargeTravail.map((pilot, i) => (
                    <div key={i} className="group" role="listitem">
                      <div className="flex justify-between items-end italic mb-2 md:mb-3">
                        <span className="text-[9px] md:text-[10px] text-slate-400 tracking-widest uppercase group-hover:text-white transition-colors truncate">{pilot.name}</span>
                        <span className="text-lg md:text-xl leading-none text-blue-400 font-black">{pilot.count}</span>
                      </div>
                      <div className="h-1.5 md:h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner" role="progressbar" aria-valuenow={(pilot.count / (data.total || 1)) * 100} aria-valuemin={0} aria-valuemax={100}>
                        <div className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: `${(pilot.count / (data.total || 1)) * 100}%` }} aria-hidden="true" />
                      </div>
                    </div>
                  ))}
               </div>
            </article>
            <article className="bg-white/5 border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-4 md:p-6 lg:p-8 flex items-center gap-4 md:gap-6 group hover:border-blue-500/30 transition-all cursor-help focus-within:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label="Informations sur l'indice de fiabilité">
               <BarChart3 className="text-blue-400 group-hover:scale-110 transition-transform w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
               <div className="text-left">
                  <p className="text-[8px] md:text-[9px] text-slate-500 tracking-widest italic mb-0.5 md:mb-1 m-0 uppercase font-black">Indice de Fiabilité Matrix</p>
                  <p className="text-lg md:text-xl leading-none m-0 italic font-black text-white">SDE ANALYTICS v3.1</p>
               </div>
            </article>
          </aside>

        </div>
      </main>

      {/* PRINT STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:bg-white { background: white !important; }
        }
      `}</style>
    </div>
  );
}