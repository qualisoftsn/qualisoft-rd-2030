/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 MODULE : ANALYTICS ENVIRONNEMENTAUX SDE (elite-sde)
 * -------------------------------------------------------------------------
 * FIX : Résolution de l'erreur "Property does not exist on type never"
 * DATE : 05 Mars 2026 | 11:05 GMT
 */

'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Download, Leaf, Target, FileSpreadsheet,
  Activity, Loader2, PieChart, Filter, Zap, Droplets
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- IMPORTATION DES COMPOSANTS LOCAUX ---
import ConsumptionChart from '../components/ConsumptionChart';
import WasteBreakdown from '../components/WasteBreakdown';
import EnvironmentalAlerts from '../components/EnvironmentalAlerts';
import EnvironmentalStats from '../components/EnvironmentalStats';
import EnvironmentalKPICard from '../components/EnvironmentalKPICard';

// --- DÉFINITION DES TYPES (Pour corriger l'erreur 'never') ---
interface Consumption {
  CON_Id: string;
  CON_Value: number;
  CON_Type: string;
  CON_SiteId: string;
  CON_Month: number;
  CON_Year: number;
}

interface Waste {
  WAS_Id: string;
  WAS_Weight: number;
  WAS_Type: string;
  WAS_SiteId: string;
  WAS_Treatment: string;
}

interface SSEIncident {
  SSE_Id: string;
  SSE_SiteId: string;
  SSE_AvecArret: boolean;
  SSE_Description: string;
}

export default function EnvironmentAnalyticsPage() {
  // Initialisation avec les types corrects au lieu de 'never[]'
  const [data, setData] = useState<{
    consumptions: Consumption[];
    wastes: Waste[];
    incidents: SSEIncident[];
    sites: any[];
  }>({ 
    consumptions: [], 
    wastes: [], 
    incidents: [], 
    sites: [] 
  });

  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState('ALL');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [consRes, wastesRes, incidentsRes, sitesRes] = await Promise.all([
        apiClient.get('/consumptions'),
        apiClient.get('/wastes'),
        apiClient.get('/sse'),
        apiClient.get('/sites')
      ]);
      
      setData({
        consumptions: consRes.data?.data || consRes.data || [],
        wastes: wastesRes.data?.data || wastesRes.data || [],
        incidents: incidentsRes.data?.data || incidentsRes.data || [],
        sites: sitesRes.data?.data || sitesRes.data || []
      });
    } catch (err) {
      toast.error("RUPTURE DE FLUX : NOYAU MASTER ANALYTICS.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- LOGIQUE DE CALCUL (Désormais typée et sécurisée) ---
  const statsCalculated = useMemo(() => {
    const siteFilter = (item: any) => selectedSite === 'ALL' || (item.CON_SiteId || item.WAS_SiteId || item.SSE_SiteId) === selectedSite;
    
    // Filtrage des données
    const filteredCons = data.consumptions.filter(siteFilter);
    const filteredWst = data.wastes.filter(siteFilter);

    // Calcul Énergie (La propriété CON_Type est maintenant reconnue)
    const energy = filteredCons
      .filter(c => (c.CON_Type?.toLowerCase() || '').includes('elect') || (c.CON_Type?.toLowerCase() || '').includes('éner'))
      .reduce((s, c) => s + (Number(c.CON_Value) || 0), 0);

    // Calcul Eau
    const water = filteredCons
      .filter(c => (c.CON_Type?.toLowerCase() || '').includes('eau') || (c.CON_Type?.toLowerCase() || '').includes('water'))
      .reduce((s, c) => s + (Number(c.CON_Value) || 0), 0);

    // Calcul Déchets
    const totalW = filteredWst.reduce((s, w) => s + (Number(w.WAS_Weight) || 0), 0);
    const recW = filteredWst
      .filter(w => (w.WAS_Type?.toLowerCase() || '').includes('recycl'))
      .reduce((s, w) => s + (Number(w.WAS_Weight) || 0), 0);

    const hazardousW = filteredWst
      .filter(w => (w.WAS_Type?.toLowerCase() || '').includes('dangereux'))
      .reduce((s, w) => s + (Number(w.WAS_Weight) || 0), 0);

    return {
      energyConsumption: Math.round(energy),
      waterConsumption: Math.round(water),
      totalWaste: Math.round(totalW),
      recyclingRate: totalW > 0 ? Math.round((recW / totalW) * 100) : 0,
      hazardousWaste: Math.round(hazardousW),
      carbonFootprint: Math.round(energy * 0.44),
      criticalIncidents: data.incidents.filter(i => siteFilter(i) && i.SSE_AvecArret).length,
      energyTrend: "-4.2%",
      waterTrend: "+1.5%",
      recyclingTrend: "+8.0%",
      wasteTrend: "-2.1%"
    };
  }, [data, selectedSite]);

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <Loader2 className="animate-spin text-emerald-500" size={64} strokeWidth={1} />
      <span className="text-[10px] font-black uppercase tracking-[1em] text-emerald-500 animate-pulse italic text-center px-6">
        Analyse de Conformité SDE...
      </span>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-emerald-500/30">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="shrink-0 p-6 md:px-10 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-full italic">SMI §9.3 ISO 14001</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic m-0 leading-none text-white">
            Intelligence <span className="text-emerald-500">Durable</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <select value={selectedSite} onChange={e => setSelectedSite(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-[10px] font-black uppercase italic text-white cursor-pointer outline-none">
            <option value="ALL">Périmètre Global</option>
            {data.sites.map((s:any) => <option key={s.S_Id} value={s.S_Id}>{s.S_Name.toUpperCase()}</option>)}
          </select>
          <button className="p-3 bg-emerald-600 rounded-xl text-white hover:bg-white hover:text-emerald-600 transition-all border-none cursor-pointer"><Download size={20}/></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-12">
        {/* Intégration de vos composants */}
        <EnvironmentalAlerts 
          criticalIncidents={statsCalculated.criticalIncidents} 
          hazardousWaste={statsCalculated.hazardousWaste}
          energyOverTarget={statsCalculated.energyConsumption > 15000}
          recyclingBelowTarget={statsCalculated.recyclingRate < 75}
        />

        <EnvironmentalStats stats={statsCalculated} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          <div className="bg-[#151B2B] border-2 border-white/5 p-8 rounded-[3.5rem] shadow-4xl h-112.5 flex flex-col">
            <h2 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3"><Zap className="text-amber-500" /> Flux Énergie</h2>
            <div className="flex-1"><ConsumptionChart consumptions={data.consumptions} period="QUARTER" siteId={selectedSite} /></div>
          </div>

          <div className="bg-[#151B2B] border-2 border-white/5 p-8 rounded-[3.5rem] shadow-4xl h-112.5 flex flex-col">
            <h2 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3"><PieChart className="text-emerald-500" /> Matrice Déchets</h2>
            <div className="flex-1"><WasteBreakdown wastes={data.wastes} siteId={selectedSite} /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <EnvironmentalKPICard title="Empreinte Carbone" value={`${statsCalculated.carbonFootprint} kg`} trend={statsCalculated.energyTrend} icon={Leaf} color="from-emerald-900/40 to-emerald-950/40" isoRef="§6.1.2" />
           <EnvironmentalKPICard title="Valorisation" value={`${statsCalculated.recyclingRate}%`} trend={statsCalculated.recyclingTrend} icon={Target} color="from-blue-900/40 to-blue-950/40" isoRef="§9.1" progress={statsCalculated.recyclingRate} />
           <EnvironmentalKPICard title="Incidents SSE" value={statsCalculated.criticalIncidents} trend="0%" icon={Activity} color="from-rose-900/40 to-rose-950/40" alert={statsCalculated.criticalIncidents > 0} />
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius: 10px; }
      ` }} />
    </div>
  );
}