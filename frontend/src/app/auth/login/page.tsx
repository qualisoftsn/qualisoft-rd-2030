/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🛰️ MODULE : LOGIN SOUVERAIN MATRIX (ELITE RD 2030)
 * -------------------------------------------------------------------------
 * CHEMIN : src/app/auth/login/page.tsx
 * RÔLE : Authentification Multi-Tenant sans NextAuth.
 * -------------------------------------------------------------------------
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, 
  Globe, Building2 
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';

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
  const [form, setForm] = useState({ email: '', password: '', tenantId: '' });

  // 1. Redirection si une session est déjà détectée dans le Store
  useEffect(() => {
    if (isAuthenticated) {
      router.push(callbackUrl);
    }
  }, [isAuthenticated, router, callbackUrl]);

  // 2. Initialisation : Chargement des Tenants et détection automatique
  useEffect(() => {
    const initMatrixLogin = async () => {
      try {
        // On appelle la route publique (MatrixController corrigé)
        const res = await apiClient.get('/public/tenants');
        const tenants = res.data;

        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const slug = hostname.split('.')[0].toLowerCase();
        
        // Liste des domaines réservés au Master
        const masterDomains = ['matrix', 'elite', 'app', 'www', 'localhost'];

        if (masterDomains.includes(slug)) {
          setLoginType('MASTER');
          setMode('LOGIN_FORM');
        } else {
          // Tentative de reconnaissance par sous-domaine (ex: sagam.qualisoft.sn)
          const match = tenants.find((t: any) => t.T_Domain.split('.')[0].toLowerCase() === slug);
          if (match) {
            setDetectedTenant(match);
            setForm(prev => ({ ...prev, tenantId: match.T_Id }));
            setLoginType('TENANT');
            setMode('LOGIN_FORM');
          } else {
            // Aucun tenant reconnu : on laisse l'utilisateur choisir son portail
            setMode('CHOICE');
          }
        }
      } catch (error) {
        console.error("Échec de synchronisation Matrix", error);
        setMode('CHOICE');
      }
    };

    initMatrixLogin();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginType === 'TENANT' && !form.tenantId) {
      toast.error('Identification de l’organisation requise.');
      return;
    }

    setIsLoading(true);
    const tid = toast.loading('Séquence d’autorisation en cours...');

    try {
      const payload = {
        email: form.email.toLowerCase().trim(),
        password: form.password,
        tenantId: loginType === 'MASTER' ? 'MATRIX' : form.tenantId,
      };

      // 👑 LOGIQUE DE BYPASS MASTER (ADMIN ROOT)
      if (payload.email === 'ab.thiongane@qualisoft.sn' && payload.password === 'Qualisoft@2026') {
          const masterUser = {
            U_Id: "ROOT_MASTER",
            U_Email: payload.email,
            U_Role: "SUPER_ADMIN",
            tenantId: "MATRIX_CORE",
            U_TenantName: "QUALISOFT MASTER CONSOLE",
            U_FirstName: "Abdoulaye",
            U_LastName: "Thiongane",
          };
          
          // Scellage du cookie souverain pour le Middleware
          document.cookie = `qualisoft_token=MASTER_TOKEN_SOUVERAIN; path=/; max-age=28800; Secure; SameSite=Lax`;
          
          // Hydratation du Store global
          setLogin({ token: "MASTER_TOKEN_SOUVERAIN", user: masterUser as any });
          
          toast.success('Bypass Master Activé. Bienvenue, Administrateur.', { id: tid });
          router.push('/admin/matrix'); 
          return;
      }

      // APPEL API AUTH STANDARD
      const res = await apiClient.post('/auth/login', payload);
      const { accessToken, user, expiresIn } = res.data;

      // Persistance Cookies (pour le middleware côté serveur)
      const duration = expiresIn || 28800;
      document.cookie = `qualisoft_token=${accessToken}; path=/; max-age=${duration}; Secure; SameSite=Lax`;

      // Persistance Store (pour l'UI côté client)
      setLogin({ token: accessToken, user });

      toast.success('Accès autorisé au nœud.', { id: tid });
      
      // Routage final : Console Matrix pour les admins ou Dashboard pour les users
      const destination = (user.U_Role === 'SUPER_ADMIN') ? '/admin/matrix' : callbackUrl;
      router.push(destination);

    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Identifiants Matrix invalides';
      toast.error(errorMsg, { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'LOADING') {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Loader2 className="animate-spin text-blue-600 h-12 w-12 mb-4" />
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest animate-pulse">Identification du nœud...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-slate-900/40 border border-white/5 rounded-[3rem] p-12 shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-10">
        <div className={`inline-flex p-6 border rounded-3xl mb-6 transition-colors ${loginType === 'MASTER' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-blue-600/10 border-blue-500/20 text-blue-500'}`}>
          <ShieldCheck size={40} />
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
          {detectedTenant ? detectedTenant.T_Name : 'QUALISOFT ELITE'}
        </h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">
          {detectedTenant ? `Instance : ${detectedTenant.T_Domain}.sn` : 'Souveraineté RD 2030'}
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
          
          <button onClick={() => { setLoginType('TENANT'); setMode('LOGIN_FORM'); }} className="w-full bg-blue-600 p-8 rounded-4xl flex justify-between items-center hover:bg-blue-500 transition-all cursor-pointer group shadow-lg shadow-blue-900/20">
            <div className="text-left">
              <p className="text-[10px] text-blue-200 font-black uppercase tracking-[0.3em] mb-1">Accès Client</p>
              <p className="text-xl text-white font-black uppercase tracking-tight">Portail Elite</p>
            </div>
            <Building2 className="text-blue-300 group-hover:text-white" size={28} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleAuth} className="space-y-8">
          <div className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input required type="email" placeholder="EMAIL" className="w-full pl-16 pr-6 py-6 bg-white/5 border border-white/10 rounded-3xl text-white outline-none focus:border-blue-500 transition-all font-bold" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input required type={showPassword ? 'text' : 'password'} placeholder="CODE D'ACCÈS" className="w-full pl-16 pr-16 py-6 bg-white/5 border border-white/10 rounded-3xl text-white outline-none focus:border-blue-500 transition-all font-bold" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white bg-transparent border-none cursor-pointer">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button disabled={isLoading} type="submit" className={`w-full py-6 text-white rounded-4xl font-black uppercase text-xs tracking-widest flex justify-center items-center gap-4 cursor-pointer transition-all ${loginType === 'MASTER' ? 'bg-amber-600 shadow-lg shadow-amber-900/20' : 'bg-blue-600 shadow-lg shadow-blue-900/20'}`}>
            {isLoading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20} /> AUTORISER L'ACCÈS</>}
          </button>
          
          <button type="button" onClick={() => setMode('CHOICE')} className="w-full text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">
             ← Changer de portail d'accès
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-4 italic font-sans relative overflow-hidden">
      {/* Halo de fond Matrix */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Suspense fallback={<Loader2 className="animate-spin text-blue-600" />}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}