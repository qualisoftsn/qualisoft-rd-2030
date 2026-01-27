/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, GitGraph, MapPin, Layers, Users, 
  Loader2, AlertCircle, CheckCircle2, Trash2, ChevronRight, 
  Edit3, Archive, X, ChevronDown, ChevronUp, Search,
  AlertTriangle, FolderTree, Briefcase
} from 'lucide-react';
import apiClient from '@/core/api/api-client';

// Types
interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Role: string;
  U_Email?: string;
}

interface Site {
  S_Id: string;
  S_Name: string;
  S_City?: string;
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
  OU_Users?: User[];
  _count?: {
    OU_Children: number;
    OU_Users: number;
  };
  children?: OrgUnit[];
}

export default function OrgUnitsPage() {
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [unitTypes, setUnitTypes] = useState<OrgUnitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  
  // Modals states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<OrgUnit | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  
  // Form states
  const [formData, setFormData] = useState({
    OU_Name: '',
    OU_TypeId: '',
    OU_SiteId: '',
    OU_ParentId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, sRes, tRes] = await Promise.all([
        apiClient.get('/org-units?includeArchived=false'),
        apiClient.get('/sites'),
        apiClient.get('/org-unit-types')
      ]);
      
      // Construire l'arbre hiérarchique
      const unitsData = uRes.data;
      const treeData = buildHierarchy(unitsData);
      
      setUnits(treeData);
      setSites(sRes.data);
      setUnitTypes(tRes.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur de synchronisation avec le serveur.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Construit la hiérarchie parent/enfants
  const buildHierarchy = (flatUnits: OrgUnit[]): OrgUnit[] => {
    const unitMap = new Map<string, OrgUnit>();
    const roots: OrgUnit[] = [];

    flatUnits.forEach((unit: OrgUnit) => {
      unitMap.set(unit.OU_Id, { ...unit, children: [] });
    });

    unitMap.forEach((unit) => {
      if (unit.OU_Parent?.OU_Id) {
        const parent = unitMap.get(unit.OU_Parent.OU_Id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(unit);
        }
      } else {
        roots.push(unit);
      }
    });

    return roots;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await apiClient.post('/org-units', {
        ...formData,
        OU_ParentId: formData.OU_ParentId || null
      });
      setMessage({ type: 'success', text: `L'unité "${formData.OU_Name}" a été créée avec succès.` });
      setFormData({ OU_Name: '', OU_TypeId: '', OU_SiteId: '', OU_ParentId: '' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la création.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;
    
    setSubmitting(true);
    try {
      await apiClient.patch(`/org-units/${selectedUnit.OU_Id}`, {
        OU_Name: formData.OU_Name,
        OU_TypeId: formData.OU_TypeId,
        OU_SiteId: formData.OU_SiteId,
        OU_ParentId: formData.OU_ParentId || null
      });
      setMessage({ type: 'success', text: 'Unité modifiée avec succès.' });
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la modification.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!selectedUnit) return;
    
    setSubmitting(true);
    try {
      await apiClient.delete(`/org-units/${selectedUnit.OU_Id}`);
      setMessage({ type: 'success', text: `L'unité "${selectedUnit.OU_Name}" a été archivée.` });
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Impossible d\'archiver cette unité. Vérifiez qu\'elle n\'a pas de sous-unités ou collaborateurs actifs.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (unit: OrgUnit) => {
    setSelectedUnit(unit);
    setFormData({
      OU_Name: unit.OU_Name,
      OU_TypeId: unit.OU_Type?.OUT_Id || '',
      OU_SiteId: unit.OU_Site?.S_Id || '',
      OU_ParentId: unit.OU_Parent?.OU_Id || ''
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (unit: OrgUnit) => {
    setSelectedUnit(unit);
    setIsDeleteModalOpen(true);
  };

  const openDetailModal = (unit: OrgUnit) => {
    setSelectedUnit(unit);
    setIsDetailModalOpen(true);
  };

  const toggleExpand = (unitId: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedUnits(newExpanded);
  };

  // Rendu récursif de l'arborescence
  const renderUnitTree = (unitsList: OrgUnit[], level = 0) => {
    return unitsList.map((unit) => {
      const hasChildren = unit.children && unit.children.length > 0;
      const isExpanded = expandedUnits.has(unit.OU_Id);
      const hasUsers = unit._count?.OU_Users || 0;

      return (
        <div key={unit.OU_Id} className="select-none">
          <div 
            className={`group flex items-center justify-between p-4 hover:bg-slate-50 transition-all border-l-2 ${
              level > 0 ? 'ml-8 border-l-slate-200' : 'border-l-transparent'
            } ${level === 0 ? 'bg-white' : ''}`}
            style={{ paddingLeft: `${16 + (level * 24)}px` }}
          >
            <div className="flex items-center gap-4 flex-1">
              {/* Expand button */}
              <button
                onClick={() => hasChildren && toggleExpand(unit.OU_Id)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  hasChildren ? 'hover:bg-slate-200 text-slate-500' : 'text-transparent'
                }`}
              >
                {hasChildren && (
                  isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                )}
              </button>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all ${
                hasUsers > 0 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {hasUsers > 0 ? <Users size={20} /> : <Building2 size={20} />}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">
                    {unit.OU_Name}
                  </h3>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-white uppercase">
                    {unit.OU_Type?.OUT_Label}
                  </span>
                  {hasUsers > 0 && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                      {hasUsers} collaborateur{hasUsers > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {unit.OU_Site && (
                    <span className="flex items-center gap-1">
                      <MapPin size={10} className="text-blue-500" />
                      {unit.OU_Site.S_Name}
                    </span>
                  )}
                  {unit.OU_Parent && (
                    <span className="flex items-center gap-1">
                      <FolderTree size={10} className="text-slate-400" />
                      sous {unit.OU_Parent.OU_Name}
                    </span>
                  )}
                  {unit._count?.OU_Children > 0 && (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Briefcase size={10} />
                      {unit._count.OU_Children} sous-unité{unit._count.OU_Children > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openDetailModal(unit)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Voir détails"
                >
                  <Search size={18} />
                </button>
                <button
                  onClick={() => openEditModal(unit)}
                  className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                  title="Modifier"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => openDeleteModal(unit)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Archiver"
                >
                  <Archive size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Children */}
          {hasChildren && isExpanded && (
            <div className="animate-in slide-in-from-top-1 fade-in duration-200">
              {renderUnitTree(unit.children || [], level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen italic font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-4">
            <Layers className="text-blue-600" size={40} /> 
            Unités Organiques
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Gestion de la structure organisationnelle, sites et hiérarchie des responsabilités.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => fetchData()}
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black uppercase text-[11px] text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <GitGraph size={16} /> Actualiser
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border text-[11px] font-bold animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-600 border-green-200' : 
          message.type === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-200' :
          'bg-red-50 text-red-600 border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : 
           message.type === 'warning' ? <AlertTriangle size={18} /> :
           <AlertCircle size={18} />}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-auto hover:bg-white/50 p-1 rounded">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORMULAIRE CRÉATION */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 sticky top-8">
            <h2 className="text-sm font-black uppercase mb-8 text-slate-800 flex items-center gap-2">
              <Plus size={20} className="text-blue-600" /> 
              Nouvelle Unité
            </h2>
            
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nom de l&apos;unité *</label>
                <input 
                  required
                  placeholder="Ex: Direction des Opérations" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:font-normal"
                  value={formData.OU_Name}
                  onChange={(e) => setFormData({...formData, OU_Name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Type de structure *</label>
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  value={formData.OU_TypeId}
                  onChange={(e) => setFormData({...formData, OU_TypeId: e.target.value})}
                >
                  <option value="">-- Sélectionner --</option>
                  {unitTypes.map(t => (
                    <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Site de rattachement *</label>
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  value={formData.OU_SiteId}
                  onChange={(e) => setFormData({...formData, OU_SiteId: e.target.value})}
                >
                  <option value="">-- Choisir un site --</option>
                  {sites.map(s => (
                    <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Unité parente</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  value={formData.OU_ParentId}
                  onChange={(e) => setFormData({...formData, OU_ParentId: e.target.value})}
                >
                  <option value="">-- Racine (Aucun) --</option>
                  {units.map(flattenUnits).flat().map((u: any) => (
                    <option key={u.OU_Id} value={u.OU_Id}>
                      {u.OU_Name}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-blue-600 disabled:bg-slate-400 text-white font-black uppercase py-5 rounded-xl text-[11px] shadow-lg transition-all flex items-center justify-center gap-3 mt-6"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                Créer l&apos;unité
              </button>
            </form>
          </div>
        </div>

        {/* LISTE HIÉRARCHIQUE */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <FolderTree size={16} /> Vue hiérarchique
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                {units.length} unité{units.length > 1 ? 's' : ''} racine
              </span>
            </div>
            
            <div className="divide-y divide-slate-100">
              {units.length > 0 ? (
                renderUnitTree(units)
              ) : (
                <div className="p-20 text-center text-slate-400">
                  <Building2 size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-black uppercase italic text-sm">Aucune unité organisée</p>
                  <p className="text-xs mt-2">Créez votre première unité organique</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ÉDITION */}
      {isEditModalOpen && selectedUnit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black uppercase italic text-slate-800 flex items-center gap-3">
                <Edit3 className="text-amber-500" size={24} />
                Modifier l&apos;unité
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nom</label>
                <input 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"
                  value={formData.OU_Name}
                  onChange={(e) => setFormData({...formData, OU_Name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Type</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold outline-none"
                    value={formData.OU_TypeId}
                    onChange={(e) => setFormData({...formData, OU_TypeId: e.target.value})}
                  >
                    {unitTypes.map(t => (
                      <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Site</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold outline-none"
                    value={formData.OU_SiteId}
                    onChange={(e) => setFormData({...formData, OU_SiteId: e.target.value})}
                  >
                    {sites.map(s => (
                      <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Parent</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold outline-none"
                  value={formData.OU_ParentId}
                  onChange={(e) => setFormData({...formData, OU_ParentId: e.target.value})}
                >
                  <option value="">-- Aucun --</option>
                  {units.map(flattenUnits).flat().filter((u: any) => u.OU_Id !== selectedUnit.OU_Id).map((u: any) => (
                    <option key={u.OU_Id} value={u.OU_Id}>{u.OU_Name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 rounded-xl border border-slate-200 font-black uppercase text-[11px] text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase text-[11px] shadow-lg flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ARCHIVAGE */}
      {isDeleteModalOpen && selectedUnit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Archive size={32} className="text-red-600" />
            </div>
            
            <h2 className="text-2xl font-black uppercase italic text-slate-800 mb-2">
              Archiver l&apos;unité ?
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              <strong>{selectedUnit.OU_Name}</strong> sera désactivée et retirée de l&apos;organigramme actif.
              <br /><br />
              <span className="text-red-600 font-bold text-xs uppercase">
                Attention : Cette action est impossible si des sous-unités ou collaborateurs y sont encore rattachés.
              </span>
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-4 rounded-xl border border-slate-200 font-black uppercase text-[11px] text-slate-600 hover:bg-slate-50 transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={handleArchive}
                disabled={submitting}
                className="flex-1 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[11px] shadow-lg flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Archive size={16} />}
                Confirmer l&apos;archivage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DÉTAILS */}
      {isDetailModalOpen && selectedUnit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedUnit.OU_Type?.OUT_Label}</span>
                <h2 className="text-2xl font-black uppercase italic text-slate-800">{selectedUnit.OU_Name}</h2>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Site</span>
                  <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <MapPin size={14} className="text-blue-500" />
                    {selectedUnit.OU_Site?.S_Name || 'Non défini'}
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Parent</span>
                  <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <FolderTree size={14} className="text-slate-400" />
                    {selectedUnit.OU_Parent?.OU_Name || 'Racine'}
                  </span>
                </div>
              </div>

              {/* Collaborateurs */}
              <div>
                <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest mb-4 flex items-center gap-2">
                  <Users size={14} /> 
                  Collaborateurs rattachés ({selectedUnit._count?.OU_Users || 0})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {selectedUnit.OU_Users && selectedUnit.OU_Users.length > 0 ? (
                    selectedUnit.OU_Users.map((user) => (
                      <div key={user.U_Id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {user.U_FirstName?.[0]}{user.U_LastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {user.U_FirstName} {user.U_LastName}
                          </p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">{user.U_Role}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic text-center py-8">Aucun collaborateur rattaché</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="pt-4 border-t border-slate-100 flex gap-4 text-[10px] font-bold text-slate-400 uppercase">
                <span>Créée le {new Date(selectedUnit.OU_CreatedAt).toLocaleDateString('fr-FR')}</span>
                <span>•</span>
                <span>{selectedUnit._count?.OU_Children || 0} sous-unités</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper pour aplatir l'arbre dans les selects
function flattenUnits(unit: any): any[] {
  const flat = [unit];
  if (unit.children) {
    unit.children.forEach((child: any) => {
      flat.push(...flattenUnits(child));
    });
  }
  return flat;
}