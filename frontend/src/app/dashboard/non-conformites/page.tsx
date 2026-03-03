/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : page.tsx (Registre NC)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage et filtrage du registre des écarts (§10.2).
 * RÉPARATION : Suppression de NC_Code (Inexistant) -> Pivot sur NC_Id.
 * RÉVISION : 03 Mars 2026 | 16:35 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Search, Filter, Plus, ShieldAlert, CheckCircle2, 
  Clock, AlertTriangle, FileText, ChevronRight, Loader2 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// 🔱 RÉFÉRENTIEL ELITE-SDE
import { NonConformite, NCStatus, NCGravity } from '@/types/elite-sde';

export default function NonConformitesPage() {
  const router = useRouter();
  const [ncs, setNcs] = useState<NonConformite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'ALL',
    gravity: 'ALL',
    source: 'ALL'
  });

  const fetchNcs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<NonConformite[]>('/non-conformites');
      setNcs(res.data || []);
    } catch (err) {
      toast.error("ERREUR KERNEL : Impossible de synchroniser le registre NC.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNcs(); }, [fetchNcs]);

  /**
   * 🛡️ MOTEUR DE RECHERCHE & FILTRAGE SCELLÉ
   * Correction de l'erreur NC_Code -> Utilisation de NC_Id
   */
  const filteredNcs = useMemo(() => {
    return ncs.filter((nc) => {
      const q = searchQuery.toLowerCase();
      
      // ✅ CORRECTIF : On cherche dans le Libelle OU dans les 8 premiers caractères de l'ID
      const matchesSearch = 
        nc.NC_Libelle.toLowerCase().includes(q) || 
        nc.NC_Id.toLowerCase().includes(q);

      const matchesStatus = filters.status === 'ALL' || nc.NC_Statut === filters.status;
      const matchesGravity = filters.gravity === 'ALL' || nc.NC_Gravite === filters.gravity;
      const matchesSource = filters.source === 'ALL' || nc.NC_Source === filters.source;

      return matchesSearch && matchesStatus && matchesGravity && matchesSource;
    });
  }, [ncs, searchQuery, filters]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center italic text-blue-500 font-black uppercase tracking-[0.4em]">
        <Loader2 className="animate-spin mr-4" size={32} /> Synchronisation Matrix...
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-sans italic">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 text-left">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter m-0 italic">
            Registre <span className="text-red-600">Non-Conformités</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Maîtrise des Écarts — ISO 9001:2015 §10.2</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/non-conformites/new')}
          className="px-8 py-4 bg-red-600 hover:bg-white hover:text-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-red-900/20 border-none cursor-pointer"
        >
          <Plus size={16} strokeWidth={3} /> Déclarer un écart
        </button>
      </div>

      {/* 🔍 BARRE DE RECHERCHE ET FILTRES */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-white/5 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
        <div className="lg:col-span-2 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="RECHERCHER UN LIBELLÉ OU UN ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black text-white outline-none focus:border-red-500/50 transition-all uppercase italic tracking-widest"
          />
        </div>
        
        <select 
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
          className="bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black text-slate-400 outline-none focus:border-red-500/50 cursor-pointer appearance-none uppercase italic"
        >
          <option value="ALL">TOUS LES STATUTS</option>
          {Object.values(NCStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select 
          value={filters.gravity}
          onChange={(e) => setFilters({...filters, gravity: e.target.value})}
          className="bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black text-slate-400 outline-none focus:border-red-500/50 cursor-pointer appearance-none uppercase italic"
        >
          <option value="ALL">TOUTES GRAVITÉS</option>
          {Object.values(NCGravity).map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* 📋 LISTE DES NC */}
      <div className="grid grid-cols-1 gap-4">
        {filteredNcs.length > 0 ? filteredNcs.map((nc) => (
          <div 
            key={nc.NC_Id}
            onClick={() => router.push(`/dashboard/non-conformites/${nc.NC_Id}`)}
            className="group bg-[#0F172A]/40 border border-white/5 hover:border-red-500/30 p-6 rounded-4xl flex flex-col md:flex-row items-center justify-between gap-6 transition-all cursor-pointer hover:bg-[#0F172A]/80"
          >
            <div className="flex items-center gap-6 flex-1 text-left">
              <div className={`p-4 rounded-2xl ${nc.NC_Gravite === 'CRITIQUE' ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-500'}`}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">REF: {nc.NC_Id.slice(0, 8).toUpperCase()}</span>
                  <span className={`text-[7px] font-black px-2 py-0.5 rounded-md uppercase ${nc.NC_Gravite === 'CRITIQUE' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    {nc.NC_Gravite}
                  </span>
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-red-500 transition-colors">{nc.NC_Libelle}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-[9px] text-slate-500 font-bold flex items-center gap-1 uppercase"><Clock size={10} /> {new Date(nc.NC_CreatedAt).toLocaleDateString()}</span>
                  <span className="text-[9px] text-slate-500 font-bold flex items-center gap-1 uppercase"><FileText size={10} /> {nc.NC_Source}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right hidden md:block">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">État Actuel</p>
                <p className={`text-[10px] font-black uppercase italic ${nc.NC_Statut === 'CLOTURE' ? 'text-emerald-500' : 'text-blue-500'}`}>
                  {nc.NC_Statut}
                </p>
              </div>
              <ChevronRight className="text-slate-800 group-hover:text-red-500 group-hover:translate-x-1 transition-all" size={20} />
            </div>
          </div>
        )) : (
          <div className="p-20 bg-white/5 border border-dashed border-white/10 rounded-[3rem] text-center">
            <CheckCircle2 className="text-slate-800 mx-auto mb-4" size={48} />
            <p className="text-xs font-black text-slate-600 uppercase tracking-widest italic">Aucun écart détecté dans ce périmètre.</p>
          </div>
        )}
      </div>
    </div>
  );
}