/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🖥️ MODULE : CONSOLE MASTER VIEW (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Monitoring financier et technique global.
 * DESIGN : 100dvh Isolated Scroll / High-Density.
 * DATE : 05 Mars 2026 | 22:35 GMT
 */

"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { TrendingUp, Clock, Wallet, AlertOctagon, Zap, Search, RefreshCw } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

export default function ConsoleView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/matrix'); 
      setData({
        tenants: res.data?.data || res.data || [],
        stats: { totalRevenue: 75000000, projections24Months: 180000000, pendingRevenue: 15000000, openTickets: 2 }
      });
    } catch { toast.error("Rupture de liaison API Master"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => data?.tenants.filter((t: any) => t.T_Name?.toLowerCase().includes(searchTerm.toLowerCase())) || [], [data, searchTerm]);

  if (loading) return <ViewLoader label="Synchronisation du Cluster..." />;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Toaster position="top-right" theme="dark" richColors />
      <header className="shrink-0 p-8 lg:p-12 border-b border-white/5 bg-black/20 flex flex-col xl:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter m-0 leading-none uppercase">Console <span className="text-blue-600">Master</span></h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.5em] mt-4">Niveau de contrôle : Souverain</p>
        </div>
        <div className="relative w-full xl:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="RECHERCHER INSTANCE..." className="w-full bg-black/40 border border-white/10 p-5 pl-14 rounded-3xl text-[10px] font-black uppercase text-white focus:border-blue-600 transition-all outline-none" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
        <div className="max-w-400 mx-auto space-y-12">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            <StatBlock title="Revenu Encaissé" value={`${(data.stats.totalRevenue).toLocaleString()} XOF`} icon={Wallet} color="emerald" />
            <StatBlock title="Projection 24M" value={`${(data.stats.projections24Months).toLocaleString()} XOF`} icon={TrendingUp} color="blue" highlight />
            <StatBlock title="Flux en Attente" value={`${(data.stats.pendingRevenue).toLocaleString()} XOF`} icon={Clock} color="amber" />
            <StatBlock title="Tickets Ouverts" value={data.stats.openTickets} icon={AlertOctagon} color="red" />
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] overflow-hidden shadow-4xl backdrop-blur-3xl">
            <table className="w-full text-left italic border-collapse">
              <thead className="bg-white/5 text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">
                <tr>
                  <th className="p-8 lg:p-10">Identité de l&apos;Instance</th>
                  <th className="p-8 text-center">Nœuds Actifs</th>
                  <th className="p-8 text-right">Action Master</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-black uppercase">
                {filtered.map((t: any) => (
                  <tr key={t.T_Id} className="hover:bg-blue-600/5 group transition-colors">
                    <td className="p-8 lg:p-10">
                      <p className="text-2xl lg:text-3xl tracking-tighter text-white m-0 group-hover:text-blue-500 transition-colors">{t.T_Name}</p>
                      <p className="text-[10px] text-slate-500 mt-2 tracking-widest opacity-60 m-0">Root: {t.T_Id}.qualisoft.sn</p>
                    </td>
                    <td className="p-8 text-center text-3xl text-white">{t._count?.T_Users || 0}</td>
                    <td className="p-8 text-right">
                      <button className="px-8 py-4 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-2xl font-black text-[9px] border border-blue-500/20 cursor-pointer flex items-center gap-3 ml-auto transition-all">
                        <Zap size={16} /> Gérer le Nœud
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function StatBlock({ title, value, icon: Icon, color, highlight }: any) {
  const colors: any = { blue: "text-blue-500 bg-blue-500/10", emerald: "text-emerald-500 bg-emerald-500/10", amber: "text-amber-500 bg-amber-500/10", red: "text-red-500 bg-red-500/10" };
  return (
    <div className={cn("p-10 rounded-[3.5rem] border flex flex-col items-start transition-all shadow-2xl", highlight ? "bg-blue-600 border-blue-400" : "bg-slate-900/60 border-white/5")}>
      <div className={cn("p-5 rounded-3xl mb-8", highlight ? "bg-white/20 text-white" : colors[color])}><Icon size={30} /></div>
      <p className={cn("text-[10px] tracking-[0.4em] mb-4 m-0", highlight ? "text-blue-100" : "text-slate-500")}>{title}</p>
      <p className="text-3xl lg:text-4xl font-black italic tracking-tighter text-white m-0">{value}</p>
    </div>
  );
}

function ViewLoader({ label }: { label: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-blue-600 italic font-black uppercase gap-6">
      <RefreshCw className="animate-spin" size={50} />
      <span className="text-[10px] tracking-[0.5em] animate-pulse">{label}</span>
    </div>
  );
}