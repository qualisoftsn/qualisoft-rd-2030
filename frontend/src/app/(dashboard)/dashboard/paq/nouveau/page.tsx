/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : INITIALISATION PAQ (ISO 9001 §10.3)
 * RÔLE : Déploiement de nouveaux plans d'actions qualité
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, useCallback, ChangeEvent, FormEvent } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { 
  ShieldCheck, Save, Loader2, 
  Calendar, RefreshCw, ArrowLeft, Building2,
  Users, AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_Description?: string;
  PR_IsActive?: boolean;
}

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_Actif?: boolean;
}

export interface PAQFormData {
  PAQ_Title: string;
  PAQ_Year: number;
  PAQ_ProcessusId: string;
  PAQ_QualityManagerId: string;
  PAQ_Description: string;
}

export interface FormErrors {
  PAQ_Title?: string;
  PAQ_ProcessusId?: string;
  PAQ_QualityManagerId?: string;
}

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
// COMPOSANT PRINCIPAL
// ============================================================================

export default function NouveauPAQPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processes, setProcesses] = useState<Processus[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [form, setForm] = useState<PAQFormData>({
    PAQ_Title: '',
    PAQ_Year: new Date().getFullYear(),
    PAQ_ProcessusId: '',
    PAQ_QualityManagerId: '',
    PAQ_Description: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resP, resU] = await Promise.all([
        apiClient.get<Processus[]>('/processus'),
        apiClient.get<User[]>('/users')
      ]);
      setProcesses(Array.isArray(resP.data) ? resP.data.filter(p => p.PR_IsActive !== false) : []);
      setUsers(Array.isArray(resU.data) ? resU.data.filter(u => u.U_Actif !== false) : []);
    } catch (error) {
      console.error('❌ Erreur chargement référentiels:', error);
      toast.error("ERREUR DE SYNCHRONISATION DES RÉFÉRENTIELS");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!form.PAQ_Title.trim()) errors.PAQ_Title = 'Le titre est requis';
    if (!form.PAQ_ProcessusId) errors.PAQ_ProcessusId = 'Le processus est requis';
    if (!form.PAQ_QualityManagerId) errors.PAQ_QualityManagerId = 'Le pilote est requis';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Scellage du plan en cours...");
    try {
      await apiClient.post('/paq', form);
      toast.success("PLAN ANNUEL SCELLÉ AVEC SUCCÈS", { id: toastId });
      router.push('/dashboard/paq');
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ÉCHEC DE L'ÉCRITURE MATRICIELLE", { id: toastId });
    } finally { 
      setSubmitting(false); 
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Chargement des Référentiels SMI..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3">
          <button 
            type="button"
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-[9px] md:text-[10px] text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer mb-1 md:mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
            aria-label="Retour au registre PAQ"
          >
            <ArrowLeft size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
            <span className="hidden sm:inline">Retour Registre</span>
          </button>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic">
            Initialiser <span className="text-blue-400">PAQ</span>
          </h1>
        </div>
        <div className="flex gap-3 md:gap-4">
          <div className="hidden xl:flex items-center gap-2 md:gap-3 md:px-4 md:lg:px-6 py-2 md:py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl md:rounded-2xl">
            <ShieldCheck size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 text-emerald-400" aria-hidden="true" />
            <span className="text-[8px] md:text-[9px] text-emerald-400 tracking-widest">ISO 9001:2015 Verified</span>
          </div>
        </div>
      </header>

      {/* 📝 FORMULAIRE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 flex justify-center items-start pt-8 md:pt-12">
        <form onSubmit={handleSubmit} className="w-full max-w-[100rem] grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 lg:gap-8 pb-10 md:pb-16 lg:pb-20">
          
          {/* Left Column: Title & Description */}
          <section className="col-span-12 xl:col-span-8 bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-6 md:p-8 lg:p-10 xl:p-16 shadow-2xl space-y-6 md:space-y-8 lg:space-y-10 text-left">
            <div className="space-y-2 md:space-y-3 lg:space-y-4">
              <label htmlFor="PAQ_Title" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 md:ml-4 block">
                Désignation du Plan *
              </label>
              <input 
                id="PAQ_Title"
                required 
                value={form.PAQ_Title} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({...form, PAQ_Title: e.target.value.toUpperCase()})}
                className={cn(
                  "w-full bg-black/40 border-2 rounded-2xl md:rounded-3xl p-4 md:p-5 lg:p-6 text-[10px] md:text-sm font-black text-white outline-none focus:border-blue-500 uppercase italic shadow-inner",
                  formErrors.PAQ_Title ? "border-rose-500/50" : "border-white/5"
                )}
                placeholder="EX: PLAN D'ACTIONS QUALITÉ SI 2026"
                aria-required="true"
                aria-invalid={!!formErrors.PAQ_Title}
              />
              {formErrors.PAQ_Title && (
                <p className="text-rose-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.PAQ_Title}
                </p>
              )}
            </div>

            <div className="space-y-2 md:space-y-3 lg:space-y-4">
              <label htmlFor="PAQ_Description" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 md:ml-4 block">
                Périmètre / Description
              </label>
              <textarea 
                id="PAQ_Description"
                rows={5} 
                value={form.PAQ_Description} 
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setForm({...form, PAQ_Description: e.target.value})}
                className="w-full bg-black/40 border-2 border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-5 lg:p-6 text-[10px] md:text-sm font-bold text-slate-300 outline-none focus:border-blue-500 italic shadow-inner resize-none"
                placeholder="Objectifs et périmètre d'application..."
              />
            </div>
          </section>

          {/* Right Column: Year, Process, Pilot */}
          <aside className="col-span-12 xl:col-span-4 space-y-4 md:space-y-6 lg:space-y-8">
            <section className="bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-6 md:p-8 lg:p-10 shadow-2xl space-y-4 md:space-y-6 lg:space-y-8 text-left">
              <div className="space-y-2 md:space-y-3 lg:space-y-4">
                <label htmlFor="PAQ_Year" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 flex items-center gap-1.5 md:gap-2">
                  <Calendar size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true"/> 
                  Exercice
                </label>
                <input 
                  id="PAQ_Year"
                  type="number" 
                  value={form.PAQ_Year} 
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({...form, PAQ_Year: parseInt(e.target.value) || new Date().getFullYear()})}
                  className="w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl p-3 md:p-4 text-[10px] md:text-sm font-black text-white outline-none focus:border-blue-500 italic"
                />
              </div>

              <div className="space-y-2 md:space-y-3 lg:space-y-4">
                <label htmlFor="PAQ_ProcessusId" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 flex items-center gap-1.5 md:gap-2">
                  <Building2 size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true"/> 
                  Processus *
                </label>
                <select 
                  id="PAQ_ProcessusId"
                  required 
                  value={form.PAQ_ProcessusId} 
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setForm({...form, PAQ_ProcessusId: e.target.value})}
                  className={cn(
                    "w-full bg-black/40 border-2 rounded-xl md:rounded-2xl p-3 md:p-4 text-[10px] md:text-xs font-black text-white outline-none appearance-none cursor-pointer",
                    formErrors.PAQ_ProcessusId ? "border-rose-500/50" : "border-white/5"
                  )}
                  aria-required="true"
                  aria-invalid={!!formErrors.PAQ_ProcessusId}
                >
                  <option value="" className="bg-[#0B0F1A] text-slate-500">SÉLECTIONNER...</option>
                  {processes.map(p => (
                    <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0B0F1A] text-white">{p.PR_Libelle}</option>
                  ))}
                </select>
                {formErrors.PAQ_ProcessusId && (
                  <p className="text-rose-400 text-[8px] md:text-[9px] ml-2 flex items-center gap-1" role="alert">
                    <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.PAQ_ProcessusId}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:space-y-3 lg:space-y-4">
                <label htmlFor="PAQ_QualityManagerId" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 flex items-center gap-1.5 md:gap-2">
                  <Users size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true"/> 
                  Pilote Qualité *
                </label>
                <select 
                  id="PAQ_QualityManagerId"
                  required 
                  value={form.PAQ_QualityManagerId} 
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setForm({...form, PAQ_QualityManagerId: e.target.value})}
                  className={cn(
                    "w-full bg-black/40 border-2 rounded-xl md:rounded-2xl p-3 md:p-4 text-[10px] md:text-xs font-black text-white outline-none appearance-none cursor-pointer",
                    formErrors.PAQ_QualityManagerId ? "border-rose-500/50" : "border-white/5"
                  )}
                  aria-required="true"
                  aria-invalid={!!formErrors.PAQ_QualityManagerId}
                >
                  <option value="" className="bg-[#0B0F1A] text-slate-500">SÉLECTIONNER...</option>
                  {users.map(u => (
                    <option key={u.U_Id} value={u.U_Id} className="bg-[#0B0F1A] text-white">{u.U_FirstName} {u.U_LastName}</option>
                  ))}
                </select>
                {formErrors.PAQ_QualityManagerId && (
                  <p className="text-rose-400 text-[8px] md:text-[9px] ml-2 flex items-center gap-1" role="alert">
                    <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.PAQ_QualityManagerId}
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={submitting} 
                className={cn(
                  "w-full bg-blue-600 hover:bg-white hover:text-blue-700 py-3 md:py-4 lg:py-6 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] text-[10px] md:text-[11px] lg:text-[12px] text-white shadow-2xl border-none cursor-pointer transition-all font-black italic tracking-widest mt-4 md:mt-6 lg:mt-8 flex items-center justify-center gap-2 md:gap-3 focus:outline-none focus:ring-2 focus:ring-blue-400",
                  submitting && "opacity-70 cursor-wait"
                )}
                aria-busy={submitting}
              >
                {submitting ? (
                  <><Loader2 size={16} className="w-4 h-4 md:w-5 md:h-5 animate-spin" aria-hidden="true" /> <span>SCellage...</span></>
                ) : (
                  <><Save size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> <span>Sceller le Plan</span></>
                )}
              </button>
            </section>
          </aside>

        </form>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}