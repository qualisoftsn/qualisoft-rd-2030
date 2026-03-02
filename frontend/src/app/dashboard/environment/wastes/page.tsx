/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ♻️ GESTION DES DÉCHETS (MATRIX KERNEL)
 * Rôle : Traçabilité des flux, calcul du taux de recyclage et monitoring des déchets dangereux.
 * Fix : Responsive lg:ml-72, unification des notifications, et sécurisation des stats.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 02:29 GMT
 */

'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Trash2, Plus, Search, Download, Recycle, Flame, AlertTriangle, FileText, Loader2, RefreshCcw
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [wastesRes, sitesRes] = await Promise.all([
        apiClient.get('/wastes'),
        apiClient.get('/sites')
      ]);
      setWastes(wastesRes.data?.data || wastesRes.data || []);
      setSites(sitesRes.data?.data || sitesRes.data || []);
    } catch (error) {
      toast.error("ERREUR DE LIAISON REGISTRE DÉCHETS");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 📊 MOTEUR DE CALCUL DES STATISTIQUES (§9.1.1)
  const stats = useMemo(() => {
    const filtered = wastes.filter(w => 
      (selectedSite === 'ALL' || w.WAS_SiteId === selectedSite) &&
      w.WAS_Month === selectedMonth &&
      w.WAS_Year === selectedYear
    );
    
    const totalWeight = filtered.reduce((sum, w) => sum + (Number(w.WAS_Weight) || 0), 0);
    const recyclable = filtered.filter(w => {
      const type = (w.WAS_Type || '').toLowerCase();
      const treat = (w.WAS_Treatment || '').toLowerCase();
      return type.includes('recycl') || treat.includes('recycl');
    }).reduce((sum, w) => sum + (Number(w.WAS_Weight) || 0), 0);
    
    const hazardous = filtered.filter(w => {
      const type = (w.WAS_Type || '').toLowerCase();
      return type.includes('dangereux') || type.includes('toxique') || type.includes('chimique');
    }).reduce((sum, w) => sum + (Number(w.WAS_Weight) || 0), 0);
    
    return {
      totalWaste: Math.round(totalWeight),
      recyclableWaste: Math.round(recyclable),
      hazardousWaste: Math.round(hazardous),
      recyclingRate: totalWeight > 0 ? Math.round((recyclable / totalWeight) * 100) : 0,
      recyclableAlert: totalWeight > 0 && (recyclable / totalWeight) < 0.75, // Seuil ISO 75%
      hazardousAlert: hazardous > 0
    };
  }, [wastes, selectedSite, selectedMonth, selectedYear]);

  const handleDelete = async (id: string) => {
    if (!confirm('AUDIT : CONFIRMER LA SUPPRESSION DE L\'ENREGISTREMENT DANS LE REGISTRE SDE ?')) return;
    try {
      await apiClient.delete(`/wastes/${id}`);
      toast.success('ENTRÉE DÉCHET SUPPRIMÉE');
      fetchData();
    } catch (error) {
      toast.error('ERREUR DE SUPPRESSION');
    }
  };

  const filteredWastes = wastes.filter(waste => {
    const label = (waste.WAS_Label || '').toLowerCase();
    const type = (waste.WAS_Type || '').toLowerCase();
    const matchesSearch = label.includes(searchTerm.toLowerCase()) || type.includes(searchTerm.toLowerCase());
    const matchesSite = selectedSite === 'ALL' || waste.WAS_SiteId === selectedSite;
    const matchesPeriod = waste.WAS_Month === selectedMonth && waste.WAS_Year === selectedYear;
    return matchesSearch && matchesSite && matchesPeriod;
  });

  if (loading) return (
    <div className="ml-0 lg:ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-green-500" size={48} />
      <p className="text-green-500 font-black uppercase italic text-[10px] tracking-[0.4em] animate-pulse">Synchronisation Flux Déchets...</p>
    </div>
  );

  return (
    <div className="p-4 lg:p-10 bg-[#0B0F1A] min-h-screen ml-0 lg:ml-72 text-white font-sans uppercase italic font-black selection:bg-green-500/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="mb-12 flex flex-col xl:flex-row justify-between xl:items-end gap-8 border-b border-white/5 pb-10 mt-12 lg:mt-0">
        <div className="text-left">
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 uppercase">Gestion des <span className="text-green-400">Déchets</span></h1>
          <p className="text-slate-500 text-[11px] tracking-[0.4em] mt-4 uppercase italic m-0">Suivi opérationnel • ISO 14001 §8.1 • Traçabilité SDE</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-emerald-600 text-white px-10 py-5 rounded-3xl text-[11px] shadow-2xl flex items-center gap-3 hover:bg-white hover:text-emerald-600 transition-all active:scale-95 border-none cursor-pointer font-black italic shrink-0">
          <Plus size={20} strokeWidth={3} /> Nouveau Déchet
        </button>
      </header>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        <StatCard label="Total Déchets" value={`${stats.totalWaste} kg`} icon={<Flame className="text-red-400" />} color="bg-red-500/5" />
        <StatCard label="Recyclés" value={`${stats.recyclableWaste} kg`} icon={<Recycle className="text-green-400" />} color="bg-green-500/5" />
        <StatCard label="Taux Recyclage" value={`${stats.recyclingRate}%`} icon={<Recycle className="text-emerald-400" />} color="bg-emerald-500/5" progress={stats.recyclingRate} alert={stats.recyclableAlert} />
        <StatCard label="Dangereux" value={`${stats.hazardousWaste} kg`} icon={<AlertTriangle className="text-amber-400" />} color="bg-amber-500/5" alert={stats.hazardousAlert} />
      </div>

      {/* FILTRES MATRIX */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input type="text" placeholder="RECHERCHER DANS LE REGISTRE..." className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black outline-none focus:border-green-500 transition-all text-white italic" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)} className="bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black outline-none focus:border-green-500 cursor-pointer text-white italic appearance-none">
            <option value="ALL">TOUS SITES</option>
            {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
          </select>
          <div className="flex gap-2">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black outline-none focus:border-green-500 cursor-pointer text-white italic appearance-none">
              {Array.from({length:12}, (_,i) => <option key={i+1} value={i+1}>{new Date(0,i).toLocaleString('fr',{month:'long'}).toUpperCase()}</option>)}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black outline-none focus:border-green-500 cursor-pointer text-white italic appearance-none">
              {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={fetchData} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 cursor-pointer transition-colors text-green-400">
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      {/* TABLEAU DES FLUX */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-x-auto shadow-2xl backdrop-blur-xl">
        <table className="w-full text-left min-w-225">
          <thead className="bg-white/5 text-[10px] text-slate-500 tracking-[0.3em] font-black uppercase italic border-b border-white/5">
            <tr>
              <th className="p-8">PÉRIODE & SITE</th>
              <th className="p-8">TYPE DÉCHET</th>
              <th className="p-8">QUANTITÉ</th>
              <th className="p-8 text-center">TRAITEMENT</th>
              <th className="p-8 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredWastes.length === 0 ? (
              <tr><td colSpan={5} className="p-20 text-center opacity-10 text-xl tracking-[1em]">Registre Vierge</td></tr>
            ) : (
              filteredWastes.map((w) => (
                <tr key={w.WAS_Id} className="hover:bg-white/5 transition-all group">
                  <td className="p-8">
                    <p className="font-black text-sm m-0 italic">{w.WAS_Month}/{w.WAS_Year}</p>
                    <p className="text-[10px] text-slate-500 m-0 uppercase tracking-widest">{w.WAS_Site?.S_Name}</p>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                      {w.WAS_Type?.match(/Dangereux|Toxique|Chimique/i) ? 
                        <AlertTriangle className="text-amber-500" size={16} /> : 
                        <Recycle className="text-green-500" size={16} />
                      }
                      <span className="text-[11px] font-black italic">{w.WAS_Type}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className="text-2xl font-black">{w.WAS_Weight.toLocaleString()}</span> <span className="text-[10px] text-slate-500">kg</span>
                  </td>
                  <td className="p-8 text-center">
                    <span className="px-4 py-2 bg-white/5 rounded-full text-[9px] border border-white/10 tracking-widest">{w.WAS_Treatment}</span>
                  </td>
                  <td className="p-8 text-right">
                    <button onClick={() => handleDelete(w.WAS_Id)} className="p-4 bg-white/5 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 border-none cursor-pointer"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {isFormOpen && <WasteForm onClose={() => setIsFormOpen(false)} onSuccess={fetchData} sites={sites} />}
    </div>
  );
}

function StatCard({ label, value, icon, color, progress, alert }: any) {
  return (
    <div className={`${color} border ${alert ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-white/5'} rounded-[2.5rem] p-8 transition-transform hover:scale-105 group`}>
      <div className="flex items-center justify-between mb-6">
        <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
        {progress !== undefined && (
          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden self-center border border-white/5">
            <div className={`h-full ${alert ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>
      <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest italic m-0">{label}</p>
      <p className="text-3xl font-black leading-none m-0 italic tracking-tighter">{value}</p>
    </div>
  );
}