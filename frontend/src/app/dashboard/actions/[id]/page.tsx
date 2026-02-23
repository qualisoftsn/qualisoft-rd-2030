/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ POSTE DE PILOTAGE TACTIQUE - ACTION CORRECTIVE / PRÉVENTIVE
 * -------------------------------------------------------------------------
 * RÉFÉRENTIEL : types/elite-sde.ts (§10.2 ISO 9001)
 * ENVIRONNEMENT : Production - Multi-Tenant Isolation
 * CALCULS : Délais et Efficacité en temps réel (Base 2026)
 * DESIGN : Full-Space Matrix (max-w-500)
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Fingerprint,
  Info,
  Loader2,
  Printer,
  Save,
  ShieldCheck,
  TrendingUp,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

// --- 🏗️ RÉFÉRENTIEL ÉLITE-SDE STRICT ---
import { ActionStatus, Priority } from "@/types/elite-sde";

import EvidenceSection from "../id/evidence-section";

// --- 🛠️ UTILITAIRES DE CALCUL ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return "00/00/0000";
  return new Intl.DateTimeFormat("fr-FR").format(new Date(date));
};

export default function DetailActionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const actionId = resolvedParams.id;

  // --- 📦 ÉTATS DE PRODUCTION ---
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMutating, setIsMutating] = useState<boolean>(false);

  // Formulaire synchrone avec le Noyau
  const [rapport, setRapport] = useState<string>("");
  const [currentStatus, setCurrentStatus] = useState<ActionStatus>(
    ActionStatus.A_FAIRE,
  );

  /**
   * 📡 SYNCHRONISATION KERNEL
   */
  const syncKernel = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/actions/${actionId}`);
      const actionData = res.data?.data || res.data;

      if (!actionData) throw new Error("NullData");

      setData(actionData);
      setRapport(actionData.ACT_Description || "");
      setCurrentStatus(actionData.ACT_Status as ActionStatus);
    } catch (e: any) {
      toast.error(
        `RUPTURE SDE : IMPOSSIBLE D'ACCÉDER À L'ACTION ${actionId.substring(0, 8)}`,
      );
      router.push("/dashboard/actions");
    } finally {
      setLoading(false);
    }
  }, [actionId, router]);

  useEffect(() => {
    syncKernel();
  }, [syncKernel]);

  /**
   * 📊 CALCULS DE PRODUCTION (DÉLAIS)
   */
  const stats = useMemo(() => {
    if (!data?.ACT_Deadline) return { daysLeft: 0, isOverdue: false };
    const deadline = new Date(data.ACT_Deadline).getTime();
    const now = new Date().getTime();
    const diff = deadline - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return {
      daysLeft: days < 0 ? Math.abs(days) : days,
      isOverdue: days < 0,
    };
  }, [data]);

  /**
   * 💾 SCELLAGE SDE (§10.2.1)
   */
  const commitChanges = async () => {
    setIsMutating(true);
    const tid = toast.loading("TRANSMISSION AU NOYAU...");
    try {
      await apiClient.patch(`/actions/${actionId}`, {
        ACT_Description: rapport,
        ACT_Status: currentStatus,
        ACT_CompletedAt:
          currentStatus === ActionStatus.TERMINEE
            ? new Date().toISOString()
            : null,
      });
      toast.success("MUTATION SCELLÉE DANS LE SMI", { id: tid });
      syncKernel();
    } catch {
      toast.error("ÉCHEC DE LA COMMUTATION SDE", { id: tid });
    } finally {
      setIsMutating(false);
    }
  };

  if (loading || !data)
    return (
      <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-12">
        <Loader2
          className="animate-spin text-blue-600"
          size={100}
          strokeWidth={1}
        />
        <span className="text-blue-500 font-black uppercase italic tracking-[1.5em] text-[12px] animate-pulse">
          Sync Production SDE...
        </span>
      </div>
    );

  return (
    <div className="p-16 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans text-left relative selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors />

      {/* 🔝 COCKPIT HEADER (max-w-500) */}
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
              <span className="px-6 py-2 bg-blue-600/20 text-blue-500 text-[12px] font-black uppercase tracking-[0.4em] rounded-xl border-2 border-blue-500/20 shadow-inner">
                ACTION NO: {data.ACT_Id.slice(0, 15).toUpperCase()}
              </span>
              <p className="text-slate-600 font-black text-[13px] uppercase tracking-[0.8em] italic leading-none">
                Command & Control Interface
              </p>
            </div>
            <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none text-white">
              {data.ACT_Title}
            </h1>
          </div>
        </div>

        <div className="flex gap-10">
          <button
            onClick={() => window.print()}
            className="px-16 py-8 bg-white/5 border-2 border-white/10 rounded-[3rem] text-[13px] font-black uppercase flex items-center gap-6 hover:bg-white/10 transition-all cursor-pointer italic"
          >
            <Printer size={32} /> Print Matrix
          </button>
          <button
            onClick={commitChanges}
            disabled={isMutating || data.ACT_Status === ActionStatus.TERMINEE}
            className="px-24 py-8 bg-blue-600 rounded-[3rem] text-[13px] font-black uppercase flex items-center gap-8 shadow-[0_20px_60px_rgba(37,99,235,0.4)] hover:bg-white hover:text-blue-600 transition-all border-none disabled:opacity-30 cursor-pointer group active:scale-95 italic"
          >
            {isMutating ? (
              <Loader2 className="animate-spin" size={32} />
            ) : (
              <Save size={32} />
            )}{" "}
            Valider CAPA
          </button>
        </div>
      </header>

      {/* 📊 MATRIX CORE (max-w-500) */}
      <main className="grid grid-cols-12 gap-20 w-full max-w-500 mx-auto items-start">
        {/* 📋 COLONNE ALPHA : MÉTADONNÉES BRUTES */}
        <div className="col-span-12 lg:col-span-4 space-y-16">
          {/* Commutateur de Statut Production */}
          <div className="bg-[#151A2D] border-4 border-white/5 rounded-[6rem] p-16 shadow-4xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] rotate-12">
              <TrendingUp size={250} />
            </div>

            <h3 className="text-[14px] font-black uppercase text-slate-500 mb-12 tracking-[1em] flex items-center gap-8 italic leading-none">
              <Activity size={28} className="text-blue-500" /> Cycle de Vie
            </h3>

            <div className="grid grid-cols-1 gap-6 relative z-10">
              {Object.values(ActionStatus).map((s) => (
                <button
                  key={s}
                  onClick={() => setCurrentStatus(s)}
                  disabled={data.ACT_Status === ActionStatus.TERMINEE}
                  className={cn(
                    "p-10 rounded-[3rem] border-2 font-black uppercase italic text-[13px] tracking-[0.5em] transition-all text-left flex items-center justify-between group/btn shadow-lg",
                    currentStatus === s
                      ? "bg-blue-600 border-transparent text-white shadow-2xl scale-105"
                      : "bg-black/20 border-white/5 text-slate-700 hover:border-blue-600/40 hover:text-slate-400 cursor-pointer",
                  )}
                >
                  {s.replace("_", " ")}
                  {currentStatus === s && (
                    <CheckCircle2
                      size={28}
                      className="animate-in zoom-in duration-500"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Analyse de Performance (Calculée) */}
          <div className="bg-[#151A2D] border-4 border-white/5 rounded-[6rem] p-16 shadow-4xl space-y-12 italic relative">
            <div className="flex items-center gap-10">
              <div
                className={cn(
                  "w-24 h-24 rounded-4xl flex items-center justify-center border-2 shadow-2xl transition-all",
                  stats.isOverdue
                    ? "bg-red-600/10 border-red-600/20 text-red-600"
                    : "bg-blue-600/10 border-blue-600/20 text-blue-600",
                )}
              >
                <Clock
                  size={40}
                  className={stats.isOverdue ? "animate-pulse" : ""}
                />
              </div>
              <div>
                <p className="text-[12px] font-black text-slate-600 uppercase tracking-widest italic mb-2">
                  {stats.isOverdue ? "Retard Constaté" : "Délai Restant"}
                </p>
                <p className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                  {stats.daysLeft} Jours
                </p>
              </div>
            </div>

            <div className="flex items-center gap-10">
              <div className="w-24 h-24 bg-amber-600/10 rounded-4xl flex items-center justify-center border-2 border-amber-600/20 shadow-2xl">
                <ShieldCheck size={40} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[12px] font-black text-slate-600 uppercase tracking-widest italic mb-2">
                  Priorité Indexée
                </p>
                <p
                  className={cn(
                    "text-3xl font-black uppercase tracking-tighter leading-none",
                    data.ACT_Priority === Priority.CRITICAL ||
                      data.ACT_Priority === Priority.HIGH
                      ? "text-red-500"
                      : "text-amber-500",
                  )}
                >
                  {data.ACT_Priority || "0"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-10">
              <div className="w-24 h-24 bg-emerald-600/10 rounded-4xl flex items-center justify-center border-2 border-emerald-500/20 shadow-2xl">
                <User size={40} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[12px] font-black text-slate-600 uppercase tracking-widest italic mb-2">
                  Responsable Pilote
                </p>
                <p className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                  {data.Responsable?.U_FirstName || "NON"}{" "}
                  {data.Responsable?.U_LastName || "ASSIGNÉ"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ⚙️ COLONNE BETA : EXÉCUTION & DOSSIER DE PREUVE */}
        <div className="col-span-12 lg:col-span-8 space-y-16">
          {/* Rapport de Réalisation Expert */}
          <div className="bg-[#151A2D] border-4 border-white/5 rounded-[7rem] p-20 shadow-4xl relative group">
            <div className="absolute left-0 top-24 w-4 h-64 bg-blue-600 rounded-r-full shadow-[0_0_60px_rgba(37,99,235,0.7)]" />

            <div className="flex justify-between items-center mb-20">
              <h2 className="text-6xl font-black uppercase italic flex items-center gap-12 text-white tracking-tighter leading-none">
                <span className="text-blue-600 text-[10rem] opacity-10 leading-none select-none">
                  ACT
                </span>{" "}
                Rapport d&apos;Exécution
              </h2>
              <div className="flex items-center gap-8 bg-white/5 px-12 py-6 rounded-[2.5rem] border-2 border-white/10 shadow-inner italic">
                <Info size={32} className="text-blue-500" />
                <span className="text-[14px] font-black text-slate-500 uppercase tracking-[0.5em] leading-none">
                  Preuve §10.2.1
                </span>
              </div>
            </div>

            <textarea
              value={rapport}
              onChange={(e) => setRapport(e.target.value)}
              disabled={data.ACT_Status === ActionStatus.TERMINEE}
              placeholder="SAISIE DU RAPPORT D'EXÉCUTION TECHNIQUE - AUCUNE SIMULATION TOLÉRÉE..."
              className="w-full p-24 bg-black/40 border-4 border-white/5 rounded-[6rem] text-4xl font-medium text-white outline-none focus:border-blue-600 min-h-150 leading-relaxed italic placeholder-slate-900 transition-all focus:bg-black/80 shadow-inner resize-none text-left"
            />

            <div className="mt-20 grid grid-cols-2 gap-16">
              <div className="p-12 bg-white/5 rounded-[5rem] border-2 border-white/10 flex items-center gap-12 italic shadow-2xl transition-all hover:bg-white/8">
                <div className="p-10 bg-blue-600 rounded-[2.5rem] shadow-lg shadow-blue-900/40">
                  <Calendar size={48} />
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-black text-slate-600 uppercase tracking-[0.6em] italic mb-3">
                    Target Date
                  </p>
                  <p className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                    {formatDate(data.ACT_Deadline)}
                  </p>
                </div>
              </div>
              <div className="p-12 bg-white/5 rounded-[5rem] border-2 border-white/10 flex items-center gap-12 italic shadow-2xl transition-all hover:bg-emerald-600/10">
                <div className="p-10 bg-emerald-600 rounded-[2.5rem] shadow-lg shadow-emerald-900/40">
                  <CheckCircle2 size={48} />
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-black text-slate-600 uppercase tracking-[0.6em] italic mb-3">
                    Clôture SDE
                  </p>
                  <p className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                    {formatDate(data.ACT_CompletedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dossier de Preuves SDE */}
          <EvidenceSection
            itemId={actionId}
            initialEvidences={data.Preuves || []}
          />
        </div>
      </main>

      {/* 🧩 FOOTER DE PRODUCTION (max-w-500) */}
      <footer className="mt-48 pt-24 border-t-8 border-white/5 flex justify-between items-center opacity-40 w-full max-w-500 mx-auto group">
        <div className="flex items-center gap-12">
          <Fingerprint
            size={60}
            className="text-blue-600 group-hover:rotate-360 transition-all duration-3000"
            strokeWidth={2.5}
          />
          <div className="text-left">
            <p className="text-[16px] font-black uppercase tracking-[1.5em] text-slate-500 italic leading-none">
              PRODUCTION SDE KERNEL
            </p>
            <p className="text-[13px] font-bold text-slate-700 uppercase tracking-[0.8em] mt-4 italic leading-none">
              Elite RD 2030 Matrix Infrastructure • Integrated CAPA Engine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-20">
          <div className="flex flex-col items-end italic">
            <span className="text-[14px] font-black text-slate-600 uppercase tracking-widest">
              SMI Audit Token
            </span>
            <span className="text-[18px] font-mono text-blue-900 mt-3 font-black">
              {data.ACT_Id.toUpperCase()}
            </span>
          </div>
          <div className="flex gap-8">
            <div className="w-6 h-6 rounded-full bg-blue-600 shadow-[0_0_30px_blue] animate-pulse" />
            <div className="w-6 h-6 rounded-full bg-emerald-600 shadow-[0_0_30px_emerald]" />
            <div className="w-6 h-6 rounded-full bg-slate-800" />
          </div>
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
        textarea::placeholder {
          font-style: italic;
          opacity: 0.1;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.6em;
          color: white;
        }
      `}</style>
    </div>
  );
}
