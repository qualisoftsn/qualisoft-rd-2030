/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DevLoginHelper from "@/components/dev/DevLoginHelper";
import apiClient from "@/core/api/api-client";
import { useAuthStore } from "@/store/authStore";
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  Crown,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Loader2,
  Lock,
  Search,
  Send,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// --- INTERFACES ---
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

  // Étapes du wizard
  const [step, setStep] = useState<
    "SELECT_TYPE" | "TENANT_LOGIN" | "TRIAL_REQUEST"
  >("SELECT_TYPE");
  const [subStep, setSubStep] = useState<
    "TENANT_SELECT" | "USER_SELECT" | "PASSWORD"
  >("TENANT_SELECT");

  // Données
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantUsers, setTenantUsers] = useState<UserProfile[]>([]);

  // Formulaires
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [trialData, setTrialData] = useState({
    companyName: "",
    adminEmail: "",
    industry: "",
  });

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTenant, setSearchTenant] = useState("");

  // Initialisation sécurisée
  useEffect(() => {
    logout(); // Purge Master au montage
  }, [logout]);

  // Chargement tenants au montage
  useEffect(() => {
    if (step === "TENANT_LOGIN" && tenants.length === 0) {
      fetchTenants();
    }
  }, [step, tenants.length]);

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get<Tenant[]>("/auth/tenants/public");
      setTenants(res.data);
      setFilteredTenants(res.data);
    } catch {
      setError("Impossible de contacter le serveur Qualisoft");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrage recherche tenant
  useEffect(() => {
    if (searchTenant) {
      const filtered = tenants.filter(
        (t) =>
          t.T_Name.toLowerCase().includes(searchTenant.toLowerCase()) ||
          t.T_Domain.toLowerCase().includes(searchTenant.toLowerCase()),
      );
      setFilteredTenants(filtered);
    } else {
      setFilteredTenants(tenants);
    }
  }, [searchTenant, tenants]);

  // Sélection tenant et chargement users
  const handleSelectTenant = async (tenant: Tenant) => {
    setIsLoading(true);
    setError("");
    setSelectedTenant(tenant);

    try {
      const res = await apiClient.get<UserProfile[]>(
        `/auth/tenants/${tenant.T_Id}/users`,
      );
      setTenantUsers(res.data);
      setSubStep("USER_SELECT");
    } catch {
      setError("Erreur chargement des utilisateurs");
      setSelectedTenant(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Sélection user
  const handleSelectUser = (user: UserProfile) => {
    setCredentials({ ...credentials, email: user.U_Email });
    setSubStep("PASSWORD");
  };

  // Authentification finale
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await apiClient.post<LoginResponse>("/auth/login", {
        U_Email: credentials.email.toLowerCase().trim(),
        U_Password: credentials.password,
      });

      setLogin({ token: res.data.access_token, user: res.data.user });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Identifiants invalides");
    } finally {
      setIsLoading(false);
    }
  };

  // Demande essai
  const handleTrialRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await apiClient.post("/auth/invite", {
        email: trialData.adminEmail,
        company: trialData.companyName,
      });

      setError("✅ Demande envoyée avec succès");
      setTimeout(() => {
        setStep("SELECT_TYPE");
        setError("");
      }, 3000);
    } catch {
      setError("Échec de l'envoi. Réessayez plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset navigation
  const resetToTenantSelect = () => {
    setSubStep("TENANT_SELECT");
    setSelectedTenant(null);
    setTenantUsers([]);
    setCredentials({ email: "", password: "" });
    setError("");
  };

  return (
    <div className="min-h-screen flex selection:bg-blue-100 italic bg-white relative font-sans overflow-hidden">
      <DevLoginHelper />

      {/* COLONNE PRINCIPALE */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-20 bg-white z-10 overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-8 py-12">
          {/* Logo */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 rounded-4xl mb-6 shadow-2xl shadow-blue-500/10">
              <ShieldCheck className="text-blue-500" size={40} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              QUALI<span className="text-blue-600">SOFT</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-3">
              Elite RD 2030
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div
              className={`p-4 rounded-2xl border text-[11px] font-black uppercase text-center animate-in fade-in slide-in-from-top-2 ${
                error.includes("✅")
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-red-200 text-red-600"
              }`}
            >
              {error}
            </div>
          )}

          {/* STEP 1: CHOIX TYPE */}
          {step === "SELECT_TYPE" && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
              <h2 className="text-center text-sm font-black uppercase text-slate-400 tracking-widest mb-8">
                Bienvenu sur votre plateforme de conformité
              </h2>

              <button
                onClick={() => setStep("TENANT_LOGIN")}
                className="w-full group relative overflow-hidden bg-slate-900 text-white p-8 rounded-[2.5rem] hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Building2 size={28} className="text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">
                        Espace Client
                      </p>
                      <p className="text-xl font-black uppercase italic tracking-tight">
                        Connexion
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={24}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </button>

              <button
                onClick={() => setStep("TRIAL_REQUEST")}
                className="w-full group bg-slate-50 border-2 border-slate-100 p-8 rounded-[2.5rem] hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                      <Send size={28} className="text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        Démarrer
                      </p>
                      <p className="text-xl font-black uppercase italic tracking-tight text-slate-900">
                        Essai Gratuit
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={24}
                    className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                  />
                </div>
              </button>
            </div>
          )}

          {/* STEP 2: CONNEXION CLIENT (Wizard) */}
          {step === "TENANT_LOGIN" && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              {/* Navigation back */}
              <button
                onClick={() =>
                  step === "TENANT_LOGIN" && subStep === "TENANT_SELECT"
                    ? setStep("SELECT_TYPE")
                    : resetToTenantSelect()
                }
                className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 tracking-widest mb-6 hover:underline"
              >
                <ChevronLeft size={14} />
                {subStep === "TENANT_SELECT"
                  ? "Retour accueil"
                  : "Changer d'organisation"}
              </button>

              {/* SubStep 2A: SELECT TENANT */}
              {subStep === "TENANT_SELECT" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter mb-2">
                      Votre Organisation
                    </h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                      Sélectionnez votre entreprise dans la liste
                    </p>
                  </div>

                  {isLoading && tenants.length === 0 ? (
                    <div className="flex justify-center py-12">
                      <Loader2
                        className="animate-spin text-blue-600"
                        size={32}
                      />
                    </div>
                  ) : (
                    <>
                      {/* Recherche Tenant */}
                      {tenants.length > 5 && (
                        <div className="relative">
                          <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                          />
                          <input
                            type="text"
                            placeholder="Rechercher une organisation..."
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 transition-all"
                            value={searchTenant}
                            onChange={(e) => setSearchTenant(e.target.value)}
                          />
                        </div>
                      )}

                      {/* Liste Tenants */}
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                        {filteredTenants.map((tenant) => (
                          <button
                            key={tenant.T_Id}
                            onClick={() => handleSelectTenant(tenant)}
                            className="w-full flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/30 transition-all group text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <Building2 size={20} />
                              </div>
                              <div>
                                <p className="font-black uppercase italic text-slate-900 tracking-tight">
                                  {tenant.T_Name}
                                </p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                  {tenant.T_Domain}
                                </p>
                              </div>
                            </div>
                            <ArrowRight
                              size={18}
                              className="text-slate-300 group-hover:text-blue-600"
                            />
                          </button>
                        ))}
                      </div>

                      {filteredTenants.length === 0 && (
                        <p className="text-center text-[11px] font-black uppercase text-slate-400 py-8">
                          Aucune organisation trouvée
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* SubStep 2B: SELECT USER */}
              {subStep === "USER_SELECT" && selectedTenant && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Building2 size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-blue-600 tracking-widest">
                        Organisation
                      </p>
                      <p className="font-black uppercase italic text-slate-900">
                        {selectedTenant.T_Name}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter mb-2">
                      Votre Profil
                    </h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                      Sélectionnez votre compte utilisateur
                    </p>
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2
                        className="animate-spin text-blue-600"
                        size={32}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tenantUsers.map((user) => (
                        <button
                          key={user.U_Id}
                          onClick={() => handleSelectUser(user)}
                          className="w-full flex items-center gap-4 p-5 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all group text-left"
                        >
                          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                            <Users size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="font-black uppercase italic tracking-tight text-lg">
                              {user.U_FirstName} {user.U_LastName}
                            </p>
                            <p className="text-[10px] font-bold text-blue-200/70 uppercase tracking-wider">
                              {user.U_Email}
                            </p>
                          </div>
                          <ArrowRight
                            size={20}
                            className="text-white/50 group-hover:text-white"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SubStep 2C: PASSWORD */}
              {subStep === "PASSWORD" && (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
                      <UserCheck size={20} className="text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                        Utilisateur
                      </p>
                      <p className="font-black uppercase italic text-slate-900 truncate">
                        {credentials.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubStep("USER_SELECT")}
                      className="text-[9px] font-black uppercase text-blue-600 hover:underline"
                    >
                      Modifier
                    </button>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter mb-2">
                      Authentification
                    </h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                      Saisissez votre mot de passe sécurisé
                    </p>
                  </div>

                  <div className="relative">
                    <Lock
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={20}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoFocus
                      placeholder="Mot de passe"
                      className="w-full pl-14 pr-14 py-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:font-normal placeholder:text-sm"
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          password: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] flex justify-center items-center gap-3 hover:bg-blue-600 transition-all disabled:opacity-50 shadow-xl shadow-blue-500/10"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <KeyRound size={20} /> Connexion
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Accès sécurisé SSL • JWT Token
                  </p>
                </form>
              )}
            </div>
          )}

          {/* STEP 3: TRIAL */}
          {step === "TRIAL_REQUEST" && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
              <button
                onClick={() => setStep("SELECT_TYPE")}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 tracking-widest hover:underline"
              >
                <ChevronLeft size={14} /> Retour accueil
              </button>

              <div>
                <h3 className="text-3xl font-black uppercase italic text-slate-900 tracking-tighter mb-2">
                  Essai Elite
                </h3>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                  14 jours d&apos;accès complet • Sans engagement
                </p>
              </div>

              <form onSubmit={handleTrialRequest} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Organisation
                  </label>
                  <input
                    required
                    placeholder="Nom de votre entreprise"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 transition-all"
                    onChange={(e) =>
                      setTrialData({
                        ...trialData,
                        companyName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Email professionnel
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="vous@entreprise.sn"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 transition-all"
                    onChange={(e) =>
                      setTrialData({ ...trialData, adminEmail: e.target.value })
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] flex justify-center items-center gap-3 hover:bg-slate-900 transition-all disabled:opacity-50 shadow-xl shadow-blue-500/20 mt-6"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Send size={20} /> Envoyer la demande
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Footer */}
          <div className="pt-8 border-t border-slate-100 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Crown size={12} className="text-amber-400" />
              Qualisoft Multi-Tenant Core v2.0
            </div>
          </div>
        </div>
      </div>

      {/* SECTION VISUELLE */}
      <div className="hidden lg:flex flex-1 bg-[#0B0F1A] relative items-center justify-center p-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-[-20%] right-[-10%] w-150 h-150 bg-blue-600/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-100 h-100 bg-indigo-600/20 blur-[120px] rounded-full" />

        <div className="relative z-10 text-center text-white space-y-8 max-w-lg">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-200">
              Qualisoft - Simplicité & Rigueur
            </span>
          </div>

          <h3 className="text-6xl font-black italic uppercase leading-none tracking-tighter">
            L&apos;excellence opérationnelle
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-red-400">
              opérationnelle
            </span>
          </h3>

          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] leading-relaxed max-w-sm mx-auto">
            Gouvernance, Risques et Conformité propulsés par Qualisoft Votre partenaire IT
          </p>

          <div className="flex justify-center gap-4 pt-8">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <ShieldCheck className="text-blue-400" size={24} />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Lock className="text-emerald-400" size={24} />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Fingerprint className="text-amber-400" size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
