/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { matrixApi, PublicTenant } from "@/services/matrix.service";
import {
  ArrowRight, Building2, ChevronLeft, Cpu, Eye, EyeOff, Fingerprint,
  Globe, Loader2, Lock, Mail, ShieldCheck, Terminal,
} from "lucide-react";
import { signIn } from "next-auth/react";
import React, { Suspense, useEffect, useState } from "react";
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
    const identifyAndLoad = async () => {
      const hostname = window.location.hostname; // ex: pad.qualisoft.sn
      const parts = hostname.split(".");
      const slug = parts[0].toLowerCase();

      try {
        const registry = await matrixApi.getPublicTenants();
        setPublicTenants(registry || []);

        const reserved = ["www", "api", "app", "elite", "localhost", "matrix"];

        // 🎯 DÉTECTION AUTOMATIQUE PAR SOUS-DOMAINE
        if (parts.length > 2 && !reserved.includes(slug)) {
          const match = registry.find((t: PublicTenant) => t.T_Domain.toLowerCase() === slug);
          if (match) {
            setDetectedTenant(match);
            setForm((prev) => ({ ...prev, tenantId: match.T_Id }));
            setLoginType("TENANT");
            setMode("LOGIN_FORM");
            return;
          }
        }
        setMode("CHOICE");
      } catch (error) {
        setMode("CHOICE");
      }
    };
    identifyAndLoad();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginType === "TENANT" && !form.tenantId) {
      toast.error("Veuillez sélectionner une organisation.");
      return;
    }

    setIsLoading(true);
    const tid = toast.loading("Vérification des accréditations...");

    try {
      const result = await signIn("credentials", {
        email: form.email.toLowerCase().trim(),
        password: form.password,
        tenantId: loginType === "MASTER" ? "MATRIX" : form.tenantId,
        redirect: false,
      });

      if (result?.error) throw new Error("Identifiants invalides.");

      toast.success("Accès autorisé.", { id: tid });

      // 🚩 REDIRECTION TERRITORIALE SÉCURISÉE
      if (loginType === "MASTER") {
        window.location.href = "/admin/matrix";
      } else {
        const selected = publicTenants.find(t => t.T_Id === form.tenantId);
        const targetSlug = selected?.T_Domain.toLowerCase() || "app";
        const currentHostname = window.location.hostname;

        // On nettoie l'URL pour éviter les doublons .qualisoft.sn.qualisoft.sn
        if (currentHostname.startsWith(targetSlug)) {
          window.location.href = "/dashboard";
        } else {
          // On reconstruit proprement sans concaténation aveugle
          window.location.href = `https://${targetSlug}.qualisoft.sn/dashboard`;
        }
      }
    } catch (err: any) {
      toast.error(err.message, { id: tid });
      setIsLoading(false);
    }
  };

  if (mode === "LOADING") return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center italic text-slate-500 text-[10px] font-black uppercase">
      <Loader2 className="animate-spin mb-4 text-blue-600" /> Identification du nœud...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 italic font-sans relative overflow-hidden">
      <div className="w-full max-w-md bg-slate-900/40 border-2 border-slate-800 rounded-[3rem] p-10 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex p-5 bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] mb-6">
            <ShieldCheck size={48} className={loginType === "MASTER" ? "text-blue-500" : "text-emerald-500"} />
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            {detectedTenant ? detectedTenant.T_Name : "QUALI"}<span className="text-blue-600">{detectedTenant ? "" : "SOFT"}</span>
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3">
            {detectedTenant ? `SOUVERAINETÉ : ${detectedTenant.T_Domain}` : "Elite RD 2030 Sovereign"}
          </p>
        </div>

        {mode === "CHOICE" ? (
          <div className="space-y-4">
            <button onClick={() => { setLoginType("MASTER"); setMode("LOGIN_FORM"); }} className="w-full bg-slate-900 p-8 rounded-3xl border-2 border-slate-800 flex justify-between items-center hover:border-blue-600 transition-all cursor-pointer group">
              <div className="text-left font-black uppercase"><p className="text-[9px] text-blue-500">Master Access</p><p className="text-xl text-white italic">Admin Matrix</p></div>
              <Terminal className="text-blue-500" />
            </button>
            <button onClick={() => { setLoginType("TENANT"); setMode("LOGIN_FORM"); }} className="w-full bg-white p-8 rounded-3xl border-none flex justify-between items-center hover:scale-[1.02] transition-all cursor-pointer shadow-xl group">
              <div className="text-left font-black uppercase"><p className="text-[9px] text-slate-400">Portal Access</p><p className="text-xl text-slate-900 italic">Client Access</p></div>
              <Globe className="text-slate-400 group-hover:text-blue-600" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-6">
            {!detectedTenant && (
              <button type="button" onClick={() => setMode("CHOICE")} className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-2 bg-transparent border-none cursor-pointer">
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
                  <div className="relative">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <select required className="w-full p-5 pl-14 bg-slate-950 border-2 border-slate-800 rounded-2xl text-white font-bold italic outline-none cursor-pointer appearance-none"
                      value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })}>
                      <option value="">Sélectionner Organisation</option>
                      {publicTenants.map((t) => <option key={t.T_Id} value={t.T_Id}>{t.T_Name}</option>)}
                    </select>
                  </div>
                )
              )}
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-600" size={18} />
                <input required type="email" placeholder="EMAIL" className="w-full p-5 pl-14 bg-slate-950 border-2 border-slate-800 rounded-2xl text-white font-bold outline-none italic"
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-600" size={18} />
                <input required type={showPassword ? "text" : "password"} placeholder="MOT DE PASSE" className="w-full p-5 pl-14 pr-14 bg-slate-950 border-2 border-slate-800 rounded-2xl text-white font-bold outline-none italic"
                  onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-600">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button disabled={isLoading} className="w-full py-7 bg-blue-600 text-white rounded-4xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-blue-500 transition-all flex justify-center items-center gap-4">
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : <>DÉVERROUILLER L&apos;ACCÈS <ArrowRight /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-slate-950 min-h-screen flex items-center justify-center text-white italic text-xs uppercase font-black">Initialisation de la Matrice...</div>}>
      <LoginPortal />
    </Suspense>
  );
}