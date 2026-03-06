/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : SURVEY SCANNER (ELITE SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Traitement des retours et déclenchement NC §10.2.
 * DESIGN : 100dvh, Interactive Stream, High-Contrast Industrial.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 22:15 GMT
 */

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Search, AlertOctagon, RefreshCcw, User, 
  CheckCircle, ArrowLeft, RefreshCw
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
    } catch { toast.error("RUPTURE SYNC SCANNER"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return results.filter(r => 
      (filter === 'ALL' || r.RES_Target === filter) && 
      (r.RES_Respondent?.toLowerCase().includes(t) || r.RES_Comment?.toLowerCase().includes(t))
    );
  }, [filter, searchTerm, results]);

  const handleConvertToNC = async (id: string) => {
    const tid = toast.loading("SCELLAGE DE LA NON-CONFORMITÉ...");
    try {
      await apiClient.post('/non-conformities', { source: 'SURVEY_RESULT', resultId: id });
      await apiClient.patch(`/surveys/results/${id}`, { status: 'PROCESSED' });
      toast.success("FICHE NC SCELLÉE DANS LA MATRIX", { id: tid });
      fetchResults();
    } catch { toast.error("ÉCHEC DE SCELLAGE", { id: tid }); }
  };

  if (loading) return <LoadingScreen label="Scanning SDE Data Stream..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-amber-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-8 mt-12 lg:mt-0">
        <div className="text-left space-y-4">
          <Link href="/dashboard/quality/surveys" className="text-[10px] text-slate-500 hover:text-white flex items-center gap-4 no-underline bg-white/5 px-4 py-2 rounded-xl transition-all border border-white/5">
            <ArrowLeft size={16}/> Retour Cockpit
          </Link>
          <h1 className="text-4xl lg:text-6xl tracking-tighter italic m-0">Result <span className="text-amber-500">Scanner</span></h1>
        </div>
        <div className="flex gap-4 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-96 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-amber-500 transition-all" size={20} />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="FILTRAGE PAR MOT-CLÉ..." className="w-full bg-black/40 border-2 border-white/5 rounded-[2.5rem] py-6 pl-16 pr-8 text-[11px] font-black italic text-white outline-none focus:border-amber-500 shadow-inner uppercase" />
          </div>
          <button onClick={fetchResults} className="p-6 bg-slate-900 border-2 border-white/5 rounded-3xl text-slate-500 hover:text-amber-500 transition-all cursor-pointer"><RefreshCcw size={24} /></button>
        </div>
      </header>

      {/* 🧭 FILTER BAR */}
      <nav className="shrink-0 p-6 flex gap-4 overflow-x-auto custom-scrollbar bg-[#0B1222]/50 border-b border-white/5">
        {['ALL', 'CLIENT', 'SUPPLIER', 'EMPLOYEE'].map(t => (
          <button key={t} onClick={() => setFilter(t)} className={cn("px-8 py-4 rounded-2xl text-[10px] tracking-widest italic font-black uppercase transition-all border-none cursor-pointer", filter === t ? "bg-amber-600 text-white shadow-4xl" : "bg-transparent text-slate-600 hover:text-white")}>
            {t === 'ALL' ? 'Vue Globale' : t}
          </button>
        ))}
      </nav>

      {/* 📊 DATA STREAM */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-10">
        <div className="max-w-375 mx-auto space-y-8 pb-32">
          {filtered.map((res) => (
            <div key={res.RES_Id} className={cn("p-10 rounded-[3.5rem] border-2 transition-all flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 group shadow-4xl text-left", res.RES_Score < 5 ? "bg-rose-950/20 border-rose-500/30" : "bg-[#151B2B] border-white/5")}>
              <div className="flex flex-col xl:flex-row items-start xl:items-center gap-10 flex-1">
                <div className={cn("w-24 h-24 rounded-[2.5rem] flex flex-col items-center justify-center border-2 shrink-0 shadow-inner", res.RES_Score < 5 ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500")}>
                  <span className="text-5xl font-black italic m-0 leading-none">{res.RES_Score}</span>
                  <span className="text-[8px] opacity-40 uppercase font-black">Score</span>
                </div>
                <div className="space-y-6 flex-1">
                  <div className="flex items-center gap-4">
                    <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-xl text-[10px] tracking-widest font-black text-slate-500 italic">{res.RES_Target} • ID-{res.RES_Id.slice(0, 8)}</span>
                    <span className="text-[10px] text-slate-700 tracking-widest">{new Date(res.RES_Date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-2xl font-black italic m-0 uppercase leading-snug tracking-tighter text-white">&quot;{res.RES_Comment || "AUCUN COMMENTAIRE TEXTUEL"}&quot;</h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-3 m-0 italic"><User size={14}/> Source : {res.RES_Respondent || "ANONYME"}</p>
                </div>
              </div>
              <div className="shrink-0 w-full xl:w-auto flex justify-end">
                {res.RES_Score < 5 && res.RES_Status === 'PENDING' ? (
                  <button onClick={() => handleConvertToNC(res.RES_Id)} className="w-full xl:w-auto px-10 py-6 bg-rose-600 hover:scale-105 rounded-[2.5rem] font-black text-[11px] tracking-widest text-white italic border-none cursor-pointer shadow-4xl flex items-center gap-4 justify-center">
                    <AlertOctagon size={20}/> Ouvrir NC §10.2
                  </button>
                ) : res.RES_Status === 'PROCESSED' ? (
                  <div className="px-10 py-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-[2.5rem] text-[11px] tracking-widest flex items-center gap-4 italic shadow-inner">
                    <CheckCircle size={20}/> NC SCELLÉE
                  </div>
                ) : <span className="text-[10px] text-slate-700 tracking-[0.4em] italic uppercase px-8">Niveau Conforme</span>}
              </div>
            </div>
          ))}
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-amber-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}