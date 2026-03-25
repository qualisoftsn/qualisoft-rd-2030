/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : ORGANIGRAMME INTERACTIF SMI
 * -------------------------------------------------------------------------
 * RÔLE : Vue matricielle de la structure organisationnelle §5.3.
 * DESIGN : Cockpit 100dvh, isolated scroll, high-density cards.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 18:34 GMT
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Building2, MapPin, Search, LayoutGrid, 
  List, RefreshCw, ArrowUpRight
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function InteractiveOrgChart() {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/org-units?includeStats=true');
      setUnits(res.data?.data || res.data || []);
    } catch { toast.error("ÉCHEC SYNC ARBRE"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUnits(); }, [fetchUnits]);

  if (loading) return <LoadingScreen label="Génération de la matrice SMI..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-40 gap-8 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic">Organigramme <span className="text-blue-600">SMI</span></h1>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] m-0 italic uppercase">Cartographie Décisionnelle 2026</p>
        </div>
        <div className="flex items-center gap-6 w-full xl:w-auto">
           <div className="relative flex-1 xl:w-80 group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-all" size={18} />
             <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="FILTRER NODES..." className="w-full bg-black/40 border-2 border-white/5 rounded-3xl py-5 pl-16 pr-8 text-[11px] font-black italic text-white outline-none focus:border-blue-600" />
           </div>
           <div className="flex bg-[#151B2B] border-2 border-white/5 rounded-3xl p-1">
              <button onClick={() => setViewMode('grid')} className={cn("p-4 rounded-2xl transition-all border-none cursor-pointer", viewMode === 'grid' ? "bg-blue-600 text-white" : "text-slate-600")}><LayoutGrid size={18} /></button>
              <button onClick={() => setViewMode('list')} className={cn("p-4 rounded-2xl transition-all border-none cursor-pointer", viewMode === 'list' ? "bg-blue-600 text-white" : "text-slate-600")}><List size={18} /></button>
           </div>
        </div>
      </header>

      {/* 📜 WORKZONE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className={cn("max-w-400 mx-auto pb-20", viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8" : "flex flex-col gap-4")}>
          {units.filter(u => u.OU_Name.toLowerCase().includes(search.toLowerCase())).map((unit: any) => (
             <UnitCard key={unit.OU_Id} unit={unit} viewMode={viewMode} />
          ))}
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function UnitCard({ unit, viewMode }: any) {
  if (viewMode === 'list') {
    return (
      <div className="bg-[#151B2B] border-2 border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:border-blue-500/30 transition-all cursor-pointer">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all"><Building2 size={24} /></div>
          <div className="text-left">
            <h3 className="text-lg tracking-tighter m-0 leading-none">{unit.OU_Name}</h3>
            <p className="text-[9px] text-slate-600 m-0 mt-2 uppercase tracking-widest italic">{unit.OU_Type?.OUT_Label} • {unit.OU_Site?.S_Name}</p>
          </div>
        </div>
        <ArrowUpRight size={20} className="text-slate-800 group-hover:text-blue-500" />
      </div>
    );
  }
  return (
    <div className="bg-[#151B2B] border-2 border-white/5 rounded-[3.5rem] p-10 hover:border-blue-600/30 transition-all shadow-4xl group flex flex-col justify-between h-96 relative overflow-hidden text-left cursor-pointer">
       <div className="absolute -right-6 -top-6 opacity-5 rotate-12 pointer-events-none group-hover:rotate-0 transition-transform duration-1000"><Building2 size={200} /></div>
       <div className="relative z-10 flex justify-between items-start">
          <div className="w-16 h-16 rounded-3xl bg-black/40 border border-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><Building2 size={32} /></div>
          <span className="px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl text-[8px] tracking-[0.2em]">{unit.OU_Type?.OUT_Label}</span>
       </div>
       <div className="relative z-10 space-y-6">
          <h3 className="text-3xl leading-none tracking-tighter m-0 line-clamp-2 uppercase italic group-hover:text-blue-500 transition-colors">{unit.OU_Name}</h3>
          <div className="space-y-4 pt-6 border-t border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
             <div className="flex items-center gap-3 text-[10px] tracking-widest"><MapPin size={14} className="text-blue-500" /> {unit.OU_Site?.S_Name}</div>
             <div className="flex justify-between items-end italic"><span className="text-[9px] text-slate-500 tracking-widest uppercase">EFFECTIF STAFF</span><span className="text-2xl leading-none text-white">{unit._count?.OU_Users || 0}</span></div>
          </div>
       </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center">{label}</span>
    </div>
  );
}
