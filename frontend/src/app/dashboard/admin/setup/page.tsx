/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛠️ MODULE : SETUP SMI QUICK-VIEW
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 16:15 GMT
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
        apiClient.get('/admin/sites'),
        apiClient.get('/admin/departements'),
      ]);
      setData({ sites: resS.data, depts: resD.data });
    } catch (error) {
      console.error("Sync SMI Error:", error);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white font-sans italic text-left selection:bg-blue-600/30">
      <header className="flex flex-col lg:flex-row justify-between lg:items-end mb-16 border-b border-white/5 pb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Configuration <span className="text-blue-500 text-5xl">SMI</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-4 italic">Structure Géo-Fonctionnelle • Qualisoft RD 2030</p>
        </div>
        <Link href={activeTab === 'SITES' ? '/dashboard/admin/sites' : '/dashboard/admin/departements'} className="no-underline">
          <button className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-10 py-5 rounded-3xl font-black uppercase italic text-[10px] tracking-widest shadow-2xl transition-all active:scale-95 flex items-center gap-3 border-none cursor-pointer">
            <Plus size={18} strokeWidth={3} /> Gérer les {activeTab === 'SITES' ? 'Sites' : 'Départements'}
          </button>
        </Link>
      </header>

      <div className="flex gap-4 mb-12">
        <Tab icon={MapPin} label="Sites / Implantations" active={activeTab === 'SITES'} onClick={() => setActiveTab('SITES')} />
        <Tab icon={Building2} label="Départements / Services" active={activeTab === 'DEP'} onClick={() => setActiveTab('DEP')} />
      </div>

      <div className="bg-white/5 border border-white/5 rounded-[4rem] p-12 shadow-3xl min-h-100 backdrop-blur-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={48} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Synchronisation Structurelle...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-500">
            {activeTab === 'SITES' && data.sites.map((s: any) => (
              <ConfigCard key={s.S_Id} title={s.S_Name} sub={s.S_Address || 'Afrique de l\'Ouest'} type="Site" link="/dashboard/admin/sites" />
            ))}
            {activeTab === 'DEP' && data.depts.map((d: any) => (
              <ConfigCard key={d.D_Id} title={d.D_Name} sub={`Implantation : ${d.D_Site?.S_Name || 'Master'}`} type="Service" link="/dashboard/admin/departements" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Tab({ icon: Icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`px-10 py-5 rounded-3xl font-black uppercase italic text-[10px] flex items-center gap-3 border transition-all duration-300 cursor-pointer ${active ? 'bg-blue-600 border-blue-500 text-white shadow-xl' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}>
      <Icon size={16} /> {label}
    </button>
  );
}

function ConfigCard({ title, sub, type, link }: any) {
  return (
    <Link href={link} className="no-underline">
      <div className="p-8 bg-slate-950 border border-white/5 rounded-[3rem] h-full flex flex-col justify-between hover:border-blue-600/50 transition-all group cursor-pointer shadow-inner">
        <div>
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform"><CheckCircle2 size={20}/></div>
            <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest border border-white/5 px-3 py-1 rounded-full group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all">{type}</span>
          </div>
          <p className="text-2xl font-black uppercase italic tracking-tighter text-white group-hover:text-blue-500 transition-colors leading-none">{title}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-4 italic tracking-[0.2em]">{sub}</p>
        </div>
        <div className="mt-10 flex justify-end"><ExternalLink size={20} className="text-slate-800 group-hover:text-white transition-all translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 duration-300" /></div>
      </div>
    </Link>
  );
}