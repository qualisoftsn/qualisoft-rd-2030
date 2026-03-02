//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 NOM ABSOLU : src/app/dashboard/alerts/page.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Cockpit Centralisé des Alertes et Notifications du système SMI.
 * ARCHITECTURE : Zéro simulation. Connecté via apiClient (Isolation SDE).
 * FIX CRITIQUE : Réparation de la structure DOM (divs mal imbriquées) dans la 
 * boucle des alertes. Sécurisation de l'injection CSS.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 13:00 GMT
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
  // --- 📦 ÉTATS DU KERNEL ---
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // --- 🔍 ÉTATS DE RECHERCHE ---
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
      'CRITICAL': 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]',
      'HIGH': 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]',
      'MEDIUM': 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]',
      'LOW': 'bg-slate-700 text-slate-300'
    };
    return map[priority] || map['LOW'];
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'OVERDUE': return <ShieldAlert size={32} />;
      case 'DEADLINE': return <Clock size={32} />;
      case 'INFO': return <Info size={32} />;
      default: return <Bell size={32} />;
    }
  };

  // --- 📡 RÉCUPÉRATION DES DONNÉES (FLUX & STATS) ---
  const refreshData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsRefreshing(true);
      else setLoading(true);

      const [alertsRes, statsRes] = await Promise.all([
        apiClient.get('/alerts').catch(() => ({ data: [] })),
        apiClient.get<AlertStats>('/alerts/stats').catch(() => ({ data: { unread: 0, critical: 0, overdue: 0, total: 0 } }))
      ]);
      
      // Sécurisation stricte de l'extraction
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
      toast.success("ALERTE ACQUITTÉE. ACTION CORRECTIVE INJECTÉE DANS LE PAQ.", { id: tid });
      refreshData();
    } catch (err) {
      toast.error("IMPOSSIBLE DE TRAITER CETTE ALERTE. VÉRIFIEZ VOS DROITS.", { id: tid });
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/alerts/${id}/read`);
      toast.success("SIGNAL MARQUÉ COMME LU.");
      refreshData(); // Refresh silencieux
    } catch (err) {
      toast.error("ERREUR DE MUTATION LORS DE LA LECTURE.");
    }
  };

  // --- 🔍 MOTEUR DE RECHERCHE PUR ---
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      // Sécurité : Vérifie que Title et Message existent avant d'appeler toLowerCase
      const titleMatch = (a.AL_Title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const messageMatch = (a.AL_Message || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSearch = titleMatch || messageMatch;
      const matchesPriority = filterPriority === 'ALL' || a.AL_Priority === filterPriority;
      
      return matchesSearch && matchesPriority;
    });
  }, [alerts, searchTerm, filterPriority]);

  if (loading && alerts.length === 0) return (
    <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] gap-10">
      <Loader2 className="animate-spin text-blue-600" size={100} strokeWidth={1} />
      <p className="text-blue-500 font-black uppercase italic text-[14px] tracking-[1em] animate-pulse">
        Synchronisation Matrix...
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 lg:p-16 ml-72 text-white font-sans italic text-left selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* INJECTION CSS SÉCURISÉE (Turbopack Safe) */}
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 0px; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}} />

      <div className="w-full max-w-400 mx-auto space-y-12 lg:space-y-20 animate-in fade-in duration-1000">

        {/* 🔝 EN-TÊTE DYNAMIQUE SDE */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b-4 border-white/5 pb-10 lg:pb-16">
          <div className="space-y-6 lg:space-y-8">
            <div className="flex items-center gap-6">
              <span className="px-5 py-2 lg:px-6 lg:py-2 rounded-2xl bg-blue-600/10 border-2 border-blue-600/20 text-blue-500 text-[10px] lg:text-[12px] font-black uppercase tracking-[0.5em] flex items-center gap-4 italic shadow-inner">
                 <Activity size={18} className="animate-pulse" /> Live Monitoring
              </span>
            </div>
            <h1 className="text-5xl lg:text-8xl font-black uppercase italic tracking-tighter leading-none text-white flex items-center gap-4 lg:gap-8 m-0">
              Cockpit <span className="text-blue-600">Alertes</span>
            </h1>
            <p className="text-slate-500 font-black text-[10px] lg:text-[14px] uppercase tracking-[0.6em] italic opacity-80 m-0">
              SURVEILLANCE ISO 9001 & RÉGLEMENTAIRE • TEMPS RÉEL
            </p>
          </div>
          
          <button 
            onClick={() => refreshData(true)} 
            disabled={isRefreshing}
            className="bg-[#151A2D] border-4 border-white/5 px-8 py-5 lg:px-10 lg:py-6 rounded-4xl lg:rounded-[3rem] text-[10px] lg:text-[12px] font-black uppercase italic tracking-[0.4em] flex items-center gap-4 hover:bg-white hover:text-black transition-all cursor-pointer shadow-2xl disabled:opacity-50 w-full lg:w-auto justify-center"
          >
            <RefreshCw size={24} className={isRefreshing ? "animate-spin" : ""} /> 
            {isRefreshing ? "Synchronisation..." : "Actualiser le Flux"}
          </button>
        </header>

        {/* 📊 INDICATEURS DE PERFORMANCE (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
          {[
            { label: 'Non lues', val: stats?.unread || 0, color: 'text-blue-500', icon: <Bell size={80} /> },
            { label: 'Critiques', val: stats?.critical || 0, color: 'text-rose-500', icon: <AlertTriangle size={80} /> },
            { label: 'En retard', val: stats?.overdue || 0, color: 'text-amber-500', icon: <Clock size={80} /> },
            { label: 'Flux Total', val: stats?.total || 0, color: 'text-slate-400', icon: <Target size={80} /> }
          ].map((kpi, i) => (
            <div key={i} className="bg-[#151A2D] p-8 lg:p-12 rounded-[3rem] lg:rounded-[4rem] shadow-2xl border-4 border-white/5 relative overflow-hidden group backdrop-blur-3xl transition-transform hover:-translate-y-2">
              <p className="text-[10px] lg:text-[12px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4 lg:mb-6 relative z-10 m-0">{kpi.label}</p>
              <p className={`text-6xl lg:text-8xl font-black italic ${kpi.color} leading-none tracking-tighter relative z-10 m-0`}>{kpi.val}</p>
              <div className={`absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.1] transition-all duration-700 group-hover:scale-125 ${kpi.color}`}>
                 {kpi.icon}
              </div>
            </div>
          ))}
        </div>

        {/* 🔍 FILTRES DE PRÉCISION */}
        <div className="bg-[#151A2D] p-8 lg:p-10 rounded-[3rem] lg:rounded-[4rem] border-4 border-white/5 flex flex-col xl:flex-row justify-between items-center gap-6 lg:gap-10 backdrop-blur-3xl shadow-2xl relative z-20">
          <div className="relative w-full xl:flex-1">
            <Search className="absolute left-8 lg:left-10 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
            <input 
              type="text" 
              placeholder="RECHERCHER DANS LE REGISTRE DES SIGNAUX..." 
              className="w-full bg-black/60 border-4 border-white/5 rounded-[3rem] lg:rounded-[3.5rem] pl-20 lg:pl-24 pr-8 lg:pr-10 py-6 lg:py-8 text-[12px] lg:text-[14px] font-black uppercase text-white outline-none focus:border-blue-600 transition-all placeholder-slate-700 italic shadow-inner tracking-widest"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full xl:w-auto relative">
             <select 
               value={filterPriority} 
               onChange={(e) => setFilterPriority(e.target.value)}
               className="w-full px-10 lg:px-12 py-6 lg:py-8 bg-black/40 border-4 border-white/5 rounded-[3rem] lg:rounded-[3.5rem] font-black uppercase text-[10px] lg:text-[12px] tracking-[0.4em] text-slate-400 outline-none focus:border-blue-600 cursor-pointer shadow-inner appearance-none italic"
             >
               <option value="ALL" className="bg-[#0B0F1A]">TOUTES LES PRIORITÉS</option>
               <option value="CRITICAL" className="bg-[#0B0F1A]">CRITIQUE UNIQUEMENT</option>
               <option value="HIGH" className="bg-[#0B0F1A]">ÉLEVÉE UNIQUEMENT</option>
               <option value="MEDIUM" className="bg-[#0B0F1A]">MOYENNE UNIQUEMENT</option>
             </select>
             <ChevronDown size={20} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* 📋 REGISTRE DES SIGNAUX */}
        <div className="bg-[#151A2D] rounded-[4rem] lg:rounded-[5rem] shadow-2xl border-4 border-white/5 overflow-hidden backdrop-blur-3xl">
          <div className="divide-y-4 divide-white/5">
            {filteredAlerts.length > 0 ? filteredAlerts.map((alert) => (
              
              // 🛡️ CONTENEUR PRINCIPAL DE LA CARTE D'ALERTE (Structure DOM réparée)
              <div 
                key={alert.AL_Id} 
                className={cn(
                  "p-8 lg:p-12 flex flex-col xl:flex-row gap-8 lg:gap-12 items-start xl:items-center transition-all hover:bg-white/5 relative overflow-hidden group/alert",
                  (alert.AL_Status === 'NEW' || alert.AL_Status === 'UNREAD') ? "bg-blue-900/10" : ""
                )}
              >
                {/* Indicateur Non-Lu (Barre latérale glowy) */}
                {(alert.AL_Status === 'NEW' || alert.AL_Status === 'UNREAD') && (
                   <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-600 shadow-[0_0_20px_#2563eb]" />
                )}
                
                {/* Icône de Type Dynamique */}
                <div className={cn(
                  "shrink-0 w-24 h-24 lg:w-28 lg:h-28 rounded-4xl lg:rounded-[2.5rem] flex items-center justify-center border-4 border-white/5 shadow-inner transition-transform group-hover/alert:scale-110",
                  alert.AL_Priority === 'CRITICAL' ? 'bg-rose-900/30 text-rose-500' : 
                  alert.AL_Priority === 'HIGH' ? 'bg-amber-900/30 text-amber-500' : 'bg-blue-900/30 text-blue-500'
                )}>
                  {getTypeIcon(alert.AL_Type)}
                </div>

                {/* Contenu Texte de l'Alerte */}
                <div className="flex-1 space-y-4 lg:space-y-6 w-full min-w-0">
                  <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                    <span className={cn(
                      "px-4 py-1.5 lg:px-5 lg:py-2 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] italic border border-white/10 shrink-0",
                      getPriorityColor(alert.AL_Priority)
                    )}>
                      {translatePriority(alert.AL_Priority)}
                    </span>
                    <h3 className="text-2xl lg:text-3xl font-black italic uppercase tracking-tighter text-white leading-none m-0 truncate">
                      {alert.AL_Title}
                    </h3>
                  </div>
                  
                  <p className="text-slate-400 font-bold text-xs lg:text-[14px] leading-relaxed max-w-5xl italic uppercase tracking-widest m-0 line-clamp-3">
                    {alert.AL_Message}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 lg:gap-6 pt-2 text-[9px] lg:text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 italic">
                    <span className="flex items-center gap-2 lg:gap-3 bg-black/40 px-4 py-2 lg:px-5 lg:py-2.5 rounded-xl border border-white/5">
                       <Clock size={14} className="text-blue-500" /> {translateType(alert.AL_Type)}
                    </span>
                    <span className="bg-black/40 px-4 py-2 lg:px-5 lg:py-2.5 rounded-xl border border-white/5">
                       DÉCLENCHEMENT : {alert.AL_TriggerDate ? new Date(alert.AL_TriggerDate).toLocaleDateString() : 'N/A'}
                    </span>
                    {alert.AL_DueDate && (
                      <span className="bg-rose-900/20 text-rose-400 px-4 py-2 lg:px-5 lg:py-2.5 rounded-xl border border-rose-500/20">
                         ÉCHÉANCE : {new Date(alert.AL_DueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* 🛡️ BLOC DES BOUTONS (Désormais correctement imbriqué dans la carte) */}
                <div className="flex flex-wrap xl:flex-nowrap gap-4 lg:gap-6 w-full xl:w-auto mt-4 xl:mt-0 shrink-0">
                  {alert.AL_Status !== 'ACKNOWLEDGED' ? (
                    <>
                      <button 
                        onClick={() => handleMarkAsRead(alert.AL_Id)}
                        className="p-5 lg:p-6 text-slate-500 hover:text-white bg-black/40 border-2 border-white/5 rounded-2xl lg:rounded-3xl transition-all cursor-pointer flex items-center justify-center hover:bg-white/10 flex-1 xl:flex-none"
                        title="Marquer comme lu (Garder en attente)"
                      >
                        <CheckCircle size={24} />
                      </button>
                      <button 
                        onClick={() => handleAcknowledge(alert.AL_Id)}
                        className="px-6 py-5 lg:px-10 lg:py-6 bg-blue-600 text-white rounded-3xl lg:rounded-4xl font-black uppercase text-[10px] lg:text-[12px] tracking-[0.4em] hover:bg-white hover:text-blue-600 transition-all cursor-pointer border-none shadow-[0_20px_40px_rgba(37,99,235,0.3)] flex-1 xl:flex-none text-center flex items-center justify-center gap-3 lg:gap-4 group/btn italic"
                      >
                        <Zap size={20} className="group-hover/btn:scale-125 transition-transform" /> Acquitter & Traiter
                      </button>
                    </>
                  ) : (
                    <span className="px-6 py-5 lg:px-10 lg:py-6 bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/20 rounded-3xl lg:rounded-4xl font-black uppercase text-[10px] lg:text-[12px] tracking-[0.4em] flex items-center justify-center gap-3 lg:gap-4 italic w-full xl:w-auto shadow-inner">
                      <CheckCircle size={24} /> Audit Traité
                    </span>
                  )}
                </div>
              </div>
            )) : (
              // --- ÉTAT VIDE (ZÉRO ALERTE) ---
              <div className="py-32 lg:py-40 text-center flex flex-col items-center justify-center gap-8">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-white/5 border-4 border-white/5 flex items-center justify-center mb-4">
                   <CheckCircle className="text-emerald-500/50" size={48} />
                </div>
                <h3 className="text-2xl lg:text-3xl font-black text-white uppercase italic tracking-tighter m-0">
                  Système Nominal
                </h3>
                <p className="text-[10px] lg:text-[12px] font-black text-slate-500 uppercase tracking-[0.6em] italic max-w-md m-0 px-4">
                   Aucune alerte en attente dans le registre souverain. La conformité est assurée.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 🧩 FOOTER SDE */}
        <div className="mt-12 lg:mt-20 pt-12 lg:pt-16 border-t-4 border-white/5 text-center opacity-40 hover:opacity-100 transition-opacity duration-700">
          <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[1em] text-slate-500 italic flex items-center justify-center gap-4 lg:gap-6 m-0">
             <Zap size={14} className="text-blue-500" /> Qualisoft Elite RD 2030 • Surveillance Intelligente
          </p>
        </div>
      </div>
    </div>
  );
}