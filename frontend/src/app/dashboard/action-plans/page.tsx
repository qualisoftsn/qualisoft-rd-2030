//* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : PLANS D'ACTIONS QUALITÉ (PAQ)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage des programmes de traitement par processus.
 * RÉFÉRENTIEL : types/elite-sde (PAQ, PAQStatus).
 * FIX : Sécurisation du rendu des listes (Array.isArray) et UX Empty State.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 12:50 GMT
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { ClipboardCheck, Calendar, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import { PAQ } from '@/types/elite-sde';

export default function ActionPlansPage() {
  const [plans, setPlans] = useState<PAQ[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlans = useCallback(async () => {
    try {
      const res = await apiClient.get('/paq');
      // 🛡️ Sécurisation stricte : On s'assure de toujours injecter un tableau
      const dataArray = res.data?.data || res.data;
      setPlans(Array.isArray(dataArray) ? dataArray : []);
    } catch (err) { 
      console.error("RUPTURE RÉFÉRENTIEL PAQ", err); 
      setPlans([]); // Fallback sécurisé
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  return (
    <div className="min-h-screen bg-[#0F172A] p-16 ml-72 text-left italic font-sans overflow-hidden selection:bg-emerald-600/30">
      
      {/* 🔝 EN-TÊTE STRATÉGIQUE */}
      <div className="mb-20 space-y-4 max-w-300 mx-auto w-full animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-none m-0">
          Plans <span className="text-emerald-500">PAQ</span>
        </h1>
        <p className="text-slate-500 font-black uppercase tracking-[0.6em] text-[11px] mt-4 italic m-0">
          Programmes d&apos;Amélioration Continue §10.2
        </p>
      </div>

      {/* 📂 GRILLE DES PROGRAMMES PAQ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 max-w-300 mx-auto w-full">
        {loading ? (
          <div className="col-span-1 xl:col-span-2 py-32 flex justify-center">
            <p className="text-emerald-500 font-black italic animate-pulse uppercase tracking-[1em] text-center text-xs">
              Synchronisation SDE Matrix...
            </p>
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-1 xl:col-span-2 py-32 border-4 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center opacity-40">
            <ClipboardCheck size={64} className="text-slate-500 mb-6" />
            <p className="text-xl font-black text-white uppercase tracking-[0.5em] m-0">Aucun Plan d&apos;Action</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">Le registre PAQ est actuellement vide.</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div 
              key={plan.PAQ_Id} 
              className="bg-slate-900/40 rounded-[4rem] p-12 lg:p-16 border-2 border-white/5 shadow-2xl hover:border-emerald-500/20 hover:bg-slate-900/60 transition-all relative overflow-hidden group animate-in zoom-in-95 duration-500"
            >
              {/* Effet de lueur Matrix */}
              <div className="absolute -top-10 -right-10 p-10 opacity-[0.03] rotate-12 bg-emerald-500 rounded-full blur-3xl w-80 h-80 pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start mb-12 relative z-10 gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-emerald-500/10 text-emerald-500 rounded-3xl shadow-lg border border-emerald-500/20 transition-transform group-hover:scale-110 shrink-0">
                    <ClipboardCheck size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="px-4 py-1.5 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 italic shadow-inner border border-white/5">
                      {plan.PAQ_Status.replace('_', ' ')}
                    </span>
                    <h3 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter mt-4 leading-none m-0">
                      {plan.PAQ_Title}
                    </h3>
                  </div>
                </div>
                <div className="text-5xl font-black text-white/5 italic select-none hidden sm:block">
                  {plan.PAQ_Year}
                </div>
              </div>

              <div className="bg-black/30 rounded-[2.5rem] p-6 lg:p-8 mb-10 border-2 border-white/5 shadow-inner relative z-10">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] mb-3 flex items-center gap-3 italic m-0">
                  <AlertTriangle size={12} className="text-amber-500" /> Analyse de rattachement :
                </p>
                <p className="text-sm lg:text-base font-bold text-slate-300 italic leading-relaxed group-hover:text-emerald-400 transition-colors m-0">
                  &quot;{plan.PAQ_Description || 'Traitement des écarts détectés sur le cycle en cours.'}&quot;
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center border-t-2 border-white/5 pt-8 relative z-10 gap-6">
                <div className="flex gap-8 w-full sm:w-auto">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Date Clôture</span>
                    <span className="text-xs lg:text-sm font-black text-white flex items-center gap-2 italic">
                      <Calendar size={16} className="text-emerald-500" /> 
                      {plan.PAQ_DateCloture ? new Date(plan.PAQ_DateCloture).toLocaleDateString() : 'INDÉTERMINÉE'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 border-l-2 border-white/5 pl-8">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Actifs SDE</span>
                    <span className="text-xs lg:text-sm font-black text-emerald-500 flex items-center gap-2 italic">
                      <Zap size={16} fill="currentColor" /> AMÉLIORATION CONTINUE
                    </span>
                  </div>
                </div>
                <button 
                  className="bg-white text-slate-900 p-5 rounded-3xl hover:bg-emerald-500 hover:text-white transition-all transform group-hover:scale-110 shadow-xl border-none cursor-pointer shrink-0"
                  aria-label="Voir le détail du PAQ"
                >
                  <ArrowRight size={24} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}