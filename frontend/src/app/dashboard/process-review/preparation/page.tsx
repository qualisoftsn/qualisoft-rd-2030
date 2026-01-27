/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import { Database, Search, Loader2, Target, Zap, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PreparationRevue() {
  const router = useRouter();
  const [processes, setProcesses] = useState<any[]>([]);
  const [selectedProc, setSelectedProc] = useState('');
  const [docRef, setDocRef] = useState('F-QLT-011');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  const steps = [
    { label: "Extraction des KPI", icon: Target },
    { label: "Analyse des Non-Conformités", icon: ShieldAlert },
    { label: "Évaluation des Risques", icon: Zap },
    { label: "Initialisation du PV", icon: Database }
  ];

  useEffect(() => {
    apiClient.get('/processus').then(res => {
      setProcesses(res.data);
      if (res.data.length > 0) setSelectedProc(res.data[0].PR_Id);
    });
  }, []);

  const handleStartScan = async () => {
    setIsScanning(true);
    // Simulation visuelle du Scan Deep-Learning
    for (let i = 0; i < steps.length; i++) {
      setScanStep(i);
      await new Promise(r => setTimeout(r, 800));
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
      alert("Erreur critique lors de l'agrégation des données.");
    }
  };

  if (isScanning) {
    const CurrentIcon = steps[scanStep].icon;
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-white italic">
        <div className="relative mb-12">
          <Loader2 size={120} className="text-blue-600 animate-spin opacity-20" />
          <CurrentIcon size={40} className="absolute inset-0 m-auto text-blue-500 animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-4">Moteur d&apos;analyse Qualisoft</p>
        <h2 className="text-3xl font-black uppercase tracking-tighter italic">
          {steps[scanStep].label}...
        </h2>
      </div>
    );
  }

  return (
    <div className="ml-72 p-12 bg-[#0B0F1A] min-h-screen text-white italic font-sans text-left">
      <header className="mb-16">
        <h1 className="text-7xl font-black uppercase italic tracking-tighter">
          Scan <span className="text-blue-600">Performance</span>
        </h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-4">
          Agrégation automatique des données SMI avant revue
        </p>
      </header>

      <div className="max-w-3xl bg-slate-900/40 border border-white/5 p-16 rounded-[4rem] space-y-12 shadow-3xl">
        <div className="space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-3">
              <Target size={16}/> Sélection du Processus
            </label>
            <select 
              value={selectedProc} 
              onChange={e => setSelectedProc(e.target.value)} 
              className="w-full bg-slate-950 border border-white/10 p-6 rounded-3xl font-black text-xl italic text-white outline-none focus:border-blue-600 transition-all appearance-none"
            >
              {processes.map(p => <option key={p.PR_Id} value={p.PR_Id}>[{p.PR_Code}] {p.PR_Libelle}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-3">
              <Database size={16}/> Référence Documentaire
            </label>
            <input 
              type="text" 
              value={docRef} 
              onChange={e => setDocRef(e.target.value)} 
              className="w-full bg-slate-950 border border-white/10 p-6 rounded-3xl font-black text-xl italic text-emerald-500 outline-none uppercase tracking-widest"
            />
          </div>
        </div>

        <button 
          onClick={handleStartScan} 
          className="w-full bg-blue-600 p-10 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-blue-900/40 hover:bg-blue-500 transition-all flex items-center justify-center gap-6 group"
        >
          Démarrer le moteur de Scan <Search size={24} className="group-hover:scale-110 transition-transform"/>
        </button>
      </div>
    </div>
  );
}