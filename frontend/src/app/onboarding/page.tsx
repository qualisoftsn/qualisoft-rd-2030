/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🚀 MODULE : src/app/(auth)/onboarding/page.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Initialisation du Tenant Organisationnel & Périmètre SMI.
 * RÔLE : Sas de qualification pour le déploiement multi-tenant souverain.
 * CONFORMITÉ : ISO 9001 §4.3 (Périmètre) & §5.1 (Engagement Direction).
 * SÉCURITÉ : Zéro NextAuth. Injection directe via useOnboarding Master.
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 17:11 GMT
 */

"use client";

import React, { useState } from "react";
import { 
  Activity, Building2, CheckCircle2, ChevronRight, Globe, 
  Lock, Mail, ShieldCheck, User, Zap 
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const { completeOnboarding } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    companyName: "",
    sector: "SERVICES",
  });

  /**
   * ⏩ NAVIGATION TACTIQUE (§4.3)
   * Validation des jalons avant progression dans la matrice.
   */
  const handleNext = () => {
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.firstName) {
        return toast.error("HABILITATION INCOMPLÈTE : Veuillez remplir tous les champs.");
      }
      if (formData.password.length < 8) {
        return toast.error("SÉCURITÉ : Le mot de passe doit comporter au moins 8 caractères.");
      }
    }
    if (step === 2 && !formData.companyName) {
      return toast.error("STRUCTURE : Le nom de l'organisation est requis.");
    }
    setStep((s) => s + 1);
  };

  /**
   * 💎 DÉPLOIEMENT FINAL DU TENANT
   * Déclenche l'instanciation de l'environnement Cloud Sovereign.
   */
  const handleSubmit = async () => {
    try {
      setLoading(true);
      // completeOnboarding gère le stockage des tokens et la création du profil
      await completeOnboarding(formData);
      toast.success("ENVIRONNEMENT ELITE DÉPLOYÉ AVEC SUCCÈS.");
    } catch (error: any) {
      toast.error(error.message || "ERREUR CRITIQUE : Échec du déploiement de l'instance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-6 italic font-sans selection:bg-blue-600/30 overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🌌 ATMOSPHÈRE SDE */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-150 h-150 bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="bg-white max-w-md w-full rounded-[3rem] lg:rounded-[4rem] shadow-4xl p-10 lg:p-14 relative z-10 animate-in fade-in zoom-in duration-700">
        
        {/* 🧭 PROGRESS TRACKER */}
        <div className="mb-12">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-5 leading-none">
            <span className="flex items-center gap-2">
              <Activity size={14} className="text-blue-600" /> Phase {step} / 3
            </span>
            <span className="text-slate-900">
              {step === 1 ? "Habilitation" : step === 2 ? "Organisation" : "Activation"}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-blue-600 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.5)]"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* 👤 STEP 1 : IDENTITÉ PILOTE */}
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 text-left">
            <div className="space-y-3">
              <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none m-0">
                Profil <span className="text-blue-600">Pilote</span>
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest m-0 italic">
                Identification du gestionnaire SMI
              </p>
            </div>

            <div className="space-y-5">
              <FieldWrapper icon={User} label="Nom & Prénom">
                <input
                  type="text"
                  placeholder="EX: MAME DIARRA"
                  className="w-full bg-slate-50 border-none p-5 rounded-2xl text-[11px] font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value.toUpperCase() })}
                />
              </FieldWrapper>
              <FieldWrapper icon={Mail} label="Email Master">
                <input
                  type="email"
                  placeholder="contact@organisation.sn"
                  className="w-full bg-slate-50 border-none p-5 rounded-2xl text-[11px] font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </FieldWrapper>
              <FieldWrapper icon={Lock} label="Mot de passe">
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-none p-5 rounded-2xl text-[11px] font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </FieldWrapper>
            </div>

            <button onClick={handleNext} className="w-full bg-slate-900 hover:bg-blue-600 text-white py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 border-none cursor-pointer">
              Continuer vers l&apos;organisation <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* 🏢 STEP 2 : PÉRIMÈTRE SMI */}
        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 text-left">
            <div className="space-y-3">
              <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none m-0">
                Périmètre <span className="text-blue-600">SMI</span>
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest m-0 italic">
                Détermination de l&apos;entité (§4.3)
              </p>
            </div>

            <div className="space-y-5">
              <FieldWrapper icon={Building2} label="Raison Sociale">
                <input
                  type="text"
                  placeholder="NOM DE L'ENTITÉ"
                  className="w-full bg-slate-50 border-none p-5 rounded-2xl text-[11px] font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value.toUpperCase() })}
                />
              </FieldWrapper>
              <FieldWrapper icon={Globe} label="Secteur d'activité">
                <select
                  className="w-full bg-slate-50 border-none p-5 rounded-2xl text-[11px] font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner appearance-none cursor-pointer"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                >
                  <option value="SERVICES">Services / Conseil</option>
                  <option value="LOGISTICS">Logistique & Transport</option>
                  <option value="HEALTH">Santé / Pharma</option>
                  <option value="CONSTRUCTION">BTP / Industrie</option>
                </select>
              </FieldWrapper>
            </div>

            <button onClick={handleNext} className="w-full bg-slate-900 hover:bg-blue-600 text-white py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl active:scale-95 border-none cursor-pointer">
              Passer au déploiement final
            </button>
          </div>
        )}

        {/* 💎 STEP 3 : ACTIVATION ELITE */}
        {step === 3 && (
          <div className="space-y-10 text-center animate-in zoom-in duration-700">
            <div className="flex justify-center">
              <div className="bg-blue-600/10 p-10 rounded-[3.5rem] text-blue-600 shadow-inner border border-blue-500/10">
                <ShieldCheck size={72} strokeWidth={1.5} className="animate-pulse" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 leading-none m-0">
                Activation <span className="text-blue-600">Elite</span>
              </h2>
              <p className="text-[11px] lg:text-[12px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed m-0 italic px-4">
                Instanciation de votre environnement multi-tenant sécurisé. <br/>
                Validation des référentiels de base.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-dashed border-slate-200 space-y-4">
              <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase italic tracking-widest">
                <Zap size={16} className="text-amber-500" /> Instance : Cloud Sovereign Active
              </div>
              <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase italic tracking-widest">
                <CheckCircle2 size={16} className="text-green-500" /> Chiffrement : Protocole AES-256
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 text-white py-7 rounded-4xl font-black uppercase text-[11px] tracking-widest transition-all shadow-2xl shadow-green-900/20 flex items-center justify-center gap-4 border-none cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <><Activity size={20} className="animate-spin" /> Déploiement en cours...</>
              ) : (
                "ACTIVER MON INSTANCE SOUVERAINE"
              )}
            </button>
          </div>
        )}
      </div>

      {/* 🔐 SDE SECURITY FOOTER */}
      <div className="absolute bottom-10 text-center space-y-2 opacity-30">
        <p className="text-[9px] font-black text-white uppercase italic tracking-[0.5em] m-0">
          Qualisoft Sovereign Architecture • Multi-Tenant Engine v4.0
        </p>
        <p className="text-[8px] font-bold text-slate-500 uppercase italic tracking-[0.3em] m-0">
          Conforme aux protocoles de sécurité Cloud RD 2026
        </p>
      </div>
    </div>
  );
}

function FieldWrapper({ icon: Icon, label, children }: any) {
  return (
    <div className="space-y-2.5 group">
      <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] ml-4 italic group-focus-within:text-blue-600 transition-colors">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
        {children}
      </div>
    </div>
  );
}