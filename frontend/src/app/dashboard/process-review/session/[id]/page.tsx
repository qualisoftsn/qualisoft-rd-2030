/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛠️ MODULE : SESSION INTERACTIVE DE REVUE
 * -------------------------------------------------------------------------
 * RÔLE : Interface de saisie des analyses. Workflow de double signature.
 * ARCHITECTURE : Zéro NextAuth, Typage strict du formulaire SDE.
 * DATE : 02 Mars 2026 | 13:01 GMT
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

  // Le modèle INTÉGRAL restauré (4 champs d'analyse + décisions)
  const [formData, setFormData] = useState({
    performance: "",
    audit: "",
    risk: "",
    resources: "",
    decisions: "",
  });

  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const loadData = useCallback(async () => {
    try {
      const res = await apiClient.get(`/process-reviews/${id}`);
      const data = res.data?.data || res.data;
      setReview(data);
      setFormData({
        performance: data.PRV_PerformanceAnalysis || "",
        audit: data.PRV_AuditAnalysis || "",
        risk: data.PRV_RiskAnalysis || "",
        resources: data.PRV_ResourcesAnalysis || "",
        decisions: data.PRV_Decisions || "",
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
      await apiClient.put(`/process-reviews/${id}`, {
        PRV_PerformanceAnalysis: formData.performance,
        PRV_AuditAnalysis: formData.audit,
        PRV_RiskAnalysis: formData.risk,
        PRV_ResourcesAnalysis: formData.resources,
        PRV_Decisions: formData.decisions,
      });
      toast.success("Brouillon scellé dans le SMI", { id: tid });
    } catch (e) {
      toast.error("Erreur critique de persistance de la Matrix", { id: tid });
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

    const tid = toast.loading("Authentification et Signature en cours...");
    try {
      const res = await apiClient.post(`/process-reviews/${id}/sign`);
      const updatedData = res.data?.data || res.data;
      setReview(updatedData);
      
      if (updatedData.PRV_Status === "VALIDEE") {
        toast.success("REVUE CLÔTURÉE : Décisions injectées dans le PAQ.", { id: tid });
      } else {
        toast.success("VISA ENREGISTRÉ : En attente de la signature Direction.", { id: tid });
      }
    } catch (e) {
      toast.error("Échec de l'authentification de signature.", { id: tid });
    }
  };

  if (loading || !review)
    return (
      <div className="ml-0 lg:ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-white italic font-black animate-pulse uppercase tracking-[0.3em] lg:tracking-[0.5em] gap-6 text-center px-6">
        <Loader2 size={50} className="lg:w-16 lg:h-16 animate-spin text-blue-600" />
        Sécurisation de la séance interactive...
      </div>
    );

  return (
    <div className="ml-0 lg:ml-72 p-6 lg:p-12 bg-[#0B0F1A] min-h-screen text-white italic pb-64 lg:pb-64 font-sans selection:bg-blue-600/30 text-left overflow-x-hidden relative">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER & STATUT DES VISAS */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-16 lg:mb-24 border-b-2 lg:border-b-4 border-white/5 pb-10 lg:pb-16 w-full max-w-7xl mx-auto animate-in fade-in duration-700 gap-10">
        <div className="space-y-6 lg:space-y-8 w-full xl:w-auto">
          <button
            onClick={() => router.push("/dashboard/process-review")}
            className="text-slate-500 flex items-center gap-3 lg:gap-4 uppercase font-black text-[10px] lg:text-[11px] hover:text-white transition-all border-none bg-transparent cursor-pointer italic tracking-[0.2em] lg:tracking-widest m-0"
          >
            <ArrowLeft size={16} className="lg:w-4.5 lg:h-4.5" /> Retour Registre Central
          </button>
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none m-0">
              Revue <span className="text-blue-600">Mensuelle</span>
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-8 mt-4 lg:mt-6">
              <span className="bg-blue-600 px-6 py-2.5 lg:px-8 lg:py-3 rounded-xl lg:rounded-2xl text-[12px] lg:text-[14px] font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] italic shadow-[0_10px_30px_rgba(37,99,235,0.3)] w-max">
                {months[review.PRV_Month - 1] || review.PRV_Month} {review.PRV_Year}
              </span>
              <span className="text-slate-400 font-black uppercase text-[10px] lg:text-[12px] tracking-[0.2em] lg:tracking-[0.4em] flex items-center gap-3 lg:gap-4 italic leading-tight m-0">
                <Target size={16} className="text-blue-500 shrink-0 lg:w-4.5 lg:h-4.5" /> 
                Processus : {review.PRV_Processus?.PR_Libelle || 'NON SPÉCIFIÉ'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 lg:gap-8 w-full xl:w-auto">
          <div className={`flex-1 p-6 lg:p-10 rounded-4xl lg:rounded-[3rem] border-2 transition-all duration-700 relative overflow-hidden ${review.PRV_PiloteSigned ? "bg-emerald-500/10 border-emerald-500/30 shadow-2xl" : "bg-slate-900/50 border-white/5 opacity-50"}`}>
            <p className="text-[9px] lg:text-[11px] font-black text-slate-500 uppercase mb-3 lg:mb-4 italic tracking-[0.2em] lg:tracking-[0.3em] text-left leading-none m-0">
              Visa Pilote Rapporteur
            </p>
            <div className="flex items-center gap-3 lg:gap-4 text-left">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center shrink-0 ${review.PRV_PiloteSigned ? "bg-emerald-500 text-slate-950 shadow-lg" : "bg-slate-800"}`}>
                {review.PRV_PiloteSigned ? <CheckCircle2 size={20} className="lg:w-6 lg:h-6" /> : <AlertCircle size={20} className="lg:w-6 lg:h-6" />}
              </div>
              <span className={`text-[11px] lg:text-[13px] font-black uppercase italic m-0 leading-tight ${review.PRV_PiloteSigned ? "text-emerald-500" : "text-slate-500"}`}>
                {review.PRV_PiloteSigned ? "Approuvé" : "En attente"}
              </span>
            </div>
          </div>

          <div className={`flex-1 p-6 lg:p-10 rounded-4xl lg:rounded-[3rem] border-2 transition-all duration-700 relative overflow-hidden ${review.PRV_RQSigned ? "bg-emerald-500/10 border-emerald-500/30 shadow-2xl" : "bg-slate-900/50 border-white/5 opacity-50"}`}>
            <p className="text-[9px] lg:text-[11px] font-black text-slate-500 uppercase mb-3 lg:mb-4 italic tracking-[0.2em] lg:tracking-[0.3em] text-left leading-none m-0">
              Visa Direction / RQ
            </p>
            <div className="flex items-center gap-3 lg:gap-4 text-left">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center shrink-0 ${review.PRV_RQSigned ? "bg-emerald-500 text-slate-950 shadow-lg" : "bg-slate-800"}`}>
                {review.PRV_RQSigned ? <CheckCircle2 size={20} className="lg:w-6 lg:h-6" /> : <ShieldCheck size={20} className="lg:w-6 lg:h-6" />}
              </div>
              <span className={`text-[11px] lg:text-[13px] font-black uppercase italic m-0 leading-tight ${review.PRV_RQSigned ? "text-emerald-500" : "text-slate-500"}`}>
                {review.PRV_RQSigned ? "Validé" : "En attente"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ✍️ ZONE DE TRAVAIL INTÉGRALE (4 CHAMPS D'ANALYSE + DÉCISIONS) */}
      <div className="w-full max-w-7xl mx-auto space-y-8 lg:space-y-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          <section className="bg-[#151A2D] p-8 lg:p-16 rounded-[3rem] lg:rounded-[4.5rem] border lg:border-2 border-white/5 space-y-6 lg:space-y-10 shadow-2xl flex flex-col">
            <h2 className="text-[10px] lg:text-[12px] font-black text-blue-500 uppercase flex items-center gap-3 lg:gap-5 italic tracking-[0.2em] lg:tracking-[0.3em] leading-tight m-0">
              <Info size={24} className="lg:w-7 lg:h-7 shrink-0" /> 1. Analyse de Performance (KPI)
            </h2>
            <textarea
              className="flex-1 w-full bg-slate-950/60 border lg:border-2 border-white/10 rounded-4xl lg:rounded-[3rem] p-6 lg:p-12 min-h-50 lg:min-h-62.5 text-slate-200 font-bold text-sm lg:text-lg focus:border-blue-600 transition-all outline-none leading-relaxed resize-none shadow-inner italic m-0"
              value={formData.performance}
              onChange={(e) => setFormData({ ...formData, performance: e.target.value })}
              placeholder="Saisissez l'analyse quantitative des résultats..."
              disabled={review.PRV_Status === "VALIDEE"}
            />
          </section>

          <section className="bg-[#151A2D] p-8 lg:p-16 rounded-[3rem] lg:rounded-[4.5rem] border lg:border-2 border-white/5 space-y-6 lg:space-y-10 shadow-2xl flex flex-col">
            <h2 className="text-[10px] lg:text-[12px] font-black text-red-500 uppercase flex items-center gap-3 lg:gap-5 italic tracking-[0.2em] lg:tracking-[0.3em] leading-tight m-0">
              <ClipboardList size={24} className="lg:w-7 lg:h-7 shrink-0" /> 2. Revues des Audits & Non-Conformités
            </h2>
            <textarea
              className="flex-1 w-full bg-slate-950/60 border lg:border-2 border-white/10 rounded-4xl lg:rounded-[3rem] p-6 lg:p-12 min-h-50 lg:min-h-62.5 text-slate-200 font-bold text-sm lg:text-lg focus:border-red-600 transition-all outline-none leading-relaxed resize-none shadow-inner italic m-0"
              value={formData.audit}
              onChange={(e) => setFormData({ ...formData, audit: e.target.value })}
              placeholder="Saisissez l'analyse des écarts constatés..."
              disabled={review.PRV_Status === "VALIDEE"}
            />
          </section>

          <section className="bg-[#151A2D] p-8 lg:p-16 rounded-[3rem] lg:rounded-[4.5rem] border lg:border-2 border-white/5 space-y-6 lg:space-y-10 shadow-2xl flex flex-col">
            <h2 className="text-[10px] lg:text-[12px] font-black text-amber-500 uppercase flex items-center gap-3 lg:gap-5 italic tracking-[0.2em] lg:tracking-[0.3em] leading-tight m-0">
              <ShieldAlert size={24} className="lg:w-7 lg:h-7 shrink-0" /> 3. Évolution des Risques & Opportunités
            </h2>
            <textarea
              className="flex-1 w-full bg-slate-950/60 border lg:border-2 border-white/10 rounded-4xl lg:rounded-[3rem] p-6 lg:p-12 min-h-50 lg:min-h-62.5 text-slate-200 font-bold text-sm lg:text-lg focus:border-amber-600 transition-all outline-none leading-relaxed resize-none shadow-inner italic m-0"
              value={formData.risk}
              onChange={(e) => setFormData({ ...formData, risk: e.target.value })}
              placeholder="Saisissez l'évolution de la cartographie des risques..."
              disabled={review.PRV_Status === "VALIDEE"}
            />
          </section>

          <section className="bg-[#151A2D] p-8 lg:p-16 rounded-[3rem] lg:rounded-[4.5rem] border lg:border-2 border-white/5 space-y-6 lg:space-y-10 shadow-2xl flex flex-col">
            <h2 className="text-[10px] lg:text-[12px] font-black text-purple-500 uppercase flex items-center gap-3 lg:gap-5 italic tracking-[0.2em] lg:tracking-[0.3em] leading-tight m-0">
              <Cpu size={24} className="lg:w-7 lg:h-7 shrink-0" /> 4. Besoins en Ressources (RH, Infra, SI)
            </h2>
            <textarea
              className="flex-1 w-full bg-slate-950/60 border lg:border-2 border-white/10 rounded-4xl lg:rounded-[3rem] p-6 lg:p-12 min-h-50 lg:min-h-62.5 text-slate-200 font-bold text-sm lg:text-lg focus:border-purple-600 transition-all outline-none leading-relaxed resize-none shadow-inner italic m-0"
              value={formData.resources}
              onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
              placeholder="Définir les besoins matériels, humains ou financiers..."
              disabled={review.PRV_Status === "VALIDEE"}
            />
          </section>
        </div>

        <section className="bg-linear-to-br from-blue-600/10 to-emerald-600/10 p-8 lg:p-16 rounded-[3rem] lg:rounded-[5.5rem] border-2 lg:border-4 border-white/5 space-y-8 lg:space-y-12 shadow-2xl flex flex-col">
          <h2 className="text-2xl lg:text-4xl font-black text-emerald-500 uppercase flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-8 italic leading-tight lg:leading-none tracking-tighter m-0">
            <Target size={40} className="lg:w-12 lg:h-12 shrink-0" /> 5. Décisions Stratégiques & Mutations (PAQ)
          </h2>
          <textarea
            className="flex-1 w-full bg-slate-950/80 border lg:border-2 border-emerald-500/20 rounded-4xl lg:rounded-[4rem] p-8 lg:p-16 min-h-62.5 lg:min-h-87.5 text-white font-black text-xl lg:text-3xl focus:border-emerald-500 transition-all outline-none shadow-2xl italic leading-tight placeholder:text-slate-800 m-0"
            value={formData.decisions}
            onChange={(e) => setFormData({ ...formData, decisions: e.target.value })}
            placeholder="ENTREZ VOS DÉCISIONS ICI (1 PAR LIGNE)..."
            disabled={review.PRV_Status === "VALIDEE"}
          />

          {review.PRV_Status === "VALIDEE" && (
            <div className="bg-emerald-500/10 border lg:border-2 border-emerald-500/20 rounded-[2.5rem] lg:rounded-[3.5rem] p-8 lg:p-12 mt-8 lg:mt-12 animate-in slide-in-from-bottom-6 duration-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 lg:mb-10">
                <h4 className="text-emerald-500 font-black uppercase text-[10px] lg:text-[12px] tracking-[0.2em] lg:tracking-[0.4em] flex items-center gap-3 lg:gap-4 italic m-0 leading-snug">
                  <CheckCircle2 size={20} className="lg:w-6 lg:h-6 shrink-0" /> Actions injectées au Plan Qualité
                </h4>
                <button
                  onClick={() => router.push("/dashboard/paq")}
                  className="text-[10px] lg:text-[12px] font-black uppercase text-slate-400 hover:text-white flex items-center gap-2 lg:gap-4 transition-all border-none bg-transparent cursor-pointer italic leading-none m-0 w-max"
                >
                  Ouvrir le PAQ <ExternalLink size={16} className="lg:w-4.5 lg:h-4.5" />
                </button>
              </div>
              <div className="space-y-4 lg:space-y-6 opacity-90 italic text-base lg:text-xl font-bold">
                {(formData.decisions || "")
                  .split("\n")
                  .filter((l) => l.trim() !== "")
                  .map((line, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 lg:gap-6 text-slate-300 border-b border-white/5 pb-4 lg:pb-6 last:border-0 leading-tight"
                    >
                      <span className="text-emerald-500 font-black text-xl lg:text-2xl leading-none shrink-0">
                        »
                      </span>
                      {line}
                    </div>
                  ))}
                {(!formData.decisions || formData.decisions.trim() === "") && (
                  <div className="text-slate-500 text-sm">Aucune décision renseignée.</div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 🚀 BARRE D'ACTIONS SOUVERAINE FIXE (RÉPONSIVE) */}
      <div className="fixed bottom-6 left-4 right-4 lg:left-[calc(50%+144px)] lg:right-auto lg:-translate-x-1/2 z-50 flex flex-col sm:flex-row gap-4 lg:gap-8 bg-[#0F172A]/95 backdrop-blur-3xl p-4 lg:p-8 rounded-4xl lg:rounded-[4rem] border lg:border-2 border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-10 duration-700 lg:w-max">
        <button
          onClick={() => router.push(`/dashboard/process-review/report/${id}`)}
          className="flex flex-1 justify-center sm:flex-none items-center gap-3 lg:gap-5 px-6 py-4 lg:px-12 lg:py-8 bg-white/5 hover:bg-white/10 text-white rounded-3xl lg:rounded-[3rem] font-black uppercase text-[10px] lg:text-[11px] tracking-[0.2em] lg:tracking-[0.4em] transition-all border-none cursor-pointer italic m-0"
        >
          <Printer size={18} className="lg:w-6 lg:h-6" /> <span className="hidden sm:inline">Générer</span> PV PDF
        </button>
        <button
          onClick={handleSave}
          disabled={saving || review.PRV_Status === "VALIDEE"}
          className="flex flex-1 justify-center sm:flex-none items-center gap-3 lg:gap-5 px-6 py-4 lg:px-14 lg:py-8 bg-white/5 hover:bg-white/10 text-white rounded-3xl lg:rounded-[3rem] font-black uppercase text-[10px] lg:text-[11px] tracking-[0.2em] lg:tracking-[0.4em] transition-all disabled:opacity-30 border-none cursor-pointer italic m-0"
        >
          {saving ? <Loader2 className="animate-spin lg:w-6 lg:h-6" size={18} /> : <Save size={18} className="lg:w-6 lg:h-6" />} 
          Sauvegarder
        </button>
        <button
          onClick={handleSign}
          disabled={review.PRV_Status === "VALIDEE"}
          className={`flex flex-1 justify-center sm:flex-none items-center gap-3 lg:gap-5 px-6 py-4 lg:px-16 lg:py-8 rounded-3xl lg:rounded-[3rem] font-black uppercase text-[10px] lg:text-[11px] tracking-[0.2em] lg:tracking-[0.5em] shadow-xl lg:shadow-3xl transition-all border-none cursor-pointer italic text-white m-0 ${review.PRV_Status === "VALIDEE" ? "bg-emerald-600 shadow-emerald-900/40 cursor-default" : "bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-blue-900/40"}`}
        >
          {review.PRV_Status === "VALIDEE" ? <CheckCircle2 size={18} className="lg:w-6 lg:h-6" /> : <PenTool size={18} className="lg:w-6 lg:h-6" />}
          {review.PRV_Status === "VALIDEE" ? "SCELLÉ DANS LE SMI" : "Signer & Clôturer"}
        </button>
      </div>
    </div>
  );
}