/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { matrixApi } from '@/services/matrix.service';
import { X, Save, Loader2, User, Mail, Lock, Shield, Building2, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';
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
  userToEdit?: any;
}

// ⚠️ BASÉ STRICTEMENT SUR LE SCHEMA PRISMA (enum Role)
const PRISMA_ROLES = [
  { value: 'SUPER_ADMIN', label: '👑 SUPER ADMIN', desc: 'Accès total Matrix', color: 'bg-red-50 border-red-500 text-red-900' },
  { value: 'ADMIN', label: '🏢 ADMIN TENANT', desc: 'Directeur / Admin Local', color: 'bg-blue-50 border-blue-500 text-blue-900' },
  { value: 'RQ', label: '⭐ RESP. QUALITÉ (RQ)', desc: 'Pilotage du SMI', color: 'bg-indigo-50 border-indigo-500 text-indigo-900' },
  { value: 'PILOTE', label: '✈️ PILOTE', desc: 'Propriétaire de processus', color: 'bg-emerald-50 border-emerald-500 text-emerald-900' },
  { value: 'COPILOTE', label: '🛩️ CO-PILOTE', desc: 'Suppléant processus', color: 'bg-teal-50 border-teal-500 text-teal-900' },
  { value: 'AUDITEUR', label: '🔍 AUDITEUR', desc: 'Réalise les audits', color: 'bg-amber-50 border-amber-500 text-amber-900' },
  { value: 'HSE', label: '⛑️ HSE MANAGER', desc: 'Gestion Santé Sécurité', color: 'bg-orange-50 border-orange-500 text-orange-900' },
  { value: 'SAFETY_OFFICER', label: '🛡️ SAFETY OFFICER', desc: 'Agent de sécurité', color: 'bg-orange-50 border-orange-500 text-orange-900' },
  { value: 'DIRECTION', label: '👔 DIRECTION', desc: 'Revue de direction', color: 'bg-purple-50 border-purple-500 text-purple-900' },
  { value: 'USER', label: '👤 UTILISATEUR', desc: 'Accès standard', color: 'bg-slate-50 border-slate-400 text-slate-900' },
  { value: 'OBSERVATEUR', label: '👀 OBSERVATEUR', desc: 'Lecture seule', color: 'bg-gray-50 border-gray-400 text-gray-900' },
];

export default function MatrixUserModal({ isOpen, onClose, onSuccess, userToEdit }: Props) {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  // État du formulaire
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'ADMIN',
    tenantId: ''
  });

  // Chargement initial
  useEffect(() => {
    if (isOpen) {
      setErrorDetails(null);
      
      // 1. Charger les Tenants
      const loadTenants = async () => {
        try {
          const data = await matrixApi.getTenants();
          const simpleList = (Array.isArray(data) ? data : []).map((t: any) => ({
             T_Id: t.T_Id,
             T_Name: t.T_Name,
             T_Domain: t.T_Domain
          }));
          setTenants(simpleList);
        } catch (e) {
          console.error(e);
          toast.error("Erreur critique : Impossible de charger les organisations.");
        }
      };
      loadTenants();

      // 2. Pré-remplissage (Mapping Prisma -> Form)
      if (userToEdit) {
        setForm({
          firstName: userToEdit.U_FirstName || '',
          lastName: userToEdit.U_LastName || '',
          email: userToEdit.U_Email || '',
          role: userToEdit.U_Role || 'USER', // Fallback safe
          tenantId: userToEdit.tenantId || userToEdit.T_Id || '', 
          password: '' 
        });
      } else {
        // Reset
        setForm({ firstName: '', lastName: '', email: '', password: '', role: 'ADMIN', tenantId: '' });
      }
    }
  }, [isOpen, userToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorDetails(null);

    try {
      // 🏗️ CONSTRUCTION DU DTO (Data Transfer Object)
      // Le backend attend du camelCase standard. Il fera le mapping vers U_... en interne.
      const payload: any = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        role: form.role, // Doit correspondre EXACTEMENT à l'enum Prisma
      };

      // Gestion du Password
      if (form.password && form.password.trim().length > 0) {
        payload.password = form.password;
      }

      if (userToEdit && userToEdit.U_Id) {
        // --- UPDATE (PATCH) ---
        // Ne JAMAIS envoyer l'ID ou le tenantId dans le body d'un PATCH user si l'API ne le gère pas explicitement
        console.log("📤 PATCH Payload:", payload);
        await matrixApi.updateUser(userToEdit.U_Id, payload);
        toast.success("Mise à jour réussie");
      } else {
        // --- CREATE (POST) ---
        payload.tenantId = form.tenantId; // Obligatoire pour la création
        if (!payload.password) payload.password = "Qualisoft@2026"; // Default password policy
        
        console.log("📤 POST Payload:", payload);
        await matrixApi.createGlobalUser(payload);
        toast.success("Utilisateur créé avec succès");
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("🔥 Erreur Matrix:", err);
      
      // Extraction intelligente du message d'erreur
      let message = "Erreur serveur inconnue";
      if (err.response?.data?.message) {
        const rawMsg = err.response.data.message;
        message = Array.isArray(rawMsg) ? rawMsg.join(' | ') : rawMsg;
      }
      
      setErrorDetails(message);
      toast.error("Échec de l'opération");
    } finally {
      setLoading(false);
    }
  };

  const isEditMode = !!userToEdit;
  
  // Styles "High Contrast" pour lisibilité maximale
  const labelClass = "block text-[11px] font-black uppercase text-slate-700 mb-1.5 tracking-wide";
  const inputClass = "w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
               {isEditMode ? <User className="text-blue-600" size={24} /> : <Save className="text-blue-600" size={24} />}
               {isEditMode ? `Édition : ${form.lastName}` : 'Nouvel Agent Matrix'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-red-50 hover:text-red-600 border border-slate-200 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* ERROR BANNER */}
        {errorDetails && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border-l-4 border-red-600 rounded-r-lg flex items-start gap-3">
            <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
            <div className="flex-1">
              <p className="text-xs font-black text-red-800 uppercase">Erreur Système</p>
              <p className="text-xs text-red-700 mt-1 font-medium font-mono">{errorDetails}</p>
            </div>
          </div>
        )}

        {/* FORMULAIRE */}
        <div className="overflow-y-auto p-6 custom-scrollbar flex-1">
          <form id="matrix-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* IDENTITÉ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Prénom <span className="text-red-500">*</span></label>
                <input required className={inputClass}
                  value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="Ex: Moussa" />
              </div>
              <div>
                <label className={labelClass}>Nom <span className="text-red-500">*</span></label>
                <input required className={inputClass}
                  value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} placeholder="Ex: DIOP" />
              </div>
            </div>

            {/* CONNEXION */}
            <div>
                <label className={labelClass}>Email (Login) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input required type="email" className={`${inputClass} pl-12`}
                      value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@domaine.sn" />
                </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className={labelClass}>
                  {isEditMode ? 'Modifier le Mot de passe' : 'Mot de passe Initial'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                      type={showPassword ? "text" : "password"} 
                      className={`${inputClass} pl-12 pr-12 bg-white`}
                      value={form.password} 
                      onChange={e => setForm({...form, password: e.target.value})} 
                      placeholder={isEditMode ? "•••••••• (Inchangé)" : "Par défaut: Qualisoft@2026"} 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 cursor-pointer">
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
                {!isEditMode && !form.password && (
                  <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-green-500"/> Mot de passe par défaut : <strong>Qualisoft@2026</strong>
                  </p>
                )}
            </div>

            {/* CONTEXTE MATRIX */}
            <div className="grid grid-cols-1 gap-6 pt-4 border-t border-slate-100">
                
                {/* TENANT */}
                <div>
                    <label className={labelClass}>Organisation Cible <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                      <select 
                          required
                          disabled={isEditMode}
                          className={`${inputClass} pl-12 appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-500`}
                          value={form.tenantId}
                          onChange={e => setForm({...form, tenantId: e.target.value})}
                      >
                          <option value="">-- Sélectionner une organisation --</option>
                          <option value="MATRIX" className="font-bold text-red-600">⚠️ QUALISOFT ELITE (Staff Interne)</option>
                          {tenants.map(t => (
                            <option key={t.T_Id} value={t.T_Id}>{t.T_Name} ({t.T_Domain})</option>
                          ))}
                      </select>
                    </div>
                </div>

                {/* ROLE - BASÉ SUR SCHEMA PRISMA */}
                <div>
                    <label className={labelClass}>Rôle Système (Prisma Enum) <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                      {PRISMA_ROLES.map((roleOption) => (
                          <label key={roleOption.value} 
                            className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                form.role === roleOption.value 
                                ? `${roleOption.color} shadow-sm ring-1 ring-offset-1 ring-slate-300` 
                                : 'border-slate-200 bg-white hover:border-slate-400 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <input 
                                type="radio" 
                                name="role" 
                                value={roleOption.value}
                                checked={form.role === roleOption.value}
                                onChange={() => setForm({...form, role: roleOption.value})}
                                className="hidden" 
                            />
                            <Shield size={18} className="mt-0.5 shrink-0" />
                            <div>
                                <span className="text-[11px] font-black uppercase block leading-tight">
                                    {roleOption.label}
                                </span>
                                <span className="text-[10px] font-medium opacity-80 block mt-1">
                                    {roleOption.desc}
                                </span>
                            </div>
                          </label>
                      ))}
                    </div>
                </div>
            </div>
          </form>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50 rounded-b-2xl">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-black uppercase text-xs hover:bg-slate-100 hover:border-slate-400 transition-all cursor-pointer">
              Annuler
            </button>
            <button form="matrix-form" type="submit" disabled={loading} className="flex-2 py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-xs hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {loading ? 'Traitement en cours...' : (isEditMode ? 'Enregistrer les modifications' : 'Créer l\'utilisateur')}
            </button>
        </div>

      </div>
    </div>
  );
}