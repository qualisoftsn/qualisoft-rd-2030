/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛠️ MODULE : SETUP SMI QUICK-VIEW (elite-sde)
 * -------------------------------------------------------------------------
 * FIX : PWA Ready, Scroll localisé.
 * DATE : 05 Mars 2026 | 00:10 GMT
 */

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import Link from 'next/link';
import { MapPin, Building2, Plus, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';

export default function SetupSmiPage() {
  const [activeTab, setActiveTab] = useState<'SITES' | 'DEP'>('SITES'); 
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ sites: [], depts: [] });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resS, resD] = await Promise.all([
        apiClient.get('/admin/sites').catch(() => ({ data: [] })),
        apiClient.get('/admin/departements').catch(() => ({ data: [] })),
      ]);
      setData({ sites: resS.data || [], depts: resD.data || [] });
    } catch (error) {
      console.error("Sync SMI Error:", error);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full">
      
      {/* 🔝 EN-TÊTE FIXE */}
      <header className="shrink-0 p-6 md:p-8 lg:p-12 border-b border-white/5 bg-[#0B0F1A]/90 backdrop-blur-md z-20 flex flex-col lg:flex-row justify-between lg:items-end gap-6 md:gap-8">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none m-0">
            Configuration <span className="text-blue-500">SMI</span>
          </h1>
          <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] mt-3 md:mt-4 italic m-0">
            Structure Géo-Fonctionnelle • Qualisoft RD 2030
          </p>
        </div>
        
        <Link href={activeTab === 'SITES' ? '/dashboard/admin/sites' : '/dashboard/admin/departements'} className="no-underline w-full lg:w-auto">
          <button className="w-full lg:w-auto bg-blue-600 hover:bg-white hover:text-slate-900 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black uppercase italic text-[10px] tracking-widest shadow-xl shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-3 border-none cursor-pointer m-0">
            <Plus size={18} strokeWidth={3} /> Gérer les {activeTab === 'SITES' ? 'Sites' : 'Départements'}
          </button>
        </Link>
      </header>

      {/* 📜 ZONE DÉFILANTE */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 w-full">
          
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            <Tab icon={MapPin} label="Sites / Implantations" active={activeTab === 'SITES'} onClick={() => setActiveTab('SITES')} />
            <Tab icon={Building2} label="Départements / Services" active={activeTab === 'DEP'} onClick={() => setActiveTab('DEP')} />
          </div>

          <div className="bg-[#0F172A]/80 border border-white/5 rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-12 shadow-2xl min-h-[50vh] backdrop-blur-xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-6">
                <Loader2 className="animate-spin text-blue-500" size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0 animate-pulse">Synchronisation Structurelle...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-in fade-in zoom-in-95 duration-500">
                {activeTab === 'SITES' && data.sites.map((s: any) => (
                  <ConfigCard key={s.S_Id} title={s.S_Name} sub={s.S_Address || 'Afrique de l\'Ouest'} type="Site" link="/dashboard/admin/sites" />
                ))}
                {activeTab === 'DEP' && data.depts.map((d: any) => (
                  <ConfigCard key={d.D_Id} title={d.D_Name} sub={`Implantation : ${d.D_Site?.S_Name || 'Master'}`} type="Service" link="/dashboard/admin/departements" />
                ))}
                
                {(activeTab === 'SITES' && data.sites.length === 0) || (activeTab === 'DEP' && data.depts.length === 0) ? (
                  <div className="col-span-full py-16 text-center text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                    Aucune donnée enregistrée dans ce registre.
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}} />
    </div>
  );
}

function Tab({ icon: Icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`px-6 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black uppercase italic text-[9px] md:text-[10px] flex items-center justify-center gap-3 border transition-all duration-300 cursor-pointer shrink-0 m-0 ${active ? 'bg-blue-600 border-blue-500 text-white shadow-xl' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}>
      <Icon size={16} /> {label}
    </button>
  );
}

function ConfigCard({ title, sub, type, link }: any) {
  return (
    <Link href={link} className="no-underline block h-full">
      <div className="p-6 md:p-8 bg-[#0B0F1A] border border-white/5 rounded-4xl md:rounded-[3rem] h-full flex flex-col justify-between hover:border-blue-500/50 hover:bg-[#0B0F1A]/80 transition-all group cursor-pointer shadow-inner relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <CheckCircle2 size={20} className="md:w-6 md:h-6" />
            </div>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest border border-white/10 px-3 py-1.5 rounded-full group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all bg-[#0F172A]">{type}</span>
          </div>
          <p className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white group-hover:text-blue-400 transition-colors leading-none m-0 line-clamp-2">{title}</p>
          <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase mt-3 md:mt-4 italic tracking-[0.2em] m-0 line-clamp-1">{sub}</p>
        </div>
        <div className="mt-8 md:mt-10 flex justify-end relative z-10">
          <ExternalLink size={18} className="text-slate-700 group-hover:text-white transition-all translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 duration-300" />
        </div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full group-hover:bg-blue-600/20 transition-all duration-500 pointer-events-none" />
      </div>
    </Link>
  );
}