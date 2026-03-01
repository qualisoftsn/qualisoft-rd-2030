/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛰️ MODULE : GESTION DES TIERS (PARTENAIRES EXTERNES)
 * -------------------------------------------------------------------------
 * RÔLE : Administration des Fournisseurs, Clients et Sous-traitants du SMI.
 * DESIGN : Matrix Dark Mode / Cards Souveraines.
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 14:30 GMT
 */

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Truck, Search, UserPlus, Globe, MoreHorizontal, 
  Loader2, ShieldCheck, Mail, Tag, Filter 
} from 'lucide-react';
import { toast } from 'sonner';

export default function TiersPage() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * 📡 SYNCHRONISATION DES TIERS
   * Extraction des entités externes depuis le noyau NestJS.
   */
  const loadTiers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/tiers');
      setTiers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error("Rupture de liaison avec le registre des Tiers.");
      console.error("[TIERS_SYNC_ERROR]:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTiers();
  }, [loadTiers]);

  // Filtrage intelligent en temps réel
  const filteredTiers = tiers.filter(t => 
    t.TR_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.TR_Type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 font-sans italic text-left selection:bg-blue-600/30">
      
      {/* 🔝 HEADER RÉGALIEN */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/5 pb-10 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 border border-blue-600/20 rounded-full w-fit">
            <ShieldCheck size={14} className="text-blue-500" />
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">Registre des Partenaires</span>
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white leading-none">
            Gestion <span className="text-blue-500">Tiers</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em]">Partenaires, Clients & Fournisseurs scellés</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="RECHERCHER UN TIERS..."
              className="w-full bg-white/5 border border-white/10 py-4 pl-12 pr-4 rounded-2xl text-[10px] font-black text-white outline-none focus:border-blue-600 transition-all uppercase italic tracking-widest"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-blue-600 hover:bg-white hover:text-slate-900 px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-widest shadow-2xl shadow-blue-900/20 flex items-center gap-3 transition-all active:scale-95 border-none cursor-pointer text-white">
            <UserPlus size={18} /> Nouveau Partenaire
          </button>
        </div>
      </header>

      {/* 📊 GRID DES TIERS */}
      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest animate-pulse">Synchronisation des entités...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
          {filteredTiers.map((t) => (
            <div key={t.TR_Id} className="bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] relative group hover:border-blue-500/30 transition-all duration-500 shadow-2xl backdrop-blur-3xl overflow-hidden">
              {/* Effet de fond subtil */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-colors" />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="w-16 h-16 bg-slate-950 border border-white/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Truck size={24} />
                </div>
                <button className="p-3 bg-white/5 rounded-xl text-slate-600 hover:text-white transition-colors border-none cursor-pointer">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="space-y-4 relative z-10">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">{t.TR_Name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-widest">
                    <Tag size={10} className="inline mr-1" /> {t.TR_Type || 'NON-DÉFINI'}
                  </span>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 space-y-4 text-[10px] font-black text-slate-500 uppercase italic tracking-widest relative z-10">
                <p className="flex items-center gap-3 group-hover:text-slate-300 transition-colors">
                  <Mail size={14} className="text-blue-500/50" /> {t.TR_Email || 'Contact non renseigné'}
                </p>
                <p className="flex items-center gap-3 group-hover:text-slate-300 transition-colors">
                  <Globe size={14} className="text-blue-500/50" /> ID CORE : <span className="text-blue-500">{t.TR_CodeExterne || 'AUTO-GÉNÉRÉ'}</span>
                </p>
              </div>
            </div>
          ))}

          {filteredTiers.length === 0 && !loading && (
            <div className="col-span-full py-40 text-center opacity-20 flex flex-col items-center gap-6">
              <Truck size={80} strokeWidth={1} />
              <p className="text-xs font-black uppercase tracking-[0.5em]">Aucun partenaire détecté dans le cluster</p>
            </div>
          )}
        </div>
      )}

      {/* 🛡️ FOOTER STATUS */}
      <footer className="mt-20 py-10 border-t border-white/5 opacity-30 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.5em]">
        <p>Qualisoft Tiers Manager v1.0</p>
        <p>Elite System RD 2026</p>
      </footer>
    </div>
  );
}