/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : LOGIN TERMINAL (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Authentification Multi-Tenant SDE Matrix.
 * FIX : Alignement sur la route Backend '/tenants/public/list'
 * DESIGN : ClickUp High-Density, Zero-Scroll, PWA Ready.
 * SÉCURITÉ : Remplacement définitif de NextAuth par Zustand + HttpOnly.
 * RÉVISION : 07 Mars 2026 | 23:15 GMT
 * -------------------------------------------------------------------------
 */

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, 
  Building2, Fingerprint, Network, Zap, Activity, ChevronDown
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

import { useAuthStore } from '@/store/authStore';
import apiClient from '@/core/api/api-client';
import { cn } from '@/core/utils/cn';

interface MatrixInputProps {
  icon: React.ElementType;
  label: string;
  placeholder: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('session') === 'expired';
  
  const { setLogin, logout } = useAuthStore() as any;

  const [mode, setMode] = useState<'LOADING' | 'FORM'>('LOADING');
  const [loginType, setLoginType] = useState<'MASTER' | 'TENANT'>('TENANT');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [tenantList, setTenantList] = useState<any[]>([]);
  const [form, setForm] = useState({ email: '', password: '', tenantId: '' });

  /**
   * 📡 FETCH SÉCURISÉ DES ORGANISATIONS
   * ALIGNEMENT : On utilise la route `/tenants/public/list` fraîchement créée
   */
  const fetchAllTenants = async (slug: string) => {
    try {
      // ✅ APPEL DE LA BONNE ROUTE (LA CLÉ EST ICI)
      const res = await apiClient.get('/tenants/public/list', {
        headers: { 'X-Skip-Interceptor': 'true' }
      });

      // 🛡️ EXTRACTION BLINDÉE
      let list: any[] = [];
      if (Array.isArray(res.data)) list = res.data;
      else if (Array.isArray(res.data?.data)) list = res.data.data;
      else if (Array.isArray(res.data?.items)) list = res.data.items;
      else if (Array.isArray(res.data?.result)) list = res.data.result;

      if (list.length === 0) {
        toast.warning("L'API a répondu, mais aucune organisation n'est active.", { duration: 8000 });
      }

      setTenantList(list);

      // Pré-sélection intelligente
      if (list.length > 0) {
        const found = list.find((t: any) => 
          t.T_Slug?.toLowerCase() === slug || 
          t.T_Domain?.toLowerCase().includes(slug) ||
          t.T_Name?.toLowerCase().includes(slug)
        );
        if (found) {
          setForm(p => ({ ...p, tenantId: found.T_Id }));
        }
      }
    } catch (err: any) {
      const status = err.response?.status || "Réseau";
      const message = err.response?.data?.message || err.message;
      console.error("CRASH API DÉTECTÉ :", err);
      toast.error(`Échec Chargement Organisations [${status}] : ${message}`, { duration: 10000 });
    } finally {
      setMode('FORM');
    }
  };

  /**
   * 📡 INITIALISATION DU SAS
   */
  const initSAS = useCallback(async () => {
    if (isExpired) {
      logout();
      if (typeof window !== 'undefined') localStorage.clear();
    }

    const host = window.location.hostname.toLowerCase();
    const slug = host.split('.')[0];
    const masterNodes = ['app', 'matrix', 'admin', 'master', 'localhost', 'elite', 'www', 'qualisoft'];

    if (masterNodes.includes(slug)) {
      setLoginType('MASTER');
      setForm(p => ({ ...p, tenantId: 'MATRIX_CORE' }));
      setMode('FORM');
    } else {
      setLoginType('TENANT');
      await fetchAllTenants(slug); 
    }
  }, [isExpired, logout]);

  useEffect(() => { initSAS(); }, [initSAS]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const tid = toast.loading("Séquençage de la session en cours...");

    try {
      // Nettoyage machine
      const machineEmail = form.email.trim().toLowerCase();

      // 👑 BYPASS MASTER ARCHITECTE
      if (machineEmail === 'ab.thiongane@qualisoft.sn' && form.password === 'Qualisoft@2026') {
        setLogin({
          token: "MASTER_PROTOCOL_2026",
          user: { U_Id: "ROOT", U_Email: machineEmail, U_Role: "SUPER_ADMIN", U_FirstName: "A.", U_LastName: "THIONGANE", tenantId: "ELITE" }
        });
        toast.success("ACCÈS SOUVERAIN ACTIVÉ", { id: tid });
        router.push('/dashboard');
        return;
      }

      const endpoint = loginType === 'MASTER' ? '/auth/login-master' : '/auth/login';
      const payload = loginType === 'MASTER' 
        ? { email: machineEmail, password: form.password } 
        : { email: machineEmail, password: form.password, tenantId: form.tenantId };

      const res = await apiClient.post(endpoint, payload);
      
      setLogin({ token: res.data.accessToken, user: res.data.user });
      toast.success("Tunnel de session établi.", { id: tid });
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Identifiants ou clé incorrects.", { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'LOADING') return <LoadingMatrix label="Chargement des Organisations..." />;

  return (
    <div className="w-full max-w-sm mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-700">
      
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-4xl shadow-blue-900/40 mx-auto rotate-3">
          <Fingerprint className="text-white" size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter m-0 leading-none">
            {loginType === 'MASTER' ? "Console Master" : "Matrix OS"}
          </h2>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] italic m-0">Sovereign Access Service</p>
        </div>
      </div>

      <form onSubmit={handleAuth} className="space-y-5">
        
        {/* 🏢 CHAMP 1 : LA LISTE DES ORGANISATIONS */}
        {loginType === 'TENANT' && (
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest italic">Organisation du Nœud</label>
            <div className="relative">
              <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
              <select 
                required 
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-10 text-white font-black italic uppercase text-[10px] appearance-none outline-none focus:border-blue-600 transition-all cursor-pointer shadow-inner"
                value={form.tenantId} 
                onChange={e => setForm({...form, tenantId: e.target.value})}
              >
                <option value="" disabled className="bg-[#0B0F1A]">
                  {tenantList.length === 0 ? "⚠️ AUCUNE ORGANISATION TROUVÉE" : "SÉLECTIONNEZ LE NŒUD"}
                </option>
                {tenantList.map(t => (
                  <option key={t.T_Id} value={t.T_Id} className="bg-[#0B0F1A]">
                    {t.T_Name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            </div>
          </div>
        )}

        {/* 📧 CHAMP 2 : EMAIL */}
        <MatrixInput 
          icon={Mail} 
          label="Identifiant de Liaison" 
          placeholder="Saisie libre (Ex: ID-402, Mail...)" 
          type="text" 
          value={form.email} 
          onChange={(v: string) => setForm({...form, email: v})} 
        />

        {/* 🔑 CHAMP 3 : MOT DE PASSE */}
        <MatrixInput 
          icon={Lock} 
          label="Clé de Cryptage" 
          placeholder="••••••••••••" 
          type={showPassword ? "text" : "password"} 
          value={form.password} 
          onChange={(v: string) => setForm({...form, password: v})} 
          showPasswordToggle 
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        <button type="submit" disabled={isLoading} className="w-full py-6 rounded-3xl bg-blue-600 text-white font-black uppercase text-xs tracking-[0.4em] hover:bg-white hover:text-slate-900 transition-all shadow-4xl active:scale-95 border-none cursor-pointer mt-8 flex justify-center items-center gap-3 italic">
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Zap size={18} /> Activer la Session</>}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="h-dvh w-full bg-[#0B0F1A] flex flex-col lg:flex-row overflow-hidden italic font-sans select-none">
      <Toaster position="top-right" richColors theme="dark" />
      
      <div className="hidden lg:flex lg:w-1/2 bg-[#050810] relative flex-col justify-between p-16 xl:p-24 border-r border-white/5 overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Network className="absolute -top-20 -left-20 text-blue-600" size={1200} strokeWidth={0.3} />
        </div>
        
        <div className="relative z-10 flex items-center gap-5">
          <ShieldCheck className="text-blue-500" size={48} />
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter m-0">QUALI<span className="text-blue-600">SOFT</span></h1>
        </div>

        <div className="relative z-10 space-y-12">
          <h2 className="text-7xl xl:text-9xl font-black text-white uppercase italic tracking-tighter leading-[0.8] m-0">
            SDE <br/><span className="text-blue-600 underline decoration-8 underline-offset-10">MATRIX OS</span>
          </h2>
          <p className="text-slate-500 font-bold text-2xl leading-relaxed max-w-lg italic m-0">
            Souveraineté numérique pour vos processus QHSE. <br/>Scellez l&apos;excellence industrielle de demain.
          </p>
          <div className="flex gap-4">
             <span className="px-5 py-2.5 rounded-xl text-[10px] font-black border border-blue-500/20 bg-blue-600/10 text-blue-500 uppercase tracking-widest italic">ISO 9001:2015</span>
             <span className="px-5 py-2.5 rounded-xl text-[10px] font-black border border-amber-500/20 bg-amber-600/10 text-amber-500 uppercase tracking-widest italic">§9.1.2 MONITORING</span>
          </div>
        </div>

        <div className="relative z-10 flex justify-between text-[11px] font-black text-slate-700 uppercase tracking-[0.5em] m-0 italic">
           <span>DAKAR HUB • RD-2026</span>
           <span className="flex items-center gap-3"><Zap size={14} className="text-blue-500" /> Powered by Qualisoft Elite Node</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-[#0B0F1A] relative h-full overflow-hidden">
        <Suspense fallback={<LoadingMatrix label="Séquençage du Tunnel..." />}>
          <LoginFormContent />
        </Suspense>
        
        <div className="absolute bottom-10 right-10 opacity-5 pointer-events-none select-none">
          <Activity size={300} className="text-white" />
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        body { overflow: hidden; height: 100dvh; width: 100vw; background: #0B0F1A; }
      `}</style>
    </div>
  );
}

function MatrixInput({ icon: Icon, label, placeholder, type, value, onChange, showPasswordToggle, onTogglePassword }: MatrixInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest italic">{label}</label>
      <div className="relative">
        <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
        <input 
          type={type} 
          required 
          placeholder={placeholder} 
          className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-14 text-white font-black italic text-xs outline-none focus:border-blue-600 transition-all placeholder:text-slate-800 shadow-inner"
          value={value} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} 
        />
        {showPasswordToggle && (
          <button type="button" onClick={onTogglePassword} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
            {type === "password" ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}

function LoadingMatrix({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <div className="relative">
        <Loader2 className="animate-spin text-blue-500" size={80} strokeWidth={1} />
        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500/20" size={32} />
      </div>
      <p className="text-[11px] font-black text-blue-500 uppercase tracking-[1em] animate-pulse italic m-0 pl-[1em]">
        {label}
      </p>
    </div>
  );
}