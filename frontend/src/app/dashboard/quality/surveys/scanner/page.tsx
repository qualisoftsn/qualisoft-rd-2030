//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 NOM ABSOLU : src/app/dashboard/quality/surveys/scanner/page.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Analyseur de flux de réponses et détection automatique des insatisfactions.
 * ARCHITECTURE : Zéro simulation, données issues de l'API SDE. Création de NC réelle.
 * DESIGN : Full-Space Matrix, Cartes de feedback massives, alertes visuelles.
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Search, AlertOctagon, RefreshCcw, User, 
  Truck, HeartHandshake, CheckCircle, 
  Users, ArrowLeft, Loader2
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';
import apiClient from '@/core/api/api-client';

// --- 🛡️ RÉFÉRENTIEL DES TYPES SMI SOUVERAINS ---
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
  // --- 📦 ÉTATS DE PILOTAGE ---
  const [filter, setFilter] = useState<'ALL' | SurveyTarget>('ALL');
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Matrice de configuration visuelle SDE
  const targetConfig: Record<string, any> = {
    CLIENT: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: <HeartHandshake size={24} />, label: 'UNITÉ CLIENT' },
    SUPPLIER: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: <Truck size={24} />, label: 'FOURNISSEUR' },
    EMPLOYEE: { color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: <Users size={24} />, label: 'COLLABORATEUR' }
  };

  /**
   * 📡 SYNCHRONISATION DES RÉSULTATS D'ENQUÊTE
   */
  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/surveys/results');
      const data = res.data?.data || res.data;
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("ÉCHEC DE CONNEXION AU SCANNER DE RÉSULTATS.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  /**
   * 🔍 MOTEUR DE FILTRAGE NATIF HAUTE PERFORMANCE
   */
  const filteredResults = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return results.filter((r) => {
      const matchesTarget = filter === 'ALL' || r.RES_Target === filter;
      if (!matchesTarget) return false;
      if (term === '') return true;
      return (
        r.RES_Respondent.toLowerCase().includes(term) || 
        r.RES_Comment.toLowerCase().includes(term) ||
        r.RES_Id.toLowerCase().includes(term)
      );
    });
  }, [filter, searchTerm, results]);

  /**
   * ⚡ ACTION : CONVERSION EN NON-CONFORMITÉ (§10.2)
   */
  const handleConvertToNC = useCallback(async (id: string) => {
    const tid = toast.loading("Scellage de la Non-Conformité dans la base SDE...");
    try {
      // Appel API réel pour générer la NC et mettre à jour le statut
      await apiClient.post('/non-conformities', { source: 'SURVEY_RESULT', resultId: id });
      await apiClient.patch(`/surveys/results/${id}`, { status: 'PROCESSED' });
      
      toast.success(`FICHE NC §10.2 SCELLÉE POUR L'ID ${id}.`, { id: tid });
      fetchResults(); // Re-sync the list
    } catch (error) {
      toast.error("ERREUR LORS DU SCELLAGE DE LA NC.", { id: tid });
    }
  }, [fetchResults]);

  if (loading) return (
    <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] gap-10">
      <Loader2 className="animate-spin text-amber-500" size={100} strokeWidth={1} />
      <p className="text-amber-500 font-black uppercase italic text-[14px] tracking-[1em] animate-pulse">
        Scanner Actif : Analyse des Flux...
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-16 ml-72 text-white font-sans italic text-left selection:bg-amber-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      <div className="w-full max-w-500 mx-auto space-y-16 animate-in fade-in duration-1000">

        {/* 🛰️ HEADER ANALYSEUR SCANNER */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b-4 border-white/5 pb-16">
          <div className="space-y-8">
            <Link href="/dashboard/quality/surveys" className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all flex items-center gap-4 bg-white/5 w-fit px-6 py-3 rounded-2xl border border-white/10">
               <ArrowLeft size={18}/> Retour au Cockpit
            </Link>
            <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none text-white flex items-center gap-8">
               Result <span className="text-amber-500">Scanner</span>
            </h1>
            <p className="text-slate-500 font-black text-[14px] uppercase tracking-[0.6em] italic opacity-60">
              SURVEILLANCE & ANALYSE DES DONNÉES DE SORTIE §9.1.3
            </p>
          </div>
          
          <div className="bg-[#151A2D] border-4 border-white/5 px-10 py-8 rounded-[3rem] flex items-center gap-8 shadow-4xl backdrop-blur-3xl">
              <span className="text-[12px] font-black uppercase text-slate-500 tracking-[0.4em] italic leading-none">Flux Temps Réel</span>
              <span className="flex items-center gap-4 text-emerald-500 font-black italic text-[14px] tracking-widest leading-none bg-emerald-500/10 px-5 py-2.5 rounded-2xl border border-emerald-500/20">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]"/> SYNC ACTIVE
              </span>
          </div>
        </header>

        {/* 🧭 NAVIGATION TACTIQUE & RECHERCHE (FULL SPACE) */}
        <div className="bg-[#151A2D] p-10 rounded-[4rem] border-4 border-white/5 flex flex-col xl:flex-row justify-between items-center gap-10 backdrop-blur-3xl shadow-4xl relative z-20">
           {/* Système de filtrage par segments normatifs */}
           <div className="flex gap-4 bg-black/40 p-4 rounded-[3.5rem] border-2 border-white/5 shadow-inner w-full xl:w-auto overflow-x-auto custom-scrollbar">
              <button onClick={() => setFilter('ALL')} className={`px-12 py-6 rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.4em] transition-all italic border-none cursor-pointer whitespace-nowrap ${filter === 'ALL' ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-white bg-transparent'}`}>GLOBAL</button>
              <button onClick={() => setFilter('CLIENT')} className={`px-12 py-6 rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.4em] transition-all italic border-none cursor-pointer whitespace-nowrap ${filter === 'CLIENT' ? 'bg-emerald-600 text-white shadow-[0_10px_30px_rgba(16,185,129,0.4)]' : 'text-slate-500 hover:text-emerald-500 bg-transparent'}`}>CLIENTS</button>
              <button onClick={() => setFilter('SUPPLIER')} className={`px-12 py-6 rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.4em] transition-all italic border-none cursor-pointer whitespace-nowrap ${filter === 'SUPPLIER' ? 'bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:text-blue-500 bg-transparent'}`}>FNS</button>
              <button onClick={() => setFilter('EMPLOYEE')} className={`px-12 py-6 rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.4em] transition-all italic border-none cursor-pointer whitespace-nowrap ${filter === 'EMPLOYEE' ? 'bg-purple-600 text-white shadow-[0_10px_30px_rgba(147,51,234,0.4)]' : 'text-slate-500 hover:text-purple-500 bg-transparent'}`}>RH</button>
           </div>
           
           {/* Barre de recherche souveraine */}
           <div className="relative w-full xl:w-150">
              <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-500" size={28} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="SCANNER PAR RÉPONDANT OU MOT-CLÉ..." 
                className="w-full bg-black/60 border-4 border-white/5 rounded-[3.5rem] pl-24 pr-10 py-8 text-[14px] font-black uppercase text-white outline-none focus:border-amber-500 transition-all placeholder-slate-700 italic shadow-inner tracking-widest"
              />
           </div>
        </div>

        {/* 📊 GRILLE DYNAMIQUE DES FEEDBACKS ANALYSÉS (§9.1.3) */}
        <div className="grid grid-cols-1 gap-12">
           {filteredResults.length > 0 ? filteredResults.map((res) => {
              const isCritical = res.RES_Score < 5;
              const config = targetConfig[res.RES_Target] || targetConfig.CLIENT;

              return (
                <div 
                  key={res.RES_Id} 
                  className={`relative overflow-hidden rounded-[5rem] p-16 transition-all hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-10 duration-700 backdrop-blur-md ${
                    isCritical ? 'bg-rose-900/10 border-4 border-rose-500/30 shadow-[0_0_80px_rgba(244,63,94,0.15)]' : 'bg-[#151A2D] border-4 border-white/5 shadow-4xl'
                  }`}
                >
                   {/* MARQUAGE DE SÉCURITÉ LATÉRAL */}
                   <div className={`absolute left-0 top-0 bottom-0 w-6 ${isCritical ? 'bg-rose-500 animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.8)]' : 'bg-emerald-500 opacity-20'}`} />

                   <div className="flex flex-col lg:flex-row justify-between items-start text-left gap-12 ml-4">
                      <div className="space-y-8 flex-1">
                          <div className="flex items-center gap-6 flex-wrap">
                            <span className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 border-2 ${config.bg.replace('/10', '/20')} ${config.color} ${config.border} italic leading-none shadow-inner`}>
                               {config.icon} {config.label}
                            </span>
                            <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em] italic leading-none bg-black/40 px-5 py-2.5 rounded-xl border border-white/5">REF: {res.RES_Id}</span>
                            <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em] italic leading-none bg-black/40 px-5 py-2.5 rounded-xl border border-white/5">{new Date(res.RES_Date).toLocaleDateString()}</span>
                          </div>
                          
                          {/* CONTENU TEXTUEL DU FEEDBACK */}
                          <h3 className="text-4xl font-black italic text-white leading-tight tracking-tighter uppercase max-w-6xl">
                            &quot;{res.RES_Comment}&quot;
                          </h3>
                          
                          <div className="flex items-center gap-5 text-[14px] font-black uppercase text-slate-500 tracking-[0.4em] italic leading-none bg-white/5 w-fit px-8 py-4 rounded-3xl border border-white/10">
                            <User size={24} className="text-slate-400" /> SOURCE D&apos;ENTRÉE : <span className="text-white bg-white/10 px-4 py-1.5 rounded-lg">{res.RES_Respondent}</span>
                          </div>
                      </div>

                      {/* BLOC INDICATEUR SCORE & DÉCLENCHEUR PDCA (§10.2) */}
                      <div className="flex flex-col items-center gap-10 shrink-0">
                         <div className={`w-40 h-40 rounded-[3rem] flex flex-col items-center justify-center border-4 shadow-3xl transition-transform hover:rotate-6 ${isCritical ? 'bg-rose-600/10 text-rose-500 border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.3)]' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                            <span className="text-7xl font-black italic leading-none tracking-tighter">{res.RES_Score}</span>
                            <span className="text-[14px] font-black uppercase mt-2 tracking-[0.4em] leading-none opacity-50">/10</span>
                         </div>

                         {/* Action corrective : Réservée aux scores critiques non traités */}
                         {isCritical && res.RES_Status === 'PENDING' && (
                            <button 
                              onClick={() => handleConvertToNC(res.RES_Id)}
                              className="flex items-center gap-5 px-10 py-6 bg-rose-600 hover:bg-white hover:text-rose-600 text-white rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.4em] shadow-[0_20px_40px_rgba(244,63,94,0.4)] transition-all border-none cursor-pointer italic active:scale-95 group"
                            >
                               <AlertOctagon size={24} className="group-hover:scale-110 transition-transform" /> Ouvrir une NC §10.2
                            </button>
                         )}
                         
                         {/* Statut traité (Archivé dans le SMI) */}
                         {res.RES_Status === 'PROCESSED' && (
                            <div className="flex items-center gap-4 px-10 py-6 bg-emerald-500/10 rounded-[2.5rem] border-2 border-emerald-500/20 text-emerald-500 text-[12px] font-black uppercase italic tracking-[0.4em] shadow-inner">
                               <CheckCircle size={24} /> Analysé & Traité SMI
                            </div>
                         )}
                      </div>
                   </div>
                </div>
              );
           }) : (
              /* ÉTAT VIDE : AUCUNE DONNÉE DÉTECTÉE DANS LE SCANNER */
              <div className="py-40 text-center border-4 border-dashed border-white/5 rounded-[5rem] opacity-30 animate-in fade-in duration-1000 bg-[#151A2D]">
                 <RefreshCcw className="mx-auto text-slate-500 mb-10 animate-spin-slow" size={80} strokeWidth={1} />
                 <p className="text-slate-400 font-black uppercase italic tracking-[0.6em] text-2xl">Aucun flux de réponse détecté dans le scanner</p>
              </div>
           )}
        </div>
      </div>
      
      <style jsx global>{`
        ::-webkit-scrollbar { width: 0px; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>
    </div>
  );
}