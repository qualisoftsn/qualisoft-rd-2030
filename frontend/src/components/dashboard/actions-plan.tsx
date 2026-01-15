'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  //AlertCircle, 
  User, 
  Calendar,
  MoreVertical
} from 'lucide-react';

const ACTIONS_MOCK = [
  { id: '1', title: 'Réparer la fuite hydraulique Zone B', responsible: 'M. SARR', dueDate: '2025-12-30', priority: 'HIGH', status: 'IN_PROGRESS' },
  { id: '2', title: 'Achat de nouveaux EPI (Gants)', responsible: 'A. DIALLO', dueDate: '2026-01-05', priority: 'MEDIUM', status: 'OPEN' },
  { id: '3', title: 'Formation sécurité nouveaux arrivants', responsible: 'R. KANE', dueDate: '2025-12-28', priority: 'CRITICAL', status: 'OPEN' },
];

const getPriorityColor = (p: string) => {
  if (p === 'CRITICAL') return 'bg-red-100 text-red-700 border-red-200';
  if (p === 'HIGH') return 'bg-orange-100 text-orange-700 border-orange-200';
  return 'bg-blue-100 text-blue-700 border-blue-200';
};

export function ActionPlan() {
  return (
    <div className="space-y-6">
      {ACTIONS_MOCK.map((action) => (
        <div key={action.id} className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getPriorityColor(action.priority)}`}>
                  {action.priority}
                </span>
                <span className="text-slate-300 text-xs font-bold">#{action.id}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">{action.title}</h3>
              
              <div className="flex flex-wrap items-center gap-6 text-slate-500">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <User size={14} className="text-slate-400" />
                  <span>{action.responsible}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Calendar size={14} className="text-slate-400" />
                  <span>{new Date(action.dueDate).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Statut</span>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                   {action.status === 'DONE' ? <CheckCircle2 size={16} className="text-green-500" /> : <Clock size={16} className="text-blue-500" />}
                   <span className="text-xs font-black text-slate-700">{action.status}</span>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-300 hover:text-slate-600">
                <MoreVertical size={20} />
              </button>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}