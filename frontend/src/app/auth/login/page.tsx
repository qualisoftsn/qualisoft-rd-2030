"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, Building2, ChevronLeft, Crown, 
  Loader2, Mail, ShieldCheck, UserCheck, Users, Send, 
  Globe, Briefcase, Lock, KeyRound
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/core/api/api-client";
import DevLoginHelper from "@/components/dev/DevLoginHelper";

// --- INTERFACES DE DONNÉES ---
interface Tenant {
  T_Id: string;
  T_Name: string;
  T_Domain: string;
}

interface UserProfile {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email: string;
}

interface LoginResponse {
  access_token: string;
  user: {
    U_Id: string;
    U_FirstName: string;
    U_LastName: string;
    U_Email: string;
    U_Role: string;
    tenantId: string;
    U_TenantName: string;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const setLogin = useAuthStore((state) => state.setLogin);
  const logout = useAuthStore((state) => state.logout);

  // --- ÉTATS DE NAVIGATION ---
  const [step, setStep] = useState<"SELECT_TYPE" | "TENANT_SELECT" | "USER_SELECT" | "USER_PASSWORD" | "TRIAL_REQUEST">("SELECT_TYPE");
  
  // --- DONNÉES ---
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantUsers, setTenantUsers] = useState<UserProfile[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // --- FORMULAIRES ---
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [trialData, setTrialData] = useState({ companyName: "", adminEmail: "", industry: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔄 INITIALISATION : Purge Master et chargement des instances
  useEffect(() => {
    logout(); // Sécurité RD 2030 : On vide le store au montage pour éviter l'identité "Super Admin"
    const fetchTenants = async () => {
      try {
        const res = await apiClient.get<Tenant[]>("/auth/tenants/public");
        setTenants(res.data);
      } catch {
        console.error("Liaison avec le serveur Qualisoft perdue.");
      }
    };
    fetchTenants();
  }, [logout]);

  // 👥 CHARGEMENT PROFILS
  const handleTenantSelection = useCallback(async (tenant: Tenant) => {
    setIsLoading(true);
    setError("");
    setSelectedTenant(tenant);
    try {
      const res = await apiClient.get<UserProfile[]>(`/auth/tenants/${tenant.T_Id}/users`);
      setTenantUsers(res.data);
      setStep("USER_SELECT");
    } catch {
      setError("Erreur lors de l'accès aux profils de l'instance.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🔑 AUTHENTIFICATION FINALE
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await apiClient.post<LoginResponse>("/auth/login", {
        U_Email: credentials.email.toLowerCase().trim(),
        U_Password: credentials.password
      });
      setLogin({ token: res.data.access_token, user: res.data.user });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Accès refusé. Clé invalide.");
    } finally {
      setIsLoading(false);
    }
  };

  // 📧 DEMANDE D'ESSAI (Flux B2B Qualisoft)
  const handleTrialRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await apiClient.post("/auth/invite", { 
        email: trialData.adminEmail, 
        company: trialData.companyName 
      });
      setError("✅ Demande transmise. Qualisoft reviendra vers vous par email.");
      setTimeout(() => setStep("SELECT_TYPE"), 4000);
    } catch {
      setError("Échec de l'envoi. Veuillez réessayer ou contacter le support.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-blue-100 italic bg-white relative font-sans overflow-hidden">
      <DevLoginHelper />

      {/* COLONNE DE CONNEXION */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-20 bg-white z-10 overflow-y-auto">
        <div className="max-w-xl w-full mx-auto space-y-10 py-12">
          
          <div className="text-center lg:text-left">
            <img src="/QSLogo.PNG" alt="Qualisoft Elite" className="h-20 w-auto mb-8 mx-auto lg:mx-0" />
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
              QUALI<span className="text-[#2563eb]">SOFT</span> <br />
              <span className="text-2xl text-slate-400 font-bold uppercase tracking-tight">ELITE RD 2030</span>
            </h2>
          </div>

          {error && (
            <div className={`p-5 border-l-8 text-[11px] font-black uppercase rounded-r-4xl animate-shake transition-all ${error.includes("✅") ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-red-50 border-red-500 text-red-700"}`}>
              {error}
            </div>
          )}

          {/* --- STEP 1: PARCOURS --- */}
          {step === "SELECT_TYPE" && (
            <div className="grid gap-6 animate-in fade-in zoom-in-95 duration-500">
              <button onClick={() => setStep("TENANT_SELECT")} className="flex items-center gap-6 p-10 bg-slate-900 text-white rounded-[3rem] hover:bg-[#2563eb] transition-all group shadow-2xl">
                <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-blue-400 shadow-inner"><Building2 size={32} /></div>
                <div className="text-left font-black uppercase italic"><p className="text-[10px] text-blue-400 tracking-widest">Accès Client</p><p className="text-2xl tracking-tighter">Entrer</p></div>
              </button>
              <button onClick={() => setStep("TRIAL_REQUEST")} className="flex items-center gap-6 p-10 bg-slate-50 border-2 border-slate-100 rounded-[3rem] hover:border-[#2563eb] transition-all group">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-orange-500 shadow-md"><Mail size={32} /></div>
                <div className="text-left font-black uppercase italic text-slate-900"><p className="text-[10px] text-slate-400 tracking-widest">Nouveau Portail</p><p className="text-2xl tracking-tighter">Demander Essai</p></div>
              </button>
            </div>
          )}

          {/* --- STEP 2: INSTANCE --- */}
          {step === "TENANT_SELECT" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <button onClick={() => setStep("SELECT_TYPE")} className="flex items-center gap-2 text-[10px] font-black uppercase text-[#2563eb] tracking-widest"><ChevronLeft size={14} /> Retour</button>
              <h3 className="text-3xl font-black uppercase italic text-slate-900 tracking-tighter">Instances Actives</h3>
              <div className="grid gap-4 max-h-100 overflow-y-auto pr-2 custom-scrollbar">
                {tenants.map(t => (
                  <button key={t.T_Id} onClick={() => handleTenantSelection(t)} className="flex items-center justify-between p-7 bg-slate-50 border rounded-4xl hover:border-[#2563eb] transition-all group">
                    <span className="font-black text-slate-800 uppercase text-lg italic tracking-tight">{t.T_Name}</span>
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform text-[#2563eb]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* --- STEP 3: PROFIL --- */}
          {step === "USER_SELECT" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <button onClick={() => setStep("TENANT_SELECT")} className="flex items-center gap-2 text-[10px] font-black uppercase text-[#2563eb] tracking-widest"><ChevronLeft size={14} /> Instances</button>
              <h3 className="text-3xl font-black uppercase italic text-slate-900 tracking-tighter">Votre Profil</h3>
              <div className="grid gap-3">
                {tenantUsers.map(u => (
                  <button key={u.U_Id} onClick={() => { setCredentials({...credentials, email: u.U_Email}); setStep("USER_PASSWORD"); }} className="flex items-center gap-4 p-6 bg-slate-900 text-white rounded-4xl hover:bg-[#2563eb] transition-all group">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-blue-400 shadow-inner"><Users size={20} /></div>
                    <div className="text-left font-black uppercase"><p className="text-sm italic">{u.U_FirstName} {u.U_LastName}</p><p className="text-[10px] text-blue-300 tracking-tight">{u.U_Email}</p></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* --- STEP 4: PASS --- */}
          {step === "USER_PASSWORD" && (
            <form onSubmit={handleLogin} className="space-y-6 animate-in zoom-in-95 duration-500">
              <button onClick={() => setStep("USER_SELECT")} className="flex items-center gap-2 text-[10px] font-black uppercase text-[#2563eb] tracking-widest"><ChevronLeft size={14} /> Autre profil</button>
              <div className="p-6 bg-blue-50 border-2 border-blue-100 rounded-[2.5rem] flex items-center gap-5">
                <UserCheck size={28} className="text-[#2563eb]" />
                <div className="flex flex-col font-black uppercase italic tracking-tighter text-slate-900 leading-tight">
                  <span className="text-[10px] text-slate-400">Accès sécurisé pour</span>
                  <span className="text-xl tracking-tighter truncate max-w-62.5">{credentials.email}</span>
                </div>
              </div>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="password" required autoFocus placeholder="MOT DE PASSE" className="w-full pl-16 pr-6 py-6 bg-slate-50 border rounded-4xl font-black text-sm outline-none focus:border-[#2563eb] transition-all" onChange={e => setCredentials({...credentials, password: e.target.value})} />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-7 bg-slate-900 text-white rounded-4xl font-black uppercase tracking-[0.3em] flex justify-center items-center gap-4 shadow-3xl hover:bg-[#2563eb] transition-all">
                {isLoading ? <Loader2 className="animate-spin" /> : "AUTHENTIFIER"}
              </button>
            </form>
          )}

          {/* --- STEP 5: TRIAL --- */}
          {step === "TRIAL_REQUEST" && (
            <form onSubmit={handleTrialRequest} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <button onClick={() => setStep("SELECT_TYPE")} className="flex items-center gap-2 text-[10px] font-black uppercase text-[#2563eb] tracking-widest"><ChevronLeft size={14} /> Annuler</button>
              <h3 className="text-3xl font-black uppercase italic text-slate-900 tracking-tighter">Nouveau Portail</h3>
              <div className="grid gap-4">
                <div className="relative">
                   <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input required placeholder="NOM ORGANISATION" className="w-full pl-16 pr-6 py-5 bg-slate-50 border rounded-3xl font-black text-sm outline-none focus:border-[#2563eb]" onChange={e => setTrialData({...trialData, companyName: e.target.value})} />
                </div>
                <div className="relative">
                   <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input required type="email" placeholder="EMAIL PROFESSIONNEL" className="w-full pl-16 pr-6 py-5 bg-slate-50 border rounded-3xl font-black text-sm outline-none focus:border-[#2563eb]" onChange={e => setTrialData({...trialData, adminEmail: e.target.value})} />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-7 bg-[#2563eb] text-white rounded-4xl font-black uppercase tracking-[0.3em] flex justify-center items-center gap-4 shadow-2xl hover:bg-slate-900 transition-all">
                {isLoading ? <Loader2 className="animate-spin" /> : <>ENVOYER LA DEMANDE <Send size={20}/></>}
              </button>
            </form>
          )}

          <div className="pt-8 border-t border-slate-100 flex flex-col items-center gap-4 text-[10px] font-black text-slate-300 uppercase tracking-widest italic text-center">
            <Crown size={14} className="text-amber-400" /> Qualisoft Multi-Tenant Core v2.0 - Sénégal
          </div>
        </div>
      </div>

      {/* SECTION VISUELLE ÉLITE */}
      <div className="hidden lg:flex flex-1 bg-[#0B0F1A] relative items-center justify-center p-20 overflow-hidden text-center text-white">
        <div className="relative z-10 space-y-10">
          <div className="inline-flex items-center gap-4 px-8 py-3 bg-[#2563eb]/10 border border-[#2563eb]/20 text-[#2563eb] text-[11px] font-black uppercase tracking-[0.5em] rounded-full backdrop-blur-xl shadow-lg shadow-blue-500/10"><ShieldCheck size={18} /> Certifié RD 2030</div>
          <h3 className="text-7xl font-black italic uppercase leading-none tracking-tighter">L&apos;excellence <br /> <span className="text-[#2563eb]">n&apos;attend pas.</span></h3>
          <p className="max-w-md mx-auto text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] leading-relaxed">Propulser la gouvernance, les risques et la conformité au cœur de la performance africaine.</p>
        </div>
        <div className="absolute top-[-10%] right-[-10%] w-150 h-150 bg-[#2563eb]/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-100 h-100 bg-blue-900/20 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}