/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { X, Building2, User, Mail, Phone, MapPin, Loader2, Globe, Lock, ShieldCheck } from "lucide-react";
import { matrixApi } from "@/services/matrix.service";
import { toast } from "sonner";

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeployTenantModal({ isOpen, onClose, onSuccess }: DeployModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    customSlug: "", // 👈 LE CHAMP CLÉ POUR AVOIR DES NOMS COURTS
    ceoName: "",
    email: "",
    adminFirstName: "",
    adminLastName: "",
    adminPassword: "", // 👈 LE MOT DE PASSE OBLIGATOIRE
    phone: "",
    address: ""
  });

  // Génération automatique du slug (modifiable) pour gagner du temps
  useEffect(() => {
    if (!formData.customSlug && formData.companyName) {
      const slug = formData.companyName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Remplace espaces par tirets
        .replace(/[^a-z0-9-]/g, '') // Enlève caractères spéciaux
        .substring(0, 15);          // ✂️ Coupe si c'est trop long par défaut
      
      setFormData(prev => ({ ...prev, customSlug: slug }));
    }
  }, [formData.companyName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Scellage du Nœud en cours...");

    try {
      await matrixApi.initialize(formData);
      toast.success("Nœud déployé avec succès !", { id: tid });
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        companyName: "", customSlug: "", ceoName: "", email: "",
        adminFirstName: "", adminLastName: "", adminPassword: "",
        phone: "", address: ""
      });
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erreur de validation";
      toast.error(`REJET KERNEL : ${Array.isArray(msg) ? msg[0] : msg}`, { id: tid });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0F172A] w-full max-w-4xl border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
              <ShieldCheck className="text-blue-600" /> Initialisation Nœud
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Provisioning Express Qualisoft Elite</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-red-500 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE FORM */}
        <div className="overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <form id="deployForm" onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECTION 1: IDENTITÉ ORGANISATION */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest border-l-2 border-blue-500 pl-3">Identité Organisation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-3">Raison Sociale</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input required placeholder="ex: Port Autonome de Dakar" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all uppercase"
                      value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                  </div>
                </div>

                {/* 🚀 LE CHAMP QUI MANQUAIT POUR LE BACKEND */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-amber-500 uppercase ml-3 flex justify-between">
                    <span>Identifiant Court (Slug)</span>
                    <span className="opacity-50 text-[8px] lowercase">{formData.customSlug}.qualisoft.sn</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600" size={16} />
                    <input required placeholder="ex: pad" className="w-full bg-slate-900/50 border border-amber-900/30 rounded-xl py-4 pl-12 pr-4 text-sm font-bold text-amber-500 focus:border-amber-500 outline-none transition-all lowercase"
                      value={formData.customSlug} onChange={e => setFormData({...formData, customSlug: e.target.value})} />
                  </div>
                  <p className="text-[8px] text-slate-500 ml-4 italic">C&apos;est ce nom court qui sera utilisé dans l&apos;URL. Modifiez-le pour faire court !</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-3">Directeur Général</label>
                  <input required placeholder="Prénom & Nom" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 px-5 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all uppercase"
                    value={formData.ceoName} onChange={e => setFormData({...formData, ceoName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-3">Téléphone & Adresse</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input required placeholder="+221..." className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 px-4 text-sm font-bold text-white focus:border-blue-500 outline-none"
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                     <input required placeholder="Dakar..." className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 px-4 text-sm font-bold text-white focus:border-blue-500 outline-none uppercase"
                      value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: ADMINISTRATEUR */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">Premier Administrateur</h3>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-3">Prénom</label>
                  <input required className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 px-5 text-sm font-bold text-white focus:border-emerald-500 outline-none uppercase"
                    value={formData.adminFirstName} onChange={e => setFormData({...formData, adminFirstName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-3">Nom</label>
                  <input required className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 px-5 text-sm font-bold text-white focus:border-emerald-500 outline-none uppercase"
                    value={formData.adminLastName} onChange={e => setFormData({...formData, adminLastName: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-3">Email de Connexion</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input required type="email" placeholder="admin@client.sn" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:border-emerald-500 outline-none"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>

                {/* 🚀 LE MOT DE PASSE OBLIGATOIRE */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-3">Mot de Passe Initial</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={16} />
                    <input required type="text" placeholder="Secret..." className="w-full bg-slate-900/50 border border-emerald-900/30 rounded-xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:border-emerald-500 outline-none"
                      value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-4 rounded-xl text-xs font-black uppercase text-slate-500 hover:text-white hover:bg-slate-800 transition-all">Annuler</button>
          <button form="deployForm" disabled={loading} className="px-10 py-4 rounded-xl text-xs font-black uppercase text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
            Lancer l&apos;Initialisation
          </button>
        </div>
      </div>
    </div>
  );
}