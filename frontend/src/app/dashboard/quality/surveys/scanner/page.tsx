/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Search, AlertOctagon, RefreshCcw, User, Truck, HeartHandshake, 
  CheckCircle, Users, ArrowLeft, Loader2, Activity, Filter
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';
import apiClient from '@/core/api/api-client';

type SurveyTarget = 'CLIENT' | 'SUPPLIER' | 'EMPLOYEE';

interface SurveyResult {
  RES_Id: string;
  RES_Score: number;
  RES_Comment: string;
  RES_Respondent: string;
  RES_Date: string;
  RES_Status: 'PENDING' | 'PROCESSED';
  RES_Target: SurveyTarget;
}

export default function SurveyResultScanner() {
  const [filter, setFilter] = useState<'ALL' | SurveyTarget>('ALL');
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const targetConfig: Record<string, any> = {
    CLIENT: { color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', icon: <HeartHandshake size={14} />, label: 'CLIENT' },
    SUPPLIER: { color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/20', icon: <Truck size={14} />, label: 'FOURNISSEUR' },
    EMPLOYEE: { color: 'text-purple-500', bg: 'bg-purple-500/5', border: 'border-purple-500/20', icon: <Users size={14} />, label: 'COLLABORATEUR' }
  };

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/surveys/results');
      setResults(Array.isArray(res.data?.data) ? res.data.data : res.data || []);
    } catch (error) { toast.error("RUPTURE SYNC SCANNER"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return results.filter(r => (filter === 'ALL' || r.RES_Target === filter) && (r.RES_Respondent.toLowerCase().includes(t) || r.RES_Comment.toLowerCase().includes(t)));
  }, [filter, searchTerm, results]);

  const handleConvertToNC = async (id: string) => {
    const tid = toast.loading("Scellage NC §10.2...");
    try {
      await apiClient.post('/non-conformities', { source: 'SURVEY_RESULT', resultId: id });
      await apiClient.patch(`/surveys/results/${id}`, { status: 'PROCESSED' });
      toast.success("NC SCELLÉE", { id: tid });
      fetchResults();
    } catch (e) { toast.error("ÉCHEC SCELLAGE", { id: tid }); }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-amber-500" size={40} />
      <p className="text-amber-500 font-black uppercase italic text-[10px] tracking-widest animate-pulse">Scanning Data Stream...</p>
    </div>
  );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-6 overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER SCANNER DENSE */}
      <header className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 shrink-0">
        <div>
          <Link href="/dashboard/quality/surveys" className="text-[9px] font-black uppercase text-slate-500 hover:text-white flex items-center gap-2 no-underline mb-2 transition-colors">
            <ArrowLeft size={12}/> Retour Cockpit
          </Link>
          <h1 className="text-2xl font-black uppercase tracking-tighter m-0">Result <span className="text-amber-500">Scanner</span></h1>
        </div>
        
        <div className="flex gap-4 items-center">
            <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] font-black uppercase outline-none focus:border-amber-500 italic"
                    placeholder="FILTRAGE PAR MOT-CLÉ..."
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button onClick={fetchResults} className="p-2 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-amber-500 transition-all cursor-pointer"><RefreshCcw size={16}/></button>
        </div>
      </header>

      {/* 🧭 NAVIGATION TACTIQUE */}
      <div className="flex gap-2 mb-6 shrink-0 bg-black/20 p-1.5 rounded-2xl w-fit border border-white/5">
        {['ALL', 'CLIENT', 'SUPPLIER', 'EMPLOYEE'].map(t => (
          <button 
            key={t} onClick={() => setFilter(t as any)}
            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase italic transition-all border-none cursor-pointer ${filter === t ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-white bg-transparent'}`}
          >
            {t === 'ALL' ? 'Vue Globale' : t}
          </button>
        ))}
      </div>

      {/* 📊 GRILLE DE FEEDBACKS (FLEX-1) */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4 pr-2">
        {filtered.length > 0 ? filtered.map((res) => {
          const isCritical = res.RES_Score < 5;
          const conf = targetConfig[res.RES_Target] || targetConfig.CLIENT;
          return (
            <div key={res.RES_Id} className={`p-5 rounded-3xl border transition-all flex justify-between items-center group ${isCritical ? 'bg-rose-900/5 border-rose-500/20 shadow-inner' : 'bg-white/2 border-white/5 hover:bg-white/5'}`}>
              <div className="flex items-start gap-6">
                <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center border ${isCritical ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'}`}>
                  <span className="text-xl font-black italic leading-none">{res.RES_Score}</span>
                  <span className="text-[7px] font-black opacity-50 uppercase">Score</span>
                </div>
                <div className="space-y-2 max-w-2xl">
                   <div className="flex items-center gap-3">
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-1 border ${conf.border} ${conf.color} bg-black/40`}>{conf.icon} {conf.label}</span>
                     <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest italic">{new Date(res.RES_Date).toLocaleDateString()} • ID: {res.RES_Id}</span>
                   </div>
                   <h3 className="text-sm font-black text-white italic m-0 uppercase leading-snug">&quot;{res.RES_Comment}&quot;</h3>
                   <p className="text-[9px] text-slate-500 font-bold m-0 uppercase tracking-widest"><User size={10} className="inline mr-1"/> Source : {res.RES_Respondent}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {isCritical && res.RES_Status === 'PENDING' ? (
                  <button onClick={() => handleConvertToNC(res.RES_Id)} className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-white hover:text-rose-600 text-white rounded-xl font-black uppercase text-[9px] shadow-lg border-none cursor-pointer transition-all italic active:scale-95">
                    <AlertOctagon size={14}/> Ouvrir NC §10.2
                  </button>
                ) : res.RES_Status === 'PROCESSED' ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-[8px] font-black uppercase italic shadow-inner">
                    <CheckCircle size={14}/> SCELLÉ SMI
                  </div>
                ) : null}
              </div>
            </div>
          );
        }) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20"><RefreshCcw className="animate-spin-slow mb-4" size={40}/><p className="text-[10px] font-black uppercase tracking-[0.5em]">Aucune donnée détectée</p></div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #fbbf24; }
      `}</style>
    </div>
  );
}