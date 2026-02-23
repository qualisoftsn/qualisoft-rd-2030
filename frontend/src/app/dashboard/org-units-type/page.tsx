/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : CONFIGURATION DES TYPES D'UNITÉS (ORG-UNIT-TYPES)
 * -------------------------------------------------------------------------
 * RÔLE : Définition des méta-données structurelles pour le SMI.
 * ARCHITECTURE : Multi-Tenant Sovereign Data Environment (SDE).
 * CONFORMITÉ : ISO 9001:2015 §5.3 - Rôles, responsabilités et autorités.
 * RÉFÉRENTIEL : types/elite-sde.ts
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  AlertTriangle,
  Edit,
  Loader2,
  Network,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner"; // Consolidation sur Sonner pour l'écosystème Elite

// --- 🏗️ INTERFACES DES DONNÉES (ALIGNÉES SUR ELITE-SDE.TS) ---

interface OrgUnitType {
  OUT_Id: string;
  OUT_Label: string;
  OUT_Description?: string | null;
  OUT_IsActive: boolean;
  OUT_CreatedAt: Date | string;
  tenantId: string;
  // Note : OUT_Level et OUT_Color doivent être ajoutés au schéma Prisma
  // pour éviter les erreurs 500 lors de la persistance.
  OUT_Level?: number;
  OUT_Color?: string;
}

export default function OrgUnitsTypePage() {
  // --- 📦 ÉTATS DU COCKPIT ---
  const [types, setTypes] = useState<OrgUnitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<OrgUnitType | null>(null);

  /**
   * 📡 SYNCHRONISATION AVEC LE NOYAU MASTER
   * @function loadTypes
   * @description Récupère les grades organiques rattachés au tenantId actif.
   * L'isolation est assurée par le header d'authentification.
   */
  const loadTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/org-unit-types");
      const data = res.data?.data || res.data;
      setTypes(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("❌ Rupture de synchronisation §5.3:", error);
      toast.error("Échec de lecture du registre organique.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Déploiement initial au montage
  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  /**
   * 🔍 MOTEUR DE RECHERCHE & TRI HIÉRARCHIQUE
   * @description Filtre les résultats et assure le tri par importance (Level).
   */
  const filteredTypes = useMemo(() => {
    return types
      .filter((t) =>
        t.OUT_Label.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => (a.OUT_Level || 0) - (b.OUT_Level || 0));
  }, [types, searchTerm]);

  /**
   * 🗑️ RÉVOCATION AVEC CONTRÔLE D'INTÉGRITÉ
   * @function handleDelete
   * @description Supprime une définition si aucune OrgUnit n'y est rattachée.
   */
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "⚠️ Confirmation de suppression définitive ? Le Kernel vérifiera l'absence de liens actifs dans le SMI.",
      )
    )
      return;

    const toastId = toast.loading("Vérification d'intégrité...");
    try {
      await apiClient.delete(`/org-unit-types/${id}`);
      toast.success("Grade organique révoqué avec succès", { id: toastId });
      loadTypes();
    } catch (e: any) {
      toast.error(
        "Rupture : Des unités organiques dépendent encore de ce type.",
        { id: toastId },
      );
    }
  };

  return (
    <div className="ml-72 min-h-screen bg-[#0B0F1A] text-white italic font-sans p-8 selection:bg-purple-500/30">
      {/* 🔝 HEADER : PILOTAGE STRATÉGIQUE */}
      <header className="flex justify-between items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
            Classification <span className="text-purple-500">Organique</span>
          </h1>
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.4em] mt-3 opacity-70">
            ISO 9001 §5.3 • Matrice des Autorités & Hiérarchie SDE
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={loadTypes}
            className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-white border border-white/5 transition-all active:scale-95 cursor-pointer"
            title="Actualiser le registre"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowModal(true);
            }}
            className="bg-purple-600 hover:bg-purple-500 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all shadow-2xl shadow-purple-900/20 cursor-pointer border-none"
          >
            <Plus size={18} strokeWidth={3} /> Nouvelle Définition
          </button>
        </div>
      </header>

      {/* 🔎 TERMINAL DE RECHERCHE */}
      <div className="mb-12 relative max-w-3xl group">
        <Search
          className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors"
          size={20}
        />
        <input
          className="w-full bg-[#0F172A]/80 border border-white/5 rounded-3xl py-6 pl-16 pr-6 text-sm font-black uppercase italic outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700 shadow-inner"
          placeholder="Rechercher un niveau, un grade, un pôle de responsabilité..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 📋 REGISTRE DES GRADES ORGANIQUES */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="animate-spin text-purple-500 mb-6" size={48} />
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.5em] animate-pulse">
            Synchronisation du mapping organique...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredTypes.map((type) => (
            <div
              key={type.OUT_Id}
              className="bg-[#0F172A]/60 border border-white/5 rounded-[2.5rem] p-8 flex justify-between items-center group hover:border-purple-500/40 hover:bg-[#0F172A] transition-all duration-500 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center gap-8 relative z-10">
                {/* Visualisation de l'identité visuelle */}
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl border border-white/5 transition-transform group-hover:rotate-6 group-hover:scale-110 duration-500"
                  style={{
                    backgroundColor: `${type.OUT_Color || "#a855f7"}15`,
                    color: type.OUT_Color || "#a855f7",
                  }}
                >
                  <Network size={36} strokeWidth={1.5} />
                </div>

                <div className="text-left space-y-2">
                  <div className="flex items-center gap-4">
                    <h3 className="font-black uppercase italic text-2xl tracking-tighter text-white">
                      {type.OUT_Label}
                    </h3>
                    <div className="bg-purple-600/10 border border-purple-500/20 px-4 py-1.5 rounded-full text-[9px] text-purple-400 font-black italic tracking-widest">
                      LEVEL {type.OUT_Level || 1}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase italic tracking-tight opacity-70 leading-relaxed max-w-sm">
                    {type.OUT_Description ||
                      "Périmètre de responsabilité non spécifié dans le registre SDE."}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 relative z-10">
                <button
                  onClick={() => {
                    setEditingItem(type);
                    setShowModal(true);
                  }}
                  className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-purple-400 border border-white/5 hover:bg-purple-500/10 transition-all cursor-pointer"
                  title="Modifier la définition"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(type.OUT_Id)}
                  className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-red-500 border border-white/5 hover:bg-red-500/10 transition-all cursor-pointer"
                  title="Révoquer le type"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          {/* État néant */}
          {!loading && filteredTypes.length === 0 && (
            <div className="col-span-full py-32 text-center border-4 border-dashed border-white/5 rounded-[4rem] opacity-20">
              <Network size={64} className="mx-auto mb-6" />
              <p className="font-black uppercase italic tracking-[0.3em]">
                Néant Organique Détecté
              </p>
            </div>
          )}
        </div>
      )}

      {/* 🛸 MODAL DE DÉPLOIEMENT (CREATE/UPDATE) */}
      {showModal && (
        <OrgUnitModal
          item={editingItem}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadTypes();
          }}
        />
      )}
    </div>
  );
}

/**
 * 📟 SOUS-COMPOSANT : FORMULAIRE DE CONFIGURATION (MODAL)
 * @description Gère l'initialisation ou la modification d'un grade organique.
 */
function OrgUnitModal({
  item,
  onClose,
  onSuccess,
}: {
  item: OrgUnitType | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    OUT_Label: item?.OUT_Label || "",
    OUT_Level: item?.OUT_Level ?? 1,
    OUT_Description: item?.OUT_Description || "",
    OUT_Color: item?.OUT_Color || "#a855f7",
    OUT_IsActive: item?.OUT_IsActive ?? true,
  });

  /**
   * 💾 PROTOCOLE DE PERSISTANCE
   * @description Nettoie et transmet les données au Kernel.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      /**
       * 🛡️ SÉCURITÉ SDE : Nettoyage du payload
       * Note : Si Level et Color ne sont pas dans Prisma, ils seront ignorés par le service backend
       * pour éviter le crash 500, ou fusionnés dans la description.
       */
      const payload = { ...form };

      if (item) {
        await apiClient.patch(`/org-unit-types/${item.OUT_Id}`, payload);
        toast.success("Habilitation organique mise à jour.");
      } else {
        await apiClient.post("/org-unit-types", payload);
        toast.success("Nouveau grade organique déployé dans le SDE.");
      }
      onSuccess();
    } catch (error: any) {
      console.error("❌ Erreur d'écriture OrgUnitType:", error);
      const msg =
        error.response?.data?.message || "Erreur critique d'écriture Matrix.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-[#0B0F1A] border border-white/10 rounded-[3.5rem] max-w-2xl w-full p-12 shadow-[0_0_150px_rgba(168,85,247,0.1)] relative overflow-hidden text-left">
        {/* Décoration SDE */}
        <div className="absolute top-0 right-0 p-12 opacity-5 -mr-16 -mt-16 rotate-12">
          <Settings size={200} />
        </div>

        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-purple-600/20 text-purple-500 rounded-3xl shadow-inner border border-purple-500/20">
              <Settings size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none text-white">
                {item ? "Édition" : "Déploiement"}{" "}
                <span className="text-purple-500">Unité</span>
              </h2>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-2">
                Configuration Hiérarchique §5.3
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={40} strokeWidth={1} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-10 italic font-bold relative z-10"
        >
          {/* Libellé du Grade (OUT_Label) */}
          <div className="space-y-3">
            <label className="text-[10px] text-slate-500 uppercase tracking-[0.3em] ml-6">
              Désignation du Grade Organique *
            </label>
            <input
              required
              className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl text-lg font-black uppercase italic text-white outline-none focus:border-purple-500 focus:shadow-[0_0_40px_rgba(168,85,247,0.1)] transition-all shadow-inner"
              value={form.OUT_Label}
              onChange={(e) =>
                setForm({ ...form, OUT_Label: e.target.value.toUpperCase() })
              }
              placeholder="EX: DIRECTION, SERVICE, ATELIER..."
            />
          </div>

          <div className="grid grid-cols-2 gap-10">
            {/* Niveau Hiérarchique (OUT_Level) */}
            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 uppercase tracking-[0.3em] ml-6 flex items-center gap-2">
                Importance <span className="text-[8px] opacity-40">(1-10)</span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                required
                className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl text-xl font-black italic text-white outline-none focus:border-purple-500 transition-all shadow-inner"
                value={form.OUT_Level}
                onChange={(e) =>
                  setForm({ ...form, OUT_Level: parseInt(e.target.value) || 1 })
                }
              />
            </div>

            {/* Code Couleur (OUT_Color) */}
            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 uppercase tracking-[0.3em] ml-6">
                Code Couleur Cartographique
              </label>
              <div className="flex gap-4">
                <div className="relative w-20 h-20 overflow-hidden rounded-3xl border border-white/10">
                  <input
                    type="color"
                    className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer bg-transparent border-none"
                    value={form.OUT_Color}
                    onChange={(e) =>
                      setForm({ ...form, OUT_Color: e.target.value })
                    }
                  />
                </div>
                <input
                  className="flex-1 bg-white/5 border border-white/10 p-6 rounded-3xl text-sm uppercase font-black text-white outline-none text-center italic shadow-inner tracking-widest"
                  value={form.OUT_Color}
                  onChange={(e) =>
                    setForm({ ...form, OUT_Color: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Description / Périmètre (OUT_Description) */}
          <div className="space-y-3">
            <label className="text-[10px] text-slate-500 uppercase tracking-[0.3em] ml-6">
              Périmètre de Responsabilité §5.3
            </label>
            <textarea
              rows={4}
              className="w-full bg-white/5 border border-white/10 p-8 rounded-4xl text-sm font-bold italic text-white outline-none focus:border-purple-500 transition-all shadow-inner leading-relaxed resize-none"
              placeholder="Décrire les autorités et responsabilités déléguées à ce type d'unité..."
              value={form.OUT_Description}
              onChange={(e) =>
                setForm({ ...form, OUT_Description: e.target.value })
              }
            />
          </div>

          {/* Alertes de conformité Prisma */}
          <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl flex items-start gap-4">
            <AlertTriangle className="text-amber-500 shrink-0" size={20} />
            <p className="text-[9px] font-bold text-amber-500/80 uppercase leading-relaxed italic">
              Note : L&apos;ID du Tenant est injecté automatiquement.
              Assurez-vous que les champs Level et Color sont présents dans
              notre schéma Prisma pour éviter les erreurs de persistance.
            </p>
          </div>

          {/* Bouton de validation Élite */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-8 bg-purple-600 hover:bg-purple-500 text-white rounded-4xl font-black uppercase text-xs tracking-[0.4em] flex items-center justify-center gap-4 shadow-3xl shadow-purple-600/20 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer border-none"
          >
            {saving ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <ShieldCheck size={22} /> Inscrire dans le Registre SMI
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
