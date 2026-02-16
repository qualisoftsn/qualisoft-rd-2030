/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { matrixApi, MatrixUserPayload } from '@/services/matrix.service';
import { X, Save, Loader2, User, Mail, Lock, Shield, Building2, Eye, EyeOff } from 'lucide-react';
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

const SYSTEM_ROLES = [
  { value: 'SUPER_ADMIN', label: '👑 SUPER ADMIN (Matrix)', desc: 'Accès total', color: 'bg-red-50 border-red-200 text-red-700' },
  { value: 'ADMIN', label: '🏢 ADMIN TENANT', desc: 'DG / Admin Local', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 'ADMIN_RQ', label: '⭐ RESP. QUALITÉ', desc: 'Pilote le SMI', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { value: 'PILOTE', label: '✈️ PILOTE', desc: 'Gère ses processus', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { value: 'AUDITEUR', label: '🔍 AUDITEUR', desc: 'Fait des audits', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { value: 'OBSERVATEUR', label: '👀 OBSERVATEUR', desc: 'Lecture seule', color: 'bg-slate-50 border-slate-200 text-slate-700' },
];

export default function MatrixUserModal({ isOpen, onClose, onSuccess, userToEdit }: Props) {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<MatrixUserPayload>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'ADMIN',
    tenantId: ''
  });

  // Chargement des données
  useEffect(() => {
    if (isOpen) {
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
          toast.error("Erreur chargement organisations");
        }
      };
      loadTenants();

      if (userToEdit) {
        setFormData({
          id: userToEdit.U_Id, 
          firstName: userToEdit.U_FirstName || '',
          lastName: userToEdit.U_LastName || '',
          email: userToEdit.U_Email || '',
          role: userToEdit.U_Role || 'ADMIN',
          tenantId: userToEdit.tenantId || userToEdit.T_Id || '', 
          password: '' 
        });
      } else {
        setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'ADMIN', tenantId: '' });
      }
    }
  }, [isOpen, userToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🧹 NETTOYAGE CHIRURGICAL DU PAYLOAD AVANT ENVOI
      // On retire l'ID du body (car il est dans l'URL pour le PUT)
      // On retire le password s'il est vide (pour ne pas l'écraser avec du vide)
      const cleanPayload: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        role: formData.role,
        tenantId: formData.tenantId
      };

      // Gestion spécifique du mot de passe
      if (formData.password && formData.password.trim().length > 0) {
        cleanPayload.password = formData.password;
      }

      if (userToEdit && userToEdit.U_Id) {
        // --- UPDATE (PATCH) ---
        console.log("📤 PATCH Payload:", cleanPayload);
        await matrixApi.updateUser(userToEdit.U_Id, cleanPayload);
        toast.success("Utilisateur mis à jour.");
      } else {
        // --- CREATE (POST) ---
        // Pour la création, le mot de passe est obligatoire ou généré
        if (!cleanPayload.password) cleanPayload.password = "Qualisoft@2026";
        
        console.log("📤 POST Payload:", cleanPayload);
        await matrixApi.createGlobalUser(cleanPayload);
        toast.success("Utilisateur créé.");
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erreur API:", err);
      const msg = err.response?.data?.message;
      const displayMsg = Array.isArray(msg) ? msg.join(' | ') : (msg || "Erreur serveur (500)");
      toast.error(`Échec : ${displayMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const isEditMode = !!userToEdit;

  // Style commun pour les inputs (High Contrast)
  const inputClass = "w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 font-bold text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-slate-400";
  const labelClass = "text-[10px] font-black uppercase text-slate-500 ml-1 mb-1 block tracking-wide";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 font-sans shadow-blue-900/20 border border-slate-200 flex flex-col max-h-[95vh]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3 italic">
               {isEditMode ? <User className="text-blue-600" size={28} /> : <Save className="text-blue-600" size={28} />}
               {isEditMode ? 'Modifier Agent' : 'Nouvel Agent'}
            </h2>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              {isEditMode ? `Mise à jour : ${userToEdit.U_Email}` : "Création d'un accès système"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors border border-slate-200">
            <X size={24} />
          </button>
        </div>

        {/* FORMULAIRE SCROLLABLE */}
        <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
          <form id="matrix-form" onSubmit={handleSubmit} className="space-y-6 pb-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Prénom</label>
                <input required className={inputClass}
                  value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="Ex: Moussa" />
              </div>
              <div>
                <label className={labelClass}>Nom</label>
                <input required className={inputClass}
                  value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Ex: DIOP" />
              </div>
            </div>

            <div>
                <label className={labelClass}>Email Corporatif (Login)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required type="email" className={`${inputClass} pl-12`}
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@domaine.sn" />
                </div>
            </div>

            <div>
                <label className={labelClass}>
                  {isEditMode ? 'Nouveau Mot de passe (Optionnel)' : 'Mot de passe initial'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                      type={showPassword ? "text" : "password"} 
                      required={!isEditMode} 
                      className={`${inputClass} pl-12 pr-12`}
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                      placeholder={isEditMode ? "Laisser vide pour ne pas changer" : "Créer un mot de passe"} 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
            </div>

            <div>
                <label className={labelClass}>Organisation d&apos;affectation</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  <select 
                      required
                      className={`${inputClass} pl-12 appearance-none cursor-pointer bg-slate-50 hover:bg-white`}
                      value={formData.tenantId}
                      onChange={e => setFormData({...formData, tenantId: e.target.value})}
                  >
                      <option value="">-- Sélectionner l&apos;organisation --</option>
                      <option value="MATRIX" className="font-bold text-red-600">⚠️ QUALISOFT ELITE (Staff Interne)</option>
                      {tenants.map(t => (
                        <option key={t.T_Id} value={t.T_Id}>{t.T_Name} ({t.T_Domain})</option>
                      ))}
                  </select>
                </div>
            </div>

            <div>
                <label className={labelClass}>Niveau d&apos;accréditation</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SYSTEM_ROLES.map((roleOption) => (
                      <label key={roleOption.value} 
                        className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.role === roleOption.value 
                            ? `${roleOption.color} border-current ring-1 ring-current` 
                            : 'border-slate-100 bg-slate-50 hover:border-slate-300'
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
                        <div>
                            <span className="text-[10px] font-black uppercase block leading-tight">
                                {roleOption.label}
                            </span>
                            <span className="text-[9px] font-medium opacity-80 block mt-1">
                                {roleOption.desc}
                            </span>
                        </div>
                      </label>
                  ))}
                </div>
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex gap-4 shrink-0">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black uppercase text-[11px] hover:bg-slate-50 hover:border-slate-300 transition-colors">
              Annuler
            </button>
            <button form="matrix-form" type="submit" disabled={loading} className="flex-2 py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-[11px] hover:bg-blue-600 transition-colors shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {loading ? 'Traitement...' : (isEditMode ? 'Enregistrer Modifications' : 'Créer Utilisateur')}
            </button>
        </div>

      </div>
    </div>
  );
}