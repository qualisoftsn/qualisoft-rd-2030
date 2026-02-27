"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from '@/store/authStore';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Server, 
  Users, 
  ExternalLink, 
  Loader2, 
  ShieldCheck, 
  Activity,
  Search,
  RefreshCw
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
  _count?: {
    T_Users: number;
  };
}

interface ApiErrorResponse {
  message?: string;
}

/**
 * 🛰️ MATRIX DASHBOARD - QUALISOFT RD 2030
 * Rôle : Surveillance et contrôle régalien des instances clients.
 */
export default function MatrixDashboard() {
  // ✅ Correction : On ne récupère que 'user', isAuthenticated n'existe pas dans ton store
  const { user } = useAuthStore();
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
    // Si l'utilisateur est null après hydratation -> Login
    if (user === null && loading === false) {
      router.replace("/auth/login");
      return;
    }

    // Vérification stricte du rôle Super-Admin
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
      
      localStorage.setItem("master_token", data.access_token);
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
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 italic font-black uppercase text-[10px] tracking-[0.4em] text-slate-600">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        Vérification des droits Matrix...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans italic selection:bg-blue-100">
      <nav className="bg-slate-900 p-6 text-white flex justify-between items-center shadow-2xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <ShieldCheck className="text-blue-500" size={24} />
          <span className="font-black uppercase tracking-tighter text-xl italic">
            Qualisoft <span className="text-blue-500">Matrix</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={fetchTenants} disabled={syncing} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400">
            <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
          </button>
          <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black uppercase text-slate-400">
            Node: {user?.U_Email}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-12 px-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Console <span className="text-blue-600">Matrix</span></h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Propulsion et Surveillance Qualisoft RD-2030</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher une instance..."
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl w-full md:w-80 font-bold outline-none focus:border-blue-600 transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="grid gap-4">
          {tenants
            .filter(t => t.T_Name.toLowerCase().includes(query.toLowerCase()) || t.T_Domain.toLowerCase().includes(query.toLowerCase()))
            .map((tenant) => (
              <div key={tenant.T_Id} className="bg-white border border-slate-200 p-6 rounded-4xl flex items-center justify-between hover:shadow-xl transition-all group">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                    <Server size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase italic">{tenant.T_Name}</h2>
                    <div className="flex gap-4 mt-1">
                      <span className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
                        <Activity size={10} className={tenant.T_IsActive ? "text-green-500" : "text-red-500"} />
                        {tenant.T_Domain}.qualisoft.sn
                      </span>
                      <span className="flex items-center gap-2 text-[9px] font-black uppercase text-blue-600">
                        <Users size={10} /> {tenant._count?.T_Users || 0} Identités
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right hidden md:block">
                    <span className="text-[9px] font-black uppercase px-3 py-1 bg-slate-100 rounded-lg text-slate-600">{tenant.T_Plan}</span>
                  </div>
                  <button 
                    onClick={() => onImpersonate(tenant.T_Id)}
                    className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black uppercase text-[9px] tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all"
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