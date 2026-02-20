/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🚜 MODULE : ÉQUIPEMENTS & MATÉRIEL
 * -------------------------------------------------------------------------
 * FONCTION : Gestionnaire de cycle de vie des actifs (Asset Management).
 * RÔLE : Enregistrement scellé du matériel et suivi des conformités VGP.
 * SÉCURITÉ : Liaison stricte au TenantId via l'apiClient Master.
 */

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { X, Save, Loader2, Settings2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  equipment?: any; // Objet présent uniquement en mode RECTIFICATION
  onClose: () => void;
  onSuccess: () => void;
}

export default function EquipmentModal({ equipment, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  
  // Schéma de données Elite (Préfixes EQ_)
  const [formData, setFormData] = useState({
    EQ_Reference: '',
    EQ_Name: '',
    EQ_DateService: new Date().toISOString().split('T')[0],
    EQ_ProchaineVGP: new Date().toISOString().split('T')[0],
    EQ_Status: 'OPERATIONNEL'
  });

  // Hydratation du formulaire en cas d'édition
  useEffect(() => {
    if (equipment) {
      setFormData({
        EQ_Reference: equipment.EQ_Reference || '',
        EQ_Name: equipment.EQ_Name || '',
        EQ_DateService: equipment.EQ_DateService ? new Date(equipment.EQ_DateService).toISOString().split('T')[0] : '',
        EQ_ProchaineVGP: equipment.EQ_ProchaineVGP ? new Date(equipment.EQ_ProchaineVGP).toISOString().split('T')[0] : '',
        EQ_Status: equipment.EQ_Status || 'OPERATIONNEL'
      });
    }
  }, [equipment]);

  /**
   * 🚀 TRANSMISSION AU KERNEL
   * Détermine dynamiquement l'action (POST/PATCH) selon le contexte.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Scellage de l'équipement...");
    
    try {
      if (equipment) {
        // Mode Rectification
        await apiClient.patch(`/equipments/${equipment.EQ_Id}`, formData);
        toast.success("REGISTRE MIS À JOUR", { id: tid });
      } else {
        // Mode Nouvel Enrôlement
        await apiClient.post('/equipments', formData);
        toast.success("MATÉRIEL ENRÔLÉ AVEC SUCCÈS", { id: tid });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Échec Kernel Équipement:", err);
      toast.error(err.response?.data?.message || "Rejet de l'enregistrement", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-100 flex items-center justify-center p-4 italic">
      <div className="bg-[#0F172A] border border-white/10 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 font-sans">
        
        {/* HEADER SOC */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <Settings2 className="text-blue-500" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter leading-none">
                {equipment ? 'Rectifier' : 'Nouvel'} <span className="text-blue-500">Matériel</span>
              </h2>
              <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-2">Inventaire Souverain RD 2026</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all border-none cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 block ml-2 tracking-widest">Référence / SN</label>
              <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white font-bold outline-none focus:border-blue-500 transition-all uppercase" 
                     value={formData.EQ_Reference} onChange={(e) => setFormData({...formData, EQ_Reference: e.target.value.toUpperCase()})} placeholder="EX: SN-2025-CH01" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 block ml-2 tracking-widest">Désignation</label>
              <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white font-bold outline-none focus:border-blue-500 transition-all" 
                     value={formData.EQ_Name} onChange={(e) => setFormData({...formData, EQ_Name: e.target.value})} placeholder="EX: CHARIOT ÉLÉVATEUR TOYOTA" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 block ml-2 tracking-widest">Mise en service</label>
              <input type="date" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white font-bold outline-none focus:border-blue-500" 
                     value={formData.EQ_DateService} onChange={(e) => setFormData({...formData, EQ_DateService: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 block ml-2 tracking-widest">Échéance VGP</label>
              <input type="date" required className="w-full bg-white/5 border border-orange-500/30 rounded-2xl p-4 text-sm text-orange-500 font-bold outline-none focus:border-orange-500" 
                     value={formData.EQ_ProchaineVGP} onChange={(e) => setFormData({...formData, EQ_ProchaineVGP: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 block ml-2 tracking-widest">Statut Opérationnel Matrix</label>
            <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white font-black outline-none appearance-none cursor-pointer uppercase italic"
                    value={formData.EQ_Status} onChange={(e) => setFormData({...formData, EQ_Status: e.target.value})}>
              <option value="OPERATIONNEL">✅ Opérationnel (Actif)</option>
              <option value="EN_MAINTENANCE">🛠️ En Maintenance</option>
              <option value="HS">🚨 Hors Service / Réforme</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 py-6 rounded-3xl font-black uppercase italic text-white flex items-center justify-center gap-4 hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/30 active:scale-95 border-none cursor-pointer">
            {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />} 
            {equipment ? 'Sceller les modifications' : 'Enregistrer le matériel'}
          </button>
        </form>
      </div>
    </div>
  );
}