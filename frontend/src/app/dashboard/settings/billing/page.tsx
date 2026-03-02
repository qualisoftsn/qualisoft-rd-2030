/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE ABSOLU : src/app/dashboard/settings/billing/page.tsx
 * ---------------------------------------------------------------------------
 * RÔLE : Pilotage de la licence d'instance Qualisoft RD 2030 (Variante 2).
 * MARCHÉ : Support Wave / Orange Money (Sénégal).
 * SÉCURITÉ : 100% apiClient (NextAuth éliminé).
 * DATE DE RÉVISION : 02 Mars 2026 | 14:32 GMT
 * ---------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  AlertCircle,
  Calendar,
  Check,
  Crown,
  Loader2,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

// --- 💎 RÉFÉRENTIEL DES PLANS ÉLITE ---
const PLANS = [
  {
    id: "EMERGENCE",
    name: "Émergence",
    price: "55.000",
    rawPrice: 55000,
    users: "1 RQ / 3 Pilotes",
    features: ["GED SMQ Fondamentale", "Gestion des NC", "Actions Correctives"],
    color: "border-slate-800",
  },
  {
    id: "CROISSANCE",
    name: "Croissance",
    price: "105.000",
    rawPrice: 105000,
    users: "1 RQ / 6 Pilotes",
    features: ["Tout Émergence", "Matrice de Compétences", "Analyses & KPI"],
    color: "border-blue-600/30",
  },
  {
    id: "PRO",
    name: "Entreprise",
    price: "175.000",
    rawPrice: 175000,
    users: "2 RQ / 10 Pilotes",
    features: ["Tout Croissance", "Audits Internes", "Gestion des Risques"],
    color: "border-emerald-500/30",
  },
  {
    id: "GROUPE",
    name: "Groupe",
    price: "350.000",
    rawPrice: 350000,
    users: "Utilisateurs Illimités",
    features: [
      "SMI Illimité",
      "Multi-sites / Multi-filiales",
      "API & Intégration",
    ],
    color: "border-amber-500/30",
  },
];

interface SubscriptionStatus {
  T_Name?: string;
  plan?: string;
  planName?: string;
  status?: string;
}

export default function BillingAltPage() {
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionStatus>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- ÉTATS DU TUNNEL ---
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedPlanForPay, setSelectedPlanForPay] = useState<any>(null);
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState("WAVE");

  const fetchCurrentPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get("/subscriptions/my-plan");
      setCurrentSubscription(res.data || {});
    } catch (err: any) {
      console.error("Erreur API Billing:", err);
      setError(
        err.message === "Network Error"
          ? "Le serveur Qualisoft est injoignable."
          : "Erreur critique de chargement des données de facturation."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentPlan();
  }, [fetchCurrentPlan]);

  const handleConfirmPayment = async () => {
    if (!reference.trim()) {
      toast.error("Référence de transaction obligatoire.");
      return;
    }

    setSubmitting(true);
    const tid = toast.loading("Transmission de la preuve en cours...");
    try {
      await apiClient.post("/transactions", {
        TX_Amount: selectedPlanForPay.rawPrice,
        TX_Reference: reference.trim().toUpperCase(),
        TX_PaymentMethod: method,
        TX_PlanRequested: selectedPlanForPay.id,
      });
      toast.success("Preuve scellée. Activation sous 48h.", { id: tid });
      setShowProofModal(false);
      setReference("");
    } catch (err) {
      toast.error("Échec de transmission de la preuve.", { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F1A] ml-0 lg:ml-72 text-blue-500 italic">
        <Loader2 className="animate-spin mb-6 w-12 h-12" strokeWidth={2} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse m-0">
          Vérification des Droits d&apos;Instance...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#0B0F1A] min-h-screen lg:h-screen ml-0 lg:ml-72 text-white italic font-sans overflow-x-hidden relative selection:bg-blue-600/30">
      <Toaster position="top-right" />
      
      {/* 🛰️ HEADER : IDENTITÉ */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-8 lg:pb-10 mb-8 lg:mb-12 animate-in fade-in duration-700 gap-6">
        <div className="text-left">
          <div className="flex items-center gap-3 text-amber-500 mb-3 lg:mb-4 font-black uppercase tracking-[0.3em] lg:tracking-[0.4em] text-[9px] lg:text-[10px]">
            <Crown size={16} /> Système Qualisoft RD 2030
          </div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none italic m-0">
            Gestion <span className="text-blue-600">Licence</span>
          </h1>
        </div>
        <div className="text-left md:text-right space-y-3 w-full md:w-auto">
          <p className="text-slate-500 text-[9px] lg:text-[10px] font-black uppercase tracking-widest italic m-0">
            Instance Active : <span className="text-white">{currentSubscription?.T_Name || "N/A"}</span>
          </p>
          <div className="flex items-center md:justify-end gap-4">
            <span className="bg-blue-600/10 text-blue-500 border border-blue-500/20 px-6 lg:px-8 py-2.5 lg:py-3 rounded-md font-black text-[10px] lg:text-xs uppercase italic shadow-sm w-full md:w-auto text-center">
              {currentSubscription?.planName || "ESSAI"} EDITION • {currentSubscription?.status || "TRIAL"}
            </span>
          </div>
        </div>
      </header>

      {/* ⚠️ ALERTE RÉSEAU */}
      {error && (
        <div className="mb-8 lg:mb-10 p-6 lg:p-8 bg-red-500/10 border border-red-500/20 rounded-4xl flex flex-col sm:flex-row items-start sm:items-center gap-5 lg:gap-6 text-red-500 animate-in slide-in-from-top-4">
          <AlertCircle size={28} className="shrink-0" />
          <div className="text-left">
            <p className="text-xs lg:text-sm font-black uppercase tracking-tighter m-0">Interruption du Noyau Billing</p>
            <p className="text-[9px] lg:text-[10px] font-bold opacity-70 uppercase mt-1 italic tracking-widest m-0">{error}</p>
          </div>
        </div>
      )}

      

      {/* 📊 GRILLE DES PLANS TARIFAIRES */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 mb-16 overflow-y-auto custom-scrollbar pr-2 pb-6">
        {PLANS.map((plan) => {
          const isCurrent = currentSubscription?.plan === plan.id;
          return (
            <div
              key={plan.id}
              className={`p-8 lg:p-10 rounded-[2.5rem] lg:rounded-[3.5rem] border-2 flex flex-col bg-slate-900/40 transition-all duration-500 group relative overflow-hidden ${
                isCurrent
                  ? "border-blue-600 scale-100 xl:scale-105 shadow-[0_15px_40px_rgba(37,99,235,0.2)] z-10"
                  : "border-white/5 hover:border-white/10"
              }`}
            >
              {isCurrent && (
                <div className="absolute -right-4 -top-4 bg-blue-600 p-6 rounded-full shadow-2xl">
                  <Check size={18} className="text-white" strokeWidth={4} />
                </div>
              )}

              <h3 className="text-2xl lg:text-3xl font-black uppercase mb-4 lg:mb-6 italic tracking-tighter text-left group-hover:text-blue-400 transition-colors m-0">
                {plan.name}
              </h3>

              <div className="mb-8 lg:mb-10 text-left">
                <span className="text-4xl lg:text-5xl font-black italic tracking-tighter leading-none text-white">
                  {plan.price}
                </span>
                <span className="text-slate-500 text-[9px] lg:text-[10px] block font-black uppercase mt-2 lg:mt-3 italic tracking-widest">
                  FCFA / ANNUEL
                </span>
              </div>

              {/* LISTE CAPACITÉS */}
              <ul className="space-y-4 mb-10 lg:mb-12 flex-1 text-left">
                <li className="flex items-center gap-3 text-[9px] lg:text-[10px] font-black text-blue-500 uppercase italic border-b border-white/5 pb-3">
                  <Calendar size={14} className="shrink-0" /> {plan.users}
                </li>
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[10px] lg:text-[11px] font-bold text-slate-300 uppercase italic tracking-tight">
                    <Check size={14} className="text-emerald-500 shrink-0" strokeWidth={3} /> {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => { setSelectedPlanForPay(plan); setShowProofModal(true); }}
                disabled={isCurrent}
                className={`w-full py-5 lg:py-6 rounded-3xl lg:rounded-4xl font-black uppercase text-[9px] lg:text-[10px] italic transition-all border-none cursor-pointer tracking-[0.2em] lg:tracking-[0.3em] active:scale-95 m-0 ${
                  isCurrent
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/30"
                }`}
              >
                {isCurrent ? "PLAN ACTUEL" : "ACTIVER L'ÉDITION"}
              </button>
            </div>
          );
        })}
      </div>

      {/* 📟 TUNNEL DE PAIEMENT (WAVE/OM) */}
      {showProofModal && selectedPlanForPay && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 lg:p-6 animate-in zoom-in duration-300">
          <div className="bg-[#0B0F1A] border border-white/10 w-full max-w-xl rounded-[3rem] lg:rounded-[4rem] p-8 lg:p-12 relative shadow-[0_0_80px_rgba(0,0,0,0.8)] text-left flex flex-col max-h-[95vh]">
            <button
              onClick={() => setShowProofModal(false)}
              className="absolute top-6 right-6 lg:top-10 lg:right-10 text-slate-500 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors border-none bg-transparent cursor-pointer z-10"
            >
              <X size={28} />
            </button>

            <div className="overflow-y-auto custom-scrollbar pr-2">
              <header className="mb-8 lg:mb-12 mt-4 lg:mt-0">
                <h2 className="text-3xl lg:text-4xl font-black uppercase italic mb-4 leading-none tracking-tighter text-white m-0">
                  Règlement <span className="text-blue-600">Manuel</span>
                </h2>
                <div className="flex items-start lg:items-center gap-4 p-4 lg:p-5 bg-blue-600/5 border border-blue-500/10 rounded-3xl italic mt-6">
                  <ShieldCheck className="text-blue-500 shrink-0 mt-1 lg:mt-0" size={20} />
                  <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed m-0">
                    Validation sécurisée via rapprochement des flux bancaires (Sénégal).
                  </p>
                </div>
              </header>

              <div className="space-y-6 lg:space-y-8">
                {/* INFO PRIX */}
                <div className="p-6 lg:p-8 bg-white/5 rounded-4xl border border-white/5 flex justify-between items-center shadow-inner">
                  <span className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase italic tracking-widest">Montant à transférer</span>
                  <span className="text-2xl lg:text-3xl font-black italic text-white leading-none">{selectedPlanForPay.price} XOF</span>
                </div>

                {/* SÉLECTEUR MÉTHODE */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setMethod("WAVE")}
                    className={`py-4 lg:py-5 rounded-3xl font-black text-[9px] lg:text-[10px] uppercase italic transition-colors border-2 cursor-pointer ${method === "WAVE" ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-transparent text-slate-500 hover:text-white"}`}
                  >
                    WAVE (+221 ...)
                  </button>
                  <button
                    onClick={() => setMethod("ORANGE_MONEY")}
                    className={`py-4 lg:py-5 rounded-3xl font-black text-[9px] lg:text-[10px] uppercase italic transition-colors border-2 cursor-pointer ${method === "ORANGE_MONEY" ? "bg-orange-600 border-orange-500 text-white" : "bg-white/5 border-transparent text-slate-500 hover:text-white"}`}
                  >
                    ORANGE MONEY
                  </button>
                </div>

                {/* CHAMP RÉFÉRENCE */}
                <div className="space-y-3">
                  <label className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 ml-4 italic tracking-widest">Référence de Transaction SMS *</label>
                  <input
                    required
                    className="w-full bg-[#0F172A] border-2 border-white/10 rounded-4xl p-5 lg:p-6 text-lg lg:text-xl font-black text-blue-500 uppercase italic outline-none focus:border-blue-600 shadow-inner transition-colors"
                    placeholder="EX: CI230102.12..."
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>

                <div className="p-5 lg:p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl italic">
                  <p className="text-[8px] lg:text-[9px] text-amber-500/80 font-black uppercase tracking-widest leading-relaxed m-0 text-center">
                    Note : activation dans un délai de 24h à 48h après confirmation physique du crédit.
                  </p>
                </div>

                <button
                  onClick={handleConfirmPayment}
                  disabled={!reference || submitting}
                  className="w-full py-6 lg:py-8 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 rounded-4xl font-black uppercase italic text-[10px] lg:text-[11px] tracking-[0.3em] lg:tracking-[0.4em] flex items-center justify-center gap-4 shadow-xl transition-all border-none cursor-pointer text-white active:scale-95 m-0"
                >
                  {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={20} />}
                  DÉCLARER LE RÈGLEMENT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}