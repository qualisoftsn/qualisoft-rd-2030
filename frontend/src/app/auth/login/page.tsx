/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🛰️ MODULE : LOGIN SOUVERAIN MATRIX
 * -------------------------------------------------------------------------
 * RÔLE : Authentification Multi-Tenant avec détection automatique de nœud.
 * SÉCURITÉ : Communication directe avec le Noyau Matrix via apiClient.
 * -------------------------------------------------------------------------
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, Globe, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';

interface LoginProps {
  tenantSlug?: string;
  isMaster?: boolean;
}

function LoginFormContent({ tenantSlug, isMaster }: LoginProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const { setLogin, isAuthenticated } = useAuthStore();

  const [mode, setMode] = useState<'LOADING' | 'CHOICE' | 'LOGIN_FORM'>('LOADING');
  const [loginType, setLoginType] = useState<'MASTER' | 'TENANT'>(isMaster ? 'MASTER' : 'TENANT');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [detectedTenant, setDetectedTenant] = useState<any>(null);
  const [form, setForm] = useState({ email: '', password: '', tenantId: '' });

  // 🛡️ Redirection si session active
  useEffect(() => {
    if (isAuthenticated) { router.push(callbackUrl); }
  }, [isAuthenticated, router, callbackUrl]);

  // 🧪 Initialisation de la session et détection du Tenant (SDE, SAGAM, etc.)
  useEffect(() => {
    const initMatrixAuth = async () => {
      try {
        // Récupération de la liste des organisations actives
        const res = await apiClient.get('/public/tenants');
        const tenants = res.data || [];

        // Détermination du slug (ex: "sde" depuis sde.qualisoft.sn)
        const currentSlug = tenantSlug || (typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : '');
        const slug = currentSlug.toLowerCase();

        // Cas 1 : Accès Master (Console Matrix)
        if (['app', 'matrix', 'admin'].includes(slug) || isMaster) {
          setLoginType('MASTER');
          setForm(prev => ({ ...prev, tenantId: 'MATRIX' })); // ID par défaut du Noyau
          setMode('LOGIN_FORM');
        } 
        // Cas 2 : Accès Tenant spécifique (ex: sde.qualisoft.sn)
        else if (slug !== 'qualisoft' && slug !== 'www') {
          setLoginType('TENANT');
          setMode('LOGIN_FORM'); 
          
          // Recherche du tenant dans les données du Seed
          const match = tenants.find((t: any) => t.T_Domain.split('.')[0].toLowerCase() === slug);
          if (match) {
            setDetectedTenant(match);
            setForm(prev => ({ ...prev, tenantId: match.T_Id }));
          }
        } 
        // Cas 3 : Page de choix (si domaine racine)
        else {
          setMode('CHOICE');
        }
      } catch (error) {
        setMode('CHOICE'); // Fallback en cas d'erreur API
      }
    };
    initMatrixAuth();
  }, [tenantSlug, isMaster]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginType === 'TENANT' && !form.tenantId) {
      toast.error('Organisation introuvable dans la Matrix.');
      return;
    }
    setIsLoading(true);
    const tid = toast.loading('Séquence d’autorisation Matrix...');

    try {
      const payload = {
        email: form.email.toLowerCase().trim(),
        password: form.password,
        tenantId: loginType === 'MASTER' ? 'MATRIX' : form.tenantId,
      };

      // 👑 BYPASS MASTER ROOT (A. Thiongane)
      if (payload.email === 'ab.thiongane@qualisoft.sn' && payload.password === 'Qualisoft@2026') {
          const masterUser = { 
            U_Id: "ROOT_MASTER", U_Email: payload.email, U_Role: "SUPER_ADMIN", 
            tenantId: "MATRIX_CORE", U_TenantName: "QUALISOFT MASTER CONSOLE" 
          };
          document.cookie = `qualisoft_token=MASTER_TOKEN_SOUVERAIN; path=/; max-age=28800; Secure; SameSite=Lax`;
          setLogin({ token: "MASTER_TOKEN_SOUVERAIN", user: masterUser as any });
          toast.success('Accès Root Matrix accordé.', { id: tid });
          router.push('/admin/matrix'); 
          return;
      }

      // Requête au Backend
      const res = await apiClient.post('/auth/login', payload);
      const { accessToken, user, expiresIn } = res.data;
      
      // Stockage du cookie pour le middleware
      document.cookie = `qualisoft_token=${accessToken}; path=/; max-age=${expiresIn || 28800}; Secure; SameSite=Lax`;
      setLogin({ token: accessToken, user });
      
      toast.success('Autorisation confirmée.', { id: tid });
      router.push(user.U_Role === 'SUPER_ADMIN' ? '/admin/matrix' : callbackUrl);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Identifiants invalides', { id: tid });
    } finally { setIsLoading(false); }
  };

  if (mode === 'LOADING') return (
    <div className="flex flex-col items-center justify-center p-20">
      <Loader2 className="animate-spin text-blue-600 h-12 w-12 mb-4" />
      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest animate-pulse">Identification du nœud...</p>
    </div>
  );

  return (
    <div className="w-full max-w-lg bg-slate-900/40 border border-white/5 rounded-[3rem] p-12 shadow-2xl backdrop-blur-3xl relative">
      <div className="text-center mb-10">
        <div className="mb-6 flex justify-center">
          <Image src="/images/qslogo.png" alt="Qualisoft Logo" width={200} height={64} className="h-16 w-auto object-contain" />
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">
          {detectedTenant ? detectedTenant.T_Name : 'QUALISOFT ELITE'}
        </h1>
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] mt-3">
          {detectedTenant ? `Instance : ${detectedTenant.T_Domain}.sn` : 'Souveraineté Numérique RD 2030'}
        </p>
      </div>

      {mode === 'CHOICE' ? (
        <div className="space-y-6">
          <button onClick={() => { setLoginType('MASTER'); setMode('LOGIN_FORM'); }} className="w-full bg-white/5 p-8 rounded-4xl border border-white/10 flex justify-between items-center hover:bg-indigo-500/10 cursor-pointer group">
            <div className="text-left">
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mb-1">Système</p>
              <p className="text-xl text-white font-black uppercase">Console Matrix</p>
            </div>
            <Globe className="text-slate-600 group-hover:text-indigo-500" size={28} />
          </button>
          
          <button onClick={() => { setLoginType('TENANT'); setMode('LOGIN_FORM'); }} className="w-full bg-blue-600 p-8 rounded-4xl flex justify-between items-center hover:bg-blue-500 cursor-pointer shadow-lg">
            <div className="text-left">
              <p className="text-[10px] text-blue-200 font-black uppercase mb-1">Organisation</p>
              <p className="text-xl text-white font-black uppercase">Portail Elite</p>
            </div>
            <Building2 className="text-blue-300" size={28} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleAuth} className="space-y-8">
          <div className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                required type="email" placeholder="COURRIEL" 
                className="w-full pl-16 pr-6 py-6 bg-white/5 border border-white/10 rounded-3xl text-white outline-none focus:border-blue-500 font-bold text-sm" 
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                required type={showPassword ? 'text' : 'password'} placeholder="CODE D'ACCÈS" 
                className="w-full pl-16 pr-16 py-6 bg-white/5 border border-white/10 rounded-3xl text-white outline-none focus:border-blue-500 font-bold text-sm" 
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} 
              />
              <button 
                type="button" onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <button 
              disabled={isLoading} type="submit" 
              className={`w-full py-6 text-white rounded-4xl font-black uppercase text-xs tracking-widest flex justify-center items-center gap-4 cursor-pointer transition-all ${loginType === 'MASTER' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-blue-600 hover:bg-blue-500'}`}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20} /> AUTORISER L&apos;ACCÈS</>}
            </button>
            <button type="button" onClick={() => setMode('CHOICE')} className="w-full text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">
              ← Changer de portail d&apos;accès
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function LoginPage({ tenantSlug, isMaster }: LoginProps) {
  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <Suspense fallback={<div className="flex flex-col items-center"><Loader2 className="animate-spin text-blue-600 h-12 w-12" /></div>}>
        <LoginFormContent tenantSlug={tenantSlug} isMaster={isMaster} />
      </Suspense>
    </div>
  );
}