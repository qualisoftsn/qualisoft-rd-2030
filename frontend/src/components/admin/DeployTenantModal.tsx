/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useState } from 'react';
import { matrixApi, ProvisioningPayload } from '@/services/matrix.service';
import { X, Rocket, ShieldAlert, CheckCircle2, Loader2, Building2, User, Mail, MapPin, Phone, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeployTenantModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  
  // Utilisation du format attendu par matrix.service.ts
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
      // APPEL À LA NOUVELLE MÉTHODE D'INITIALISATION
      await matrixApi.initialize(formData);
      
      toast.success('Déploiement réussi ! Le client est actif.');
      onSuccess();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Erreur inconnue";
      // Gestion propre si le message est un tableau (NestJS validation) ou une string
      toast.error("Échec du déploiement : " + (Array.isArray(msg) ? msg[0] : msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in duration-300 font-sans italic overflow-y-auto max-h-[90vh]">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Déploiement <span className="text-blue-600">Express</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initialisation nouveau nœud Matrix</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors border-none cursor-pointer">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* --- BLOC ORGANISATION --- */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Organisation Client</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required placeholder="Nom de la Société (ex: SDE)" className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 outline-none focus:ring-2 ring-blue-500/20" 
                  value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
              </div>
            </div>

            {/* --- BLOC IDENTITÉ ADMIN --- */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Prénom Admin</label>
              <div className="relative">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input required placeholder="Prénom" className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 outline-none focus:ring-2 ring-blue-500/20" 
                    value={formData.adminFirstName} onChange={e => setFormData({...formData, adminFirstName: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Nom Admin</label>
              <input required placeholder="Nom" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold text-slate-900 outline-none focus:ring-2 ring-blue-500/20" 
                value={formData.adminLastName} onChange={e => setFormData({...formData, adminLastName: e.target.value})} />
            </div>

            {/* --- BLOC ACCÈS (EMAIL & RÔLE) --- */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Email (Login Principal)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required type="email" placeholder="admin@client.sn" className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 outline-none focus:ring-2 ring-blue-500/20" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            {/* RÔLE : Ajouté visuellement pour confirmer l'action */}
            <div className="space-y-2 md:col-span-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Rôle Assigné</label>
               <div className="relative opacity-80">
                 <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                 <input disabled value="ADMINISTRATEUR TENANT (ACCÈS COMPLET)" className="w-full bg-blue-50 border border-blue-100 text-blue-700 rounded-2xl py-4 pl-12 pr-4 font-black text-xs uppercase outline-none cursor-not-allowed" />
               </div>
            </div>

            {/* --- BLOC DÉTAILS --- */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Directeur Général</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required placeholder="Prénom Nom" className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 outline-none focus:ring-2 ring-blue-500/20" 
                  value={formData.ceoName} onChange={e => setFormData({...formData, ceoName: e.target.value})} />
              </div>
            </div>

             <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required placeholder="+221..." className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 outline-none focus:ring-2 ring-blue-500/20" 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Adresse Siège</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required placeholder="Ville, Pays" className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 outline-none focus:ring-2 ring-blue-500/20" 
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>

          </div>

          <div className="pt-6">
            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-xs hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 border-none cursor-pointer"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Rocket size={18} />}
              {loading ? 'INITIALISATION EN COURS...' : 'CONFIRMER LE DÉPLOIEMENT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}