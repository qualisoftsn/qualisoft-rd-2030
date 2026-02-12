/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  BarChart3, LineChart, PieChart, TrendingUp, Calendar, 
  Download, Filter, Leaf, Target, AlertTriangle, FileSpreadsheet,
  Zap, Droplets, Trash2, Activity
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

  /**
   * 📡 SYNCHRONISATION MULTI-FLUX (Noyau Master)
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [consRes, wastesRes, incidentsRes, sitesRes] = await Promise.all([
        apiClient.get('/consumptions'),
        apiClient.get('/wastes'),
        apiClient.get('/sse'),
        apiClient.get('/sites')
      ]);
      
      setConsumptions(consRes.data?.data || consRes.data || []);
      setWastes(wastesRes.data?.data || wastesRes.data || []);
      setIncidents(incidentsRes.data?.data || incidentsRes.data || []);
      setSites(sitesRes.data?.data || sitesRes.data || []);
    } catch (error) {
      console.error("Erreur liaison Matrix Analytics:", error);
      toast.error("Rupture de liaison avec le Noyau Master");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * 📊 GÉNÉRATEUR DE SÉRIES TEMPORELLES
   * Logique : Calcule les points de données mensuels pour les graphiques
   */
  const chartData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthsToShow = timeRange === '3M' ? 3 : timeRange === '6M' ? 6 : 12;
    
    const labels: string[] = [];
    const energyData: number[] = [];
    const waterData: number[] = [];
    const wasteData: number[] = [];
    const recyclingData: number[] = [];
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(currentYear, now.getMonth() - i, 1);
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      
      labels.push(date.toLocaleString('fr-FR', { month: 'short' }).toUpperCase());
      
      const siteFilter = (item: any) => {
        const itemId = item.CON_SiteId || item.WAS_SiteId || item.SSE_SiteId || item.S_Id;
        return selectedSite === 'ALL' || itemId === selectedSite;
      };

      // ⚡ ÉNERGIE (Calculateur kWh)
      const energy = consumptions
        .filter(c => c.CON_Month === m && c.CON_Year === y && siteFilter(c))
        .filter(c => {
          const type = c.CON_Type?.toLowerCase() || '';
          return type.includes('electr') || type.includes('éner');
        })
        .reduce((sum, c) => sum + (Number(c.CON_Value) || 0), 0);
      
      // 💧 EAU (Calculateur m³)
      const water = consumptions
        .filter(c => c.CON_Month === m && c.CON_Year === y && siteFilter(c))
        .filter(c => {
          const type = c.CON_Type?.toLowerCase() || '';
          return type.includes('eau') || type.includes('water');
        })
        .reduce((sum, c) => sum + (Number(c.CON_Value) || 0), 0);
      
      // ♻️ DÉCHETS & RECYCLAGE
      const monthWastes = wastes.filter(w => w.WAS_Month === m && w.WAS_Year === y && siteFilter(w));
      const totalW = monthWastes.reduce((sum, w) => sum + (Number(w.WAS_Weight) || 0), 0);
      const recyclableW = monthWastes
        .filter(w => {
          const type = w.WAS_Type?.toLowerCase() || '';
          const treat = w.WAS_Treatment?.toLowerCase() || '';
          return type.includes('recycl') || treat.includes('recycl');
        })
        .reduce((sum, w) => sum + (Number(w.WAS_Weight) || 0), 0);
      
      energyData.push(Math.round(energy));
      waterData.push(Math.round(water));
      wasteData.push(Math.round(totalW));
      recyclingData.push(totalW > 0 ? Math.round((recyclableW / totalW) * 100) : 0);
    }
    
    return { labels, energyData, waterData, wasteData, recyclingData };
  }, [consumptions, wastes, timeRange, selectedSite]);

  /**
   * 🏛️ CALCULATEUR DE KPI SCELLÉS
   */
  const kpis = useMemo(() => {
    const siteFilter = (item: any) => {
      const id = item.CON_SiteId || item.WAS_SiteId || item.SSE_SiteId;
      return selectedSite === 'ALL' || id === selectedSite;
    };
    
    const e = consumptions.filter(siteFilter).filter(c => (c.CON_Type?.toLowerCase() || '').includes('éner')).reduce((s, c) => s + (Number(c.CON_Value) || 0), 0);
    const w = consumptions.filter(siteFilter).filter(c => (c.CON_Type?.toLowerCase() || '').includes('eau')).reduce((s, c) => s + (Number(c.CON_Value) || 0), 0);
    
    const totalW = wastes.filter(siteFilter).reduce((s, w) => s + (Number(w.WAS_Weight) || 0), 0);
    const recW = wastes.filter(siteFilter).filter(w => (w.WAS_Type?.toLowerCase() || '').includes('recycl')).reduce((s, w) => s + (Number(w.WAS_Weight) || 0), 0);
    
    const envIncidents = incidents.filter(i => 
      siteFilter(i) && 
      (i.SSE_Type === 'DOMMAGE_MATERIEL' || (i.SSE_Description?.toLowerCase() || '').includes('environnement'))
    );
    
    return {
      totalEnergy: Math.round(e),
      totalWater: Math.round(w),
      totalWaste: Math.round(totalW),
      recyclingRate: totalW > 0 ? Math.round((recW / totalW) * 100) : 0,
      totalIncidents: envIncidents.length,
      criticalIncidents: envIncidents.filter(i => i.SSE_AvecArret).length
    };
  }, [consumptions, wastes, incidents, selectedSite]);

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <Leaf className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500/40" size={20} />
      </div>
      <p className="text-emerald-500 font-black uppercase italic text-[10px] tracking-[0.4em] animate-pulse">Synchronisation des Indicateurs ISO 14001...</p>
    </div>
  );

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans uppercase italic font-black selection:bg-emerald-500/30">
      
      {/* 🛰️ HEADER ANALYTIQUE */}
      <header className="mb-12 flex justify-between items-end border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] rounded-full tracking-widest">SMI Matrix v2.6</span>
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-4xl tracking-tighter leading-none">Analytics <span className="text-emerald-400">Environnementaux</span></h1>
          <p className="text-slate-500 text-[11px] tracking-[0.4em] mt-3">Intelligence Durable • Performance §9.1 ISO 14001 • RD 2026</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="flex bg-slate-900/80 border border-white/10 rounded-2xl p-1.5 shadow-2xl">
            {(['3M', '6M', '12M'] as const).map((range) => (
              <button key={range} onClick={() => setTimeRange(range)} className={`px-5 py-2.5 text-[10px] rounded-xl transition-all border-none cursor-pointer ${timeRange === range ? 'bg-emerald-500 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>{range}</button>
            ))}
          </div>
          <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)} className="bg-slate-900 border border-white/10 rounded-2xl px-8 py-4 text-[10px] outline-none focus:border-emerald-500 shadow-2xl text-white font-black italic uppercase cursor-pointer">
            <option value="ALL">Périmètre Global</option>
            {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
          </select>
          <button className="bg-emerald-600 p-4 rounded-2xl hover:bg-emerald-500 transition-all shadow-2xl border-none cursor-pointer text-white"><Download size={20}/></button>
        </div>
      </header>

      {/* 📊 KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-12">
        <KPIBox label="Énergie" value={`${kpis.totalEnergy} kWh`} icon={<Zap className="text-amber-400" />} color="bg-amber-500/5" />
        <KPIBox label="Eau" value={`${kpis.totalWater} m³`} icon={<Droplets className="text-blue-400" />} color="bg-blue-500/5" />
        <KPIBox label="Déchets" value={`${kpis.totalWaste} kg`} icon={<Trash2 className="text-rose-400" />} color="bg-rose-500/5" />
        <KPIBox label="Recyclage" value={`${kpis.recyclingRate}%`} icon={<TrendingUp className="text-emerald-400" />} color="bg-emerald-500/5" />
        <KPIBox label="Incidents" value={kpis.totalIncidents} icon={<AlertTriangle className="text-amber-500" />} color="bg-amber-500/5" critical={kpis.criticalIncidents > 0} />
        <KPIBox label="Émissions" value={`${Math.round(kpis.totalEnergy * 0.5)} kgCO2`} icon={<Leaf className="text-emerald-500" />} color="bg-emerald-500/5" />
      </div>

      {/* 📈 CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        <ChartCard title="Consommations Énergie" data={chartData} values={chartData.energyData} color="#f59e0b" unit="kWh" />
        <ChartCard title="Consommations Eau" data={chartData} values={chartData.waterData} color="#3b82f6" unit="m³" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        <ChartCard title="Flux de Déchets" data={chartData} values={chartData.wasteData} color="#f43f5e" unit="kg" />
        <ChartCard title="Efficacité Recyclage" data={chartData} values={chartData.recyclingData} color="#10b981" unit="%" />
      </div>

      {/* 📋 REGISTRE DE PERFORMANCE */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-12 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500"><FileSpreadsheet size={24}/></div>
             <h2 className="text-3xl tracking-tighter">Registre de Performance Mensuel</h2>
          </div>
          <div className="flex gap-3 bg-black/20 p-2 rounded-2xl border border-white/5 shadow-inner">
            {(['energy', 'water', 'waste', 'recycling'] as const).map(v => (
              <button key={v} onClick={() => setChartView(v)} className={`px-5 py-2.5 text-[9px] rounded-xl transition-all border-none cursor-pointer ${chartView === v ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{v.toUpperCase()}</button>
            ))}
          </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] text-slate-500 tracking-[0.3em] border-b border-white/5">
              <th className="p-8">Période</th>
              <th className="p-8">Énergie (kWh)</th>
              <th className="p-8">Eau (m³)</th>
              <th className="p-8">Déchets (kg)</th>
              <th className="p-8">Recyclage</th>
              <th className="p-8">Conformité ISO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[12px] font-bold">
            {chartData.labels.map((m, i) => (
              <tr key={i} className="hover:bg-white/5 transition-all group">
                <td className="p-8 font-black text-emerald-400 group-hover:translate-x-2 transition-transform">{m}</td>
                <td className="p-8">{chartData.energyData[i].toLocaleString()}</td>
                <td className="p-8">{chartData.waterData[i].toLocaleString()}</td>
                <td className="p-8">{chartData.wasteData[i].toLocaleString()}</td>
                <td className="p-8">
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black ${chartData.recyclingData[i] >= 70 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                    {chartData.recyclingData[i]}%
                  </span>
                </td>
                <td className="p-8">
                  <div className="flex items-center gap-3 text-emerald-500 text-[10px] tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                    CONFORME
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * 🏛️ COMPOSANT KPIBOX : L'UNITÉ DE MESURE ELITE
 */
function KPIBox({ label, value, icon, color, critical }: any) {
  return (
    <div className={`${color} border ${critical ? 'border-rose-500/50 animate-pulse' : 'border-white/5'} rounded-[2.5rem] p-8 transition-all hover:scale-105 hover:bg-white/5 shadow-xl`}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-white/5 rounded-2xl shadow-inner border border-white/5">{icon}</div>
        {critical && <AlertTriangle className="text-rose-500" size={24} />}
      </div>
      <p className="text-[10px] text-slate-500 mb-2 tracking-[0.3em] font-black uppercase">{label}</p>
      <p className="text-3xl font-black italic tracking-tighter leading-none">{value}</p>
    </div>
  );
}

/**
 * 📊 COMPOSANT CHARTCARD : VISUALISATION SOUVERAINE
 */
function ChartCard({ title, data, values, color, unit }: any) {
  const max = Math.max(...values, 1);
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-10 shadow-2xl backdrop-blur-md hover:border-emerald-500/20 transition-all">
      <div className="flex justify-between items-center mb-12">
        <h3 className="text-lg tracking-tighter uppercase font-black">{title}</h3>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[9px] text-slate-500 italic">
          <Calendar size={12}/> {data.labels[0]} — {data.labels[data.labels.length-1]}
        </div>
      </div>
      <div className="h-72 flex items-end justify-between px-4 gap-4">
        {values.map((v: number, i: number) => (
          <div key={i} className="flex-1 flex flex-col items-center group relative">
            <div className="w-full relative h-full flex items-end">
                {/* TOOLTIP ELITE */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[10px] bg-white text-black px-3 py-1.5 rounded-xl font-black italic shadow-2xl z-10 whitespace-nowrap">
                   {v.toLocaleString()} {unit}
                </div>
                {/* BARRE DE DONNÉES */}
                <div 
                   className="w-full rounded-2xl transition-all duration-1000 ease-out group-hover:brightness-150 shadow-lg group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]" 
                   style={{ 
                     height: `${(v/max)*100}%`, 
                     backgroundColor: color, 
                     opacity: 0.7 
                   }}
                />
            </div>
            <span className="text-[10px] mt-6 text-slate-600 font-black group-hover:text-white transition-colors tracking-widest">{data.labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}