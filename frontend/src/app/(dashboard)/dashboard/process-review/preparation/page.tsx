/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : PRÉPARATION ET SCAN DE PERFORMANCE (SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Agrège les flux (NC, Audits, KPI) avant session de revue.
 * DESIGN : Elite High-Density, 100dvh, Zero-Scroll, Matrix Interface.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 18:40 GMT
 */

"use client";

import React, { useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import { Database, Search, Loader2, Target, Zap, ShieldAlert, Cpu, RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';

export default function PreparationRevue() {
  const router = useRouter();
  const [processes, setProcesses] = useState<any[]>([]);
  const [selectedProc, setSelectedProc] = useState('');
  const [docRef, setDocRef] = useState('F-QLT-011');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  const steps = [
    { label: "Extraction des KPI & Valeurs Cibles", icon: Target },
    { label: "Scan des Non-Conformités & Écarts", icon: ShieldAlert },
    { label: "Cartographie des Risques & Opportunités", icon: Zap },
    { label: "Génération du PV Numérique", icon: Database }
  ];

  useEffect(() => {
    apiClient.get('/processus')
      .then(res => {
        const data = res.data?.data || res.data || [];
        setProcesses(data);
        if (data.length > 0) setSelectedProc(data[0].PR_Id);
      })
      .catch(() => toast.error("ERREUR : CARTOGRAPHIE PROCESSUS INACCESSIBLE"));
  }, []);

  const handleStartScan = async () => {
    if (!selectedProc) return toast.error("VÉRIFICATION : SÉLECTIONNEZ UN PROCESSUS");
    setIsScanning(true);
    
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
    } catch {
      setIsScanning(false);
      toast.error("ERREUR CRITIQUE : ÉCHEC D'AGRÉGATION SDE");
    }
  };

  if (isScanning) {
    const CurrentIcon = steps[scanStep].icon;
    return <LoadingScan step={steps[scanStep].label} Icon={CurrentIcon} progress={scanStep} total={steps.length} />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <button onClick={() => router.back()} className="text-[9px] text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer italic flex items-center gap-2"><ArrowLeft size={14}/> Retour</button>
          <h1 className="text-4xl lg:text-6xl tracking-tighter leading-none m-0 italic">Scan <span className="text-blue-600">Performance</span></h1>
        </div>
        <div className="hidden xl:flex items-center gap-4 px-6 py-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
          <Cpu size={18} className="text-blue-500" />
          <span className="text-[9px] text-blue-500 tracking-[0.4em]">SDE ANALYTICS ENGINE</span>
        </div>
      </header>

      <main className="flex-1 p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-[#151A2D] border-2 border-white/5 p-12 lg:p-20 rounded-[4rem] shadow-4xl relative overflow-hidden text-left animate-in zoom-in-95 duration-500">
          <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none"><Search size={250} /></div>

          <div className="space-y-12 relative z-10">
            <div className="space-y-4">
              <label className="text-[10px] text-blue-500 tracking-[0.4em] ml-6 flex items-center gap-3 italic font-black"><Target size={16}/> Sélection du Processus Pilote</label>
              <select value={selectedProc} onChange={e => setSelectedProc(e.target.value)} className="w-full bg-slate-950 border-2 border-white/10 p-8 rounded-[2.5rem] font-black text-xl lg:text-3xl italic text-white outline-none focus:border-blue-600 appearance-none cursor-pointer shadow-inner uppercase pr-16">
                {processes.map(p => <option key={p.PR_Id} value={p.PR_Id}>[{p.PR_Code}] {p.PR_Libelle}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] text-slate-500 tracking-[0.4em] ml-6 flex items-center gap-3 italic font-black"><Database size={16}/> Référence Documentaire</label>
              <input type="text" value={docRef} onChange={e => setDocRef(e.target.value.toUpperCase())} className="w-full bg-slate-950 border-2 border-white/10 p-8 rounded-[2.5rem] font-black text-xl lg:text-3xl italic text-emerald-500 outline-none focus:border-emerald-600 text-center uppercase shadow-inner" />
            </div>

            <button onClick={handleStartScan} className="w-full bg-blue-600 py-10 rounded-[3rem] font-black uppercase text-[15px] tracking-[0.5em] shadow-4xl hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-10 group border-none cursor-pointer text-white italic">
              Démarrer le moteur de Scan <Search size={28} className="group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadingScan({ step, Icon, progress, total }: any) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] text-white italic font-black uppercase tracking-[0.5em] gap-12 lg:pl-72">
      <div className="relative">
        <Loader2 size={180} className="text-blue-600 animate-spin opacity-10" />
        <Icon size={70} className="absolute inset-0 m-auto text-blue-500 animate-pulse" />
      </div>
      <div className="space-y-8 max-w-xl w-full text-center">
        <h2 className="text-4xl tracking-tighter text-white m-0 leading-none">{step}...</h2>
        <div className="flex gap-4 justify-center">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i <= progress ? 'w-16 bg-blue-600 shadow-4xl' : 'w-10 bg-white/10'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}