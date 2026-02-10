"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Rocket, Building2, Mail, Globe, ShieldCheck, Loader2, ChevronLeft, Crown 
} from "lucide-react";
import { matrixApi } from "@/services/matrix.service"; 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, { AxiosError } from "axios";

// --- TYPAGE STRICT ELITE ---
interface ProvisionFormData {
  companyName: string;
  domain: string;
  admin1Email: string;
  admin2Email: string;
}

interface BackendErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

/**
 * 🛰️ UNITÉ DE PROVISIONING : QUALISOFT ELITE RD 2030
 * RÔLE : Déploiement souverain de nouvelles instances Matrix.
 */
export default function ProvisioningPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<ProvisionFormData>({
    companyName: "",
    domain: "",
    admin1Email: "",
    admin2Email: "",
  });

  // 🛡️ Protection de route régalienne
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    } else if (status === "authenticated" && session?.user?.U_Role !== "SUPER_ADMIN") {
      toast.error("Accès régalien refusé.");
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  /**
   * 🖋️ PROTOCOLE DE DÉPLOIEMENT
   */
  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Appel via le service Matrix (Contrat scellé)
      await matrixApi.initialize({
        companyName: formData.companyName,
        domain: formData.domain,
        admin1Email: formData.admin1Email,
        admin2Email: formData.admin2Email,
      });

      toast.success(`Instance ${formData.domain}.qualisoft.sn déployée avec succès !`);
      
      setFormData({ 
        companyName: "", 
        domain: "", 
        admin1Email: "", 
        admin2Email: "" 
      });

    } catch (err: unknown) {
      let errorMessage = "Échec de la communication avec le Noyau Master";

      if (axios.isAxiosError(err)) {
        const data = err.response?.data as BackendErrorResponse;
        errorMessage = data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      console.error("Erreur Provisioning:", err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white italic">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans italic selection:bg-blue-100">
      {/* NAVBAR SOUVERAINE */}
      <nav className="bg-slate-900 text-white p-6 shadow-2xl flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-blue-500" size={24} />
          <span className="font-black uppercase tracking-tighter text-xl italic">
            QUALI<span className="text-blue-500">SOFT</span> MASTER
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
          <Crown size={14} className="text-amber-400" /> {session?.user?.U_Email}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto py-16 px-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-10 hover:text-slate-900 transition-all cursor-pointer bg-transparent border-none"
        >
          <ChevronLeft size={14} /> Retour Cockpit
        </button>

        <header className="mb-12">
          <h1 className="text-5xl font-black text-slate-900 uppercase italic leading-none flex items-center gap-6 tracking-tighter">
            <Rocket className="text-blue-600" size={48} /> Provisioning <span className="text-blue-600">Elite</span>
          </h1>
          <p className="text-[11px] font-black uppercase text-slate-400 mt-4 tracking-[0.3em]">Déploiement d&apos;instances multi-tenant ISO 9001</p>
        </header>

        <form onSubmit={handleDeploy} className="space-y-8 bg-white p-12 rounded-[3rem] border border-white shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest">
                <Building2 size={12} /> Nom de l&apos;Organisation
              </label>
              <input 
                type="text" 
                required 
                className="w-full p-5 bg-slate-50 border border-transparent rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-300 uppercase" 
                value={formData.companyName} 
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} 
                placeholder="Ex: PORT DE DAKAR" 
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest">
                <Globe size={12} /> Sous-domaine Matrix
              </label>
              <div className="flex items-center">
                <input 
                  type="text" 
                  required 
                  className="flex-1 p-5 bg-slate-50 border border-transparent rounded-l-2xl font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all lowercase placeholder:text-slate-300" 
                  value={formData.domain} 
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value.toLowerCase().replace(/\s+/g, '') })} 
                  placeholder="pad" 
                />
                <span className="bg-slate-200 p-5 rounded-r-2xl font-black text-slate-500 text-sm italic">
                  .qualisoft.sn
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest">
                <Mail size={12} /> Administrateur Principal
              </label>
              <input 
                type="email" 
                required 
                className="w-full p-5 bg-slate-50 border border-transparent rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-300 lowercase" 
                value={formData.admin1Email} 
                onChange={(e) => setFormData({ ...formData, admin1Email: e.target.value })} 
                placeholder="admin@instance.sn" 
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest">
                <Mail size={12} /> Administrateur Secondaire
              </label>
              <input 
                type="email" 
                required 
                className="w-full p-5 bg-slate-50 border border-transparent rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-300 lowercase" 
                value={formData.admin2Email} 
                onChange={(e) => setFormData({ ...formData, admin2Email: e.target.value })} 
                placeholder="backup@instance.sn" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-6 bg-slate-900 text-white rounded-4xl font-black uppercase tracking-[0.4em] flex justify-center items-center gap-4 hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-600/40 transition-all cursor-pointer disabled:bg-slate-300 border-none mt-4 shadow-xl"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Rocket size={24} /> Lancer le Déploiement
              </>
            )}
          </button>
        </form>

        <footer className="mt-20 text-center border-t border-slate-200 pt-10">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 italic">
            Infrastructure Master Souveraine - Qualisoft Elite RD 2030
          </p>
        </footer>
      </div>
    </div>
  );
}