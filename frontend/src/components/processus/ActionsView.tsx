/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
// 🟢 CORRECTION : Ajout de 'Users' dans les imports
import { Clock, CheckCircle, AlertTriangle, Users, ArrowRight } from 'lucide-react';

export default function ActionsView({ actions }: { actions: any[] }) {
  if (!actions || actions.length === 0) {
    return (
        <div className="p-6 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <p className="text-slate-500 italic text-xs font-bold uppercase">Aucune action associée</p>
        </div>
    );
  }

  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <div key={action.ACT_Id || Math.random()} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
           <div className="flex justify-between items-start mb-2">
              <h4 className="font-black text-white text-xs uppercase italic truncate pr-4">{action.ACT_Title}</h4>
              <span className={`shrink-0 px-2 py-1 rounded-lg text-[8px] font-black border ${
                  action.ACT_Status === 'CLOTUREE' 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                  : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
              }`}>
                {action.ACT_Status || 'EN_COURS'}
              </span>
           </div>
           
           <p className="text-slate-400 text-[10px] mb-3 line-clamp-2 font-medium leading-relaxed">
             {action.ACT_Description || "Pas de description"}
           </p>

           {/* 🟢 BLOC CORRIGÉ AVEC L'ICÔNE USERS */}
           <div className="flex items-center gap-4 text-[8px] font-black text-slate-500 uppercase italic">
              <span className="flex items-center gap-1">
                <Clock size={10} /> Échéance : {action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString() : 'N/A'}
              </span>
              <span className="flex items-center gap-1 text-blue-400 group-hover:text-blue-300 transition-colors">
                <Users size={10} /> Resp : {action.ACT_Responsable?.U_LastName || 'NON ASSIGNÉ'}
              </span>
           </div>
        </div>
      ))}
    </div>
  );
}