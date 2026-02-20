/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Trash2, Plus, Search, Download, Recycle, Flame, AlertTriangle, FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import WasteForm from './WasteForm';

/**
 * ♻️ GESTION DES DÉCHETS (ISO 14001 §8.1)
 * Suivi des flux, taux de recyclage et traçabilité des déchets dangereux.
 */
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

  /**
   * 📊 KPI ENGINE : Calculs de performance déchets
   */
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
      w.WAS_Type.toLowerCase().includes('toxique')
    ).reduce((sum, w) => sum + w.WAS_Weight, 0);
    
    return {
      totalWaste: Math.round(totalWeight),
      recyclableWaste: Math.round(recyclable),
      hazardousWaste: Math.round(hazardous),
      recyclingRate: totalWeight > 0 ? Math.round((recyclable / totalWeight) * 100) : 0,
      recyclableAlert: totalWeight > 0 && (recyclable / totalWeight) < 0.6,
      hazardousAlert: hazardous > 0
    };
  }, [wastes, selectedSite, filterType, selectedMonth, selectedYear]);

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
      toast.error("ERREUR DE CHARGEMENT DÉCHETS");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('AUDIT : CONFIRMER LA SUPPRESSION DE L\'ENREGISTREMENT ?')) return;
    try {
      await apiClient.delete(`/wastes/${id}`);
      toast.success('DÉCHET SUPPRIMÉ');
      fetchData();
    } catch (error) {
      toast.error('ERREUR DE SUPPRESSION');
    }
  };

  // Logique de filtrage textuel
  const filteredWastes = wastes.filter(waste => {
    const matchesSearch = 
      waste.WAS_Label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      waste.WAS_Type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || waste.WAS_Type === filterType;
    const matchesSite = selectedSite === 'ALL' || waste.WAS_SiteId === selectedSite;
    const matchesPeriod = waste.WAS_Month === selectedMonth && waste.WAS_Year === selectedYear;
    return matchesSearch && matchesType && matchesSite && matchesPeriod;
  });

  if (loading) return (
    <div className="ml-72 h-screen flex items-center justify-center bg-[#0B0F1A]">
      <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-8 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans uppercase italic font-black">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl tracking-tighter">Gestion des <span className="text-green-400">Déchets</span></h1>
          <p className="text-slate-500 text-[10px] tracking-widest mt-2 uppercase">Suivi opérationnel • ISO 14001 §8.1</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 hover:bg-emerald-500 shadow-lg border-none cursor-pointer transition-all">
          <Plus size={16} /> Nouveau Déchet
        </button>
      </header>

      {/* DASHBOARD SUMMARY */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Déchets" value={`${stats.totalWaste} kg`} icon={<Flame className="text-red-400" />} color="bg-red-500/10" />
        <StatCard label="Recyclés" value={`${stats.recyclableWaste} kg`} icon={<Recycle className="text-green-400" />} color="bg-green-500/10" />
        <StatCard label="Taux Recyclage" value={`${stats.recyclingRate}%`} icon={<Recycle className="text-emerald-400" />} color="bg-emerald-500/10" progress={stats.recyclingRate} alert={stats.recyclableAlert} />
        <StatCard label="Dangereux" value={`${stats.hazardousWaste} kg`} icon={<AlertTriangle className="text-amber-400" />} color="bg-amber-500/10" alert={stats.hazardousAlert} />
      </div>

      

      {/* BARRE DE FILTRES */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="text" placeholder="Rechercher..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white outline-none focus:border-green-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white">
            <option value="ALL">TOUS SITES</option>
            {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
          </select>
          <div className="flex gap-2">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white">
              {Array.from({length:12}, (_,i) => <option key={i+1} value={i+1}>{new Date(0,i).toLocaleString('fr',{month:'short'})}</option>)}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white">
              {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button className="bg-white/5 border border-white/10 rounded-xl p-2 hover:bg-white/10 cursor-pointer"><Download size={18} className="text-green-400" /></button>
      </div>

      {/* TABLEAU DES FLUX */}
      <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] text-slate-500 tracking-widest border-b border-white/5">
            <tr>
              <th className="p-6">PÉRIODE & SITE</th>
              <th className="p-6">TYPE DÉCHET</th>
              <th className="p-6">QUANTITÉ</th>
              <th className="p-6 text-center">TRAITEMENT</th>
              <th className="p-6 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredWastes.map((w) => (
              <tr key={w.WAS_Id} className="hover:bg-white/5 transition-all group">
                <td className="p-6">
                  <p className="font-black text-sm">{w.WAS_Month}/{w.WAS_Year}</p>
                  <p className="text-[10px] text-slate-500">{w.WAS_Site?.S_Name}</p>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    {w.WAS_Type.includes('Dangereux') ? <AlertTriangle className="text-amber-500" size={14} /> : <Recycle className="text-green-500" size={14} />}
                    <span className="text-xs">{w.WAS_Type}</span>
                  </div>
                </td>
                <td className="p-6">
                  <span className="text-xl font-black">{w.WAS_Weight.toLocaleString()}</span> <span className="text-[10px] text-slate-500">kg</span>
                </td>
                <td className="p-6 text-center">
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] border border-white/5">{w.WAS_Treatment}</span>
                </td>
                <td className="p-6 text-right">
                  <button onClick={() => handleDelete(w.WAS_Id)} className="p-2 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all border-none bg-transparent cursor-pointer"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {isFormOpen && <WasteForm onClose={() => setIsFormOpen(false)} onSuccess={fetchData} sites={sites} />}
    </div>
  );
}

function StatCard({ label, value, icon, color, progress, alert }: any) {
  return (
    <div className={`${color} border ${alert ? 'border-amber-500/50' : 'border-white/10'} rounded-2xl p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/10 rounded-lg">{icon}</div>
        {progress !== undefined && (
          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full ${alert ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>
      <p className="text-[9px] font-black uppercase text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-black leading-none">{value}</p>
    </div>
  );
}