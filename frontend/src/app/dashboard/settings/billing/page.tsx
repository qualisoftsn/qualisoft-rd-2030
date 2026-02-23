/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * NOM ABSOLU : src/app/dashboard/settings/billing/page.tsx
 * FONCTION : Interface de gestion des abonnements et tunnel de paiement manuel.
 * RÔLE : Pilotage de la licence d'instance Qualisoft RD 2030.
 * MARCHÉ : Support Wave / Orange Money (Sénégal).
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
import { toast } from "react-hot-toast";

// --- RÉFÉRENTIEL DES PLANS ÉLITE ---
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

export default function BillingPage() {
  // --- ÉTATS DU NOYAU ---
  const [currentSubscription, setCurrentSubscription] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- ÉTATS DU TUNNEL DE PAIEMENT ---
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedPlanForPay, setSelectedPlanForPay] = useState<any>(null);
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState("WAVE");

  /**
   * 📡 SYNCHRONISATION DU STATUT DE LICENCE
   * Récupère les informations de l'instance et du plan actif.
   */
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
          ? "Le serveur Qualisoft est injoignable (Vérifiez le port 9090)."
          : "Erreur critique de chargement des données de facturation.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentPlan();
  }, [fetchCurrentPlan]);

  /**
   * 💰 ENREGISTREMENT DE LA PREUVE DE RÈGLEMENT
   * Transmet la référence de transaction SMS au service administratif.
   */
  const handleConfirmPayment = async () => {
    if (!reference.trim()) {
      toast.error("Référence de transaction obligatoire.");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post("/transactions", {
        TX_Amount: selectedPlanForPay.rawPrice,
        TX_Reference: reference.trim().toUpperCase(),
        TX_PaymentMethod: method,
        TX_PlanRequested: selectedPlanForPay.id,
      });
      toast.success("Preuve scellée. Activation sous 48h.");
      setShowProofModal(false);
      setReference("");
    } catch (err) {
      toast.error("Échec de transmission de la preuve.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- INTERFACE DE CHARGEMENT SOUVERAINE ---
  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] ml-72 text-blue-500 italic">
        <Loader2 className="animate-spin mb-6" size={50} />
        <p className="text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">
          Vérification des Droits d&apos;Instance...
        </p>
      </div>
    );

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans overflow-x-hidden relative selection:bg-blue-600/30">
      {/* 🛰️ HEADER : IDENTITÉ DE L'INSTANCE */}
      <header className="flex justify-between items-end border-b border-white/5 pb-10 mb-12 animate-in fade-in duration-700">
        <div className="text-left">
          <div className="flex items-center gap-3 text-amber-500 mb-4 font-black uppercase tracking-[0.4em] text-[10px]">
            <Crown size={16} /> Système Qualisoft RD 2030
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none italic">
            Gestion <span className="text-blue-600">Licence</span>
          </h1>
        </div>
        <div className="text-right space-y-3">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">
            Instance Active :{" "}
            <span className="text-white">
              {currentSubscription?.T_Name || "N/A"}
            </span>
          </p>
          <div className="flex items-center gap-4">
            <span className="bg-blue-600/10 text-blue-500 border border-blue-500/20 px-8 py-3 rounded-full font-black text-xs uppercase italic shadow-lg">
              {currentSubscription?.planName || "ESSAI"} EDITION •{" "}
              {currentSubscription?.status || "TRIAL"}
            </span>
          </div>
        </div>
      </header>

      {/* ⚠️ GESTIONNAIRE D'ALERTES RÉSEAU */}
      {error && (
        <div className="mb-10 p-8 bg-red-500/10 border border-red-500/20 rounded-[2.5rem] flex items-center gap-6 text-red-500 animate-in slide-in-from-top-4">
          <AlertCircle size={32} />
          <div className="text-left">
            <p className="text-sm font-black uppercase tracking-tighter">
              Interruption du Noyau Billing
            </p>
            <p className="text-[10px] font-bold opacity-60 uppercase mt-1 italic tracking-widest">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* 📊 GRILLE DES PLANS TARIFAIRES (§OFFRES ÉLITE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
        {PLANS.map((plan) => {
          const isCurrent = currentSubscription?.plan === plan.id;
          return (
            <div
              key={plan.id}
              className={`p-10 rounded-[3.5rem] border flex flex-col bg-slate-900/40 transition-all duration-500 group relative overflow-hidden ${
                isCurrent
                  ? "border-blue-600 scale-105 shadow-2xl z-10"
                  : "border-white/5 hover:border-white/10"
              }`}
            >
              {isCurrent && (
                <div className="absolute -right-4 -top-4 bg-blue-600 p-6 rounded-full shadow-2xl">
                  <Check size={20} className="text-white" strokeWidth={4} />
                </div>
              )}

              <h3 className="text-3xl font-black uppercase mb-6 italic tracking-tighter text-left group-hover:text-blue-400 transition-colors">
                {plan.name}
              </h3>

              <div className="mb-10 text-left">
                <span className="text-5xl font-black italic tracking-tighter leading-none">
                  {plan.price}
                </span>
                <span className="text-slate-500 text-[10px] block font-black uppercase mt-3 italic tracking-widest opacity-50">
                  FCFA / ANNUEL
                </span>
              </div>

              {/* LISTE DES CAPACITÉS DU PLAN */}
              <ul className="space-y-4 mb-12 flex-1 text-left">
                <li className="flex items-center gap-3 text-[10px] font-black text-blue-500 uppercase italic border-b border-white/5 pb-3">
                  <Calendar size={14} /> {plan.users}
                </li>
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-[11px] font-bold text-slate-300 uppercase italic tracking-tight"
                  >
                    <Check
                      size={14}
                      className="text-emerald-500 shrink-0"
                      strokeWidth={3}
                    />{" "}
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  setSelectedPlanForPay(plan);
                  setShowProofModal(true);
                }}
                disabled={isCurrent}
                className={`w-full py-6 rounded-4xl font-black uppercase text-[10px] italic transition-all border-none cursor-pointer tracking-[0.3em] active:scale-95 ${
                  isCurrent
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-white hover:text-blue-600 shadow-xl shadow-blue-900/20"
                }`}
              >
                {isCurrent ? "PLAN ACTUEL" : "ACTIVER L'ÉDITION"}
              </button>
            </div>
          );
        })}
      </div>

      {/* 📟 TUNNEL DE PAIEMENT MANUEL (WAVE/OM) */}
      {showProofModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6 animate-in zoom-in duration-300">
          <div className="bg-[#0B0F1A] border border-white/10 w-full max-w-xl rounded-[4rem] p-12 relative shadow-4xl text-left">
            <button
              onClick={() => setShowProofModal(false)}
              className="absolute top-10 right-10 text-slate-500 hover:text-white transition-all border-none bg-transparent cursor-pointer"
            >
              <X size={32} />
            </button>

            <header className="mb-12">
              <h2 className="text-4xl font-black uppercase italic mb-4 leading-none tracking-tighter">
                Règlement <span className="text-blue-600">Manuel</span>
              </h2>
              <div className="flex items-center gap-4 p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl italic">
                <ShieldCheck className="text-blue-500" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Validation sécurisée via rapprochement des flux bancaires
                  (Sénégal).
                </p>
              </div>
            </header>

            <div className="space-y-8">
              {/* INFO PRIX SCELLÉ */}
              <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex justify-between items-center shadow-inner">
                <span className="text-[10px] font-black text-slate-500 uppercase italic">
                  Montant à transférer
                </span>
                <span className="text-3xl font-black italic">
                  {selectedPlanForPay?.price} XOF
                </span>
              </div>

              {/* SÉLECTEUR DE MÉTHODE */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMethod("WAVE")}
                  className={`py-4 rounded-2xl font-black text-[10px] uppercase italic transition-all border ${method === "WAVE" ? "bg-blue-600 border-white/20" : "bg-white/5 border-white/5 text-slate-500"}`}
                >
                  WAVE (+221 ...)
                </button>
                <button
                  onClick={() => setMethod("ORANGE_MONEY")}
                  className={`py-4 rounded-2xl font-black text-[10px] uppercase italic transition-all border ${method === "ORANGE_MONEY" ? "bg-orange-600 border-white/20" : "bg-white/5 border-white/5 text-slate-500"}`}
                >
                  ORANGE MONEY
                </button>
              </div>

              {/* CHAMP RÉFÉRENCE TRANSACTION */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">
                  Référence de Transaction SMS
                </label>
                <input
                  required
                  className="w-full bg-[#0F172A] border border-white/10 rounded-2xl p-6 text-xl font-black text-blue-500 uppercase italic outline-none focus:border-blue-600 shadow-inner"
                  placeholder="EX: T-230102.12..."
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>

              <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl italic">
                <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest leading-relaxed">
                  Note : notre instance sera activée dans un délai de 24h à 48h
                  après confirmation physique du crédit.
                </p>
              </div>

              <button
                onClick={handleConfirmPayment}
                disabled={!reference || submitting}
                className="w-full py-8 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 rounded-[2.5rem] font-black uppercase italic text-xs tracking-[0.4em] flex items-center justify-center gap-5 shadow-2xl transition-all border-none cursor-pointer text-white active:scale-95"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
                DÉCLARER LE RÈGLEMENT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
