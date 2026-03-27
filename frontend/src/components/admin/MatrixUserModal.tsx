/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 👑 MODULE : MatrixUserModal (User Management)
 * RÔLE : Habilitation des agents (U_)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { matrixApi, MatrixRole } from "@/services/matrix.service";
import { Loader2, Mail, Save, X, User, AlertCircle, Building2 } from "lucide-react";
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export interface Tenant {
  T_Id: string;
  T_Name: string;
  T_Domain?: string;
  T_Status?: string;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: MatrixRole;
  tenantId: string;
}

export interface UserToEdit {
  U_Id: string;
  U_FirstName?: string;
  U_LastName?: string;
  U_Email?: string;
  U_Role?: MatrixRole;
  tenantId?: string;
}

export interface MatrixUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit?: UserToEdit | null;
}

export interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  tenantId?: string;
}

export interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  icon?: React.ElementType;
  placeholder?: string;
  required?: boolean;
  error?: string;
  id: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const ROLE_OPTIONS: Array<{ value: MatrixRole; label: string; icon: string }> = [
  { value: 'SUPER_ADMIN', label: 'SUPER ADMIN', icon: '👑' },
  { value: 'ADMIN', label: 'ADMIN TENANT', icon: '🏢' },
  { value: 'RQ', label: 'RESP. QUALITÉ (RQ)', icon: '⭐' },
  { value: 'USER', label: 'COLLABORATEUR', icon: '👤' }
];

const DEFAULT_FORM: UserFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "USER",
  tenantId: ""
};

// ============================================================================
// SOUS-COMPOSANT : FORM INPUT
// ============================================================================

function FormInput({ label, value, onChange, type = "text", icon: Icon, placeholder, required, error, id }: InputProps) {
  return (
    <div className="space-y-1.5 md:space-y-2" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "text-[9px] md:text-[10px] font-black uppercase tracking-widest ml-2 md:ml-4 lg:ml-6 italic leading-none block",
          error ? "text-red-400" : "text-slate-400"
        )}
      >
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon 
            className={cn(
              "absolute left-3 md:left-4 lg:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 transition-colors",
              error ? "text-red-400" : "text-slate-400"
            )} 
            aria-hidden="true" 
          />
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          required={required}
          className={cn(
            "w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl lg:rounded-3xl p-3 md:p-4 lg:p-5 lg:p-6 text-[10px] md:text-sm font-bold italic outline-none focus:border-blue-500 transition-all",
            Icon && "pl-8 md:pl-10 lg:pl-12",
            error && "border-red-500/50 focus:border-red-500"
          )}
          aria-required={required}
          aria-invalid={!!error}
        />
      </div>
      {error && (
        <p className="text-red-400 text-[7px] md:text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function MatrixUserModal({ isOpen, onClose, onSuccess, userToEdit }: MatrixUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [form, setForm] = useState<UserFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isOpen) {
      matrixApi.getTenants()
        .then((data: Tenant[]) => setTenants(Array.isArray(data) ? data : []))
        .catch(() => toast.error("Sync Tenants Échouée"));
      
      if (userToEdit) {
        setForm({
          firstName: userToEdit.U_FirstName || "",
          lastName: userToEdit.U_LastName || "",
          email: userToEdit.U_Email || "",
          password: "",
          role: userToEdit.U_Role || "USER",
          tenantId: userToEdit.tenantId || ""
        });
      } else {
        setForm(DEFAULT_FORM);
      }
      setFormErrors({});
    }
  }, [isOpen, userToEdit]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!form.firstName.trim()) {
      errors.firstName = "Le prénom est obligatoire";
    }
    
    if (!form.lastName.trim()) {
      errors.lastName = "Le nom est obligatoire";
    }
    
    if (!form.email.trim()) {
      errors.email = "L'email est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Email invalide";
    }
    
    if (!userToEdit && !form.password) {
      errors.password = "Le mot de passe est obligatoire";
    } else if (!userToEdit && form.password.length < 8) {
      errors.password = "Le mot de passe doit comporter au moins 8 caractères";
    }
    
    if (!userToEdit && !form.tenantId) {
      errors.tenantId = "Le tenant est obligatoire";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading("Scellage Matrix Kernel...");

    try {
      const payload = { 
        ...form, 
        email: form.email.toLowerCase().trim(),
        firstName: form.firstName.toUpperCase(),
        lastName: form.lastName.toUpperCase()
      };
      
      if (userToEdit) {
        await matrixApi.updateUser(userToEdit.U_Id, payload);
        toast.success("PROFIL RECTIFIÉ : Accréditation validée.", { id: toastId });
      } else {
        await matrixApi.createGlobalUser(payload);
        toast.success("NOUVEL UTILISATEUR : Accréditation validée.", { id: toastId });
      }
      onSuccess();
      onClose();
      setForm(DEFAULT_FORM);
      setFormErrors({});
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error("ERREUR : " + (apiError?.response?.data?.message || apiError?.message || "Rejet Kernel"), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const updateForm = (field: keyof UserFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F1A]/90 backdrop-blur-md p-4 md:p-6 italic font-sans text-left"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      <article className="bg-white rounded-2xl md:rounded-3xl lg:rounded-[4rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <header className="p-4 md:p-6 lg:p-8 xl:p-10 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 id="modal-title" className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 uppercase italic tracking-tighter m-0 leading-none">
            {userToEdit ? "Rectifier Profil" : "Enrôler Citoyen"}
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 md:p-3 lg:p-4 bg-white border border-slate-200 rounded-lg md:rounded-xl lg:rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Fermer"
          >
            <X size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8 xl:p-10 space-y-4 md:space-y-5 lg:space-y-6 lg:space-y-8 overflow-y-auto custom-scrollbar flex-1" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <FormInput 
              id="firstName"
              label="Prénom"
              value={form.firstName}
              onChange={(v) => updateForm('firstName', v)}
              placeholder="PRÉNOM"
              required
              error={formErrors.firstName}
            />
            <FormInput 
              id="lastName"
              label="Nom"
              value={form.lastName}
              onChange={(v) => updateForm('lastName', v)}
              placeholder="NOM"
              required
              error={formErrors.lastName}
            />
          </div>
          <FormInput 
            id="email"
            icon={Mail}
            label="Email Professionnel"
            type="email"
            value={form.email}
            onChange={(v) => updateForm('email', v)}
            placeholder="EMAIL@ENTREPRISE.SN"
            required
            error={formErrors.email}
          />
          
          {!userToEdit && (
            <FormInput 
              id="password"
              icon={Mail}
              label="Mot de Passe"
              type="password"
              value={form.password}
              onChange={(v) => updateForm('password', v)}
              placeholder="••••••••"
              required
              error={formErrors.password}
            />
          )}

          <div className="space-y-1.5 md:space-y-2">
             <label htmlFor="role" className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 md:ml-4 lg:ml-6 italic leading-none block">
               Accréditation Système
             </label>
             <div className="relative">
               <select 
                 id="role"
                 className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl lg:rounded-3xl p-3 md:p-4 lg:p-5 lg:p-6 text-[10px] md:text-xs font-black uppercase italic outline-none cursor-pointer focus:border-blue-500 appearance-none pr-10 md:pr-12"
                 value={form.role}
                 onChange={(e: ChangeEvent<HTMLSelectElement>) => updateForm('role', e.target.value as MatrixRole)}
               >
                 {ROLE_OPTIONS.map(opt => (
                   <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
                     {opt.icon} {opt.label}
                   </option>
                 ))}
               </select>
               <div className="absolute right-4 md:right-6 bottom-3 md:bottom-4 lg:bottom-5 pointer-events-none text-slate-400" aria-hidden="true">
                 <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
               </div>
             </div>
          </div>

          {!userToEdit && (
             <div className="space-y-1.5 md:space-y-2">
               <label htmlFor="tenantId" className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 md:ml-4 lg:ml-6 italic leading-none block">
                 Ancrage Organisationnel <span className="text-red-400">*</span>
               </label>
               <div className="relative">
                 <select 
                   id="tenantId"
                   required
                   className={cn(
                     "w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl lg:rounded-3xl p-3 md:p-4 lg:p-5 lg:p-6 text-[10px] md:text-xs font-black uppercase italic outline-none cursor-pointer focus:border-blue-500 appearance-none pr-10 md:pr-12",
                     formErrors.tenantId && "border-red-500/50 focus:border-red-500"
                   )}
                   value={form.tenantId}
                   onChange={(e: ChangeEvent<HTMLSelectElement>) => updateForm('tenantId', e.target.value)}
                   aria-required="true"
                   aria-invalid={!!formErrors.tenantId}
                 >
                   <option value="" className="bg-white text-slate-500">-- CHOISIR TENANT --</option>
                   {tenants.map((t: Tenant) => (
                     <option key={t.T_Id} value={t.T_Id} className="bg-white text-slate-900">{t.T_Name}</option>
                   ))}
                 </select>
                 <div className="absolute right-4 md:right-6 bottom-3 md:bottom-4 lg:bottom-5 pointer-events-none text-slate-400" aria-hidden="true">
                   <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                 </div>
               </div>
               {formErrors.tenantId && (
                 <p className="text-red-400 text-[7px] md:text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                   <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.tenantId}
                 </p>
               )}
             </div>
          )}

          <button 
            type="submit"
            disabled={loading} 
            className={cn(
              "w-full bg-slate-950 text-white py-4 md:py-5 lg:py-6 lg:py-7 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black uppercase text-[9px] md:text-[10px] lg:text-xs tracking-widest hover:bg-blue-600 transition-all flex justify-center items-center gap-2 md:gap-3 lg:gap-4 shadow-xl active:scale-95 border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
              loading && "opacity-50 cursor-not-allowed active:scale-100"
            )}
            aria-busy={loading}
            aria-label={userToEdit ? "Valider la modification du profil" : "Valider l'accès Matrix"}
          >
            {loading ? (
              <><Loader2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">SCELLAGE EN COURS...</span><span className="sm:hidden">En cours...</span></>
            ) : (
              <><Save size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> <span className="hidden sm:inline">VALIDER L'ACCÈS MATRIX</span><span className="sm:hidden">Valider</span></>
            )}
          </button>
        </form>
      </article>
    </div>
  );
}