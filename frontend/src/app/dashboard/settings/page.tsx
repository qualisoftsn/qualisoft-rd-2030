/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE ABSOLU : src/app/dashboard/settings/page.tsx
 * ---------------------------------------------------------------------------
 * FONCTION : Hub central de gestion des licences et facturation.
 * LOGIQUE : Tunnel de paiement manuel (Wave/OM) pour le marché local.
 * SÉCURITÉ : Protection Downgrade + 100% apiClient (Zéro NextAuth).
 * DATE DE RÉVISION : 02 Mars 2026 | 14:32 GMT
 * ---------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
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
import { toast, Toaster } from "sonner";

// --- 🏗️ STRUCTURES DE DONNÉES SCELLÉES ---
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

// --- 💎 RÉFÉRENTIEL TARIFAIRE QUALISOFT ELITE 2026 ---
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
    level: 4,
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
    level: 5,
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /**
   * 📡 SYNCHRONISATION DU PROFIL D'INSTANCE
   */
  const loadTenantData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Tenant>("/admin/tenant/me");
      setTenant(res.data);
    } catch (err) {
      toast.error("Erreur critique de synchronisation Licence.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenantData();
  }, [loadTenantData]);

  /**
   * 🛡️ CALCUL DU RANG DE LICENCE (Downgrade Protection)
   */
  const currentPlanLevel = useMemo(() => {
    if (!tenant) return 0;
    if (["ESSAI", "FREE", "TRIAL"].includes(tenant.T_Plan)) return 1;
    return QUALISOFT_PLANS.find((p) => p.name === tenant.T_Plan)?.level || 0;
  }, [tenant]);

  /**
   * 💰 ENREGISTREMENT DE LA TRANSACTION
   */
  const handleProcessPayment = async () => {
    if (!paymentRef || !selectedPlan || !tenant) return;

    setSubmitting(true);
    const tid = toast.loading("Scellage transactionnel en cours...");
    try {
      await apiClient.post("/transactions", {
        TX_Amount: selectedPlan.price,
        TX_Reference: paymentRef.trim().toUpperCase(),
        TX_PaymentMethod: "WAVE",
        tenantId: tenant.T_Id,
        TX_PlanRequested: selectedPlan.name,
      });
      toast.success("Règlement transmis avec succès.", { id: tid });
      setStep(3);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de scellage transactionnel.", { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !tenant) {
    return (
      <div className="ml-0 lg:ml-72 flex min-h-screen flex-col items-center justify-center bg-[#0B0F1A] gap-4">
        <Loader2 className="animate-spin text-blue-500 w-12 h-12" strokeWidth={2} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 italic animate-pulse">
          Vérification des Droits Elite...
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-4 sm:p-6 lg:p-10 ml-0 lg:ml-72 text-white italic font-sans text-left relative overflow-x-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🛰️ HEADER DE L'INSTANCE */}
      <header className="mb-8 lg:mb-12 border-b border-white/5 pb-8 lg:pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
        <div className="space-y-3 lg:space-y-4 text-left">
          <h1 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter leading-none m-0">
            Gestion <span className="text-blue-600">Licence</span>
          </h1>
          <p className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] lg:tracking-[0.4em] italic m-0">
            Instance : <span className="text-white">{tenant.T_Name}</span> • Statut : <span className="text-blue-400">{tenant.T_SubscriptionStatus}</span>
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-6 lg:px-8 py-4 rounded-4xl border border-white/10 shadow-inner w-full md:w-auto shrink-0 justify-center">
          <Crown size={22} className="text-amber-500 shrink-0" />
          <span className="text-[10px] lg:text-xs font-black uppercase italic tracking-widest leading-none">
            ÉDITION {tenant.T_Plan}
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
        
        {/* ÉTAPE 1 : MATRICE DES OFFRES */}
        {step === 1 && (
          <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8 w-full">
              {QUALISOFT_PLANS.map((p) => {
                const isCurrent = tenant.T_Plan === p.name;
                const isLocked = p.level < currentPlanLevel && !isCurrent;

                return (
                  <div
                    key={p.name}
                    className={`relative p-6 lg:p-8 rounded-[2.5rem] lg:rounded-[3rem] border flex flex-col transition-all duration-700 ${
                      isCurrent 
                        ? "bg-blue-600 border-white/20 shadow-[0_20px_50px_rgba(37,99,235,0.4)] md:scale-105 z-10" 
                        : "bg-slate-900/40 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-3 rounded-xl ${isCurrent ? "bg-white/20" : "bg-blue-600/10"}`}>
                        <Crown className={isCurrent ? "text-white" : "text-blue-500"} size={16} />
                      </div>
                      {isCurrent && (
                        <span className="bg-white/20 px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest">
                          Actif
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl lg:text-2xl font-black uppercase italic mb-1 tracking-tighter leading-none text-left">
                      {p.name}
                    </h3>
                    <div className="flex items-baseline gap-1.5 mb-8 text-left">
                      <span className="text-2xl lg:text-3xl font-black italic tracking-tighter">
                        {p.price === 0 ? "GRATUIT" : p.price.toLocaleString()}
                      </span>
                      {p.price > 0 && (
                        <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">
                          XOF / AN
                        </span>
                      )}
                    </div>

                    <ul className="space-y-3 mb-10 flex-1 text-left">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[9px] lg:text-[10px] font-bold uppercase tracking-tight italic leading-tight">
                          <Check size={14} className={isCurrent ? "text-white shrink-0" : "text-emerald-500 shrink-0"} strokeWidth={3} /> 
                          {f}
                        </li>
                      ))}
                    </ul>

                    {isLocked ? (
                      <div className="p-4 bg-black/30 rounded-2xl flex items-center justify-center gap-3 text-slate-500 border border-white/5">
                        <Lock size={14} />
                        <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest italic leading-none text-center">
                          Plan inférieur
                        </span>
                      </div>
                    ) : isCurrent ? (
                      <div className="p-4 bg-white/10 rounded-2xl flex items-center justify-center gap-3 text-white border border-white/20 shadow-inner">
                        <CheckCircle2 size={14} />
                        <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest italic text-center">
                          Option Actuelle
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setSelectedPlan(p); setStep(2); }}
                        className="w-full py-4 lg:py-5 bg-blue-600 hover:bg-white hover:text-blue-600 rounded-3xl lg:rounded-4xl text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] shadow-xl transition-all border-none cursor-pointer italic active:scale-95"
                      >
                        Activer
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : CANAL DE PAIEMENT SÉNÉGAL */}
        {step === 2 && selectedPlan && (
          <div className="w-full max-w-4xl bg-slate-900/60 border border-white/10 rounded-[3rem] lg:rounded-[4rem] p-6 sm:p-10 lg:p-16 shadow-[0_30px_80px_rgba(0,0,0,0.6)] animate-in slide-in-from-right duration-500 backdrop-blur-3xl text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-8 mb-10 lg:mb-16">
              <button
                onClick={() => setStep(1)}
                className="p-4 lg:p-5 bg-white/5 rounded-2xl hover:bg-red-600/20 hover:text-red-500 text-white transition-all border-none cursor-pointer shadow-inner shrink-0"
              >
                <X size={24} />
              </button>
              <div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase italic leading-none tracking-tighter m-0">
                  Mise à niveau <span className="text-blue-500">{selectedPlan.name}</span>
                </h3>
                <p className="text-slate-500 text-[9px] lg:text-[10px] uppercase font-black tracking-widest mt-2 lg:mt-3 m-0">
                  Règlement via réseau Mobile Money (Sénégal)
                </p>
              </div>
            </div>

            

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 mt-8">
              <div className="space-y-8 lg:space-y-10">
                <div className="p-8 lg:p-10 bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] lg:rounded-[3rem] shadow-inner">
                  <p className="text-[9px] lg:text-[10px] font-black uppercase text-blue-500 mb-4 lg:mb-6 tracking-widest italic leading-none m-0">
                    1. Montant de la licence
                  </p>
                  <p className="text-4xl lg:text-6xl font-black italic text-white tracking-tighter leading-none m-0">
                    {selectedPlan.price.toLocaleString()} <span className="text-lg lg:text-2xl text-blue-500">XOF</span>
                  </p>
                  <div className="mt-8 pt-8 border-t border-blue-500/10 space-y-2 lg:space-y-3">
                    <p className="text-[9px] lg:text-[11px] font-black uppercase text-slate-400 m-0">
                      Canal Wave / Orange Money :
                    </p>
                    <p className="text-2xl lg:text-3xl font-black italic text-blue-400 leading-none m-0">
                      +221 77 441 09 02
                    </p>
                  </div>
                </div>

                <div className="space-y-3 lg:space-y-4">
                  <label className="text-[9px] lg:text-[10px] font-black uppercase text-slate-500 ml-4 lg:ml-6 tracking-widest italic">
                    2. Référence de la transaction SMS *
                  </label>
                  <input
                    required
                    className="w-full p-6 lg:p-8 bg-[#0B0F1A] border-2 border-white/5 rounded-4xl text-xl lg:text-2xl font-black text-blue-500 outline-none focus:border-blue-500 uppercase italic shadow-inner transition-colors"
                    placeholder="EX: T-230102..."
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between py-2 lg:py-4 gap-6">
                <div className="p-8 lg:p-10 bg-amber-500/5 border border-amber-500/10 rounded-[2.5rem] lg:rounded-[3rem] italic relative overflow-hidden">
                  <div className="flex items-center gap-3 lg:gap-4 text-amber-500 mb-5 lg:mb-6 font-black uppercase text-[9px] lg:text-[10px] tracking-widest leading-none">
                    <Clock size={18} className="shrink-0" /> Analyse sous 48h
                  </div>
                  <p className="text-[10px] lg:text-xs text-slate-400 font-bold leading-relaxed uppercase tracking-tighter m-0">
                    L&apos;activation est subordonnée à la vérification physique du crédit sur nos comptes de dépôt. <br /><br />
                    Toute référence invalide entraînera le gel immédiat de l&apos;instance Qualisoft pour motif de sécurité.
                  </p>
                </div>
                <button
                  onClick={handleProcessPayment}
                  disabled={!paymentRef || submitting}
                  className="w-full py-8 lg:py-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 rounded-4xl lg:rounded-[2.5rem] font-black uppercase italic text-[10px] lg:text-xs tracking-[0.3em] lg:tracking-[0.5em] flex items-center justify-center gap-4 lg:gap-5 shadow-[0_15px_30px_rgba(37,99,235,0.3)] transition-all border-none cursor-pointer text-white active:scale-95"
                >
                  {submitting ? <Loader2 className="animate-spin w-6 h-6" /> : <ShieldCheck size={24} className="shrink-0" />}
                  Valider LE RÈGLEMENT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : CONFIRMATION D'ARCHIVAGE */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center animate-in zoom-in duration-1000 bg-slate-900/40 p-10 sm:p-16 lg:p-24 rounded-[3rem] lg:rounded-[5rem] border border-white/5 max-w-3xl shadow-2xl backdrop-blur-3xl mx-4">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-blue-600/10 rounded-4xl lg:rounded-[2.5rem] flex items-center justify-center mb-8 lg:mb-12 shadow-inner border border-blue-500/20">
              <ShieldCheck size={48} className="text-blue-500 animate-pulse lg:w-16 lg:h-16" />
            </div>
            <h3 className="text-4xl lg:text-5xl font-black uppercase italic mb-6 lg:mb-8 leading-none tracking-tighter m-0">
              Demande <span className="text-blue-500">Transmise</span>
            </h3>
            <p className="text-slate-400 text-[10px] lg:text-[11px] font-bold italic leading-relaxed mb-10 lg:mb-12 uppercase tracking-widest max-w-md m-0">
              Notre référence de transaction est en cours de rapprochement bancaire. <br /><br />
              Le statut de notre instance passera en <span className="text-white font-black">ACTIF</span> dès confirmation par l&apos;équipe administrative.
            </p>
            <button
              onClick={() => setStep(1)}
              className="px-8 lg:px-12 py-4 lg:py-5 bg-white/5 border border-white/10 rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest italic hover:bg-white hover:text-blue-600 transition-all cursor-pointer shadow-sm"
            >
              Retour au Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}