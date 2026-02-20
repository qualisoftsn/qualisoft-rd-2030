/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { Plus, ChevronRight, FileText, CheckCircle2, Clock, ShieldCheck, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * 🛰️ MODULE : LISTE DES REVUES DE PROCESSUS
 * -------------------------------------------------------------------------
 * RÔLE : 
 * Centralise l'accès à l'historique des revues. Permet de distinguer
 * les sessions "VALIDÉES" (clôturées) des sessions "EN COURS" (draft).
 * -------------------------------------------------------------------------
 */

export default function ProcessReviewListPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * 📡 SYNCHRONISATION
   * Récupère la liste triée par période (mois/année) via l'API.
   */
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/process-reviews');
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur de synchronisation du registre :", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  return (
    <div className="p-8 bg-[#0B0F1A] min-h-screen text-white italic font-sans selection:bg-blue-600/30">
      
      {/* 🔝 HEADER DÉCISIONNEL */}
      <header className="flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
            Revues de <span className="text-blue-600">Processus</span>
          </h1>
          <p className="text-slate-500 font-black uppercase text-[10px] mt-3 tracking-[0.4em] italic">
            Surveillance de la Performance SMI (§9.3)
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/dashboard/process-review/analytics')}
            className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-white border border-white/5 transition-all"
            title="Analyse de performance"
          >
            <Activity size={20} />
          </button>
          <button 
            onClick={() => router.push('/dashboard/process-review/preparation')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-lg shadow-blue-900/40 border-none cursor-pointer"
          >
            <Plus size={18} /> Lancer un Scan
          </button>
        </div>
      </header>

      {/* 📋 LISTE DES SESSIONS */}
      {loading ? (
        <div className="animate-pulse space-y-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white/5 rounded-4xl"/>)}
        </div>
      ) : (
        <div className="grid gap-6">
          {reviews.map((rev: any) => (
            <div 
              key={rev.PRV_Id}
              onClick={() => router.push(`/dashboard/process-review/session/${rev.PRV_Id}`)}
              className="bg-slate-900/40 border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between cursor-pointer hover:bg-slate-900/60 hover:border-blue-500/30 transition-all group shadow-xl"
            >
              <div className="flex items-center gap-8">
                {/* Badge Temporel */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 text-center min-w-20 shadow-inner">
                  <span className="block text-[9px] font-black text-blue-500 uppercase tracking-tighter mb-1">M-{rev.PRV_Month}</span>
                  <span className="text-[11px] font-black text-slate-400 italic leading-none uppercase">{rev.PRV_Year}</span>
                </div>
                
                <div className="text-left">
                  <h3 className="font-black uppercase text-lg tracking-tight group-hover:text-blue-400 transition-colors leading-none mb-2 italic">
                    {rev.PRV_Processus?.PR_Libelle}
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{rev.PRV_DocRef}</span>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase flex items-center gap-2 italic ${
                      rev.PRV_Status === 'VALIDEE' 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                        : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                    }`}>
                      {rev.PRV_Status === 'VALIDEE' ? <CheckCircle2 size={12}/> : <Clock size={12}/>} 
                      {rev.PRV_Status === 'VALIDEE' ? 'Session Scellée' : 'Analyse en cours'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-2xl text-slate-700 group-hover:text-white group-hover:bg-blue-600 transition-all">
                <ChevronRight size={20} />
              </div>
            </div>
          ))}

          {reviews.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[4rem] opacity-20 italic">
              <FileText size={64} className="mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest">Aucune revue archivée dans le SMI</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}