/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 📋 MODULE : ActionPlan
 * -------------------------------------------------------------------------
 * FONCTION : Visualisation des actions correctives et préventives (§10.2 ISO 9001).
 * RÔLE : Suivi opérationnel des levées d'écarts par pilote.
 * ISOLATION : Les données injectées sont filtrées par le Kernel en amont.
 */

'use client';

import React from 'react';
import { 
  CheckCircle2, Clock, User, Calendar, MoreVertical, AlertTriangle, ShieldCheck 
} from 'lucide-react';

// --- TYPAGE DES ACTIONS SOUVERAINES ---
interface IAction {
  id: string;
  title: string;
  responsible: string;
  dueDate: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';
}

const getPriorityStyle = (p: string) => {
  const styles = {
    CRITICAL: 'bg-red-500/10 text-red-600 border-red-200 shadow-sm shadow-red-500/5',
    HIGH: 'bg-orange-500/10 text-orange-600 border-orange-200',
    MEDIUM: 'bg-blue-500/10 text-blue-600 border-blue-200',
    LOW: 'bg-slate-100 text-slate-500 border-slate-200'
  };
  return styles[p as keyof typeof styles] || styles.LOW;
};

export function ActionPlan({ actions }: { actions?: IAction[] }) {
  // Utilisation des mocks si aucune data n'est passée (Fallback de développement)
  const data = actions || [
    { id: 'ACT-2026-001', title: 'Réparer la fuite hydraulique Zone B', responsible: 'M. SARR', dueDate: '2026-02-28', priority: 'HIGH', status: 'IN_PROGRESS' },
    { id: 'ACT-2026-002', title: 'Achat de nouveaux EPI (Gants)', responsible: 'A. DIALLO', dueDate: '2026-03-05', priority: 'MEDIUM', status: 'OPEN' },
    { id: 'ACT-2026-003', title: 'Formation sécurité nouveaux arrivants', responsible: 'R. KANE', dueDate: '2026-02-20', priority: 'CRITICAL', status: 'OPEN' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 italic">
      {data.map((action) => (
        <div key={action.id} className="group bg-white p-7 rounded-[2.5rem] border border-slate-200 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black border uppercase tracking-widest ${getPriorityStyle(action.priority)}`}>
                  {action.priority}
                </span>
                <span className="text-slate-300 text-[10px] font-black tracking-widest">#{action.id}</span>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tighter leading-none">
                {action.title}
              </h3>
              
              <div className="flex flex-wrap items-center gap-8 text-slate-500">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-tight">
                  <User size={14} className="text-blue-500" />
                  <span>Pilote : {action.responsible}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-tight">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Échéance : {new Date(action.dueDate).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">État du Flux</span>
                <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border ${
                  action.status === 'DONE' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'
                }`}>
                   {action.status === 'DONE' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Clock size={16} className="text-blue-500 animate-pulse" />}
                   <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{action.status.replace('_', ' ')}</span>
                </div>
              </div>
              <button className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-300 hover:text-slate-900 border-none cursor-pointer">
                <MoreVertical size={20} />
              </button>
            </div>

          </div>
          {/* Filigrane de sécurité Matrix */}
          <ShieldCheck className="absolute -right-4 -bottom-4 text-slate-50 opacity-[0.03] rotate-12" size={120} />
        </div>
      ))}
    </div>
  );
}