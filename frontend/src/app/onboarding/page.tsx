/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

/**
 * 🚀 MODULE : ONBOARDING CONFIGURATION ELITE
 * -------------------------------------------------------------------------
 * FONCTION : Initialisation du compte organisationnel et du périmètre SMI.
 * RÔLE : Sas de qualification pour le déploiement multi-tenant.
 * CONFORMITÉ : ISO 9001 §4.3 (Détermination du périmètre) & §5.1 (Engagement).
 */

import { useState } from 'react';
import { useOnboarding } from '../../hooks/useOnboarding';
import { 
  User, Mail, Lock, Building2, Activity, 
  CheckCircle2, ChevronRight, ShieldCheck, Zap, Globe 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const { completeOnboarding } = useOnboarding();
  const [loading, setLoading] = useState(false);

  // --- RÉFÉRENTIEL DE DONNÉES D'INITIALISATION ---
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    companyName: '',
    sector: 'SERVICES',
  });

  /**
   * ⏩ NAVIGATION TACTIQUE
   * Vérifie sommairement la présence des données avant de passer à l'étape suivante.
   */
  const handleNext = () => {
    if (step === 1 && (!formData.email || !formData.password || !formData.firstName)) {
      toast.error("Veuillez remplir les champs d'habilitation.");
      return;
    }
    if (step === 2 && !formData.companyName) {
      toast.error("Le nom de l'organisation est requis.");
      return;
    }
    setStep((s) => s + 1);
  };

  /**
   * 💎 DÉPLOIEMENT FINAL DU TENANT
   * Lance le processus lourd de configuration via le hook useOnboarding.
   */
  const handleSubmit = async () => {
    try {
      setLoading(true);
      await completeOnboarding(formData);
      toast.success("Environnement Elite configuré avec succès.");
    } catch (error) {
      toast.error("Erreur lors du déploiement de l'environnement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-6 selection:bg-blue-600/30">
      {/* 🌌 EFFET D'ATMOSPHÈRE EN ARRIÈRE-PLAN */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="bg-white max-w-md w-full rounded-[3rem] shadow-2xl p-12 relative z-10 animate-in fade-in zoom-in duration-500 italic">
        
        {/* 🧭 INDICATEUR DE PROGRESSION SOVEREIGN */}
        <div className="mb-12">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">
            <span className="flex items-center gap-2">
              <Activity size={12} className="text-blue-600" /> Phase {step} / 3
            </span>
            <span className="text-slate-900">
              {step === 1 ? 'Habilitation' : step === 2 ? 'Organisation' : 'Déploiement'}
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-blue-600 transition-all duration-1000 ease-out shadow-[0_0_10px_#2563eb]" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* 👤 ÉTAPE 1 : IDENTITÉ ET ACCÈS SÉCURISÉ */}
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
                Accès <span className="text-blue-600">Elite</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Initialisez votre profil pilote</p>
            </div>

            <div className="space-y-5">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type="text" placeholder="PRÉNOM & NOM" 
                  className="w-full bg-slate-50 border-none p-5 pl-12 rounded-2xl text-[11px] font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type="email" placeholder="EMAIL PROFESSIONNEL" 
                  className="w-full bg-slate-50 border-none p-5 pl-12 rounded-2xl text-[11px] font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type="password" placeholder="MOT DE PASSE" 
                  className="w-full bg-slate-50 border-none p-5 pl-12 rounded-2xl text-[11px] font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button 
              onClick={handleNext}
              className="w-full bg-slate-900 hover:bg-blue-600 text-white py-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 border-none cursor-pointer"
            >
              Continuer <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* 🏢 ÉTAPE 2 : PÉRIMÈTRE ORGANISATIONNEL */}
        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
                Structure <span className="text-blue-600">SMI</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Cadre légal de l&apos;organisation</p>
            </div>

            <div className="space-y-5">
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type="text" placeholder="NOM DE L'ORGANISATION" 
                  className="w-full bg-slate-50 border-none p-5 pl-12 rounded-2xl text-[11px] font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner"
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <select 
                  className="w-full bg-slate-50 border-none p-5 pl-12 rounded-2xl text-[11px] font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner appearance-none cursor-pointer"
                  value={formData.sector}
                  onChange={(e) => setFormData({...formData, sector: e.target.value})}
                >
                  <option value="SERVICES">Services / Conseil</option>
                  <option value="LOGISTICS">Logistique & Transport</option>
                  <option value="HEALTH">Santé / Pharma</option>
                  <option value="CONSTRUCTION">BTP / Industrie</option>
                  <option value="MINING">Mines & Énergie</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleNext}
              className="w-full bg-slate-900 hover:bg-blue-600 text-white py-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all shadow-xl active:scale-95 border-none cursor-pointer"
            >
              Dernière étape
            </button>
          </div>
        )}

        {/* 💎 ÉTAPE 3 : FINALISATION ET DÉPLOIEMENT */}
        {step === 3 && (
          <div className="space-y-10 text-center animate-in zoom-in duration-700">
            <div className="flex justify-center">
              <div className="bg-blue-600/10 p-8 rounded-[3rem] text-blue-600 shadow-inner">
                <ShieldCheck size={64} strokeWidth={1.5} className="animate-pulse" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
                Prêt pour <span className="text-blue-600">Elite</span> ?
              </h2>
              <p className="text-[12px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed px-4">
                Nous allons configurer votre environnement multi-tenant sécurisé et sceller vos référentiels de base.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 space-y-3">
              <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase italic">
                <Zap size={14} className="text-amber-500" /> Instance : Cloud Sovereign Active
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase italic">
                <CheckCircle2 size={14} className="text-green-500" /> Sécurité : Chiffrement AES-256
              </div>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 text-white py-7 rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] transition-all shadow-2xl shadow-green-900/20 flex items-center justify-center gap-4 border-none cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Activity size={20} className="animate-spin" /> Déploiement en cours...
                </>
              ) : (
                "Activer mon instance Elite"
              )}
            </button>
          </div>
        )}
      </div>

      {/* 🔐 FOOTER DE SÉCURITÉ */}
      <div className="absolute bottom-10 text-center space-y-2 opacity-30">
        <p className="text-[10px] font-black text-white uppercase italic tracking-[0.5em]">Qualisoft Sovereign Architecture • Multi-Tenant Engine</p>
        <p className="text-[9px] font-bold text-slate-500 uppercase italic tracking-[0.3em]">Certifié conforme aux protocoles de sécurité Cloud RD 2026</p>
      </div>
    </div>
  );
}