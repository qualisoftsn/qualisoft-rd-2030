/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { matrixApi, ProvisioningPayload } from "@/services/matrix.service";
import {
  ArrowLeft, Building2, CheckCircle2, Globe, 
  Loader2, Mail, Rocket, ShieldCheck, 
  Zap, UserCheck, Phone, MapPin
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

export default function MatrixDeployPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ✅ État étendu pour inclure les obligations du Schéma Prisma
  const [formData, setFormData] = useState({
    companyName: "",
    ceoName: "",
    email: "",
    adminFirstName: "",
    adminLastName: "",
    password: "Qualisoft@2026",
    phone: "",      // 👈 Obligatoire
    address: "",    // 👈 Obligatoire
  });

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 🛰️ Payload aligné à 100% sur le DTO Backend
      const payload: ProvisioningPayload = {
        companyName: formData.companyName,
        ceoName: formData.ceoName,
        email: formData.email,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        password: formData.password,
        phone: formData.phone,      // ✅ Ajouté
        address: formData.address,  // ✅ Ajouté
      };

      const result = await matrixApi.initialize(payload);

      if (result.success) {
        setIsSuccess(true);
        toast.success("Nœud Matrix scellé avec succès.");
        setTimeout(() => router.push("/admin/matrix"), 2500);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Échec du déploiement souverain.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center italic">
        <div className="text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20">
            <CheckCircle2 className="text-emerald-500" size={48} />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 italic">Nœud Scellé</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Propulsion vers le Registre...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-10 italic">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft size={14} /> Retour au Registre
          </button>
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full">
            <Zap size={14} className="text-blue-500" />
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Status: Master Provisioning</span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic">
            Déployer <span className="text-blue-600">Nouveau Nœud</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic">Initialisation d&apos;une instance de conformité ISO</p>
        </div>

        <form onSubmit={handleDeploy} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* IDENTITÉ DE L'ENTREPRISE */}
          <div className="bg-[#0F172A] border border-white/5 p-10 rounded-[3rem] space-y-8 shadow-2xl">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <Building2 size={14} /> Organisation & Leadership
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Nom de l&apos;Entité</label>
                <input
                  required type="text" placeholder="Ex: SENELEC"
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black outline-none focus:border-blue-600 transition-all italic"
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">CEO / DG</label>
                <div className="relative">
                  <UserCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input
                    required type="text" placeholder="Prénom & Nom du DG"
                    className="w-full pl-14 pr-5 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-blue-600 transition-all italic"
                    onChange={(e) => setFormData({ ...formData, ceoName: e.target.value })}
                  />
                </div>
              </div>

              {/* COORDONNÉES */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input
                      required type="text" placeholder="+221..."
                      className="w-full pl-12 pr-5 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-blue-600 transition-all italic"
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Adresse</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input
                      required type="text" placeholder="Dakar, SN"
                      className="w-full pl-12 pr-5 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-blue-600 transition-all italic"
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                <Globe className="text-slate-600" size={24} />
                <div className="overflow-hidden">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nœud de Destination</p>
                  <p className="text-sm font-black text-white italic truncate">
                    {formData.companyName ? formData.companyName.toLowerCase().replace(/\s+/g, "-") : "..."}.qualisoft.sn
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ADMINISTRATEUR RACINE */}
          <div className="bg-[#0F172A] border border-white/5 p-10 rounded-[3rem] space-y-8 shadow-2xl">
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <ShieldCheck size={14} /> Administrateur Racine
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Prénom</label>
                <input
                  required type="text"
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black outline-none focus:border-blue-600 transition-all italic"
                  onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Nom</label>
                <input
                  required type="text"
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black outline-none focus:border-blue-600 transition-all italic"
                  onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Email Principal</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input
                  required type="email" placeholder="admin@senelec.sn"
                  className="w-full pl-14 pr-5 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:border-blue-600 transition-all italic"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex items-center justify-between p-10 bg-[#0F172A] border border-white/5 rounded-[3rem] shadow-2xl">
            <div className="hidden md:block text-xs font-black uppercase text-slate-500 tracking-widest italic">
              Certification : ISO 9001 / 14001 / 27001
            </div>
            <button
              type="submit"
              disabled={isLoading || !formData.companyName || !formData.email || !formData.phone}
              className="px-12 py-6 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-slate-900 transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-xl shadow-blue-600/20 border-none cursor-pointer italic"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Rocket size={20} />}
              Lancer le Scellage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}