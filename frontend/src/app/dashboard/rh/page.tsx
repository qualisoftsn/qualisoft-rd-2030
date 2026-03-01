/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

/**
 * 🧠 MODULE : HUB RH & INTELLIGENCE DES TALENTS (ISO 9001)
 * -------------------------------------------------------------------------
 * RÔLE : Tableau de bord centralisé pour la gestion du personnel, 
 * des compétences et du plan de formation.
 * FIX : Remplacement de l'ancien AuthContext par useAuthStore (Zustand).
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 23:05 GMT
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import {
  Loader2, Users, Target, BookOpen, 
  TrendingUp, Plus, ShieldCheck, Award, AlertCircle
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- TYPAGES SDE ÉLITE ---
interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Role: string;
  U_IsActive: boolean;
}

interface Competence {
  COMP_Id: string;
  COMP_Name: string;
  COMP_Category: string;
}

interface Formation {
  FORM_Id: string;
  FORM_Title: string;
  FORM_Status: 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
}

interface RHData {
  users: User[];
  competences: Competence[];
  formations: Formation[];
}

export default function RHIntelligenceHub() {
  const router = useRouter();
  
  // 🔐 Utilisation stricte du Store Zustand
  const { user, isAuthenticated } = useAuthStore() as any;
  const [isClient, setIsClient] = useState(false);

  // 🛡️ Extraction sécurisée de la clé d'isolement (Tenant)
  const tenantId = user?.tenantId;

  // --- ÉTATS ---
  const [data, setData] = useState<RHData>({ users: [], competences: [], formations: [] });
  const [loading, setLoading] = useState(true);

  // Hydratation stricte pour Turbopack
  useEffect(() => { setIsClient(true); }, []);

  // --- SYNCHRONISATION DES DONNÉES ---
  const fetchRHData = useCallback(async () => {
    if (!tenantId) return;

    setLoading(true);
    try {
      const [resUsers, resComps, resForms] = await Promise.all([
        apiClient.get<User[]>('/users'),
        apiClient.get<Competence[]>('/rh/competences'),
        apiClient.get<Formation[]>('/rh/formations')
      ]);

      setData({
        users: resUsers.data || [],
        competences: resComps.data || [],
        formations: resForms.data || []
      });
    } catch (err) {
      toast.error('Échec de synchronisation du Hub RH');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (isClient) {
      if (!isAuthenticated) router.replace('/auth/login');
      else fetchRHData();
    }
  }, [isClient, isAuthenticated, fetchRHData, router]);

  // --- ANALYTICS (KPIs) ---
  const stats = useMemo(() => {
    const activeUsers = data.users.filter(u => u.U_IsActive).length;
    const formationsEnCours = data.formations.filter(f => f.FORM_Status === 'EN_COURS' || f.FORM_Status === 'PLANIFIEE').length;
    return { activeUsers, formationsEnCours };
  }, [data]);

  // --- SÉCURITÉ RENDU ---
  if (!isClient || loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-xs font-black uppercase text-slate-400 tracking-widest">
          Initialisation du Hub RH...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen p-8 font-sans selection:bg-indigo-100 pb-20">
      <Toaster position="top-right" richColors />

      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700">
        
        {/* 🔝 HEADER STRATÉGIQUE */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200">
                <Users size={22} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">
                Intelligence <span className="text-indigo-600">RH</span>
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Pilotage global des effectifs, du référentiel de compétences et des plans de formation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/dashboard/rh/matrice')}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
            >
              <Target size={18} /> Matrice des Compétences
            </button>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
              <Plus size={18} strokeWidth={3} /> Action RH
            </button>
          </div>
        </header>

        {/* 📊 KPI CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPIBox 
            title="Effectif Actif" 
            value={stats.activeUsers} 
            icon={Users} 
            color="indigo" 
            sub={`Sur ${data.users.length} comptes totaux`} 
          />
          <KPIBox 
            title="Référentiel" 
            value={data.competences.length} 
            icon={Award} 
            color="emerald" 
            sub="Compétences cartographiées" 
          />
          <KPIBox 
            title="Plan de Formation" 
            value={stats.formationsEnCours} 
            icon={BookOpen} 
            color="amber" 
            sub="Sessions actives / prévues" 
          />
        </div>

        {/* 🧩 SECTIONS DÉTAILLÉES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LISTE DES COLLABORATEURS RÉCENTS */}
          <div className="bg-white rounded-4xl border border-slate-200 shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-indigo-600" size={20} /> Base Collaborateurs
              </h2>
              <button 
                onClick={() => router.push('/dashboard/users')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest"
              >
                Voir tout
              </button>
            </div>
            
            <div className="space-y-4">
              {data.users.slice(0, 5).map(u => (
                <div key={u.U_Id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm">
                      {u.U_FirstName[0]}{u.U_LastName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">
                        {u.U_FirstName} {u.U_LastName}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {u.U_Role}
                      </p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${u.U_IsActive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-300'}`} />
                </div>
              ))}
              {data.users.length === 0 && (
                <p className="text-sm text-slate-400 italic text-center py-4">Aucun collaborateur enregistré.</p>
              )}
            </div>
          </div>

          {/* SESSIONS DE FORMATION */}
          <div className="bg-white rounded-4xl border border-slate-200 shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-2">
                <TrendingUp className="text-amber-500" size={20} /> Formations Récentes
              </h2>
              <button 
                onClick={() => router.push('/dashboard/rh/formations')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest"
              >
                Gérer le plan
              </button>
            </div>
            
            <div className="space-y-4">
              {data.formations.slice(0, 5).map(f => (
                <div key={f.FORM_Id} className="flex flex-col gap-2 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-amber-50/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-slate-900 text-sm line-clamp-1 pr-4">{f.FORM_Title}</p>
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border ${
                      f.FORM_Status === 'TERMINEE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                      f.FORM_Status === 'EN_COURS' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                      'bg-amber-100 text-amber-700 border-amber-200'
                    }`}>
                      {f.FORM_Status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
              {data.formations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <BookOpen size={32} className="mb-3 opacity-50" />
                  <p className="text-xs font-bold uppercase tracking-widest text-center">Aucune session de formation planifiée.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT ATOMIQUE : KPI BOX
// ============================================================================
function KPIBox({ title, value, icon: Icon, color, sub }: any) {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:border-indigo-300',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:border-amber-300',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:border-emerald-300',
  };

  return (
    <div className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 group transition-all`}>
      <div className={`p-4 rounded-2xl border ${colors[color]} transition-colors`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-900 italic leading-none mb-1.5">{value}</p>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{sub}</p>
      </div>
    </div>
  );
}