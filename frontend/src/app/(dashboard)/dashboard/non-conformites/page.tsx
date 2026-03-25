/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : REGISTRE DES NON-CONFORMITÉS §10.2 (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage, filtrage et surveillance des écarts SMQ.
 * DESIGN : 100dvh, Dark Matrix, ClickUp High-Density, Zéro Scroll Global.
 * FIX : Pivot intégral sur NC_Id (Suppression NC_Code).
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 17:10 GMT
 */

"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Search, Filter, Plus, ShieldAlert, CheckCircle2, 
  Clock, AlertTriangle, FileText, ChevronRight, Loader2, RefreshCcw, 
  Target, BarChart3, AlertOctagon
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function NonConformitesPage() {
  const router = useRouter();
  const [ncs, setNcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ status: 'ALL', gravity: 'ALL' });

  const fetchNcs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/non-conformites');
      setNcs(res.data?.data || res.data || []);
    } catch (err) {
      toast.error("RUPTURE DU REGISTRE NC : SYNC KERNEL ÉCHOUÉE");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNcs(); }, [fetchNcs]);

  const filteredNcs = useMemo(() => {
    return ncs.filter((nc) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = nc.NC_Libelle.toLowerCase().includes(q) || nc.NC_Id.toLowerCase().includes(q);
      const matchesStatus = filters.status === 'ALL' || nc.NC_Statut === filters.status;
      const matchesGravity = filters.gravity === 'ALL' || nc.NC_Gravite === filters.gravity;
      return matchesSearch && matchesStatus && matchesGravity;
    });
  }, [ncs, searchQuery, filters]);

  const stats = useMemo(() => {
    const total = ncs.length;
    const critical = ncs.filter(n => n.NC_Gravite === 'CRITIQUE').length;
    const open = ncs.filter(n => n.NC_Statut !== 'CLOTURE').length;
    return { total, critical, open };
  }, [ncs]);

  if (loading) return <LoadingScreen label="Audit du Registre des Écarts §10.2..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-red-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER FIXE */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0 bg-[#0B0F1A]/95 backdrop-blur-xl z-40">
        <div className="text-left space-y-2">
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic">Registre <span className="text-red-600">Non-Conformités</span></h1>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] m-0 italic"><ShieldAlert size={12} className="text-red-500" /> Maîtrise des Écarts — ISO 9001 §10.2</p>
        </div>
        <button onClick={() => router.push('/dashboard/non-conformites/new')} className="bg-red-600 hover:bg-white hover:text-red-600 px-10 py-4 rounded-2xl text-[10px] flex items-center gap-3 shadow-4xl border-none cursor-pointer text-white italic transition-all active:scale-95">
          <Plus size={18} strokeWidth={3} /> Déclarer un écart
        </button>
      </header>

      {/* 📊 KPI ROW */}
      <div className="shrink-0 p-8 pb-0 grid grid-cols-1 md:grid-cols-3 gap-6">
        <NCStatCard label="Écarts Indexés" val={stats.total} icon={FileText} color="blue" />
        <NCStatCard label="Alertes Critiques" val={stats.critical} icon={AlertOctagon} color="rose" alert={stats.critical > 0} />
        <NCStatCard label="En Résolution" val={stats.open} icon={Clock} color="amber" />
      </div>

      {/* 🔍 FILTRES DENSES */}
      <div className="shrink-0 p-8 pb-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={20} />
          <input type="text" placeholder="SCANNER LIBELLÉ OU ID MATRIX..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black/40 border-2 border-white/5 rounded-3xl py-5 pl-16 pr-8 text-[11px] font-black text-white outline-none focus:border-red-600/50 transition-all uppercase italic tracking-widest" />
        </div>
        <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="bg-black/40 border-2 border-white/5 rounded-3xl px-8 py-5 text-[10px] font-black text-slate-400 outline-none cursor-pointer appearance-none uppercase italic shadow-inner"><option value="ALL">TOUS LES STATUTS</option><option value="DETECTION">DETECTION</option><option value="ANALYSE">ANALYSE</option><option value="CLOTURE">CLOTURE</option></select>
        <select value={filters.gravity} onChange={(e) => setFilters({...filters, gravity: e.target.value})} className="bg-black/40 border-2 border-white/5 rounded-3xl px-8 py-5 text-[10px] font-black text-slate-400 outline-none cursor-pointer appearance-none uppercase italic shadow-inner"><option value="ALL">TOUTES GRAVITÉS</option><option value="MINEURE">MINEURE</option><option value="MAJEURE">MAJEURE</option><option value="CRITIQUE">CRITIQUE</option></select>
      </div>

      {/* 📋 REGISTRE (Scroll Isolé) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4 space-y-4">
        {filteredNcs.length > 0 ? filteredNcs.map((nc) => (
          <div key={nc.NC_Id} onClick={() => router.push(`/dashboard/non-conformites/${nc.NC_Id}`)} className="bg-[#151B2B] border-2 border-white/5 hover:border-red-600/30 p-8 rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-8 transition-all cursor-pointer group shadow-4xl hover:bg-black/40 relative overflow-hidden">
            <div className="flex items-center gap-8 flex-1 text-left relative z-10">
              <div className={cn("p-5 rounded-4xl border transition-all", nc.NC_Gravite === 'CRITIQUE' ? 'bg-red-600/10 text-red-500 border-red-500/20' : 'bg-white/5 text-slate-500 border-white/5')}>
                <ShieldAlert size={32} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-600 tracking-[0.3em]">ID #{nc.NC_Id.slice(0, 8)}</span>
                  <span className={cn("text-[9px] px-4 py-1.5 rounded-xl border", nc.NC_Gravite === 'CRITIQUE' ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-900/40' : 'bg-slate-800 text-slate-400 border-slate-700')}>
                    {nc.NC_Gravite}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tighter group-hover:text-red-500 transition-colors m-0 leading-none">{nc.NC_Libelle}</h3>
                <div className="flex items-center gap-6 opacity-60">
                   <span className="text-[10px] flex items-center gap-2 tracking-widest"><Clock size={12} /> {new Date(nc.NC_CreatedAt).toLocaleDateString()}</span>
                   <span className="text-[10px] flex items-center gap-2 tracking-widest"><Target size={12} /> {nc.NC_Source}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-10 relative z-10">
              <div className="text-right hidden md:block">
                <p className="text-[9px] font-black text-slate-600 tracking-widest mb-2 leading-none uppercase">Statut SMI</p>
                <p className={cn("text-sm font-black italic m-0 tracking-tighter", nc.NC_Statut === 'CLOTURE' ? 'text-emerald-500' : 'text-blue-500')}>
                  {nc.NC_Statut}
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-red-600 transition-all text-white"><ChevronRight size={24} /></div>
            </div>
          </div>
        )) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-white/5 rounded-[5rem]">
            <CheckCircle2 size={80} className="mb-6" />
            <p className="text-xl tracking-[0.5em]">Aucun écart détecté §10.2</p>
          </div>
        )}
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(220,38,38,0.1); border-radius: 10px; }` }} />
    </div>
  );
}

function NCStatCard({ label, val, icon: Icon, color, alert }: any) {
  const themes: any = { blue: "text-blue-500 bg-blue-500/10 border-blue-500/20", rose: "text-red-500 bg-red-500/10 border-red-500/20", amber: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
  return (
    <div className={cn("bg-[#151B2B] p-8 rounded-[3rem] border-2 flex items-center gap-6 shadow-4xl", alert ? "border-red-600/40 animate-pulse" : "border-white/5")}>
      <div className={cn("p-4 rounded-2xl shadow-inner", themes[color])}><Icon size={24} /></div>
      <div className="text-left">
        <p className="text-[10px] text-slate-500 tracking-widest mb-2 italic m-0 leading-none">{label}</p>
        <p className="text-4xl font-black italic m-0 tracking-tighter leading-none">{val}</p>
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-red-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCcw className="animate-spin" size={60} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center">{label}</span>
    </div>
  );
}
