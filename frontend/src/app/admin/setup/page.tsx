/* eslint-disable react-hooks/exhaustive-deps */
//* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛠️ MODULE : SETUP SMI QUICKVIEW (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Vue rapide configuration org.
 * FIX : Edge-to-Edge UI, suppression des backgrounds discordants.
 * RÉVISION : 04 Mars 2026 | 23:10 GMT
 * -------------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { MapPin, Network, Loader2, CheckCircle2 } from 'lucide-react';

export default function SetupSmiPage() {
  const [activeTab, setActiveTab] = useState('SITES'); 
  const [data, setData] = useState({ sites: [], depts: [], orgs: [] });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, o] = await Promise.all([
        apiClient.get('/sites'),
        apiClient.get('/org-units')
      ]);
      setData({ ...data, sites: s.data, orgs: o.data });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="h-full flex flex-col p-6 md:p-10 text-white font-sans italic text-left selection:bg-blue-600/30">
      <header className="mb-8 border-b border-white/5 pb-8 shrink-0">
        <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none m-0">Configuration <span className="text-blue-500">SMI</span></h1>
        <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] mt-3 m-0">Structure organisationnelle & Géographique</p>
      </header>

      <div className="flex flex-wrap gap-4 mb-8 shrink-0">
        <button onClick={() => setActiveTab('SITES')} className={`px-6 md:px-8 py-3 md:py-4 rounded-2xl font-black uppercase italic text-[9px] md:text-[10px] flex items-center gap-3 border transition-all cursor-pointer ${activeTab === 'SITES' ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/40 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}>
          <MapPin size={16} /> Sites
        </button>
        <button onClick={() => setActiveTab('ORG')} className={`px-6 md:px-8 py-3 md:py-4 rounded-2xl font-black uppercase italic text-[9px] md:text-[10px] flex items-center gap-3 border transition-all cursor-pointer ${activeTab === 'ORG' ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/40 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}>
          <Network size={16} /> Unités Org.
        </button>
      </div>

      <div className="flex-1 bg-white/5 border border-white/5 rounded-4xl md:rounded-[3rem] p-6 md:p-10 shadow-2xl overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center">
             <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {activeTab === 'SITES' && data.sites.map((s: any) => (
              <div key={s.S_Id} className="p-6 bg-[#0B0F1A]/50 border border-white/5 rounded-4xl flex items-center gap-4 hover:border-blue-500/30 transition-all">
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 shrink-0"><CheckCircle2 size={20}/></div>
                <div className="min-w-0">
                  <p className="text-sm md:text-base font-black uppercase italic leading-none truncate m-0 mb-1">{s.S_Name}</p>
                  <p className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase italic tracking-widest truncate m-0">{s.S_Address || 'Dakar'}</p>
                </div>
              </div>
            ))}
            {activeTab === 'ORG' && data.orgs.map((o: any) => (
              <div key={o.OU_Id} className="p-6 bg-[#0B0F1A]/50 border border-white/5 rounded-4xl flex items-center gap-4 hover:border-blue-500/30 transition-all">
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 shrink-0"><Network size={20}/></div>
                <div className="min-w-0">
                  <p className="text-sm md:text-base font-black uppercase italic leading-none truncate m-0 mb-1">{o.OU_Name}</p>
                  <p className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase italic tracking-widest truncate m-0">{o.OU_Type?.OUT_Label || 'Service'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}