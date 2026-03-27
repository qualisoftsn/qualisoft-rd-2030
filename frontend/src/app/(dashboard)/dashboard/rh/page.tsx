/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🧠 MODULE : HUB RH & INTELLIGENCE DES TALENTS (ISO 9001 §7.2)
 * RÔLE : Pilotage centralisé du personnel et des compétences
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import {
  Users, Target, BookOpen, 
  TrendingUp, Plus, ShieldCheck, Award, RefreshCw, ChevronRight,
  AlertCircle
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type UserRole = 'ADMIN' | 'USER' | 'MANAGER' | 'DIRECTION' | 'RQ' | 'SUPER_ADMIN';
export type FormationStatus = 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_Role: UserRole;
  U_IsActive: boolean;
  U_Avatar?: string;
  U_Phone?: string;
  U_Department?: string;
}

export interface Competence {
  COMP_Id: string;
  COMP_Libelle: string;
  COMP_Category?: string;
  COMP_Level?: number;
  COMP_IsActive: boolean;
}

export interface Formation {
  FORM_Id: string;
  FORM_Title: string;
  FORM_Description?: string;
  FORM_Status: FormationStatus;
  FORM_StartDate?: string;
  FORM_EndDate?: string;
  FORM_Participants?: number;
  FORM_IsActive: boolean;
}

export interface RHData {
  users: User[];
  competences: Competence[];
  formations: Formation[];
}

export interface KPIBoxProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: 'indigo' | 'amber' | 'emerald';
  sub: string;
}

export interface UserCardProps {
  user: User;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export interface FormationCardProps {
  formation: Formation;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-indigo-600 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : KPI BOX
// ============================================================================

function KPIBox({ title, value, icon: Icon, color, sub }: KPIBoxProps) {
  const themes: Record<KPIBoxProps['color'], string> = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <article className="bg-white p-4 md:p-6 lg:p-7 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-4 md:gap-6 group hover:shadow-lg transition-all text-left focus-within:ring-2 focus-within:ring-indigo-400">
      <div className={cn(
        "p-3 md:p-4 lg:p-5 rounded-2xl md:rounded-3xl border-2 group-hover:scale-110 transition-transform shadow-inner",
        themes[color]
      )}>
        <Icon size={20} className="w-5 h-5 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
      </div>
      <div>
        <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase text-slate-400 tracking-widest m-0 mb-0.5 md:mb-1">{title}</p>
        <p className="text-3xl md:text-4xl font-black text-slate-900 italic leading-none m-0 mb-1 md:mb-2">{value}</p>
        <p className="text-[8px] md:text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest m-0 italic">{sub}</p>
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : USER CARD
// ============================================================================

function UserCard({ user, onClick, onKeyDown }: UserCardProps) {
  const initials = `${user.U_FirstName?.[0] || ''}${user.U_LastName?.[0] || ''}`.toUpperCase();
  
  return (
    <article 
      className="flex items-center justify-between p-4 md:p-5 rounded-2xl md:rounded-3xl border border-slate-100 bg-white hover:border-indigo-200 transition-all group shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Profil de ${user.U_FirstName} ${user.U_LastName}`}
    >
      <div className="flex items-center gap-3 md:gap-4 lg:gap-5 text-left min-w-0">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-black text-xs md:text-sm uppercase group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-black text-slate-900 text-sm md:text-base m-0 italic truncate">{user.U_FirstName} {user.U_LastName}</p>
          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 m-0 truncate">{user.U_Role}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0" aria-hidden="true" />
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : FORMATION CARD
// ============================================================================

function FormationCard({ formation }: FormationCardProps) {
  const statusConfig: Record<FormationStatus, string> = {
    PLANIFIEE: 'bg-slate-50 text-slate-700 border-slate-100',
    EN_COURS: 'bg-amber-50 text-amber-700 border-amber-100',
    TERMINEE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    ANNULEE: 'bg-red-50 text-red-700 border-red-100',
  };

  return (
    <article className="p-4 md:p-5 rounded-2xl md:rounded-3xl border border-slate-100 bg-white flex flex-col gap-2 md:gap-3 text-left">
      <div className="flex justify-between items-start">
        <p className="font-black text-slate-900 text-sm md:text-base m-0 line-clamp-1 italic uppercase">{formation.FORM_Title}</p>
        <span className={cn(
          "text-[7px] md:text-[8px] font-black px-2 md:px-3 py-1 rounded-lg uppercase tracking-widest border italic",
          statusConfig[formation.FORM_Status] || statusConfig.PLANIFIEE
        )}>
          {formation.FORM_Status.replace('_', ' ')}
        </span>
      </div>
      {formation.FORM_StartDate && (
        <p className="text-[9px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest m-0 italic">
          {new Date(formation.FORM_StartDate).toLocaleDateString('fr-FR')}
        </p>
      )}
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function RHIntelligenceHub() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [data, setData] = useState<RHData>({ users: [], competences: [], formations: [] });
  const [loading, setLoading] = useState(true);

  const fetchRHData = useCallback(async () => {
    try {
      setLoading(true);
      const [resUsers, resComps, resForms] = await Promise.all([
        apiClient.get<User[]>('/users'),
        apiClient.get<Competence[]>('/rh/competences'),
        apiClient.get<Formation[]>('/rh/formations')
      ]);

      setData({
        users: Array.isArray(resUsers.data) ? resUsers.data : [],
        competences: Array.isArray(resComps.data) ? resComps.data : [],
        formations: Array.isArray(resForms.data) ? resForms.data : []
      });
    } catch (error) {
      console.error('❌ Erreur chargement RH:', error);
      toast.error('RUPTURE DE FLUX RH : Synchronisation impossible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isAuthenticated) {
        router.replace('/auth/login');
      } else {
        fetchRHData();
      }
    }
  }, [isAuthenticated, fetchRHData, router]);

  const stats = useMemo(() => ({
    activeUsers: data.users.filter(u => u.U_IsActive).length,
    formationsActive: data.formations.filter(f => f.FORM_Status === 'EN_COURS').length
  }), [data]);

  const handleUserClick = (userId: string) => {
    router.push(`/dashboard/rh/users/${userId}`);
  };

  const handleUserKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, userId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.push(`/dashboard/rh/users/${userId}`);
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Extraction du Hub RH..." />;
  }

  return (
    <div className="h-screen bg-[#F9FAFB] text-slate-900 flex flex-col overflow-hidden w-full lg:pl-72 italic selection:bg-indigo-100">
      <Toaster position="top-right" richColors theme="light" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-slate-200 bg-white flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6">
        <div className="text-left space-y-1 md:space-y-2 w-full xl:w-auto">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <span className="bg-indigo-600 text-white px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest italic shadow-lg">
              ISO 9001 §7.2
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-slate-900 uppercase leading-none m-0">
              Intelligence <span className="text-indigo-600">RH</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[10px] md:text-sm font-medium m-0 uppercase tracking-tighter">
            Pilotage des compétences et de la polyvalence
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <button 
            type="button"
            onClick={() => router.push('/dashboard/rh/matrice')} 
            className="flex-1 xl:flex-none flex items-center justify-center gap-2 md:gap-3 bg-white border-2 border-slate-200 text-slate-700 px-4 md:px-6 py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] lg:text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm cursor-pointer italic focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Accéder à la matrice GPEC"
          >
            <Target size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" /> 
            <span className="hidden sm:inline">Matrice GPEC</span>
          </button>
          <button 
            type="button"
            className="flex-1 xl:flex-none flex items-center justify-center gap-2 md:gap-3 bg-indigo-600 text-white px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] lg:text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 border-none cursor-pointer italic focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Créer une nouvelle action RH"
          >
            <Plus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" strokeWidth={3} aria-hidden="true" /> 
            <span className="hidden sm:inline">Action RH</span>
          </button>
        </div>
      </header>

      {/* 🧩 MAIN CONTENT */}
      <main className="flex-1 overflow-hidden px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 flex flex-col gap-4 md:gap-6 lg:gap-8">
        
        {/* KPI GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 shrink-0" role="list" aria-label="Statistiques RH">
          <KPIBox title="Effectif Actif" value={stats.activeUsers} icon={Users} color="indigo" sub={`Sur ${data.users.length} collaborateurs`} />
          <KPIBox title="Référentiel" value={data.competences.length} icon={Award} color="emerald" sub="Compétences normées" />
          <KPIBox title="Plan Formation" value={stats.formationsActive} icon={BookOpen} color="amber" sub="Sessions en cours" />
        </section>

        {/* DOUBLE SECTION */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          
          {/* LISTE COLLABORATEURS */}
          <article className="bg-white rounded-xl md:rounded-2xl lg:rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-col overflow-hidden" aria-labelledby="users-title">
            <header className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 id="users-title" className="text-base md:text-lg font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-2 md:gap-3 m-0">
                <ShieldCheck className="text-indigo-600 w-5 h-5 md:w-6 md:h-6" aria-hidden="true" /> 
                Registre Personnel
              </h2>
              <button 
                type="button"
                onClick={() => router.push('/dashboard/users')} 
                className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline border-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-2 py-1"
                aria-label="Voir tous les utilisateurs"
              >
                Voir tout
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 custom-scrollbar" role="list" aria-label="Liste des collaborateurs">
              {data.users.length > 0 ? data.users.map(u => (
                <UserCard 
                  key={u.U_Id} 
                  user={u} 
                  onClick={() => handleUserClick(u.U_Id)}
                  onKeyDown={(e) => handleUserKeyDown(e, u.U_Id)}
                />
              )) : (
                <div className="h-32 md:h-40 flex flex-col items-center justify-center text-slate-500" role="status">
                  <Users size={32} className="w-8 h-8 md:w-10 md:h-10 mb-2 md:mb-3 opacity-20" aria-hidden="true" />
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Aucun collaborateur</p>
                </div>
              )}
            </div>
          </article>

          {/* FORMATIONS */}
          <article className="bg-white rounded-xl md:rounded-2xl lg:rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-col overflow-hidden" aria-labelledby="formations-title">
            <header className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 id="formations-title" className="text-base md:text-lg font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-2 md:gap-3 m-0">
                <TrendingUp className="text-amber-500 w-5 h-5 md:w-6 md:h-6" aria-hidden="true" /> 
                Plan de Formation
              </h2>
              <button 
                type="button"
                className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline border-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-2 py-1"
                aria-label="Gérer les formations"
              >
                Gérer
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 custom-scrollbar" role="list" aria-label="Liste des formations">
              {data.formations.length > 0 ? data.formations.map(f => (
                <FormationCard key={f.FORM_Id} formation={f} />
              )) : (
                <div className="h-32 md:h-40 flex flex-col items-center justify-center text-slate-500" role="status">
                  <BookOpen size={32} className="w-8 h-8 md:w-10 md:h-10 mb-2 md:mb-3 opacity-20" aria-hidden="true" />
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Aucune formation</p>
                </div>
              )}
            </div>
          </article>

        </div>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(79,70,229,0.3);border-radius:10px}:focus-visible{outline:2px solid #4f46e5;outline-offset:2px}`}</style>
    </div>
  );
}