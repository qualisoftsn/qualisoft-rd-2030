/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : ContactForm (Lead Capture & Tenant Provisioning)
 * RÔLE : Capture de prospects et provisionnement de Tenant
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { Building2, CheckCircle, Loader2, Mail, MessageSquare, Send, AlertCircle, Phone } from "lucide-react";
import React, { useState, useCallback, ChangeEvent, FormEvent, KeyboardEvent, useRef, useEffect } from "react";
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ContactFormData {
  company: string;
  email: string;
  message: string;
  phone?: string;
}

export interface ContactFormProps {
  onSuccess?: () => void;
  className?: string;
  apiEndpoint?: string;
}

export interface FormErrors {
  company?: string;
  email?: string;
  message?: string;
  phone?: string;
}

export type FormStatus = 'idle' | 'loading' | 'success' | 'error';

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_FORM: ContactFormData = {
  company: '',
  email: '',
  message: '',
  phone: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d+\s()-]{8,}$/;
const MIN_MESSAGE_LENGTH = 20;

const STATUS_MESSAGES: Record<FormStatus, { text: string; type: 'info' | 'success' | 'error' }> = {
  idle: { text: '', type: 'info' },
  loading: { text: 'TRANSMISSION EN COURS...', type: 'info' },
  success: { text: 'REQUÊTE TRANSMISE AU KERNEL. ANALYSE EN COURS.', type: 'success' },
  error: { text: 'ÉCHEC DE TRANSMISSION. RÉESSAYEZ.', type: 'error' },
};

// ============================================================================
// UTILITAIRES
// ============================================================================

const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.toLowerCase());
};

const validatePhone = (phone: string): boolean => {
  if (!phone.trim()) return true; // Phone is optional
  return PHONE_REGEX.test(phone);
};

// ============================================================================
// SOUS-COMPOSANT : FORM INPUT
// ============================================================================

interface FormInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  error?: string;
  icon?: React.ElementType;
  uppercase?: boolean;
  as?: 'input' | 'textarea';
  rows?: number;
}

function FormInput({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  required = false, 
  error, 
  icon: Icon, 
  uppercase = true,
  as = 'input',
  rows = 4
}: FormInputProps) {
  return (
    <div className="space-y-1.5 md:space-y-2" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "text-[9px] md:text-[10px] font-black uppercase text-slate-400 ml-1 md:ml-2 lg:ml-5 tracking-widest flex items-center gap-1.5 md:gap-2",
          error && "text-red-400"
        )}
      >
        {Icon && <Icon size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" />}
        {label} {required && <span className="text-red-400" aria-hidden="true">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea 
          id={id}
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(uppercase ? e.target.value.toUpperCase() : e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={cn(
            "w-full bg-slate-50 border-2 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-5 lg:p-6 text-[10px] md:text-sm font-black outline-none focus:border-blue-500 transition-all shadow-inner resize-none",
            uppercase && "uppercase",
            error ? "border-red-500/50 focus:border-red-500" : "border-slate-100 focus:border-blue-500"
          )}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      ) : (
        <input 
          id={id}
          type={type}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(uppercase ? e.target.value.toUpperCase() : e.target.value)}
          placeholder={placeholder}
          required={required}
          className={cn(
            "w-full bg-slate-50 border-2 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-[10px] md:text-sm font-black outline-none focus:border-blue-500 transition-all shadow-inner",
            uppercase && "uppercase",
            error ? "border-red-500/50 focus:border-red-500" : "border-slate-100 focus:border-blue-500"
          )}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      )}
      {error && (
        <p id={`${id}-error`} className="text-red-400 text-[7px] md:text-[8px] ml-1 md:ml-2 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : STATUS MESSAGE
// ============================================================================

interface StatusMessageProps {
  status: FormStatus;
  message: string;
}

function StatusMessage({ status, message }: StatusMessageProps) {
  if (status === 'idle' || !message) return null;

  const config = {
    success: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
    error: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', icon: AlertCircle },
    info: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', icon: Loader2 },
  };

  const { bg, border, text, icon: Icon } = config[STATUS_MESSAGES[status].type];
  const StatusIcon = status === 'loading' ? Loader2 : Icon;

  return (
    <div 
      className={cn(
        "mt-4 md:mt-6 lg:mt-8 p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl flex items-start gap-3 md:gap-4 animate-in zoom-in-95 duration-300",
        bg, border
      )}
      role="status"
      aria-live="polite"
    >
      <StatusIcon 
        size={20} 
        className={cn("w-5 h-5 md:w-6 md:h-6 shrink-0 mt-0.5", text, status === 'loading' && "animate-spin")} 
        aria-hidden="true" 
      />
      <p className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-tight m-0 leading-relaxed", text)}>
        {message}
      </p>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ContactForm({ onSuccess, className, apiEndpoint = "/api/auth/invite" }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  // Reset form after success
  useEffect(() => {
    if (formStatus === 'success') {
      const timer = setTimeout(() => {
        setFormData(DEFAULT_FORM);
        setFormStatus('idle');
        setStatusMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [formStatus]);

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!formData.company.trim()) {
      errors.company = "La raison sociale est requise";
    } else if (formData.company.trim().length < 3) {
      errors.company = "Le nom doit contenir au moins 3 caractères";
    }

    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Email professionnel invalide";
    }

    if (!formData.message.trim()) {
      errors.message = "Le message est requis";
    } else if (formData.message.trim().length < MIN_MESSAGE_LENGTH) {
      errors.message = `Le message doit contenir au moins ${MIN_MESSAGE_LENGTH} caractères`;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = "Numéro de téléphone invalide";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const updateForm = useCallback((field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }

    setFormStatus('loading');
    setStatusMessage(STATUS_MESSAGES.loading.text);
    
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: formData.company.toUpperCase(),
          email: formData.email.toLowerCase(),
          message: formData.message.toUpperCase(),
          phone: formData.phone || undefined,
        }),
      });

      if (response.ok) {
        setFormStatus('success');
        setStatusMessage(STATUS_MESSAGES.success.text);
        toast.success("Demande envoyée avec succès !");
        formRef.current?.reset();
        onSuccess?.();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error("❌ Erreur soumission contact:", error);
      const message = error instanceof Error ? error.message : STATUS_MESSAGES.error.text;
      setFormStatus('error');
      setStatusMessage(message);
      toast.error(message);
    }
  }, [formData, apiEndpoint, validateForm, onSuccess]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Escape') {
      setFormStatus('idle');
      setStatusMessage('');
    }
  }, []);

  return (
    <article 
      className={cn(
        "p-6 md:p-8 lg:p-10 lg:p-12 bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl border border-slate-100 italic text-left relative overflow-hidden font-sans focus-within:ring-2 focus-within:ring-blue-400",
        className
      )}
      role="form"
      aria-label="Formulaire de contact Qualisoft Elite"
    >
      {/* Decorative Icon */}
      <div 
        className="absolute top-0 right-0 p-4 md:p-6 lg:p-8 lg:p-10 opacity-5 text-blue-500 rotate-12"
        aria-hidden="true"
      >
        <Building2 size={80} className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 lg:w-32 lg:h-32" />
      </div>

      <header className="mb-6 md:mb-8 lg:mb-10 relative z-10">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-2 md:mb-3 lg:mb-4 uppercase italic tracking-tighter text-slate-900 leading-none">
          Demander une démo <br /> 
          <span className="text-blue-500 underline decoration-blue-100">Qualisoft Elite</span>
        </h2>
        <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Provisionnement de Tenant • ISO 9001
        </p>
      </header>

      <form 
        ref={formRef}
        onSubmit={handleSubmit} 
        onKeyDown={handleKeyDown}
        className="space-y-4 md:space-y-5 lg:space-y-6 relative z-10"
        noValidate
      >
        <FormInput 
          id="company"
          label="Raison Sociale"
          value={formData.company}
          onChange={(v) => updateForm('company', v)}
          placeholder="EX: GLOBAL INDUSTRIES SA"
          required
          error={formErrors.company}
          icon={Building2}
        />

        <FormInput 
          id="email"
          label="Email Pro"
          value={formData.email}
          onChange={(v) => updateForm('email', v)}
          placeholder="directeur@entreprise.sn"
          type="email"
          required
          error={formErrors.email}
          icon={Mail}
          uppercase={false}
        />

        <FormInput 
          id="phone"
          label="Téléphone (Optionnel)"
          value={formData.phone || ''}
          onChange={(v) => updateForm('phone', v)}
          placeholder="+221 77 XXX XX XX"
          type="tel"
          error={formErrors.phone}
          icon={Phone}
          uppercase={false}
        />

        <FormInput 
          id="message"
          label="Projet Stratégique"
          value={formData.message}
          onChange={(v) => updateForm('message', v)}
          placeholder="DÉTAILLEZ VOTRE PROJET ISO..."
          as="textarea"
          rows={4}
          required
          error={formErrors.message}
          icon={MessageSquare}
        />

        <button 
          type="submit" 
          disabled={formStatus === 'loading'}
          className={cn(
            "w-full bg-slate-950 text-white py-4 md:py-5 lg:py-6 lg:py-8 rounded-xl md:rounded-2xl lg:rounded-[3rem] font-black uppercase italic tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 md:gap-4 lg:gap-5 shadow-xl active:scale-95 border-none cursor-pointer text-[9px] md:text-[10px] lg:text-xs focus:outline-none focus:ring-2 focus:ring-blue-400",
            formStatus === 'loading' && "opacity-50 cursor-not-allowed active:scale-100"
          )}
          aria-busy={formStatus === 'loading'}
          aria-label={formStatus === 'loading' ? "Transmission en cours" : "Envoyer ma demande Elite"}
        >
          {formStatus === 'loading' ? (
            <><Loader2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">TRANSMISSION EN COURS...</span><span className="sm:hidden">En cours...</span></>
          ) : (
            <><Send size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> <span className="hidden sm:inline">ENVOYER MA DEMANDE ELITE</span><span className="sm:hidden">Envoyer</span></>
          )}
        </button>

        <StatusMessage status={formStatus} message={statusMessage} />
      </form>
    </article>
  );
}