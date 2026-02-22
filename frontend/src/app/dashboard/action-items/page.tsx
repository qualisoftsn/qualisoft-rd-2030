/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 📝 MODULE : SUIVI DES TÂCHES OPÉRATIONNELLES (CAPA)
 * -------------------------------------------------------------------------
 * RÔLE : Dispatching et suivi des actions par responsable.
 * RÉFÉRENTIEL : types/elite-sde (Action, ActionStatus).
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { Calendar, User, Activity, CheckCircle, Clock } from 'lucide-react';
import { Action, ActionStatus } from '@/types/elite-sde';

export default function ActionItemsPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActions = useCallback(async () => {
    try {
      const res = await apiClient.get('/actions');
      setActions(res.data?.data || res.data);
    } catch (err) { console.error("RUPTURE SYNC ACTIONS"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadActions(); }, [loadActions]);

  return (
    <div className="min-h-screen bg-[#0F172A] p-16 ml-72 text-left italic font-sans overflow-hidden">
      <div className="mb-20 space-y-4 max-w-500 mx-auto w-full">
        <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
          Suivi des <span className="text-blue-600">Tâches</span>
        </h1>
        <p className="text-slate-500 font-black uppercase tracking-[0.6em] text-[11px] italic">Distribution individuelle du plan CAPA</p>
      </div>

      <div className="bg-slate-900/40 rounded-[4rem] border-2 border-white/5 shadow-4xl overflow-hidden max-w-500 mx-auto w-full backdrop-blur-md">
        {loading ? (
          <div className="p-40 text-center animate-pulse text-blue-500 font-black uppercase italic text-sm tracking-[1em]">Scanning Noyau Tâches...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 border-b-2 border-white/5 italic">
              <tr>
                <th className="p-12 text-[12px] font-black uppercase tracking-[0.4em] text-slate-500">Action / Nature de l&apos;Écart</th>
                <th className="p-12 text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 text-center">Pilotage</th>
                <th className="p-12 text-[12px] font-black uppercase tracking-[0.4em] text-slate-500">Timeline</th>
                <th className="p-12 text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 text-right">Statut SDE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {actions.map((action) => (
                <tr key={action.ACT_Id} className="hover:bg-blue-600/5 transition-all group">
                  <td className="p-12">
                    <p className="text-xl font-black text-white uppercase tracking-tighter group-hover:text-blue-500 transition-colors">{action.ACT_Title}</p>
                    <p className="text-xs text-slate-500 italic mt-2 line-clamp-1 opacity-70">{action.ACT_Description || "Aucune description factuelle associée."}</p>
                    <div className="flex items-center gap-3 mt-4">
                      <span className="text-[9px] font-black text-blue-500 px-3 py-1 bg-blue-500/10 rounded-full uppercase tracking-widest italic">REF: {action.ACT_Id.slice(0,8).toUpperCase()}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{action.ACT_Origin}</span>
                    </div>
                  </td>
                  <td className="p-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-sm font-black text-blue-500 border-2 border-white/5 uppercase shadow-inner">
                        <User size={24} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Pilotage SDE</span>
                    </div>
                  </td>
                  <td className="p-12">
                    <div className="flex items-center gap-4 text-slate-400">
                      <Calendar size={20} className="text-blue-500" />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-widest">Échéance</span>
                        <span className="text-sm font-bold text-white italic">{action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString() : '—'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-12 text-right">
                    <span className={cn(
                      "px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] border-2 italic inline-block shadow-inner",
                      action.ACT_Status === ActionStatus.TERMINEE ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20 animate-pulse'
                    )}>
                      {action.ACT_Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');