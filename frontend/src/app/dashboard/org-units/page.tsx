/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🏢 MODULE : ORG-UNITS MANAGER SDE (§5.3)
 * -------------------------------------------------------------------------
 * RÔLE : Gestion haute performance de la structure organique ISO 9001.
 * DESIGN : Elite High-Density, 100dvh, No-Scroll, ClickUp Style.
 * LOGIQUE : Zéro NextAuth • Hiérarchie Scellée • PWA Ready.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 12:25 GMT
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Building2, MapPin, 
  RefreshCcw, X, Save, Loader2, GitGraph, ChevronRight, Activity
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function OrgUnitsManager() {
  const [units, setUnits] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    OU_Id: '', OU_Name: '', OU_Code: '', OU_TypeId: '', 
    OU_SiteId: '', OU_ParentId: '', OU_IsActive: true
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, sRes, tRes] = await Promise.all([
        apiClient.get('/org-units'),
        apiClient.get('/sites'),
        apiClient.get('/org-unit-types')
      ]);
      setUnits(uRes.data?.data || uRes.data || []);
      setSites(sRes.data?.data || sRes.data || []);
      setTypes(tRes.data?.data || tRes.data || []);
    } catch (err) {
      toast.error("ERREUR DE SYNCHRONISATION MATRICIELLE");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredUnits = useMemo(() => {
    return units.filter(u => 
      u.OU_Name.toLowerCase().includes(search.toLowerCase()) || 
      u.OU_Code?.toLowerCase().includes(search.toLowerCase())
    );
  }, [units, search]);

  if (loading) return <LoadingScreen label="Cartographie de la Structure §5.3..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER HAUTE DENSITÉ */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-40 gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-600/10 text-blue-500 rounded-2xl border border-blue-500/20"><Building2 size={24} /></div>
             <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0">Unités <span className="text-blue-600">Organiques</span></h1>
          </div>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] m-0 italic">Responsabilités et Autorités — ISO 9001 §5.3</p>
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-80 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-all" size={18} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="SCANNER UNITÉ..." className="w-full bg-black/40 border-2 border-white/5 rounded-3xl py-5 pl-16 pr-8 text-[11px] font-black italic text-white outline-none focus:border-blue-600" />
          </div>
          <button onClick={() => setShowDrawer(true)} className="bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-5 rounded-3xl text-[10px] flex items-center gap-3 shadow-4xl border-none cursor-pointer text-white italic transition-all active:scale-95"><Plus size={18} /> Créer</button>
        </div>
      </header>

      {/* 📊 KPI DASH (Fixe) */}
      <div className="shrink-0 p-8 pb-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard label="Volume Organique" val={units.length} icon={Building2} color="blue" />
        <KPICard label="Niveaux Hiérarchiques" val={units.filter(u => u.OU_ParentId).length} icon={GitGraph} color="emerald" />
        <KPICard label="Sites Actifs" val={sites.length} icon={MapPin} color="amber" />
      </div>

      {/* 📋 REGISTRE (Scroll Isolé) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4">
        <div className="bg-[#151B2B] border-2 border-white/5 rounded-[3.5rem] overflow-hidden shadow-4xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/5 text-[10px] text-slate-500 tracking-[0.3em]">
                <th className="px-10 py-6">Identité & Code</th>
                <th className="px-10 py-6 hidden md:table-cell">Typologie</th>
                <th className="px-10 py-6">Parenté</th>
                <th className="px-10 py-6 hidden xl:table-cell">Site</th>
                <th className="px-10 py-6">Statut</th>
                <th className="px-10 py-6 text-right">Pilotage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUnits.map((u) => (
                <tr key={u.OU_Id} className="hover:bg-white/5 group transition-all">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center font-black border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">{u.OU_Name.slice(0, 2)}</div>
                      <div>
                        <p className="text-base font-black text-white m-0 tracking-tighter">{u.OU_Name}</p>
                        <p className="text-[9px] text-slate-600 m-0 tracking-widest">{u.OU_Code || 'SDE-UNIT'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 hidden md:table-cell">
                    <span className="text-[9px] px-4 py-1.5 bg-white/5 rounded-xl border border-white/10 text-slate-400">{u.OU_Type?.OUT_Label || 'N/A'}</span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <GitGraph size={14} className="text-blue-500" /> {u.OU_Parent?.OU_Name || 'RACINE'}
                    </div>
                  </td>
                  <td className="px-10 py-6 hidden xl:table-cell">
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 uppercase italic">
                      <MapPin size={14} /> {u.OU_Site?.S_Name || 'GLOBAL'}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-2 h-2 rounded-full shadow-lg", u.OU_IsActive ? "bg-emerald-500 shadow-emerald-500/40" : "bg-red-500")} />
                      <span className="text-[9px] text-slate-500">{u.OU_IsActive ? 'ACTIF' : 'INACTIF'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => {}} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-blue-500 border-none cursor-pointer"><Edit2 size={16} /></button>
                      <button onClick={() => {}} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-red-500 border-none cursor-pointer"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* 🛠️ DRAWER DE CRÉATION (ClickUp Style) */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 bg-[#0B0F1A]/90 backdrop-blur-xl flex justify-end animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0F172A] border-l-2 border-white/5 h-full p-12 flex flex-col shadow-4xl animate-in slide-in-from-right duration-500 text-left">
            <header className="flex justify-between items-center mb-12">
               <h2 className="text-3xl tracking-tighter m-0">Nouvelle <span className="text-blue-600">Unité</span></h2>
               <button onClick={() => setShowDrawer(false)} className="p-4 text-slate-500 hover:text-white bg-transparent border-none cursor-pointer"><X size={32}/></button>
            </header>
            <form className="space-y-10 flex-1 overflow-y-auto custom-scrollbar pr-4">
               <div className="space-y-3">
                  <label className="text-[10px] text-slate-500 tracking-[0.4em]">DÉSIGNATION SDE *</label>
                  <input required className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-6 text-sm font-black text-white outline-none focus:border-blue-600 uppercase italic" placeholder="EX: DIRECTION DES SYSTÈMES" />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] text-slate-500 tracking-[0.4em]">TYPOLOGIE *</label>
                    <select className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-6 text-xs text-white outline-none appearance-none cursor-pointer">{types.map(t => <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label}</option>)}</select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] text-slate-500 tracking-[0.4em]">SITE ANCRAGE *</label>
                    <select className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-6 text-xs text-white outline-none appearance-none cursor-pointer">{sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}</select>
                  </div>
               </div>
               <button className="w-full bg-blue-600 py-6 rounded-[2.5rem] text-[12px] text-white shadow-4xl border-none cursor-pointer hover:bg-white hover:text-blue-600 transition-all font-black italic tracking-widest mt-auto">SCELLER L&apos;UNITÉ §5.3</button>
            </form>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.1); border-radius: 10px; }` }} />
    </div>
  );
}

function KPICard({ label, val, icon: Icon, color }: any) {
  const c: any = { blue: "text-blue-500 border-blue-500/10", emerald: "text-emerald-500 border-emerald-500/10", amber: "text-amber-500 border-amber-500/10" };
  return (
    <div className={cn("bg-[#151B2B] p-8 rounded-[3rem] border-2 flex items-center gap-6 shadow-4xl", c[color])}>
      <div className="p-5 rounded-2xl bg-black/40 shadow-inner"><Icon size={28} /></div>
      <div className="text-left">
        <p className="text-[10px] text-slate-500 tracking-widest mb-1 italic m-0 uppercase">{label}</p>
        <p className="text-4xl font-black italic m-0 tracking-tighter text-white leading-none">{val}</p>
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCcw className="animate-spin" size={60} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center">{label}</span>
    </div>
  );
}