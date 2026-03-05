/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : GESTION DES LICENCES (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Hub central de gestion des droits d'accès et facturation.
 * DESIGN : Elite High-Density / 100dvh / Zéro Scrolling Global.
 * SÉCURITÉ : Zéro NextAuth (Souveraineté JWT via apiClient).
 * ---------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 19:10 GMT
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "@/core/api/api-client";
import {
  Check, CheckCircle2, Clock, Crown, Loader2, Lock, ShieldCheck, X, RefreshCw
} from "lucide-react";
import { toast, Toaster } from "sonner";

// --- 🏗️ INTERFACES ---
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

const QUALISOFT_PLANS: Plan[] = [
  { name: "ESSAI", price: 0, level: 1, features: ["14 jours - Full Elite", "Accès intégral modules", "Support e-mail"] },
  { name: "EMERGENCE", price: 55000, level: 2, features: ["3 Utilisateurs", "3 Processus", "GED Fondamentale"] },
  { name: "CROISSANCE", price: 105000, level: 3, features: ["20 Utilisateurs", "6 Processus", "Intelligence 360°"] },
  { name: "ENTREPRISE", price: 175000, level: 4, features: ["50 Utilisateurs", "10 Processus", "Risques & Audits"] },
  { name: "GROUPE", price: 350000, level: 5, features: ["Utilisateurs Illimités", "Multi-filiales", "API SuperAdmin"] },
];

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
      const res = await apiClient.get<any>("/admin/tenant/me");
      setTenant(res.data?.data || res.data);
    } catch {
      toast.error("RUPTURE KERNEL : Impossible de synchroniser la licence.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { syncLicense(); }, [syncLicense]);

  const currentLevel = useMemo(() => {
    if (!tenant) return 0;
    return QUALISOFT_PLANS.find(p => p.name === tenant.T_Plan)?.level || 1;
  }, [tenant]);

  const processPayment = async () => {
    if (!paymentRef || !selectedPlan || !tenant) return;
    setSubmitting(true);
    const tid = toast.loading("Scellage de la transaction...");
    try {
      await apiClient.post("/transactions", {
        TX_Amount: selectedPlan.price,
        TX_Reference: paymentRef.trim().toUpperCase(),
        TX_PaymentMethod: "WAVE",
        TX_PlanRequested: selectedPlan.name,
      });
      toast.success("Demande transmise au Noyau Financier.", { id: tid });
      setStep(3);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Échec du scellage.", { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen label="Vérification des Droits d'Instance..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER COCKPIT */}
      <header className="shrink-0 p-8 border-b border-white/5 bg-black/20 flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <h1 className="text-3xl lg:text-5xl tracking-tighter leading-none m-0 italic flex items-center gap-4">
            <ShieldCheck className="text-blue-600" size={40} /> Gestion <span className="text-blue-600">Licence</span>
          </h1>
          <p className="text-slate-500 text-[9px] tracking-[0.4em] m-0">
            Instance : {tenant?.T_Name} • Statut : <span className="text-blue-400">{tenant?.T_SubscriptionStatus}</span>
          </p>
        </div>
        <div className="flex items-center gap-4 bg-blue-600/10 px-8 py-4 rounded-3xl border border-blue-500/20 shadow-inner">
          <Crown size={24} className="text-amber-500" />
          <span className="text-sm font-black italic tracking-widest leading-none uppercase">ÉDITION {tenant?.T_Plan}</span>
        </div>
      </header>

      {/* 🧩 MATRIX VIEWPORT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-400 mx-auto w-full">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {QUALISOFT_PLANS.map((p) => {
                const isCurrent = tenant?.T_Plan === p.name;
                const isLocked = p.level < currentLevel && !isCurrent;
                return (
                  <div key={p.name} className={cn(
                    "relative p-8 rounded-[3rem] border-2 flex flex-col transition-all duration-500",
                    isCurrent ? "bg-blue-600 border-white/20 shadow-4xl scale-105 z-10" : "bg-slate-900/40 border-white/5 hover:border-blue-500/30"
                  )}>
                    <div className="flex justify-between items-start mb-6">
                      <div className={cn("p-4 rounded-2xl", isCurrent ? "bg-white/20 text-white" : "bg-blue-600/10 text-blue-500")}>
                        <Crown size={20} />
                      </div>
                      {isCurrent && <span className="bg-white/20 px-4 py-1 rounded-lg text-[9px] font-black italic">ACTIF</span>}
                    </div>
                    <h3 className="text-2xl font-black mb-2 italic tracking-tighter m-0">{p.name}</h3>
                    <div className="flex items-baseline gap-2 mb-8">
                      <span className="text-3xl font-black italic">{p.price === 0 ? "FREE" : p.price.toLocaleString()}</span>
                      {p.price > 0 && <span className="text-[9px] text-white/50">XOF / AN</span>}
                    </div>
                    <ul className="space-y-4 mb-10 flex-1 list-none p-0">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-[10px] font-bold italic tracking-tight uppercase">
                          <Check size={14} className={isCurrent ? "text-white" : "text-emerald-500"} strokeWidth={4} /> {f}
                        </li>
                      ))}
                    </ul>
                    {isLocked ? (
                      <div className="p-4 bg-black/30 rounded-2xl flex items-center justify-center gap-3 text-slate-500 italic text-[10px] font-black"><Lock size={14} /> Plan Inférieur</div>
                    ) : isCurrent ? (
                      <div className="p-4 bg-white/10 rounded-2xl flex items-center justify-center gap-3 text-white italic text-[10px] font-black"><CheckCircle2 size={14} /> Option Actuelle</div>
                    ) : (
                      <button onClick={() => { setSelectedPlan(p); setStep(2); }} className="w-full py-5 bg-blue-600 hover:bg-white hover:text-blue-600 rounded-3xl text-[10px] font-black shadow-xl border-none cursor-pointer transition-all active:scale-95 italic uppercase tracking-widest">Activer l&apos;Édition</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {step === 2 && selectedPlan && (
            <div className="max-w-4xl mx-auto bg-slate-900/60 border-2 border-white/5 rounded-[4rem] p-16 shadow-4xl animate-in slide-in-from-right duration-500 backdrop-blur-3xl">
              <div className="flex items-center gap-8 mb-16">
                <button onClick={() => setStep(1)} className="p-5 bg-white/5 rounded-3xl text-white hover:bg-red-600 transition-all border-none cursor-pointer"><X size={28} /></button>
                <h3 className="text-5xl font-black italic tracking-tighter m-0 uppercase leading-none">Mise à Niveau <span className="text-blue-600">{selectedPlan.name}</span></h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-10">
                  <div className="p-10 bg-blue-600/5 border-2 border-blue-500/20 rounded-[3rem] shadow-inner">
                    <p className="text-[10px] font-black text-blue-500 mb-6 tracking-widest italic m-0">1. MONTANT TOTAL LICENCE</p>
                    <p className="text-6xl font-black italic text-white tracking-tighter m-0">{selectedPlan.price.toLocaleString()} <span className="text-2xl text-blue-500">XOF</span></p>
                    <div className="mt-8 pt-8 border-t border-blue-500/10">
                      <p className="text-[11px] font-black text-slate-400 m-0 uppercase">Canal Wave Sénégal :</p>
                      <p className="text-3xl font-black italic text-blue-400 m-0">+221 77 441 09 02</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">2. RÉFÉRENCE TRANSACTION SMS *</label>
                    <input required className="w-full p-8 bg-black/40 border-2 border-white/5 rounded-4xl text-2xl font-black text-blue-500 outline-none focus:border-blue-600 uppercase italic shadow-inner transition-all" placeholder="EX: T-230102..." value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col justify-between gap-10">
                  <div className="p-10 bg-amber-500/5 border-2 border-amber-500/10 rounded-[3rem] text-left italic">
                    <div className="flex items-center gap-4 text-amber-500 mb-6 font-black uppercase text-[10px] tracking-widest"><Clock size={20} /> Activation sous 48h</div>
                    <p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest m-0">L&apos;activation est subordonnée au rapprochement bancaire physique. Toute référence invalide entraînera le gel de l&apos;instance Qualisoft.</p>
                  </div>
                  <button onClick={processPayment} disabled={!paymentRef || submitting} className="w-full py-10 bg-blue-600 text-white rounded-[2.5rem] font-black text-[12px] tracking-[0.4em] italic shadow-4xl border-none cursor-pointer hover:bg-white hover:text-blue-600 transition-all active:scale-95 flex items-center justify-center gap-5 uppercase">
                    {submitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={28} />} Valider le Règlement
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
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

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');