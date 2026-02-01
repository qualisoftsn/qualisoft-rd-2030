/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Zap, Plus, Search, Download, Calendar, 
  Droplets, TrendingUp, AlertTriangle, CheckCircle, Target, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConsumptionForm from './ConsumptionForm'; // ✅ Import propre

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [consRes, sitesRes] = await Promise.all([
        apiClient.get('/consumptions'),
        apiClient.get('/sites')
      ]);
      setConsumptions(consRes.data || []);
      setSites(sitesRes.data || []);
    } catch (error) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const stats = useMemo(() => {
    const filtered = consumptions.filter(c => 
      (selectedSite === 'ALL' || c.CON_SiteId === selectedSite) &&
      c.CON_Month === selectedMonth && c.CON_Year === selectedYear
    );
    
    const energy = filtered.filter(c => (c.CON_Type || '').toLowerCase().includes('éner') || (c.CON_Type || '').toLowerCase().includes('electr')).reduce((sum, c) => sum + (c.CON_Value || 0), 0);
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
    if (!confirm('Supprimer cet enregistrement ?')) return;
    try {
      await apiClient.delete(`/consumptions/${id}`);
      toast.success('Supprimé');
      fetchData();
    } catch (error) { toast.error('Erreur'); }
  };

  const filteredConsumptions = consumptions.filter(c => {
    const matchesSearch = (c.CON_Type + (c.CON_Site?.S_Name || '')).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || c.CON_Type === filterType;
    const matchesSite = selectedSite === 'ALL' || c.CON_SiteId === selectedSite;
    const matchesPeriod = c.CON_Month === selectedMonth && c.CON_Year === selectedYear;
    return matchesSearch && matchesType && matchesSite && matchesPeriod;
  });

  if (loading) return <div className="ml-72 h-screen flex items-center justify-center bg-[#0B0F1A] text-amber-500 font-black italic uppercase animate-pulse">Chargement ISO 14001...</div>;

  return (
    <div className="p-8 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans uppercase italic font-black">
      <header className="mb-8 flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl tracking-tighter">Suivi <span className="text-amber-400">Consommations</span></h1>
          <p className="text-slate-500 text-[10px] tracking-widest mt-2 uppercase">Management Énergie §9.1.1</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-amber-600 px-8 py-4 rounded-2xl text-[10px] shadow-xl flex items-center gap-2 hover:bg-amber-500 transition-all">
          <Plus size={16} /> NOUVELLE SAISIE
        </button>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Énergie" value={`${stats.totalEnergy} kWh`} icon={<Zap size={20}/>} color="bg-amber-500/10" progress={stats.energyProgress} alert={stats.energyAlert} />
        <StatCard label="Eau" value={`${stats.totalWater} m³`} icon={<Droplets size={20}/>} color="bg-blue-500/10" progress={stats.waterProgress} alert={stats.waterAlert} />
        <StatCard label="Coût" value={`${stats.totalCost} XOF`} icon={<TrendingUp size={20}/>} color="bg-emerald-500/10" />
        <StatCard label="Target" value="10k kWh" icon={<Target size={20}/>} color="bg-purple-500/10" progress={stats.energyProgress} />
      </div>

      {/* FILTERS */}
      <div className="flex gap-4 mb-6 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
        <input placeholder="Rechercher..." className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex-1 outline-none focus:border-amber-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <select className="bg-slate-900 border border-white/10 rounded-xl px-4" value={selectedSite} onChange={e => setSelectedSite(e.target.value)}>
          <option value="ALL">TOUS LES SITES</option>
          {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
        </select>
        <div className="flex gap-1">
          <select className="bg-slate-900 border border-white/10 rounded-xl px-2" value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
            {Array.from({length:12}, (_,i) => <option key={i+1} value={i+1}>{i+1}</option>)}
          </select>
          <select className="bg-slate-900 border border-white/10 rounded-xl px-2" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
            {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[9px] text-slate-500 tracking-widest">
            <tr><th className="p-6">Période / Site</th><th className="p-6">Type</th><th className="p-6">Valeur</th><th className="p-6">Coût</th><th className="p-6 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredConsumptions.map((c) => (
              <tr key={c.CON_Id} className="hover:bg-white/5 transition-colors">
                <td className="p-6"><p className="font-black">{c.CON_Month}/{c.CON_Year}</p><p className="text-[10px] text-slate-500 uppercase">{c.CON_Site?.S_Name}</p></td>
                <td className="p-6 font-black text-amber-500 uppercase">{c.CON_Type}</td>
                <td className="p-6 font-black text-xl">{c.CON_Value.toLocaleString()} <span className="text-[10px] text-slate-500">{c.CON_Unit}</span></td>
                <td className="p-6 font-black text-xl">{c.CON_Cost?.toLocaleString()} <span className="text-[10px] text-slate-500">XOF</span></td>
                <td className="p-6 text-right">
                  <button onClick={() => handleDelete(c.CON_Id)} className="text-slate-500 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
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

function StatCard({ label, value, icon, color, progress, alert }: any) {
  return (
    <div className={`${color} border ${alert ? 'border-amber-500 animate-pulse' : 'border-white/5'} rounded-3xl p-6 shadow-inner`}>
      <div className="flex justify-between mb-4">
        <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
        {progress !== undefined && <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden self-center"><div className="h-full bg-amber-500" style={{width: `${progress}%`}}></div></div>}
      </div>
      <p className="text-[8px] text-slate-500 mb-1 tracking-widest uppercase">{label}</p>
      <p className="text-xl font-black italic tracking-tighter">{value}</p>
    </div>
  );
}