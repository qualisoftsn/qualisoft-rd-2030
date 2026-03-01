/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛠️ MODULE : SETUP SMI QUICKVIEW
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 14:35 GMT
 */

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { MapPin, Building2, Network, Loader2, CheckCircle2 } from 'lucide-react';

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

  /// eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, []);

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 text-white font-sans italic text-left">
      <header className="mb-12 border-b border-white/5 pb-10">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Configuration <span className="text-blue-500">SMI</span></h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4">Structure organisationnelle & Géographique</p>
      </header>

      <div className="flex gap-4 mb-10">
        <button onClick={() => setActiveTab('SITES')} className={`px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-3 border transition-all ${activeTab === 'SITES' ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/40' : 'bg-white/5 border-white/10 text-slate-500'}`}>
          <MapPin size={16} /> Sites
        </button>
        <button onClick={() => setActiveTab('ORG')} className={`px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-3 border transition-all ${activeTab === 'ORG' ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/40' : 'bg-white/5 border-white/10 text-slate-500'}`}>
          <Network size={16} /> Unités Org.
        </button>
      </div>

      <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 shadow-2xl min-h-100">
        {loading ? <Loader2 className="animate-spin text-blue-500 mx-auto" /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTab === 'SITES' && data.sites.map((s: any) => (
              <div key={s.S_Id} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4 hover:border-blue-500/30 transition-all">
                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500"><CheckCircle2 size={18}/></div>
                <div>
                  <p className="text-sm font-black uppercase italic leading-none">{s.S_Name}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 italic tracking-widest">{s.S_Address || 'Dakar'}</p>
                </div>
              </div>
            ))}
            {activeTab === 'ORG' && data.orgs.map((o: any) => (
              <div key={o.OU_Id} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4 hover:border-blue-500/30 transition-all">
                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500"><Network size={18}/></div>
                <div>
                  <p className="text-sm font-black uppercase italic leading-none">{o.OU_Name}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 italic tracking-widest">{o.OU_Type?.OUT_Label || 'Service'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}