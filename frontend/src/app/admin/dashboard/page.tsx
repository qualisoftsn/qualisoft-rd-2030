"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Server, 
  Users, 
  ExternalLink, 
  Loader2, 
  ShieldCheck, 
  Activity,
  Search
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

export default function MatrixDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantMatrix[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");

  /**
   * 📡 SYNCHRONISATION MATRIX
   */
  const fetchTenants = useCallback(async (): Promise<void> => {
    try {
      const { data } = await apiClient.get<TenantMatrix[]>("/admin/matrix/deploy");
      setTenants(data);
    } catch (exception: unknown) {
      const axiosError = exception as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.message || "Échec de synchronisation avec le cluster.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🛡️ PROTECTION ET CHARGEMENT
   */
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || session?.user?.U_Role !== "SUPER_ADMIN") {
      router.replace("/auth/login");
      return;
    }

    fetchTenants();
  }, [status, session, router, fetchTenants]);

  /**
   * 🔑 IMPERSONATION SOUVERAINE
   */
  const onImpersonate = async (tenantId: string): Promise<void> => {
    const toastId = toast.loading("Génération du jeton souverain...");
    try {
      const { data } = await apiClient.post<{ access_token: string }>(`/admin/matrix/impersonate/${tenantId}`);
      
      // Stockage sécurisé du jeton maître
      localStorage.setItem("master_token", data.access_token);
      toast.success("Autorisation accordée. Redirection...", { id: toastId });
      
      router.push("/dashboard");
    } catch (exception: unknown) {
      const axiosError = exception as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.message || "Accès régalien refusé.";
      toast.error(message, { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600" size={32} />
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
        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black uppercase text-slate-400">
          Super-Admin Node | {session?.user?.U_Email}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-12 px-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none italic">Matrix</h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Souveraineté et Surveillance des Instances</p>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un tenant..."
              className="pl-12 pr-6 py-5 bg-white border border-slate-200 rounded-3xl w-96 font-bold outline-none focus:border-blue-600 transition-all shadow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="grid gap-6">
          {tenants
            .filter(t => t.T_Name.toLowerCase().includes(query.toLowerCase()) || t.T_Domain.toLowerCase().includes(query.toLowerCase()))
            .map((tenant) => (
              <div key={tenant.T_Id} className="bg-white border border-slate-200 p-8 rounded-[2.5rem] flex items-center justify-between shadow-sm hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                <div className="flex items-center gap-8">
                  <div className="h-20 w-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Server size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">{tenant.T_Name}</h2>
                    <div className="flex gap-6 mt-2">
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                        <Activity size={12} className={tenant.T_IsActive ? "text-green-500" : "text-red-500"} />
                        {tenant.T_Domain}.qualisoft.sn
                      </span>
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600">
                        <Users size={12} /> {tenant._count?.T_Users || 0} Admins
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase px-4 py-1.5 bg-slate-100 rounded-full text-slate-600">
                      {tenant.T_Plan}
                    </span>
                    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest italic">{tenant.T_SubscriptionStatus}</p>
                  </div>
                  <button 
                    onClick={() => onImpersonate(tenant.T_Id)}
                    className="bg-slate-900 text-white px-8 py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-blue-600 hover:scale-105 transition-all shadow-lg shadow-slate-900/10"
                  >
                    <ExternalLink size={16} /> Entrer
                  </button>
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}