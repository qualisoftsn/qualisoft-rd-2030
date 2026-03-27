/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : GESTION DES UTILISATEURS (ELITE-SDE)
 * RÔLE : Administration des comptes, rôles et habilitations SMI
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { UserPlus, Shield, User, Search, Loader2, Fingerprint, Mail, MapPin, AlertCircle, Edit3, MoreVertical } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'USER' | 'OBSERVATEUR';

export interface OrgUnit {
  OU_Id: string;
  OU_Name: string;
  OU_Code?: string;
  OU_IsActive?: boolean;
}

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email: string;
  U_Role: UserRole;
  U_Phone?: string;
  U_OrgUnitId?: string;
  U_OrgUnit?: OrgUnit;
  U_IsActive?: boolean;
  U_CreatedAt?: string;
  U_Avatar?: string;
}

export interface UserAdminProps {
  onEditUser?: (user: User) => void;
  onAddUser?: () => void;
}

export interface LoadingStateProps {
  label: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING STATE
// ============================================================================

function LoadingState({ label }: LoadingStateProps) {
  return (
    <div 
      className="h-full flex items-center justify-center bg-[#0B0F1A]"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 md:gap-6">
        <Loader2 className="animate-spin text-blue-400 w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14" aria-hidden="true" />
        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 italic">{label}</p>
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : USER CARD
// ============================================================================

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
}

function UserCard({ user, onEdit, onKeyDown }: UserCardProps) {
  const isAdmin = user.U_Role === 'ADMIN' || user.U_Role === 'SUPER_ADMIN';
  const initials = `${user.U_FirstName?.[0] || ''}${user.U_LastName?.[0] || ''}`.toUpperCase();

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEdit?.(user);
    }
  };

  return (
    <article 
      className="bg-[#0F172A] border border-white/5 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6 lg:gap-8 group hover:border-blue-500/30 transition-all shadow-inner focus-within:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
      role="article"
      aria-label={`Utilisateur: ${user.U_FirstName} ${user.U_LastName}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
       <div className="flex items-center gap-4 md:gap-6 lg:gap-8 text-left w-full lg:w-auto min-w-0">
          <div 
            className={cn(
              "w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all shrink-0",
              isAdmin ? 'bg-blue-600' : 'bg-slate-800 group-hover:bg-blue-600/20 group-hover:text-blue-400'
            )}
            aria-hidden="true"
          >
            {isAdmin ? (
              <Shield size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
            ) : (
              <User size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
            )}
          </div>
          <div className="min-w-0 flex-1">
             <h3 className="text-lg md:text-xl lg:text-2xl font-black uppercase italic tracking-tighter m-0 truncate text-white">
               {user.U_FirstName} {user.U_LastName}
             </h3>
             <div className="flex flex-wrap items-center gap-2 md:gap-3 lg:gap-4 mt-1 md:mt-2">
                <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase flex items-center gap-1.5 md:gap-2">
                  <Mail size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-400" aria-hidden="true" /> 
                  <span className="truncate max-w-[150px] md:max-w-[200px]">{user.U_Email}</span>
                </span>
                <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase flex items-center gap-1.5 md:gap-2">
                  <MapPin size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-400" aria-hidden="true" /> 
                  <span className="truncate max-w-[100px] md:max-w-[150px]">{user.U_OrgUnit?.OU_Name || 'NON ASSIGNÉ'}</span>
                </span>
             </div>
          </div>
       </div>
       <div className="flex items-center gap-3 md:gap-4 w-full lg:w-auto justify-between lg:justify-end">
          <span 
            className={cn(
              "px-3 md:px-4 lg:px-5 py-1 md:py-1.5 lg:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black tracking-widest border uppercase italic",
              isAdmin 
                ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' 
                : 'border-slate-700 text-slate-600 bg-slate-800/50'
            )}
            aria-label={`Rôle: ${user.U_Role}`}
          >
            Grade : {user.U_Role}
          </span>
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => onEdit?.(user)}
              className="p-2 md:p-3 lg:p-4 bg-white/5 rounded-lg md:rounded-xl text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label={`Modifier ${user.U_FirstName} ${user.U_LastName}`}
              title="Modifier"
            >
              <Edit3 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
            </button>
            <button 
              type="button"
              className="p-2 md:p-3 lg:p-4 bg-white/5 rounded-lg md:rounded-xl text-slate-600 hover:text-white hover:bg-white/10 transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label={`Plus d'options pour ${user.U_FirstName} ${user.U_LastName}`}
              title="Plus d'options"
            >
              <MoreVertical size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
            </button>
          </div>
       </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function UserAdmin({ onEditUser, onAddUser }: UserAdminProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<User[]>('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs:', error);
      toast.error("Échec de synchronisation des citoyens SMI.");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchUsers(); }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const searchTerm = search.toLowerCase();
    return users.filter(u => 
      u.U_Email.toLowerCase().includes(searchTerm) ||
      `${u.U_FirstName} ${u.U_LastName}`.toLowerCase().includes(searchTerm) ||
      u.U_Role.toLowerCase().includes(searchTerm)
    );
  }, [users, search]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleUserKeyDown = (e: KeyboardEvent<HTMLDivElement>, user: User) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEditUser?.(user);
    }
  };

  const handleEditUser = (user: User) => {
    onEditUser?.(user);
    toast.info(`Modification: ${user.U_FirstName} ${user.U_LastName}`);
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingState label="Chargement des utilisateurs..." />;
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 md:p-12 font-sans italic text-white animate-in slide-in-from-right-4 duration-500">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 mb-8 md:mb-10 lg:mb-12 shrink-0">
        <div className="space-y-2 md:space-y-3 lg:space-y-4 text-left w-full md:w-auto">
          <div className="flex items-center gap-2 md:gap-3 text-blue-400 font-black uppercase text-[8px] md:text-[9px] tracking-widest">
            <Fingerprint size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" /> 
            Contrôle Identité Matrix
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl xl:text-7xl font-black uppercase tracking-tighter italic m-0 leading-none">
            Gestion <span className="text-blue-400">Collaborateurs</span>
          </h1>
        </div>
        <div className="relative w-full md:w-64 lg:w-80 xl:w-96">
          <label htmlFor="user-search" className="sr-only">Rechercher un collaborateur</label>
          <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
          <input 
            id="user-search"
            placeholder="RECHERCHER COLLABORATEUR..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl lg:rounded-3xl py-2.5 md:py-3 lg:py-4 md:py-5 pl-10 md:pl-16 pr-4 md:pr-6 text-[9px] md:text-[10px] font-black uppercase italic outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-700"
            value={search} 
            onChange={handleSearchChange}
            aria-label="Filtrer les utilisateurs par email, nom ou rôle"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-2 pb-6 md:pb-8 lg:pb-10" role="region" aria-label="Liste des utilisateurs">
        <div className="grid grid-cols-1 gap-3 md:gap-4 lg:gap-6" role="list">
          {filteredUsers.length > 0 ? filteredUsers.map(user => (
            <UserCard 
              key={user.U_Id} 
              user={user} 
              onEdit={handleEditUser}
              onKeyDown={(e) => handleUserKeyDown(e, user)}
            />
          )) : (
            <div 
              className="h-48 md:h-56 lg:h-64 flex flex-col items-center justify-center text-slate-500 bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl"
              role="status"
            >
              <User size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mb-3 md:mb-4 opacity-20" aria-hidden="true" />
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-center px-4">
                {search ? 'Aucun utilisateur ne correspond à la recherche' : 'Aucun utilisateur enregistré'}
              </p>
              {!search && onAddUser && (
                <button 
                  type="button"
                  onClick={onAddUser}
                  className="mt-2 md:mt-3 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
                >
                  Créer votre premier utilisateur
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}