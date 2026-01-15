/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import { Database, Search, Loader2, Calendar, FileText, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PreparationRevue() {
  const router = useRouter();
  const [processes, setProcesses] = useState<any[]>([]);
  const [selectedProc, setSelectedProc] = useState('');
  const [docRef, setDocRef] = useState('F-QLT-011'); // Choix du document
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  const now = new Date();
  const periods = [
    { m: now.getMonth(), y: now.getFullYear(), label: 'Mois Précédent' },
    { m: now.getMonth() + 1, y: now.getFullYear(), label: 'Mois en Cours' }
  ];
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);

  useEffect(() => {
    apiClient.get('/processus').then(res => {
      setProcesses(res.data);
      if (res.data.length > 0) setSelectedProc(res.data[0].PR_Id);
    });
  }, []);

  const handleStartScan = async () => {
    setIsScanning(true);
    for (let i = 0; i < 4; i++) { setScanStep(i); await new Promise(r => setTimeout(r, 600)); }
    try {
      const res = await apiClient.post('/process-reviews/initialize', {
        processId: selectedProc,
        month: selectedPeriod.m,
        year: selectedPeriod.y,
        docRef: docRef
      });
      router.push(`/dashboard/process-review/session/${res.data.PRV_Id}`);
    } catch (err) { setIsScanning(false); alert("Erreur Scan"); }
  };

  if (isScanning) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-white italic">
      <Loader2 size={80} className="text-blue-600 animate-spin mb-8 opacity-20" />
      <h2 className="text-2xl font-black uppercase animate-pulse">
        {["Analyse KPI", "Scan NC", "Risques SMI", "Génération PV"][scanStep]}
      </h2>
    </div>
  );

  return (
    <div className="p-8 bg-[#0B0F1A] min-h-screen text-white italic font-sans">
      <h1 className="text-5xl font-black uppercase mb-12">Scan de <span className="text-blue-600">Performance</span></h1>
      <div className="max-w-4xl bg-slate-900/50 border border-white/5 p-12 rounded-[3rem] space-y-10 shadow-2xl">
        <div className="grid gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Database size={14}/> Périmètre</label>
            <select value={selectedProc} onChange={e => setSelectedProc(e.target.value)} className="w-full bg-slate-950 border border-white/10 p-5 rounded-2xl font-black text-blue-400 outline-none">
              {processes.map(p => <option key={p.PR_Id} value={p.PR_Id}>[{p.PR_Code}] {p.PR_Libelle}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><FileText size={14}/> Référence du Document (Modèle)</label>
            <input type="text" value={docRef} onChange={e => setDocRef(e.target.value)} className="w-full bg-slate-950 border border-white/10 p-5 rounded-2xl font-black text-emerald-400 outline-none uppercase" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {periods.map((p, i) => (
              <button key={i} onClick={() => setSelectedPeriod(p)} className={`p-6 rounded-2xl border transition-all ${selectedPeriod.m === p.m ? 'bg-blue-600 border-blue-400' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                <span className="block text-[8px] font-black uppercase mb-1">{p.label}</span>
                <span className="font-black italic">{p.m}/2025</span>
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleStartScan} className="w-full bg-blue-600 p-8 rounded-4xl font-black uppercase text-sm shadow-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-4">
          Démarrer l&apos;agrégation <Search size={20}/>
        </button>
      </div>
    </div>
  );
}