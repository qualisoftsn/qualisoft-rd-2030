/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { 
  ChevronLeft, Loader2, Lock, ShieldCheck, 
  Terminal, Globe, Mail, Eye, EyeOff, 
  Cpu, Fingerprint, Building2, ArrowRight
} from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { matrixApi, PublicTenant } from "@/services/matrix.service";
import { toast } from "sonner";

function LoginPortal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [mode, setMode] = useState<"LOADING" | "CHOICE" | "LOGIN_FORM">("LOADING");
  const [loginType, setLoginType] = useState<"MASTER" | "TENANT">("TENANT");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [detectedTenant, setDetectedTenant] = useState<PublicTenant | null>(null);
  const [publicTenants, setPublicTenants] = useState<PublicTenant[]>([]);
  
  const [form, setForm] = useState({ email: "", password: "", tenantId: "" });

  useEffect(() => {
    const identifyNode = async () => {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      
      // Cas : sde.qualisoft.sn ou localhost
      if (parts.length > 2 && !['www', 'api', 'app', 'elite', 'localhost'].includes(parts[0])) {
        const sub = parts[0];
        try {
          const tenant = await matrixApi.getTenantByDomain(sub);
          if (tenant) {
            setDetectedTenant(tenant);
            setForm(prev => ({ ...prev, tenantId: tenant.T_Id }));
            setLoginType("TENANT");
            setMode("LOGIN_FORM");
            return;
          }
        } catch (e) { console.error("Node Identification Fail"); }
      } 
      
      if (['app', 'elite'].includes(parts[0])) {
        setLoginType("MASTER");
        setMode("LOGIN_FORM");
      } else {
        setMode("CHOICE");
      }
    };
    identifyNode();
  }, []);

  useEffect(() => {
    if (mode === "LOGIN_FORM" && loginType === "TENANT" && !detectedTenant) {
      matrixApi.getPublicTenants().then(setPublicTenants);
    }
  }, [mode, loginType, detectedTenant]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Vérification Kernel...");

    try {
      const result = await signIn("credentials", {
        email: form.email.toLowerCase().trim(),
        password: form.password,
        tenantId: form.tenantId,
        redirect: false,
      });

      if (result?.error) throw new Error("Accès refusé. Accréditations invalides.");

      toast.success(`Authentification scellée.`, { id: toastId });
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
      setIsLoading(false);
    }
  };

  if (mode === "LOADING") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Scanning Node...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans italic selection:bg-blue-600/30 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <Cpu className="absolute -top-20 -left-20 text-slate-700" size={600} />
        <Fingerprint className="absolute -bottom-40 -right-20 text-blue-900" size={500} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex p-5 bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] shadow-2xl mb-6">
            <ShieldCheck className={loginType === "MASTER" ? "text-blue-500" : "text-emerald-500"} size={48} />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
            {detectedTenant ? detectedTenant.T_Name : "QUALI"}<span className="text-blue-600">{detectedTenant ? "" : "SOFT"}</span>
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3 italic pl-1">
            {detectedTenant ? `Nœud : ${detectedTenant.T_Domain}` : "Elite RD 2030 Sovereign"}
          </p>
        </div>

        {mode === "CHOICE" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
            <button onClick={() => { setLoginType("MASTER"); setMode("LOGIN_FORM"); }} className="w-full bg-slate-900 border-2 border-slate-800 p-8 rounded-[3rem] flex items-center justify-between hover:border-blue-600 transition-all cursor-pointer group">
              <div className="text-left"><p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">System</p><p className="text-xl font-black text-white uppercase italic">Master Admin</p></div>
              <Terminal className="text-blue-500 group-hover:scale-110 transition-transform" size={28} />
            </button>
            <button onClick={() => { setLoginType("TENANT"); setMode("LOGIN_FORM"); }} className="w-full bg-white p-8 rounded-[3rem] border-4 border-transparent flex items-center justify-between hover:border-blue-600 transition-all cursor-pointer shadow-xl group">
              <div className="text-left"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Portal</p><p className="text-xl font-black text-slate-900 uppercase italic">Client Access</p></div>
              <Globe className="text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-transform" size={28} />
            </button>
          </div>
        )}

        {mode === "LOGIN_FORM" && (
          <div className="bg-slate-900/40 backdrop-blur-2xl border-2 border-slate-800 rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-right-10 duration-500">
            <form onSubmit={handleAuth} className="space-y-7">
              {!detectedTenant && (
                <button type="button" onClick={() => setMode("CHOICE")} className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase hover:text-white transition-colors mb-4 cursor-pointer">
                  <ChevronLeft size={16} /> Retour au choix
                </button>
              )}

              <div className="space-y-4">
                {loginType === "TENANT" && (
                  detectedTenant ? (
                    <div className="relative opacity-70">
                      <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600" size={20} />
                      <input disabled value={detectedTenant.T_Name} className="w-full pl-14 pr-12 py-5 bg-blue-900/10 border-2 border-blue-900/20 rounded-2xl font-black uppercase text-xs text-blue-400 italic" />
                      <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-600/50" size={16} />
                    </div>
                  ) : (
                    <div className="relative">
                       <select required value={form.tenantId} onChange={(e) => setForm({...form, tenantId: e.target.value})} className="w-full p-5 bg-slate-950 border-2 border-slate-800 rounded-2xl font-black uppercase text-xs text-white outline-none focus:border-blue-600 appearance-none italic">
                        <option value="">-- Sélectionner l&apos;organisation --</option>
                        {publicTenants.map(t => <option key={t.T_Id} value={t.T_Id}>{t.T_Name}</option>)}
                      </select>
                      <Globe size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"/>
                    </div>
                  )
                )}

                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input required type="email" placeholder="EMAIL PROFESSIONNEL" className="w-full pl-14 pr-6 py-5 bg-slate-950 border-2 border-slate-800 rounded-2xl font-black text-white outline-none focus:border-blue-600 transition-all text-sm placeholder:text-slate-800" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input required type={showPassword ? "text" : "password"} placeholder="MOT DE PASSE" className="w-full pl-14 pr-14 py-5 bg-slate-950 border-2 border-slate-800 rounded-2xl font-black text-white outline-none focus:border-blue-600 transition-all text-sm placeholder:text-slate-800" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-blue-500 transition-colors cursor-pointer">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button disabled={isLoading} className="w-full py-6 bg-blue-600 text-white rounded-4xl font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-500 transition-all flex justify-center items-center gap-4 cursor-pointer border-none active:scale-95 group">
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                  <>DÉVERROUILLER L&apos;ACCÈS <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></>
                )}
              </button>
            </form>
          </div>
        )}

        <footer className="mt-12 text-center text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] italic">
          Qualisoft Elite RD 2030 Sovereign System
        </footer>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-slate-950 min-h-screen" />}>
      <LoginPortal />
    </Suspense>
  );
}