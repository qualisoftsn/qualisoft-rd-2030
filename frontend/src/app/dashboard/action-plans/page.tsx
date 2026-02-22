/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : PLANS D'ACTIONS QUALITÉ (PAQ)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage des programmes de traitement par processus.
 * RÉFÉRENTIEL : types/elite-sde (PAQ, PAQStatus).
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { ClipboardCheck, Calendar, AlertTriangle, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { PAQ, PAQStatus } from '@/types/elite-sde';

export default function ActionPlansPage() {
  const [plans, setPlans] = useState<PAQ[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlans = useCallback(async () => {
    try {
      const res = await apiClient.get('/paq');
      setPlans(res.data?.data || res.data);
    } catch (err) { console.error("RUPTURE RÉFÉRENTIEL PAQ"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  return (
    <div className="min-h-screen bg-[#0F172A] p-16 ml-72 text-left italic font-sans overflow-hidden">
      <div className="mb-20 space-y-4 max-w-500 mx-auto w-full">
        <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
          Plans <span className="text-emerald-500">PAQ</span>
        </h1>
        <p className="text-slate-500 font-black uppercase tracking-[0.6em] text-[11px] mt-4 italic">Programmes d&apos;Amélioration Continue §10.2</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 max-w-500 mx-auto w-full">
        {loading ? (
          <p className="p-20 text-blue-500 font-black italic animate-pulse uppercase tracking-[1em] text-center col-span-2">Synchronisation SDE Matrix...</p>
        ) : plans.map((plan) => (
          <div key={plan.PAQ_Id} className="bg-slate-900/40 rounded-[5rem] p-16 border-2 border-white/5 shadow-4xl hover:border-emerald-500/20 hover:bg-slate-900/60 transition-all relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 p-10 opacity-[0.03] rotate-12 bg-emerald-500 rounded-full blur-3xl w-80 h-80 pointer-events-none" />
            
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div className="flex items-center gap-8">
                <div className="p-6 bg-emerald-500/10 text-emerald-500 rounded-4xl shadow-lg border border-emerald-500/20 transition-transform group-hover:scale-110">
                  <ClipboardCheck size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <span className="px-6 py-2 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic shadow-inner border border-white/5">
                    {plan.PAQ_Status}
                  </span>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter mt-4 leading-none">{plan.PAQ_Title}</h3>
                </div>
              </div>
              <div className="text-5xl font-black text-white/5 italic select-none">{plan.PAQ_Year}</div>
            </div>

            <div className="bg-black/30 rounded-[3rem] p-8 mb-12 border-2 border-white/5 shadow-inner relative z-10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4 flex items-center gap-3 italic">
                <AlertTriangle size={14} className="text-amber-500" /> Analyse de rattachement :
              </p>
              <p className="text-lg font-bold text-slate-300 italic leading-relaxed group-hover:text-emerald-400 transition-colors">
                &quot;{plan.PAQ_Description || 'Traitement des écarts détectés sur le cycle en cours.'}&quot;
              </p>
            </div>

            <div className="flex justify-between items-center border-t-2 border-white/5 pt-12 relative z-10">
              <div className="flex gap-12">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date Clôture</span>
                  <span className="text-sm font-black text-white flex items-center gap-3 italic">
                    <Calendar size={18} className="text-emerald-500" /> {plan.PAQ_DateCloture ? new Date(plan.PAQ_DateCloture).toLocaleDateString() : 'INDÉTERMINÉE'}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Actifs SDE</span>
                  <span className="text-sm font-black text-emerald-500 flex items-center gap-3 italic">
                    <Zap size={18} fill="currentColor" /> AMÉLIORATION CONTINUE
                  </span>
                </div>
              </div>
              <button className="bg-white text-slate-900 p-6 rounded-4xl hover:bg-emerald-500 hover:text-white transition-all transform group-hover:scale-110 shadow-4xl border-none cursor-pointer">
                <ArrowRight size={28} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}