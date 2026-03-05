/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 MODULE : GESTION DES DÉCHETS §8.1 (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Traçabilité des flux et conformité au registre de valorisation.
 * FIX : Définition locale de LoadingScreen (Correction jsx-no-undef), 
 * Layout 100dvh sans scroll global, PWA Ready.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 12:48 GMT
 */

'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Trash2, Plus, Search, Recycle, Flame, AlertTriangle, 
  RefreshCcw, Loader2, TrendingUp, Filter, BarChart3, ChevronRight 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import WasteForm from './WasteForm';
import { cn } from '@/core/utils/cn';

export default function WasteManagementPage() {
  const [wastes, setWastes] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // --- RÉCUPÉRATION DES FLUX SDE ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [wRes, sRes] = await Promise.all([
        apiClient.get('/wastes'), 
        apiClient.get('/sites')
      ]);
      setWastes(wRes.data?.data || wRes.data || []);
      setSites(sRes.data?.data || sRes.data || []);
    } catch (e) { 
      toast.error("ERREUR CRITIQUE : REGISTRE DÉCHETS MATRIX INACCESSIBLE"); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- MOTEUR DE CALCUL IPE §8.1 ---
  const stats = useMemo(() => {
    const filtered = wastes.filter(w => selectedSite === 'ALL' || w.WAS_SiteId === selectedSite);
    const total = filtered.reduce((s, w) => s + (Number(w.WAS_Weight) || 0), 0);
    const recyclable = filtered.filter(w => (w.WAS_Type + w.WAS_Treatment).toLowerCase().includes('recycl')).reduce((s, w) => s + (Number(w.WAS_Weight) || 0), 0);
    const hazardous = filtered.filter(w => (w.WAS_Type||'').toLowerCase().match(/danger|toxique|chim/)).reduce((s, w) => s + (Number(w.WAS_Weight) || 0), 0);
    
    return { 
      total, 
      recyclable, 
      hazardous, 
      rate: total > 0 ? Math.round((recyclable / total) * 100) : 0 
    };
  }, [wastes, selectedSite]);

  const filteredWastes = useMemo(() => {
    return wastes.filter(w => {
      const matchSite = selectedSite === 'ALL' || w.WAS_SiteId === selectedSite;
      const matchSearch = (w.WAS_Type + w.WAS_Label).toLowerCase().includes(searchTerm.toLowerCase());
      return matchSite && matchSearch;
    });
  }, [wastes, selectedSite, searchTerm]);

  if (loading) return <LoadingScreen label="Scanning Waste Registry §8.1..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-emerald-500/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER SDE (Fixe) */}
      <header className="shrink-0 p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 mt-12 lg:mt-0 bg-[#0B0F1A]/95 backdrop-blur-xl z-30">
        <div className="text-left space-y-2">
          <div className="flex items-center gap-3">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
             <p className="text-slate-500 text-[9px] tracking-[0.4em] m-0">Traçabilité Flux §8.1 • Master Node</p>
          </div>
          <h1 className="text-3xl lg:text-5xl font-black tracking-tighter m-0 leading-none">
            Gestion <span className="text-emerald-500">Déchets</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button onClick={() => setIsFormOpen(true)} className="flex-1 md:flex-none bg-emerald-600 px-8 py-4 rounded-2xl text-[10px] shadow-2xl flex items-center justify-center gap-3 hover:bg-white hover:text-emerald-600 transition-all border-none cursor-pointer">
            <Plus size={18} strokeWidth={3} /> Nouveau Flux
          </button>
        </div>
      </header>

      {/* 📜 WORKZONE (Occupation Intégrale / Scroll Interne) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-8">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <WasteTile label="Volume Total" val={`${stats.total} kg`} icon={Trash2} color="rose" />
          <WasteTile label="Valorisé" val={`${stats.recyclable} kg`} icon={Recycle} color="emerald" />
          <WasteTile label="Taux Valorisation" val={`${stats.rate}%`} icon={TrendingUp} color="emerald" progress={stats.rate} />
          <WasteTile label="Déchets Dangereux" val={`${stats.hazardous} kg`} icon={AlertTriangle} color="amber" alert={stats.hazardous > 0} />
        </div>

        {/* Matrix Dashboard Box */}
        <div className="bg-[#151B2B] border-2 border-white/5 rounded-[3.5rem] overflow-hidden shadow-4xl flex flex-col">
          <div className="p-8 bg-black/20 flex flex-col xl:flex-row justify-between gap-6 items-center">
            <div className="flex items-center gap-4 text-emerald-500">
               <BarChart3 size={24} />
               <h3 className="text-xl font-black m-0 leading-none">Registre de Traçabilité</h3>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  placeholder="Chercher un flux..." 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-[10px] font-black italic outline-none focus:border-emerald-500 text-white"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                value={selectedSite} 
                onChange={e => setSelectedSite(e.target.value)} 
                className="bg-black/40 border border-white/10 rounded-xl px-6 py-3 text-[10px] font-black italic outline-none focus:border-emerald-500 text-white cursor-pointer"
              >
                <option value="ALL">Tous les Sites</option>
                {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-200">
              <thead>
                <tr className="bg-black/40 text-[9px] text-slate-500 tracking-[0.2em] border-b border-white/5 font-black italic">
                  <th className="px-8 py-5">Identifiant / Site</th>
                  <th className="px-8 py-5">Type de Flux</th>
                  <th className="px-8 py-5 text-center">Quantité (kg)</th>
                  <th className="px-8 py-5 text-center">Traitement ISO</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredWastes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center opacity-10 text-xl tracking-[1em] font-black italic">Registre Vierge</td>
                  </tr>
                ) : (
                  filteredWastes.map(w => (
                    <tr key={w.WAS_Id} className="hover:bg-emerald-600/5 transition-all group">
                      <td className="px-8 py-6">
                        <p className="text-sm font-black m-0 leading-none">{w.WAS_Month}/{w.WAS_Year}</p>
                        <p className="text-[9px] text-slate-600 mt-1 m-0 tracking-widest">{w.WAS_Site?.S_Name || 'Site non défini'}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          {w.WAS_Type?.match(/danger|tox/i) ? <AlertTriangle size={14} className="text-amber-500"/> : <Recycle size={14} className="text-emerald-500"/>}
                          <span className="text-[11px] font-black">{w.WAS_Type}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center text-2xl font-black italic tracking-tighter">
                        {w.WAS_Weight.toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="px-4 py-2 bg-white/5 border border-white/5 rounded-full text-[8px] tracking-widest text-slate-400">
                          {w.WAS_Treatment}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={async () => { if(confirm('SCELLAGE : CONFIRMER SUPPRESSION ?')) { await apiClient.delete(`/wastes/${w.WAS_Id}`); fetchData(); } }} 
                              className="p-3 bg-rose-600/10 text-rose-500 rounded-xl border-none cursor-pointer hover:bg-rose-600 hover:text-white transition-all"
                            >
                              <Trash2 size={16}/>
                            </button>
                            <button className="p-3 bg-white/5 text-slate-500 rounded-xl border-none cursor-pointer hover:text-white transition-all">
                              <ChevronRight size={16}/>
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {isFormOpen && <WasteForm sites={sites} onClose={() => setIsFormOpen(false)} onSuccess={fetchData} />}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      ` }} />
    </div>
  );
}

// ========================
// 🛠️ SOUS-COMPOSANTS LOCAUX
// ========================

/**
 * LoadingScreen : Correction jsx-no-undef
 */
function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 lg:pl-72">
      <RefreshCcw className="animate-spin text-emerald-500" size={60} strokeWidth={1} />
      <span className="text-[10px] font-black uppercase tracking-[1em] text-emerald-500 animate-pulse italic text-center px-6">
        {label}
      </span>
    </div>
  );
}

/**
 * WasteTile : Carte KPI Matrix
 */
function WasteTile({ label, val, icon: Icon, color, progress, alert }: any) {
  const themes: any = { 
    rose: "text-rose-500 border-rose-500/20", 
    emerald: "text-emerald-500 border-emerald-500/20", 
    amber: "text-amber-500 border-amber-500/20" 
  };
  
  return (
    <div className={cn(
      "p-8 rounded-[2.5rem] border-2 bg-[#151B2B] transition-all hover:scale-[1.02] group shadow-4xl", 
      themes[color],
      alert ? "animate-pulse border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.1)]" : "border-white/5"
    )}>
      <div className="flex justify-between items-center mb-6">
        <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
          <Icon size={24} />
        </div>
        {progress !== undefined && (
          <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      <p className="text-[10px] text-slate-500 mb-2 tracking-[0.2em] font-black italic m-0">{label}</p>
      <h3 className="text-3xl font-black italic m-0 tracking-tighter text-white leading-none">
        {val}
      </h3>
    </div>
  );
}