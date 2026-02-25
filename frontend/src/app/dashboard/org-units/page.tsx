/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Layers, Plus, Search, RefreshCw, Edit3, Building2,
  GitBranch, Activity, Fingerprint, Save, X, Loader2, ShieldCheck,
  LayoutGrid, MapPin, Database, ChevronRight, Archive, EyeOff, CheckCircle
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { cn } from '@/core/utils/cn';
import { toast, Toaster } from 'sonner';
import type { OrgUnit, Site, OrgUnitType } from '@/types/elite-sde';

// ==========================================
// TYPES STRICTS (CONFORME PRISMA)
// ==========================================

interface OrgUnitWithRelations extends OrgUnit {
  OU_Type?: OrgUnitType | null;
  OU_Parent?: OrgUnit | null;
  OU_Site?: Site | null;
}

interface FormData {
  OU_Id: string;
  OU_Name: string;
  OU_Code: string;
  OU_TypeId: string;
  OU_SiteId: string;
  OU_ParentId: string;
  OU_IsActive: boolean;
}

// ==========================================
// PAGE PRINCIPALE - CRUD INTÉGRAL & ARCHIVAGE
// ==========================================

export default function OrgUnitsPage() {
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [types, setTypes] = useState<OrgUnitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [archiving, setArchiving] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    OU_Id: '',
    OU_Name: '',
    OU_Code: '',
    OU_TypeId: '',
    OU_SiteId: '',
    OU_ParentId: '',
    OU_IsActive: true,
  });

  // ==========================================
  // FETCH DATA (AVEC GESTION DES RELATIONS)
  // ==========================================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [uRes, sRes, tRes] = await Promise.all([
        apiClient.get<{ data: OrgUnit[] }>('/org-units?includeRelations=true'),
        apiClient.get<{ data: Site[] }>('/sites'),
        apiClient.get<{ data: OrgUnitType[] }>('/org-unit-types'),
      ]);
      setUnits(uRes.data.data || []);
      setSites(sRes.data.data || []);
      setTypes(tRes.data.data || []);
    } catch (err) {
      console.error('[ORG_UNITS] Fetch error:', err);
      toast.error('RUPTURE KERNEL SDE');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================
  // HELPERS DE MAPPING RELATIONNEL (SÉCURISÉS)
  // ==========================================

  const getTypeLabel = useCallback((typeId: string | null | undefined): string => {
    if (!typeId) return 'Non typé';
    const type = types.find(t => t.OUT_Id === typeId);
    return type?.OUT_Label || `Type#${typeId.slice(0, 6)}`;
  }, [types]);

  const getParentName = useCallback((parentId: string | null | undefined): string => {
    if (!parentId) return 'RACINE';
    const parent = units.find(u => u.OU_Id === parentId);
    return parent?.OU_Name || `Parent#${parentId.slice(0, 6)}`;
  }, [units]);

  const getSiteName = useCallback((siteId: string | null | undefined): string => {
    if (!siteId) return 'Non affecté';
    const site = sites.find(s => s.S_Id === siteId);
    return site?.S_Name || `Site#${siteId.slice(0, 6)}`;
  }, [sites]);

  // ==========================================
  // FILTRAGE & TRI OPTIMISÉS
  // ==========================================

  const filteredUnits = useMemo(() => {
    return units.filter(u => {
      const matchesSearch = 
        u.OU_Name?.toLowerCase().includes(search.toLowerCase()) ||
        u.OU_Code?.toLowerCase().includes(search.toLowerCase());
      
      const matchesArchived = showArchived ? true : u.OU_IsActive;
      
      return matchesSearch && matchesArchived;
    }).sort((a, b) => a.OU_Name.localeCompare(b.OU_Name));
  }, [units, search, showArchived]);

  // ==========================================
  // CRUD : CREATE / UPDATE
  // ==========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.OU_Name.trim() || !formData.OU_TypeId || !formData.OU_SiteId) {
      toast.error('Champs obligatoires manquants');
      return;
    }
    
    setSubmitting(true);
    try {
      const isEdit = !!formData.OU_Id;

      // 🛡️ PAYLOAD STRICT (conforme DTO Prisma)
      const payload = {
        OU_Name: formData.OU_Name.trim().toUpperCase(),
        OU_Code: formData.OU_Code.trim().toUpperCase(),
        OU_TypeId: formData.OU_TypeId,
        OU_SiteId: formData.OU_SiteId,
        OU_ParentId: formData.OU_ParentId && formData.OU_ParentId !== '' ? formData.OU_ParentId : null,
        OU_IsActive: formData.OU_IsActive,
      };

      if (isEdit) {
        await apiClient.patch(`/org-units/${formData.OU_Id}`, payload);
        toast.success('UNITÉ MODIFIÉE');
      } else {
        await apiClient.post('/org-units', payload);
        toast.success('UNITÉ CRÉÉE');
      }

      setShowEditor(false);
      setFormData({
        OU_Id: '',
        OU_Name: '',
        OU_Code: '',
        OU_TypeId: '',
        OU_SiteId: '',
        OU_ParentId: '',
        OU_IsActive: true,
      });
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'ERREUR VALIDATION MATRIX';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // CRUD : ARCHIVAGE (PAS DE SUPPRESSION)
  // ==========================================

  const handleArchive = async (unitId: string, currentStatus: boolean) => {
    if (archiving === unitId) return;
    
    const newStatus = !currentStatus;
    if (newStatus) {
      // Réactiver : pas de confirmation requise
      await toggleArchive(unitId, newStatus);
      return;
    }

    // Archiver : confirmation obligatoire
    if (!confirm(`ARCHIVAGE DÉFINITIF\n\nL'unité sera désactivée mais conservée pour audit.\nConfirmer l'archivage ?`)) {
      return;
    }

    await toggleArchive(unitId, newStatus);
  };

  const toggleArchive = async (unitId: string, newStatus: boolean) => {
    setArchiving(unitId);
    try {
      await apiClient.patch(`/org-units/${unitId}/archive`, { 
        OU_IsActive: newStatus 
      });
      
      toast.success(newStatus ? 'UNITÉ RÉACTIVÉE' : 'UNITÉ ARCHIVÉE');
      fetchData();
    } catch (err: any) {
      toast.error('ÉCHEC ARCHIVAGE');
    } finally {
      setArchiving(null);
    }
  };

  // ==========================================
  // UI : ÉDITEUR COMPLET (CRUD)
  // ==========================================

  const openEditor = (unit?: OrgUnit) => {
    if (unit) {
      setFormData({
        OU_Id: unit.OU_Id,
        OU_Name: unit.OU_Name || '',
        OU_Code: unit.OU_Code || '',
        OU_TypeId: unit.OU_TypeId || '',
        OU_SiteId: unit.OU_SiteId || '',
        OU_ParentId: unit.OU_ParentId || '',
        OU_IsActive: unit.OU_IsActive,
      });
    } else {
      setFormData({
        OU_Id: '',
        OU_Name: '',
        OU_Code: '',
        OU_TypeId: '',
        OU_SiteId: '',
        OU_ParentId: '',
        OU_IsActive: true,
      });
    }
    setShowEditor(true);
  };

  // ==========================================
  // LAYOUT 100% VIEWPORT (ZERO SCROLL GLOBAL)
  // ==========================================

  if (loading) {
    return (
      <div className="fixed inset-0 ml-72 flex items-center justify-center bg-[#0B0F1A] text-blue-500">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 ml-72 flex flex-col bg-[#0B0F1A] text-white italic font-sans overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE (FIXE) */}
      <header className="h-24 border-b border-white/10 flex justify-between items-center px-10 shrink-0 bg-[#0B0F1A]/80 backdrop-blur-xl z-20">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black uppercase tracking-tighter m-0 flex items-center gap-3">
              <Layers className="text-blue-500" size={32} /> Structure <span className="text-blue-500">Organique</span>
            </h1>
            <span className="bg-blue-500/10 text-blue-500 text-[8px] font-black px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">PWA Active</span>
          </div>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] m-0 italic mt-1">
            ISO 9001 §5.3 • Matrice de Responsabilités • {units.filter(u => u.OU_IsActive).length} unités actives
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative group w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SCANNER LA MATRICE..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 text-[11px] font-black uppercase italic outline-none focus:border-blue-600 transition-all text-white placeholder:text-slate-600"
            />
          </div>
          
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={cn(
              "p-3 rounded-xl border transition-all flex items-center gap-2 text-[9px] font-black uppercase",
              showArchived 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                : "bg-white/5 border-white/10 text-slate-400 hover:text-emerald-400"
            )}
            aria-label={showArchived ? "Masquer archivés" : "Voir archivés"}
          >
            {showArchived ? <EyeOff size={16} /> : <Archive size={16} />}
            {showArchived ? 'ARCHIVÉS VISIBLES' : 'VOIR ARCHIVÉS'}
          </button>
          
          <button
            onClick={() => openEditor()}
            className="bg-blue-600 hover:bg-white hover:text-blue-600 px-8 py-3 rounded-2xl text-[10px] font-black uppercase italic transition-all flex items-center gap-3 shadow-2xl shadow-blue-600/30 cursor-pointer active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> Nouvelle Unité
          </button>
          
          <button
            onClick={fetchData}
            className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            aria-label="Rafraîchir les données"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* 📊 KPI BAR (FIXE) */}
      <div className="px-10 py-6 grid grid-cols-4 gap-6 shrink-0 bg-[#0B0F1A] border-b border-white/5">
        <KPICard 
          label="Unités Actives" 
          value={units.filter(u => u.OU_IsActive).length} 
          icon={<LayoutGrid size={16} />} 
          color="blue" 
        />
        <KPICard 
          label="Sites Actifs" 
          value={sites.filter(s => s.S_IsActive).length} 
          icon={<MapPin size={16} />} 
          color="emerald" 
        />
        <KPICard 
          label="Typologies" 
          value={types.filter(t => t.OUT_IsActive).length} 
          icon={<Layers size={16} />} 
          color="indigo" 
        />
        <KPICard 
          label="Hiérarchie Intacte" 
          value={`${Math.round(units.filter(u => u.OU_ParentId || u.OU_ParentId === null).length / units.length * 100)}%`} 
          icon={<GitBranch size={16} />} 
          color="violet" 
        />
      </div>

      {/* 📊 TABLEAU PRINCIPAL (AUTO-ADAPTATIF - ZERO SCROLL GLOBAL) */}
      <main className="flex-1 overflow-hidden px-10 py-6">
        <div className="h-full bg-[#151A2D] border border-white/5 rounded-[3rem] overflow-hidden flex flex-col relative shadow-4xl group">
          <div className="absolute top-0 right-0 p-20 opacity-[0.01] pointer-events-none rotate-12 group-hover:opacity-[0.03] transition-opacity duration-1000">
            <ShieldCheck size={500} />
          </div>

          {/* TABLEAU SCROLLABLE INTERNE UNIQUEMENT */}
          <div className="h-full overflow-hidden flex flex-col">
            <div className="overflow-y-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse min-w-325">
                <thead className="sticky top-0 bg-[#151A2D]/95 backdrop-blur-md z-30 border-b border-white/10">
                  <tr className="text-[9px] text-slate-500 uppercase font-black italic tracking-widest">
                    <th className="px-10 py-6 whitespace-nowrap">Désignation Organique</th>
                    <th className="px-10 py-6 whitespace-nowrap">Code SDE</th>
                    <th className="px-10 py-6 whitespace-nowrap">Typologie</th>
                    <th className="px-10 py-6 whitespace-nowrap">Site</th>
                    <th className="px-10 py-6 whitespace-nowrap">Parent Hiérarchique</th>
                    <th className="px-10 py-6 whitespace-nowrap text-right">Statut</th>
                    <th className="px-10 py-6 whitespace-nowrap text-right">Pilotage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {filteredUnits.map((u) => (
                    <tr 
                      key={u.OU_Id} 
                      className={cn(
                        "group transition-all",
                        u.OU_IsActive 
                          ? "hover:bg-blue-600/5" 
                          : "bg-zinc-900/50 opacity-70 hover:bg-zinc-900/40"
                      )}
                    >
                      <td className="px-10 py-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "p-3 rounded-2xl border transition-all duration-500",
                            u.OU_IsActive 
                              ? "bg-blue-600/10 text-blue-500 border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white" 
                              : "bg-zinc-800 text-zinc-500 border-zinc-700"
                          )}>
                            <Building2 size={18} />
                          </div>
                          <span className={cn(
                            "font-black uppercase italic tracking-tight text-sm",
                            u.OU_IsActive ? "text-white" : "text-zinc-400 line-through"
                          )}>
                            {u.OU_Name}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-4">
                        <span className={cn(
                          "text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-lg border italic",
                          u.OU_IsActive 
                            ? "bg-blue-500/5 text-blue-500 border-blue-500/10" 
                            : "bg-zinc-800 text-zinc-500 border-zinc-700"
                        )}>
                          {u.OU_Code || 'N/A'}
                        </span>
                      </td>
                      <td className="px-10 py-4">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase text-slate-400 italic">
                          {getTypeLabel(u.OU_TypeId)}
                        </span>
                      </td>
                      <td className="px-10 py-4">
                        <span className="px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-[9px] font-black uppercase text-emerald-400 italic">
                          {getSiteName(u.OU_SiteId)}
                        </span>
                      </td>
                      <td className="px-10 py-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-300 italic">
                          <GitBranch size={14} className="text-slate-600" />
                          {getParentName(u.OU_ParentId)}
                        </div>
                      </td>
                      <td className="px-10 py-4 text-right">
                        <span className={cn(
                          "px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                          u.OU_IsActive 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                        )}>
                          {u.OU_IsActive ? 'ACTIF' : 'ARCHIVÉ'}
                        </span>
                      </td>
                      <td className="px-10 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditor(u)}
                            className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-blue-500 border border-white/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg active:scale-90"
                            aria-label={`Éditer ${u.OU_Name}`}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleArchive(u.OU_Id, u.OU_IsActive)}
                            disabled={archiving === u.OU_Id}
                            className={cn(
                              "p-3 rounded-xl transition-all opacity-0 group-hover:opacity-100",
                              u.OU_IsActive 
                                ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20" 
                                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                            )}
                            aria-label={u.OU_IsActive ? `Archiver ${u.OU_Name}` : `Réactiver ${u.OU_Name}`}
                          >
                            {archiving === u.OU_Id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : u.OU_IsActive ? (
                              <Archive size={16} />
                            ) : (
                              <CheckCircle size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUnits.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-10 py-12 text-center text-slate-500 italic">
                        {search ? `Aucune unité trouvée pour "${search}"` : 'Aucune unité organique configurée'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* 🏁 FOOTER SCELLÉ (FIXE) */}
      <footer className="h-14 border-t border-white/5 flex justify-between items-center px-10 opacity-40 italic shrink-0 bg-[#0B0F1A]">
        <div className="flex items-center gap-5">
          <Fingerprint size={28} className="text-blue-600" />
          <div className="flex flex-col leading-none">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] m-0 mb-1 text-white">
              Organic Matrix Engine • Archivage RGPD/ANSD Conforme
            </p>
            <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest m-0 leading-none">
              SDE Elite Kernel • ISO 9001:2015 §7.1.2 • Aucune donnée supprimée
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Database size={20} className="text-blue-600" />
          <Activity size={24} className="text-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black uppercase bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full border border-blue-600/20">
            {units.filter(u => u.OU_IsActive).length} / {units.length}
          </span>
        </div>
      </footer>

      {/* 🛠️ DRAWER ÉDITION (OVERLAY - ANIMÉ) */}
      {showEditor && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setShowEditor(false)}
        >
          <div
            className="w-120 h-full bg-[#0B0F1A] border-l border-white/10 p-12 flex flex-col gap-10 shadow-5xl animate-in slide-in-from-right duration-500 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -bottom-20 -left-20 opacity-[0.02] rotate-12 pointer-events-none">
              <Database size={300} />
            </div>

            <header className="flex justify-between items-center shrink-0">
              <div className="flex flex-col">
                <h2 className="text-3xl font-black uppercase italic m-0 tracking-tighter">
                  {formData.OU_Id ? 'Modifier' : 'Créer'} <span className="text-blue-500">Unité Organique</span>
                </h2>
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic mt-2 leading-none">
                  {formData.OU_Id ? 'Mise à jour hiérarchique' : 'Nouveau segment structurel'} §5.3
                </p>
              </div>
              <button
                onClick={() => setShowEditor(false)}
                className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-red-500 transition-all border border-white/10 cursor-pointer shadow-xl"
                aria-label="Fermer l'éditeur"
              >
                <X size={24} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-8 overflow-y-auto pr-4 custom-scrollbar relative z-10">
              <SDEField
                label="Libellé de l'unité"
                value={formData.OU_Name}
                onChange={(v: string) => setFormData({ ...formData, OU_Name: v.toUpperCase() })}
                placeholder="EX: DIRECTION QUALITÉ"
                required
              />
              <SDEField
                label="Code Structure (SDE)"
                value={formData.OU_Code}
                onChange={(v: string) => setFormData({ ...formData, OU_Code: v.toUpperCase() })}
                placeholder="EX: DQ-01"
                required
              />

              <SDESelect
                label="Typologie Organique"
                value={formData.OU_TypeId}
                onChange={(v: string) => setFormData({ ...formData, OU_TypeId: v })}
                required
              >
                <option value="">SÉLECTIONNER LA TYPOLOGIE...</option>
                {types
                  .filter(t => t.OUT_IsActive)
                  .map((t) => (
                    <option key={t.OUT_Id} value={t.OUT_Id}>
                      {t.OUT_Label.toUpperCase()}
                    </option>
                  ))}
              </SDESelect>

              <SDESelect
                label="Ancrage Géographique (Site)"
                value={formData.OU_SiteId}
                onChange={(v: string) => setFormData({ ...formData, OU_SiteId: v })}
                required
              >
                <option value="">CHOISIR LE SITE...</option>
                {sites
                  .filter(s => s.S_IsActive)
                  .map((s) => (
                    <option key={s.S_Id} value={s.S_Id}>
                      {s.S_Name.toUpperCase()}
                    </option>
                  ))}
              </SDESelect>

              <SDESelect
                label="Rattachement Hiérarchique"
                value={formData.OU_ParentId}
                onChange={(v: string) => setFormData({ ...formData, OU_ParentId: v })}
              >
                <option value="">-- UNITÉ RACINE (NIVEAU 0) --</option>
                {units
                  .filter(u => u.OU_IsActive && u.OU_Id !== formData.OU_Id)
                  .sort((a, b) => a.OU_Name.localeCompare(b.OU_Name))
                  .map((u) => (
                    <option key={u.OU_Id} value={u.OU_Id}>
                      {u.OU_Name.toUpperCase()} {u.OU_Code ? `(${u.OU_Code})` : ''}
                    </option>
                  ))}
              </SDESelect>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.OU_IsActive}
                  onChange={(e) => setFormData({ ...formData, OU_IsActive: e.target.checked })}
                  className="w-5 h-5 rounded bg-white/5 border-white/20 checked:bg-blue-600 checked:border-blue-600 focus:ring-blue-500/30"
                />
                <label htmlFor="isActive" className="text-[9px] font-black uppercase text-slate-300 italic tracking-widest">
                  UNITÉ ACTIVE (décocher pour archiver)
                </label>
              </div>

              <button
                disabled={submitting || !formData.OU_Name.trim() || !formData.OU_TypeId || !formData.OU_SiteId}
                type="submit"
                className="mt-auto bg-blue-600 hover:bg-white hover:text-blue-600 p-6 rounded-[2.5rem] font-black uppercase italic tracking-[0.3em] transition-all flex items-center justify-center gap-4 text-xs shadow-3xl active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : formData.OU_Id ? (
                  <>
                    <Save size={20} /> Mettre à jour
                  </>
                ) : (
                  <>
                    <Plus size={20} /> Créer l&apos;unité
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🎨 STYLES GLOBAUX (OPTIMISÉS) */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(37, 99, 235, 0.2);
          border-radius: 10px;
          border: 1px solid rgba(37, 99, 235, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(37, 99, 235, 0.4);
        }
      `}</style>
    </div>
  );
}

// ==========================================
// COMPOSANTS ATOMIQUES (TYPÉS)
// ==========================================

interface KPICardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'indigo' | 'violet';
}

function KPICard({ label, value, icon, color }: KPICardProps) {
  const colorMap = {
    blue: 'text-blue-500 border-blue-500/10 bg-blue-500/5',
    emerald: 'text-emerald-500 border-emerald-500/10 bg-emerald-500/5',
    indigo: 'text-indigo-500 border-indigo-500/10 bg-indigo-500/5',
    violet: 'text-violet-500 border-violet-500/10 bg-violet-500/5',
  };

  return (
    <div
      className={cn(
        'p-5 rounded-4xl border flex items-center justify-between shadow-2xl transition-all hover:scale-[1.02] duration-300',
        colorMap[color]
      )}
    >
      <div className="flex flex-col">
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</span>
        <span className="text-2xl font-black italic text-white tracking-tighter leading-none">{value}</span>
      </div>
      <div className="p-3 bg-black/20 rounded-2xl">{icon}</div>
    </div>
  );
}

interface SDEFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}

function SDEField({ label, value, onChange, placeholder, required = false }: SDEFieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[9px] font-black text-slate-500 uppercase italic ml-3 tracking-[0.2em]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold italic outline-none focus:border-blue-600 transition-all text-white placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500/30"
      />
    </div>
  );
}

interface SDESelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  children: React.ReactNode;
}

function SDESelect({ label, value, onChange, required = false, children }: SDESelectProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[9px] font-black text-slate-500 uppercase italic ml-3 tracking-[0.2em]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative group">
        <select
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold italic outline-none focus:border-blue-600 transition-all text-white appearance-none cursor-pointer focus:ring-1 focus:ring-blue-500/30"
        >
          {children}
        </select>
        <ChevronRight
          size={18}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:rotate-90 transition-transform"
        />
      </div>
    </div>
  );
}