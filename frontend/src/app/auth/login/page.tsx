/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🔐 MODULE : LOGIN SOUVERAIN MATRIX
 * ARCHITECTURE : Zero NextAuth - Zustand & JWT HttpOnly
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Globe, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';

interface PublicTenant {
  T_Id: string;
  T_Name: string;
  T_Domain: string;
}

interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: {
    U_Id: string;
    U_Email: string;
    U_FirstName?: string;
    U_LastName?: string;
    U_Role: string;
    tenantId: string;
    U_TenantName: string;
    tenantDomain?: string | null;
    assignedProcessId?: string | null;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ✅ STORE ZUSTAND : Pour la mise à jour de l'UI
  const { setLogin, isAuthenticated } = useAuthStore();

  const [mode, setMode] = useState<'LOADING' | 'CHOICE' | 'LOGIN_FORM'>('LOADING');
  const [loginType, setLoginType] = useState<'MASTER' | 'TENANT'>('TENANT');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [detectedTenant, setDetectedTenant] = useState<PublicTenant | null>(null);
  const [publicTenants, setPublicTenants] = useState<PublicTenant[]>([]);
  const [form, setForm] = useState({ email: '', password: '', tenantId: '' });

  useEffect(() => {
    // 🛡️ Redirection si déjà connecté dans le store
    if (isAuthenticated) {
      router.push('/dashboard');
      return;
    }

    const loadTenants = async () => {
      try {
        const res = await apiClient.get('/public/tenants');
        const tenants: PublicTenant[] = res.data?.data || res.data || [];
        setPublicTenants(tenants);

        // 🔍 DÉTECTION AUTOMATIQUE PAR SOUS-DOMAINE (OVH)
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        const slug = parts[0].toLowerCase();
        const reserved = ['www', 'api', 'app', 'elite', 'localhost', 'matrix'];

        if (parts.length > 2 && !reserved.includes(slug)) {
          const match = tenants.find(t => t.T_Domain.toLowerCase() === slug);
          if (match) {
            setDetectedTenant(match);
            setForm(prev => ({ ...prev, tenantId: match.T_Id }));
            setLoginType('TENANT');
            setMode('LOGIN_FORM');
            return;
          }
        }
        setMode('CHOICE');
      } catch (error) {
        console.error('Échec de récupération des noeuds:', error);
        setMode('CHOICE');
      }
    };

    loadTenants();
  }, [isAuthenticated, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginType === 'TENANT' && !form.tenantId) {
      toast.error('Veuillez sélectionner une organisation.');
      return;
    }

    setIsLoading(true);
    const tid = toast.loading('Vérification des accréditations Matrix...');

    try {
      const payload = {
        email: form.email.toLowerCase().trim(),
        password: form.password,
        tenantId: loginType === 'MASTER' ? 'MATRIX' : form.tenantId,
      };

      // 👑 BYPASS MASTER (GOD MODE) : Surcharge locale si le backend est down
      if (payload.email === 'ab.thiongane@qualisoft.sn' && payload.password === 'Qualisoft@2026') {
         const masterUser = {
           U_Id: "CORE_MASTER",
           U_Email: payload.email,
           U_Role: "SUPER_ADMIN",
           tenantId: "MATRIX_CORE",
           U_TenantName: "QUALISOFT MASTER CONSOLE",
           U_FirstName: "Abdoulaye",
           U_LastName: "Thiongane",
           assignedProcessId: null
         };
         
         // Set Cookie pour le Middleware (Expiration 8h)
         document.cookie = `qualisoft_token=MASTER_TOKEN; path=/; max-age=28800; Secure; SameSite=Lax`;
         
         // Update Zustand Store
         setLogin({ token: "MASTER_TOKEN", user: masterUser });
         
         toast.success('Bypass Master Autorisé.', { id: tid });
         router.push('/dashboard'); // Redirige vers le dashboard master
         return;
      }

      // 📡 APPEL API STANDARD
      const res = await apiClient.post('/auth/login', payload);
      const data: LoginResponse = res.data;

      if (!data.accessToken) {
        throw new Error("Jeton de sécurité manquant dans la réponse API.");
      }

      // ✅ 1. SÉCURITÉ : Set du Cookie pour le Middleware (Expiration définie par API, sinon 8h)
      const maxAge = data.expiresIn || 28800;
      document.cookie = `qualisoft_token=${data.accessToken}; path=/; max-age=${maxAge}; Secure; SameSite=Lax`;

      // ✅ 2. MISE À JOUR ZUSTAND : Pour l'interface utilisateur
      setLogin({
        token: data.accessToken,
        user: {
          U_Id: data.user.U_Id,
          U_Email: data.user.U_Email,
          U_FirstName: data.user.U_FirstName || null,
          U_LastName: data.user.U_LastName || null,
          U_Role: data.user.U_Role,
          tenantId: data.user.tenantId,
          U_TenantName: data.user.U_TenantName || "Qualisoft",
          assignedProcessId: data.user.assignedProcessId || null
        }
      });

      toast.success('Accès autorisé au réseau.', { id: tid });

      // 🚩 REDIRECTION TERRITORIALE (Routage dynamique)
      if (loginType === 'MASTER') {
        router.push('/dashboard');
      } else {
        const targetDomain = data.user.tenantDomain || 'app';
        const currentHostname = window.location.hostname;

        // Si on est déjà sur le bon sous-domaine
        if (currentHostname.startsWith(targetDomain) || currentHostname.includes('localhost')) {
          router.push('/dashboard');
        } else {
          // Cross-Domain Redirect
          window.location.href = `https://${targetDomain}.qualisoft.sn/dashboard`;
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Échec de l\'authentification', { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'LOADING') {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center italic">
        <Loader2 className="animate-spin text-blue-600 h-16 w-16 mb-4" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Identification du nœud...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-4 italic font-sans">
      <div className="w-full max-w-lg bg-slate-900/50 border border-white/5 rounded-[3rem] p-12 shadow-2xl backdrop-blur-3xl">
        <div className="text-center mb-10">
          <div className={`inline-flex p-6 border rounded-3xl mb-6 shadow-inner ${loginType === 'MASTER' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-blue-600/10 border-blue-500/20 text-blue-500'}`}>
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
            {detectedTenant ? detectedTenant.T_Name : 'QUALISOFT'}
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">
            {detectedTenant ? `Instance : ${detectedTenant.T_Domain}` : 'Authentification Sécurisée'}
          </p>
        </div>

        {mode === 'CHOICE' ? (
          <div className="space-y-6">
            <button onClick={() => { setLoginType('MASTER'); setMode('LOGIN_FORM'); }} className="w-full bg-white/5 p-8 rounded-4xl border border-white/10 flex justify-between items-center hover:bg-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer group">
              <div className="text-left">
                <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] mb-1">Accès Master</p>
                <p className="text-xl text-white font-black uppercase tracking-tight">Admin Matrix</p>
              </div>
              <Globe className="text-slate-600 group-hover:text-amber-500 transition-colors" size={28} />
            </button>
            <button onClick={() => { setLoginType('TENANT'); setMode('LOGIN_FORM'); }} className="w-full bg-blue-600 p-8 rounded-4xl border border-transparent flex justify-between items-center hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40 cursor-pointer group">
              <div className="text-left">
                <p className="text-[10px] text-blue-200 font-black uppercase tracking-[0.3em] mb-1">Accès Client</p>
                <p className="text-xl text-white font-black uppercase tracking-tight">Portail Organisation</p>
              </div>
              <Building2 className="text-blue-300 group-hover:text-white transition-colors" size={28} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-8">
            {!detectedTenant && (
              <button type="button" onClick={() => setMode('CHOICE')} className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors border-none bg-transparent cursor-pointer">
                ← Sélection de l'instance
              </button>
            )}

            <div className="space-y-6">
              {loginType === 'TENANT' && detectedTenant && (
                <div className="relative">
                  <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
                  <input disabled value={detectedTenant.T_Name} className="w-full pl-16 pr-6 py-6 bg-blue-900/10 border border-blue-500/20 rounded-3xl text-blue-400 font-black uppercase tracking-tight text-sm shadow-inner" />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input required type="email" placeholder="COURRIEL AUTORISÉ" className="w-full pl-16 pr-6 py-6 bg-white/5 border border-white/10 rounded-3xl text-white font-black outline-none focus:border-blue-500 focus:bg-white/10 transition-all uppercase text-sm tracking-tight shadow-inner" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>

              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input required type={showPassword ? 'text' : 'password'} placeholder="CODE D'ACCÈS" className="w-full pl-16 pr-16 py-6 bg-white/5 border border-white/10 rounded-3xl text-white font-black outline-none focus:border-blue-500 focus:bg-white/10 transition-all uppercase text-sm tracking-tight shadow-inner" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white border-none bg-transparent cursor-pointer transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button disabled={isLoading} type="submit" className={`w-full py-6 text-white rounded-4xl font-black uppercase text-xs tracking-widest transition-all flex justify-center items-center gap-4 border-none cursor-pointer shadow-2xl active:scale-95 ${loginType === 'MASTER' ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/40' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40'}`}>
              {isLoading ? (
                <><Loader2 className="animate-spin" size={20} /> AUTHENTIFICATION...</>
              ) : (
                <><ShieldCheck size={20} /> AUTORISER L'ACCÈS <ArrowRight size={18} className="ml-2" /></>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}