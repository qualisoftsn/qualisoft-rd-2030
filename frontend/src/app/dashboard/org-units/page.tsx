/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Building2, Plus, GitGraph, MapPin, Layers, Users, 
  Loader2, AlertCircle, CheckCircle2, Trash2, ChevronRight, 
  Edit3, Archive, X, ChevronDown, Search,
  AlertTriangle, FolderTree, Briefcase, Boxes, Activity, ShieldCheck, Rocket
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'react-hot-toast';

// --- INTERFACES ---
interface User { U_Id: string; U_FirstName: string; U_LastName: string; U_Role: string; }
interface Site { S_Id: string; S_Name: string; }
interface OrgUnitType { OUT_Id: string; OUT_Label: string; }

interface OrgUnit {
  OU_Id: string; 
  OU_Name: string; 
  OU_IsActive: boolean; 
  OU_CreatedAt: string;
  OU_Type?: OrgUnitType; 
  OU_Site?: Site;
  OU_Parent?: { OU_Id: string; OU_Name: string; } | null;
  OU_ParentId?: string | null; 
  OU_Users?: User[];
  _count?: { OU_Children: number; OU_Users: number; };
  children?: OrgUnit[];
}

export default function OrgUnitsPage() {
  // --- ÉTATS ---
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [unitTypes, setUnitTypes] = useState<OrgUnitType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<OrgUnit | null>(null);
  
  // UI
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ OU_Name: '', OU_TypeId: '', OU_SiteId: '', OU_ParentId: '' });
  const [submitting, setSubmitting] = useState(false);

  // --- 1. CHARGEMENT DES DONNÉES ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, sRes, tRes] = await Promise.all([
        apiClient.get('/org-units?includeArchived=false'),
        apiClient.get('/sites'),
        apiClient.get('/org-unit-types') 
      ]);
      
      const extract = (res: any) => res.data?.data || res.data || [];
      
      setUnits(buildHierarchy(extract(uRes)));
      setSites(extract(sRes));
      setUnitTypes(extract(tRes));
    } catch (err: any) {
      toast.error("Échec de la synchronisation serveur.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- 2. LOGIQUE HIÉRARCHIQUE ---
  const buildHierarchy = (flatUnits: OrgUnit[]): OrgUnit[] => {
    const unitMap = new Map<string, OrgUnit>();
    const roots: OrgUnit[] = [];
    flatUnits.forEach((unit) => {
      unitMap.set(unit.OU_Id, { ...unit, children: [] });
    });
    unitMap.forEach((unit) => {
      const parentId = unit.OU_ParentId || unit.OU_Parent?.OU_Id;
      if (parentId && unitMap.has(parentId)) {
        unitMap.get(parentId)!.children?.push(unit);
      } else {
        roots.push(unit);
      }
    });
    return roots;
  };

  const flatListForSelect = useMemo(() => {
    const flat: any[] = [];
    const recurse = (list: OrgUnit[], depth = 0) => {
      list.forEach(u => {
        flat.push({ ...u, depth }); 
        if (u.children && u.children.length > 0) recurse(u.children, depth + 1);
      });
    };
    recurse(units);
    return flat;
  }, [units]);

  // --- 3. ACTIONS CRUD ---
  const handleAutoInit = async () => {
    if (sites.length === 0 || unitTypes.length === 0) {
        return toast.error("Action impossible : un site et un type d'unité sont requis.");
    }

    setSubmitting(true);
    try {
      const payload = { 
        OU_Name: "DIRECTION GÉNÉRALE", 
        OU_TypeId: unitTypes[0].OUT_Id, 
        OU_SiteId: sites[0].S_Id, 
        OU_ParentId: null 
      };
      await apiClient.post('/org-units', payload);
      toast.success("Direction Générale initialisée.");
      fetchData();
    } catch (err: any) {
      toast.error("Erreur d'initialisation.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation stricte UUID avant envoi
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(formData.OU_SiteId)) {
        return toast.error("Erreur critique : L'identifiant du site est invalide.");
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        OU_ParentId: formData.OU_ParentId === "" ? null : formData.OU_ParentId
      };
      await apiClient.post('/org-units', payload);
      toast.success("Structure créée avec succès");
      setFormData({ OU_Name: '', OU_TypeId: '', OU_SiteId: '', OU_ParentId: '' });
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erreur serveur";
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;
    setSubmitting(true);
    try {
      const payload = {
        OU_Name: formData.OU_Name,
        OU_TypeId: formData.OU_TypeId,
        OU_SiteId: formData.OU_SiteId,
        OU_ParentId: formData.OU_ParentId === "" ? null : formData.OU_ParentId
      };
      await apiClient.patch(`/org-units/${selectedUnit.OU_Id}`, payload);
      toast.success("Mutation validée");
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Échec de la mise à jour");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!selectedUnit) return;
    setSubmitting(true);
    try {
      await apiClient.delete(`/org-units/${selectedUnit.OU_Id}`);
      toast.success("Unité archivée");
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Impossible d'archiver.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderUnitTree = (unitsList: OrgUnit[], level = 0) => {
    return unitsList
      .filter(u => u.OU_Name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((unit) => {
        const hasChildren = unit.children && unit.children.length > 0;
        const isExpanded = expandedUnits.has(unit.OU_Id);
        const hasUsers = unit._count?.OU_Users || 0;

        return (
          <div key={unit.OU_Id} className="select-none animate-in fade-in duration-300">
            <div 
              className={`group flex items-center justify-between p-4 hover:bg-slate-50 transition-all border-l-2 ${level > 0 ? 'ml-8 border-l-slate-200' : 'border-l-transparent bg-white'}`}
              style={{ paddingLeft: `${16 + (level * 24)}px` }}
            >
              <div className="flex items-center gap-4 flex-1">
                <button
                  onClick={() => {
                    const next = new Set(expandedUnits);
                    isExpanded ? next.delete(unit.OU_Id) : next.add(unit.OU_Id);
                    setExpandedUnits(next);
                  }}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${hasChildren ? 'hover:bg-slate-200 text-slate-500' : 'text-transparent cursor-default'}`}
                >
                  {hasChildren && (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                </button>
                <Building2 size={20} className={hasUsers > 0 ? 'text-blue-600' : 'text-slate-400'} />
                <div className="flex-1">
                  <h3 className="text-sm font-black uppercase italic text-slate-800">{unit.OU_Name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase italic tracking-widest">
                    {unit.OU_Type?.OUT_Label} | {unit.OU_Site?.S_Name}
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setSelectedUnit(unit); setIsDetailModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600"><Search size={18} /></button>
                  <button onClick={() => { 
                    setSelectedUnit(unit); 
                    setFormData({ 
                      OU_Name: unit.OU_Name, 
                      OU_TypeId: unit.OU_Type?.OUT_Id || '', 
                      OU_SiteId: unit.OU_Site?.S_Id || '', 
                      OU_ParentId: unit.OU_ParentId || '' 
                    });
                    setIsEditModalOpen(true); 
                  }} className="p-2 text-slate-400 hover:text-amber-600"><Edit3 size={18} /></button>
                  <button onClick={() => { setSelectedUnit(unit); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-red-600"><Archive size={18} /></button>
                </div>
              </div>
            </div>
            {hasChildren && isExpanded && renderUnitTree(unit.children || [], level + 1)}
          </div>
        );
      });
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-black italic text-blue-600 uppercase tracking-widest">Initialisation...</div>;

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen italic font-sans font-bold">
      <Toaster position="top-right" />

      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-4 italic">
            <Layers className="text-blue-600" size={48} /> Unités <span className="text-blue-600">Organiques</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 italic">Architecture Elite SMI</p>
        </div>
        <button onClick={() => fetchData()} className="px-8 py-4 bg-white border-2 border-slate-100 rounded-3xl font-black uppercase text-[11px] text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-3 shadow-sm italic">
          <GitGraph size={20} /> Actualiser
        </button>
      </header>

      {/* --- ÉTAT VIDE & PRÉREQUIS --- */}
      {units.length === 0 && !loading ? (
        <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200 shadow-xl animate-in fade-in zoom-in-95 max-w-4xl mx-auto mt-10">
          <Rocket size={64} className="text-blue-600 mx-auto mb-8" />
          <h2 className="text-4xl font-black uppercase text-slate-800 mb-4 tracking-tighter italic">Organisation Vide</h2>
          
          {(sites.length === 0 || unitTypes.length === 0) ? (
            <div className="bg-amber-50 p-8 rounded-3xl max-w-2xl mx-auto border-2 border-amber-200">
              <h3 className="text-amber-700 font-black uppercase text-lg mb-4 flex items-center justify-center gap-3 italic">
                <AlertTriangle size={24} /> Configuration Requise
              </h3>
              <p className="text-amber-800 font-bold text-sm mb-6 uppercase tracking-tight italic">
                Action bloquée : Vous devez d&apos;abord créer au moins un <span className="underline decoration-2">Site</span> et un <span className="underline decoration-2">Type d&apos;unité</span> dans les paramètres.
              </p>
              <div className="flex justify-center gap-4">
                <div className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase italic ${sites.length === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {sites.length === 0 ? '❌ Site Manquant' : '✅ Site OK'}
                </div>
                <div className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase italic ${unitTypes.length === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {unitTypes.length === 0 ? '❌ Type Manquant' : '✅ Type OK'}
                </div>
              </div>
            </div>
          ) : (
            <button onClick={handleAutoInit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl transition-all flex items-center gap-4 mx-auto cursor-pointer">
                {submitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />} Initialiser la Racine
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-50 sticky top-8">
              <h2 className="text-sm font-black uppercase mb-10 text-slate-800 flex items-center gap-3 italic underline decoration-blue-600 decoration-4 underline-offset-8">
                <Plus size={24} className="text-blue-600" /> Nouvelle Entité
              </h2>
              
              {(sites.length === 0 || unitTypes.length === 0) && (
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100 mb-6 animate-pulse">
                      <p className="text-[10px] text-red-600 font-black uppercase italic leading-tight">
                         ⚠️ Action bloquée : Création impossible sans site ou type d&apos;unité.
                      </p>
                  </div>
              )}

              <form onSubmit={handleCreate} className="space-y-6">
                <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-xs font-black uppercase italic outline-none focus:border-blue-500 shadow-inner"
                    value={formData.OU_Name} onChange={(e) => setFormData({...formData, OU_Name: e.target.value.toUpperCase()})} placeholder="NOM DE L'UNITÉ" />
                
                <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-[11px] font-black uppercase italic outline-none focus:border-blue-500 cursor-pointer"
                    value={formData.OU_TypeId} onChange={(e) => setFormData({...formData, OU_TypeId: e.target.value})}>
                    <option value="">-- CHOISIR TYPE --</option>
                    {unitTypes.map(t => <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label.toUpperCase()}</option>)}
                </select>

                {/* SÉLECTION DU SITE CORRIGÉE */}
                <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-[11px] font-black uppercase italic outline-none focus:border-blue-500 cursor-pointer"
                    value={formData.OU_SiteId} onChange={(e) => setFormData({...formData, OU_SiteId: e.target.value})}>
                    <option value="">-- CHOISIR SITE --</option>
                    {sites.map(s => (
                        <option key={s.S_Id} value={s.S_Id}>
                            {s.S_Name.toUpperCase()}
                        </option>
                    ))}
                </select>

                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-[11px] font-black uppercase italic outline-none focus:border-blue-500 cursor-pointer"
                    value={formData.OU_ParentId} onChange={(e) => setFormData({...formData, OU_ParentId: e.target.value})}>
                    <option value="" className="text-blue-600 font-black italic">✪ UNITÉ RACINE</option>
                    {flatListForSelect.map((u: any) => (
                        <option key={u.OU_Id} value={u.OU_Id}>{'--'.repeat(u.depth)} ↳ {u.OU_Name}</option>
                    ))}
                </select>

                <button type="submit" disabled={submitting || sites.length === 0 || unitTypes.length === 0} className="w-full bg-slate-900 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black uppercase py-6 rounded-2xl text-[11px] shadow-2xl transition-all italic flex items-center justify-center gap-4">
                  {submitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />} Enregistrer l&apos;unité
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden min-h-125">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input placeholder="FILTRER LA STRUCTURE..." className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-[11px] font-black uppercase italic outline-none focus:border-blue-500 shadow-sm"
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
              </div>
              <div className="divide-y divide-slate-50">{renderUnitTree(units)}</div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      {isEditModalOpen && selectedUnit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-4xl animate-in zoom-in-95 border border-white overflow-hidden p-12">
            <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h2 className="text-2xl font-black uppercase italic text-slate-800 flex items-center gap-5"><Edit3 className="text-amber-500" size={32} /> Mutation</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-4 hover:bg-slate-200 rounded-full text-slate-400"><X size={32} /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-12 space-y-8">
              <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-6 text-xs font-black uppercase italic" value={formData.OU_Name} onChange={(e) => setFormData({...formData, OU_Name: e.target.value.toUpperCase()})} />
              <div className="grid grid-cols-2 gap-6">
                <select className="bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-6 text-[10px] font-black uppercase italic" value={formData.OU_TypeId} onChange={(e) => setFormData({...formData, OU_TypeId: e.target.value})}>
                  {unitTypes.map(t => <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label}</option>)}
                </select>
                <select className="bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-6 text-[10px] font-black uppercase italic" value={formData.OU_SiteId} onChange={(e) => setFormData({...formData, OU_SiteId: e.target.value})}>
                  {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                </select>
              </div>
              <button type="submit" disabled={submitting} className="w-full py-7 rounded-4xl bg-amber-500 text-white font-black uppercase text-xs shadow-2xl transition-all italic">Confirmer la Mutation</button>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedUnit && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-110 flex items-center justify-center p-4">
          <div className="bg-white rounded-[4rem] p-14 text-center shadow-4xl animate-in zoom-in-95 font-black italic max-w-md w-full">
            <Archive size={56} className="text-red-600 mx-auto mb-10" />
            <h2 className="text-4xl uppercase tracking-tighter text-slate-900 mb-6">Archiver ?</h2>
            <p className="text-slate-400 text-xs font-bold uppercase mb-12 italic leading-relaxed">Le segment <span className="text-red-600">&quot;{selectedUnit.OU_Name}&quot;</span> sera désactivé.</p>
            <div className="flex gap-5">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-6 rounded-2xl border-2 border-slate-100 uppercase text-[11px] text-slate-400 italic">Annuler</button>
              <button onClick={handleArchive} disabled={submitting} className="flex-1 py-6 rounded-2xl bg-red-600 text-white uppercase text-[11px] shadow-2xl italic">Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedUnit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-4xl shadow-4xl animate-in slide-in-from-bottom-10 font-black italic overflow-hidden">
            <div className="p-12 border-b flex justify-between items-center bg-slate-50/50">
              <div>
                <span className="text-[11px] text-blue-600 uppercase tracking-widest">{selectedUnit.OU_Type?.OUT_Label}</span>
                <h2 className="text-4xl uppercase mt-2">{selectedUnit.OU_Name}</h2>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-5 hover:bg-slate-200 rounded-full text-slate-400"><X size={36} /></button>
            </div>
            <div className="p-14 space-y-14">
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 flex items-center gap-6">
                  <MapPin className="text-blue-500" size={32} />
                  <div><p className="text-[10px] uppercase text-slate-400 block mb-1">Localisation</p><p className="text-lg uppercase">{selectedUnit.OU_Site?.S_Name}</p></div>
                </div>
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 flex items-center gap-6">
                  <FolderTree className="text-slate-400" size={32} />
                  <div><p className="text-[10px] uppercase text-slate-400 block mb-1">Parent</p><p className="text-lg uppercase">{selectedUnit.OU_Parent?.OU_Name || 'UNITÉ RACINE'}</p></div>
                </div>
              </div>
              <div>
                <h3 className="text-xs uppercase text-slate-400 mb-8 flex items-center gap-4"><Users size={24} className="text-blue-600" /> Collaborateurs ({selectedUnit._count?.OU_Users || 0})</h3>
                <div className="grid grid-cols-3 gap-5 max-h-80 overflow-y-auto pr-4 custom-scrollbar">
                  {selectedUnit.OU_Users && selectedUnit.OU_Users.length > 0 ? selectedUnit.OU_Users.map((u) => (
                      <div key={u.U_Id} className="flex items-center gap-4 p-5 bg-slate-50 rounded-[1.8rem] border-2 border-slate-100 shadow-sm text-[11px] uppercase">
                        <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-black">{u.U_FirstName[0]}{u.U_LastName[0]}</div>
                        <div className="truncate"><p className="font-black truncate">{u.U_FirstName} {u.U_LastName}</p><p className="text-blue-600 opacity-70 italic">{u.U_Role}</p></div>
                      </div>
                    )) : <div className="col-span-3 py-14 text-center text-slate-300 uppercase text-xs italic border-4 border-dashed border-slate-100 rounded-[3rem]">Néant collaborateur</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}