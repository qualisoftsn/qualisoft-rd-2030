/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🛰️ MODULE : PROVISIONING MATRIX ELITE
 * -------------------------------------------------------------------------
 * CHEMIN : /src/app/admin/provisioning/page.tsx
 * RÔLE : Déploiement souverain de nouveaux nœuds territoriaux.
 * SÉCURITÉ : SUPER_ADMIN requis (Contrôle via store Zustand).
 * DATE : 01 Mars 2026 | HEURE : 17:35 GMT
 * -------------------------------------------------------------------------
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
import { custom } from "zod";

export default function ProvisioningPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // État du formulaire avec typage initial
  const [formData, setFormData] = useState({
    companyName: "",
    ceoName: "",
    adminFirstName: "",
    adminLastName: "",
    email: "",
    phone: "",
    address: "",
    displayPassword: "Qualisoft@2026",
  });

  /**
   * 🛡️ BARRIÈRE DE SÉCURITÉ RÉGALIENNE
   * Vérifie les droits d'accès avant le montage du composant.
   */
  useEffect(() => {
    const checkAccess = () => {
      if (isAuthenticated !== undefined) {
        if (!isAuthenticated) {
          router.replace("/auth/login");
        } else if (user?.U_Role !== "SUPER_ADMIN") {
          toast.error("Accès régalien refusé : Autorité Master requise.");
          router.replace("/dashboard");
        }
        setIsInitializing(false);
      }
    };
    checkAccess();
  }, [isAuthenticated, user, router]);

  /**
   * 🚀 PROTOCOLE DE DÉPLOIEMENT
   * Envoie les instructions au Kernel NestJS pour le scellage du nœud.
   */
  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Scellage du nouveau nœud Matrix...");
    setLoading(true);

    try {
      // Construction du payload avec génération dynamique du slug
      const payload: ProvisioningPayload = {
        companyName: formData.companyName,
        customSlug: formData.companyName
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-") // Normalisation URL
          .replace(/[^\w-]/g, ""), // Sécurisation caractères
        ceoName: formData.ceoName,
        email: formData.email,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        phone: formData.phone,
        address: formData.address,
        adminPassword: formData.displayPassword,
      };

      await matrixApi.initialize(payload);

      toast.success(
        `Nœud Matrix [${formData.companyName}] scellé avec succès.`,
        { id: tid },
      );

      // Reset et redirection vers le registre global
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
      <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
          Initialisation du Noyau...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans italic selection:bg-blue-100 pb-20">
      {/* NAVIGATION BAR */}
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
            <span className="text-blue-600 text-7xl">Elite</span>
          </h1>
          <p className="text-[11px] font-black uppercase text-slate-400 mt-4 tracking-[0.3em]">
            Initialisation dynamique d&apos;instance Qualisoft Elite RD 2030
          </p>
        </header>

        {/* FORMULAIRE DE DÉPLOIEMENT */}
        <form
          onSubmit={handleDeploy}
          className="space-y-10 bg-white p-12 rounded-[3.5rem] border border-white shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700"
        >
          {/* SECTION 1 : ORGANISATION */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] flex items-center gap-2 border-b border-slate-100 pb-4">
              <Building2 size={14} /> Identité du Nœud territorial
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">
                  Dénomination Sociale
                </label>
                <input
                  required
                  placeholder="EX: SENELEC"
                  className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 italic uppercase transition-all"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">
                  CEO / Directeur Général
                </label>
                <input
                  required
                  placeholder="NOM COMPLET"
                  className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 italic transition-all"
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
                  Ligne Directe
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
                  Adresse Siège
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

          {/* SECTION 2 : ADMIN RACINE */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] flex items-center gap-2 border-b border-slate-100 pb-4">
              <User size={14} /> Administrateur Racine (SMI)
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <input
                required
                placeholder="Prénom Admin"
                className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-slate-900 outline-none focus:border-blue-600 italic"
                value={formData.adminFirstName}
                onChange={(e) =>
                  setFormData({ ...formData, adminFirstName: e.target.value })
                }
              />
              <input
                required
                placeholder="Nom Admin"
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
              placeholder="Email professionnel (Identifiant)"
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
            className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.5em] flex justify-center items-center gap-4 hover:bg-blue-600 transition-all shadow-2xl active:scale-95 disabled:opacity-50 cursor-pointer border-none"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Rocket size={20} /> Lancer le Déploiement Elite
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
