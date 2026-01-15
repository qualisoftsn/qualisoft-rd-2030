/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Building2, 
  Globe, 
  Mail, 
  CreditCard, 
  ShieldCheck, 
  Save, 
  AlertCircle,
  Loader2,
  Calendar,
  Lock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function SettingsPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Récupération des données du Tenant connecté
    apiClient.get('/admin/tenant/me')
      .then(res => {
        setTenant(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur chargement paramètres:", err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch(`/admin/tenant/${tenant.T_Id}`, tenant);
      alert("Configuration mise à jour avec succès.");
    } catch (err) {
      alert("Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  if (!tenant) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] text-slate-500 uppercase font-black italic">
      Impossible de charger les données du Tenant
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white font-sans italic text-left relative overflow-x-hidden">
      
      {/* HEADER ELITE */}
      <header className="flex justify-between items-end mb-12 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
            Paramètres <span className="text-blue-500">SMI</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4">
            Configuration globale de l&apos;instance Qualisoft • ID: {tenant.T_Id}
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black uppercase italic text-xs shadow-2xl shadow-blue-900/40 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
          Sauvegarder les réglages
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* COLONNE GAUCHE : IDENTITÉ SOCIÉTÉ */}
        <div className="xl:col-span-2 space-y-8">
          <section className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                <Building2 size={24} />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Profil de l&apos;Organisation</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nom de la structure (T_Name)</label>
                <input 
                  type="text" 
                  value={tenant.T_Name} 
                  onChange={(e) => setTenant({...tenant, T_Name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-blue-500 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Domaine technique (T_Domain)</label>
                <div className="relative">
                  <Globe className="absolute left-5 top-5 text-slate-500" size={20} />
                  <input 
                    type="text" 
                    value={tenant.T_Domain} 
                    onChange={(e) => setTenant({...tenant, T_Domain: e.target.value})}
                    className="w-full pl-14 pr-5 py-5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Email Administrateur (T_Email)</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-5 text-slate-500" size={20} />
                  <input 
                    type="email" 
                    value={tenant.T_Email} 
                    onChange={(e) => setTenant({...tenant, T_Email: e.target.value})}
                    className="w-full pl-14 pr-5 py-5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SÉCURITÉ & AUDIT LOGS */}
          <section className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Conformité & Sécurité</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-4xl border border-white/5 group hover:bg-white/8 transition-all">
                <div>
                  <p className="text-xs font-black uppercase italic tracking-tight">Status de l&apos;Instance (T_IsActive)</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 italic tracking-widest">Compte vérifié et certifié Qualisoft</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase text-emerald-500 italic">Opérationnel</span>
                  <span className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></span>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 font-bold uppercase ml-4 italic">
                Date de création du Tenant : {new Date(tenant.T_CreatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </section>
        </div>

        {/* COLONNE DROITE : ABONNEMENT QUALISOFT */}
        <div className="space-y-8">
          <div className="bg-blue-600 p-10 rounded-[3.5rem] shadow-2xl shadow-blue-900/40 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <CreditCard className="text-white/60" size={36} />
                <span className="bg-white/20 text-white text-[9px] font-black px-4 py-2 rounded-2xl uppercase tracking-widest border border-white/10 backdrop-blur-md">
                  {tenant.T_SubscriptionStatus}
                </span>
              </div>
              <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2 italic">Abonnement Qualisoft</p>
              <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-10">{tenant.T_Plan}</h3>
              
              <div className="pt-8 border-t border-white/20 space-y-5 text-white/80 text-[11px] font-bold italic">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 uppercase tracking-tighter"><Calendar size={14}/> Prochaine échéance</span>
                  <span className="text-white font-black uppercase">{new Date(tenant.T_SubscriptionEndDate).toLocaleDateString()}</span>
                </div>
                <button className="w-full bg-white text-blue-600 py-4 rounded-2xl transition-all font-black uppercase text-[10px] flex items-center justify-center gap-2 mt-4 shadow-xl active:scale-95">
                  Mettre à niveau le plan <ChevronRight size={14} />
                </button>
              </div>
            </div>
            {/* Décoration fond */}
            <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
          </div>

          {/* ZONE DE DANGER (ISOLEMENT TENANT) */}
          <div className="p-10 border border-red-500/20 bg-red-500/5 rounded-[3rem] space-y-6">
             <div className="flex gap-4">
                <AlertCircle className="text-red-500 shrink-0" size={24} />
                <div className="text-left">
                  <p className="text-sm font-black text-red-500 uppercase italic leading-none">Zone Critique</p>
                  <p className="text-[10px] text-red-500/60 mt-3 font-bold italic leading-relaxed uppercase tracking-tight">
                    La désactivation suspendra l&apos;accès SMI pour tous les collaborateurs de l&apos;organisation.
                  </p>
                  <button className="mt-8 px-8 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-[9px] font-black uppercase italic transition-all duration-300">
                    Suspendre l&apos;instance
                  </button>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}