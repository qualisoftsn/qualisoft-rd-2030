/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🏢 MODULE : src/app/(auth)/register/page.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Initialisation d'une nouvelle organisation (Tenant) SDE.
 * RÔLE : Création de la structure juridique et du Super-Admin initial.
 * SÉCURITÉ : Zéro NextAuth. Persistance directe dans le SDE Master Kernel.
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 17:16 GMT
 */

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Building2, Mail, Lock, User, ArrowRight, 
  Loader2, Phone, MapPin, ShieldCheck, Activity 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function RegisterTenantPage() {
  const router = useRouter();
  const PLAN_ELITE = 'ENTREPRISE'; // Plan par défaut pour activation SMI totale

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    ceoName: '',      
    phone: '',        
    address: '',      
    adminFirstName: '',
    adminLastName: '',
    email: '',
    password: '',
  });

  /**
   * 🚀 DÉPLOIEMENT DE L'INSTANCE MASTER
   * Scelle l'organisation et génère le premier jeton d'autorité.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      return toast.error("SÉCURITÉ : Mot de passe trop court (min 8 caractères).");
    }

    setLoading(true);
    const tid = toast.loading("Déploiement de l'infrastructure multi-tenant...");

    try {
      const res = await apiClient.post('/auth/register-tenant', { 
        ...formData, 
        plan: PLAN_ELITE 
      });

      /**
       * 🔐 SCELLAGE DE LA SESSION (Élimination NextAuth)
       * Persistence des jetons dans le coffre local pour apiClient.
       */
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('qs_token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.success("Instance Qualisoft Elite déployée avec succès.", { id: tid });

      // Redirection vers le cockpit avec trigger de bienvenue
      router.push('/dashboard?welcome=true');
      
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erreur critique d'instanciation.";
      toast.error(msg, { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans flex items-center justify-center p-6 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <div className="w-full max-w-3xl bg-slate-900/40 border border-white/10 rounded-[3rem] lg:rounded-[4rem] p-8 lg:p-14 shadow-4xl relative overflow-hidden animate-in fade-in zoom-in duration-700">
        
        {/* NOYAU D'ÉNERGIE DÉCENTRÉ */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none" />

        <header className="mb-12 text-center relative z-10">
          <div className="inline-flex p-6 bg-blue-600/10 text-blue-500 rounded-3xl mb-8 border border-blue-500/20 shadow-xl">
            <ShieldCheck size={48} strokeWidth={1.5} className="animate-pulse" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-none m-0">
            Déploiement <span className="text-blue-500">Elite</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-6 italic m-0">
            Initialisation Multi-Tenant RD 2026
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 text-left">
          
          {/* SECTION 1 : CONTEXTE ORGANISATIONNEL (§4) */}
          <div className="md:col-span-2 flex items-center gap-3 border-b border-white/5 pb-4">
            <Activity size={16} className="text-blue-500" />
            <h3 className="text-blue-500 text-[10px] font-black uppercase tracking-widest m-0">01. Structure de l&apos;Organisme</h3>
          </div>
          
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-600 ml-4 tracking-widest">Raison Sociale</label>
            <div className="relative">
              <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required className="w-full p-6 pl-16 bg-slate-950/50 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all text-white font-black italic uppercase" 
                value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value.toUpperCase()})} placeholder="NOM ENTREPRISE" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-600 ml-4 tracking-widest">Dirigeant (CEO)</label>
            <div className="relative">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required className="w-full p-6 pl-16 bg-slate-950/50 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all text-white font-black italic uppercase" 
                value={formData.ceoName} onChange={e => setFormData({...formData, ceoName: e.target.value.toUpperCase()})} placeholder="NOM DU DIRIGEANT" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required className="w-full p-6 pl-16 bg-slate-950/50 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all text-white font-black italic" 
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="LIGNE DIRECTE" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required className="w-full p-6 pl-16 bg-slate-950/50 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all text-white font-black italic" 
                value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="SIÈGE SOCIAL" />
            </div>
          </div>

          {/* SECTION 2 : ADMINISTRATION MASTER (§5) */}
          <div className="md:col-span-2 flex items-center gap-3 border-b border-white/5 pb-4 mt-6">
            <ShieldCheck size={16} className="text-blue-500" />
            <h3 className="text-blue-500 text-[10px] font-black uppercase tracking-widest m-0">02. Autorité d&apos;Administration Master</h3>
          </div>

          <input required className="w-full p-6 bg-slate-950/50 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all text-white font-black italic" 
            value={formData.adminFirstName} onChange={e => setFormData({...formData, adminFirstName: e.target.value})} placeholder="PRÉNOM ADMIN" />
          
          <input required className="w-full p-6 bg-slate-950/50 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all text-white font-black italic" 
            value={formData.adminLastName} onChange={e => setFormData({...formData, adminLastName: e.target.value})} placeholder="NOM ADMIN" />

          <div className="md:col-span-2 relative">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="email" required className="w-full p-6 pl-16 bg-slate-950/50 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all text-white font-black italic" 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value.toLowerCase()})} placeholder="EMAIL PROFESSIONNEL (IDENTIFIANT)" />
          </div>

          <div className="md:col-span-2 relative">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="password" required className="w-full p-6 pl-16 bg-slate-950/50 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all text-white font-black italic" 
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="MOT DE PASSE SÉCURISÉ" />
          </div>

          <div className="md:col-span-2 pt-6">
            <button disabled={loading} className="w-full py-7 bg-blue-600 hover:bg-white hover:text-blue-600 rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.4em] flex items-center justify-center gap-5 transition-all shadow-3xl active:scale-95 border-none cursor-pointer disabled:opacity-50">
              {loading ? <><Loader2 className="animate-spin" /> INITIALISATION DE LA MATRICE...</> : <>DÉPLOYER L&apos;INSTANCE MASTER <ArrowRight size={22} strokeWidth={3} /></>}
            </button>
          </div>
        </form>

        <footer className="mt-12 text-center border-t border-white/5 pt-8 opacity-30">
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.5em] italic m-0">
            SMI Sovereign Architecture • Qualisoft ELITE RD 2026 • AES-256
          </p>
        </footer>
      </div>
    </div>
  );
}