/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🛰️ MODULE : PROVISIONING MATRIX ELITE
 * -------------------------------------------------------------------------
 * RÔLE : Initialisation souveraine de nouveaux locataires SMI.
 * SÉCURITÉ : Protocole SUPER_ADMIN requis.
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 14:35 GMT
 */

import { matrixApi, ProvisioningPayload } from "@/services/matrix.service";
import { useAuthStore } from "@/store/authStore";
import {
  Building2,
  ChevronLeft,
  Crown,
  Loader2,
  Rocket,
  ShieldCheck,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProvisioningPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const [formData, setFormData] = useState({
    companyName: "",
    customSlug: "",
    ceoName: "",
    adminFirstName: "",
    adminLastName: "",
    email: "",
    phone: "",
    address: "",
    displayPassword: "Qualisoft@2026",
  });

  // 🛡️ BARRIÈRE RÉGALIENNE
  useEffect(() => {
    if (isAuthenticated !== undefined) {
      if (!isAuthenticated) {
        router.replace("/auth/login");
      } else if (user?.U_Role !== "SUPER_ADMIN") {
        toast.error("Accès régalien refusé.");
        router.replace("/dashboard");
      }
      setIsInitializing(false);
    }
  }, [isAuthenticated, user, router]);

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Scellage du nouveau nœud Matrix...");
    setLoading(true);

    try {
      const payload: ProvisioningPayload = {
        companyName: formData.companyName,
        customSlug: formData.companyName
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-"),
        ceoName: formData.ceoName,
        email: formData.email,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        phone: formData.phone,
        address: formData.address,
        adminPassword: formData.displayPassword,
      };

      await matrixApi.initialize(payload);
      toast.success(`Nœud Matrix scellé avec succès.`, { id: tid });

      // Propulsion vers le registre après délai de propagation
      setTimeout(() => router.push("/admin/matrix"), 2000);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Échec de communication Kernel";
      toast.error(Array.isArray(msg) ? msg[0] : msg, { id: tid });
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing)
    return (
      <div className="h-screen bg-[#0B0F1A] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans italic selection:bg-blue-100 pb-20">
      <nav className="bg-slate-900 text-white p-6 shadow-2xl flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-blue-500" size={24} />
          <span className="font-black uppercase tracking-tighter text-xl italic">
            QUALI<span className="text-blue-500">SOFT</span> MASTER
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
          <Crown size={14} className="text-amber-400" /> {user?.U_Email}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-16 px-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-10 hover:text-slate-900 transition-all cursor-pointer bg-transparent border-none"
        >
          <ChevronLeft size={14} /> Retour Cockpit Master
        </button>

        <header className="mb-12">
          <h1 className="text-6xl font-black text-slate-900 uppercase italic leading-none flex items-center gap-6 tracking-tighter">
            <Rocket className="text-blue-600" size={56} /> Provisioning{" "}
            <span className="text-blue-600">Elite</span>
          </h1>
          <p className="text-[11px] font-black uppercase text-slate-400 mt-4 tracking-[0.3em]">
            Initialisation dynamique d&apos;instance Qualisoft Elite RD 2030
          </p>
        </header>

        <form
          onSubmit={handleDeploy}
          className="space-y-10 bg-white p-12 rounded-[3.5rem] border border-white shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700"
        >
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] flex items-center gap-2 border-b border-slate-100 pb-4">
              <Building2 size={14} /> Identité du Nœud
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">
                  Dénomination Sociale
                </label>
                <input
                  required
                  className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 italic uppercase"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">
                  CEO / DG
                </label>
                <input
                  required
                  className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 italic"
                  value={formData.ceoName}
                  onChange={(e) =>
                    setFormData({ ...formData, ceoName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">
                  Téléphone
                </label>
                <input
                  required
                  className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 italic"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">
                  Adresse
                </label>
                <input
                  required
                  className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 italic"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] flex items-center gap-2 border-b border-slate-100 pb-4">
              <User size={14} /> Administrateur Racine
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <input
                required
                placeholder="Prénom"
                className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 italic"
                value={formData.adminFirstName}
                onChange={(e) =>
                  setFormData({ ...formData, adminFirstName: e.target.value })
                }
              />
              <input
                required
                placeholder="Nom"
                className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 italic uppercase"
                value={formData.adminLastName}
                onChange={(e) =>
                  setFormData({ ...formData, adminLastName: e.target.value })
                }
              />
            </div>
            <input
              required
              type="email"
              placeholder="Email de Supervision"
              className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 italic"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.5em] flex justify-center items-center gap-4 hover:bg-blue-600 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Rocket size={20} /> Lancer le Déploiement
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
