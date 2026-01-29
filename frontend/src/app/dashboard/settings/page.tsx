"use client";

import apiClient from "@/core/api/api-client";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Crown,
  Loader2,
  Lock,
  ShieldCheck,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

// --- TYPES & INTERFACES ---
interface Plan {
  name: string;
  price: number;
  level: number;
  features: string[];
}

interface Tenant {
  T_Id: string;
  T_Name: string;
  T_Plan: string;
  T_SubscriptionStatus: string;
}

// --- CONFIGURATION DES PLANS (Sortie du composant pour optimisation) ---
const QUALISOFT_PLANS: Plan[] = [
  {
    name: "ESSAI",
    price: 0,
    level: 1,
    features: [
      "Pendant 14 jours - Essayez notre plateforme elite",
      "Elite intégral",
      "Support Mail",
    ],
  },
  {
    name: "EMERGENCE",
    price: 55000,
    level: 2,
    features: [
      "55 000 FCFA/ mois, 3 Utilisateurs, 3 processus",
      "Gestion Risques Complète",
      "Analytics avancés",
    ],
  },
  {
    name: "CROISSANCE",
    price: 105000,
    level: 3,
    features: [
      "105 000 FCFA/mois, 20 Utilisateurs, 6 processus",
      "Intelligence Tiers 360°",
      "Admin",
      "Support 24/7",
    ],
  },
  {
    name: "ENTREPRISE",
    price: 175000,
    level: 2,
    features: [
      "175 000 FCFA/mois, 50 Utilisateurs, 10 processus",
      "Elite intégral",
      "Analytics avancés",
    ],
  },
  {
    name: "GROUPE",
    price: 350000,
    level: 3,
    features: [
      "350 000 FCFA/mois, Illimité",
      "Intelligence Tiers 360°",
      "Accès SuperAdmin",
      "Support 24/7",
    ],
  },
];

export default function BillingPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 1️⃣ Chargement initial des données de l'instance
  const loadTenantData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Tenant>("/admin/tenant/me");
      setTenant(res.data);
    } catch (err) {
      console.error(
        "🚨 Erreur critique lors du chargement du profil tenant:",
        err,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenantData();
  }, [loadTenantData]);

  // 2️⃣ Logique de calcul du niveau de plan actuel
  const currentPlanLevel = useMemo(() => {
    if (!tenant) return 0;
    if (["ESSAI", "FREE"].includes(tenant.T_Plan)) return 0;
    return QUALISOFT_PLANS.find((p) => p.name === tenant.T_Plan)?.level || 0;
  }, [tenant]);

  // 3️⃣ Soumission de la preuve de paiement (WAVE/OM)
  const handleProcessPayment = async () => {
    if (!paymentRef || !selectedPlan || !tenant) return;

    setSubmitting(true);
    try {
      await apiClient.post("/transactions", {
        TX_Amount: selectedPlan.price,
        TX_Reference: paymentRef.trim().toUpperCase(),
        TX_PaymentMethod: "WAVE",
        tenantId: tenant.T_Id,
        TX_PlanRequested: selectedPlan.name,
      });
      setStep(3);
    } catch (err) {
      alert(
        "Erreur réseau : Impossible d'enregistrer la transaction. Vérifiez votre connexion.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !tenant)
    return (
      <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A]">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={12} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 italic">
          Analyse des droits Qualisoft Elite...
        </span>
      </div>
    );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white italic font-sans text-left relative overflow-hidden">
      {/* HEADER : IDENTITÉ DE L'INSTANCE */}
      <header className="mb-12 border-b border-white/5 pb-10 flex justify-between items-end max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
            Gestion <span className="text-blue-500">Licence</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4 italic">
            Instance : {tenant.T_Name} • Statut : {tenant.T_SubscriptionStatus}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
          <Crown size={18} className="text-amber-500" />
          <span className="text-xs font-black uppercase italic tracking-widest">
            {tenant.T_Plan} EDITION
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
        {/* ÉTAPE 1 : GRILLE DES PLANS */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full animate-in fade-in slide-in-from-bottom-5 duration-700">
            {QUALISOFT_PLANS.map((p) => {
              const isCurrent = tenant.T_Plan === p.name;
              const isLocked = p.level <= currentPlanLevel && !isCurrent;

              return (
                <div
                  key={p.name}
                  className={`relative p-10 rounded-[3.5rem] border flex flex-col transition-all duration-500 ${isCurrent ? "bg-blue-600 border-white/20 shadow-2xl shadow-blue-900/40" : "bg-slate-900/40 border-white/5"}`}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div
                      className={`p-4 rounded-2xl ${isCurrent ? "bg-white/20" : "bg-blue-500/10"}`}
                    >
                      <Crown
                        className={isCurrent ? "text-white" : "text-blue-500"}
                        size={10}
                      />
                    </div>
                    {isCurrent && (
                      <span className="bg-white/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                        Actif
                      </span>
                    )}
                  </div>

                  <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter leading-none">
                    {p.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-4xl font-black italic">
                      {p.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                      XOF / AN
                    </span>
                  </div>

                  <ul className="space-y-4 mb-12 flex-1">
                    {p.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight italic"
                      >
                        <Check
                          size={10}
                          className={
                            isCurrent ? "text-white" : "text-emerald-500"
                          }
                        />{" "}
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isLocked ? (
                    <div className="p-5 bg-black/30 rounded-2xl flex items-center justify-center gap-3 text-slate-500 border border-white/5">
                      <Lock size={10} />
                      <span className="text-[9px] font-black uppercase tracking-widest italic">
                        Plan inférieur gelé
                      </span>
                    </div>
                  ) : isCurrent ? (
                    <div className="p-5 bg-white/10 rounded-2xl flex items-center justify-center gap-3 text-white border border-white/20">
                      <CheckCircle2 size={10} />
                      <span className="text-[9px] font-black uppercase tracking-widest italic text-center">
                        Abonnement actuel
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedPlan(p);
                        setStep(2);
                      }}
                      className="w-full py-6 bg-blue-600 hover:bg-blue-500 rounded-4xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl transition-all"
                    >
                      Choisir ce plan
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ÉTAPE 2 : TUNNEL DE PAIEMENT */}
        {step === 2 && selectedPlan && (
          <div className="w-full max-w-4xl bg-slate-900/60 border border-white/10 rounded-[4rem] p-16 shadow-2xl animate-in slide-in-from-right duration-500">
            <div className="flex items-center gap-6 mb-12">
              <button
                onClick={() => setStep(1)}
                className="p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-colors"
              >
                <X size={24} />
              </button>
              <h3 className="text-4xl font-black uppercase italic leading-none">
                Activation{" "}
                <span className="text-blue-500">{selectedPlan.name}</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
              <div className="space-y-8">
                <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem]">
                  <p className="text-[10px] font-black uppercase text-blue-500 mb-4 tracking-widest italic">
                    1. Transférer le montant
                  </p>
                  <p className="text-4xl font-black italic text-white leading-none">
                    +{selectedPlan.price.toLocaleString()} XOF
                  </p>
                  <div className="mt-6 space-y-2">
                    <p className="text-[11px] font-black uppercase text-slate-400">
                      Via Wave / OM :
                    </p>
                    <p className="text-2xl font-black italic text-blue-400 leading-none">
                      +221 77 441 09 02
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">
                    2. Référence de transaction
                  </label>
                  <input
                    required
                    className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl text-xl font-black text-blue-500 outline-none focus:border-blue-500 uppercase italic"
                    placeholder="Réf: T-230102..."
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-[2.5rem] italic">
                  <div className="flex items-center gap-3 text-amber-500 mb-4 font-black uppercase text-[10px] tracking-widest">
                    <Clock size={16} /> Validation sous 48h
                  </div>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    Nos services financiers procèdent à la vérification du
                    crédit réel. <br />
                    <br />
                    Activation automatique après confirmation du règlement.
                  </p>
                </div>
                <button
                  onClick={handleProcessPayment}
                  disabled={!paymentRef || submitting}
                  className="w-full py-8 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-4xl font-black uppercase italic text-xs tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl transition-all"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      Confirmer le paiement <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : CONFIRMATION D'ENVOI */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center animate-in zoom-in duration-500 bg-slate-900/40 p-20 rounded-[4rem] border border-white/5 max-w-2xl">
            <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mb-10 shadow-inner">
              <ShieldCheck size={48} className="text-blue-500 animate-pulse" />
            </div>
            <h3 className="text-4xl font-black uppercase italic mb-6 leading-none">
              Demande en cours de{" "}
              <span className="text-blue-500">Traitement</span>
            </h3>
            <p className="text-slate-500 text-sm font-bold italic leading-relaxed mb-10">
              Votre référence a été transmise à notre cellule administrative.
              Délai max 48h pour le passage au statut{" "}
              <span className="text-white uppercase">Actif</span>.
            </p>
            <div className="flex items-center gap-3 px-8 py-4 bg-white/5 rounded-full border border-white/10 italic font-black text-[9px] uppercase tracking-widest text-slate-500">
              <ShieldCheck size={18} className="text-emerald-500" />{" "}
              Sécurisation Qualisoft Elite
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
