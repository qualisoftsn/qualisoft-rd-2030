/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : PILOTAGE FACTURATION (ELITE SDE)
 * RÔLE : Gestion des flux financiers et preuve de paiement (Wave/OM)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useCallback, useEffect, useState, ChangeEvent, KeyboardEvent } from "react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import {
  AlertCircle, Calendar, Check, Crown, Loader2, Send, ShieldCheck, X, RefreshCw, CreditCard, Download
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface Plan {
  id: string;
  name: string;
  price: string;
  rawPrice: number;
  users: string;
  features: string[];
}

export interface Subscription {
  plan?: string;
  planName?: string;
  status?: string;
  rawPrice?: number;
  expiryDate?: string;
  isActive?: boolean;
}

export interface TransactionPayload {
  TX_Amount: number;
  TX_Reference: string;
  TX_PaymentMethod: string;
  TX_PlanRequested: string;
}

export interface PlanCardProps {
  plan: Plan;
  isCurrent: boolean;
  onSelect: (plan: Plan) => void;
}

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: Plan | null;
  reference: string;
  onReferenceChange: (value: string) => void;
  method: string;
  onMethodChange: (method: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const PLANS: Plan[] = [
  { id: "EMERGENCE", name: "Émergence", price: "55.000", rawPrice: 55000, users: "1 RQ / 3 Pilotes", features: ["GED SMQ Fondamentale", "Gestion des NC", "Actions Correctives"] },
  { id: "CROISSANCE", name: "Croissance", price: "105.000", rawPrice: 105000, users: "1 RQ / 6 Pilotes", features: ["Tout Émergence", "Matrice Compétences", "Analyses & KPI"] },
  { id: "PRO", name: "Entreprise", price: "175.000", rawPrice: 175000, users: "2 RQ / 10 Pilotes", features: ["Tout Croissance", "Audits Internes", "Gestion Risques"] },
  { id: "GROUPE", name: "Groupe", price: "350.000", rawPrice: 350000, users: "Illimité", features: ["SMI Illimité", "Multi-filiales", "API & Intégration"] },
];

const PAYMENT_METHODS = [
  { id: "WAVE", name: "WAVE SÉNÉGAL", color: "blue" },
  { id: "ORANGE_MONEY", name: "ORANGE MONEY", color: "orange" },
];

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
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

function PlanCard({ plan, isCurrent, onSelect }: PlanCardProps) {
  return (
    <article 
      className={cn(
        "p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] border-2 flex flex-col bg-slate-900/40 transition-all duration-500 group relative overflow-hidden focus-within:ring-2 focus-within:ring-blue-400",
        isCurrent ? "border-blue-600 scale-105 shadow-2xl z-10" : "border-white/5 hover:border-blue-500/30"
      )}
      role="article"
      aria-label={`Plan ${plan.name}`}
    >
      {isCurrent && (
        <div className="absolute top-4 md:top-6 right-4 md:right-6 p-3 md:p-4 bg-blue-600 rounded-xl md:rounded-2xl shadow-xl" aria-hidden="true">
          <Check size={16} className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={4} />
        </div>
      )}
      <h3 className="text-2xl md:text-3xl font-black italic m-0 mb-4 md:mb-6 group-hover:text-blue-400 transition-colors uppercase tracking-tighter">{plan.name}</h3>
      <div className="mb-6 md:mb-8 lg:mb-10 text-left">
        <span className="text-4xl md:text-5xl font-black italic text-white tracking-tighter leading-none">{plan.price}</span>
        <span className="block text-slate-500 text-[9px] md:text-[10px] font-black uppercase mt-2 md:mt-3 tracking-widest italic leading-none">FCFA / ANNUEL</span>
      </div>
      <ul className="space-y-3 md:space-y-4 mb-8 md:mb-10 lg:mb-12 flex-1 list-none p-0 text-left" role="list">
        <li className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black text-blue-400 uppercase italic border-b border-white/5 pb-3 md:pb-4 tracking-widest">
          <Calendar size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
          {plan.users}
        </li>
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 md:gap-3 text-[10px] md:text-[11px] font-bold text-slate-300 uppercase italic tracking-tight">
            <Check size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-400" strokeWidth={4} aria-hidden="true" /> 
            {f}
          </li>
        ))}
      </ul>
      <button 
        type="button"
        onClick={() => onSelect(plan)} 
        disabled={isCurrent} 
        className={cn(
          "w-full py-4 md:py-5 lg:py-6 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black uppercase text-[9px] md:text-[10px] italic transition-all border-none cursor-pointer tracking-widest m-0 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400",
          isCurrent 
            ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
            : "bg-blue-600 hover:bg-white hover:text-blue-700 text-white shadow-xl"
        )}
        aria-label={isCurrent ? "Édition active" : `Activer le plan ${plan.name}`}
        aria-pressed={isCurrent}
      >
        {isCurrent ? "EDITION ACTIVE" : "ACTIVER L'ÉDITION"}
      </button>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : PAYMENT MODAL
// ============================================================================

function PaymentModal({ isOpen, onClose, selectedPlan, reference, onReferenceChange, method, onMethodChange, onSubmit, submitting }: PaymentModalProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSubmit = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && reference.trim()) {
      onSubmit();
    }
  };

  if (!isOpen || !selectedPlan) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-6 lg:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-[#0B0F1A] border-2 border-white/10 w-full max-w-xl rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-6 md:p-8 lg:p-12 relative shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh] italic font-black uppercase">
        <button 
          type="button"
          onClick={onClose} 
          className="absolute top-4 md:top-6 lg:top-10 right-4 md:right-6 lg:right-10 text-slate-500 hover:text-white hover:bg-white/10 p-2 md:p-3 rounded-xl md:rounded-2xl transition-all border-none bg-transparent cursor-pointer z-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Fermer"
        >
          <X size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
        </button>
        <div className="overflow-y-auto custom-scrollbar pr-1 md:pr-2">
          <header className="mb-8 md:mb-10 lg:mb-12">
            <h2 id="modal-title" className="text-2xl md:text-3xl lg:text-4xl font-black italic mb-3 md:mb-4 leading-none tracking-tighter text-white m-0">
              Règlement <span className="text-blue-400">Sénégal</span>
            </h2>
            <div className="p-4 md:p-6 bg-blue-600/5 border-2 border-blue-500/20 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] italic mt-6 md:mt-8 flex items-center gap-3 md:gap-4 lg:gap-5">
               <ShieldCheck className="text-blue-400 shrink-0 w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
               <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed m-0 text-left">
                 Validation sécurisée via rapprochement des flux bancaires Wave / OM.
               </p>
            </div>
          </header>
          <div className="space-y-4 md:space-y-5 lg:space-y-6">
            <article className="p-4 md:p-6 lg:p-8 bg-white/5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] border-2 border-white/5 flex justify-between items-center shadow-inner" role="status">
              <span className="text-[9px] md:text-[10px] font-black text-slate-400 tracking-widest text-left uppercase">Net à transférer</span>
              <span className="text-2xl md:text-3xl font-black italic text-white leading-none tracking-tighter">{selectedPlan.price} XOF</span>
            </article>
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-5" role="radiogroup" aria-label="Méthode de paiement">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onMethodChange(m.id)}
                  className={cn(
                    "py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl font-black text-[9px] md:text-[10px] uppercase italic transition-all border-2 cursor-pointer shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400",
                    method === m.id 
                      ? m.color === "blue" 
                        ? "bg-blue-600 border-blue-500 text-white" 
                        : "bg-orange-600 border-orange-500 text-white"
                      : "bg-white/5 border-transparent text-slate-500 hover:text-white"
                  )}
                  role="radio"
                  aria-checked={method === m.id}
                  aria-label={m.name}
                >
                  {m.name}
                </button>
              ))}
            </div>
            <div className="space-y-2 md:space-y-3 text-left">
              <label htmlFor="tx-reference" className="text-[9px] md:text-[10px] font-black text-slate-500 ml-2 md:ml-4 lg:ml-5 tracking-widest italic uppercase m-0 leading-none block">
                3. RÉFÉRENCE TRANSACTION SMS *
              </label>
              <input 
                id="tx-reference"
                required 
                className="w-full bg-[#0F172A] border-2 border-white/10 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-6 lg:p-8 text-lg md:text-xl lg:text-2xl font-black text-blue-400 uppercase italic outline-none focus:border-blue-500 shadow-inner transition-all" 
                placeholder="EX: T-230102.12..." 
                value={reference} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => onReferenceChange(e.target.value.toUpperCase())}
                onKeyDown={handleSubmit}
                aria-required="true"
              />
              {!reference.trim() && submitting && (
                <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> La référence est requise
                </p>
              )}
            </div>
            <button 
              type="button"
              onClick={onSubmit} 
              disabled={!reference.trim() || submitting} 
              className={cn(
                "w-full py-6 md:py-8 lg:py-10 bg-blue-600 text-white rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black text-[10px] md:text-[11px] lg:text-[12px] tracking-widest italic shadow-2xl border-none cursor-pointer hover:bg-white hover:text-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3 md:gap-4 lg:gap-5 uppercase focus:outline-none focus:ring-2 focus:ring-blue-400",
                (!reference.trim() || submitting) && "opacity-30 cursor-not-allowed active:scale-100"
              )}
              aria-busy={submitting}
              aria-label="Déclarer le règlement"
            >
              {submitting ? (
                <><Loader2 size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">TRAITEMENT...</span></>
              ) : (
                <><Send size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" /> <span className="hidden sm:inline">Déclarer le Règlement</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function BillingAltPage() {
  const [currentSub, setCurrentSub] = useState<Subscription>({});
  const [loading, setLoading] = useState(true);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState("WAVE");

  const fetchCurrentPlan = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Subscription>("/subscriptions/my-plan");
      setCurrentSub(res.data?.data || res.data || {});
    } catch (error) {
      console.error('❌ Erreur chargement abonnement:', error);
      toast.error("RUPTURE KERNEL : Liaison facturation interrompue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchCurrentPlan(); }, [fetchCurrentPlan]);

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowProofModal(true);
  };

  const handleCloseModal = () => {
    setShowProofModal(false);
    setSelectedPlan(null);
    setReference("");
  };

  const handleReferenceChange = (value: string) => {
    setReference(value);
  };

  const handleMethodChange = (newMethod: string) => {
    setMethod(newMethod);
  };

  const handleConfirmPayment = async () => {
    if (!reference.trim()) {
      toast.warning("Référence de transaction obligatoire.");
      return;
    }
    if (!selectedPlan) return;
    
    setSubmitting(true);
    const toastId = toast.loading("Scellage de la preuve transactionnelle...");
    try {
      const payload: TransactionPayload = {
        TX_Amount: selectedPlan.rawPrice,
        TX_Reference: reference.trim().toUpperCase(),
        TX_PaymentMethod: method,
        TX_PlanRequested: selectedPlan.id,
      };
      await apiClient.post("/transactions", payload);
      toast.success("Preuve scellée. Activation sous 48h.", { id: toastId });
      handleCloseModal();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "Échec de transmission de la preuve.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Extraction du Registre Financier..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 bg-black/20 flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <div className="flex items-center gap-2 md:gap-3 md:gap-4 text-amber-400 font-black tracking-widest text-[8px] md:text-[9px] uppercase italic leading-none m-0">
            <Crown size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" aria-hidden="true" /> 
            Système Qualisoft RD 2026
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black uppercase tracking-tighter leading-none italic m-0">
            Gestion <span className="text-blue-400">Facturation</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 md:gap-5 w-full xl:w-auto">
           <article className="bg-blue-600/10 border border-blue-500/20 px-4 md:px-6 lg:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl shadow-inner text-center xl:text-right">
              <p className="text-[8px] md:text-[9px] text-slate-500 m-0 tracking-widest uppercase italic">Instance Active</p>
              <p className="text-[10px] md:text-sm font-black text-blue-400 m-0 uppercase tracking-tighter">
                {currentSub?.planName || "ESSAI"} EDITION • {currentSub?.status || "TRIAL"}
              </p>
           </article>
        </div>
      </header>

      {/* 🧩 MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <div className="max-w-[100rem] mx-auto space-y-8 md:space-y-10 lg:space-y-12">
          
          {/* GRILLE DES OFFRES */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8" role="list" aria-label="Liste des plans disponibles">
            {PLANS.map((plan) => {
              const isCurrent = currentSub?.plan === plan.id;
              return (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  isCurrent={isCurrent} 
                  onSelect={handlePlanSelect}
                />
              );
            })}
          </section>
        </div>
      </main>

      {/* 🛡️ FOOTER */}
      <footer className="shrink-0 bg-[#0B0F1A] border-t border-white/5 px-4 md:px-6 py-3 md:py-4 lg:py-6 flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-blue-400 font-black text-[9px] md:text-[10px] tracking-widest uppercase italic">
          <ShieldCheck size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> 
          Matrice Billing Scellée • Sénégal RD-2026
        </div>
        <div className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-widest italic">
          Total HT : {currentSub?.rawPrice || 0} XOF
        </div>
      </footer>

      {/* 📟 PAYMENT MODAL */}
      <PaymentModal 
        isOpen={showProofModal}
        onClose={handleCloseModal}
        selectedPlan={selectedPlan}
        reference={reference}
        onReferenceChange={handleReferenceChange}
        method={method}
        onMethodChange={handleMethodChange}
        onSubmit={handleConfirmPayment}
        submitting={submitting}
      />

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}