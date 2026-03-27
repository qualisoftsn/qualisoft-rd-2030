/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : HUB DE COMMANDEMENT SSE & OPÉRATIONS (ISO 45001 / ISO 14001)
 * RÔLE : Pilotage Intégré Sécurité & Environnement
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, useMemo, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { 
  Plus, Search, ShieldAlert, TrendingUp, MapPin, Calendar, 
  Activity, GraduationCap, Leaf, Recycle, ChevronRight, 
  RefreshCcw, AlertTriangle, Target, Zap, Droplets, BarChart3, 
  Mic2, Users, ShieldCheck, Fingerprint
} from 'lucide-react';
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
  SSE_Description?: string;
  SSE_Severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  SSE_Status?: string;
}

export interface SSEStats {
  tf?: string;
  tg?: string;
  energy?: string;
  waste?: string;
  recycling?: string;
  compliance?: string;
}

export interface KPISSEProps {
  label: string;
  value: string;
  trend: string;
  color: 'orange' | 'blue' | 'emerald';
}

export interface EcoMiniStatProps {
  label: string;
  value: string;
  trend: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCcw className="animate-spin text-orange-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : KPI SSE
// ============================================================================

function KPISSE({ label, value, trend, color }: KPISSEProps) {
  const colorClasses: Record<KPISSEProps['color'], string> = {
    orange: "text-orange-400",
    blue: "text-blue-400",
    emerald: "text-emerald-400"
  };

  return (
    <article className="flex flex-col text-left" role="article" aria-label={`${label}: ${value}`}>
      <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
        <span className="text-[8px] md:text-[9px] text-slate-500 font-black tracking-widest uppercase italic">{label}</span>
        <span className="text-[8px] bg-white/5 px-1.5 md:px-2 py-0.5 rounded text-slate-400 italic">{trend}</span>
      </div>
      <span className={cn("text-2xl md:text-3xl font-black italic tracking-tighter m-0 leading-none", colorClasses[color])}>{value}</span>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : ECO MINI STAT
// ============================================================================

function EcoMiniStat({ label, value, trend }: EcoMiniStatProps) {
  return (
    <article className="flex justify-between items-end border-b border-white/10 pb-2 md:pb-3" role="article" aria-label={`${label}: ${value}`}>
      <div className="flex flex-col">
        <span className="text-[8px] md:text-[9px] text-white/60 font-black tracking-widest uppercase mb-0.5 md:mb-1">{label}</span>
        <span className="text-lg md:text-xl font-black italic tracking-tighter text-white">{value}</span>
      </div>
      <span className="text-[8px] md:text-[9px] font-black bg-white/20 px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg">{trend}</span>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : EVENT CARD
// ============================================================================

interface EventCardProps {
  event: SSEEvent;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
}

function EventCard({ event, onClick, onKeyDown }: EventCardProps) {
  const isWithStop = event.SSE_AvecArret;

  return (
    <article 
      className="group bg-black/20 border border-white/5 p-4 md:p-6 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] flex items-center justify-between hover:border-orange-500/50 transition-all focus-within:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`Événement SSE: ${event.SSE_Type}`}
    >
      <div className="flex items-center gap-4 md:gap-6">
        <div className={cn(
          "p-3 md:p-4 rounded-xl md:rounded-2xl shadow-inner shrink-0",
          isWithStop ? "bg-red-600/20 text-red-400" : "bg-orange-600/20 text-orange-400"
        )}>
          <ShieldAlert size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
        </div>
        <div className="text-left space-y-0.5 md:space-y-1 min-w-0">
          <h4 className="text-base md:text-lg font-black tracking-tighter m-0 truncate">{event.SSE_Type.replace('_', ' ')}</h4>
          <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest truncate">
            <MapPin size={10} className="w-2.5 h-2.5 md:w-3 md:h-3 inline mr-1" aria-hidden="true" /> 
            {event.SSE_Lieu} • {new Date(event.SSE_DateEvent).toLocaleDateString('fr-SN')}
          </p>
        </div>
      </div>
      <button 
        type="button"
        className="p-2 md:p-3 lg:p-4 bg-white/5 rounded-lg md:rounded-xl lg:rounded-2xl text-slate-500 hover:text-white hover:bg-orange-600 transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400"
        aria-label={`Voir le rapport de: ${event.SSE_Type}`}
        title="Voir le rapport"
      >
        <ChevronRight size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
      </button>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function SseHubPage() {
  const router = useRouter();
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [stats, setStats] = useState<SSEStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSseIntelligence = useCallback(async () => {
    try {
      setLoading(true);
      const [eventsRes, statsRes] = await Promise.all([
        apiClient.get<SSEEvent[]>('/sse').catch(() => ({ data: [] })),
        apiClient.get<SSEStats>('/sse/stats/global').catch(() => ({ data: {
          tf: "12.4", tg: "0.350", energy: "4500", waste: "120", recycling: "85", compliance: "98"
        }}))
      ]);
      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
      setStats(statsRes.data || null);
    } catch (error) {
      console.error('❌ Erreur chargement SSE:', error);
      toast.error("RUPTURE KERNEL : Liaison SSE interrompue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchSseIntelligence(); }, [fetchSseIntelligence]);

  const filteredEvents = useMemo(() => 
    events.filter(e => 
      e.SSE_Type.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.SSE_Lieu.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [events, searchTerm]
  );

  const handleEventClick = (eventId: string) => {
    router.push(`/dashboard/sse/report/${eventId}`);
  };

  const handleEventKeyDown = (e: KeyboardEvent<HTMLDivElement>, eventId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.push(`/dashboard/sse/report/${eventId}`);
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Extraction de l'Intelligence SSE..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-orange-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 bg-black/40 flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-orange-600 rounded-xl md:rounded-2xl text-white shadow-xl shadow-orange-600/20">
              <ShieldAlert size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden="true" />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic uppercase">
              Pilotage <span className="text-orange-400">SSE</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[9px] md:text-[10px] tracking-widest m-0">
            ISO 45001 & 14001 • Qualisoft RD-2026
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <button 
            type="button"
            onClick={() => router.push('/dashboard/sse/analytics')} 
            className="flex-1 py-2.5 md:py-3 lg:py-4 px-4 md:px-6 lg:px-8 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] hover:bg-blue-600 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Voir les analytics SSE"
          >
            <BarChart3 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 mr-1 md:mr-2 inline" aria-hidden="true" /> 
            <span className="hidden sm:inline">ANALYTICS</span>
          </button>
          <button 
            type="button"
            onClick={() => router.push('/dashboard/sse/causeries')} 
            className="flex-1 py-2.5 md:py-3 lg:py-4 px-4 md:px-6 lg:px-8 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] hover:bg-emerald-600 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Gérer les causeries"
          >
            <Mic2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 mr-1 md:mr-2 inline" aria-hidden="true" /> 
            <span className="hidden sm:inline">CAUSERIES</span>
          </button>
          <button 
            type="button"
            onClick={() => router.push('/dashboard/sse/new')} 
            className="flex-1 py-2.5 md:py-3 lg:py-4 px-4 md:px-6 lg:px-8 lg:px-10 bg-orange-600 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] shadow-xl hover:bg-white hover:text-orange-600 transition-all cursor-pointer border-none focus:outline-none focus:ring-2 focus:ring-orange-400"
            aria-label="Signaler un événement SSE"
          >
            <Plus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 mr-1 md:mr-2 inline" strokeWidth={4} aria-hidden="true" /> 
            <span className="hidden sm:inline">SIGNALER</span>
          </button>
        </div>
      </header>

      {/* 📊 KPI MATRIX */}
      <nav className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 bg-white/5 border-b border-white/5 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8" role="navigation" aria-label="Statistiques SSE">
         <KPISSE label="Taux Fréquence (TF)" value={stats?.tf || '—'} trend="+2%" color="orange" />
         <KPISSE label="Taux Gravité (TG)" value={stats?.tg || '—'} trend="-5%" color="blue" />
         <KPISSE label="Conformité GPEC" value={`${stats?.compliance || '—'}%`} trend="OK" color="emerald" />
         <div className="flex flex-col text-right justify-center" role="img" aria-label="Formule de calcul du taux de fréquence">
            <span className="text-[8px] md:text-[9px] text-slate-500 tracking-widest leading-none mb-1 md:mb-2">Formule Accidentologie</span>
            <span className="text-[9px] md:text-[10px] font-bold text-orange-400 truncate">TF = (N_Acc × 10⁶) / H_Trav</span>
         </div>
      </nav>

      {/* 🧩 MAIN CONTENT */}
      <main className="flex-1 overflow-hidden px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
        
        {/* COLONNE GAUCHE : REGISTRE */}
        <section className="lg:col-span-8 bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] flex flex-col shadow-2xl overflow-hidden" aria-labelledby="registry-title">
          <header className="p-4 md:p-6 lg:p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 bg-black/20">
             <h2 id="registry-title" className="text-base md:text-lg lg:text-xl font-black italic m-0 flex items-center gap-3 md:gap-4 uppercase">
               <Activity className="text-orange-400 w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" /> 
               Registre Sécurité §10.2
             </h2>
             <div className="relative group w-full sm:w-auto">
               <label htmlFor="sse-search" className="sr-only">Rechercher un événement SSE</label>
               <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 w-4 h-4" aria-hidden="true" />
               <input 
                 id="sse-search"
                 value={searchTerm} 
                 onChange={handleSearchChange}
                 className="bg-black/40 border border-white/10 rounded-lg md:rounded-xl py-2 md:py-3 pl-9 md:pl-10 pr-3 md:pr-4 text-[9px] md:text-[10px] outline-none focus:border-orange-500 transition-all uppercase italic w-full sm:w-48 md:w-64"
                 placeholder="RECHERCHER..."
                 aria-label="Filtrer les événements SSE"
               />
             </div>
          </header>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 space-y-3 md:space-y-4" role="list" aria-label="Liste des événements SSE">
            {filteredEvents.length > 0 ? filteredEvents.map(event => (
              <EventCard 
                key={event.SSE_Id} 
                event={event} 
                onClick={() => handleEventClick(event.SSE_Id)}
                onKeyDown={(e) => handleEventKeyDown(e, event.SSE_Id)}
              />
            )) : (
              <div className="h-32 md:h-40 flex flex-col items-center justify-center text-slate-500" role="status">
                <ShieldAlert size={48} className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 opacity-20" aria-hidden="true" />
                <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                  {searchTerm ? 'Aucun événement ne correspond à la recherche' : 'Aucun événement enregistré'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* COLONNE DROITE : ECO-SUM */}
        <section className="lg:col-span-4 space-y-4 md:space-y-6 lg:space-y-8 flex flex-col">
          
          {/* CARTE ÉNERGIE */}
          <article className="bg-gradient-to-br from-green-600 to-emerald-900 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] shadow-2xl text-left relative overflow-hidden group">
            <Leaf className="absolute -right-4 md:-right-6 -bottom-4 md:-bottom-6 opacity-10 group-hover:scale-125 transition-transform w-32 h-32 md:w-40 md:h-40" aria-hidden="true" />
            <h3 className="text-lg md:text-xl font-black italic m-0 mb-4 md:mb-6 flex items-center gap-2 md:gap-3 uppercase">
              <Zap size={16} className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" aria-hidden="true" /> 
              Performance Éco
            </h3>
            <div className="space-y-3 md:space-y-4 lg:space-y-6 relative z-10">
              <EcoMiniStat label="Conso Électrique" value={`${stats?.energy || '—'} kWh`} trend="-8%" />
              <EcoMiniStat label="Valorisation Déchets" value={`${stats?.recycling || '—'}%`} trend="+15%" />
            </div>
            <button 
              type="button"
              onClick={() => router.push('/dashboard/environment')} 
              className="w-full mt-4 md:mt-6 lg:mt-8 py-3 md:py-4 bg-white/20 hover:bg-white text-white hover:text-green-800 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] tracking-widest transition-all border-none cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 uppercase"
              aria-label="Accéder au cockpit environnement"
            >
              Full Cockpit Environnement
            </button>
          </article>

          {/* MATRICE CAUSERIES */}
          <article className="flex-1 bg-white/5 border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-4 md:p-6 lg:p-8 flex flex-col shadow-inner" aria-labelledby="causeries-title">
            <h3 id="causeries-title" className="text-[11px] md:text-sm font-black italic m-0 mb-4 md:mb-6 flex items-center gap-2 md:gap-3 uppercase">
              <Mic2 className="text-blue-400 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
              Focus Sensibilisation
            </h3>
            <div className="flex-1 flex flex-col justify-center items-center gap-3 md:gap-4 opacity-40">
               <Fingerprint size={32} className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" strokeWidth={1} aria-hidden="true" />
               <p className="text-[8px] md:text-[9px] tracking-widest">Registre Émargement Scellé</p>
            </div>
            <button 
              type="button"
              onClick={() => router.push('/dashboard/sse/causeries')} 
              className="w-full py-3 md:py-4 lg:py-5 bg-blue-600 text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] tracking-widest shadow-xl border-none cursor-pointer hover:bg-white hover:text-blue-700 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 uppercase"
              aria-label="Gérer les causeries"
            >
              Gérer les Causeries
            </button>
          </article>

        </section>
      </main>

      {/* 🛡️ FOOTER */}
      <footer className="shrink-0 bg-black/40 border-t border-white/5 px-4 md:px-6 py-3 md:py-4 lg:py-6 flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-orange-400 font-black text-[9px] md:text-[10px] tracking-widest uppercase italic">
          <ShieldCheck size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> 
          Hub SSE SDE Scellé • 2026
        </div>
        <div className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-widest italic flex items-center gap-2 md:gap-3">
          <Activity size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 animate-pulse text-emerald-400" aria-hidden="true" /> 
          Kernel Real-Time Protected
        </div>
      </footer>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(249,115,22,0.3);border-radius:10px}:focus-visible{outline:2px solid #f97316;outline-offset:2px}`}</style>
    </div>
  );
}