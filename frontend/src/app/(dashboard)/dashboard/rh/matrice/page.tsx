/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 👥 MODULE : RH - MATRICE DES COMPÉTENCES (ISO 9001 §7.2)
 * RÔLE : Cartographie GPEC, suivi des qualifications et polyvalence
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useEffect, useState, useCallback, useMemo, ChangeEvent, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import {
  Search, Download, Plus, Award, ShieldCheck, RefreshCw, AlertCircle
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_Role: string;
  U_IsActive: boolean;
  U_Avatar?: string;
  U_Department?: string;
}

export interface Competence {
  COMP_Id: string;
  COMP_Name: string;
  COMP_Category?: string;
  COMP_TargetLevel: number;
  COMP_Description?: string;
  COMP_IsActive: boolean;
}

export interface Evaluation {
  EV_Id: string;
  EV_UserId: string;
  EV_CompetenceId: string;
  EV_LevelAcquired: number;
  EV_DateEval?: string;
  EV_EvaluatorId?: string;
  EV_Comments?: string;
  EV_IsActive: boolean;
}

export interface LegendProps {
  color: 'emerald' | 'amber' | 'slate';
  label: string;
}

export interface MatrixCellProps {
  level: number;
  targetLevel: number;
  userId: string;
  competenceId: string;
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
// SOUS-COMPOSANT : LEGEND
// ============================================================================

function Legend({ color, label }: LegendProps) {
  const colorClasses: Record<LegendProps['color'], string> = {
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    slate: 'bg-slate-200'
  };

  return (
    <div className="flex items-center gap-2" role="listitem">
      <div className={cn("h-2.5 md:h-3 w-2.5 md:w-3 rounded-full", colorClasses[color])} aria-hidden="true" />
      <span className="text-[9px] md:text-[10px] font-black text-slate-500 tracking-widest italic">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : MATRIX CELL
// ============================================================================

function MatrixCell({ level, targetLevel, userId, competenceId }: MatrixCellProps) {
  const isMet = level >= targetLevel;
  const isEmpty = level === 0;

  const getCellClasses = () => {
    if (isEmpty) return "bg-slate-50 text-slate-200 border-slate-100";
    if (isMet) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <td className="p-3 md:p-4 border-l border-slate-50" role="gridcell" aria-label={`Niveau ${level} sur ${targetLevel}`}>
      <div className="flex justify-center">
        <span 
          className={cn(
            "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-xs md:text-sm font-black shadow-inner border-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400",
            getCellClasses()
          )}
          tabIndex={0}
          aria-label={`Compétence évaluée: niveau ${level} sur ${targetLevel}`}
        >
          {level}
        </span>
      </div>
    </td>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function RHMasterMatrix() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [competences, setCompetences] = useState<Competence[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resUsers, resComps, resEvals] = await Promise.all([
        apiClient.get<User[]>('/users'),
        apiClient.get<Competence[]>('/rh/competences'),
        apiClient.get<Evaluation[]>('/rh/evaluations')
      ]);
      setUsers(Array.isArray(resUsers.data) ? resUsers.data.filter(u => u.U_IsActive !== false) : []);
      setCompetences(Array.isArray(resComps.data) ? resComps.data.filter(c => c.COMP_IsActive !== false) : []);
      setEvaluations(Array.isArray(resEvals.data) ? resEvals.data.filter(e => e.EV_IsActive !== false) : []);
    } catch (error) {
      console.error('❌ Erreur chargement matrice:', error);
      toast.error('ERREUR MATRICE : Échec de la cartographie.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isAuthenticated) {
        router.replace('/auth/login');
      } else {
        fetchData();
      }
    }
  }, [isAuthenticated, fetchData, router]);

  const filteredUsers = useMemo(() => 
    users.filter(u => `${u.U_FirstName} ${u.U_LastName}`.toLowerCase().includes(searchTerm.toLowerCase())), 
    [users, searchTerm]
  );

  const getEval = useCallback((uId: string, cId: string): Evaluation | undefined => {
    return evaluations.find(e => e.EV_UserId === uId && e.EV_CompetenceId === cId);
  }, [evaluations]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Action pour évaluer
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Calcul de la Matrice GPEC..." />;
  }

  const legendItems: Array<{ color: LegendProps['color']; label: string }> = [
    { color: 'emerald', label: 'Acquis' },
    { color: 'amber', label: 'Écart' },
    { color: 'slate', label: 'N/A' }
  ];

  return (
    <div className="h-screen bg-[#F9FAFB] text-slate-900 flex flex-col overflow-hidden w-full lg:pl-72 italic font-black uppercase selection:bg-indigo-100">
      <Toaster position="top-right" richColors theme="light" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-slate-200 bg-white flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6">
        <div className="text-left space-y-1 md:space-y-2 w-full xl:w-auto">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <div className="bg-indigo-600 p-2 md:p-2.5 rounded-xl md:rounded-2xl text-white shadow-lg">
              <Award size={18} className="w-4.5 h-4.5 md:w-5 md:h-5 lg:w-6 lg:h-6" aria-hidden="true" />
            </div>
            <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl tracking-tighter text-slate-900 m-0 leading-none">
              Matrice <span className="text-indigo-600">GPEC</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[9px] md:text-[10px] tracking-widest m-0 uppercase italic">
            Cartographie transversale des aptitudes §7.2
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full xl:w-auto justify-center xl:justify-end">
          <div 
            className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-200 text-slate-600 text-[8px] md:text-[9px] lg:text-[10px] font-black italic shadow-inner overflow-x-auto max-w-[200px] md:max-w-none"
            role="img"
            aria-label="Formule de calcul de polyvalence"
          >
            <code className="whitespace-nowrap">
              {"$$Polyvalence = \\frac{\\sum{Acquis}}{\\sum{Cible}} \\times 100$$"}
            </code>
          </div>
          <button 
            type="button"
            className="p-2.5 md:p-3 lg:p-4 bg-white border border-slate-200 rounded-xl md:rounded-2xl text-slate-600 hover:bg-slate-50 shadow-sm cursor-pointer border-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Télécharger la matrice"
          >
            <Download size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
          </button>
          <button 
            type="button"
            className="bg-indigo-600 text-white px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] lg:text-[11px] hover:bg-indigo-700 transition-all shadow-xl active:scale-95 border-none cursor-pointer italic flex items-center gap-2 md:gap-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Évaluer un collaborateur"
          >
            <Plus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" strokeWidth={3} aria-hidden="true" /> 
            <span className="hidden sm:inline">Évaluer</span>
          </button>
        </div>
      </header>

      {/* 🔍 NAVIGATION BAR */}
      <nav className="shrink-0 px-4 md:px-6 lg:px-8 py-3 md:py-4 bg-white border-b border-slate-200 flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-center" role="navigation" aria-label="Filtres de la matrice">
        <div className="relative w-full max-w-md group">
          <label htmlFor="matrix-search" className="sr-only">Rechercher un collaborateur</label>
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" />
          <input 
            id="matrix-search"
            value={searchTerm} 
            onChange={handleSearchChange}
            placeholder="Rechercher un talent..." 
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2.5 md:py-3 lg:py-4 pl-10 md:pl-12 pr-4 text-[9px] md:text-[10px] lg:text-[11px] font-black outline-none focus:bg-white focus:border-indigo-600 transition-all uppercase italic shadow-inner"
            aria-label="Filtrer les collaborateurs par nom"
          />
        </div>
        <div className="flex flex-wrap gap-4 md:gap-6" role="list" aria-label="Légende de la matrice">
           {legendItems.map((item) => (
             <Legend key={item.label} color={item.color} label={item.label} />
           ))}
        </div>
      </nav>

      {/* 📊 MATRIX */}
      <main className="flex-1 overflow-auto custom-scrollbar bg-slate-100/30 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8" role="region" aria-label="Matrice des compétences">
        <article className="bg-white rounded-2xl md:rounded-3xl lg:rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden min-w-full">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" role="grid" aria-label="Matrice GPEC des compétences">
              <thead>
                <tr className="bg-slate-50/80">
                  <th 
                    className="p-4 md:p-6 lg:p-8 text-[9px] md:text-[10px] lg:text-[11px] font-black text-slate-500 tracking-widest border-b border-r border-slate-100 sticky left-0 top-0 bg-slate-50 z-30 w-48 md:w-56 lg:w-64 xl:w-80 text-left italic" 
                    scope="col"
                  >
                    COMPÉTENCES \ TALENTS
                  </th>
                  {filteredUsers.length > 0 ? filteredUsers.map(u => (
                    <th 
                      key={u.U_Id} 
                      className="p-4 md:p-6 border-b border-slate-100 min-w-32 md:min-w-40 lg:min-w-44 sticky top-0 bg-slate-50/80 z-20 backdrop-blur-md"
                      scope="col"
                    >
                      <div className="flex flex-col items-center gap-2 md:gap-3">
                        <div 
                          className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xs md:text-sm shadow-lg font-black"
                          aria-hidden="true"
                        >
                          {u.U_FirstName?.[0]}{u.U_LastName?.[0]}
                        </div>
                        <div className="text-center">
                          <span className="text-[9px] md:text-[10px] font-black text-slate-900 tracking-tighter block truncate w-24 md:w-28 lg:w-32">
                            {u.U_FirstName} {u.U_LastName}
                          </span>
                          <span className="text-[8px] md:text-[9px] text-slate-400 font-bold block mt-0.5 md:mt-1">
                            {u.U_Role}
                          </span>
                        </div>
                      </div>
                    </th>
                  )) : (
                    <th className="p-4 md:p-6 lg:p-8 text-[9px] md:text-[10px] text-slate-500 italic" scope="col">
                      Aucun collaborateur trouvé
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {competences.length > 0 ? competences.map(comp => (
                  <tr key={comp.COMP_Id} className="group hover:bg-slate-50/50 transition-colors" role="row">
                    <td 
                      className="p-4 md:p-6 border-r border-slate-100 bg-white sticky left-0 z-10 group-hover:bg-slate-50 text-left"
                      role="rowheader"
                      aria-label={`Compétence: ${comp.COMP_Name}`}
                    >
                      <p className="text-sm md:text-base font-black text-slate-900 m-0 leading-tight italic uppercase truncate">
                        {comp.COMP_Name}
                      </p>
                      <span className="text-[8px] md:text-[9px] font-black text-indigo-500 uppercase tracking-widest italic mt-1 md:mt-2 block">
                        Objectif : Niveau {comp.COMP_TargetLevel}
                      </span>
                    </td>
                    {filteredUsers.length > 0 ? filteredUsers.map(u => {
                      const ev = getEval(u.U_Id, comp.COMP_Id);
                      const level = ev ? ev.EV_LevelAcquired : 0;
                      return (
                        <MatrixCell 
                          key={`${u.U_Id}-${comp.COMP_Id}`}
                          level={level}
                          targetLevel={comp.COMP_TargetLevel}
                          userId={u.U_Id}
                          competenceId={comp.COMP_Id}
                        />
                      );
                    }) : null}
                  </tr>
                )) : (
                  <tr>
                    <td 
                      colSpan={filteredUsers.length + 1} 
                      className="p-12 md:p-16 lg:p-20 text-center opacity-30 italic font-black uppercase tracking-widest"
                      role="status"
                    >
                      Référentiel GPEC Vierge
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </main>

      {/* ℹ️ FOOTER */}
      <footer className="shrink-0 bg-white border-t border-slate-200 px-4 md:px-6 py-3 md:py-4 lg:py-6 flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-indigo-700 font-black text-[9px] md:text-[10px] tracking-widest uppercase italic">
          <ShieldCheck size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> 
          Matrice de Polyvalence Scellée • ISO 9001:2015 §7.2
        </div>
        <div className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-widest italic">
          {filteredUsers.length} TALENTS ACTIFS SUR {users.length}
        </div>
      </footer>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(79,70,229,0.3);border-radius:10px}:focus-visible{outline:2px solid #4f46e5;outline-offset:2px}`}</style>
    </div>
  );
}