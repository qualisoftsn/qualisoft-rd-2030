/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : SURVEY RESULT SCANNER (ELITE SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Traitement en masse des retours d'enquête. Déclenchement de NC.
 * ARCHITECTURE : Zéro NextAuth (100% apiClient JWT).
 * DATE : 02 Mars 2026 | 13:31 GMT
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Search, AlertOctagon, RefreshCcw, User, Truck, HeartHandshake, 
  CheckCircle, Users, ArrowLeft, Loader2
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
    CLIENT: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <HeartHandshake size={16} />, label: 'CLIENT' },
    SUPPLIER: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: <Truck size={16} />, label: 'FOURNISSEUR' },
    EMPLOYEE: { color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: <Users size={16} />, label: 'COLLAB.' }
  };

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/surveys/results');
      setResults(Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
    } catch (error) { 
      toast.error("RUPTURE SYNC SCANNER : Impossible de récupérer les résultats."); 
    } finally { 
      setLoading(false); 
    }
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
    const tid = toast.loading("Scellage de la Non-Conformité §10.2 en cours...");
    try {
      await apiClient.post('/non-conformities', { source: 'SURVEY_RESULT', resultId: id });
      await apiClient.patch(`/surveys/results/${id}`, { status: 'PROCESSED' });
      toast.success("FICHE NC SCELLÉE DANS LA MATRIX.", { id: tid });
      fetchResults();
    } catch (e) { 
      toast.error("ÉCHEC DE SCELLAGE DE LA FICHE NC.", { id: tid }); 
    }
  };

  if (loading) return (
    <div className="ml-0 lg:ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <Loader2 className="animate-spin text-amber-500 w-16 h-16" strokeWidth={2} />
      <p className="text-amber-500 font-black uppercase italic text-[11px] lg:text-[12px] tracking-[0.5em] animate-pulse m-0">Scanning Data Stream...</p>
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 min-h-screen lg:h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-4 lg:p-6 overflow-hidden selection:bg-amber-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER SCANNER DENSE */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-white/10 pb-6 mb-6 shrink-0 gap-6">
        <div>
          <Link href="/dashboard/quality/surveys" className="w-fit text-[9px] lg:text-[10px] font-black uppercase text-slate-500 hover:text-white flex items-center gap-3 no-underline mb-4 transition-colors tracking-widest bg-white/5 px-4 py-1.5 rounded-lg border border-white/5">
            <ArrowLeft size={14}/> Retour Cockpit
          </Link>
          <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter m-0">
            Result <span className="text-amber-500">Scanner</span>
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                    className="w-full bg-slate-900 border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[10px] lg:text-[11px] font-black uppercase outline-none focus:border-amber-500 italic transition-colors shadow-inner placeholder:text-slate-600"
                    placeholder="FILTRAGE PAR MOT-CLÉ..."
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
              onClick={fetchResults} 
              className="p-4 bg-slate-900 rounded-2xl border-2 border-white/10 text-slate-400 hover:text-amber-500 hover:border-amber-500/30 transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0"
              title="Rafraîchir"
            >
              <RefreshCcw size={20} />
            </button>
        </div>
      </header>

      {/* 🧭 NAVIGATION TACTIQUE (Filtres) */}
      <div className="flex overflow-x-auto custom-scrollbar gap-2 mb-6 shrink-0 bg-slate-900/40 p-2 rounded-3xl w-full lg:w-fit border-2 border-white/5 pb-2">
        {['ALL', 'CLIENT', 'SUPPLIER', 'EMPLOYEE'].map(t => (
          <button 
            key={t} onClick={() => setFilter(t as any)}
            className={`px-5 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase italic transition-all border-none cursor-pointer tracking-widest whitespace-nowrap shrink-0 ${filter === t ? 'bg-amber-600 text-white shadow-[0_5px_15px_rgba(217,119,6,0.4)]' : 'text-slate-500 hover:text-white bg-transparent'}`}
          >
            {t === 'ALL' ? 'Vue Globale' : t}
          </button>
        ))}
      </div>

      {/* 📊 GRILLE DE FEEDBACKS (FLEX-1) */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4 lg:space-y-6 lg:pr-4 pb-6">
        
        {/* Intégration Visuelle Pédagogique */}
        {filtered.length > 0 && filter === 'ALL' && searchTerm === '' && (
           <div className="mb-6 bg-slate-900/40 border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6 opacity-80">
              <div className="flex-1">
                 <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-2 italic m-0">Principe d&apos;Amélioration Continue</p>
                 <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold m-0 italic leading-relaxed">Le traitement des insatisfactions est le moteur de l&apos;ISO 9001 (§10.2). Identifiez les anomalies, déclenchez les fiches de non-conformité et pilotez les actions correctives dans la Matrix.</p>
              </div>
              <div className="w-full md:w-62.5 shrink-0 opacity-50 mix-blend-screen text-center text-[8px] font-black uppercase tracking-widest">
                 
              </div>
           </div>
        )}

        {filtered.length > 0 ? filtered.map((res) => {
          const isCritical = res.RES_Score < 5;
          const conf = targetConfig[res.RES_Target] || targetConfig.CLIENT;
          
          return (
            <div key={res.RES_Id} className={`p-6 lg:p-8 rounded-4xl lg:rounded-[2.5rem] border-2 transition-all flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 group hover:shadow-xl ${isCritical ? 'bg-rose-900/10 border-rose-500/30' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-8 w-full xl:w-auto">
                
                <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl lg:rounded-3xl flex flex-col items-center justify-center border-2 shrink-0 shadow-inner ${isCritical ? 'bg-rose-500/10 border-rose-500/40 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500'}`}>
                  <span className="text-3xl lg:text-4xl font-black italic leading-none m-0 tracking-tighter">{res.RES_Score}</span>
                  <span className="text-[8px] lg:text-[9px] font-black opacity-60 uppercase mt-1 tracking-widest m-0">Score</span>
                </div>
                
                <div className="space-y-3 lg:space-y-4 max-w-3xl flex-1">
                   <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                     <span className={`px-3 py-1.5 rounded-lg text-[9px] lg:text-[10px] font-black uppercase flex items-center gap-2 border shadow-sm ${conf.border} ${conf.color} ${conf.bg}`}>
                       {conf.icon} {conf.label}
                     </span>
                     <span className="text-[9px] lg:text-[10px] text-slate-500 font-black uppercase tracking-widest italic m-0">
                       {new Date(res.RES_Date).toLocaleDateString('fr-FR')} • ID: {res.RES_Id}
                     </span>
                   </div>
                   <h3 className="text-base lg:text-xl font-black text-white italic m-0 uppercase leading-snug tracking-tight">
                     &quot;{res.RES_Comment || "AUCUN COMMENTAIRE TEXTUEL FOURNI."}&quot;
                   </h3>
                   <p className="text-[10px] lg:text-[11px] text-slate-400 font-bold m-0 uppercase tracking-widest flex items-center gap-2 italic">
                     <User size={12} className="text-slate-500"/> Source : <span className="text-slate-300">{res.RES_Respondent || "ANONYME"}</span>
                   </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full xl:w-auto justify-end border-t-2 border-white/5 xl:border-0 pt-4 xl:pt-0">
                {isCritical && res.RES_Status === 'PENDING' ? (
                  <button 
                    onClick={() => handleConvertToNC(res.RES_Id)} 
                    className="flex-1 xl:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl lg:rounded-2xl font-black uppercase text-[10px] lg:text-[11px] shadow-[0_10px_20px_rgba(225,29,72,0.3)] border-none cursor-pointer transition-all italic active:scale-95 tracking-widest m-0"
                  >
                    <AlertOctagon size={18} strokeWidth={2.5}/> Ouvrir NC §10.2
                  </button>
                ) : res.RES_Status === 'PROCESSED' ? (
                  <div className="flex-1 xl:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-500 rounded-xl lg:rounded-2xl text-[10px] lg:text-[11px] font-black uppercase italic shadow-inner tracking-widest m-0">
                    <CheckCircle size={18} strokeWidth={2.5}/> NC SCELLÉE
                  </div>
                ) : (
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic m-0 px-4">
                     Niveau Conforme
                  </div>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="h-full flex flex-col items-center justify-center opacity-30 border-4 border-dashed border-white/5 rounded-[3rem] bg-slate-900/20">
             <RefreshCcw className="animate-spin-slow mb-6 text-slate-500" size={60} strokeWidth={1.5} />
             <p className="text-[11px] lg:text-[12px] font-black uppercase tracking-[0.5em] text-slate-400 m-0">Aucune donnée détectée</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d97706; }
      `}</style>
    </div>
  );
}