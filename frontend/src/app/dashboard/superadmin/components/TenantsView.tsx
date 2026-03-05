/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🏛️ MODULE : CLUSTER MANAGEMENT (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Déploiement et orchestration des Tenants.
 * DESIGN : ClickUp High-Density / Matrix Command.
 */

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { Plus, Trash2, UserPlus, RefreshCw, Server, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function TenantsView() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/tenants');
      setTenants(Array.isArray(res.data?.data || res.data) ? (res.data?.data || res.data) : []);
    } catch { toast.error('Échec de récupération du Cluster'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => tenants.filter(t => t.T_Name?.toLowerCase().includes(searchTerm.toLowerCase())), [tenants, searchTerm]);

  if (loading) return <ViewLoader label="Analyse du Cluster SDE..." />;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <header className="shrink-0 p-8 lg:p-12 border-b border-white/5 bg-black/20 flex flex-col xl:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl lg:text-6xl font-black italic tracking-tighter text-white m-0 leading-none uppercase">Management <span className="text-amber-500">Cluster</span></h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] mt-4">Architecture Multi-Tenant RD-2026</p>
        </div>
        <div className="flex gap-4">
          <button onClick={load} className="p-5 bg-white/5 border border-white/10 rounded-2xl text-amber-500 hover:text-white transition-all cursor-pointer"><RefreshCw size={20}/></button>
          <button className="bg-amber-600 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase shadow-2xl hover:bg-white hover:text-amber-600 transition-all border-none cursor-pointer flex items-center gap-3">
            <Plus size={18} /> NOUVEAU TENANT
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
        <div className="max-w-350 mx-auto space-y-8">
          <div className="relative group max-w-xl">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
             <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-[#0F172A] border border-white/10 rounded-[2.5rem] py-6 pl-16 pr-8 text-white font-black uppercase text-xs outline-none focus:border-amber-500 transition-all shadow-inner" placeholder="RECHERCHER STRUCTURE..." />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {filtered.map(t => (
              <div key={t.T_Id} className="bg-[#151A2D] p-10 rounded-[3.5rem] border border-white/5 flex items-center justify-between group hover:border-amber-500/30 transition-all shadow-2xl">
                <div className="flex items-center gap-8 text-left">
                  <div className="p-5 bg-amber-500/10 rounded-3xl text-amber-500 border border-amber-500/10"><Server size={35} /></div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black italic m-0 tracking-tighter text-white">{t.T_Name}</h3>
                    <p className="text-[10px] text-slate-500 tracking-widest italic m-0 uppercase opacity-60">{t.T_Email} • {t.T_Plan}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                   <button className="p-4 bg-white/5 hover:bg-blue-600 rounded-2xl text-slate-500 hover:text-white transition-all border-none cursor-pointer"><UserPlus size={20}/></button>
                   <button className="p-4 bg-white/5 hover:bg-rose-600 rounded-2xl text-slate-500 hover:text-white transition-all border-none cursor-pointer"><Trash2 size={20}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function ViewLoader({ label }: { label: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-amber-500 italic font-black uppercase gap-6">
      <RefreshCw className="animate-spin" size={50} />
      <span className="text-[10px] tracking-[0.5em] animate-pulse">{label}</span>
    </div>
  );
}