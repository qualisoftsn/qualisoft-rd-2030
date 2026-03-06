/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🏢 MODULE : ARCHITECTURE SMI (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Gestion des Directions, Services et Unités opérationnelles.
 * DESIGN : 100dvh, Split View, High-Density.
 * RÉVISION : 06 Mars 2026 | 20:05 GMT
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Search, Plus, ShieldCheck, Activity, ChevronRight } from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';

export default function OrgStructure() {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/org-units');
      setUnits(res.data || []);
    } catch {
      toast.error("Erreur de synchronisation structurelle.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="h-full flex flex-col p-8 md:p-12 font-sans italic text-white selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 shrink-0">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3 text-blue-500 font-black uppercase tracking-widest text-[9px]">
            <ShieldCheck size={14} /> Master Structure Node
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic m-0 leading-none">
            Architecture <span className="text-blue-600">SMI</span>
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              placeholder="FILTRER LES UNITÉS..." 
              className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-16 pr-6 text-[10px] font-black uppercase italic outline-none focus:border-blue-600 transition-all text-white placeholder:text-slate-800"
              value={query} onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button className="bg-white text-slate-900 px-8 py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all border-none cursor-pointer shadow-xl">
            <Plus size={18} className="inline mr-2" /> Ajouter Unité
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {units.filter(u => u.OU_Name.toLowerCase().includes(query.toLowerCase())).map(unit => (
            <div key={unit.OU_Id} className="bg-[#151B2B] border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-blue-600/30 transition-all shadow-inner">
               <div className="flex items-center gap-6 text-left min-w-0">
                  <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center text-blue-500 shrink-0"><Layers size={22} /></div>
                  <div className="min-w-0">
                     <h3 className="text-xl font-black uppercase italic tracking-tight m-0 truncate text-white">{unit.OU_Name}</h3>
                     <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 m-0 italic flex items-center gap-2">
                        <Activity size={10} className="text-blue-500" /> {unit.OU_Type?.OUT_Label || 'SERVICE'}
                     </p>
                  </div>
               </div>
               <ChevronRight className="text-slate-800 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}