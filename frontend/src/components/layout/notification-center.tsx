'use client';

import React, { useState } from 'react';
import { Bell, AlertCircle, CheckCircle2, X } from 'lucide-react';

const MOCK_NOTIFS = [
  { id: 1, title: 'Action en retard', desc: 'Fuite cuve Zone A - Échéance dépassée', type: 'urgent' },
  { id: 2, title: 'Audit validé', desc: 'L\'audit ISO 9001 est conforme', type: 'success' },
];

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFS);

  const removeNotif = (id: number) => setNotifications(n => n.filter(item => item.id !== id));

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
      >
        <Bell size={20} className="text-slate-600" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 bg-white border border-slate-200 rounded-4xl shadow-2xl z-50 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Notifications</h4>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Filtre QSE</span>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-8 text-center text-slate-400 text-sm italic">Aucune nouvelle alerte</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-all flex gap-3 group">
                  <div className={`mt-1 ${n.type === 'urgent' ? 'text-red-500' : 'text-emerald-500'}`}>
                    {n.type === 'urgent' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 leading-none mb-1">{n.title}</p>
                    <p className="text-xs text-slate-500 leading-tight">{n.desc}</p>
                  </div>
                  <button onClick={() => removeNotif(n.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-slate-600 transition-all">
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}