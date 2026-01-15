/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileBarChart, Download, Printer, ShieldCheck, 
  TrendingUp, AlertTriangle, CheckCircle2, Loader2 
} from 'lucide-react';
import { usePermissions } from '@/core/hooks/usePermissions';
import apiClient from '@/core/api/api-client';

export default function ManagementReviewPage() {
  const { user } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [reviewData, setReviewData] = useState<any>(null);

  // 1. Récupération des données réelles du Backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await apiClient.get('/smi/management-review/data');
        setReviewData(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des données SMI");
      } finally {
        setFetching(false);
      }
    };
    loadData();
  }, []);

  const handleExport = () => {
    setLoading(true);
    // Simulation du moteur de rendu PDF Qualisoft
    setTimeout(() => {
      alert("Génération du rapport PDF Qualisoft Elite en cours...");
      setLoading(false);
    }, 2000);
  };

  // État de chargement initial
  if (fetching) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // Configuration des KPIs Flash basés sur les données réelles ou simulées
  const stats = [
    { label: "Performance Globale", value: `${reviewData?.globalPerformance || 92}%`, icon: TrendingUp, color: "text-emerald-500" },
    { label: "Processus Actifs", value: reviewData?.processCount || "08", icon: ShieldCheck, color: "text-blue-500" },
    { label: "Risques Critiques", value: reviewData?.criticalRisks || "02", icon: AlertTriangle, color: "text-amber-500" },
    { label: "Taux Conformité", value: "100%", icon: CheckCircle2, color: "text-emerald-500" },
  ];

  return (
    <div className="p-8 space-y-8 italic bg-slate-50/50 min-h-screen">
      
      {/* HEADER DE LA PAGE STRATÉGIQUE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
            Revue de <span className="text-blue-600">Direction</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2 italic">
            Intelligence Stratégique • {user?.U_TenantName || "SAGAM ELECTRONICS"}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Printer size={14} /> Imprimer
          </button>
          <button 
            onClick={handleExport}
            disabled={loading}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-xl shadow-slate-900/20 hover:bg-blue-600 transition-all"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <><Download size={14} /> Exporter Rapport PDF</>}
          </button>
        </div>
      </div>

      {/* GRILLE DE KPI FLASH */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <stat.icon className={`${stat.color} mb-4 group-hover:scale-110 transition-transform`} size={24} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* SECTION ANALYSE DÉTAILLÉE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CARTE DE SYNTHÈSE (DARK MODE) */}
        <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h3 className="text-xl font-black uppercase italic mb-6 flex items-center gap-3">
              <span className="w-8 h-1 bg-blue-500"></span> Synthèse du Responsable Qualité
            </h3>
            <div className="space-y-4 text-sm text-slate-400 font-medium leading-relaxed italic">
              <p>
                {reviewData?.summary || `L'analyse des données de performance pour ce semestre indique une maturité croissante du système de management.`}
              </p>
              <p>
                Les audits internes n&apos;ont révélé aucune non-conformité majeure. L&apos;accent doit être mis sur la digitalisation du processus &quot;Logistique&quot; pour optimiser les temps de réponse opérationnels.
              </p>
            </div>
            
            {/* Signature Pierre Ndiaye */}
            <div className="mt-10 flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 w-fit">
               <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-black text-white border-2 border-white/20">
                {user?.U_FirstName?.[0]}{user?.U_LastName?.[0]}
               </div>
               <div>
                 <p className="text-xs font-black uppercase tracking-tight">{user?.U_FirstName} {user?.U_LastName}</p>
                 <p className="text-[9px] text-blue-400 font-bold uppercase italic tracking-widest">Responsable SMI • {user?.U_TenantName}</p>
               </div>
            </div>
          </div>
          {/* Filigrane décoratif */}
          <FileBarChart className="absolute -right-16 -bottom-16 text-white/3" size={400} />
        </div>

        {/* CARTE DES RISQUES */}
        <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-sm font-black uppercase text-slate-900 mb-6 flex items-center gap-2">
             <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" /> Risques Prioritaires
          </h3>
          <div className="space-y-6 flex-1">
             {[
               { t: "Cyber-sécurité", d: "Haute priorité", p: "85%", color: "bg-red-500" },
               { t: "Rupture Supply Chain", d: "Moyenne", p: "45%", color: "bg-amber-500" },
               { t: "Conformité Légale", d: "Maîtrisée", p: "15%", color: "bg-emerald-500" }
             ].map((r, i) => (
               <div key={i} className="space-y-2">
                 <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-900 uppercase">{r.t}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase italic">{r.p}</p>
                 </div>
                 <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className={`h-full ${r.color} transition-all duration-1000`} style={{ width: r.p }} />
                 </div>
               </div>
             ))}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
              Qualisoft Risk Engine v2.0
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}