/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Building2, Users, MapPin, Loader2, GitGraph, 
  ChevronRight, ArrowUpRight, Search, LayoutGrid, 
  List, AlertCircle, X, ShieldCheck, ExternalLink,
  Plus, Edit3, Archive, Save, FolderTree, Briefcase,
  AlertTriangle, Activity
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast } from 'react-hot-toast';

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
  
  // États CRUD intégrés
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<any | null>(null);
  const [isProcessFormOpen, setIsProcessFormOpen] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState<{type: 'user' | 'process', item: any} | null>(null);

  /**
   * 🔄 SYNCHRONISATION DU MAILLAGE
   * Récupère la structure complète avec les agrégats de données.
   */
  const fetchUnits = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await apiClient.get('/org-units?includeStats=true&includeUsers=true&includeProcesses=true');
      setUnits(res.data);
    } catch (err) {
      toast.error("Échec de synchronisation de l'arbre");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchUnits(); }, [fetchUnits]);

  /** 📊 STATISTIQUES CONSOLIDÉES DU SMI */
  const stats = useMemo(() => ({
    total: units.length,
    totalUsers: units.reduce((acc, u) => acc + (u._count?.OU_Users || 0), 0)
  }), [units]);

  /** 🔍 MOTEUR DE RECHERCHE DYNAMIQUE */
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

  /** ⚡ GESTION CRUD DÉLÉGUÉE (Users/Processes) */
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit || !editingUser) return;
    setSubmitting(true);
    try {
      const payload = { ...editingUser, U_OrgUnitId: selectedUnit.OU_Id };
      editingUser.U_Id 
        ? await apiClient.patch(`/users/${editingUser.U_Id}`, payload)
        : await apiClient.post('/users', payload);
      toast.success("Registre collaborateur synchronisé");
      fetchUnits(true);
      setIsUserFormOpen(false);
    } catch (err) { toast.error("Erreur d'écriture"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-slate-50 min-h-screen italic font-sans text-left relative selection:bg-blue-100">
      
      {/* 🔝 HEADER DU COCKPIT */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">Organigramme <span className="text-blue-600">SMI</span></h1>
          <p className="text-slate-500 text-sm mt-2 font-bold italic">Cartographie décisionnelle de l&apos;architecture 2026</p>
        </div>

        <div className="flex gap-4">
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-xs font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              placeholder="Rechercher une unité..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}><LayoutGrid size={16} /></button>
            <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}><List size={16} /></button>
          </div>
        </div>
      </div>

      {/* 📊 RÉSUMÉ DES COMPTEURS */}
      <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span className="bg-white px-5 py-2.5 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm"><Building2 size={14} className="text-blue-500" /> {stats.total} Unités</span>
        <span className="bg-white px-5 py-2.5 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm"><Users size={14} className="text-emerald-500" /> {stats.totalUsers} Collaborateurs</span>
      </div>

      {/* 🏗️ GRID DES UNITÉS ORGANIQUES */}
      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "flex flex-col gap-4"}>
        {filteredUnits.map((unit) => (
          <UnitCard key={unit.OU_Id} unit={unit} viewMode={viewMode} onClick={() => openDetail(unit)} />
        ))}
      </div>

      {/* 📟 DRAWER : INSPECTION ET ÉDITION RAPIDE */}
      {isDrawerOpen && selectedUnit && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={closeDrawer} />
          <div className="relative ml-auto w-full max-w-3xl h-full bg-white shadow-3xl overflow-hidden flex flex-col animate-in slide-in-from-right-full duration-500">
            
            <div className="bg-white border-b border-slate-100 p-10 flex justify-between items-start shrink-0 text-left">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full italic">{selectedUnit.OU_Type?.OUT_Label}</span>
                  {selectedUnit.OU_IsActive && <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-2"><ShieldCheck size={10} /> Conforme</span>}
                </div>
                <h2 className="text-4xl font-black uppercase italic text-slate-900 tracking-tighter text-left leading-none">{selectedUnit.OU_Name}</h2>
                <div className="flex items-center gap-5 mt-4 text-[10px] font-black text-slate-500 uppercase italic text-left">
                  <span className="flex items-center gap-2"><MapPin size={12} className="text-blue-500" /> {selectedUnit.OU_Site?.S_Name}</span>
                  {selectedUnit.OU_Parent && <span className="flex items-center gap-2 italic"><FolderTree size={12} /> Branche de {selectedUnit.OU_Parent.OU_Name}</span>}
                </div>
              </div>
              <button onClick={closeDrawer} className="p-4 bg-slate-50 hover:bg-slate-200 rounded-3xl transition-all border-none cursor-pointer"><X size={28} className="text-slate-400" /></button>
            </div>

            {/* NAVIGATION TABS DRAWER */}
            <div className="flex border-b border-slate-100 bg-white shrink-0 text-left">
              <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={Building2} label="Synthèse" />
              <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label={`Effectif (${selectedUnit.OU_Users?.length || 0})`} />
              <TabButton active={activeTab === 'processes'} onClick={() => setActiveTab('processes')} icon={Briefcase} label={`Processus (${selectedUnit.OU_Processus?.length || 0})`} />
            </div>

            <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50 text-left">
              {activeTab === 'overview' && (
                <div className="space-y-8 text-left">
                  <div className="grid grid-cols-2 gap-6 text-left">
                    <InfoBox icon={Building2} label="Classe Structurelle" value={selectedUnit.OU_Type?.OUT_Label || 'N/A'} color="blue" />
                    <InfoBox icon={MapPin} label="Localisation Master" value={selectedUnit.OU_Site?.S_Name || 'N/A'} color="emerald" />
                  </div>
                  {/* ... Autres détails vue d'ensemble ... */}
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-6 text-left">
                   <button onClick={() => { setEditingUser({ U_FirstName: '', U_LastName: '', U_Email: '', U_Role: 'USER' }); setIsUserFormOpen(true); }} className="w-full py-5 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 font-black uppercase text-[10px] tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-3 cursor-pointer italic"><Plus size={16} /> Enrôler un collaborateur</button>
                   {/* ... Mapping de la liste des utilisateurs ... */}
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
      <div onClick={onClick} className="group bg-white rounded-2xl p-4 border border-slate-100 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer flex items-center gap-5 text-left">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors shadow-lg shrink-0"><Building2 size={22} /></div>
        <div className="flex-1 min-w-0 text-left">
          <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 truncate italic group-hover:text-blue-600 transition-colors">{unit.OU_Name}</h3>
          <p className="text-[9px] font-black text-slate-400 uppercase italic leading-none mt-1">{unit.OU_Type?.OUT_Label} • {unit.OU_Site?.S_Name}</p>
        </div>
        <ChevronRight size={22} className="text-slate-200 group-hover:text-blue-500 transition-all shrink-0" />
      </div>
    );
  }
  return (
    <div onClick={onClick} className="group bg-white rounded-[40px] p-8 shadow-xl border border-white hover:border-blue-600 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden text-left">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Building2 size={120} /></div>
      <div className="flex justify-between items-start mb-8 text-left">
        <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-xl group-hover:bg-blue-600 transition-all duration-500"><Building2 size={32} /></div>
        <span className="bg-blue-50 text-blue-700 text-[9px] font-black uppercase px-4 py-2 rounded-xl border border-blue-100 italic">{unit.OU_Type?.OUT_Label || 'SMI'}</span>
      </div>
      <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-14 text-left">{unit.OU_Name}</h3>
      <div className="space-y-4 py-5 border-y border-slate-50 text-left">
        <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase italic"><MapPin size={14} className="text-blue-600" /> {unit.OU_Site?.S_Name}</div>
        <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase italic">Staff SMI</span><span className={`text-lg font-black italic ${userCount > 0 ? 'text-slate-900' : 'text-slate-300'}`}>{userCount || '---'}</span></div>
      </div>
      <button className="w-full mt-8 py-5 bg-slate-900 text-white rounded-3xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 hover:bg-blue-600 transition-all border-none">Ouvrir la Fiche <ArrowUpRight size={16} /></button>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex-1 py-6 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 border-b-4 transition-all border-none cursor-pointer ${active ? 'border-blue-600 text-blue-600 bg-blue-50/50 italic' : 'border-transparent text-slate-400 hover:text-slate-900'}`}>
      <Icon size={18} /> {label}
    </button>
  );
}

function InfoBox({ icon: Icon, label, value, color }: any) {
  const colors: any = { blue: 'bg-blue-50 text-blue-600 border-blue-100', emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
  return (
    <div className="bg-white rounded-4xl p-7 border border-slate-100 shadow-sm text-left">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}><Icon size={24} /></div>
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2 italic text-left">{label}</p>
      <p className="text-xl font-black text-slate-900 uppercase italic truncate text-left leading-none tracking-tighter">{value}</p>
    </div>
  );
}