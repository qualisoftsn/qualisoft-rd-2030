/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 📝 MODULE : CAUSERIE FORM (CRÉATION DE SESSION SÉCURITÉ)
 * -------------------------------------------------------------------------
 * FONCTION : Programmation d'une nouvelle sensibilisation (§7.3 ISO 45001).
 * RÔLE : Enregistrer l'événement dans la base de données scellée du Tenant.
 * ISOLATION : La liste des animateurs est strictement filtrée par le SDE (Tenant actif).
 */

import React, { useState, useEffect } from 'react';
import { X, Save, ShieldAlert, Users, Calendar, Loader2, Target } from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast } from 'react-hot-toast';

// 🛡️ CORRECTION TYPESCRIPT CRITIQUE
// L'interface déclare explicitement 'onRefresh' pour correspondre à l'appel dans page.tsx.
// L'utilisation de '() => any' garantit la compatibilité avec Promise<void> (fetchData).
export interface SSEFormProps {
  onClose: () => void;
  onRefresh: () => any;
}

export default function CauserieForm({ onClose, onRefresh }: SSEFormProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  
  // Modèle de données strict aligné sur le schéma Prisma (Préfixe CS_)
  const [formData, setFormData] = useState({
    CS_Theme: '',
    CS_Date: new Date().toISOString().split('T')[0],
    CS_AnimateurId: '',
    CS_Description: '',
    CS_Type: 'SÉCURITÉ', // Valeurs autorisées : SÉCURITÉ, ENVIRONNEMENT, QUALITÉ
  });

  /**
   * 📡 SYNCHRONISATION MATRIX (ISOLATION)
   * Récupère uniquement les utilisateurs accrédités du Tenant actuel.
   * apiClient injecte le Header 'x-tenant-id' automatiquement.
   */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient.get('/users');
        setUsers(res.data || []);
      } catch (error) {
        console.error("Qualisoft Kernel: Échec de lecture de l'annuaire.", error);
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
    const tid = toast.loading("Scellage de la session dans le registre...");

    try {
      // Transmission sécurisée au Kernel
      await apiClient.post('/causeries', formData);
      toast.success("SESSION DE SENSIBILISATION SCELLÉE", { id: tid });
      
      // 🔄 Rafraîchissement silencieux du tableau de bord parent (Résolution de l'erreur TS)
      await onRefresh();
      
      // Fermeture du terminal de saisie
      onClose();
    } catch (err: any) {
      console.error("Qualisoft Kernel: Rejet de la transaction.", err);
      toast.error(err.response?.data?.message || "Rejet du Kernel : Échec de création.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-6 italic font-sans animate-in fade-in zoom-in-95 duration-500">
      
      {/* 🛡️ CONTENEUR ELITE QUALISOFT 2026 */}
      <div className="bg-[#0F172A] border border-blue-500/20 w-full max-w-2xl rounded-[4rem] shadow-[0_0_150px_rgba(37,99,235,0.15)] relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER SOUVERAIN */}
        <div className="p-12 border-b border-white/5 flex justify-between items-center relative z-10 shrink-0 bg-[#0B0F1A]/50">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-blue-600 rounded-4xl text-white shadow-lg shadow-blue-600/30 border border-blue-400/50 animate-pulse">
               <ShieldAlert size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
                Programmer <br/><span className="text-blue-500">Sensibilisation</span>
              </h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2">
                ISO 45001 • Prévention des risques
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-4 bg-white/5 hover:bg-red-500 hover:text-white rounded-full text-slate-400 transition-all border border-white/5 shadow-inner cursor-pointer active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        {/* CORPS DU FORMULAIRE */}
        <div className="p-12 overflow-y-auto custom-scrollbar relative z-10 text-left flex-1 bg-[#0F172A]">
          <form id="causerie-form" onSubmit={handleSubmit} className="space-y-10">
            
            {/* THÈME */}
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase text-blue-500 tracking-[0.3em] ml-2 flex items-center gap-3">
                <Target size={16} /> Thème de la causerie
              </label>
              <input 
                required
                autoFocus
                placeholder="EX: PORT DES EPI, RISQUES CHIMIQUES..."
                className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-[2.5rem] p-6 text-sm font-black text-white outline-none focus:border-blue-500 transition-all uppercase tracking-widest shadow-inner placeholder:text-slate-700"
                value={formData.CS_Theme}
                onChange={(e) => setFormData({...formData, CS_Theme: e.target.value})}
              />
            </div>

            {/* DATE & DOMAINE (GRID) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] ml-2 flex items-center gap-3">
                  <Calendar size={16} className="text-blue-500" /> Date d&apos;exécution
                </label>
                <input 
                  type="date"
                  required
                  className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-[2.5rem] p-6 text-sm font-black text-white outline-none focus:border-blue-500 transition-all shadow-inner"
                  value={formData.CS_Date}
                  onChange={(e) => setFormData({...formData, CS_Date: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] ml-2 flex items-center gap-3">
                  <ShieldAlert size={16} className="text-blue-500" /> Périmètre ISO
                </label>
                <select 
                  className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-[2.5rem] p-6 text-[11px] font-black text-white uppercase outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none tracking-widest shadow-inner"
                  value={formData.CS_Type}
                  onChange={(e) => setFormData({...formData, CS_Type: e.target.value})}
                >
                  <option value="SÉCURITÉ">SANTÉ & SÉCURITÉ (45001)</option>
                  <option value="ENVIRONNEMENT">ENVIRONNEMENT (14001)</option>
                  <option value="QUALITÉ">QUALITÉ OPÉRATIONNELLE (9001)</option>
                </select>
              </div>
            </div>

            {/* ANIMATEUR MATRIX */}
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] ml-2 flex items-center gap-3">
                <Users size={16} className="text-blue-500" /> Animateur / Référent
              </label>
              <select 
                required
                className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-[2.5rem] p-6 text-[11px] font-black text-white uppercase outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none tracking-widest shadow-inner"
                value={formData.CS_AnimateurId}
                onChange={(e) => setFormData({...formData, CS_AnimateurId: e.target.value})}
              >
                <option value="">-- DÉSIGNER UN ANIMATEUR ACCRÉDITÉ --</option>
                {users.map(u => (
                  <option key={u.U_Id} value={u.U_Id}>
                    {u.U_FirstName} {u.U_LastName} — [{u.U_Role}]
                  </option>
                ))}
              </select>
            </div>

            {/* DIRECTIVES */}
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] ml-2">
                Objectifs & Directives (Optionnel)
              </label>
              <textarea 
                rows={4}
                placeholder="RAPPEL DES CONSIGNES DE SÉCURITÉ, RISQUES IDENTIFIÉS..."
                className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-[2.5rem] p-6 text-xs font-bold text-slate-300 outline-none focus:border-blue-500 transition-all italic leading-relaxed shadow-inner placeholder:text-slate-700"
                value={formData.CS_Description}
                onChange={(e) => setFormData({...formData, CS_Description: e.target.value})}
              />
            </div>
          </form>
        </div>

        {/* FOOTER ACTIONS MATRIX */}
        <div className="p-10 border-t border-white/5 bg-[#0B0F1A] relative z-10 shrink-0">
          <button 
            type="submit" 
            form="causerie-form"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.3em] text-white shadow-[0_15px_30px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 border-none cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
            {loading ? "SCELLAGE EN COURS..." : "Sceller au registre des Causeries"}
          </button>
        </div>

      </div>
    </div>
  );
}