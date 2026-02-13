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
  
  // 🧠 Cerveau du Multi-Tenant
  const [detectedTenant, setDetectedTenant] = useState<PublicTenant | null>(null);
  const [publicTenants, setPublicTenants] = useState<PublicTenant[]>([]);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");

  /**
   * 🛰️ AUTO-PILOT : DÉTECTION DU TERRITOIRE NUMÉRIQUE
   * Analyse l'URL pour savoir si on est sur un territoire conquis (SDE, Senelec...)
   */
  useEffect(() => {
    // Vérification de sécurité pour le rendu serveur
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname;
    // Ex: sde.qualisoft.sn -> parts[0] = sde
    const parts = hostname.split('.');
    
    // Ignorer 'www', 'elite' (Master) ou 'localhost' sans sous-domaine
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'elite' && parts[0] !== 'app') {
      const domain = parts[0];
      setIsLoading(true); // Petit effet de chargement pendant l'identification
      
      matrixApi.getTenantByDomain(domain)
        .then((tenant) => {
          if (tenant && tenant.T_Id) {
            setDetectedTenant(tenant);
            setSelectedTenantId(tenant.T_Id);
            setMode("TENANT_PORTAL"); // 🚀 Passage direct au login
            toast.success(`Bienvenue sur l'espace ${tenant.T_Name}`);
          }
        })
        .catch(() => {
          // Si le sous-domaine n'existe pas, on reste sur le choix
          setMode("CHOICE");
        })
        .finally(() => setIsLoading(false));
    } else if (parts[0] === 'elite' || parts[0] === 'app') {
      setMode("MASTER_LOGIN");
    }
  }, []);

  /**
   * 🏗️ CHARGEMENT DU REGISTRE (Uniquement si on n'est pas sur un sous-domaine dédié)
   */
  useEffect(() => {
    if (mode === "TENANT_PORTAL" && !detectedTenant) {
      matrixApi.getPublicTenants().then(setPublicTenants);
    }
  }, [mode, detectedTenant]);

  /**
   * 🔐 AUTHENTIFICATION SOUVERAINE
   * Gère la connexion et maintient l'utilisateur sur son territoire (Sous-domaine)
   */
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 1️⃣ Capturer le territoire actuel (ex: https://sde.qualisoft.sn)
    // Cela nous permet de dire à NextAuth où revenir exactement.
    const currentOrigin = window.location.origin;

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        tenantId: selectedTenantId || "MATRIX",
        redirect: false, // 🚫 On désactive la redirection auto de NextAuth
        callbackUrl: `${currentOrigin}/dashboard`, // 🎯 On cible explicitement ce sous-domaine
      });

      if (result?.error) throw new Error("Accès refusé. Vérifiez vos identifiants.");

      toast.success(`Authentification réussie.`);

      // 2️⃣ Navigation FORCÉE (Hard Redirect)
      // On utilise window.location au lieu de router.push pour garantir 
      // qu'on ne repart pas vers le domaine principal par accident.
      window.location.href = `${currentOrigin}/dashboard`;
      
    } catch (err: any) {
      toast.error(err.message);
      setIsLoading(false); // On ne stoppe le chargement qu'en cas d'erreur
    }
  };

  return (
    <div className="min-h-screen flex italic bg-white font-sans relative selection:bg-blue-100 overflow-hidden">
      {/* 🎨 BACKGROUND FUTURISTE */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
         <Cpu className="absolute -top-20 -left-20 text-slate-900" size={600} />
         <Fingerprint className="absolute -bottom-40 -right-20 text-blue-900" size={500} />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 lg:px-20 z-10">
        <div className="max-w-md w-full mx-auto space-y-12 py-12">
          
          {/* 🏷️ HEADER DYNAMIQUE */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-900 rounded-[2.5rem] mb-8 shadow-2xl relative">
              <ShieldCheck className="text-blue-500" size={48} />
              {detectedTenant && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest border-2 border-white">
                  Sécurisé
                </div>
              )}
            </div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
              {detectedTenant ? detectedTenant.T_Name : "QUALI"}<span className="text-blue-600">{detectedTenant ? "" : "SOFT"}</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] mt-4">
              {detectedTenant ? `Nœud Souverain : ${detectedTenant.T_Domain}` : "Elite RD 2030"}
            </p>
          </div>

          {/* 🔀 MODE SÉLECTION (Seulement si pas de sous-domaine détecté) */}
          {mode === "CHOICE" && !detectedTenant && (
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

          {/* 🔐 FORMULAIRE DE LOGIN */}
          {(mode === "MASTER_LOGIN" || mode === "TENANT_PORTAL") && (
            <form onSubmit={handleAuth} className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              
              {/* BOUTON RETOUR (Caché si le tenant est détecté automatiquement) */}
              {!detectedTenant && (
                <button type="button" onClick={() => setMode("CHOICE")} className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase bg-transparent border-none cursor-pointer hover:underline"><ChevronLeft size={16} /> Changer de mode</button>
              )}
              
              <div className="space-y-4">
                
                {/* 🏢 CHAMP ORGANISATION : INTELLIGENT */}
                {mode === "TENANT_PORTAL" && (
                  detectedTenant ? (
                    /* CAS 1 : VERROUILLÉ (Sous-domaine détecté) */
                    <div className="relative opacity-80 cursor-not-allowed" title="Organisation verrouillée par le domaine">
                      <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600" size={20} />
                      <input 
                        type="text" 
                        value={detectedTenant.T_Name} 
                        disabled 
                        className="w-full pl-16 pr-12 py-6 bg-blue-50/50 border-2 border-blue-100 rounded-4xl font-black uppercase text-xs text-blue-900"
                      />
                      <Lock className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
                    </div>
                  ) : (
                    /* CAS 2 : LISTE DÉROULANTE (Accès générique) */
                    <div className="relative">
                       <select 
                        required 
                        value={selectedTenantId} 
                        onChange={(e) => setSelectedTenantId(e.target.value)} 
                        className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-4xl font-black uppercase text-xs outline-none focus:border-blue-600 transition-all text-slate-900 italic appearance-none"
                      >
                        <option value="">-- SÉLECTIONNER VOTRE ORGANISATION --</option>
                        {publicTenants.map(t => <option key={t.T_Id} value={t.T_Id}>{t.T_Name}</option>)}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Globe size={20} className="text-slate-400"/>
                      </div>
                    </div>
                  )
                )}

                {/* 📧 EMAIL */}
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    required 
                    type="email" 
                    placeholder="EMAIL PROFESSIONNEL" 
                    autoFocus={!!detectedTenant} // Focus auto si l'org est déjà remplie
                    className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent rounded-4xl font-black text-slate-900 outline-none focus:border-blue-600 transition-all text-lg" 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>

                {/* 🔑 PASSWORD */}
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    placeholder="MOT DE PASSE" 
                    className="w-full pl-16 pr-16 py-6 bg-slate-50 border-2 border-transparent rounded-4xl font-black text-slate-900 outline-none focus:border-blue-600 transition-all text-lg" 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 bg-transparent border-none cursor-pointer hover:text-blue-600 transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button disabled={isLoading} className="w-full py-7 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all flex justify-center items-center gap-4 cursor-pointer border-none active:scale-95">
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : "Connexion Sécurisée"}
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