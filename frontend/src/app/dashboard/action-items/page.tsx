//* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 📝 MODULE : SUIVI DES TÂCHES OPÉRATIONNELLES (CAPA) (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Dispatching et suivi des actions par responsable.
 * FIX : UI ClickUp (100% hauteur, Zéro Scroll Global), PWA Ready (retrait ml-72).
 * SÉCURITÉ : Typage strict, utilitaire 'cn' sécurisé.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 00:00 GMT
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { Calendar, User, Search, Filter, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Action, ActionStatus } from '@/types/elite-sde';

// --- UTILITAIRE CSS SOUVERAIN ---
const cn = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(' ');
};

export default function ActionItemsPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadActions = useCallback(async () => {
    try {
      const res = await apiClient.get('/actions');
      const dataArray = res.data?.data || res.data;
      setActions(Array.isArray(dataArray) ? dataArray : []);
    } catch (err) { 
      console.error("[SYNC_ACTIONS_ERROR]:", err); 
      setActions([]);
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { loadActions(); }, [loadActions]);

  const filteredActions = actions.filter(action => 
    action.ACT_Title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    action.ACT_Id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#0F172A] italic font-sans overflow-hidden selection:bg-blue-600/30 text-white w-full">
      
      {/* 🔝 EN-TÊTE FIXE (Ne scrolle pas) */}
      <div className="shrink-0 p-6 md:p-8 lg:px-12 border-b border-white/5 bg-[#0F172A]/90 backdrop-blur-md z-20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none m-0 flex items-center gap-4">
            Suivi des <span className="text-blue-600">Tâches</span>
          </h1>
          <p className="text-slate-500 font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-[9px] md:text-[11px] italic m-0">
            Distribution individuelle du plan CAPA
          </p>
        </div>

        {/* OUTILS DE RECHERCHE / FILTRES */}
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text"
              placeholder="RECHERCHER UNE ACTION..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 p-3 pl-12 bg-black/40 border border-white/10 rounded-2xl text-[10px] md:text-xs font-black text-white outline-none focus:border-blue-500 transition-all uppercase tracking-widest italic placeholder:text-slate-600"
            />
          </div>
          <button className="p-3 md:p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition-all cursor-pointer">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* 📜 ZONE DE DÉFILEMENT (Tableau) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-12">
        <div className="bg-slate-900/40 rounded-4xl md:rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden w-full max-w-7xl mx-auto backdrop-blur-sm animate-in fade-in zoom-in-95 duration-700">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 md:p-40 gap-6">
              <Loader2 className="animate-spin text-blue-500" size={48} />
              <div className="text-center animate-pulse text-blue-500 font-black uppercase italic text-xs md:text-sm tracking-[0.5em] md:tracking-[1em] m-0">
                Scanning Noyau Tâches...
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-200">
                <thead className="bg-black/40 border-b border-white/10 italic sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="p-6 md:p-8 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-500">Action / Nature de l&apos;Écart</th>
                    <th className="p-6 md:p-8 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-500 text-center w-40 md:w-48">Pilotage</th>
                    <th className="p-6 md:p-8 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-500 w-48 md:w-56">Timeline</th>
                    <th className="p-6 md:p-8 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-500 text-right w-48 md:w-64">Statut SDE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredActions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-16 md:p-20 text-center text-slate-600 font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-xs">
                        Aucune action enregistrée dans la matrice.
                      </td>
                    </tr>
                  ) : (
                    filteredActions.map((action) => (
                      <tr key={action.ACT_Id} className="hover:bg-blue-600/5 transition-all group">
                        <td className="p-6 md:p-8">
                          <p className="text-base md:text-xl font-black text-white uppercase tracking-tighter group-hover:text-blue-400 transition-colors m-0 leading-tight">
                            {action.ACT_Title}
                          </p>
                          <p className="text-[10px] md:text-xs text-slate-500 italic mt-2 line-clamp-2 opacity-70 m-0 leading-relaxed">
                            {action.ACT_Description || "Aucune description factuelle associée."}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-4">
                            <span className="text-[8px] md:text-[9px] font-black text-blue-400 px-3 py-1.5 bg-blue-500/10 rounded-full uppercase tracking-widest italic border border-blue-500/20">
                              REF: {action.ACT_Id.slice(0,8).toUpperCase()}
                            </span>
                            <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest italic px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                              {action.ACT_Origin}
                            </span>
                          </div>
                        </td>
                        <td className="p-6 md:p-8">
                          <div className="flex flex-col items-center gap-2 md:gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-900 flex items-center justify-center text-blue-500 border border-white/5 shadow-inner group-hover:border-blue-500/30 transition-colors">
                              <User size={20} className="md:w-6 md:h-6" />
                            </div>
                            <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest text-center leading-tight">Pilotage<br/>SDE</span>
                          </div>
                        </td>
                        <td className="p-6 md:p-8">
                          <div className="flex items-start gap-3 md:gap-4 text-slate-400">
                            <Calendar size={18} className="text-blue-500 shrink-0 mt-0.5 md:w-5 md:h-5" />
                            <div className="flex flex-col">
                              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none mb-1.5 md:mb-2 text-slate-500">Échéance</span>
                              <span className={cn(
                                "text-xs md:text-sm font-bold italic leading-none m-0",
                                action.ACT_Deadline && new Date(action.ACT_Deadline) < new Date() && action.ACT_Status !== ActionStatus.TERMINEE 
                                  ? "text-rose-500" 
                                  : "text-white group-hover:text-blue-300 transition-colors"
                              )}>
                                {action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString() : 'Non définie'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 md:p-8 text-right">
                          <span className={cn(
                            "px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] border italic inline-flex items-center gap-2 shadow-inner whitespace-nowrap",
                            action.ACT_Status === ActionStatus.TERMINEE ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            action.ACT_Status === ActionStatus.EN_COURS ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          )}>
                            {action.ACT_Status === ActionStatus.TERMINEE && <CheckCircle2 size={14} />}
                            {action.ACT_Status === ActionStatus.EN_COURS && <Clock size={14} />}
                            {action.ACT_Status !== ActionStatus.TERMINEE && action.ACT_Status !== ActionStatus.EN_COURS && <AlertCircle size={14} />}
                            {action.ACT_Status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 🧪 INJECTION CSS SCROLLBAR SOUVERAINE */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}} />
    </div>
  );
}