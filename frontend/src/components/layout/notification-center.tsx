'use client';

/**
 * 🔔 MODULE : NotificationCenter.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Hub central de monitoring QHSE.
 * FONCTION : Signalement des écarts et des rappels de maintenance.
 * DESIGN : Elite Sovereign UI - Italic & High-Density.
 * RÉVISION : 09 Mars 2026 | 17:05 GMT
 * -------------------------------------------------------------------------
 */

import React, { useState } from 'react';
import { 
  Bell, AlertCircle, CheckCircle2, X, ShieldAlert, 
  ChevronRight, Info, Clock 
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  desc: string;
  type: 'urgent' | 'success' | 'info';
  time: string;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'ACTION EN RETARD', desc: 'Fuite cuve Zone A - Échéance dépassée §14001', type: 'urgent', time: '12:45' },
    { id: '2', title: 'AUDIT ISO VALIDÉ', desc: 'Rapport d\'audit interne 9001 conforme', type: 'success', time: '09:30' },
    { id: '3', title: 'VEILLE RÉGLEMENTAIRE', desc: 'Nouvelle mise à jour Code du Travail', type: 'info', time: 'HIER' },
  ]);

  const removeNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notifications.length === 1) setIsOpen(false);
  };

  return (
    <div className="relative font-sans italic">
      {/* 🔔 CLOCHE DE SÉCURITÉ MATRICIELLE */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 md:p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all shadow-xl group active:scale-95 border-none cursor-pointer"
      >
        <Bell size={20} className={`transition-colors ${notifications.length > 0 ? 'text-blue-500' : 'text-slate-400'}`} />
        {notifications.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-600 border border-white/10 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-lg animate-pulse">
            {notifications.length}
          </span>
        )}
      </button>

      {/* 📂 PANNEAU DE FLUX SDE */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-80 md:w-96 bg-[#0B0F1A] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-in slide-in-from-top-4 duration-300">
            
            <header className="p-6 border-b border-white/5 flex justify-between items-center bg-[#050810]/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                   <ShieldAlert className="text-white" size={16} />
                </div>
                <div>
                  <h4 className="font-black text-white uppercase text-[11px] tracking-[0.2em] italic m-0 leading-none">Tour de Contrôle</h4>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1 m-0">Flux QSE scellé</p>
                </div>
              </div>
              <button onClick={() => setNotifications([])} className="text-[9px] font-black text-blue-500 hover:text-white transition-all uppercase italic border-none bg-transparent cursor-pointer">
                Tout acquitter
              </button>
            </header>

            <div className="max-h-96 overflow-y-auto custom-scrollbar bg-[#0B0F1A]">
              {notifications.length === 0 ? (
                <div className="p-16 text-center space-y-4">
                  <Bell className="mx-auto opacity-10 text-white" size={48} />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-relaxed">Le registre est vierge <br/> Aucun signalement actif</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-5 border-b border-white/5 hover:bg-white/5 transition-all flex gap-4 group relative text-left">
                    <div className={`mt-0.5 shrink-0 ${
                      n.type === 'urgent' ? 'text-red-500' : 
                      n.type === 'success' ? 'text-emerald-500' : 'text-blue-500'
                    }`}>
                      {n.type === 'urgent' ? <AlertCircle size={20} /> : 
                       n.type === 'success' ? <CheckCircle2 size={20} /> : <Info size={20} />}
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex justify-between items-start mb-1.5">
                        <p className="text-[10px] font-black text-slate-200 leading-none uppercase tracking-widest italic m-0 truncate">{n.title}</p>
                        <span className="flex items-center gap-1 text-[8px] font-black text-slate-500 uppercase italic shrink-0">
                           <Clock size={10} /> {n.time}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-bold italic m-0">{n.desc}</p>
                    </div>

                    <button 
                      onClick={() => removeNotif(n.id)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all border-none cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <footer className="p-4 bg-[#050810] text-center border-t border-white/5">
               <button className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2 mx-auto border-none bg-transparent cursor-pointer italic">
                 Journal de bord complet <ChevronRight size={14} />
               </button>
            </footer>
          </div>
        </>
      )}
    </div>
  );
}