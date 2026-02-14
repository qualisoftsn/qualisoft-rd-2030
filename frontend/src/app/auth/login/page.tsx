/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { 
  ChevronLeft, Loader2, Lock, ShieldCheck, 
  Terminal, Globe, Mail, Eye, EyeOff, 
  Cpu, Fingerprint, Building2
} from "lucide-react";
import { signIn } from "next-auth/react";
import { matrixApi, PublicTenant } from "@/services/matrix.service";
import { toast } from "sonner";

export default function LoginPage() {
  const [mode, setMode] = useState<"CHOICE" | "MASTER_LOGIN" | "TENANT_PORTAL" | "LOADING">("LOADING");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [detectedTenant, setDetectedTenant] = useState<PublicTenant | null>(null);
  const [publicTenants, setPublicTenants] = useState<PublicTenant[]>([]);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");

  /**
   * 🛰️ ROUTAGE INTELLIGENT
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // 1. CAS SOUS-DOMAINE CLIENT (ex: sde.qualisoft.sn)
    if (parts.length > 2 && !['www', 'api', 'app', 'elite'].includes(parts[0])) {
      const subDomain = parts[0];
      matrixApi.getTenantByDomain(subDomain)
        .then((tenant) => {
          if (tenant && tenant.T_Id) {
            setDetectedTenant(tenant);
            setSelectedTenantId(tenant.T_Id);
            setMode("TENANT_PORTAL"); // Verrouillage direct
            toast.success(`Espace ${tenant.T_Name} identifié`);
          } else {
            setMode("CHOICE"); // Si domaine inconnu, on laisse le choix
          }
        })
        .catch(() => setMode("CHOICE"));
    } 
    // 2. CAS MASTER (app. ou elite.)
    else if (['app', 'elite'].includes(parts[0])) {
      setMode("MASTER_LOGIN");
    }
    // 3. CAS PAR DÉFAUT (localhost ou qualisoft.sn)
    else {
      setMode("CHOICE");
    }
  }, []);

  /**
   * 🏗️ CHARGEMENT DU REGISTRE (Si mode manuel)
   */
  useEffect(() => {
    if (mode === "TENANT_PORTAL" && !detectedTenant) {
      matrixApi.getPublicTenants().then(setPublicTenants);
    }
  }, [mode, detectedTenant]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const currentOrigin = window.location.origin;

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        tenantId: selectedTenantId || detectedTenant?.T_Id || "MATRIX",
        redirect: false,
        callbackUrl: `${currentOrigin}/dashboard`,
      });

      if (result?.error) throw new Error("Accès refusé. Vérifiez vos identifiants.");

      toast.success(`Authentification réussie.`);
      window.location.href = `${currentOrigin}/dashboard`;
      
    } catch (err: any) {
      toast.error(err.message);
      setIsLoading(false);
    }
  };

  if (mode === "LOADING") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center italic font-black uppercase tracking-widest text-[10px] text-slate-400">
        <Loader2 className="animate-spin mr-3 text-blue-600" size={18} /> Identification du nœud...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex italic bg-white font-sans relative selection:bg-blue-100 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
         <Cpu className="absolute -top-20 -left-20 text-slate-900" size={600} />
         <Fingerprint className="absolute -bottom-40 -right-20 text-blue-900" size={500} />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 lg:px-20 z-10">
        <div className="max-w-md w-full mx-auto space-y-12 py-12">
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-900 rounded-[2.5rem] mb-8 shadow-2xl relative">
              <ShieldCheck className={mode === "MASTER_LOGIN" ? "text-blue-500" : "text-green-500"} size={48} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
              {detectedTenant ? detectedTenant.T_Name : "QUALI"}<span className="text-blue-600">{detectedTenant ? "" : "SOFT"}</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] mt-4">
              {detectedTenant ? `Nœud : ${detectedTenant.T_Domain}` : "Elite RD 2030 Sovereign System"}
            </p>
          </div>

          {/* 🔀 LE RETOUR DU CHOIX (Si pas de détection auto) */}
          {mode === "CHOICE" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <button onClick={() => setMode("MASTER_LOGIN")} className="w-full bg-slate-900 text-white p-8 rounded-[3rem] flex items-center justify-between hover:bg-slate-800 transition-all cursor-pointer border-none shadow-xl group">
                <div className="text-left"><p className="text-[9px] font-black text-blue-400 uppercase tracking-widest group-hover:text-blue-300">Master</p><p className="text-xl font-black uppercase">Console Admin</p></div>
                <Terminal className="text-blue-400 group-hover:scale-110 transition-transform" size={24} />
              </button>
              <button onClick={() => setMode("TENANT_PORTAL")} className="w-full bg-white text-slate-900 p-8 rounded-[3rem] border-2 border-slate-100 flex items-center justify-between hover:border-blue-600 transition-all cursor-pointer shadow-sm group">
                <div className="text-left"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600">Client</p><p className="text-xl font-black uppercase">Accès Entreprise</p></div>
                <Globe className="text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-transform" size={24} />
              </button>
            </div>
          )}

          {/* 🔐 FORMULAIRE */}
          {(mode === "MASTER_LOGIN" || mode === "TENANT_PORTAL") && (
            <form onSubmit={handleAuth} className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              {!detectedTenant && (
                <button type="button" onClick={() => setMode("CHOICE")} className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase bg-transparent border-none cursor-pointer hover:underline mb-4"><ChevronLeft size={16} /> Changer de mode</button>
              )}
              
              <div className="space-y-4">
                {mode === "TENANT_PORTAL" && (
                  detectedTenant ? (
                    <div className="relative opacity-80 cursor-not-allowed">
                      <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600" size={20} />
                      <input type="text" value={detectedTenant.T_Name} disabled className="w-full pl-16 pr-12 py-6 bg-blue-50/50 border-2 border-blue-100 rounded-4xl font-black uppercase text-xs text-blue-900" />
                      <Lock className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
                    </div>
                  ) : (
                    <div className="relative">
                       <select required value={selectedTenantId} onChange={(e) => setSelectedTenantId(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-4xl font-black uppercase text-xs outline-none focus:border-blue-600 transition-all text-slate-900 italic appearance-none">
                        <option value="">-- SÉLECTIONNER VOTRE ORGANISATION --</option>
                        {publicTenants.map(t => <option key={t.T_Id} value={t.T_Id}>{t.T_Name}</option>)}
                      </select>
                      <Globe size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                    </div>
                  )
                )}

                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input required type="email" placeholder="EMAIL PROFESSIONNEL" autoFocus={!!detectedTenant} className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent rounded-4xl font-black text-slate-900 outline-none focus:border-blue-600 transition-all text-lg" onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input required type={showPassword ? "text" : "password"} placeholder="MOT DE PASSE" className="w-full pl-16 pr-16 py-6 bg-slate-50 border-2 border-transparent rounded-4xl font-black text-slate-900 outline-none focus:border-blue-600 transition-all text-lg" onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button disabled={isLoading} className="w-full py-7 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all flex justify-center items-center gap-4 cursor-pointer border-none active:scale-95">
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : "Accès Sécurisé"}
              </button>
            </form>
          )}

          <footer className="text-center pt-8 border-t border-slate-100 text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
            Qualisoft Elite RD 2030 Sovereign System
          </footer>
        </div>
      </div>
    </div>
  );
}