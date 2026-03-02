//* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : CONFIGURATION DES TYPES D'UNITÉS (ORG-UNIT-TYPES)
 * -------------------------------------------------------------------------
 * RÔLE : Définition des méta-données structurelles pour le SMI.
 * ARCHITECTURE : Zéro NextAuth • Sécurité Token API Client.
 * CONFORMITÉ : ISO 9001:2015 §5.3.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 12:25 GMT
 */

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "@/core/api/api-client";
import {
  AlertTriangle, Edit, Loader2, Network, Plus,
  RefreshCw, Search, Settings, ShieldCheck, Trash2, X,
} from "lucide-react";
import { toast, Toaster } from "sonner";

// --- INTERFACES ---
interface OrgUnitType {
  OUT_Id: string;
  OUT_Label: string;
  OUT_Description?: string | null;
  OUT_IsActive: boolean;
  OUT_CreatedAt: Date | string;
  tenantId: string;
  OUT_Level?: number;
  OUT_Color?: string;
}

export default function OrgUnitsTypePage() {
  const [types, setTypes] = useState<OrgUnitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<OrgUnitType | null>(null);

  const loadTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/org-unit-types");
      const data = res.data?.data || res.data;
      setTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("ÉCHEC DE LECTURE DU REGISTRE ORGANIQUE");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTypes(); }, [loadTypes]);

  const filteredTypes = useMemo(() => {
    return types
      .filter((t) => t.OUT_Label.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => (a.OUT_Level || 0) - (b.OUT_Level || 0));
  }, [types, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm("ALERTE SDE : Révocation définitive ? (Vérification d'intégrité requise)")) return;
    const tid = toast.loading("VÉRIFICATION D'INTÉGRITÉ...");
    try {
      await apiClient.delete(`/org-unit-types/${id}`);
      toast.success("GRADE ORGANIQUE RÉVOQUÉ", { id: tid });
      loadTypes();
    } catch (e) {
      toast.error("RUPTURE : UNITÉS DÉPENDANTES DÉTECTÉES", { id: tid });
    }
  };

  return (
    <div className="ml-0 lg:ml-72 min-h-screen bg-[#0B0F1A] text-white italic font-sans p-8 lg:p-12 selection:bg-purple-500/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter leading-none m-0">
            Classification <span className="text-purple-500">Organique</span>
          </h1>
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.4em] mt-3">
            ISO 9001 §5.3 • Hiérarchie SDE
          </p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <button onClick={loadTypes} className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-white border border-white/5 transition-all cursor-pointer">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="flex-1 sm:flex-none bg-purple-600 hover:bg-white hover:text-purple-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-purple-900/20 cursor-pointer border-none text-white">
            <Plus size={18} strokeWidth={3} /> Nouvelle Définition
          </button>
        </div>
      </header>

      <div className="mb-12 relative max-w-3xl group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input
          className="w-full bg-[#151A2D]/80 border border-white/5 rounded-4xl py-5 pl-16 pr-6 text-xs font-black uppercase italic outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-600 shadow-inner text-white"
          placeholder="Rechercher un niveau, grade, pôle..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-purple-500 mb-6" size={48} />
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.5em] animate-pulse">Sync Mapping...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredTypes.map((type) => (
            <div key={type.OUT_Id} className="bg-[#151A2D]/80 border border-white/5 rounded-[2.5rem] p-8 flex justify-between items-center group hover:border-purple-500/40 hover:bg-[#1a2030] transition-all duration-300 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner border border-white/10 transition-transform group-hover:scale-110" style={{ backgroundColor: `${type.OUT_Color || "#a855f7"}15`, color: type.OUT_Color || "#a855f7" }}>
                  <Network size={28} strokeWidth={2} />
                </div>
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-black uppercase italic text-xl tracking-tighter text-white m-0">{type.OUT_Label}</h3>
                  </div>
                  <div className="inline-block bg-purple-600/10 border border-purple-500/20 px-3 py-1 rounded-lg text-[8px] text-purple-400 font-black italic tracking-widest mt-1">LEVEL {type.OUT_Level || 1}</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 relative z-10">
                <button onClick={() => { setEditingItem(type); setShowModal(true); }} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-purple-400 border border-white/5 transition-all cursor-pointer"><Edit size={16} /></button>
                <button onClick={() => handleDelete(type.OUT_Id)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 border border-white/5 transition-all cursor-pointer"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}

          {!loading && filteredTypes.length === 0 && (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-white/10 rounded-[3rem] bg-white/5">
              <Network size={48} className="mx-auto mb-4 text-slate-600" />
              <p className="font-black uppercase italic tracking-[0.3em] text-slate-500 text-xs">Néant Organique</p>
            </div>
          )}
        </div>
      )}

      {showModal && <OrgUnitModal item={editingItem} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); loadTypes(); }} />}
    </div>
  );
}

function OrgUnitModal({ item, onClose, onSuccess }: { item: OrgUnitType | null; onClose: () => void; onSuccess: () => void; }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    OUT_Label: item?.OUT_Label || "", OUT_Level: item?.OUT_Level ?? 1,
    OUT_Description: item?.OUT_Description || "", OUT_Color: item?.OUT_Color || "#a855f7",
    OUT_IsActive: item?.OUT_IsActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const tid = toast.loading("SCELLAGE EN COURS...");
    try {
      if (item) await apiClient.patch(`/org-unit-types/${item.OUT_Id}`, form);
      else await apiClient.post("/org-unit-types", form);
      toast.success(item ? "MISE À JOUR RÉUSSIE" : "NOUVELLE DÉFINITION DÉPLOYÉE", { id: tid });
      onSuccess();
    } catch (error) {
      toast.error("ERREUR D'ÉCRITURE MATRICIELLE", { id: tid });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 lg:p-6 animate-in fade-in duration-300">
      <div className="bg-[#0F172A] border border-purple-500/20 rounded-[3rem] max-w-2xl w-full p-8 lg:p-12 shadow-2xl relative overflow-hidden text-left">
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-purple-600/20 text-purple-500 rounded-2xl shadow-inner border border-purple-500/30"><Settings size={28} /></div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white m-0">{item ? "Édition" : "Déploiement"} <span className="text-purple-500">Unité</span></h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors cursor-pointer border-none bg-transparent"><X size={32} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 italic relative z-10">
          <div>
            <label className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] ml-4">Désignation du Grade *</label>
            <input required className="w-full mt-2 bg-black/40 border border-white/10 p-5 rounded-2xl text-sm font-black uppercase text-white outline-none focus:border-purple-500 transition-all placeholder:text-slate-700" value={form.OUT_Label} onChange={(e) => setForm({ ...form, OUT_Label: e.target.value.toUpperCase() })} placeholder="EX: DIRECTION, SERVICE..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] ml-4">Importance (1-10) *</label>
              <input type="number" min="1" max="10" required className="w-full mt-2 bg-black/40 border border-white/10 p-5 rounded-2xl text-sm font-black text-white outline-none focus:border-purple-500 transition-all" value={form.OUT_Level} onChange={(e) => setForm({ ...form, OUT_Level: parseInt(e.target.value) || 1 })} />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] ml-4">Code Couleur</label>
              <div className="flex gap-4 mt-2">
                <input type="color" className="w-16 h-16 rounded-2xl cursor-pointer bg-transparent border-none p-0" value={form.OUT_Color} onChange={(e) => setForm({ ...form, OUT_Color: e.target.value })} />
                <input className="flex-1 bg-black/40 border border-white/10 p-5 rounded-2xl text-xs uppercase font-black text-white outline-none text-center" value={form.OUT_Color} onChange={(e) => setForm({ ...form, OUT_Color: e.target.value })} />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] ml-4">Périmètre (Optionnel)</label>
            <textarea rows={3} className="w-full mt-2 bg-black/40 border border-white/10 p-5 rounded-2xl text-xs font-bold text-white outline-none focus:border-purple-500 transition-all resize-none" placeholder="Responsabilités..." value={form.OUT_Description} onChange={(e) => setForm({ ...form, OUT_Description: e.target.value })} />
          </div>

          <button type="submit" disabled={saving} className="w-full py-6 bg-purple-600 hover:bg-white hover:text-purple-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer border-none mt-4">
            {saving ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={18} /> Sceller dans le Registre</>}
          </button>
        </form>
      </div>
    </div>
  );
}