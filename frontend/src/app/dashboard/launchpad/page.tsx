/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/core/api/api-client';
import { 
  Rocket, GitBranch, CheckCircle2, AlertTriangle, 
  FileWarning, ArrowRight, Activity, Zap 
} from 'lucide-react';

export default function PilotLaunchpad() {
  const [myProcess, setMyProcess] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On appelle findAll sans paramètre : le service, étant étanche, 
    // ne renverra que LE processus rattaché à cet utilisateur.
    apiClient.get('/processus').then(res => {
      setMyProcess(res.data[0]); // On prend le premier (et normalement seul) processus
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="h-screen bg-[#0B0F1A] flex items-center justify-center ml-72"><Activity className="animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 p-12">
      
      {/* 👋 WELCOME SECTION */}
      <header className="mb-12">
        <h1 className="text-5xl font-black uppercase tracking-tighter italic flex items-center gap-4">
          <Rocket className="text-blue-500" size={48} /> Launchpad <span className="text-blue-500">Pilote</span>
        </h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.4em] mt-4 italic">
          Focus Opérationnel • Qualisoft Elite 2026
        </p>
      </header>

      <div className="grid grid-cols-12 gap-10">
        
        {/* 🕹️ ACCÈS DIRECT AU COCKPIT (L'ÉLÉMENT MAÎTRE) */}
        <div className="col-span-8">
          <Link href={`/dashboard/processus/cockpit/${myProcess?.PR_Id}`}>
            <div className="group bg-blue-600 p-1 rounded-[3.5rem] hover:scale-[1.01] transition-all cursor-pointer shadow-2xl shadow-blue-900/40">
              <div className="bg-[#0B0F1A] rounded-[3.4rem] p-10 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                    <GitBranch size={40} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Accéder à mon Cockpit</h2>
                    <p className="text-blue-500 font-black text-xs uppercase italic tracking-widest">{myProcess?.PR_Code} — {myProcess?.PR_Libelle}</p>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-blue-600 transition-all">
                  <ArrowRight size={24} />
                </div>
              </div>
            </div>
          </Link>

          {/* ⚡ ACTIONS RAPIDES */}
          <div className="grid grid-cols-2 gap-8 mt-10">
             <QuickCard title="Déclarer une NC" icon={AlertTriangle} color="text-red-500" />
             <QuickCard title="Nouvelle Action" icon={Zap} color="text-amber-500" />
          </div>
        </div>

        {/* 📊 RÉSUMÉ DES URGENCES (§10.2) */}
        <div className="col-span-4 space-y-8">
           <div className="bg-white/2 border border-white/5 rounded-[3rem] p-8">
              <h3 className="text-[10px] font-black uppercase text-slate-500 mb-6 tracking-widest italic">Alertes Prioritaires</h3>
              <div className="space-y-6">
                 <AlertItem count={3} label="Actions en retard" color="text-red-500" />
                 <AlertItem count={1} label="Indicateur hors cible" color="text-amber-500" />
                 <AlertItem count={5} label="Docs à réviser" color="text-blue-500" />
              </div>
           </div>

           <div className="bg-blue-600/5 border border-blue-600/10 rounded-[3rem] p-8 text-center">
              <p className="text-[10px] font-black text-blue-500 uppercase italic leading-relaxed">
                &quot;La qualité n&apos;est pas un acte, c&apos;est une habitude.&quot;
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function QuickCard({ title, icon: Icon, color }: any) {
  return (
    <div className="bg-white/2 border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/5 transition-all cursor-pointer group">
       <Icon size={24} className={`${color} mb-4 group-hover:scale-110 transition-transform`} />
       <h4 className="text-xs font-black uppercase italic text-white">{title}</h4>
    </div>
  );
}

function AlertItem({ count, label, color }: any) {
  return (
    <div className="flex items-center gap-4">
       <span className={`text-2xl font-black italic ${color}`}>{count}</span>
       <span className="text-[10px] font-black uppercase italic text-slate-400">{label}</span>
    </div>
  );
}