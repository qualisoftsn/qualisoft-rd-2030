/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  ShieldAlert,
  ArrowUpRight,
  Target
} from 'lucide-react';

export default function DirectionDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Appel vers ton nouvel endpoint d'analyses
    fetch('/api/analyses/dashboard')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  return (
    <div className="space-y-8">
      {/* TITRE ET DATE DU JOUR */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Cockpit Direction</h1>
          <p className="text-slate-500 text-sm font-medium">Performance globale de l&apos;instance Qualisoft</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date d&apos;analyse</p>
          <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* RANGÉE 1 : INDICATEURS DE HAUT NIVEAU */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Actions Clôturées" value="84%" subValue="+12% ce mois" icon={<CheckCircle2 className="text-emerald-500" />} color="emerald" />
        <StatCard title="Non-Conformités" value="12" subValue="3 critiques (NC_)" icon={<AlertCircle className="text-amber-500" />} color="amber" />
        <StatCard title="Taux Fréquence SSE" value="2.4" subValue="Objectif < 3.0" icon={<ShieldAlert className="text-blue-500" />} color="blue" />
        <StatCard title="Utilisateurs Actifs" value="48" subValue="Sur 3 sites (S_)" icon={<Users className="text-slate-500" />} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE 1 & 2 : PLAN D'ACTIONS STRATÉGIQUE (ACT_) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Target className="text-blue-600" size={20} />
                <h2 className="font-black text-slate-800 uppercase tracking-tight">Objectifs Qualité & Performance</h2>
              </div>
              <button className="text-xs font-black text-blue-600 uppercase hover:underline">Voir détails</button>
            </div>
            
            {/* GRAPHIQUE SIMULÉ / BARRE DE PROGRESSION */}
            <div className="space-y-8">
              <ProgressItem label="Actions Correctives (ACT_)" current={65} color="bg-blue-600" />
              <ProgressItem label="Audits Programmés (AU_)" current={40} color="bg-indigo-600" />
              <ProgressItem label="Efficacité du SMQ" current={92} color="bg-emerald-500" />
            </div>
          </div>

          {/* DERNIÈRES NC DÉTECTÉES */}
          <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-2xl">
            <h2 className="font-black uppercase italic tracking-widest text-sm mb-6 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-400" /> Alertes Critiques (NC_ & SSE_)
            </h2>
            <div className="divide-y divide-white/10">
              <AlertItem type="NC_MAJEURE" desc="Écart process production" date="Il y a 2h" />
              <AlertItem type="SSE_INCIDENT" desc="Presqu'accident Zone B" date="Il y a 5h" />
              <AlertItem type="NC_AUDIT" desc="Documentation non à jour" date="Hier" />
            </div>
          </div>
        </div>

        {/* COLONNE 3 : RÉSUMÉ TENANT & COMPTE (T_) */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-black text-slate-800 uppercase tracking-tight text-sm mb-6">Résumé de l&apos;Abonnement</h2>
            <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Société</span>
                    <span className="text-xs font-bold text-slate-900">Qualisoft SARL</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Plan actuel</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-black uppercase tracking-tighter">Enterprise Plan</span>
                </div>
                <div className="flex justify-between items-center py-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Status</span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Actif
                    </span>
                </div>
            </div>
            <button className="w-full mt-6 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition-all">
                Gérer la facturation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// COMPOSANTS INTERNES POUR LE COCKPIT
function StatCard({ title, value, subValue, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <ArrowUpRight size={16} className="text-slate-300" />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter">{value}</h3>
      <p className="text-[10px] font-bold text-slate-500 mt-2">{subValue}</p>
    </div>
  );
}

function ProgressItem({ label, current, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{label}</p>
        <p className="text-sm font-black text-slate-900 italic">{current}%</p>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${current}%` }}></div>
      </div>
    </div>
  );
}

function AlertItem({ type, desc, date }: any) {
  return (
    <div className="py-4 flex justify-between items-center group cursor-pointer">
      <div className="flex flex-col">
        <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">{type}</span>
        <p className="text-sm font-bold text-slate-100 group-hover:text-blue-300 transition-colors">{desc}</p>
      </div>
      <span className="text-[10px] font-bold text-slate-500 uppercase">{date}</span>
    </div>
  );
}