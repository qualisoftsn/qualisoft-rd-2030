/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🏢 MODULE : DÉPLOIEMENT D'INSTANCE (REGISTER TENANT)
 * -------------------------------------------------------------------------
 * FONCTION : Initialisation d'une nouvelle organisation (Tenant) dans le cloud.
 * RÔLE : Création de la structure juridique et du compte Super-Admin initial.
 * ARCHITECTURE : Multi-Tenant avec isolation des données par ID d'organisation.
 * CONFORMITÉ : ISO 9001:2015 - Contexte de l'organisation et leadership.
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Building2, Mail, Lock, User, ArrowRight, 
  Loader2, Phone, MapPin, ShieldCheck, Activity 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RegisterTenantPage() {
  const router = useRouter();
  
  /**
   * 🛡️ CONFIGURATION DU PLAN SOUVERAIN
   * On impose le plan 'ENTREPRISE' pour activer l'intégralité des modules 
   * de pilotage (Gestion des Risques, Audit, PAQ, Indicateurs).
   */
  const PLAN_ELITE = 'ENTREPRISE';

  // --- ÉTAT DE CHARGEMENT ---
  const [loading, setLoading] = useState(false);

  // --- ÉTAT DU FORMULAIRE D'INITIALISATION ---
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
   * 🚀 DÉPLOIEMENT DE L'INSTANCE
   * Déclenche la création du Tenant et du premier utilisateur Admin.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de base avant scellage
    if (formData.password.length < 8) {
      toast.error("Sécurité : Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }

    setLoading(true);
    try {
      /**
       * 🛰️ APPEL AU NOYAU D'AUTHENTIFICATION MASTER
       * On injecte le plan Elite de manière forcée pour garantir l'accès intégral.
       */
      const res = await apiClient.post('/auth/register-tenant', { 
        ...formData, 
        plan: PLAN_ELITE 
      });

      /**
       * 🔐 PROTOCOLE DE SÉCURITÉ ET PERSISTENCE
       * Stockage unifié du jeton d'accès (Bearer Token) pour la session active.
       * 'qs_token' est utilisé pour la compatibilité avec les modules de pilotage métier.
       */
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('qs_token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.success("Instance Qualisoft Elite déployée avec succès.");

      /**
       * 🧭 REDIRECTION VERS LE COCKPIT CENTRAL
       * Le paramètre welcome=true déclenche la séquence de configuration initiale au dashboard.
       */
      router.push('/dashboard?welcome=true');
      
    } catch (err: any) {
      console.error("Échec du déploiement Master:", err);
      const errorMessage = err.response?.data?.message || "Erreur critique lors de l'initialisation de l'instance.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans flex items-center justify-center p-6 selection:bg-blue-600/30">
      
      {/* 🛸 CONTENEUR DÉPLOYÉ AVEC EFFET GLASSMORPHISM */}
      <div className="w-full max-w-3xl bg-slate-900/40 border border-white/10 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-700">
        
        {/* EFFET VISUEL : NOYAU D'ÉNERGIE DÉCENTRÉ */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none" />

        <header className="mb-12 text-center relative z-10">
          <div className="inline-flex p-6 bg-blue-600/10 text-blue-500 rounded-4xl mb-8 border border-blue-500/20 shadow-xl shadow-blue-500/10">
            <ShieldCheck size={48} strokeWidth={1.5} className="animate-pulse" />
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
            Déploiement <span className="text-blue-500">Elite</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-5 italic">
            Configuration de l&apos;instance Multi-Tenant RD 2026
          </p>
        </header>

        {/* 📋 FORMULAIRE DE STRUCTURATION ISO 9001 */}
        <form onSubmit={handleSubmit} className="space-y-8 text-left text-xs font-bold uppercase italic tracking-tight relative z-10">
          
          {/* SECTION 1 : CONTEXTE ET IDENTITÉ DE L'ORGANISME (§4) */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 ml-2">
              <Activity size={14} className="text-blue-500" />
              <h3 className="text-blue-500 text-[10px] font-black tracking-[0.3em]">01. Structure de l&apos;Organisme</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="relative group">
                  <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    required 
                    className="w-full p-6 pl-16 bg-slate-950/50 border border-white/10 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner text-white font-black" 
                    value={formData.companyName} 
                    onChange={e => setFormData({...formData, companyName: e.target.value.toUpperCase()})} 
                    placeholder="NOM DE L'ENTREPRISE" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    required 
                    className="w-full p-6 pl-16 bg-slate-950/50 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all shadow-inner text-white font-black" 
                    value={formData.ceoName} 
                    onChange={e => setFormData({...formData, ceoName: e.target.value.toUpperCase()})} 
                    placeholder="NOM DU DIRIGEANT (CEO)" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  required 
                  className="w-full p-6 pl-16 bg-slate-950/50 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all shadow-inner text-white font-black" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  placeholder="LIGNE DIRECTE" 
                />
              </div>
              <div className="relative group">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  required 
                  className="w-full p-6 pl-16 bg-slate-950/50 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all shadow-inner text-white font-black" 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})} 
                  placeholder="SIÈGE SOCIAL / LOCALISATION" 
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5 w-full my-10" />

          {/* SECTION 2 : LEADERSHIP ET ADMINISTRATION (§5) */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 ml-2">
              <ShieldCheck size={14} className="text-blue-500" />
              <h3 className="text-blue-500 text-[10px] font-black tracking-[0.3em]">02. Autorité d&apos;Administration Master</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input 
                required 
                className="w-full p-6 bg-slate-950/50 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all shadow-inner text-white font-black" 
                value={formData.adminFirstName} 
                onChange={e => setFormData({...formData, adminFirstName: e.target.value})} 
                placeholder="PRÉNOM DE L'ADMIN" 
              />
              <input 
                required 
                className="w-full p-6 bg-slate-950/50 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all shadow-inner text-white font-black" 
                value={formData.adminLastName} 
                onChange={e => setFormData({...formData, adminLastName: e.target.value})} 
                placeholder="NOM DE L'ADMIN" 
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="email" 
                required 
                className="w-full p-6 pl-16 bg-slate-950/50 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all shadow-inner text-white font-black" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value.toLowerCase()})} 
                placeholder="EMAIL PROFESSIONNEL (IDENTIFIANT)" 
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="password" 
                required 
                className="w-full p-6 pl-16 bg-slate-950/50 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-all shadow-inner text-white font-black" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                placeholder="MOT DE PASSE SÉCURISÉ MASTER" 
              />
            </div>
          </div>

          <div className="pt-10">
            <button 
              disabled={loading} 
              className="w-full py-7 bg-blue-600 hover:bg-blue-500 rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.4em] flex items-center justify-center gap-5 transition-all shadow-2xl shadow-blue-600/30 active:scale-[0.98] border-none cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Initialisation de la Matrice...
                </>
              ) : (
                <>Déployer l&apos;Instance Master <ArrowRight size={22} strokeWidth={3} /></>
              )}
            </button>
          </div>
        </form>

        <footer className="mt-12 text-center border-t border-white/5 pt-8">
          <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.5em] italic">
            SMI Sovereign Architecture • Qualisoft ELITE RD 2026 • Chiffrement AES-256
          </p>
        </footer>
      </div>
    </div>
  );
}