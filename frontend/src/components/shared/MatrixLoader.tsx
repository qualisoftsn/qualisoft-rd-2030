/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛰️ MODULE : MATRIX TRANSITION LOADER (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Séquençage visuel de l'entrée dans le Kernel.
 * DESIGN : 100dvh, High-Density, Industrial Cyberpunk.
 * RÉVISION : 07 Mars 2026 | 15:20 GMT
 * -------------------------------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Zap, Activity, Cpu } from 'lucide-react';
import { cn } from '@/core/utils/cn';

export default function MatrixLoader({ label = "Initialisation du Tunnel..." }: { label?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + 1 : 100));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-9999 bg-[#050810] flex flex-col items-center justify-center overflow-hidden italic font-sans select-none">
      
      {/* 🌌 GRILLE DE FOND DYNAMIQUE */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px]" />
        <div className="absolute inset-0 bg-blue-600/5 mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-sm px-8 space-y-12 flex flex-col items-center">
        
        {/* 🛡️ LOGO PULSATIONNEL */}
        <div className="relative">
          <div className="w-32 h-32 bg-blue-600/10 rounded-[3rem] border-2 border-blue-500/20 flex items-center justify-center animate-pulse">
            <Cpu className="text-blue-500" size={56} strokeWidth={1} />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-4xl animate-bounce">
            <ShieldCheck className="text-white" size={20} />
          </div>
        </div>

        {/* 📊 TEXTES DE CHARGEMENT SDE */}
        <div className="text-center space-y-4 w-full">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter m-0 italic">
            Matrix <span className="text-blue-600">OS</span> <span className="text-slate-700">v3.0</span>
          </h2>
          <div className="flex flex-col gap-2">
             <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.6em] animate-pulse m-0 pl-[0.6em]">
              {label}
            </p>
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">
              Séquençage du nœud territorial : {progress}%
            </span>
          </div>
        </div>

        {/* ⚡ BARRE DE PROGRESSION TACTIQUE */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
           <div 
             className="h-full bg-blue-600 transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.8)]"
             style={{ width: `${progress}%` }}
           />
        </div>

        {/* 📡 TÉLÉMÉTRIE FLOTTANTE */}
        <div className="grid grid-cols-2 gap-4 w-full pt-6">
          <StatusItem icon={Zap} label="Tunnel SSL" value="Actif" color="blue" />
          <StatusItem icon={Activity} label="Latency" value="2ms" color="emerald" />
        </div>
      </div>

      {/* 🏛️ FILIGRANE SOUVERAIN */}
      <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-20">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[1em] m-0 pl-[1em]">
          Qualisoft Elite Node
        </p>
        <div className="flex gap-4">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
           <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
           <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
        </div>
      </div>

    </div>
  );
}

function StatusItem({ icon: Icon, label, value, color }: any) {
  const colors: any = {
    blue: "text-blue-500",
    emerald: "text-emerald-500"
  };
  return (
    <div className="bg-white/2 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2">
      <Icon size={16} className={colors[color]} />
      <div className="text-center">
        <p className="text-[7px] font-black text-slate-600 uppercase m-0">{label}</p>
        <p className="text-[9px] font-black text-white uppercase m-0 italic">{value}</p>
      </div>
    </div>
  );
}
