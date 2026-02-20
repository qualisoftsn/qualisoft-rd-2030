//* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📊 COMPOSANT : ProcessCard.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Affiche un résumé haute fidélité d'un processus métier.
 * RÔLE : Monitoring de la performance (KPI) et de l'exposition aux risques.
 * CONFORMITÉ : ISO 9001 §4.4 (Approche processus) et §9.1 (Surveillance).
 * DESIGN : Style "Sovereign" avec indicateurs d'état dynamiques.
 */

import { ArrowUpRight, AlertTriangle, CheckCircle2, Target } from 'lucide-react';

// --- INTERFACES DE STRUCTURE (TYPAGE ÉLITE) ---
interface ProcessIndicatorValue {
  IV_Actual: number;
}

interface ProcessIndicator {
  IND_Cible: number;
  IND_Values?: ProcessIndicatorValue[];
}

interface ProcessRisk {
  RS_Score: number;
  RS_Libelle: string;
}

interface ProcessData {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_Indicators?: ProcessIndicator[];
  PR_Risks?: ProcessRisk[];
}

interface ProcessCardProps {
  process: ProcessData;
}

export default function ProcessCard({ process }: ProcessCardProps) {
  // --- 1. EXTRACTION ET CALCUL DE LA PERFORMANCE KPI ---
  // On extrait le premier indicateur (KPI principal) du processus
  const kpi = process.PR_Indicators?.[0];
  
  // Calcul sécurisé du taux de performance : (Réel / Cible) * 100
  // On évite la division par zéro en s'assurant que la cible est > 0
  const actualValue = kpi?.IND_Values?.[0]?.IV_Actual ?? 0;
  const targetValue = kpi?.IND_Cible ?? 1; 
  const performance = Math.min((actualValue / targetValue) * 100, 100);

  // --- 2. ANALYSE DU RISQUE ---
  // On extrait le risque majeur associé
  const risk = process.PR_Risks?.[0];
  const isHighRisk = (risk?.RS_Score ?? 0) > 10;

  // --- 3. DÉTERMINATION DE L'ÉTAT VISUEL ---
  // Seuil de succès fixé à 95% pour la conformité ISO
  const isOptimal = performance >= 95;

  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 hover:border-blue-500/50 transition-all group shadow-2xl relative overflow-hidden">
      
      {/* EFFET DE GLOW AU SURVOL */}
      <div className="absolute -inset-px bg-linear-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* 🔝 HEADER : IDENTIFICATION DU PROCESSUS */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="text-left">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] italic">
            {process.PR_Code || 'PROC-000'}
          </span>
          <h3 className="text-lg font-black text-white mt-1 group-hover:text-blue-400 transition-colors tracking-tighter italic leading-tight">
            {process.PR_Libelle}
          </h3>
        </div>
        
        {/* BADGE D'ÉTAT CRITIQUE / OPTIMAL */}
        <div className={`p-2.5 rounded-xl border transition-all ${
          isOptimal 
          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
        }`}>
          {isOptimal ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <AlertTriangle size={18} strokeWidth={2.5} />}
        </div>
      </div>

      {/* 📊 SECTION PERFORMANCE : JAUGE DYNAMIQUE */}
      <div className="space-y-3 relative z-10">
        <div className="flex justify-between items-end text-[10px] font-black uppercase italic tracking-widest">
          <div className="flex items-center gap-2 text-slate-500">
            <Target size={12} />
            <span>Indice de Performance</span>
          </div>
          <span className={isOptimal ? 'text-emerald-500' : 'text-white'}>
            {performance.toFixed(1)}%
          </span>
        </div>
        
        {/* BARRE DE PROGRESSION SOUVERAINE */}
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5">
          <div 
            className={`h-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor] ${
              isOptimal ? 'bg-emerald-500' : 'bg-blue-600'
            }`}
            style={{ width: `${performance}%` }}
          />
        </div>
      </div>

      {/* ⚠️ FOOTER : MONITORING DES RISQUES ET ACTIONS */}
      <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          {/* Indicateur de score de risque dynamique */}
          <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${
            isHighRisk ? 'bg-red-500 animate-pulse shadow-red-500/50' : 'bg-slate-700'
          }`} />
          <div className="text-left">
            <p className="text-[9px] text-slate-500 uppercase font-black italic tracking-tighter leading-none">Risque Majeur</p>
            <p className="text-[10px] text-white font-bold uppercase italic mt-1 truncate max-w-30">
              {risk?.RS_Libelle || 'Aucun risque identifié'}
            </p>
          </div>
        </div>

        {/* BOUTON D'ACCÈS AU COCKPIT DU PROCESSUS */}
        <button className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all cursor-pointer border-none bg-transparent">
          <ArrowUpRight size={20} />
        </button>
      </div>
      
      {/* INDICATEUR DE PRIORITÉ BAS DE CARTE */}
      {isHighRisk && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600/50" />
      )}
    </div>
  );
}