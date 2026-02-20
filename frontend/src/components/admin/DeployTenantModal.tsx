/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : DeployTenantModal
 * -------------------------------------------------------------------------
 * RÔLE : Interface de création de Tenant (Provisioning Kernel).
 * CLÉ : La gestion du 'customSlug' est critique pour le routage multi-tenant.
 * SÉCURITÉ : Génération d'un Admin scellé pour chaque nouvelle instance.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  X, Building2, User, Mail, Phone, MapPin, 
  Loader2, Globe, Lock, ShieldCheck, Activity, Zap 
} from "lucide-react";
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
    customSlug: "", 
    ceoName: "",
    email: "",
    adminFirstName: "",
    adminLastName: "",
    adminPassword: "", 
    phone: "",
    address: ""
  });

  /**
   * ⚙️ ALGORITHME DE GÉNÉRATION DE SLUG
   * Crée un identifiant unique et propre pour l'URL multi-tenant.
   */
  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlève accents
      .replace(/\s+/g, '-')     
      .replace(/[^a-z0-9-]/g, '') 
      .substring(0, 15);
  }, []);

  useEffect(() => {
    if (!formData.customSlug && formData.companyName) {
      setFormData(prev => ({ ...prev, customSlug: generateSlug(formData.companyName) }));
    }
  }, [formData.companyName, generateSlug]);

  /**
   * 🏗️ LANCEMENT DU PROVISIONING
   * Appelle le service Matrix pour initialiser la base de données isolée.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation Master
    if (formData.adminPassword.length < 8) {
      toast.error("Le mot de passe Admin doit comporter 8 caractères minimum");
      return;
    }

    setLoading(true);
    const tid = toast.loading("Initialisation du Nœud en cours...");

    try {
      await matrixApi.initialize(formData);
      toast.success("Nœud souverain déployé !", { id: tid });
      onSuccess();
      onClose();
      // Reset structurel
      setFormData({
        companyName: "", customSlug: "", ceoName: "", email: "",
        adminFirstName: "", adminLastName: "", adminPassword: "",
        phone: "", address: ""
      });
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erreur de validation Kernel";
      toast.error(`REJET MASTER : ${Array.isArray(msg) ? msg[0] : msg}`, { id: tid });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-[#0F172A] w-full max-w-5xl border border-slate-800 rounded-[3rem] shadow-[0_0_100px_rgba(37,99,235,0.15)] overflow-hidden flex flex-col max-h-[95vh] text-left italic">
        
        {/* HEADER MASTER CONTROLE */}
        <div className="p-10 border-b border-slate-800 flex justify-between items-center bg-slate-900/60 relative">
          <div className="absolute top-0 left-0 w-20 h-1 bg-blue-600"></div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4 leading-none">
              <ShieldCheck size={32} className="text-blue-500" /> Initialisation Nœud Tenant
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3 italic">Provisioning d&apos;Infrastructure Qualisoft Elite</p>
          </div>
          <button onClick={onClose} className="p-4 bg-slate-800 rounded-2xl text-slate-400 hover:text-white hover:bg-red-500/50 transition-all border-none cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* CONTENU : FORMULAIRE À DEUX SECTIONS (§4 & §5) */}
        <div className="overflow-y-auto p-12 space-y-12 custom-scrollbar">
          <form id="deployForm" onSubmit={handleSubmit} className="space-y-12">
            
            {/* SECTION 1: CONTEXTE ORGANISATIONNEL (§4 ISO) */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity size={18} className="text-blue-500" />
                <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em] italic">Identité de l&apos;Organisation Master</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Désignation Sociale Officielle</label>
                  <div className="relative group">
                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input required placeholder="EX: GROUPE SOUVERAIN..." className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-6 pl-16 pr-6 text-sm font-black text-white focus:border-blue-500 outline-none transition-all uppercase shadow-inner"
                      value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-4 flex justify-between">
                    <span>Identifiant DNS (Slug)</span>
                    <span className="opacity-50 text-[9px] lowercase tracking-normal">{formData.customSlug}.qualisoft.sn</span>
                  </label>
                  <div className="relative group">
                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-600" size={20} />
                    <input required className="w-full bg-slate-900/50 border border-amber-900/20 rounded-2xl py-6 pl-16 pr-6 text-sm font-black text-amber-500 focus:border-amber-500 outline-none transition-all lowercase shadow-inner"
                      value={formData.customSlug} onChange={e => setFormData({...formData, customSlug: e.target.value})} />
                  </div>
                  <p className="text-[9px] text-slate-600 ml-4 italic font-bold">L&apos;URL d&apos;accès isolée sera basée sur cet identifiant court.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Directeur Général (CEO)</label>
                  <input required placeholder="PRÉNOM & NOM DU DIRIGEANT" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-6 px-8 text-sm font-black text-white focus:border-blue-500 outline-none transition-all uppercase shadow-inner"
                    value={formData.ceoName} onChange={e => setFormData({...formData, ceoName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Téléphone</label>
                    <input required placeholder="+221..." className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-6 px-6 text-sm font-black text-white focus:border-blue-500 outline-none shadow-inner"
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Ville / Siège</label>
                    <input required placeholder="DAKAR..." className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-6 px-6 text-sm font-black text-white focus:border-blue-500 outline-none uppercase shadow-inner"
                      value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: LEADERSHIP & ADMINISTRATION (§5 ISO) */}
            <div className="space-y-6 pt-10 border-t border-slate-800/50">
              <div className="flex items-center gap-3 mb-4">
                <Zap size={18} className="text-emerald-500" />
                <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] italic">Habilitation Administrateur Pilote</h3>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Prénom Admin</label>
                  <input required className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-6 px-8 text-sm font-black text-white focus:border-emerald-500 outline-none uppercase shadow-inner"
                    value={formData.adminFirstName} onChange={e => setFormData({...formData, adminFirstName: e.target.value})} />
                </div>
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Nom Admin</label>
                  <input required className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-6 px-8 text-sm font-black text-white focus:border-emerald-500 outline-none uppercase shadow-inner"
                    value={formData.adminLastName} onChange={e => setFormData({...formData, adminLastName: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Identifiant Email Master</label>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input required type="email" placeholder="admin@client.sn" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-6 pl-16 pr-6 text-sm font-black text-white focus:border-emerald-500 outline-none shadow-inner"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Clé d&apos;Accès Initiale</label>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600" size={20} />
                    <input required type="text" placeholder="GÉNÉRER UN SECRET..." className="w-full bg-slate-900/50 border border-emerald-900/30 rounded-2xl py-6 pl-16 pr-6 text-sm font-black text-white focus:border-emerald-500 outline-none shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                      value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* ACTIONS DE DÉPLOIEMENT (§10 MASTER) */}
        <div className="p-10 border-t border-slate-800 bg-slate-900/40 flex justify-end items-center gap-6">
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic mr-auto">
            Audit Log : Création initiée par Super-Admin
          </p>
          <button onClick={onClose} className="px-8 py-5 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:text-white hover:bg-slate-800 transition-all border-none cursor-pointer italic tracking-widest">Révoquer</button>
          <button form="deployForm" disabled={loading} className="px-12 py-5 rounded-2xl text-[11px] font-black uppercase text-white bg-blue-600 hover:bg-blue-500 shadow-3xl shadow-blue-600/30 transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer italic tracking-widest">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} strokeWidth={3} />}
            Lancer l&apos;Initialisation du Nœud
          </button>
        </div>
      </div>
    </div>
  );
}