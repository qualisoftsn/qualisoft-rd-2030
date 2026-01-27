'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Users, MapPin, GitGraph, ArrowUpRight, 
  AlertTriangle, CheckCircle2, TrendingUp, Activity,
  Plus, Layers, Briefcase, Target, AlertCircle,
  ChevronRight, BarChart3, Globe, ShieldCheck,
  Clock, FolderTree, UserCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Types mockés (à remplacer par vos vrais appels API)
interface OrgStats {
  totalUnits: number;
  totalSites: number;
  totalUsers: number;
  unitsByType: { type: string; count: number; color: string }[];
  coverageRate: number; // % d'unités avec pilote assigné
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

  // Simulation de chargement des données (remplacer par vos appels API réels)
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      // Simulation données - remplacer par : await apiClient.get('/organization/dashboard')
      setTimeout(() => {
        setStats({
          totalUnits: 12,
          totalSites: 3,
          totalUsers: 47,
          coverageRate: 85,
          recentChanges: 4,
          unitsByType: [
            { type: 'Directions', count: 4, color: 'bg-blue-500' },
            { type: 'Départements', count: 5, color: 'bg-emerald-500' },
            { type: 'Services', count: 2, color: 'bg-amber-500' },
            { type: 'Cellules', count: 1, color: 'bg-purple-500' }
          ],
          alerts: [
            {
              id: '1',
              type: 'warning',
              message: 'Unité sans responsable identifié',
              unit: 'Service Maintenance',
              action: 'Assigner un pilote'
            },
            {
              id: '2',
              type: 'danger',
              message: 'Site sans unité rattachée',
              unit: 'Site de Thiès',
              action: 'Créer une unité'
            },
            {
              id: '3',
              type: 'info',
              message: 'Mise à jour structurelle requise',
              unit: 'Direction Qualité',
              action: 'Revoir la fiche'
            }
          ]
        });
        setLoading(false);
      }, 800);
    };
    fetchDashboardData();
  }, []);

  // Calculs dérivés
  const globalHealth = useMemo(() => {
    const score = Math.round((stats.coverageRate + (stats.totalUsers > 0 ? 100 : 0)) / 2);
    return score;
  }, [stats]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Activity className="animate-spin text-blue-600 mx-auto" size={48} />
          <p className="text-[10px] font-black uppercase text-slate-400 italic tracking-[0.4em]">
            Analyse de la structure organisationnelle...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-slate-50 min-h-screen italic font-sans text-left pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 leading-none">
            Structure <span className="text-blue-600">Organisationnelle</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm max-w-2xl">
            Tableau de bord de pilotage de l'architecture SMI, couverture des responsabilités et cartographie des sites.
          </p>
        </div>

        <div className="flex gap-3">
          <Link 
            href="/dashboard/organization/chart"
            className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-700 font-black uppercase text-[11px] tracking-widest shadow-sm hover:border-blue-300 hover:text-blue-600 transition-all flex items-center gap-2"
          >
            <GitGraph size={16} /> Voir l'organigramme
          </Link>
          <button 
            onClick={() => router.push('/dashboard/organization/units/new')}
            className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Nouvelle Unité
          </button>
        </div>
      </div>

      {/* KPIs CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          icon={Building2}
          label="Unités Organiques"
          value={stats.totalUnits}
          trend="+2 ce mois"
          trendUp={true}
          color="blue"
          subtext="Activement pilotées"
        />
        <KPICard 
          icon={MapPin}
          label="Sites Géographiques"
          value={stats.totalSites}
          trend="Couverture nationale"
          trendUp={true}
          color="emerald"
          subtext="Implantations physiques"
        />
        <KPICard 
          icon={Users}
          label="Collaborateurs"
          value={stats.totalUsers}
          trend="Rattachés"
          trendUp={true}
          color="amber"
          subtext="Dans la structure SMI"
        />
        <KPICard 
          icon={Target}
          label="Taux de Conformité"
          value={`${stats.coverageRate}%`}
          trend={stats.coverageRate >= 90 ? "Optimal" : "À améliorer"}
          trendUp={stats.coverageRate >= 90}
          color="purple"
          subtext="Unités avec pilote assigné"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : RÉPARTITION & CARTOGRAPHIE */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* DISTRIBUTION PAR TYPE */}
          <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-black uppercase italic text-slate-900 tracking-tight flex items-center gap-3">
                  <Layers className="text-blue-600" size={24} />
                  Répartition Hiérarchique
                </h2>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
                  Distribution des unités par niveau de responsabilité
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <BarChart3 className="text-blue-600" size={24} />
              </div>
            </div>

            <div className="space-y-4">
              {stats.unitsByType.map((item, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-700 uppercase italic flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      {item.type}
                    </span>
                    <span className="text-lg font-black text-slate-900 italic">{item.count}</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className={`h-full ${item.color} transition-all duration-1000 ease-out rounded-full opacity-80 group-hover:opacity-100`}
                      style={{ width: `${(item.count / stats.totalUnits) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                <CheckCircle2 size={14} className="text-emerald-500" />
                Profondeur max : 4 niveaux
              </div>
              <button 
                onClick={() => router.push('/dashboard/organization/chart')}
                className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                Explorer la hiérarchie <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* CARTOGRAPHIE DES SITES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Siège Social', location: 'Dakar', units: 8, users: 32, status: 'actif' },
              { name: 'Site de Thiès', location: 'Thiès', units: 2, users: 8, status: 'warning' },
              { name: 'Site de Kaolack', location: 'Kaolack', units: 2, users: 7, status: 'actif' }
            ].map((site, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-[35px] p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer"
                onClick={() => router.push(`/dashboard/sites/${idx + 1}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    site.status === 'actif' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    <Building2 size={20} />
                  </div>
                  {site.status === 'warning' && <AlertTriangle size={16} className="text-amber-500" />}
                </div>
                <h3 className="text-lg font-black uppercase italic text-slate-900 mb-1">{site.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 flex items-center gap-1">
                  <MapPin size={10} /> {site.location}
                </p>
                <div className="flex gap-4 pt-4 border-t border-slate-50">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">{site.units}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Unités</span>
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">{site.users}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Staff</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLONNE DROITE : ALERTES & ACTIONS */}
        <div className="space-y-8">
          
          {/* SANTÉ GLOBALE */}
          <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute -right-10 -top-10 text-white/5">
              <ShieldCheck size={200} />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-[11px] font-black uppercase mb-2 tracking-[0.3em] text-slate-400">
                Santé Organisationnelle
              </h3>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-6xl font-black italic tracking-tighter">
                  {globalHealth}%
                </span>
                <span className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-1">
                  <TrendingUp size={14} /> Stable
                </span>
              </div>
              
              <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-6">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${globalHealth}%` }}
                />
              </div>

              <div className="space-y-3 text-[10px] font-bold uppercase tracking-wide">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-slate-400">Couverte SMI</span>
                  <span className="text-emerald-400">{stats.coverageRate}%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-slate-400">Sites actifs</span>
                  <span className="text-blue-400">100%</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Màj récentes</span>
                  <span className="text-amber-400">{stats.recentChanges} changements</span>
                </div>
              </div>
            </div>
          </div>

          {/* ALERTES & ANOMALIES */}
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black uppercase italic text-slate-900 flex items-center gap-2">
                <AlertCircle className="text-red-500" size={22} />
                Points d'Attention
              </h3>
              <span className="bg-red-100 text-red-700 text-[10px] font-black px-3 py-1 rounded-full">
                {stats.alerts.length} alertes
              </span>
            </div>

            <div className="space-y-4">
              {stats.alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-5 rounded-3xl border-l-4 ${
                    alert.type === 'danger' ? 'bg-red-50 border-red-500' :
                    alert.type === 'warning' ? 'bg-amber-50 border-amber-500' :
                    'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${
                      alert.type === 'danger' ? 'bg-red-200 text-red-800' :
                      alert.type === 'warning' ? 'bg-amber-200 text-amber-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {alert.type === 'danger' ? 'Critique' : alert.type === 'warning' ? 'Attention' : 'Info'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{alert.unit}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 italic mb-3 leading-snug">
                    {alert.message}
                  </p>
                  <button className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-all">
                    {alert.action} <ArrowUpRight size={12} />
                  </button>
                </div>
              ))}
            </div>

            {stats.alerts.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-400" />
                <p className="text-[11px] font-black uppercase italic">Aucune anomalie détectée</p>
              </div>
            )}
          </div>

          {/* ACCÈS RAPIDE */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[40px] p-8 text-white shadow-xl">
            <h3 className="text-[11px] font-black uppercase mb-6 tracking-[0.3em] text-blue-100">
              Actions Rapides
            </h3>
            <div className="space-y-3">
              <QuickAction 
                icon={Plus}
                label="Créer une unité"
                onClick={() => router.push('/dashboard/organization/units/new')}
              />
              <QuickAction 
                icon={UserCircle}
                label="Affecter des collaborateurs"
                onClick={() => router.push('/dashboard/users/assign')}
              />
              <QuickAction 
                icon={Globe}
                label="Gérer les sites"
                onClick={() => router.push('/dashboard/sites')}
              />
              <QuickAction 
                icon={FolderTree}
                label="Modifier la hiérarchie"
                onClick={() => router.push('/dashboard/organization/chart')}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Sub-components

function KPICard({ icon: Icon, label, value, trend, trendUp, color, subtext }: {
  icon: any;
  label: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
  subtext: string;
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-[35px] p-6 shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]} group-hover:scale-110 transition-transform`}>
          <Icon size={28} />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${
          trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {trendUp ? <TrendingUp size={12} /> : <AlertCircle size={12} />}
          {trend}
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-4xl font-black text-slate-900 italic tracking-tighter">{value}</p>
        <p className="text-sm font-bold text-slate-700 uppercase italic">{label}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{subtext}</p>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: {
  icon: any;
  label: string;
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center gap-3 transition-all group text-left border border-white/10 hover:border-white/30"
    >
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 transition-all">
        <Icon size={20} />
      </div>
      <span className="text-sm font-bold uppercase italic">{label}</span>
      <ChevronRight size={16} className="ml-auto opacity-50 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}