/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📝 MODULE : NOUVELLE RÉCLAMATION (ISO 10002 / ISO 9001 §8.2.1)
 * RÔLE : Interface de capture et de qualification initiale des plaintes
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useCallback, useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { 
  ArrowLeft, Link2, Loader2, Save, 
  ShieldAlert, RefreshCw, AlertCircle
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface Tier {
  TR_Id: string;
  TR_Name: string;
  TR_Type?: 'CLIENT' | 'FOURNISSEUR' | 'PARTENAIRE';
  TR_Email?: string;
  TR_Phone?: string;
  TR_IsActive?: boolean;
}

export interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_IsActive?: boolean;
}

export type ReclamationSource = 'MAIL' | 'TELEPHONE' | 'VISITE_CHANTIER' | 'COURRIER' | 'AUTRE';
export type ReclamationGravity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ReclamationFormData {
  REC_Object: string;
  REC_Description: string;
  REC_Source: ReclamationSource;
  REC_DateReceipt: string;
  REC_Deadline?: string;
  REC_Gravity: ReclamationGravity;
  REC_TierId: string;
  REC_ProcessusId?: string;
}

export interface FormErrors {
  REC_Object?: string;
  REC_Description?: string;
  REC_TierId?: string;
  REC_Deadline?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const SOURCE_OPTIONS: Array<{ value: ReclamationSource; label: string }> = [
  { value: 'MAIL', label: 'Transmission par E-mail' },
  { value: 'TELEPHONE', label: 'Appel Téléphonique' },
  { value: 'VISITE_CHANTIER', label: 'Audit Terrain' },
  { value: 'COURRIER', label: 'Courrier Postal' },
  { value: 'AUTRE', label: 'Autre' },
];

const GRAVITY_OPTIONS: Array<{ value: ReclamationGravity; label: string }> = [
  { value: 'MEDIUM', label: 'MOYENNE (Analyse métier)' },
  { value: 'HIGH', label: 'ÉLEVÉE (Action Corrective ISO)' },
  { value: 'CRITICAL', label: 'CRITIQUE (Alerte Direction)' },
];

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : FORM INPUT
// ============================================================================

interface FormInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  type?: string;
  rows?: number;
  options?: Array<{ value: string; label: string }>;
}

function FormInput({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  required, 
  error, 
  type = 'text', 
  rows,
  options 
}: FormInputProps) {
  const baseClasses = cn(
    "w-full bg-black/40 border-2 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-5 lg:p-6 text-[10px] md:text-[11px] lg:text-sm font-black italic uppercase outline-none focus:border-blue-500 transition-all shadow-inner",
    error ? "border-rose-500/50" : "border-white/5",
    type !== 'textarea' && type !== 'select' ? "text-white" : "",
    type === 'select' ? "text-blue-400 appearance-none cursor-pointer pr-10 md:pr-12" : "",
    type === 'textarea' ? "text-white resize-none" : "",
    type === 'date' ? "text-white" : ""
  );

  return (
    <div className="space-y-2 md:space-y-3">
      <label 
        htmlFor={id} 
        className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-4 md:ml-6 font-black italic block"
      >
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows || 4}
          required={required}
          className={baseClasses}
          aria-required={required}
          aria-invalid={!!error}
        />
      ) : type === 'select' ? (
        <div className="relative">
          <select
            id={id}
            value={value}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
            required={required}
            className={baseClasses}
            aria-required={required}
            aria-invalid={!!error}
          >
            {options?.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-[#0B0F1A] text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600" aria-hidden="true">
            <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={baseClasses}
          aria-required={required}
          aria-invalid={!!error}
        />
      )}
      
      {error && (
        <p className="text-rose-400 text-[8px] md:text-[9px] ml-4 md:ml-6 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function NouvelleReclamationPage() {
  const router = useRouter();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [processus, setProcessus] = useState<Processus[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [form, setForm] = useState<ReclamationFormData>({
    REC_Object: "",
    REC_Description: "",
    REC_Source: "MAIL",
    REC_DateReceipt: new Date().toISOString().split("T")[0],
    REC_Deadline: "",
    REC_Gravity: "MEDIUM",
    REC_TierId: "",
    REC_ProcessusId: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setFetching(true);
      const [resTiers, resProc] = await Promise.all([
        apiClient.get<Tier[]>("/tiers"),
        apiClient.get<Processus[]>("/processus"),
      ]);
      setTiers(Array.isArray(resTiers.data) ? resTiers.data.filter(t => t.TR_IsActive !== false) : []);
      setProcessus(Array.isArray(resProc.data) ? resProc.data.filter(p => p.PR_IsActive !== false) : []);
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      toast.error("ÉCHEC DE SYNCHRONISATION SMI");
    } finally { 
      setFetching(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!form.REC_Object.trim()) {
      errors.REC_Object = "L'objet de la réclamation est requis";
    }
    
    if (!form.REC_Description.trim()) {
      errors.REC_Description = "La description des faits est requise";
    }
    
    if (!form.REC_TierId) {
      errors.REC_TierId = "L'identification du tiers est obligatoire (§8.2)";
    }
    
    if (form.REC_Deadline) {
      const deadline = new Date(form.REC_Deadline);
      const receipt = new Date(form.REC_DateReceipt);
      if (deadline < receipt) {
        errors.REC_Deadline = "L'échéance doit être postérieure à la date de réception";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading("SCELLAGE DOCUMENTAIRE...");
    
    try {
      const payload = {
        ...form,
        REC_Object: form.REC_Object.toUpperCase().trim(),
        REC_Deadline: form.REC_Deadline ? new Date(form.REC_Deadline).toISOString() : null,
      };
      
      await apiClient.post("/reclamations", payload);
      toast.success("PLAINTE ENREGISTRÉE ET MISE SOUS SURVEILLANCE", { id: toastId });
      router.push("/dashboard/quality/reclamations");
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ERREUR DE SCELLAGE", { id: toastId });
    } finally { 
      setLoading(false); 
    }
  };

  const updateForm = useCallback((field: keyof ReclamationFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  if (fetching && typeof window !== 'undefined') {
    return <LoadingScreen label="Scanning Infrastructure..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="flex items-center gap-4 md:gap-6 w-full xl:w-auto">
          <button 
            type="button"
            onClick={() => router.back()} 
            className="p-2 md:p-3 lg:p-5 bg-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl text-slate-500 hover:text-white border border-white/5 cursor-pointer transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Retour à la liste des réclamations"
          >
            <ArrowLeft size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
          </button>
          <div className="text-left space-y-1 md:space-y-2">
            <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl tracking-tighter m-0 italic leading-none">
              Nouvelle <span className="text-blue-400">Plainte</span>
            </h1>
            <p className="text-slate-700 text-[9px] md:text-[10px] tracking-widest font-black uppercase italic m-0">
              ENTRÉE SMI • ÉCOUTE ACTIVE (§8.2)
            </p>
          </div>
        </div>
        <div className="bg-blue-600/10 border border-blue-500/20 px-4 md:px-6 lg:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] flex items-center gap-3 md:gap-4 shrink-0 shadow-inner">
          <ShieldAlert className="text-blue-400 w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" aria-hidden="true" />
          <span className="text-[9px] md:text-[10px] text-blue-400 tracking-widest font-black uppercase italic">
            Canal Certifié Matrix
          </span>
        </div>
      </header>

      {/* 📟 WORKSPACE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <form onSubmit={handleSubmit} className="max-w-[100rem] mx-auto space-y-6 md:space-y-8 lg:space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700 pb-24 md:pb-28 lg:pb-32">
          
          <article className="bg-[#0F172A] p-6 md:p-8 lg:p-12 rounded-2xl md:rounded-3xl lg:rounded-[4rem] border-2 border-white/5 shadow-2xl text-left space-y-6 md:space-y-8 lg:space-y-10">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
              <div className="space-y-4 md:space-y-5 lg:space-y-6">
                <FormInput
                  id="REC_Object"
                  label="Objet de la Réclamation"
                  value={form.REC_Object}
                  onChange={(v) => updateForm('REC_Object', v)}
                  placeholder="EX: ANOMALIE DE LIVRAISON LOT #902"
                  required
                  error={formErrors.REC_Object}
                />
                <FormInput
                  id="REC_Source"
                  label="Canal de Réception"
                  value={form.REC_Source}
                  onChange={(v) => updateForm('REC_Source', v)}
                  type="select"
                  options={SOURCE_OPTIONS}
                />
              </div>

              <div className="space-y-4 md:space-y-5 lg:space-y-6">
                <FormInput
                  id="REC_TierId"
                  label="Tiers Émetteur"
                  value={form.REC_TierId}
                  onChange={(v) => updateForm('REC_TierId', v)}
                  type="select"
                  required
                  error={formErrors.REC_TierId}
                  options={[
                    { value: '', label: '-- SÉLECTIONNER L&apos;ÉMETTEUR --' },
                    ...tiers.map(t => ({ value: t.TR_Id, label: t.TR_Name }))
                  ]}
                />
                <FormInput
                  id="REC_Gravity"
                  label="Gravité Initiale"
                  value={form.REC_Gravity}
                  onChange={(v) => updateForm('REC_Gravity', v)}
                  type="select"
                  options={GRAVITY_OPTIONS}
                />
              </div>
            </div>

            {/* Imputation SMI */}
            <section className="bg-blue-600/5 p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3rem] border-2 border-blue-600/20 space-y-4 md:space-y-6 lg:space-y-8 relative overflow-hidden" aria-labelledby="imputation-title">
              <Link2 className="absolute -right-4 md:-right-6 lg:-right-12 -top-4 md:-top-6 lg:-top-12 text-blue-600/5 w-32 h-32 md:w-40 md:h-40 lg:w-50 lg:h-50" aria-hidden="true" />
              <h3 id="imputation-title" className="text-lg md:text-xl font-black italic m-0 flex items-center gap-3 md:gap-4 tracking-tighter uppercase">
                <Link2 className="text-blue-400 w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" /> 
                Imputation au Processus Pilote
              </h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
                <FormInput
                  id="REC_ProcessusId"
                  label="Processus Responsable"
                  value={form.REC_ProcessusId}
                  onChange={(v) => updateForm('REC_ProcessusId', v)}
                  type="select"
                  options={[
                    { value: '', label: 'AUTOMATIQUE (NC QUALITÉ GLOBALE)' },
                    ...processus.map(p => ({ value: p.PR_Id, label: p.PR_Libelle }))
                  ]}
                />
                <FormInput
                  id="REC_Deadline"
                  label="Échéance de Traitement"
                  value={form.REC_Deadline}
                  onChange={(v) => updateForm('REC_Deadline', v)}
                  type="date"
                  error={formErrors.REC_Deadline}
                />
              </div>
            </section>

            <FormInput
              id="REC_Description"
              label="Exposé Détaillé des Faits"
              value={form.REC_Description}
              onChange={(v) => updateForm('REC_Description', v)}
              placeholder="Détailler les circonstances temporelles et l'impact immédiat..."
              required
              type="textarea"
              rows={6}
              error={formErrors.REC_Description}
            />

            <button 
              type="submit" 
              disabled={loading} 
              className={cn(
                "w-full bg-blue-600 text-white py-4 md:py-6 lg:py-10 rounded-xl md:rounded-2xl lg:rounded-[3rem] font-black uppercase text-[10px] md:text-[11px] lg:text-[12px] tracking-widest italic flex items-center justify-center gap-4 md:gap-5 lg:gap-6 border-none cursor-pointer shadow-2xl active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400",
                loading && "opacity-30 cursor-not-allowed active:scale-100"
              )}
              aria-busy={loading}
              aria-label="Valider et transmettre la réclamation"
            >
              {loading ? (
                <><Loader2 size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">VALIDATION EN COURS...</span></>
              ) : (
                <><Save size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" /> <span className="hidden sm:inline">Valider et Transmettre (§8.2.1)</span></>
              )}
            </button>
          </article>
        </form>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}