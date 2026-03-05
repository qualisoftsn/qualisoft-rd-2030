/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🔑 MODULE : LoginPage.tsx (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Portail d'accès Multi-Tenant & Console Master.
 * FIX : UI Split-Screen ClickUp (100dvh, Zéro Scroll), Intégration PWA.
 * SÉCURITÉ : Zéro NextAuth. API SDE validée. Bypass Master conservé.
 * RÉVISION : 04 Mars 2026 | 23:45 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Loader2, Mail, Lock, Eye, EyeOff, 
  ShieldCheck, Building2, ChevronLeft,
  Fingerprint, Crown, ChevronDown, Network
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import { Tenant } from '@/types/elite-sde';
import Image from 'next/image';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const { setLogin } = useAuthStore() as any;

  // 🛡️ ÉTATS SOUVERAINS
  const [mode, setMode] = useState<'LOADING' | 'CHOICE' | 'LOGIN_FORM'>('LOADING');
  const [loginType, setLoginType] = useState<'MASTER' | 'TENANT'>('TENANT');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // GESTION DU MULTI-TENANT
  const [detectedTenant, setDetectedTenant] = useState<Tenant | null>(null);
  const [tenantList, setTenantList] = useState<Tenant[]>([]); 
  
  // FORMULAIRE
  const [form, setForm] = useState({ email: '', password: '', tenantId: '' });

  const fetchTenantList = async () => {
    try {
      const res = await apiClient.get('/public/tenants');
      const tenants = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setTenantList(tenants);
    } catch (err) {
      console.error("Échec de récupération de la liste des organisations Matrix", err);
    }
  };

  useEffect(() => {
    const detectNode = async () => {
      try {
        const host = window.location.hostname.toLowerCase();
        const slug = host.split('.')[0];
        const masterNodes = ['app', 'matrix', 'admin', 'master', 'localhost'];
        
        if (masterNodes.includes(slug)) {
          setLoginType('MASTER');
          setForm(p => ({ ...p, tenantId: 'MATRIX' }));
          setMode('LOGIN_FORM');
        } else if (!['elite', 'www', 'qualisoft'].includes(slug)) {
          const res = await apiClient.get(`/public/tenants/by-slug/${slug}`);
          if (res.data?.data || res.data) {
            const tenantData = res.data.data || res.data;
            setDetectedTenant(tenantData);
            setForm(p => ({ ...p, tenantId: tenantData.T_Id })); 
            setLoginType('TENANT');
            setMode('LOGIN_FORM');
          } else {
            await fetchTenantList();
            setMode('CHOICE');
          }
        } else {
          await fetchTenantList();
          setMode('CHOICE');
        }
      } catch (err) {
        await fetchTenantList();
        setMode('CHOICE');
      }
    };
    detectNode();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const tid = toast.loading('Scellage de session en cours...');

    try {
      // 👑 BYPASS MASTER ARCHITECT
      if (form.email === 'ab.thiongane@qualisoft.sn' && form.password === 'Qualisoft@2026') {
        const masterData = { 
          token: "MASTER_PROTOCOL_2026", 
          user: { U_Id: "ROOT", U_Email: form.email, U_Role: "SUPER_ADMIN", U_FirstName: "A.", U_LastName: "THIONGANE", tenantId: "MASTER" },
          isMaster: true
        };
        setLogin(masterData);
        toast.success("ACCÈS SOUVERAIN ACTIVÉ", { id: tid });
        router.push('/admin/super-dashboard');
        return;
      }

      // 🔐 REQUÊTE D'AUTHENTIFICATION API SDE
      const endpoint = loginType === 'MASTER' ? '/auth/login-master' : '/auth/login';
      const payload = loginType === 'MASTER' 
        ? { password: form.password } 
        : { email: form.email.toLowerCase().trim(), password: form.password, tenantId: form.tenantId };

      const res = await apiClient.post(endpoint, payload);

      // Hydratation de Zustand
      setLogin({
        token: res.data.accessToken,
        user: res.data.user,
        isMaster: res.data.isMaster
      });

      toast.success(`Authentification Matrix réussie`, { id: tid });
      router.push(loginType === 'MASTER' ? '/admin/super-dashboard' : callbackUrl);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Identifiants invalides ou accès refusé.', { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'LOADING') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 italic animate-pulse w-full">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Initialisation du SAS Matrix...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* 🛡️ EN-TÊTE DU FORMULAIRE */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-[#0B0F1A] border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl mx-auto shadow-blue-900/20">
          <Fingerprint className="text-blue-500" size={32} />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter m-0 leading-none">
            {detectedTenant?.T_Name || (loginType === 'MASTER' ? 'Matrix Console' : 'Elite Matrix OS')}
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-3 m-0">
            Portail d&apos;authentification sécurisé
          </p>
        </div>
      </div>

      {mode === 'CHOICE' ? (
        <div className="space-y-4">
          <button onClick={() => { setLoginType('TENANT'); setMode('LOGIN_FORM'); }} className="w-full p-6 md:p-8 bg-blue-600 rounded-2xl md:rounded-4xl flex justify-between items-center text-white font-black italic hover:bg-white hover:text-slate-900 transition-all border-none cursor-pointer shadow-xl active:scale-95 group">
            <span className="text-sm md:text-base tracking-widest uppercase">Accès Elite SDE</span>
            <Building2 size={24} className="group-hover:scale-110 transition-transform" />
          </button>
          <button onClick={() => { setLoginType('MASTER'); setMode('LOGIN_FORM'); setForm(p => ({ ...p, tenantId: 'MATRIX' })); }} className="w-full p-6 md:p-8 bg-[#0B0F1A] border border-white/10 rounded-2xl md:rounded-4xl flex justify-between items-center text-slate-400 font-black italic hover:border-amber-500/50 hover:text-amber-500 hover:bg-amber-500/5 transition-all cursor-pointer active:scale-95 group">
            <span className="text-sm md:text-base tracking-widest uppercase">Console Master</span>
            <Crown size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleAuth} className="space-y-4">
          
          {loginType === 'TENANT' && (
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Organisation Nœud</label>
              <div className="relative group">
                <Building2 className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${detectedTenant ? 'text-blue-500' : 'text-slate-500 group-focus-within:text-blue-500'}`} size={18} />
                
                {detectedTenant ? (
                  <>
                    <input 
                      type="text" required readOnly
                      className="w-full p-4 md:p-5 pl-14 rounded-2xl md:rounded-3xl outline-none uppercase text-xs font-black italic transition-colors bg-[#0B0F1A] border border-blue-500/30 text-blue-400 cursor-not-allowed opacity-90 shadow-inner"
                      value={detectedTenant.T_Name}
                    />
                    <ShieldCheck className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                  </>
                ) : (
                  <>
                    <select
                      required
                      className="w-full p-4 md:p-5 pl-14 pr-12 bg-[#0B0F1A] border border-white/10 rounded-2xl md:rounded-3xl text-white outline-none focus:border-blue-500 transition-colors uppercase text-[10px] md:text-xs font-black italic appearance-none cursor-pointer shadow-inner"
                      value={form.tenantId}
                      onChange={e => setForm({...form, tenantId: e.target.value})}
                    >
                      <option value="" disabled className="text-slate-500">-- SÉLECTIONNEZ LE NŒUD --</option>
                      {tenantList.map((t: Tenant) => (
                        <option key={t.T_Id} value={t.T_Id} className="bg-[#0F172A] text-white">
                          {t.T_Name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Email caché pour la console Master car géré par Root */}
          {loginType !== 'MASTER' && (
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Identifiant de liaison</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="email" required placeholder="EMAIL PROFESSIONNEL" 
                  className="w-full p-4 md:p-5 pl-14 bg-[#0B0F1A] border border-white/10 rounded-2xl md:rounded-3xl text-white outline-none focus:border-blue-500 transition-colors uppercase text-xs font-black italic shadow-inner placeholder:text-slate-600"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Clé de cryptage</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} required placeholder="••••••••••••" 
                className="w-full p-4 md:p-5 pl-14 pr-14 bg-[#0B0F1A] border border-white/10 rounded-2xl md:rounded-3xl text-white outline-none focus:border-blue-500 transition-colors font-black italic shadow-inner placeholder:text-slate-600"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white border-none bg-transparent cursor-pointer transition-colors p-2">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading || (!form.tenantId && loginType === 'TENANT')} className={`w-full mt-8 py-5 md:py-6 rounded-2xl md:rounded-3xl font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-xs italic transition-all flex justify-center items-center gap-3 border-none active:scale-95 ${isLoading || (!form.tenantId && loginType === 'TENANT') ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-white hover:text-slate-900 shadow-xl shadow-blue-900/20 cursor-pointer'}`}>
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : "ACTIVER LA SESSION"}
          </button>

          <button type="button" onClick={() => setMode('CHOICE')} className="w-full pt-6 text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest border-none bg-transparent cursor-pointer hover:text-white transition-colors flex items-center justify-center gap-1 m-0">
            <ChevronLeft size={12} /> CHANGER DE CANAL
          </button>
        </form>
      )}
    </div>
  );
}

// 📦 LAYOUT SPLIT-SCREEN (CLICKUP STYLE)
export default function LoginPage() {
  return (
    <div className="h-dvh w-full bg-[#0B0F1A] flex flex-col lg:flex-row selection:bg-blue-600/30 overflow-hidden font-sans">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🌌 PANNEAU GAUCHE : VISUEL MATRIX (Masqué sur mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#050810] relative flex-col justify-between p-16 border-r border-white/5 overflow-hidden">
        {/* Décors Matrix */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <Network className="absolute -top-20 -left-20 text-blue-600/5" size={800} strokeWidth={0.5} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <ShieldCheck className="text-blue-500" size={32} />
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter m-0">QUALI<span className="text-blue-600">SOFT</span></h1>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none m-0">
            Enterprise <br/><span className="text-blue-600">Matrix OS</span>
          </h2>
          <p className="text-slate-400 font-medium text-sm leading-relaxed">
            Le système de gouvernance et de performance Qualité, Sécurité et Environnement de nouvelle génération. Scellez vos processus, maîtrisez vos risques.
          </p>
          <div className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-[#050810] flex items-center justify-center text-[10px] font-black text-white">ISO</div>
              <div className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-[#050810] flex items-center justify-center text-[10px] font-black text-white">QSE</div>
              <div className="w-10 h-10 rounded-full bg-amber-600 border-2 border-[#050810] flex items-center justify-center text-[10px] font-black text-white">SMI</div>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic m-0">Standards d&apos;Excellence</p>
          </div>
        </div>

        <div className="relative z-10 flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">
          <span>RD 2026 Build</span>
          <span>Dakar Hub</span>
        </div>
      </div>

      {/* 🔐 PANNEAU DROITE : FORMULAIRE D'AUTHENTIFICATION */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center relative p-6 md:p-12 overflow-y-auto custom-scrollbar">
        {/* Background mobile only */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 lg:hidden overflow-hidden">
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full" />
        </div>

        <Suspense fallback={<Loader2 className="animate-spin text-blue-600 mx-auto relative z-10" size={48} />}>
          <LoginFormContent />
        </Suspense>
      </div>
    </div>
  );
}