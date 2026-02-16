/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Building2, CheckCircle2, Loader2, Mail, 
  Rocket, ShieldCheck, Zap, UserCheck, Phone, MapPin, Globe, Lock
} from "lucide-react";
import { matrixApi, ProvisioningPayload } from "@/services/matrix.service";
import { toast } from "sonner";

export default function MatrixDeployPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState<ProvisioningPayload & { customSlug: string; adminPassword: string }>({
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
    const tid = toast.loading("Déclenchement du Big Bang Matrix...");
    try {
      await matrixApi.initialize(formData);
      setIsSuccess(true);
      toast.success("Nœud déployé : Siège et DG scellés avec succès.", { id: tid });
      setTimeout(() => router.push("/admin/matrix"), 2500);
    } catch (error: any) {
      const backendMessage = error.response?.data?.message;
      const finalMsg = Array.isArray(backendMessage) ? backendMessage[0] : backendMessage || "Échec du scellage.";
      toast.error(`ERREUR KERNEL : ${finalMsg}`, { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center italic">
      <div className="text-center animate-in zoom-in duration-700">
        <div className="w-28 h-28 bg-emerald-500/10 border border-emerald-500/20 rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30">
          <CheckCircle2 className="text-emerald-500" size={56} />
        </div>
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-3 italic">Nœud Scellé</h2>
        <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.5em] animate-pulse">Configuration du domaine et de l&apos;autorité terminée...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6 md:p-12 italic selection:bg-blue-500/30 font-sans">
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-3 text-[10px] font-black text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer uppercase tracking-widest group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour au Registre
          </button>
          <div className="flex items-center gap-3 px-5 py-2.5 bg-blue-600/5 border border-blue-600/20 rounded-full">
            <Zap size={14} className="text-blue-500" />
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Master Supervision System</span>
          </div>
        </div>

        <div className="space-y-4 text-left">
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none italic">Déployer <span className="text-blue-600">Nouveau Nœud</span></h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] italic border-l-4 border-blue-600 pl-4">Initialisation d&apos;instance multi-tenancy Qualisoft Elite</p>
        </div>

        <form onSubmit={handleDeploy} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-[#0F172A]/50 backdrop-blur-xl border border-white/5 p-10 rounded-[3.5rem] space-y-10 shadow-2xl">
            <h3 className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-3"><Building2 size={16} /> Identité du Nœud</h3>
            <div className="space-y-7 text-left">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Nom de l&apos;Organisation</label>
                <input required type="text" placeholder="EX: SENELEC" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black outline-none focus:border-blue-600 transition-all italic" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Sous-domaine personnalisé (Slug)</label>
                <div className="relative">
                  <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                  <input required type="text" placeholder="ex: senelec-corp" className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-blue-600 transition-all italic" value={formData.customSlug} onChange={e => setFormData({...formData, customSlug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
                </div>
                <p className="text-[9px] text-slate-600 font-bold ml-4">URL FINALE : {formData.customSlug || '...'}.qualisoft.sn</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Téléphone</label><input required type="text" placeholder="+221..." className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-blue-600 transition-all italic" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Adresse</label><input required type="text" placeholder="DAKAR, SN" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-blue-600 transition-all italic" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
              </div>
            </div>
          </div>

          <div className="bg-[#0F172A]/50 backdrop-blur-xl border border-white/5 p-10 rounded-[3.5rem] space-y-10 shadow-2xl">
            <h3 className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-3"><ShieldCheck size={16} /> Autorité Admin Racine</h3>
            <div className="space-y-6 text-left">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Prénom</label><input required type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black outline-none focus:border-amber-600 transition-all italic" value={formData.adminFirstName} onChange={e => setFormData({...formData, adminFirstName: e.target.value})} /></div>
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Nom</label><input required type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black outline-none focus:border-amber-600 transition-all italic" value={formData.adminLastName} onChange={e => setFormData({...formData, adminLastName: e.target.value})} /></div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Email de Supervision</label>
                <input required type="email" placeholder="admin@domaine.sn" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-amber-600 transition-all italic" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Mot de passe Administrateur</label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-600" size={18} />
                  <input required type="password" placeholder="********" className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-amber-600 transition-all italic" value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col md:flex-row items-center justify-between p-10 bg-[#0F172A] border border-white/5 rounded-[3.5rem] shadow-2xl gap-8">
            <button type="submit" disabled={isLoading} className="w-full px-20 py-8 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-5 hover:bg-white hover:text-slate-900 transition-all border-none cursor-pointer shadow-2xl italic text-xs active:scale-95 disabled:opacity-50">
              {isLoading ? <><Loader2 className="animate-spin" size={22} /> SCELLAGE DU NŒUD...</> : <><Rocket size={22} /> INITIALISER LE NŒUD</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}