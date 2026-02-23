/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🎓 MODULE : FORMATION / HABILITATION MODAL
 * -------------------------------------------------------------------------
 * FONCTION : Enregistrement des compétences et habilitations (§7.2 ISO).
 * RÔLE : Alimenter le registre des qualifications par collaborateur du Tenant.
 * SÉCURITÉ : Liaison exclusive aux employés scellés au Tenant actif.
 */

import apiClient from "@/core/api/api-client";
import { GraduationCap, Loader2, ShieldCheck, User, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function FormationModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // État initial conforme au schéma Prisma (FOR_)
  const [formData, setFormData] = useState({
    FOR_Title: "",
    FOR_Date: new Date().toISOString().split("T")[0],
    FOR_Expiry: "",
    FOR_UserId: "",
    tenantId: "",
  });

  useEffect(() => {
    /**
     * 🛰️ SYNCHRONISATION KERNEL
     * Récupère les ressources humaines scellées au Tenant.
     */
    apiClient
      .get("/users")
      .then((res) => setUsers(res.data))
      .catch(() => toast.error("Erreur de liaison Matrix"));

    // Ancrage automatique du TenantId depuis la session scellée
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setFormData((prev) => ({ ...prev, tenantId: user.tenantId }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Scellage de l'habilitation...");

    try {
      await apiClient.post("/formations", formData);
      toast.success("HABILITATION INDEXÉE", { id: tid });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("REJET DU NOYAU", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-100 flex items-center justify-center p-6 italic font-sans animate-in zoom-in duration-300">
      <div className="bg-[#0F172A] border border-white/10 w-full max-w-xl rounded-[3.5rem] p-12 relative shadow-4xl text-left">
        <button
          onClick={onClose}
          className="absolute top-10 right-10 text-slate-500 hover:text-white transition-all border-none bg-transparent cursor-pointer"
        >
          <X size={28} />
        </button>

        <div className="flex items-center gap-5 mb-12">
          <div className="w-14 h-14 bg-orange-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-orange-950/40 animate-pulse">
            <GraduationCap size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none text-white">
              Nouvelle <span className="text-orange-500">Habilitation</span>
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3 italic">
              Registre des compétences §7.2
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest italic">
              Collaborateur Matrix
            </label>
            <div className="relative group">
              <User
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors"
                size={18}
              />
              <select
                required
                className="w-full bg-white/5 border-2 border-white/10 rounded-3xl p-5 pl-14 text-sm font-black italic outline-none focus:border-orange-500 transition-all appearance-none text-white cursor-pointer"
                value={formData.FOR_UserId}
                onChange={(e) =>
                  setFormData({ ...formData, FOR_UserId: e.target.value })
                }
              >
                <option value="" className="bg-slate-900">
                  SÉLECTIONNER UN COLLABORATEUR
                </option>
                {users.map((u) => (
                  <option key={u.U_Id} value={u.U_Id} className="bg-slate-900">
                    {u.U_FirstName} {u.U_LastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest italic">
              Désignation de la Qualification
            </label>
            <input
              required
              placeholder="ex: CACES R489, SST, HABILITATION B2V..."
              className="w-full bg-white/5 border-2 border-white/10 rounded-3xl p-5 text-sm font-black italic outline-none focus:border-orange-500 transition-all text-white uppercase tracking-tight"
              value={formData.FOR_Title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  FOR_Title: e.target.value.toUpperCase(),
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest italic">
                Obtention
              </label>
              <input
                type="date"
                required
                className="w-full bg-white/5 border-2 border-white/10 rounded-3xl p-5 text-xs font-black outline-none focus:border-orange-500 transition-all text-white"
                value={formData.FOR_Date}
                onChange={(e) =>
                  setFormData({ ...formData, FOR_Date: e.target.value })
                }
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest italic">
                Expiration
              </label>
              <input
                type="date"
                className="w-full bg-white/5 border-2 border-orange-500/20 rounded-3xl p-5 text-xs font-black outline-none focus:border-orange-500 transition-all text-orange-400"
                value={formData.FOR_Expiry}
                onChange={(e) =>
                  setFormData({ ...formData, FOR_Expiry: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 py-7 rounded-[2.5rem] font-black uppercase italic text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-3xl shadow-orange-950/30 disabled:opacity-50 active:scale-95 border-none cursor-pointer text-white"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <ShieldCheck size={20} />
            )}
            Valider l&apos;habilitation au SDE
          </button>
        </form>
      </div>
    </div>
  );
}
