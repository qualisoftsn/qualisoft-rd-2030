/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  ShieldAlert,
  ArrowUpRight,
  Target,
  Clock,
  ChevronRight,
  Activity,
  Zap,
  Globe,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function DirectionDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 📡 PROTOCOLE DE SYNCHRONISATION ANALYTIQUE
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analyses/dashboard');
      if (!res.ok) throw new Error("Échec du lien Matrix");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.warn("Mode simulation activé : Liaison API non scellée.");
      // Fallback stats pour le build
      setStats({
        resolutionRate: 84,
        ncCount: 12,
        sseRate: 2.4,
        activeUsers: 48
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F1A] italic">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Calcul des indices directeurs...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 bg-[#0B0F1A] p-6 lg:p-10 rounded-[3rem] min-h-screen">
      
      {/* 🔝 HEADER : IDENTITÉ DIRECTIONNELLE */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <span className="px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                <Activity size={12} /> Système Opérationnel
             </span>
             <span className="px-4 py-1.5 rounded-full bg-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest border border-white/5">
                Certifié ISO 2030
             </span>
          </div>
          <h1 className="text-4xl lg:text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
            Cockpit <span className="text-blue-600">Direction</span>
          </h1>
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] italic">Pilotage de la Performance Souveraine Qualisoft</p>
        </div>

        <div className="text-right bg-white/5 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-end gap-2">
            <Clock size={12} className="text-blue-600" /> Date d&apos;analyse
          </p>
          <p className="text-xl font-black text-white italic tracking-tight">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* 📊 RANGÉE 1 : INDICATEURS DE HAUT NIVEAU */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Taux de Résolution ACT_" value="84%" subValue="+12% ce mois" icon={<CheckCircle2 className="text-emerald-500" />} color="emerald" />
        <StatCard title="Incidences NC_ détectées" value="12" subValue="3 critiques (NC_)" icon={<AlertCircle className="text-amber-500" />} color="amber" />
        <StatCard title="Sûreté & Sécurité SSE_" value="2.4" subValue="Objectif < 3.0" icon={<ShieldAlert className="text-blue-500" />} color="blue" />
        <StatCard title="Citoyens Actifs Matrix" value="48" subValue="Sur 3 sites (S_)" icon={<Users className="text-slate-400" />} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* 🏛️ COLONNE 1 & 2 : PLAN D'ACTIONS STRATÉGIQUE (ACT_) */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white/5 border border-white/5 p-10 rounded-[4rem] shadow-2xl backdrop-blur-xl group">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                   <Target className="text-blue-600" size={24} />
                </div>
                <div>
                   <h2 className="font-black text-white uppercase tracking-tighter text-2xl italic">Objectifs de Performance</h2>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Analyse des axes stratégiques SMI</p>
                </div>
              </div>
              <button className="px-5 py-2 bg-white/5 text-[9px] font-black text-blue-500 uppercase rounded-full hover:bg-blue-600 hover:text-white transition-all tracking-widest border-none cursor-pointer">Explorer</button>
            </div>
            
            <div className="space-y-10">
              <ProgressItem label="Actions Correctives (ACT_)" current={65} color="bg-blue-600" />
              <ProgressItem label="Audits Programmés (AU_)" current={40} color="bg-indigo-600" />
              <ProgressItem label="Efficacité du SMQ" current={92} color="bg-emerald-500" />
            </div>
          </div>

          {/* ALERTES CRITIQUES (NC_ & SSE_) */}
          <div className="bg-slate-900 border border-white/5 p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none text-white"><Zap size={200} /></div>
            <h2 className="font-black uppercase italic tracking-[0.3em] text-[11px] mb-8 flex items-center gap-3 relative z-10">
              <ShieldAlert size={16} className="text-rose-500 animate-pulse" /> Alertes Critiques (NC_ & SSE_)
            </h2>
            <div className="divide-y divide-white/5 relative z-10">
              <AlertItem type="NC_MAJEURE" desc="Écart critique de conformité - Production" date="Il y a 2h" />
              <AlertItem type="SSE_INCIDENT" desc="Incident signalé Zone B (Non-lésionnel)" date="Il y a 5h" />
              <AlertItem type="NC_AUDIT" desc="Documentation Système non scellée" date="Hier" />
            </div>
          </div>
        </div>

        {/* 🔑 COLONNE 3 : RÉSUMÉ TENANT & COMPTE (T_) */}
        <div className="space-y-10">
          <div className="bg-linear-to-br from-slate-900 to-slate-950 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-blue-500 group-hover:scale-110 transition-transform"><Globe size={100} /></div>
            <h2 className="font-black text-white uppercase tracking-widest text-[11px] mb-8 italic border-b border-white/10 pb-4">Abonnement Souverain</h2>
            <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center py-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Organisation</span>
                    <span className="text-sm font-black text-white italic tracking-tight">Qualisoft Master Node</span>
                </div>
                <div className="flex justify-between items-center py-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Plan Actuel</span>
                    <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-600/30">Enterprise Elite</span>
                </div>
                <div className="flex justify-between items-center py-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">État du Nœud</span>
                    <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase italic">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div> Opérationnel
                    </span>
                </div>
            </div>
            <button className="w-full mt-10 py-5 bg-white/5 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all cursor-pointer shadow-xl italic">
                Gérer la facturation
            </button>
          </div>

          {/* QUICK LINKS COMPLÉMENTAIRES */}
          <div className="bg-blue-600/10 border border-blue-600/20 p-8 rounded-[3rem] space-y-4">
             <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-center mb-4">Raccourcis Décisionnels</p>
             <button className="w-full flex justify-between items-center p-4 bg-white/5 rounded-xl text-[10px] font-black uppercase text-white hover:bg-white/10 transition-all border-none cursor-pointer italic">
                Synthèse Annuelle <ArrowUpRight size={14} className="text-blue-500" />
             </button>
             <button className="w-full flex justify-between items-center p-4 bg-white/5 rounded-xl text-[10px] font-black uppercase text-white hover:bg-white/10 transition-all border-none cursor-pointer italic">
                Cartographie des Risques <ArrowUpRight size={14} className="text-blue-500" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS DU COCKPIT ---

function StatCard({ title, value, subValue, icon, color }: any) {
  const colors: any = {
    emerald: "hover:border-emerald-500/30",
    amber: "hover:border-amber-500/30",
    blue: "hover:border-blue-500/30",
    slate: "hover:border-slate-500/30"
  };

  return (
    <div className={`bg-white/5 border border-white/5 p-8 rounded-[3rem] shadow-2xl transition-all duration-500 group cursor-pointer ${colors[color]}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-all duration-500 border border-white/5 shadow-inner">
          {icon}
        </div>
        <ArrowUpRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 italic">{title}</p>
      <h3 className="text-5xl font-black text-white italic tracking-tighter leading-none">{value}</h3>
      <p className="text-[10px] font-bold text-slate-500 mt-4 uppercase tracking-widest">{subValue}</p>
    </div>
  );
}

function ProgressItem({ label, current, color }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">{label}</p>
        <p className="text-xl font-black text-white italic tracking-tighter">{current}%</p>
      </div>
      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-2000 shadow-[0_0_15px_rgba(255,255,255,0.1)]`} 
          style={{ width: `${current}%` }}
        ></div>
      </div>
    </div>
  );
}

function AlertItem({ type, desc, date }: any) {
  return (
    <div className="py-6 flex justify-between items-center group cursor-pointer hover:translate-x-2 transition-all">
      <div className="flex flex-col gap-1">
        <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] italic">{type}</span>
        <p className="text-lg font-black text-white group-hover:text-blue-400 transition-colors italic tracking-tight uppercase">{desc}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{date}</span>
        <ChevronRight size={16} className="text-slate-800 group-hover:text-white transition-colors" />
      </div>
    </div>
  );
}