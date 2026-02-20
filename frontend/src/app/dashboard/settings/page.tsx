/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * NOM ABSOLU : src/app/dashboard/settings/page.tsx
 * FONCTION : Hub central de gestion des licences et facturation.
 * LOGIQUE : Tunnel de paiement manuel (Wave/OM) pour le marché local.
 * SÉCURITÉ : Protection contre les déclassements (Downgrade protection).
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  ArrowRight, Check, CheckCircle2, Clock, Crown,
  Loader2, Lock, ShieldCheck, X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

// --- STRUCTURES DE DONNÉES SCELLÉES ---
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

// --- RÉFÉRENTIEL TARIFAIRE QUALISOFT ELITE 2026 ---
const QUALISOFT_PLANS: Plan[] = [
  {
    name: "ESSAI",
    price: 0,
    level: 1,
    features: [
      "Période de 14 jours - Full Elite",
      "Accès intégral aux modules",
      "Support standard par e-mail",
    ],
  },
  {
    name: "EMERGENCE",
    price: 55000,
    level: 2,
    features: [
      "3 Utilisateurs / 3 Processus",
      "Gestion des Risques de base",
      "Analytics standards",
    ],
  },
  {
    name: "CROISSANCE",
    price: 105000,
    level: 3,
    features: [
      "20 Utilisateurs / 6 Processus",
      "Intelligence Tiers 360°",
      "Console Admin dédiée",
      "Support Prioritaire 24/7",
    ],
  },
  {
    name: "ENTREPRISE",
    price: 175000,
    level: 4, // Correction du niveau pour logique incrémentale
    features: [
      "50 Utilisateurs / 10 Processus",
      "SMI Intégral & Multi-normes",
      "Analytics prédictifs",
      "Formation initiale incluse",
    ],
  },
  {
    name: "GROUPE",
    price: 350000,
    level: 5, // Correction du niveau
    features: [
      "Utilisateurs Illimités",
      "Multi-filiales / Multi-sites",
      "Accès SuperAdmin & API",
      "Account Manager dédié",
    ],
  },
];

export default function BillingPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1); // Gestion des étapes du tunnel
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /**
   * 📡 SYNCHRONISATION DU PROFIL D'INSTANCE
   * Récupère l'état actuel de l'abonnement du tenant.
   */
  const loadTenantData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Tenant>("/admin/tenant/me");
      setTenant(res.data);
    } catch (err) {
      console.error("🚨 Erreur critique de synchronisation Licence");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTenantData(); }, [loadTenantData]);

  /**
   * 🛡️ CALCUL DU RANG DE LICENCE
   * Empêche l'affichage d'options de paiement pour des plans inférieurs au plan actuel.
   */
  const currentPlanLevel = useMemo(() => {
    if (!tenant) return 0;
    if (["ESSAI", "FREE", "TRIAL"].includes(tenant.T_Plan)) return 1;
    return QUALISOFT_PLANS.find((p) => p.name === tenant.T_Plan)?.level || 0;
  }, [tenant]);

  /**
   * 💰 ENREGISTREMENT DE LA TRANSACTION
   * Envoie la preuve de paiement WAVE/OM au service administratif.
   */
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
      setStep(3); // Passage à l'écran de confirmation
    } catch (err) {
      alert("Erreur de scellage transactionnel. Contactez le support.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !tenant) return (
    <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-blue-500" size={32} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 italic animate-pulse">
        Vérification des Droits Elite...
      </span>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white italic font-sans text-left relative overflow-hidden selection:bg-blue-600/30">
      
      {/* 🛰️ HEADER DE L'INSTANCE */}
      <header className="mb-12 border-b border-white/5 pb-10 flex justify-between items-end max-w-7xl mx-auto w-full">
        <div className="space-y-4 text-left">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
            Gestion <span className="text-blue-600">Licence</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] italic">
            Instance : {tenant.T_Name} • Statut : <span className="text-blue-400">{tenant.T_SubscriptionStatus}</span>
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-8 py-4 rounded-3xl border border-white/10 shadow-inner">
          <Crown size={22} className="text-amber-500" />
          <span className="text-xs font-black uppercase italic tracking-widest leading-none">
            ÉDITION {tenant.T_Plan}
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
        
        {/* ÉTAPE 1 : MATRICE DES OFFRES */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {QUALISOFT_PLANS.map((p) => {
              const isCurrent = tenant.T_Plan === p.name;
              const isLocked = p.level < currentPlanLevel && !isCurrent;

              return (
                <div
                  key={p.name}
                  className={`relative p-8 rounded-[3rem] border flex flex-col transition-all duration-700 ${isCurrent ? "bg-blue-600 border-white/20 shadow-2xl scale-105 z-10" : "bg-slate-900/40 border-white/5 hover:border-white/10"}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-xl ${isCurrent ? "bg-white/20" : "bg-blue-600/10"}`}>
                      <Crown className={isCurrent ? "text-white" : "text-blue-500"} size={16} />
                    </div>
                    {isCurrent && <span className="bg-white/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Actif</span>}
                  </div>

                  <h3 className="text-2xl font-black uppercase italic mb-1 tracking-tighter leading-none">{p.name}</h3>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-3xl font-black italic">{p.price.toLocaleString()}</span>
                    <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">XOF / AN</span>
                  </div>

                  <ul className="space-y-3 mb-10 flex-1 text-left">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-[10px] font-bold uppercase tracking-tight italic leading-tight">
                        <Check size={12} className={isCurrent ? "text-white" : "text-emerald-500"} strokeWidth={3} /> {f}
                      </li>
                    ))}
                  </ul>

                  {isLocked ? (
                    <div className="p-4 bg-black/30 rounded-2xl flex items-center justify-center gap-3 text-slate-600 border border-white/5">
                      <Lock size={12} />
                      <span className="text-[8px] font-black uppercase tracking-widest italic leading-none text-center">Plan inférieur</span>
                    </div>
                  ) : isCurrent ? (
                    <div className="p-4 bg-white/10 rounded-2xl flex items-center justify-center gap-3 text-white border border-white/20">
                      <CheckCircle2 size={12} />
                      <span className="text-[8px] font-black uppercase tracking-widest italic text-center">Option Actuelle</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setSelectedPlan(p); setStep(2); }}
                      className="w-full py-5 bg-blue-600 hover:bg-white hover:text-blue-600 rounded-4xl text-[9px] font-black uppercase tracking-[0.3em] shadow-xl transition-all border-none cursor-pointer italic"
                    >
                      Activer
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ÉTAPE 2 : CANAL DE PAIEMENT SÉNÉGAL */}
        {step === 2 && selectedPlan && (
          <div className="w-full max-w-4xl bg-slate-900/60 border border-white/10 rounded-[4rem] p-16 shadow-[0_50px_100px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-500 backdrop-blur-3xl text-left">
            <div className="flex items-center gap-8 mb-16">
              <button onClick={() => setStep(1)} className="p-5 bg-white/5 rounded-2xl hover:bg-red-600/20 text-white transition-all border-none cursor-pointer shadow-inner">
                <X size={24} />
              </button>
              <div>
                <h3 className="text-5xl font-black uppercase italic leading-none tracking-tighter">
                  Mise à niveau <span className="text-blue-500">{selectedPlan.name}</span>
                </h3>
                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-3">Règlement via réseau Mobile Money Sénégal</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-10">
                <div className="p-10 bg-blue-600/10 border border-blue-500/20 rounded-[3rem] shadow-inner">
                  <p className="text-[10px] font-black uppercase text-blue-500 mb-6 tracking-widest italic leading-none">1. Montant de la licence</p>
                  <p className="text-6xl font-black italic text-white tracking-tighter leading-none">{selectedPlan.price.toLocaleString()} <span className="text-sm">XOF</span></p>
                  <div className="mt-8 pt-8 border-t border-blue-500/10 space-y-3">
                    <p className="text-[11px] font-black uppercase text-slate-400">Canal Wave / Orange Money :</p>
                    <p className="text-3xl font-black italic text-blue-400 leading-none">+221 77 441 09 02</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-6 tracking-widest italic">2. Référence de la transaction SMS</label>
                  <input
                    required
                    className="w-full p-8 bg-[#0B0F1A] border border-white/10 rounded-3xl text-2xl font-black text-blue-500 outline-none focus:border-blue-500 uppercase italic shadow-inner"
                    placeholder="EX: T-230102..."
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between py-4">
                <div className="p-10 bg-amber-500/5 border border-amber-500/10 rounded-[3rem] italic relative overflow-hidden">
                  <div className="flex items-center gap-4 text-amber-500 mb-6 font-black uppercase text-[10px] tracking-widest leading-none">
                    <Clock size={20} /> Analyse sous 48h
                  </div>
                  <p className="text-xs text-slate-400 font-bold leading-relaxed uppercase tracking-tighter">
                    L&apos;activation est subordonnée à la vérification physique du crédit sur nos comptes. <br /><br />
                    Toute référence invalide entraînera le gel immédiat de l&apos;instance Qualisoft pour motif de sécurité financière.
                  </p>
                </div>
                <button
                  onClick={handleProcessPayment}
                  disabled={!paymentRef || submitting}
                  className="w-full py-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 rounded-[2.5rem] font-black uppercase italic text-xs tracking-[0.5em] flex items-center justify-center gap-5 shadow-2xl transition-all border-none cursor-pointer text-white active:scale-95"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} />}
                  SCELLER LE RÈGLEMENT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : CONFIRMATION D'ARCHIVAGE TRANSACTIONNEL */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center animate-in zoom-in duration-1000 bg-slate-900/40 p-24 rounded-[5rem] border border-white/5 max-w-3xl shadow-4xl backdrop-blur-3xl">
            <div className="w-32 h-32 bg-blue-600/20 rounded-[2.5rem] flex items-center justify-center mb-12 shadow-inner border border-blue-500/20">
              <ShieldCheck size={64} className="text-blue-500 animate-pulse" />
            </div>
            <h3 className="text-5xl font-black uppercase italic mb-8 leading-none tracking-tighter">
              Demande <span className="text-blue-500">Transmise</span>
            </h3>
            <p className="text-slate-500 text-[11px] font-black italic leading-relaxed mb-12 uppercase tracking-widest max-w-md">
              Votre référence de transaction est en cours de rapprochement bancaire. <br /><br />
              Le statut de votre instance passera en <span className="text-white">ACTIF</span> dès confirmation.
            </p>
            <button onClick={() => setStep(1)} className="px-12 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest italic hover:bg-white hover:text-blue-600 transition-all border-none cursor-pointer">
              Retour au Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}