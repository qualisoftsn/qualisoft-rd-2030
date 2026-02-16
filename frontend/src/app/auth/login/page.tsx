/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { 
  ChevronLeft, Loader2, Lock, ShieldCheck, Terminal, 
  Globe, Mail, Eye, EyeOff, ArrowRight, Building2, 
  Cpu, Fingerprint 
} from "lucide-react";
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

  // 1. 🛰️ PROTOCOLE D'IDENTIFICATION TERRITORIALE
  useEffect(() => {
    const identifyNode = async () => {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      
      // Logique Middleware V3 : Domaines réservés vs Tenants
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
        } catch (e) { console.warn("Node not identified"); }
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

  // 2. 🏛️ RÉCUPÉRATION DU REGISTRE POUR CHOIX MANUEL
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

      if (result?.error) throw new Error("Accès refusé. Accréditations invalides.");
      
      toast.success("Authentification scellée.", { id: tid });
      // Redirection forcée pour purger le cache de domaine OVH
      window.location.href = loginType === "MASTER" ? "/admin/matrix" : "/dashboard";
    } catch (err: any) {
      toast.error(err.message, { id: tid });
      setIsLoading(false);
    }
  };

  if (mode === "LOADING") return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center italic text-slate-500 text-[10px] font-black uppercase tracking-widest">
      <Loader2 className="animate-spin mb-4" /> Node identification...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 italic font-sans relative overflow-hidden">
      {/* BACKGROUND DECOR */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Cpu className="absolute -top-20 -left-20 text-slate-700" size={600} />
        <Fingerprint className="absolute -bottom-40 -right-20 text-blue-900" size={500} />
      </div>

      <div className="w-full max-w-md bg-slate-900/40 border-2 border-slate-800 rounded-[3rem] p-10 shadow-2xl backdrop-blur-xl relative z-10 animate-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex p-5 bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] mb-6 shadow-2xl">
            {/* ✅ FIX BUILD : className unique fusionnée */}
            <ShieldCheck size={48} className={`mx-auto mb-4 ${loginType === "MASTER" ? "text-blue-500" : "text-emerald-500"}`} />
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
            {detectedTenant ? detectedTenant.T_Name : "QUALI"}<span className="text-blue-600">{detectedTenant ? "" : "SOFT"}</span>
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3">
            {detectedTenant ? `Nœud : ${detectedTenant.T_Domain}` : "Elite RD 2030 Sovereign"}
          </p>
        </div>

        {mode === "CHOICE" ? (
          <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-500">
            <button 
              onClick={() => { setLoginType("MASTER"); setMode("LOGIN_FORM"); }} 
              className="w-full bg-slate-900 p-8 rounded-3xl border-2 border-slate-800 flex justify-between items-center hover:border-blue-600 transition-all cursor-pointer group shadow-xl"
            >
              <div className="text-left font-black uppercase">
                <p className="text-[9px] text-blue-500 tracking-widest">Master Access</p>
                <p className="text-xl text-white italic">Master Admin</p>
              </div>
              <Terminal className="text-blue-500 group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={() => { setLoginType("TENANT"); setMode("LOGIN_FORM"); }} 
              className="w-full bg-white p-8 rounded-3xl border-none flex justify-between items-center hover:scale-[1.02] transition-all cursor-pointer group shadow-xl"
            >
              <div className="text-left font-black uppercase">
                <p className="text-[9px] text-slate-400 tracking-widest">Portal Access</p>
                <p className="text-xl text-slate-900 italic">Client Access</p>
              </div>
              <Globe className="text-slate-400 group-hover:text-blue-600 transition-all" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            {!detectedTenant && (
              <button 
                type="button" 
                onClick={() => setMode("CHOICE")} 
                className="text-[10px] font-black text-blue-500 uppercase bg-transparent border-none cursor-pointer flex items-center gap-2 hover:text-white transition-colors"
              >
                <ChevronLeft size={16} /> Revenir au choix
              </button>
            )}

            <div className="space-y-4">
              {loginType === "TENANT" && (
                detectedTenant ? (
                  <div className="relative">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                    <input disabled value={detectedTenant.T_Name} className="w-full p-5 pl-14 bg-blue-900/10 border-2 border-blue-900/20 rounded-2xl text-blue-400 font-black uppercase text-xs italic" />
                  </div>
                ) : (
                  <select 
                    required 
                    className="w-full p-5 bg-slate-950 border-2 border-slate-800 rounded-2xl text-white font-bold italic outline-none cursor-pointer appearance-none" 
                    onChange={e => setForm({...form, tenantId: e.target.value})}
                  >
                    <option value="">Sélectionner Organisation</option>
                    {publicTenants.map(t => <option key={t.T_Id} value={t.T_Id}>{t.T_Name}</option>)}
                  </select>
                )
              )}

              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input required type="email" placeholder="EMAIL PROFESSIONNEL" className="w-full p-5 pl-14 bg-slate-950 border-2 border-slate-800 rounded-2xl text-white font-bold outline-none focus:border-blue-600 transition-all italic" onChange={e => setForm({...form, email: e.target.value})} />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input required type={showPassword ? "text" : "password"} placeholder="MOT DE PASSE" className="w-full p-5 pl-14 pr-14 bg-slate-950 border-2 border-slate-800 rounded-2xl text-white font-bold outline-none focus:border-blue-600 italic" onChange={e => setForm({...form, password: e.target.value})} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-600 cursor-pointer hover:text-white transition-colors">{showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
              </div>
            </div>

            <button disabled={isLoading} className="w-full py-7 bg-blue-600 text-white rounded-4xl font-black uppercase text-xs tracking-[0.3em] hover:bg-blue-500 transition-all border-none cursor-pointer shadow-xl active:scale-95 flex justify-center items-center gap-4 group">
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>DÉVERROUILLER L&apos;ACCÈS <ArrowRight className="group-hover:translate-x-2 transition-transform" /></>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() { return <Suspense fallback={<div className="bg-slate-950 min-h-screen" />}><LoginPortal /></Suspense>; }