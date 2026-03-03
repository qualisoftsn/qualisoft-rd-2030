/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : notification-bell.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Organe visuel de notification avec feedback instantané.
 * RÉVISION : 04 Mars 2026 | 00:05 GMT
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, BellRing, ShieldAlert, Info, Activity } from 'lucide-react'; // ✅ Activity importé
import { useSocket } from '@/hooks/use-socket';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/core/api/api-client';
import { toast } from 'sonner';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore() as any;
  const socket = useSocket('matrix-alerts');

  const loadHistory = useCallback(async () => {
    try {
      const res = await apiClient.get('/notifications/me');
      setNotifications(res.data);
    } catch (err) {
      console.error("Échec synchro registre");
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  useEffect(() => {
    if (!socket || !user) return;

    // Réception des alertes critiques
    socket.on('CRITICAL_EVENT', (data: any) => {
      setNotifications(prev => [data, ...prev]);
      toast.error(`ALERTE : ${data.title}`, { description: data.message });
    });

    // Réception des alertes ciblées par ID utilisateur
    socket.on(`user-notif-${user.U_Id}`, (data: any) => {
      setNotifications(prev => [data, ...prev]);
      toast.info(data.title);
    });

    return () => {
      socket.off('CRITICAL_EVENT');
      socket.off(`user-notif-${user.U_Id}`);
    };
  }, [socket, user]);

  const unreadCount = notifications.filter(n => !n.N_IsRead).length;

  return (
    <div className="relative italic font-sans">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer relative border-none"
      >
        {unreadCount > 0 ? (
          <BellRing size="20" className="text-blue-500 animate-bounce" />
        ) : (
          <Bell size="20" className="text-slate-500" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0B0F1A] text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-6 w-96 bg-[#0F172A] border border-white/10 rounded-[2.5rem] shadow-2xl z-110 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <Activity size="14" className="text-blue-500" /> {/* ✅ size="14" string fixé */}
                <span className="text-[10px] font-black uppercase tracking-widest text-white italic">Alertes Matrix</span>
             </div>
             <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest animate-pulse italic">Temps Réel Actif</span>
          </div>
          <div className="max-h-87.5 overflow-y-auto custom-scrollbar">
            {notifications.map((n, i) => (
              <div key={i} className="p-5 border-b border-white/5 hover:bg-white/5 transition-colors flex gap-4">
                <div className="mt-1">
                  {n.N_Type === 'CRITICAL' ? <ShieldAlert size="16" className="text-red-500" /> : <Info size="16" className="text-blue-500" />}
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-[10px] font-black text-white m-0 italic uppercase">{n.N_Title || n.title}</p>
                  <p className="text-[9px] text-slate-500 font-bold m-0 leading-relaxed">{n.N_Message || n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}