/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : DeployTenantModal.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Initialisation de Tenant (Provisioning Kernel Matrix).
 * SÉCURITÉ : Isolation stricte via Slug DNS unique.
 * RÉVISION : 02 Mars 2026 | 18:05 GMT
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  X, Building2, Mail, Lock, ShieldCheck, Activity, Zap, Loader2, Globe 
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
  const [form, setForm] = useState({
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

  const generateSlug = useCallback((name: string) => {
    return name.toLowerCase().trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 15);
  }, []);

  useEffect(() => {
    if (form.companyName && !form.customSlug) {
      setForm(p => ({ ...p, customSlug: generateSlug(form.companyName) }));
    }
  }, [form.companyName, form.customSlug, generateSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.adminPassword.length < 8) return toast.error("SÉCURITÉ : 8 caractères minimum pour l'Admin.");

    setLoading(true);
    const tid = toast.loading("Initialisation du Nœud Multi-Tenant...");

    try {
      await matrixApi.initialize(form);
      toast.success("NŒUD DÉPLOYÉ : Instance opérationnelle.", { id: tid });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error("ÉCHEC KERNEL : " + (err.response?.data?.message || "Erreur de provisioning"), { id: tid });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-[#0B0F1A]/95 backdrop-blur-xl animate-in fade-in duration-500 italic">
      <div className="bg-[#0F172A] w-full max-w-5xl border border-white/10 rounded-[4rem] shadow-4xl overflow-hidden flex flex-col max-h-[90vh] text-left">
        
        <header className="p-10 border-b border-white/5 flex justify-between items-center bg-white/2 relative">
          <div className="absolute top-0 left-10 w-32 h-1 bg-blue-600 shadow-[0_0_15px_#2563eb]" />
          <div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4 m-0">
              <ShieldCheck size={32} className="text-blue-500" /> Initialisation Nœud
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3 m-0">Provisioning d&apos;Infrastructure Qualisoft Elite</p>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white hover:bg-red-500/20 transition-all border-none cursor-pointer">
            <X size={24} />
          </button>
        </header>

        <div className="overflow-y-auto p-12 custom-scrollbar">
          <form id="deployForm" onSubmit={handleSubmit} className="space-y-12">
            
            {/* SECTION 1: CONTEXTE (§4 ISO) */}
            <div className="space-y-6">
              <div className="flex items-center gap-3"><Activity size={18} className="text-blue-500" /><h3 className="text-[11px] font-black text-blue-500 uppercase tracking-widest m-0">01. Contexte de l&apos;Organisation</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">Raison Sociale</label>
                  <div className="relative group">
                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" size={20} />
                    <input required className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-sm font-black text-white focus:border-blue-500 outline-none uppercase italic"
                      value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-4 flex justify-between">DNS Slug <span className="opacity-40">{form.customSlug}.qualisoft.sn</span></label>
                  <div className="relative group">
                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-600" size={20} />
                    <input required className="w-full bg-black/40 border border-amber-900/20 rounded-2xl py-6 pl-16 pr-6 text-sm font-black text-amber-500 focus:border-amber-500 outline-none lowercase italic"
                      value={form.customSlug} onChange={e => setForm({...form, customSlug: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: LEADERSHIP (§5 ISO) */}
            <div className="space-y-6 pt-10 border-t border-white/5">
              <div className="flex items-center gap-3"><Zap size={18} className="text-emerald-500" /><h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest m-0">02. Habilitation Admin Pilote</h3></div>
              <div className="grid grid-cols-2 gap-8">
                <input required placeholder="PRÉNOM ADMIN" className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 px-8 text-sm font-black text-white focus:border-emerald-500 outline-none uppercase italic"
                  value={form.adminFirstName} onChange={e => setForm({...form, adminFirstName: e.target.value})} />
                <input required placeholder="NOM ADMIN" className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 px-8 text-sm font-black text-white focus:border-emerald-500 outline-none uppercase italic"
                  value={form.adminLastName} onChange={e => setForm({...form, adminLastName: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input required type="email" placeholder="EMAIL@CLIENT.SN" className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 pl-16 text-sm font-black text-white focus:border-emerald-500 outline-none italic"
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600" size={20} />
                  <input required placeholder="CLÉ D'ACCÈS MASTER" className="w-full bg-black/40 border border-emerald-900/20 rounded-2xl py-6 pl-16 text-sm font-black text-white focus:border-emerald-500 outline-none italic"
                    value={form.adminPassword} onChange={e => setForm({...form, adminPassword: e.target.value})} />
                </div>
              </div>
            </div>
          </form>
        </div>

        <footer className="p-10 border-t border-white/5 bg-white/2 flex justify-end items-center gap-6">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic mr-auto">Audit Log : Initialisation Super-Admin</p>
          <button onClick={onClose} className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 hover:text-white bg-transparent border-none cursor-pointer italic tracking-widest">Révoquer</button>
          <button form="deployForm" disabled={loading} className="px-12 py-5 rounded-2xl text-[11px] font-black uppercase text-white bg-blue-600 hover:bg-white hover:text-blue-600 shadow-3xl transition-all flex items-center gap-4 border-none cursor-pointer italic tracking-widest disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />} LANCER L&apos;INITIALISATION
          </button>
        </footer>
      </div>
    </div>
  );
}