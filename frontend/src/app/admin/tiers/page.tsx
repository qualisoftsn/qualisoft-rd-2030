/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛰️ MODULE : GESTION DES TIERS (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Administration des Fournisseurs, Clients et Sous-traitants du SMI.
 * FIX : Dark Mode Matrix pur. Zéro-scroll body.
 * RÉVISION : 04 Mars 2026 | 23:10 GMT
 * -------------------------------------------------------------------------
 */

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Truck, Search, UserPlus, Globe, MoreHorizontal, 
  Loader2, ShieldCheck, Mail, Tag
} from 'lucide-react';
import { toast } from 'sonner';

export default function TiersPage() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadTiers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/tiers');
      setTiers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error("Rupture de liaison avec le registre des Tiers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTiers(); }, [loadTiers]);

  const filteredTiers = tiers.filter(t => 
    t.TR_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.TR_Type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-6 md:p-10 lg:p-12 font-sans italic text-left selection:bg-blue-600/30 text-white">
      
      {/* 🔝 HEADER RÉGALIEN */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-white/5 pb-8 gap-6 shrink-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 border border-blue-600/20 rounded-full w-fit">
            <ShieldCheck size={12} className="text-blue-500" />
            <span className="text-[8px] md:text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">Registre Partenaires</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white leading-none m-0">
            Gestion <span className="text-blue-500">Tiers</span>
          </h1>
          <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] m-0">Partenaires, Clients & Fournisseurs scellés</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" placeholder="RECHERCHER UN TIERS..."
              className="w-full bg-[#0B0F1A] border border-white/5 py-4 pl-12 pr-4 rounded-3xl text-[9px] md:text-[10px] font-black text-white outline-none focus:border-blue-600 transition-colors uppercase italic tracking-widest placeholder:text-slate-600"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="w-full sm:w-auto bg-blue-600 hover:bg-white hover:text-slate-900 px-6 py-4 rounded-3xl font-black uppercase italic text-[9px] md:text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 border-none cursor-pointer text-white">
            <UserPlus size={16} /> Nouveau Partenaire
          </button>
        </div>
      </header>

      {/* 📊 GRID DES TIERS */}
      <div className="flex-1 min-h-0 relative">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest animate-pulse m-0">Synchronisation des entités...</p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto custom-scrollbar pr-2 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {filteredTiers.map((t) => (
                <div key={t.TR_Id} className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] relative group hover:border-blue-500/30 transition-all duration-300 shadow-xl overflow-hidden">
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-[#0B0F1A] rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shrink-0">
                      <Truck size={20} />
                    </div>
                    <button className="p-2 bg-transparent text-slate-500 hover:text-white transition-colors border-none cursor-pointer">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white leading-none m-0 truncate">{t.TR_Name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] md:text-[9px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-md border border-blue-500/20 uppercase tracking-widest whitespace-nowrap">
                        <Tag size={10} className="inline mr-1" /> {t.TR_Type || 'NON-DÉFINI'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 space-y-3 text-[9px] md:text-[10px] font-black text-slate-500 uppercase italic tracking-widest relative z-10">
                    <p className="flex items-center gap-3 truncate m-0 group-hover:text-slate-300 transition-colors">
                      <Mail size={12} className="text-blue-500/50 shrink-0" /> <span className="truncate">{t.TR_Email || 'Contact non renseigné'}</span>
                    </p>
                    <p className="flex items-center gap-3 m-0 group-hover:text-slate-300 transition-colors">
                      <Globe size={12} className="text-blue-500/50 shrink-0" /> ID CORE : <span className="text-blue-400">{t.TR_CodeExterne || 'AUTO-GÉNÉRÉ'}</span>
                    </p>
                  </div>
                </div>
              ))}

              {filteredTiers.length === 0 && !loading && (
                <div className="col-span-full py-32 text-center opacity-30 flex flex-col items-center gap-6 border-2 border-dashed border-white/10 rounded-[3rem]">
                  <Truck size={60} strokeWidth={1} />
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] m-0">Aucun partenaire détecté</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}