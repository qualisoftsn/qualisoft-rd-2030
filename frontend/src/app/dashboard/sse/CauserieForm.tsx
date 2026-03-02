/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📝 MODULE : src/app/dashboard/sse/causerie/components/CauserieForm.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Programmation d'une nouvelle sensibilisation (§7.3 ISO 45001).
 * RÔLE : Enregistrer l'événement dans la base de données scellée du Tenant.
 * ISOLATION : La liste des animateurs est strictement filtrée par le SDE.
 * SÉCURITÉ : Zéro NextAuth. Modal Responsive.
 * DATE DE RÉVISION : 02 Mars 2026 | 15:13 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  Calendar, Loader2, Save, ShieldAlert, Target, Users, X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface SdeUser {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Role: string;
}

export interface SSEFormProps {
  onClose: () => void;
  onRefresh: () => Promise<void> | void;
}

export default function CauserieForm({ onClose, onRefresh }: SSEFormProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<SdeUser[]>([]);

  // Modèle de données strict aligné sur le schéma Prisma (Préfixe CS_)
  const [formData, setFormData] = useState({
    CS_Theme: "",
    CS_Date: new Date().toISOString().split("T")[0],
    CS_AnimateurId: "",
    CS_Description: "",
    CS_Type: "SÉCURITÉ", // Valeurs autorisées : SÉCURITÉ, ENVIRONNEMENT, QUALITÉ
  });

  /**
   * 📡 SYNCHRONISATION MATRIX (ISOLATION)
   * Récupère uniquement les utilisateurs accrédités du Tenant actuel.
   */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient.get("/users");
        setUsers(Array.isArray(res.data?.data || res.data) ? (res.data?.data || res.data) : []);
      } catch (error) {
        console.error("Qualisoft Kernel: Échec de lecture de l'annuaire.", error);
        toast.error("Erreur de liaison : Impossible de charger les animateurs.");
      }
    };
    fetchUsers();
  }, []);

  /**
   * 🚀 SOUMISSION SCELLÉE
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Scellage de la session dans le registre...");

    try {
      await apiClient.post("/causeries", formData);
      toast.success("SESSION DE SENSIBILISATION SCELLÉE", { id: tid });

      await onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Qualisoft Kernel: Rejet de la transaction.", err);
      toast.error(err.response?.data?.message || "Rejet du Kernel : Échec de création.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-600 flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4 lg:p-6 italic font-sans animate-in fade-in duration-500 overflow-y-auto">
      <div className="absolute inset-0 transition-opacity" onClick={onClose} />
      
      {/* 🛡️ CONTENEUR ELITE QUALISOFT 2026 */}
      <div className="bg-[#0F172A] border border-blue-500/20 w-full max-w-2xl rounded-[2.5rem] lg:rounded-[4rem] shadow-[0_0_100px_rgba(37,99,235,0.2)] relative overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95">
        
        {/* HEADER SOUVERAIN */}
        <div className="p-6 lg:p-10 border-b border-white/5 flex justify-between items-center relative z-10 shrink-0 bg-[#0B0F1A]/50">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="p-3 lg:p-5 bg-blue-600 rounded-3xl lg:rounded-4xl text-white shadow-lg shadow-blue-600/30 border border-blue-400/50 animate-pulse shrink-0">
              <ShieldAlert size={28} className="lg:w-8 lg:h-8" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-4xl font-black uppercase italic tracking-tighter text-white leading-none m-0">
                Programmer <br className="hidden sm:block" />
                <span className="text-blue-500">Sensibilisation</span>
              </h2>
              <p className="text-[8px] lg:text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] lg:tracking-[0.4em] mt-2 m-0">
                ISO 45001 • Prévention
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 lg:p-4 bg-white/5 hover:bg-red-500 hover:text-white rounded-full lg:rounded-2xl text-slate-400 transition-colors border border-white/5 shadow-inner cursor-pointer active:scale-90 shrink-0 m-0"
          >
            <X size={20} className="lg:w-6 lg:h-6" />
          </button>
        </div>

        {/* CORPS DU FORMULAIRE */}
        <div className="p-6 lg:p-12 overflow-y-auto custom-scrollbar relative z-10 text-left flex-1 bg-[#0F172A]">
          <form id="causerie-form" onSubmit={handleSubmit} className="space-y-8 lg:space-y-10">
            {/* THÈME */}
            <div className="space-y-3 lg:space-y-4">
              <label className="text-[9px] lg:text-[11px] font-black uppercase text-blue-500 tracking-[0.2em] lg:tracking-[0.3em] ml-2 flex items-center gap-2 lg:gap-3 m-0">
                <Target size={14} className="lg:w-4 lg:h-4" /> Thème de la causerie
              </label>
              <input
                required
                autoFocus
                placeholder="EX: PORT DES EPI, RISQUES CHIMIQUES..."
                className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-3xl lg:rounded-[2.5rem] p-4 lg:p-6 text-xs lg:text-sm font-black text-white outline-none focus:border-blue-500 transition-colors uppercase tracking-widest shadow-inner placeholder:text-slate-700 m-0"
                value={formData.CS_Theme}
                onChange={(e) => setFormData({ ...formData, CS_Theme: e.target.value })}
              />
            </div>

            {/* DATE & DOMAINE (GRID) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <div className="space-y-3 lg:space-y-4">
                <label className="text-[9px] lg:text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] lg:tracking-[0.3em] ml-2 flex items-center gap-2 lg:gap-3 m-0">
                  <Calendar size={14} className="text-blue-500 lg:w-4 lg:h-4" /> Date d&apos;exécution
                </label>
                <input
                  type="date"
                  required
                  className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-3xl lg:rounded-[2.5rem] p-4 lg:p-6 text-xs lg:text-sm font-black text-white outline-none focus:border-blue-500 transition-colors shadow-inner m-0"
                  value={formData.CS_Date}
                  onChange={(e) => setFormData({ ...formData, CS_Date: e.target.value })}
                />
              </div>

              <div className="space-y-3 lg:space-y-4">
                <label className="text-[9px] lg:text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] lg:tracking-[0.3em] ml-2 flex items-center gap-2 lg:gap-3 m-0">
                  <ShieldAlert size={14} className="text-blue-500 lg:w-4 lg:h-4" /> Périmètre ISO
                </label>
                <select
                  className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-3xl lg:rounded-[2.5rem] p-4 lg:p-6 text-[10px] lg:text-[11px] font-black text-white uppercase outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none tracking-widest shadow-inner m-0"
                  value={formData.CS_Type}
                  onChange={(e) => setFormData({ ...formData, CS_Type: e.target.value })}
                >
                  <option value="SÉCURITÉ">SANTÉ & SÉCURITÉ (45001)</option>
                  <option value="ENVIRONNEMENT">ENVIRONNEMENT (14001)</option>
                  <option value="QUALITÉ">QUALITÉ OPÉRATIONNELLE (9001)</option>
                </select>
              </div>
            </div>

            {/* ANIMATEUR MATRIX */}
            <div className="space-y-3 lg:space-y-4">
              <label className="text-[9px] lg:text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] lg:tracking-[0.3em] ml-2 flex items-center gap-2 lg:gap-3 m-0">
                <Users size={14} className="text-blue-500 lg:w-4 lg:h-4" /> Animateur / Référent
              </label>
              <select
                required
                className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-3xl lg:rounded-[2.5rem] p-4 lg:p-6 text-[10px] lg:text-[11px] font-black text-white uppercase outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none tracking-widest shadow-inner m-0"
                value={formData.CS_AnimateurId}
                onChange={(e) => setFormData({ ...formData, CS_AnimateurId: e.target.value })}
              >
                <option value="" className="bg-slate-900">-- DÉSIGNER UN ANIMATEUR ACCRÉDITÉ --</option>
                {users.map((u) => (
                  <option key={u.U_Id} value={u.U_Id} className="bg-slate-900">
                    {u.U_FirstName} {u.U_LastName} — [{u.U_Role}]
                  </option>
                ))}
              </select>
            </div>

            {/* DIRECTIVES */}
            <div className="space-y-3 lg:space-y-4">
              <label className="text-[9px] lg:text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] lg:tracking-[0.3em] ml-2 m-0 block">
                Objectifs & Directives (Optionnel)
              </label>
              <textarea
                rows={4}
                placeholder="RAPPEL DES CONSIGNES DE SÉCURITÉ, RISQUES IDENTIFIÉS..."
                className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-4xl lg:rounded-[2.5rem] p-5 lg:p-6 text-xs font-bold text-slate-300 outline-none focus:border-blue-500 transition-colors italic leading-relaxed shadow-inner placeholder:text-slate-700 resize-none m-0"
                value={formData.CS_Description}
                onChange={(e) => setFormData({ ...formData, CS_Description: e.target.value })}
              />
            </div>
          </form>
        </div>

        {/* FOOTER ACTIONS MATRIX */}
        <div className="p-6 lg:p-10 border-t border-white/5 bg-[#0B0F1A] relative z-10 shrink-0">
          <button
            type="submit"
            form="causerie-form"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 py-4 lg:py-6 rounded-3xl lg:rounded-[2.5rem] font-black uppercase text-[10px] lg:text-[12px] tracking-[0.2em] lg:tracking-[0.3em] text-white shadow-[0_15px_30px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-3 lg:gap-4 active:scale-95 disabled:opacity-50 border-none cursor-pointer m-0"
          >
            {loading ? <Loader2 className="animate-spin shrink-0" size={20} /> : <Save size={20} className="shrink-0 lg:w-6 lg:h-6" />}
            {loading ? "SCELLAGE..." : "Valider au registre des Causeries"}
          </button>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}