/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { ChevronLeft, Loader2, Lock, ShieldCheck, Terminal, Globe, Mail, Eye, EyeOff, ArrowRight, Building2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { matrixApi, PublicTenant } from "@/services/matrix.service";
import { toast } from "sonner";

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
        } catch (e) { console.warn("Node not found"); }
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
    try {
      const result = await signIn("credentials", {
        email: form.email.toLowerCase().trim(),
        password: form.password,
        tenantId: form.tenantId,
        redirect: false,
      });
      if (result?.error) throw new Error("Accès refusé.");
      // ⚡ FORCE REDIRECT POUR SCELLER LA SESSION
      window.location.href = loginType === "MASTER" ? "/admin/matrix" : "/dashboard";
    } catch (err: any) {
      toast.error(err.message);
      setIsLoading(false);
    }
  };

  if (mode === "LOADING") return <div className="min-h-screen bg-slate-950 flex items-center justify-center italic text-slate-500 text-[10px] uppercase font-black tracking-widest"><Loader2 className="animate-spin mr-3" /> Identification du nœud...</div>;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 italic font-sans selection:bg-blue-500/30">
      <div className="w-full max-w-md bg-slate-900/40 border-2 border-slate-800 rounded-[3rem] p-10 shadow-2xl backdrop-blur-xl animate-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-slate-900 border-2 border-slate-800 rounded-3xl mb-6 shadow-2xl group hover:border-blue-500 transition-all duration-500">
            <ShieldCheck className={loginType === "MASTER" ? "text-blue-500" : "text-emerald-500"} size={40} />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
            {detectedTenant ? detectedTenant.T_Name : "QUALI"}<span className="text-blue-600">{detectedTenant ? "" : "SOFT"}</span>
          </h1>
        </div>

        {mode === "CHOICE" ? (
          <div className="space-y-4 animate-in slide-in-from-bottom-4">
            <button onClick={() => { setLoginType("MASTER"); setMode("LOGIN_FORM"); }} className="w-full bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-800 flex justify-between items-center hover:border-blue-600 transition-all cursor-pointer group">
              <div className="text-left"><p className="text-[9px] font-black text-blue-500 uppercase tracking-widest group-hover:text-blue-400">Master Access</p><p className="text-xl font-black text-white uppercase italic">Console Admin</p></div>
              <Terminal className="text-blue-500" />
            </button>
            <button onClick={() => { setLoginType("TENANT"); setMode("LOGIN_FORM"); }} className="w-full bg-white p-8 rounded-[2.5rem] border-none flex justify-between items-center hover:scale-[1.02] transition-all cursor-pointer shadow-xl group">
              <div className="text-left"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600">Client Access</p><p className="text-xl font-black text-slate-900 uppercase italic">Portail Entreprise</p></div>
              <Globe className="text-slate-400 group-hover:text-blue-600" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-6 animate-in slide-in-from-right-4">
            {!detectedTenant && <button type="button" onClick={() => setMode("CHOICE")} className="text-[10px] font-black text-blue-500 uppercase bg-transparent border-none cursor-pointer flex items-center gap-2"><ChevronLeft size={14} /> Revenir au choix</button>}
            {loginType === "TENANT" && (
              detectedTenant ? (
                <div className="relative"><Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600" size={18} /><input disabled value={detectedTenant.T_Name} className="w-full p-5 pl-12 bg-blue-900/10 border-2 border-blue-900/20 rounded-2xl font-black uppercase text-xs text-blue-400 italic" /></div>
              ) : (
                <select required className="w-full p-5 bg-slate-950 border-2 border-slate-800 rounded-2xl text-white font-bold outline-none appearance-none italic" onChange={e => setForm({...form, tenantId: e.target.value})}>
                  <option value="">-- Sélectionner Organisation --</option>
                  {publicTenants.map(t => <option key={t.T_Id} value={t.T_Id}>{t.T_Name}</option>)}
                </select>
              )
            )}
            <div className="relative"><Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} /><input required type="email" placeholder="EMAIL PROFESSIONNEL" className="w-full p-5 pl-12 bg-slate-950 border-2 border-slate-800 rounded-2xl text-white outline-none focus:border-blue-600 font-bold" onChange={e => setForm({...form, email: e.target.value})} /></div>
            <div className="relative"><Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} /><input required type={showPassword ? "text" : "password"} placeholder="PASSWORD" className="w-full p-5 pl-12 bg-slate-950 border-2 border-slate-800 rounded-2xl text-white outline-none focus:border-blue-600 font-bold" onChange={e => setForm({...form, password: e.target.value})} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 bg-transparent border-none cursor-pointer">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
            <button disabled={isLoading} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all flex justify-center items-center gap-3 cursor-pointer border-none shadow-xl active:scale-95">{isLoading ? <Loader2 className="animate-spin" /> : <>DÉVERROUILLER L&apos;ACCÈS <ArrowRight size={18}/></>}</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() { return <Suspense fallback={<div className="bg-slate-950 min-h-screen"/>}><LoginPortal /></Suspense>; }