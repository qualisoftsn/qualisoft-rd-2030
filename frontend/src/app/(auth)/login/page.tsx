/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🔐 MODULE : LOGIN MULTI-TENANT INTELLIGENT (MATRIX CORE)
 * -------------------------------------------------------------------------
 * 🎯 UTILITÉ :
 * Ce composant est l'unique porte d'entrée de l'écosystème Qualisoft.
 * Il possède une intelligence de détection de "Slug" (sous-domaine).
 * * 🛠️ FONCTIONNEMENT :
 * 1. Détection : Analyse l'URL (ex: sagam.qualisoft.sn).
 * 2. Branchement : 
 * - Si 'matrix' ou 'elite' : Affiche la console d'administration globale.
 * - Si 'slug' client : Pré-configure l'accès pour l'organisation détectée.
 * - Si inconnu : Propose le choix entre accès Master et accès Client.
 * * ⚠️ RÈGLES DE MAINTENANCE :
 * - Toujours envelopper le contenu dans <Suspense> pour éviter les crashs de build Docker.
 * - Le cookie 'qualisoft_token' doit correspondre au nom configuré dans le middleware.ts.
 * - En cas de 502, vérifier que l'API_URL dans .env pointe bien vers le Backend port 9005.
 * -------------------------------------------------------------------------
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, 
  Globe, Building2, Key 
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/core/providers/auth-provider';
import { authManager } from '@/core/auth/auth-manager';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, tenantSlug } = useAuth();
  
  const [mode, setMode] = useState<'LOADING' | 'CHOICE' | 'LOGIN_FORM' | 'MASTER_LOGIN'>('LOADING');
  const [loginType, setLoginType] = useState<'MASTER' | 'TENANT'>('TENANT');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [detectedTenant, setDetectedTenant] = useState<any>(null);
  const [form, setForm] = useState({ email: '', password: '', tenantId: '' });
  const [masterPassword, setMasterPassword] = useState('');

  useEffect(() => {
    // Redirection automatique si une session est déjà active
    if (!authLoading && isAuthenticated) {
      const target = (tenantSlug === 'matrix' || tenantSlug === 'elite') ? '/admin/matrix' : '/dashboard';
      router.push(target);
    }
  }, [authLoading, isAuthenticated, router, tenantSlug]);

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const res = await fetch('/api/public/tenants');
        const tenants = await res.json();
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const parts = hostname.split('.');
        const slug = parts[0].toLowerCase();

        // 🛡️ RECONNAISSANCE DU RÔLE MASTER
        if (slug === 'matrix' || slug === 'elite') {
          setMode('MASTER_LOGIN');
          setLoginType('MASTER');
          return;
        }

        // 🏢 RECONNAISSANCE DU TENANT CLIENT
        const match = tenants.find((t: any) => t.T_Domain.toLowerCase() === slug);
        if (match) {
          setDetectedTenant(match);
          setForm(prev => ({ ...prev, tenantId: match.T_Id }));
          setMode('LOGIN_FORM');
        } else {
          setMode('CHOICE');
        }
      } catch (error) {
        setMode('CHOICE');
      }
    };
    loadTenants();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const tid = toast.loading('Synchronisation Matrix...');

    try {
      const payload = {
        email: form.email.toLowerCase().trim(),
        password: form.password,
        tenantId: loginType === 'MASTER' ? 'MATRIX' : form.tenantId,
      };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Identifiants Matrix invalides');
      const data = await res.json();

      // 🔐 SCELLAGE DU COOKIE SOUVERAIN (Indispensable pour le Middleware)
      document.cookie = `qualisoft_token=${data.accessToken}; path=/; max-age=28800; Secure; SameSite=Lax`;
      
      authManager.setToken(data.accessToken, data.expiresIn, false);
      toast.success('Accès autorisé au réseau.', { id: tid });

      // Routage vers le domaine spécifique du client ou le dashboard local
      window.location.href = data.user.tenantDomain 
        ? `https://${data.user.tenantDomain}.qualisoft.sn/dashboard`
        : '/dashboard';
        
    } catch (err: any) {
      toast.error(err.message, { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'LOADING' || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Loader2 className="animate-spin text-blue-600 h-12 w-12" />
        <p className="mt-4 text-gray-400 text-[10px] font-black uppercase tracking-widest italic animate-pulse">
          Établissement du tunnel sécurisé...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-gray-900 border border-gray-700 rounded-2xl mb-4 shadow-inner">
          <ShieldCheck size={32} className={loginType === 'MASTER' ? 'text-purple-500' : 'text-blue-500'} />
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
          {detectedTenant ? detectedTenant.T_Name : loginType === 'MASTER' ? 'MATRIX CORE' : 'QUALISOFT'}
        </h1>
        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em] mt-2 italic">
           Souveraineté Numérique RD 2030
        </p>
      </div>

      {mode === 'CHOICE' ? (
        <div className="space-y-4">
          <button onClick={() => { setLoginType('MASTER'); setMode('LOGIN_FORM'); }} className="w-full bg-white/5 p-6 rounded-2xl border border-white/10 flex justify-between items-center hover:bg-purple-500/10 hover:border-purple-500/30 transition-all cursor-pointer">
            <div className="text-left"><p className="text-[10px] text-purple-400 font-black uppercase">Console</p><p className="text-lg text-white font-black">Admin Matrix</p></div>
            <Key className="text-purple-500" />
          </button>
          <button onClick={() => { setLoginType('TENANT'); setMode('LOGIN_FORM'); }} className="w-full bg-blue-600 p-6 rounded-2xl flex justify-between items-center hover:bg-blue-500 transition-all cursor-pointer shadow-lg shadow-blue-900/20">
            <div className="text-left"><p className="text-[10px] text-blue-200 font-black uppercase">Client</p><p className="text-lg text-white font-black">Portail Élite</p></div>
            <Building2 className="text-white" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required type="email" placeholder="IDENTIFIANT" className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 transition-all text-sm font-bold" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required type={showPassword ? 'text' : 'password'} placeholder="CODE D'ACCÈS" className="w-full pl-12 pr-12 py-4 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 transition-all text-sm font-bold" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white bg-transparent border-none cursor-pointer">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button disabled={isLoading} type="submit" className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all flex justify-center items-center gap-2 cursor-pointer ${loginType === 'MASTER' ? 'bg-purple-600' : 'bg-blue-600'}`}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'AUTORISER L\'ACCÈS'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-4 italic font-sans">
      <Suspense fallback={
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin text-blue-600 h-12 w-12 mb-4" />
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Initialisation Matrix...</p>
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}