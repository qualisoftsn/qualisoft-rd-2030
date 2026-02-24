/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 🎯 MODULE : TUNNEL DE QUALIFICATION & HABILITATION (§7.2)
 * -------------------------------------------------------------------------
 * RÔLE : Enregistrement et certification des compétences agent.
 * PHILOSOPHIE : Isolation stricte du référentiel par Tenant.
 * DESIGN : One-Pager Form / Elite SDE Referential Strict / No-Scroll Absolu.
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  ArrowLeft, Building2, Fingerprint, GitBranch, Info, Layers, Loader2,
  Lock, Mail, MapPin, Save, Shield, ShieldAlert, ShieldCheck, Target, UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Référentiels scellés
  const [referentials, setReferentials] = useState({
    sites: [] as any[],
    orgUnits: [] as any[],
    processes: [] as any[],
  });

  // Structure de données conforme elite-sde.ts
  const [formData, setFormData] = useState({
    U_FirstName: "",
    U_LastName: "",
    U_Email: "",
    U_Password: "qs@20252026",
    U_Role: "USER" as any,
    U_SiteId: "",
    U_OrgUnitId: "",
    U_AssignedProcessId: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [s, o, p] = await Promise.all([
        apiClient.get("/sites"),
        apiClient.get("/org-units"),
        apiClient.get("/processus"),
      ]);

      setReferentials({
        sites: (s.data?.data || s.data || []).filter((x: any) => x.S_IsActive),
        orgUnits: (o.data?.data || o.data || []).filter((x: any) => x.OU_IsActive),
        processes: (p.data?.data || p.data || []).filter((x: any) => x.PR_IsActive),
      });
    } catch (e: any) {
      toast.error("ÉCHEC RÉFÉRENTIELS : Impossible de sceller la matrice de structure.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const filteredUnits = useMemo(() => 
      referentials.orgUnits.filter((u: any) => u.OU_SiteId === formData.U_SiteId),
    [formData.U_SiteId, referentials.orgUnits]
  );

  /**
   * 💾 VALIDATION SDE & SCELLAGE DU PAYLOAD (Anti 400 Bad Request)
   * On nettoie les champs vides pour ne pas envoyer "" à Prisma, ce qui 
   * corrompt la validation des foreign keys.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.U_Role === "PILOTE" && !formData.U_AssignedProcessId) {
      return toast.warning("HABILITATION IMPOSSIBLE : Un Pilote doit être affecté à un cockpit cockpit (§5.3)");
    }

    setSubmitting(true);
    const tid = toast.loading("Scellage de l'habilitation agent en cours...");

    // Nettoyage Strict du Payload
    const payload: any = {
      U_FirstName: formData.U_FirstName,
      U_LastName: formData.U_LastName,
      U_Email: formData.U_Email.toLowerCase().trim(),
      U_Password: formData.U_Password,
      U_Role: formData.U_Role,
      U_IsActive: true,
    };

    // On n'injecte les clés étrangères que si elles existent, sinon on passe undefined
    if (formData.U_SiteId) payload.U_SiteId = formData.U_SiteId;
    if (formData.U_OrgUnitId) payload.U_OrgUnitId = formData.U_OrgUnitId;
    if (formData.U_AssignedProcessId && formData.U_Role === 'PILOTE') {
      payload.U_AssignedProcessId = formData.U_AssignedProcessId;
    }

    try {
      await apiClient.post("/users", payload);
      toast.success("AGENT QUALIFIÉ ET HABILITÉ DANS LE SMI", { id: tid });
      setTimeout(() => router.push("/dashboard/users"), 1200);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "ERREUR CRITIQUE SDE : Conflit d'indexation ou données manquantes.";
      toast.error(errorMsg, { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 text-blue-500 font-black italic">
      <div className="relative">
        <Loader2 className="animate-spin" size={60} strokeWidth={1} />
        <Fingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" size={24} />
      </div>
      <span className="text-[10px] uppercase tracking-[0.5em] animate-pulse">Initialisation des Matrices de Confiance...</span>
    </div>
  );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-8 overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER D'AUTORITÉ (Shrink-0) */}
      <header className="flex justify-between items-center border-b border-white/10 pb-6 mb-6 shrink-0">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all active:scale-90 shadow-lg cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter m-0 italic">
              Habilitation <span className="text-blue-500">Agent</span>
            </h1>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.5em] m-0 italic">
              Dossier de Compétence Personnel §7.2
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <ShieldCheck className="text-emerald-500 animate-pulse" size={24} />
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">SDE Security Active</span>
        </div>
      </header>

      {/* 📋 FORMULAIRE HAUTE DENSITÉ FULL-WIDTH */}
      <main className="flex-1 min-h-0 flex flex-col bg-[#151A2D] border border-white/5 rounded-[4rem] relative shadow-4xl overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none">
          <Fingerprint size={500} />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full w-full relative z-10">
          
          {/* ZONE SCROLLABLE - LARGEUR MAXIMALE (w-full) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
            <div className="w-full grid grid-cols-2 gap-16 px-4">
              
              {/* COL 1 : IDENTITÉ & ACCÈS */}
              <div className="space-y-10">
                <section className="space-y-6">
                  <h3 className="text-[11px] font-black uppercase italic text-blue-500 flex items-center gap-3 border-b border-white/5 pb-3 tracking-widest">
                    <UserPlus size={18} /> 01. Identité Civile & Master Key
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <Field
                      label="Prénom de l'Agent *"
                      value={formData.U_FirstName}
                      onChange={(v: any) => setFormData({ ...formData, U_FirstName: v })}
                      icon={<Target size={14} />}
                    />
                    <Field
                      label="Nom de l'Agent *"
                      value={formData.U_LastName}
                      onChange={(v: any) => setFormData({ ...formData, U_LastName: v })}
                      icon={<Target size={14} />}
                    />
                  </div>
                  <Field
                    label="Email Professionnel (Identifiant SDE) *"
                    value={formData.U_Email}
                    onChange={(v: any) => setFormData({ ...formData, U_Email: v })}
                    type="email"
                    icon={<Mail size={14} />}
                  />

                  <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-4xl flex flex-col gap-3 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                    <Lock className="absolute -right-4 -bottom-4 text-blue-500/10 group-hover:scale-125 transition-transform" size={100} />
                    <p className="text-[8px] font-black uppercase text-blue-500 italic tracking-[0.3em] flex items-center gap-2">
                      <ShieldAlert size={12} /> Clé d&apos;accès Maître Initiale
                    </p>
                    <span className="text-2xl font-mono font-black text-white tracking-widest">
                      {formData.U_Password}
                    </span>
                    <p className="text-[7px] text-slate-500 italic mt-1 leading-relaxed uppercase">
                      L&apos;agent devra réinitialiser ce jeton dès sa première <br /> connexion cryptée au SMI.
                    </p>
                  </div>
                </section>
              </div>

              {/* COL 2 : QUALIFICATION & PÉRIMÈTRE */}
              <div className="space-y-10">
                <section className="space-y-6">
                  <h3 className="text-[11px] font-black uppercase italic text-emerald-500 flex items-center gap-3 border-b border-white/5 pb-3 tracking-widest">
                    <GitBranch size={18} /> 02. Qualification SMI & Autorité
                  </h3>
                  <div className="space-y-5">
                    <Select
                      label="Rôle & Matrice d'Autorité"
                      value={formData.U_Role}
                      onChange={(v: any) => setFormData({ ...formData, U_Role: v })}
                      icon={<Shield size={14} />}
                    >
                      <option value="USER">AGENT / COLLABORATEUR STANDARD</option>
                      <option value="PILOTE">PILOTE DE PROCESSUS (PROPRIÉTAIRE)</option>
                      <option value="COPILOTE">CO-PILOTE SDE (APPUI QUALITÉ)</option>
                      <option value="ADMIN">ADMINISTRATEUR SYSTÈME QUALITÉ</option>
                      <option value="SUPER_ADMIN">SUPER-ADMINISTRATEUR SOUVERAIN</option>
                    </Select>

                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Site de Rattachement"
                        value={formData.U_SiteId}
                        onChange={(v: any) => setFormData({ ...formData, U_SiteId: v })}
                        icon={<MapPin size={14} />}
                      >
                        <option value="">CHOISIR SITE...</option>
                        {referentials.sites.map((s: any) => (
                          <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>
                        ))}
                      </Select>

                      <Select
                        label="Unité Org. (Isolation)"
                        value={formData.U_OrgUnitId}
                        onChange={(v: any) => setFormData({ ...formData, U_OrgUnitId: v })}
                        disabled={!formData.U_SiteId}
                        icon={<Layers size={14} />}
                      >
                        <option value="">CHOISIR UNITÉ...</option>
                        {filteredUnits.map((u: any) => (
                          <option key={u.OU_Id} value={u.OU_Id}>{u.OU_Name}</option>
                        ))}
                      </Select>
                    </div>

                    <div className={`transition-all ${formData.U_Role === "PILOTE" ? "opacity-100" : "opacity-20 pointer-events-none grayscale"}`}>
                      <Select
                        label="Affectation Cockpit Processus (§5.3)"
                        value={formData.U_AssignedProcessId}
                        onChange={(v: any) => setFormData({ ...formData, U_AssignedProcessId: v })}
                        icon={<GitBranch size={14} />}
                      >
                        <option value="">AFFECTATION DIRECTE...</option>
                        {referentials.processes.map((p: any) => (
                          <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>
                        ))}
                      </Select>
                      <p className="text-[7px] text-blue-500 font-black uppercase mt-2 ml-4 italic">
                        Affectation obligatoire pour le rôle PILOTE
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* ACTIONS & VALIDATION FIXES (Shrink-0 pour rester collé en bas de la carte) */}
          <footer className="shrink-0 p-8 border-t border-white/5 bg-black/20 flex flex-col items-center gap-4">
            <button
              disabled={submitting}
              type="submit"
              className="bg-blue-600 hover:bg-white hover:text-blue-600 px-16 py-4 rounded-2xl font-black uppercase text-[11px] italic shadow-[0_20px_60px_rgba(37,99,235,0.3)] flex items-center gap-4 cursor-pointer border-none transition-all active:scale-95 group"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save className="group-hover:rotate-12 transition-transform" size={20} />}
              Valider Agent
            </button>
            <div className="flex items-center gap-6 opacity-40">
              <span className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-2 italic tracking-[0.4em]">
                <Info size={12} /> Traçabilité RH Immuable Active
              </span>
              <span className="h-1 w-1 bg-slate-700 rounded-full" />
              <span className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-2 italic tracking-[0.4em]">
                Audit Trail : ISO 9001:2015
              </span>
            </div>
          </footer>
        </form>
      </main>

      {/* FOOTER BAS DE PAGE (Shrink-0) */}
      <footer className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-20 shrink-0 italic">
        <div className="flex items-center gap-4">
          <Fingerprint size={28} className="text-blue-600" />
          <div className="text-left leading-none">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] m-0 mb-1">Qualisoft Elite SDE</p>
            <p className="text-[7px] font-bold text-slate-700 uppercase tracking-widest m-0 leading-none">Integrated Personnel Qualification Engine v4.0</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
        </div>
      </footer>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, 0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}

/**
 * 🧱 COMPOSANTS D'INTERFACE SDE
 */
function Field({ label, value, onChange, type = "text", icon }: any) {
  return (
    <div className="space-y-2 text-left group">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-3 italic group-focus-within:text-blue-500 transition-colors flex items-center gap-2">
        {icon} {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-black text-white italic outline-none focus:border-blue-600 focus:bg-white/10 transition-all uppercase placeholder:opacity-20"
        placeholder="..."
      />
    </div>
  );
}

function Select({ label, value, onChange, children, disabled = false, icon }: any) {
  return (
    <div className={`space-y-2 text-left group ${disabled ? "opacity-20 grayscale" : ""}`}>
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-3 italic group-focus-within:text-blue-500 transition-colors flex items-center gap-2">
        {icon} {label}
      </label>
      <div className="relative">
        <select
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-black text-white italic outline-none focus:border-blue-600 focus:bg-white/10 cursor-pointer appearance-none transition-all"
        >
          {children}
        </select>
        <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={16} />
      </div>
    </div>
  );
}