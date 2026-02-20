/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Zap, Plus, Search, Download, Calendar, 
  Droplets, TrendingUp, AlertTriangle, CheckCircle, Target, Trash2, RefreshCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConsumptionForm from './ConsumptionForm';

/**
 * ⚡ PAGE DE GESTION DES CONSOMMATIONS
 * Pilotage des ressources énergétiques et hydriques selon l'ISO 14001.
 */
export default function ConsumptionManagementPage() {
  const [consumptions, setConsumptions] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedSite, setSelectedSite] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  /**
   * 📡 CHARGEMENT DES DONNÉES : Consommations et Sites
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [consRes, sitesRes] = await Promise.all([
        apiClient.get('/consumptions'),
        apiClient.get('/sites')
      ]);
      setConsumptions(consRes.data || []);
      setSites(sitesRes.data || []);
    } catch (error) {
      toast.error("Erreur de synchronisation ISO 14001");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * 📊 CALCUL DES STATISTIQUES TEMPS RÉEL
   * Analyse les totaux, les coûts et la progression par rapport aux objectifs.
   */
  const stats = useMemo(() => {
    const filtered = consumptions.filter(c => 
      (selectedSite === 'ALL' || c.CON_SiteId === selectedSite) &&
      c.CON_Month === selectedMonth && c.CON_Year === selectedYear
    );
    
    // Calcul de l'énergie (Électricité/Énergie)
    const energy = filtered.filter(c => (c.CON_Type || '').toLowerCase().includes('éner') || (c.CON_Type || '').toLowerCase().includes('electr')).reduce((sum, c) => sum + (c.CON_Value || 0), 0);
    // Calcul de l'eau
    const water = filtered.filter(c => (c.CON_Type || '').toLowerCase().includes('eau')).reduce((sum, c) => sum + (c.CON_Value || 0), 0);
    // Calcul des coûts financiers cumulés
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

  /**
   * 🗑️ SUPPRESSION D'UN ENREGISTREMENT
   */
  const handleDelete = async (id: string) => {
    if (!confirm('SUPPRIMER CET ENREGISTREMENT DU REGISTRE ?')) return;
    try {
      await apiClient.delete(`/consumptions/${id}`);
      toast.success('DONNÉE SUPPRIMÉE');
      fetchData();
    } catch (error) { toast.error('ERREUR DE SUPPRESSION'); }
  };

  /**
   * 🔍 LOGIQUE DE FILTRAGE DU TABLEAU
   */
  const filteredConsumptions = consumptions.filter(c => {
    const matchesSearch = (c.CON_Type + (c.CON_Site?.S_Name || '')).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || c.CON_Type === filterType;
    const matchesSite = selectedSite === 'ALL' || c.CON_SiteId === selectedSite;
    const matchesPeriod = c.CON_Month === selectedMonth && c.CON_Year === selectedYear;
    return matchesSearch && matchesType && matchesSite && matchesPeriod;
  });

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <RefreshCcw className="animate-spin text-amber-500" size={40} />
      <p className="text-amber-500 font-black uppercase italic text-[10px] tracking-widest">Calcul des indices environnementaux §9.1.1...</p>
    </div>
  );

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans uppercase italic font-black">
      <header className="mb-12 flex justify-between items-end border-b border-white/5 pb-10">
        <div className="text-left">
          <h1 className="text-5xl tracking-tighter leading-none">SUIVI <span className="text-amber-400">CONSOMMATIONS</span></h1>
          <p className="text-slate-500 text-[11px] tracking-[0.4em] mt-4 uppercase italic">Management Énergie & Ressources • ISO 14001</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-amber-600 px-10 py-5 rounded-3xl text-[11px] shadow-2xl flex items-center gap-3 hover:bg-amber-500 transition-all active:scale-95 border-none text-white cursor-pointer font-black italic">
          <Plus size={20} strokeWidth={3} /> NOUVELLE SAISIE
        </button>
      </header>

      {/* DASHBOARD SENSORS (KPIs) */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        <StatCard label="Énergie" value={`${stats.totalEnergy} kWh`} icon={<Zap size={24}/>} color="bg-amber-500/5" progress={stats.energyProgress} alert={stats.energyAlert} />
        <StatCard label="Eau" value={`${stats.totalWater} m³`} icon={<Droplets size={24}/>} color="bg-blue-500/5" progress={stats.waterProgress} alert={stats.waterAlert} />
        <StatCard label="Coût Total" value={`${stats.totalCost.toLocaleString()} XOF`} icon={<TrendingUp size={24}/>} color="bg-emerald-500/5" />
        <StatCard label="Objectif" value="10k kWh" icon={<Target size={24}/>} color="bg-purple-500/5" progress={stats.energyProgress} />
      </div>

      

      {/* FILTRES HAUTE LISIBILITÉ */}
      <div className="flex gap-6 mb-8 bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
        <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input placeholder="RECHERCHER SITES OU TYPES..." className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black outline-none focus:border-amber-500 transition-all text-white italic" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        
        <select className="bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black outline-none focus:border-amber-500 cursor-pointer text-white italic" value={selectedSite} onChange={e => setSelectedSite(e.target.value)}>
          <option value="ALL">TOUS LES SITES</option>
          {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
        </select>

        <div className="flex gap-2">
          <select className="bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-[10px] font-black outline-none focus:border-amber-500 cursor-pointer text-white italic" value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
            {Array.from({length:12}, (_,i) => <option key={i+1} value={i+1}>MOIS {i+1}</option>)}
          </select>
          <select className="bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-[10px] font-black outline-none focus:border-amber-500 cursor-pointer text-white italic" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
            {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* TABLEAU ELITE DES CONSOMMATIONS */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-hidden shadow-3xl backdrop-blur-xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] text-slate-500 tracking-[0.3em]">
            <tr>
              <th className="p-8 text-left">PÉRIODE / SITE</th>
              <th className="p-8 text-left">TYPE RESSOURCE</th>
              <th className="p-8 text-left">QUANTITÉ MESURÉE</th>
              <th className="p-8 text-left">COÛT ASSOCIÉ</th>
              <th className="p-8 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredConsumptions.map((c) => (
              <tr key={c.CON_Id} className="hover:bg-white/5 transition-all group">
                <td className="p-8">
                  <p className="text-sm font-black italic">{c.CON_Month}/{c.CON_Year}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">{c.CON_Site?.S_Name}</p>
                </td>
                <td className="p-8">
                  <span className="bg-amber-500/10 text-amber-500 px-4 py-1.5 rounded-full text-[10px] font-black border border-amber-500/20">{c.CON_Type}</span>
                </td>
                <td className="p-8 text-left">
                   <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black">{c.CON_Value.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500">{c.CON_Unit}</span>
                   </div>
                </td>
                <td className="p-8 text-left">
                   <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-500">{c.CON_Cost?.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500">XOF</span>
                   </div>
                </td>
                <td className="p-8 text-right">
                  <button onClick={() => handleDelete(c.CON_Id)} className="p-4 bg-white/5 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 border-none cursor-pointer"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormOpen && <ConsumptionForm onClose={() => setIsFormOpen(false)} onSuccess={fetchData} sites={sites} />}
    </div>
  );
}

/**
 * 📊 COMPOSANT STATCARD
 * Visualisation d'un indicateur avec barre de progression ISO.
 */
function StatCard({ label, value, icon, color, progress, alert }: any) {
  return (
    <div className={`${color} border ${alert ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-white/5'} rounded-[2.5rem] p-8 transition-transform hover:scale-105`}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-black/20 rounded-2xl text-white">{icon}</div>
        {progress !== undefined && (
          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden self-center border border-white/5">
            <div className={`h-full ${alert ? 'bg-red-500' : 'bg-amber-500'}`} style={{width: `${progress}%`}}></div>
          </div>
        )}
      </div>
      <p className="text-[10px] text-slate-500 mb-2 tracking-[0.2em] uppercase font-black italic">{label}</p>
      <p className="text-3xl font-black italic tracking-tighter leading-none">{value}</p>
    </div>
  );
}