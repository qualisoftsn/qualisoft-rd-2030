/**
 * 🔔 MODULE : NotificationCenter.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Hub central de monitoring QHSE.
 * FONCTION : Signalement des écarts et des rappels de maintenance.
 * DESIGN : Elite Sovereign UI - Italic & High-Density.
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 18:45 GMT
 */

"use client";

import { useState } from 'react';
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

export function NotificationCenter() {
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
        className="relative p-4 bg-white border border-slate-100 rounded-[1.2rem] hover:bg-slate-50 transition-all shadow-xl group active:scale-90 border-none cursor-pointer"
      >
        <Bell size={22} className={`transition-colors ${notifications.length > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-lg animate-bounce">
            {notifications.length}
          </span>
        )}
      </button>

      {/* 📂 PANNEAU DE FLUX SDE */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-6 w-104 bg-white border border-slate-200 rounded-[3rem] shadow-4xl z-50 overflow-hidden animate-in slide-in-from-top-4 duration-500">
            
            <header className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                   <ShieldAlert className="text-white" size={16} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-[12px] tracking-[0.2em] italic m-0 leading-none">Tour de Contrôle</h4>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 m-0">Flux QSE scellé</p>
                </div>
              </div>
              <button onClick={() => setNotifications([])} className="text-[9px] font-black text-blue-600 hover:text-blue-800 transition-all uppercase italic border-none bg-transparent cursor-pointer">
                Tout acquitter
              </button>
            </header>

            <div className="max-h-120 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                  <Bell className="mx-auto opacity-5 text-slate-900" size={60} />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-relaxed">Le registre est vierge <br/> Aucun signalement actif</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-7 border-b border-slate-50 hover:bg-blue-50/40 transition-all flex gap-5 group relative text-left">
                    <div className={`mt-1 shrink-0 ${
                      n.type === 'urgent' ? 'text-red-500' : 
                      n.type === 'success' ? 'text-emerald-500' : 'text-blue-500'
                    }`}>
                      {n.type === 'urgent' ? <AlertCircle size={22} /> : 
                       n.type === 'success' ? <CheckCircle2 size={22} /> : <Info size={22} />}
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tighter italic m-0">{n.title}</p>
                        <span className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase italic">
                           <Clock size={10} /> {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-bold italic m-0">{n.desc}</p>
                    </div>

                    <button 
                      onClick={() => removeNotif(n.id)} 
                      className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-600 transition-all border-none bg-transparent cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <footer className="p-6 bg-slate-50 text-center border-t border-slate-100">
               <button className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-600 transition-all flex items-center justify-center gap-3 mx-auto border-none bg-transparent cursor-pointer italic">
                 Consulter le journal de bord complet <ChevronRight size={14} />
               </button>
            </footer>
          </div>
        </>
      )}
    </div>
  );
}