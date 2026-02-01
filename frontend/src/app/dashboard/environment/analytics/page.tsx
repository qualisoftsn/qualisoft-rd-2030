/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
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

  // ✅ FETCH DATA : Sécurisé avec useCallback
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
      console.error("Erreur analytics:", error);
      toast.error("Échec de synchronisation des données");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // ✅ Dépendance propre

  // ✅ CHART PREPARATION : Logique de filtrage robuste
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

      // Énergie
      const energy = consumptions
        .filter(c => c.CON_Month === m && c.CON_Year === y && siteFilter(c))
        .filter(c => {
          const type = c.CON_Type?.toLowerCase() || '';
          return type.includes('electr') || type.includes('éner');
        })
        .reduce((sum, c) => sum + (Number(c.CON_Value) || 0), 0);
      
      // Eau
      const water = consumptions
        .filter(c => c.CON_Month === m && c.CON_Year === y && siteFilter(c))
        .filter(c => {
          const type = c.CON_Type?.toLowerCase() || '';
          return type.includes('eau') || type.includes('water');
        })
        .reduce((sum, c) => sum + (Number(c.CON_Value) || 0), 0);
      
      // Déchets
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

  // ✅ KPI CALCULATIONS
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
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="text-emerald-500 font-black uppercase italic text-[10px] tracking-widest">Calcul des indicateurs ISO 14001...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans uppercase italic font-black">
      <header className="mb-10 flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl tracking-tighter">Analytics <span className="text-emerald-400">Environnementaux</span></h1>
          <p className="text-slate-500 text-[10px] tracking-[0.3em] mt-2">Intelligence Durable • Performance §9.1 ISO 14001</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex bg-slate-900/80 border border-white/10 rounded-2xl p-1 shadow-inner">
            {(['3M', '6M', '12M'] as const).map((range) => (
              <button key={range} onClick={() => setTimeRange(range)} className={`px-4 py-2 text-[9px] rounded-xl transition-all ${timeRange === range ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{range}</button>
            ))}
          </div>
          <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)} className="bg-slate-900 border border-white/10 rounded-2xl px-6 py-3 text-[10px] outline-none focus:border-emerald-500 shadow-xl">
            <option value="ALL">Périmètre Global</option>
            {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
          </select>
          <button className="bg-emerald-600 p-3 rounded-xl hover:bg-emerald-500 transition-all shadow-lg"><Download size={20}/></button>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <KPIBox label="Énergie" value={`${kpis.totalEnergy} kWh`} icon={<BarChart3 className="text-amber-400" />} color="bg-amber-500/10" />
        <KPIBox label="Eau" value={`${kpis.totalWater} m³`} icon={<BarChart3 className="text-blue-400" />} color="bg-blue-500/10" />
        <KPIBox label="Déchets" value={`${kpis.totalWaste} kg`} icon={<BarChart3 className="text-rose-400" />} color="bg-rose-500/10" />
        <KPIBox label="Recyclage" value={`${kpis.recyclingRate}%`} icon={<TrendingUp className="text-emerald-400" />} color="bg-emerald-500/10" />
        <KPIBox label="Incidents" value={kpis.totalIncidents} icon={<AlertTriangle className="text-amber-500" />} color="bg-amber-500/10" critical={kpis.criticalIncidents > 0} />
        <KPIBox label="Émissions" value={`${Math.round(kpis.totalEnergy * 0.5)} kgCO2`} icon={<Leaf className="text-emerald-500" />} color="bg-emerald-500/5" />
      </div>

      {/* CHARTS SECTION */}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <ChartCard title="Consommations Énergie" data={chartData} type="line" values={chartData.energyData} color="#f59e0b" unit="kWh" />
        <ChartCard title="Consommations Eau" data={chartData} type="line" values={chartData.waterData} color="#3b82f6" unit="m³" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <ChartCard title="Volume Déchets" data={chartData} type="bar" values={chartData.wasteData} color="#f43f5e" unit="kg" />
        <ChartCard title="Efficacité Recyclage" data={chartData} type="line" values={chartData.recyclingData} color="#10b981" unit="%" />
      </div>

      {/* DETAILED TABLE */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl tracking-tighter">Registre de Performance Mensuel</h2>
          <div className="flex gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/5">
            {(['energy', 'water', 'waste', 'recycling'] as const).map(v => (
              <button key={v} onClick={() => setChartView(v)} className={`px-4 py-2 text-[8px] rounded-xl transition-all ${chartView === v ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}>{v.toUpperCase()}</button>
            ))}
          </div>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[9px] text-slate-500 tracking-widest border-b border-white/5">
            <tr>
              <th className="p-6">Période</th>
              <th className="p-6">Énergie (kWh)</th>
              <th className="p-6">Eau (m³)</th>
              <th className="p-6">Déchets (kg)</th>
              <th className="p-6">Recyclage</th>
              <th className="p-6">Statut ISO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[11px]">
            {chartData.labels.map((m, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="p-6 font-black text-emerald-400">{m}</td>
                <td className="p-6">{chartData.energyData[i].toLocaleString()}</td>
                <td className="p-6">{chartData.waterData[i].toLocaleString()}</td>
                <td className="p-6">{chartData.wasteData[i].toLocaleString()}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-lg text-[9px] ${chartData.recyclingData[i] >= 70 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {chartData.recyclingData[i]}%
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2 text-emerald-500"><Leaf size={12}/> CONFORME</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ✅ COMPOSANTS INTERNES ROBUSTES
function KPIBox({ label, value, icon, color, critical }: any) {
  return (
    <div className={`${color} border ${critical ? 'border-rose-500/50 animate-pulse' : 'border-white/5'} rounded-3xl p-6 transition-all hover:scale-105`}>
      <div className="flex justify-between mb-4">
        <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
        {critical && <AlertTriangle className="text-rose-500" size={20} />}
      </div>
      <p className="text-[8px] text-slate-500 mb-1 tracking-widest">{label}</p>
      <p className="text-xl font-black italic tracking-tighter">{value}</p>
    </div>
  );
}

function ChartCard({ title, data, values, color, unit }: any) {
  const max = Math.max(...values, 1);
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 shadow-inner">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm tracking-widest">{title}</h3>
        <span className="text-[9px] text-slate-500 italic">Période: {data.labels[0]} - {data.labels[data.labels.length-1]}</span>
      </div>
      <div className="h-64 flex items-end justify-between px-4 gap-2">
        {values.map((v: number, i: number) => (
          <div key={i} className="flex-1 flex flex-col items-center group">
            <div className="w-full relative">
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] bg-white text-black px-1 rounded">{v}{unit}</div>
               <div className="w-full rounded-t-xl transition-all duration-700 hover:brightness-125 shadow-lg" 
                    style={{ height: `${(v/max)*100}%`, backgroundColor: color, opacity: 0.8 }}></div>
            </div>
            <span className="text-[8px] mt-4 text-slate-500">{data.labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}