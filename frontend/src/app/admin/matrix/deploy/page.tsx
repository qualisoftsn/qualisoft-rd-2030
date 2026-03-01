/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🛰️ MODULE : BIG BANG MATRIX (PROVISIONING)
 * -------------------------------------------------------------------------
 * RÔLE : Création atomique d'un nouveau nœud territorial.
 * EFFET : Génère le Tenant, le Site, l'OrgUnit DG et l'Admin Racine.
 * -------------------------------------------------------------------------
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Building2, CheckCircle2, Loader2, Mail, 
  Rocket, ShieldCheck, Zap, UserCheck, Phone, MapPin, Globe, Lock
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
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center italic text-center">
      <div className="space-y-8 animate-in zoom-in duration-700">
        <div className="w-28 h-28 bg-emerald-500/10 border border-emerald-500/20 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 className="text-emerald-500" size={56} />
        </div>
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Instance Scellée</h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Initialisation du Noyau terminée...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-12 italic font-sans selection:bg-blue-600/30">
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-3 text-[10px] font-black text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer uppercase tracking-widest group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour Registre
          </button>
          <div className="px-6 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full flex items-center gap-3">
             <ShieldCheck size={14} className="text-blue-500" />
             <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em]">Master Provisioning Node</span>
          </div>
        </div>

        <div className="space-y-4 text-left">
          <h1 className="text-6xl font-black text-white uppercase tracking-tighter leading-none italic">Déployer <span className="text-blue-600">Instance</span></h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] italic border-l-4 border-blue-600 pl-6">Création atomique d&apos;un nouveau nœud territorial RD 2030</p>
        </div>

        <form onSubmit={handleDeploy} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* SECTION 1 : IDENTITÉ */}
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-12 rounded-[4rem] space-y-10 shadow-3xl text-left">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-4"><Building2 size={18} /> Organisation & Domaine</h3>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Raison Sociale</label>
                <input required type="text" placeholder="EX: SDE - SÉNÉGAL" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black outline-none focus:border-blue-600 italic uppercase" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Sous-domaine Matrix (Slug)</label>
                <div className="relative">
                  <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                  <input required type="text" placeholder="ex: sde-corp" className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-blue-600 italic" value={formData.customSlug} onChange={e => setFormData({...formData, customSlug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
                </div>
                <p className="text-[9px] text-slate-600 font-bold ml-4 uppercase tracking-widest">URL : {formData.customSlug || '...'}.qualisoft.sn</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase ml-4">Contact</label><input required type="text" placeholder="+221..." className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none italic" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                 <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase ml-4">Ville</label><input required type="text" placeholder="DAKAR" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none italic uppercase" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
              </div>
            </div>
          </div>

          {/* SECTION 2 : AUTORITÉ */}
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-12 rounded-[4rem] space-y-10 shadow-3xl text-left">
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-4"><UserCheck size={18} /> Administrateur Racine</h3>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase ml-4">Prénom</label><input required type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black outline-none focus:border-amber-500 italic" value={formData.adminFirstName} onChange={e => setFormData({...formData, adminFirstName: e.target.value})} /></div>
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase ml-4">Nom</label><input required type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black outline-none focus:border-amber-500 italic uppercase" value={formData.adminLastName} onChange={e => setFormData({...formData, adminLastName: e.target.value})} /></div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Email de Connexion</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input required type="email" placeholder="admin@domaine.sn" className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-amber-500 italic" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Code d&apos;Accès Provisoire</label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                  <input required type="password" placeholder="••••••••" className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-amber-500 tracking-[0.5em]" value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="lg:col-span-2 w-full py-10 bg-blue-600 text-white rounded-4xl font-black uppercase tracking-[0.5em] flex items-center justify-center gap-6 hover:bg-white hover:text-slate-900 transition-all border-none cursor-pointer shadow-3xl disabled:opacity-50 active:scale-95">
            {isLoading ? <><Loader2 className="animate-spin" size={24} /> Séquence de Scellage...</> : <><Rocket size={24} /> Déclencher le Déploiement</>}
          </button>
        </form>
      </div>
    </div>
  );
}