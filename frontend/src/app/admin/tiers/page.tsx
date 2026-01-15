/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { Truck, Plus, Search, UserPlus, Globe, MoreHorizontal, Loader2 } from 'lucide-react';

export default function TiersPage() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/tiers').then(res => {
      setTiers(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white font-sans italic text-left">
      <header className="flex justify-between items-end mb-12 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">Gestion <span className="text-blue-500">Tiers</span></h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4">Partenaires, Clients & Fournisseurs</p>
        </div>
        <button className="bg-blue-600 px-8 py-4 rounded-2xl font-black uppercase italic text-xs shadow-xl flex items-center gap-3 transition-all hover:bg-blue-500">
          <UserPlus size={18} /> Nouveau Partenaire
        </button>
      </header>

      <div className="grid grid-cols-3 gap-6">
        {loading ? <Loader2 className="animate-spin text-blue-500" /> : tiers.map((t) => (
          <div key={t.TR_Id} className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] relative group hover:border-blue-500/30 transition-all">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 mb-6 border border-white/10">
              <Truck size={20} />
            </div>
            <h3 className="text-lg font-black uppercase italic tracking-tight mb-1">{t.TR_Name}</h3>
            <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 uppercase">
              {t.TR_Type}
            </span>
            <div className="mt-6 space-y-2 text-[10px] font-bold text-slate-500 uppercase italic">
              <p className="flex items-center gap-2"><Globe size={12}/> {t.TR_Email || 'Email non renseigné'}</p>
              <p className="flex items-center gap-2 tracking-widest">ID: {t.TR_CodeExterne || 'SANS_CODE'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}