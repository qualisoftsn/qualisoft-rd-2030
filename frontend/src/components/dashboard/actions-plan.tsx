/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📋 MODULE : ActionPlan.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Suivi opérationnel des actions correctives.
 * RÉVISION : 02 Mars 2026 | 18:35 GMT
 */

"use client";

import React from 'react';
import { CheckCircle2, Clock, User, Calendar, MoreVertical, ShieldCheck } from 'lucide-react';

export function ActionPlan({ actions }: { actions?: any[] }) {
  const data = actions || [];

  return (
    <div className="space-y-4 animate-in fade-in duration-700 italic font-sans">
      {data.map((action) => (
        <div key={action.id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-200 hover:border-blue-500/50 hover:shadow-2xl transition-all duration-500 relative overflow-hidden text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1 rounded-xl text-[8px] font-black border uppercase tracking-widest ${
                  action.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-600 border-red-200' : 'bg-blue-500/10 text-blue-600 border-blue-200'
                }`}>
                  {action.priority}
                </span>
                <span className="text-slate-300 text-[9px] font-black tracking-widest leading-none">#{action.id}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tighter m-0 leading-none">
                {action.title}
              </h3>
              <div className="flex items-center gap-6 text-slate-500">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tight italic">
                  <User size={12} className="text-blue-500" /> {action.responsible}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tight italic">
                  <Calendar size={12} /> {new Date(action.dueDate).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 shrink-0">
              <div className="text-right">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                  action.status === 'DONE' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-600'
                }`}>
                  {action.status === 'DONE' ? <CheckCircle2 size={14} /> : <Clock size={14} className="animate-pulse" />}
                  <span className="text-[9px] font-black uppercase tracking-widest leading-none">{action.status}</span>
                </div>
              </div>
              <button className="p-2 text-slate-300 hover:text-slate-950 transition-colors bg-transparent border-none cursor-pointer"><MoreVertical size={18} /></button>
            </div>
          </div>
          <ShieldCheck className="absolute -right-4 -bottom-4 text-slate-100 opacity-20 rotate-12" size={100} />
        </div>
      ))}
    </div>
  );
}
