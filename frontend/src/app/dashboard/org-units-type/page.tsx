/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import apiClient from "@/core/api/api-client";
import {
  CheckCircle, Edit, Loader2, Network, Plus, RefreshCw,
  Search, Settings, Trash2, X, ShieldCheck
} from "lucide-react";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "react-hot-toast";

/**
 * 🛰️ MODULE : CONFIGURATION DES TYPES D'UNITÉS (ORG-UNIT-TYPES)
 * -------------------------------------------------------------------------
 * RÔLE : 
 * Ce module définit les "méta-données" de la structure. Il permet de classer
 * les unités organiques par importance (Level) et par identité visuelle (Color).
 * * LOGIQUE MÉTIER :
 * - ISO 9001 §5.3 : Définition des rôles, responsabilités et autorités.
 * - Le niveau (Level) détermine la profondeur dans l'arborescence.
 * - La suppression est protégée par l'intégrité référentielle du SMI.
 * -------------------------------------------------------------------------
 */

// --- 🏗️ INTERFACES DES DONNÉES ---

interface OrgUnitType {
  OUT_Id: string;
  OUT_Label: string;
  OUT_Level: number; // Niveau hiérarchique (ex: 1 pour DG, 2 pour Direction)
  OUT_Description?: string;
  OUT_Color: string; // Utilisé pour le code couleur sur la carte cartographique
  OUT_IsActive: boolean;
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
   * Récupère la liste des types définis dans le tenant actuel.
   */
  const loadTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/org-unit-types");
      // Gestion de la structure de réponse API (data.data ou data)
      const data = res.data?.data || res.data;
      setTypes(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error("Erreur de synchronisation §5.3 : Échec de lecture");
    } finally {
      setLoading(false);
    }
  }, []);

  // Montage initial
  useEffect(() => { loadTypes(); }, [loadTypes]);

  /**
   * 🔍 MOTEUR DE RECHERCHE & TRI MÉMOÏSÉ
   * Filtre par libellé et trie par niveau hiérarchique croissant.
   */
  const filteredTypes = useMemo(() => {
    return types
      .filter((t) => t.OUT_Label.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => (a.OUT_Level || 0) - (b.OUT_Level || 0));
  }, [types, searchTerm]);

  /**
   * 🗑️ SUPPRESSION AVEC CONTRÔLE D'INTÉGRITÉ
   * L'API refusera la suppression si des unités organiques utilisent ce type.
   */
  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ Confirmation de suppression définitive ? Le système vérifiera l'absence de liens actifs.")) return;
    try {
      await apiClient.delete(`/org-unit-types/${id}`);
      toast.success("Type révoqué avec succès");
      loadTypes(); // Rechargement du flux
    } catch (e) {
      toast.error("Suppression impossible : Des unités organiques dépendent de ce type.");
    }
  };

  return (
    <div className="ml-72 min-h-screen bg-[#0B0F1A] text-white italic font-sans p-8 selection:bg-purple-500/30">
      
      {/* 🔝 HEADER : TITRE ET ACTIONS FLOTTANTES */}
      <header className="flex justify-between items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
            Classification <span className="text-purple-500">Organique</span>
          </h1>
          <p className="text-slate-500 text-sm uppercase font-black tracking-widest mt-2">ISO 9001 §5.3 • Hiérarchie des Autorités</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={loadTypes} 
            className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white border border-white/5 transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => { setEditingItem(null); setShowModal(true); }} 
            className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-black uppercase text-xs flex items-center gap-3 transition-all shadow-lg shadow-purple-900/20 cursor-pointer border-none"
          >
            <Plus size={18} /> Nouvelle Définition
          </button>
        </div>
      </header>

      {/* 🔎 BARRE DE FILTRAGE RAPIDE */}
      <div className="mb-10 relative max-w-2xl group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors" size={20} />
        <input 
          className="w-full bg-[#0F172A] border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-sm font-black uppercase italic outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700 shadow-inner"
          placeholder="Rechercher un niveau, un type, un pôle..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      {/* 📋 LISTE DES TYPES D'UNITÉS */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 italic">
          <Loader2 className="animate-spin text-purple-500 mb-6" size={48} />
          <p className="text-xs font-black uppercase text-slate-500 tracking-[0.4em] animate-pulse">Synchronisation du mapping organique...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredTypes.map((type) => (
            <div 
              key={type.OUT_Id} 
              className="bg-[#0F172A]/60 border border-white/5 rounded-3xl p-8 flex justify-between items-center group hover:border-purple-500/40 hover:bg-[#0F172A] transition-all duration-500 shadow-xl"
            >
              <div className="flex items-center gap-6">
                {/* Visualisation du code couleur SMQ */}
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner border border-white/5 transition-transform group-hover:rotate-6" 
                  style={{ backgroundColor: `${type.OUT_Color}15`, color: type.OUT_Color }}
                >
                  <Network size={32} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-black uppercase italic text-2xl tracking-tight text-white">{type.OUT_Label}</h3>
                    <span className="bg-purple-600/10 border border-purple-500/20 px-3 py-1 rounded-lg text-[10px] text-purple-400 font-black italic tracking-widest shadow-inner">
                      NIVEAU {type.OUT_Level || 0}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-black uppercase italic tracking-tight opacity-70">
                    {type.OUT_Description || "Périmètre non spécifié dans le référentiel."}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <button 
                  onClick={() => { setEditingItem(type); setShowModal(true); }} 
                  className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-purple-400 border border-white/5 hover:bg-purple-500/10 transition-all cursor-pointer"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(type.OUT_Id)} 
                  className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 border border-white/5 hover:bg-red-500/10 transition-all cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          {/* État vide */}
          {!loading && filteredTypes.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-4xl opacity-20">
              <Network size={64} className="mx-auto mb-4" />
              <p className="font-black uppercase italic">Aucun type d&apos;unité répertorié</p>
            </div>
          )}
        </div>
      )}

      {/* 🛸 MODAL DE DÉPLOIEMENT (CREATE/UPDATE) */}
      {showModal && (
        <OrgUnitModal 
          item={editingItem} 
          onClose={() => setShowModal(false)} 
          onSuccess={() => { setShowModal(false); loadTypes(); }} 
        />
      )}
    </div>
  );
}

/**
 * 📟 SOUS-COMPOSANT : FORMULAIRE DE CONFIGURATION
 * Gère l'initialisation ou la modification d'un type d'unité.
 */
function OrgUnitModal({ item, onClose, onSuccess }: { item: OrgUnitType | null; onClose: () => void; onSuccess: () => void; }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    OUT_Label: item?.OUT_Label || "",
    OUT_Level: item?.OUT_Level ?? 1,
    OUT_Description: item?.OUT_Description || "",
    OUT_Color: item?.OUT_Color || "#a855f7",
    OUT_IsActive: item?.OUT_IsActive ?? true,
  });

  /**
   * Action de validation et persistance
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (item) {
        await apiClient.patch(`/org-unit-types/${item.OUT_Id}`, form);
        toast.success("Habilitation type mise à jour");
      } else {
        await apiClient.post("/org-unit-types", form);
        toast.success("Nouveau grade organique déployé");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur critique d'écriture");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-100 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-[#0B0F1A] border border-white/10 rounded-[2.5rem] max-w-xl w-full p-10 shadow-[0_0_100px_rgba(168,85,247,0.15)] relative overflow-hidden text-left">
        
        {/* Décoration Matrix */}
        <div className="absolute top-0 right-0 p-10 opacity-5 -mr-10 -mt-10"><Settings size={150} /></div>

        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-purple-600/20 text-purple-500 rounded-2xl shadow-inner"><Settings size={28} /></div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none text-white">
              {item ? "Édition" : "Déploiement"} <span className="text-purple-500">Unité</span>
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors cursor-pointer border-none bg-transparent"><X size={32} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 italic font-bold relative z-10">
          {/* Libellé de l'entité */}
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest ml-4">Désignation du Grade Organique</label>
            <input 
              required 
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-base font-black uppercase italic text-white outline-none focus:border-purple-500 transition-all shadow-inner"
              value={form.OUT_Label} 
              onChange={(e) => setForm({ ...form, OUT_Label: e.target.value.toUpperCase() })} 
              placeholder="EX: DIRECTION, SERVICE, ATELIER..."
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Niveau Hiérarchique */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest ml-4">Importance (Niveau 1-10)</label>
              <input 
                type="number" min="1" max="10" required 
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-base font-black italic text-white outline-none focus:border-purple-500 transition-all shadow-inner"
                value={form.OUT_Level === null || isNaN(form.OUT_Level) ? "" : form.OUT_Level} 
                onChange={(e) => setForm({ ...form, OUT_Level: parseInt(e.target.value) || 0 })} 
              />
            </div>
            {/* Code Couleur Cartographie */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest ml-4">Identité Visuelle</label>
              <div className="flex gap-4">
                <input 
                  type="color" 
                  className="w-16 h-16 bg-transparent border-none cursor-pointer rounded-xl overflow-hidden" 
                  value={form.OUT_Color} 
                  onChange={(e) => setForm({ ...form, OUT_Color: e.target.value })} 
                />
                <input 
                  className="flex-1 bg-white/5 border border-white/10 p-5 rounded-2xl text-[12px] uppercase font-black text-white outline-none text-center italic" 
                  value={form.OUT_Color} 
                  onChange={(e) => setForm({ ...form, OUT_Color: e.target.value })} 
                />
              </div>
            </div>
          </div>

          {/* Spécification du Périmètre */}
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest ml-4">Périmètre de Responsabilité (§5.3)</label>
            <textarea 
              rows={3} 
              className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl text-sm font-bold italic text-white outline-none focus:border-purple-500 transition-all shadow-inner leading-relaxed resize-none"
              placeholder="Décrire les autorités déléguées à ce type d'unité..."
              value={form.OUT_Description} 
              onChange={(e) => setForm({ ...form, OUT_Description: e.target.value })} 
            />
          </div>

          {/* Bouton de validation Élite */}
          <button 
            type="submit" 
            disabled={saving} 
            className="w-full py-6 bg-purple-600 hover:bg-purple-500 text-white rounded-3xl font-black uppercase text-xs flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(168,85,247,0.3)] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border-none"
          >
            {saving ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20} /> Inscrire dans le Registre</>}
          </button>
        </form>
      </div>
    </div>
  );
}