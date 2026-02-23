/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛠️ MODULE : SESSION INTERACTIVE DE REVUE
 * -------------------------------------------------------------------------
 * RÔLE : Interface de saisie des analyses. Workflow de double signature.
 * CONSOLIDATION : Restauration des champs Risques & Ressources manquants.
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Cpu,
  ExternalLink,
  Info,
  Loader2,
  PenTool,
  Printer,
  Save,
  ShieldAlert,
  ShieldCheck,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

export default function RevueSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Le modèle INTÉGRAL restauré
  const [formData, setFormData] = useState({
    performance: "",
    audit: "",
    risk: "",
    resources: "",
    decisions: "",
  });

  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const loadData = useCallback(async () => {
    try {
      const res = await apiClient.get(`/process-reviews/${id}`);
      setReview(res.data);
      setFormData({
        performance: res.data.PRV_PerformanceAnalysis || "",
        audit: res.data.PRV_AuditAnalysis || "",
        risk: res.data.PRV_RiskAnalysis || "",
        resources: res.data.PRV_ResourcesAnalysis || "",
        decisions: res.data.PRV_Decisions || "",
      });
    } catch (err) {
      toast.error("Échec de connexion à la session SDE.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) loadData();
  }, [id, loadData]);

  const handleSave = async () => {
    setSaving(true);
    const tid = toast.loading("Scellage du brouillon dans le noyau...");
    try {
      await apiClient.put(`/process-reviews/${id}`, formData);
      toast.success("Brouillon scellé dans le SMI", { id: tid });
    } catch (e) {
      toast.error("Erreur critique de persistance", { id: tid });
    } finally {
      setSaving(false);
    }
  };

  const handleSign = async () => {
    if (review.PRV_Status === "VALIDEE") return;

    const isDirectionSigning = review.PRV_PiloteSigned;
    const msg = isDirectionSigning
      ? "SCELLAGE FINAL : Voulez-vous clôturer cette revue et déclencher les actions PAQ ?"
      : "VISA PILOTE : Voulez-vous valider notre analyse de performance ?";

    if (!confirm(msg)) return;

    const tid = toast.loading("Authentification et Signature...");
    try {
      const res = await apiClient.post(`/process-reviews/${id}/sign`);
      setReview(res.data);
      if (res.data.PRV_Status === "VALIDEE") {
        toast.success("REVUE CLÔTURÉE : Décisions injectées dans le PAQ.", {
          id: tid,
        });
      } else {
        toast.success(
          "VISA ENREGISTRÉ : En attente de la signature Direction.",
          { id: tid },
        );
      }
    } catch (e) {
      toast.error("Échec de l'authentification de signature.", { id: tid });
    }
  };

  if (loading || !review)
    return (
      <div className="ml-72 h-screen flex items-center justify-center bg-[#0B0F1A] text-white italic font-black animate-pulse uppercase tracking-[0.5em] gap-8">
        <Loader2 size={64} className="animate-spin text-blue-600" />{" "}
        Sécurisation de la séance interactive...
      </div>
    );

  return (
    <div className="ml-72 p-12 bg-[#0B0F1A] min-h-screen text-white italic pb-64 font-sans selection:bg-blue-600/30 text-left overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER & STATUT DES VISAS */}
      <header className="flex justify-between items-start mb-24 border-b-4 border-white/5 pb-16 w-full max-w-7xl mx-auto animate-in fade-in duration-700">
        <div className="space-y-8">
          <button
            onClick={() => router.push("/dashboard/process-review")}
            className="text-slate-500 flex items-center gap-4 uppercase font-black text-[11px] hover:text-white transition-all border-none bg-transparent cursor-pointer italic tracking-widest"
          >
            <ArrowLeft size={18} /> Retour Registre Central
          </button>
          <div className="space-y-4">
            <h1 className="text-7xl font-black uppercase tracking-tighter italic leading-none">
              Revue <span className="text-blue-600">Mensuelle</span>
            </h1>
            <div className="flex items-center gap-8 mt-6">
              <span className="bg-blue-600 px-8 py-3 rounded-2xl text-[14px] font-black uppercase tracking-[0.3em] italic shadow-[0_10px_30px_rgba(37,99,235,0.3)]">
                {months[review.PRV_Month - 1]} {review.PRV_Year}
              </span>
              <span className="text-slate-400 font-black uppercase text-[12px] tracking-[0.4em] flex items-center gap-4 italic leading-none">
                <Target size={18} className="text-blue-500" /> Processus :{" "}
                {review.PRV_Processus?.PR_Libelle}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          <div
            className={`p-10 rounded-[3rem] border-2 transition-all duration-700 relative overflow-hidden ${review.PRV_PiloteSigned ? "bg-emerald-500/10 border-emerald-500/30 shadow-2xl" : "bg-slate-900/50 border-white/5 opacity-50"}`}
          >
            <p className="text-[11px] font-black text-slate-500 uppercase mb-4 italic tracking-[0.3em] text-left leading-none">
              Visa Pilote Rapporteur
            </p>
            <div className="flex items-center gap-4 text-left">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${review.PRV_PiloteSigned ? "bg-emerald-500 text-slate-950 shadow-lg" : "bg-slate-800"}`}
              >
                {review.PRV_PiloteSigned ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <AlertCircle size={24} />
                )}
              </div>
              <span
                className={`text-[13px] font-black uppercase italic ${review.PRV_PiloteSigned ? "text-emerald-500" : "text-slate-600"}`}
              >
                {review.PRV_PiloteSigned ? "Approuvé" : "En attente"}
              </span>
            </div>
          </div>

          <div
            className={`p-10 rounded-[3rem] border-2 transition-all duration-700 relative overflow-hidden ${review.PRV_RQSigned ? "bg-emerald-500/10 border-emerald-500/30 shadow-2xl" : "bg-slate-900/50 border-white/5 opacity-50"}`}
          >
            <p className="text-[11px] font-black text-slate-500 uppercase mb-4 italic tracking-[0.3em] text-left leading-none">
              Visa Direction / RQ
            </p>
            <div className="flex items-center gap-4 text-left">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${review.PRV_RQSigned ? "bg-emerald-500 text-slate-950 shadow-lg" : "bg-slate-800"}`}
              >
                {review.PRV_RQSigned ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <ShieldCheck size={24} />
                )}
              </div>
              <span
                className={`text-[13px] font-black uppercase italic ${review.PRV_RQSigned ? "text-emerald-500" : "text-slate-600"}`}
              >
                {review.PRV_RQSigned ? "Validé" : "En attente"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ✍️ ZONE DE TRAVAIL INTÉGRALE (4 CHAMPS D'ANALYSE + DÉCISIONS) */}
      <div className="w-full max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <section className="bg-[#151A2D] p-16 rounded-[4.5rem] border-2 border-white/5 space-y-10 shadow-2xl">
            <h2 className="text-[12px] font-black text-blue-500 uppercase flex items-center gap-5 italic tracking-[0.3em] leading-none">
              <Info size={28} /> 1. Analyse de Performance (KPI)
            </h2>
            <textarea
              className="w-full bg-slate-950/60 border-2 border-white/10 rounded-[3rem] p-12 min-h-62.5 text-slate-200 font-bold text-lg focus:border-blue-600 transition-all outline-none leading-relaxed resize-none shadow-inner italic"
              value={formData.performance}
              onChange={(e) =>
                setFormData({ ...formData, performance: e.target.value })
              }
              placeholder="Saisissez l'analyse quantitative des résultats..."
              disabled={review.PRV_Status === "VALIDEE"}
            />
          </section>

          <section className="bg-[#151A2D] p-16 rounded-[4.5rem] border-2 border-white/5 space-y-10 shadow-2xl">
            <h2 className="text-[12px] font-black text-red-500 uppercase flex items-center gap-5 italic tracking-[0.3em] leading-none">
              <ClipboardList size={28} /> 2. Revues des Audits & Non-Conformités
            </h2>
            <textarea
              className="w-full bg-slate-950/60 border-2 border-white/10 rounded-[3rem] p-12 min-h-62.5 text-slate-200 font-bold text-lg focus:border-red-600 transition-all outline-none leading-relaxed resize-none shadow-inner italic"
              value={formData.audit}
              onChange={(e) =>
                setFormData({ ...formData, audit: e.target.value })
              }
              placeholder="Saisissez l'analyse des écarts constatés..."
              disabled={review.PRV_Status === "VALIDEE"}
            />
          </section>

          <section className="bg-[#151A2D] p-16 rounded-[4.5rem] border-2 border-white/5 space-y-10 shadow-2xl">
            <h2 className="text-[12px] font-black text-amber-500 uppercase flex items-center gap-5 italic tracking-[0.3em] leading-none">
              <ShieldAlert size={28} /> 3. Évolution des Risques & Opportunités
            </h2>
            <textarea
              className="w-full bg-slate-950/60 border-2 border-white/10 rounded-[3rem] p-12 min-h-62.5 text-slate-200 font-bold text-lg focus:border-amber-600 transition-all outline-none leading-relaxed resize-none shadow-inner italic"
              value={formData.risk}
              onChange={(e) =>
                setFormData({ ...formData, risk: e.target.value })
              }
              placeholder="Saisissez l'évolution de la cartographie des risques..."
              disabled={review.PRV_Status === "VALIDEE"}
            />
          </section>

          <section className="bg-[#151A2D] p-16 rounded-[4.5rem] border-2 border-white/5 space-y-10 shadow-2xl">
            <h2 className="text-[12px] font-black text-purple-500 uppercase flex items-center gap-5 italic tracking-[0.3em] leading-none">
              <Cpu size={28} /> 4. Besoins en Ressources (RH, Infra, SI)
            </h2>
            <textarea
              className="w-full bg-slate-950/60 border-2 border-white/10 rounded-[3rem] p-12 min-h-62.5 text-slate-200 font-bold text-lg focus:border-purple-600 transition-all outline-none leading-relaxed resize-none shadow-inner italic"
              value={formData.resources}
              onChange={(e) =>
                setFormData({ ...formData, resources: e.target.value })
              }
              placeholder="Définir les besoins matériels, humains ou financiers..."
              disabled={review.PRV_Status === "VALIDEE"}
            />
          </section>
        </div>

        <section className="bg-linear-to-br from-blue-600/10 to-emerald-600/10 p-16 rounded-[5.5rem] border-4 border-white/5 space-y-12 shadow-3xl flex flex-col">
          <h2 className="text-4xl font-black text-emerald-500 uppercase flex items-center gap-8 italic leading-none tracking-tighter">
            <Target size={48} /> 5. Décisions Stratégiques & Mutations (PAQ)
          </h2>
          <textarea
            className="flex-1 w-full bg-slate-950/80 border-2 border-emerald-500/20 rounded-[4rem] p-16 min-h-87.5 text-white font-black text-3xl focus:border-emerald-600 transition-all outline-none shadow-2xl italic leading-tight placeholder:text-slate-800"
            value={formData.decisions}
            onChange={(e) =>
              setFormData({ ...formData, decisions: e.target.value })
            }
            placeholder="ENTREZ VOS DÉCISIONS ICI (1 PAR LIGNE)..."
            disabled={review.PRV_Status === "VALIDEE"}
          />

          {review.PRV_Status === "VALIDEE" && (
            <div className="bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[3.5rem] p-12 mt-12 animate-in slide-in-from-bottom-6 duration-700">
              <div className="flex items-center justify-between mb-10">
                <h4 className="text-emerald-500 font-black uppercase text-[12px] tracking-[0.4em] flex items-center gap-4 italic">
                  <CheckCircle2 size={24} /> Actions injectées au Plan Qualité
                </h4>
                <button
                  onClick={() => router.push("/dashboard/paq")}
                  className="text-[12px] font-black uppercase text-slate-500 hover:text-white flex items-center gap-4 transition-all border-none bg-transparent cursor-pointer italic leading-none"
                >
                  Ouvrir le PAQ <ExternalLink size={18} />
                </button>
              </div>
              <div className="space-y-6 opacity-90 italic text-xl font-bold">
                {formData.decisions
                  .split("\n")
                  .filter((l) => l.trim() !== "")
                  .map((line, idx) => (
                    <div
                      key={idx}
                      className="flex gap-6 text-slate-300 border-b border-white/5 pb-6 last:border-0 leading-tight"
                    >
                      <span className="text-emerald-500 font-black text-2xl leading-none">
                        »
                      </span>{" "}
                      {line}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 🚀 BARRE D'ACTIONS SOUVERAINE FIXE */}
      <div className="fixed bottom-16 left-[calc(50%+144px)] -translate-x-1/2 z-50 flex gap-8 bg-[#0F172A]/90 backdrop-blur-3xl p-8 rounded-[4rem] border-2 border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-10 duration-700 w-max">
        <button
          onClick={() => router.push(`/dashboard/process-review/report/${id}`)}
          className="flex items-center gap-5 px-12 py-8 bg-white/5 hover:bg-white/10 text-white rounded-[3rem] font-black uppercase text-[11px] tracking-[0.4em] transition-all border-none cursor-pointer italic"
        >
          <Printer size={24} /> Générer PV PDF
        </button>
        <button
          onClick={handleSave}
          disabled={saving || review.PRV_Status === "VALIDEE"}
          className="flex items-center gap-5 px-14 py-8 bg-white/5 hover:bg-white/10 text-white rounded-[3rem] font-black uppercase text-[11px] tracking-[0.4em] transition-all disabled:opacity-20 border-none cursor-pointer italic"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <Save size={24} />
          )}{" "}
          Valider Brouillon
        </button>
        <button
          onClick={handleSign}
          disabled={review.PRV_Status === "VALIDEE"}
          className={`flex items-center gap-5 px-16 py-8 rounded-[3rem] font-black uppercase text-[11px] tracking-[0.5em] shadow-3xl transition-all border-none cursor-pointer italic text-white ${review.PRV_Status === "VALIDEE" ? "bg-emerald-600 shadow-emerald-900/40 cursor-default" : "bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-blue-900/40"}`}
        >
          {review.PRV_Status === "VALIDEE" ? (
            <CheckCircle2 size={24} />
          ) : (
            <PenTool size={24} />
          )}
          {review.PRV_Status === "VALIDEE"
            ? "REVUE SCELLÉE DANS LE SMI"
            : "Signer & Clôturer Session"}
        </button>
      </div>
    </div>
  );
}
