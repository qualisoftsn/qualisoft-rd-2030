/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Zap, Plus, Search, Filter, Download, Calendar, 
  Droplets, TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConsumptionForm from './ConsumptionForm';

export default function ConsumptionManagementPage() {
  const router = useRouter();
  const [consumptions, setConsumptions] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedSite, setSelectedSite] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const stats = useMemo(() => {
    const filtered = consumptions.filter(c => 
      (selectedSite === 'ALL' || c.CON_SiteId === selectedSite) &&
      (filterType === 'ALL' || c.CON_Type === filterType) &&
      c.CON_Month === selectedMonth &&
      c.CON_Year === selectedYear
    );
    
    const energy = filtered.filter(c => 
      c.CON_Type.toLowerCase().includes('electric') || 
      c.CON_Type.toLowerCase().includes('énergie')
    ).reduce((sum, c) => sum + c.CON_Value, 0);
    
    const water = filtered.filter(c => 
      c.CON_Type.toLowerCase().includes('eau') || 
      c.CON_Type.toLowerCase().includes('water')
    ).reduce((sum, c) => sum + c.CON_Value, 0);
    
    const cost = filtered.reduce((sum, c) => sum + (c.CON_Cost || 0), 0);
    
    // Objectifs ISO 14001 (à adapter selon les paramètres client)
    const energyTarget = 10000; // kWh/mois
    const waterTarget = 500;    // m³/mois
    
    return {
      totalEnergy: Math.round(energy),
      totalWater: Math.round(water),
      totalCost: Math.round(cost),
      energyProgress: Math.min(100, Math.round((energy / energyTarget) * 100)),
      waterProgress: Math.min(100, Math.round((water / waterTarget) * 100)),
      energyAlert: energy > energyTarget * 0.9,
      waterAlert: water > waterTarget * 0.9
    };
  }, [consumptions, selectedSite, filterType, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchData();
  }, []);

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
      console.error("Erreur chargement consommations:", error);
      toast.error("Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement de consommation ?')) return;
    
    try {
      await apiClient.delete(`/consumptions/${id}`);
      toast.success('Enregistrement supprimé avec succès');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredConsumptions = consumptions.filter(consumption => {
    const matchesSearch = 
      consumption.CON_Type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consumption.CON_Site?.S_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consumption.CON_Unit.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'ALL' || consumption.CON_Type === filterType;
    const matchesSite = selectedSite === 'ALL' || consumption.CON_SiteId === selectedSite;
    const matchesPeriod = consumption.CON_Month === selectedMonth && consumption.CON_Year === selectedYear;
    
    return matchesSearch && matchesType && matchesSite && matchesPeriod;
  });

  if (loading) {
    return (
      <div className="ml-72 h-screen flex items-center justify-center bg-[#0B0F1A]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-widest">
            Chargement des données de consommation...
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
            Suivi des <span className="text-amber-400">Consommations</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 italic">
            Énergie & Eau • ISO 14001 §9.1.1
          </p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-amber-600 to-orange-700 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 hover:from-amber-500 hover:to-orange-600 transition-all shadow-lg"
        >
          <Plus size={16} /> Nouvelle Consommation
        </button>
      </header>

      {/* STATISTIQUES RAPIDES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Énergie Consommée" 
          value={`${stats.totalEnergy.toLocaleString()} kWh`} 
          icon={<Zap className="text-amber-400" />}
          color="bg-amber-500/10"
          progress={stats.energyProgress}
          alert={stats.energyAlert}
        />
        <StatCard 
          label="Eau Consommée" 
          value={`${stats.totalWater.toLocaleString()} m³`} 
          icon={<Droplets className="text-blue-400" />}
          color="bg-blue-500/10"
          progress={stats.waterProgress}
          alert={stats.waterAlert}
        />
        <StatCard 
          label="Coût Total" 
          value={`${stats.totalCost.toLocaleString()} XOF`} 
          icon={<TrendingUp className="text-emerald-400" />}
          color="bg-emerald-500/10"
        />
        <StatCard 
          label="Objectif Énergie" 
          value="10 000 kWh/mois" 
          icon={<Target className="text-purple-400" />}
          color="bg-purple-500/10"
          progress={stats.energyProgress}
        />
      </div>

      {/* FILTRES */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Rechercher type, site ou unité..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none min-w-[150px]"
          >
            <option value="ALL">Tous les Types</option>
            <option value="Électricité">Électricité</option>
            <option value="Eau">Eau</option>
            <option value="Gaz">Gaz</option>
            <option value="Carburant">Carburant</option>
          </select>
          
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none min-w-[150px]"
          >
            <option value="ALL">Tous les Sites</option>
            {sites.map(site => (
              <option key={site.S_Id} value={site.S_Id}>{site.S_Name}</option>
            ))}
          </select>
          
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none w-32"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i, 1).toLocaleString('fr-FR', { month: 'short' })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none w-24"
            >
              {[2024, 2023, 2022, 2021].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <button className="bg-white/5 border border-white/10 rounded-xl p-2 hover:bg-white/10 transition-colors">
            <Download size={18} className="text-amber-400" />
          </button>
        </div>
      </div>

      {/* TABLEAU DES CONSOMMATIONS */}
      <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5">
            <tr className="text-[10px] font-black uppercase text-slate-500 italic tracking-widest border-b border-white/5">
              <th className="p-6">Date & Site</th>
              <th className="p-6">Type de Consommation</th>
              <th className="p-6">Quantité</th>
              <th className="p-6">Coût</th>
              <th className="p-6 text-center">Statut</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredConsumptions.map((consumption) => {
              const isEnergy = consumption.CON_Type.toLowerCase().includes('electric') || 
                             consumption.CON_Type.toLowerCase().includes('énergie');
              const isWater = consumption.CON_Type.toLowerCase().includes('eau') || 
                            consumption.CON_Type.toLowerCase().includes('water');
              
              return (
                <tr key={consumption.CON_Id} className="hover:bg-white/5 transition-colors">
                  <td className="p-6">
                    <div className="space-y-1">
                      <p className="font-black">
                        {new Date(consumption.CON_Year, consumption.CON_Month - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase">{consumption.CON_Site?.S_Name || 'Site inconnu'}</p>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      {isEnergy ? (
                        <Zap className="text-amber-400" size={18} />
                      ) : isWater ? (
                        <Droplets className="text-blue-400" size={18} />
                      ) : (
                        <TrendingUp className="text-emerald-400" size={18} />
                      )}
                      <span className="font-black uppercase">{consumption.CON_Type}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{consumption.CON_Unit}</p>
                  </td>
                  <td className="p-6">
                    <span className="font-black text-xl">{consumption.CON_Value.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 ml-1">{consumption.CON_Unit}</span>
                  </td>
                  <td className="p-6">
                    <span className="font-black text-xl">{(consumption.CON_Cost || 0).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 ml-1">XOF</span>
                  </td>
                  <td className="p-6 text-center">
                    {consumption.CON_Value > (isEnergy ? 9000 : 450) ? (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[9px] font-black border border-amber-500/30 flex items-center justify-center gap-1">
                        <AlertTriangle size={12} /> Attention
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[9px] font-black border border-emerald-500/30 flex items-center justify-center gap-1">
                        <CheckCircle size={12} /> Normal
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-amber-400 transition-colors">
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(consumption.CON_Id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredConsumptions.length === 0 && (
        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/5 mt-6">
          <Zap size={56} className="mx-auto text-slate-800 mb-4 opacity-30" />
          <p className="text-slate-600 font-black uppercase italic text-sm tracking-widest">
            Aucune consommation trouvée avec ces critères
          </p>
          <p className="text-slate-500 text-xs mt-2 italic">Sélectionnez une autre période ou modifiez vos filtres</p>
        </div>
      )}

      {/* MODAL FORMULAIRE */}
      {isFormOpen && (
        <ConsumptionForm 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={fetchData} 
          sites={sites}
        />
      )}

      <footer className="mt-8 pt-6 border-t border-white/5 text-center">
        <p className="text-[8px] font-bold text-slate-600 uppercase italic tracking-[0.3em]">
          Qualisoft SMI • Suivi des Consommations ISO 14001 §9.1.1 • Optimisation des ressources
        </p>
      </footer>
    </div>
  );
}

function StatCard({ label, value, icon, color, progress, alert = false }: any) {
  return (
    <div className={`${color} border ${alert ? 'border-amber-500/50' : 'border-white/10'} rounded-2xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 bg-white/10 rounded-lg">{icon}</div>
        {progress !== undefined && (
          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${alert ? 'bg-amber-500' : 'bg-emerald-500'}`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
      <p className="text-[9px] font-black uppercase text-slate-400">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}

import { X, Save, Loader2 } from 'lucide-react';

interface ConsumptionFormProps {
  onClose: () => void;
  onSuccess: () => void;
  sites: any[];
}

export default function ConsumptionForm({ onClose, onSuccess, sites }: ConsumptionFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    CON_Type: 'Électricité',
    CON_Value: 0,
    CON_Unit: 'kWh',
    CON_Month: new Date().getMonth() + 1,
    CON_Year: new Date().getFullYear(),
    CON_Cost: 0,
    CON_SiteId: sites[0]?.S_Id || '',
    CON_CreatorId: '' // Sera rempli par le backend avec l'utilisateur connecté
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/consumptions', formData);
      toast.success("Consommation enregistrée avec succès");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erreur création consommation:", err);
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour automatique de l'unité selon le type
  const handleTypeChange = (type: string) => {
    let unit = 'kWh';
    if (type.toLowerCase().includes('eau')) unit = 'm³';
    if (type.toLowerCase().includes('gaz')) unit = 'm³';
    if (type.toLowerCase().includes('carburant')) unit = 'litres';
    
    setFormData(prev => ({ ...prev, CON_Type: type, CON_Unit: unit }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
            Nouvelle <span className="text-amber-600">Consommation</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Type de consommation</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.CON_Type}
                onChange={(e) => handleTypeChange(e.target.value)}
                required
              >
                <option value="Électricité">Électricité</option>
                <option value="Eau">Eau</option>
                <option value="Gaz">Gaz</option>
                <option value="Carburant">Carburant</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Site</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.CON_SiteId}
                onChange={(e) => setFormData({...formData, CON_SiteId: e.target.value})}
                required
              >
                {sites.map(site => (
                  <option key={site.S_Id} value={site.S_Id}>{site.S_Name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Quantité</label>
              <input 
                type="number"
                step="0.01"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"
                value={formData.CON_Value}
                onChange={(e) => setFormData({...formData, CON_Value: parseFloat(e.target.value)})}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Unité</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"
                value={formData.CON_Unit}
                readOnly
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Coût (XOF)</label>
              <input 
                type="number"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"
                value={formData.CON_Cost}
                onChange={(e) => setFormData({...formData, CON_Cost: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Mois</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"
                value={formData.CON_Month}
                onChange={(e) => setFormData({...formData, CON_Month: parseInt(e.target.value)})}
                required
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i, 1).toLocaleString('fr-FR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Année</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"
                value={formData.CON_Year}
                onChange={(e) => setFormData({...formData, CON_Year: parseInt(e.target.value)})}
                required
              >
                {[2024, 2023, 2022, 2021, 2020].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-amber-600 transition-all shadow-xl"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Enregistrer la Consommation
          </button>
        </form>
      </div>
    </div>
  );
}