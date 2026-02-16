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
    try {
      await matrixApi.initialize(formData);
      toast.success('DÉPLOIEMENT RÉUSSI : Le nœud est désormais actif sur la Matrix.');
      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message;
      toast.error("ÉCHEC DÉPLOIEMENT : " + (Array.isArray(msg) ? msg[0] : msg || "Erreur Serveur"));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white border-2 border-slate-300 rounded-xl py-4 pl-12 pr-4 font-black text-slate-900 outline-none focus:border-blue-600 transition-all placeholder:text-slate-400 text-sm";
  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      <div className="bg-white rounded-4xl w-full max-w-2xl p-10 shadow-2xl animate-in zoom-in duration-300 font-sans italic border border-slate-200 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center mb-8 shrink-0">
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Initialisation <span className="text-blue-600">Nœud</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Provisioning Express Qualisoft Elite</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-all border border-slate-200 cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2">
              <label className={labelClass}>Organisation / Raison Sociale</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
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
                <input required placeholder="Nom" className="w-full bg-white border-2 border-slate-300 rounded-xl py-4 px-6 font-black text-slate-900 outline-none focus:border-blue-600 transition-all text-sm"
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
              <input required placeholder="Prénom Nom" className="w-full bg-white border-2 border-slate-300 rounded-xl py-4 px-6 font-black text-slate-900 outline-none focus:border-blue-600 transition-all text-sm"
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

            <div className="md:col-span-2 p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl flex items-center gap-4">
               <ShieldCheck className="text-blue-600" size={32} />
               <p className="text-[10px] font-black text-blue-800 uppercase leading-relaxed">
                 Le nœud sera déployé avec un plan <span className="underline">ESSAI</span> par défaut. 
                 Le mot de passe root sera généré automatiquement.
               </p>
            </div>
          </div>

          <button disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase text-xs hover:bg-blue-600 transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer shrink-0">
            {loading ? <Loader2 className="animate-spin" /> : <Rocket size={20} />}
            {loading ? 'DÉPLOIEMENT EN COURS...' : 'LANCER L\'INITIALISATION'}
          </button>
        </form>
      </div>
    </div>
  );
}