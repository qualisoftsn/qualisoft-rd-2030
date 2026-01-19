/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { Building2, Mail, Lock, User, ArrowRight, Loader2, Phone, MapPin, ShieldCheck } from 'lucide-react';

export default function RegisterTenantPage() {
  const router = useRouter();
  
  // ✅ NORMALITÉ : On force le plan ENTREPRISE pour garantir l'accès intégral
  const PLAN_ELITE = 'ENTREPRISE';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ Envoi forcé avec le plan ENTREPRISE
      const res = await apiClient.post('/auth/register-tenant', { 
        ...formData, 
        plan: PLAN_ELITE 
      });

      // ✅ Stockage unifié (identique à ton login/page.tsx)
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('qs_token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // ✅ Redirection vers le Dashboard avec message de bienvenue
      router.push('/dashboard?welcome=true');
      
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'initialisation de l'instance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans flex items-center justify-center p-6 selection:bg-blue-500/30">
      <div className="w-full max-w-3xl bg-slate-900/40 border border-white/10 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
        
        {/* Effet visuel de fond */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />

        <header className="mb-10 text-center">
          <div className="inline-flex p-4 bg-blue-600/20 text-blue-500 rounded-3xl mb-6 border border-blue-500/20">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Déploiement <span className="text-blue-500">Elite</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">
            Configuration de l&apos;instance Multi-Tenant
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 text-left text-xs font-bold uppercase italic tracking-tight">
          
          {/* SECTION 1 : IDENTITÉ DE L'ORGANISATION */}
          <div className="space-y-4">
            <h3 className="text-blue-500 text-[9px] font-black tracking-widest ml-2">01. Structure Organisationnelle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <div className="relative">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input required className="w-full p-5 pl-14 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all" 
                    value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="NOM DE L'ENTREPRISE" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input required className="w-full p-5 pl-14 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500" 
                    value={formData.ceoName} onChange={e => setFormData({...formData, ceoName: e.target.value})} placeholder="NOM DU DIRIGEANT (CEO)" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input required className="w-full p-5 pl-14 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500" 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="LIGNE DIRECTE" />
              </div>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input required className="w-full p-5 pl-14 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500" 
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="SIÈGE SOCIAL" />
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5 w-full my-6" />

          {/* SECTION 2 : COMPTE ADMINISTRATEUR SÉCURISÉ */}
          <div className="space-y-4">
            <h3 className="text-blue-500 text-[9px] font-black tracking-widest ml-2">02. Identifiants Admin Intégral</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input required className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500" 
                value={formData.adminFirstName} onChange={e => setFormData({...formData, adminFirstName: e.target.value})} placeholder="PRÉNOM DE L'ADMIN" />
              <input required className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500" 
                value={formData.adminLastName} onChange={e => setFormData({...formData, adminLastName: e.target.value})} placeholder="NOM DE L'ADMIN" />
            </div>

            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input type="email" required className="w-full p-5 pl-14 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500" 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="EMAIL PROFESSIONNEL (IDENTIFIANT)" />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input type="password" required className="w-full p-5 pl-14 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500" 
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="MOT DE PASSE SÉCURISÉ" />
            </div>
          </div>

          <div className="pt-6">
            <button disabled={loading} className="w-full py-6 bg-blue-600 hover:bg-blue-500 rounded-4xl font-black uppercase text-[11px] tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]">
              {loading ? <Loader2 className="animate-spin" /> : <>Déployer l&apos;Instance <ArrowRight size={18} /></>}
            </button>
          </div>
        </form>

        <footer className="mt-10 text-center">
          <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.5em]">
            Qualisoft ELITE RD 2030 • Protection des données certifiée
          </p>
        </footer>
      </div>
    </div>
  );
}