/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 👥 MODULE : RH - MATRICE DES COMPÉTENCES (ELITE SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Cartographie GPEC, suivi des qualifications et polyvalence.
 * DESIGN : Elite Sticky-Matrix, ClickUp High-Density, 100dvh.
 * RECTIFICATION : Double-échappement des backslashes LaTeX (Ligne 147).
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 19:25 GMT
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import {
  Search, Download, Plus, Award, ShieldCheck, RefreshCw} from 'lucide-react';
import { toast, Toaster } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function RHMasterMatrix() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore() as any;
  const [users, setUsers] = useState<any[]>([]);
  const [competences, setCompetences] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resUsers, resComps, resEvals] = await Promise.all([
        apiClient.get<any[]>('/users'),
        apiClient.get<any[]>('/rh/competences'),
        apiClient.get<any[]>('/rh/evaluations')
      ]);
      setUsers(resUsers.data || []);
      setCompetences(resComps.data || []);
      setEvaluations(resEvals.data || []);
    } catch {
      toast.error('ERREUR MATRICE : Échec de la cartographie.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/auth/login');
    else fetchData();
  }, [isAuthenticated, fetchData, router]);

  const filteredUsers = useMemo(() => 
    users.filter(u => `${u.U_FirstName} ${u.U_LastName}`.toLowerCase().includes(searchTerm.toLowerCase())), 
  [users, searchTerm]);

  const getEval = (uId: string, cId: string) => evaluations.find(e => e.EV_UserId === uId && e.EV_CompetenceId === cId);

  if (loading) return <LoadingScreen label="Calcul de la Matrice GPEC..." />;

  return (
    <div className="h-screen bg-[#F9FAFB] text-slate-900 flex flex-col overflow-hidden w-full lg:pl-72 italic font-black uppercase selection:bg-indigo-100">
      <Toaster position="top-right" richColors theme="light" />

      {/* 🔝 HEADER TACTIQUE */}
      <header className="shrink-0 p-8 border-b border-slate-200 bg-white flex flex-col xl:flex-row justify-between items-center gap-6">
        <div className="text-left space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg"><Award size={22} /></div>
            <h1 className="text-3xl lg:text-4xl tracking-tighter text-slate-900 m-0 leading-none">Matrice <span className="text-indigo-600">GPEC</span></h1>
          </div>
          <p className="text-slate-500 text-[10px] tracking-widest m-0 uppercase italic">Cartographie transversale des aptitudes §7.2</p>
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto">
          {/* ✅ RECTIFICATION FINALE : Double backslash pour échapper le parseur TSX */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-600 text-[10px] font-black italic shadow-inner">
            {"$$Polyvalence = \\frac{\\sum{Acquis}}{\\sum{Cible}} \\times 100$$"}
          </div>
          <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 shadow-sm cursor-pointer border-none"><Download size={20} /></button>
          <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[11px] hover:bg-indigo-700 transition-all shadow-xl active:scale-95 border-none cursor-pointer italic">
            <Plus size={18} strokeWidth={3} className="mr-2 inline" /> Évaluer
          </button>
        </div>
      </header>

      {/* 🔍 NAVIGATION BAR */}
      <nav className="shrink-0 px-8 py-4 bg-white border-b border-slate-200 flex flex-col md:flex-row gap-6 justify-between items-center">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={18} />
          <input 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher un talent..." 
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-4 pl-12 pr-4 text-[11px] font-black outline-none focus:bg-white focus:border-indigo-600 transition-all uppercase italic shadow-inner" 
          />
        </div>
        <div className="flex gap-6">
           <Legend color="bg-emerald-400" label="Acquis" />
           <Legend color="bg-amber-400" label="Écart" />
           <Legend color="bg-slate-200" label="N/A" />
        </div>
      </nav>

      {/* 📊 MATRIX DATA STREAM (Isolated Scroll) */}
      <main className="flex-1 overflow-auto custom-scrollbar bg-slate-100/30 p-8">
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden min-w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="p-8 text-[11px] font-black text-slate-500 tracking-[0.2em] border-b border-r border-slate-100 sticky left-0 top-0 bg-slate-50 z-30 w-80 text-left italic">COMPÉTENCES \ TALENTS</th>
                {filteredUsers.map(u => (
                  <th key={u.U_Id} className="p-6 border-b border-slate-100 min-w-44 sticky top-0 bg-slate-50/80 z-20 backdrop-blur-md">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-sm shadow-lg font-black">{u.U_FirstName[0]}{u.U_LastName[0]}</div>
                      <div className="text-center">
                        <span className="text-[10px] font-black text-slate-900 tracking-tighter block truncate w-32">{u.U_FirstName} {u.U_LastName}</span>
                        <span className="text-[8px] text-slate-400 font-bold block mt-1">{u.U_Role}</span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {competences.length > 0 ? competences.map(comp => (
                <tr key={comp.COMP_Id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-6 border-r border-slate-100 bg-white sticky left-0 z-10 group-hover:bg-slate-50 text-left">
                    <p className="text-sm font-black text-slate-900 m-0 leading-tight italic uppercase">{comp.COMP_Name}</p>
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic mt-2 block">Objectif : Niveau {comp.COMP_TargetLevel}</span>
                  </td>
                  {filteredUsers.map(u => {
                    const ev = getEval(u.U_Id, comp.COMP_Id);
                    const level = ev ? ev.EV_LevelAcquired : 0;
                    const isMet = level >= comp.COMP_TargetLevel;
                    return (
                      <td key={u.U_Id} className="p-4 border-l border-slate-50">
                        <div className="flex justify-center">
                          <span className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black shadow-inner border-2 transition-all",
                            level === 0 ? "bg-slate-50 text-slate-200 border-slate-100" :
                            isMet ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                          )}>
                            {level}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              )) : (
                <tr>
                  <td colSpan={filteredUsers.length + 1} className="p-20 text-center opacity-30 italic font-black uppercase tracking-widest">Référentiel GPEC Vierge</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ℹ️ FOOTER CONFORMITÉ */}
      <footer className="shrink-0 bg-white border-t border-slate-200 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4 text-indigo-700 font-black text-[10px] tracking-widest uppercase italic">
          <ShieldCheck size={20} /> Matrice de Polyvalence Scellée • ISO 9001:2015 §7.2
        </div>
        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic">
          {filteredUsers.length} TALENTS ACTIFS SUR {users.length}
        </div>
      </footer>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function Legend({ color, label }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-3 w-3 rounded-full", color)} />
      <span className="text-[10px] font-black text-slate-500 tracking-widest italic">{label}</span>
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