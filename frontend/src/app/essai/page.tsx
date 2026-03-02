/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🧪 MODULE : src/app/(auth)/essai/page.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Tunnel d'auto-inscription (Trial) via qualification OTP.
 * RÔLE : Conversion prospect et génération de jetons Master (14 jours).
 * SÉCURITÉ : Zéro NextAuth. Validation OTP / Rate-limiting côté Client.
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 17:05 GMT
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Mail, Clock, ShieldCheck, Sparkles, ArrowRight,
  Loader2, CheckCircle2, Calendar, ArrowLeft
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function TrialLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Nettoyage automatique du timer
  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  /**
   * 📧 ÉTAPE 1 : REQUÊTE D'ACCÈS
   */
  const handleRequestAccess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.includes('@')) return toast.error("EMAIL INVALIDE : Format professionnel requis.");

    setLoading(true);
    try {
      await apiClient.post('/trial/request', { email: email.toLowerCase().trim() });
      toast.success('Code de qualification transmis à votre adresse.');
      setStep('code');
      startResendTimer();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ERREUR KERNEL : Échec de l'envoi du code.");
    } finally {
      setLoading(false);
    }
  };

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
   * 🔑 ÉTAPE 2 : VÉRIFICATION SÉCURISÉE
   */
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return toast.error("SÉCURITÉ : Le code doit comporter 6 chiffres.");
    
    setLoading(true);
    try {
      const res = await apiClient.post('/trial/verify', { email, code });
      
      // Scellage des jetons SDE (Sans NextAuth)
      localStorage.setItem('trial_token', res.data.token);
      localStorage.setItem('trial_expires', res.data.expiresAt);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.success('Accès Elite SDE accordé pour 14 jours.');
      router.push('/dashboard'); // Redirection vers le noyau principal
    } catch (err: any) {
      toast.error('CODE INVALIDE : La clé de sécurité est erronée ou expirée.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans flex items-center justify-center p-6 relative overflow-hidden text-left">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🌌 ATMOSPHÈRE NÉON */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-150 h-150 bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10 lg:mb-12">
          <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-5 py-2 rounded-full mb-6 shadow-2xl">
            <Sparkles className="text-blue-400" size={16} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Période d&apos;essai Qualisoft 2026</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-black uppercase italic tracking-tighter mb-4 leading-none m-0">
            Qualisoft <span className="text-blue-500">Trial</span>
          </h1>
          
          <p className="text-slate-500 text-sm font-bold max-w-xs mx-auto leading-relaxed mt-4 italic">
            Expérimentez le SMI Elite sans engagement. <br/>Zéro carte bancaire requise.
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] lg:rounded-[4rem] p-8 lg:p-12 shadow-4xl relative">
          {step === 'email' ? (
            <form onSubmit={handleRequestAccess} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-4 italic">Identifiant Professionnel</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@entreprise.sn"
                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-sm font-bold outline-none focus:border-blue-500 transition-all placeholder:text-slate-800 shadow-inner text-white italic"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-6 rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] transition-all shadow-3xl shadow-blue-900/40 flex items-center justify-center gap-4 active:scale-95 text-white border-none cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><ArrowRight size={20} strokeWidth={3} /> Activer mon essai</>}
              </button>

              <div className="pt-8 border-t border-white/5 space-y-4 opacity-40">
                <div className="flex items-center gap-4 text-[9px] text-slate-400 font-black uppercase italic tracking-widest">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>Validation Master Node §7.5</span>
                </div>
                <div className="flex items-center gap-4 text-[9px] text-slate-400 font-black uppercase italic tracking-widest">
                  <Clock size={16} className="text-blue-500" />
                  <span>Disponibilité Immédiate (14J)</span>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-8">
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-4xl p-6 lg:p-8 mb-2">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 shrink-0"><Mail size={24} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-slate-500 italic uppercase m-0">Code envoyé à :</p>
                    <p className="text-sm font-bold text-blue-400 truncate mt-1 m-0">{email}</p>
                    <button type="button" onClick={() => setStep('email')} className="text-[9px] text-slate-600 hover:text-white font-black uppercase mt-4 flex items-center gap-2 transition-colors border-none bg-transparent cursor-pointer italic">
                      <ArrowLeft size={10} /> Modifier l&apos;adresse
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest block text-center italic">Code de Qualification</label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-4xl py-8 text-center text-4xl font-black tracking-[0.5em] outline-none focus:border-blue-500 transition-all placeholder:text-slate-900 shadow-inner text-white italic"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-6 rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] transition-all shadow-3xl shadow-emerald-900/40 flex items-center justify-center gap-4 text-white border-none cursor-pointer active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} strokeWidth={3} /> Valider l&apos;accès</>}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleRequestAccess()}
                  disabled={countdown > 0}
                  className="text-[10px] font-black uppercase text-slate-600 hover:text-blue-400 disabled:opacity-30 transition-all border-none bg-transparent cursor-pointer italic tracking-widest"
                >
                  {countdown > 0 ? `Nouvel envoi dans ${countdown}s` : 'Renvoyer une clé de sécurité'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-4 text-[9px] font-black uppercase text-slate-700 italic tracking-[0.2em] bg-white/2 px-8 py-4 rounded-2xl border border-white/5">
            <Calendar size={14} className="text-slate-600" /> 
            <span>Fin d&apos;essai : {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}