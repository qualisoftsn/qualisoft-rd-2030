/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  ChevronLeft, Loader2, Lock, ShieldCheck, 
  Terminal, Globe, ChevronRight, Mail, 
  Eye, EyeOff, Cpu, Fingerprint
} from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { matrixApi, PublicTenant } from "@/services/matrix.service";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const setLogin = useAuthStore((state) => state.setLogin);

  const [mode, setMode] = useState<"CHOICE" | "MASTER_LOGIN" | "TENANT_PORTAL">("CHOICE");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [detectedTenant, setDetectedTenant] = useState<PublicTenant | null>(null);
  const [publicTenants, setPublicTenants] = useState<PublicTenant[]>([]);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");

  /**
   * 🛰️ DÉTECTION DU NŒUD PAR L'URL
   */
  useEffect(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'elite') {
      const domain = parts[0];
      matrixApi.getTenantByDomain(domain).then((tenant) => {
        setDetectedTenant(tenant);
        setSelectedTenantId(tenant.T_Id);
        setMode("TENANT_PORTAL");
      }).catch(() => setMode("CHOICE"));
    } else if (parts[0] === 'elite') {
      setMode("MASTER_LOGIN");
    }
  }, []);

  /**
   * 🏗️ CHARGEMENT DU REGISTRE (Si mode choix manuel)
   */
  useEffect(() => {
    if (mode === "TENANT_PORTAL" && !detectedTenant) {
      matrixApi.getPublicTenants().then(setPublicTenants);
    }
  }, [mode, detectedTenant]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        tenantId: selectedTenantId || "MATRIX",
        redirect: false,
      });

      if (result?.error) throw new Error("Identifiants invalides ou nœud verrouillé.");

      toast.success(`Accès autorisé.`);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex italic bg-white font-sans relative selection:bg-blue-100 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
         <Cpu className="absolute -top-20 -left-20 text-slate-900" size={600} />
         <Fingerprint className="absolute -bottom-40 -right-20 text-blue-900" size={500} />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 lg:px-20 z-10">
        <div className="max-w-md w-full mx-auto space-y-12 py-12">
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-900 rounded-[2.5rem] mb-8 shadow-2xl">
              <ShieldCheck className="text-blue-500" size={48} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
              {detectedTenant ? detectedTenant.T_Name : "QUALI"}<span className="text-blue-600">{detectedTenant ? "" : "SOFT"}</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] mt-4">
              {detectedTenant ? `Nœud Souverain : ${detectedTenant.T_Domain}` : "Elite RD 2030"}
            </p>
          </div>

          {mode === "CHOICE" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <button onClick={() => setMode("MASTER_LOGIN")} className="w-full bg-slate-900 text-white p-8 rounded-[3rem] flex items-center justify-between hover:bg-slate-800 transition-all cursor-pointer border-none shadow-xl">
                <div className="text-left"><p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Master</p><p className="text-xl font-black uppercase">Console</p></div>
                <Terminal className="text-blue-400" size={24} />
              </button>
              <button onClick={() => setMode("TENANT_PORTAL")} className="w-full bg-white text-slate-900 p-8 rounded-[3rem] border-2 border-slate-100 flex items-center justify-between hover:border-blue-600 transition-all cursor-pointer shadow-sm">
                <div className="text-left"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Client</p><p className="text-xl font-black uppercase">Portail Entreprise</p></div>
                <Globe className="text-slate-400" size={24} />
              </button>
            </div>
          )}

          {(mode === "MASTER_LOGIN" || mode === "TENANT_PORTAL") && (
            <form onSubmit={handleAuth} className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              {!detectedTenant && (
                <button type="button" onClick={() => setMode("CHOICE")} className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase bg-transparent border-none cursor-pointer"><ChevronLeft size={16} /> Revenir</button>
              )}
              
              <div className="space-y-4">
                {mode === "TENANT_PORTAL" && !detectedTenant && (
                  <select required value={selectedTenantId} onChange={(e) => setSelectedTenantId(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-4xl font-black uppercase text-xs outline-none focus:border-blue-600 transition-all text-slate-900 italic">
                    <option value="">-- CHOISIR L&apos;ORGANISATION --</option>
                    {publicTenants.map(t => <option key={t.T_Id} value={t.T_Id}>{t.T_Name}</option>)}
                  </select>
                )}

                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input required type="email" placeholder="EMAIL PROFESSIONNEL" className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent rounded-4xl font-black text-slate-900 outline-none focus:border-blue-600 transition-all text-lg" onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input required type={showPassword ? "text" : "password"} placeholder="MOT DE PASSE" className="w-full pl-16 pr-16 py-6 bg-slate-50 border-2 border-transparent rounded-4xl font-black text-slate-900 outline-none focus:border-blue-600 transition-all text-lg" onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 bg-transparent border-none cursor-pointer">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
              </div>

              <button disabled={isLoading} className="w-full py-7 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all flex justify-center items-center gap-4 cursor-pointer border-none">
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : "Ouvrir Session Matrix"}
              </button>
            </form>
          )}

          <footer className="text-center pt-8 border-t border-slate-100 flex items-center justify-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
            Qualisoft Elite RD 2030 Sovereign System
          </footer>
        </div>
      </div>
    </div>
  );
}