/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 MODULE : GESTION DES CONSOMMATIONS §9.1.1 (elite-sde)
 * DATE : 05 Mars 2026 | 13:42 GMT
 */
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Zap, Plus, Search, Droplets, TrendingUp, 
  Target, Trash2, RefreshCcw} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import ConsumptionForm from './ConsumptionForm';

export default function ConsumptionManagementPage() {
  const [consumptions, setConsumptions] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSite, setSelectedSite] = useState('ALL');

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
      toast.error("ÉCHEC SYNCHRO MATRIX §9.1.1");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- MOTEUR STATISTIQUE SDE ---
  const stats = useMemo(() => {
    const filtered = consumptions.filter(c => selectedSite === 'ALL' || c.CON_SiteId === selectedSite);
    const energy = filtered.filter(c => (c.CON_Type||'').match(/éner|elect|carbu/i)).reduce((s, c) => s + (Number(c.CON_Value) || 0), 0);
    const water = filtered.filter(c => (c.CON_Type||'').match(/eau|water/i)).reduce((s, c) => s + (Number(c.CON_Value) || 0), 0);
    const cost = filtered.reduce((s, c) => s + (Number(c.CON_Cost) || 0), 0);

    return {
      totalEnergy: Math.round(energy),
      totalWater: Math.round(water),
      totalCost: cost.toLocaleString(),
      efficiency: energy > 0 ? Math.min(100, Math.round((energy / 10000) * 100)) : 0
    };
  }, [consumptions, selectedSite]);

  if (loading) return <LoadingScreen label="Calcul des indices §9.1.1..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-amber-500/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2">
          <h1 className="text-4xl lg:text-5xl tracking-tighter m-0">Suivi <span className="text-amber-500">Consommations</span></h1>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] m-0">Management Énergie • ISO 14001</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-amber-600 px-10 py-5 rounded-3xl text-[11px] shadow-2xl flex items-center gap-4 hover:bg-white hover:text-amber-600 transition-all border-none cursor-pointer">
          <Plus size={20} strokeWidth={3} /> Nouvelle Saisie
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-8">
        {/* KPI Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatTile label="Énergie" val={`${stats.totalEnergy} kWh`} icon={Zap} color="amber" progress={stats.efficiency} />
          <StatTile label="Eau" val={`${stats.totalWater} m³`} icon={Droplets} color="blue" />
          <StatTile label="Coût Total" val={`${stats.totalCost} XOF`} icon={TrendingUp} color="emerald" />
          <StatTile label="Seuil Critique" val="12k kWh" icon={Target} color="rose" />
        </div>

        {/* Registry Matrix */}
        <div className="bg-[#151B2B] border-2 border-white/5 rounded-[3.5rem] overflow-hidden shadow-4xl flex flex-col">
          <div className="p-8 bg-black/20 flex flex-col md:flex-row justify-between gap-6">
            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
               <input placeholder="Filtrer le registre..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black italic outline-none focus:border-amber-500 text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <select value={selectedSite} onChange={e => setSelectedSite(e.target.value)} className="bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black italic outline-none focus:border-amber-500 text-white cursor-pointer">
              <option value="ALL">Périmètre Global</option>
              {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 text-[9px] text-slate-500 tracking-[0.2em] border-b border-white/5 font-black italic">
                  <th className="px-8 py-5">Période / Site</th>
                  <th className="px-8 py-5 text-center">Ressource</th>
                  <th className="px-8 py-5 text-center">Quantité</th>
                  <th className="px-8 py-5 text-center">Coût (XOF)</th>
                  <th className="px-8 py-5 text-right">Pilotage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {consumptions.filter(c => (c.CON_Type + c.CON_SiteId).toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                  <tr key={c.CON_Id} className="hover:bg-amber-600/5 transition-all group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-black m-0 leading-none">{c.CON_Month}/{c.CON_Year}</p>
                      <p className="text-[9px] text-slate-600 mt-1 m-0">{c.CON_Site?.S_Name || 'Master Site'}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-4 py-2 bg-white/5 border border-white/5 rounded-full text-[9px] text-amber-500">{c.CON_Type}</span>
                    </td>
                    <td className="px-8 py-6 text-center text-xl font-black">{c.CON_Value.toLocaleString()} <span className="text-[10px] text-slate-600">{c.CON_Unit}</span></td>
                    <td className="px-8 py-6 text-center text-emerald-500 font-black">{c.CON_Cost?.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right opacity-0 group-hover:opacity-100 transition-all">
                       <button onClick={async () => { if(confirm('SCELLAGE : SUPPRIMER ?')) { await apiClient.delete(`/consumptions/${c.CON_Id}`); fetchData(); } }} className="p-3 bg-rose-600/10 text-rose-500 rounded-xl border-none cursor-pointer"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {isFormOpen && <ConsumptionForm sites={sites} onClose={() => setIsFormOpen(false)} onSuccess={fetchData} />}
    </div>
  );
}

// --- SOUS-COMPOSANTS ---
function StatTile({ label, val, icon: Icon, color, progress }: any) {
  const colors: any = { amber: "text-amber-500 bg-amber-500/5", blue: "text-blue-500 bg-blue-500/5", emerald: "text-emerald-500 bg-emerald-500/5", rose: "text-rose-500 bg-rose-500/5" };
  return (
    <div className={cn("p-8 rounded-[2.5rem] border-2 border-white/5 transition-all hover:scale-105", colors[color])}>
      <div className="flex justify-between items-center mb-6">
        <div className="p-4 bg-white/5 rounded-2xl"><Icon size={24}/></div>
        {progress !== undefined && <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-current" style={{width: `${progress}%`}}/></div>}
      </div>
      <p className="text-[10px] text-slate-500 mb-2 tracking-widest">{label}</p>
      <h3 className="text-3xl font-black italic m-0 tracking-tighter text-white">{val}</h3>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 lg:pl-72">
      <RefreshCcw className="animate-spin text-amber-500" size={60} />
      <span className="text-[10px] font-black uppercase tracking-[1em] text-amber-500 animate-pulse italic">{label}</span>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
