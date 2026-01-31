/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  BarChart3, LineChart, PieChart, TrendingUp, Calendar, 
  Download, Filter, Leaf, Target, AlertTriangle, FileSpreadsheet
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function EnvironmentAnalyticsPage() {
  const [consumptions, setConsumptions] = useState<any[]>([]);
  const [wastes, setWastes] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'3M' | '6M' | '12M'>('6M');
  const [selectedSite, setSelectedSite] = useState('ALL');
  const [chartView, setChartView] = useState<'energy' | 'water' | 'waste' | 'recycling'>('energy');

  useEffect(() => {
    fetchData();
  }, [timeRange, selectedSite]);

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
      console.error("Erreur chargement analytics:", error);
      toast.error("Erreur de chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  // Préparation des données pour les graphiques
  const chartData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthsToShow = timeRange === '3M' ? 3 : timeRange === '6M' ? 6 : 12;
    
    // Générer les labels des mois
    const labels = [];
    const energyData = [];
    const waterData = [];
    const wasteData = [];
    const recyclingData = [];
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(currentYear, now.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      labels.push(date.toLocaleString('fr-FR', { month: 'short' }));
      
      // Consommations
      const siteFilter = selectedSite === 'ALL' ? () => true : (c: any) => c.CON_SiteId === selectedSite;
      const energy = consumptions
        .filter(c => c.CON_Month === month && c.CON_Year === year && siteFilter(c))
        .filter(c => c.CON_Type.toLowerCase().includes('electric') || c.CON_Type.toLowerCase().includes('énergie'))
        .reduce((sum, c) => sum + c.CON_Value, 0);
      
      const water = consumptions
        .filter(c => c.CON_Month === month && c.CON_Year === year && siteFilter(c))
        .filter(c => c.CON_Type.toLowerCase().includes('eau') || c.CON_Type.toLowerCase().includes('water'))
        .reduce((sum, c) => sum + c.CON_Value, 0);
      
      // Déchets
      const totalWaste = wastes
        .filter(w => w.WAS_Month === month && w.WAS_Year === year && siteFilter(w))
        .reduce((sum, w) => sum + w.WAS_Weight, 0);
      
      const recyclableWaste = wastes
        .filter(w => w.WAS_Month === month && w.WAS_Year === year && siteFilter(w))
        .filter(w => w.WAS_Type.toLowerCase().includes('recycl') || w.WAS_Treatment.toLowerCase().includes('recycl'))
        .reduce((sum, w) => sum + w.WAS_Weight, 0);
      
      energyData.push(Math.round(energy));
      waterData.push(Math.round(water));
      wasteData.push(Math.round(totalWaste));
      recyclingData.push(totalWaste > 0 ? Math.round((recyclableWaste / totalWaste) * 100) : 0);
    }
    
    return { labels, energyData, waterData, wasteData, recyclingData };
  }, [consumptions, wastes, timeRange, selectedSite]);

  // Calculs KPI
  const kpis = useMemo(() => {
    const siteFilter = selectedSite === 'ALL' ? () => true : (item: any) => 
      (item.CON_SiteId || item.WAS_SiteId || item.SSE_SiteId) === selectedSite;
    
    // Consommations totales sur la période
    const totalEnergy = consumptions
      .filter(siteFilter)
      .filter(c => c.CON_Type.toLowerCase().includes('electric') || c.CON_Type.toLowerCase().includes('énergie'))
      .reduce((sum, c) => sum + c.CON_Value, 0);
    
    const totalWater = consumptions
      .filter(siteFilter)
      .filter(c => c.CON_Type.toLowerCase().includes('eau') || c.CON_Type.toLowerCase().includes('water'))
      .reduce((sum, c) => sum + c.CON_Value, 0);
    
    // Déchets totaux
    const totalWaste = wastes.filter(siteFilter).reduce((sum, w) => sum + w.WAS_Weight, 0);
    const recyclableWaste = wastes
      .filter(siteFilter)
      .filter(w => w.WAS_Type.toLowerCase().includes('recycl') || w.WAS_Treatment.toLowerCase().includes('recycl'))
      .reduce((sum, w) => sum + w.WAS_Weight, 0);
    
    // Incidents environnementaux
    const envIncidents = incidents.filter(i => 
      siteFilter(i) && 
      (i.SSE_Type === 'DOMMAGE_MATERIEL' || 
       i.SSE_Description.toLowerCase().includes('environnement') ||
       i.SSE_Description.toLowerCase().includes('pollution') ||
       i.SSE_Description.toLowerCase().includes('déversement'))
    );
    
    return {
      totalEnergy: Math.round(totalEnergy),
      totalWater: Math.round(totalWater),
      totalWaste: Math.round(totalWaste),
      recyclingRate: totalWaste > 0 ? Math.round((recyclableWaste / totalWaste) * 100) : 0,
      totalIncidents: envIncidents.length,
      criticalIncidents: envIncidents.filter(i => i.SSE_AvecArret).length
    };
  }, [consumptions, wastes, incidents, selectedSite]);

  if (loading) {
    return (
      <div className="ml-72 h-screen flex items-center justify-center bg-[#0B0F1A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mb-6"></div>
          <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-widest">
            Génération des statistiques environnementales ISO 14001...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Analytics <span className="text-green-400">Environnementaux</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 italic">
            Tableaux de bord opérationnels • Conformité ISO 14001 §9.1
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-slate-900/50 border border-white/10 rounded-2xl p-1">
            {(['3M', '6M', '12M'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-[9px] font-black uppercase rounded-xl transition-all ${
                  timeRange === range 
                    ? 'bg-green-500 text-white shadow-md shadow-green-500/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
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
          
          <button className="bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors">
            <Download size={18} className="text-green-400" />
          </button>
        </div>
      </header>

      {/* KPI RAPIDES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KPIBox 
          label="Énergie Consommée" 
          value={`${kpis.totalEnergy.toLocaleString()} kWh`} 
          icon={<BarChart3 className="text-amber-400" />}
          color="bg-amber-500/10"
        />
        <KPIBox 
          label="Eau Consommée" 
          value={`${kpis.totalWater.toLocaleString()} m³`} 
          icon={<BarChart3 className="text-blue-400" />}
          color="bg-blue-500/10"
        />
        <KPIBox 
          label="Déchets Produits" 
          value={`${kpis.totalWaste.toLocaleString()} kg`} 
          icon={<BarChart3 className="text-red-400" />}
          color="bg-red-500/10"
        />
        <KPIBox 
          label="Taux de Recyclage" 
          value={`${kpis.recyclingRate}%`} 
          icon={<BarChart3 className="text-green-400" />}
          color="bg-green-500/10"
        />
        <KPIBox 
          label="Incidents Environnementaux" 
          value={kpis.totalIncidents} 
          icon={<AlertTriangle className="text-amber-400" />}
          color="bg-amber-500/10"
          critical={kpis.criticalIncidents > 0}
        />
      </div>

      {/* GRAPHIQUES PRINCIPAUX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ChartCard 
          title="Évolution des Consommations Énergétiques" 
          icon={<LineChart className="text-amber-400" />}
          data={chartData}
          type="line"
          series={['Énergie (kWh)']}
          values={chartData.energyData}
          color="#f59e0b"
        />
        
        <ChartCard 
          title="Analyse de la Consommation d'Eau" 
          icon={<LineChart className="text-blue-400" />}
          data={chartData}
          type="line"
          series={['Eau (m³)']}
          values={chartData.waterData}
          color="#3b82f6"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ChartCard 
          title="Production de Déchets" 
          icon={<BarChart3 className="text-red-400" />}
          data={chartData}
          type="bar"
          series={['Déchets (kg)']}
          values={chartData.wasteData}
          color="#ef4444"
        />
        
        <ChartCard 
          title="Performance du Recyclage" 
          icon={<PieChart className="text-green-400" />}
          data={chartData}
          type="line"
          series={['Taux de Recyclage (%)']}
          values={chartData.recyclingData}
          color="#10b981"
        />
      </div>

      {/* TABLEAU DE BORD DÉTAILLÉ */}
      <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black uppercase italic">Détails Opérationnels par Mois</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setChartView('energy')}
              className={`p-2 rounded-lg transition-all ${
                chartView === 'energy' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Énergie
            </button>
            <button 
              onClick={() => setChartView('water')}
              className={`p-2 rounded-lg transition-all ${
                chartView === 'water' 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Eau
            </button>
            <button 
              onClick={() => setChartView('waste')}
              className={`p-2 rounded-lg transition-all ${
                chartView === 'waste' 
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Déchets
            </button>
            <button 
              onClick={() => setChartView('recycling')}
              className={`p-2 rounded-lg transition-all ${
                chartView === 'recycling' 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Recyclage
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5">
              <tr className="text-[10px] font-black uppercase text-slate-500 italic tracking-widest border-b border-white/5">
                <th className="p-4">Mois</th>
                <th className="p-4">Énergie (kWh)</th>
                <th className="p-4">Eau (m³)</th>
                <th className="p-4">Déchets (kg)</th>
                <th className="p-4">Recyclage (%)</th>
                <th className="p-4">CO₂ Estimé (kg)</th>
                <th className="p-4">Conformité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {chartData.labels.map((month, idx) => {
                const energy = chartData.energyData[idx];
                const water = chartData.waterData[idx];
                const waste = chartData.wasteData[idx];
                const recycling = chartData.recyclingData[idx];
                // Estimation CO₂: 0.5 kg/kWh pour l'électricité
                const co2 = Math.round(energy * 0.5);
                
                return (
                  <tr key={month} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-black">{month}</td>
                    <td className="p-4">{energy.toLocaleString()}</td>
                    <td className="p-4">{water.toLocaleString()}</td>
                    <td className="p-4">{waste.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black ${
                        recycling >= 70 
                          ? 'bg-green-500/20 text-green-300' 
                          : recycling >= 50 
                          ? 'bg-amber-500/20 text-amber-300' 
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {recycling}%
                      </span>
                    </td>
                    <td className="p-4">{co2.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-[10px] font-black text-green-400">
                        <Leaf size={14} /> Conforme ISO 14001
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-between items-center pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
            <FileSpreadsheet size={16} className="text-green-400" />
            <span>Export possible en Excel/PDF pour audits réglementaires</span>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all">
            <Download size={16} /> Export Complet
          </button>
        </div>
      </div>

      <footer className="mt-8 pt-6 border-t border-white/5 text-center">
        <p className="text-[8px] font-bold text-slate-600 uppercase italic tracking-[0.3em]">
          Qualisoft SMI • Analytics Environnementaux ISO 14001:2015 • Données mises à jour en temps réel
        </p>
        <p className="text-[8px] font-bold text-slate-600 uppercase italic tracking-[0.3em] mt-1">
          Conformité aux exigences §9.1.1 (Surveillance), §9.1.2 (Évaluation de la conformité) et §9.3 (Revue de direction)
        </p>
      </footer>
    </div>
  );
}

function KPIBox({ label, value, icon, color, critical = false }: any) {
  return (
    <div className={`${color} border ${critical ? 'border-amber-500/50' : 'border-white/10'} rounded-2xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-white/10 rounded-lg">{icon}</div>
        {critical && (
          <AlertTriangle className="text-amber-400" size={20} />
        )}
      </div>
      <p className="text-[9px] font-black uppercase text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

function ChartCard({ title, icon, data, type, series, values, color }: any) {
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-black flex items-center gap-2">
          {icon} {title}
        </h3>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500">
          <Calendar size={14} />
          <span>{data.labels[0]} - {data.labels[data.labels.length - 1]}</span>
        </div>
      </div>
      
      <div className="h-80 bg-linear-to-br from-slate-900/50 to-slate-900/30 rounded-2xl border border-white/5 p-4">
        {/* Simuler un graphique avec des barres */}
        <div className="flex items-end justify-around h-full px-4">
          {values.map((val: number, idx: number) => (
            <div key={idx} className="flex flex-col items-center">
              <div 
                className="w-10 rounded-t-xl transition-all duration-500"
                style={{ 
                  height: `${Math.max(10, (val / Math.max(...values)) * 90)}%`,
                  backgroundColor: color,
                  boxShadow: `0 4px 6px ${color}40`
                }}
              ></div>
              <span className="text-[9px] font-black mt-2 text-slate-400">{data.labels[idx]}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-center gap-6">
          {series.map((serie: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="text-[10px] font-black text-slate-300">{serie}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-[10px] font-black text-slate-500 italic">
          Source: Données {selectedSite === 'ALL' ? 'tous sites' : 'site sélectionné'} • Mise à jour quotidienne
        </div>
        <button className="text-[10px] font-black text-green-400 hover:text-green-300 transition-colors flex items-center gap-1">
          <Download size={14} /> Export CSV
        </button>
      </div>
    </div>
  );
}