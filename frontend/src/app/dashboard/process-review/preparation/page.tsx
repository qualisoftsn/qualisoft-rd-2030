/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { Database, Search, Loader2, Target, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * 🛰️ MODULE : PRÉPARATION ET SCAN DE PERFORMANCE
 * -------------------------------------------------------------------------
 * RÔLE : 
 * Agrège automatiquement les données de performance (NC, Audits, KPI) 
 * avant l'ouverture de la session de revue.
 * -------------------------------------------------------------------------
 */

export default function PreparationRevue() {
  const router = useRouter();
  const [processes, setProcesses] = useState<any[]>([]);
  const [selectedProc, setSelectedProc] = useState('');
  const [docRef, setDocRef] = useState('F-QLT-011');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  /** Étapes de la simulation de scan (Data Aggregation) */
  const steps = [
    { label: "Extraction des KPI & Valeurs Cibles", icon: Target },
    { label: "Scan des Non-Conformités & Écarts", icon: ShieldAlert },
    { label: "Cartographie des Risques & Opportunités", icon: Zap },
    { label: "Génération du PV Numérique", icon: Database }
  ];

  useEffect(() => {
    apiClient.get('/processus').then(res => {
      setProcesses(res.data);
      if (res.data.length > 0) setSelectedProc(res.data[0].PR_Id);
    });
  }, []);

  /**
   * ⚡ DÉCLENCHEMENT DU SCAN DE PERFORMANCE
   * Crée la revue en base et redirige vers la session interactive.
   */
  const handleStartScan = async () => {
    if (!selectedProc) return;
    setIsScanning(true);
    
    // Séquence visuelle d'agrégation de données
    for (let i = 0; i < steps.length; i++) {
      setScanStep(i);
      await new Promise(r => setTimeout(r, 1000));
    }

    try {
      const res = await apiClient.post('/process-reviews/initialize', {
        processId: selectedProc,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        docRef: docRef
      });
      router.push(`/dashboard/process-review/session/${res.data.PRV_Id}`);
    } catch (err) {
      setIsScanning(false);
      alert("ERREUR CRITIQUE : Échec de l'agrégation des flux SMI.");
    }
  };

  if (isScanning) {
    const CurrentIcon = steps[scanStep].icon;
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-white italic font-sans text-center">
        <div className="relative mb-16">
          <Loader2 size={180} className="text-blue-600 animate-spin opacity-10" />
          <CurrentIcon size={64} className="absolute inset-0 m-auto text-blue-500 animate-pulse" />
        </div>
        <div className="space-y-4">
          <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-500 italic leading-none">
            Deep Analysis Qualisoft Elite
          </p>
          <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-tight">
            {steps[scanStep].label}...
          </h2>
          <div className="flex gap-2 justify-center mt-6">
            {steps.map((_, i) => (
              <div key={i} className={`w-12 h-1.5 rounded-full transition-all duration-500 ${i <= scanStep ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)]' : 'bg-white/5'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-72 p-16 bg-[#0B0F1A] min-h-screen text-white italic font-sans text-left selection:bg-blue-600/30 animate-in fade-in duration-700">
      
      <header className="mb-20 text-left">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-6">
          Scan <span className="text-blue-600">Performance</span>
        </h1>
        <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] italic flex items-center gap-4">
          <Cpu size={16} className="text-blue-500" /> Agrégation automatique des flux SMI avant session (§9.3)
        </p>
      </header>

      <div className="max-w-4xl bg-slate-900/40 border border-white/5 p-20 rounded-[5rem] space-y-16 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none"><Search size={250} /></div>

        <div className="space-y-12 relative z-10 text-left">
          {/* Sélection Processus */}
          <div className="space-y-5 text-left">
            <label className="text-[11px] font-black uppercase text-blue-500 tracking-[0.3em] flex items-center gap-3 italic ml-4">
              <Target size={18}/> Sélection du Processus Pilote
            </label>
            <select 
              value={selectedProc} 
              onChange={e => setSelectedProc(e.target.value)} 
              className="w-full bg-slate-950 border border-white/10 p-8 rounded-[2.5rem] font-black text-2xl italic text-white outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer shadow-inner"
            >
              {processes.map(p => <option key={p.PR_Id} value={p.PR_Id}>[{p.PR_Code}] {p.PR_Libelle}</option>)}
            </select>
          </div>

          {/* DocRef */}
          <div className="space-y-5 text-left">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em] flex items-center gap-3 italic ml-4">
              <Database size={18}/> Référence Documentaire (Système)
            </label>
            <input 
              type="text" 
              value={docRef} 
              onChange={e => setDocRef(e.target.value.toUpperCase())} 
              className="w-full bg-slate-950 border border-white/10 p-8 rounded-[2.5rem] font-black text-2xl italic text-emerald-500 outline-none focus:border-emerald-600 transition-all uppercase tracking-widest shadow-inner text-center"
            />
          </div>
        </div>

        {/* Bouton Master */}
        <button 
          onClick={handleStartScan} 
          className="w-full bg-blue-600 py-10 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.4em] shadow-[0_25px_60px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-8 group border-none cursor-pointer italic relative z-10"
        >
          Démarrer le moteur de Scan <Search size={28} className="group-hover:rotate-12 transition-transform duration-500"/>
        </button>
      </div>
    </div>
  );
}