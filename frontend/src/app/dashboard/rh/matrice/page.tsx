/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

/**
 * 👥 MODULE : RH - MATRICE DES COMPÉTENCES (GPEC / ISO 9001)
 * -------------------------------------------------------------------------
 * RÔLE : Cartographie des aptitudes, suivi des qualifications et polyvalence.
 * CONFORMITÉ : Architecture SDE Elite (Isolement par Tenant).
 * CORRECTION : Récupération sécurisée du tenantId via l'objet User.
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 22:55 GMT
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import {
  Loader2, Users, Target, AlertCircle, Search, 
  Download, Plus, Award, CheckCircle2, ShieldCheck, X
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- TYPAGES SDE ÉLITE ---
interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Role: string;
}

interface Competence {
  COMP_Id: string;
  COMP_Name: string;
  COMP_Category: string;
  COMP_TargetLevel: number;
}

interface Evaluation {
  EV_Id: string;
  EV_UserId: string;
  EV_CompetenceId: string;
  EV_LevelAcquired: number;
}

export default function RHMasterMatrix() {
  const router = useRouter();
  
  // 🔐 Utilisation du Store Zustand (Correction du hook Auth)
  const { user, isAuthenticated } = useAuthStore() as any;
  const [isClient, setIsClient] = useState(false);

  // 🛡️ Récupération sécurisée de l'ID d'isolement
  const tenantId = user?.tenantId;

  // --- ÉTATS ---
  const [users, setUsers] = useState<User[]>([]);
  const [competences, setCompetences] = useState<Competence[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Hydratation stricte
  useEffect(() => { setIsClient(true); }, []);

  // --- SYNCHRONISATION DES DONNÉES RH ---
  const fetchMatrixData = useCallback(async () => {
    if (!tenantId) return;

    setLoading(true);
    try {
      const [resUsers, resComps, resEvals] = await Promise.all([
        apiClient.get<User[]>('/users'),
        apiClient.get<Competence[]>('/rh/competences'),
        apiClient.get<Evaluation[]>('/rh/evaluations')
      ]);

      setUsers(resUsers.data || []);
      setCompetences(resComps.data || []);
      setEvaluations(resEvals.data || []);
    } catch (err) {
      toast.error('Échec de synchronisation de la matrice RH');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (isClient) {
      if (!isAuthenticated) router.replace('/auth/login');
      else fetchMatrixData();
    }
  }, [isClient, isAuthenticated, fetchMatrixData, router]);

  // --- LOGIQUE MATRICIELLE ---
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      `${u.U_FirstName} ${u.U_LastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const getEvaluation = (userId: string, compId: string) => {
    return evaluations.find(e => e.EV_UserId === userId && e.EV_CompetenceId === compId);
  };

  const getLevelStyle = (acquired: number, target: number) => {
    if (acquired >= target) return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Acquis' };
    if (acquired > 0) return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'En cours' };
    return { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Non acquis' };
  };

  // --- SÉCURITÉ RENDU ---
  if (!isClient || loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-xs font-black uppercase text-slate-400 tracking-widest">
          Calcul de la cartographie RH...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen p-8 font-sans selection:bg-indigo-100 pb-20">
      <Toaster position="top-right" richColors />

      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* 🔝 HEADER STRATÉGIQUE */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200">
                <Target size={22} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">
                Matrice des <span className="text-indigo-600">Compétences</span>
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Cartographie GPEC — Vue transversale des aptitudes et polyvalences du personnel.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Download size={18} />
            </button>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
              <Plus size={18} strokeWidth={3} /> Nouvelle Évaluation
            </button>
          </div>
        </header>

        {/* 🔍 BARRE D'OUTILS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Rechercher un collaborateur..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* LÉGENDE (Avec correction syntaxique des chevrons) */}
          <div className="flex items-center gap-6 bg-slate-50 px-6 py-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Acquis (&gt;= cible)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-400"></div>
              {/* ✅ CORRECTION : Utilisation de {`\u003C`} ou d'entité HTML pour le signe inférieur */}
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">En cours (&lt; cible)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-slate-300"></div>
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Non évalué</span>
            </div>
          </div>
        </div>

        {/* 📊 GRILLE MATRICIELLE SOUVERAINE */}
        <div className="bg-white rounded-4xl border border-slate-200 shadow-xl overflow-hidden overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-6 text-xs font-black uppercase text-slate-400 tracking-widest border-b border-r border-slate-200 w-64 bg-slate-50 sticky left-0 z-10">
                  Compétences \ Collaborateurs
                </th>
                {filteredUsers.map(u => (
                  <th key={u.U_Id} className="px-4 py-4 border-b border-slate-200 text-center min-w-35">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm border border-indigo-200">
                        {u.U_FirstName[0]}{u.U_LastName[0]}
                      </div>
                      <span className="text-xs font-bold text-slate-800 line-clamp-1">
                        {u.U_FirstName} {u.U_LastName}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {u.U_Role}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {competences.length === 0 ? (
                <tr>
                  <td colSpan={filteredUsers.length + 1} className="p-12 text-center text-slate-400">
                    <AlertCircle className="mx-auto mb-3 h-8 w-8 opacity-50" />
                    <p className="text-sm font-bold uppercase tracking-widest">Aucune compétence répertoriée dans le référentiel</p>
                  </td>
                </tr>
              ) : (
                competences.map((comp) => (
                  <tr key={comp.COMP_Id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 border-r border-slate-100 bg-white sticky left-0 z-10 group-hover:bg-slate-50/50 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">{comp.COMP_Name}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-1">
                          Cible : Niveau {comp.COMP_TargetLevel}
                        </span>
                      </div>
                    </td>
                    
                    {filteredUsers.map((u) => {
                      const evalData = getEvaluation(u.U_Id, comp.COMP_Id);
                      const acquiredLevel = evalData ? evalData.EV_LevelAcquired : 0;
                      const style = getLevelStyle(acquiredLevel, comp.COMP_TargetLevel);

                      return (
                        <td key={`${comp.COMP_Id}-${u.U_Id}`} className="px-4 py-5 text-center border-l border-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm border border-white/50 ${style.bg} ${style.text} shadow-sm`}>
                              {acquiredLevel}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}