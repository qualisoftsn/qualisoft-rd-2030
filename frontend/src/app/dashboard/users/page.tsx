/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 👤 MODULE : GESTION DES AGENTS (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Ressources Humaines et Habilitations SMI.
 * CONFORMITÉ : ISO 9001 §7.2 (Compétences).
 * DESIGN : 100dvh / Table High-Density / Zero-Scroll.
 * ---------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 23:20 GMT
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Users, UserPlus, Building2, Edit, Activity, 
  RefreshCw, Search, ShieldCheck 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch { toast.error('Échec de synchronisation SDE Matrix.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const active = users.filter(u => u.U_IsActive).length;
    return { total: users.length, active, rate: users.length > 0 ? Math.round((active / users.length) * 100) : 0 };
  }, [users]);

  const filtered = useMemo(() => users.filter(u => 
    `${u.U_FirstName} ${u.U_LastName} ${u.U_Email} ${u.U_Role}`.toLowerCase().includes(search.toLowerCase())
  ), [users, search]);

  if (loading) return <ViewLoader label="Synchronisation SDE Matrix §7.2..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="shrink-0 p-8 border-b border-white/5 bg-black/40 flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2">
          <div className="flex gap-3">
             <span className="bg-blue-600/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full text-[9px] tracking-widest italic">ISO 9001 §7.2</span>
             <span className="bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-[9px] tracking-widest italic">{stats.active} ACTIFS</span>
          </div>
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic">Gestion <span className="text-blue-600">Agents</span></h1>
          <p className="text-slate-500 text-[9px] tracking-[0.3em] m-0 mt-1 italic">Pilotage des habilitations et compétences</p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchData} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:text-blue-500 cursor-pointer"><RefreshCw size={18}/></button>
          <button onClick={() => router.push('/dashboard/users/nouveau')} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-[10px] border-none cursor-pointer hover:bg-white hover:text-blue-600 transition-all flex items-center gap-3">
            <UserPlus size={18} /> NOUVEL AGENT
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col p-8 gap-8">
        {/* KPI QUICKBAR */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
           <KPIBox label="Effectif Total" val={stats.total} icon={Users} color="blue" />
           <KPIBox label="Taux Habilitation" val={`${stats.rate}%`} icon={Activity} color="emerald" />
           <KPIBox label="Structure Sites" val={4} icon={Building2} color="amber" />
           <KPIBox label="Security Status" val="OK" icon={ShieldCheck} color="indigo" />
        </div>

        <div className="shrink-0 relative max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="RECHERCHER UN PROFIL..." className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-6 pl-16 pr-8 text-[10px] font-black italic text-white focus:border-blue-500 outline-none transition-all shadow-inner" />
        </div>

        <div className="flex-1 bg-slate-900/40 rounded-[3.5rem] border border-white/5 overflow-hidden shadow-4xl backdrop-blur-3xl">
           <div className="h-full overflow-y-auto custom-scrollbar">
              <table className="w-full text-left italic border-collapse">
                 <thead className="sticky top-0 bg-[#0B0F1A] border-b border-white/5 z-10 text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">
                    <tr>
                       <th className="p-8">Agent</th>
                       <th className="p-8">Privilège</th>
                       <th className="p-8">Périmètre</th>
                       <th className="p-8 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 font-black uppercase">
                    {filtered.map((user) => (
                       <tr key={user.U_Id} className={cn("hover:bg-blue-600/5 group transition-colors", !user.U_IsActive && "opacity-30 grayscale")}>
                          <td className="p-8">
                             <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                   {user.U_FirstName?.charAt(0)}{user.U_LastName?.charAt(0)}
                                </div>
                                <div className="text-left">
                                   <p className="text-xl tracking-tighter text-white m-0 group-hover:text-blue-500 transition-colors">{user.U_FirstName} {user.U_LastName}</p>
                                   <p className="text-[10px] text-slate-500 mt-1 lowercase font-bold opacity-60 m-0">{user.U_Email}</p>
                                </div>
                             </div>
                          </td>
                          <td className="p-8"><span className="text-[9px] px-3 py-1 bg-white/5 border border-white/10 rounded-lg">{user.U_Role}</span></td>
                          <td className="p-8 text-slate-400 text-[10px]">{user.U_Site?.S_Name || 'Master Root'}</td>
                          <td className="p-8 text-right">
                             <button onClick={() => router.push(`/dashboard/users/${user.U_Id}`)} className="p-4 bg-white/5 hover:bg-blue-600 rounded-2xl text-slate-400 hover:text-white transition-all border-none cursor-pointer"><Edit size={16}/></button>
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

function KPIBox({ label, val, icon: Icon, color }: any) {
  const colors: any = { blue: "text-blue-500", emerald: "text-emerald-500", amber: "text-amber-500", indigo: "text-indigo-500" };
  return (
    <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center shadow-2xl">
       <div className={cn("p-4 rounded-2xl border border-white/5 mb-6", colors[color])}><Icon size={24} /></div>
       <p className="text-[9px] text-slate-500 tracking-widest italic m-0">{label}</p>
       <p className="text-4xl font-black italic m-0 mt-2 text-white tracking-tighter">{val}</p>
    </div>
  );
}

function ViewLoader({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}