/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 👥 MODULE : src/app/(dashboard)/users/page.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Gestion des ressources humaines et habilitations.
 * FONCTION : Pilotage des qualifications et des accès SMI.
 * CONFORMITÉ : ISO 9001 §7.2 (Compétences).
 * SÉCURITÉ : Zéro NextAuth. Architecture Multi-Tenant isolée.
 * DATE DE RÉVISION : 02 Mars 2026 | 16:15 GMT
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Users, UserPlus, Building2, GitBranch, Edit, Activity, 
  Database, RefreshCw, Search, Trash2, Loader2, ShieldCheck, Target 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resUsers, resSites] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/sites'),
      ]);
      setUsers(Array.isArray(resUsers.data) ? resUsers.data : (resUsers.data?.data || []));
      setSites(Array.isArray(resSites.data) ? resSites.data : (resSites.data?.data || []));
    } catch (err) {
      toast.error('Échec du chargement des profils agents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = users.length;
    const activeCount = users.filter(u => u.U_IsActive).length;
    return {
      total,
      active: activeCount,
      rate: total > 0 ? Math.round((activeCount / total) * 100) : 0
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.U_FirstName?.toLowerCase().includes(search.toLowerCase()) ||
      u.U_LastName?.toLowerCase().includes(search.toLowerCase()) ||
      u.U_Email.toLowerCase().includes(search.toLowerCase()) ||
      u.U_Role.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const handleDelete = async (userId: string) => {
    if (!confirm('⚠️ ARCHIVAGE : Confirmer la désactivation du compte agent ?')) return;
    try {
      setIsDeleting(userId);
      await apiClient.delete(`/users/${userId}`);
      toast.success('Agent archivé (accès révoqué).');
      fetchData();
    } catch (err) {
      toast.error("Erreur lors de l'archivage.");
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) return (
    <div className="ml-0 lg:ml-72 flex min-h-screen items-center justify-center bg-[#0B0F1A] italic">
      <div className="text-center text-blue-500">
        <Loader2 className="h-12 w-12 animate-spin mx-auto" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.5em]">Synchronisation SDE Matrix...</p>
      </div>
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 bg-[#0B0F1A] min-h-screen p-4 lg:p-8 font-sans italic text-left text-white overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      <div className="mx-auto max-w-7xl space-y-8 lg:space-y-12">
        <header className="border-b border-white/5 pb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-4">
            <div className="flex gap-3">
               <span className="bg-blue-600/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full text-[8px] lg:text-[9px] font-black uppercase tracking-widest italic leading-none m-0 flex items-center">ISO 9001 §7.2</span>
               <span className="bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-[8px] lg:text-[9px] font-black uppercase tracking-widest italic leading-none m-0 flex items-center">{stats.active} ACTIFS</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter m-0 leading-none">Gestion <span className="text-blue-600">Agents</span></h1>
            <p className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-[0.4em] italic m-0">Pilotage des habilitations et compétences</p>
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            <button onClick={fetchData} className="p-4 lg:p-5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all cursor-pointer"><RefreshCw size={20} /></button>
            <button onClick={() => router.push('/dashboard/users/nouveau')} className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 px-8 py-4 lg:py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border-none cursor-pointer text-white shadow-xl"><UserPlus size={18} /> Nouvel Agent</button>
          </div>
        </header>

        {/* STATS RAPIDES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
           <KPIStat title="Effectif" value={stats.total} icon={Users} color="blue" />
           <KPIStat title="Taux" value={`${stats.rate}%`} icon={Activity} color="emerald" />
           <KPIStat title="Sites" value={sites.length} icon={Building2} color="amber" />
           <KPIStat title="Status" value="OK" icon={ShieldCheck} color="indigo" />
        </div>

        {/* FILTERS */}
        <div className="bg-slate-900/40 p-2 rounded-2xl lg:rounded-4xl border border-white/5 shadow-inner">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="RECHERCHER UN PROFIL (NOM, RÔLE, EMAIL...)" className="w-full bg-transparent border-none py-5 lg:py-6 pl-16 pr-6 text-[10px] lg:text-xs font-black uppercase tracking-widest text-white outline-none italic" />
           </div>
        </div>

        {/* TABLE */}
        <div className="bg-slate-900/40 rounded-[2.5rem] lg:rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-3xl">
           <div className="overflow-x-auto">
              <table className="w-full text-left italic border-collapse">
                 <thead>
                    <tr className="bg-white/5 text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest">
                       <th className="px-8 py-6">Agent</th>
                       <th className="px-8 py-6">Privilège</th>
                       <th className="px-8 py-6">Périmètre</th>
                       <th className="px-8 py-6">Statut</th>
                       <th className="px-8 py-6 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((user) => (
                       <tr key={user.U_Id} className={`group hover:bg-white/5 transition-all ${!user.U_IsActive && 'opacity-30 grayscale'}`}>
                          <td className="px-8 py-6 whitespace-nowrap">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">{user.U_FirstName?.charAt(0)}{user.U_LastName?.charAt(0)}</div>
                                <div>
                                   <p className="text-sm font-black uppercase m-0 leading-none">{user.U_FirstName} {user.U_LastName}</p>
                                   <p className="text-[9px] text-slate-500 mt-2 m-0 lowercase italic">{user.U_Email}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6"><span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 border border-white/5 rounded-full">{user.U_Role}</span></td>
                          <td className="px-8 py-6"><span className="text-[10px] font-bold text-slate-400 uppercase italic m-0 flex items-center gap-2 truncate max-w-37.5">{user.U_Site?.S_Name || 'Master Root'}</span></td>
                          <td className="px-8 py-6"><span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${user.U_IsActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500'}`}>{user.U_IsActive ? 'Actif' : 'Révoqué'}</span></td>
                          <td className="px-8 py-6 text-right space-x-2">
                             <button onClick={() => router.push(`/dashboard/users/${user.U_Id}`)} className="p-3 bg-white/5 hover:bg-blue-600 rounded-xl transition-all border-none text-slate-400 hover:text-white cursor-pointer"><Edit size={16} /></button>
                             <button onClick={() => handleDelete(user.U_Id)} disabled={isDeleting === user.U_Id} className="p-3 bg-white/5 hover:bg-red-600 rounded-xl transition-all border-none text-slate-400 hover:text-white cursor-pointer">{isDeleting === user.U_Id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}</button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}

function KPIStat({ title, value, icon: Icon, color }: any) {
  const themes: any = { blue: "text-blue-500 bg-blue-500/10", emerald: "text-emerald-500 bg-emerald-500/10", amber: "text-amber-500 bg-amber-500/10", indigo: "text-indigo-500 bg-indigo-500/10" };
  return (
    <div className="bg-slate-900/40 p-6 lg:p-8 rounded-[2.5rem] lg:rounded-[3.5rem] border border-white/5 flex flex-col items-center justify-center transition-all hover:border-white/20">
       <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl flex items-center justify-center mb-6 border border-white/5 ${themes[color]}`}><Icon size={28} /></div>
       <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] italic m-0">{title}</p>
       <p className="text-3xl lg:text-5xl font-black italic m-0 mt-3 text-white tracking-tighter">{value}</p>
    </div>
  );
}