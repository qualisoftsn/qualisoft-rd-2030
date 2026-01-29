/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Mail, Clock, ShieldCheck, Sparkles, ArrowRight,
  Loader2, CheckCircle2, Calendar, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TrialLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await apiClient.post('/trial/request', { email });
      toast.success('Code envoyé à votre email');
      setStep('code');
      setCountdown(60);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);
      
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la demande');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await apiClient.post('/trial/verify', { email, code });
      localStorage.setItem('trial_token', res.data.token);
      localStorage.setItem('trial_expires', res.data.expiresAt);
      toast.success('Accès accordé pour 14 jours');
      router.push('/trial/dashboard');
      
    } catch (err: any) {
      toast.error('Code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-150 h-150 bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-6">
            <Sparkles className="text-blue-400" size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Essai Gratuit 14 Jours</span>
          </div>
          
          <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-4">
            Qualisoft <span className="text-blue-500">Trial</span>
          </h1>
          
          <p className="text-slate-500 text-sm font-bold max-w-xs mx-auto">
            Accès complet sans engagement. Sans carte bancaire.
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 shadow-2xl">
          {step === 'email' ? (
            <form onSubmit={handleRequestAccess} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
                  Email professionnel
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@entreprise.com"
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><ArrowRight size={18} /> Recevoir mon accès</>}
              </button>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Accès sécurisé SSL 256-bit</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold">
                  <Clock size={14} className="text-blue-500" />
                  <span>14 jours complets sans limitation</span>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Mail className="text-blue-400 shrink-0" size={20} />
                  <div>
                    <p className="text-xs font-bold text-slate-300">Code envoyé à {email}</p>
                    <button 
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-black uppercase mt-1"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
                  Code de vérification (6 chiffres)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-4 text-center text-2xl font-black tracking-[0.3em] outline-none focus:border-blue-500 transition-all placeholder:text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle2 size={18} /> Vérifier</>}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleRequestAccess}
                  disabled={countdown > 0}
                  className="text-[10px] font-black uppercase text-slate-500 hover:text-blue-400 disabled:opacity-30 transition-colors"
                >
                  {countdown > 0 ? `Renvoyer dans ${countdown}s` : 'Renvoyer le code'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 text-center space-y-4">
          <div className="flex justify-center gap-6 text-[10px] font-black uppercase text-slate-600">
            <span className="flex items-center gap-1"><Calendar size={12} /> Expire le {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}