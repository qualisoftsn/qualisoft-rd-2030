/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Building2, CheckCircle2, Loader2, Mail, 
  Rocket, ShieldCheck, Zap, UserCheck, Phone, MapPin, Globe 
} from "lucide-react";
import { matrixApi, ProvisioningPayload } from "@/services/matrix.service";
import { toast } from "sonner";

/**
 * 🚀 PAGE DE DÉPLOIEMENT MATRIX ELITE RD 2030
 * Rôle : Initialisation souveraine des instances multi-tenants.
 */
export default function MatrixDeployPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ✅ État scellé conforme au DTO Backend
  const [formData, setFormData] = useState({
    companyName: "",
    ceoName: "",
    email: "",
    adminFirstName: "",
    adminLastName: "",
    password: "Qualisoft@2026",
    phone: "",
    address: "",
  });

  // 🛰️ Calcul du domaine en temps réel pour l'UX
  const domainPreview = useMemo(() => {
    if (!formData.companyName) return "...";
    return formData.companyName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }, [formData.companyName]);

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 🛡️ Transmission au Noyau Master
      const result = await matrixApi.initialize(formData as ProvisioningPayload);

      if (result.success) {
        setIsSuccess(true);
        toast.success("Nœud Matrix scellé avec succès.");
        setTimeout(() => router.push("/admin/matrix"), 2500);
      }
    } catch (error: any) {
      // 🛠️ Gestion fine des erreurs de validation NestJS
      const backendMessage = error.response?.data?.message;
      const finalMsg = Array.isArray(backendMessage) 
        ? backendMessage[0] 
        : backendMessage || "Échec du déploiement souverain.";
      
      toast.error(finalMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center italic">
        <div className="text-center animate-in zoom-in duration-700">
          <div className="w-28 h-28 bg-emerald-500/10 border border-emerald-500/20 rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30">
            <CheckCircle2 className="text-emerald-500" size={56} />
          </div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-3 italic">Nœud Scellé</h2>
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.5em] animate-pulse">Propulsion vers le Registre Master...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6 md:p-12 italic selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* BARRE DE NAVIGATION HAUTE */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all bg-transparent border-none cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Retour au Registre
          </button>
          
          <div className="flex items-center gap-3 px-5 py-2.5 bg-blue-600/5 border border-blue-600/20 rounded-full">
            <Zap size={14} className="text-blue-500 animate-pulse" />
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Protocol: Provisioning v2.0</span>
          </div>
        </div>

        {/* TITRE DE SECTION */}
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none italic">
            Déployer <span className="text-blue-600">Nouveau Nœud</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] italic opacity-70">
            Initialisation d&apos;une instance de gouvernance Qualisoft Elite RD 2030
          </p>
        </div>

        <form onSubmit={handleDeploy} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* COLONNE 1 : IDENTITÉ ORGANISATIONNELLE */}
          <div className="bg-[#0F172A]/50 backdrop-blur-xl border border-white/5 p-10 rounded-[3.5rem] space-y-10 shadow-2xl">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <Building2 size={16} /> Organisation & Leadership
            </h3>
            
            <div className="space-y-7">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Nom de l&apos;Entité</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Ex: SENELEC" 
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black outline-none focus:border-blue-600 focus:ring-4 ring-blue-600/10 transition-all italic placeholder:text-slate-700" 
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">CEO / Directeur Général</label>
                <div className="relative">
                  <UserCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                  <input 
                    required 
                    type="text" 
                    placeholder="Prénom & Nom" 
                    className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-blue-600 transition-all italic placeholder:text-slate-700" 
                    onChange={(e) => setFormData({ ...formData, ceoName: e.target.value })} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input required type="text" placeholder="+221..." className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-blue-600 transition-all italic placeholder:text-slate-700" onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Adresse</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input required type="text" placeholder="Dakar, SN" className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-blue-600 transition-all italic placeholder:text-slate-700" onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* PRÉVISUALISATION DU DOMAINE */}
              <div className="p-6 bg-blue-600/5 border border-blue-600/10 rounded-4xl flex items-center gap-5">
                <div className="p-3 bg-blue-600/10 rounded-xl">
                  <Globe className="text-blue-500" size={24} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[9px] font-black text-blue-500/50 uppercase tracking-widest mb-1">Nœud de destination</p>
                  <p className="text-sm font-black text-white italic truncate tracking-tight">
                    https://<span className="text-blue-500">{domainPreview}</span>.qualisoft.sn
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* COLONNE 2 : ADMINISTRATEUR RACINE */}
          <div className="bg-[#0F172A]/50 backdrop-blur-xl border border-white/5 p-10 rounded-[3.5rem] space-y-10 shadow-2xl">
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <ShieldCheck size={16} /> Autorité Racine (Admin)
            </h3>
            
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Prénom</label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black outline-none focus:border-amber-600 transition-all italic" onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Nom</label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black outline-none focus:border-amber-600 transition-all italic" onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email de Connexion</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                  <input 
                    required 
                    type="email" 
                    placeholder="admin@organisation.sn" 
                    className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-amber-600 transition-all italic placeholder:text-slate-700" 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  />
                </div>
              </div>

              <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-4xl space-y-3">
                <p className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest">Sécurité par défaut</p>
                <p className="text-xs text-slate-400 leading-relaxed font-bold">
                  Le mot de passe initial est scellé sur <span className="text-white">Qualisoft@2026</span>. 
                  L&apos;administrateur devra le renouveler dès la première connexion souveraine.
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER : ACTIONS DE DÉPLOIEMENT */}
          <div className="lg:col-span-2 flex flex-col md:flex-row items-center justify-between p-10 bg-[#0F172A] border border-white/5 rounded-[3rem] shadow-2xl gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                <ShieldCheck className="text-slate-500" size={24} />
              </div>
              <div className="hidden md:block">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Certification Compliance</p>
                <p className="text-[10px] font-black text-white uppercase italic">ISO 9001 / 14001 / 27001 READY</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.companyName || !formData.email}
              className="w-full md:w-auto px-16 py-7 bg-blue-600 text-white rounded-4xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-5 hover:bg-white hover:text-slate-900 transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-[0_0_50px_rgba(37,99,235,0.2)] border-none cursor-pointer italic text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Calcul du Nœud...
                </>
              ) : (
                <>
                  <Rocket size={20} />
                  Lancer le Scellage
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-[9px] font-black text-slate-600 uppercase tracking-[0.8em] pb-10">
          Qualisoft Elite RD 2030 • Master Supervision System
        </p>
      </div>
    </div>
  );
}