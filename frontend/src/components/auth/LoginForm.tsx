/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🔑 MODULE : LoginForm (Matrix Authentication)
 * RÔLE : Point d'entrée unique et scellage de session Matrix
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité + Security
 */

import React, { useState, FormEvent, ChangeEvent, KeyboardEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { Loader2, ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export interface User {
  U_Id: string;
  U_Email: string;
  U_FirstName: string;
  U_LastName: string;
  U_Role: string;
  tenantId?: string;
  U_IsActive?: boolean;
}

export interface AuthCredentials {
  token: string;
  user: User;
  isMaster?: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
}

export interface LoginFormProps {
  onSuccess?: () => void;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_FORM: LoginFormData = {
  email: '',
  password: ''
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setLogin } = useAuthStore() as { setLogin: (credentials: AuthCredentials) => void };
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  /**
   * 🛰️ RÉSOLUTION DU DOMAINE DE COOKIE
   * Détermine si le cookie doit être scellé sur le sous-domaine ou le root
   */
  const getCookieDomain = (): string => {
    if (typeof window === 'undefined') return '';
    const host = window.location.hostname;
    if (host === 'localhost') return '';
    const parts = host.split('.');
    // Isolation totale sur le domaine exact
    return host; 
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.email.trim()) {
      errors.email = "L'email est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email invalide";
    }
    
    if (!formData.password) {
      errors.password = "Le mot de passe est obligatoire";
    } else if (formData.password.length < 6) {
      errors.password = "Le mot de passe doit comporter au moins 6 caractères";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading("Vérification des accréditations...");

    try {
      // 1. APPEL AU NOYAU NESTJS
      const res = await apiClient.post<{ access_token: string; user: User }>('/auth/login', {
        U_Email: formData.email.toLowerCase().trim(),
        U_Password: formData.password
      });

      const { access_token, user } = res.data;

      // 2. SCELLAGE DU COOKIE (Persistance pour le Middleware)
      const domain = getCookieDomain();
      const secureFlag = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'Secure;' : '';
      
      // Cookie expire dans 8 heures
      const expires = new Date(Date.now() + 8 * 3600 * 1000).toUTCString();
      
      if (typeof document !== 'undefined') {
        document.cookie = `qualisoft_token=${access_token}; path=/; domain=${domain}; expires=${expires}; SameSite=Lax; ${secureFlag}`;
      }

      // 3. MISE À JOUR DU STORE ZUSTAND (Réactivité UI)
      setLogin({ token: access_token, user });

      toast.success(`BIENVENUE, AGENT ${user.U_LastName.toUpperCase()}`, { id: toastId });

      // 4. REDIRECTION INTELLIGENTE
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
      router.push(callbackUrl);
      router.refresh();
      
      onSuccess?.();

    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = apiError?.response?.data?.message || apiError?.message || "Identifiants invalides ou accès révoqué.";
      toast.error("ÉCHEC D'AUTHENTIFICATION", { id: toastId, description: msg });
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Escape') {
      // Optional: clear form or redirect
    }
  };

  return (
    <div 
      className="w-full max-w-md space-y-6 md:space-y-8 lg:space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 italic font-sans text-left"
      role="form"
      aria-label="Formulaire de connexion"
    >
      
      {/* HEADER LOGIN */}
      <div className="text-center space-y-3 md:space-y-4" role="banner">
        <div 
          className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl shadow-blue-900/40 rotate-3"
          aria-hidden="true"
        >
          <ShieldCheck size={32} className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter m-0">
          Matrix <span className="text-blue-600">Kernel</span>
        </h1>
        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">
          Système de Management Souverain
        </p>
      </div>

      <form onSubmit={handleLogin} onKeyDown={handleKeyDown} className="space-y-4 md:space-y-5 lg:space-y-6" noValidate>
        {/* EMAIL */}
        <div className="space-y-1.5 md:space-y-2" role="group" aria-labelledby="email-label">
          <label 
            id="email-label"
            htmlFor="email"
            className={cn(
              "text-[9px] md:text-[10px] font-black uppercase tracking-widest ml-2 md:ml-4 block",
              formErrors.email ? "text-red-400" : "text-slate-400"
            )}
          >
            Identifiant Agent <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Mail 
              className={cn(
                "absolute left-3 md:left-4 lg:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 transition-colors",
                formErrors.email ? "text-red-400" : "text-slate-400 group-focus-within:text-blue-600"
              )} 
              aria-hidden="true" 
            />
            <input 
              id="email"
              type="email" 
              required
              className={cn(
                "w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 lg:p-6 pl-8 md:pl-10 lg:pl-12 text-[10px] md:text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner",
                formErrors.email && "border-red-500/50 focus:border-red-500"
              )}
              placeholder="agent@qualisoft.sn"
              value={formData.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('email', e.target.value)}
              aria-required="true"
              aria-invalid={!!formErrors.email}
              aria-describedby={formErrors.email ? 'email-error' : undefined}
              autoComplete="email"
            />
          </div>
          {formErrors.email && (
            <p id="email-error" className="text-red-400 text-[7px] md:text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
              <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.email}
            </p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="space-y-1.5 md:space-y-2" role="group" aria-labelledby="password-label">
          <label 
            id="password-label"
            htmlFor="password"
            className={cn(
              "text-[9px] md:text-[10px] font-black uppercase tracking-widest ml-2 md:ml-4 block",
              formErrors.password ? "text-red-400" : "text-slate-400"
            )}
          >
            Code d&apos;Accès Scellé <span className="text-red-400">*</span>
          </label>
          <div className="relative group">
            <Lock 
              className={cn(
                "absolute left-3 md:left-4 lg:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 transition-colors",
                formErrors.password ? "text-red-400" : "text-slate-400 group-focus-within:text-blue-600"
              )} 
              aria-hidden="true" 
            />
            <input 
              id="password"
              type={showPassword ? 'text' : 'password'} 
              required
              className={cn(
                "w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 lg:p-6 pl-8 md:pl-10 lg:pl-12 pr-10 md:pr-12 text-[10px] md:text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner",
                formErrors.password && "border-red-500/50 focus:border-red-500"
              )}
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('password', e.target.value)}
              aria-required="true"
              aria-invalid={!!formErrors.password}
              aria-describedby={formErrors.password ? 'password-error' : undefined}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 md:right-4 lg:right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded p-1"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" />
              ) : (
                <Eye size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" />
              )}
            </button>
          </div>
          {formErrors.password && (
            <p id="password-error" className="text-red-400 text-[7px] md:text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
              <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.password}
            </p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={cn(
            "w-full bg-slate-950 text-white py-4 md:py-5 lg:py-6 lg:py-7 rounded-xl md:rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-2 md:gap-3 lg:gap-4 hover:bg-blue-600 transition-all shadow-xl active:scale-95 border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
            loading && "opacity-50 cursor-not-allowed active:scale-100"
          )}
          aria-busy={loading}
          aria-label={loading ? "Connexion en cours" : "Autoriser l'accès"}
        >
          {loading ? (
            <><Loader2 size={20} className="w-5 h-5 md:w-6 md:h-6 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">VÉRIFICATION...</span><span className="sm:hidden">En cours...</span></>
          ) : (
            <><ArrowRight size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" /> <span className="hidden sm:inline">AUTORISER L'ACCÈS</span><span className="sm:hidden">Accès</span></>
          )}
        </button>
      </form>

      <footer className="text-center" role="contentinfo">
        <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">
          Qualisoft SDE RD-2026 • Protection de données isolée
        </p>
      </footer>
    </div>
  );
}