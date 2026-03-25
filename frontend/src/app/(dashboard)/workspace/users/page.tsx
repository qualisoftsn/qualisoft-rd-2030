/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛰️ MODULE : GESTION DES UTILISATEURS (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Administration des comptes, rôles et habilitations SMI.
 * DESIGN : High-Density Table, 100dvh, Zero Scroll Global.
 * RÉVISION : 06 Mars 2026 | 20:15 GMT
 */

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { UserPlus, Shield, User, Search, Loader2, Fingerprint, Mail, MapPin } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function UserAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Échec de synchronisation des citoyens SMI.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={50} /></div>;

  return (
    <div className="h-full flex flex-col p-8 md:p-12 font-sans italic text-white animate-in slide-in-from-right-4 duration-500">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 shrink-0">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3 text-blue-500 font-black uppercase text-[9px] tracking-widest">
            <Fingerprint size={14} /> Contrôle Identité Matrix
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic m-0 leading-none">
            Gestion <span className="text-blue-600">Collaborateurs</span>
          </h1>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            placeholder="RECHERCHER COLLABORATEUR..." 
            className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-16 pr-6 text-[10px] font-black uppercase italic outline-none focus:border-blue-600 transition-all text-white placeholder:text-slate-800"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
        <div className="grid grid-cols-1 gap-6">
          {users.filter(u => u.U_Email.toLowerCase().includes(search.toLowerCase())).map(user => (
            <div key={user.U_Id} className="bg-[#151B2B] border border-white/5 p-8 rounded-[3rem] flex flex-col lg:flex-row items-center justify-between gap-8 group hover:border-blue-500/30 transition-all shadow-inner">
               <div className="flex items-center gap-8 text-left w-full lg:w-auto">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all ${user.U_Role === 'ADMIN' ? 'bg-blue-600' : 'bg-slate-800 group-hover:bg-blue-600/20 group-hover:text-blue-500'}`}>
                    {user.U_Role === 'ADMIN' ? <Shield size={28}/> : <User size={28}/>}
                  </div>
                  <div className="min-w-0">
                     <h3 className="text-2xl font-black uppercase italic tracking-tighter m-0 truncate">{user.U_FirstName} {user.U_LastName}</h3>
                     <div className="flex flex-wrap items-center gap-4 mt-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2"><Mail size={12} className="text-blue-500" /> {user.U_Email}</span>
                        <span className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2"><MapPin size={12} className="text-blue-500" /> {user.U_OrgUnit?.OU_Name || 'NON ASSIGNÉ'}</span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
                  <span className={`px-5 py-2 rounded-xl text-[9px] font-black tracking-widest border uppercase italic ${user.U_Role === 'ADMIN' ? 'border-blue-500/30 text-blue-500' : 'border-slate-800 text-slate-700'}`}>
                    Grade : {user.U_Role}
                  </span>
                  <button className="bg-white/5 p-4 rounded-xl text-slate-600 hover:text-white transition-all border-none cursor-pointer"><UserPlus size={18} /></button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
