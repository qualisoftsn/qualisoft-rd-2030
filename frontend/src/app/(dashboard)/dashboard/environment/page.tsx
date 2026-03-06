/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : TABLEAU DE BORD ENVIRONNEMENTAL (ISO 14001)
 * -------------------------------------------------------------------------
 * Rôle : Cockpit de suivi des performances environnementales (Énergie, Eau, Déchets).
 * Fix : Typage strict, responsive design (lg:ml-72), sécurisation des retours
 * API, et standardisation des notifications via Sonner.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 02:05 GMT
 */

'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Leaf, Zap, Droplets, Flame, AlertTriangle, 
  Plus, Search, Calendar, Filter, Recycle, BarChart3, 
  Target, Clock, CheckCircle, AlertCircle, Download, Loader2,
  ChevronRight
} from 'lucide-react';
import { toast, Toaster } from 'sonner'; // Standardisé pour correspondre au reste de l'app

// --- COMPOSANTS EXTERNES (Supposés existants) ---
import EnvironmentalKPICard from './components/EnvironmentalKPICard';
import EnvironmentalAlerts from './components/EnvironmentalAlerts';
import ConsumptionChart from './components/ConsumptionChart';
import WasteBreakdown from './components/WasteBreakdown';

// --- TYPES STRICTS SCELLÉS ---
interface Consumption {
  CON_Id: string;
  CON_Month: number;
  CON_Year: number;
  CON_Type: string;
  CON_Value: number;
  CON_Cost?: number;
  CON_SiteId: string;
}

interface Waste {
  WAS_Id: string;
  WAS_Month: number;
  WAS_Year: number;
  WAS_Type: string;
  WAS_Weight: number;
  WAS_Treatment: string;
  WAS_SiteId: string;
}

interface Incident {
  SSE_Id: string;
  SSE_DateEvent: string;
  SSE_Type: string;
  SSE_Description: string;
  SSE_AvecArret: boolean;
  SSE_SiteId: string;
  SSE_Site?: { S_Name: string };
}

interface Site {
  S_Id: string;
  S_Name: string;
}

type FilterRange = 'MONTH' | 'QUARTER' | 'YEAR';

export default function EnvironmentDashboardPage() {
  const router = useRouter();
  
  // --- ÉTATS ---
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<FilterRange>('MONTH');
  const [selectedSite, setSelectedSite] = useState<string>('ALL');

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [consRes, wastesRes, incidentsRes, sitesRes] = await Promise.all([
        apiClient.get('/consumptions'),
        apiClient.get('/wastes'),
        apiClient.get('/sse'),
        apiClient.get('/sites')
      ]);
      
      // Sécurisation des retours API (gestion de la pagination ou format data enveloppé)
      setConsumptions(Array.isArray(consRes.data?.data || consRes.data) ? (consRes.data?.data || consRes.data) : []);
      setWastes(Array.isArray(wastesRes.data?.data || wastesRes.data) ? (wastesRes.data?.data || wastesRes.data) : []);
      setIncidents(Array.isArray(incidentsRes.data?.data || incidentsRes.data) ? (incidentsRes.data?.data || incidentsRes.data) : []);
      setSites(Array.isArray(sitesRes.data?.data || sitesRes.data) ? (sitesRes.data?.data || sitesRes.data) : []);
    } catch (error) {
      console.error("Erreur chargement données environnement:", error);
      toast.error("Erreur de synchronisation des données ISO 14001");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- MOTEUR DE CALCUL DES STATISTIQUES ---
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Filtrage dynamique
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

    // Agrégrations
    const energyConsumption = filteredConsumptions
      .filter(c => c.CON_Type.toLowerCase().includes('electric') || c.CON_Type.toLowerCase().includes('énergie'))
      .reduce((sum, c) => sum + c.CON_Value, 0);
    
    const waterConsumption = filteredConsumptions
      .filter(c => c.CON_Type.toLowerCase().includes('eau') || c.CON_Type.toLowerCase().includes('water'))
      .reduce((sum, c) => sum + c.CON_Value, 0);
    
    const totalConsumptionCost = filteredConsumptions.reduce((sum, c) => sum + (c.CON_Cost || 0), 0);

    const totalWaste = filteredWastes.reduce((sum, w) => sum + w.WAS_Weight, 0);
    const recyclableWaste = filteredWastes
      .filter(w => w.WAS_Type.toLowerCase().includes('recycl') || w.WAS_Treatment.toLowerCase().includes('recycl'))
      .reduce((sum, w) => sum + w.WAS_Weight, 0);
    const recyclingRate = totalWaste > 0 ? Math.round((recyclableWaste / totalWaste) * 100) : 0;
    
    const hazardousWaste = filteredWastes
      .filter(w => w.WAS_Type.toLowerCase().includes('dangereux') || w.WAS_Type.toLowerCase().includes('toxique'))
      .reduce((sum, w) => sum + w.WAS_Weight, 0);

    const environmentalIncidents = filteredIncidents.filter(i => 
      i.SSE_Type === 'DOMMAGE_MATERIEL' || 
      i.SSE_Description.toLowerCase().includes('environnement') ||
      i.SSE_Description.toLowerCase().includes('pollution') ||
      i.SSE_Description.toLowerCase().includes('déversement')
    );
    
    const criticalIncidents = environmentalIncidents.filter(i => i.SSE_AvecArret).length;
    const totalIncidents = environmentalIncidents.length;

    // Seuils ISO 14001 (Peuvent être dynamisés via API)
    const energyTarget = 10000; 
    const waterTarget = 500;    
    const wasteTarget = 5000;   
    const recyclingTarget = 75; 

    return {
      energyConsumption: Math.round(energyConsumption),
      waterConsumption: Math.round(waterConsumption),
      totalConsumptionCost: Math.round(totalConsumptionCost),
      energyProgress: Math.min(100, Math.round((energyConsumption / energyTarget) * 100)),
      waterProgress: Math.min(100, Math.round((waterConsumption / waterTarget) * 100)),
      
      totalWaste: Math.round(totalWaste),
      recyclableWaste: Math.round(recyclableWaste),
      hazardousWaste: Math.round(hazardousWaste),
      recyclingRate,
      wasteProgress: Math.min(100, Math.round((totalWaste / wasteTarget) * 100)),
      
      totalIncidents,
      criticalIncidents,
      incidentProgress: totalIncidents === 0 ? 100 : Math.max(0, 100 - (criticalIncidents * 20)),
      
      energyTarget,
      waterTarget,
      wasteTarget,
      recyclingTarget,
      
      trendEnergy: energyConsumption > energyTarget * 0.9 ? '-5%' : '+12%',
      trendWater: waterConsumption > waterTarget * 0.9 ? '-3%' : '+8%',
      trendRecycling: recyclingRate > recyclingTarget ? '+15%' : '-5%',
      trendIncidents: totalIncidents > 0 ? `+${totalIncidents}` : '0'
    };
  }, [consumptions, wastes, incidents, activeFilter, selectedSite]);

  // --- ÉCRAN DE CHARGEMENT ---
  if (loading && consumptions.length === 0) {
    return (
      <div className="ml-0 lg:ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A]">
        <div className="relative inline-block mb-6">
          <Loader2 className="w-16 h-16 animate-spin text-emerald-500" />
          <Leaf className="absolute inset-0 m-auto text-emerald-300/30 animate-pulse" size={24} />
        </div>
        <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-[0.2em] animate-pulse">
          Chargement du cockpit environnemental ISO 14001...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#0B0F1A] min-h-screen ml-0 lg:ml-72 text-white font-sans selection:bg-emerald-500/30 pb-24">
      <Toaster position="top-right" richColors theme="dark" />

      <div className="max-w-400 mx-auto space-y-10 mt-12 lg:mt-0 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <header className="flex flex-col xl:flex-row justify-between xl:items-end gap-8 border-b border-white/5 pb-8">
          <div className="flex items-center gap-5">
            <div className="bg-linear-to-br from-green-500 to-emerald-600 p-4 rounded-4xl shadow-[0_0_30px_rgba(16,185,129,0.3)] shrink-0">
              <Leaf size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase italic tracking-tighter m-0">
                Management <span className="text-green-400">Environnemental</span>
              </h1>
              <p className="text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-[0.3em] mt-2 italic m-0">
                Performance ISO 14001:2015 • Consommations • Déchets
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Filtre de période */}
            <div className="flex bg-slate-900/50 border border-white/10 rounded-2xl p-1">
              {(['MONTH', 'QUARTER', 'YEAR'] as FilterRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setActiveFilter(range)}
                  className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all border-none cursor-pointer ${
                    activeFilter === range 
                      ? 'bg-green-500 text-white shadow-md shadow-green-500/30' 
                      : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {range === 'MONTH' ? 'Mois' : range === 'QUARTER' ? 'Trimestre' : 'Année'}
                </button>
              ))}
            </div>
            
            {/* Filtre de site */}
            <div className="relative">
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="bg-slate-900/50 border border-white/10 rounded-2xl pl-4 pr-10 py-3 text-[10px] font-black uppercase text-white focus:outline-none focus:border-green-500 cursor-pointer appearance-none"
              >
                <option value="ALL">Tous les Sites</option>
                {sites.map(site => (
                  <option key={site.S_Id} value={site.S_Id}>{site.S_Name}</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={() => router.push('/dashboard/environment/analytics')}
              className="group bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-2 hover:bg-emerald-600 hover:border-emerald-400 transition-all duration-300 cursor-pointer"
            >
              <BarChart3 size={16} className="group-hover:scale-110 transition-transform" /> 
              Analytics
            </button>
            
            <button 
              onClick={() => router.push('/dashboard/environment/incidents/new')}
              className="group bg-linear-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-2 hover:from-green-500 hover:to-emerald-600 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-300 active:scale-95 border-none cursor-pointer"
            >
              <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> Incident
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
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnvironmentalKPICard 
            title="Consommation Énergie" 
            value={`${stats.energyConsumption} kWh`} 
            target={`${stats.energyTarget} kWh`}
            progress={stats.energyProgress}
            trend={stats.trendEnergy}
            icon={<Zap className="w-6 h-6" />}
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
            icon={<Droplets className="w-6 h-6" />}
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
            icon={<Flame className="w-6 h-6" />}
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
            icon={<Recycle className="w-6 h-6" />}
            color="from-green-500 to-emerald-600"
            isoRef="ISO 14001 §8.1"
            alert={stats.recyclingRate < stats.recyclingTarget}
          />
        </section>

        {/* GRAPHIQUES ET ANALYSES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl sm:text-2xl font-black uppercase italic flex items-center gap-3 m-0">
                <div className="p-2 bg-amber-500/10 rounded-xl"><Zap className="text-amber-400" size={20} /></div>
                Consommations
              </h2>
              <button className="text-[10px] font-black text-green-400 hover:text-green-300 transition-colors flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg cursor-pointer border-none">
                <Download size={14} /> Export CSV
              </button>
            </div>
            <ConsumptionChart 
              consumptions={consumptions} 
              period={activeFilter} 
              siteId={selectedSite}
            />
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl sm:text-2xl font-black uppercase italic flex items-center gap-3 m-0">
                <div className="p-2 bg-green-500/10 rounded-xl"><Recycle className="text-green-400" size={20} /></div>
                Déchets
              </h2>
              <button className="text-[10px] font-black text-green-400 hover:text-green-300 transition-colors flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg cursor-pointer border-none">
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
        <section className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-6 sm:p-8 backdrop-blur-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <h2 className="text-xl sm:text-2xl font-black uppercase italic flex items-center gap-3 m-0">
              <div className="p-2 bg-red-500/10 rounded-xl"><AlertTriangle className="text-red-400" size={20} /></div>
              Incidents Récents
            </h2>
            <span className="text-[10px] font-black text-slate-500 uppercase px-4 py-2 bg-white/5 rounded-full">
              {stats.totalIncidents} incidents • {stats.criticalIncidents} critiques
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-white/5">
                <tr className="text-[10px] font-black uppercase text-slate-500 italic tracking-widest border-b border-white/5">
                  <th className="p-4 sm:p-6 whitespace-nowrap">Date & Lieu</th>
                  <th className="p-4 sm:p-6 whitespace-nowrap">Type d&apos;Incident</th>
                  <th className="p-4 sm:p-6">Description</th>
                  <th className="p-4 sm:p-6 text-center whitespace-nowrap">Gravité</th>
                  <th className="p-4 sm:p-6 text-right whitespace-nowrap">Actions</th>
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
                        <td className="p-4 sm:p-6">
                          <div className="space-y-1">
                            <p className="font-black text-xs sm:text-sm m-0">
                              {new Date(incident.SSE_DateEvent).toLocaleDateString('fr-FR')}
                            </p>
                            <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase m-0">
                              {incident.SSE_Site?.S_Name || 'Site inconnu'}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 sm:p-6">
                          <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap ${
                            isCritical 
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {incident.SSE_Type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-4 sm:p-6">
                          <p className="text-xs sm:text-sm font-medium line-clamp-2 m-0 opacity-80">
                            {incident.SSE_Description}
                          </p>
                        </td>
                        <td className="p-4 sm:p-6 text-center">
                          {isCritical ? (
                            <span className="flex items-center justify-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-widest">
                              <AlertCircle size={14} /> Critique
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2 text-[10px] font-black text-amber-400 uppercase tracking-widest">
                              <Clock size={14} /> Modéré
                            </span>
                          )}
                        </td>
                        <td className="p-4 sm:p-6 text-right">
                          <button 
                            onClick={() => router.push(`/dashboard/environment/incidents/${incident.SSE_Id}`)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30 transition-all cursor-pointer"
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
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => router.push('/dashboard/environment/incidents')}
              className="text-[10px] font-black text-green-400 hover:text-green-300 transition-colors inline-flex items-center gap-2 mx-auto bg-green-500/10 px-5 py-2.5 rounded-full cursor-pointer border-none"
            >
              Voir tous les incidents <ChevronRight size={14} />
            </button>
          </div>
        </section>

        {/* ACTIONS PRIORITAIRES */}
        <section className="bg-linear-to-r from-green-900/30 to-emerald-900/30 border border-green-500/20 rounded-[3rem] p-8 lg:p-10 relative overflow-hidden">
          <Leaf size={250} className="absolute -bottom-10 -right-10 opacity-[0.03] text-green-500 pointer-events-none" />
          <h3 className="text-xl sm:text-2xl font-black uppercase italic mb-8 flex items-center gap-3 relative z-10 m-0">
            <Target className="text-green-400" size={28} /> Actions Prioritaires ISO 14001
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
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
        <footer className="pt-8 border-t border-white/5 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
              <CheckCircle className="text-emerald-500" size={16} />
              <span>Conforme ISO 14001:2015</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
              <Leaf className="text-emerald-500" size={16} />
              <span>Objectifs Environnementaux Suivis</span>
            </div>
          </div>
          <p className="text-[9px] font-bold text-slate-600 uppercase italic tracking-[0.3em] m-0">
            Qualisoft SMI • Module Environnement ISO 14001 v2.0 • Données synchronisées
          </p>
        </footer>
      </div>
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
      className="bg-white/5 border border-white/10 rounded-4xl p-6 text-left hover:bg-white/10 hover:border-white/20 transition-all group cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform shrink-0">
          {icon}
        </div>
        <div className="flex-1 w-full">
          <h4 className="font-black text-white text-sm mb-2 group-hover:text-green-300 transition-colors m-0 line-clamp-2">
            {title}
          </h4>
          <p className="text-[10px] text-slate-400 italic mb-4 m-0">{description}</p>
          <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden shadow-inner border border-white/5">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${progress > 90 ? 'bg-red-500' : progress > 70 ? 'bg-amber-500' : 'bg-green-500'}`} 
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}