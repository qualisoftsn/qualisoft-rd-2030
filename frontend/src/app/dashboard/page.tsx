/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '../../core/api/api-client';
import { usePermissions } from '@/core/hooks/usePermissions';
import WelcomeModal from '@/components/WelcomeModal'; // 👈 On importe la modale

import { 
  AlertTriangle, ShieldAlert, FileText, 
  TrendingUp, Zap, Loader2, ArrowUpRight, Building2, 
  Clock, FileDown, Sparkles, Presentation, Layout,
  Layers, ChevronRight, Activity, Target, Play, ShieldCheck, Globe, FileBarChart
} from 'lucide-react';

export default function Dashboard() {
  const { isAdmin, isOwner } = usePermissions();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false); // 👈 État pour la modale

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // ✅ Récupération des stats SaaS étanches
      const response = await apiClient.get('/indicators/dashboard-stats');
      setData(response.data);
      
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(storedUser);

      // ✅ LOGIQUE DE BIENVENUE : Si c'est sa première fois
      if (storedUser?.U_FirstLogin === true) {
        setShowWelcome(true);
      }
    } catch (err) {
      console.error("❌ ERREUR SYNC COCKPIT :", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ✅ FONCTION POUR FERMER LA BIENVENUE ET PRÉVENIR LE BACKEND
  const handleCloseWelcome = async () => {
    try {
      // 1. Appel au backend via votre apiClient pour désactiver le flag
      await apiClient.patch(`/auth/disable-first-login/${user.U_Id}`);

      // 2. Mise à jour du localStorage pour ne plus l'afficher au prochain refresh
      const updatedUser = { ...user, U_FirstLogin: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // 3. Fermeture visuelle
      setShowWelcome(false);
    } catch (err) {
      console.error("Erreur lors de la désactivation du premier login", err);
      setShowWelcome(false); // On ferme quand même pour ne pas bloquer l'utilisateur
    }
  };

  const handleDownloadReport = async () => {
    setIsExporting(true);
    try {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      
      const response = await apiClient.get(`/indicators/export/pdf`, {
        params: { month, year },
        responseType: 'blob', 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rapport_Elite_QSE_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Erreur lors de la génération du rapport.");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0B0F1A] text-blue-500 italic">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin" size={40} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-center">Extraction Intelligence SMQ...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col p-8 space-y-8 animate-in fade-in duration-700 italic font-sans bg-[#0B0F1A] ml-72 overflow-y-auto">
      
      {/* 1. EN-TÊTE STRATÉGIQUE */}
      <header className="flex justify-between items-center shrink-0 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 text-blue-400 mb-2 italic">
            <Building2 size={18} />
            <span className="text-[12px] font-black uppercase tracking-[0.5em]">
              {user?.U_TenantName || "QUALISOFT"}
            </span>
            {user?.U_Tenant?.T_SubscriptionStatus === 'TRIAL' && (
              <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8px] px-2 py-0.5 rounded-full font-black ml-2 animate-pulse">
                MODE ESSAI ÉLITE
              </span>
            )}
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none text-white">
            Cockpit <span className="text-blue-600">{user?.U_Role === 'ADMIN' ? 'Stratégique' : 'Opérationnel'}</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
            <button onClick={fetchDashboardData} className="bg-white/5 border border-white/10 p-4 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90">
              <Zap size={20} />
            </button>

            {user?.U_Role === 'ADMIN' && (
              <button 
                onClick={handleDownloadReport}
                disabled={isExporting}
                className="group relative flex items-center gap-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs shadow-2xl shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <Sparkles className="text-amber-400" size={18} />
                    <span>Générer Revue PDF</span>
                    <FileDown size={18} />
                  </>
                )}
              </button>
            )}
        </div>
      </header>

      {/* ✅ NOUVELLE SECTION : CONSOLE PROSPECT (POUR PRÉSENTATION) */}
      {(isAdmin || isOwner) && (
        <div className="bg-linear-to-br from-slate-900 to-blue-900/40 rounded-[3rem] p-8 border border-white/10 text-white shadow-2xl relative overflow-hidden italic">
          <div className="absolute top-6 right-8 bg-blue-500 text-[8px] font-black uppercase px-3 py-1 rounded-full tracking-[0.2em] animate-pulse">
            Mode Présentation Elite
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">
              Console <span className="text-blue-400">Prospects</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <PresentationCard title="Zéro Papier" desc="Digitalisation intégrale ISO" icon={Zap} color="bg-amber-500" />
              <PresentationCard title="Conformité" desc="Monitoring temps réel" icon={ShieldCheck} color="bg-emerald-500" />
              <PresentationCard title="Multi-Tenant" desc="Isolation stricte des données" icon={Globe} color="bg-blue-500" />
              <PresentationCard title="Reporting" desc="Génération Revue PDF" icon={FileBarChart} color="bg-indigo-500" />
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-blue-600 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-blue-500 transition-all">
                <Play size={14} fill="currentColor" /> Lancer la visite guidée
              </button>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full" />
        </div>
      )}

      {/* 2. GRILLE KPI DYNAMIQUE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        <StatCard title="Taux de Saisie" value={`${data?.stats?.completionRate || 0}%`} icon={Activity} color="blue" trend="État mensuel" />
        <StatCard title="Performance Globale" value={`${data?.stats?.globalPerformance || 0}%`} icon={Target} color="emerald" trend="Objectifs SMQ" />
        <StatCard title="Processus Pilotés" value={data?.stats?.totalProcessus || 8} icon={Layers} color="purple" trend="Cartographie" />
        <StatCard title="Indicateurs Clés" value={data?.stats?.totalIndicators || 0} icon={TrendingUp} color="orange" trend="Total Registre" />
      </div>

      {/* 3. ZONE OPÉRATIONNELLE CENTRALE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        
        {/* GRAPHIQUE FOCUS PERFORMANCE DES 8 PROCESSUS */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] shadow-3xl flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Focus Performance</h3>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Analyse des processus prioritaires</p>
            </div>
          </div>
          
          <div className="space-y-8 flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
            {data?.chartData?.length > 0 ? data.chartData.map((item: any, idx: number) => (
              <ProgressBar 
                key={idx} 
                label={item.label} 
                count={item.value} 
                total={item.target} 
                color={item.value >= item.target ? "bg-emerald-500" : "bg-red-500"} 
              />
            )) : (
              <div className="flex h-full items-center justify-center text-slate-600 font-black uppercase text-[10px] italic border-2 border-dashed border-white/5 rounded-3xl">
                Chargement de la performance ...
              </div>
            )}
          </div>
        </div>

        {/* GOUVERNANCE & ALERTES RETARD */}
        <div className="flex flex-col gap-6">
          <Link href="/dashboard/indicators" className="flex-1 group">
            <div className="h-full bg-blue-600 p-8 rounded-[3rem] flex flex-col justify-between shadow-2xl transition-all hover:-translate-y-1 border border-blue-400/20 group-hover:shadow-blue-500/30">
              <Presentation size={32} className="text-white mb-4" />
              <h3 className="text-white text-3xl font-black uppercase italic tracking-tighter leading-none">Pilotage <br/>Indicateurs</h3>
              <div className="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-xl self-end group-hover:scale-110 transition-transform">
                <ArrowUpRight size={20}/>
              </div>
            </div>
          </Link>
          
          <div className="flex-1 bg-slate-900/60 border border-white/10 p-8 rounded-[3rem] flex flex-col justify-center items-center text-center shadow-xl">
             <ShieldAlert className="text-orange-500 mb-4 animate-bounce" size={40} />
             <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Alerte Retards de Saisie</span>
             <span className="text-4xl font-black italic text-white mt-2">
               {Math.max(0, (data?.stats?.totalIndicators || 0) - (Math.floor((data?.stats?.totalIndicators || 0) * ((data?.stats?.completionRate || 0)/100))))}
             </span>
             <p className="text-[9px] text-slate-600 uppercase font-bold mt-2 italic">Données manquantes ce mois</p>
          </div>
        </div>
      </div>

      {/* 4. BARRE INFÉRIEURE : MATRICE ANNUELLE */}
      <Link href="/dashboard/indicators" className="shrink-0 group">
        <div className="bg-white p-6 rounded-3xl flex items-center justify-between shadow-2xl transition-all hover:bg-slate-50 border-b-4 border-slate-200">
          <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors shadow-lg">
                  <Layout size={24} />
              </div>
              <div>
                <h3 className="text-slate-900 text-xl font-black uppercase italic tracking-tighter leading-none">Accéder à la Matrice de Pilotage</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Vue panoramique des 8 processus</p>
              </div>
          </div>
          <ChevronRight className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" size={28} />
        </div>
      </Link>

      {/* ✅ LA MODALE DE BIENVENUE : Elle apparaît au-dessus de tout le reste */}
      {showWelcome && (
        <WelcomeModal 
          userName={user?.U_FirstName || 'Admin'} 
          onClose={handleCloseWelcome} 
        />
      )}
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function PresentationCard({ title, desc, icon: Icon, color }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl hover:bg-white/10 transition-all cursor-default group">
      <div className={`w-8 h-8 ${color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
        <Icon size={16} className="text-white" />
      </div>
      <h4 className="text-xs font-black uppercase mb-1 group-hover:text-blue-400 transition-colors">{title}</h4>
      <p className="text-[9px] text-slate-400 font-medium leading-tight lowercase italic">{desc}</p>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, trend }: any) {
  const colorMap: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20"
  };

  return (
    <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[2.5rem] hover:border-blue-500/30 transition-all shadow-xl group">
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
        <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest">{trend}</span>
      </div>
      <div className="mt-6">
        <p className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-widest">{title}</p>
        <span className="text-4xl font-black italic text-white">{value}</span>
      </div>
    </div>
  );
}

function ProgressBar({ label, count, total, color }: any) {
  const percentage = Math.min(Math.round((count / (total || 1)) * 100), 100);
  return (
    <div className="space-y-3 group">
      <div className="flex justify-between items-end px-2">
        <span className="text-[10px] font-black uppercase text-slate-400 italic group-hover:text-blue-400 transition-colors">{label}</span>
        <span className="text-sm font-black italic text-white">
          {count} <span className="text-[10px] text-slate-600 ml-1">/ {total}</span>
          <span className={`ml-3 text-[10px] ${percentage >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
            ({percentage}%)
          </span>
        </span>
      </div>
      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,0,0,0.5)]`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}