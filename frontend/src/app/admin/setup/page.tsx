/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { MapPin, Building2, Network, Plus, Loader2, CheckCircle2, Globe } from 'lucide-react';

export default function SetupSmiPage() {
  const [activeTab, setActiveTab] = useState('SITES'); 
  const [data, setData] = useState({ sites: [], depts: [], orgs: [] });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, d, o] = await Promise.all([
        apiClient.get('/admin/sites'),
        apiClient.get('/admin/departments'),
        apiClient.get('/admin/org-units')
      ]);
      setData({ sites: s.data, depts: d.data, orgs: o.data });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white font-sans italic text-left">
      <header className="mb-12 border-b border-white/5 pb-10">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Configuration <span className="text-blue-500">SMI</span></h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4">Structure organisationnelle & Géographique</p>
      </header>

      <div className="flex gap-4 mb-10">
        <Tab icon={MapPin} label="Sites" active={activeTab === 'SITES'} onClick={() => setActiveTab('SITES')} />
        <Tab icon={Building2} label="Départements" active={activeTab === 'DEP'} onClick={() => setActiveTab('DEP')} />
        <Tab icon={Network} label="Unités Org." active={activeTab === 'ORG'} onClick={() => setActiveTab('ORG')} />
      </div>

      <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 shadow-2xl min-h-100">
        {loading ? <Loader2 className="animate-spin text-blue-500 mx-auto" /> : (
          <div className="grid grid-cols-2 gap-6">
            {activeTab === 'SITES' && data.sites.map((s: any) => <ItemCard key={s.S_Id} title={s.S_Name} sub={s.S_Address || 'Sans adresse'} />)}
            {activeTab === 'DEP' && data.depts.map((d: any) => <ItemCard key={d.D_Id} title={d.D_Name} sub={`Site: ${d.D_Site?.S_Name}`} />)}
            {activeTab === 'ORG' && data.orgs.map((o: any) => <ItemCard key={o.OU_Id} title={o.OU_Name} sub={`Unité de production`} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function Tab({ icon: Icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-3 border transition-all ${active ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/40' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}>
      <Icon size={16} /> {label}
    </button>
  );
}

function ItemCard({ title, sub }: any) {
  return (
    <div className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4 hover:border-blue-500/30 transition-all">
      <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500"><CheckCircle2 size={18}/></div>
      <div>
        <p className="text-sm font-black uppercase italic leading-none">{title}</p>
        <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 italic tracking-widest">{sub}</p>
      </div>
    </div>
  );
}