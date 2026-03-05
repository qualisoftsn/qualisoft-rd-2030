/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛰️ MODULE : GESTION DES UTILISATEURS (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Administration des comptes, rôles et rattachements SMI.
 * FIX : Dark Mode Matrix, Fluid Height 100dvh, Zéro scroll body.
 * RÉVISION : 04 Mars 2026 | 23:10 GMT
 * -------------------------------------------------------------------------
 */

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  UserPlus, Shield, User, Trash2, Mail, 
  Search, Loader2, MoreVertical, ShieldCheck, 
  MapPin, Fingerprint 
} from 'lucide-react';
import { toast } from 'sonner';
import { Role } from '@/types/elite-sde';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Erreur lors de la synchronisation des collaborateurs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filteredUsers = users.filter((u: any) => 
    u.U_FirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.U_LastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.U_Email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-6 md:p-10 lg:p-12 font-sans italic selection:bg-blue-600/30 text-white">
      
      {/* 🔝 HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8 shrink-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 text-blue-500 rounded-full w-fit border border-blue-600/20">
            <ShieldCheck size={12} />
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">Contrôle d&apos;Identité Matrix</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white leading-none m-0">
            Gestion <span className="text-blue-500">Utilisateurs</span>
          </h1>
          <p className="text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] m-0">Contrôlez les accès et les habilitations de vos collaborateurs.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" placeholder="RECHERCHER UN MEMBRE..."
              className="w-full pl-12 pr-4 py-4 bg-[#0B0F1A] border border-white/5 rounded-3xl text-[9px] md:text-[10px] font-black outline-none focus:border-blue-600 transition-colors italic uppercase tracking-widest text-white placeholder:text-slate-600"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="w-full sm:w-auto bg-blue-600 text-white px-6 py-4 rounded-3xl font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 border-none cursor-pointer">
            <UserPlus size={16} /> Ajouter Membre
          </button>
        </div>
      </div>

      {/* 📊 LISTING UTILISATEURS */}
      <div className="flex-1 min-h-0 relative pt-6">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse m-0">Lecture du noyau identité...</p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto custom-scrollbar pr-2 pb-10">
            <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-500">
              {filteredUsers.map((u: any) => (
                <div key={u.U_Id} className="bg-white/5 p-6 md:p-8 rounded-4xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm hover:bg-[#0B0F1A]/50 hover:border-blue-500/30 transition-all duration-300 group gap-6">
                  
                  <div className="flex items-center gap-6 w-full min-w-0">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-inner transition-all duration-300 shrink-0 ${
                      u.U_Role === Role.ADMIN || u.U_Role === Role.SUPER_ADMIN 
                      ? 'bg-blue-600/20 text-blue-500 border border-blue-500/20 rotate-3 group-hover:rotate-0 group-hover:bg-blue-600 group-hover:text-white' 
                      : 'bg-[#0B0F1A] text-slate-500 group-hover:text-blue-400'
                    }`}>
                      {u.U_Role === Role.ADMIN || u.U_Role === Role.SUPER_ADMIN ? <Shield size={24} /> : <User size={24} />}
                    </div>
                    
                    <div className="text-left space-y-2 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-none italic m-0 truncate">
                          {u.U_FirstName} {u.U_LastName}
                        </h3>
                        {u.U_FirstLogin && (
                          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest whitespace-nowrap">Nouveau</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 md:gap-4">
                        <span className="flex items-center gap-1.5 text-[8px] md:text-[9px] text-slate-400 font-black italic uppercase tracking-widest truncate">
                          <Mail size={12} className="text-blue-500 shrink-0" /> {u.U_Email}
                        </span>
                        <span className="flex items-center gap-1.5 text-[8px] md:text-[9px] text-slate-400 font-black italic uppercase tracking-widest shrink-0">
                          <Fingerprint size={12} className="text-blue-500" /> ID: {u.U_Id.split('-')[0]}
                        </span>
                        <div className={`px-3 py-1 rounded-md text-[8px] md:text-[9px] font-black uppercase tracking-widest border shrink-0 ${
                          u.U_Role === Role.ADMIN ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-[#0B0F1A] border-white/5 text-slate-500'
                        }`}>
                          {u.U_Role}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 🏢 Rattachement & Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-white/5 shrink-0">
                     <div className="text-left md:text-right whitespace-nowrap">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 m-0">Unité Opérationnelle</p>
                        <p className="text-xs md:text-sm font-black text-blue-400 italic flex items-center justify-start md:justify-end gap-2 uppercase m-0">
                          <MapPin size={12} /> {u.U_OrgUnit?.OU_Name || 'Non Assignée'}
                        </p>
                     </div>
                     
                     <div className="flex items-center gap-2">
                        <button className="p-3 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all border-none cursor-pointer">
                          <MoreVertical size={18} />
                        </button>
                        <button className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border-none cursor-pointer">
                          <Trash2 size={18} />
                        </button>
                     </div>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && !loading && (
                <div className="py-32 flex flex-col items-center justify-center space-y-6 opacity-30 border-2 border-dashed border-white/10 rounded-[3rem]">
                  <User size={60} strokeWidth={1} />
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] m-0">Aucun collaborateur identifié</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}