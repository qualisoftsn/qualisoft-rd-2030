/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🔐 MODULE : LOGIN GATEWAY (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : SAS d'accès sécurisé Multi-Tenant & Master Matrix.
 * DESIGN : Split-Screen High-Density (100dvh), Zero-Scroll, Matrix Core.
 * RÉVISION : 06 Mars 2026 | 22:20 GMT
 * -------------------------------------------------------------------------
 */

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, 
  Building2, ChevronLeft, Fingerprint, Crown, ChevronDown, Network, Zap
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/core/utils/cn';

// --- TYPES SCELLÉS ---
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
  const { setLogin } = useAuthStore() as any;

  const [mode, setMode] = useState<'LOADING' | 'CHOICE' | 'FORM'>('LOADING');
  const [loginType, setLoginType] = useState<'MASTER' | 'TENANT'>('TENANT');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [tenantList, setTenantList] = useState<any[]>([]);
  const [detectedTenant, setDetectedTenant] = useState<any>(null);
  const [form, setForm] = useState({ email: '', password: '', tenantId: '' });

  /**
   * 📡 INITIALISATION DU SAS SDE
   * Détection automatique du Tenant par le sous-domaine (Slug)
   */
  const initSAS = useCallback(async () => {
    try {
      const host = window.location.hostname.toLowerCase();
      const slug = host.split('.')[0];
      const masterNodes = ['app', 'matrix', 'admin', 'master', 'localhost'];

      if (masterNodes.includes(slug)) {
        setLoginType('MASTER');
        setForm(p => ({ ...p, tenantId: 'MATRIX_CORE' }));
        setMode('FORM');
      } else if (!['www', 'elite', 'qualisoft'].includes(slug)) {
        const res = await apiClient.get(`/public/tenants/by-slug/${slug}`);
        const tenant = res.data?.data || res.data;
        if (tenant) {
          setDetectedTenant(tenant);
          setForm(p => ({ ...p, tenantId: tenant.T_Id }));
          setMode('FORM');
        } else { await loadTenants(); }
      } else { await loadTenants(); }
    } catch { await loadTenants(); }
  }, []);

  useEffect(() => { initSAS(); }, [initSAS]);

  const loadTenants = async () => {
    try {
      const res = await apiClient.get('/public/tenants');
      setTenantList(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      setMode('CHOICE');
    } catch { toast.error("Le Kernel Matrix ne répond pas."); }
  };

  /**
   * 🚀 PROTOCOLE D'AUTHENTIFICATION
   */
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const tid = toast.loading("Séquençage de session...");

    try {
      // 👑 BYPASS MASTER ARCHITECTE (Accès racine)
      if (form.email === 'ab.thiongane@qualisoft.sn' && form.password === 'Qualisoft@2026') {
        setLogin({
          token: "MASTER_PROTOCOL_2026",
          user: { U_Id: "ROOT", U_Email: form.email, U_Role: "SUPER_ADMIN", U_FirstName: "A.", U_LastName: "THIONGANE" },
          isMaster: true
        });
        toast.success("ACCÈS SOUVERAIN ACTIVÉ", { id: tid });
        router.push('/admin/matrix');
        return;
      }

      const endpoint = loginType === 'MASTER' ? '/auth/login-master' : '/auth/login';
      const payload = loginType === 'MASTER' 
        ? { password: form.password } 
        : { email: form.email.toLowerCase().trim(), password: form.password, tenantId: form.tenantId };

      const res = await apiClient.post(endpoint, payload);
      setLogin({ token: res.data.accessToken, user: res.data.user, isMaster: res.data.isMaster });

      toast.success("Tunnel Matrix établi.", { id: tid });
      router.push(res.data.isMaster ? '/admin/matrix' : '/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Session rejetée par le Kernel.", { id: tid });
    } finally { setIsLoading(false); }
  };

  if (mode === 'LOADING') return <LoadingMatrix label="Initialisation SAS..." />;

  return (
    <div className="w-full max-w-sm mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-700">
      
      {/* 🔝 LOGO SAS TACTIQUE */}
      <div className="text-center space-y-6">
        <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-4xl shadow-blue-900/40 mx-auto rotate-3 group hover:rotate-0 transition-transform duration-500">
          <Fingerprint className="text-white" size={44} />
        </div>
        <div>
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter m-0 leading-none">
            {detectedTenant?.T_Name || "Matrix OS"}
          </h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] mt-4 italic m-0">Sovereign Access Service</p>
        </div>
      </div>

      {mode === 'CHOICE' ? (
        <div className="space-y-5">
          <ChoiceBtn icon={Building2} label="Nœud Territorial" onClick={() => { setLoginType('TENANT'); setMode('FORM'); }} />
          <ChoiceBtn icon={Crown} label="Console Master" color="amber" onClick={() => { setLoginType('MASTER'); setMode('FORM'); setForm(p => ({ ...p, tenantId: 'MATRIX' })); }} />
        </div>
      ) : (
        <form onSubmit={handleAuth} className="space-y-6">
          {loginType === 'TENANT' && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest italic">Organisation Nœud</label>
              <div className="relative">
                <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
                {detectedTenant ? (
                  <input readOnly className="w-full bg-white/5 border border-blue-500/30 rounded-3xl py-6 pl-16 text-blue-400 font-black italic uppercase text-sm cursor-not-allowed outline-none" value={detectedTenant.T_Name} />
                ) : (
                  <select required className="w-full bg-black/40 border border-white/10 rounded-3xl py-6 pl-16 pr-10 text-white font-black italic uppercase text-xs appearance-none outline-none focus:border-blue-600 transition-all cursor-pointer"
                    value={form.tenantId} onChange={e => setForm({...form, tenantId: e.target.value})}>
                    <option value="" disabled className="bg-[#0B0F1A]">SÉLECTIONNEZ LE NŒUD</option>
                    {tenantList.map(t => <option key={t.T_Id} value={t.T_Id} className="bg-[#0B0F1A]">{t.T_Name}</option>)}
                  </select>
                )}
                {!detectedTenant && <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />}
              </div>
            </div>
          )}

          {loginType !== 'MASTER' && (
            <MatrixInput 
              icon={Mail} 
              label="Identifiant de liaison" 
              placeholder="EMAIL PROFESSIONNEL" 
              type="email" 
              value={form.email} 
              onChange={(v: string) => setForm({...form, email: v})} 
            />
          )}

          <MatrixInput 
            icon={Lock} 
            label="Clé de cryptage" 
            placeholder="••••••••••••" 
            type={showPassword ? "text" : "password"} 
            value={form.password} 
            onChange={(v: string) => setForm({...form, password: v})} 
            showPasswordToggle 
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          <button type="submit" disabled={isLoading} className="w-full py-7 rounded-4xl bg-blue-600 text-white font-black uppercase text-xs tracking-[0.5em] hover:bg-white hover:text-slate-900 transition-all shadow-4xl active:scale-95 border-none cursor-pointer mt-10 flex justify-center items-center gap-3 italic">
            {isLoading ? <Loader2 className="animate-spin" size={24} strokeWidth={3} /> : "ACTIVER LA SESSION"}
          </button>

          <button type="button" onClick={() => setMode('CHOICE')} className="w-full text-[9px] font-black text-slate-600 hover:text-white transition-all bg-transparent border-none cursor-pointer uppercase tracking-widest flex items-center justify-center gap-2 italic">
            <ChevronLeft size={16} /> Revenir à la sélection du canal
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="h-dvh w-full bg-[#0B0F1A] flex flex-col lg:flex-row overflow-hidden italic font-sans">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🌌 PANEL GAUCHE : BRANDING ELITE (DESKTOP) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#050810] relative flex-col justify-between p-16 xl:p-24 border-r border-white/5 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Network className="absolute -top-20 -left-20 text-blue-600" size={1200} strokeWidth={0.3} />
        </div>
        
        <div className="relative z-10 flex items-center gap-5">
          <ShieldCheck className="text-blue-500" size={48} />
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter m-0">QUALI<span className="text-blue-600">SOFT</span></h1>
        </div>

        <div className="relative z-10 space-y-10">
          <h2 className="text-7xl xl:text-9xl font-black text-white uppercase italic tracking-tighter leading-[0.8] m-0">
            ENTERPRISE <br/><span className="text-blue-600 underline decoration-8 underline-offset-10">MATRIX OS</span>
          </h2>
          <p className="text-slate-500 font-bold text-2xl leading-relaxed max-w-lg italic m-0">
            Souveraineté numérique & Pilotage QHSE. Scellez l&apos;excellence industrielle de demain.
          </p>
          <div className="flex gap-4">
             <Pill label="ISO 9001:2015" color="blue" />
             <Pill label="§9.1.2 MONITORING" color="amber" />
             <Pill label="HSE CORE" color="emerald" />
          </div>
        </div>

        <div className="relative z-10 flex justify-between text-[11px] font-black text-slate-700 uppercase tracking-[0.5em] m-0 italic">
           <span>SENEGAL HUB • RD 2026</span>
           <span className="flex items-center gap-3"><Zap size={14} className="text-blue-500" /> Powered by Qualisoft Elite Node</span>
        </div>
      </div>

      {/* 🔐 PANEL DROITE : SAS GATEWAY */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-[#0B0F1A] relative h-full overflow-hidden">
        <Suspense fallback={<LoadingMatrix label="Calcul du Tunnel..." />}>
          <LoginFormContent />
        </Suspense>
        
        {/* FILIGRANE SOUVERAIN */}
        <div className="absolute bottom-10 right-10 opacity-5 pointer-events-none select-none">
          <Fingerprint size={200} className="text-white" />
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        body { overflow: hidden; height: 100dvh; width: 100vw; }
      `}</style>
    </div>
  );
}

// --- COMPOSANTS ATOMIQUES ---

function ChoiceBtn({ icon: Icon, label, color = "blue", onClick }: any) {
  const colors: any = {
    blue: "bg-blue-600 hover:bg-white hover:text-slate-950 shadow-blue-900/20",
    amber: "bg-transparent border-2 border-white/5 text-slate-600 hover:border-amber-500/40 hover:text-amber-500 hover:bg-amber-500/5 shadow-none"
  };
  return (
    <button onClick={onClick} className={cn(
      "w-full p-10 rounded-[3rem] flex justify-between items-center transition-all duration-500 cursor-pointer shadow-4xl active:scale-95 border-none group relative overflow-hidden",
      colors[color]
    )}>
      <span className="text-base font-black italic uppercase tracking-[0.3em] z-10">{label}</span>
      <Icon size={32} strokeWidth={2.5} className="group-hover:scale-125 transition-transform duration-500 z-10" />
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
    </button>
  );
}

function MatrixInput({ icon: Icon, label, placeholder, type, value, onChange, showPasswordToggle, onTogglePassword }: MatrixInputProps) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest italic">{label}</label>
      <div className="relative">
        <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
        <input 
          type={type} 
          required 
          placeholder={placeholder} 
          className="w-full bg-black/40 border border-white/10 rounded-3xl py-6 px-16 text-white font-black italic text-xs uppercase outline-none focus:border-blue-600 transition-all placeholder:text-slate-800 shadow-inner"
          value={value} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} 
        />
        {showPasswordToggle && (
          <button type="button" onClick={onTogglePassword} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
            {type === "password" ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}

function Pill({ label, color }: any) {
  const colors: any = { 
    blue: "bg-blue-600/10 text-blue-500 border-blue-500/20", 
    amber: "bg-amber-600/10 text-amber-500 border-amber-500/20", 
    emerald: "bg-emerald-600/10 text-emerald-500 border-emerald-500/20" 
  };
  return <span className={cn("px-5 py-2.5 rounded-xl text-[10px] font-black border uppercase tracking-widest italic", colors[color])}>{label}</span>;
}

function LoadingMatrix({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <Loader2 className="animate-spin text-blue-500" size={64} strokeWidth={1} />
      <p className="text-[11px] font-black text-blue-500 uppercase tracking-[1em] animate-pulse italic m-0 pl-[1em]">
        {label}
      </p>
    </div>
  );
}