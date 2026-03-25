/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛠️ MODULE : WORKSPACE SETUP (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Point d'entrée configuration pour Tenant Admin.
 * DESIGN : ClickUp High-Density, 100dvh, Zero Global Scroll.
 * RÉVISION : 06 Mars 2026 | 21:15 GMT
 * -------------------------------------------------------------------------
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, Layers, ChevronRight, 
  ShieldCheck, Loader2, Globe, Activity
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import Link from 'next/link';

export default function WorkspaceSetup() {
  const [stats, setStats] = useState({ sites: 0, units: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const [s, u, usr] = await Promise.all([
        apiClient.get('/sites'),
        apiClient.get('/org-units'),
        apiClient.get('/users')
      ]);
      setStats({ sites: s.data.length, units: u.data.length, users: usr.data.length });
    } catch { /* Silent Fallback */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return <LoadingMatrix label="Initialisation du Workspace..." />;

  return (
    <div className="h-full flex flex-col p-8 md:p-12 gap-10 font-sans italic animate-in fade-in duration-700">
      
      <header className="space-y-4 shrink-0">
        <div className="flex items-center gap-3 text-emerald-500 font-black uppercase tracking-[0.4em] text-[9px]">
          <ShieldCheck size={14} /> Noyau SMI Configuré & Scellé
        </div>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic m-0 text-white leading-none">
          Workspace <span className="text-emerald-500">SDE</span>
        </h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.5em] m-0">Pilotage de la structure géo-fonctionnelle de votre organisation.</p>
      </header>

      {/* GRILLE TACTIQUE : Occupation intégrale */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-0">
        <SetupTile 
          title="Sites & Implantations" 
          count={stats.sites} 
          icon={MapPin} color="blue" 
          link="/workspace/sites" 
          desc="Définissez vos zones géographiques et adresses d'exploitation." 
        />
        <SetupTile 
          title="Unités & Services" 
          count={stats.units} 
          icon={Layers} color="emerald" 
          link="/workspace/structure" 
          desc="Organisez vos départements et directions hiérarchiques." 
        />
        <SetupTile 
          title="Registre des Tiers" 
          count="SCELLÉ" 
          icon={Globe} color="purple" 
          link="/workspace/tiers" 
          desc="Administration des clients et partenaires stratégiques." 
        />
      </div>

      <footer className="shrink-0 flex items-center justify-between opacity-30">
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <Activity size={14} /> Node Status : Opérationnel
        </div>
        <div className="text-[9px] font-black italic">Qualisoft SDE Workspace v2.4</div>
      </footer>
    </div>
  );
}

function SetupTile({ title, count, icon: Icon, color, link, desc }: any) {
  const c: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 hover:bg-blue-600",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-600",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20 hover:bg-purple-600"
  };

  return (
    <Link href={link} className="no-underline group h-full">
      <div className="h-full bg-white/5 border border-white/10 p-10 rounded-[3.5rem] flex flex-col justify-between transition-all duration-500 group-hover:border-transparent group-hover:shadow-4xl relative overflow-hidden shadow-inner">
        <div className="relative z-10">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-all ${c[color]} group-hover:text-white group-hover:scale-110 shadow-lg`}>
            <Icon size={32} />
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white m-0 leading-none group-hover:scale-[1.02] transition-transform origin-left">{title}</h2>
          <p className="mt-6 text-slate-500 text-[11px] font-bold uppercase leading-relaxed tracking-wider group-hover:text-white/70">{desc}</p>
        </div>
        <div className="mt-10 flex justify-between items-end relative z-10">
          <div className="text-left">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-2">Entités Enrôlées</p>
            <p className="text-4xl font-black italic m-0 text-white leading-none">{count}</p>
          </div>
          <ChevronRight className="text-slate-700 group-hover:text-white group-hover:translate-x-2 transition-all" size={32} />
        </div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 blur-3xl rounded-full group-hover:bg-white/10 transition-all duration-1000" />
      </div>
    </Link>
  );
}

function LoadingMatrix({ label }: { label: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <Loader2 className="animate-spin text-blue-600" size={60} strokeWidth={1} />
      <p className="text-blue-500 font-black uppercase italic text-[10px] tracking-[1em] animate-pulse">{label}</p>
    </div>
  );
}
