/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

/**
 * 📥 MODULE : RESOURCE ACCESS TERMINAL (GATEKEEPER)
 * -------------------------------------------------------------------------
 * FONCTION : Capture de leads avant libération de documents stratégiques.
 * RÔLE : Conversion prospect vers lead qualifié (§8.2 ISO 9001).
 * ISOLATION : Chaque téléchargement est horodaté et indexé dans le SDE Global.
 */

import apiClient from "@/core/api/api-client";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileDown,
  Fingerprint,
  Globe,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

export default function ResourceDownloadPage() {
  const [loading, setLoading] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    company: "",
    industry: "INDUSTRIE",
  });

  const handleAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Vérification des accréditations prospect...");

    try {
      // 🛰️ Enregistrement du prospect dans le Kernel avant libération
      await apiClient.post("/public/resource-access", formData);

      toast.success("ACCÈS AUTORISÉ : DOCUMENT DÉVERROUILLÉ", { id: tid });
      setDownloadReady(true);

      // Déclenchement automatique du téléchargement après 1.5s
      setTimeout(() => {
        triggerDownload();
      }, 1500);
    } catch (error) {
      toast.error("ERREUR DE LIAISON : ÉCHEC DU DÉVERROUILLAGE", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const triggerDownload = () => {
    // Chemin vers notre ressource scellée (PDF, etc.)
    const link = document.createElement("a");
    link.href = "/assets/docs/Qualisoft_Elite_Guide_ISO.pdf";
    link.download = "Qualisoft_Elite_Sovereign_Guide.pdf";
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30">
      {/* --- BACKGROUND MATRIX --- */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <img
          src="/images/qs_fondecran.webp"
          alt="Matrix"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#0B0F1A] via-transparent to-[#0B0F1A]"></div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 p-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-2 transition-transform"
          />{" "}
          Retour Portail
        </Link>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* --- ZONE VISUELLE : LA RESSOURCE --- */}
        <div className="text-left space-y-10">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <ShieldCheck size={20} /> Ressource Souveraine Certifiée
          </div>

          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] italic">
            Guide <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-indigo-500">
              Stratégique
            </span>
            <br />
            ISO 2026.
          </h1>

          <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
            Découvrez comment le{" "}
            <span className="text-white">Noyau Matrix</span> révolutionne la
            conformité multi-tenant et sécurise vos actifs immatériels.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
              <FileDown className="text-blue-500 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase text-white tracking-widest">
                Format PDF Haute Fidélité
              </p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
              <Fingerprint className="text-blue-500 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase text-white tracking-widest">
                Contenu Scellé Qualisoft
              </p>
            </div>
          </div>
        </div>

        {/* --- ZONE FORMULAIRE : LE GATEKEEPER --- */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-600/10 blur-[100px] rounded-full"></div>

          <div className="relative bg-[#0F172A]/80 border-2 border-white/10 p-12 rounded-[4rem] shadow-4xl backdrop-blur-2xl">
            {!downloadReady ? (
              <form onSubmit={handleAccessRequest} className="space-y-8">
                <div className="text-center mb-10">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                    Identification Prospect
                  </h3>
                  <div className="w-12 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="space-y-6">
                  {/* NOM COMPLET */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-500 ml-4 tracking-[0.2em]">
                      Responsable / Décideur
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600"
                        size={18}
                      />
                      <input
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                        placeholder="NOM ET PRÉNOM"
                        value={formData.fullname}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fullname: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* ENTREPRISE */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-500 ml-4 tracking-[0.2em]">
                      Raison Sociale
                    </label>
                    <div className="relative">
                      <Building2
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600"
                        size={18}
                      />
                      <input
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                        placeholder="NOM DE notre ORGANISATION"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            company: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-500 ml-4 tracking-[0.2em]">
                      Canal de communication
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600"
                        size={18}
                      />
                      <input
                        type="email"
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                        placeholder="EMAIL PROFESSIONNEL"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] text-white shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 cursor-pointer border-none"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Sparkles size={18} />
                  )}
                  DÉVERROUILLER L&apos;ACCÈS
                </button>
              </form>
            ) : (
              /* ÉTAT DE RÉUSSITE / TÉLÉCHARGEMENT EN COURS */
              <div className="py-20 flex flex-col items-center space-y-8 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                </div>
                <div className="text-center space-y-4">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">
                    Autorisation Accordée
                  </h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] italic animate-pulse">
                    Le téléchargement va démarrer automatiquement...
                  </p>
                </div>
                <button
                  onClick={triggerDownload}
                  className="mt-10 px-10 py-5 bg-white text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                >
                  Relancer manuellement
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- FOOTER SOUVERAIN --- */}
      <footer className="py-12 px-6 text-center border-t border-white/5 opacity-40">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] italic flex items-center justify-center gap-3">
          <Globe size={12} /> QUALISOFT ELITE RD 2030 • INFRASTRUCTURE
          MULTI-TENANT SÉCURISÉE
        </p>
      </footer>
    </div>
  );
}
