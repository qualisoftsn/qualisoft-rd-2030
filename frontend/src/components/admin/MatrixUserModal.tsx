/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { matrixApi, MatrixUserPayload } from '@/services/matrix.service';
import { X, Save, Loader2, User, Mail, Lock, Shield, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface TenantSummary {
  T_Id: string;
  T_Name: string;
  T_Domain: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit?: any; // Si cet objet est présent, on est en mode "MODIFICATION"
}

// 📋 LISTE DES RÔLES SYSTÈME (Hiérarchie Matrix)
const SYSTEM_ROLES = [
  { value: 'SUPER_ADMIN', label: '👑 SUPER ADMIN (Matrix)', desc: 'Accès total à tous les tenants', color: 'bg-red-50 border-red-200 text-red-700' },
  { value: 'ADMIN', label: '🏢 ADMIN TENANT (DG/Admin)', desc: 'Gestion complète d\'une société', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 'ADMIN_RQ', label: '⭐ RESP. QUALITÉ (RMQ)', desc: 'Pilotage du système QHSE', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { value: 'PILOTE', label: '✈️ PILOTE PROCESSUS', desc: 'Gestion de fiche processus', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { value: 'AUDITEUR', label: '🔍 AUDITEUR', desc: 'Réalisation d\'audits', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { value: 'OBSERVATEUR', label: '👀 OBSERVATEUR', desc: 'Lecture seule', color: 'bg-slate-50 border-slate-200 text-slate-700' },
];

export default function MatrixUserModal({ isOpen, onClose, onSuccess, userToEdit }: Props) {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  
  // État du formulaire
  const [formData, setFormData] = useState<MatrixUserPayload>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'ADMIN', // Rôle par défaut
    tenantId: ''
  });

  // 🔄 Chargement initial (Tenants + Mode Édition)
  useEffect(() => {
    if (isOpen) {
      // 1. Charger la liste des sociétés pour le menu déroulant
      const loadTenants = async () => {
        try {
          const data = await matrixApi.getTenants();
          // On mappe les données complexes vers un format simple pour le select
          const simpleList = (Array.isArray(data) ? data : []).map((t: any) => ({
             T_Id: t.T_Id,
             T_Name: t.T_Name,
             T_Domain: t.T_Domain
          }));
          setTenants(simpleList);
        } catch (e) {
          console.error("Erreur chargement tenants", e);
          toast.error("Impossible de charger la liste des organisations");
        }
      };
      loadTenants();

      // 2. Si on édite, on remplit le formulaire avec les infos existantes
      if (userToEdit) {
        console.log("📝 Mode Édition pour :", userToEdit);
        setFormData({
          id: userToEdit.U_Id, // Important pour l'update
          firstName: userToEdit.U_FirstName || '',
          lastName: userToEdit.U_LastName || '',
          email: userToEdit.U_Email || '',
          role: userToEdit.U_Role || 'ADMIN',
          tenantId: userToEdit.tenantId || userToEdit.T_Id || '', // Tente de trouver l'ID du tenant
          password: '' // On laisse vide (ne change que si l'admin tape quelque chose)
        });
      } else {
        // Reset en mode création
        setFormData({
            firstName: '', lastName: '', email: '', password: '', role: 'ADMIN', tenantId: ''
        });
      }
    }
  }, [isOpen, userToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (userToEdit && userToEdit.U_Id) {
        // --- MODE UPDATE ---
        // On n'envoie le mot de passe que s'il a été saisi
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        
        // On appelle la méthode update
        await matrixApi.updateUser(userToEdit.U_Id, payload as any);
        toast.success("Utilisateur mis à jour avec succès.");
      } else {
        // --- MODE CREATE ---
        // On utilise la nouvelle méthode globale
        await matrixApi.createGlobalUser(formData);
        toast.success("Utilisateur créé et actif.");
      }
      onSuccess(); // Rafraîchir la liste parente
      onClose();   // Fermer la modal
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Erreur opération";
      toast.error("Erreur : " + (Array.isArray(msg) ? msg[0] : msg));
    } finally {
      setLoading(false);
    }
  };

  const isEditMode = !!userToEdit;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-4xl w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 font-sans italic overflow-y-auto max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
               {isEditMode ? <User className="text-blue-600" /> : <Save className="text-blue-600" />}
               {isEditMode ? 'MODIFIER L\'AGENT' : 'NOUVEL AGENT MATRIX'}
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              {isEditMode ? `Mise à jour du profil : ${userToEdit.U_Email}` : "Création d'un nouvel accès système"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors border-none cursor-pointer">
            <X size={24} className="text-slate-400 hover:text-red-500 transition-colors" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. NOM & PRÉNOM */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Prénom</label>
              <input required className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 font-bold text-xs outline-none focus:ring-2 ring-blue-500/20"
                value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="Ex: Moussa" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Nom</label>
              <input required className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 font-bold text-xs outline-none focus:ring-2 ring-blue-500/20"
                value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Ex: DIOP" />
            </div>

            {/* 2. EMAIL & PASSWORD */}
            <div className="space-y-2 md:col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Email Corporatif (Login)</label>
                <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required type="email" className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-4 font-bold text-xs outline-none focus:ring-2 ring-blue-500/20"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@domaine.sn" />
                </div>
            </div>

            <div className="space-y-2 md:col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2">
                {isEditMode ? 'Nouveau Mot de passe (Laisser vide pour conserver l\'actuel)' : 'Mot de passe initial'}
                </label>
                <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                    type="password" 
                    required={!isEditMode} 
                    className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-4 font-bold text-xs outline-none focus:ring-2 ring-blue-500/20"
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    placeholder={isEditMode ? "••••••••" : "Définir un mot de passe"} 
                />
                </div>
            </div>

            {/* 3. ORGANISATION (TENANT) - CRUCIAL POUR SUPER ADMIN */}
            <div className="space-y-2 md:col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Organisation d&apos;affectation</label>
                <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 group-focus-within:text-blue-500" size={18} />
                <select 
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-4 font-bold text-xs outline-none focus:ring-2 ring-blue-500 appearance-none text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors"
                    value={formData.tenantId}
                    onChange={e => setFormData({...formData, tenantId: e.target.value})}
                >
                    <option value="">-- Sélectionner l&apos;organisation cible --</option>
                    <option value="MATRIX" className="font-black text-red-600">⚠️ QUALISOFT ELITE (Staff Interne Matrix)</option>
                    {tenants.map(t => (
                    <option key={t.T_Id} value={t.T_Id}>{t.T_Name} ({t.T_Domain})</option>
                    ))}
                </select>
                </div>
            </div>

            {/* 4. RÔLE (LISTE COMPLÈTE) */}
            <div className="space-y-3 md:col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Niveau d&apos;accréditation</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                {SYSTEM_ROLES.map((roleOption) => (
                    <label key={roleOption.value} 
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        formData.role === roleOption.value 
                        ? `${roleOption.color} ring-2 ring-offset-1 ring-blue-500/50` 
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                    >
                    <input 
                        type="radio" 
                        name="role" 
                        value={roleOption.value}
                        checked={formData.role === roleOption.value}
                        onChange={() => setFormData({...formData, role: roleOption.value})}
                        className="hidden" 
                    />
                    <Shield size={18} className="mt-0.5 shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase">
                            {roleOption.label}
                        </span>
                        <span className="text-[9px] opacity-70 font-medium">
                            {roleOption.desc}
                        </span>
                    </div>
                    </label>
                ))}
                </div>
            </div>

          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-6 flex gap-4 border-t border-slate-100 mt-4">
             <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl font-black uppercase text-[10px] hover:bg-slate-200 transition-colors">
               Annuler
             </button>
             <button type="submit" disabled={loading} className="flex-2 py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] hover:bg-blue-600 transition-colors shadow-lg flex items-center justify-center gap-2 hover:shadow-blue-500/30">
               {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
               {loading ? 'TRAITEMENT EN COURS...' : (isEditMode ? 'ENREGISTRER LES MODIFICATIONS' : 'CRÉER L\'UTILISATEUR')}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}