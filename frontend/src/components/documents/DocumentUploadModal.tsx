/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 📂 MODULE : DOCUMENT UPLOAD MODAL (COFFRE-FORT NUMÉRIQUE)
 * -------------------------------------------------------------------------
 * FONCTION : Indexation et archivage de documents SMI (§7.5 ISO).
 * RÔLE : Assurer la traçabilité documentaire par processus et catégorie.
 * ISOLATION : Les documents sont scellés au Tenant et rattachés à ses processus propres.
 */

import apiClient from "@/core/api/api-client";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function DocumentUploadModal({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [processus, setProcessus] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // État du formulaire structuré selon le schéma Prisma DOC_
  const [formData, setFormData] = useState({
    DOC_Title: "",
    DOC_Description: "",
    DOC_Category: "PROCEDURE",
    DOC_ProcessusId: "",
    DOC_SiteId: "",
  });

  // 🔄 SYNCHRONISATION DES PROCESSUS DU TENANT ACTIF
  useEffect(() => {
    apiClient
      .get("/processus")
      .then((res) => setProcessus(Array.isArray(res.data) ? res.data : []))
      .catch((err) =>
        console.error(
          "Erreur critique : Rupture de liaison avec les processus du Tenant.",
        ),
      );
  }, []);

  /**
   * 📎 CAPTURE DU BINAIRE SOURCÉ
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Pré-remplissage du titre si vide pour accélérer la saisie
      if (!formData.DOC_Title) {
        setFormData((prev) => ({
          ...prev,
          DOC_Title: file.name.split(".")[0].toUpperCase(),
        }));
      }
    }
  };

  /**
   * 🚀 EXPÉDITION VERS LE NOYAU D'ARCHIVAGE
   * Utilise Multipart/FormData pour le transport binaire + métadonnées.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);

    const data = new FormData();
    data.append("file", selectedFile);
    data.append("DOC_Title", formData.DOC_Title);
    data.append("DOC_Description", formData.DOC_Description);
    data.append("DOC_Category", formData.DOC_Category);
    data.append("DOC_ProcessusId", formData.DOC_ProcessusId);

    try {
      await apiClient.post("/documents/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Échec de l'indexation GED Matrix.");
      alert(
        err.response?.data?.message ||
          "Erreur de scellage : Le Kernel a rejeté le document.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-100 flex items-center justify-center p-6 italic">
      <div className="bg-[#0F172A] w-full max-w-4xl rounded-[4rem] shadow-4xl border border-white/10 overflow-hidden animate-in zoom-in duration-500">
        {/* HEADER SOUVERAIN */}
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/2">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              Indexation <span className="text-blue-500">Documentaire</span>
            </h2>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3 italic leading-none">
              Qualisoft RD 2026 • Coffre-fort numérique scellé
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-4 bg-white/5 hover:bg-red-500/20 rounded-2xl text-slate-400 hover:text-red-500 transition-all border-none cursor-pointer"
          >
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-10">
          {/* ZONE DE DÉPÔT (DROPZONE) */}
          <div className="relative group">
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              onChange={handleFileChange}
              required={!selectedFile}
            />
            <div
              className={`border-4 border-dashed rounded-[3rem] p-12 text-center transition-all duration-500 ${
                selectedFile
                  ? "border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_40px_rgba(16,185,129,0.05)]"
                  : "border-white/10 bg-white/2 group-hover:border-blue-500/30 group-hover:bg-blue-600/5"
              }`}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-8 animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-500 shadow-lg">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-black text-white uppercase italic tracking-tighter truncate max-w-md">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Prêt pour le
                      versionnage V1.0
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto text-blue-500 shadow-inner group-hover:scale-110 transition-transform">
                    <Upload size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase text-slate-300 tracking-[0.2em] italic">
                      Sélectionnez le fichier source
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase mt-3 tracking-widest font-bold">
                      Format PDF, Word ou Excel scellé (Max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MÉTADONNÉES ISO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
            <div className="space-y-8">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-4 ml-4 italic">
                  Titre Qualité du Document
                </label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-sm font-black text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all uppercase italic shadow-inner"
                  value={formData.DOC_Title}
                  onChange={(e) =>
                    setFormData({ ...formData, DOC_Title: e.target.value })
                  }
                  placeholder="EX: PROCÉDURE DE GESTION DES DÉCHETS"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-4 ml-4 italic">
                  Catégorie Normative
                </label>
                <select
                  className="w-full bg-[#161e31] border border-white/5 rounded-2xl p-6 text-sm font-black text-white outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer italic uppercase"
                  value={formData.DOC_Category}
                  onChange={(e) =>
                    setFormData({ ...formData, DOC_Category: e.target.value })
                  }
                >
                  <option value="PROCEDURE">Procédure Opérationnelle</option>
                  <option value="MANUEL">Manuel SMI / Qualité</option>
                  <option value="ENREGISTREMENT">
                    Enregistrement (Preuve)
                  </option>
                  <option value="CONSIGNE">Consigne de Sécurité</option>
                  <option value="RAPPORT">Rapport d&apos;Audit / Revue</option>
                </select>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-4 ml-4 italic">
                  Ancrage Processus (Lien Fort)
                </label>
                <select
                  className="w-full bg-[#161e31] border border-white/5 rounded-2xl p-6 text-sm font-black text-white outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer italic uppercase"
                  value={formData.DOC_ProcessusId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      DOC_ProcessusId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">-- Assigner un processus --</option>
                  {processus.map((p) => (
                    <option key={p.PR_Id} value={p.PR_Id}>
                      {p.PR_Libelle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-6 bg-blue-600/5 border border-blue-500/20 rounded-4xl flex gap-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ShieldCheck size={60} />
                </div>
                <AlertCircle size={24} className="text-blue-500 shrink-0" />
                <p className="text-[10px] text-slate-400 leading-relaxed font-black italic uppercase tracking-tighter relative z-10">
                  Conformité ISO : Tout document est injecté avec le statut{" "}
                  <span className="text-blue-500 font-black italic">
                    BROUILLON
                  </span>
                  . Il devra passer par le circuit de validation du Tenant pour
                  être{" "}
                  <span className="text-emerald-500 font-black italic">
                    DIFFUSÉ
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* ACTION FINALE */}
          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="w-full bg-blue-600 text-white p-7 rounded-[2.5rem] font-black uppercase tracking-[0.4em] italic flex items-center justify-center gap-5 hover:bg-blue-500 transition-all shadow-3xl shadow-blue-900/40 disabled:opacity-20 disabled:cursor-not-allowed group border-none cursor-pointer active:scale-95"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <ShieldCheck
                  size={24}
                  className="group-hover:rotate-12 transition-transform duration-300"
                />
                <span>Indexer et Valider au Coffre-fort (V1.0)</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
