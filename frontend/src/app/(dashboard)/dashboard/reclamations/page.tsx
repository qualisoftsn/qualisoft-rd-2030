/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : RECLAMATIONS REGISTRY (ELITE SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage du registre des réclamations tiers (§8.2.1 ISO 9001).
 * DESIGN : High-Density, ClickUp Cockpit, 100dvh.
 * ARCHITECTURE : Zéro NextAuth (100% apiClient JWT).
 * -------------------------------------------------------------------------
 * DATE : 06 Mars 2026 | 10:15 GMT
 */

"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast, Toaster } from 'sonner';
import { Plus, RefreshCcw, FileText, Search, Filter, ShieldAlert, ChevronRight, Activity, RefreshCw } from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { useRouter } from 'next/navigation';
import { cn } from '@/core/utils/cn';

export default function ReclamationsPage() {
  const router = useRouter();
  const [reclamations, setReclamations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReclamations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>('/reclamations');
      const data = res.data?.data || res.data || [];
      setReclamations(Array.isArray(data) ? data : []);
    } catch {
      toast.error('ÉCHEC KERNEL : Synchronisation registre ISO 10002 interrompue.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReclamations(); }, [fetchReclamations]);

  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return reclamations.filter(r => 
      r.REC_Reference?.toLowerCase().includes(t) || 
      r.REC_Object?.toLowerCase().includes(t) ||
      r.Tier?.TR_Name?.toLowerCase().includes(t)
    );
  }, [searchTerm, reclamations]);

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-4">
            <span className="bg-blue-600/10 border border-blue-500/20 px-4 py-1 rounded-xl text-[9px] text-blue-500 tracking-widest italic shadow-inner">ISO 9001 §8.2.1 Compliance</span>
            <span className="text-slate-500 text-[9px] tracking-widest uppercase">{reclamations.length} DOSSIER(S) ACTIFS</span>
          </div>
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic">Registre <span className="text-blue-500 underline decoration-white/10">Réclamations</span></h1>
        </div>

        <div className="flex gap-4 w-full xl:w-auto">
          <button onClick={() => router.push('/dashboard/quality/reclamations/nouveau')} className="flex-1 xl:flex-none bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-5 rounded-3xl text-[10px] shadow-4xl border-none cursor-pointer text-white italic transition-all active:scale-95 flex items-center justify-center gap-3 tracking-widest uppercase">
            <Plus size={18} strokeWidth={3} /> Nouvel Écart
          </button>
          <button onClick={fetchReclamations} className="p-5 bg-white/5 rounded-3xl hover:bg-white/10 hover:text-blue-500 border border-white/10 transition-all cursor-pointer shadow-sm">
            <RefreshCcw size={24} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* 🔍 MATRIX FILTRAGE */}
      <nav className="shrink-0 p-6 bg-[#0B1222]/50 border-b border-white/5 flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-all" size={20} />
          <input 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            placeholder="FILTRER PAR RÉFÉRENCE, TIERS OU OBJET..." 
            className="w-full bg-black/40 border-2 border-white/5 rounded-[2.5rem] py-5 pl-16 pr-8 text-[11px] font-black italic text-white outline-none focus:border-blue-600 shadow-inner uppercase" 
          />
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-5 bg-slate-900 border-2 border-white/5 rounded-3xl text-[10px] font-black text-slate-500 italic flex items-center gap-3 hover:text-white transition-all"><Filter size={16}/> Filtres Avancés</button>
        </div>
      </nav>

      {/* 📊 DATA STREAM */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-375 mx-auto space-y-4 pb-32">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-6 opacity-30">
              <RefreshCw className="animate-spin text-blue-500" size={60} />
              <p className="text-[12px] tracking-[0.4em]">Synchronisation SDE...</p>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((rec) => (
              <div key={rec.REC_Id} onClick={() => router.push(`/dashboard/quality/reclamations/${rec.REC_Id}`)} className="p-8 bg-[#151B2B] border-2 border-white/5 rounded-[2.5rem] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 group hover:border-blue-500/30 hover:shadow-4xl transition-all cursor-pointer text-left">
                <div className="flex items-center gap-8 flex-1">
                  <div className="w-16 h-16 rounded-2xl bg-black/40 border-2 border-white/5 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                    <FileText size={28} />
                  </div>
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-slate-500 tracking-widest italic">{rec.REC_Reference} • {new Date(rec.REC_DateReceipt).toLocaleDateString()}</span>
                      <span className={cn("text-[9px] px-3 py-1 rounded-lg border font-black uppercase tracking-widest", rec.REC_Status === 'RESOLU' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-blue-600/10 border-blue-500/20 text-blue-400')}>
                        {rec.REC_Status?.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-xl font-black italic m-0 uppercase text-white truncate group-hover:text-blue-400 transition-colors">{rec.REC_Object}</h3>
                    <p className="text-[10px] text-slate-500 flex items-center gap-2 m-0 font-bold uppercase tracking-widest">
                      <ShieldAlert size={12} className="text-slate-700"/> Tiers : <span className="text-slate-300">{rec.Tier?.TR_Name || "ANONYME"}</span>
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-6">
                  <div className="text-right hidden xl:block">
                    <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest m-0">Imputation</p>
                    <p className="text-[10px] text-slate-400 font-black italic m-0">{rec.Processus?.PR_Libelle || "QUALITÉ GLOBALE"}</p>
                  </div>
                  <ChevronRight size={24} className="text-slate-800 group-hover:text-blue-500 group-hover:translate-x-2 transition-all" />
                </div>
              </div>
            ))
          ) : (
            <div className="h-96 flex flex-col items-center justify-center opacity-10 gap-8 italic grayscale">
              <FileText size={100} strokeWidth={1} />
              <p className="text-2xl tracking-[0.3em] font-black">Aucun signal détecté</p>
            </div>
          )}
        </div>
      </main>

      {/* ℹ️ FOOTER CONFORMITÉ */}
      <footer className="shrink-0 p-6 border-t border-white/5 bg-black/40 flex items-center justify-between">
        <p className="text-[9px] font-black text-slate-700 tracking-widest m-0 flex items-center gap-3 uppercase italic">
          <ShieldAlert size={14} /> Système de Management de la Satisfaction Client • ISO 10002 • MATRIX RD-2026
        </p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}
