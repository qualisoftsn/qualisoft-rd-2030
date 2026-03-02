/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : PRÉPARATION ET SCAN DE PERFORMANCE
 * -------------------------------------------------------------------------
 * RÔLE : Agrège automatiquement les données (NC, Audits, KPI) avant session.
 * ARCHITECTURE : Zéro NextAuth (100% apiClient).
 * DATE : 02 Mars 2026 | 13:01 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import { Database, Search, Loader2, Target, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';

export default function PreparationRevue() {
  const router = useRouter();
  const [processes, setProcesses] = useState<any[]>([]);
  const [selectedProc, setSelectedProc] = useState('');
  const [docRef, setDocRef] = useState('F-QLT-011');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  /** Étapes de la simulation de scan (Data Aggregation) EXACTES */
  const steps = [
    { label: "Extraction des KPI & Valeurs Cibles", icon: Target },
    { label: "Scan des Non-Conformités & Écarts", icon: ShieldAlert },
    { label: "Cartographie des Risques & Opportunités", icon: Zap },
    { label: "Génération du PV Numérique", icon: Database }
  ];

  useEffect(() => {
    apiClient.get('/processus')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setProcesses(data);
        if (data.length > 0) setSelectedProc(data[0].PR_Id);
      })
      .catch(() => toast.error("Erreur de récupération de la cartographie processus."));
  }, []);

  const handleStartScan = async () => {
    if (!selectedProc) return toast.error("Veuillez sélectionner un processus cible.");
    setIsScanning(true);
    
    // Boucle visuelle d'agrégation EXACTEMENT comme l'originale
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
      toast.error("ERREUR CRITIQUE : Échec de l'agrégation des flux SMI.");
    }
  };

  if (isScanning) {
    const CurrentIcon = steps[scanStep].icon;
    return (
      <div className="ml-0 lg:ml-72 min-h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-white italic font-sans text-center px-6 selection:bg-blue-500/30">
        <div className="relative mb-16 lg:mb-20">
          <Loader2 size={160} className="lg:w-55 lg:h-55 text-blue-600 animate-spin opacity-10" strokeWidth={1} />
          <CurrentIcon size={60} className="lg:w-20 lg:h-20 absolute inset-0 m-auto text-blue-500 animate-pulse" />
        </div>
        <div className="space-y-4 lg:space-y-6 max-w-2xl w-full">
          <p className="text-[11px] lg:text-[13px] font-black uppercase tracking-[0.4em] lg:tracking-[0.6em] text-slate-500 italic leading-none m-0">
            Deep Analysis Qualisoft Elite
          </p>
          <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter italic leading-tight m-0 text-white transition-all duration-300">
            {steps[scanStep].label}...
          </h2>
          <div className="flex gap-2 lg:gap-4 justify-center mt-8 lg:mt-10">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 lg:h-2 rounded-full transition-all duration-500 ${i <= scanStep ? 'w-10 lg:w-16 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)]' : 'w-6 lg:w-10 bg-white/10'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-0 lg:ml-72 p-6 lg:p-16 bg-[#0B0F1A] min-h-screen text-white italic font-sans text-left selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="mb-12 lg:mb-24 w-full max-w-5xl mx-auto text-left animate-in slide-in-from-top duration-700">
        <h1 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none mb-6 lg:mb-8 m-0">
          Scan <span className="text-blue-600">Performance</span>
        </h1>
        <p className="text-slate-500 text-[10px] lg:text-[12px] font-black uppercase tracking-[0.3em] lg:tracking-[0.5em] italic flex items-center gap-3 lg:gap-5 m-0 leading-snug">
          <Cpu size={18} className="text-blue-500 shrink-0" /> Agrégation automatique des flux SMI avant session (§9.3)
        </p>
      </header>

      <div className="w-full max-w-5xl mx-auto bg-[#151A2D] border-2 lg:border-4 border-white/5 p-8 lg:p-20 rounded-[3rem] lg:rounded-[5rem] space-y-12 lg:space-y-16 shadow-2xl relative overflow-hidden text-left animate-in fade-in duration-1000">
        <div className="absolute top-0 right-0 p-8 lg:p-16 opacity-[0.03] pointer-events-none"><Search size={200} className="lg:w-75 lg:h-75" /></div>

        <div className="space-y-8 lg:space-y-12 relative z-10">
          {/* Sélection Processus */}
          <div className="space-y-4 lg:space-y-6">
            <label className="text-[11px] lg:text-[13px] font-black uppercase text-blue-500 tracking-[0.2em] lg:tracking-[0.4em] flex items-center gap-3 lg:gap-4 italic ml-4 lg:ml-6 m-0">
              <Target size={18} className="lg:w-5.5 lg:h-5.5" /> Sélection du Processus Pilote
            </label>
            <div className="relative">
              <select 
                value={selectedProc} 
                onChange={e => setSelectedProc(e.target.value)} 
                className="w-full bg-slate-950 border-2 lg:border-4 border-white/10 p-6 lg:p-10 rounded-4xl lg:rounded-[3rem] font-black text-xl lg:text-3xl italic text-white outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer shadow-inner uppercase pr-16"
              >
                {processes.length === 0 && <option value="" disabled>Chargement de la cartographie...</option>}
                {processes.map(p => <option key={p.PR_Id} value={p.PR_Id}>[{p.PR_Code}] {p.PR_Libelle}</option>)}
              </select>
              <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                 ▼
              </div>
            </div>
          </div>

          {/* DocRef */}
          <div className="space-y-4 lg:space-y-6">
            <label className="text-[11px] lg:text-[13px] font-black uppercase text-slate-500 tracking-[0.2em] lg:tracking-[0.4em] flex items-center gap-3 lg:gap-4 italic ml-4 lg:ml-6 m-0">
              <Database size={18} className="lg:w-5.5 lg:h-5.5" /> Référence Documentaire (Système)
            </label>
            <input 
              type="text" 
              value={docRef} 
              onChange={e => setDocRef(e.target.value.toUpperCase())} 
              className="w-full bg-slate-950 border-2 lg:border-4 border-white/10 p-6 lg:p-10 rounded-4xl lg:rounded-[3rem] font-black text-xl lg:text-3xl italic text-emerald-500 outline-none focus:border-emerald-600 transition-all uppercase tracking-[0.2em] shadow-inner text-center"
            />
          </div>
        </div>

        {/* Bouton Master */}
        <button 
          onClick={handleStartScan} 
          disabled={!selectedProc || processes.length === 0}
          className="w-full bg-blue-600 py-8 lg:py-12 rounded-[3rem] lg:rounded-[4rem] font-black uppercase text-[12px] lg:text-[15px] tracking-[0.3em] lg:tracking-[0.5em] shadow-[0_15px_40px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-6 lg:gap-10 group border-none cursor-pointer italic relative z-10 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Démarrer le moteur de Scan <Search size={24} className="lg:w-8 lg:h-8 group-hover:rotate-12 transition-transform duration-500"/>
        </button>
      </div>
    </div>
  );
}