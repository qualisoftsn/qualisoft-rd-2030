/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import Link from 'next/link';
import { MapPin, Building2, Network, Plus, Loader2, CheckCircle2, Layers, Settings2, ExternalLink } from 'lucide-react';

export default function SetupSmiPage() {
  const [activeTab, setActiveTab] = useState('SITES'); 
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ sites: [], depts: [], orgs: [] });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ APPEL API : Utilise 'departements' avec un 'e'
      const [resS, resD] = await Promise.all([
        apiClient.get('/admin/sites'),
        apiClient.get('/admin/departements'),
      ]);
      setData({ sites: resS.data, depts: resD.data, orgs: [] });
    } catch (error) {
      console.error("Erreur Sync SMI:", error);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const getAddPath = () => {
    if (activeTab === 'SITES') return '/dashboard/admin/sites';
    if (activeTab === 'DEP') return '/dashboard/admin/departements';
    return '#';
  };

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white font-sans italic text-left relative overflow-x-hidden">
      <header className="flex justify-between items-end mb-12 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Configuration <span className="text-blue-500">SMI</span></h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4 italic">Structure Géo-Fonctionnelle de l&apos;Organisation</p>
        </div>
        <div className="flex gap-4">
          <Link href={getAddPath()}>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs shadow-xl flex items-center gap-3 transition-all active:scale-95">
              <Plus size={18} /> Gérer les {activeTab === 'SITES' ? 'Sites' : 'Départements'}
            </button>
          </Link>
        </div>
      </header>

      <div className="flex gap-4 mb-10">
        <Tab icon={MapPin} label="Sites" active={activeTab === 'SITES'} onClick={() => setActiveTab('SITES')} />
        <Tab icon={Building2} label="Départements" active={activeTab === 'DEP'} onClick={() => setActiveTab('DEP')} />
      </div>

      <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 shadow-2xl min-h-80 relative">
        {loading ? <Loader2 className="animate-spin text-blue-500 mx-auto mt-20" size={40} /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
            {activeTab === 'SITES' && data.sites.map((s: any) => (
              <ConfigCard key={s.S_Id} title={s.S_Name} sub={s.S_Address || 'Aucune adresse'} type="Implantation" link="/dashboard/admin/sites" />
            ))}
            {activeTab === 'DEP' && data.depts.map((d: any) => (
              <ConfigCard key={d.D_Id} title={d.D_Name} sub={`Site : ${d.D_Site?.S_Name || 'Non rattaché'}`} type="Service" link="/dashboard/admin/departements" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Tab({ icon: Icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-3 border transition-all duration-300 ${active ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}><Icon size={16} /> {label}</button>
  );
}

function ConfigCard({ title, sub, type, link }: any) {
  return (
    <Link href={link}>
      <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] h-full flex flex-col justify-between hover:border-blue-500/30 transition-all group cursor-pointer no-underline">
        <div className="text-left">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform"><CheckCircle2 size={18}/></div>
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest border border-white/10 px-2 py-1 rounded">{type}</span>
          </div>
          <p className="text-lg font-black uppercase italic leading-tight text-slate-100 group-hover:text-blue-500 transition-colors no-underline">{title}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 italic tracking-widest no-underline">{sub}</p>
        </div>
        <div className="mt-8 flex justify-end"><ExternalLink size={16} className="text-slate-700 group-hover:text-white transition-all" /></div>
      </div>
    </Link>
  );
}