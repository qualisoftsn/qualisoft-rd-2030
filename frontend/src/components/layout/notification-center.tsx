'use client';

/**
 * 🔔 MODULE : NOTIFICATION CENTER (FLUX QSE)
 * -------------------------------------------------------------------------
 * FONCTION : Hub central des alertes et rappels de conformité.
 * RÔLE : Informer l'utilisateur des tâches urgentes (Audit, NC, VGP).
 * ISOLATION : Uniquement les messages liés au contexte de l'organisation active.
 */

import React, { useState } from 'react';
import { Bell, AlertCircle, CheckCircle2, X, ShieldAlert } from 'lucide-react';

// Simulation de flux scellé
const MOCK_NOTIFS = [
  { id: 1, title: 'ACTION EN RETARD', desc: 'Fuite cuve Zone A - Échéance dépassée', type: 'urgent', time: '12:45' },
  { id: 2, title: 'AUDIT ISO VALIDÉ', desc: 'Le rapport d\'audit 9001 est conforme', type: 'success', time: '09:30' },
];

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFS);

  // Suppression locale (Révocation de l'alerte)
  const removeNotif = (id: number) => setNotifications(n => n.filter(item => item.id !== id));

  return (
    <div className="relative font-sans italic">
      {/* TRIGGER : CLOCHE DE SÉCURITÉ */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-4 bg-white border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group active:scale-95 border-none cursor-pointer"
      >
        <Bell size={22} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-lg animate-bounce">
            {notifications.length}
          </span>
        )}
      </button>

      {/* PANNEAU DÉROULANT DES ALERTES */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-96 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-4xl z-50 overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <ShieldAlert className="text-blue-600" size={18} />
                <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-[0.2em] italic leading-none">Tour de Contrôle</h4>
              </div>
              <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase italic">Filtre SMI Elite</span>
            </div>

            <div className="max-h-120 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-16 text-center text-slate-400 space-y-4">
                  <Bell className="mx-auto opacity-10" size={48} />
                  <p className="text-xs font-bold uppercase tracking-widest italic leading-relaxed">Le registre est vierge <br/> Aucune alerte en attente</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-6 border-b border-slate-50 hover:bg-blue-50/30 transition-all flex gap-4 group relative text-left">
                    <div className={`mt-1 shrink-0 ${n.type === 'urgent' ? 'text-red-500' : 'text-emerald-500'}`}>
                      {n.type === 'urgent' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tighter italic">{n.title}</p>
                        <span className="text-[8px] font-bold text-slate-400 font-mono tracking-tighter">[{n.time}]</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug font-medium italic pr-4">{n.desc}</p>
                    </div>
                    <button 
                      onClick={() => removeNotif(n.id)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all border-none bg-transparent cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 bg-slate-50 text-center">
               <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-all border-none bg-transparent cursor-pointer italic">
                 Voir tout l&apos;historique des événements
               </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}