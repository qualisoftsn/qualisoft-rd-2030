/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🔑 MODULE : LoginPage.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Authentification Multi-Tenant & Console Matrix.
 * FONCTION : Détection automatique (Sagam/Elite), Bypass Root, Password Toggle.
 * RÉVISION : 02 Mars 2026 | 23:30 GMT
 */

"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, Globe, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const { setLogin, isAuthenticated } = useAuthStore() as any;

  const [mode, setMode] = useState<'LOADING' | 'CHOICE' | 'LOGIN_FORM'>('LOADING');
  const [loginType, setLoginType] = useState<'MASTER' | 'TENANT'>('TENANT');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [detectedTenant, setDetectedTenant] = useState<any>(null);
  const [form, setForm] = useState({ email: '', password: '', tenantId: '' });

  useEffect(() => {
    const initMatrixAuth = async () => {
      try {
        const res = await apiClient.get('/public/tenants');
        const tenants = res.data || [];
        const slug = window.location.hostname.split('.')[0].toLowerCase();

        if (['app', 'matrix', 'admin', 'master'].includes(slug)) {
          setLoginType('MASTER');
          setForm(p => ({ ...p, tenantId: 'MATRIX' }));
          setMode('LOGIN_FORM');
        } else if (slug !== 'qualisoft' && slug !== 'www' && slug !== 'elite') {
          const match = tenants.find((t: any) => t.T_Domain?.split('.')[0].toLowerCase() === slug);
          if (match) {
            setDetectedTenant(match);
            setForm(p => ({ ...p, tenantId: match.T_Id }));
            setLoginType('TENANT');
            setMode('LOGIN_FORM');
          } else { setMode('CHOICE'); }
        } else { setMode('CHOICE'); }
      } catch { setMode('CHOICE'); }
    };
    if (!isAuthenticated) initMatrixAuth();
    else router.push(callbackUrl);
  }, [isAuthenticated, router, callbackUrl]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const tid = toast.loading('Autorisation Matrix...');

    try {
      // 👑 BYPASS MASTER ROOT (A. Thiongane)
      if (form.email === 'ab.thiongane@qualisoft.sn' && form.password === 'Qualisoft@2026') {
        const masterUser = { U_Id: "ROOT", U_Email: form.email, U_Role: "SUPER_ADMIN", U_LastName: "THIONGANE", U_FirstName: "A." };
        document.cookie = `qualisoft_token=MASTER_TOKEN_SOUVERAIN; path=/; max-age=28800; Secure; SameSite=Lax`;
        setLogin({ token: "MASTER_TOKEN_SOUVERAIN", user: masterUser });
        router.push('/admin/matrix');
        return;
      }

      const res = await apiClient.post('/auth/login', { 
        email: form.email.toLowerCase(), 
        password: form.password, 
        tenantId: form.tenantId 
      });

      const { accessToken, user } = res.data;
      document.cookie = `qualisoft_token=${accessToken}; path=/; max-age=28800; Secure; SameSite=Lax`;
      setLogin({ token: accessToken, user });
      router.push(user.U_Role === 'SUPER_ADMIN' ? '/admin/matrix' : callbackUrl);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Accès refusé', { id: tid });
    } finally { setIsLoading(false); }
  };

  if (mode === 'LOADING') return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={48} /></div>;

  return (
    <div className="w-full max-w-lg bg-slate-900/40 border border-white/5 rounded-[3rem] p-12 shadow-4xl backdrop-blur-3xl italic text-left">
      <div className="text-center mb-10">
        <Image src="/images/qslogo.png" alt="Logo" width={180} height={60} className="mx-auto mb-6" />
        <h1 className="text-3xl font-black text-white uppercase">{detectedTenant?.T_Name || 'Qualisoft Elite'}</h1>
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] mt-3">
          {detectedTenant ? `Instance : ${detectedTenant.T_Domain}` : 'RD 2030 Sovereign Protocol'}
        </p>
      </div>

      {mode === 'CHOICE' ? (
        <div className="space-y-6">
          <button onClick={() => { setLoginType('MASTER'); setMode('LOGIN_FORM'); }} className="w-full bg-white/5 p-8 rounded-4xl border border-white/10 flex justify-between items-center hover:bg-indigo-500/10 cursor-pointer text-white">
            <div className="text-left"><p className="text-[10px] text-indigo-400 font-black uppercase mb-1">Système</p><p className="text-xl font-black m-0">CONSOLE MATRIX</p></div>
            <Globe size={28} />
          </button>
          <button onClick={() => { setLoginType('TENANT'); setMode('LOGIN_FORM'); }} className="w-full bg-blue-600 p-8 rounded-4xl flex justify-between items-center hover:bg-blue-500 cursor-pointer shadow-xl text-white">
            <div className="text-left"><p className="text-[10px] text-blue-200 font-black uppercase mb-1">Organisation</p><p className="text-xl font-black m-0">PORTAIL ELITE</p></div>
            <Building2 size={28} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleAuth} className="space-y-6">
          <div className="relative group">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" size={20} />
            <input required type="email" placeholder="COURRIEL" className="w-full pl-16 py-6 bg-white/5 border border-white/10 rounded-3xl text-white font-bold outline-none focus:border-blue-500" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="relative group">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" size={20} />
            <input required type={showPassword ? 'text' : 'password'} placeholder="CODE D'ACCÈS" className="w-full pl-16 pr-16 py-6 bg-white/5 border border-white/10 rounded-3xl text-white font-bold outline-none focus:border-blue-500" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer border-none bg-transparent">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
          </div>
          <button disabled={isLoading} type="submit" className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-4xl font-black uppercase tracking-widest flex justify-center items-center gap-4 cursor-pointer border-none shadow-2xl transition-all">
            {isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />} AUTORISER L&apos;ACCÈS
          </button>
          <button type="button" onClick={() => setMode('CHOICE')} className="w-full text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors border-none bg-transparent cursor-pointer">← Retour</button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-4">
      <Suspense fallback={<Loader2 className="animate-spin text-blue-600" size={48} />}><LoginFormContent /></Suspense>
    </div>
  );
}