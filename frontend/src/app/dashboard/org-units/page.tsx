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

/**
 * 🛰️ MODULE : GESTION DES UNITÉS ORGANIQUES (ORG-UNITS)
 * -------------------------------------------------------------------------
 * RÔLE : 
 * Ce module permet de cartographier l'arborescence structurelle de l'entité.
 * Chaque unité est rattachée à un Site et à un Type d'unité pour une 
 * segmentation analytique précise du SMI (Système de Management Intégré).
 * * LOGIQUE TECHNIQUE :
 * - Construction d'une hiérarchie récursive (Parent/Enfant).
 * - Gestion des mutations (changement de parenté ou de site).
 * - Archivage logique pour préserver la traçabilité historique.
 * -------------------------------------------------------------------------
 */

// --- 🏗️ INTERFACES SYSTÈME ---

interface User { 
  U_Id: string; 
  U_FirstName: string; 
  U_LastName: string; 
  U_Role: string; 
}

interface Site { 
  S_Id: string; 
  S_Name: string; 
}

interface OrgUnitType { 
  OUT_Id: string; 
  OUT_Label: string; 
}

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
  // --- 📦 ÉTATS DE DONNÉES ---
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [unitTypes, setUnitTypes] = useState<OrgUnitType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- 🖥️ ÉTATS INTERFACE (MODALS) ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<OrgUnit | null>(null);
  
  // --- 🔍 ÉTATS DE NAVIGATION & FORMULAIRE ---
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ 
    OU_Name: '', 
    OU_TypeId: '', 
    OU_SiteId: '', 
    OU_ParentId: '' 
  });
  const [submitting, setSubmitting] = useState(false);

  /**
   * 📡 SYNCHRONISATION MULTI-FLUX
   * Récupère simultanément les unités, les sites et les types pour éviter le "waterfall".
   */
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

  /**
   * 🌳 LOGIQUE DE CONSTRUCTION HIÉRARCHIQUE
   * Transforme une liste "plate" provenant de la base de données en une
   * structure arborescente imbriquée pour le rendu visuel.
   */
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

  /**
   * 📐 MÉMOÏSATION DE LA LISTE PLATE
   * Génère une liste ordonnée avec indentation pour les sélecteurs (Select inputs).
   */
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

  // --- ⚡ ACTIONS DE GESTION (CRUD) ---

  /**
   * INITIALISATION SOUVERAINE
   * Crée la Direction Générale si l'organisation est vide.
   */
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
      toast.success("Direction Générale initialisée avec succès.");
      fetchData();
    } catch (err: any) {
      toast.error("Erreur critique lors de l'initialisation.");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * CRÉATION D'UNE UNITÉ
   * Enregistre une nouvelle entité dans le maillage organique.
   */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation d'intégrité UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(formData.OU_SiteId)) {
        return toast.error("Le Site sélectionné présente un identifiant invalide.");
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        OU_ParentId: formData.OU_ParentId === "" ? null : formData.OU_ParentId
      };
      await apiClient.post('/org-units', payload);
      toast.success("Nouvelle unité indexée");
      setFormData({ OU_Name: '', OU_TypeId: '', OU_SiteId: '', OU_ParentId: '' });
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erreur serveur";
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * MUTATION DE STRUCTURE
   * Met à jour les propriétés d'une unité existante.
   */
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
      toast.success("Mutation organique validée");
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Échec de la mutation structurelle.");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * ARCHIVAGE
   * Désactive l'unité pour la retirer du flux actif sans supprimer les données liées.
   */
  const handleArchive = async () => {
    if (!selectedUnit) return;
    setSubmitting(true);
    try {
      await apiClient.delete(`/org-units/${selectedUnit.OU_Id}`);
      toast.success("Unité organique archivée");
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Impossible d'archiver cette entité (liens actifs détectés).");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * RENDU RÉCURSIF DE L'ARBORESCENCE
   * Affiche les unités sous forme de nodes extensibles.
   */
  const renderUnitTree = (unitsList: OrgUnit[], level = 0) => {
    return unitsList
      .filter(u => u.OU_Name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((unit) => {
        const hasChildren = unit.children && unit.children.length > 0;
        const isExpanded = expandedUnits.has(unit.OU_Id);
        const hasUsers = (unit._count?.OU_Users || 0) > 0;

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
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${hasChildren ? 'hover:bg-slate-200 text-slate-500 cursor-pointer' : 'text-transparent cursor-default'}`}
                >
                  {hasChildren && (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                </button>
                <Building2 size={20} className={hasUsers ? 'text-blue-600' : 'text-slate-400'} />
                <div className="flex-1">
                  <h3 className="text-sm font-black uppercase italic text-slate-800 tracking-tight">{unit.OU_Name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase italic tracking-[0.2em]">
                    {unit.OU_Type?.OUT_Label} | {unit.OU_Site?.S_Name}
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setSelectedUnit(unit); setIsDetailModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"><Search size={18} /></button>
                  <button onClick={() => { 
                    setSelectedUnit(unit); 
                    setFormData({ 
                      OU_Name: unit.OU_Name, 
                      OU_TypeId: unit.OU_Type?.OUT_Id || '', 
                      OU_SiteId: unit.OU_Site?.S_Id || '', 
                      OU_ParentId: unit.OU_ParentId || '' 
                    });
                    setIsEditModalOpen(true); 
                  }} className="p-2 text-slate-400 hover:text-amber-600 cursor-pointer transition-colors"><Edit3 size={18} /></button>
                  <button onClick={() => { setSelectedUnit(unit); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-red-600 cursor-pointer transition-colors"><Archive size={18} /></button>
                </div>
              </div>
            </div>
            {hasChildren && isExpanded && renderUnitTree(unit.children || [], level + 1)}
          </div>
        );
      });
  };

  // --- AFFICHAGE ÉTAT CHARGEMENT ---
  if (loading) return <div className="flex h-screen bg-slate-50 items-center justify-center font-black italic text-blue-600 uppercase tracking-[0.5em] animate-pulse">Synchronisation Structurelle...</div>;

  return (
    <div className="p-8 space-y-10 bg-slate-50 min-h-screen italic font-sans font-bold text-left">
      <Toaster position="top-right" />

      {/* 🚀 HEADER : TITRE ET ACTIONS FLOTTANTES */}
      <header className="flex justify-between items-end border-b-4 border-slate-100 pb-8">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-6 italic">
            <Layers className="text-blue-600" size={56} /> Structure <span className="text-blue-600">Organique</span>
          </h1>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] mt-3 italic">Modélisation Hiérarchique Elite SMI — ISO 9001 §5.3</p>
        </div>
        <button onClick={() => fetchData()} className="px-10 py-5 bg-white border-2 border-slate-200 rounded-3xl font-black uppercase text-[11px] text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-4 shadow-sm italic cursor-pointer">
          <GitGraph size={22} className="text-blue-600" /> Rafraîchir l&apos;Arbre
        </button>
      </header>

      {/* --- 🛑 CAS D'ORGANISATION VIDE & PRÉREQUIS --- */}
      {units.length === 0 && !loading ? (
        <div className="bg-white rounded-[4rem] p-24 text-center border-2 border-dashed border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 max-w-4xl mx-auto mt-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
          <Rocket size={72} className="text-blue-600 mx-auto mb-10 animate-bounce" />
          <h2 className="text-5xl font-black uppercase text-slate-800 mb-6 tracking-tighter italic">Néant Structurel</h2>
          
          {(sites.length === 0 || unitTypes.length === 0) ? (
            <div className="bg-amber-50 p-10 rounded-4xl max-w-2xl mx-auto border-2 border-amber-200">
              <h3 className="text-amber-700 font-black uppercase text-xl mb-6 flex items-center justify-center gap-4 italic leading-none">
                <AlertTriangle size={32} /> Verrou de Configuration
              </h3>
              <p className="text-amber-800 font-black text-sm mb-8 uppercase tracking-tight italic leading-relaxed">
                Action système bloquée : Vous devez d&apos;abord définir au moins un <span className="underline decoration-4 decoration-amber-400">Site</span> et un <span className="underline decoration-4 decoration-amber-400">Type d&apos;unité</span> dans le panneau de configuration Master.
              </p>
              <div className="flex justify-center gap-6">
                <div className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase italic border-2 ${sites.length === 0 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'}`}>
                  {sites.length === 0 ? '❌ Site inexistant' : '✅ Référentiel Site OK'}
                </div>
                <div className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase italic border-2 ${unitTypes.length === 0 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'}`}>
                  {unitTypes.length === 0 ? '❌ Type inexistant' : '✅ Référentiel Type OK'}
                </div>
              </div>
            </div>
          ) : (
            <button onClick={handleAutoInit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-7 rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-[0_20px_50px_rgba(37,99,235,0.4)] transition-all flex items-center gap-5 mx-auto cursor-pointer border-none group">
                {submitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} className="group-hover:scale-110 transition-transform" />} Déployer la Direction Générale
            </button>
          )}
        </div>
      ) : (
        /* --- 🏗️ GRID PRINCIPALE : FORMULAIRE ET EXPLORATEUR --- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* PANNEAU DE CRÉATION (STIGMATE ÉLITE) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl border border-slate-100 sticky top-10 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Boxes size={80} /></div>
              <h2 className="text-lg font-black uppercase mb-12 text-slate-800 flex items-center gap-4 italic underline decoration-blue-600 decoration-[6px] underline-offset-12">
                <Plus size={28} className="text-blue-600" /> Nouvelle Segment
              </h2>
              
              <form onSubmit={handleCreate} className="space-y-8 relative z-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Dénomination Unité</label>
                  <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-8 py-6 text-sm font-black uppercase italic outline-none focus:border-blue-500 shadow-inner transition-all placeholder:text-slate-300"
                    value={formData.OU_Name} onChange={(e) => setFormData({...formData, OU_Name: e.target.value.toUpperCase()})} placeholder="EX: SERVICE LOGISTIQUE" />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Niveau Organique</label>
                  <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-8 py-6 text-[11px] font-black uppercase italic outline-none focus:border-blue-500 cursor-pointer appearance-none"
                    value={formData.OU_TypeId} onChange={(e) => setFormData({...formData, OU_TypeId: e.target.value})}>
                    <option value="">-- SÉLECTIONNER TYPE --</option>
                    {unitTypes.map(t => <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label.toUpperCase()}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Site de Rattachement</label>
                  <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-8 py-6 text-[11px] font-black uppercase italic outline-none focus:border-blue-500 cursor-pointer appearance-none"
                    value={formData.OU_SiteId} onChange={(e) => setFormData({...formData, OU_SiteId: e.target.value})}>
                    <option value="">-- SÉLECTIONNER SITE --</option>
                    {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name.toUpperCase()}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-blue-600 ml-4 tracking-widest">Unité Parente (Hiérarchie)</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-8 py-6 text-[11px] font-black uppercase italic outline-none focus:border-blue-600 cursor-pointer appearance-none"
                    value={formData.OU_ParentId} onChange={(e) => setFormData({...formData, OU_ParentId: e.target.value})}>
                    <option value="" className="text-blue-600 font-black italic">✪ RACINE SOUVERAINE</option>
                    {flatListForSelect.map((u: any) => (
                        <option key={u.OU_Id} value={u.OU_Id}>{'—'.repeat(u.depth)} ↳ {u.OU_Name}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" disabled={submitting || sites.length === 0 || unitTypes.length === 0} className="w-full bg-slate-900 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black uppercase py-7 rounded-3xl text-[12px] shadow-3xl transition-all italic flex items-center justify-center gap-5 cursor-pointer border-none">
                  {submitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} />} Enregistrer dans la structure
                </button>
              </form>
            </div>
          </div>

          {/* EXPLORATEUR ARBORESCENT (DROITE) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden min-h-150 flex flex-col">
              <div className="p-10 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div className="relative w-full max-w-lg group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={24} />
                  <input placeholder="FILTRER LE MAILLAGE ORGANIQUE..." className="w-full bg-white border-2 border-slate-200 rounded-4xl py-5 pl-16 pr-8 text-xs font-black uppercase italic outline-none focus:border-blue-500 shadow-sm transition-all"
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 shadow-inner italic">
                    <Building2 size={12} /> {flatListForSelect.length} Unités
                  </div>
                </div>
              </div>
              <div className="divide-y divide-slate-50 flex-1 overflow-y-auto custom-scrollbar">
                {renderUnitTree(units)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 📟 SECTION MODALS SYSTÈME --- */}

      {/* MODAL 01 : MUTATION STRUCTURELLE (ÉDITION) */}
      {isEditModalOpen && selectedUnit && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-100 flex items-center justify-center p-6">
          <div className="bg-white rounded-[4rem] w-full max-w-xl shadow-[0_30px_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 border-none overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-5"><Edit3 size={100} /></div>
            <div className="p-14 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-3xl font-black uppercase italic text-slate-900 flex items-center gap-6"><Edit3 className="text-amber-500" size={36} /> Mutation Unité</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-4 hover:bg-slate-200 rounded-full text-slate-400 transition-colors border-none cursor-pointer"><X size={36} /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-14 space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Libellé de l&apos;entité</label>
                <input required className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-8 py-6 text-sm font-black uppercase italic text-slate-900 outline-none focus:border-amber-500" value={formData.OU_Name} onChange={(e) => setFormData({...formData, OU_Name: e.target.value.toUpperCase()})} />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Classification</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-6 text-[11px] font-black uppercase italic outline-none" value={formData.OU_TypeId} onChange={(e) => setFormData({...formData, OU_TypeId: e.target.value})}>
                    {unitTypes.map(t => <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Implantation</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-6 text-[11px] font-black uppercase italic outline-none" value={formData.OU_SiteId} onChange={(e) => setFormData({...formData, OU_SiteId: e.target.value})}>
                    {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full py-8 rounded-[2.5rem] bg-amber-500 hover:bg-amber-600 text-white font-black uppercase text-xs shadow-2xl transition-all italic border-none cursor-pointer">Confirmer la Mutation de Structure</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 02 : ARCHIVAGE LOGIQUE (SUPPRESSION) */}
      {isDeleteModalOpen && selectedUnit && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-2xl z-110 flex items-center justify-center p-6">
          <div className="bg-white rounded-[4rem] p-16 text-center shadow-4xl animate-in zoom-in-95 font-black italic max-w-lg w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
            <Archive size={64} className="text-red-600 mx-auto mb-10 animate-pulse" />
            <h2 className="text-5xl uppercase tracking-tighter text-slate-900 mb-6">Archivage ?</h2>
            <p className="text-slate-500 text-sm font-black uppercase mb-12 italic leading-relaxed tracking-tight">Le segment structurel <span className="text-red-600">&quot;{selectedUnit.OU_Name}&quot;</span> sera désactivé du SMI actif. Cette action est irréversible dans le flux courant.</p>
            <div className="flex gap-6">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-7 rounded-2xl border-2 border-slate-100 uppercase text-[11px] text-slate-400 italic cursor-pointer hover:bg-slate-50 transition-colors">Abandonner</button>
              <button onClick={handleArchive} disabled={submitting} className="flex-1 py-7 rounded-2xl bg-red-600 hover:bg-red-700 text-white uppercase text-[11px] shadow-3xl italic cursor-pointer border-none transition-all">Valider l&apos;Archivage</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 03 : VUE DÉTAILLÉE (INSPECTION) */}
      {isDetailModalOpen && selectedUnit && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-100 flex items-center justify-center p-6">
          <div className="bg-white rounded-[4rem] w-full max-w-5xl shadow-[0_40px_120px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-12 font-black italic overflow-hidden border-none text-left">
            <div className="p-14 border-b-2 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-lg"><Briefcase size={40} /></div>
                <div>
                  <span className="text-[11px] text-blue-600 uppercase tracking-[0.4em] font-black">{selectedUnit.OU_Type?.OUT_Label}</span>
                  <h2 className="text-5xl uppercase mt-2 tracking-tighter text-slate-900">{selectedUnit.OU_Name}</h2>
                </div>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-6 hover:bg-slate-200 rounded-full text-slate-400 transition-colors border-none cursor-pointer"><X size={44} /></button>
            </div>
            <div className="p-16 space-y-16">
              <div className="grid grid-cols-2 gap-10">
                <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 flex items-center gap-8 shadow-inner">
                  <MapPin className="text-blue-500" size={40} />
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-black tracking-widest block mb-2">Implantation Géographique</p>
                    <p className="text-2xl uppercase text-slate-800 tracking-tight">{selectedUnit.OU_Site?.S_Name}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 flex items-center gap-8 shadow-inner">
                  <FolderTree className="text-slate-400" size={40} />
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-black tracking-widest block mb-2">Segment Hiérarchique Parent</p>
                    <p className="text-2xl uppercase text-slate-800 tracking-tight">{selectedUnit.OU_Parent?.OU_Name || '✪ UNITÉ RACINE SOUVERAINE'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-10">
                <h3 className="text-sm uppercase text-slate-800 flex items-center gap-5 italic font-black">
                  <Users size={28} className="text-blue-600" /> Capital Humain Affecté ({selectedUnit._count?.OU_Users || 0})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-100 overflow-y-auto pr-6 custom-scrollbar p-2">
                  {selectedUnit.OU_Users && selectedUnit.OU_Users.length > 0 ? selectedUnit.OU_Users.map((u) => (
                    <div key={u.U_Id} className="flex items-center gap-5 p-6 bg-white border-2 border-slate-100 rounded-4xl shadow-sm hover:shadow-md transition-shadow group">
                      <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg group-hover:bg-blue-600 transition-colors">{u.U_FirstName[0]}{u.U_LastName[0]}</div>
                      <div className="truncate flex-1">
                        <p className="font-black text-slate-900 uppercase truncate text-[13px] tracking-tight">{u.U_FirstName} {u.U_LastName}</p>
                        <p className="text-blue-600 text-[10px] font-bold italic opacity-70 uppercase tracking-widest">{u.U_Role}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-3 py-20 text-center text-slate-300 border-4 border-dashed border-slate-100 rounded-[4rem]">
                      <Activity size={48} className="mx-auto mb-4 opacity-10" />
                      <p className="uppercase text-xs font-black tracking-[0.3em]">Aucune affectation de personnel détectée</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🧩 STYLES ADDITIONNELS POUR SCROLLBAR & ANIMATIONS */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}