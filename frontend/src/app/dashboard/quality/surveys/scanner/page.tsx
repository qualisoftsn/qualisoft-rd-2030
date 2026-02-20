/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * NOM ABSOLU : src/app/dashboard/quality/surveys/scanner/page.tsx
 * FONCTION : Analyseur de flux de réponses et détection automatique des insatisfactions.
 * RÔLE : Surveillance de la performance §9.1.3 et déclenchement NC §10.2.
 * ARCHITECTURE : Réécriture optimisée pour le React Compiler (React 19+).
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search, AlertOctagon, RefreshCcw, User, 
  Truck, HeartHandshake, CheckCircle, 
  Users, Activity, Filter, ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

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

// --- 📊 JEU DE DONNÉES DE SIMULATION (FLUX D'ENTRÉE) ---
const MOCK_RESULTS: SurveyResult[] = [
  { RES_Id: 'R-1024', RES_Score: 9, RES_Comment: "Livraison parfaite, respect des délais ISO.", RES_Respondent: "SOCIÉTÉ SENELEC", RES_Date: "2026-02-10", RES_Status: 'PROCESSED', RES_Target: 'CLIENT' },
  { RES_Id: 'R-1025', RES_Score: 3, RES_Comment: "Retard critique sur la commande de câblage. Inacceptable.", RES_Respondent: "FOURNISSEUR BTP-SA", RES_Date: "2026-02-09", RES_Status: 'PENDING', RES_Target: 'SUPPLIER' },
  { RES_Id: 'R-1026', RES_Score: 7, RES_Comment: "Ambiance correcte mais manque de formation sécurité.", RES_Respondent: "COLLABORATEUR ANONYME", RES_Date: "2026-02-08", RES_Status: 'PENDING', RES_Target: 'EMPLOYEE' },
  { RES_Id: 'R-1027', RES_Score: 4, RES_Comment: "Le support technique ne répond pas aux tickets urgents.", RES_Respondent: "CLINIQUE PASTEUR", RES_Date: "2026-02-08", RES_Status: 'PENDING', RES_Target: 'CLIENT' },
];

export default function SurveyResultScanner() {
  // --- ÉTATS DE PILOTAGE ---
  const [filter, setFilter] = useState<'ALL' | SurveyTarget>('ALL');
  const [results, setResults] = useState<SurveyResult[]>(MOCK_RESULTS);
  const [searchTerm, setSearchTerm] = useState('');

  // Matrice de configuration visuelle pour l'identification instantanée (Pilier de design Sovereign)
  const targetConfig = {
    CLIENT: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: <HeartHandshake size={16} />, label: 'UNITÉ CLIENT' },
    SUPPLIER: { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: <Truck size={16} />, label: 'FOURNISSEUR' },
    EMPLOYEE: { color: 'text-purple-500', bg: 'bg-purple-500/10', icon: <Users size={16} />, label: 'COLLABORATEUR' }
  };

  /**
   * 🔍 MOTEUR DE FILTRAGE NATIF HAUTE PERFORMANCE
   * CORRECTIONS : 
   * 1. Normalisation des données en amont pour éviter les recalculs inutiles.
   * 2. Utilisation d'une structure pure compatible avec le nouveau React Compiler.
   */
  const filteredResults = useMemo(() => {
    // Normalisation préventive pour optimiser la recherche
    const term = searchTerm.toLowerCase().trim();
    
    return results.filter((r) => {
      // Filtrage par cible (ISO §9.1.2 / §8.4.2)
      const matchesTarget = filter === 'ALL' || r.RES_Target === filter;
      if (!matchesTarget) return false;

      // Recherche plein texte multicritère
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
   * Déclenche la création d'une fiche d'écart corrective.
   */
  const handleConvertToNC = useCallback((id: string) => {
    const loadingToast = toast.loading("Scellage de la Non-Conformité...");
    
    // Simulation du workflow de persistance SMI
    setTimeout(() => {
        toast.dismiss(loadingToast);
        toast.success(`Fiche NC §10.2 scellée pour le feedback ${id}`);
        // Mutation locale de l'état pour feedback visuel
        setResults(prev => prev.map(r => r.RES_Id === id ? { ...r, RES_Status: 'PROCESSED' } : r));
    }, 1500);
  }, []);

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans selection:bg-amber-600/30">
      
      {/* 🛰️ HEADER ANALYSEUR SCANNER */}
      <header className="mb-16 border-b border-white/5 pb-10 flex justify-between items-end animate-in fade-in duration-700">
        <div className="space-y-4 text-left">
          <Link href="/dashboard/quality/surveys" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-all flex items-center gap-2 mb-4">
             <ArrowLeft size={14}/> Retour au Cockpit
          </Link>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic">
            Surveillance & Analyse des Données de Sortie §9.1.3
          </p>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
            Result <span className="text-amber-500">Scanner</span>
          </h1>
        </div>
        
        <div className="flex gap-6">
            <div className="bg-black/40 border border-white/10 px-8 py-5 rounded-2xl flex items-center gap-5 shadow-inner">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] italic">Flux Temps Réel</span>
                <span className="flex items-center gap-3 text-emerald-500 font-black italic text-xs leading-none">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"/> SYNC ACTIVE
                </span>
            </div>
        </div>
      </header>

      {/* 🧭 NAVIGATION TACTIQUE & RECHERCHE */}
      <div className="flex justify-between items-center mb-12 gap-10">
         {/* Système de filtrage par segments normatifs */}
         <div className="flex gap-4 bg-white/5 p-2 rounded-[2.5rem] border border-white/10 shadow-inner">
            <button onClick={() => setFilter('ALL')} className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all italic border-none cursor-pointer ${filter === 'ALL' ? 'bg-white text-slate-900 shadow-2xl scale-105' : 'text-slate-500 hover:text-white'}`}>GLOBAL</button>
            <button onClick={() => setFilter('CLIENT')} className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all italic border-none cursor-pointer ${filter === 'CLIENT' ? 'bg-emerald-600 text-white shadow-2xl scale-105' : 'text-slate-500 hover:text-emerald-500'}`}>CLIENTS</button>
            <button onClick={() => setFilter('SUPPLIER')} className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all italic border-none cursor-pointer ${filter === 'SUPPLIER' ? 'bg-blue-600 text-white shadow-2xl scale-105' : 'text-slate-500 hover:text-blue-500'}`}>FNS</button>
            <button onClick={() => setFilter('EMPLOYEE')} className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all italic border-none cursor-pointer ${filter === 'EMPLOYEE' ? 'bg-purple-600 text-white shadow-2xl scale-105' : 'text-slate-500 hover:text-purple-500'}`}>RH</button>
         </div>
         
         {/* Barre de recherche souveraine */}
         <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SCANNER PAR RÉPONDANT OU MOT-CLÉ..." 
              className="w-full bg-slate-900/60 border border-white/10 rounded-full pl-20 pr-10 py-6 text-sm font-black uppercase text-white outline-none focus:border-amber-500 transition-all placeholder-slate-700 italic shadow-2xl"
            />
         </div>
      </div>

      

      {/* 📊 GRILLE DYNAMIQUE DES FEEDBACKS ANALYSÉS (§9.1.3) */}
      <div className="grid grid-cols-1 gap-10">
         {filteredResults.length > 0 ? filteredResults.map((res) => {
            const isCritical = res.RES_Score < 5;
            const config = targetConfig[res.RES_Target] || targetConfig.CLIENT;

            return (
              <div 
                key={res.RES_Id} 
                className={`relative overflow-hidden rounded-[3.5rem] p-12 transition-all hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-6 duration-500 ${
                  isCritical ? 'bg-rose-900/10 border border-rose-500/30 shadow-[0_30px_60px_rgba(244,63,94,0.1)]' : 'bg-slate-900/40 border border-white/5 shadow-2xl'
                }`}
              >
                 {/* MARQUAGE DE SÉCURITÉ LATÉRAL (VISUEL CRITIQUE) */}
                 <div className={`absolute left-0 top-0 bottom-0 w-4 ${isCritical ? 'bg-rose-500 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 opacity-30'}`} />

                 <div className="flex justify-between items-start text-left">
                    <div className="space-y-6 flex-1 pr-12">
                        <div className="flex items-center gap-6">
                          <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border ${config.bg.replace('/10', '/30')} ${config.color} border-white/5 italic leading-none`}>
                             {config.icon} {config.label}
                          </span>
                          <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest italic leading-none">REF: {res.RES_Id}</span>
                          <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest italic leading-none">• {res.RES_Date}</span>
                        </div>
                        
                        {/* CONTENU TEXTUEL DU FEEDBACK */}
                        <h3 className="text-3xl font-black italic text-white leading-snug tracking-tighter uppercase max-w-5xl">
                          &quot;{res.RES_Comment}&quot;
                        </h3>
                        
                        <div className="flex items-center gap-4 text-[12px] font-black uppercase text-slate-500 tracking-widest italic leading-none">
                          <User size={18} className="text-slate-700" /> SOURCE D&apos;ENTRÉE : <span className="text-slate-200">{res.RES_Respondent}</span>
                        </div>
                    </div>

                    {/* BLOC INDICATEUR SCORE & DÉCLENCHEUR PDCA (§10.2) */}
                    <div className="flex flex-col items-end gap-10 shrink-0">
                       <div className={`w-32 h-32 rounded-[2.5rem] flex flex-col items-center justify-center border shadow-2xl transition-transform hover:rotate-3 ${isCritical ? 'bg-rose-600 text-white border-rose-400 shadow-rose-900/40' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-900/20'}`}>
                          <span className="text-5xl font-black italic leading-none tracking-tighter">{res.RES_Score}</span>
                          <span className="text-[11px] font-black uppercase mt-1 tracking-widest leading-none">/10</span>
                       </div>

                       {/* Action corrective : Réservée aux scores critiques non traités */}
                       {isCritical && res.RES_Status === 'PENDING' && (
                          <button 
                            onClick={() => handleConvertToNC(res.RES_Id)}
                            className="flex items-center gap-4 px-10 py-6 bg-rose-600 hover:bg-rose-500 text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl hover:shadow-rose-500/40 transition-all border-none cursor-pointer italic active:scale-95"
                          >
                             <AlertOctagon size={20} /> Ouvrir une NC §10.2
                          </button>
                       )}
                       
                       {/* Statut traité (Archivé dans le SMI) */}
                       {res.RES_Status === 'PROCESSED' && (
                          <div className="flex items-center gap-3 px-8 py-5 bg-white/5 rounded-2xl border border-white/10 text-slate-400 text-[11px] font-black uppercase italic tracking-widest shadow-inner">
                             <CheckCircle size={18} className="text-emerald-500" /> Analysé & Traité SMI
                          </div>
                       )}
                    </div>
                 </div>
              </div>
            );
         }) : (
            /* ÉTAT VIDE : AUCUNE DONNÉE DÉTECTÉE DANS LE SCANNER */
            <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[4rem] opacity-30 animate-in fade-in duration-1000">
               <RefreshCcw className="mx-auto text-slate-700 mb-8 animate-spin-slow" size={64} />
               <p className="text-slate-600 font-black uppercase italic tracking-[0.4em] text-xl">Aucun flux de réponse détecté dans le scanner</p>
            </div>
         )}
      </div>
    </div>
  );
}