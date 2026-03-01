/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { Loader2, ShieldCheck, TrendingUp, Clock, User, Wallet, AlertOctagon, Zap, Fingerprint, Search, Crown, Globe, Terminal, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TenantMaster { 
  T_Id: string; T_Name: string; T_CeoName?: string; T_SubscriptionStatus: string; T_Plan: string; 
  _count?: { T_Users: number; T_Sites: number; }; // ✅ Ajouté pour correspondre à AdminMatrixController
}
interface MasterData { tenants: TenantMaster[]; stats: any; }

export default function SuperAdminMasterConsole() {
  const router = useRouter();
  const [data, setData] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storageRaw = localStorage.getItem('qualisoft-auth-storage');
    if (storageRaw) {
      const parsed = JSON.parse(storageRaw);
      if (parsed.state?.user) setCurrentUser(parsed.state.user);
    }
  }, []);

  const isMasterAdmin = useMemo(() => currentUser?.U_Role === 'SUPER_ADMIN' || currentUser?.U_Email === 'ab.thiongane@qualisoft.sn', [currentUser]);

  const fetchData = useCallback(async () => {
    if (!isMasterAdmin) return;
    try {
      setLoading(true);
      // 🚩 CORRECTION : On appelle la route exacte définie dans AdminMatrixController (@Get())
      const res = await apiClient.get<TenantMaster[]>('/admin/matrix'); 
      if (res.data) {
        setData({
          tenants: res.data,
          stats: { totalRevenue: 75000000, projections24Months: 180000000, pendingRevenue: 15000000, openTickets: 2, revenueHistory: [{ month: 'JAN', amount: 5000000 }, { month: 'FEV', amount: 8000000 }, { month: 'MAR', amount: 12000000 }] }
        });
      }
    } catch (error) { toast.error("Rupture de liaison Master"); } finally { setLoading(false); }
  }, [isMasterAdmin]);

  useEffect(() => { if (isMounted && isMasterAdmin) fetchData(); }, [fetchData, isMounted, isMasterAdmin]);

  const filteredTenants = useMemo(() => data?.tenants.filter((t) => t.T_Name?.toLowerCase().includes(searchTerm.toLowerCase())) || [], [data, searchTerm]);

  if (!isMounted) return null;
  if (!isMasterAdmin) return <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-red-600 uppercase font-black italic ml-72"><AlertOctagon size={80} className="mb-8" />ACCÈS RÉSERVÉ À L&apos;ARCHITECTE</div>;
  if (loading || !data) return <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase ml-72"><Loader2 className="animate-spin mb-4" size={50}/><span className="tracking-[0.8em] text-[10px]">Synchronisation Master...</span></div>;

  return (
    <div className="p-12 bg-[#0B0F1A] min-h-screen text-white italic ml-72 overflow-y-auto text-left">
      <header className="mb-14 flex justify-between items-end border-b border-white/5 pb-12">
        <div>
          <div className="flex items-center gap-4 text-amber-500 font-black uppercase tracking-[0.5em] text-[11px] mb-4"><Fingerprint size={20} /> Autorité Master Qualisoft <Crown size={18} className="animate-pulse" /></div>
          <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none">Console <span className="text-blue-600">Master</span></h1>
        </div>
        <div className="relative w-112.5"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="RECHERCHER UNE INSTANCE..." className="w-full bg-black/40 border border-white/10 p-6 pl-16 rounded-4xl text-[12px] font-black uppercase outline-none text-white" /></div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
        <StatBlock title="Revenu Encaissé" value="75.000.000 XOF" icon={Wallet} color="emerald" />
        <StatBlock title="Projection 24M" value="180.000.000 XOF" icon={TrendingUp} color="blue" highlight />
        <StatBlock title="Flux en Attente" value="15.000.000 XOF" icon={Clock} color="amber" />
        <StatBlock title="Tickets" value="2" icon={AlertOctagon} color="red" />
      </div>

      <div className="bg-slate-900/40 border border-white/5 rounded-[4.5rem] overflow-hidden shadow-4xl backdrop-blur-3xl">
        <table className="w-full text-left italic">
          <thead className="bg-white/5 text-[11px] font-black uppercase text-slate-500 tracking-[0.4em]"><tr><th className="p-12">Instance</th><th className="p-12 text-center">Utilisateurs</th><th className="p-12 text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {filteredTenants.map((t) => (
              <tr key={t.T_Id} className="hover:bg-white/3 transition-all group">
                <td className="p-12"><p className="text-3xl font-black uppercase text-white tracking-tighter group-hover:text-blue-500">{t.T_Name}</p><p className="text-[11px] text-slate-600 mt-2 uppercase font-bold">Domaine: {t.T_Id}.sn</p></td>
                <td className="p-12 text-center"><span className="text-xl font-black">{t._count?.T_Users || 0}</span></td>
                <td className="p-12 text-right"><button className="px-10 py-5 bg-blue-600 text-white rounded-4xl font-black uppercase text-[11px] flex items-center gap-4 ml-auto cursor-pointer shadow-lg"><Zap size={18}/> Gérer le Nœud</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatBlock({ title, value, icon: Icon, color, highlight = false }: any) {
  const themes: any = { blue: "text-blue-500 bg-blue-500/10 border-blue-500/20", emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", amber: "text-amber-500 bg-amber-500/10 border-amber-500/20", red: "text-red-500 bg-red-500/10 border-red-500/20" };
  return (
    <div className={`p-12 rounded-[4rem] border transition-all hover:scale-[1.03] ${highlight ? 'bg-blue-600 border-blue-400' : 'bg-slate-900/60 border-white/5'}`}>
      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-10 border ${highlight ? 'bg-white/20 text-white border-white/30' : themes[color]}`}><Icon size={32} /></div>
      <p className={`text-[11px] font-black uppercase tracking-[0.5em] mb-4 italic ${highlight ? 'text-blue-100' : 'text-slate-600'}`}>{title}</p>
      <p className="text-5xl font-black italic tracking-tighter text-white leading-none">{value}</p>
    </div>
  );
}