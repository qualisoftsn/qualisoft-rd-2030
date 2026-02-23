/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛠️ MODULE : DOSSIER DÉTAILLÉ DE NON-CONFORMITÉ (NC) — ELITE CORE SDE
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage expert du cycle Correctif/Préventif (§10.2 ISO 9001).
 * RÉFÉRENTIEL : types/elite-sde.ts (SCELLAGE PRISMA STRICT).
 * ARCHITECTURE : Isolation Multi-Tenant (Accès par ID Unique).
 * WORKFLOW : DETECTION -> ANALYSE -> ACTION_EN_COURS -> CLOTUREE.
 * DESIGN : Cockpit Matrix Full-Space (max-w-500).
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  Activity,
  AlertOctagon,
  Archive,
  ArrowLeft,
  Calendar,
  Clock,
  Fingerprint,
  Hammer,
  Loader2,
  Microscope,
  Plus,
  Printer,
  Save,
  ShieldCheck,
  Target,
  User,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { use, useCallback, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

// --- 🏗️ RÉFÉRENTIEL ÉLITE-SDE (VÉRIFIÉ) ---
import {
  ActionOrigin,
  ActionStatus,
  ActionType,
  Action as IAction,
  NCStatus,
  Priority,
} from "@/types/elite-sde";

const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

export default function DetailNonConformitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  // --- 📦 ÉTATS DU DOSSIER EXPERT ---
  const [nc, setNc] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [analyse, setAnalyse] = useState<string>("");

  // --- 📟 WORKFLOW CAPA (§10.2.1) ---
  const [isActionModalOpen, setIsActionModalOpen] = useState<boolean>(false);
  const [newActionTitle, setNewActionTitle] = useState<string>("");
  const [newActionDeadline, setNewActionDeadline] = useState<string>("");

  /**
   * 📡 SYNCHRONISATION DU DOSSIER NC
   * @description Extraction du noyau avec injection des relations (Actions, Processus, Déclarant).
   */
  const chargerDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/non-conformites/${id}`);
      const data = res.data?.data || res.data;

      if (!data) throw new Error("NullData");

      setNc(data);
      setAnalyse(data.NC_Diagnostic || "");
    } catch (e: unknown) {
      toast.error(
        "RUPTURE DE LIAISON : DOSSIER NC INTROUVABLE DANS LE TENANT.",
      );
      router.push("/dashboard/non-conformites");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    chargerDetails();
  }, [chargerDetails]);

  /**
   * 💾 PHASE 01 : SCELLAGE DU DIAGNOSTIC (§10.2.1 b)
   * @description Analyse des causes racines. Transition vers le statut 'ANALYSE'.
   */
  const sauvegarderAnalyse = async () => {
    if (!analyse.trim())
      return toast.error(
        "Le diagnostic RCA est une exigence normative obligatoire.",
      );

    setIsSaving(true);
    const tid = toast.loading("Scellage du diagnostic Causes-Racines...");
    try {
      await apiClient.patch(`/non-conformites/${id}`, {
        NC_Diagnostic: analyse,
        NC_Statut: NCStatus.ANALYSE,
      });
      toast.success("ANALYSE RCA VALIDÉE ET SCELLÉE.", { id: tid });
      chargerDetails();
    } catch {
      toast.error("ÉCHEC DE MUTATION DU NOYAU NC.", { id: tid });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * ⚡ PHASE 02 : DÉCLENCHEMENT ACTION CORRECTIVE (§10.2.1 c)
   * @description Création d'une action liée. Transition vers 'ACTION_EN_COURS'.
   */
  const creerAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Génération de l'action corrective...");
    try {
      await apiClient.post("/actions", {
        ACT_Title: newActionTitle.toUpperCase(),
        ACT_Deadline: newActionDeadline,
        ACT_Status: ActionStatus.A_FAIRE,
        ACT_Origin: ActionOrigin.NON_CONFORMITE,
        ACT_Type: ActionType.CORRECTIVE,
        ACT_Priority: Priority.HIGH,
        ACT_NCId: id,
      });

      // Transition de statut automatique si détection/analyse
      if (
        nc.NC_Statut === NCStatus.ANALYSE ||
        nc.NC_Statut === NCStatus.DETECTION
      ) {
        await apiClient.patch(`/non-conformites/${id}`, {
          NC_Statut: NCStatus.ACTION_EN_COURS,
        });
      }

      toast.success("ACTION CAPA INDEXÉE AU DOSSIER.", { id: tid });
      setIsActionModalOpen(false);
      setNewActionTitle("");
      setNewActionDeadline("");
      chargerDetails();
    } catch {
      toast.error("ERREUR DE DÉCLENCHEMENT CAPA.", { id: tid });
    }
  };

  /**
   * 🛡️ PHASE 03 : CLÔTURE DÉFINITIVE (§10.2.2)
   * @description Archivage immuable après vérification d'efficacité.
   */
  const cloturerNC = async () => {
    if (
      !confirm(
        "ALERTE SCELLAGE : La clôture verrouille le dossier et l'historique RCA. Confirmer ?",
      )
    )
      return;

    const tid = toast.loading("Verrouillage final du dossier...");
    try {
      await apiClient.patch(`/non-conformites/${id}`, {
        NC_Statut: NCStatus.CLOTURE,
      });
      toast.success("DOSSIER NC ARCHIVÉ ET SCELLÉ.", { id: tid });
      chargerDetails();
    } catch {
      toast.error("ÉCHEC DE VÉRIFICATION FINALE.", { id: tid });
    }
  };

  if (loading || !nc)
    return (
      <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-12">
        <Loader2
          className="animate-spin text-red-600"
          size={100}
          strokeWidth={1}
        />
        <span className="text-[12px] font-black uppercase text-red-600 italic tracking-[1.5em] animate-pulse">
          Accès Sécurisé NC-{id.slice(0, 8).toUpperCase()}...
        </span>
      </div>
    );

  return (
    <div className="p-16 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans text-left relative selection:bg-red-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER COCKPIT (max-w-500) */}
      <header className="mb-20 flex justify-between items-center w-full max-w-500 mx-auto border-b-4 border-white/5 pb-16">
        <div className="flex items-center gap-12">
          <button
            onClick={() => router.back()}
            className="p-8 bg-white/5 rounded-[2.5rem] hover:bg-white/10 transition-all border-2 border-white/10 cursor-pointer shadow-4xl group"
          >
            <ArrowLeft
              size={36}
              className="group-hover:-translate-x-3 transition-transform"
              strokeWidth={3}
            />
          </button>
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <span
                className={cn(
                  "px-6 py-2 rounded-xl text-[12px] font-black uppercase tracking-[0.4em] border-2 italic shadow-inner",
                  nc.NC_Statut === NCStatus.CLOTURE
                    ? "bg-emerald-600/10 text-emerald-500 border-emerald-500/20"
                    : "bg-red-600/10 text-red-600 border-red-600/20 animate-pulse",
                )}
              >
                SMI STATUS : {nc.NC_Statut}
              </span>
              <p className="text-slate-600 font-black text-[13px] uppercase tracking-[0.8em] italic leading-none">
                Management Investigation Unit
              </p>
            </div>
            <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none text-white">
              NC-{nc.NC_Code || id.slice(0, 8).toUpperCase()}
            </h1>
          </div>
        </div>

        <div className="flex gap-10">
          {nc.NC_Statut !== NCStatus.CLOTURE && (
            <button
              onClick={cloturerNC}
              className="px-16 py-8 bg-emerald-600/10 border-2 border-emerald-500/20 text-emerald-500 rounded-[3rem] text-[13px] font-black uppercase flex items-center gap-8 hover:bg-emerald-600 hover:text-white transition-all italic cursor-pointer shadow-4xl"
            >
              <ShieldCheck size={32} /> Clôturer Dossier
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="px-14 py-8 bg-white/5 border-2 border-white/10 rounded-[3rem] text-[13px] font-black uppercase flex items-center gap-8 hover:bg-white/10 transition-all italic cursor-pointer shadow-xl"
          >
            <Printer size={32} /> Print Matrix
          </button>
          <button
            onClick={sauvegarderAnalyse}
            disabled={isSaving || nc.NC_Statut === NCStatus.CLOTURE}
            className="px-24 py-8 bg-red-600 rounded-[3rem] text-[13px] font-black uppercase flex items-center gap-8 shadow-[0_20px_60px_rgba(220,38,38,0.4)] hover:bg-white hover:text-red-600 transition-all italic cursor-pointer border-none disabled:opacity-30"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={32} />
            ) : (
              <Save size={32} />
            )}{" "}
            Valider RCA
          </button>
        </div>
      </header>

      {/* 📊 CORE GRID (max-w-500) */}
      <main className="grid grid-cols-12 gap-20 w-full max-w-500 mx-auto items-start">
        {/* 📋 COLONNE ALPHA : CONTEXTE FACTUEL (§10.2.1 a) */}
        <div className="col-span-12 lg:col-span-4 space-y-16 animate-in fade-in duration-1000">
          <div className="bg-[#151A2D] border-4 border-white/5 rounded-[6rem] p-16 shadow-4xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] rotate-12">
              <AlertOctagon size={250} className="text-red-600" />
            </div>

            <h3 className="text-[14px] font-black uppercase text-slate-500 mb-12 tracking-[1em] flex items-center gap-8 italic leading-none">
              <Target size={28} className="text-red-600" /> Données de Base
            </h3>

            <div className="space-y-12 relative z-10 text-left">
              <DataField
                icon={<Clock className="text-red-600" />}
                label="DÉTECTION"
                value={new Date(nc?.NC_CreatedAt).toLocaleDateString()}
              />
              <DataField
                icon={<User className="text-blue-600" />}
                label="DÉCLARANT"
                value={
                  nc?.Detector
                    ? `${nc.Detector.U_FirstName} ${nc.Detector.U_LastName}`
                    : `UID: ${nc.NC_DetectorId?.slice(0, 8)}`
                }
              />
              <DataField
                icon={<Activity className="text-emerald-600" />}
                label="PROCESSUS"
                value={nc?.Processus?.PR_Libelle || "TRANSVERSAL"}
              />
              <DataField
                icon={<Archive className="text-amber-600" />}
                label="ORIGINE"
                value={nc?.NC_Source || "INTERNE"}
              />
            </div>

            <div className="mt-20 p-12 bg-black/40 rounded-[4rem] border-2 border-white/5 italic shadow-inner relative group/box">
              <Fingerprint
                className="absolute top-8 right-10 text-slate-800 group-hover/box:text-red-600 transition-colors"
                size={40}
              />
              <p className="text-[11px] font-black uppercase text-slate-500 mb-10 tracking-[0.5em] flex items-center gap-4 italic leading-none">
                Exposé Factuel Déclaré
              </p>
              <p className="text-2xl leading-relaxed text-slate-300 italic font-medium">
                &quot;{nc?.NC_Description}&quot;
              </p>
            </div>
          </div>
        </div>

        {/* ⚙️ COLONNE BETA : INVESTIGATION & RÉSOLUTION (§10.2.1 b/c) */}
        <div className="col-span-12 lg:col-span-8 space-y-16 animate-in slide-in-from-right-10 duration-1000">
          {/* RCA SECTION */}
          <div className="bg-[#151A2D] border-4 border-white/5 rounded-[7rem] p-20 shadow-4xl relative group">
            <div className="absolute left-0 top-24 w-4 h-64 bg-red-600 rounded-r-full shadow-[0_0_60px_rgba(220,38,38,0.7)]" />

            <div className="flex justify-between items-center mb-20">
              <h2 className="text-6xl font-black uppercase italic flex items-center gap-12 text-white tracking-tighter leading-none">
                <span className="text-red-600 text-[10rem] opacity-10 leading-none select-none">
                  RCA
                </span>{" "}
                Diagnostic & Causes
              </h2>
              <div className="flex items-center gap-8 bg-white/5 px-12 py-6 rounded-[2.5rem] border-2 border-white/10 shadow-inner italic">
                <Microscope size={32} className="text-red-600" />
                <span className="text-[14px] font-black text-slate-500 uppercase tracking-[0.5em] leading-none">
                  Preuve §10.2.1.b
                </span>
              </div>
            </div>

            <textarea
              value={analyse}
              onChange={(e) => setAnalyse(e.target.value)}
              disabled={nc.NC_Statut === NCStatus.CLOTURE}
              placeholder="DÉBUTER L'ANALYSE DES CAUSES RACINES (5P, ISHIKAWA)..."
              className="w-full p-24 bg-black/40 border-4 border-white/5 rounded-[6rem] text-3xl font-medium text-white outline-none focus:border-red-600 min-h-125 leading-relaxed italic placeholder-slate-900 transition-all focus:bg-black/80 shadow-inner resize-none text-left"
            />
          </div>

          {/* CAPA SECTION */}
          <div className="bg-[#151A2D] border-4 border-white/5 rounded-[7rem] p-20 shadow-4xl relative group">
            <div className="absolute left-0 top-24 w-4 h-64 bg-blue-600 rounded-r-full shadow-[0_0_60px_rgba(37,99,235,0.7)]" />

            <div className="flex justify-between items-center mb-20">
              <h2 className="text-6xl font-black uppercase italic flex items-center gap-12 text-white tracking-tighter leading-none">
                <span className="text-blue-600 text-[10rem] opacity-10 leading-none select-none">
                  CAPA
                </span>{" "}
                Actions Correctives
              </h2>
              <button
                onClick={() => setIsActionModalOpen(true)}
                disabled={nc.NC_Statut === NCStatus.CLOTURE}
                className="bg-blue-600 hover:bg-white hover:text-blue-600 disabled:opacity-20 px-16 py-8 rounded-[3rem] text-[13px] font-black uppercase text-white flex items-center gap-8 transition-all shadow-4xl active:scale-95 cursor-pointer border-none italic"
              >
                <Plus size={32} strokeWidth={4} /> Lancer CAPA
              </button>
            </div>

            <div className="grid gap-12">
              {nc?.Actions?.length > 0 ? (
                nc.Actions.map((action: IAction) => (
                  <div
                    key={action.ACT_Id}
                    className="p-16 bg-black/40 border-4 border-white/5 rounded-[5rem] flex items-center justify-between italic hover:border-blue-600/40 transition-all group/item shadow-inner"
                  >
                    <div className="flex items-center gap-12">
                      <div
                        className={cn(
                          "w-28 h-28 rounded-4xl flex items-center justify-center shadow-2xl transition-all border-4",
                          action.ACT_Status === ActionStatus.TERMINEE
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-[#0B0F1A] text-slate-800 border-white/5",
                        )}
                      >
                        <Hammer
                          size={48}
                          className={
                            action.ACT_Status === ActionStatus.A_FAIRE
                              ? "animate-pulse text-blue-600"
                              : ""
                          }
                        />
                      </div>
                      <div className="text-left">
                        <p className="text-4xl font-black uppercase text-white tracking-tighter leading-none mb-5 group-hover/item:text-blue-500 transition-colors italic">
                          {action.ACT_Title}
                        </p>
                        <div className="flex items-center gap-10 text-[13px] font-black text-slate-500 uppercase italic tracking-[0.4em] leading-none">
                          <Calendar size={22} className="text-blue-600" />{" "}
                          ÉCHÉANCE :{" "}
                          {new Date(action.ACT_Deadline!).toLocaleDateString()}
                          <span className="text-slate-800">•</span>
                          <span className="text-blue-600/50">
                            SMI REF: {action.ACT_Id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "px-14 py-6 rounded-[2.5rem] text-[14px] font-black uppercase italic border-2 tracking-[0.8em] shadow-2xl",
                        action.ACT_Status === ActionStatus.TERMINEE
                          ? "bg-emerald-600 text-white border-transparent"
                          : "bg-[#0F172A] text-slate-700 border-white/5",
                      )}
                    >
                      {action.ACT_Status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-48 border-8 border-dashed border-white/5 rounded-[7rem] text-center flex flex-col items-center justify-center opacity-10 italic">
                  <Activity className="text-slate-500 mb-16" size={120} />
                  <p className="text-4xl text-slate-600 uppercase font-black italic tracking-[1em] leading-relaxed">
                    CAPA Registry Empty
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 🚀 MODAL CAPA SDE (Saturation RD 2030) */}
      {isActionModalOpen && (
        <div className="fixed inset-0 bg-[#0B0F1A]/98 backdrop-blur-3xl z-200 flex items-center justify-center p-16 animate-in zoom-in-95 duration-500">
          <div className="bg-[#151A2D] border-4 border-white/10 rounded-[8rem] p-32 w-full max-w-4xl shadow-[0_0_150px_rgba(0,0,0,1)] text-left italic relative overflow-hidden">
            <Zap
              className="absolute -right-20 -top-20 text-blue-600 opacity-5"
              size={400}
            />
            <header className="mb-20 border-b-4 border-white/5 pb-16 relative z-10">
              <h3 className="text-7xl font-black uppercase italic text-white tracking-tighter leading-none mb-8">
                Initialiser <span className="text-blue-600">CAPA</span>
              </h3>
              <p className="text-slate-600 text-[14px] font-black uppercase tracking-[0.8em] italic leading-none">
                Correction de l&apos;Écart NC-
                {nc.NC_Code || id.slice(0, 8).toUpperCase()}
              </p>
            </header>
            <form
              onSubmit={creerAction}
              className="space-y-16 relative z-10 text-left"
            >
              <div className="space-y-8 text-left">
                <label className="text-[16px] font-black uppercase text-slate-500 ml-12 block italic tracking-[0.6em] leading-none">
                  Libellé de la Mesure Corrective *
                </label>
                <input
                  autoFocus
                  required
                  value={newActionTitle}
                  onChange={(e) => setNewActionTitle(e.target.value)}
                  className="w-full bg-black/40 border-4 border-white/10 rounded-[4rem] p-12 text-3xl font-black italic text-white outline-none focus:border-blue-600 shadow-inner tracking-tighter"
                  placeholder="NOMMER L'ACTION D'AMÉLIORATION..."
                />
              </div>
              <div className="space-y-8 text-left">
                <label className="text-[16px] font-black uppercase text-slate-500 ml-12 block italic tracking-[0.6em] leading-none">
                  Échéance de Réalisation SDE
                </label>
                <input
                  required
                  type="date"
                  value={newActionDeadline}
                  onChange={(e) => setNewActionDeadline(e.target.value)}
                  className="w-full bg-black/40 border-4 border-white/10 rounded-[4rem] p-12 text-3xl font-black italic text-white outline-none focus:border-blue-600 shadow-inner uppercase cursor-pointer"
                />
              </div>
              <div className="flex gap-12 pt-20">
                <button
                  type="button"
                  onClick={() => setIsActionModalOpen(false)}
                  className="flex-1 py-10 bg-white/5 hover:bg-white/10 rounded-[3rem] text-[14px] font-black uppercase text-slate-700 transition-all border-none cursor-pointer italic"
                >
                  Abandonner
                </button>
                <button
                  type="submit"
                  className="flex-3 py-10 bg-blue-600 hover:bg-white hover:text-blue-600 rounded-[3rem] text-[14px] font-black uppercase text-white shadow-4xl transition-all border-none active:scale-95 cursor-pointer leading-none italic"
                >
                  Valider Action Corrective
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🧩 FOOTER (§10.2.2) */}
      <footer className="mt-56 pt-24 border-t-8 border-white/5 flex justify-between items-center opacity-20 w-full max-w-500 mx-auto group">
        <div className="flex items-center gap-12">
          <Fingerprint
            size={80}
            className="text-red-600 group-hover:rotate-360 transition-all duration-4000"
            strokeWidth={2.5}
          />
          <div className="text-left">
            <p className="text-[18px] font-black uppercase tracking-[2em] text-slate-500 italic leading-none">
              Tableau de Bord CAPA
            </p>
            <p className="text-[14px] font-bold text-slate-700 uppercase tracking-[1em] mt-6 italic leading-none">
              Moteur souverain • Integrated Quality Registry
            </p>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="w-6 h-6 rounded-full bg-red-600 animate-pulse shadow-[0_0_20px_red]" />
          <div className="w-6 h-6 rounded-full bg-blue-600 shadow-[0_0_20px_blue]" />
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        input::placeholder,
        textarea::placeholder {
          font-style: italic;
          opacity: 0.1;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5em;
          color: white;
        }
      `}</style>
    </div>
  );
}

/** 🏷️ SOUS-COMPOSANTS DE PRODUCTION */

function DataField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-8 group/field">
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/5 group-hover/field:border-white/10 transition-all">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic mb-2 leading-none">
          {label}
        </p>
        <p className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}
