/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : SovereignDashboard (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage centralisé du Kernel Qualisoft.
 * FIX : Edge-to-Edge UI, scroll confiné au contenu (Zéro global scroll).
 * RÉVISION : 04 Mars 2026 | 23:10 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import Sidebar from "@/components/layout/sidebar";
import apiClient from "@/core/api/api-client";
import { useAuthStore } from "@/store/authStore";
import { Role, Tenant } from "@/types/elite-sde";
import {
  Activity,
  ChevronLeft,
  Crown,
  Database,
  Edit3,
  ExternalLink,
  Fingerprint,
  Globe,
  Loader2,
  Plus,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Terminal,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

type SovereignView = "MATRIX" | "TENANT_EDIT";

export default function SovereignDashboard() {
  const router = useRouter();
  const { user, setLogin, isAuthenticated } = useAuthStore() as any;

  const [hasMounted, setHasMounted] = useState(false);
  const [view, setView] = useState<SovereignView>("MATRIX");
  const [activeTenant, setActiveTenant] = useState<Tenant | any>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/super-admin/tenants");
      const extractedData = res.data?.data || res.data || [];
      setTenants(Array.isArray(extractedData) ? extractedData : []);
    } catch (err: any) {
      toast.error(
        "ÉCHEC MATRICIEL : Synchronisation avec le Noyau impossible.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (
      hasMounted &&
      isAuthenticated &&
      (user?.U_Role === Role.SUPER_ADMIN || user?.U_Role === "SUPER_ADMIN")
    ) {
      fetchTenants();
    }
  }, [fetchTenants, hasMounted, isAuthenticated, user]);

  const handleImpersonate = async (tenantId: string) => {
    const tid = toast.loading("Séquençage du Tunnel d'Incarnation...");
    try {
      const res = await apiClient.post(
        `/admin/super-admin/impersonate/${tenantId}`,
      );
      // Scellage conditionnel via zustand
      setLogin({
        token: res.data.accessToken,
        user: res.data.user,
        isMaster: true,
      });
      toast.success("MODE INCARNATION ACTIF : Identité scellée", { id: tid });
      window.location.href = "/dashboard";
    } catch (err) {
      toast.error("TUNNEL REFUSÉ : Le Nœud a rejeté l'incarnation.", {
        id: tid,
      });
    }
  };

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTenant) return;
    const tid = toast.loading("Scellage des nouveaux protocoles...");
    try {
      await apiClient.patch(
        `/admin/super-admin/tenants/${activeTenant.T_Id}`,
        activeTenant,
      );
      toast.success("REGISTRE MATRIX MIS À JOUR", { id: tid });
      setView("MATRIX");
      fetchTenants();
    } catch (err) {
      toast.error("REJET DU KERNEL : Structure de données invalide.", {
        id: tid,
      });
    }
  };

  const handleDeleteTenant = async (id: string) => {
    if (!confirm("⚠️ ALERTE SÉCURITÉ : Purger définitivement ce nœud ?"))
      return;
    const tid = toast.loading("Purge du système en cours...");
    try {
      await apiClient.delete(`/admin/super-admin/tenants/${id}`);
      toast.success("INSTANCE PURGÉE : Données atomisées.", { id: tid });
      fetchTenants();
    } catch (err) {
      toast.error("PURGE IMPOSSIBLE : Dépendances SMI encore actives.", {
        id: tid,
      });
    }
  };

  const filteredTenants = useMemo(() => {
    return tenants.filter(
      (t) =>
        t.T_Name?.toLowerCase().includes(search.toLowerCase()) ||
        t.T_Domain?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [tenants, search]);

  if (!hasMounted || !isAuthenticated) return null;

  if (user?.U_Role !== Role.SUPER_ADMIN && user?.U_Role !== "SUPER_ADMIN") {
    return (
      <div className="h-dvh w-full bg-[#0B0F1A] flex flex-col items-center justify-center gap-6 italic">
        <div className="relative">
          <ShieldCheck className="text-red-500 animate-pulse" size={60} />
          <Fingerprint
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500/20"
            size={30}
          />
        </div>
        <p className="text-red-500 font-black uppercase tracking-[0.4em] m-0 text-center px-4">
          Accès Matrix Refusé
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full bg-[#0B0F1A] overflow-hidden italic selection:bg-blue-600/30 font-sans text-white">
      {/* 🧭 NAVIGATION RÉGALIENNE */}
      <div className="hidden lg:block z-40">
        <Sidebar isSuperAdmin={true} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-700 lg:pl-80 h-full relative">
        {/* HEADER HUB SOUVERAIN */}
        <header className="h-20 md:h-28 bg-[#0B0F1A]/90 border-b border-white/5 flex items-center justify-between px-6 md:px-12 shrink-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-4 md:gap-8">
            {view !== "MATRIX" && (
              <button
                onClick={() => setView("MATRIX")}
                className="p-3 md:p-5 bg-white/5 rounded-2xl md:rounded-3xl hover:bg-blue-600 transition-all group border-none cursor-pointer shrink-0"
              >
                <ChevronLeft
                  size={20}
                  className="text-blue-500 group-hover:text-white"
                />
              </button>
            )}
            <div className="text-left">
              <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white leading-none m-0">
                {view === "MATRIX" ? "System Matrix" : "Config Nœud"}
              </h2>
              <div className="flex items-center gap-2 md:gap-3 mt-2">
                <Activity size={10} className="text-blue-500 shrink-0" />
                <p className="text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] md:tracking-[0.5em] italic m-0 truncate">
                  Qualisoft Global Cluster • Root Authority
                </p>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-6 shrink-0">
            <div className="px-4 md:px-6 py-2 md:py-4 bg-amber-500/10 border border-amber-500/20 rounded-xl md:rounded-2xl flex items-center gap-3 shadow-lg shadow-amber-900/10">
              <Crown size={16} className="text-amber-500" />
              <span className="text-[9px] md:text-[11px] font-black uppercase text-amber-500 italic tracking-[0.2em] md:tracking-[0.3em] whitespace-nowrap">
                Architecte Master
              </span>
            </div>
          </div>
        </header>

        {/* WORKSPACE MATRIX */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 lg:p-12 custom-scrollbar">
          {/* --- VUE LISTING --- */}
          {view === "MATRIX" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col space-y-8 md:space-y-12 pb-20">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="relative group flex-1 w-full max-w-2xl">
                  <Search
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-all"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="RECHERCHER UNE INSTANCE..."
                    className="w-full bg-white/5 border border-white/10 rounded-4xl py-5 md:py-6 pl-16 pr-6 text-[10px] md:text-xs font-black uppercase italic text-white outline-none focus:border-blue-600 transition-all placeholder:text-slate-600"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => router.push("/admin/provisioning")}
                  className="w-full md:w-auto bg-white text-slate-900 hover:bg-blue-600 hover:text-white px-8 py-5 md:py-6 rounded-4xl font-black uppercase text-[10px] md:text-[11px] italic shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 border-none cursor-pointer shrink-0"
                >
                  <Plus size={18} /> Déployer Nœud
                </button>
              </div>

              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-6 py-32">
                  <Loader2 className="animate-spin text-blue-500" size={48} />
                  <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic m-0 animate-pulse">
                    Analyse du Cluster...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {filteredTenants.length === 0 ? (
                    <div className="py-20 md:py-32 text-center opacity-30 flex flex-col items-center gap-6 border-2 border-dashed border-white/10 rounded-[3rem]">
                      <Database size={60} />
                      <span className="text-sm md:text-lg font-black uppercase tracking-[0.5em] m-0">
                        Néant Digital
                      </span>
                    </div>
                  ) : (
                    filteredTenants.map((t) => (
                      <div
                        key={t.T_Id}
                        className="group bg-[#0B0F1A]/50 border border-white/5 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] hover:bg-white/5 hover:border-blue-500/30 transition-all duration-500 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 md:gap-8 shadow-lg"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-left w-full min-w-0">
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-4xl flex items-center justify-center font-black text-2xl md:text-3xl text-blue-600 shadow-inner group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shrink-0">
                            {t.T_Name ? t.T_Name[0].toUpperCase() : "?"}
                          </div>
                          <div className="space-y-3 min-w-0 w-full">
                            <h3 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tighter italic leading-none m-0 truncate">
                              {t.T_Name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em] italic">
                              <span className="flex items-center gap-2 bg-black/40 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-blue-400 border border-white/5 truncate">
                                <Globe size={12} className="shrink-0" />{" "}
                                {t.T_Domain}
                              </span>
                              <span className="flex items-center gap-2 bg-black/40 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-white/5">
                                <Terminal size={12} className="shrink-0" />{" "}
                                {t.T_Plan}
                              </span>
                              <span
                                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-white/5 whitespace-nowrap ${t.T_SubscriptionStatus === "ACTIVE" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-red-500 bg-red-500/10 border-red-500/20"}`}
                              >
                                ● {t.T_SubscriptionStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full xl:w-auto justify-end shrink-0 border-t border-white/5 pt-4 xl:border-none xl:pt-0">
                          <button
                            onClick={() => {
                              setActiveTenant(t);
                              setView("TENANT_EDIT");
                            }}
                            className="p-4 md:p-5 bg-white/5 rounded-2xl md:rounded-3xl text-slate-400 hover:text-white hover:bg-blue-600 transition-all border-none cursor-pointer"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => handleImpersonate(t.T_Id)}
                            className="flex-1 sm:flex-none bg-blue-600 text-white px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black uppercase text-[9px] md:text-[10px] italic flex items-center justify-center gap-2 hover:bg-white hover:text-slate-900 shadow-xl shadow-blue-900/20 transition-all border-none cursor-pointer active:scale-95"
                          >
                            <ExternalLink size={16} /> Incarner
                          </button>
                          <button
                            onClick={() => handleDeleteTenant(t.T_Id)}
                            className="p-4 md:p-5 bg-red-600/10 rounded-2xl md:rounded-3xl text-red-500 hover:text-white hover:bg-red-600 transition-all border-none cursor-pointer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* --- VUE ÉDITION --- */}
          {view === "TENANT_EDIT" && activeTenant && (
            <div className="animate-in fade-in zoom-in duration-500 max-w-4xl mx-auto text-left pb-20">
              <form
                onSubmit={handleUpdateTenant}
                className="bg-white/5 border border-white/10 p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] space-y-8 md:space-y-12 shadow-2xl backdrop-blur-md relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 md:p-12 opacity-5 text-blue-600 pointer-events-none">
                  <Settings2 size={150} />
                </div>

                <h3 className="text-[10px] md:text-[11px] font-black text-blue-500 uppercase tracking-[0.4em] border-b border-white/10 pb-6 flex items-center gap-3 m-0 italic">
                  <Fingerprint size={18} /> Paramétrage du Nœud territorial
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10">
                  <div className="space-y-3">
                    <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 italic">
                      Raison Sociale
                    </label>
                    <input
                      className="w-full bg-[#0B0F1A] border border-white/5 rounded-3xl p-5 text-xs md:text-sm font-black text-white italic outline-none focus:border-blue-600 transition-all"
                      value={activeTenant.T_Name}
                      onChange={(e) =>
                        setActiveTenant({
                          ...activeTenant,
                          T_Name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 italic">
                      Offre de Service Matrix
                    </label>
                    <select
                      className="w-full bg-[#0B0F1A] border border-white/5 rounded-3xl p-5 text-xs md:text-sm font-black text-white italic outline-none focus:border-blue-600 appearance-none cursor-pointer"
                      value={activeTenant.T_Plan}
                      onChange={(e) =>
                        setActiveTenant({
                          ...activeTenant,
                          T_Plan: e.target.value,
                        })
                      }
                    >
                      <option value="GROUPE">GROUPE (PROTOCOLE TOTAL)</option>
                      <option value="ELITE">ELITE (50 AGENTS)</option>
                      <option value="ESSAI">ESSAI (VÉRIFICATION)</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 italic">
                      Statut de Scellage
                    </label>
                    <select
                      className="w-full bg-[#0B0F1A] border border-white/5 rounded-3xl p-5 text-xs md:text-sm font-black text-white italic outline-none focus:border-emerald-600 appearance-none cursor-pointer"
                      value={activeTenant.T_SubscriptionStatus}
                      onChange={(e) =>
                        setActiveTenant({
                          ...activeTenant,
                          T_SubscriptionStatus: e.target.value,
                        })
                      }
                    >
                      <option value="ACTIVE">OPÉRATIONNEL (SCELLÉ)</option>
                      <option value="SUSPENDED">SUSPENDU (RESTRICTION)</option>
                      <option value="EXPIRED">EXPIRÉ (FIN DE BAIL)</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 italic">
                      UUID Système
                    </label>
                    <div className="w-full bg-black/40 border border-white/5 rounded-3xl p-5 text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-widest truncate">
                      {activeTenant.T_Id}
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-6 md:py-8 rounded-3xl font-black uppercase text-[10px] md:text-xs italic flex items-center justify-center gap-3 shadow-xl hover:bg-white hover:text-slate-900 transition-all border-none cursor-pointer active:scale-95"
                  >
                    <Save size={18} /> SCELLER LES MODIFICATIONS
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("MATRIX")}
                    className="w-full sm:w-auto px-8 md:px-12 bg-white/5 text-slate-400 py-6 md:py-8 rounded-3xl font-black uppercase text-[10px] md:text-xs italic hover:bg-red-600 hover:text-white transition-all border-none cursor-pointer"
                  >
                    Abandonner
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        {/* FOOTER CLUSTER STATUS */}
        <footer className="h-16 md:h-20 bg-[#0B0F1A] border-t border-white/5 flex justify-between items-center px-6 md:px-12 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex flex-col text-left">
              <span className="text-[7px] md:text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mb-1 leading-none">
                Sync Status
              </span>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase italic tracking-widest">
                  Online
                </span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            <div className="flex-col text-left hidden sm:flex">
              <span className="text-[7px] md:text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mb-1 leading-none">
                Cluster Data
              </span>
              <span className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase italic tracking-widest">
                {tenants.length} Nœuds Scellés
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] italic leading-none m-0">
              RD-2026-SOUVERAIN_BUILD
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
