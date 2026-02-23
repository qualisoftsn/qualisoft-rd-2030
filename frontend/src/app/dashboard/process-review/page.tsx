/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : REGISTRE DES REVUES DE PROCESSUS (ELITE SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Surveillance et mesure de la performance des processus.
 * NORME : ISO 9001:2015 §9.1.1.
 * DESIGN : High-Density / No-Scroll / Real-Time Analytics.
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Plus, ChevronRight, FileText, CheckCircle2, 
  Clock, ShieldCheck, Activity, Loader2, Fingerprint, 
  Calendar, BarChart3, Search, RefreshCw, Zap, Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';

// --- 🏗️ RÉFÉRENTIEL ÉLITE-SDE ---
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

export default function ProcessReviewListPage() {
  const router = useRouter();
  
  // --- 📦 ÉTATS DU KERNEL ---
  const [reviews, setReviews] = useState<IREVProcessus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/process-reviews');
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setReviews(data);
    } catch (err) {
      toast.error("RUPTURE DE LIAISON : REGISTRE INACCESSIBLE.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // --- 📊 CALCULS ANALYTIQUES TEMPS RÉEL (§9.1.1) ---
  const stats = useMemo(() => {
    const total = reviews.length;
    const validated = reviews.filter(r => r.PRV_Status === 'VALIDEE').length;
    const rate = total > 0 ? Math.round((validated / total) * 100) : 0;
    const currentYear = reviews.filter(r => r.PRV_Year === new Date().getFullYear()).length;
    return { total, validated, rate, currentYear };
  }, [reviews]);

  const filtered = useMemo(() => {
    return reviews.filter(r => 
      r.PRV_Processus?.PR_Libelle?.toLowerCase().includes(search.toLowerCase()) ||
      r.PRV_DocRef?.toLowerCase().includes(search.toLowerCase())
    );
  }, [reviews, search]);

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <span className="text-blue-500 font-black uppercase text-[9px] tracking-[0.5em] animate-pulse italic">
        Syncing Performance Matrix...
      </span>
    </div>
  );

  function cn(arg0: string, arg1: string): string | undefined {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-6 overflow-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER TACTIQUE (Shrink-0) */}
      <header className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.4em] m-0">ISO 9001:2015 §9.1.1 • Performance Matrix</p>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter m-0">Revues de <span className="text-blue-600">Processus</span></h1>
        </div>
        
        <div className="flex gap-3 items-center">
          <div className="relative w-64 group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="RECHERCHER SESSION..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] font-black uppercase outline-none focus:border-blue-600 transition-all italic"
            />
          </div>
          <button onClick={fetchReviews} className="p-2 bg-white/5 rounded-xl hover:text-blue-500 border border-white/10 transition-colors cursor-pointer">
            <RefreshCw size={18} />
          </button>
          <button onClick={() => router.push('/dashboard/process-review/preparation')} className="bg-blue-600 hover:bg-white hover:text-blue-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border-none cursor-pointer transition-all italic shadow-lg">
            <Plus size={16} strokeWidth={3} /> Lancer Scan
          </button>
        </div>
      </header>

      {/* 📊 INDICATEURS CALCULÉS (Shrink-0) */}
      <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
        <KPIBox label="Taux de Scellage" value={`${stats.rate}%`} icon={<ShieldCheck size={16}/>} color="emerald" sub="Validation SMI" />
        <KPIBox label="Sessions Totales" value={stats.total} icon={<FileText size={16}/>} color="blue" sub="Historique SDE" />
        <KPIBox label="Actives (2026)" value={stats.currentYear} icon={<Activity size={16}/>} color="amber" sub="Exercice en cours" />
        <KPIBox label="Conformité §9" value="OK" icon={<Target size={16}/>} color="indigo" sub="Audit Ready" />
      </div>

      {/* 📋 REGISTRE DENSE (Flex-1) */}
      <main className="flex-1 min-h-0 bg-[#151A2D] border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none"><Zap size={300}/></div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          {filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 italic grayscale">
              <FileText size={64} className="text-slate-500 mb-6" />
              <p className="text-xl text-slate-600 uppercase font-black tracking-widest">Registre Vierge</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((rev) => (
                <div 
                  key={rev.PRV_Id}
                  onClick={() => router.push(`/dashboard/process-review/session/${rev.PRV_Id}`)}
                  className="bg-[#0B0F1A]/50 border border-white/5 p-5 rounded-3xl flex items-center justify-between cursor-pointer hover:bg-blue-600/5 hover:border-blue-600/30 transition-all group shadow-xl"
                >
                  <div className="flex items-center gap-8">
                    {/* Badge Temporel */}
                    <div className="bg-black/60 w-20 py-3 rounded-2xl border border-white/5 text-center shadow-inner group-hover:border-blue-500/30 transition-colors">
                      <span className="block text-[10px] font-black text-blue-500 uppercase italic leading-none mb-1">M{rev.PRV_Month}</span>
                      <span className="text-sm font-black text-slate-400 italic leading-none">{rev.PRV_Year}</span>
                    </div>
                    
                    {/* Infos */}
                    <div className="text-left space-y-2">
                      <h3 className="font-black uppercase text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors leading-none m-0 italic">
                        {rev.PRV_Processus?.PR_Libelle || "Processus Orphelin"}
                      </h3>
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">
                           <Fingerprint size={12} className="text-slate-700" /> REF: {rev.PRV_DocRef || `PRV-${rev.PRV_Id.slice(0, 6)}`}
                        </span>
                        <span className={cn(
                          "text-[8px] font-black px-3 py-1 rounded-lg uppercase flex items-center gap-2 italic border shadow-inner",
                          rev.PRV_Status === 'VALIDEE' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                        )}>
                          {rev.PRV_Status === 'VALIDEE' ? <CheckCircle2 size={12}/> : <Clock size={12}/>} 
                          {rev.PRV_Status === 'VALIDEE' ? 'Scellée' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white/5 rounded-xl text-slate-600 group-hover:text-white group-hover:bg-blue-600 transition-all">
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 🧩 FORMULE CONFORMITÉ (§9.1.1) */}
      <div className="mt-4 flex justify-center shrink-0">
        <p className="text-[10px] text-slate-600 font-mono italic">
          {"$$Taux_{scellage} = \\frac{\\sum Sessions_{VALIDEE}}{\\sum Sessions_{TOTAL}} \\times 100 = " + stats.rate + "\\%$$"}
        </p>
      </div>

      {/* 🏁 FOOTER ELITE */}
      <footer className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center opacity-30 shrink-0">
          <div className="flex items-center gap-4">
              <ShieldCheck size={24} className="text-blue-600" />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] m-0 italic">Process Review Engine</p>
                <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest m-0 italic">ISO 9001:2015 Monitoring • Qualisoft SDE 2026</p>
              </div>
          </div>
          <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_10px_blue]" />
              <div className="w-2 h-2 rounded-full bg-slate-800" />
          </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

// --- 🧩 COMPOSANTS ATOMIQUES SDE ---

function KPIBox({ label, value, icon, color, sub }: any) {
  const c: any = { 
    emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10", 
    blue: "text-blue-500 bg-blue-500/5 border-blue-500/10", 
    amber: "text-amber-500 bg-amber-500/5 border-amber-500/10", 
    indigo: "text-indigo-500 bg-indigo-500/5 border-indigo-500/10" 
  };
  return (
    <div className={`p-4 rounded-3xl border flex items-center justify-between shadow-xl ${c[color]}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-black/20 rounded-xl">{icon}</div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">{label}</span>
          <span className="text-[7px] font-bold uppercase text-slate-700 tracking-widest">{sub}</span>
        </div>
      </div>
      <span className="text-2xl font-black italic m-0 text-white leading-none">{value}</span>
    </div>
  );
}