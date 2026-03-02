/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 📥 MODULE : src/app/(public)/resources/download/page.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Terminal d'accès aux ressources stratégiques (Lead Capture).
 * RÔLE : Conversion prospect vers lead qualifié ISO 9001.
 * SÉCURITÉ : Horodatage et indexation dans le SDE Master.
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 17:16 GMT
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import apiClient from "@/core/api/api-client";
import { 
  ArrowLeft, Building2, CheckCircle2, FileDown, Fingerprint, 
  Globe, Loader2, Mail, ShieldCheck, Sparkles, User 
} from "lucide-react";
import { toast, Toaster } from "sonner";

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
    const tid = toast.loading("Vérification des accréditations...");

    try {
      await apiClient.post("/public/resource-access", formData);
      toast.success("ACCÈS AUTORISÉ : Ressource déverrouillée.", { id: tid });
      setDownloadReady(true);
      setTimeout(triggerDownload, 1500);
    } catch (error) {
      toast.error("ERREUR DE LIAISON : Accès refusé.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const triggerDownload = () => {
    const link = document.createElement("a");
    link.href = "/assets/docs/Qualisoft_Elite_Sovereign_Guide.pdf";
    link.download = "Qualisoft_Elite_Guide_2026.pdf";
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30 overflow-x-hidden text-left">
      <Toaster position="top-right" richColors theme="dark" />
      
      <div className="absolute inset-0 opacity-10 pointer-events-none grayscale brightness-50">
        <img src="/images/qs_fondecran.webp" alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-b from-[#0B0F1A] via-transparent to-[#0B0F1A]" />
      </div>

      <nav className="fixed top-0 w-full z-50 p-8">
        <Link href="/" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all group no-underline">
          <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> RETOUR PORTAIL
        </Link>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center min-h-[90vh]">
        <div className="space-y-10 animate-in slide-in-from-left-8 duration-1000">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={20} /> Ressource Souveraine Certifiée
          </div>

          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] italic m-0">
            Guide <br /> <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-indigo-400">Stratégique</span> <br /> ISO 2026.
          </h1>

          <p className="text-slate-400 text-lg md:text-xl font-bold leading-relaxed max-w-xl m-0 opacity-80">
            Découvrez comment le <span className="text-white">Noyau Matrix</span> révolutionne la conformité multi-tenant et sécurise vos actifs immatériels.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-blue-500/20 transition-all">
              <FileDown className="text-blue-500 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase text-white tracking-widest m-0 leading-none">Format PDF Master</p>
            </div>
            <div className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-blue-500/20 transition-all">
              <Fingerprint className="text-blue-500 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase text-white tracking-widest m-0 leading-none">Contenu Scellé SDE</p>
            </div>
          </div>
        </div>

        <div className="relative animate-in zoom-in duration-1000">
          <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full" />
          <div className="relative bg-[#0F172A]/80 border border-white/10 p-10 lg:p-14 rounded-[3.5rem] lg:rounded-[4.5rem] shadow-4xl backdrop-blur-3xl">
            {!downloadReady ? (
              <form onSubmit={handleAccessRequest} className="space-y-8">
                <div className="text-center mb-10">
                  <h3 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-white m-0">Identification Prospect</h3>
                  <div className="w-12 h-1 bg-blue-600 mx-auto mt-5 rounded-full" />
                </div>

                <div className="space-y-6">
                  <Input icon={User} label="Responsable / Décideur" placeholder="NOM COMPLET" value={formData.fullname} onChange={(v: string) => setFormData({...formData, fullname: v.toUpperCase()})} />
                  <Input icon={Building2} label="Organisation" placeholder="RAISON SOCIALE" value={formData.company} onChange={(v: string) => setFormData({...formData, company: v.toUpperCase()})} />
                  <Input icon={Mail} label="Email Master" placeholder="ADRESSE PROFESSIONNELLE" type="email" value={formData.email} onChange={(v: any) => setFormData({...formData, email: v})} />
                </div>

                <button disabled={loading} className="w-full bg-blue-600 hover:bg-white hover:text-blue-600 py-7 rounded-3xl font-black uppercase text-[11px] tracking-widest transition-all shadow-3xl active:scale-95 border-none cursor-pointer flex items-center justify-center gap-4 text-white">
                  {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> DÉVERROUILLER L&apos;ACCÈS</>}
                </button>
              </form>
            ) : (
              <div className="py-20 flex flex-col items-center space-y-8 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 shadow-4xl"><CheckCircle2 size={48} className="text-emerald-500" /></div>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter m-0">Accès Accordé</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic animate-pulse m-0">Le téléchargement démarre automatiquement...</p>
                <button onClick={triggerDownload} className="mt-10 px-10 py-5 bg-white text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl border-none cursor-pointer">RELANCER MANUELLEMENT</button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-12 px-6 text-center border-t border-white/5 opacity-30">
        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.6em] italic m-0">QUALISOFT ELITE RD 2026 • INFRASTRUCTURE SOUVERAINE</p>
      </footer>
    </div>
  );
}

function Input({ icon: Icon, label, ...props }: any) {
  return (
    <div className="space-y-2 group">
      <label className="text-[9px] font-black uppercase text-slate-600 ml-4 tracking-widest italic group-focus-within:text-blue-500 transition-colors">{label}</label>
      <div className="relative">
        <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" size={18} />
        <input {...props} className="w-full bg-black/40 border border-white/5 rounded-2xl py-6 pl-16 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all shadow-inner placeholder:opacity-5" onChange={e => props.onChange(e.target.value)} />
      </div>
    </div>
  );
}