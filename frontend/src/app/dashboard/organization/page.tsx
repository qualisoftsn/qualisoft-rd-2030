/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Users, MapPin, GitGraph, ArrowUpRight, 
  AlertTriangle, TrendingUp, Activity,
  Plus, Layers, Target, AlertCircle,
  ChevronRight, BarChart3, Globe, ShieldCheck,
  Clock, FolderTree, UserCircle} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- INTERFACES DE DONNÉES ---
interface OrgStats {
  totalUnits: number;
  totalSites: number;
  totalUsers: number;
  unitsByType: { type: string; count: number; color: string }[];
  coverageRate: number; // Ratio de conformité : unités avec responsable
  recentChanges: number;
  alerts: Alert[];
}

interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  unit?: string;
  action?: string;
}

export default function OrganizationDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OrgStats>({
    totalUnits: 0,
    totalSites: 0,
    totalUsers: 0,
    unitsByType: [],
    coverageRate: 0,
    recentChanges: 0,
    alerts: []
  });

  /**
   * 🛰️ PROTOCOLE DE RÉCUPÉRATION DES DONNÉES
   * Analyse l'architecture organisationnelle pour extraire les KPIs de structure.
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Simulation d'une latence réseau pour l'effet Matrix
        setTimeout(() => {
          setStats({
            totalUnits: 12,
            totalSites: 3,
            totalUsers: 47,
            coverageRate: 85,
            recentChanges: 4,
            unitsByType: [
              { type: 'Directions', count: 4, color: 'bg-blue-600' },
              { type: 'Départements', count: 5, color: 'bg-emerald-600' },
              { type: 'Services', count: 2, color: 'bg-amber-600' },
              { type: 'Cellules', count: 1, color: 'bg-purple-600' }
            ],
            alerts: [
              { id: '1', type: 'warning', message: 'Unité sans responsable identifié (SMI non scellé)', unit: 'Service Maintenance', action: 'Assigner un pilote' },
              { id: '2', type: 'danger', message: 'Site sans unité rattachée (Zone morte)', unit: 'Site de Thiès', action: 'Créer une unité' },
              { id: '3', type: 'info', message: 'Mise à jour structurelle requise par la Direction', unit: 'Direction Qualité', action: 'Revoir la fiche' }
            ]
          });
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Erreur Sync Organisation:", error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  /**
   * 🏥 CALCULATEUR DE SANTÉ ORGANISATIONNELLE
   * Pondère le taux de couverture et la présence de personnel pour un score global.
   */
  const globalHealth = useMemo(() => {
    if (stats.totalUnits === 0) return 0;
    const score = Math.round((stats.coverageRate + (stats.totalUsers > 0 ? 100 : 0)) / 2);
    return score;
  }, [stats]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 italic">
        <div className="text-center space-y-6">
          <Activity className="animate-spin text-blue-600 mx-auto" size={48} />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.5em]">Scan de l&apos;architecture Matrix en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-10 bg-slate-50 min-h-screen italic font-sans text-left pb-24 selection:bg-blue-100">
      
      {/* 🚀 HEADER : CONTEXTE ET ACTIONS RAPIDES */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
             <span className="px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
             </span>
             <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">Structure Certifiée ISO 9001</span>
          </div>
          <h1 className="text-5xl lg:text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">Architecture <span className="text-blue-600">SMI</span></h1>
        </div>

        <div className="flex gap-4">
          <Link href="/dashboard/organization/chart" className="px-8 py-5 bg-white border border-slate-200 rounded-3xl text-slate-900 font-black uppercase text-[11px] tracking-widest shadow-sm hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-3 group">
            <GitGraph size={18} className="group-hover:rotate-12 transition-transform" /> Organigramme
          </Link>
          <button onClick={() => router.push('/dashboard/organization/units/new')} className="px-8 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-2xl hover:bg-blue-600 transition-all flex items-center gap-3 border-none cursor-pointer">
            <Plus size={18} /> Nouvelle Unité
          </button>
        </div>
      </div>

      {/* 📊 GRILLE DES KPIs : PILIERS DE LA STRUCTURE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <KPICard icon={Building2} label="Unités Organiques" value={stats.totalUnits} trend="+2 Actives" trendUp={true} color="blue" subtext="Niveaux hiérarchiques" />
        <KPICard icon={MapPin} label="Sites Gérés" value={stats.totalSites} trend="Couverture 100%" trendUp={true} color="emerald" subtext="Implantations physiques" />
        <KPICard icon={Users} label="Citoyens" value={stats.totalUsers} trend="Rattachés" trendUp={true} color="amber" subtext="Inscrits dans le SMI" />
        <KPICard icon={Target} label="Conformité" value={`${stats.coverageRate}%`} trend={stats.coverageRate >= 85 ? "Stable" : "Alerte"} trendUp={stats.coverageRate >= 85} color="purple" subtext="Unités avec leadership" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* 🏛️ DISTRIBUTION HIÉRARCHIQUE ET RÉGIONALE */}
        <div className="lg:col-span-2 space-y-10 text-left">
          
          <div className="bg-white rounded-[4rem] p-10 shadow-2xl border border-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none text-slate-900"><BarChart3 size={200} /></div>
            
            <div className="relative z-10 mb-10 text-left">
              <h2 className="text-3xl font-black uppercase italic text-slate-900 tracking-tighter flex items-center gap-4">
                <Layers className="text-blue-600" size={32} /> Pyramide Structurelle
              </h2>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mt-2 italic text-left">Poids des responsabilités par type d&apos;unité organique</p>
            </div>

            <div className="space-y-8 relative z-10">
              {stats.unitsByType.map((item, idx) => (
                <div key={idx} className="group text-left">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[11px] font-black text-slate-900 uppercase italic flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${item.color} shadow-lg shadow-black/10`} /> {item.type}
                    </span>
                    <span className="text-2xl font-black text-slate-900 italic leading-none">{item.count}</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-50 p-1">
                    <div 
                      className={`h-full ${item.color} transition-all duration-1000 ease-out rounded-full shadow-inner`}
                      style={{ width: `${(item.count / stats.totalUnits) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-50 flex justify-between items-center text-left">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400">
                <ShieldCheck size={16} className="text-emerald-500" /> Intégrité du SMI : Opérationnelle
              </div>
              <button onClick={() => router.push('/dashboard/organization/chart')} className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-2 border-none bg-transparent cursor-pointer">
                Inspecter l&apos;arbre <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* CARTE SITE INDIVIDUELLE */}
            {[
              { name: 'Siège Social', location: 'Dakar', units: 8, users: 32, status: 'actif' },
              { name: 'Site de Thiès', location: 'Thiès', units: 2, users: 8, status: 'warning' },
              { name: 'Site de Kaolack', location: 'Kaolack', units: 2, users: 7, status: 'actif' }
            ].map((site, idx) => (
              <div key={idx} className="bg-white rounded-[2.5rem] p-8 border border-white shadow-xl hover:shadow-2xl hover:border-blue-600/20 transition-all group cursor-pointer text-left" onClick={() => router.push(`/dashboard/sites/${idx + 1}`)}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${site.status === 'actif' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}><Building2 size={24} /></div>
                  {site.status === 'warning' && <AlertTriangle size={18} className="text-amber-500 animate-pulse" />}
                </div>
                <h3 className="text-xl font-black uppercase italic text-slate-900 mb-2 leading-tight text-left">{site.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-6 flex items-center gap-2 italic text-left">
                  <MapPin size={12} className="text-blue-600" /> {site.location}
                </p>
                <div className="flex gap-6 pt-6 border-t border-slate-50 text-left">
                  <div className="text-center"><span className="text-sm font-black text-slate-900 block leading-none">{site.units}</span><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Unités</span></div>
                  <div className="text-center"><span className="text-sm font-black text-slate-900 block leading-none">{site.users}</span><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Staff</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ⚖️ COLONNE DROITE : SANTÉ ET ALERTES RÉGLEMENTAIRES */}
        <div className="space-y-10 text-left">
          
          <div className="bg-slate-900 rounded-[4rem] p-10 text-white relative overflow-hidden shadow-2xl group text-left">
            <div className="absolute -right-16 -top-16 text-white/5 group-hover:rotate-12 transition-transform duration-700"><ShieldCheck size={300} /></div>
            <div className="relative z-10 text-left">
              <h3 className="text-[10px] font-black uppercase mb-4 tracking-[0.4em] text-slate-400 italic text-left">Santé Organisationnelle</h3>
              <div className="flex items-end gap-3 mb-8">
                <span className="text-3xl font-black italic tracking-tighter leading-none">{globalHealth}%</span>
                <span className="text-xs font-black text-emerald-400 mb-1 flex items-center gap-1 uppercase italic"><TrendingUp size={16} /> Optimal</span>
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden mb-8 p-1 border border-white/5">
                <div className="h-full bg-linear-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${globalHealth}%` }} />
              </div>
              <div className="space-y-4 text-[10px] font-black uppercase tracking-widest text-left">
                <div className="flex justify-between items-center py-3 border-b border-white/10"><span className="text-slate-400 italic">Leadership Scellé</span><span className="text-emerald-400">{stats.coverageRate}%</span></div>
                <div className="flex justify-between items-center py-3 border-b border-white/10"><span className="text-slate-400 italic">Maillage Sites</span><span className="text-blue-400">100%</span></div>
                <div className="flex justify-between items-center py-3"><span className="text-slate-400 italic">Flux de Mutation</span><span className="text-amber-400">+{stats.recentChanges}</span></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[4rem] p-10 border border-slate-100 shadow-2xl text-left">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase italic text-slate-900 flex items-center gap-3 tracking-tighter"><AlertCircle className="text-rose-600" size={24} /> Anomalies Matrix</h3>
              <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase">{stats.alerts.length} Alertes</span>
            </div>
            <div className="space-y-6">
              {stats.alerts.map((alert) => (
                <div key={alert.id} className={`p-6 rounded-4xl border-l-8 shadow-sm transition-all hover:scale-[1.02] text-left ${alert.type === 'danger' ? 'bg-rose-50 border-rose-600' : alert.type === 'warning' ? 'bg-amber-50 border-amber-600' : 'bg-blue-50 border-blue-600'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${alert.type === 'danger' ? 'bg-rose-200 text-rose-900' : alert.type === 'warning' ? 'bg-amber-200 text-amber-900' : 'bg-blue-200 text-blue-900'}`}>{alert.type === 'danger' ? 'Critique' : alert.type === 'warning' ? 'Alerte' : 'Info'}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{alert.unit}</span>
                  </div>
                  <p className="text-sm font-black text-slate-800 italic mb-4 leading-tight uppercase text-left">{alert.message}</p>
                  <button className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-all border-none bg-transparent cursor-pointer italic">
                    {alert.action} <ArrowUpRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-linear-to-br from-blue-700 to-blue-900 rounded-[4rem] p-10 text-white shadow-2xl text-left">
            <h3 className="text-[11px] font-black uppercase mb-8 tracking-[0.4em] text-blue-200 italic text-center">Commandes Souveraines</h3>
            <div className="space-y-4">
              <QuickAction icon={Plus} label="Sceller une Unité" onClick={() => router.push('/dashboard/organization/units/new')} />
              <QuickAction icon={UserCircle} label="Enrôler des Citoyens" onClick={() => router.push('/dashboard/users/assign')} />
              <QuickAction icon={Globe} label="Déployer un Site" onClick={() => router.push('/dashboard/sites')} />
              <QuickAction icon={FolderTree} label="Rectifier l&apos;Arbre" onClick={() => router.push('/dashboard/organization/chart')} />
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-20 pt-10 border-t border-slate-200 text-center"><p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-300 italic">Qualisoft Elite Sovereign Infrastructure — Protocol v2.4.2 — 2026</p></footer>
    </div>
  );
}

/** 🛠️ COMPOSANTS INTERNES DÉDIÉS AU DASHBOARD E-ORGANISATION */

function KPICard({ icon: Icon, label, value, trend, trendUp, color, subtext }: any) {
  const colors: any = {
    blue: 'text-blue-600 bg-blue-50/50',
    emerald: 'text-emerald-600 bg-emerald-50/50',
    amber: 'text-amber-600 bg-amber-50/50',
    purple: 'text-purple-600 bg-purple-50/50'
  };
  return (
    <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group text-left">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${colors[color]} group-hover:scale-110 transition-transform duration-500`}><Icon size={32} /></div>
        <div className={`flex items-center gap-2 text-[9px] font-black uppercase px-3 py-1.5 rounded-full italic ${trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {trendUp ? <TrendingUp size={12} /> : <AlertCircle size={12} />} {trend}
        </div>
      </div>
      <div className="space-y-2 text-left">
        <p className="text-5xl font-black text-slate-900 italic tracking-tighter leading-none">{value}</p>
        <p className="text-xs font-black text-slate-900 uppercase italic tracking-tight">{label}</p>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{subtext}</p>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full p-5 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center gap-4 transition-all group text-left border border-white/5 hover:border-white/20 outline-none cursor-pointer">
      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500"><Icon size={20} /></div>
      <span className="text-[11px] font-black uppercase italic tracking-widest text-white group-hover:translate-x-1 transition-transform">{label}</span>
      <ChevronRight size={16} className="ml-auto opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </button>
  );
}