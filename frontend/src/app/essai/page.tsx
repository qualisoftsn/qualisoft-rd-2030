/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🧪 MODULE : ACCÈS ESSAI (TRIAL LOGIN)
 * -------------------------------------------------------------------------
 * FONCTION : Tunnel d'auto-inscription via validation OTP.
 * RÔLE : Conversion prospect et génération de jetons temporaires (14 jours).
 * SÉCURITÉ : Validation OTP par email, protection contre le spamming de code.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Mail, Clock, ShieldCheck, Sparkles, ArrowRight,
  Loader2, CheckCircle2, Calendar, AlertTriangle, ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TrialLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 🧹 NETTOYAGE DU TIMER
   * Prévention des fuites de mémoire lors du démontage du composant.
   */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /**
   * 📧 ÉTAPE 1 : DEMANDE D'ACCÈS
   * Déclenche l'envoi du code OTP via le Noyau Trial.
   */
  const handleRequestAccess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    try {
      // Appel au microservice de gestion des essais
      await apiClient.post('/trial/request', { email: email.toLowerCase().trim() });
      toast.success('Code de qualification envoyé');
      setStep('code');
      startResendTimer();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Échec de la demande d&apos;accès');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ⏱️ GESTION DU COMPTE À REBOURS
   * Contrôle le délai de ré-émission pour éviter les abus (Anti-Spam).
   */
  const startResendTimer = () => {
    setCountdown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /**
   * 🔑 ÉTAPE 2 : VÉRIFICATION OTP
   * Scelle l'accès et enregistre les métadonnées d'expiration.
   */
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return toast.error("Le code doit comporter 6 chiffres");
    
    setLoading(true);
    try {
      const res = await apiClient.post('/trial/verify', { email, code });
      
      // Stockage sécurisé des credentials d'essai
      localStorage.setItem('trial_token', res.data.token);
      localStorage.setItem('trial_expires', res.data.expiresAt);
      
      toast.success('Accès Master accordé (14 jours)');
      router.push('/trial/dashboard');
    } catch (err: any) {
      toast.error('Code de sécurité invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* 🌌 DÉGRADÉS D'ATMOSPHÈRE SOVEREIGN */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-150 h-150 bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-6 shadow-xl">
            <Sparkles className="text-blue-400" size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Période d&apos;essai Qualisoft RD 2026</span>
          </div>
          
          <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-4 leading-none">
            Qualisoft <span className="text-blue-500">Trial</span>
          </h1>
          
          <p className="text-slate-500 text-sm font-bold max-w-xs mx-auto leading-relaxed">
            Découvrez la puissance du SMI Elite sans engagement et sans carte bancaire.
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 shadow-3xl">
          {step === 'email' ? (
            <form onSubmit={handleRequestAccess} className="space-y-8 text-left">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4 italic">
                  Email Professionnel Scellé
                </label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@entreprise.com"
                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-sm font-bold outline-none focus:border-blue-500 transition-all placeholder:text-slate-800 shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-5 rounded-4xl font-black uppercase text-[11px] tracking-widest transition-all shadow-2xl shadow-blue-900/30 flex items-center justify-center gap-3 active:scale-95 text-white border-none cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><ArrowRight size={18} strokeWidth={3} /> Activer mon essai</>}
              </button>

              <div className="pt-6 border-t border-white/5 space-y-4 opacity-50">
                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-black uppercase italic">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>Chiffrement AES-256 Actif</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-black uppercase italic">
                  <Clock size={16} className="text-blue-500" />
                  <span>Usage illimité pendant 14 jours</span>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-8 text-left">
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-6 mb-2">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                    <Mail size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-300 italic uppercase">Code transmis à :</p>
                    <p className="text-sm font-bold text-blue-400 truncate mt-1">{email}</p>
                    <button 
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-[9px] text-slate-500 hover:text-white font-black uppercase mt-3 flex items-center gap-1 transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <ArrowLeft size={10} /> Modifier l&apos;email
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4 italic text-center block">
                  Saisir le code de vérification
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-4xl py-6 px-6 text-center text-3xl font-black tracking-[0.4em] outline-none focus:border-blue-500 transition-all placeholder:text-slate-900 shadow-inner text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-5 rounded-4xl font-black uppercase text-[11px] tracking-widest transition-all shadow-2xl shadow-emerald-900/30 flex items-center justify-center gap-3 active:scale-95 text-white border-none cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle2 size={18} strokeWidth={3} /> Valider l&apos;accès</>}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleRequestAccess()}
                  disabled={countdown > 0}
                  className="text-[10px] font-black uppercase text-slate-600 hover:text-blue-400 disabled:opacity-30 transition-all border-none bg-transparent cursor-pointer italic tracking-widest"
                >
                  {countdown > 0 ? `Renvoyer le code dans ${countdown}s` : 'Renvoyer un nouveau code'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* FOOTER CHRONOLOGIQUE */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 text-[10px] font-black uppercase text-slate-700 italic tracking-[0.2em] bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
            <Calendar size={14} className="text-slate-500" /> 
            <span>Fin d&apos;essai estimée : {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}