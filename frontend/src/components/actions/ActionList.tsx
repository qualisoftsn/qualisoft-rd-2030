/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📋 COMPOSANT : ActionList (ISO 9001 §10.2)
 * RÔLE : Reporting tabulaire des actions correctives
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { Clock, Link as LinkIcon, AlertCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type ActionStatus = 'A_FAIRE' | 'EN_COURS' | 'TERMINEE';

export interface ActionResponsable {
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_Id?: string;
}

export interface ActionReclamation {
  REC_Reference: string;
  REC_Id?: string;
}

export interface IAction {
  ACT_Id: string;
  ACT_Title: string;
  ACT_Description?: string;
  ACT_Status: ActionStatus;
  ACT_Deadline: string;
  ACT_Origin: string;
  ACT_Responsable?: ActionResponsable;
  ACT_Reclamation?: ActionReclamation;
  ACT_Priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ACT_CreatedAt?: string;
  ACT_UpdatedAt?: string;
}

export interface ActionListProps {
  actions: IAction[];
  onActionClick?: (action: IAction) => void;
}

// ============================================================================
// SOUS-COMPOSANT : STATUS BADGE
// ============================================================================

interface StatusBadgeProps {
  status: ActionStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<ActionStatus, string> = {
    TERMINEE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    EN_COURS: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]",
    A_FAIRE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <span 
      className={cn(
        "px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase italic border transition-all inline-block",
        styles[status] || "bg-slate-800 text-slate-400"
      )}
      aria-label={`Statut: ${status.replace('_', ' ')}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ActionList({ actions, onActionClick }: ActionListProps) {
  const handleRowClick = (action: IAction) => {
    onActionClick?.(action);
  };

  const handleRowKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>, action: IAction) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick(action);
    }
  };

  return (
    <article 
      className="bg-[#0F172A] rounded-xl md:rounded-2xl lg:rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden animate-in fade-in duration-700 text-left"
      aria-labelledby="actions-title"
      role="region"
    >
      <h2 id="actions-title" className="sr-only">Liste des actions correctives</h2>
      
      <div className="overflow-x-auto" role="region" aria-label="Tableau des actions" tabIndex={0}>
        <table className="min-w-full divide-y divide-white/5" role="table">
          <thead className="bg-white/2" role="rowgroup">
            <tr role="row">
              <th 
                className="px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 text-left text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 italic"
                scope="col"
                role="columnheader"
              >
                Libellé / Description
              </th>
              <th 
                className="px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 text-left text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 italic"
                scope="col"
                role="columnheader"
              >
                Pilote Responsable
              </th>
              <th 
                className="px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 text-left text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 italic"
                scope="col"
                role="columnheader"
              >
                Origine & Lien
              </th>
              <th 
                className="px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 text-left text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 italic"
                scope="col"
                role="columnheader"
              >
                Statut Flux
              </th>
              <th 
                className="px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 text-left text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 italic"
                scope="col"
                role="columnheader"
              >
                Échéance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-transparent" role="rowgroup">
            {actions.length > 0 ? actions.map((action) => {
              const initials = `${action.ACT_Responsable?.U_FirstName?.[0] || ''}${action.ACT_Responsable?.U_LastName?.[0] || ''}`.toUpperCase();
              
              return (
                <tr 
                  key={action.ACT_Id} 
                  className="hover:bg-blue-600/5 transition-all duration-300 group focus-within:bg-blue-600/5 focus:outline-none"
                  role="row"
                  tabIndex={0}
                  onClick={() => handleRowClick(action)}
                  onKeyDown={(e) => handleRowKeyDown(e, action)}
                  aria-label={`Action: ${action.ACT_Title}`}
                >
                  <td className="px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 lg:py-7">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] md:text-sm font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-blue-400 transition-colors truncate">
                        {action.ACT_Title}
                      </span>
                      <p className="text-[9px] md:text-[10px] lg:text-[11px] text-slate-500 font-bold mt-1 md:mt-1.5 lg:mt-2 italic uppercase opacity-60 truncate max-w-xs m-0">
                        {action.ACT_Description || "AUCUN DÉTAIL SCELLÉ"}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 lg:py-7">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div 
                        className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-slate-800 rounded-lg md:rounded-xl flex items-center justify-center text-[9px] md:text-[10px] lg:text-[11px] font-black text-white italic border border-white/10 shadow-lg group-hover:bg-blue-600 group-hover:border-blue-400 transition-all shrink-0"
                        aria-hidden="true"
                      >
                        {initials || '?'}
                      </div>
                      <span className="text-[10px] md:text-xs font-black text-slate-300 italic uppercase tracking-tight truncate max-w-[150px] md:max-w-[200px]">
                        {action.ACT_Responsable 
                          ? `${action.ACT_Responsable.U_FirstName} ${action.ACT_Responsable.U_LastName}`
                          : 'NON ASSIGNÉ'
                        }
                      </span>
                    </div>
                  </td>

                  <td className="px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 lg:py-7">
                    {action.ACT_Reclamation ? (
                      <div className="inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-lg md:rounded-xl">
                        <LinkIcon size={10} className="w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" />
                        <span className="text-[8px] md:text-[9px] font-black uppercase italic tracking-tighter leading-none">
                          {action.ACT_Reclamation.REC_Reference}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 md:gap-2 text-slate-600 group-hover:text-slate-400 transition-colors">
                        <ShieldCheck size={10} className="w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" />
                        <span className="text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest italic leading-none">
                          {action.ACT_Origin}
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 lg:py-7">
                    <StatusBadge status={action.ACT_Status} />
                  </td>

                  <td className="px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 lg:py-7 text-right">
                    <div className="flex items-center justify-end gap-2 md:gap-3 font-black text-slate-500 italic text-[10px] md:text-xs">
                      <Clock size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 group-hover:text-blue-400 transition-colors" aria-hidden="true" />
                      <span className="tabular-nums">
                        {action.ACT_Deadline 
                          ? new Date(action.ACT_Deadline).toLocaleDateString('fr-SN') 
                          : '---'
                        }
                      </span>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr role="row">
                <td colSpan={5} className="px-4 md:px-6 lg:px-8 py-16 md:py-20 lg:py-24 lg:py-32 text-center" role="status">
                  <div className="flex flex-col items-center animate-in zoom-in duration-500">
                    <AlertCircle size={32} className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-slate-800 mb-4 md:mb-6" aria-hidden="true" />
                    <p className="text-slate-600 font-black uppercase italic text-[9px] md:text-[10px] tracking-widest">
                      Registre Vierge : Aucune action détectée
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}