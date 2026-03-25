/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🔑 MODULE : LoginForm.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Point d'entrée unique et scellage de session Matrix.
 * LOGIQUE : Authentification NestJS + Persistance Cookie & Zustand.
 * SÉCURITÉ : Isolation stricte par domaine (SDE Protocol).
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 22:56 GMT
 */

"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/core/api/api-client';
import { Loader2, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setLogin } = useAuthStore() as any;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  /**
   * 🛰️ RÉSOLUTION DU DOMAINE DE COOKIE
   * Détermine si le cookie doit être scellé sur le sous-domaine ou le root.
   */
  const getCookieDomain = () => {
    const host = window.location.hostname;
    if (host === 'localhost') return '';
    const parts = host.split('.');
    // On scelle sur le domaine parent (.qualisoft.sn) pour permettre la navigation 
    // ou sur le domaine exact pour une isolation TOTALE.
    // Ici, on opte pour l'isolation totale pour corriger tes fuites Sagam/Elite.
    return host; 
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Vérification des accréditations...");

    try {
      // 1. APPEL AU NOYAU NESTJS
      const res = await apiClient.post('/auth/login', {
        U_Email: formData.email,
        U_Password: formData.password
      });

      const { access_token, user } = res.data;

      // 2. SCELLAGE DU COOKIE (Persistance pour le Middleware)
      // On utilise JS-Cookie ou document.cookie pur
      const domain = getCookieDomain();
      const secureFlag = window.location.protocol === 'https:' ? 'Secure;' : '';
      
      // Cookie expire dans 8 heures
      const expires = new Date(Date.now() + 8 * 3600 * 1000).toUTCString();
      
      document.cookie = `qualisoft_token=${access_token}; path=/; domain=${domain}; expires=${expires}; SameSite=Lax; ${secureFlag}`;

      // 3. MISE À JOUR DU STORE ZUSTAND (Réactivité UI)
      setLogin({ token: access_token, user });

      toast.success(`BIENVENUE, AGENT ${user.U_LastName.toUpperCase()}`, { id: tid });

      // 4. REDIRECTION INTELLIGENTE
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
      router.push(callbackUrl);
      router.refresh();

    } catch (err: any) {
      const msg = err.response?.data?.message || "Identifiants invalides ou accès révoqué.";
      toast.error("ÉCHEC D'AUTHENTIFICATION", { id: tid, description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 italic font-sans text-left">
      
      {/* HEADER LOGIN */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-blue-600 rounded-4xl flex items-center justify-center mx-auto text-white shadow-3xl shadow-blue-900/40 rotate-3">
          <ShieldCheck size={40} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter m-0">
          Matrix <span className="text-blue-600">Kernel</span>
        </h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] m-0">
          Système de Management Souverain
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {/* EMAIL */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Identifiant Agent</label>
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="email" 
              required
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 pl-14 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
              placeholder="agent@qualisoft.sn"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Code d&apos;Accès Scellé</label>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="password" 
              required
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 pl-14 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-slate-950 text-white py-7 rounded-4xl font-black uppercase italic tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-blue-600 transition-all shadow-4xl active:scale-95 border-none cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : <ArrowRight size={24} />}
          {loading ? "Vérification..." : "Autoriser l'accès"}
        </button>
      </form>

      <footer className="text-center">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          Qualisoft SDE RD-2026 • Protection de données isolée
        </p>
      </footer>
    </div>
  );
}
