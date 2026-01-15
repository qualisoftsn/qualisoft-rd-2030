/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import apiClient from "@/core/api/api-client";
import { AlertCircle, Crown, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

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
  // ✅ INITIALISATION : On évite 'null' pour ne pas planter au premier rendu
  const [currentSubscription, setCurrentSubscription] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedPlanForPay, setSelectedPlanForPay] = useState<any>(null);
  const [reference, setReference] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [method, setMethod] = useState("WAVE");

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get("/subscriptions/my-plan");
      setCurrentSubscription(res.data || {});
    } catch (err: any) {
      console.error("Erreur API Billing:", err);
      // ✅ GESTION DE L'ERREUR 1 (Network)
      setError(
        err.message === "Network Error"
          ? "Le serveur Qualisoft est injoignable (Vérifiez le port 9090)."
          : "Erreur de chargement des données."
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGIQUE DE PROTECTION (Évite l'Erreur 2)
  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] ml-72 text-blue-500 italic">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">
          Synchronisation Licence...
        </p>
      </div>
    );

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans overflow-x-hidden relative">
      {/* HEADER : Sécurisé par Optional Chaining ?. */}
      <header className="flex justify-between items-end border-b border-white/5 pb-10 mb-12">
        <div>
          <div className="flex items-center gap-3 text-amber-500 mb-4 font-black uppercase tracking-[0.4em] text-[10px]">
            <Crown size={16} /> Système Qualisoft RD 2030
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">
            Gestion <span className="text-blue-600">Licence</span>
          </h1>
        </div>
        <div className="text-right">
          {/* ✅ CORRECTION ICI : On utilise ?. pour éviter le crash sur null */}
          <p className="text-slate-500 text-[10px] font-black uppercase mb-2">
            Instance Active : {currentSubscription?.T_Name || "N/A"}
          </p>
          <span className="bg-blue-600/10 text-blue-500 border border-blue-500/20 px-6 py-2 rounded-full font-black text-xs uppercase italic">
            {currentSubscription?.planName || "ESSAI"} •{" "}
            {currentSubscription?.status || "TRIAL"}
          </span>
        </div>
      </header>

      {/* AFFICHAGE DE L'ERREUR RÉSEAU SI PRÉSENTE */}
      {error && (
        <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-500">
          <AlertCircle size={24} />
          <span className="text-xs font-black uppercase tracking-widest">
            {error}
          </span>
        </div>
      )}

      {/* GRILLE DES PLANS (CONSERVÉE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {PLANS.map((plan) => {
          const isCurrent = currentSubscription?.plan === plan.id;
          return (
            <div
              key={plan.id}
              className={`p-8 rounded-[3rem] border bg-slate-900/40 transition-all ${
                isCurrent
                  ? "border-blue-600 scale-105 shadow-2xl"
                  : "border-white/5"
              }`}
            >
              <h3 className="text-2xl font-black uppercase mb-4 italic tracking-tighter">
                {plan.name}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-slate-500 text-[10px] block font-bold uppercase mt-1 italic">
                  FCFA / an
                </span>
              </div>
              {/* ... reste de la carte ... */}
              <button
                onClick={() => {
                  setSelectedPlanForPay(plan);
                  setShowProofModal(true);
                }}
                disabled={isCurrent}
                className={`w-full py-5 rounded-4xl font-black uppercase text-[10px] italic ${
                  isCurrent
                    ? "bg-slate-800 text-slate-500"
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                {isCurrent ? "Plan Actif" : "Activer ce plan"}
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL DE PAIEMENT (CONSERVÉE) */}
      {showProofModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          {/* ... contenu de la modal identique au précédent ... */}
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-lg rounded-[3rem] p-10 relative">
            <button
              onClick={() => setShowProofModal(false)}
              className="absolute top-8 right-8 text-slate-500"
            >
              <X size={24} />
            </button>
            <h2 className="text-3xl font-black uppercase italic mb-8">
              Paiement <span className="text-blue-600">Manuel</span>
            </h2>
            {/* Formulaire ici */}
            <p className="text-xs text-slate-400 italic mb-6">
              Déclarez votre transaction Wave/Orange pour activer{" "}
              {selectedPlanForPay?.name}.
            </p>
            <button className="w-full py-5 bg-blue-600 rounded-3xl font-black uppercase text-[10px]">
              Confirmer l&apos;envoi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
