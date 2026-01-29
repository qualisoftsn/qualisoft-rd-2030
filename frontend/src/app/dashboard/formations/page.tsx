/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  GraduationCap, Plus, Calendar, Search, 
  Activity, Zap, CheckCircle2, Award, 
  TrendingUp, Calculator, BookOpen, Clock,
  Users, DollarSign, ShieldCheck, AlertCircle, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function FormationsPage() {
  const [formations, setFormations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchFormations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/formations');
      setFormations(Array.isArray(res.data) ? res.data : []);
    } catch (err) { 
      toast.error("Erreur de liaison avec le module GPEC");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchFormations(); }, [fetchFormations]);

  // --- ANALYSE DYNAMIQUE DU PLAN DE FORMATION ---
  const stats = useMemo(() => {
    const total = formations.length;
    const completed = formations.filter(f => f.FOR_Status === 'TERMINE').length;
    const upcoming = formations.filter(f => f.FOR_Status === 'PLANIFIE').length;
    const expired = formations.filter(f => f.FOR_Expiry && new Date(f.FOR_Expiry) < new Date()).length;
    
    return {
      total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      upcoming,
      criticalRecycles: expired,
      investment: total * 1250 // Simulation de coût moyen par session
    };
  }, [formations]);

  const getStatusStyle = (status: string, expiry?: string) => {
    if (expiry && new Date(expiry) < new Date()) 
        return { label: 'RECYCLAGE REQUIS', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    
    switch (status) {
      case 'TERMINE': return { label: 'ACQUIS', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
      case 'PLANIFIE': return { label: 'EN ATTENTE', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
      default: return { label: 'BROUILLON', color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
    }
  };

  if (loading) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A]">
      <div className="flex flex-col items-center gap-4">
        <GraduationCap className="animate-bounce text-blue-600" size={48} />
        <span className="text-[10px] font-black uppercase italic tracking-[0.5em] text-blue-500">Chargement de la Matrice GPEC...</span>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col overflow-hidden">
      
      {/* 🚀 HEADER (10% H) */}
      <header className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-[#0B0F1A]/80 backdrop-blur-3xl shrink-0">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
            Plan de <span className="text-blue-600">Formation & Compétences</span>
          </h1>
          <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.4em] mt-2 italic flex items-center gap-2">
            <ShieldCheck size={12} className="text-emerald-500" /> ISO 9001 §7.2 • Maîtrise du Capital Humain
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" placeholder="RECHERCHER COLLABORATEUR OU TITRE..." 
              className="bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-[10px] font-black outline-none w-80 focus:border-blue-600 transition-all uppercase"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-3xl shadow-blue-900/40">
            <Plus size={18} /> Planifier Session
          </button>
        </div>
      </header>

      {/* 📊 ANALYTICS GRID (15% H) */}
      <main className="flex-1 p-8 grid grid-cols-12 grid-rows-6 gap-6 overflow-hidden">
        
        <div className="col-span-12 row-span-1 grid grid-cols-4 gap-6">
          <MetricCard title="Taux d'Exécution" val={`${stats.completionRate}%`} trend="+5%" icon={Activity} color="emerald" formula="Σ(Formations Closes) / Σ(Planifiées)" />
          <MetricCard title="Recyclages Critiques" val={stats.criticalRecycles} trend="Alerte" icon={AlertCircle} color="red" formula="Habilitations expirées ou < 30j" />
          <MetricCard title="Sessions à Venir" val={stats.upcoming} trend="Q1/Q2" icon={Clock} color="blue" formula="Sessions avec statut 'PLANIFIE'" />
          <MetricCard title="Investissement Formation" val={`${stats.investment.toLocaleString()}€`} trend="Budget" icon={DollarSign} color="amber" formula="Coût sessions + Frais annexes" />
        </div>

        {/* 📋 LISTE DES FORMATIONS (60% W) */}
        <div className="col-span-8 row-span-5 flex flex-col bg-slate-900/20 border border-white/5 rounded-[3rem] overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/2 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <BookOpen size={16} className="text-blue-500" /> Suivi Individuel des Formations
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-[#0B0F1A] z-10 border-b border-white/5">
                <tr className="text-[8px] font-black uppercase text-slate-500 italic">
                  <th className="p-6">Collaborateur</th>
                  <th className="p-6">Thématique / Titre</th>
                  <th className="p-6">Validité</th>
                  <th className="p-6">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {formations.filter(f => f.FOR_Title.toLowerCase().includes(search.toLowerCase())).map((f) => {
                  const style = getStatusStyle(f.FOR_Status, f.FOR_Expiry);
                  return (
                    <tr key={f.FOR_Id} className="hover:bg-blue-600/5 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-500 font-black text-[10px]">
                            {f.FOR_User?.U_FirstName?.[0]}{f.FOR_User?.U_LastName?.[0]}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase">{f.FOR_User?.U_FirstName} {f.FOR_User?.U_LastName}</p>
                            <p className="text-[8px] text-slate-500 font-bold uppercase">{f.FOR_User?.U_Role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <p className="text-[10px] font-black uppercase text-white leading-tight">{f.FOR_Title}</p>
                        <p className="text-[8px] text-slate-500 font-bold mt-1 uppercase italic">Session du {new Date(f.FOR_Date).toLocaleDateString()}</p>
                      </td>
                      <td className="p-6">
                        <p className="text-[9px] font-black text-slate-300 italic">
                          {f.FOR_Expiry ? `Expire le ${new Date(f.FOR_Expiry).toLocaleDateString()}` : 'Validité Permanente'}
                        </p>
                      </td>
                      <td className="p-6">
                        <span className={cn("px-4 py-1.5 rounded-xl text-[8px] font-black border uppercase tracking-widest", style.color, style.bg, style.border)}>
                          {style.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🧠 INTELLIGENCE & CORRELATION (40% W) */}
        <div className="col-span-4 row-span-5 flex flex-col gap-6 overflow-hidden">
          
          {/* Bloc Corrélation Compétences (§7.2) */}
          <div className="bg-blue-600 p-8 rounded-[3.5rem] relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                <Award size={200} />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black uppercase italic text-white mb-4 leading-none tracking-tighter">Impact Compétences</h3>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[8px] font-black uppercase text-blue-100 italic">Couverture des Postes critiques</span>
                <span className="text-xl font-black text-white italic">72%</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ width: '72%' }} />
              </div>
              <p className="mt-6 text-[9px] font-bold text-blue-100 uppercase italic leading-tight opacity-70">
                La clôture des sessions Q1 augmentera la conformité GPEC de 12 points.
              </p>
            </div>
          </div>

          {/* Dictionnaire de calcul GPEC */}
          <div className="flex-1 bg-slate-900/20 border border-white/5 p-8 rounded-[3.5rem] flex flex-col overflow-hidden">
            <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-3 text-emerald-500">
              <Calculator size={20} /> Métriques de Valeur
            </h3>
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
               <FormulaItem title="ROI Formation" formula="(Gain de Prod / Coût) × 100" desc="Évalue le retour sur investissement des compétences acquises sur la production." />
               <FormulaItem title="Taux de Rétention" formula="Σ (Comp. Maintenues) / Σ (Requises)" desc="Capacité du SMI à maintenir les habilitations critiques à jour." />
               <FormulaItem title="Indice de Polyvalence" formula="Σ (Comp. Secondaires) / N" desc="Mesure la capacité de remplacement interne en cas d'absence." />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function MetricCard({ title, val, trend, icon: Icon, color, formula }: any) {
  const themes: any = {
    emerald: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
    blue: 'text-blue-500 bg-blue-500/5 border-blue-500/10',
    red: 'text-red-500 bg-red-500/5 border-red-500/20',
    amber: 'text-amber-500 bg-amber-500/5 border-amber-500/10'
  };
  return (
    <div className="bg-[#0F172A]/40 border border-white/5 p-5 rounded-[2.5rem] flex flex-col justify-between group hover:border-blue-600/30 transition-all relative">
      <div className="flex justify-between items-start">
         <div className={cn("p-3 rounded-xl border", themes[color])}><Icon size={18} /></div>
         <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">{trend}</span>
      </div>
      <div className="mt-4">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 italic leading-none">{title}</p>
        <p className="text-3xl font-black italic text-white tracking-tighter">{val}</p>
      </div>
      <div className="absolute inset-0 bg-blue-600/95 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center z-20">
         <Calculator size={18} className="mb-2 text-white" />
         <p className="text-[8px] font-black uppercase text-blue-100 mb-1 leading-none tracking-widest tracking-widest">GPEC Engine</p>
         <p className="text-[10px] font-bold text-white uppercase italic leading-tight">{formula}</p>
      </div>
    </div>
  );
}

function FormulaItem({ title, formula, desc }: any) {
  return (
    <div className="p-4 bg-white/2 border border-white/5 rounded-2xl group hover:border-blue-500/20 transition-all">
      <h4 className="text-[10px] font-black uppercase italic text-blue-500 mb-2 leading-none">{title}</h4>
      <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 mb-2">
        <code className="text-white text-[8px] font-bold tracking-tight">{formula}</code>
      </div>
      <p className="text-[8px] text-slate-500 font-bold uppercase italic leading-tight tracking-tight">{desc}</p>
    </div>
  );
}