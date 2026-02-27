/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Globe, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';

// --- SOUS-COMPOSANT POUR GÉRER LE SUSPENSE (REQUIS POUR NEXT BUILD) ---
function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const { setLogin, isAuthenticated } = useAuthStore();

  const [mode, setMode] = useState<'LOADING' | 'CHOICE' | 'LOGIN_FORM'>('LOADING');
  const [loginType, setLoginType] = useState<'MASTER' | 'TENANT'>('TENANT');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [detectedTenant, setDetectedTenant] = useState<any>(null);
  const [publicTenants, setPublicTenants] = useState<any[]>([]);
  const [form, setForm] = useState({ email: '', password: '', tenantId: '' });

  useEffect(() => {
    if (isAuthenticated) {
      router.push(callbackUrl);
      return;
    }

    const loadTenants = async () => {
      try {
        const res = await apiClient.get('/public/tenants');
        const tenants = res.data?.data || res.data || [];
        setPublicTenants(tenants);

        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const parts = hostname.split('.');
        const slug = parts[0].toLowerCase();
        const reserved = ['www', 'api', 'app', 'elite', 'localhost', 'matrix'];

        if (parts.length > 2 && !reserved.includes(slug)) {
          const match = tenants.find((t: any) => t.T_Domain.toLowerCase() === slug);
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
        setMode('CHOICE');
      }
    };

    loadTenants();
  }, [isAuthenticated, router, callbackUrl]);

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

      // 👑 BYPASS MASTER (GOD MODE)
      if (payload.email === 'ab.thiongane@qualisoft.sn' && payload.password === 'Qualisoft@2026') {
         const masterUser = {
           U_Id: "CORE_MASTER",
           U_Email: payload.email,
           U_Role: "SUPER_ADMIN",
           tenantId: "MATRIX_CORE",
           U_TenantName: "QUALISOFT MASTER CONSOLE",
           U_FirstName: "Abdoulaye",
           U_LastName: "Thiongane",
         };
         document.cookie = `qualisoft_token=MASTER_TOKEN; path=/; max-age=28800; Secure; SameSite=Lax`;
         setLogin({ token: "MASTER_TOKEN", user: masterUser as any });
         toast.success('Bypass Master Autorisé.', { id: tid });
         router.push('/dashboard');
         return;
      }

      const res = await apiClient.post('/auth/login', payload);
      const data = res.data;

      const maxAge = data.expiresIn || 28800;
      document.cookie = `qualisoft_token=${data.accessToken}; path=/; max-age=${maxAge}; Secure; SameSite=Lax`;

      setLogin({
        token: data.accessToken,
        user: data.user
      });

      toast.success('Accès autorisé au réseau.', { id: tid });
      router.push(callbackUrl);

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Échec de l\'authentification', { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'LOADING') {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Loader2 className="animate-spin text-blue-600 h-12 w-12 mb-4" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Identification du nœud...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-slate-900/50 border border-white/5 rounded-[3rem] p-12 shadow-2xl backdrop-blur-3xl">
        <div className="text-center mb-10">
          <div className={`inline-flex p-6 border rounded-3xl mb-6 ${loginType === 'MASTER' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-blue-600/10 border-blue-500/20 text-blue-500'}`}>
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
            <button onClick={() => { setLoginType('MASTER'); setMode('LOGIN_FORM'); }} className="w-full bg-white/5 p-8 rounded-4xl border border-white/10 flex justify-between items-center hover:bg-amber-500/10 transition-all cursor-pointer group">
              <div className="text-left">
                <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] mb-1">Accès Master</p>
                <p className="text-xl text-white font-black uppercase tracking-tight">Admin Matrix</p>
              </div>
              <Globe className="text-slate-600 group-hover:text-amber-500" size={28} />
            </button>
            <button onClick={() => { setLoginType('TENANT'); setMode('LOGIN_FORM'); }} className="w-full bg-blue-600 p-8 rounded-4xl flex justify-between items-center hover:bg-blue-500 transition-all cursor-pointer group">
              <div className="text-left">
                <p className="text-[10px] text-blue-200 font-black uppercase tracking-[0.3em] mb-1">Accès Client</p>
                <p className="text-xl text-white font-black uppercase tracking-tight">Portail Organisation</p>
              </div>
              <Building2 className="text-blue-300 group-hover:text-white" size={28} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-8">
            <div className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input required type="email" placeholder="COURRIEL" className="w-full pl-16 pr-6 py-6 bg-white/5 border border-white/10 rounded-3xl text-white outline-none focus:border-blue-500 transition-all" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input required type={showPassword ? 'text' : 'password'} placeholder="CODE D'ACCÈS" className="w-full pl-16 pr-16 py-6 bg-white/5 border border-white/10 rounded-3xl text-white outline-none focus:border-blue-500 transition-all" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 bg-transparent border-none cursor-pointer">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button disabled={isLoading} type="submit" className={`w-full py-6 text-white rounded-4xl font-black uppercase text-xs tracking-widest flex justify-center items-center gap-4 cursor-pointer ${loginType === 'MASTER' ? 'bg-amber-600' : 'bg-blue-600'}`}>
              {isLoading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20} /> AUTORISER L'ACCÈS</>}
            </button>
          </form>
        )}
    </div>
  );
}

// --- COMPOSANT EXPORTÉ PAR DÉFAUT (PROTECTION BUILD NEXT.JS) ---
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-4 italic font-sans">
      <Suspense fallback={
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin text-blue-600 h-12 w-12 mb-4" />
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Initialisation du tunnel sécurisé...</p>
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}