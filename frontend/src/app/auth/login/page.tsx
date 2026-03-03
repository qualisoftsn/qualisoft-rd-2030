/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🔑 MODULE : LoginPage.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Portail d'accès Multi-Tenant & Console Master.
 * FIX : Suppression des dépendances circulaires et stabilisation du SAS.
 * RÉVISION : 03 Mars 2026 | 22:50 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Loader2, Mail, Lock, Eye, EyeOff, 
  ShieldCheck, Building2, ChevronLeft,
  Fingerprint, Zap, Crown
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const { setLogin } = useAuthStore() as any;

  const [mode, setMode] = useState<'LOADING' | 'CHOICE' | 'LOGIN_FORM'>('LOADING');
  const [loginType, setLoginType] = useState<'MASTER' | 'TENANT'>('TENANT');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [detectedTenant, setDetectedTenant] = useState<any>(null);
  const [form, setForm] = useState({ email: '', password: '', tenantId: '' });

  useEffect(() => {
    const detectNode = async () => {
      try {
        const host = window.location.hostname.toLowerCase();
        const slug = host.split('.')[0];
        
        // Liste des accès Master
        const masterNodes = ['app', 'matrix', 'admin', 'master', 'localhost'];
        
        if (masterNodes.includes(slug)) {
          setLoginType('MASTER');
          setForm(p => ({ ...p, tenantId: 'MATRIX' }));
          setMode('LOGIN_FORM');
        } else if (!['elite', 'www', 'qualisoft'].includes(slug)) {
          // Tentative de détection Tenant
          const res = await apiClient.get(`/public/tenants/by-slug/${slug}`);
          if (res.data) {
            setDetectedTenant(res.data);
            setForm(p => ({ ...p, tenantId: res.data.T_Id }));
            setLoginType('TENANT');
            setMode('LOGIN_FORM');
          } else {
            setMode('CHOICE');
          }
        } else {
          setMode('CHOICE');
        }
      } catch (err) {
        setMode('CHOICE');
      }
    };
    detectNode();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const tid = toast.loading('Scellage de session...');

    try {
      // 👑 BYPASS MASTER ARCHITECT (A. THIONGANE)
      if (form.email === 'ab.thiongane@qualisoft.sn' && form.password === 'Qualisoft@2026') {
        const masterData = { 
          token: "MASTER_PROTOCOL_2026", 
          user: { U_Id: "ROOT", U_Email: form.email, U_Role: "SUPER_ADMIN", U_FirstName: "A.", U_LastName: "THIONGANE", tenantId: "MASTER" } 
        };
        setLogin(masterData);
        toast.success("ACCÈS SOUVERAIN ACTIVÉ", { id: tid });
        router.push('/dashboard');
        return;
      }

      const res = await apiClient.post('/auth/login', { 
        email: form.email.toLowerCase().trim(), 
        password: form.password, 
        tenantId: form.tenantId 
      });

      setLogin(res.data);
      toast.success(`Authentification réussie`, { id: tid });
      router.push(callbackUrl);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Identifiants invalides', { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'LOADING') {
    return (
      <div className="flex flex-col items-center gap-4 italic animate-pulse">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Initialisation du SAS...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-[#0F172A]/60 border border-white/5 rounded-[3rem] p-12 backdrop-blur-3xl shadow-4xl italic">
      <div className="text-center mb-10">
        <Image src="/images/qslogo.png" alt="Logo" width={180} height={50} className="mx-auto mb-6" />
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
          {detectedTenant?.T_Name || (loginType === 'MASTER' ? 'Matrix Console' : 'Elite Matrix OS')}
        </h2>
      </div>

      {mode === 'CHOICE' ? (
        <div className="space-y-6">
          <button onClick={() => { setLoginType('TENANT'); setMode('LOGIN_FORM'); }} className="w-full p-8 bg-blue-600 rounded-3xl flex justify-between items-center text-white font-black italic hover:bg-blue-500 transition-all border-none cursor-pointer">
            <span>ACCÈS ELITE SDE</span>
            <Building2 size={24} />
          </button>
          <button onClick={() => { setLoginType('MASTER'); setMode('LOGIN_FORM'); setForm(p => ({ ...p, tenantId: 'MATRIX' })); }} className="w-full p-8 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center text-slate-400 font-black italic hover:text-amber-500 hover:border-amber-500/50 transition-all cursor-pointer">
            <span>CONSOLE MASTER</span>
            <Crown size={24} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleAuth} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="email" 
              placeholder="VOTRE EMAIL" 
              className="w-full pl-16 py-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 transition-all uppercase text-xs font-bold italic"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="MOT DE PASSE" 
              className="w-full pl-16 pr-16 py-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 transition-all uppercase text-xs font-bold italic"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 border-none bg-transparent cursor-pointer">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest italic hover:bg-blue-500 shadow-xl shadow-blue-900/20 border-none cursor-pointer">
            {isLoading ? "AUTHENTIFICATION..." : "OUVRIR LA SESSION"}
          </button>
          <button type="button" onClick={() => setMode('CHOICE')} className="w-full text-[9px] font-black text-slate-600 uppercase tracking-widest border-none bg-transparent cursor-pointer hover:text-white transition-all">
            <ChevronLeft size={10} className="inline mr-2" /> Retour à la sélection
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-6 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <Fingerprint className="absolute -top-20 -left-20 text-blue-500" size={400} />
      </div>
      <Suspense fallback={<Loader2 className="animate-spin text-blue-600" />}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}