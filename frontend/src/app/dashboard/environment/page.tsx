/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Leaf, Zap, Droplets, Flame, TrendingUp, AlertTriangle, 
  Plus, Search, Calendar, Filter, Recycle, BarChart3, 
  Target, Clock, CheckCircle, AlertCircle, Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import EnvironmentalKPICard from './components/EnvironmentalKPICard';
import EnvironmentalAlerts from './components/EnvironmentalAlerts';
import ConsumptionChart from './components/ConsumptionChart';
import WasteBreakdown from './components/WasteBreakdown';

export default function EnvironmentDashboardPage() {
  const router = useRouter();
  const [consumptions, setConsumptions] = useState<any[]>([]);
  const [wastes, setWastes] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'MONTH' | 'QUARTER' | 'YEAR'>('MONTH');
  const [selectedSite, setSelectedSite] = useState<string>('ALL');

  // Statistiques calculées
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Filtre par période et site
    const filteredConsumptions = consumptions.filter(c => {
      const matchPeriod = activeFilter === 'MONTH' 
        ? c.CON_Month === currentMonth && c.CON_Year === currentYear
        : activeFilter === 'QUARTER'
        ? Math.floor((c.CON_Month - 1) / 3) === Math.floor((currentMonth - 1) / 3) && c.CON_Year === currentYear
        : c.CON_Year === currentYear;
      return matchPeriod && (selectedSite === 'ALL' || c.CON_SiteId === selectedSite);
    });

    const filteredWastes = wastes.filter(w => {
      const matchPeriod = activeFilter === 'MONTH' 
        ? w.WAS_Month === currentMonth && w.WAS_Year === currentYear
        : activeFilter === 'QUARTER'
        ? Math.floor((w.WAS_Month - 1) / 3) === Math.floor((currentMonth - 1) / 3) && w.WAS_Year === currentYear
        : w.WAS_Year === currentYear;
      return matchPeriod && (selectedSite === 'ALL' || w.WAS_SiteId === selectedSite);
    });

    const filteredIncidents = incidents.filter(i => {
      const incidentDate = new Date(i.SSE_DateEvent);
      const matchPeriod = activeFilter === 'MONTH' 
        ? incidentDate.getMonth() + 1 === currentMonth && incidentDate.getFullYear() === currentYear
        : activeFilter === 'QUARTER'
        ? Math.floor(incidentDate.getMonth() / 3) === Math.floor((currentMonth - 1) / 3) && incidentDate.getFullYear() === currentYear
        : incidentDate.getFullYear() === currentYear;
      return matchPeriod && (selectedSite === 'ALL' || i.SSE_SiteId === selectedSite);
    });

    // Calculs Consommations
    const energyConsumption = filteredConsumptions
      .filter(c => c.CON_Type.toLowerCase().includes('electric') || c.CON_Type.toLowerCase().includes('énergie'))
      .reduce((sum, c) => sum + c.CON_Value, 0);
    
    const waterConsumption = filteredConsumptions
      .filter(c => c.CON_Type.toLowerCase().includes('eau') || c.CON_Type.toLowerCase().includes('water'))
      .reduce((sum, c) => sum + c.CON_Value, 0);
    
    const totalConsumptionCost = filteredConsumptions.reduce((sum, c) => sum + (c.CON_Cost || 0), 0);

    // Calculs Déchets
    const totalWaste = filteredWastes.reduce((sum, w) => sum + w.WAS_Weight, 0);
    const recyclableWaste = filteredWastes
      .filter(w => w.WAS_Type.toLowerCase().includes('recycl') || w.WAS_Treatment.toLowerCase().includes('recycl'))
      .reduce((sum, w) => sum + w.WAS_Weight, 0);
    const recyclingRate = totalWaste > 0 ? Math.round((recyclableWaste / totalWaste) * 100) : 0;
    
    const hazardousWaste = filteredWastes
      .filter(w => w.WAS_Type.toLowerCase().includes('dangereux') || w.WAS_Type.toLowerCase().includes('toxique'))
      .reduce((sum, w) => sum + w.WAS_Weight, 0);

    // Calculs Incidents
    const environmentalIncidents = filteredIncidents.filter(i => 
      i.SSE_Type === 'DOMMAGE_MATERIEL' || 
      i.SSE_Description.toLowerCase().includes('environnement') ||
      i.SSE_Description.toLowerCase().includes('pollution') ||
      i.SSE_Description.toLowerCase().includes('déversement')
    );
    
    const criticalIncidents = environmentalIncidents.filter(i => i.SSE_AvecArret).length;
    const totalIncidents = environmentalIncidents.length;

    // Objectifs ISO 14001
    const energyTarget = 10000; // kWh/mois (exemple)
    const waterTarget = 500;    // m³/mois (exemple)
    const wasteTarget = 5000;   // kg/mois (exemple)
    const recyclingTarget = 75; // % (exemple)

    return {
      // Consommations
      energyConsumption: Math.round(energyConsumption),
      waterConsumption: Math.round(waterConsumption),
      totalConsumptionCost: Math.round(totalConsumptionCost),
      energyProgress: Math.min(100, Math.round((energyConsumption / energyTarget) * 100)),
      waterProgress: Math.min(100, Math.round((waterConsumption / waterTarget) * 100)),
      
      // Déchets
      totalWaste: Math.round(totalWaste),
      recyclableWaste: Math.round(recyclableWaste),
      hazardousWaste: Math.round(hazardousWaste),
      recyclingRate,
      wasteProgress: Math.min(100, Math.round((totalWaste / wasteTarget) * 100)),
      
      // Incidents
      totalIncidents,
      criticalIncidents,
      incidentProgress: totalIncidents === 0 ? 100 : Math.max(0, 100 - (criticalIncidents * 20)),
      
      // Objectifs
      energyTarget,
      waterTarget,
      wasteTarget,
      recyclingTarget,
      
      // Tendances (simulées pour l'exemple)
      trendEnergy: energyConsumption > energyTarget * 0.9 ? '-5%' : '+12%',
      trendWater: waterConsumption > waterTarget * 0.9 ? '-3%' : '+8%',
      trendRecycling: recyclingRate > recyclingTarget ? '+15%' : '-5%',
      trendIncidents: totalIncidents > 0 ? `+${totalIncidents}` : '0'
    };
  }, [consumptions, wastes, incidents, activeFilter, selectedSite]);

  useEffect(() => {
    fetchData();
  }, [activeFilter, selectedSite]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [consRes, wastesRes, incidentsRes, sitesRes] = await Promise.all([
        apiClient.get('/consumptions'),
        apiClient.get('/wastes'),
        apiClient.get('/sse'),
        apiClient.get('/sites')
      ]);
      
      setConsumptions(consRes.data || []);
      setWastes(wastesRes.data || []);
      setIncidents(incidentsRes.data || []);
      setSites(sitesRes.data || []);
    } catch (error) {
      console.error("Erreur chargement données environnement:", error);
      toast.error("Erreur de synchronisation des données environnementales");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A]">
        <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mb-6"></div>
        <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-[0.2em]">
          Chargement du tableau de bord environnemental ISO 14001...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans">
      {/* HEADER */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-linear-to-br from-green-500 to-emerald-600 p-3 rounded-2xl shadow-lg shadow-green-500/20">
              <Leaf size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter">
                Management <span className="text-green-400">Environnemental</span>
              </h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1 italic">
                Performance ISO 14001:2015 • Consommations • Déchets • Incidents
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex bg-slate-900/50 border border-white/10 rounded-2xl p-1">
            {(['MONTH', 'QUARTER', 'YEAR'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setActiveFilter(range)}
                className={`px-4 py-2 text-[9px] font-black uppercase rounded-xl transition-all ${
                  activeFilter === range 
                    ? 'bg-green-500 text-white shadow-md shadow-green-500/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range === 'MONTH' && 'Mois'}
                {range === 'QUARTER' && 'Trimestre'}
                {range === 'YEAR' && 'Année'}
              </button>
            ))}
          </div>
          
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-2 text-[10px] font-black uppercase text-white focus:outline-none focus:border-green-500"
          >
            <option value="ALL">Tous les Sites</option>
            {sites.map(site => (
              <option key={site.S_Id} value={site.S_Id}>{site.S_Name}</option>
            ))}
          </select>
          
          <button 
            onClick={() => router.push('/dashboard/environment/analytics')}
            className="group bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-2 hover:bg-emerald-600 hover:border-emerald-400 transition-all duration-300"
          >
            <BarChart3 size={16} className="group-hover:scale-110 transition-transform" /> 
            Analytics
          </button>
          
          <button 
            onClick={() => router.push('/dashboard/environment/incidents/new')}
            className="group bg-linear-to-r from-green-600 to-emerald-700 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-2 hover:from-green-500 hover:to-emerald-600 shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all duration-300 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> Nouvel Incident
          </button>
        </div>
      </header>

      {/* ALERTES ENVIRONNEMENTALES */}
      <EnvironmentalAlerts 
        criticalIncidents={stats.criticalIncidents}
        hazardousWaste={stats.hazardousWaste}
        energyOverTarget={stats.energyConsumption > stats.energyTarget}
        recyclingBelowTarget={stats.recyclingRate < stats.recyclingTarget}
      />

      {/* KPI CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <EnvironmentalKPICard 
          title="Consommation Énergie" 
          value={`${stats.energyConsumption} kWh`} 
          target={`${stats.energyTarget} kWh`}
          progress={stats.energyProgress}
          trend={stats.trendEnergy}
          icon={<Zap className="w-8 h-8" />}
          color="from-amber-500 to-orange-600"
          isoRef="ISO 14001 §9.1.1"
          alert={stats.energyConsumption > stats.energyTarget * 0.9}
        />
        
        <EnvironmentalKPICard 
          title="Consommation Eau" 
          value={`${stats.waterConsumption} m³`} 
          target={`${stats.waterTarget} m³`}
          progress={stats.waterProgress}
          trend={stats.trendWater}
          icon={<Droplets className="w-8 h-8" />}
          color="from-blue-500 to-cyan-600"
          isoRef="ISO 14001 §9.1.1"
          alert={stats.waterConsumption > stats.waterTarget * 0.9}
        />
        
        <EnvironmentalKPICard 
          title="Déchets Produits" 
          value={`${stats.totalWaste} kg`} 
          target={`${stats.wasteTarget} kg`}
          progress={stats.wasteProgress}
          trend={stats.trendRecycling}
          icon={<Flame className="w-8 h-8" />}
          color="from-red-500 to-rose-600"
          isoRef="ISO 14001 §8.1"
          alert={stats.totalWaste > stats.wasteTarget * 0.9}
        />
        
        <EnvironmentalKPICard 
          title="Taux de Recyclage" 
          value={`${stats.recyclingRate}%`} 
          target={`${stats.recyclingTarget}%`}
          progress={stats.recyclingRate}
          trend={stats.trendRecycling}
          icon={<Recycle className="w-8 h-8" />}
          color="from-green-500 to-emerald-600"
          isoRef="ISO 14001 §8.1"
          alert={stats.recyclingRate < stats.recyclingTarget}
        />
      </section>

      {/* GRAPHIQUES ET ANALYSES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black uppercase italic flex items-center gap-2">
              <Zap className="text-amber-400" /> Évolution des Consommations
            </h2>
            <button className="text-[10px] font-black text-green-400 hover:text-green-300 transition-colors flex items-center gap-1">
              <Download size={14} /> Export CSV
            </button>
          </div>
          <ConsumptionChart 
            consumptions={consumptions} 
            period={activeFilter} 
            siteId={selectedSite}
          />
        </div>

        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black uppercase italic flex items-center gap-2">
              <Recycle className="text-green-400" /> Répartition des Déchets
            </h2>
            <button className="text-[10px] font-black text-green-400 hover:text-green-300 transition-colors flex items-center gap-1">
              <Download size={14} /> Export CSV
            </button>
          </div>
          <WasteBreakdown 
            wastes={wastes} 
            period={activeFilter} 
            siteId={selectedSite}
          />
        </div>
      </div>

      {/* INCIDENTS ENVIRONNEMENTAUX RÉCENTS */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black uppercase italic flex items-center gap-2">
            <AlertTriangle className="text-red-400" /> Incidents Environnementaux Récents
          </h2>
          <span className="text-[10px] font-black text-slate-500 uppercase">
            {stats.totalIncidents} incidents • {stats.criticalIncidents} critiques
          </span>
        </div>
        
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5">
              <tr className="text-[10px] font-black uppercase text-slate-500 italic tracking-widest border-b border-white/5">
                <th className="p-6">Date & Lieu</th>
                <th className="p-6">Type d&apos;Incident</th>
                <th className="p-6">Description</th>
                <th className="p-6 text-center">Gravité</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {incidents
                .filter(i => 
                  i.SSE_Type === 'DOMMAGE_MATERIEL' || 
                  i.SSE_Description.toLowerCase().includes('environnement') ||
                  i.SSE_Description.toLowerCase().includes('pollution')
                )
                .slice(0, 5)
                .map((incident) => {
                  const isCritical = incident.SSE_AvecArret || 
                    incident.SSE_Description.toLowerCase().includes('pollution majeure') ||
                    incident.SSE_Description.toLowerCase().includes('déversement');
                  
                  return (
                    <tr key={incident.SSE_Id} className="hover:bg-white/5 transition-all">
                      <td className="p-6">
                        <div className="space-y-1">
                          <p className="font-black text-sm">
                            {new Date(incident.SSE_DateEvent).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase">
                            {incident.SSE_Site?.S_Name || 'Site inconnu'}
                          </p>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                          isCritical 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {incident.SSE_Type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-6">
                        <p className="text-sm font-medium line-clamp-2">
                          {incident.SSE_Description}
                        </p>
                      </td>
                      <td className="p-6 text-center">
                        {isCritical ? (
                          <span className="flex items-center justify-center gap-1 text-[10px] font-black text-red-400">
                            <AlertCircle size={16} /> CRITIQUE
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1 text-[10px] font-black text-amber-400">
                            <Clock size={16} /> Modéré
                          </span>
                        )}
                      </td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => router.push(`/dashboard/environment/incidents/${incident.SSE_Id}`)}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase hover:bg-green-500/20 hover:border-green-500/30 transition-all"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-center">
          <button 
            onClick={() => router.push('/dashboard/environment/incidents')}
            className="text-[10px] font-black text-green-400 hover:text-green-300 transition-colors flex items-center gap-1 mx-auto"
          >
            Voir tous les incidents →
          </button>
        </div>
      </section>

      {/* ACTIONS PRIORITAIRES */}
      <section className="bg-linear-to-r from-green-900/30 to-emerald-900/30 border border-green-500/20 rounded-3xl p-8 mb-10">
        <h3 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2">
          <Target className="text-green-400" /> Actions Prioritaires ISO 14001
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.energyConsumption > stats.energyTarget * 0.9 && (
            <ActionItem 
              icon={<Zap className="text-amber-400" />}
              title="Optimiser la consommation énergétique"
              description={`Objectif: ${stats.energyTarget} kWh • Actuel: ${stats.energyConsumption} kWh`}
              progress={stats.energyProgress}
              onClick={() => router.push('/dashboard/environment/consumptions')}
            />
          )}
          
          {stats.recyclingRate < stats.recyclingTarget && (
            <ActionItem 
              icon={<Recycle className="text-green-400" />}
              title="Améliorer le taux de recyclage"
              description={`Objectif: ${stats.recyclingTarget}% • Actuel: ${stats.recyclingRate}%`}
              progress={stats.recyclingRate}
              onClick={() => router.push('/dashboard/environment/wastes')}
            />
          )}
          
          {stats.criticalIncidents > 0 && (
            <ActionItem 
              icon={<AlertTriangle className="text-red-400" />}
              title="Traiter les incidents critiques"
              description={`${stats.criticalIncidents} incident${stats.criticalIncidents > 1 ? 's' : ''} nécessite${stats.criticalIncidents > 1 ? 'nt' : ''} une action immédiate`}
              progress={stats.incidentProgress}
              onClick={() => router.push('/dashboard/environment/incidents?status=critical')}
            />
          )}
        </div>
      </section>

      {/* FOOTER CONFORMITÉ */}
      <footer className="mt-8 pt-6 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
            <CheckCircle className="text-green-500" size={16} />
            <span>Conforme ISO 14001:2015</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
            <Leaf className="text-green-500" size={16} />
            <span>Objectifs Environnementaux Suivis</span>
          </div>
        </div>
        <p className="mt-3 text-[8px] font-bold text-slate-600 uppercase italic tracking-[0.3em]">
          Qualisoft SMI • Module Environnement ISO 14001 v2.0 • Données mises à jour en temps réel
        </p>
      </footer>
    </div>
  );
}

// ========================
// COMPOSANTS RÉUTILISABLES
// ========================

interface ActionItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  progress: number;
  onClick: () => void;
}

function ActionItem({ icon, title, description, progress, onClick }: ActionItemProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left hover:bg-white/10 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-green-500/10 rounded-xl text-green-400 mt-0.5 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-black text-white text-sm mb-1 group-hover:text-green-300 transition-colors">
            {title}
          </h4>
          <p className="text-[9px] text-slate-400 italic mb-3">{description}</p>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-500" 
              style={{ width: `${Math.min(100, progress)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </button>
  );
}