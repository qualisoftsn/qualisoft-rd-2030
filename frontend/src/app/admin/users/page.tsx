/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛰️ MODULE : GESTION DES UTILISATEURS (COLLABORATEURS)
 * -------------------------------------------------------------------------
 * RÔLE : Administration des comptes, rôles et rattachements SMI.
 * SÉCURITÉ : Accès réservé ADMIN / SUPER_ADMIN.
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 14:55 GMT
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

  /**
   * 📡 SYNCHRONISATION DU RÉGISTRE UTILISATEURS
   * Récupère la liste des collaborateurs depuis le noyau NestJS.
   */
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users');
      // On s'assure de recevoir un tableau
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Erreur lors de la synchronisation des collaborateurs.");
      console.error("[USERS_SYNC_ERROR]:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * 🔍 FILTRAGE TEMPS RÉEL
   */
  const filteredUsers = users.filter((u: any) => 
    u.U_FirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.U_LastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.U_Email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-10 space-y-10 bg-[#F8FAFC] min-h-screen font-sans italic selection:bg-blue-100">
      
      {/* 🔝 HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-10">
        <div className="text-left space-y-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg w-fit">
            <ShieldCheck size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Contrôle d&apos;Identité Matrix</span>
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
            Gestion <span className="text-blue-600">Utilisateurs</span>
          </h1>
          <p className="text-slate-500 font-medium">Contrôlez les accès et les habilitations de vos collaborateurs.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="RECHERCHER UN MEMBRE..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all italic uppercase tracking-widest"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-3 active:scale-95 border-none cursor-pointer">
            <UserPlus size={18} /> Ajouter Membre
          </button>
        </div>
      </div>

      {/* 📊 LISTING UTILISATEURS */}
      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Lecture du noyau identité...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredUsers.map((u: any) => (
            <div key={u.U_Id} className="bg-white p-8 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
              <div className="flex items-center gap-8 w-full">
                {/* 🛡️ Avatar Role Icon */}
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner transition-all duration-500 ${
                  u.U_Role === Role.ADMIN || u.U_Role === Role.SUPER_ADMIN 
                  ? 'bg-blue-600 text-white rotate-3 group-hover:rotate-0' 
                  : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
                }`}>
                  {u.U_Role === Role.ADMIN || u.U_Role === Role.SUPER_ADMIN ? <Shield size={28} /> : <User size={28} />}
                </div>
                
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none italic">
                      {u.U_FirstName} {u.U_LastName}
                    </h3>
                    {u.U_FirstLogin && (
                      <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">Premier Accès</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-6">
                    <span className="flex items-center gap-2 text-[10px] text-slate-400 font-black italic uppercase tracking-widest">
                      <Mail size={14} className="text-blue-400" /> {u.U_Email}
                    </span>
                    <span className="flex items-center gap-2 text-[10px] text-slate-400 font-black italic uppercase tracking-widest">
                      <Fingerprint size={14} className="text-blue-400" /> ID: {u.U_Id.split('-')[0]}
                    </span>
                    <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      u.U_Role === Role.ADMIN ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-500'
                    }`}>
                      {u.U_Role}
                    </div>
                  </div>
                </div>
              </div>

              {/* 🏢 Rattachement & Actions */}
              <div className="flex items-center gap-10 mt-6 md:mt-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-6 md:pt-0 border-slate-50">
                 <div className="text-right whitespace-nowrap">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Unité Opérationnelle</p>
                    <p className="text-sm font-black text-blue-600 italic flex items-center justify-end gap-2 uppercase">
                      <MapPin size={14} /> {u.U_OrgUnit?.OU_Name || 'Non Assignée'}
                    </p>
                 </div>
                 
                 <div className="flex items-center gap-2">
                    <button className="p-4 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border-none cursor-pointer">
                      <MoreVertical size={20} />
                    </button>
                    <button 
                      onClick={() => {/* Logique de suppression */}}
                      className="p-4 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border-none cursor-pointer"
                    >
                      <Trash2 size={20} />
                    </button>
                 </div>
              </div>
            </div>
          ))}

          {/* 🧩 EMPTY STATE */}
          {filteredUsers.length === 0 && !loading && (
            <div className="py-40 flex flex-col items-center justify-center space-y-6 opacity-20">
              <User size={80} strokeWidth={1} />
              <p className="text-xs font-black uppercase tracking-[0.5em]">Aucun collaborateur identifié</p>
            </div>
          )}
        </div>
      )}

      {/* 🛡️ FOOTER STATUS */}
      <footer className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center opacity-30 italic text-[9px] font-black uppercase tracking-[0.5em]">
        <p>Qualisoft Identity Manager v2.1</p>
        <p>Elite RD 2026 • Dakar, SN</p>
      </footer>
    </div>
  );
}