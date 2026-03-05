//* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🛰️ MODULE : PROVISIONING MATRIX ELITE (elite-sde)
 * -------------------------------------------------------------------------
 * CHEMIN : /src/app/admin/provisioning/page.tsx
 * RÔLE : Déploiement souverain de nouveaux nœuds territoriaux.
 * SÉCURITÉ : SUPER_ADMIN requis (Contrôle via store Zustand, Zéro NextAuth).
 * UX/UI : Dark Mode Matrix, Zéro Scroll Global (ClickUp Style), PWA Ready.
 * DATE : 04 Mars 2026 | 23:25 GMT
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

export default function ProvisioningPage() {
  const { user, isAuthenticated } = useAuthStore() as any;
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
      setTimeout(() => router.push("/admin/super-dashboard"), 2000); // Redirection vers le super-dashboard centralisé
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Échec de communication Kernel";
      toast.error(Array.isArray(msg) ? msg[0] : msg, { id: tid });
    } finally {
      setLoading(false);
    }
  };

  // Écran de chargement initial (Full Height)
  if (isInitializing) {
    return (
      <div className="h-full w-full bg-[#0B0F1A] flex flex-col items-center justify-center gap-4 italic font-sans text-white">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest animate-pulse m-0">
          Initialisation du Noyau...
        </p>
      </div>
    );
  }

  return (
    // CONTENEUR RACINE : Zéro scroll, 100% hauteur, flexibilité verticale
    <div className="h-full flex flex-col bg-[#0B0F1A] font-sans italic selection:bg-blue-600/30 text-white overflow-hidden">
      
      {/* NAVIGATION BAR SOUVERAINE (Fixée en haut, ne scrolle pas) */}
      <nav className="shrink-0 bg-[#0B0F1A]/90 border-b border-white/5 p-6 flex justify-between items-center z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-blue-500" size={24} />
          <span className="font-black uppercase tracking-tighter text-xl md:text-2xl italic leading-none m-0">
            QUALI<span className="text-blue-500">SOFT</span> MASTER
          </span>
        </div>
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[9px] md:text-[10px] font-black uppercase text-amber-500 tracking-widest shadow-lg shadow-amber-900/10">
          <Crown size={14} className="shrink-0" /> {user?.U_Email}
        </div>
      </nav>

      {/* ZONE DE TRAVAIL : Scrollable indépendamment */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative p-4 md:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
          
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all cursor-pointer bg-transparent border-none group m-0 p-0"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour Cockpit Master
          </button>

          <header className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase italic leading-none flex items-center gap-4 tracking-tighter m-0">
              <Rocket className="text-blue-600 shrink-0" size={48} /> Provisioning{" "}
              <span className="text-blue-600">Elite</span>
            </h1>
            <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] border-l-2 border-blue-600 pl-4 m-0">
              Initialisation dynamique d&apos;instance Qualisoft Elite RD 2030
            </p>
          </header>

          {/* FORMULAIRE DE DÉPLOIEMENT */}
          <form
            onSubmit={handleDeploy}
            className="space-y-10 bg-white/5 border border-white/10 p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl backdrop-blur-sm"
          >
            {/* SECTION 1 : ORGANISATION */}
            <div className="space-y-6 md:space-y-8">
              <h3 className="text-[10px] md:text-[11px] font-black text-blue-500 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-white/10 pb-4 m-0">
                <Building2 size={16} className="shrink-0" /> Identité du Nœud territorial
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2 text-left">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">
                    Dénomination Sociale
                  </label>
                  <input
                    required
                    placeholder="EX: SENELEC"
                    className="w-full p-4 md:p-5 bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl font-black text-white outline-none focus:border-blue-600 italic uppercase transition-colors placeholder:text-slate-600"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">
                    CEO / Directeur Général
                  </label>
                  <input
                    required
                    placeholder="NOM COMPLET"
                    className="w-full p-4 md:p-5 bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl font-black text-white outline-none focus:border-blue-600 italic uppercase transition-colors placeholder:text-slate-600"
                    value={formData.ceoName}
                    onChange={(e) =>
                      setFormData({ ...formData, ceoName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2 text-left">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">
                    Ligne Directe
                  </label>
                  <input
                    required
                    placeholder="+221 ..."
                    className="w-full p-4 md:p-5 bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl font-black text-white outline-none focus:border-blue-600 italic transition-colors placeholder:text-slate-600"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">
                    Adresse Siège
                  </label>
                  <input
                    required
                    placeholder="DAKAR, SÉNÉGAL"
                    className="w-full p-4 md:p-5 bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl font-black text-white outline-none focus:border-blue-600 italic uppercase transition-colors placeholder:text-slate-600"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2 : ADMIN RACINE */}
            <div className="space-y-6 md:space-y-8 pt-4">
              <h3 className="text-[10px] md:text-[11px] font-black text-amber-500 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-white/10 pb-4 m-0">
                <User size={16} className="shrink-0" /> Administrateur Racine (SMI)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2 text-left">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">
                    Prénom Admin
                  </label>
                  <input
                    required
                    placeholder="Prénom"
                    className="w-full p-4 md:p-5 bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl font-black text-white outline-none focus:border-amber-500 italic transition-colors placeholder:text-slate-600"
                    value={formData.adminFirstName}
                    onChange={(e) =>
                      setFormData({ ...formData, adminFirstName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">
                    Nom Admin
                  </label>
                  <input
                    required
                    placeholder="Nom"
                    className="w-full p-4 md:p-5 bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl font-black text-white outline-none focus:border-amber-500 italic uppercase transition-colors placeholder:text-slate-600"
                    value={formData.adminLastName}
                    onChange={(e) =>
                      setFormData({ ...formData, adminLastName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">
                  Email professionnel (Identifiant)
                </label>
                <input
                  required
                  type="email"
                  placeholder="admin@domaine.sn"
                  className="w-full p-4 md:p-5 bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl font-black text-white outline-none focus:border-amber-500 italic transition-colors placeholder:text-slate-600"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="pt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 md:py-8 bg-blue-600 text-white rounded-4xl md:rounded-[2.5rem] font-black uppercase text-[10px] md:text-xs tracking-[0.3em] md:tracking-[0.5em] flex justify-center items-center gap-4 hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50 cursor-pointer border-none"
              >
                {loading ? (
                  <Loader2 className="animate-spin shrink-0" size={24} />
                ) : (
                  <>
                    <Rocket size={20} className="shrink-0" /> Lancer le Déploiement Elite
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}