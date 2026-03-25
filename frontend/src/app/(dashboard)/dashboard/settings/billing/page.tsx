/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : PILOTAGE FACTURATION (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Gestion des flux financiers et preuve de paiement (Wave/OM).
 * DESIGN : ClickUp High-Density / Matrix Command Center / 100dvh.
 * ARCHITECTURE : Zéro NextAuth (Souveraineté JWT via apiClient).
 * ---------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 19:15 GMT
 */

"use client";

import React, { useCallback, useEffect, useState } from "react";
import apiClient from "@/core/api/api-client";
import {
  AlertCircle, Calendar, Check, Crown, Loader2, Send, ShieldCheck, X, RefreshCw, CreditCard, Download
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

// --- 💎 RÉFÉRENTIEL DES PLANS ÉLITE ---
const PLANS = [
  { id: "EMERGENCE", name: "Émergence", price: "55.000", rawPrice: 55000, users: "1 RQ / 3 Pilotes", features: ["GED SMQ Fondamentale", "Gestion des NC", "Actions Correctives"] },
  { id: "CROISSANCE", name: "Croissance", price: "105.000", rawPrice: 105000, users: "1 RQ / 6 Pilotes", features: ["Tout Émergence", "Matrice Compétences", "Analyses & KPI"] },
  { id: "PRO", name: "Entreprise", price: "175.000", rawPrice: 175000, users: "2 RQ / 10 Pilotes", features: ["Tout Croissance", "Audits Internes", "Gestion Risques"] },
  { id: "GROUPE", name: "Groupe", price: "350.000", rawPrice: 350000, users: "Illimité", features: ["SMI Illimité", "Multi-filiales", "API & Intégration"] },
];

export default function BillingAltPage() {
  const [currentSub, setCurrentSub] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState("WAVE");

  // --- 📡 SYNCHRONISATION KERNEL ---
  const fetchCurrentPlan = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>("/subscriptions/my-plan");
      setCurrentSub(res.data?.data || res.data || {});
    } catch {
      toast.error("RUPTURE KERNEL : Liaison facturation interrompue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCurrentPlan(); }, [fetchCurrentPlan]);

  const handleConfirmPayment = async () => {
    if (!reference.trim()) return toast.warning("Référence de transaction obligatoire.");
    setSubmitting(true);
    const tid = toast.loading("Scellage de la preuve transactionnelle...");
    try {
      await apiClient.post("/transactions", {
        TX_Amount: selectedPlan.rawPrice,
        TX_Reference: reference.trim().toUpperCase(),
        TX_PaymentMethod: method,
        TX_PlanRequested: selectedPlan.id,
      });
      toast.success("Preuve scellée. Activation sous 48h.", { id: tid });
      setShowProofModal(false);
      setReference("");
    } catch {
      toast.error("Échec de transmission de la preuve.", { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen label="Extraction du Registre Financier..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER CLICKUP COCKPIT */}
      <header className="shrink-0 p-8 border-b border-white/5 bg-black/20 flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-4 text-amber-500 font-black tracking-[0.4em] text-[9px] uppercase italic leading-none m-0">
            <Crown size={16} /> Système Qualisoft RD 2026
          </div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none italic m-0">
            Gestion <span className="text-blue-600">Facturation</span>
          </h1>
        </div>
        <div className="flex items-center gap-5 w-full xl:w-auto">
           <div className="bg-blue-600/10 border border-blue-500/20 px-8 py-4 rounded-3xl shadow-inner text-center xl:text-right">
              <p className="text-[9px] text-slate-500 m-0 tracking-widest uppercase italic">Instance Active</p>
              <p className="text-sm font-black text-blue-400 m-0 uppercase tracking-tighter">{currentSub?.planName || "ESSAI"} EDITION • {currentSub?.status || "TRIAL"}</p>
           </div>
        </div>
      </header>

      {/* 🧩 DATA MATRIX (Isolated Scroll) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-400 mx-auto space-y-12">
          
          {/* GRILLE DES OFFRES */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {PLANS.map((plan) => {
              const isCurrent = currentSub?.plan === plan.id;
              return (
                <div key={plan.id} className={cn(
                  "p-10 rounded-[3.5rem] border-2 flex flex-col bg-slate-900/40 transition-all duration-500 group relative overflow-hidden",
                  isCurrent ? "border-blue-600 scale-105 shadow-4xl z-10" : "border-white/5 hover:border-blue-500/30"
                )}>
                  {isCurrent && <div className="absolute top-6 right-6 p-4 bg-blue-600 rounded-2xl shadow-xl"><Check size={20} className="text-white" strokeWidth={4} /></div>}
                  <h3 className="text-3xl font-black italic m-0 mb-6 group-hover:text-blue-400 transition-colors uppercase tracking-tighter">{plan.name}</h3>
                  <div className="mb-10 text-left">
                    <span className="text-5xl font-black italic text-white tracking-tighter leading-none">{plan.price}</span>
                    <span className="block text-slate-500 text-[10px] font-black uppercase mt-3 tracking-widest italic leading-none">FCFA / ANNUEL</span>
                  </div>
                  <ul className="space-y-4 mb-12 flex-1 list-none p-0 text-left">
                    <li className="flex items-center gap-3 text-[10px] font-black text-blue-500 uppercase italic border-b border-white/5 pb-4 tracking-widest"><Calendar size={16}/> {plan.users}</li>
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-300 uppercase italic tracking-tight"><Check size={14} className="text-emerald-500" strokeWidth={4} /> {f}</li>
                    ))}
                  </ul>
                  <button onClick={() => { setSelectedPlan(plan); setShowProofModal(true); }} disabled={isCurrent} className={cn(
                    "w-full py-6 rounded-4xl font-black uppercase text-[10px] italic transition-all border-none cursor-pointer tracking-widest m-0 active:scale-95",
                    isCurrent ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-blue-600 hover:bg-white hover:text-blue-600 text-white shadow-xl"
                  )}>{isCurrent ? "EDITION ACTIVE" : "ACTIVER L'ÉDITION"}</button>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* 🛡️ FOOTER SÉCURITÉ */}
      <footer className="shrink-0 bg-[#0B0F1A] border-t border-white/5 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4 text-blue-500 font-black text-[10px] tracking-widest uppercase italic"><ShieldCheck size={20} /> Matrice Billing Scellée • Sénégal RD-2026</div>
        <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic">
          {"Total HT : $$P_{Total} = \\sum_{i=1}^{n} P_i \\times 1 = " + (currentSub?.rawPrice || 0) + " \\text{ XOF}$$"}
        </div>
      </footer>

      {/* 📟 TUNNEL DE PAIEMENT (ClickUp Industrial) */}
      {showProofModal && selectedPlan && (
        <div className="fixed inset-0 z-1000 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8">
          <div className="bg-[#0B0F1A] border-2 border-white/10 w-full max-w-xl rounded-[4rem] p-12 relative shadow-4xl animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh] italic font-black uppercase">
            <button onClick={() => setShowProofModal(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white hover:bg-white/10 p-3 rounded-2xl transition-all border-none bg-transparent cursor-pointer z-10"><X size={32} /></button>
            <div className="overflow-y-auto custom-scrollbar pr-2">
              <header className="mb-12">
                <h2 className="text-4xl font-black italic mb-4 leading-none tracking-tighter text-white m-0">Règlement <span className="text-blue-600">Sénégal</span></h2>
                <div className="p-6 bg-blue-600/5 border-2 border-blue-500/20 rounded-[2.5rem] italic mt-8 flex items-center gap-5">
                   <ShieldCheck className="text-blue-500 shrink-0" size={24} />
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed m-0 text-left">Validation sécurisée via rapprochement des flux bancaires Wave / OM.</p>
                </div>
              </header>
              <div className="space-y-8">
                <div className="p-8 bg-white/5 rounded-4xl border-2 border-white/5 flex justify-between items-center shadow-inner">
                  <span className="text-[10px] font-black text-slate-400 tracking-widest text-left uppercase">Net à transférer</span>
                  <span className="text-3xl font-black italic text-white leading-none tracking-tighter">{selectedPlan.price} XOF</span>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <button onClick={() => setMethod("WAVE")} className={cn("py-5 rounded-3xl font-black text-[10px] uppercase italic transition-all border-2 cursor-pointer shadow-lg", method === "WAVE" ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-transparent text-slate-500 hover:text-white")}>WAVE SÉNÉGAL</button>
                  <button onClick={() => setMethod("ORANGE_MONEY")} className={cn("py-5 rounded-3xl font-black text-[10px] uppercase italic transition-all border-2 cursor-pointer shadow-lg", method === "ORANGE_MONEY" ? "bg-orange-600 border-orange-500 text-white" : "bg-white/5 border-transparent text-slate-500 hover:text-white")}>ORANGE MONEY</button>
                </div>
                <div className="space-y-4 text-left">
                  <label className="text-[10px] font-black text-slate-500 ml-5 tracking-widest italic uppercase m-0 leading-none">3. RÉFÉRENCE TRANSACTION SMS *</label>
                  <input required className="w-full bg-[#0F172A] border-2 border-white/10 rounded-4xl p-8 text-2xl font-black text-blue-500 uppercase italic outline-none focus:border-blue-600 shadow-inner transition-all" placeholder="EX: T-230102.12..." value={reference} onChange={(e) => setReference(e.target.value)} />
                </div>
                <button onClick={handleConfirmPayment} disabled={!reference || submitting} className="w-full py-10 bg-blue-600 text-white rounded-[2.5rem] font-black text-[12px] tracking-[0.4em] italic shadow-4xl border-none cursor-pointer hover:bg-white hover:text-blue-600 transition-all active:scale-95 flex items-center justify-center gap-5 uppercase">
                  {submitting ? <Loader2 className="animate-spin" /> : <Send size={24} />} Déclarer le Règlement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

// --- 🧩 ATOMIQUES ---
function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}
