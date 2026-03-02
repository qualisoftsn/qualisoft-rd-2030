/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { Loader2, TrendingUp, Clock, Wallet, AlertOctagon, Zap, Search } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { TenantMaster } from '../page';

interface MasterStats { totalRevenue: number; projections24Months: number; pendingRevenue: number; openTickets: number; }
interface MasterData { tenants: TenantMaster[]; stats: MasterStats; }

export default function ConsoleView() {
  const [data, setData] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<TenantMaster[]>('/admin/matrix'); 
      if (res.data) {
        setData({
          tenants: res.data,
          stats: { totalRevenue: 75000000, projections24Months: 180000000, pendingRevenue: 15000000, openTickets: 2 }
        });
      }
    } catch (error) { 
      toast.error("Rupture de liaison avec l'API Master"); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredTenants = useMemo(() => data?.tenants.filter((t) => t.T_Name?.toLowerCase().includes(searchTerm.toLowerCase())) || [], [data, searchTerm]);

  if (loading || !data) return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-blue-500 font-black italic uppercase">
      <Loader2 className="animate-spin w-12 h-12 mb-4" />
      <span className="tracking-[0.5em] text-[10px]">Synchronisation Master...</span>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 lg:p-12 text-left">
      <Toaster position="top-right" theme="dark" richColors />
      <header className="mb-10 lg:mb-14 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8 lg:pb-12 animate-in fade-in duration-700">
        <div>
          <h1 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none m-0 text-white">Console <span className="text-blue-600">Master</span></h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] mt-3">Vue panoramique des instances</p>
        </div>
        <div className="relative w-full lg:w-100">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="RECHERCHER UNE INSTANCE..." className="w-full bg-black/40 border border-white/10 p-4 lg:p-5 pl-14 rounded-2xl lg:rounded-3xl text-[10px] lg:text-[11px] font-black uppercase outline-none text-white focus:border-blue-500 transition-colors shadow-inner" />
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 mb-12 lg:mb-16 animate-in slide-in-from-bottom-8">
        <StatBlock title="Revenu Encaissé" value={`${(data.stats.totalRevenue).toLocaleString('fr-FR')} XOF`} icon={Wallet} color="emerald" />
        <StatBlock title="Projection 24M" value={`${(data.stats.projections24Months).toLocaleString('fr-FR')} XOF`} icon={TrendingUp} color="blue" highlight />
        <StatBlock title="Flux en Attente" value={`${(data.stats.pendingRevenue).toLocaleString('fr-FR')} XOF`} icon={Clock} color="amber" />
        <StatBlock title="Tickets Ouverts" value={data.stats.openTickets.toString()} icon={AlertOctagon} color="red" />
      </div>

      <div className="bg-slate-900/40 border border-white/5 rounded-4xl lg:rounded-[3.5rem] overflow-hidden shadow-2xl backdrop-blur-3xl animate-in slide-in-from-bottom-12">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left italic min-w-175">
            <thead className="bg-white/5 text-[9px] lg:text-[11px] font-black uppercase text-slate-500 tracking-[0.3em] lg:tracking-[0.4em]">
              <tr>
                <th className="p-6 lg:p-10">Instance</th>
                <th className="p-6 lg:p-10 text-center">Utilisateurs</th>
                <th className="p-6 lg:p-10 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTenants.map((t) => (
                <tr key={t.T_Id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-6 lg:p-10">
                    <p className="text-xl lg:text-3xl font-black uppercase text-white tracking-tighter group-hover:text-blue-500 m-0 leading-none">{t.T_Name}</p>
                    <p className="text-[9px] lg:text-[11px] text-slate-500 mt-2 lg:mt-3 uppercase font-bold tracking-widest m-0">Domaine: {t.T_Id}.qualisoft.sn</p>
                  </td>
                  <td className="p-6 lg:p-10 text-center">
                    <span className="text-xl lg:text-2xl font-black text-white">{t._count?.T_Users || 0}</span>
                  </td>
                  <td className="p-6 lg:p-10 text-right">
                    <button className="px-6 py-3 lg:px-8 lg:py-4 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl lg:rounded-2xl font-black uppercase text-[9px] lg:text-[10px] flex items-center gap-3 ml-auto cursor-pointer transition-colors border border-blue-500/20 m-0">
                      <Zap size={16} className="shrink-0" /> Gérer le Nœud
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTenants.length === 0 && (
                <tr><td colSpan={3} className="p-16 text-center text-slate-600 font-black uppercase tracking-widest text-[10px]">Aucune instance trouvée.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ title, value, icon: Icon, color, highlight = false }: { title: string, value: string, icon: any, color: string, highlight?: boolean }) {
  const themes: Record<string, string> = { blue: "text-blue-500 bg-blue-500/10 border-blue-500/20", emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", amber: "text-amber-500 bg-amber-500/10 border-amber-500/20", red: "text-red-500 bg-red-500/10 border-red-500/20" };
  return (
    <div className={`p-8 lg:p-10 rounded-4xl lg:rounded-[3rem] border transition-transform hover:-translate-y-2 m-0 ${highlight ? 'bg-blue-600 border-blue-400 shadow-[0_15px_30px_rgba(37,99,235,0.3)]' : 'bg-slate-900/60 border-white/5 shadow-xl'}`}>
      <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl flex items-center justify-center mb-6 lg:mb-8 border ${highlight ? 'bg-white/20 text-white border-white/30' : themes[color]}`}>
        <Icon size={24} className="lg:w-8 lg:h-8" />
      </div>
      <p className={`text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] lg:tracking-[0.5em] mb-2 lg:mb-3 italic leading-none m-0 ${highlight ? 'text-blue-100' : 'text-slate-500'}`}>{title}</p>
      <p className="text-2xl lg:text-4xl xl:text-5xl font-black italic tracking-tighter text-white leading-none m-0 truncate" title={value}>{value}</p>
    </div>
  );
}