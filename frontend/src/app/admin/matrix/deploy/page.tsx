/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🛰️ MODULE : BIG BANG MATRIX (PROVISIONING) (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Création atomique d'un nouveau nœud territorial.
 * FIX : ClickUp Style - Responsive form, Zéro min-h-screen destructeur.
 * RÉVISION : 04 Mars 2026 | 22:54 GMT
 * -------------------------------------------------------------------------
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Building2, CheckCircle2, Loader2, Mail, 
  Rocket, ShieldCheck, UserCheck, Globe, Lock
} from "lucide-react";
import { matrixApi } from "@/services/matrix.service";
import { toast } from "sonner";

export default function MatrixDeployPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    customSlug: "",
    ceoName: "",
    email: "",
    adminPassword: "",
    adminFirstName: "",
    adminLastName: "",
    phone: "",
    address: "",
  });

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const tid = toast.loading("Déclenchement du Protocole de Scellage...");
    
    try {
      await matrixApi.initialize(formData);
      setIsSuccess(true);
      toast.success("Nœud déployé avec succès.", { id: tid });
      setTimeout(() => router.push("/admin/matrix"), 2500);
    } catch (error: any) {
      const backendMessage = error.response?.data?.message;
      const finalMsg = Array.isArray(backendMessage) ? backendMessage[0] : backendMessage || "Rejet du Kernel.";
      toast.error(`ERREUR MATRIX : ${finalMsg}`, { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) return (
    <div className="h-full w-full flex items-center justify-center italic text-center bg-[#0B0F1A]">
      <div className="space-y-6 md:space-y-8 animate-in zoom-in duration-700">
        <div className="w-24 h-24 md:w-28 md:h-28 bg-emerald-500/10 border border-emerald-500/20 rounded-4xl md:rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 className="text-emerald-500" size={48} />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic m-0">Instance Scellée</h2>
        <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] animate-pulse m-0">Initialisation du Noyau terminée...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col italic font-sans selection:bg-blue-600/30 text-white">
      <div className="flex flex-col flex-1 space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-20">
        
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <button onClick={() => router.back()} className="flex items-center gap-3 text-[9px] md:text-[10px] font-black text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer uppercase tracking-widest group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour Registre
          </button>
          <div className="px-4 md:px-6 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full flex items-center gap-2 md:gap-3 shrink-0">
             <ShieldCheck size={14} className="text-blue-500 shrink-0" />
             <span className="text-[8px] md:text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">Master Provisioning Node</span>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4 text-left shrink-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-none italic m-0">
            Déployer <span className="text-blue-600">Instance</span>
          </h1>
          <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] italic border-l-4 border-blue-600 pl-4 md:pl-6 m-0">
            Création atomique d&apos;un nouveau nœud territorial RD 2030
          </p>
        </div>

        <form onSubmit={handleDeploy} className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-12 flex-1">
          
          {/* SECTION 1 : IDENTITÉ */}
          <div className="bg-white/5 backdrop-blur-md border border-white/5 p-8 md:p-12 rounded-[3rem] space-y-8 shadow-2xl text-left">
            <h3 className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-3 m-0">
              <Building2 size={16} /> Organisation & Domaine
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase ml-2">Raison Sociale</label>
                <input required type="text" placeholder="EX: SDE - SÉNÉGAL" className="w-full bg-[#0B0F1A] border border-white/5 p-4 md:p-5 rounded-2xl text-white font-black outline-none focus:border-blue-600 transition-colors italic uppercase" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase ml-2">Sous-domaine Matrix (Slug)</label>
                <div className="relative">
                  <Globe className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                  <input required type="text" placeholder="ex: sde-corp" className="w-full pl-12 md:pl-16 pr-6 py-4 md:py-5 bg-[#0B0F1A] border border-white/5 rounded-2xl text-white font-black outline-none focus:border-blue-600 transition-colors italic" value={formData.customSlug} onChange={e => setFormData({...formData, customSlug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
                </div>
                <p className="text-[8px] md:text-[9px] text-slate-500 font-bold ml-2 uppercase tracking-widest m-0 mt-2">URL : {formData.customSlug || '...'}.qualisoft.sn</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase ml-2">Contact</label>
                   <input required type="text" placeholder="+221..." className="w-full p-4 md:p-5 bg-[#0B0F1A] border border-white/5 rounded-2xl text-white font-black outline-none focus:border-blue-600 transition-colors italic" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase ml-2">Ville</label>
                   <input required type="text" placeholder="DAKAR" className="w-full p-4 md:p-5 bg-[#0B0F1A] border border-white/5 rounded-2xl text-white font-black outline-none focus:border-blue-600 transition-colors italic uppercase" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                 </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 : AUTORITÉ */}
          <div className="bg-white/5 backdrop-blur-md border border-white/5 p-8 md:p-12 rounded-[3rem] space-y-8 shadow-2xl text-left">
            <h3 className="text-[9px] md:text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-3 m-0">
              <UserCheck size={16} /> Administrateur Racine
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase ml-2">Prénom</label>
                  <input required type="text" className="w-full bg-[#0B0F1A] border border-white/5 p-4 md:p-5 rounded-2xl text-white font-black outline-none focus:border-amber-500 transition-colors italic" value={formData.adminFirstName} onChange={e => setFormData({...formData, adminFirstName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase ml-2">Nom</label>
                  <input required type="text" className="w-full bg-[#0B0F1A] border border-white/5 p-4 md:p-5 rounded-2xl text-white font-black outline-none focus:border-amber-500 transition-colors italic uppercase" value={formData.adminLastName} onChange={e => setFormData({...formData, adminLastName: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase ml-2">Email de Connexion</label>
                <div className="relative">
                  <Mail className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input required type="email" placeholder="admin@domaine.sn" className="w-full pl-12 md:pl-16 pr-6 py-4 md:py-5 bg-[#0B0F1A] border border-white/5 rounded-2xl text-white font-black outline-none focus:border-amber-500 transition-colors italic" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase ml-2">Code d&apos;Accès Provisoire</label>
                <div className="relative">
                  <Lock className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                  <input required type="password" placeholder="••••••••" className="w-full pl-12 md:pl-16 pr-6 py-4 md:py-5 bg-[#0B0F1A] border border-white/5 rounded-2xl text-white font-black outline-none focus:border-amber-500 transition-colors tracking-[0.5em]" value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-2 pt-4 shrink-0">
            <button type="submit" disabled={isLoading} className="w-full py-8 md:py-10 bg-blue-600 text-white rounded-4xl md:rounded-4xl font-black uppercase text-[10px] md:text-xs tracking-[0.3em] md:tracking-[0.5em] flex items-center justify-center gap-4 hover:bg-white hover:text-slate-900 transition-all border-none cursor-pointer shadow-2xl disabled:opacity-50 active:scale-95">
              {isLoading ? <><Loader2 className="animate-spin shrink-0" size={24} /> Séquence de Scellage...</> : <><Rocket size={24} className="shrink-0" /> Déclencher le Déploiement</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}