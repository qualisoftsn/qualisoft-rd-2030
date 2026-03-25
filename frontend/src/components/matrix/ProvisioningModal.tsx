/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : ProvisioningModal.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Interface de déploiement de nouveaux nœuds (Tenants).
 * RÉVISION : 03 Mars 2026 | 19:10 GMT
 */

"use client";

import React, { useState } from 'react';
import { 
  X, Zap, Building2, User, Mail, Lock, 
  MapPin, Phone, Loader2, ShieldAlert 
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/core/api/api-client';

interface ProvisioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProvisioningModal({ isOpen, onClose, onSuccess }: ProvisioningModalProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    customSlug: '',
    ceoName: '',
    email: '',
    adminPassword: '',
    adminFirstName: '',
    adminLastName: '',
    phone: '',
    address: ''
  });

  if (!isOpen) return null;

  /**
   * 🚀 EXÉCUTION DU PROTOCOLE BIG BANG
   */
  const handleProvisioning = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    const tid = toast.loading("Initialisation du Protocole Big Bang...");

    try {
      await apiClient.post('/admin/matrix/provisioning/initialize', form);
      
      toast.success(`Nœud ${form.companyName} scellé avec succès !`, { id: tid });
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Rupture de la transaction atomique.";
      toast.error(`ÉCHEC CRITIQUE : ${errorMsg}`, { id: tid });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-[#0B0F1A]/90 backdrop-blur-xl animate-in fade-in duration-300">
      
      <div className="relative w-full max-w-4xl bg-[#0F172A] border border-white/10 rounded-[3.5rem] overflow-hidden shadow-2xl italic font-sans">
        
        {/* 🚩 DECORATIVE GLOW */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
        
        {/* ❌ CLOSE BUTTON */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
        >
          <X size={24} />
        </button>

        <form onSubmit={handleProvisioning} className="p-12 md:p-16 space-y-10">
          
          {/* HEADER */}
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic m-0">
              Big Bang <span className="text-blue-600 not-italic">Protocol</span>
            </h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Déploiement atomique d&apos;un nouveau nœud souverain</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* SECTION 1 : IDENTITÉ DU NŒUD */}
            <div className="space-y-6">
              <p className="text-blue-500 text-[9px] font-black uppercase tracking-widest border-b border-blue-500/20 pb-2">Identité Territoriale</p>
              
              <div className="space-y-4">
                <div className="relative group">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    required
                    placeholder="NOM DE L'ORGANISATION"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-[11px] font-bold text-white outline-none focus:border-blue-600 focus:bg-white/10 transition-all uppercase italic"
                    onChange={e => setForm({...form, companyName: e.target.value})}
                  />
                </div>

                <div className="relative group">
                  <Zap className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    required
                    placeholder="SLUG TECHNIQUE (EX: SAGAM)"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-[11px] font-bold text-white outline-none focus:border-blue-600 focus:bg-white/10 transition-all lowercase italic"
                    onChange={e => setForm({...form, customSlug: e.target.value})}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-600">.qualisoft.sn</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input 
                      placeholder="CONTACT"
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-[11px] font-bold text-white outline-none focus:border-blue-600 transition-all italic"
                      onChange={e => setForm({...form, phone: e.target.value})}
                    />
                  </div>
                  <div className="relative group">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input 
                      placeholder="SIÈGE"
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-[11px] font-bold text-white outline-none focus:border-blue-600 transition-all italic"
                      onChange={e => setForm({...form, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2 : AUTORITÉ RACINE */}
            <div className="space-y-6">
              <p className="text-amber-500 text-[9px] font-black uppercase tracking-widest border-b border-amber-500/20 pb-2">Autorité Administrative (Admin)</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    required
                    placeholder="PRÉNOM"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-[11px] font-bold text-white outline-none focus:border-amber-600 transition-all italic uppercase"
                    onChange={e => setForm({...form, adminFirstName: e.target.value})}
                  />
                  <input 
                    required
                    placeholder="NOM"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-[11px] font-bold text-white outline-none focus:border-amber-600 transition-all italic uppercase"
                    onChange={e => setForm({...form, adminLastName: e.target.value})}
                  />
                </div>

                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500" size={18} />
                  <input 
                    required
                    type="email"
                    placeholder="COURRIEL RACINE"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-[11px] font-bold text-white outline-none focus:border-amber-600 transition-all italic"
                    onChange={e => setForm({...form, email: e.target.value})}
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500" size={18} />
                  <input 
                    required
                    type="password"
                    placeholder="MOT DE PASSE MAÎTRE"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-[11px] font-bold text-white outline-none focus:border-amber-600 transition-all italic"
                    onChange={e => setForm({...form, adminPassword: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER & TRIGGER */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6 border-t border-white/5">
            <div className="flex items-center gap-4 text-slate-500 italic max-w-sm">
              <ShieldAlert size={24} className="text-amber-500/50 shrink-0" />
              <p className="text-[9px] leading-relaxed font-bold uppercase tracking-widest">
                L&apos;exécution de ce protocole crée une instance souveraine avec un plan <span className="text-white">ENTREPRISE</span> actif pour 24 mois.
              </p>
            </div>

            <button 
              disabled={isDeploying}
              type="submit"
              className="w-full md:w-auto px-12 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black uppercase text-xs italic tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-blue-900/40 border-none cursor-pointer disabled:opacity-50"
            >
              {isDeploying ? <Loader2 className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
              Exécuter le Big Bang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
