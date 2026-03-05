//* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : PLANS D'ACTIONS QUALITÉ (PAQ) (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage des programmes de traitement par processus.
 * FIX : Architecture ClickUp (100dvh, Zéro Scroll Global), PWA Ready (retrait ml-72).
 * SÉCURITÉ : Typage strict, fallback tableau sécurisé, Zéro NextAuth.
 * -------------------------------------------------------------------------
 * DATE : 04 Mars 2026 | 23:56 GMT
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { ClipboardCheck, Calendar, AlertTriangle, ArrowRight, Zap, Loader2 } from 'lucide-react';
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
      console.error("[PAQ_SYNC_ERROR] Rupture référentiel:", err); 
      setPlans([]); // Fallback sécurisé
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  return (
    <div className="h-full flex flex-col bg-[#0F172A] italic font-sans overflow-hidden selection:bg-emerald-600/30 text-white w-full">
      
      {/* 🔝 EN-TÊTE FIXE SOUVERAIN (Ne scrolle pas) */}
      <div className="shrink-0 p-6 md:p-8 lg:px-12 border-b border-white/5 bg-[#0F172A]/90 backdrop-blur-md z-20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none m-0 flex items-center gap-4">
            Plans <span className="text-emerald-500">PAQ</span>
          </h1>
          <p className="text-slate-500 font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-[9px] md:text-[11px] italic m-0">
            Programmes d&apos;Amélioration Continue §10.2
          </p>
        </div>
      </div>

      {/* 📜 ZONE DE DÉFILEMENT (Grille PAQ) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-12">
            
            {loading ? (
              <div className="col-span-full py-32 flex flex-col items-center justify-center gap-6">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
                <p className="text-emerald-500 font-black italic animate-pulse uppercase tracking-[0.5em] md:tracking-[1em] text-center text-[10px] md:text-xs m-0">
                  Synchronisation SDE Matrix...
                </p>
              </div>
            ) : plans.length === 0 ? (
              <div className="col-span-full py-24 md:py-32 border-2 md:border-4 border-dashed border-white/5 rounded-[2.5rem] md:rounded-[4rem] flex flex-col items-center justify-center opacity-40 hover:opacity-100 hover:border-emerald-500/30 transition-all cursor-default">
                <ClipboardCheck size={64} className="text-slate-500 mb-6" />
                <p className="text-lg md:text-xl font-black text-white uppercase tracking-[0.3em] md:tracking-[0.5em] m-0 text-center px-4">
                  Aucun Plan d&apos;Action
                </p>
                <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-4 text-center px-4">
                  Le registre PAQ est actuellement vierge.
                </p>
              </div>
            ) : (
              plans.map((plan) => (
                <div 
                  key={plan.PAQ_Id} 
                  className="bg-[#0B0F1A]/80 backdrop-blur-sm rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-12 lg:p-14 border border-white/5 shadow-2xl hover:border-emerald-500/30 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] transition-all relative overflow-hidden group animate-in zoom-in-95 duration-500 flex flex-col"
                >
                  {/* Effet de lueur Matrix */}
                  <div className="absolute -top-20 -right-20 p-10 opacity-0 group-hover:opacity-10 transition-opacity duration-700 rotate-12 bg-emerald-500 rounded-full blur-[100px] w-96 h-96 pointer-events-none" />
                  
                  {/* En-tête de la carte */}
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-8 md:mb-12 relative z-10 gap-6">
                    <div className="flex items-start md:items-center gap-4 md:gap-6 min-w-0">
                      <div className="p-4 md:p-5 bg-emerald-500/10 text-emerald-500 rounded-2xl md:rounded-3xl shadow-lg border border-emerald-500/20 transition-transform group-hover:scale-110 shrink-0">
                        <ClipboardCheck size={28} strokeWidth={2.5} className="w-6 h-6 md:w-7 md:h-7" />
                      </div>
                      <div className="min-w-0">
                        <span className="inline-block px-3 md:px-4 py-1.5 rounded-xl bg-white/5 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-400 italic shadow-inner border border-white/5 mb-3">
                          {plan.PAQ_Status.replace('_', ' ')}
                        </span>
                        <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter leading-none m-0 truncate group-hover:text-emerald-400 transition-colors">
                          {plan.PAQ_Title}
                        </h3>
                      </div>
                    </div>
                    <div className="text-4xl md:text-5xl font-black text-white/5 italic select-none hidden sm:block shrink-0">
                      {plan.PAQ_Year}
                    </div>
                  </div>

                  {/* Description / Analyse */}
                  <div className="bg-black/40 rounded-4xl md:rounded-[2.5rem] p-6 lg:p-8 mb-8 md:mb-10 border border-white/5 shadow-inner relative z-10 flex-1">
                    <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] md:tracking-[0.5em] mb-3 flex items-center gap-2 md:gap-3 italic m-0">
                      <AlertTriangle size={14} className="text-amber-500" /> Analyse de rattachement :
                    </p>
                    <p className="text-xs md:text-sm lg:text-base font-bold text-slate-300 italic leading-relaxed m-0 line-clamp-3">
                      &quot;{plan.PAQ_Description || 'Traitement des écarts détectés sur le cycle en cours.'}&quot;
                    </p>
                  </div>

                  {/* Pied de carte : Métriques et Action */}
                  <div className="flex flex-col sm:flex-row justify-between items-center border-t border-white/10 pt-6 md:pt-8 relative z-10 gap-6 mt-auto">
                    <div className="flex gap-6 md:gap-8 w-full sm:w-auto">
                      <div className="flex flex-col gap-1.5 md:gap-2">
                        <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Date Clôture</span>
                        <span className="text-[10px] md:text-xs lg:text-sm font-black text-white flex items-center gap-2 italic">
                          <Calendar size={14} className="text-emerald-500 md:w-4 md:h-4" /> 
                          {plan.PAQ_DateCloture ? new Date(plan.PAQ_DateCloture).toLocaleDateString() : 'INDÉTERMINÉE'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5 md:gap-2 border-l border-white/10 pl-6 md:pl-8">
                        <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Actifs SDE</span>
                        <span className="text-[10px] md:text-xs lg:text-sm font-black text-emerald-500 flex items-center gap-2 italic">
                          <Zap size={14} fill="currentColor" className="md:w-4 md:h-4" /> AMÉLIORATION CONTINUE
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      className="w-full sm:w-auto bg-white text-slate-900 p-4 md:p-5 rounded-2xl md:rounded-3xl hover:bg-emerald-500 hover:text-white transition-all transform sm:group-hover:scale-110 shadow-xl border-none cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
                      aria-label="Voir le détail du PAQ"
                    >
                      <ArrowRight size={20} className="md:w-6 md:h-6" />
                    </button>
                  </div>
                </div>
              ))
            )}

          </div>
        </div>
      </div>

      {/* 🧪 INJECTION CSS SCROLLBAR SOUVERAINE */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16,185,129,0.5); }
      `}} />
    </div>
  );
}