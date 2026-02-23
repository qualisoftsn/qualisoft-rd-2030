/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : PRÉPARATION ET SCAN DE PERFORMANCE
 * -------------------------------------------------------------------------
 * RÔLE : Agrège automatiquement les données (NC, Audits, KPI) avant session.
 * CONSOLIDATION : Maintien strict de la boucle d'agrégation `steps`.
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
  const [docRef, setDocRef] = useState('F-QLT-011'); // Valeur par défaut restaurée
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
    apiClient.get('/processus').then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setProcesses(data);
      if (data.length > 0) setSelectedProc(data[0].PR_Id);
    }).catch(() => toast.error("Erreur de récupération processus."));
  }, []);

  const handleStartScan = async () => {
    if (!selectedProc) return toast.error("Veuillez sélectionner un processus.");
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
      <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-white italic font-sans text-center">
        <div className="relative mb-20">
          <Loader2 size={220} className="text-blue-600 animate-spin opacity-10" strokeWidth={1} />
          <CurrentIcon size={80} className="absolute inset-0 m-auto text-blue-500 animate-pulse" />
        </div>
        <div className="space-y-6">
          <p className="text-[13px] font-black uppercase tracking-[0.6em] text-slate-500 italic leading-none">
            Deep Analysis Qualisoft Elite
          </p>
          <h2 className="text-6xl font-black uppercase tracking-tighter italic leading-tight">
            {steps[scanStep].label}...
          </h2>
          <div className="flex gap-4 justify-center mt-10">
            {steps.map((_, i) => (
              <div key={i} className={`w-16 h-2 rounded-full transition-all duration-500 ${i <= scanStep ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.8)]' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-72 p-16 bg-[#0B0F1A] min-h-screen text-white italic font-sans text-left selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="mb-24 w-full max-w-5xl mx-auto text-left">
        <h1 className="text-7xl font-black uppercase italic tracking-tighter leading-none mb-8">
          Scan <span className="text-blue-600">Performance</span>
        </h1>
        <p className="text-slate-500 text-[12px] font-black uppercase tracking-[0.5em] italic flex items-center gap-5">
          <Cpu size={20} className="text-blue-500" /> Agrégation automatique des flux SMI avant session (§9.3)
        </p>
      </header>

      <div className="w-full max-w-5xl mx-auto bg-[#151A2D] border-4 border-white/5 p-20 rounded-[5rem] space-y-16 shadow-4xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none"><Search size={300} /></div>

        <div className="space-y-12 relative z-10">
          {/* Sélection Processus */}
          <div className="space-y-6">
            <label className="text-[13px] font-black uppercase text-blue-500 tracking-[0.4em] flex items-center gap-4 italic ml-6">
              <Target size={22}/> Sélection du Processus Pilote
            </label>
            <select 
              value={selectedProc} 
              onChange={e => setSelectedProc(e.target.value)} 
              className="w-full bg-slate-950 border-4 border-white/10 p-10 rounded-[3rem] font-black text-3xl italic text-white outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer shadow-inner uppercase"
            >
              {processes.map(p => <option key={p.PR_Id} value={p.PR_Id}>[{p.PR_Code}] {p.PR_Libelle}</option>)}
            </select>
          </div>

          {/* DocRef */}
          <div className="space-y-6">
            <label className="text-[13px] font-black uppercase text-slate-500 tracking-[0.4em] flex items-center gap-4 italic ml-6">
              <Database size={22}/> Référence Documentaire (Système)
            </label>
            <input 
              type="text" 
              value={docRef} 
              onChange={e => setDocRef(e.target.value.toUpperCase())} 
              className="w-full bg-slate-950 border-4 border-white/10 p-10 rounded-[3rem] font-black text-3xl italic text-emerald-500 outline-none focus:border-emerald-600 transition-all uppercase tracking-[0.2em] shadow-inner text-center"
            />
          </div>
        </div>

        {/* Bouton Master */}
        <button 
          onClick={handleStartScan} 
          className="w-full bg-blue-600 py-12 rounded-[4rem] font-black uppercase text-[15px] tracking-[0.5em] shadow-[0_30px_80px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-10 group border-none cursor-pointer italic relative z-10 text-white"
        >
          Démarrer le moteur de Scan <Search size={32} className="group-hover:rotate-12 transition-transform duration-500"/>
        </button>
      </div>
    </div>
  );
}