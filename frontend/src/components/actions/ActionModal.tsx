/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : ActionModal
 * -------------------------------------------------------------------------
 * RÔLE : Formulaire d'injection d'actions dans le PAQ Master.
 * LOGIQUE : Requiert une liaison obligatoire à un PAQ pour l'isolation analytique.
 * ISOLATION : Les listes 'users' et 'paqs' sont filtrées par le Kernel en amont.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { X, Save, Loader2, Target, ShieldAlert, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ActionModal({ onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [paqs, setPaqs] = useState<any[]>([]);
  
  // --- ÉTAT INITIAL DU FORMULAIRE ---
  const [formData, setFormData] = useState({
    ACT_Title: '',
    ACT_Description: '',
    ACT_Priority: 'MEDIUM',
    ACT_Deadline: '',
    ACT_ResponsableId: '',
    ACT_PAQId: '', // Pivot obligatoire pour le regroupement ISO
    ACT_Origin: 'AUDIT'
  });

  /**
   * 🔄 CHARGEMENT DES RÉFÉRENTIELS DU TENANT
   * On récupère uniquement les acteurs et plans d'actions du périmètre client.
   */
  const loadReferentials = useCallback(async () => {
    try {
      const [resUsers, resPaqs] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/paq') 
      ]);
      setUsers(resUsers.data || []);
      setPaqs(resPaqs.data || []);
    } catch (err) {
      toast.error("Erreur de synchronisation des référentiels");
    }
  }, []);

  useEffect(() => { loadReferentials(); }, [loadReferentials]);

  /**
   * 🚀 SOUMISSION AU KERNEL
   * Valide et scelle l'action corrective.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation stricte des dépendances
    if (!formData.ACT_ResponsableId || !formData.ACT_PAQId) {
      toast.error("Pilote et Plan d'Action obligatoires");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/actions', formData);
      toast.success("Action scellée dans le PAQ");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Le Kernel a rejeté l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-100 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-4xl overflow-hidden text-left italic">
        
        {/* HEADER MODAL */}
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-blue-50/40">
          <div>
            <h2 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter">Nouvelle Action Corrective</h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Initialisation du flux d&apos;amélioration</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white rounded-2xl text-slate-400 hover:text-red-500 hover:rotate-90 transition-all border-none cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* FORMULAIRE ACTIF */}
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Désignation de l&apos;Action</label>
            <input required placeholder="Titre explicite de l'action corrective..." 
                   className="w-full bg-slate-50 border-none rounded-2xl p-6 text-sm font-black italic uppercase outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner"
                   value={formData.ACT_Title} onChange={e => setFormData({...formData, ACT_Title: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Pilote (Responsable)</label>
              <select required className="w-full bg-slate-50 border-none rounded-2xl p-6 text-[11px] font-black uppercase italic outline-none cursor-pointer shadow-inner"
                      value={formData.ACT_ResponsableId} onChange={e => setFormData({...formData, ACT_ResponsableId: e.target.value})}>
                <option value="">-- Sélectionner Pilote --</option>
                {users.map(u => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Liaison PAQ Master</label>
              <select required className="w-full bg-slate-50 border-none rounded-2xl p-6 text-[11px] font-black uppercase italic outline-none cursor-pointer shadow-inner"
                      value={formData.ACT_PAQId} onChange={e => setFormData({...formData, ACT_PAQId: e.target.value})}>
                <option value="">-- Lier au Plan Global --</option>
                {paqs.map(p => <option key={p.PAQ_Id} value={p.PAQ_Id}>{p.PAQ_Title}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest flex items-center gap-2"><Calendar size={12}/> Échéance Requise</label>
              <input type="date" required className="w-full bg-slate-50 border-none rounded-2xl p-6 text-[11px] font-black italic outline-none shadow-inner"
                     value={formData.ACT_Deadline} onChange={e => setFormData({...formData, ACT_Deadline: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest flex items-center gap-2"><ShieldAlert size={12}/> Niveau de Priorité</label>
              <select className="w-full bg-slate-50 border-none rounded-2xl p-6 text-[11px] font-black uppercase italic outline-none cursor-pointer shadow-inner"
                      value={formData.ACT_Priority} onChange={e => setFormData({...formData, ACT_Priority: e.target.value})}>
                <option value="LOW">Basse</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Haute Priority</option>
                <option value="CRITICAL">⚠️ Critique</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Détails de mise en œuvre</label>
            <textarea placeholder="Décrire les étapes de réalisation..." className="w-full bg-slate-50 border-none rounded-3xl p-6 text-xs font-bold min-h-32 italic outline-none focus:ring-2 focus:ring-blue-600 shadow-inner"
                      value={formData.ACT_Description} onChange={e => setFormData({...formData, ACT_Description: e.target.value})} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-3xl font-black uppercase italic text-white flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Enregistrer & Sceller l&apos;Action
          </button>
        </form>
      </div>
    </div>
  );
}