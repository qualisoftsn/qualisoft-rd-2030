//* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : REGISTRE DES REVUES DE PROCESSUS (SMI MONITORING)
 * -------------------------------------------------------------------------
 * RÔLE : Centralisation et accès à l'historique des audits périodiques.
 * RÉFÉRENTIEL : types/elite-sde.ts (SCELLAGE PRISMA).
 * NORME : ISO 9001:2015 §9.1.1 (Surveillance et mesure).
 * ARCHITECTURE : Isolation Multi-Tenant (Données du tenant actif).
 * DESIGN : Cockpit Matrix Full-Space (max-w-500).
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Plus, ChevronRight, FileText, CheckCircle2, 
  Clock, ShieldCheck, Activity, Loader2, Fingerprint, Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';

// --- 🏗️ RÉFÉRENTIEL ÉLITE-SDE (TYPAGE STRICT) ---
// Note : Modélisation basée sur l'infrastructure prisma SDE
interface IProcessus {
  PR_Id: string;
  PR_Libelle: string;
  PR_Code: string;
}

interface IREVProcessus {
  PRV_Id: string;
  PRV_Month: number;
  PRV_Year: number;
  PRV_DocRef: string;
  PRV_Status: 'EN_COURS' | 'VALIDEE';
  PRV_Processus?: IProcessus;
}

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export default function ProcessReviewListPage() {
  const router = useRouter();
  
  // --- 📦 ÉTATS DU KERNEL SDE ---
  const [reviews, setReviews] = useState<IREVProcessus[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * 📡 SYNCHRONISATION DU REGISTRE
   * @description Extraction multi-tenant sécurisée. Ne récupère que les revues du tenant actif.
   */
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/process-reviews');
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setReviews(data);
    } catch (err) {
      toast.error("RUPTURE DE LIAISON : REGISTRE DES REVUES INACCESSIBLE.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-12">
      <Loader2 className="animate-spin text-blue-600" size={100} strokeWidth={1} />
      <span className="text-blue-500 font-black uppercase text-[12px] italic tracking-[1.5em] animate-pulse">
        Syncing Review Registry...
      </span>
    </div>
  );

  return (
    <div className="p-16 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans text-left relative selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER COCKPIT (max-w-500) */}
      <header className="mb-20 flex justify-between items-center w-full max-w-500 mx-auto border-b-4 border-white/5 pb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <span className="w-4 h-4 rounded-full bg-blue-600 animate-pulse shadow-[0_0_20px_blue]" />
            <p className="text-slate-500 font-black text-[12px] uppercase tracking-[0.6em] italic">ISO 9001:2015 §9.1.1 • Performance Matrix</p>
          </div>
          <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none">
            Revues de <span className="text-blue-600">Processus</span>
          </h1>
        </div>
        
        <div className="flex gap-8">
          <button 
            onClick={() => router.push('/dashboard/process-review/analytics')}
            className="px-12 py-6 bg-white/5 border-2 border-white/10 rounded-[3rem] text-[12px] font-black uppercase flex items-center gap-6 hover:bg-white/10 transition-all cursor-pointer shadow-xl italic"
            title="Analyse de performance globale"
          >
            <Activity size={28} className="text-blue-500" /> Analytique
          </button>
          <button 
            onClick={() => router.push('/dashboard/process-review/preparation')}
            className="px-16 py-6 bg-blue-600 rounded-[3rem] text-[12px] font-black uppercase flex items-center gap-6 shadow-4xl hover:bg-white hover:text-blue-600 transition-all border-none cursor-pointer italic shadow-blue-900/40"
          >
            <Plus size={28} strokeWidth={4} /> Lancer un Scan
          </button>
        </div>
      </header>

      {/* 📋 REGISTRE MATRIX (max-w-500) */}
      <main className="w-full max-w-500 mx-auto space-y-12">
        {reviews.length === 0 ? (
          <div className="py-48 border-8 border-dashed border-white/5 rounded-[7rem] text-center flex flex-col items-center justify-center opacity-20 italic">
            <FileText size={120} className="text-slate-500 mb-16" />
            <p className="text-4xl text-slate-600 uppercase font-black italic tracking-[1em] leading-relaxed">
              Registre Vierge<br/>Aucune Session Scellée
            </p>
          </div>
        ) : (
          <div className="grid gap-10">
            {reviews.map((rev) => (
              <div 
                key={rev.PRV_Id}
                onClick={() => router.push(`/dashboard/process-review/session/${rev.PRV_Id}`)}
                className="bg-[#151A2D] border-4 border-white/5 p-12 rounded-[5rem] flex items-center justify-between cursor-pointer hover:bg-black/60 hover:border-blue-600/30 transition-all duration-300 group shadow-4xl backdrop-blur-xl"
              >
                <div className="flex items-center gap-12">
                  
                  {/* 🗓️ BADGE TEMPOREL SDE */}
                  <div className="bg-black/60 p-8 rounded-4xl border-2 border-white/5 text-center min-w-30 shadow-inner group-hover:scale-110 transition-transform">
                    <span className="block text-[14px] font-black text-blue-500 uppercase tracking-tighter mb-2 italic">Mois {rev.PRV_Month}</span>
                    <span className="text-[18px] font-black text-slate-400 italic leading-none uppercase">{rev.PRV_Year}</span>
                  </div>
                  
                  {/* 📋 INFOS SESSION */}
                  <div className="text-left space-y-5">
                    <h3 className="font-black uppercase text-4xl tracking-tighter text-white group-hover:text-blue-500 transition-colors leading-none italic">
                      {rev.PRV_Processus?.PR_Libelle || "Processus Orphelin"}
                    </h3>
                    
                    <div className="flex items-center gap-8">
                      <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em] italic flex items-center gap-4">
                         <Fingerprint size={16} className="text-slate-600" />
                         REF: {rev.PRV_DocRef || `PRV-${rev.PRV_Id.slice(0, 6)}`}
                      </span>
                      <span className="text-slate-800">•</span>
                      
                      {/* ✅ SCELLAGE STATUS */}
                      <span className={cn(
                        "text-[10px] font-black px-6 py-2 rounded-2xl uppercase flex items-center gap-3 italic border-2 shadow-inner",
                        rev.PRV_Status === 'VALIDEE' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-orange-500/10 text-orange-500 border-orange-500/20 animate-pulse'
                      )}>
                        {rev.PRV_Status === 'VALIDEE' ? <CheckCircle2 size={16}/> : <Clock size={16}/>} 
                        {rev.PRV_Status === 'VALIDEE' ? 'Session Scellée' : 'Analyse Active'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* ➡️ NAVIGATION */}
                <div className="p-8 bg-white/5 rounded-4xl text-slate-600 group-hover:text-white group-hover:bg-blue-600 transition-all border-2 border-transparent group-hover:border-blue-400 shadow-xl group-active:scale-90">
                  <ChevronRight size={36} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 🧩 FOOTER (§9.1.1) */}
      <footer className="mt-48 pt-20 border-t-8 border-white/5 flex justify-between items-center opacity-40 w-full max-w-500 mx-auto group">
          <div className="flex items-center gap-12">
              <ShieldCheck size={60} className="text-blue-600 group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
              <div className="text-left">
                <p className="text-[16px] font-black uppercase tracking-[1.5em] text-slate-500 italic leading-none">Process Review Engine</p>
                <p className="text-[12px] font-bold text-slate-700 uppercase tracking-[0.8em] mt-4 italic leading-none">ISO 9001:2015 Monitoring • Qualisoft Elite RD 2030</p>
              </div>
          </div>
          <div className="flex gap-8">
              <div className="w-5 h-5 rounded-full bg-blue-600 shadow-[0_0_20px_blue] animate-pulse" />
              <div className="w-5 h-5 rounded-full bg-emerald-600" />
          </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>
    </div>
  );
}