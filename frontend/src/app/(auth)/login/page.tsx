'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🔑 MODULE : LOGIN GATEWAY (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : SAS d'accès sécurisé Multi-Tenant.
 * DESIGN : Split-Screen ClickUp (100dvh), Zero-Scroll, Matrix Aesthetic.
 * RÉVISION : 06 Mars 2026 | 03:20 GMT
 * -------------------------------------------------------------------------
 */

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, 
  Building2, ChevronLeft, Fingerprint, Crown, ChevronDown, Network, Zap
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';

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

  // 📡 Initialisation du SAS
  useEffect(() => {
    const initSAS = async () => {
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
          } else { loadTenants(); }
        } else { loadTenants(); }
      } catch { loadTenants(); }
    };
    initSAS();
  }, []);

  const loadTenants = async () => {
    try {
      const res = await apiClient.get('/public/tenants');
      setTenantList(res.data?.data || res.data || []);
      setMode('CHOICE');
    } catch { toast.error("Le Kernel ne répond pas."); }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const tid = toast.loading("Scellage de session...");

    try {
      // 👑 BYPASS MASTER ARCHITECTE
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

      toast.success("Authentification Matrix scellée.", { id: tid });
      router.push(res.data.isMaster ? '/admin/matrix' : '/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Session refusée par le Kernel.", { id: tid });
    } finally { setIsLoading(false); }
  };

  if (mode === 'LOADING') return (
    <div className="flex flex-col items-center justify-center h-full gap-4 animate-pulse">
      <Loader2 className="animate-spin text-blue-500" size={50} strokeWidth={3} />
      <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.6em] italic">Initialisation SAS...</p>
    </div>
  );

  return (
    <div className="w-full max-w-sm mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-700">
      
      {/* 🔝 LOGO SAS */}
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-900/40 mx-auto rotate-3">
          <Fingerprint className="text-white" size={36} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter m-0">{detectedTenant?.T_Name || "Matrix OS"}</h2>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3">Sovereign Access Service</p>
        </div>
      </div>

      {mode === 'CHOICE' ? (
        <div className="space-y-4">
          <ChoiceBtn icon={Building2} label="Nœud Territorial" onClick={() => { setLoginType('TENANT'); setMode('FORM'); }} />
          <ChoiceBtn icon={Crown} label="Console Master" color="amber" onClick={() => { setLoginType('MASTER'); setMode('FORM'); setForm(p => ({ ...p, tenantId: 'MATRIX' })); }} />
        </div>
      ) : (
        <form onSubmit={handleAuth} className="space-y-5">
          {loginType === 'TENANT' && (
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest italic">Organisation Nœud</label>
              <div className="relative">
                <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                {detectedTenant ? (
                  <input readOnly className="w-full bg-white/5 border border-blue-500/30 rounded-3xl py-5 pl-16 text-blue-400 font-black italic uppercase text-xs cursor-not-allowed" value={detectedTenant.T_Name} />
                ) : (
                  <select required className="w-full bg-black/40 border border-white/10 rounded-3xl py-5 pl-16 pr-10 text-white font-black italic uppercase text-xs appearance-none outline-none focus:border-blue-600 transition-all cursor-pointer"
                    value={form.tenantId} onChange={e => setForm({...form, tenantId: e.target.value})}>
                    <option value="" disabled>SÉLECTIONNEZ LE NŒUD</option>
                    {tenantList.map(t => <option key={t.T_Id} value={t.T_Id} className="bg-[#0B0F1A]">{t.T_Name}</option>)}
                  </select>
                )}
                {!detectedTenant && <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />}
              </div>
            </div>
          )}

          {loginType !== 'MASTER' && (
            <MatrixInput icon={Mail} label="Identifiant de liaison" placeholder="EMAIL PROFESSIONNEL" type="email" value={form.email} onChange={v => setForm({...form, email: v})} />
          )}

          <div className="relative">
            <MatrixInput icon={Lock} label="Clé de cryptage" placeholder="••••••••••••" type={showPassword ? "text" : "password"} value={form.password} onChange={v => setForm({...form, password: v})} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-[3.2rem] text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer"><Eye size={18} /></button>
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-6 rounded-3xl bg-blue-600 text-white font-black uppercase text-xs tracking-[0.4em] hover:bg-white hover:text-slate-900 transition-all shadow-2xl shadow-blue-900/40 active:scale-95 border-none cursor-pointer mt-8">
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "ACTIVER LA SESSION"}
          </button>

          <button type="button" onClick={() => setMode('CHOICE')} className="w-full text-[9px] font-black text-slate-600 hover:text-white transition-colors bg-transparent border-none cursor-pointer uppercase tracking-widest flex items-center justify-center gap-2 italic">
            <ChevronLeft size={14} /> Revenir à la sélection du canal
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="h-dvh w-full bg-[#0B0F1A] flex flex-col lg:flex-row overflow-hidden italic">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🌌 PANEL GAUCHE : BRANDING ELITE (DESKTOP) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#050810] relative flex-col justify-between p-16 border-r border-white/5">
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <Network className="absolute -top-20 -left-20 text-blue-600" size={1000} strokeWidth={0.5} />
        </div>
        
        <div className="relative z-10 flex items-center gap-4">
          <ShieldCheck className="text-blue-500" size={36} />
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter m-0">QUALI<span className="text-blue-600">SOFT</span></h1>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-7xl lg:text-8xl font-black text-white uppercase italic tracking-tighter leading-[0.85] m-0">
            ENTERPRISE <br/><span className="text-blue-600 underline decoration-8 underline-offset-10">MATRIX OS</span>
          </h2>
          <p className="text-slate-400 font-bold text-xl leading-relaxed max-w-md italic">
            La souveraineté numérique pour vos processus QHSE. Scellez l'excellence industrielle.
          </p>
          <div className="flex gap-4">
             <Pill label="ISO 9001" color="blue" />
             <Pill label="SMI" color="amber" />
             <Pill label="HSE" color="emerald" />
          </div>
        </div>

        <div className="relative z-10 flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">
           <span>DAKAR HUB • RD 2026</span>
           <span className="flex items-center gap-2"><Zap size={12} className="text-blue-500" /> Powered by Qualisoft Elite</span>
        </div>
      </div>

      {/* 🔐 PANEL DROITE : SAS GATEWAY */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 overflow-y-auto custom-scrollbar relative">
        <Suspense fallback={<Loader2 className="animate-spin text-blue-600" size={40} />}>
          <LoginFormContent />
        </Suspense>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        body { overflow: hidden; height: 100dvh; }
      `}</style>
    </div>
  );
}

// ATOMIQUES
function ChoiceBtn({ icon: Icon, label, color = "blue", onClick }: any) {
  const colors: any = {
    blue: "bg-blue-600 hover:bg-white hover:text-slate-900",
    amber: "bg-[#0B0F1A] border border-white/10 text-slate-400 hover:border-amber-500/50 hover:text-amber-500 hover:bg-amber-500/5"
  };
  return (
    <button onClick={onClick} className={`w-full p-8 rounded-[2.5rem] flex justify-between items-center transition-all cursor-pointer shadow-2xl active:scale-95 border-none group ${colors[color]}`}>
      <span className="text-sm font-black italic uppercase tracking-[0.2em]">{label}</span>
      <Icon size={28} className="group-hover:scale-110 transition-transform" />
    </button>
  );
}

function MatrixInput({ icon: Icon, label, placeholder, type, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest italic">{label}</label>
      <div className="relative">
        <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
        <input type={type} required placeholder={placeholder} className="w-full bg-black/40 border border-white/10 rounded-3xl py-5 px-16 text-white font-black italic text-xs uppercase outline-none focus:border-blue-600 transition-all placeholder:text-slate-700 shadow-inner"
          value={value} onChange={e => onChange(e.target.value)} />
      </div>
    </div>
  );
}

function Pill({ label, color }: any) {
  const colors: any = { blue: "bg-blue-600/10 text-blue-500 border-blue-500/20", amber: "bg-amber-600/10 text-amber-500 border-amber-500/20", emerald: "bg-emerald-600/10 text-emerald-500 border-emerald-500/20" };
  return <span className={`px-4 py-2 rounded-xl text-[9px] font-black border uppercase tracking-widest ${colors[color]}`}>{label}</span>;
}