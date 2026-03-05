/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : ALERTS-CENTER §7.4 (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Centralisation et acquittement des flux système et alertes.
 * DESIGN : 100dvh, Dark Industrial, Glassmorphism, No-Scroll Global.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 17:42 GMT
 */

'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Bell, AlertTriangle, CheckCircle, ShieldAlert, Clock, 
  ChevronRight, RefreshCw, Trash2, Info, Activity, Fingerprint, X
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import apiClient from '@/core/api/api-client';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'INFO'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- 📡 SYNCHRONISATION KERNEL ---
  const fetchNotifications = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const response = await apiClient.get('/notifications/me');
      const data = response.data?.data || response.data || [];
      setNotifications(Array.isArray(data) ? data : []);
      if (isManual) toast.success("FLUX MATRICIEL SYNCHRONISÉ");
    } catch {
      toast.error("RUPTURE DE LIAISON KERNEL");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(), 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    const backup = [...notifications];
    setNotifications(prev => prev.filter(n => n.N_Id !== id));
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch {
      toast.error("ÉCHEC DE L'ACQUITTEMENT");
      setNotifications(backup);
    }
  };

  const handleMarkAllRead = async () => {
    if (notifications.length === 0) return;
    if(!confirm("SCELLAGE : Confirmer l'acquittement global du flux ?")) return;
    const backup = [...notifications];
    setNotifications([]); 
    try {
      await apiClient.patch('/notifications/read-all');
      toast.success("REGISTRE RÉINITIALISÉ");
    } catch {
      setNotifications(backup);
      toast.error("ERREUR DE PURGE");
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (activeFilter === 'CRITICAL') return ['DANGER', 'SSE_ALERT', 'WARNING'].includes(n.N_Type);
      if (activeFilter === 'INFO') return ['INFO', 'SUCCESS'].includes(n.N_Type);
      return true;
    });
  }, [notifications, activeFilter]);

  if (loading) return <LoadingScreen label="Scan des fréquences d'alerte..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" theme="dark" richColors />
      
      {/* 🔝 HEADER TACTIQUE */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-40 gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-3 text-blue-500 text-[10px] tracking-[0.4em]">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shadow-[0_0_12px_#2563eb]" />
            Sovereign Alert System Active
          </div>
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0">Alerts <span className="text-blue-600">Center</span></h1>
        </div>
        <div className="flex gap-4">
          <button onClick={handleMarkAllRead} className="px-8 py-4 rounded-2xl bg-white/5 border border-white/5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all text-[10px] cursor-pointer italic uppercase tracking-widest">
            <Trash2 size={16} className="inline mr-2" /> Purger Flux
          </button>
          <button onClick={() => fetchNotifications(true)} disabled={isRefreshing} className="px-8 py-4 rounded-2xl bg-blue-600 text-white shadow-4xl text-[10px] cursor-pointer italic uppercase tracking-widest border-none">
            <RefreshCw size={16} className={cn("inline mr-2", isRefreshing && "animate-spin")} /> Actualiser
          </button>
        </div>
      </header>

      {/* 🧭 SEGMENTATION */}
      <nav className="shrink-0 p-8 pb-4 flex gap-4 overflow-x-auto custom-scrollbar">
        {['ALL', 'CRITICAL', 'INFO'].map((f: any) => (
          <button key={f} onClick={() => setActiveFilter(f)} className={cn(
            "px-8 py-3 rounded-xl border text-[10px] transition-all cursor-pointer italic whitespace-nowrap",
            activeFilter === f ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-slate-900 text-slate-500 border-white/5 hover:text-white'
          )}>
            {f === 'ALL' ? 'Flux Intégral' : f === 'CRITICAL' ? 'Priorité Haute' : 'Informations'}
          </button>
        ))}
      </nav>

      {/* 📋 WORKZONE (Scroll Isolé) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4 space-y-6">
        {filteredNotifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[4rem] opacity-20">
            <Bell size={64} className="mb-6" />
            <p className="tracking-[0.5em]">Canal Silencieux</p>
          </div>
        ) : (
          filteredNotifications.map((notif, idx) => (
            <article key={notif.N_Id} className="group relative rounded-[3rem] bg-[#151B2B] border-2 border-white/5 p-8 transition-all duration-500 hover:border-blue-500/30 hover:translate-x-3 shadow-2xl flex flex-col md:flex-row gap-8 items-center">
              <div className={cn("absolute left-0 top-10 bottom-10 w-1.5 rounded-r-full", ['DANGER', 'SSE_ALERT'].includes(notif.N_Type) ? 'bg-red-500' : 'bg-blue-600')} />
              <div className="shrink-0 w-20 h-20 rounded-2xl bg-black/40 flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                {['DANGER', 'SSE_ALERT'].includes(notif.N_Type) ? <ShieldAlert className="text-red-500" size={32} /> : <Info className="text-blue-500" size={32} />}
              </div>
              <div className="flex-1 space-y-3 text-left">
                <h3 className="text-2xl tracking-tighter text-white m-0 group-hover:text-blue-400 transition-colors">{notif.N_Title}</h3>
                <p className="text-slate-400 text-sm normal-case font-bold leading-relaxed m-0 italic line-clamp-2">{notif.N_Message}</p>
                <div className="flex gap-6 text-[9px] text-slate-600 tracking-widest pt-2">
                  <span className="flex items-center gap-2"><Clock size={12} /> {new Date(notif.N_CreatedAt).toLocaleString()}</span>
                  <span className="flex items-center gap-2"><Activity size={12} /> {notif.N_Type}</span>
                </div>
              </div>
              <button onClick={() => handleMarkAsRead(notif.N_Id)} className="w-full md:w-auto px-10 py-5 bg-white/5 hover:bg-blue-600 hover:text-white rounded-3xl text-[10px] transition-all border-none cursor-pointer italic">
                Acquitter <ChevronRight size={16} className="inline ml-2" />
              </button>
            </article>
          ))
        )}
      </main>

      <footer className="shrink-0 p-6 border-t border-white/5 flex justify-between items-center bg-black/20 opacity-60">
        <div className="flex items-center gap-4">
          <Fingerprint size={32} className="text-blue-600" />
          <span className="text-[10px] tracking-widest">Registre SMI • {notifications.length} Alertes Actives</span>
        </div>
        <div className="flex gap-2"><div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /><div className="w-2 h-2 rounded-full bg-emerald-600" /></div>
      </footer>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={60} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center">{label}</span>
    </div>
  );
}