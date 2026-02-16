/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { matrixApi, ProvisioningPayload } from '@/services/matrix.service';
import { X, Rocket, Loader2, Building2, User, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeployTenantModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProvisioningPayload>({
    companyName: '',
    email: '',
    ceoName: '',
    adminFirstName: '',
    adminLastName: '',
    address: '',
    phone: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Initialisation du nœud sur la Matrix...");

    try {
      await matrixApi.initialize(formData);
      toast.success('DÉPLOIEMENT RÉUSSI : Le nœud est désormais actif.', { id: tid });
      onSuccess();
      onClose();
    } catch (error: any) {
      // 🛡️ DÉCODEUR D'ERREUR SÉCURISÉ (Évite les [object Object])
      const rawMsg = error.response?.data?.message;
      const cleanMsg = Array.isArray(rawMsg) 
        ? rawMsg.join(' | ') 
        : (typeof rawMsg === 'string' ? rawMsg : "Échec du protocole d'initialisation.");
      
      toast.error(`ERREUR : ${cleanMsg}`, { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block italic";
  const inputClass = "w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-4 pl-12 pr-4 font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all text-sm italic";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl border-4 border-slate-900 flex flex-col max-h-[95vh] relative">
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-8 shrink-0">
          <div>
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Initialisation <span className="text-blue-600 underline">Nœud</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Provisioning Express Qualisoft Elite RD 2030</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 rounded-full hover:bg-red-500 hover:text-white transition-all cursor-pointer border-none shadow-sm">
            <X size={24} />
          </button>
        </div>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2">
              <label className={labelClass}>Organisation / Raison Sociale</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" size={20} />
                <input required placeholder="Ex: SENELEC SA" className={inputClass}
                  value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Prénom Admin</label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input required placeholder="Prénom" className={inputClass}
                    value={formData.adminFirstName} onChange={e => setFormData({...formData, adminFirstName: e.target.value})} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Nom Admin</label>
                <input required placeholder="Nom" className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-4 px-6 font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all text-sm italic"
                  value={formData.adminLastName} onChange={e => setFormData({...formData, adminLastName: e.target.value})} />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Email Maître (Root Access)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required type="email" placeholder="root-admin@domaine.sn" className={inputClass}
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Directeur Général</label>
              <input required placeholder="Prénom Nom" className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-4 px-6 font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all text-sm italic"
                value={formData.ceoName} onChange={e => setFormData({...formData, ceoName: e.target.value})} />
            </div>

            <div>
              <label className={labelClass}>Téléphone Officiel</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required placeholder="+221..." className={inputClass}
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Localisation Siège</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required placeholder="Dakar, Sénégal" className={inputClass}
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>

            <div className="md:col-span-2 p-6 bg-blue-50 border-2 border-blue-100 rounded-3xl flex items-center gap-5 shadow-inner">
               <ShieldCheck className="text-blue-600 shrink-0" size={32} />
               <p className="text-[10px] font-black text-blue-900 uppercase leading-relaxed tracking-tight">
                 Le nœud sera déployé avec un plan <span className="underline decoration-blue-500 decoration-2">ESSAI</span> par défaut. 
                 Les identifiants root seront envoyés à l&apos;adresse email spécifiée.
               </p>
            </div>
          </div>

          <button disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-4xl font-black uppercase text-xs hover:bg-blue-600 transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer shrink-0 mt-4 active:scale-95 group">
            {loading ? <Loader2 className="animate-spin" /> : <Rocket size={20} className="group-hover:-translate-y-0.5 transition-transform" />}
            {loading ? 'DÉPLOIEMENT DU KERNEL...' : 'LANCER L\'INITIALISATION DU NŒUD'}
          </button>
        </form>
      </div>
    </div>
  );
}