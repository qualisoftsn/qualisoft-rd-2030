/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : SURVEY RESULT SCANNER (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Analyse des retours §9.1.2 & Déclenchement automatique NC.
 * FIX : Mapping strict des IDs & Sécurisation du flux de conversion.
 * RÉVISION : 07 Mars 2026 | 14:35 GMT
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Search, AlertOctagon, RefreshCcw, User, 
  CheckCircle, ArrowLeft, RefreshCw, BarChart4, Filter
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';
import { cn } from '@/core/utils/cn';

export default function SurveyResultScanner() {
  const [filter, setFilter] = useState('ALL');
  const [results, setResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/surveys/results');
      setResults(res.data?.data || res.data || []);
    } catch { 
      toast.error("RUPTURE DE FLUX : SCANNER HORS-LIGNE"); 
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return results.filter(r => 
      (filter === 'ALL' || r.RES_Target === filter) && 
      (r.RES_Respondent?.toLowerCase().includes(term) || r.RES_Comment?.toLowerCase().includes(term))
    );
  }, [filter, searchTerm, results]);

  const handleConvertToNC = async (id: string) => {
    const tid = toast.loading("GÉNÉRATION DE LA FICHE NC §10.2...");
    try {
      // 🚀 AUTOMATION : On crée la NC et on marque le résultat comme traité
      await apiClient.post('/non-conformites', { 
        source: 'SURVEY_AUTO_SCAN', 
        resultId: id,
        libelle: "Insatisfaction Tiers détectée par Scanner §9.1.2" 
      });
      await apiClient.patch(`/surveys/results/${id}`, { RES_Status: 'PROCESSED' });
      
      toast.success("FICHE NC TRANSFÉRÉE AU LABORATOIRE", { id: tid });
      fetchResults();
    } catch { 
      toast.error("ÉCHEC DU SCELLAGE NC", { id: tid }); 
    }
  };

  if (loading) return <LoadingMatrix label="Scanning Global Data Stream..." />;

  return (
    <div className="h-dvh bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 select-none">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER SCANNER */}
      <header className="p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/80 backdrop-blur-2xl z-50 mt-12 lg:mt-0 gap-8 shrink-0">
        <div className="space-y-4">
          <Link href="/dashboard/quality/surveys" className="group flex items-center gap-3 text-[9px] text-slate-500 hover:text-white transition-all no-underline">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Retour Cockpit
          </Link>
          <h1 className="text-4xl lg:text-6xl tracking-tighter m-0 italic">Result <span className="text-amber-500">Scanner</span></h1>
        </div>
        
        <div className="flex gap-4 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
            <input 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Scanner par mot-clé..." 
              className="w-full bg-black/40 border-2 border-white/5 rounded-[2.5rem] py-5 pl-16 pr-8 text-[11px] font-black italic text-white outline-none focus:border-amber-500 shadow-inner uppercase" 
            />
          </div>
          <button onClick={fetchResults} className="p-5 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-amber-500 transition-all cursor-pointer">
            <RefreshCcw size={22} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* 🧭 NAVIGATION FILTRÉE */}
      <nav className="p-6 flex gap-3 overflow-x-auto custom-scrollbar bg-[#0B1222]/50 border-b border-white/5 shrink-0">
        {['ALL', 'CLIENT', 'SUPPLIER', 'EMPLOYEE'].map(t => (
          <button 
            key={t} onClick={() => setFilter(t)} 
            className={cn(
              "px-8 py-3 rounded-xl text-[9px] tracking-widest italic font-black uppercase transition-all border-none cursor-pointer whitespace-nowrap", 
              filter === t ? "bg-amber-600 text-white shadow-4xl" : "bg-white/5 text-slate-600 hover:text-white"
            )}
          >
            {t === 'ALL' ? 'Vue Globale' : t}
          </button>
        ))}
      </nav>

      {/* 📊 STREAM DE DONNÉES */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
          {filtered.length > 0 ? filtered.map((res) => (
            <div 
              key={res.RES_Id} 
              className={cn(
                "p-8 rounded-[3rem] border-2 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group shadow-4xl", 
                res.RES_Score < 5 ? "bg-rose-950/20 border-rose-500/30" : "bg-[#151B2B] border-white/5 hover:border-white/10"
              )}
            >
              <div className="flex items-center gap-8 flex-1 min-w-0">
                <div className={cn(
                  "w-20 h-20 rounded-3xl flex flex-col items-center justify-center border-2 shrink-0 shadow-inner transition-transform group-hover:scale-105", 
                  res.RES_Score < 5 ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                )}>
                  <span className="text-4xl font-black italic m-0 leading-none">{res.RES_Score}</span>
                  <span className="text-[7px] opacity-40 uppercase font-black">Indice</span>
                </div>
                
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="bg-white/5 border border-white/5 px-3 py-1 rounded-lg text-[8px] tracking-widest font-black text-slate-500 italic uppercase">
                      {res.RES_Target} • ID-{res.RES_Id.slice(0, 8)}
                    </span>
                    <span className="text-[9px] text-slate-700 font-bold italic">{new Date(res.RES_Date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-black italic m-0 uppercase leading-none truncate text-white">
                    &quot;{res.RES_Comment || "AUCUN FEEDBACK TEXTUEL"}&quot;
                  </h3>
                  <p className="text-[10px] text-slate-500 flex items-center gap-2 m-0 italic uppercase font-black tracking-widest">
                    <User size={12}/> {res.RES_Respondent || "ANONYME"}
                  </p>
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto flex justify-end">
                {res.RES_Score < 5 && res.RES_Status === 'PENDING' ? (
                  <button 
                    onClick={() => handleConvertToNC(res.RES_Id)} 
                    className="w-full md:w-auto px-8 py-5 bg-rose-600 hover:bg-white hover:text-rose-950 rounded-4xl font-black text-[10px] tracking-widest text-white italic border-none cursor-pointer shadow-4xl flex items-center gap-3 justify-center transition-all active:scale-95"
                  >
                    <AlertOctagon size={18}/> Ouvrir NC §10.2
                  </button>
                ) : res.RES_Status === 'PROCESSED' ? (
                  <div className="px-8 py-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-4xl text-[10px] tracking-widest flex items-center gap-3 italic shadow-inner">
                    <CheckCircle size={18}/> TRAITÉ (NC SCELLÉE)
                  </div>
                ) : (
                  <div className="px-8 py-5 bg-white/5 border border-white/5 text-slate-600 rounded-4xl text-[9px] tracking-[0.4em] italic uppercase font-black">
                    Niveau Conforme
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="h-64 flex flex-col items-center justify-center opacity-10 gap-6 italic">
              <BarChart4 size={80} strokeWidth={1} />
              <p className="text-xl tracking-[0.4em] font-black uppercase">Aucun flux de données</p>
            </div>
          )}
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function LoadingMatrix({ label }: { label: string }) {
  return (
    <div className="h-dvh w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-amber-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={64} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed m-0">{label}</span>
    </div>
  );
}
