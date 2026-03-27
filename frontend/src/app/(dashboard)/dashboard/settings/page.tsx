/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : GESTION DES LICENCES (ELITE SDE)
 * RÔLE : Hub central de gestion des droits d'accès et facturation
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useCallback, useEffect, useMemo, useState, ChangeEvent, KeyboardEvent } from "react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import {
  Check, CheckCircle2, Clock, Crown, Loader2, Lock, ShieldCheck, X, RefreshCw, AlertCircle
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface Plan {
  name: string;
  price: number;
  level: number;
  features: string[];
}

export interface Tenant {
  T_Id: string;
  T_Name: string;
  T_Plan: string;
  T_SubscriptionStatus: string;
  T_ExpiryDate?: string;
  T_IsActive?: boolean;
}

export interface TransactionPayload {
  TX_Amount: number;
  TX_Reference: string;
  TX_PaymentMethod: string;
  TX_PlanRequested: string;
}

export interface LoadingScreenProps {
  label: string;
}

export interface PlanCardProps {
  plan: Plan;
  isCurrent: boolean;
  isLocked: boolean;
  currentLevel: number;
  onSelect: (plan: Plan) => void;
}

export interface PaymentStepProps {
  selectedPlan: Plan;
  tenant: Tenant | null;
  paymentRef: string;
  onPaymentRefChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const QUALISOFT_PLANS: Plan[] = [
  { name: "ESSAI", price: 0, level: 1, features: ["14 jours - Full Elite", "Accès intégral modules", "Support e-mail"] },
  { name: "EMERGENCE", price: 55000, level: 2, features: ["3 Utilisateurs", "3 Processus", "GED Fondamentale"] },
  { name: "CROISSANCE", price: 105000, level: 3, features: ["20 Utilisateurs", "6 Processus", "Intelligence 360°"] },
  { name: "ENTREPRISE", price: 175000, level: 4, features: ["50 Utilisateurs", "10 Processus", "Risques & Audits"] },
  { name: "GROUPE", price: 350000, level: 5, features: ["Utilisateurs Illimités", "Multi-filiales", "API SuperAdmin"] },
];

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: LoadingScreenProps) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : PLAN CARD
// ============================================================================

function PlanCard({ plan, isCurrent, isLocked, currentLevel, onSelect }: PlanCardProps) {
  return (
    <article 
      className={cn(
        "relative p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[3rem] border-2 flex flex-col transition-all duration-500 focus-within:ring-2 focus-within:ring-blue-400",
        isCurrent 
          ? "bg-blue-600 border-white/20 shadow-2xl scale-105 z-10" 
          : "bg-slate-900/40 border-white/5 hover:border-blue-500/30"
      )}
      role="article"
      aria-label={`Plan ${plan.name}`}
    >
      <div className="flex justify-between items-start mb-4 md:mb-6">
        <div className={cn(
          "p-3 md:p-4 rounded-xl md:rounded-2xl",
          isCurrent ? "bg-white/20 text-white" : "bg-blue-600/10 text-blue-400"
        )}>
          <Crown size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
        </div>
        {isCurrent && (
          <span className="bg-white/20 px-3 md:px-4 py-1 rounded-lg text-[8px] md:text-[9px] font-black italic">
            ACTIF
          </span>
        )}
      </div>
      <h3 className="text-xl md:text-2xl font-black mb-1 md:mb-2 italic tracking-tighter m-0">{plan.name}</h3>
      <div className="flex items-baseline gap-1 md:gap-2 mb-4 md:mb-6 lg:mb-8">
        <span className="text-2xl md:text-3xl font-black italic">
          {plan.price === 0 ? "FREE" : plan.price.toLocaleString('fr-SN')}
        </span>
        {plan.price > 0 && (
          <span className="text-[8px] md:text-[9px] text-white/50">XOF / AN</span>
        )}
      </div>
      <ul className="space-y-2 md:space-y-3 lg:space-y-4 mb-6 md:mb-8 lg:mb-10 flex-1 list-none p-0 m-0" role="list">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-bold italic tracking-tight uppercase">
            <Check size={12} className={cn("w-3 h-3 md:w-3.5 md:h-3.5", isCurrent ? "text-white" : "text-emerald-400")} strokeWidth={4} aria-hidden="true" /> 
            {f}
          </li>
        ))}
      </ul>
      {isLocked ? (
        <div className="p-3 md:p-4 bg-black/30 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 text-slate-500 italic text-[9px] md:text-[10px] font-black" role="status">
          <Lock size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" /> 
          Plan Inférieur
        </div>
      ) : isCurrent ? (
        <div className="p-3 md:p-4 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 text-white italic text-[9px] md:text-[10px] font-black" role="status">
          <CheckCircle2 size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" /> 
          Option Actuelle
        </div>
      ) : (
        <button 
          type="button"
          onClick={() => onSelect(plan)} 
          className="w-full py-3 md:py-4 lg:py-5 bg-blue-600 hover:bg-white hover:text-blue-700 rounded-xl md:rounded-2xl lg:rounded-3xl text-[9px] md:text-[10px] font-black shadow-xl border-none cursor-pointer transition-all active:scale-95 italic uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={`Activer le plan ${plan.name}`}
        >
          Activer l&apos;Édition
        </button>
      )}
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : PAYMENT STEP
// ============================================================================

function PaymentStep({ selectedPlan, tenant, paymentRef, onPaymentRefChange, onSubmit, onBack, submitting }: PaymentStepProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onBack();
    }
  };

  return (
    <div 
      className="max-w-3xl md:max-w-4xl mx-auto bg-slate-900/60 border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-6 md:p-8 lg:p-12 xl:p-16 shadow-2xl animate-in slide-in-from-right duration-500 backdrop-blur-md"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-title"
    >
      <div className="flex items-center gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12 lg:mb-16">
        <button 
          type="button"
          onClick={onBack} 
          className="p-2 md:p-3 lg:p-5 bg-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl text-slate-400 hover:text-white hover:bg-red-600 transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Retour à la liste des plans"
        >
          <X size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
        </button>
        <h3 id="payment-title" className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black italic tracking-tighter m-0 uppercase leading-none">
          Mise à Niveau <span className="text-blue-400">{selectedPlan.name}</span>
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
        <div className="space-y-6 md:space-y-8 lg:space-y-10">
          <article className="p-6 md:p-8 lg:p-10 bg-blue-600/5 border-2 border-blue-500/20 rounded-2xl md:rounded-3xl lg:rounded-[3rem] shadow-inner">
            <p className="text-[9px] md:text-[10px] font-black text-blue-400 mb-4 md:mb-6 tracking-widest italic m-0">
              1. MONTANT TOTAL LICENCE
            </p>
            <p className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white tracking-tighter m-0">
              {selectedPlan.price.toLocaleString('fr-SN')} 
              <span className="text-xl md:text-2xl text-blue-400">XOF</span>
            </p>
            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-blue-500/10">
              <p className="text-[10px] md:text-[11px] font-black text-slate-400 m-0 uppercase">
                Canal Wave Sénégal :
              </p>
              <p className="text-2xl md:text-3xl font-black italic text-blue-400 m-0">
                +221 77 441 09 02
              </p>
            </div>
          </article>
          <div className="space-y-2 md:space-y-3 lg:space-y-4">
            <label htmlFor="payment-ref" className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4 italic block">
              2. RÉFÉRENCE TRANSACTION SMS *
            </label>
            <input 
              id="payment-ref"
              required 
              className={cn(
                "w-full p-4 md:p-6 lg:p-8 bg-black/40 border-2 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] text-lg md:text-xl lg:text-2xl font-black text-blue-400 outline-none focus:border-blue-500 uppercase italic shadow-inner transition-all",
                !paymentRef && submitting ? "border-red-500/50" : "border-white/5"
              )}
              placeholder="EX: T-230102..." 
              value={paymentRef} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => onPaymentRefChange(e.target.value.toUpperCase())}
              aria-required="true"
            />
            {!paymentRef && submitting && (
              <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> La référence est requise
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-between gap-6 md:gap-8 lg:gap-10">
          <article className="p-6 md:p-8 lg:p-10 bg-amber-500/5 border-2 border-amber-500/10 rounded-2xl md:rounded-3xl lg:rounded-[3rem] text-left italic">
            <div className="flex items-center gap-3 md:gap-4 text-amber-400 mb-4 md:mb-6 font-black uppercase text-[9px] md:text-[10px] tracking-widest">
              <Clock size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> 
              Activation sous 48h
            </div>
            <p className="text-[10px] md:text-[11px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest m-0">
              L&apos;activation est subordonnée au rapprochement bancaire physique. Toute référence invalide entraînera le gel de l&apos;instance Qualisoft.
            </p>
          </article>
          <button 
            type="button"
            onClick={onSubmit} 
            disabled={!paymentRef || submitting} 
            className={cn(
              "w-full py-6 md:py-8 lg:py-10 bg-blue-600 text-white rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black text-[10px] md:text-[11px] lg:text-[12px] tracking-widest italic shadow-2xl border-none cursor-pointer hover:bg-white hover:text-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3 md:gap-4 lg:gap-5 uppercase focus:outline-none focus:ring-2 focus:ring-blue-400",
              (!paymentRef || submitting) && "opacity-30 cursor-not-allowed active:scale-100"
            )}
            aria-busy={submitting}
            aria-label="Valider le règlement"
          >
            {submitting ? (
              <><Loader2 size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">TRAITEMENT...</span></>
            ) : (
              <><ShieldCheck size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" /> <span className="hidden sm:inline">Valider le Règlement</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function BillingPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const syncLicense = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Tenant>("/admin/tenant/me");
      setTenant(res.data?.data || res.data || null);
    } catch (error) {
      console.error('❌ Erreur synchronisation licence:', error);
      toast.error("RUPTURE KERNEL : Impossible de synchroniser la licence.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') syncLicense(); }, [syncLicense]);

  const currentLevel = useMemo(() => {
    if (!tenant) return 0;
    return QUALISOFT_PLANS.find(p => p.name === tenant.T_Plan)?.level || 1;
  }, [tenant]);

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setStep(2);
  };

  const handlePaymentRefChange = (value: string) => {
    setPaymentRef(value);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedPlan(null);
    setPaymentRef("");
  };

  const processPayment = async () => {
    if (!paymentRef || !selectedPlan || !tenant) return;
    
    setSubmitting(true);
    const toastId = toast.loading("Scellage de la transaction...");
    try {
      const payload: TransactionPayload = {
        TX_Amount: selectedPlan.price,
        TX_Reference: paymentRef.trim().toUpperCase(),
        TX_PaymentMethod: "WAVE",
        TX_PlanRequested: selectedPlan.name,
      };
      await apiClient.post("/transactions", payload);
      toast.success("Demande transmise au Noyau Financier.", { id: toastId });
      setStep(3);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "Échec du scellage.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Vérification des Droits d'Instance..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 bg-black/20 flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic flex items-center gap-3 md:gap-4">
            <ShieldCheck className="text-blue-400 w-8 h-8 md:w-10 md:h-10 lg:w-10 lg:h-10" aria-hidden="true" /> 
            Gestion <span className="text-blue-400">Licence</span>
          </h1>
          <p className="text-slate-500 text-[8px] md:text-[9px] tracking-widest m-0">
            Instance : {tenant?.T_Name} • Statut : <span className="text-blue-400">{tenant?.T_SubscriptionStatus}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 md:gap-4 bg-blue-600/10 px-4 md:px-6 lg:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl border border-blue-500/20 shadow-inner">
          <Crown size={20} className="w-5 h-5 md:w-6 md:h-6 text-amber-400" aria-hidden="true" />
          <span className="text-[9px] md:text-[10px] lg:text-sm font-black italic tracking-widest leading-none uppercase">
            ÉDITION {tenant?.T_Plan}
          </span>
        </div>
      </header>

      {/* 🧩 MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <div className="max-w-[100rem] mx-auto w-full">
          {step === 1 && (
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700" role="list" aria-label="Liste des plans disponibles">
              {QUALISOFT_PLANS.map((p) => {
                const isCurrent = tenant?.T_Plan === p.name;
                const isLocked = p.level < currentLevel && !isCurrent;
                return (
                  <PlanCard 
                    key={p.name} 
                    plan={p} 
                    isCurrent={isCurrent} 
                    isLocked={isLocked} 
                    currentLevel={currentLevel}
                    onSelect={handlePlanSelect}
                  />
                );
              })}
            </section>
          )}

          {step === 2 && selectedPlan && (
            <PaymentStep 
              selectedPlan={selectedPlan}
              tenant={tenant}
              paymentRef={paymentRef}
              onPaymentRefChange={handlePaymentRefChange}
              onSubmit={processPayment}
              onBack={handleBack}
              submitting={submitting}
            />
          )}

          {step === 3 && (
            <div className="max-w-2xl mx-auto text-center p-12 md:p-16 lg:p-20 bg-slate-900/60 border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] shadow-2xl animate-in zoom-in-95 duration-500" role="status">
              <CheckCircle2 size={48} className="w-12 h-12 md:w-16 md:h-16 text-emerald-400 mx-auto mb-4 md:mb-6" aria-hidden="true" />
              <h3 className="text-2xl md:text-3xl font-black italic m-0 mb-4 md:mb-6">Demande Enregistrée</h3>
              <p className="text-slate-400 text-[10px] md:text-[11px] font-bold uppercase tracking-widest m-0 mb-6 md:mb-8">
                Votre demande de mise à niveau vers {selectedPlan?.name} a été transmise.
              </p>
              <button 
                type="button"
                onClick={() => { setStep(1); setSelectedPlan(null); setPaymentRef(""); }}
                className="px-6 md:px-8 py-3 md:py-4 bg-blue-600 hover:bg-white hover:text-blue-700 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Retour au Dashboard
              </button>
            </div>
          )}
        </div>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}