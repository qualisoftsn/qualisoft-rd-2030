//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 NOM ABSOLU : src/app/dashboard/alerts/page.tsx (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Cockpit Centralisé des Alertes et Notifications du système SMI.
 * FIX : UI ClickUp 100dvh (Zéro Scroll Global), PWA Ready (retrait ml-72).
 * SÉCURITÉ : Validation API stricte. Zéro NextAuth.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 00:25 GMT
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Bell, CheckCircle, Clock, Search, 
  RefreshCw, ShieldAlert, Loader2, Zap,
  AlertTriangle, Info, Activity, Target,
  ChevronDown
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';

// --- 🛡️ INTERFACES SCELLÉES SDE ---
interface Alert {
  AL_Id: string;
  AL_Title: string;
  AL_Message: string;
  AL_Type: 'REMINDER' | 'DEADLINE' | 'OVERDUE' | 'INFO';
  AL_Priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  AL_Status: 'NEW' | 'UNREAD' | 'READ' | 'ACKNOWLEDGED';
  AL_TriggerDate: string;
  AL_DueDate?: string; 
}

interface AlertStats {
  unread: number;
  critical: number;
  overdue: number;
  total: number;
}

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');

  // --- 🧬 TRADUCTION & MAPPING VISUEL ---
  const translateType = (type: string) => {
    const map: Record<string, string> = { 'REMINDER': 'RAPPEL', 'DEADLINE': 'ÉCHÉANCE', 'OVERDUE': 'RETARD', 'INFO': 'INFORMATION' };
    return map[type] || type;
  };

  const translatePriority = (priority: string) => {
    const map: Record<string, string> = { 'CRITICAL': 'CRITIQUE', 'HIGH': 'ÉLEVÉE', 'MEDIUM': 'MOYENNE', 'LOW': 'BASSE' };
    return map[priority] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = {
      'CRITICAL': 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]',
      'HIGH': 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]',
      'MEDIUM': 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]',
      'LOW': 'bg-slate-800 text-slate-300 border-slate-700'
    };
    return map[priority] || map['LOW'];
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'OVERDUE': return <ShieldAlert size={28} className="md:w-8 md:h-8" />;
      case 'DEADLINE': return <Clock size={28} className="md:w-8 md:h-8" />;
      case 'INFO': return <Info size={28} className="md:w-8 md:h-8" />;
      default: return <Bell size={28} className="md:w-8 md:h-8" />;
    }
  };

  // --- 📡 RÉCUPÉRATION DES DONNÉES ---
  const refreshData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsRefreshing(true);
      else setLoading(true);

      const [alertsRes, statsRes] = await Promise.all([
        apiClient.get('/alerts').catch(() => ({ data: [] })),
        apiClient.get<AlertStats>('/alerts/stats').catch(() => ({ data: { unread: 0, critical: 0, overdue: 0, total: 0 } }))
      ]);
      
      const alertsData = alertsRes.data?.data || alertsRes.data;
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setStats(statsRes.data);
      
      if (isManualRefresh) toast.success("FLUX D'ALERTES SYNCHRONISÉ.");
    } catch (err) {
      toast.error("ÉCHEC DE SYNCHRONISATION AVEC LE MOTEUR D'ALERTES SDE.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  // --- ⚡ ACTIONS INTERACTIVES ---
  const handleAcknowledge = async (id: string) => {
    const tid = toast.loading("Acquittement et génération de l'action corrective...");
    try {
      await apiClient.patch(`/alerts/${id}/acknowledge`, { comment: "Alerte traitée depuis le Cockpit Master." });
      toast.success("ALERTE ACQUITTÉE. ACTION INJECTÉE DANS LE PAQ.", { id: tid });
      refreshData();
    } catch (err) {
      toast.error("IMPOSSIBLE DE TRAITER CETTE ALERTE. VÉRIFIEZ VOS DROITS.", { id: tid });
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/alerts/${id}/read`);
      toast.success("SIGNAL MARQUÉ COMME LU.");
      refreshData(); 
    } catch (err) {
      toast.error("ERREUR DE MUTATION LORS DE LA LECTURE.");
    }
  };

  // --- 🔍 MOTEUR DE RECHERCHE PUR ---
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const titleMatch = (a.AL_Title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const messageMatch = (a.AL_Message || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = titleMatch || messageMatch;
      const matchesPriority = filterPriority === 'ALL' || a.AL_Priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [alerts, searchTerm, filterPriority]);

  if (loading && alerts.length === 0) return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#0B0F1A] gap-6 text-white italic">
      <Loader2 className="animate-spin text-blue-600" size={64} strokeWidth={2} />
      <p className="text-blue-500 font-black uppercase text-[10px] md:text-xs tracking-[0.5em] md:tracking-[1em] animate-pulse m-0">
        Synchronisation Matrix...
      </p>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 EN-TÊTE FIXE (Zéro Scroll) */}
      <header className="shrink-0 p-6 md:p-8 lg:p-12 border-b border-white/5 bg-[#0B0F1A]/90 backdrop-blur-md z-20 flex flex-col xl:flex-row justify-between xl:items-end gap-8">
        <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="flex items-center gap-4">
            <span className="px-4 py-1.5 md:px-5 md:py-2 rounded-xl md:rounded-2xl bg-blue-600/10 border border-blue-600/20 text-blue-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] flex items-center gap-3 italic shadow-inner w-fit">
               <Activity size={14} className="animate-pulse md:w-4 md:h-4" /> Live Monitoring
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none text-white m-0 truncate">
              Cockpit <span className="text-blue-600">Alertes</span>
            </h1>
            <p className="text-slate-500 font-black text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em] italic mt-3 md:mt-4 m-0 truncate">
              SURVEILLANCE ISO 9001 & RÉGLEMENTAIRE • TEMPS RÉEL
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => refreshData(true)} 
          disabled={isRefreshing}
          className="bg-[#0F172A] border border-white/10 px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-3xl text-[9px] md:text-[10px] font-black uppercase italic tracking-[0.2em] md:tracking-[0.4em] flex items-center justify-center gap-3 md:gap-4 hover:bg-white hover:text-slate-900 transition-all cursor-pointer shadow-xl disabled:opacity-50 w-full xl:w-auto shrink-0 m-0 animate-in fade-in slide-in-from-right-4 duration-500"
        >
          <RefreshCw size={18} className={`md:w-5 md:h-5 ${isRefreshing ? "animate-spin" : ""}`} /> 
          {isRefreshing ? "Synchronisation..." : "Actualiser le Flux"}
        </button>
      </header>

      {/* 📜 ZONE DE DÉFILEMENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-12">
        <div className="max-w-400 mx-auto space-y-8 md:space-y-12">

          {/* 📊 INDICATEURS DE PERFORMANCE (KPIs) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {[
              { label: 'Non lues', val: stats?.unread || 0, color: 'text-blue-500', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.1)]', icon: <Bell size={48} className="md:w-16 md:h-16 lg:w-20 lg:h-20" /> },
              { label: 'Critiques', val: stats?.critical || 0, color: 'text-rose-500', glow: 'shadow-[0_0_30px_rgba(244,63,94,0.1)]', icon: <AlertTriangle size={48} className="md:w-16 md:h-16 lg:w-20 lg:h-20" /> },
              { label: 'En retard', val: stats?.overdue || 0, color: 'text-amber-500', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.1)]', icon: <Clock size={48} className="md:w-16 md:h-16 lg:w-20 lg:h-20" /> },
              { label: 'Flux Total', val: stats?.total || 0, color: 'text-slate-400', glow: 'shadow-[0_0_30px_rgba(148,163,184,0.1)]', icon: <Target size={48} className="md:w-16 md:h-16 lg:w-20 lg:h-20" /> }
            ].map((kpi, i) => (
              <div key={i} className={`bg-[#0F172A]/80 p-6 md:p-8 lg:p-10 rounded-4xl md:rounded-[3rem] ${kpi.glow} border border-white/5 relative overflow-hidden group backdrop-blur-xl transition-transform hover:-translate-y-1 flex flex-col justify-between`}>
                <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.4em] mb-3 md:mb-4 relative z-10 m-0 truncate">{kpi.label}</p>
                <p className={`text-4xl md:text-5xl lg:text-7xl font-black italic ${kpi.color} leading-none tracking-tighter relative z-10 m-0`}>{kpi.val}</p>
                <div className={`absolute -right-4 -bottom-4 md:-right-6 md:-bottom-6 opacity-[0.05] group-hover:opacity-[0.15] transition-all duration-700 group-hover:scale-110 ${kpi.color}`}>
                   {kpi.icon}
                </div>
              </div>
            ))}
          </div>

          {/* 🔍 FILTRES DE PRÉCISION */}
          <div className="bg-[#0F172A]/90 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 backdrop-blur-xl shadow-2xl sticky top-0 z-30">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-slate-500 md:w-6 md:h-6" size={20} />
              <input 
                type="text" 
                placeholder="RECHERCHER DANS LE REGISTRE..." 
                className="w-full bg-[#0B0F1A] border border-white/10 rounded-4xl md:rounded-[2.5rem] pl-16 md:pl-20 pr-6 md:pr-8 py-4 md:py-6 text-[10px] md:text-xs font-black uppercase text-white outline-none focus:border-blue-500 transition-all placeholder-slate-600 italic shadow-inner tracking-widest"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-auto min-w-62.5 relative shrink-0">
               <select 
                 value={filterPriority} 
                 onChange={(e) => setFilterPriority(e.target.value)}
                 className="w-full px-8 md:px-10 py-4 md:py-6 bg-[#0B0F1A] border border-white/10 rounded-4xl md:rounded-[2.5rem] font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] text-slate-400 outline-none focus:border-blue-500 cursor-pointer shadow-inner appearance-none italic transition-colors"
               >
                 <option value="ALL" className="bg-[#0B0F1A]">TOUTES LES PRIORITÉS</option>
                 <option value="CRITICAL" className="bg-[#0B0F1A]">CRITIQUE UNIQUEMENT</option>
                 <option value="HIGH" className="bg-[#0B0F1A]">ÉLEVÉE UNIQUEMENT</option>
                 <option value="MEDIUM" className="bg-[#0B0F1A]">MOYENNE UNIQUEMENT</option>
               </select>
               <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none md:w-5 md:h-5" />
            </div>
          </div>

          {/* 📋 REGISTRE DES SIGNAUX */}
          <div className="bg-[#0F172A]/50 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden backdrop-blur-sm">
            <div className="divide-y divide-white/5">
              {filteredAlerts.length > 0 ? filteredAlerts.map((alert) => (
                <div 
                  key={alert.AL_Id} 
                  className={cn(
                    "p-6 md:p-8 lg:p-10 flex flex-col xl:flex-row gap-6 md:gap-8 items-start xl:items-center transition-all hover:bg-white/5 relative overflow-hidden group/alert",
                    (alert.AL_Status === 'NEW' || alert.AL_Status === 'UNREAD') ? "bg-blue-600/5" : ""
                  )}
                >
                  {/* Indicateur Non-Lu */}
                  {(alert.AL_Status === 'NEW' || alert.AL_Status === 'UNREAD') && (
                     <div className="absolute left-0 top-0 bottom-0 w-1.5 md:w-2 bg-blue-500 shadow-[0_0_15px_#3b82f6]" />
                  )}
                  
                  {/* Icône de Type Dynamique */}
                  <div className={cn(
                    "shrink-0 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl md:rounded-3xl flex items-center justify-center border border-white/10 shadow-inner transition-transform group-hover/alert:scale-110",
                    alert.AL_Priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500' : 
                    alert.AL_Priority === 'HIGH' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'
                  )}>
                    {getTypeIcon(alert.AL_Type)}
                  </div>

                  {/* Contenu Texte de l'Alerte */}
                  <div className="flex-1 space-y-3 md:space-y-4 w-full min-w-0">
                    <div className="flex flex-wrap items-center gap-3 md:gap-4">
                      <span className={cn(
                        "px-3 py-1 md:px-4 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] italic border shrink-0",
                        getPriorityColor(alert.AL_Priority)
                      )}>
                        {translatePriority(alert.AL_Priority)}
                      </span>
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-black italic uppercase tracking-tighter text-white leading-none m-0 truncate w-full md:w-auto">
                        {alert.AL_Title}
                      </h3>
                    </div>
                    
                    <p className="text-slate-400 font-bold text-[10px] md:text-xs leading-relaxed max-w-4xl italic uppercase tracking-widest m-0 line-clamp-2 md:line-clamp-3">
                      {alert.AL_Message}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-2 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-500 italic">
                      <span className="flex items-center gap-2 bg-[#0B0F1A] px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl border border-white/5">
                         <Clock size={12} className="text-blue-500 md:w-3.5 md:h-3.5" /> {translateType(alert.AL_Type)}
                      </span>
                      <span className="bg-[#0B0F1A] px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl border border-white/5 truncate">
                         DÉCLENCHÉ LE : {alert.AL_TriggerDate ? new Date(alert.AL_TriggerDate).toLocaleDateString() : 'N/A'}
                      </span>
                      {alert.AL_DueDate && (
                        <span className="bg-rose-500/10 text-rose-400 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl border border-rose-500/20 truncate">
                           ÉCHÉANCE : {new Date(alert.AL_DueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 🛡️ BLOC DES BOUTONS */}
                  <div className="flex flex-row xl:flex-col gap-3 md:gap-4 w-full xl:w-auto mt-4 xl:mt-0 shrink-0">
                    {alert.AL_Status !== 'ACKNOWLEDGED' ? (
                      <>
                        <button 
                          onClick={() => handleMarkAsRead(alert.AL_Id)}
                          className="p-3 md:p-4 text-slate-400 hover:text-white bg-[#0B0F1A] border border-white/10 rounded-xl md:rounded-2xl transition-all cursor-pointer flex items-center justify-center hover:bg-white/10 w-auto xl:w-full active:scale-95 m-0"
                          title="Marquer comme lu"
                        >
                          <CheckCircle size={20} className="md:w-6 md:h-6" />
                        </button>
                        <button 
                          onClick={() => handleAcknowledge(alert.AL_Id)}
                          className="flex-1 px-4 py-3 md:px-6 md:py-4 bg-blue-600 text-white rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] hover:bg-white hover:text-slate-900 transition-all cursor-pointer border-none shadow-lg shadow-blue-900/20 text-center flex items-center justify-center gap-2 md:gap-3 group/btn italic active:scale-95 m-0"
                        >
                          <Zap size={16} className="group-hover/btn:scale-125 transition-transform md:w-5 md:h-5" /> Acquitter
                        </button>
                      </>
                    ) : (
                      <span className="flex-1 px-4 py-3 md:px-6 md:py-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] flex items-center justify-center gap-2 md:gap-3 italic w-full text-center shadow-inner m-0">
                        <CheckCircle size={16} className="md:w-5 md:h-5" /> Audit Traité
                      </span>
                    )}
                  </div>
                </div>
              )) : (
                <div className="py-20 md:py-32 text-center flex flex-col items-center justify-center gap-6 md:gap-8 border-2 border-dashed border-white/5 rounded-[2.5rem] md:rounded-[4rem] m-6 md:m-8">
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2 md:mb-4">
                     <CheckCircle className="text-emerald-500/50 md:w-14 md:h-14" size={40} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter m-0 px-4">
                    Système Nominal
                  </h3>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] md:tracking-[0.6em] italic max-w-sm m-0 px-6">
                     Aucune alerte en attente dans le registre souverain. La conformité est assurée.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}} />
    </div>
  );
}