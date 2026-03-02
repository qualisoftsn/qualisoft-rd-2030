//* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : ORGANIGRAMME INTERACTIF SMI
 * -------------------------------------------------------------------------
 * RÔLE : Vue matricielle de la structure organisationnelle.
 * ARCHITECTURE : Zéro NextAuth • Refonte UI "Dark Industrial" intégrale.
 * DATE : 02 Mars 2026 | 12:34 GMT
 */
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Building2, Users, MapPin, Loader2, GitGraph, 
  ChevronRight, ArrowUpRight, Search, LayoutGrid, 
  List, AlertCircle, X, ShieldCheck, ExternalLink,
  Plus, Edit3, Archive, Save, FolderTree, Briefcase,
  AlertTriangle, Activity,
  UserCircle
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

// --- INTERFACES DU COCKPIT ---
interface OrgUnit {
  OU_Id: string;
  OU_Name: string;
  OU_IsActive: boolean;
  OU_Type?: { OUT_Id: string; OUT_Label: string };
  OU_Site?: { S_Id: string; S_Name: string };
  OU_Parent?: { OU_Id: string; OU_Name: string } | null;
  OU_Children?: OrgUnit[];
  OU_Users?: any[];
  OU_Processus?: any[];
  _count?: { OU_Users: number; OU_Children: number };
}

export default function InteractiveOrgChart() {
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // États du Panneau Latéral (Drawer)
  const [selectedUnit, setSelectedUnit] = useState<OrgUnit | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'processes'>('overview');
  
  // États CRUD
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);

  const fetchUnits = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await apiClient.get('/org-units?includeStats=true&includeUsers=true&includeProcesses=true');
      setUnits(res.data || []);
    } catch (err) {
      toast.error("ÉCHEC DE SYNCHRONISATION DE L'ARBRE");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchUnits(); }, [fetchUnits]);

  const stats = useMemo(() => ({
    total: units.length,
    totalUsers: units.reduce((acc, u) => acc + (u._count?.OU_Users || 0), 0)
  }), [units]);

  const filteredUnits = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return units.filter(u => 
      u.OU_Name.toLowerCase().includes(term) || 
      u.OU_Type?.OUT_Label?.toLowerCase().includes(term)
    );
  }, [units, searchTerm]);

  const openDetail = (unit: OrgUnit) => {
    setSelectedUnit(unit);
    setIsDrawerOpen(true);
    setActiveTab('overview');
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => { setSelectedUnit(null); }, 300);
  };

  if (loading) return (
    <div className="ml-0 lg:ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] italic">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 p-6 lg:p-10 space-y-8 bg-[#0B0F1A] min-h-screen italic font-sans text-left relative selection:bg-blue-600/30 text-white">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER DU COCKPIT */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white leading-none">Organigramme <span className="text-blue-600">SMI</span></h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-2 font-black italic">Cartographie décisionnelle de l&apos;architecture 2026</p>
        </div>

        <div className="flex flex-wrap gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              className="w-full bg-[#151A2D] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-xs font-black uppercase italic text-white outline-none focus:border-blue-500 shadow-sm placeholder:text-slate-600 transition-all"
              placeholder="Rechercher une unité..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="flex bg-[#151A2D] border border-white/10 rounded-2xl p-1 shadow-sm">
            <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all cursor-pointer border-none ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'bg-transparent text-slate-500 hover:text-white'}`}><LayoutGrid size={16} /></button>
            <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all cursor-pointer border-none ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'bg-transparent text-slate-500 hover:text-white'}`}><List size={16} /></button>
          </div>
        </div>
      </div>

      {/* 📊 RÉSUMÉ DES COMPTEURS */}
      <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span className="bg-[#151A2D] px-5 py-2.5 rounded-xl border border-white/5 flex items-center gap-3 shadow-xl"><Building2 size={14} className="text-blue-500" /> {stats.total} Unités</span>
        <span className="bg-[#151A2D] px-5 py-2.5 rounded-xl border border-white/5 flex items-center gap-3 shadow-xl"><Users size={14} className="text-emerald-500" /> {stats.totalUsers} Collaborateurs</span>
      </div>

      {/* 🏗️ GRID DES UNITÉS ORGANIQUES */}
      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "flex flex-col gap-4"}>
        {filteredUnits.length > 0 ? filteredUnits.map((unit) => (
          <UnitCard key={unit.OU_Id} unit={unit} viewMode={viewMode} onClick={() => openDetail(unit)} />
        )) : (
           <div className="col-span-full py-20 text-center opacity-30">
              <GitGraph size={48} className="mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest text-sm">Aucune unité correspondante</p>
           </div>
        )}
      </div>

      {/* 📟 DRAWER : INSPECTION SDE */}
      {isDrawerOpen && selectedUnit && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={closeDrawer} />
          <div className="relative ml-auto w-full max-w-2xl h-full bg-[#0F172A] border-l border-white/10 shadow-4xl overflow-hidden flex flex-col animate-in slide-in-from-right-full duration-500">
            
            <div className="bg-[#151A2D] border-b border-white/5 p-10 flex justify-between items-start shrink-0 text-left">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-blue-600/20 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase px-4 py-1.5 rounded-full italic">{selectedUnit.OU_Type?.OUT_Label || 'N/A'}</span>
                  {selectedUnit.OU_IsActive && <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-2"><ShieldCheck size={10} /> Conforme</span>}
                </div>
                <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter text-left leading-none m-0">{selectedUnit.OU_Name}</h2>
                <div className="flex items-center gap-5 mt-4 text-[10px] font-black text-slate-500 uppercase italic text-left">
                  <span className="flex items-center gap-2"><MapPin size={12} className="text-blue-500" /> {selectedUnit.OU_Site?.S_Name || 'N/A'}</span>
                  {selectedUnit.OU_Parent && <span className="flex items-center gap-2 italic"><FolderTree size={12} /> Branche de {selectedUnit.OU_Parent.OU_Name}</span>}
                </div>
              </div>
              <button onClick={closeDrawer} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl transition-all border-none cursor-pointer"><X size={24} className="text-slate-400" /></button>
            </div>

            <div className="flex border-b border-white/5 bg-[#151A2D] shrink-0 text-left px-4">
              <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={Building2} label="Synthèse" />
              <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label={`Effectif (${selectedUnit.OU_Users?.length || 0})`} />
              <TabButton active={activeTab === 'processes'} onClick={() => setActiveTab('processes')} icon={Briefcase} label={`Processus (${selectedUnit.OU_Processus?.length || 0})`} />
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-[#0B0F1A] text-left custom-scrollbar">
              {activeTab === 'overview' && (
                <div className="space-y-6 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                    <InfoBox icon={Building2} label="Classe Structurelle" value={selectedUnit.OU_Type?.OUT_Label || 'N/A'} color="blue" />
                    <InfoBox icon={MapPin} label="Localisation Master" value={selectedUnit.OU_Site?.S_Name || 'N/A'} color="emerald" />
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-4 text-left">
                  {selectedUnit.OU_Users && selectedUnit.OU_Users.length > 0 ? selectedUnit.OU_Users.map((u: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                       <UserCircle className="text-slate-500" size={24} />
                       <div>
                         <p className="text-xs font-black uppercase text-white m-0">{u.U_FirstName} {u.U_LastName}</p>
                         <p className="text-[9px] font-bold text-slate-500 uppercase mt-1 m-0">{u.U_Role}</p>
                       </div>
                    </div>
                  )) : (
                     <p className="text-xs font-black uppercase text-slate-600 text-center py-10 opacity-50">Aucun collaborateur rattaché</p>
                  )}
                </div>
              )}

              {activeTab === 'processes' && (
                <div className="space-y-4 text-left">
                  {selectedUnit.OU_Processus && selectedUnit.OU_Processus.length > 0 ? selectedUnit.OU_Processus.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                       <Briefcase className="text-amber-500" size={20} />
                       <div>
                         <p className="text-xs font-black uppercase text-white m-0">{p.PR_Libelle}</p>
                         <p className="text-[9px] font-bold text-slate-500 uppercase mt-1 m-0">{p.PR_Code}</p>
                       </div>
                    </div>
                  )) : (
                     <p className="text-xs font-black uppercase text-slate-600 text-center py-10 opacity-50">Aucun processus rattaché</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** 🧩 COMPOSANTS DÉDIÉS AU COCKPIT ORGANISATIONNEL */
function UnitCard({ unit, viewMode, onClick }: any) {
  const userCount = unit._count?.OU_Users || 0;
  if (viewMode === 'list') {
    return (
      <div onClick={onClick} className="group bg-[#151A2D] rounded-2xl p-5 border border-white/5 hover:border-blue-500/50 hover:bg-[#1a2030] shadow-xl transition-all cursor-pointer flex items-center gap-5 text-left">
        <div className="w-12 h-12 bg-black/40 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-blue-600 transition-colors shadow-inner shrink-0 border border-white/5"><Building2 size={20} /></div>
        <div className="flex-1 min-w-0 text-left">
          <h3 className="text-sm font-black uppercase tracking-tight text-white truncate italic group-hover:text-blue-400 transition-colors m-0">{unit.OU_Name}</h3>
          <p className="text-[9px] font-black text-slate-500 uppercase italic leading-none mt-2 m-0">{unit.OU_Type?.OUT_Label} • {unit.OU_Site?.S_Name}</p>
        </div>
        <ChevronRight size={20} className="text-slate-600 group-hover:text-blue-500 transition-all shrink-0" />
      </div>
    );
  }
  return (
    <div onClick={onClick} className="group bg-[#151A2D] rounded-[2.5rem] p-8 shadow-2xl border border-white/5 hover:border-blue-600/50 hover:bg-[#1a2030] hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden text-left">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Building2 size={120} /></div>
      <div className="flex justify-between items-start mb-8 text-left relative z-10">
        <div className="w-16 h-16 bg-black/40 rounded-3xl flex items-center justify-center text-slate-400 border border-white/5 shadow-inner group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all duration-300"><Building2 size={28} /></div>
        <span className="bg-blue-600/10 text-blue-400 text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border border-blue-500/20 italic">{unit.OU_Type?.OUT_Label || 'SMI'}</span>
      </div>
      <h3 className="text-lg font-black uppercase italic tracking-tighter text-white leading-tight mb-4 group-hover:text-blue-400 transition-colors line-clamp-2 min-h-12 text-left relative z-10">{unit.OU_Name}</h3>
      <div className="space-y-4 py-5 border-y border-white/5 text-left relative z-10">
        <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase italic"><MapPin size={12} className="text-blue-500" /> {unit.OU_Site?.S_Name || 'NON DÉFINI'}</div>
        <div className="flex justify-between items-center"><span className="text-[9px] font-black text-slate-500 uppercase italic">Staff Rattaché</span><span className={`text-lg font-black italic ${userCount > 0 ? 'text-white' : 'text-slate-600'}`}>{userCount || '---'}</span></div>
      </div>
      <button className="w-full mt-6 py-4 bg-white/5 text-slate-300 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-inner flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all border-none cursor-pointer relative z-10">Ouvrir la Fiche <ArrowUpRight size={14} /></button>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex-1 py-5 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-3 border-b-2 transition-all border-none cursor-pointer bg-transparent ${active ? 'border-blue-500 text-blue-400 italic bg-blue-900/10' : 'border-transparent text-slate-500 hover:text-white'}`}>
      <Icon size={16} /> {label}
    </button>
  );
}

function InfoBox({ icon: Icon, label, value, color }: any) {
  const colors: any = { blue: 'bg-blue-600/10 text-blue-400 border-blue-500/20', emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  return (
    <div className="bg-black/40 rounded-4xl p-6 border border-white/5 shadow-inner text-left">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${colors[color]}`}><Icon size={20} /></div>
      <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2 italic text-left m-0">{label}</p>
      <p className="text-lg font-black text-white uppercase italic truncate text-left leading-none tracking-tighter m-0 mt-1">{value}</p>
    </div>
  );
}