/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// NOM DU FICHIER : frontend/app/dashboard/reclamations/page.tsx
/**
 * 🛠️ FONCTION : Dashboard de monitoring du registre des réclamations.
 * RÔLE : Centralise les flux entrants, gère le filtrage dynamique et
 * l'accès rapide aux dossiers de pilotage opérationnel.
 */

"use client";

import Sidebar from "@/app/dashboard/sidebar";
import apiClient from "@/core/api/api-client";
import { Eye, Loader2, Plus, Search, X } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

// Définition de l'interface stricte pour l'intégrité des données SMI
interface Reclamation {
  REC_Id: string;
  REC_Reference: string;
  REC_Object: string;
  REC_Status: string;
  REC_Processus?: { PR_Libelle: string };
  REC_Tier?: { TR_Name: string };
  REC_Description: string;
  REC_SolutionProposed?: string;
  REC_Deadline?: string;
}

export default function ReclamationsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isSuperAdmin = user?.U_Role === "SUPER_ADMIN";

  // --- ÉTATS DE GESTION DES FLUX ---
  const [recs, setRecs] = useState<Reclamation[]>([]);
  const [dataSources, setDataSources] = useState({ processus: [], tiers: [] });
  const [selectedRec, setSelectedRec] = useState<Reclamation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * 📡 SYNCHRONISATION SMI
   * Agrégation des réclamations, des processus métiers et de la base tiers (Clients/Fournisseurs).
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resRec, resProcs, resTiers] = await Promise.all([
        apiClient.get("/reclamations"),
        apiClient.get("/processus"),
        apiClient.get("/tiers"),
      ]);
      // Extraction sécurisée des données selon le format de réponse API
      setRecs(resRec.data?.data || resRec.data || []);
      setDataSources({
        processus: resProcs.data?.data || resProcs.data || [],
        tiers: resTiers.data?.data || resTiers.data || [],
      });
    } catch (err) {
      toast.error("Rupture de liaison avec le noyau SMI");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * 🔍 MOTEUR DE RECHERCHE DYNAMIQUE
   * Filtrage par référence documentaire ou objet de la plainte.
   */
  const filteredRecs = useMemo(
    () =>
      recs.filter(
        (r) =>
          r.REC_Object.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.REC_Reference.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [recs, searchTerm],
  );

  /**
   * 💾 PERSISTANCE DES MODIFICATIONS
   * Met à jour le dossier de réclamation via un PATCH partiel.
   */
  const handleUpdate = async () => {
    if (!selectedRec) return;
    try {
      await apiClient.patch(`/reclamations/${selectedRec.REC_Id}`, selectedRec);
      toast.success("Dossier mis à jour");
      setIsEditing(false);
      fetchData();
      setSelectedRec(null);
    } catch (e) {
      toast.error("Échec de la persistance");
    }
  };

  // --- RENDU ÉLITE ---
  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
        <Loader2 className="animate-spin text-blue-500" size={50} />
        <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] italic">
          Initialisation du Registre...
        </span>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#0B0F1A] selection:bg-blue-600/30">
      <Sidebar user={user} isSuperAdmin={isSuperAdmin} />

      <main className="flex-1 ml-72 p-10 text-white italic overflow-y-auto h-screen scrollbar-hide">
        {/* 🔝 HEADER STRATÉGIQUE */}
        <header className="mb-12 flex justify-between items-end border-b border-white/5 pb-10">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
              Pilotage <span className="text-blue-600">Réclamations</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.5em] mt-4 italic">
              Management de la satisfaction — ISO 10002 (§8.2.1)
            </p>
          </div>
          <div className="flex gap-6">
            <div className="relative">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <input
                placeholder="FILTRER LE REGISTRE..."
                className="bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-8 text-[11px] font-black uppercase outline-none focus:border-blue-500 w-80 transition-all shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-xs flex items-center gap-4 uppercase transition-all shadow-2xl shadow-blue-900/40 border-none cursor-pointer italic"
            >
              <Plus size={20} strokeWidth={3} /> Déclarer un écart
            </button>
          </div>
        </header>

        {/* 📊 TABLEAU DE BORD DU REGISTRE */}
        <div className="bg-slate-900/40 rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-3xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-[10px] font-black uppercase text-slate-500 italic tracking-[0.2em]">
              <tr>
                <th className="p-10">Objet / Référence</th>
                <th className="p-10">Processus Imputé</th>
                <th className="p-10 text-center">Statut Opérationnel</th>
                <th className="p-10 text-right">Consultation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 italic font-bold text-[12px] uppercase">
              {filteredRecs.map((r) => (
                <tr
                  key={r.REC_Id}
                  className="hover:bg-white/5 transition-all group"
                >
                  <td className="p-10">
                    <p className="text-sm font-black group-hover:text-blue-400 transition-colors">
                      {r.REC_Object}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-2 tracking-widest">
                      {r.REC_Reference}
                    </p>
                  </td>
                  <td className="p-10 text-blue-500 font-black uppercase tracking-tighter">
                    {r.REC_Processus?.PR_Libelle || "HORS PROCESSUS (NC)"}
                  </td>
                  <td className="p-10 text-center">
                    <span
                      className={`px-6 py-2 rounded-xl text-[9px] font-black border ${
                        r.REC_Status === "TRAITEE" || r.REC_Status === "REGLEE"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                      }`}
                    >
                      {r.REC_Status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-10 text-right">
                    <button
                      onClick={() => setSelectedRec(r)}
                      className="p-5 bg-white/5 rounded-2xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-inner border-none cursor-pointer"
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecs.length === 0 && (
            <div className="p-20 text-center text-slate-600 font-black uppercase italic tracking-widest opacity-20">
              Aucune donnée de réclamation indexée.
            </div>
          )}
        </div>

        {/* MODAUX DE GESTION */}
        {isCreateModalOpen && (
          <CreateModal
            onClose={() => setIsCreateModalOpen(false)}
            onRefresh={fetchData}
            tiers={dataSources.tiers}
            processus={dataSources.processus}
          />
        )}

        {/* TIROIR DE DÉTAILS (VERSION LIGHT) */}
        {selectedRec && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-110 flex justify-end animate-in fade-in duration-300">
            <div className="h-screen w-160 bg-[#0F172A] border-l border-white/10 p-16 flex flex-col shadow-4xl animate-in slide-in-from-right duration-500">
              <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                  Détails <span className="text-blue-500">Dossier</span>
                </h2>
                <button
                  onClick={() => {
                    setSelectedRec(null);
                    setIsEditing(false);
                  }}
                  className="p-5 bg-white/5 rounded-2xl hover:text-red-500 transition-all border-none cursor-pointer text-white"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto pr-6 italic scrollbar-hide">
                <DetailField
                  label="Objet de la plainte"
                  value={selectedRec.REC_Object}
                  isEditing={isEditing}
                  onChange={(v: any) =>
                    setSelectedRec({ ...selectedRec, REC_Object: v })
                  }
                />
                <DetailField
                  label="Description des faits"
                  value={selectedRec.REC_Description}
                  isEditing={isEditing}
                  isTextArea
                  onChange={(v: any) =>
                    setSelectedRec({ ...selectedRec, REC_Description: v })
                  }
                />
                <DetailField
                  label="Analyse des causes & Solution"
                  value={selectedRec.REC_SolutionProposed || ""}
                  isEditing={isEditing}
                  isTextArea
                  onChange={(v: any) =>
                    setSelectedRec({ ...selectedRec, REC_SolutionProposed: v })
                  }
                />

                <div className="mt-12">
                  {isEditing ? (
                    <button
                      onClick={handleUpdate}
                      className="w-full py-7 bg-blue-600 hover:bg-blue-500 text-white rounded-4xl font-black uppercase text-xs italic transition-all shadow-2xl shadow-blue-900/40 border-none cursor-pointer"
                    >
                      Valider LA MISE À JOUR
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full py-7 bg-white/5 border border-white/10 text-white rounded-4xl font-black uppercase text-xs italic hover:bg-white/10 transition-all border-none cursor-pointer"
                    >
                      OUVRIR LE DOSSIER EN ÉDITION
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function DetailField({ label, value, isEditing, onChange, isTextArea }: any) {
  return (
    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-inner">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 block italic">
        {label}
      </label>
      {isTextArea ? (
        <textarea
          readOnly={!isEditing}
          className="w-full bg-transparent text-sm font-bold text-white outline-none mt-2 h-40 leading-relaxed resize-none scrollbar-hide"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          readOnly={!isEditing}
          className="w-full bg-transparent text-base font-black text-white outline-none mt-2 uppercase tracking-tighter"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function CreateModal({ onClose, onRefresh, tiers, processus }: any) {
  const [form, setForm] = useState({
    REC_Object: "",
    REC_Description: "",
    REC_TierId: "",
    REC_ProcessusId: "",
    REC_Deadline: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post("/reclamations", {
        ...form,
        REC_Object: form.REC_Object.toUpperCase(),
        REC_Deadline: form.REC_Deadline || null,
      });
      onRefresh();
      onClose();
      toast.success("RÉCLAMATION INDEXÉE");
    } catch (err) {
      toast.error("CONTRÔLE DE VALIDITÉ ÉCHOUÉ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-200 flex items-center justify-center p-8 italic animate-in zoom-in duration-300">
      <form
        onSubmit={handleSubmit}
        className="bg-[#0F172A] w-full max-w-2xl rounded-[4rem] border border-white/10 p-16 space-y-10 shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
      >
        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
          Déclaration <span className="text-blue-600">Incident Client</span>
        </h2>

        <div className="space-y-6">
          <input
            required
            placeholder="OBJET DE LA PLAINTE"
            className="w-full bg-white/5 border border-white/10 p-7 rounded-4xl font-black text-lg text-white outline-none focus:border-blue-600 transition-all uppercase italic shadow-inner"
            value={form.REC_Object}
            onChange={(e) => setForm({ ...form, REC_Object: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-6">
            <select
              required
              className="bg-white/5 border border-white/10 p-7 rounded-4xl text-[11px] font-black text-white outline-none uppercase italic cursor-pointer shadow-inner appearance-none"
              value={form.REC_TierId}
              onChange={(e) => setForm({ ...form, REC_TierId: e.target.value })}
            >
              <option value="">-- CHOISIR LE TIERS --</option>
              {tiers.map((t: any) => (
                <option key={t.TR_Id} value={t.TR_Id}>
                  {t.TR_Name}
                </option>
              ))}
            </select>
            <select
              required
              className="bg-white/5 border border-white/10 p-7 rounded-4xl text-[11px] font-black text-white outline-none uppercase italic cursor-pointer shadow-inner appearance-none"
              value={form.REC_ProcessusId}
              onChange={(e) =>
                setForm({ ...form, REC_ProcessusId: e.target.value })
              }
            >
              <option value="">-- IMPUTATION PROCESSUS --</option>
              {processus.map((p: any) => (
                <option key={p.PR_Id} value={p.PR_Id}>
                  {p.PR_Libelle}
                </option>
              ))}
            </select>
          </div>

          <textarea
            required
            placeholder="DESCRIPTION DÉTAILLÉE DES ÉCARTS CONSTATÉS"
            rows={4}
            className="w-full bg-white/5 border border-white/10 p-7 rounded-4xl font-bold text-white outline-none focus:border-blue-600 transition-all shadow-inner resize-none italic"
            value={form.REC_Description}
            onChange={(e) =>
              setForm({ ...form, REC_Description: e.target.value })
            }
          />

          <div className="bg-white/5 p-6 rounded-4xl border border-white/10 shadow-inner">
            <label className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest block mb-2">
              Échéance de traitement souhaitée
            </label>
            <input
              type="date"
              className="w-full bg-transparent text-white outline-none mt-1 text-sm font-black"
              value={form.REC_Deadline}
              onChange={(e) =>
                setForm({ ...form, REC_Deadline: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white rounded-[2.5rem] font-black uppercase text-xs italic shadow-2xl flex justify-center items-center border-none cursor-pointer"
          >
            {saving ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Valider LA DÉCLARATION"
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 text-[10px] font-black uppercase italic tracking-widest border-none bg-transparent cursor-pointer hover:text-white transition-all"
          >
            Abandonner la saisie
          </button>
        </div>
      </form>
    </div>
  );
}
