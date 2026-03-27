/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : SSEForm (Incident Report - ISO 45001)
 * RÔLE : Rapport de sinistre conforme ISO 45001
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, KeyboardEvent } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, Calendar, MapPin, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & SCHEMA (Strict typing)
// ============================================================================

export type EventType = 'AT' | 'SD' | 'ENV' | 'PRESQU_ACCIDENT';

export interface SSEFormData {
  type: EventType;
  dateHeure: string;
  lieu: string;
  description: string;
  avecArret: boolean;
  nbJoursArret: number;
}

export interface SSEFormProps {
  onSuccess?: () => void;
  className?: string;
}

export interface FormErrors {
  type?: string;
  dateHeure?: string;
  lieu?: string;
  description?: string;
  nbJoursArret?: string;
}

const EVENT_TYPES: Array<{ value: EventType; label: string }> = [
  { value: 'AT', label: 'Accident du Travail' },
  { value: 'SD', label: 'Situation Dangereuse' },
  { value: 'ENV', label: 'Incident Environnemental' },
  { value: 'PRESQU_ACCIDENT', label: 'Presqu\'accident' },
];

// Zod schema with French error messages
const sseSchema = z.object({
  type: z.enum(['AT', 'SD', 'ENV', 'PRESQU_ACCIDENT'], {
    errorMap: () => ({ message: "Type d'événement obligatoire" })
  }),
  dateHeure: z.string().min(1, "Date et heure requises"),
  lieu: z.string().min(1, "Lieu requis").min(3, "Lieu trop court"),
  description: z.string().min(10, "Description insuffisante (10 caractères min)"),
  avecArret: z.boolean().default(false),
  nbJoursArret: z.number().min(0, "Nombre de jours invalide").default(0)
});

type SSEFormValues = z.infer<typeof sseSchema>;

// ============================================================================
// SOUS-COMPOSANT : FORM FIELD
// ============================================================================

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  required?: boolean;
}

function FormField({ id, label, error, icon: Icon, children, required = false }: FormFieldProps) {
  return (
    <div className="space-y-1.5 md:space-y-2" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4 lg:ml-6 italic flex items-center gap-1.5 md:gap-2",
          error && "text-red-400"
        )}
      >
        {Icon && <Icon size={12} className="w-3 h-3" aria-hidden="true" />}
        {label}
        {required && <span className="text-red-400" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <p 
          id={`${id}-error`}
          className="text-red-400 text-[7px] md:text-[8px] ml-2 md:ml-4 flex items-center gap-1" 
          role="alert"
        >
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export function SSEForm({ onSuccess, className }: SSEFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { 
    register, 
    handleSubmit, 
    control, 
    formState: { errors, isSubmitting },
    reset 
  } = useForm<SSEFormValues>({
    resolver: zodResolver(sseSchema),
    defaultValues: { 
      type: undefined,
      dateHeure: new Date().toISOString().slice(0, 16), 
      lieu: "",
      description: "",
      avecArret: false, 
      nbJoursArret: 0 
    }
  });

  const avecArret = useWatch({ control, name: "avecArret" });

  const onSubmit = async (data: SSEFormValues) => {
    const toastId = toast.loading("Scellage du rapport SSE...");
    try {
      // Simulation appel API (remplacer par apiClient.post)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would call: await apiClient.post('/sse', data);
      
      toast.success("RAPPORT SCELLÉ : Registre mis à jour.", { id: toastId });
      setIsSubmitted(true);
      onSuccess?.();
      
      // Reset form after 2 seconds
      setTimeout(() => {
        reset();
        setIsSubmitted(false);
      }, 2000);
    } catch (err) {
      console.error('❌ Erreur soumission SSE:', err);
      toast.error("ERREUR KERNEL : Transmission rejetée.", { id: toastId });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Escape') {
      reset();
      setIsSubmitted(false);
    }
  };

  if (isSubmitted) {
    return (
      <div 
        className={cn(
          "space-y-6 italic font-sans text-left bg-white p-6 md:p-8 lg:p-10 xl:p-12 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] shadow-xl md:shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500",
          className
        )}
        role="status"
        aria-live="polite"
        aria-label="Déclaration soumise avec succès"
      >
        <div className="text-center py-8 md:py-10 lg:py-12 space-y-4 md:space-y-6">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-slate-900 mb-2">
              Déclaration Soumise
            </h3>
            <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase italic tracking-widest leading-relaxed">
              Le rapport a été enregistré dans le registre SSE.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      onKeyDown={handleKeyDown}
      className={cn(
        "space-y-6 md:space-y-8 italic font-sans text-left bg-white p-4 md:p-6 lg:p-8 xl:p-10 lg:p-12 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] shadow-xl md:shadow-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-blue-400",
        className
      )}
      role="form"
      aria-label="Formulaire de déclaration SSE"
      noValidate
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        {/* Type d'événement */}
        <FormField 
          id="type" 
          label="Nature de l'Événement" 
          icon={Activity}
          error={errors.type?.message}
          required
        >
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <select 
                  {...field}
                  id="type"
                  className={cn(
                    "w-full p-4 md:p-5 lg:p-6 bg-slate-50 border-2 rounded-xl md:rounded-2xl lg:rounded-3xl font-black text-[10px] md:text-xs uppercase italic outline-none focus:border-blue-500 appearance-none cursor-pointer pr-10 md:pr-12",
                    errors.type ? "border-red-500/50 focus:border-red-500" : "border-slate-100"
                  )}
                  aria-required="true"
                  aria-invalid={!!errors.type}
                  aria-describedby={errors.type ? 'type-error' : undefined}
                >
                  <option value="" className="bg-white text-slate-400">-- CHOISIR --</option>
                  {EVENT_TYPES.map(type => (
                    <option key={type.value} value={type.value} className="bg-white text-slate-900">
                      {type.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 md:right-6 bottom-4 md:bottom-5 lg:bottom-6 pointer-events-none text-slate-400" aria-hidden="true">
                  <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
          />
        </FormField>

        {/* Date et heure */}
        <FormField 
          id="dateHeure" 
          label="Horodatage Scellé" 
          icon={Calendar}
          error={errors.dateHeure?.message}
          required
        >
          <input 
            type="datetime-local" 
            id="dateHeure"
            {...register('dateHeure')} 
            className={cn(
              "w-full p-4 md:p-5 lg:p-6 bg-slate-50 border-2 rounded-xl md:rounded-2xl lg:rounded-3xl font-black text-[10px] md:text-xs italic outline-none focus:border-blue-500",
              errors.dateHeure ? "border-red-500/50 focus:border-red-500" : "border-slate-100"
            )}
            aria-required="true"
            aria-invalid={!!errors.dateHeure}
            aria-describedby={errors.dateHeure ? 'dateHeure-error' : undefined}
            style={{ colorScheme: 'light' }}
          />
        </FormField>

        {/* Localisation */}
        <div className="md:col-span-2">
          <FormField 
            id="lieu" 
            label="Localisation (§45001)" 
            icon={MapPin}
            error={errors.lieu?.message}
            required
          >
            <input 
              {...register('lieu')} 
              id="lieu"
              placeholder="EX: ZONE DE STOCKAGE SUD..." 
              className={cn(
                "w-full p-4 md:p-5 lg:p-6 bg-slate-50 border-2 rounded-xl md:rounded-2xl lg:rounded-3xl font-black text-[10px] md:text-xs uppercase italic outline-none focus:border-blue-500 placeholder:text-slate-300",
                errors.lieu ? "border-red-500/50 focus:border-red-500" : "border-slate-100"
              )}
              aria-required="true"
              aria-invalid={!!errors.lieu}
              aria-describedby={errors.lieu ? 'lieu-error' : undefined}
            />
          </FormField>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <FormField 
            id="description" 
            label="Description Détaillée"
            error={errors.description?.message}
            required
          >
            <textarea 
              {...register('description')} 
              id="description"
              placeholder="Décrivez l'événement, les causes immédiates, les personnes impliquées..." 
              rows={4}
              className={cn(
                "w-full p-4 md:p-5 lg:p-6 bg-slate-50 border-2 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black text-[10px] md:text-xs italic outline-none focus:border-blue-500 placeholder:text-slate-300 resize-none",
                errors.description ? "border-red-500/50 focus:border-red-500" : "border-slate-100"
              )}
              aria-required="true"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
          </FormField>
        </div>

        {/* Arrêt de travail */}
        <div className="md:col-span-2 p-4 md:p-6 lg:p-8 lg:p-10 bg-blue-600/5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] border border-blue-600/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
          <label className="flex items-center gap-3 md:gap-4 cursor-pointer">
            <Controller
              name="avecArret"
              control={control}
              render={({ field }) => (
                <input 
                  type="checkbox" 
                  {...field}
                  checked={field.value}
                  className="h-5 w-5 md:h-6 md:w-6 rounded-lg text-blue-600 focus:ring-blue-500 border-slate-300"
                  aria-label="Impact sur la continuité de service (Arrêt)"
                />
              )}
            />
            <span className="font-black text-slate-900 uppercase text-[10px] md:text-xs italic tracking-tighter">
              Impact sur la continuité de service (Arrêt)
            </span>
          </label>
          {avecArret && (
            <div className="flex items-center gap-2">
              <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                Jours:
              </span>
              <Controller
                name="nbJoursArret"
                control={control}
                render={({ field }) => (
                  <input 
                    type="number" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-16 md:w-20 md:w-24 p-2 md:p-3 lg:p-4 bg-white border-2 border-blue-200 rounded-lg md:rounded-xl text-center font-black text-blue-600 italic outline-none focus:border-blue-500 text-xs md:text-sm"
                    aria-label="Nombre de jours d'arrêt"
                  />
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={isSubmitting} 
        className={cn(
          "w-full py-4 md:py-5 lg:py-6 lg:py-7 bg-slate-950 text-white rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black uppercase text-[9px] md:text-[10px] lg:text-[11px] tracking-widest shadow-xl md:shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 md:gap-3 lg:gap-4 border-none cursor-pointer italic focus:outline-none focus:ring-2 focus:ring-blue-400",
          isSubmitting && "opacity-50 cursor-not-allowed"
        )}
        aria-busy={isSubmitting}
        aria-label="Sceller la déclaration SSE"
      >
        {isSubmitting ? (
          <><Loader2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">SCELLAGE EN COURS...</span><span className="sm:hidden">En cours...</span></>
        ) : (
          <><Save size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> <span className="hidden sm:inline">SCELLER LA DÉCLARATION SSE</span><span className="sm:hidden">Sceller</span></>
        )}
      </button>
    </form>
  );
}

export default SSEForm;