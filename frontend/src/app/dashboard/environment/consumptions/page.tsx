/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ⚡ GESTION DES CONSOMMATIONS (ELITE KERNEL)
 * Fix : Restauration des KPIs dynamiques et des filtres de recherche.
 * Focus : Exhaustivité des types de ressources dans les calculs de stats.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 02:22 GMT
 */

'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Zap, Plus, Search, Download, Calendar, 
  Droplets, TrendingUp, AlertTriangle, CheckCircle, Target, Trash2, RefreshCcw
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import ConsumptionForm from './ConsumptionForm';

export default function ConsumptionManagementPage() {
  const [consumptions, setConsumptions] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSite, setSelectedSite] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [consRes, sitesRes] = await Promise.all([
        apiClient.get('/consumptions'),
        apiClient.get('/sites')
      ]);
      setConsumptions(consRes.data?.data || consRes.data || []);
      setSites(sitesRes.data?.data || sitesRes.data || []);
    } catch (error) {
      toast.error("Erreur de synchronisation ISO 14001");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const filtered = consumptions.filter(c => 
      (selectedSite === 'ALL' || c.CON_SiteId === selectedSite) &&
      c.CON_Month === selectedMonth && c.CON_Year === selectedYear
    );
    
    const energy = filtered.filter(c => {
      const type = (c.CON_Type || '').toLowerCase();
      return type.includes('éner') || type.includes('electr') || type.includes('carbu');
    }).reduce((sum, c) => sum + (c.CON_Value || 0), 0);

    const water = filtered.filter(c => (c.CON_Type || '').toLowerCase().includes('eau')).reduce((sum, c) => sum + (c.CON_Value || 0), 0);
    const cost = filtered.reduce((sum, c) => sum + (c.CON_Cost || 0), 0);

    return {
      totalEnergy: Math.round(energy),
      totalWater: Math.round(water),
      totalCost: Math.round(cost),
      energyProgress: Math.min(100, Math.round((energy / 10000) * 100)),
      waterProgress: Math.min(100, Math.round((water / 500) * 100)),
      energyAlert: energy > 9000,
      waterAlert: water > 450
    };
  }, [consumptions, selectedSite, selectedMonth, selectedYear]);

  const handleDelete = async (id: string) => {
    if (!confirm('SCELLAGE : CONFIRMER LA SUPPRESSION DÉFINITIVE DU REGISTRE ?')) return;
    try {
      await apiClient.delete(`/consumptions/${id}`);
      toast.success('DONNÉE SUPPRIMÉE DU KERNEL');
      fetchData();
    } catch (error) { toast.error('ERREUR DE SUPPRESSION'); }
  };

  const filteredConsumptions = consumptions.filter(c => {
    const matchesSearch = (c.CON_Type + (c.CON_Site?.S_Name || '')).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = selectedSite === 'ALL' || c.CON_SiteId === selectedSite;
    const matchesPeriod = c.CON_Month === selectedMonth && c.CON_Year === selectedYear;
    return matchesSearch && matchesSite && matchesPeriod;
  });

  if (loading) return (
    <div className="ml-0 lg:ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <RefreshCcw className="animate-spin text-amber-500" size={40} />
      <p className="text-amber-500 font-black uppercase italic text-[10px] tracking-widest animate-pulse">Calcul des indices environnementaux §9.1.1...</p>
    </div>
  );

  return (
    <div className="p-6 lg:p-10 bg-[#0B0F1A] min-h-screen ml-0 lg:ml-72 text-white font-sans uppercase italic font-black selection:bg-amber-500/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="mb-12 flex flex-col xl:flex-row justify-between xl:items-end gap-8 border-b border-white/5 pb-10">
        <div className="text-left">
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0">SUIVI <span className="text-amber-400">CONSOMMATIONS</span></h1>
          <p className="text-slate-500 text-[11px] tracking-[0.4em] mt-4 uppercase italic m-0 opacity-60">Management Énergie & Ressources • ISO 14001</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-amber-600 px-10 py-5 rounded-3xl text-[11px] shadow-2xl flex items-center gap-3 hover:bg-white hover:text-amber-600 transition-all active:scale-95 border-none text-white cursor-pointer font-black italic shrink-0">
          <Plus size={20} strokeWidth={3} /> NOUVELLE SAISIE
        </button>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        <StatCard label="Énergie" value={`${stats.totalEnergy} kWh`} icon={<Zap size={24}/>} color="bg-amber-500/5" progress={stats.energyProgress} alert={stats.energyAlert} />
        <StatCard label="Eau" value={`${stats.totalWater} m³`} icon={<Droplets size={24}/>} color="bg-blue-500/5" progress={stats.waterProgress} alert={stats.waterAlert} />
        <StatCard label="Coût Total" value={`${stats.totalCost.toLocaleString()} XOF`} icon={<TrendingUp size={24}/>} color="bg-emerald-500/5" />
        <StatCard label="Objectif" value="10k kWh" icon={<Target size={24}/>} color="bg-purple-500/5" progress={stats.energyProgress} />
      </div>

      {/* FILTRES TACTIQUES */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
        <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input placeholder="RECHERCHER DANS LE REGISTRE..." className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black outline-none focus:border-amber-500 transition-all text-white italic" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <select className="bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black outline-none focus:border-amber-500 cursor-pointer text-white italic" value={selectedSite} onChange={e => setSelectedSite(e.target.value)}>
            <option value="ALL">TOUS LES SITES</option>
            {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
          </select>

          <select className="bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black outline-none focus:border-amber-500 cursor-pointer text-white italic" value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
            {Array.from({length:12}, (_,i) => <option key={i+1} value={i+1}>MOIS {i+1}</option>)}
          </select>
          
          <select className="bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black outline-none focus:border-amber-500 cursor-pointer text-white italic" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
            {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* REGISTRE TABLE */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-x-auto shadow-3xl backdrop-blur-xl">
        <table className="w-full text-left min-w-250 border-collapse">
          <thead className="bg-white/5 text-[10px] text-slate-500 tracking-[0.3em] font-black uppercase italic">
            <tr>
              <th className="p-8">PÉRIODE / SITE</th>
              <th className="p-8">TYPE RESSOURCE</th>
              <th className="p-8">QUANTITÉ MESURÉE</th>
              <th className="p-8">COÛT ASSOCIÉ</th>
              <th className="p-8 text-right">PILOTAGE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredConsumptions.length === 0 ? (
              <tr><td colSpan={5} className="p-20 text-center opacity-10 text-xl tracking-[1em]">Registre Vierge</td></tr>
            ) : (
              filteredConsumptions.map((c) => (
                <tr key={c.CON_Id} className="hover:bg-white/5 transition-all group">
                  <td className="p-8">
                    <p className="text-sm font-black italic m-0 leading-none mb-1">{c.CON_Month}/{c.CON_Year}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest m-0 leading-none">{c.CON_Site?.S_Name}</p>
                  </td>
                  <td className="p-8">
                    <span className="bg-amber-500/10 text-amber-500 px-4 py-2 rounded-full text-[10px] font-black border border-amber-500/20">{c.CON_Type}</span>
                  </td>
                  <td className="p-8">
                     <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black">{c.CON_Value.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-500">{c.CON_Unit}</span>
                     </div>
                  </td>
                  <td className="p-8 text-emerald-500">
                     <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black">{c.CON_Cost?.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-500">XOF</span>
                     </div>
                  </td>
                  <td className="p-8 text-right">
                    <button onClick={() => handleDelete(c.CON_Id)} className="p-4 bg-white/5 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 border-none cursor-pointer"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && <ConsumptionForm onClose={() => setIsFormOpen(false)} onSuccess={fetchData} sites={sites} />}
    </div>
  );
}

function StatCard({ label, value, icon, color, progress, alert }: any) {
  return (
    <div className={`${color} border ${alert ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-white/5'} rounded-[2.5rem] p-8 transition-all hover:scale-105 group`}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-black/20 rounded-2xl text-white group-hover:scale-110 transition-transform">{icon}</div>
        {progress !== undefined && (
          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden self-center border border-white/5">
            <div className={`h-full ${alert ? 'bg-red-500' : 'bg-amber-500'}`} style={{width: `${progress}%`}}></div>
          </div>
        )}
      </div>
      <p className="text-[10px] text-slate-500 mb-2 tracking-[0.2em] uppercase font-black italic m-0">{label}</p>
      <p className="text-3xl font-black italic tracking-tighter leading-none m-0">{value}</p>
    </div>
  );
}