/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📍 MODULE : SITES & IMPLANTATIONS (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Gestion cartographique des points d'exploitation.
 * DESIGN : ClickUp Cards, 100dvh, Zero Scroll.
 * RÉVISION : 06 Mars 2026 | 19:50 GMT
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, Loader2, Edit3, Trash2, Building2, ChevronLeft, Save } from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';

export default function SitesRegistry() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/sites');
      setSites(res.data || []);
    } catch {
      toast.error("Rupture de liaison avec le registre des sites.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={50} /></div>;

  return (
    <div className="h-full flex flex-col p-8 md:p-12 font-sans italic text-white animate-in fade-in duration-500">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 shrink-0">
        <div className="space-y-4">
          <Link href="/workspace/setup" className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-500 hover:text-blue-500 transition-colors no-underline">
            <ChevronLeft size={14} /> Retour Setup
          </Link>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic m-0">Sites <span className="text-blue-600">SDE</span></h1>
        </div>
        <button className="bg-blue-600 text-white px-10 py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-blue-600 transition-all border-none cursor-pointer shadow-xl active:scale-95">
          <Plus size={20} className="inline mr-2" /> Nouveau Site
        </button>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sites.map(site => (
            <div key={site.S_Id} className="bg-white/5 border border-white/5 p-10 rounded-[3.5rem] group hover:border-blue-500/50 transition-all duration-500 shadow-inner relative flex flex-col">
              <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg"><Building2 size={30} /></div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-blue-600 transition-all border-none cursor-pointer"><Edit3 size={16}/></button>
                  <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 transition-all border-none cursor-pointer"><Trash2 size={16}/></button>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter m-0 truncate">{site.S_Name}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 m-0"><MapPin size={12} className="text-blue-500" /> {site.S_Address || 'Afrique de l\'Ouest'}</p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full group-hover:bg-blue-600/10 transition-all duration-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}