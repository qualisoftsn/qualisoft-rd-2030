/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { 
  Loader2, Lock, ShieldCheck, 
  Terminal, Globe, Mail, Eye, EyeOff, 
  Cpu, Fingerprint, Building2
} from "lucide-react";
import { signIn } from "next-auth/react";
import { matrixApi, PublicTenant } from "@/services/matrix.service";
import { toast } from "sonner";

export default function LoginPage() {
  // --- ÉTATS DE NAVIGATION ---
  const [view, setView] = useState<"MASTER_CONSOLE" | "CLIENT_PORTAL" | "LOADING">("LOADING");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // --- DONNÉES D'IDENTITÉ ---
  const [detectedTenant, setDetectedTenant] = useState<PublicTenant | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * 🛰️ ROUTAGE SOUVERAIN (AUTO-PILOT)
   * Détermine le chemin selon le sous-domaine de l'URL
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // Chemin 1 : QUALISOFT MASTER (app.qualisoft.sn ou elite.qualisoft.sn)
    if (parts[0] === 'app' || parts[0] === 'elite') {
      setView("MASTER_CONSOLE");
      return;
    }

    // Chemin 2 : CONNEXION UTILISATEUR (sde.qualisoft.sn, senelec.qualisoft.sn, etc.)
    if (parts.length > 2 && !['www', 'api', 'app', 'elite'].includes(parts[0])) {
      const subDomain = parts[0];
      
      matrixApi.getTenantByDomain(subDomain)
        .then((tenant) => {
          if (tenant && tenant.T_Id) {
            setDetectedTenant(tenant);
            setView("CLIENT_PORTAL");
            toast.success(`Portail ${tenant.T_Name} Identifié`);
          } else {
            // Si le sous-domaine n'existe pas dans la Matrix
            window.location.href = "https://qualisoft.sn"; 
          }
        })
        .catch(() => {
          setView("MASTER_CONSOLE"); // Backup sur console si erreur
        });
    } else {
      // Cas par défaut ou localhost
      setView("MASTER_CONSOLE");
    }
  }, []);

  /**
   * 🔐 AUTHENTIFICATION SOUVERAINE
   */
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const currentOrigin = window.location.origin;

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        // Si Client Portal : on utilise l'ID détecté. Si Master : on utilise "MATRIX"
        tenantId: detectedTenant?.T_Id || "MATRIX",
        redirect: false,
        callbackUrl: `${currentOrigin}/dashboard`,
      });

      if (result?.error) throw new Error("Accès refusé. Vérifiez vos identifiants.");

      toast.success(`Accès autorisé.`);
      window.location.href = `${currentOrigin}/dashboard`;
      
    } catch (err: any) {
      toast.error(err.message);
      setIsLoading(false);
    }
  };

  if (view === "LOADING") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex italic bg-white font-sans relative selection:bg-blue-100 overflow-hidden">
      
      {/* 🎨 FOND SYSTÈME */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
         <Cpu className="absolute -top-20 -left-20 text-slate-900" size={600} />
         <Fingerprint className="absolute -bottom-40 -right-20 text-blue-900" size={500} />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 lg:px-20 z-10">
        <div className="max-w-md w-full mx-auto space-y-10 py-12">
          
          {/* 🏷️ HEADER DÉDIÉ */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-900 rounded-[2.5rem] mb-8 shadow-2xl relative">
              {view === "MASTER_CONSOLE" ? (
                <Terminal className="text-blue-500" size={40} />
              ) : (
                <ShieldCheck className="text-green-500" size={48} />
              )}
            </div>
            
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
              {view === "MASTER_CONSOLE" ? (
                <>QUALI<span className="text-blue-600">SOFT</span></>
              ) : (
                detectedTenant?.T_Name
              )}
            </h1>
            
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] mt-4">
              {view === "MASTER_CONSOLE" ? "CONSOLE D'ADMINISTRATION" : "PORTAL ORGANISATIONNEL"}
            </p>
          </div>

          {/* 🔐 FORMULAIRE UNIQUE (SÉPARÉ PAR LOGIQUE) */}
          <form onSubmit={handleAuth} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            
            <div className="space-y-4">
              
              {/* AFFICHAGE DU TENANT SI CHEMIN CLIENT */}
              {view === "CLIENT_PORTAL" && detectedTenant && (
                <div className="relative opacity-90 group">
                  <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600" size={20} />
                  <div className="w-full pl-16 pr-6 py-6 bg-blue-50 border-2 border-blue-100 rounded-4xl font-black uppercase text-xs text-blue-900 flex items-center">
                    {detectedTenant.T_Name}
                    <Lock className="ml-auto text-blue-300" size={14} />
                  </div>
                </div>
              )}

              {/* EMAIL */}
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  required 
                  type="email" 
                  placeholder="IDENTIFIANT (EMAIL)" 
                  className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent rounded-4xl font-black text-slate-900 outline-none focus:border-blue-600 transition-all text-lg" 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>

              {/* MOT DE PASSE */}
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  required 
                  type={showPassword ? "text" : "password"} 
                  placeholder="MOT DE PASSE" 
                  className="w-full pl-16 pr-16 py-6 bg-slate-50 border-2 border-transparent rounded-4xl font-black text-slate-900 outline-none focus:border-blue-600 transition-all text-lg" 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              disabled={isLoading} 
              className="w-full py-7 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all flex justify-center items-center gap-4 cursor-pointer border-none active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : "ENTRER DANS LE NOYAU"}
            </button>
          </form>

          <footer className="text-center pt-8 border-t border-slate-100 flex items-center justify-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
            {view === "MASTER_CONSOLE" ? "Elite RD 2030 Master System" : `Qualisoft Nœud : ${detectedTenant?.T_Domain}`}
          </footer>
        </div>
      </div>
    </div>
  );
}