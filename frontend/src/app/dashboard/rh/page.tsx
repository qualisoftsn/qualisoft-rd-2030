/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🧠 MODULE : HUB RH & INTELLIGENCE DES TALENTS (ELITE SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage centralisé du personnel et des compétences (§7.2 ISO 9001).
 * DESIGN : Elite High-Density, ClickUp Cockpit Style, 100dvh.
 * ARCHITECTURE : Zéro NextAuth (100% apiClient JWT).
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 18:22 GMT
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import {
  Users, Target, BookOpen, 
  TrendingUp, Plus, ShieldCheck, Award, RefreshCw, ChevronRight
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- TYPES SDE ---
interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Role: string;
  U_IsActive: boolean;
}

interface RHData {
  users: User[];
  competences: any[];
  formations: any[];
}

export default function RHIntelligenceHub() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore() as any;
  const [data, setData] = useState<RHData>({ users: [], competences: [], formations: [] });
  const [loading, setLoading] = useState(true);

  const fetchRHData = useCallback(async () => {
    try {
      setLoading(true);
      const [resUsers, resComps, resForms] = await Promise.all([
        apiClient.get<User[]>('/users'),
        apiClient.get<any[]>('/rh/competences'),
        apiClient.get<any[]>('/rh/formations')
      ]);

      setData({
        users: resUsers.data || [],
        competences: resComps.data || [],
        formations: resForms.data || []
      });
    } catch {
      toast.error('RUPTURE DE FLUX RH : Synchronisation impossible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/auth/login');
    else fetchRHData();
  }, [isAuthenticated, fetchRHData, router]);

  const stats = useMemo(() => ({
    activeUsers: data.users.filter(u => u.U_IsActive).length,
    formationsActive: data.formations.filter(f => f.FORM_Status === 'EN_COURS').length
  }), [data]);

  if (loading) return <LoadingScreen label="Extraction du Hub RH..." />;

  return (
    <div className="h-screen bg-[#F9FAFB] text-slate-900 flex flex-col overflow-hidden w-full lg:pl-72 italic selection:bg-indigo-100">
      <Toaster position="top-right" richColors theme="light" />

      {/* 🔝 HEADER TACTIQUE */}
      <header className="shrink-0 p-8 border-b border-slate-200 bg-white flex flex-col xl:flex-row justify-between items-center gap-6">
        <div className="text-left space-y-2">
          <div className="flex items-center gap-3">
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest italic shadow-lg">ISO 9001 §7.2</span>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-slate-900 uppercase leading-none m-0">
              Intelligence <span className="text-indigo-600">RH</span>
            </h1>
          </div>
          <p className="text-slate-500 text-sm font-medium m-0 uppercase tracking-tighter">Pilotage des compétences et de la polyvalence</p>
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto">
          <button 
            onClick={() => router.push('/dashboard/rh/matrice')}
            className="flex-1 xl:flex-none flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm cursor-pointer italic"
          >
            <Target size={18} /> Matrice GPEC
          </button>
          <button className="flex-1 xl:flex-none flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 border-none cursor-pointer italic">
            <Plus size={18} strokeWidth={3} /> Action RH
          </button>
        </div>
      </header>

      {/* 🧩 VIEWPORT PRINCIPAL */}
      <main className="flex-1 overflow-hidden p-8 flex flex-col gap-8">
        
        {/* KPI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
          <KPIBox title="Effectif Actif" value={stats.activeUsers} icon={Users} color="indigo" sub={`Sur ${data.users.length} collaborateurs`} />
          <KPIBox title="Référentiel" value={data.competences.length} icon={Award} color="emerald" sub="Compétences normées" />
          <KPIBox title="Plan Formation" value={stats.formationsActive} icon={BookOpen} color="amber" sub="Sessions en cours" />
        </div>

        {/* DOUBLE SECTION RÉACTIVE */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LISTE COLLABORATEURS (Isolated Scroll) */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-col overflow-hidden">
            <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-3 m-0">
                <ShieldCheck className="text-indigo-600" size={24} /> Registre Personnel
              </h2>
              <button onClick={() => router.push('/dashboard/users')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline border-none bg-transparent cursor-pointer">Voir tout</button>
            </header>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {data.users.map(u => (
                <div key={u.U_Id} className="flex items-center justify-between p-5 rounded-3xl border border-slate-100 bg-white hover:border-indigo-200 transition-all group shadow-sm">
                  <div className="flex items-center gap-5 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-black text-sm uppercase group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                      {u.U_FirstName[0]}{u.U_LastName[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm m-0 italic">{u.U_FirstName} {u.U_LastName}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 m-0">{u.U_Role}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" size={20} />
                </div>
              ))}
            </div>
          </section>

          {/* FORMATIONS (Isolated Scroll) */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-col overflow-hidden">
            <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-3 m-0">
                <TrendingUp className="text-amber-500" size={24} /> Plan de Formation
              </h2>
              <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline border-none bg-transparent cursor-pointer">Gérer</button>
            </header>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {data.formations.map(f => (
                <div key={f.FORM_Id} className="p-5 rounded-3xl border border-slate-100 bg-white flex flex-col gap-3 text-left">
                  <div className="flex justify-between items-start">
                    <p className="font-black text-slate-900 text-sm m-0 line-clamp-1 italic uppercase">{f.FORM_Title}</p>
                    <span className={`text-[8px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border italic ${
                      f.FORM_Status === 'TERMINEE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {f.FORM_Status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function KPIBox({ title, value, icon: Icon, color, sub }: any) {
  const themes: any = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <div className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6 group hover:shadow-lg transition-all text-left">
      <div className={`p-5 rounded-3xl border-2 ${themes[color]} group-hover:scale-110 transition-transform shadow-inner`}>
        <Icon size={32} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] m-0 mb-1">{title}</p>
        <p className="text-4xl font-black text-slate-900 italic leading-none m-0 mb-2">{value}</p>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest m-0 italic">{sub}</p>
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white gap-6 lg:pl-72 italic font-black uppercase tracking-[0.4em] text-indigo-600">
      <RefreshCw className="animate-spin" size={48} />
      <span className="text-[10px] animate-pulse">{label}</span>
    </div>
  );
}