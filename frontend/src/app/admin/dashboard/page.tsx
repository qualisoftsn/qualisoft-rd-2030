/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

/**
 * 🛰️ MODULE : MATRIX DASHBOARD (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Surveillance et contrôle régalien des instances clients.
 * FIX : Élimination de NextAuth. Alignement Design Dark Mode ClickUp Style.
 * RÉVISION : 04 Mars 2026 | 22:54 GMT
 * -------------------------------------------------------------------------
 */

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from '@/store/authStore';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Server, Users, ExternalLink, Loader2, ShieldCheck, 
  Activity, Search, RefreshCw
} from "lucide-react";
import apiClient from "@/core/api/api-client";
import { AxiosError } from "axios";

// --- INTERFACES ÉLITE ---
interface TenantMatrix {
  T_Id: string;
  T_Name: string;
  T_Domain: string;
  T_IsActive: boolean;
  T_Plan: string;
  T_SubscriptionStatus: string;
  _count?: { T_Users: number; };
}

interface ApiErrorResponse { message?: string; }

export default function MatrixDashboard() {
  const { user } = useAuthStore() as any;
  const router = useRouter();
  
  const [tenants, setTenants] = useState<TenantMatrix[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");

  /**
   * 📡 SYNCHRONISATION MATRIX
   */
  const fetchTenants = useCallback(async (): Promise<void> => {
    setSyncing(true);
    try {
      const { data } = await apiClient.get<TenantMatrix[]>("/admin/matrix/deploy");
      setTenants(data);
    } catch (exception: unknown) {
      const axiosError = exception as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.message || "Échec de synchronisation Matrix.";
      toast.error(message);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  /**
   * 🛡️ PROTECTION SOUVERAINE
   */
  useEffect(() => {
    if (user === null && loading === false) {
      router.replace("/auth/login");
      return;
    }

    if (user && user.U_Role !== "SUPER_ADMIN") {
      toast.error("Territoire Matrix interdit.");
      router.replace("/dashboard");
      return;
    }

    if (user) fetchTenants();
  }, [user, router, fetchTenants, loading]);

  /**
   * 🔑 IMPERSONATION SOUVERAINE
   */
  const onImpersonate = async (tenantId: string): Promise<void> => {
    const toastId = toast.loading("Calcul du saut dimensionnel...");
    try {
      const { data } = await apiClient.post<{ access_token: string }>(`/admin/matrix/impersonate/${tenantId}`);
      // L'API a scellé le cookie. Redirection vers le cockpit.
      toast.success("Tunnel établi. Redirection...", { id: toastId });
      router.push("/dashboard");
    } catch (exception: unknown) {
      const axiosError = exception as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.message || "Accès refusé par le Kernel.";
      toast.error(message, { id: toastId });
    }
  };

  if (loading && !user) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#0B0F1A] italic font-black uppercase text-[10px] tracking-[0.4em] text-slate-600">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        Vérification des droits Matrix...
      </div>
    );
  }

  return (
    // Remplacement de min-h-screen par h-full pour s'intégrer au layout 100dvh
    <div className="h-full flex flex-col font-sans italic selection:bg-blue-600/30 text-white">
      
      {/* 🧭 NAVIGATION INTERNE */}
      <nav className="bg-white/5 backdrop-blur-md p-6 rounded-3xl flex justify-between items-center shadow-2xl border border-white/5 mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <ShieldCheck className="text-blue-500" size={24} />
          <span className="font-black uppercase tracking-tighter text-xl italic text-white">
            Qualisoft <span className="text-blue-500">Matrix</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={fetchTenants} disabled={syncing} className="p-3 hover:bg-white/10 bg-transparent border-none cursor-pointer rounded-xl transition-colors text-slate-400">
            <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
          </button>
          <div className="bg-blue-600/10 px-4 py-2 rounded-xl border border-blue-500/20 text-[10px] font-black uppercase text-blue-400">
            Node: {user?.U_Email}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 shrink-0">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic m-0">
              Console <span className="text-blue-600">Matrix</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] m-0">Propulsion et Surveillance</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher une instance..."
              className="pl-12 pr-6 py-4 bg-[#0F172A] border border-white/10 rounded-2xl w-full text-white font-bold outline-none focus:border-blue-600 transition-all placeholder:text-slate-600"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </header>

        {/* GRILLE SCROLLABLE INTÉGRÉE */}
        <div className="grid grid-cols-1 gap-4 pb-20">
          {tenants
            .filter(t => t.T_Name.toLowerCase().includes(query.toLowerCase()) || t.T_Domain.toLowerCase().includes(query.toLowerCase()))
            .map((tenant) => (
              <div key={tenant.T_Id} className="bg-white/5 border border-white/10 p-6 rounded-4xl flex flex-col md:flex-row md:items-center justify-between hover:bg-white/10 transition-all group gap-6">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 bg-[#0B0F1A] border border-white/5 rounded-2xl flex shrink-0 items-center justify-center text-slate-500 group-hover:text-blue-500 group-hover:border-blue-500/30 transition-colors">
                    <Server size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase italic m-0 mb-2">{tenant.T_Name}</h2>
                    <div className="flex flex-wrap gap-4">
                      <span className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
                        <Activity size={10} className={tenant.T_IsActive ? "text-emerald-500" : "text-red-500"} />
                        {tenant.T_Domain}.qualisoft.sn
                      </span>
                      <span className="flex items-center gap-2 text-[9px] font-black uppercase text-blue-500">
                        <Users size={10} /> {tenant._count?.T_Users || 0} Identités
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 justify-between md:justify-end border-t border-white/5 md:border-none pt-4 md:pt-0">
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase px-3 py-1 bg-blue-600/10 border border-blue-600/20 rounded-lg text-blue-400">{tenant.T_Plan}</span>
                  </div>
                  <button 
                    onClick={() => onImpersonate(tenant.T_Id)}
                    className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-[9px] tracking-widest flex items-center gap-2 hover:bg-white hover:text-blue-600 transition-all cursor-pointer border-none shadow-xl shadow-blue-900/20 shrink-0"
                  >
                    <ExternalLink size={14} /> Entrer
                  </button>
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}