/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 📝 MODULE : CAUSERIE FORM (CRÉATION DE SESSION SÉCURITÉ)
 * -------------------------------------------------------------------------
 * FONCTION : Programmation d'une nouvelle sensibilisation (§7.3 ISO 45001).
 * RÔLE : Enregistrer l'événement dans la base de données du Tenant.
 * ISOLATION : La liste des animateurs est strictement filtrée par le SDE (Tenant).
 */

import React, { useState, useEffect } from 'react';
import { X, Save, ShieldAlert, Users, Calendar, Loader2, Target } from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast } from 'react-hot-toast';

// 🛡️ CORRECTION TYPE SCRIPT : L'interface est désormais scellée et accepte onRefresh
export interface SSEFormProps {
  onClose: () => void;
  onRefresh: () => Promise<void> | void;
}

export default function CauserieForm({ onClose, onRefresh }: SSEFormProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  
  // Modèle de données aligné sur le schéma Prisma (Préfixe CS_)
  const [formData, setFormData] = useState({
    CS_Theme: '',
    CS_Date: new Date().toISOString().split('T')[0],
    CS_AnimateurId: '',
    CS_Description: '',
    CS_Type: 'SÉCURITÉ', // SÉCURITÉ, ENVIRONNEMENT, QUALITÉ
  });

  /**
   * 📡 SYNCHRONISATION MATRIX
   * Récupère uniquement les utilisateurs accrédités du Tenant actuel
   */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient.get('/users');
        setUsers(res.data || []);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Erreur de liaison : Impossible de charger les animateurs.");
      }
    };
    fetchUsers();
  }, []);

  /**
   * 🚀 SOUMISSION SCELLÉE
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Création de la session dans le registre...");

    try {
      // Le x-tenant-id est injecté automatiquement par l'intercepteur apiClient
      await apiClient.post('/causeries', formData);
      toast.success("SESSION DE SENSIBILISATION SCELLÉE", { id: tid });
      
      // On rafraîchit les données du tableau de bord parent
      await onRefresh();
      
      // On ferme la modale
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Rejet du Kernel : Échec de création.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-6 italic font-sans animate-in fade-in zoom-in-95 duration-500">
      
      {/* 🛡️ CONTENEUR ELITE */}
      <div className="bg-[#0F172A] border border-blue-500/20 w-full max-w-2xl rounded-[4rem] shadow-[0_0_100px_rgba(37,99,235,0.15)] relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-12 border-b border-white/5 flex justify-between items-center relative z-10 shrink-0">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-lg shadow-blue-600/30">
               <ShieldAlert size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                Programmer <br/><span className="text-blue-500">Sensibilisation</span>
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-4 bg-white/5 hover:bg-red-500/20 rounded-full text-slate-400 hover:text-red-500 transition-all border-none cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* CORPS DU FORMULAIRE */}
        <div className="p-12 overflow-y-auto custom-scrollbar relative z-10 text-left flex-1">
          <form id="causerie-form" onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-2 flex items-center gap-2">
                <Target size={14} className="text-blue-500" /> Thème de la causerie
              </label>
              <input 
                required
                placeholder="EX: PORT DES EPI, RISQUES CHIMIQUES..."
                className="w-full bg-slate-900 border-2 border-white/10 rounded-4xl p-6 text-sm font-black text-white outline-none focus:border-blue-500 transition-all uppercase tracking-widest"
                value={formData.CS_Theme}
                onChange={(e) => setFormData({...formData, CS_Theme: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-2 flex items-center gap-2">
                  <Calendar size={14} className="text-blue-500" /> Date prévue
                </label>
                <input 
                  type="date"
                  required
                  className="w-full bg-slate-900 border-2 border-white/10 rounded-4xl p-6 text-sm font-black text-white outline-none focus:border-blue-500 transition-all"
                  value={formData.CS_Date}
                  onChange={(e) => setFormData({...formData, CS_Date: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-2 flex items-center gap-2">
                  <ShieldAlert size={14} className="text-blue-500" /> Domaine
                </label>
                <select 
                  className="w-full bg-slate-900 border-2 border-white/10 rounded-4xl p-6 text-[11px] font-black text-white uppercase outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none tracking-widest"
                  value={formData.CS_Type}
                  onChange={(e) => setFormData({...formData, CS_Type: e.target.value})}
                >
                  <option value="SÉCURITÉ">SANTÉ & SÉCURITÉ</option>
                  <option value="ENVIRONNEMENT">ENVIRONNEMENT</option>
                  <option value="QUALITÉ">QUALITÉ OPÉRATIONNELLE</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-2 flex items-center gap-2">
                <Users size={14} className="text-blue-500" /> Animateur / Référent
              </label>
              <select 
                required
                className="w-full bg-slate-900 border-2 border-white/10 rounded-4xl p-6 text-[11px] font-black text-white uppercase outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none tracking-widest"
                value={formData.CS_AnimateurId}
                onChange={(e) => setFormData({...formData, CS_AnimateurId: e.target.value})}
              >
                <option value="">-- DÉSIGNER UN ANIMATEUR MATRIX --</option>
                {users.map(u => (
                  <option key={u.U_Id} value={u.U_Id}>
                    {u.U_FirstName} {u.U_LastName} - {u.U_Role}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-2">
                Objectifs & Directives (Optionnel)
              </label>
              <textarea 
                rows={3}
                placeholder="RAPPEL DES CONSIGNES DE SÉCURITÉ..."
                className="w-full bg-slate-900 border-2 border-white/10 rounded-4xl p-6 text-sm font-bold text-slate-300 outline-none focus:border-blue-500 transition-all italic leading-relaxed"
                value={formData.CS_Description}
                onChange={(e) => setFormData({...formData, CS_Description: e.target.value})}
              />
            </div>
          </form>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-10 border-t border-white/5 bg-slate-900/50 relative z-10 shrink-0">
          <button 
            type="submit" 
            form="causerie-form"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.3em] text-white shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 border-none cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Sceller au registre des Causeries
          </button>
        </div>

      </div>
    </div>
  );
}