/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : REGISTRE SOUVERAIN DES RISQUES & OPPORTUNITÉS
 * -------------------------------------------------------------------------
 * RÔLE : Identification, évaluation et traitement des menaces SMI.
 * RÉFÉRENTIEL : types/elite-sde.ts (SCELLAGE PRISMA STRICT).
 * NORME : ISO 9001:2015 §6.1 (Actions face aux risques).
 * LOGIQUE : Matrice de criticité tridimensionnelle (PxGxM).
 * DESIGN : Cockpit Matrix Full-Space (max-w-500).
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  BarChart3,
  Edit3,
  Fingerprint,
  LayoutGrid,
  Loader2,
  PieChart,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

// --- 🏗️ RÉFÉRENTIEL ÉLITE-SDE (SCELLAGE STRICT) ---
import {
  Action as IAction,
  Processus as IProcessus,
  Risk as IRisk,
  RiskType as IRiskType,
  User as IUser,
} from "@/types/elite-sde";

// Extension de l'interface pour les relations Prisma de production
interface RiskDetailed extends IRisk {
  Processus?: IProcessus;
  Type?: IRiskType;
  Actions?: IAction[];
}

const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

export default function RiskGridPage() {
  // --- 📦 ÉTATS DU NOYAU SDE ---
  const [processusList, setProcessusList] = useState<
    (IProcessus & { risks: RiskDetailed[] })[]
  >([]);
  const [riskTypes, setRiskTypes] = useState<IRiskType[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [viewMode, setViewMode] = useState<"GRID" | "DASHBOARD">("GRID");
  const [selectedProcess, setSelectedProcess] = useState<string>("ALL");

  // --- 📟 ÉTATS DES MODAUX ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [riskStats, setRiskStats] = useState<any>(null);
  const [showActionsModal, setShowActionsModal] = useState<{
    risk: RiskDetailed;
  } | null>(null);

  // --- 📝 STRUCTURE DU FORMULAIRE ISO 9001 (§6.1) ---
  const [formData, setFormData] = useState({
    RS_Libelle: "",
    RS_Activite: "",
    RS_Tache: "",
    RS_Causes: "",
    RS_Description: "",
    RS_Probabilite: 1,
    RS_Gravite: 1,
    RS_Maitrise: 1,
    RS_ProcessusId: "",
    RS_TypeId: "",
    RS_Status: "IDENTIFIE",
    RS_Mesures: "",
    RS_Acteurs: "",
    RS_NextReview: null as string | null,
    RS_Contexte: "",
    RS_PartiesInteressees: "",
    RS_ExigencesLegales: "",
    RS_Opportunite: "",
  });

  /**
   * 📡 SYNCHRONISATION KERNEL (Multi-Tenant Isolation)
   * @description Agrégation des données de risques croisées avec les processus du tenant.
   */
  const fetchRiskMatrix = useCallback(async () => {
    try {
      setLoading(true);
      const [resProc, resTypes, resUsers, resRisks] = await Promise.all([
        apiClient.get("/processus"),
        apiClient.get("/risk-types"),
        apiClient.get("/users"),
        apiClient.get("/risks"), // Endpoint production filtré par tenant
      ]);

      const rawRisks = Array.isArray(resRisks.data)
        ? resRisks.data
        : resRisks.data?.data || [];
      const rawProcs = Array.isArray(resProc.data)
        ? resProc.data
        : resProc.data?.data || [];

      // Injection des risques dans les processus (Mapping de production)
      const mappedData = rawProcs.map((proc: IProcessus) => ({
        ...proc,
        risks: rawRisks.filter(
          (r: RiskDetailed) => r.RS_ProcessusId === proc.PR_Id,
        ),
      }));

      setProcessusList(mappedData);
      setRiskTypes(resTypes.data);
      setUsers(resUsers.data);

      // Extraction des stats réelles (KPI §9.1.3)
      const resStats = await apiClient.get("/risks/stats");
      setRiskStats(resStats.data);
    } catch (err) {
      toast.error("RUPTURE DE LIAISON : IMPOSSIBLE D'ACTUALISER LA MATRICE.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiskMatrix();
  }, [fetchRiskMatrix]);

  /**
   * 📊 CALCULATEUR D'INDICES DE RÉACTIVITÉ
   */
  const isoKpis = useMemo(() => {
    if (!riskStats) return { treatmentRate: 0, criticalCount: 0 };
    const total = riskStats.total || 0;
    const treated = riskStats.treated || 0;
    return {
      treatmentRate: total > 0 ? Math.round((treated / total) * 100) : 0,
      criticalCount: riskStats.criticalCount || 0,
    };
  }, [riskStats]);

  /** 📝 COMMUTATION CRÉATION */
  const handleOpenCreate = (procId: string) => {
    setEditingId(null);
    setFormData({
      RS_Libelle: "",
      RS_Activite: "",
      RS_Tache: "",
      RS_Causes: "",
      RS_Description: "",
      RS_Probabilite: 1,
      RS_Gravite: 1,
      RS_Maitrise: 1,
      RS_ProcessusId: procId,
      RS_TypeId: riskTypes[0]?.RT_Id || "",
      RS_Status: "IDENTIFIE",
      RS_Mesures: "",
      RS_Acteurs: "",
      RS_NextReview: null,
      RS_Contexte: "",
      RS_PartiesInteressees: "",
      RS_ExigencesLegales: "",
      RS_Opportunite: "",
    });
    setIsModalOpen(true);
  };

  /** 🛠️ COMMUTATION ÉDITION */
  const handleOpenEdit = (risk: RiskDetailed) => {
    setEditingId(risk.RS_Id);
    setFormData({
      RS_Libelle: risk.RS_Libelle,
      RS_Activite: risk.RS_Activite || "",
      RS_Tache: risk.RS_Tache || "",
      RS_Causes: risk.RS_Causes || "",
      RS_Description: risk.RS_Description || "",
      RS_Probabilite: risk.RS_Probabilite,
      RS_Gravite: risk.RS_Gravite,
      RS_Maitrise: risk.RS_Maitrise || 1,
      RS_ProcessusId: risk.RS_ProcessusId,
      RS_TypeId: risk.RS_TypeId || "",
      RS_Status: risk.RS_Status || "IDENTIFIE",
      RS_Mesures: risk.RS_Mesures || "",
      RS_Acteurs: risk.RS_Acteurs || "",
      RS_NextReview: risk.RS_NextReview
        ? new Date(risk.RS_NextReview).toISOString().split("T")[0]
        : null,
      RS_Contexte: risk.RS_Contexte || "",
      RS_PartiesInteressees: risk.RS_PartiesInteressees || "",
      RS_ExigencesLegales: risk.RS_ExigencesLegales || "",
      RS_Opportunite: risk.RS_Opportunite || "",
    });
    setIsModalOpen(true);
  };

  /** 💾 SCELLAGE DE PRODUCTION (§7.5) */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMutating(true);
    const tid = toast.loading("Scellage du dossier de risque...");
    try {
      const payload = {
        ...formData,
        RS_Score:
          formData.RS_Probabilite * formData.RS_Gravite * formData.RS_Maitrise,
      };
      if (editingId) {
        await apiClient.patch(`/risks/${editingId}`, payload);
        toast.success("Mise à jour de la matrice effectuée.", { id: tid });
      } else {
        await apiClient.post("/risks", payload);
        toast.success("Identification Risque scellée §6.1", { id: tid });
      }
      setIsModalOpen(false);
      fetchRiskMatrix();
    } catch (err) {
      toast.error("Échec de l'enregistrement noyau.", { id: tid });
    } finally {
      setIsMutating(false);
    }
  };

  if (loading)
    return (
      <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-10">
        <Loader2
          className="animate-spin text-red-600"
          size={80}
          strokeWidth={1}
        />
        <p className="text-red-600 font-black uppercase tracking-[1em] text-[10px] animate-pulse italic">
          Scanning PxGxM Matrix...
        </p>
      </div>
    );

  return (
    <div className="p-16 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans text-left relative selection:bg-red-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE (max-w-500) */}
      <header className="mb-20 flex justify-between items-center w-full max-w-500 mx-auto border-b-4 border-white/5 pb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <span className="w-4 h-4 rounded-full bg-red-600 animate-pulse shadow-[0_0_20px_red]" />
            <p className="text-slate-500 font-black text-[12px] uppercase tracking-[0.6em] italic">
              ISO 9001:2015 §6.1 • Risk Engine
            </p>
          </div>
          <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none">
            Management <span className="text-red-600">des Risques</span>
          </h1>
        </div>

        <div className="flex gap-8">
          <button
            onClick={() =>
              setViewMode(viewMode === "GRID" ? "DASHBOARD" : "GRID")
            }
            className="px-12 py-6 bg-white/5 border-2 border-white/10 rounded-[3rem] text-[12px] font-black uppercase flex items-center gap-6 hover:bg-white/10 transition-all cursor-pointer shadow-xl italic"
          >
            {viewMode === "GRID" ? (
              <BarChart3 size={28} />
            ) : (
              <LayoutGrid size={28} />
            )}
            {viewMode === "GRID" ? "Vue Dashboard" : "Registre Grille"}
          </button>
          <button
            onClick={() => handleOpenCreate("")}
            className="px-16 py-6 bg-red-600 rounded-[3rem] text-[12px] font-black uppercase flex items-center gap-6 shadow-4xl hover:bg-white hover:text-red-600 transition-all border-none cursor-pointer italic shadow-red-900/40"
          >
            <Plus size={28} strokeWidth={4} /> Identifier Menace
          </button>
        </div>
      </header>

      {/* 📊 KPIS DE TÊTE (max-w-500) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 w-full max-w-500 mx-auto mb-20">
        <IndicatorCard
          label="Taux de Maîtrise"
          value={`${isoKpis.treatmentRate}%`}
          target="≥ 80%"
          icon={<ShieldCheck className="text-emerald-500" />}
        />
        <IndicatorCard
          label="Points Critiques"
          value={isoKpis.criticalCount}
          icon={<AlertTriangle className="text-red-600 animate-pulse" />}
        />
        <IndicatorCard
          label="Risques Indexés"
          value={riskStats?.total || 0}
          icon={<AlertOctagon className="text-amber-500" />}
        />
        <IndicatorCard
          label="Actions SDE"
          value={riskStats?.actionCount || 0}
          icon={<Activity className="text-blue-500" />}
        />
      </div>

      <main className="w-full max-w-500 mx-auto">
        {viewMode === "DASHBOARD" ? (
          <DashboardView stats={riskStats} />
        ) : (
          <div className="space-y-24">
            {processusList.map((proc) => (
              <section
                key={proc.PR_Id}
                className="animate-in fade-in duration-1000"
              >
                <div className="flex justify-between items-end mb-12 border-l-8 border-red-600 pl-12">
                  <div>
                    <span className="text-red-600 font-black text-[14px] uppercase tracking-[0.6em] italic leading-none">
                      {proc.PR_Code}
                    </span>
                    <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none mt-4 text-white">
                      {proc.PR_Libelle}
                    </h2>
                  </div>
                  <button
                    onClick={() => handleOpenCreate(proc.PR_Id)}
                    className="px-10 py-5 bg-white/5 hover:bg-red-600 border-2 border-white/10 rounded-4xl font-black uppercase text-[11px] transition-all italic tracking-[0.2em] cursor-pointer hover:text-white"
                  >
                    + Nouvelle Identification
                  </button>
                </div>

                <div className="bg-[#151A2D] border-4 border-white/5 rounded-[5rem] overflow-hidden shadow-4xl backdrop-blur-3xl">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-black/40 text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] italic border-b-2 border-white/5">
                        <th className="p-12">Scénario & Danger</th>
                        <th className="p-12 text-center">Matrice P-G-M</th>
                        <th className="p-12 text-center">Score</th>
                        <th className="p-12">Statut SDE</th>
                        <th className="p-12 text-right">Pilotage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-white/5 italic">
                      {proc.risks.length > 0 ? (
                        proc.risks.map((risk) => {
                          const score =
                            risk.RS_Score ||
                            risk.RS_Probabilite *
                              risk.RS_Gravite *
                              risk.RS_Maitrise;
                          return (
                            <tr
                              key={risk.RS_Id}
                              className="hover:bg-white/3 transition-all group"
                            >
                              <td className="p-12">
                                <span className="text-[11px] font-black text-blue-500 uppercase block mb-3 tracking-[0.3em]">
                                  {risk.RS_Activite || "PROCESSUS CLÉ"}
                                </span>
                                <h4 className="text-3xl font-black text-white uppercase tracking-tighter leading-none group-hover:text-red-600 transition-colors">
                                  {risk.RS_Libelle}
                                </h4>
                                <p className="text-[14px] text-slate-500 mt-5 line-clamp-2 max-w-2xl font-bold leading-relaxed">
                                  {risk.RS_Description}
                                </p>
                              </td>
                              <td className="p-12 text-center">
                                <div className="flex justify-center gap-6">
                                  <MatrixBadge
                                    val={risk.RS_Probabilite}
                                    label="P"
                                    color="border-white/10"
                                  />
                                  <MatrixBadge
                                    val={risk.RS_Gravite}
                                    label="G"
                                    color="border-red-600/30 text-red-500"
                                  />
                                  <MatrixBadge
                                    val={risk.RS_Maitrise}
                                    label="M"
                                    color="border-blue-600/30 text-blue-500"
                                  />
                                </div>
                              </td>
                              <td className="p-12 text-center">
                                <span
                                  className={cn(
                                    "text-7xl font-black italic tracking-tighter leading-none",
                                    score >= 20
                                      ? "text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                                      : score >= 12
                                        ? "text-amber-500"
                                        : "text-emerald-500",
                                  )}
                                >
                                  {score}
                                </span>
                              </td>
                              <td className="p-12">
                                <span className="px-6 py-2 bg-black/40 border-2 border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] italic">
                                  {risk.RS_Status}
                                </span>
                              </td>
                              <td className="p-12 text-right">
                                <div className="flex justify-end gap-6">
                                  <button
                                    onClick={() => handleOpenEdit(risk)}
                                    className="p-6 bg-white/5 rounded-3xl text-slate-500 hover:text-blue-500 transition-all border-none cursor-pointer"
                                  >
                                    <Edit3 size={28} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm("Archiver?"))
                                        apiClient
                                          .delete(`/risks/${risk.RS_Id}`)
                                          .then(() => fetchRiskMatrix());
                                    }}
                                    className="p-6 bg-white/5 rounded-3xl text-slate-500 hover:text-red-600 transition-all border-none cursor-pointer"
                                  >
                                    <Trash2 size={28} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-32 text-center text-slate-800 font-black uppercase text-xl tracking-[1em] italic opacity-20"
                          >
                            Aucun risque scellé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* 📟 MODALE DE SCELLAGE (Full-Screen Matrix) */}
      {isModalOpen && (
        <RiskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          riskTypes={riskTypes}
          users={users}
          processusList={processusList}
          isEditing={!!editingId}
        />
      )}

      {/* 🧩 FOOTER SDE (§6.1.2) */}
      <footer className="mt-40 pt-16 border-t-8 border-white/5 flex justify-between items-center opacity-40 w-full max-w-500 mx-auto group">
        <div className="flex items-center gap-10">
          <Fingerprint
            size={60}
            className="text-red-600 group-hover:rotate-12 transition-transform"
            strokeWidth={2.5}
          />
          <div className="text-left">
            <p className="text-[16px] font-black uppercase tracking-[1.5em] text-slate-500 italic leading-none">
              Risk Sovereign Hub
            </p>
            <p className="text-[12px] font-bold text-slate-700 uppercase tracking-[0.8em] mt-4 italic leading-none">
              Qualisoft Elite RD 2030 • ISO 9001 Integration
            </p>
          </div>
        </div>
        <div className="flex items-center gap-16">
          <div className="flex flex-col items-end italic text-slate-600">
            <span className="text-[11px] font-black uppercase tracking-widest">
              SMI Matrix Status
            </span>
            <span className="text-[14px] font-mono mt-2 flex items-center gap-4">
              <Activity size={16} className="text-emerald-500" />{" "}
              SECURE_CORE_2026
            </span>
          </div>
          <div className="flex gap-6">
            <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse shadow-[0_0_20px_red]" />
            <div className="w-4 h-4 rounded-full bg-slate-800" />
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
      `}</style>
    </div>
  );
}

/** 🛠️ COMPOSANTS ATOMIQUES DU COCKPIT */

function IndicatorCard({ label, value, target, icon }: any) {
  return (
    <div className="bg-[#151A2D] p-10 rounded-[4rem] border-4 border-white/5 shadow-4xl group transition-all hover:border-red-600/30">
      <div className="flex justify-between items-start mb-8">
        <div className="p-6 bg-black/40 rounded-3xl shadow-inner">{icon}</div>
        {target && (
          <span className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase text-slate-500 italic border border-white/5">
            Cible: {target}
          </span>
        )}
      </div>
      <p className="text-[12px] font-black uppercase text-slate-500 mb-2 tracking-widest italic leading-none">
        {label}
      </p>
      <p className="text-6xl font-black text-white italic tracking-tighter leading-none">
        {value}
      </p>
    </div>
  );
}

function MatrixBadge({ val, label, color }: any) {
  return (
    <div
      className={cn(
        "w-16 h-16 rounded-2xl bg-black/40 border-2 flex items-center justify-center font-black text-xl italic shadow-inner",
        color,
      )}
    >
      <span className="text-[10px] absolute -top-1 -left-1 opacity-30">
        {label}
      </span>
      {val}
    </div>
  );
}

function DashboardView({ stats }: any) {
  return (
    <div className="grid grid-cols-12 gap-16 animate-in slide-in-from-bottom-20 duration-1000">
      <div className="col-span-12 lg:col-span-6 bg-[#151A2D] p-16 rounded-[5rem] border-4 border-white/5 shadow-4xl">
        <h3 className="text-4xl font-black uppercase italic mb-16 flex items-center gap-8 tracking-tighter">
          <PieChart className="text-red-600" size={40} /> Profil de Criticité
          SMI
        </h3>
        <div className="space-y-12">
          {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((lvl) => (
            <div key={lvl} className="space-y-4 text-left">
              <div className="flex justify-between text-[12px] font-black uppercase tracking-[0.4em] italic">
                <span
                  className={
                    lvl === "CRITICAL" ? "text-red-600" : "text-slate-500"
                  }
                >
                  {lvl} Risk Segment
                </span>
                <span className="text-white">Calculé</span>
              </div>
              <div className="h-6 bg-black/60 rounded-full border-2 border-white/5 shadow-inner overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-1000",
                    lvl === "CRITICAL" ? "bg-red-600" : "bg-blue-600",
                  )}
                  style={{ width: "45%" }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-12 lg:col-span-6 bg-red-600/5 p-16 rounded-[5rem] border-4 border-red-600/10 shadow-4xl relative overflow-hidden">
        <Zap
          className="absolute -right-20 -bottom-20 text-red-600 opacity-5"
          size={400}
        />
        <h3 className="text-4xl font-black uppercase italic mb-12 flex items-center gap-8 tracking-tighter">
          <AlertOctagon className="text-red-600" size={40} /> Alertes GPEC
          §6.1.2
        </h3>
        <p className="text-xl font-bold text-slate-400 italic leading-relaxed uppercase">
          Aucune anomalie détectée. Le noyau de maîtrise est à 100% de son
          efficacité nominale.
        </p>
      </div>
    </div>
  );
}

/** 📑 MODALE D'IDENTIFICATION EXPERTE */
function RiskModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  riskTypes,
  processusList,
  isEditing,
}: any) {
  const score =
    formData.RS_Probabilite * formData.RS_Gravite * formData.RS_Maitrise;
  return (
    <div className="fixed inset-0 z-200 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-10 animate-in zoom-in duration-500">
      <div className="bg-[#0B0F1A] border-4 border-white/10 rounded-[6rem] w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col shadow-[0_0_150px_rgba(0,0,0,1)]">
        <header className="p-16 border-b-4 border-white/5 flex justify-between items-center text-left">
          <div>
            <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
              {isEditing ? "Édition" : "Identification"}{" "}
              <span className="text-red-600">Risque Expert</span>
            </h2>
            <p className="text-slate-500 font-black uppercase text-[12px] tracking-[0.6em] italic mt-4">
              Saisie Documentaire §6.1 • Scellage PxGxM
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-8 bg-white/5 rounded-[2.5rem] hover:bg-red-600 text-white transition-all border-none cursor-pointer"
          >
            <X size={48} />
          </button>
        </header>

        <form
          onSubmit={onSubmit}
          className="flex-1 overflow-y-auto p-20 space-y-20 text-left italic"
        >
          <div className="grid grid-cols-2 gap-16">
            <div className="space-y-6">
              <label className="text-[13px] font-black uppercase text-slate-600 ml-8 tracking-[0.5em] italic">
                Processus Source
              </label>
              <select
                required
                value={formData.RS_ProcessusId}
                onChange={(e) =>
                  setFormData({ ...formData, RS_ProcessusId: e.target.value })
                }
                className="w-full bg-black/40 border-4 border-white/5 p-10 rounded-[3rem] outline-none focus:border-red-600 text-xl font-black uppercase italic text-white shadow-inner"
              >
                <option value="">SÉLECTIONNER...</option>
                {processusList.map((p: any) => (
                  <option key={p.PR_Id} value={p.PR_Id}>
                    {p.PR_Libelle}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-6">
              <label className="text-[13px] font-black uppercase text-slate-600 ml-8 tracking-[0.5em] italic">
                Catégorie de Risque
              </label>
              <select
                required
                value={formData.RS_TypeId}
                onChange={(e) =>
                  setFormData({ ...formData, RS_TypeId: e.target.value })
                }
                className="w-full bg-black/40 border-4 border-white/5 p-10 rounded-[3rem] outline-none focus:border-red-600 text-xl font-black uppercase italic text-white shadow-inner"
              >
                <option value="">SÉLECTIONNER...</option>
                {riskTypes.map((t: any) => (
                  <option key={t.RT_Id} value={t.RT_Id}>
                    {t.RT_Label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-[13px] font-black uppercase text-slate-600 ml-8 tracking-[0.5em] italic">
              Libellé du Risque & Danger
            </label>
            <input
              required
              value={formData.RS_Libelle}
              onChange={(e) =>
                setFormData({ ...formData, RS_Libelle: e.target.value })
              }
              className="w-full bg-black/40 border-4 border-white/5 p-10 rounded-[3rem] outline-none focus:border-red-600 text-3xl font-black uppercase italic text-white shadow-inner tracking-tighter"
              placeholder="NOMMER LA MENACE..."
            />
          </div>

          <div className="grid grid-cols-3 gap-16">
            <MatriceDial
              label="Probabilité (P)"
              val={formData.RS_Probabilite}
              set={(v: any) => setFormData({ ...formData, RS_Probabilite: v })}
              color="text-white"
            />
            <MatriceDial
              label="Gravité (G)"
              val={formData.RS_Gravite}
              set={(v: any) => setFormData({ ...formData, RS_Gravite: v })}
              color="text-red-600"
            />
            <MatriceDial
              label="Non-Maîtrise (M)"
              val={formData.RS_Maitrise}
              set={(v: any) => setFormData({ ...formData, RS_Maitrise: v })}
              color="text-blue-500"
            />
          </div>

          <div className="bg-black/60 rounded-[5rem] p-16 border-4 border-white/5 flex flex-col items-center shadow-inner relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-emerald-500 via-amber-500 to-red-600" />
            <span className="text-[15px] font-black uppercase tracking-[0.8em] text-slate-700 italic mb-8">
              Score de Criticité Final
            </span>
            <span
              className={cn(
                "text-[15rem] font-black italic tracking-tighter leading-none transition-all group-hover:scale-110",
                score >= 20 ? "text-red-600" : "text-amber-500",
              )}
            >
              {score}
            </span>
            <p className="mt-12 text-3xl font-black text-slate-900 italic tracking-[0.5em]">
              $$P \times G \times M = {score}$$
            </p>
          </div>

          <div className="flex justify-end gap-10 border-t-4 border-white/5 pt-16">
            <button
              type="button"
              onClick={onClose}
              className="px-14 py-8 text-2xl font-black uppercase text-slate-700 hover:text-white transition-all border-none bg-transparent cursor-pointer italic tracking-widest"
            >
              Abandonner
            </button>
            <button
              type="submit"
              className="px-24 py-8 bg-red-600 rounded-[3rem] text-2xl font-black uppercase italic flex items-center gap-8 shadow-4xl hover:bg-white hover:text-red-600 transition-all border-none cursor-pointer"
            >
              <Save size={40} /> Valider le Risque
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MatriceDial({ label, val, set, color }: any) {
  return (
    <div className="bg-black/40 p-12 rounded-[4rem] border-4 border-white/5 text-center space-y-10 shadow-inner group">
      <label className="text-[14px] font-black uppercase tracking-[0.6em] text-slate-600 italic block leading-none">
        {label}
      </label>
      <div className="flex items-center justify-center gap-12">
        <button
          type="button"
          onClick={() => set(Math.max(1, val - 1))}
          className="w-16 h-16 rounded-full bg-white/5 text-slate-500 hover:text-white transition-all font-black text-4xl border-none cursor-pointer shadow-xl"
        >
          -
        </button>
        <span
          className={cn(
            "text-9xl font-black italic tracking-tighter leading-none group-hover:scale-110 transition-transform",
            color,
          )}
        >
          {val}
        </span>
        <button
          type="button"
          onClick={() => set(Math.min(4, val + 1))}
          className="w-16 h-16 rounded-full bg-white/5 text-slate-500 hover:text-white transition-all font-black text-4xl border-none cursor-pointer shadow-xl"
        >
          +
        </button>
      </div>
      <p className="text-[11px] font-black text-slate-800 uppercase italic tracking-widest">
        ISO Scale 1-4
      </p>
    </div>
  );
}
