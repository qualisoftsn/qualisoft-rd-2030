'use client';

/**
 * 🛰️ MODULE : BIG BANG MATRIX (PROVISIONING) (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Création atomique d'un nouveau nœud territorial (Tenant).
 * FIX : ClickUp Style, Zéro Scroll Body, PWA Ready.
 * DATE : 06 Mars 2026 | 02:45 GMT
 * -------------------------------------------------------------------------
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Building2, CheckCircle2, Loader2, Mail, 
  Rocket, ShieldCheck, UserCheck, Globe, Lock, Phone, MapPin
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
    adminPassword: "Qualisoft@2026", // Mot de passe par défaut scellé
    adminFirstName: "",
    adminLastName: "",
    phone: "",
    address: "",
  });

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const tid = toast.loading("INITIALISATION DU PROTOCOLE DE SCELLAGE...");
    
    try {
      await matrixApi.initialize(formData);
      setIsSuccess(true);
      toast.success("NŒUD DÉPLOYÉ ET SCELLÉ.", { id: tid });
      setTimeout(() => router.push("/admin/matrix"), 2500);
    } catch (error: any) {
      const msg = error.response?.data?.message || "REJET DU KERNEL.";
      toast.error(`ERREUR MATRIX : ${Array.isArray(msg) ? msg[0] : msg}`, { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) return (
    <div className="h-full w-full flex items-center justify-center bg-[#0B0F1A] text-white italic">
      <div className="space-y-8 animate-in zoom-in duration-700">
        <div className="w-28 h-28 bg-emerald-500/10 border border-emerald-500/20 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 className="text-emerald-500" size={56} />
        </div>
        <h2 className="text-4xl font-black uppercase tracking-tighter italic m-0">Nœud Scellé</h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.6em] animate-pulse m-0">Initialisation du Noyau terminée...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col p-6 md:p-12 bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full">
      
      {/* 🔝 HEADER TACTIQUE */}
      <header className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
        <div className="space-y-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer uppercase tracking-widest group p-0">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour Registre Master
          </button>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none m-0 italic">
            Déployer <span className="text-blue-600">Instance</span>
          </h1>
        </div>
        <div className="px-6 py-3 bg-blue-600/10 border border-blue-600/20 rounded-full flex items-center gap-3">
          <ShieldCheck size={18} className="text-blue-500" />
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Master Provisioning Node</span>
        </div>
      </header>

      {/* 📜 FORMULAIRE SCROLLABLE */}
      <form onSubmit={handleDeploy} className="flex-1 overflow-y-auto custom-scrollbar pr-4 grid grid-cols-1 xl:grid-cols-2 gap-10">
        
        {/* SECTION 1 : ORGANISATION */}
        <div className="bg-white/5 border border-white/5 p-10 rounded-[3.5rem] space-y-8 shadow-2xl h-fit">
          <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-3 m-0 border-b border-white/5 pb-6">
            <Building2 size={20} /> Identité Territoriale
          </h3>
          <div className="space-y-6">
            <MatrixInput label="Désignation Sociale" placeholder="EX: SDE SÉNÉGAL" value={formData.companyName} onChange={v => setFormData({...formData, companyName: v})} />
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">Domaine Matrix (Slug)</label>
              <div className="relative">
                <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600" size={20} />
                <input required className="w-full bg-[#0B0F1A] border border-white/5 py-5 pl-16 pr-6 rounded-3xl text-white font-black italic outline-none focus:border-blue-600 transition-all" value={formData.customSlug} onChange={e => setFormData({...formData, customSlug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} placeholder="sde-corp" />
              </div>
              <p className="text-[9px] text-slate-500 font-bold ml-4 uppercase mt-2 tracking-widest">{formData.customSlug || '...'}.qualisoft.sn</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MatrixInput label="Contact Direct" placeholder="+221..." value={formData.phone} onChange={v => setFormData({...formData, phone: v})} icon={Phone} />
              <MatrixInput label="Ville Siège" placeholder="DAKAR" value={formData.address} onChange={v => setFormData({...formData, address: v})} icon={MapPin} />
            </div>
          </div>
        </div>

        {/* SECTION 2 : AUTORITÉ RACINE */}
        <div className="bg-white/5 border border-white/5 p-10 rounded-[3.5rem] space-y-8 shadow-2xl h-fit">
          <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-3 m-0 border-b border-white/5 pb-6">
            <UserCheck size={20} /> Administrateur de Nœud
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MatrixInput label="Prénom" placeholder="John" value={formData.adminFirstName} onChange={v => setFormData({...formData, adminFirstName: v})} />
              <MatrixInput label="Nom" placeholder="Doe" value={formData.adminLastName} onChange={v => setFormData({...formData, adminLastName: v})} />
            </div>
            <MatrixInput label="Email de Connexion" placeholder="admin@client.sn" value={formData.email} onChange={v => setFormData({...formData, email: v})} icon={Mail} />
            <MatrixInput label="Code d'Accès Provisoire" type="password" placeholder="••••••••" value={formData.adminPassword} onChange={v => setFormData({...formData, adminPassword: v})} icon={Lock} />
          </div>
        </div>

        {/* BOUTON D'ACTION */}
        <div className="xl:col-span-2 py-10">
          <button type="submit" disabled={isLoading} className="w-full py-8 md:py-10 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.5em] flex items-center justify-center gap-4 hover:bg-white hover:text-slate-900 transition-all border-none cursor-pointer shadow-2xl active:scale-95 disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Rocket size={24} />}
            {isLoading ? "Séquence de Scellage..." : "Lancer le Déploiement Elite"}
          </button>
        </div>
      </form>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
      `}</style>
    </div>
  );
}

function MatrixInput({ label, placeholder, value, onChange, icon: Icon, type = "text" }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest italic">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />}
        <input 
          type={type} required placeholder={placeholder}
          className={`w-full bg-[#0B0F1A] border border-white/5 rounded-3xl py-5 px-6 font-black italic text-white outline-none focus:border-blue-600 transition-all uppercase ${Icon ? 'pl-16' : ''}`}
          value={value} onChange={e => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}