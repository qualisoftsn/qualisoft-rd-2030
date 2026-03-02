/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🏛️ MODULE : GOUVERNANCE STRATÉGIQUE (MATRIX KERNEL)
 * Rôle : Pilotage §9.3 ISO 9001 • Tableau de bord de maturité direction.
 * Design : Clean Corporate / ClickUp Style.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 02:41 GMT
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Gavel, Calendar, MessageSquare, 
  Award, ChevronRight, LayoutDashboard,
  Users, FileText, Download, Plus, AlertTriangle, Loader2
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface GovernanceStats {
  complianceScore: number;
  planningCompletion: number;
  maturityLevel: string;
  upcomingMeetings: number;
  decisionsPending: number;
  regulatoryUpdates: number;
}

export default function GovernancePage() {
  const [stats, setStats] = useState<GovernanceStats>({
    complianceScore: 0, planningCompletion: 0, maturityLevel: 'N/A',
    upcomingMeetings: 0, decisionsPending: 0, regulatoryUpdates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Simulation Kernel Matrix
        await new Promise(resolve => setTimeout(resolve, 800));
        setStats({
          complianceScore: 92, planningCompletion: 78, maturityLevel: 'Niveau 3',
          upcomingMeetings: 4, decisionsPending: 17, regulatoryUpdates: 3,
        });
      } catch (err) {
        toast.error('Échec synchronisation Gouvernance Matrix');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return (
    <div className="ml-0 lg:ml-72 flex h-screen items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 bg-gray-50 min-h-screen p-6 lg:p-10 font-sans italic">
      <Toaster position="top-right" richColors theme="light" />

      <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in duration-700">
        <header className="border-b border-gray-200 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-12 lg:mt-0">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-indigo-100 px-4 py-1.5 text-[10px] font-black uppercase text-indigo-800 tracking-widest leading-none">ISO 9001:2015 §9.3</span>
              <span className="rounded-full bg-blue-100 px-4 py-1.5 text-[10px] font-black uppercase text-blue-800 tracking-widest leading-none">Maturité: {stats.maturityLevel}</span>
            </div>
            <h1 className="mt-4 text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none m-0">Gouvernance <span className="text-indigo-600">Stratégique</span></h1>
            <p className="mt-4 text-sm font-bold text-gray-500 uppercase tracking-widest m-0 leading-none italic">Direction & Pilotage du Capital Qualité Matrix</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-[11px] font-black uppercase text-gray-700 shadow-sm hover:bg-gray-50 transition-all border-none cursor-pointer">
              <Download className="mr-2 h-4 w-4" /> Rapport de Revue
            </button>
            <Link href="/dashboard/gouvernance/copil" className="inline-flex items-center rounded-xl bg-indigo-600 px-6 py-3 text-[11px] font-black uppercase text-white shadow-lg hover:bg-indigo-700 transition-all border-none">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard COPIL
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <KPIBadge label="Conformité Réglementaire" value={`${stats.complianceScore}%`} trend="up" icon={ShieldCheck} color="emerald" />
          <KPIBadge label="Exécution Planning" value={`${stats.planningCompletion}%`} trend="neutral" icon={Calendar} color="blue" />
          <KPIBadge label="Décisions à Sceller" value={stats.decisionsPending.toString()} trend="down" icon={MessageSquare} color="amber" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <GovPilier href="/dashboard/gouvernance/compliance" icon={Gavel} title="Veille Légale & Conformité" desc="Surveillance des exigences ANSD, RGPD et ISO (§9.1)." statsLabel="Niveau de conformité" statsVal={stats.complianceScore} color="indigo" alert={`${stats.regulatoryUpdates} MAJ ce mois`} />
          <GovPilier href="/dashboard/gouvernance/planning" icon={Calendar} title="Chronogramme Master" title2="SMI" desc="Pilotage temporel des revues et jalons critiques (§9.3)." statsLabel="Exécution du plan" statsVal={stats.planningCompletion} color="emerald" alert={`${stats.upcomingMeetings} Instances planifiées`} />
          <GovPilier href="/dashboard/gouvernance/sessions" icon={MessageSquare} title="Séances & Décisions" desc="Traçabilité des arbitrages et scellage des décisions Matrix." statsLabel="Décisions à clore" statsVal={Math.min(stats.decisionsPending * 5, 100)} color="amber" alert="124 Décisions archivées" />
        </div>

        <div className="rounded-[2.5rem] bg-white p-10 shadow-xl border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl text-left">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700"><Award size={24} /></div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter m-0">Maturité du Système de Management Intégré</h2>
            </div>
            <p className="text-sm text-gray-500 font-bold italic leading-relaxed m-0 uppercase">Évaluation selon ISO 9004:2018 — Objectif excellence opérationnelle.</p>
            <div className="mt-8 space-y-4">
              <div className="flex justify-between text-xs font-black uppercase text-gray-700 italic tracking-widest"><span>Transition vers Niveau 4</span><span>78%</span></div>
              <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: '78%' }} /></div>
            </div>
          </div>
          <div className="h-40 w-40 rounded-full border-10 border-indigo-50 flex items-center justify-center bg-white shadow-2xl shrink-0">
             <span className="text-4xl font-black text-indigo-600 italic tracking-tighter">{stats.maturityLevel.slice(-1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPIBadge({ label, value, trend, icon: Icon, color }: any) {
  const colors: any = { emerald: 'text-emerald-700 bg-emerald-50', blue: 'text-blue-700 bg-blue-50', amber: 'text-amber-700 bg-amber-50' };
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all text-left group">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${colors[color]}`}><Icon size={20} /></div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic leading-none">{label}</p>
          <p className="text-3xl font-black text-gray-900 m-0 italic tracking-tighter leading-none">{value}</p>
        </div>
      </div>
    </div>
  );
}

function GovPilier({ href, icon: Icon, title, desc, statsLabel, statsVal, color, alert }: any) {
  const themes: any = { indigo: 'bg-indigo-50 text-indigo-700', emerald: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700' };
  const bars: any = { indigo: 'bg-indigo-600', emerald: 'bg-emerald-500', amber: 'bg-amber-500' };
  return (
    <Link href={href} className="group block rounded-[2.5rem] bg-white p-8 shadow-sm transition-all hover:shadow-xl border border-gray-100 text-left">
      <div className="flex justify-between items-start mb-6">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${themes[color]}`}><Icon size={24} /></div>
        <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-900 transition-colors" />
      </div>
      <h2 className="text-xl font-black uppercase italic tracking-tighter m-0 mb-3 group-hover:text-indigo-600 transition-colors">{title}</h2>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide leading-relaxed m-0 h-12 italic mb-6 line-clamp-2">{desc}</p>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic"><span>{statsLabel}</span><span className="text-indigo-600">{statsVal}%</span></div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden"><div className={`h-full transition-all duration-700 ${bars[color]}`} style={{ width: `${statsVal}%` }} /></div>
      </div>
      <div className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-400 italic tracking-[0.2em]"><AlertTriangle size={14} className="text-amber-500" /> {alert}</div>
    </Link>
  );
}