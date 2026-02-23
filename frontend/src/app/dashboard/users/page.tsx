/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 👥 MODULE : ANNUAIRE MASTER & MATRICE RACI
 * DESIGN : Elite High-Density / No-Scroll / Sovereign RH
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, UserPlus, Mail, Shield, MapPin, Trash2, Loader2, Search, X, 
  Save, ShieldCheck, Building, Filter, GitBranch, ChevronRight, Activity, Database,
  Fingerprint,
  Target
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';
import { useRouter } from 'next/navigation';

interface User {
  U_Id: string; U_FirstName: string; U_LastName: string; U_Email: string;
  U_Role: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'PILOTE' | 'COPILOTE';
  U_IsActive: boolean;
  U_Site?: { S_Name: string };
  U_OrgUnit?: { OU_Name: string };
  U_AssignedProcess?: { PR_Code: string; PR_Libelle: string };
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users');
      setUsers(res.data?.data || res.data || []);
    } catch (e) { toast.error("RUPTURE LIAISON RH"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => ({
    total: users.length,
    pilotes: users.filter(u => u.U_Role === 'PILOTE').length,
    admins: users.filter(u => u.U_Role === 'ADMIN' || u.U_Role === 'SUPER_ADMIN').length
  }), [users]);

  const filtered = users.filter(u => 
    `${u.U_FirstName} ${u.U_LastName} ${u.U_Email}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <span className="text-[9px] font-black uppercase tracking-[0.5em] text-blue-600 animate-pulse">Syncing RACI Matrix...</span>
    </div>
  );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-6 overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE */}
      <header className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter m-0 flex items-center gap-3">
            <Users className="text-blue-500" size={24}/> Annuaire <span className="text-blue-500">RACI</span>
          </h1>
          <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] m-0">ISO 9001 §7.2 • Qualification des Ressources</p>
        </div>
        <button onClick={() => router.push('/dashboard/admin/users/nouveau')} className="bg-blue-600 hover:bg-white hover:text-blue-600 px-6 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 border-none transition-all cursor-pointer shadow-lg italic">
          <UserPlus size={14} strokeWidth={3} /> Habiliter Pilote
        </button>
      </header>

      {/* 📊 KPI BAR */}
      <div className="grid grid-cols-3 gap-4 mb-6 shrink-0">
        <KPIBox label="Effectif Global" value={stats.total} icon={<Database size={14}/>} color="blue" />
        <KPIBox label="Pilotes Qualifiés" value={stats.pilotes} icon={<Target size={14}/>} color="emerald" />
        <KPIBox label="Administrateurs" value={stats.admins} icon={<ShieldCheck size={14}/>} color="indigo" />
      </div>

      {/* 🔍 SEARCH BAR */}
      <div className="mb-6 shrink-0 relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input 
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="RECHERCHER AGENT (NOM, EMAIL, ROLE)..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-[10px] font-black uppercase outline-none focus:border-blue-600 transition-all italic"
        />
      </div>

      {/* 📋 TABLEAU HAUTE DENSITÉ */}
      <main className="flex-1 min-h-0 bg-[#151A2D] border border-white/5 rounded-4xl flex flex-col overflow-hidden shadow-2xl">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#151A2D] z-10 border-b border-white/10 shadow-sm">
              <tr className="text-[7px] text-slate-500 uppercase font-black italic tracking-widest">
                <th className="px-6 py-3">Agent & Qualification</th>
                <th className="px-6 py-3 text-center">Rôle & Autorité</th>
                <th className="px-6 py-3">Périmètre Structurel</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[10px]">
              {filtered.map(user => (
                <tr key={user.U_Id} className={`group hover:bg-blue-600/5 transition-all ${!user.U_IsActive ? 'opacity-20 grayscale' : ''}`}>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-blue-500 border border-white/10">
                        {user.U_FirstName[0]}{user.U_LastName[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-white uppercase italic leading-none">{user.U_FirstName} {user.U_LastName}</span>
                        <span className="text-[8px] text-slate-500 lowercase mt-1">{user.U_Email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[8px] font-black uppercase italic">{user.U_Role}</span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-col gap-1">
                       <span className="text-slate-400 font-black uppercase text-[8px]">{user.U_Site?.S_Name || 'ROOT'} / {user.U_OrgUnit?.OU_Name || 'RH'}</span>
                       {user.U_AssignedProcess && <span className="text-blue-500 font-black italic text-[8px] flex items-center gap-1"><GitBranch size={10}/> {user.U_AssignedProcess.PR_Libelle}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-1.5 bg-white/5 rounded-lg text-slate-500 hover:text-blue-500 border-none cursor-pointer"><ChevronRight size={14}/></button>
                      <button className="p-1.5 bg-white/5 rounded-lg text-slate-500 hover:text-red-500 border-none cursor-pointer"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <footer className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-30 shrink-0">
          <div className="flex items-center gap-4">
            <Fingerprint size={24} className="text-blue-600" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] m-0">RH Sovereign Matrix</p>
              <p className="text-[7px] font-bold text-slate-700 uppercase tracking-widest m-0 italic leading-none">Qualisoft Elite RD 2030</p>
            </div>
          </div>
          <Activity size={14} className="text-emerald-500 animate-pulse" />
      </footer>
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }`}</style>
    </div>
  );
}

function KPIBox({ label, value, icon, color }: any) {
  const c: any = { blue: "text-blue-500 bg-blue-500/5 border-blue-500/10", emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10", indigo: "text-indigo-500 bg-indigo-500/5 border-indigo-500/10" };
  return (
    <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-xl ${c[color]}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-black/20 rounded-lg">{icon}</div>
        <span className="text-[8px] font-black uppercase text-slate-500 italic tracking-widest">{label}</span>
      </div>
      <span className="text-xl font-black italic m-0 text-white leading-none">{value}</span>
    </div>
  );
}