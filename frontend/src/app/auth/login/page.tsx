/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🔑 MODULE : LoginPage.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Portail d'accès Multi-Tenant & Console Master.
 * FONCTION : Détection de Nœud, Bypass Souverain, Scellage de Session.
 * RÉVISION : 03 Mars 2026 | 11:20 GMT
 */

"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Loader2, Mail, Lock, Eye, EyeOff, 
  ShieldCheck, Globe, Building2, ChevronLeft,
  Fingerprint, Zap, Crown
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const { setLogin, isAuthenticated } = useAuthStore() as any;

  // --- ÉTATS MATRIX ---
  const [mode, setMode] = useState<'LOADING' | 'CHOICE' | 'LOGIN_FORM'>('LOADING');
  const [loginType, setLoginType] = useState<'MASTER' | 'TENANT'>('TENANT');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [detectedTenant, setDetectedTenant] = useState<any>(null);
  const [form, setForm] = useState({ email: '', password: '', tenantId: '' });

  /**
   * 🛰️ INITIALISATION : DÉTECTION DU NŒUD RÉSEAU
   */
  useEffect(() => {
    const initMatrixAuth = async () => {
      try {
        const res = await apiClient.get('/public/tenants');
        const tenants = res.data || [];
        const host = window.location.hostname.toLowerCase();
        const slug = host.split('.')[0];

        // 1. Détection Console Master (admin, matrix, app...)
        const masterSubdomains = ['app', 'matrix', 'admin', 'master', 'localhost'];
        if (masterSubdomains.includes(slug)) {
          setLoginType('MASTER');
          setForm(p => ({ ...p, tenantId: 'MATRIX' }));
          setMode('LOGIN_FORM');
        } 
        // 2. Détection Tenant Spécifique (sagam, orange, etc.)
        else if (slug !== 'qualisoft' && slug !== 'www' && slug !== 'elite') {
          const match = tenants.find((t: any) => t.T_Domain?.split('.')[0].toLowerCase() === slug);
          if (match) {
            setDetectedTenant(match);
            setForm(p => ({ ...p, tenantId: match.T_Id }));
            setLoginType('TENANT');
            setMode('LOGIN_FORM');
          } else {
            setMode('CHOICE');
          }
        } 
        // 3. Portail Général Elite
        else {
          setMode('CHOICE');
        }
      } catch (err) {
        setMode('CHOICE');
      }
    };

    if (!isAuthenticated) {
      initMatrixAuth();
    } else {
      router.push(callbackUrl);
    }
  }, [isAuthenticated, router, callbackUrl]);

  /**
   * 🛡️ PROTOCOLE D'AUTORISATION
   */
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const tid = toast.loading('Vérification des Sceaux Matrix...');

    try {
      /**
       * 👑 BYPASS ROOT SOUVERAIN (Architecte Master)
       * Accès direct au Kernel en cas de maintenance critique.
       */
      if (form.email === 'ab.thiongane@qualisoft.sn' && form.password === 'Qualisoft@2026') {
        const masterUser = { 
          U_Id: "ROOT", 
          U_Email: form.email, 
          U_Role: "SUPER_ADMIN", 
          U_LastName: "THIONGANE", 
          U_FirstName: "A." 
        };
        const token = "MASTER_PROTOCOL_SDE_2026";
        
        // Scellage du cookie pour le middleware
        document.cookie = `qualisoft_token=${token}; path=/; max-age=28800; Secure; SameSite=Lax`;
        setLogin({ token, user: masterUser });
        
        toast.success("ACCÈS MAÎTRE ACCORDÉ", { id: tid });
        router.push('/admin/super-dashboard');
        return;
      }

      // Requête d'authentification standard au Kernel NestJS
      const res = await apiClient.post('/auth/login', { 
        email: form.email.toLowerCase().trim(), 
        password: form.password, 
        tenantId: form.tenantId 
      });

      const { accessToken, user } = res.data;
      
      // Scellage de session
      document.cookie = `qualisoft_token=${accessToken}; path=/; max-age=28800; Secure; SameSite=Lax`;
      setLogin({ token: accessToken, user });

      toast.success(`Bienvenue, ${user.U_FirstName}`, { id: tid });
      
      // Aiguillage post-connexion
      if (user.U_Role === 'SUPER_ADMIN') {
        router.push('/admin/super-dashboard');
      } else {
        router.push(callbackUrl);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Accès Matrix refusé : Identifiants invalides.';
      toast.error(msg, { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDU : CHARGEMENT ---
  if (mode === 'LOADING') {
    return (
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <Loader2 className="animate-spin text-blue-600" size={60} strokeWidth={3} />
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] italic">Lecture du Nœud territorial...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl bg-[#0F172A]/40 border border-white/5 rounded-[3.5rem] p-16 shadow-4xl backdrop-blur-3xl italic relative overflow-hidden group">
      
      {/* 🌌 Décoration Matrix */}
      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Fingerprint size={120} className="text-blue-500" />
      </div>

      <div className="text-center mb-14">
        <Image src="/images/qslogo.png" alt="Qualisoft Logo" width={220} height={70} className="mx-auto mb-8 drop-shadow-2xl" />
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none m-0">
          {detectedTenant?.T_Name || (loginType === 'MASTER' ? 'Matrix Console' : 'Qualisoft Elite')}
        </h1>
        <div className="flex items-center justify-center gap-3 mt-4">
           <Zap size={12} className={loginType === 'MASTER' ? "text-amber-500" : "text-blue-500"} />
           <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] m-0">
             {detectedTenant ? `SDE Instance : ${detectedTenant.T_Domain}` : 'RD-2026 Sovereign Protocol'}
           </p>
        </div>
      </div>

      {mode === 'CHOICE' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <button 
            onClick={() => { setLoginType('MASTER'); setMode('LOGIN_FORM'); setForm(p => ({ ...p, tenantId: 'MATRIX' })); }} 
            className="w-full bg-white/5 p-10 rounded-[2.5rem] border border-white/10 flex justify-between items-center hover:bg-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer text-white group"
          >
            <div className="text-left">
              <p className="text-[10px] text-amber-500 font-black uppercase mb-2 tracking-widest">Infrastucture Matrix</p>
              <p className="text-2xl font-black m-0 tracking-tighter italic">CONSOLE MASTER</p>
            </div>
            <Crown size={32} className="text-amber-500 group-hover:scale-110 transition-transform" />
          </button>

          <button 
            onClick={() => { setLoginType('TENANT'); setMode('LOGIN_FORM'); }} 
            className="w-full bg-blue-600 p-10 rounded-[2.5rem] flex justify-between items-center hover:bg-blue-500 hover:scale-[1.02] transition-all cursor-pointer shadow-2xl text-white group border-none"
          >
            <div className="text-left">
              <p className="text-[10px] text-blue-200 font-black uppercase mb-2 tracking-widest">Portail Organisationnel</p>
              <p className="text-2xl font-black m-0 tracking-tighter italic">ELITE SDE</p>
            </div>
            <Building2 size={32} className="text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleAuth} className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative group">
            <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={22} />
            <input 
              required 
              type="email" 
              placeholder="IDENTIFIANT COURRIEL" 
              className="w-full pl-20 py-7 bg-white/5 border border-white/10 rounded-4xl text-sm font-black text-white outline-none focus:border-blue-600 focus:bg-white/10 transition-all placeholder:text-slate-700 uppercase italic" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={22} />
            <input 
              required 
              type={showPassword ? 'text' : 'password'} 
              placeholder="CODE D'ACCÈS SÉCURISÉ" 
              className="w-full pl-20 pr-20 py-7 bg-white/5 border border-white/10 rounded-4xl text-sm font-black text-white outline-none focus:border-blue-600 focus:bg-white/10 transition-all placeholder:text-slate-700 uppercase italic" 
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})} 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer border-none bg-transparent transition-colors"
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>

          <button 
            disabled={isLoading} 
            type="submit" 
            className={`w-full py-8 rounded-4xl font-black uppercase tracking-[0.2em] flex justify-center items-center gap-4 cursor-pointer border-none shadow-4xl transition-all active:scale-95 text-white italic
              ${loginType === 'MASTER' ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'}`}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={22} />} 
            {isLoading ? 'VÉRIFICATION...' : "AUTORISER L'ACCÈS"}
          </button>

          <button 
            type="button" 
            onClick={() => { setMode('CHOICE'); setDetectedTenant(null); }} 
            className="w-full flex items-center justify-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-all border-none bg-transparent cursor-pointer italic"
          >
            <ChevronLeft size={14} /> Revenir à la sélection de nœud
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Effet de lueur d'arrière-plan */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 italic">
          <Loader2 className="animate-spin text-blue-600" size={50} />
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Chargement du sas...</p>
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}