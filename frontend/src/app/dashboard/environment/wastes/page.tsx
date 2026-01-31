/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Trash2, Plus, Search, Filter, Download, Calendar, 
  Recycle, Flame, AlertTriangle, CheckCircle, FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import WasteForm from './WasteForm';

export default function WasteManagementPage() {
  const router = useRouter();
  const [wastes, setWastes] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedSite, setSelectedSite] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const stats = useMemo(() => {
    const filtered = wastes.filter(w => 
      (selectedSite === 'ALL' || w.WAS_SiteId === selectedSite) &&
      (filterType === 'ALL' || w.WAS_Type === filterType) &&
      w.WAS_Month === selectedMonth &&
      w.WAS_Year === selectedYear
    );
    
    const totalWeight = filtered.reduce((sum, w) => sum + w.WAS_Weight, 0);
    const recyclable = filtered.filter(w => 
      w.WAS_Type.toLowerCase().includes('recycl') || 
      w.WAS_Treatment.toLowerCase().includes('recycl')
    ).reduce((sum, w) => sum + w.WAS_Weight, 0);
    
    const hazardous = filtered.filter(w => 
      w.WAS_Type.toLowerCase().includes('dangereux') ||
      w.WAS_Type.toLowerCase().includes('toxique') ||
      w.WAS_Type.toLowerCase().includes('chimique')
    ).reduce((sum, w) => sum + w.WAS_Weight, 0);
    
    return {
      totalWaste: Math.round(totalWeight),
      recyclableWaste: Math.round(recyclable),
      hazardousWaste: Math.round(hazardous),
      recyclingRate: totalWeight > 0 ? Math.round((recyclable / totalWeight) * 100) : 0,
      hazardousRate: totalWeight > 0 ? Math.round((hazardous / totalWeight) * 100) : 0,
      recyclableAlert: (recyclable / totalWeight) < 0.6,
      hazardousAlert: hazardous > 0
    };
  }, [wastes, selectedSite, filterType, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wastesRes, sitesRes] = await Promise.all([
        apiClient.get('/wastes'),
        apiClient.get('/sites')
      ]);
      
      setWastes(wastesRes.data || []);
      setSites(sitesRes.data || []);
    } catch (error) {
      console.error("Erreur chargement déchets:", error);
      toast.error("Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement de déchet ?')) return;
    
    try {
      await apiClient.delete(`/wastes/${id}`);
      toast.success('Enregistrement supprimé avec succès');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredWastes = wastes.filter(waste => {
    const matchesSearch = 
      waste.WAS_Label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      waste.WAS_Type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      waste.WAS_Treatment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      waste.WAS_Site?.S_Name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'ALL' || waste.WAS_Type === filterType;
    const matchesSite = selectedSite === 'ALL' || waste.WAS_SiteId === selectedSite;
    const matchesPeriod = waste.WAS_Month === selectedMonth && waste.WAS_Year === selectedYear;
    
    return matchesSearch && matchesType && matchesSite && matchesPeriod;
  });

  if (loading) {
    return (
      <div className="ml-72 h-screen flex items-center justify-center bg-[#0B0F1A]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-widest">
            Chargement des données déchets...
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
            Gestion des <span className="text-green-400">Déchets</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 italic">
            Suivi opérationnel • ISO 14001 §8.1
          </p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-linear-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 hover:from-green-500 hover:to-emerald-600 transition-all shadow-lg"
        >
          <Plus size={16} /> Nouveau Déchet
        </button>
      </header>

      {/* STATISTIQUES RAPIDES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Total Déchets" 
          value={`${stats.totalWaste.toLocaleString()} kg`} 
          icon={<Flame className="text-red-400" />}
          color="bg-red-500/10"
        />
        <StatCard 
          label="Déchets Recyclés" 
          value={`${stats.recyclableWaste.toLocaleString()} kg`} 
          icon={<Recycle className="text-green-400" />}
          color="bg-green-500/10"
        />
        <StatCard 
          label="Taux de Recyclage" 
          value={`${stats.recyclingRate}%`} 
          icon={<Recycle className="text-emerald-400" />}
          color="bg-emerald-500/10"
          progress={stats.recyclingRate}
          alert={stats.recyclableAlert}
        />
        <StatCard 
          label="Déchets Dangereux" 
          value={`${stats.hazardousWaste.toLocaleString()} kg`} 
          icon={<AlertTriangle className="text-amber-400" />}
          color="bg-amber-500/10"
          alert={stats.hazardousAlert}
        />
      </div>

      {/* FILTRES */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Rechercher un déchet, type ou traitement..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500/50 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500/50 outline-none min-w-37.5"
          >
            <option value="ALL">Tous les Types</option>
            <option value="Recyclable">Recyclable</option>
            <option value="Dangereux">Dangereux</option>
            <option value="Banal">Banal</option>
            <option value="Organique">Organique</option>
            <option value="Chimique">Chimique</option>
          </select>
          
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500/50 outline-none min-w-37.5"
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
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500/50 outline-none w-32"
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
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500/50 outline-none w-24"
            >
              {[2024, 2023, 2022, 2021].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <button className="bg-white/5 border border-white/10 rounded-xl p-2 hover:bg-white/10 transition-colors">
            <Download size={18} className="text-green-400" />
          </button>
        </div>
      </div>

      {/* TABLEAU DES DÉCHETS */}
      <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5">
            <tr className="text-[10px] font-black uppercase text-slate-500 italic tracking-widest border-b border-white/5">
              <th className="p-6">Période & Site</th>
              <th className="p-6">Type de Déchet</th>
              <th className="p-6">Quantité</th>
              <th className="p-6">Traitement</th>
              <th className="p-6 text-center">Statut</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredWastes.map((waste) => {
              const isHazardous = waste.WAS_Type.toLowerCase().includes('dangereux') ||
                                 waste.WAS_Type.toLowerCase().includes('toxique') ||
                                 waste.WAS_Type.toLowerCase().includes('chimique');
              const isRecyclable = waste.WAS_Treatment.toLowerCase().includes('recycl') ||
                                  waste.WAS_Type.toLowerCase().includes('recycl');
              
              return (
                <tr key={waste.WAS_Id} className="hover:bg-white/5 transition-colors">
                  <td className="p-6">
                    <div className="space-y-1">
                      <p className="font-black">
                        {new Date(waste.WAS_Year, waste.WAS_Month - 1, 1).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase">{waste.WAS_Site?.S_Name || 'Site inconnu'}</p>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      {isHazardous ? (
                        <AlertTriangle className="text-amber-400" size={18} />
                      ) : isRecyclable ? (
                        <Recycle className="text-green-400" size={18} />
                      ) : (
                        <Flame className="text-red-400" size={18} />
                      )}
                      <span className="font-black uppercase">{waste.WAS_Type}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{waste.WAS_Label}</p>
                  </td>
                  <td className="p-6">
                    <span className="font-black text-xl">{waste.WAS_Weight.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 ml-1">kg</span>
                  </td>
                  <td className="p-6">
                    <span className="text-[10px] font-black uppercase">{waste.WAS_Treatment}</span>
                  </td>
                  <td className="p-6 text-center">
                    {isRecyclable ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-[9px] font-black border border-green-500/30">
                        Recyclé
                      </span>
                    ) : isHazardous ? (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[9px] font-black border border-amber-500/30 flex items-center justify-center gap-1">
                        <AlertTriangle size={12} /> Dangereux
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-500/20 text-slate-300 rounded-full text-[9px] font-black border border-slate-500/30">
                        Standard
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-green-400 transition-colors">
                        <FileText size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(waste.WAS_Id)}
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

      {filteredWastes.length === 0 && (
        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/5 mt-6">
          <Trash2 size={56} className="mx-auto text-slate-800 mb-4 opacity-30" />
          <p className="text-slate-600 font-black uppercase italic text-sm tracking-widest">
            Aucun déchet trouvé avec ces critères
          </p>
          <p className="text-slate-500 text-xs mt-2 italic">Sélectionnez une autre période ou créez un nouvel enregistrement</p>
        </div>
      )}

      {/* MODAL FORMULAIRE */}
      {isFormOpen && (
        <WasteForm 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={fetchData} 
          sites={sites}
        />
      )}

      <footer className="mt-8 pt-6 border-t border-white/5 text-center">
        <p className="text-[8px] font-bold text-slate-600 uppercase italic tracking-[0.3em]">
          Qualisoft SMI • Gestion des Déchets ISO 14001 §8.1 • Conformité réglementaire déchets dangereux
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