/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { X, Save, Loader2, Settings2 } from 'lucide-react';

interface Props {
  equipment?: any; // Si présent, on est en mode édition
  onClose: () => void;
  onSuccess: () => void;
}

export default function EquipmentModal({ equipment, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    EQ_Reference: '',
    EQ_Name: '',
    EQ_DateService: new Date().toISOString().split('T')[0],
    EQ_ProchaineVGP: new Date().toISOString().split('T')[0],
    EQ_Status: 'OPERATIONNEL'
  });

  useEffect(() => {
    if (equipment) {
      setFormData({
        EQ_Reference: equipment.EQ_Reference,
        EQ_Name: equipment.EQ_Name,
        EQ_DateService: new Date(equipment.EQ_DateService).toISOString().split('T')[0],
        EQ_ProchaineVGP: new Date(equipment.EQ_ProchaineVGP).toISOString().split('T')[0],
        EQ_Status: equipment.EQ_Status
      });
    }
  }, [equipment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (equipment) {
        await apiClient.patch(`/equipments/${equipment.EQ_Id}`, formData);
      } else {
        await apiClient.post('/equipments', formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erreur équipement:", err);
      alert("Erreur lors de l'enregistrement de l'équipement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-100 flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-white/10 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <Settings2 className="text-blue-500" />
            <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter">
              {equipment ? 'Éditer' : 'Nouveau'} <span className="text-blue-500">Matériel</span>
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 block mb-2 italic tracking-widest">Référence / Numéro de Série</label>
              <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 transition-all" 
                     value={formData.EQ_Reference} onChange={(e) => setFormData({...formData, EQ_Reference: e.target.value})} placeholder="Ex: SN-2025-CH01" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 block mb-2 italic tracking-widest">Désignation</label>
              <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 transition-all" 
                     value={formData.EQ_Name} onChange={(e) => setFormData({...formData, EQ_Name: e.target.value})} placeholder="Ex: Chariot Élévateur Toyota" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 block mb-2 italic tracking-widest">Mise en service</label>
              <input type="date" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none" 
                     value={formData.EQ_DateService} onChange={(e) => setFormData({...formData, EQ_DateService: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 block mb-2 italic tracking-widest">Prochaine VGP</label>
              <input type="date" required className="w-full bg-white/5 border border-orange-500/20 rounded-2xl p-4 text-orange-500 font-bold outline-none" 
                     value={formData.EQ_ProchaineVGP} onChange={(e) => setFormData({...formData, EQ_ProchaineVGP: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 block mb-2 italic tracking-widest">Statut Opérationnel</label>
            <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none appearance-none"
                    value={formData.EQ_Status} onChange={(e) => setFormData({...formData, EQ_Status: e.target.value})}>
              <option value="OPERATIONNEL">Opérationnel (Actif)</option>
              <option value="EN_MAINTENANCE">En Maintenance</option>
              <option value="HS">Hors Service / Réforme</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 py-6 rounded-2xl font-black uppercase italic flex items-center justify-center gap-3 hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20">
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
            {equipment ? 'Mettre à jour le registre' : 'Enregistrer le matériel'}
          </button>
        </form>
      </div>
    </div>
  );
}