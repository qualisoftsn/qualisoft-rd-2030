/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : LOGIN TERMINAL (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Authentification Multi-Tenant SDE Matrix - Sécurisée & Accessible
 * VERSION : 2.0 - Corrections critiques + Sécurité + Design System Elite
 * DESIGN : ClickUp High-Density, Split-Screen, Zero-Scroll, PWA Ready, WCAG AA
 * SÉCURITÉ : Zustand + HttpOnly + CSRF + Rate Limiting Ready
 * RÉVISION : 19 Mars 2026 | 11:00 GMT
 * -------------------------------------------------------------------------
 */

import React, { useState, useEffect, Suspense, useCallback, FormEvent, ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, 
  Building2, Fingerprint, Network, Zap, Activity, ChevronDown,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

import { useAuthStore } from '@/store/authStore';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Tenant {
  T_Id: string;
  T_Name: string;
  T_Domain: string;
  T_Active: boolean;
}

interface LoginForm {
  email: string;
  password: string;
  tenantId: string;
}

interface LoginResponse {
  accessToken: string;
  user: {
    U_Id: string;
    U_Email: string;
    U_Role: string;
    U_FirstName: string;
    U_LastName: string;
    U_TenantId?: string;
    U_TenantName?: string;
  };
}

interface MatrixInputProps {
  icon: React.ElementType;
  label: string;
  placeholder: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  error?: string;
  id: string;
}

interface AuthError {
  status: number | string;
  message: string;
  code?: string;
}

// ============================================================================
// CONSTANTES & CONFIGURATION
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.qualisoft.sn/api';
const MASTER_NODES = ['app', 'matrix', 'admin', 'master', 'localhost', 'elite', 'www', 'qs'];

const VALIDATION_RULES = {
  email: {
    required: 'L\'email est requis',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'Format d\'email invalide',
  },
  password: {
    required: 'Le mot de passe est requis',
    minLength: 8,
    minLengthMessage: 'Minimum 8 caractères requis',
  },
};

// ============================================================================
// UTILITAIRES
// ============================================================================

const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email.trim()) return { valid: false, error: VALIDATION_RULES.email.required };
  if (!VALIDATION_RULES.email.pattern.test(email)) {
    return { valid: false, error: VALIDATION_RULES.email.patternMessage };
  }
  return { valid: true };
};

const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (!password) return { valid: false, error: VALIDATION_RULES.password.required };
  if (password.length < VALIDATION_RULES.password.minLength) {
    return { valid: false, error: VALIDATION_RULES.password.minLengthMessage };
  }
  return { valid: true };
};

const extractSubdomain = (hostname: string): string => {
  const parts = hostname.toLowerCase().split('.');
  return parts.length > 2 ? parts[0] : 'app';
};

// ============================================================================
// COMPOSANT : MATRIX INPUT
// ============================================================================

function MatrixInput({ 
  icon: Icon, 
  label, 
  placeholder, 
  type, 
  value, 
  onChange, 
  showPasswordToggle, 
  onTogglePassword, 
  error,
  id 
}: MatrixInputProps) {
  return (
    <div className="space-y-2">
      <label 
        htmlFor={id} 
        className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest italic block"
      >
        {label}
      </label>
      <div className="relative group">
        <Icon 
          className={cn(
            "absolute left-6 top-1/2 -translate-y-1/2 transition-colors pointer-events-none",
            error ? "text-rose-500" : "text-slate-600 group-focus-within:text-blue-500"
          )} 
          size={18} 
          aria-hidden="true"
        />
        <input 
          id={id}
          type={type} 
          required 
          placeholder={placeholder} 
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "w-full bg-black/40 border rounded-2xl py-5 pl-16 pr-14 text-white font-black italic text-xs outline-none transition-all placeholder:text-slate-800 shadow-inner focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
            error 
              ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30" 
              : "border-white/10 focus:border-blue-600 focus:ring-blue-600/30"
          )}
          value={value} 
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} 
        />
        {showPasswordToggle && (
          <button 
            type="button" 
            onClick={onTogglePassword} 
            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer outline-none p-2 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={type === "password" ? "Afficher le mot de passe" : "Masquer le mot de passe"}
            tabIndex={0}
          >
            {type === "password" ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-rose-400 text-[9px] ml-4 flex items-center gap-1" role="alert">
          <AlertCircle size={10} aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT : LOADING MATRIX
// ============================================================================

function LoadingMatrix({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8" role="status" aria-live="polite">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-blue-600/20 border-t-blue-600 rounded-full w-24 h-24 animate-spin -m-2" aria-hidden="true" />
        <Loader2 className="animate-spin text-blue-500" size={60} strokeWidth={1.5} aria-hidden="true" />
        <Zap className="absolute text-blue-400/20" size={24} aria-hidden="true" />
      </div>
      <p className="text-[10px] font-black text-blue-500 uppercase tracking-[1em] animate-pulse italic m-0 pl-[1em] text-center">
        {label}
      </p>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL : LOGIN FORM CONTENT
// ============================================================================

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams?.get('session') === 'expired';
  
  const { setLogin, logout, isLoading: authLoading } = useAuthStore();

  const [mode, setMode] = useState<'LOADING' | 'FORM'>('LOADING');
  const [loginType, setLoginType] = useState<'MASTER' | 'TENANT'>('TENANT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [tenantList, setTenantList] = useState<Tenant[]>([]);
  const [form, setForm] = useState<LoginForm>({ email: '', password: '', tenantId: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});

  // Fetch des organisations disponibles
  const fetchAllTenants = useCallback(async (slug: string) => {
    try {
      const response = await fetch(`${API_BASE}/tenants/public/list`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      const list: Tenant[] = Array.isArray(data) ? data.filter((t: Tenant) => t.T_Active !== false) : [];

      if (list.length === 0) {
        toast.warning("Aucune organisation active trouvée sur ce serveur.", { duration: 5000 });
      }

      setTenantList(list);

      // Présélection du tenant si correspondance avec le sous-domaine
      if (slug && list.length > 0) {
        const found = list.find((t: Tenant) => t.T_Domain?.toLowerCase().includes(slug));
        if (found) {
          setForm(prev => ({ ...prev, tenantId: found.T_Id }));
        }
      }

    } catch (err: any) {
      console.error("🛑 Erreur chargement organisations:", err);
      toast.error("Impossible de charger la liste des organisations. Vérifiez votre connexion.", { 
        duration: 8000,
        action: {
          label: 'Réessayer',
          onClick: () => fetchAllTenants(slug),
        },
      });
    } finally {
      setMode('FORM');
    }
  }, []);

  // Initialisation SAS (Sovereign Access Service)
  const initSAS = useCallback(async () => {
    if (isExpired) {
      logout();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('qs_session');
        sessionStorage.clear();
      }
      toast.info("Session expirée. Veuillez vous reconnecter.", { duration: 4000 });
    }

    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      const slug = extractSubdomain(host);
      
      if (MASTER_NODES.includes(slug)) {
        setLoginType('MASTER');
        setForm(prev => ({ ...prev, tenantId: 'MATRIX_CORE' }));
        setMode('FORM');
      } else {
        setLoginType('TENANT');
        await fetchAllTenants(slug);
      }
    }
  }, [isExpired, logout, fetchAllTenants]);

  useEffect(() => { 
    initSAS(); 
  }, [initSAS]);

  // Validation du formulaire
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof LoginForm, string>> = {};
    
    const emailValidation = validateEmail(form.email);
    if (!emailValidation.valid) newErrors.email = emailValidation.error;
    
    const passwordValidation = validatePassword(form.password);
    if (!passwordValidation.valid) newErrors.password = passwordValidation.error;
    
    if (loginType === 'TENANT' && !form.tenantId) {
      newErrors.tenantId = 'Veuillez sélectionner une organisation';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, loginType]);

  // Gestion de l'authentification
  const handleAuth = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire", { duration: 4000 });
      return;
    }
    
    setIsSubmitting(true);
    const toastId = toast.loading("Initialisation de la session sécurisée...");

    try {
      const endpoint = loginType === 'MASTER' 
        ? '/auth/login-master' 
        : '/auth/login';
      
      const payload = loginType === 'MASTER' 
        ? { email: form.email.trim().toLowerCase(), password: form.password } 
        : { 
            email: form.email.trim().toLowerCase(), 
            password: form.password, 
            tenantId: form.tenantId,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data: LoginResponse | { message: string; errors?: any[] } = await response.json().catch(() => ({
        message: 'Erreur de communication avec le serveur',
      }));

      if (!response.ok) {
        const errorMsg = Array.isArray((data as any).message) 
          ? (data as any).message[0] 
          : (data as any).message || `Authentification refusée [${response.status}]`;
        
        throw { 
          status: response.status, 
          message: errorMsg,
          code: (data as any).code,
        } as AuthError;
      }
      
      // ✅ SUCCÈS : Injection dans le store Zustand
      setLogin({ 
        token: data.accessToken, 
        user: data.user,
        loginTime: new Date().toISOString(),
      });
      
      toast.success("Connexion établie avec succès. Bienvenue !", { 
        id: toastId,
        duration: 3000,
        icon: <CheckCircle2 className="text-emerald-500" />,
      });
      
      // Redirection vers le dashboard avec délai pour l'animation
      setTimeout(() => {
        const redirect = searchParams?.get('redirect') || '/dashboard';
        router.push(redirect);
      }, 500);
      
    } catch (err: any) {
      console.error("🛑 Erreur authentification:", err);
      const status = err.status || "Réseau";
      const serverMsg = err.message || "Connexion impossible. Vérifiez vos identifiants.";
      
      toast.error(`Échec [${status}] : ${serverMsg}`, { 
        id: toastId, 
        duration: 8000,
        action: err.code === 'ACCOUNT_LOCKED' ? {
          label: 'Réinitialiser',
          onClick: () => router.push('/auth/forgot-password'),
        } : undefined,
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion des changements de formulaire avec validation en temps réel
  const handleFieldChange = useCallback((field: keyof LoginForm) => (value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // État de chargement initial
  if (mode === 'LOADING' || authLoading) {
    return <LoadingMatrix label="Connexion à Qualisoft Elite..." />;
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-700 relative z-10">
      
      {/* En-tête du formulaire */}
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/30 mx-auto rotate-3">
          <Fingerprint className="text-white" size={25} aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter m-0 leading-none">
            {loginType === 'MASTER' ? "Console Master" : "QS Elite"}
          </h2>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] italic m-0">
            Accès Sécurisé
          </p>
        </div>
      </div>

      {/* Formulaire d'authentification */}
      <form onSubmit={handleAuth} className="space-y-5" noValidate>
        
        {/* Sélecteur d'organisation (Tenant uniquement) */}
        {loginType === 'TENANT' && (
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest italic block">
              Organisation
            </label>
            <div className="relative">
              <Building2 
                className={cn(
                  "absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none transition-colors",
                  errors.tenantId ? "text-rose-500" : "text-blue-500"
                )} 
                size={18} 
                aria-hidden="true"
              />
              <select 
                id="tenant-select"
                required 
                aria-required="true"
                aria-invalid={!!errors.tenantId}
                aria-describedby={errors.tenantId ? "tenant-error" : undefined}
                className={cn(
                  "w-full bg-black/40 border rounded-2xl py-5 pl-14 pr-10 text-white font-black italic uppercase text-[10px] appearance-none outline-none transition-all cursor-pointer shadow-inner focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
                  errors.tenantId 
                    ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30" 
                    : "border-white/10 focus:border-blue-600 focus:ring-blue-600/30"
                )}
                value={form.tenantId} 
                onChange={(e) => handleFieldChange('tenantId')(e.target.value)}
              >
                <option value="" disabled className="bg-[#0B0F1A] text-slate-500">
                  {tenantList.length === 0 ? "⚠️ Aucune organisation" : "Sélectionnez une organisation"}
                </option>
                {tenantList.map((t: Tenant) => (
                  <option key={t.T_Id} value={t.T_Id} className="bg-[#0B0F1A] text-white">
                    {t.T_Name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} aria-hidden="true" />
            </div>
            {errors.tenantId && (
              <p id="tenant-error" className="text-rose-400 text-[9px] ml-4 flex items-center gap-1" role="alert">
                <AlertCircle size={10} aria-hidden="true" /> {errors.tenantId}
              </p>
            )}
          </div>
        )}

        {/* Champ Email */}
        <MatrixInput 
          id="email"
          icon={Mail} 
          label="Email professionnel" 
          placeholder="nom@entreprise.sn" 
          type="email" 
          value={form.email} 
          onChange={handleFieldChange('email')}
          error={errors.email}
        />

        {/* Champ Mot de passe */}
        <MatrixInput 
          id="password"
          icon={Lock} 
          label="Mot de passe" 
          placeholder="••••••••••••" 
          type={showPassword ? "text" : "password"} 
          value={form.password} 
          onChange={handleFieldChange('password')}
          showPasswordToggle 
          onTogglePassword={() => setShowPassword(!showPassword)}
          error={errors.password}
        />

        {/* Lien mot de passe oublié */}
        <div className="text-right pt-2">
          <button 
            type="button"
            onClick={() => router.push('/auth/forgot-password')}
            className="text-[9px] text-blue-400 hover:text-blue-300 font-black uppercase tracking-widest italic transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
          >
            Mot de passe oublié ?
          </button>
        </div>

        {/* Bouton de soumission */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={cn(
            "w-full py-6 rounded-3xl font-black uppercase text-[10px] tracking-[0.4em] transition-all active:scale-95 border-none cursor-pointer mt-4 flex justify-center items-center gap-3 italic focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
            isSubmitting 
              ? "bg-blue-600/50 text-slate-400 cursor-not-allowed" 
              : "bg-blue-600 text-white hover:bg-white hover:text-slate-900 shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          )}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} aria-hidden="true" /> AUTHENTIFICATION...
            </>
          ) : (
            <>
              <Zap size={18} aria-hidden="true" /> Connectez-vous
            </>
          )}
        </button>
      </form>

      {/* Footer sécurité */}
      <div className="text-center pt-8 border-t border-white/5">
        <p className="text-[7px] text-slate-600 uppercase tracking-[0.3em] italic flex items-center justify-center gap-2">
          <ShieldCheck size={10} className="text-emerald-500" aria-hidden="true" />
          Connexion chiffrée TLS 1.3 • Multi-Factor Ready
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// PAGE PRINCIPALE : LOGIN PAGE
// ============================================================================

export default function LoginPage() {
  return (
    <div className="fixed inset-0 w-full h-dvh bg-[#0B0F1A] flex flex-col lg:flex-row overflow-hidden italic font-sans select-none">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      {/* 🛡️ PANNEAU GAUCHE : BRANDING MATRIX (Desktop uniquement) */}
      <section 
        className="hidden lg:flex lg:w-1/2 bg-[#050810] relative flex-col justify-between p-16 xl:p-24 border-r border-white/5 overflow-hidden shrink-0"
        aria-label="Présentation Qualisoft Elite"
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" aria-hidden="true">
          <Network className="absolute -top-20 -left-20 text-blue-700" size={1200} strokeWidth={0.5} />
        </div>
        
        {/* Logo Header */}
        <header className="relative z-10 flex items-center gap-5">
          <div className="p-3 bg-blue-700/10 rounded-2xl border border-blue-500/20">
             <ShieldCheck className="text-blue-500" size={30} aria-hidden="true" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter m-0">
            QUALI<span className="text-blue-600">SOFT</span>
          </h1>
        </header>

        {/* Contenu principal */}
        <div className="relative z-10 space-y-12">
          <h2 className="text-4xl xl:text-5xl font-black text-white uppercase italic tracking-tighter leading-[0.85] m-0">
            ELITE <br/>
            <span className="text-blue-500 underline decoration-8 underline-offset-16">QHSE</span>
          </h2>
          <p className="text-slate-300 font-bold text-xl xl:text-2xl leading-relaxed max-w-lg italic m-0">
            Digitalisation de votre conformité. <br/>
            L&apos;excellence à forte valeur ajoutée.
          </p>
          <div className="flex flex-wrap gap-3">
             <span className="px-5 py-2.5 rounded-xl text-[10px] font-black border border-blue-500/20 bg-blue-600/10 text-blue-400 uppercase tracking-widest italic shadow-lg shadow-blue-900/20">
               ISO 9001:2015
             </span>
             <span className="px-5 py-2.5 rounded-xl text-[10px] font-black border border-amber-500/20 bg-amber-600/10 text-amber-400 uppercase tracking-widest italic shadow-lg shadow-amber-900/20">
               ISO 14001 & 27001
             </span>
             <span className="px-5 py-2.5 rounded-xl text-[10px] font-black border border-emerald-500/20 bg-emerald-600/10 text-emerald-400 uppercase tracking-widest italic shadow-lg shadow-emerald-900/20">
               OHADA SYSCOA
             </span>
          </div>
        </div>

        {/* Footer branding */}
        <footer className="relative z-10 flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] m-0 italic">
           <span>Dakar Lac Rose • RD 2030</span>
           <span className="flex items-center gap-3">
             <Zap size={14} className="text-blue-500" aria-hidden="true" /> 
             Qualisoft Corporate
           </span>
        </footer>
      </section>

      {/* 🔐 PANNEAU DROIT : TERMINAL DE CONNEXION */}
      <main className="flex-1 flex flex-col justify-center p-6 sm:p-12 md:p-16 lg:p-24 bg-[#0B0F1A] relative h-full overflow-y-auto custom-scrollbar">
        <Suspense fallback={<LoadingMatrix label="Initialisation du tunnel sécurisé..." />}>
          <LoginFormContent />
        </Suspense>
        
        {/* Logo de fond subtil */}
        <div className="absolute bottom-10 right-10 opacity-5 pointer-events-none select-none" aria-hidden="true">
          <Activity size={300} className="text-white" />
        </div>
      </main>

      {/* 🧪 OVERRIDES PWA & ACCESSIBILITÉ */}
      <style>{`
        body { 
          overscroll-behavior: none; 
          background: #0B0F1A; 
          -webkit-tap-highlight-color: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Focus visible pour accessibilité clavier */
        :focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}