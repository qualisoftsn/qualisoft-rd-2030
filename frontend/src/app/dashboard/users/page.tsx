/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable react/no-unescaped-entities */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, UserPlus, Mail, Shield, MapPin, Trash2, Loader2, Search, 
  ShieldCheck, Building, GitBranch, Edit, Activity, Database,
  Fingerprint, Target, RefreshCw, LayoutGrid, Globe, Lock
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';
import { useRouter } from 'next/navigation';

// 🛡️ INTERFACE ALIGNÉE STRICTEMENT SUR types/elite-sde.ts
interface User {
  U_Id: string; 
  U_FirstName: string; 
  U_LastName: string; 
  U_Email: string;
  U_Role: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'PILOTE' | 'COPILOTE';
  U_IsActive: boolean;
  U_Site?: { S_Id: string; S_Name: string };
  U_OrgUnit?: { OU_Id: string; OU_Name: string };
  U_AssignedProcess?: { PR_Id: string; PR_Code: string; PR_Libelle: string };
  U_TenantId?: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<string>(''); 
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isSubdomain, setIsSubdomain] = useState(true);
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isRootDomain = hostname === 'qualisoft.sn' || hostname === 'www.qualisoft.sn' || hostname === 'localhost';
      setIsSubdomain(!isRootDomain);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resUsers, resTenants] = await Promise.all([
        apiClient.get('/users'),
        !isSubdomain && mounted ? apiClient.get('/tenants').catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
      ]);
      const usersData = resUsers.data?.data || resUsers.data || [];
      setUsers(usersData);
      setTenants(resTenants.data?.data || resTenants.data || []);
    } catch (e: any) { 
      toast.error("RUPTURE LIAISON RH : Échec de synchronisation SDE."); 
    } finally { 
      setLoading(false); 
    }
  }, [isSubdomain, mounted]);

  useEffect(() => { if (mounted) fetchData(); }, [fetchData, mounted]);

  const stats = useMemo(() => ({
    total: users.length,
    pilotes: users.filter(u => u.U_Role === 'PILOTE').length,
    admins: users.filter(u => ['ADMIN', 'SUPER_ADMIN'].includes(u.U_Role)).length,
    active: users.filter(u => u.U_IsActive).length
  }), [users]);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const content = `${u.U_FirstName} ${u.U_LastName} ${u.U_Email} ${u.U_Role} ${u.U_Site?.S_Name || ''}`.toLowerCase();
      const matchesSearch = content.includes(search.toLowerCase());
      const matchesTenant = selectedTenant ? u.U_TenantId === selectedTenant : true;
      return matchesSearch && matchesTenant;
    });
  }, [users, search, selectedTenant]);

  const handleDelete = async (id: string) => {
    if (!id) return toast.error("Identifiant de l'agent introuvable.");
    if (!confirm("⚠️ RÉVOCATION CRITIQUE : Retirer l'agent de la matrice ?")) return;
    try {
      setIsDeleting(id);
      await apiClient.delete(`/users/${id}`);
      toast.success("AGENT RÉVOQUÉ");
      fetchData();
    } catch { toast.error("ÉCHEC DE RÉVOCATION"); } 
    finally { setIsDeleting(null); }
  };

  if (loading || !mounted) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <span className="text-[9px] font-black uppercase tracking-[0.5em] text-blue-600 animate-pulse italic">Synchronisation Elite...</span>
    </div>
  );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-6 overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 shrink-0 w-full">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black uppercase tracking-tighter m-0 flex items-center gap-3">
              <Users className="text-blue-500" size={32}/> Annuaire <span className="text-blue-500">Master SDE</span>
            </h1>
            <div className={`px-3 py-1 rounded-full border flex items-center gap-2 text-[8px] font-black uppercase tracking-widest ${isSubdomain ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
              {isSubdomain ? <Lock size={10} /> : <Globe size={10} />}
              {isSubdomain ? 'Tenant-Isolated' : 'QS Matrix Global'}
            </div>
          </div>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] m-0 italic">ISO 9001 §7.2 • Qualification des Ressources</p>
        </div>

        <div className="flex gap-4">
          <button onClick={fetchData} className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg active:scale-95 cursor-pointer">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => router.push('/dashboard/users/nouveau')} className="bg-blue-600 hover:bg-white hover:text-blue-600 px-8 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-3 border-none transition-all cursor-pointer shadow-2xl shadow-blue-600/20 italic">
            <UserPlus size={18} strokeWidth={3} /> Habiliter Agent
          </button>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-4 mb-6 shrink-0 w-full">
        <KPIBox label="Effectif" value={stats.total} icon={<Database size={16}/>} color="blue" sub="Total SDE" />
        <KPIBox label="Pilotes" value={stats.pilotes} icon={<Target size={16}/>} color="emerald" sub="Process Owners" />
        <KPIBox label="Admins" value={stats.admins} icon={<ShieldCheck size={16}/>} color="indigo" sub="SMI Authority" />
        <KPIBox label="Activés" value={`${Math.round((stats.active/stats.total)*100 || 0)}%`} icon={<Activity size={16}/>} color="blue" sub="Active Status" />
      </div>

      <div className="flex gap-4 mb-6 shrink-0 w-full">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="RECHERCHER DANS LA MATRICE..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[11px] font-black uppercase outline-none focus:border-blue-600 italic tracking-wider" />
        </div>
        {!isSubdomain && (
          <div className="w-1/3 relative">
            <select value={selectedTenant} onChange={(e) => setSelectedTenant(e.target.value)} className="w-full h-full bg-blue-600/10 border border-blue-500/20 rounded-2xl py-4 pl-6 pr-12 text-[11px] font-black uppercase outline-none focus:border-blue-500 appearance-none cursor-pointer text-blue-400 italic">
              <option value="">🌍 TOUS LES TENANTS</option>
              {tenants.map((t: any) => <option key={t.T_Id} value={t.T_Id}>{t.T_Name}</option>)}
            </select>
            <Globe size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
          </div>
        )}
      </div>

      <main className="flex-1 min-h-0 bg-[#151A2D] border border-white/5 rounded-[3rem] overflow-hidden shadow-4xl relative w-full flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 w-full">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#151A2D] z-20 border-b border-white/10">
              <tr className="text-[8px] text-slate-500 uppercase font-black italic tracking-[0.2em]">
                <th className="px-8 py-5 text-left">Collaborateur</th>
                <th className="px-8 py-5 text-center">Habilitation</th>
                <th className="px-8 py-5 text-left">Périmètre ISO</th>
                <th className="px-8 py-5 text-right">Pilotage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px]">
              {filtered.map(user => (
                <tr key={user.U_Id} className={`group hover:bg-blue-600/5 transition-all ${!user.U_IsActive ? 'opacity-30' : ''}`}>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-blue-600/10 flex items-center justify-center font-black text-blue-500 border border-blue-500/20 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {user.U_FirstName[0]}{user.U_LastName[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-white uppercase italic text-sm">{user.U_FirstName} {user.U_LastName}</span>
                        <span className="text-[9px] text-slate-500 lowercase italic">{user.U_Email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className={`px-3 py-1 rounded-lg border text-[9px] font-black uppercase italic ${user.U_Role === 'SUPER_ADMIN' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                      {user.U_Role}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-400 font-black uppercase text-[9px] italic">
                        <Building size={12} className="text-slate-600" />
                        <span>{user.U_Site?.S_Name || 'ROOT'} / {user.U_OrgUnit?.OU_Name || 'DÉPARTEMENT'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => router.push(`/dashboard/users/${user.U_Id}`)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-blue-500 border border-white/10 cursor-pointer transition-all active:scale-90">
                        <Edit size={18}/>
                      </button>
                      <button onClick={() => handleDelete(user.U_Id)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 border border-white/10 cursor-pointer transition-all active:scale-90">
                        {isDeleting === user.U_Id ? <Loader2 className="animate-spin" size={18}/> : <Trash2 size={18}/>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      
      <footer className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-30 shrink-0 italic w-full">
        <div className="flex items-center gap-5">
          <Fingerprint size={32} className="text-blue-600" />
          <div className="text-left leading-none">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] m-0 mb-1 leading-none text-white">RH Suivi</p>
            <p className="text-[7px] font-bold text-slate-700 uppercase tracking-widest m-0 leading-none italic">Elite Resource Planner Qualisoft</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
           <span className="text-[9px] font-black uppercase text-blue-500">Node: {isSubdomain ? 'Isolated' : 'Root Matrix'}</span>
           <Activity size={20} className="text-emerald-500 animate-pulse" />
        </div>
      </footer>
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, 0.2); border-radius: 10px; }`}</style>
    </div>
  );
}

function KPIBox({ label, value, icon, color, sub }: any) {
  const c: any = { 
    blue: "text-blue-500 bg-blue-500/5 border-blue-500/10", 
    emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10", 
    indigo: "text-indigo-500 bg-indigo-500/5 border-indigo-500/10" 
  };
  return (
    <div className={`p-5 rounded-3xl border flex items-center justify-between shadow-2xl transition-all group w-full ${c[color]}`}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-black/40 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase text-slate-500 italic tracking-[0.2em] leading-none">{label}</span>
          <span className="text-[7px] font-bold text-slate-600 uppercase mt-1 leading-none italic">{sub}</span>
        </div>
      </div>
      <span className="text-4xl font-black italic text-white leading-none tracking-tighter">{value}</span>
    </div>
  );
}