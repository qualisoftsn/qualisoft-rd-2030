'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Building2, Users, MapPin, Loader2, GitGraph, 
  ChevronRight, ArrowUpRight, Search, LayoutGrid, 
  List, AlertCircle, X, Mail, Phone, FolderTree,
  Target, Briefcase, ShieldCheck, ExternalLink,
  Plus, Edit3, Archive, Trash2, Save, RotateCcw,
  UserCircle, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { toast } from 'react-hot-toast';

// Types
interface Site {
  S_Id: string;
  S_Name: string;
  S_Address?: string;
  S_City?: string;
}

interface OrgUnitType {
  OUT_Id: string;
  OUT_Label: string;
}

interface User {
  U_Id?: string;
  U_FirstName: string;
  U_LastName: string;
  U_Role: string;
  U_Email: string;
  U_Phone?: string;
  U_IsActive?: boolean;
  U_OrgUnitId?: string;
}

interface Processus {
  PR_Id?: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_Description?: string;
  PR_TypeId?: string;
  PR_IsActive?: boolean;
}

interface OrgUnit {
  OU_Id: string;
  OU_Name: string;
  OU_IsActive: boolean;
  OU_CreatedAt: string;
  OU_UpdatedAt: string;
  OU_Type?: OrgUnitType;
  OU_Site?: Site;
  OU_Parent?: { OU_Id: string; OU_Name: string; } | null;
  OU_Children?: OrgUnit[];
  OU_Users?: User[];
  OU_Processus?: Processus[];
  _count?: {
    OU_Users: number;
    OU_Children: number;
  };
}

type ViewMode = 'grid' | 'list';
type TabType = 'overview' | 'users' | 'processes';

export default function InteractiveOrgChart() {
  const router = useRouter();
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Drawer state
  const [selectedUnit, setSelectedUnit] = useState<OrgUnit | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // CRUD States
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Processus | null>(null);
  const [isProcessFormOpen, setIsProcessFormOpen] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState<{type: 'user' | 'process', item: any} | null>(null);

  const fetchUnits = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const res = await apiClient.get('/org-units?includeStats=true&includeUsers=true&includeProcesses=true');
      setUnits(res.data);
    } catch (err) {
      toast.error("Erreur de synchronisation");
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchUnits(); }, [fetchUnits]);

  const stats = useMemo(() => {
    const total = units.length;
    const totalUsers = units.reduce((acc, u) => acc + (u._count?.OU_Users || 0), 0);
    return { total, totalUsers };
  }, [units]);

  const filteredUnits = useMemo(() => {
    if (!searchTerm.trim()) return units;
    const term = searchTerm.toLowerCase();
    return units.filter(u => 
      u.OU_Name.toLowerCase().includes(term) ||
      u.OU_Type?.OUT_Label?.toLowerCase().includes(term) ||
      u.OU_Site?.S_Name?.toLowerCase().includes(term)
    );
  }, [units, searchTerm]);

  const openDetail = (unit: OrgUnit) => {
    setSelectedUnit(unit);
    setIsDrawerOpen(true);
    setActiveTab('overview');
    setIsUserFormOpen(false);
    setIsProcessFormOpen(false);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedUnit(null);
      setIsUserFormOpen(false);
      setIsProcessFormOpen(false);
      setEditingUser(null);
      setEditingProcess(null);
    }, 300);
  };

  // ===== CRUD UTILISATEURS =====
  
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit || !editingUser) return;
    
    setSubmitting(true);
    try {
      const payload = {
        ...editingUser,
        U_OrgUnitId: selectedUnit.OU_Id // Force l'assignation à cette unité
      };

      if (editingUser.U_Id) {
        // Update
        await apiClient.patch(`/users/${editingUser.U_Id}`, payload);
        toast.success("Collaborateur mis à jour");
      } else {
        // Create
        await apiClient.post('/users', payload);
        toast.success("Collaborateur créé et assigné");
      }
      
      // Refresh local
      await fetchUnits(true);
      setIsUserFormOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de sauvegarde");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveUser = async () => {
    if (!confirmArchive?.item.U_Id) return;
    
    setSubmitting(true);
    try {
      // Soft delete : désactivation ou retrait de l'unité
      await apiClient.patch(`/users/${confirmArchive.item.U_Id}`, { 
        U_IsActive: false,
        U_OrgUnitId: null // Retire l'assignation
      });
      toast.success("Collaborateur archivé");
      await fetchUnits(true);
      setConfirmArchive(null);
    } catch (err) {
      toast.error("Erreur d'archivage");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== CRUD PROCESSUS =====

  const handleSaveProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit || !editingProcess) return;
    
    setSubmitting(true);
    try {
      const payload = {
        ...editingProcess,
        PR_ProcessusId: selectedUnit.OU_Id // Liaison implicite via ton backend
      };

      if (editingProcess.PR_Id) {
        await apiClient.patch(`/processes/${editingProcess.PR_Id}`, payload);
        toast.success("Processus mis à jour");
      } else {
        await apiClient.post('/processes', payload);
        toast.success("Processus créé");
      }
      
      await fetchUnits(true);
      setIsProcessFormOpen(false);
      setEditingProcess(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de sauvegarde");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveProcess = async () => {
    if (!confirmArchive?.item.PR_Id) return;
    
    setSubmitting(true);
    try {
      await apiClient.delete(`/processes/${confirmArchive.item.PR_Id}`); // Soft delete côté API
      toast.success("Processus archivé");
      await fetchUnits(true);
      setConfirmArchive(null);
    } catch (err) {
      toast.error("Erreur d'archivage");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-slate-50 min-h-screen italic font-sans text-left relative">
      
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">
            Organigramme <span className="text-blue-600">SMI</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Architecture organisationnelle hiérarchique</p>
        </div>

        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Rechercher..."
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="flex gap-4 text-[11px] font-black uppercase text-slate-400">
        <span className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
          <Building2 size={14} className="text-blue-500" /> {stats.total} Unités
        </span>
        <span className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
          <Users size={14} className="text-emerald-500" /> {stats.totalUsers} Collaborateurs
        </span>
      </div>

      {/* GRID */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        : "flex flex-col gap-3"
      }>
        {filteredUnits.map((unit, index) => (
          <UnitCard 
            key={unit.OU_Id} 
            unit={unit} 
            viewMode={viewMode}
            onClick={() => openDetail(unit)}
          />
        ))}
      </div>

      {/* DRAWER LATÉRAL AVEC CRUD INTÉGRÉ */}
      {isDrawerOpen && selectedUnit && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeDrawer} />
          
          <div className="relative ml-auto w-full max-w-3xl h-full bg-white shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header Drawer */}
            <div className="bg-white border-b border-slate-100 p-8 flex justify-between items-start flex-shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full italic">
                    {selectedUnit.OU_Type?.OUT_Label}
                  </span>
                  {selectedUnit.OU_IsActive ? (
                    <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck size={10} /> Active
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-700 text-[9px] font-black uppercase px-2 py-1 rounded-full border border-red-200">
                      Archivée
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-black uppercase italic text-slate-900">{selectedUnit.OU_Name}</h2>
                <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-slate-500 uppercase">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-blue-500" /> {selectedUnit.OU_Site?.S_Name}</span>
                  {selectedUnit.OU_Parent && <span className="flex items-center gap-1"><FolderTree size={12} /> Sous {selectedUnit.OU_Parent.OU_Name}</span>}
                </div>
              </div>
              <button onClick={closeDrawer} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 bg-white flex-shrink-0">
              <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={Building2} label="Vue d'ensemble" />
              <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label={`Collaborateurs (${selectedUnit.OU_Users?.length || 0})`} />
              <TabButton active={activeTab === 'processes'} onClick={() => setActiveTab('processes')} icon={Briefcase} label={`Processus (${selectedUnit.OU_Processus?.length || 0})`} />
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-8">
              
              {/* ===== ONGLET OVERVIEW ===== */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoBox icon={Building2} label="Type" value={selectedUnit.OU_Type?.OUT_Label || 'N/A'} color="blue" />
                    <InfoBox icon={MapPin} label="Site" value={selectedUnit.OU_Site?.S_Name || 'N/A'} color="emerald" />
                    <InfoBox icon={Users} label="Effectif" value={`${selectedUnit.OU_Users?.length || 0}`} color="amber" />
                    <InfoBox icon={Briefcase} label="Processus" value={`${selectedUnit.OU_Processus?.length || 0}`} color="purple" />
                  </div>

                  {selectedUnit.OU_Children && selectedUnit.OU_Children.length > 0 && (
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                      <h4 className="text-[11px] font-black uppercase text-slate-500 mb-4 tracking-widest">Sous-unités directes</h4>
                      <div className="space-y-2">
                        {selectedUnit.OU_Children.map((child, idx) => (
                          <div key={child.OU_Id} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200">
                            <span className="text-blue-600 font-black">{idx + 1}</span>
                            <span className="font-bold text-slate-700 uppercase text-sm">{child.OU_Name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ===== ONGLET COLLABORATEURS (CRUD) ===== */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  {/* Bouton Ajouter */}
                  {!isUserFormOpen && (
                    <button 
                      onClick={() => {
                        setEditingUser({ U_FirstName: '', U_LastName: '', U_Email: '', U_Role: 'USER', U_Phone: '' });
                        setIsUserFormOpen(true);
                      }}
                      className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-black uppercase text-xs tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Ajouter un collaborateur
                    </button>
                  )}

                  {/* Formulaire User */}
                  {isUserFormOpen && editingUser && (
                    <form onSubmit={handleSaveUser} className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 space-y-4 animate-in slide-in-from-top-2">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-black uppercase italic text-blue-900">
                          {editingUser.U_Id ? 'Modifier' : 'Nouveau'} collaborateur
                        </h4>
                        <button type="button" onClick={() => setIsUserFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          required
                          placeholder="Prénom"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                          value={editingUser.U_FirstName}
                          onChange={(e) => setEditingUser({...editingUser, U_FirstName: e.target.value})}
                        />
                        <input 
                          required
                          placeholder="Nom"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                          value={editingUser.U_LastName}
                          onChange={(e) => setEditingUser({...editingUser, U_LastName: e.target.value})}
                        />
                      </div>
                      
                      <input 
                        required
                        type="email"
                        placeholder="Email"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingUser.U_Email}
                        onChange={(e) => setEditingUser({...editingUser, U_Email: e.target.value})}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          placeholder="Téléphone"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                          value={editingUser.U_Phone || ''}
                          onChange={(e) => setEditingUser({...editingUser, U_Phone: e.target.value})}
                        />
                        <select 
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                          value={editingUser.U_Role}
                          onChange={(e) => setEditingUser({...editingUser, U_Role: e.target.value})}
                        >
                          <option value="USER">Utilisateur</option>
                          <option value="PILOTE">Pilote</option>
                          <option value="ADMIN">Admin</option>
                          <option value="RQ">Responsable Qualité</option>
                        </select>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button 
                          type="button"
                          onClick={() => setIsUserFormOpen(false)}
                          className="flex-1 py-3 rounded-xl border border-slate-200 font-black uppercase text-[11px] text-slate-600 hover:bg-white transition-all"
                        >
                          Annuler
                        </button>
                        <button 
                          type="submit"
                          disabled={submitting}
                          className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-black uppercase text-[11px] shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          Enregistrer
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Liste Users */}
                  <div className="space-y-3">
                    {selectedUnit.OU_Users && selectedUnit.OU_Users.length > 0 ? (
                      selectedUnit.OU_Users.map((user) => (
                        <div key={user.U_Id} className="group flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-sm font-bold group-hover:bg-blue-600 transition-colors">
                            {user.U_FirstName[0]}{user.U_LastName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black uppercase text-slate-900 truncate">{user.U_FirstName} {user.U_LastName}</p>
                            <p className="text-[10px] font-bold text-blue-500 uppercase">{user.U_Role}</p>
                            <p className="text-[10px] text-slate-400 truncate">{user.U_Email}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setEditingUser(user);
                                setIsUserFormOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                              title="Modifier"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              onClick={() => setConfirmArchive({type: 'user', item: user})}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all"
                              title="Archiver"
                            >
                              <Archive size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <Users size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="font-black uppercase italic text-sm">Aucun collaborateur</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ===== ONGLET PROCESSUS (CRUD) ===== */}
              {activeTab === 'processes' && (
                <div className="space-y-6">
                  {/* Bouton Ajouter */}
                  {!isProcessFormOpen && (
                    <button 
                      onClick={() => {
                        setEditingProcess({ PR_Code: '', PR_Libelle: '', PR_Description: '' });
                        setIsProcessFormOpen(true);
                      }}
                      className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-black uppercase text-xs tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Ajouter un processus
                    </button>
                  )}

                  {/* Formulaire Process */}
                  {isProcessFormOpen && editingProcess && (
                    <form onSubmit={handleSaveProcess} className="bg-purple-50/50 border border-purple-100 rounded-3xl p-6 space-y-4 animate-in slide-in-from-top-2">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-black uppercase italic text-purple-900">
                          {editingProcess.PR_Id ? 'Modifier' : 'Nouveau'} processus
                        </h4>
                        <button type="button" onClick={() => setIsProcessFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                        </button>
                      </div>
                      
                      <input 
                        required
                        placeholder="Code (ex: PR-001)"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                        value={editingProcess.PR_Code}
                        onChange={(e) => setEditingProcess({...editingProcess, PR_Code: e.target.value})}
                      />
                      
                      <input 
                        required
                        placeholder="Libellé du processus"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500"
                        value={editingProcess.PR_Libelle}
                        onChange={(e) => setEditingProcess({...editingProcess, PR_Libelle: e.target.value})}
                      />
                      
                      <textarea 
                        placeholder="Description (optionnel)"
                        rows={3}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        value={editingProcess.PR_Description || ''}
                        onChange={(e) => setEditingProcess({...editingProcess, PR_Description: e.target.value})}
                      />

                      <div className="flex gap-3 pt-2">
                        <button 
                          type="button"
                          onClick={() => setIsProcessFormOpen(false)}
                          className="flex-1 py-3 rounded-xl border border-slate-200 font-black uppercase text-[11px] text-slate-600 hover:bg-white transition-all"
                        >
                          Annuler
                        </button>
                        <button 
                          type="submit"
                          disabled={submitting}
                          className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-black uppercase text-[11px] shadow-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                        >
                          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          Enregistrer
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Liste Processus */}
                  <div className="grid grid-cols-1 gap-3">
                    {selectedUnit.OU_Processus && selectedUnit.OU_Processus.length > 0 ? (
                      selectedUnit.OU_Processus.map((proc) => (
                        <div key={proc.PR_Id} className="group p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-3 py-1 rounded-lg uppercase tracking-wider">
                              {proc.PR_Code}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => {
                                  setEditingProcess(proc);
                                  setIsProcessFormOpen(true);
                                }}
                                className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-100 rounded-xl transition-all"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button 
                                onClick={() => setConfirmArchive({type: 'process', item: proc})}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all"
                              >
                                <Archive size={16} />
                              </button>
                            </div>
                          </div>
                          <h4 className="font-black uppercase italic text-slate-900 text-sm mb-1">{proc.PR_Libelle}</h4>
                          {proc.PR_Description && <p className="text-[11px] text-slate-500 line-clamp-2">{proc.PR_Description}</p>}
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <Briefcase size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="font-black uppercase italic text-sm">Aucun processus rattaché</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMATION ARCHIVAGE */}
      {confirmArchive && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            <h3 className="text-2xl font-black uppercase italic text-slate-900 text-center mb-2">
              Confirmer l'archivage ?
            </h3>
            <p className="text-slate-500 text-center text-sm mb-8">
              <strong>{confirmArchive.type === 'user' 
                ? `${confirmArchive.item.U_FirstName} ${confirmArchive.item.U_LastName}`
                : confirmArchive.item.PR_Libelle
              }</strong> sera désactivé et retiré de cette unité. Cette action est réversible.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmArchive(null)}
                className="flex-1 py-4 rounded-2xl border border-slate-200 font-black uppercase text-[11px] text-slate-600 hover:bg-slate-50 transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={confirmArchive.type === 'user' ? handleArchiveUser : handleArchiveProcess}
                disabled={submitting}
                className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black uppercase text-[11px] shadow-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />}
                Archiver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// === SUB-COMPONENTS ===

function UnitCard({ unit, viewMode, onClick }: { 
  unit: OrgUnit; 
  viewMode: ViewMode; 
  onClick: () => void;
}) {
  const userCount = unit._count?.OU_Users || 0;
  
  if (viewMode === 'list') {
    return (
      <div onClick={onClick} className="group bg-white rounded-2xl p-4 border border-slate-100 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors shadow-md flex-shrink-0">
          <Building2 size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 truncate group-hover:text-blue-600 transition-colors">
            {unit.OU_Name}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase">{unit.OU_Type?.OUT_Label} • {unit.OU_Site?.S_Name}</p>
        </div>
        <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-all flex-shrink-0" />
      </div>
    );
  }

  return (
    <div onClick={onClick} className="group bg-white rounded-[35px] p-6 shadow-xl border border-slate-100 hover:border-blue-500 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
         <Building2 size={100} />
      </div>

      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 bg-slate-900 rounded-[20px] flex items-center justify-center text-white shadow-lg group-hover:bg-blue-600 transition-colors duration-500">
          <Building2 size={28} />
        </div>
        <span className="bg-blue-50 text-blue-700 text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border border-blue-100 italic">
          {unit.OU_Type?.OUT_Label || 'Standard'}
        </span>
      </div>

      <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
        {unit.OU_Name}
      </h3>

      <div className="space-y-3 py-4 border-y border-slate-50">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase italic">
          <MapPin size={14} className="text-blue-600" /> {unit.OU_Site?.S_Name || 'Site non défini'}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Effectif</span>
          <span className={`text-sm font-black italic ${userCount > 0 ? 'text-slate-900' : 'text-slate-300'}`}>{userCount || '---'}</span>
        </div>
      </div>

      <button className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-95">
        Voir la fiche détaillée <ArrowUpRight size={14} />
      </button>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border-b-2 transition-all ${
        active 
          ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
          : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );
}

function InfoBox({ icon: Icon, label, value, color }: {
  icon: any;
  label: string;
  value: string;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100'
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black text-slate-900 uppercase italic truncate">{value}</p>
    </div>
  );
}