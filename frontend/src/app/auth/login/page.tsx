/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  Lock,
  ShieldCheck,
  X,
  Building2,
  ChevronLeft,
  UserCheck,
} from "lucide-react";
import { AuthUser, useAuthStore } from "@/store/authStore";
import apiClient from "@/core/api/api-client";
import DevLoginHelper from "@/components/dev/DevLoginHelper";

interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export default function LoginPage() {
  // --- ÉTATS DE NAVIGATION ---
  const [step, setStep] = useState<"TENANT" | "USER_SELECT" | "PASSWORD">("TENANT");
  
  // --- DONNÉES SÉLECTIONNÉES ---
  const [selectedTenant, setSelectedTenant] = useState<{ id: string; name: string } | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<string>("");

  // --- ÉTATS FORMULAIRE ---
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // --- ÉTATS MODALE INVITATION ---
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const [, setInviteStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");

  const router = useRouter();
  const setLogin = useAuthStore((state) => state.setLogin);

  // 📝 Liste des Tenants (Synchronisée avec ton nouveau SEED)
  const availableTenants = [
    { id: "ELITE-CORE-001", name: "EXCELLENCE INDUSTRIES" },
    { id: "bcfea455-ee5c-4868-8f5b-53f4c4c2500e", name: "Qualisoft Corporate" },
    { id: "tenant-senelec-id", name: "SENELEC SA" },
  ];

  // 👥 Liste des Users par Tenant (Simulée pour le choix, normalement via une API publique/dev)
  const usersByTenant: Record<string, string[]> = {
    "ELITE-CORE-001": ["ab.thiongane@qualisoft.sn", "admin@excellence.sn"],
    "bcfea455-ee5c-4868-8f5b-53f4c4c2500e": ["admin@qualisoft.sn"],
    "tenant-senelec-id": ["contact@senelec.sn"],
  };

  const handleSelectTenant = (tenant: { id: string; name: string }) => {
    setSelectedTenant(tenant);
    setStep("USER_SELECT");
    setError("");
  };

  const handleSelectUser = (email: string) => {
    setSelectedEmail(email);
    setStep("PASSWORD");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !selectedEmail) return;
    
    setIsLoading(true);
    setError("");

    try {
      const response = await apiClient.post<LoginResponse>("/auth/login", {
        U_Email: selectedEmail,
        U_Password: password,
        tenantId: selectedTenant.id,
      });

      setLogin({
        token: response.data.access_token,
        user: response.data.user,
      });

      router.push("/admin/structure");
    } catch (err: any) {
      const errMsg = err.response?.data?.message;
      setError(Array.isArray(errMsg) ? errMsg[0] : errMsg || "Mot de passe incorrect");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await fetch("/api/auth/invite", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        setInviteStatus("SUCCESS");
        form.reset();
        setTimeout(() => { setIsInviteOpen(false); setInviteStatus("IDLE"); }, 3000);
      } else { setInviteStatus("ERROR"); }
    } catch { setInviteStatus("ERROR"); }
  };

  return (
    <div className="min-h-screen flex selection:bg-blue-100 italic bg-white relative font-sans">
      <DevLoginHelper />

      {/* 🌑 SECTION GAUCHE : FORMULAIRE D'ACCÈS */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 bg-white z-10">
        <div className="max-w-md w-full mx-auto space-y-10">
          <div className="text-center lg:text-left">
            <div className="inline-flex mb-8 drop-shadow-2xl">
              <img src="/QSLogo.PNG" alt="Qualisoft Logo" className="h-24 w-auto object-contain animate-in fade-in duration-1000" />
            </div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              QUALI<span className="text-[#2563eb]">SOFT</span> <br />
              <span className="text-3xl text-slate-400">ELITE RD 2030</span>
            </h2>
          </div>

          {/* --- ÉTAPE 1 : CHOIX DU TENANT --- */}
          {step === "TENANT" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Sélectionnez votre Instance</label>
              <div className="grid gap-4">
                {availableTenants.map((tenant) => (
                  <button key={tenant.id} onClick={() => handleSelectTenant(tenant)}
                    className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:border-[#2563eb] hover:bg-blue-50 transition-all group text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-inner group-hover:text-[#2563eb]"><Building2 size={24} /></div>
                      <span className="font-bold text-slate-800 uppercase tracking-tight">{tenant.name}</span>
                    </div>
                    <ArrowRight size={20} className="text-slate-300 group-hover:text-[#2563eb] transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* --- ÉTAPE 2 : CHOIX DE L'UTILISATEUR --- */}
          {step === "USER_SELECT" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <button onClick={() => setStep("TENANT")} className="flex items-center gap-2 text-[10px] font-black uppercase text-[#2563eb]"><ChevronLeft size={14} /> Retour aux instances</button>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Utilisateurs autorisés sur {selectedTenant?.name}</label>
              <div className="grid gap-3">
                {usersByTenant[selectedTenant?.id || ""]?.map((email) => (
                  <button key={email} onClick={() => handleSelectUser(email)}
                    className="flex items-center gap-4 p-5 bg-slate-900 text-white rounded-3xl hover:bg-[#2563eb] transition-all text-left group">
                    <UserCheck size={20} className="text-blue-400 group-hover:text-white" />
                    <span className="font-bold text-sm">{email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* --- ÉTAPE 3 : MOT DE PASSE --- */}
          {step === "PASSWORD" && (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <button onClick={() => setStep("USER_SELECT")} className="flex items-center gap-2 text-[10px] font-black uppercase text-[#2563eb]"><ChevronLeft size={14} /> Changer d&apos;utilisateur</button>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                <UserCheck size={20} className="text-[#2563eb]" />
                <div className="flex flex-col text-[10px] font-black uppercase tracking-tighter italic">
                  <span className="text-slate-400">Session pour</span>
                  <span className="text-slate-900">{selectedEmail}</span>
                </div>
              </div>

              {error && <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[11px] font-black uppercase rounded-r-2xl animate-shake">{error}</div>}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Clé de sécurité (Mot de passe)</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#2563eb] transition-colors" size={20} />
                    <input type="password" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-[#2563eb]/5 focus:border-[#2563eb] transition-all font-bold text-slate-800 text-sm italic"
                      placeholder="••••••••" />
                  </div>
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full py-6 bg-slate-900 text-white rounded-4xl font-black uppercase tracking-[0.2em] hover:bg-[#2563eb] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 text-xs">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Valider l&apos;accès Elite <ArrowRight size={20} /></>}
                </button>
              </form>
            </div>
          )}

          <div className="flex flex-col items-center gap-6 pt-6">
            <div className="w-full h-px bg-slate-100 relative">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-6 text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Authentification Multi-Tenant</span>
            </div>
            <button onClick={() => setIsInviteOpen(true)} className="group text-[#2563eb] font-black uppercase italic text-[12px] tracking-widest hover:text-slate-900">
               Demander un accès Elite
            </button>
          </div>
        </div>
      </div>

      {/* 🌌 SECTION DROITE IMMERSIVE */}
      <div className="hidden lg:flex flex-1 bg-[#0B0F1A] relative items-center justify-center p-20 overflow-hidden text-center">
        <div className="relative z-10 space-y-10">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-[#2563eb]/10 border border-[#2563eb]/20 text-[#2563eb] text-[10px] font-black uppercase tracking-[0.4em] rounded-full backdrop-blur-md">
            <ShieldCheck size={14} /> Noyau Certifié ISO 9001/14001/45001
          </div>
          <h3 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-[1.1]">
            La conformité n&apos;est plus <br /> un fardeau, <span className="text-[#2563eb]">c&apos;est un atout.</span>
          </h3>
        </div>
        <div className="absolute top-0 right-0 w-125 h-125 bg-[#2563eb]/20 blur-[150px] rounded-full animate-pulse" />
      </div>

      {/* 🚀 MODALE INVITATION */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#0B0F1A]/95 backdrop-blur-xl p-6">
          <div className="bg-white w-full max-w-xl rounded-[3rem] p-12 relative shadow-3xl">
            <button onClick={() => setIsInviteOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={28} /></button>
            <h3 className="text-3xl font-black uppercase italic text-slate-900 text-center mb-8">Déployer Elite</h3>
            <form onSubmit={handleInviteSubmit} className="space-y-6">
              <input name="company" required placeholder="Organisation" className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold italic" />
              <input name="email" required type="email" placeholder="Email Décisionnel" className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold italic" />
              <button type="submit" className="w-full py-5 bg-[#2563eb] text-white rounded-2xl font-black uppercase tracking-widest">Valider</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}