/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { matrixApi, PublicTenant } from "@/services/matrix.service";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Mail, Lock, ArrowRight, Globe, Terminal, ChevronLeft, Eye, EyeOff } from "lucide-react";

function LoginPortal() {
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
      if (parts.length > 2 && !['www', 'api', 'app', 'elite', 'localhost'].includes(parts[0])) {
        try {
          const tenant = await matrixApi.getTenantByDomain(parts[0]);
          if (tenant) {
            setDetectedTenant(tenant);
            setForm(prev => ({ ...prev, tenantId: tenant.T_Id }));
            setLoginType("TENANT");
            setMode("LOGIN_FORM");
            return;
          }
        } catch (e) { console.warn("Node detection fail"); }
      } 
      if (['app', 'elite'].includes(parts[0])) { setLoginType("MASTER"); setMode("LOGIN_FORM"); }
      else { setMode("CHOICE"); }
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
    const tid = toast.loading("Vérification Kernel...");
    try {
      const result = await signIn("credentials", {
        email: form.email.toLowerCase().trim(),
        password: form.password,
        tenantId: form.tenantId,
        redirect: false,
      });
      if (result?.error) throw new Error("Accès refusé.");
      toast.success("Authentification scellée.", { id: tid });
      
      // ⚡ FORCE REDIRECT : Pour bypasser le cache Next.js/OVH
      window.location.href = loginType === "MASTER" ? "/admin/matrix" : "/dashboard";
    } catch (err: any) {
      toast.error(err.message, { id: tid });
      setIsLoading(false);
    }
  };

  if (mode === "LOADING") return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 italic font-sans">
      <div className="w-full max-w-md bg-slate-900/40 border-2 border-slate-800 rounded-[3rem] p-10 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-10">
          <ShieldCheck className={`${loginType === "MASTER" ? "text-blue-500" : "text-emerald-500"} mx-auto mb-4`} size={48} />
          <h1 className="text-3xl font-black text-white uppercase italic">
            {detectedTenant ? detectedTenant.T_Name : "QUALI"}<span className="text-blue-600">{detectedTenant ? "" : "SOFT"}</span>
          </h1>
        </div>

        {mode === "CHOICE" ? (
          <div className="space-y-4">
            <button onClick={() => { setLoginType("MASTER"); setMode("LOGIN_FORM"); }} className="w-full bg-slate-900 p-6 rounded-3xl border-2 border-slate-800 flex justify-between items-center hover:border-blue-600 transition-all cursor-pointer">
              <span className="font-black text-white uppercase">Master Admin</span><Terminal className="text-blue-500" />
            </button>
            <button onClick={() => { setLoginType("TENANT"); setMode("LOGIN_FORM"); }} className="w-full bg-white p-6 rounded-3xl border-none flex justify-between items-center hover:scale-[1.02] transition-all cursor-pointer">
              <span className="font-black text-slate-900 uppercase">Accès Client</span><Globe className="text-slate-400" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-6">
            {!detectedTenant && <button type="button" onClick={() => setMode("CHOICE")} className="text-[10px] font-black text-blue-500 uppercase bg-transparent border-none cursor-pointer"><ChevronLeft size={14} className="inline"/> Retour</button>}
            
            {loginType === "TENANT" && !detectedTenant && (
              <select required className="w-full p-5 bg-slate-950 border-2 border-slate-800 rounded-2xl text-white font-bold outline-none appearance-none" onChange={e => setForm({...form, tenantId: e.target.value})}>
                <option value="">Sélectionner Organisation</option>
                {publicTenants.map(t => <option key={t.T_Id} value={t.T_Id}>{t.T_Name}</option>)}
              </select>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input required type="email" placeholder="EMAIL" className="w-full p-5 pl-12 bg-slate-950 border-2 border-slate-800 rounded-2xl text-white outline-none focus:border-blue-600 font-bold" onChange={e => setForm({...form, email: e.target.value})} />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input required type={showPassword ? "text" : "password"} placeholder="MOT DE PASSE" className="w-full p-5 pl-12 bg-slate-950 border-2 border-slate-800 rounded-2xl text-white outline-none focus:border-blue-600 font-bold" onChange={e => setForm({...form, password: e.target.value})} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 bg-transparent border-none cursor-pointer">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
            </div>

            <button disabled={isLoading} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all flex justify-center items-center gap-3 cursor-pointer border-none shadow-xl">
              {isLoading ? <Loader2 className="animate-spin" /> : <>DÉVERROUILLER <ArrowRight size={18}/></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() { return <Suspense fallback={<div className="bg-slate-950 min-h-screen"/>}><LoginPortal /></Suspense>; }