/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📦 MODULE : REGISTRE DES TIERS (elite-sde)
 * RÔLE : Administration des Partenaires (Clients / Fournisseurs) du Tenant
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { 
  Truck, UserPlus, Search, Globe, Mail, X, 
  CheckCircle2, Loader2, ChevronLeft, MoreHorizontal, Briefcase, AlertCircle
} from 'lucide-react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type TierType = 'CLIENT' | 'FOURNISSEUR' | 'PARTENAIRE';

export interface Tier {
  TR_Id: string;
  TR_Name: string;
  TR_Type: TierType;
  TR_Email?: string;
  TR_CodeExterne?: string;
  TR_Phone?: string;
  TR_Address?: string;
  TR_IsActive?: boolean;
  TR_CreatedAt?: string;
}

export interface TierFormData {
  TR_Name: string;
  TR_Type: TierType;
  TR_Email: string;
  TR_CodeExterne: string;
}

export interface TierCardProps {
  tier: Tier;
}

export interface FormErrors {
  TR_Name?: string;
  TR_Email?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const TIER_TYPES: Array<{ value: TierType; label: string }> = [
  { value: 'CLIENT', label: 'CLIENT' },
  { value: 'FOURNISSEUR', label: 'FOURNISSEUR' },
  { value: 'PARTENAIRE', label: 'PARTENAIRE' }
];

const DEFAULT_FORM: TierFormData = {
  TR_Name: '',
  TR_Type: 'CLIENT',
  TR_Email: '',
  TR_CodeExterne: ''
};

// ============================================================================
// SOUS-COMPOSANT : TIER CARD
// ============================================================================

function TierCard({ tier }: TierCardProps) {
  const isClient = tier.TR_Type === 'CLIENT';

  return (
    <article 
      className="bg-white/5 border border-white/5 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] group hover:border-blue-500/50 transition-all duration-500 shadow-2xl relative overflow-hidden flex flex-col h-full focus-within:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
      role="article"
      aria-label={`Tiers: ${tier.TR_Name}`}
      tabIndex={0}
    >
      <div className="flex justify-between items-start mb-4 md:mb-6 lg:mb-8 relative z-10">
        <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-[#0B0F1A] border border-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner shrink-0">
          <Truck size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden="true" />
        </div>
        <span 
          className={cn(
            "text-[8px] md:text-[9px] font-black px-3 md:px-4 py-1 md:py-1.5 rounded-full border uppercase tracking-widest italic",
            isClient 
              ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' 
              : 'text-amber-400 border-amber-500/20 bg-amber-500/10'
          )}
          aria-label={`Type: ${tier.TR_Type}`}
        >
          {tier.TR_Type}
        </span>
      </div>
      
      <div className="flex-1 space-y-2 md:space-y-3 lg:space-y-4 relative z-10">
        <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter leading-none m-0 group-hover:text-blue-400 transition-colors line-clamp-2">
          {tier.TR_Name}
        </h3>
        <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest italic m-0">
          ID: {tier.TR_CodeExterne || 'SANS_CODE'}
        </p>
      </div>

      <div className="mt-6 md:mt-8 lg:mt-10 pt-4 md:pt-6 lg:pt-8 border-t border-white/5 space-y-3 md:space-y-4 relative z-10">
        <div className="flex items-center gap-2 md:gap-3 text-slate-400 text-[9px] md:text-[10px] font-black italic uppercase tracking-widest truncate">
          <Mail size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-400 shrink-0" aria-hidden="true" /> 
          <span className="truncate">{tier.TR_Email || 'Email non scellé'}</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3 text-slate-400 text-[9px] md:text-[10px] font-black italic uppercase tracking-widest">
          <Globe size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-400 shrink-0" aria-hidden="true" /> 
          Écosystème SMI
        </div>
      </div>
      <div className="absolute -bottom-6 md:-bottom-8 lg:-bottom-10 -right-6 md:-right-8 lg:-right-10 w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-blue-600/5 blur-3xl rounded-full group-hover:bg-blue-600/10 transition-all" aria-hidden="true" />
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : FORM MODAL
// ============================================================================

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  form: TierFormData;
  onFormChange: (field: keyof TierFormData, value: string) => void;
  errors: FormErrors;
}

function FormModal({ isOpen, onClose, onSubmit, form, onFormChange, errors }: FormModalProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F1A]/95 backdrop-blur-md animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      <form 
        onSubmit={onSubmit} 
        className="bg-[#0F172A] border border-white/10 p-4 md:p-6 lg:p-8 xl:p-10 md:p-14 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] w-full max-w-xl shadow-2xl relative animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]"
      >
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute top-4 md:top-6 lg:top-8 right-4 md:right-6 lg:right-8 lg:right-10 text-slate-500 hover:text-white bg-transparent border-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded p-1 md:p-2"
          aria-label="Fermer"
        >
          <X size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
        </button>
        
        <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10 lg:mb-12 shrink-0">
          <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/40 text-white">
            <UserPlus size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
          </div>
          <h2 id="modal-title" className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black uppercase italic tracking-tighter m-0 text-white">
            Enrôler un <span className="text-blue-400">Tiers</span>
          </h2>
        </div>
        
        <div className="space-y-4 md:space-y-6 lg:space-y-8 overflow-y-auto custom-scrollbar pr-1 md:pr-2 flex-1">
          <div className="space-y-2 md:space-y-3">
            <label htmlFor="tr-name" className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-2 md:ml-4 tracking-widest italic block">
              Raison Sociale Officielle *
            </label>
            <input 
              id="tr-name"
              required 
              className={cn(
                "w-full bg-black/40 border border-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-5 lg:p-6 text-[10px] md:text-sm font-black text-white italic uppercase outline-none focus:border-blue-500 transition-all",
                errors.TR_Name && "border-red-500/50"
              )} 
              value={form.TR_Name} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange('TR_Name', e.target.value)} 
              placeholder="NOM DE L'ENTREPRISE"
              aria-required="true"
              aria-invalid={!!errors.TR_Name}
            />
            {errors.TR_Name && (
              <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {errors.TR_Name}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <div className="space-y-2 md:space-y-3">
              <label htmlFor="tr-type" className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-2 md:ml-4 tracking-widest italic block">
                Nature Relation *
              </label>
              <div className="relative">
                <select 
                  id="tr-type"
                  className="w-full bg-black/40 border border-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-5 lg:p-6 text-[10px] md:text-xs font-black text-blue-400 italic outline-none cursor-pointer uppercase appearance-none pr-10 md:pr-12" 
                  value={form.TR_Type} 
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => onFormChange('TR_Type', e.target.value as TierType)}
                >
                  {TIER_TYPES.map(t => (
                    <option key={t.value} value={t.value} className="bg-[#0B0F1A] text-white">{t.label}</option>
                  ))}
                </select>
                <div className="absolute right-4 md:right-6 bottom-4 md:bottom-5 lg:bottom-6 pointer-events-none text-slate-600" aria-hidden="true">
                  <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="space-y-2 md:space-y-3">
              <label htmlFor="tr-code" className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-2 md:ml-4 tracking-widest italic block">
                Identifiant Système
              </label>
              <input 
                id="tr-code"
                className="w-full bg-black/40 border border-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-5 lg:p-6 text-[10px] md:text-xs font-black text-white italic uppercase outline-none focus:border-blue-500 transition-all" 
                value={form.TR_CodeExterne} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange('TR_CodeExterne', e.target.value)} 
                placeholder="EX: C-2026-001"
              />
            </div>
          </div>
          <div className="space-y-2 md:space-y-3 pb-2 md:pb-4">
            <label htmlFor="tr-email" className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-2 md:ml-4 tracking-widest italic block">
              Email Contact
            </label>
            <input 
              id="tr-email"
              type="email" 
              className={cn(
                "w-full bg-black/40 border border-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-5 lg:p-6 text-[10px] md:text-xs font-black text-white italic uppercase outline-none focus:border-blue-500 transition-all",
                errors.TR_Email && "border-red-500/50"
              )} 
              value={form.TR_Email} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange('TR_Email', e.target.value)} 
              placeholder="CONTACT@PARTENAIRE.SN"
              aria-invalid={!!errors.TR_Email}
            />
            {errors.TR_Email && (
              <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {errors.TR_Email}
              </p>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-white hover:text-blue-700 text-white py-4 md:py-5 lg:py-6 rounded-xl md:rounded-2xl lg:rounded-3xl font-black uppercase text-[9px] md:text-xs tracking-widest mt-6 md:mt-8 lg:mt-10 transition-all active:scale-95 border-none cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center gap-2 md:gap-3"
        >
          <CheckCircle2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 inline" aria-hidden="true" /> 
          Valider l'Enrôlement
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function TiersRegistryPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<TierFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<Tier[]>('/tiers');
      setTiers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('❌ Erreur chargement tiers:', error);
      toast.error("Rupture de liaison avec le registre des Tiers.");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!form.TR_Name.trim()) {
      errors.TR_Name = "La raison sociale est obligatoire";
    }
    if (form.TR_Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.TR_Email)) {
      errors.TR_Email = "Email invalide";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.warning("Veuillez compléter tous les champs requis");
      return;
    }
    
    const toastId = toast.loading("Scellage du partenaire...");
    try {
      await apiClient.post('/tiers', {
        ...form,
        TR_Name: form.TR_Name.toUpperCase()
      });
      setShowModal(false);
      setForm(DEFAULT_FORM);
      setFormErrors({});
      fetchData();
      toast.success("Tiers enrôlé avec succès.", { id: toastId });
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "Échec du scellage technique.", { id: toastId });
    }
  };

  const handleFormChange = (field: keyof TierFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm(DEFAULT_FORM);
    setFormErrors({});
  };

  const filtered = useMemo(() => tiers.filter(t => 
    t.TR_Name?.toLowerCase().includes(query.toLowerCase()) || 
    t.TR_CodeExterne?.toLowerCase().includes(query.toLowerCase())
  ), [tiers, query]);

  if (loading && typeof window !== 'undefined') {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 md:gap-6 bg-[#0B0F1A]" role="status" aria-live="polite">
        <Loader2 className="animate-spin text-blue-400 w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14" aria-hidden="true" />
        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse">Indexation...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      {/* 🔝 HEADER */}
      <header className="shrink-0 p-4 md:p-6 lg:p-8 md:p-10 border-b border-white/5 bg-[#0B0F1A]/90 backdrop-blur-md z-30 flex flex-col lg:flex-row justify-between lg:items-end gap-4 md:gap-6">
        <div className="space-y-2 md:space-y-3 lg:space-y-4 w-full lg:w-auto">
          <Link 
            href="/dashboard/admin/setup" 
            className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors no-underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
          >
            <ChevronLeft size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" /> 
            <span className="hidden sm:inline">Retour Workspace</span>
          </Link>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl xl:text-6xl font-black uppercase tracking-tighter leading-none m-0 italic">
            Registre <span className="text-blue-400">Tiers</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64 md:w-72 lg:w-80">
            <label htmlFor="tiers-search" className="sr-only">Rechercher un tiers</label>
            <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
            <input 
              id="tiers-search"
              placeholder="FILTRER LE REGISTRE..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl lg:rounded-3xl py-2.5 md:py-3 lg:py-4 md:py-5 pl-10 md:pl-14 pr-4 md:pr-6 text-[9px] md:text-xs font-black uppercase italic outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-700"
              value={query} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              aria-label="Filtrer les tiers par nom ou code"
            />
          </div>
          <button 
            type="button"
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-white hover:text-blue-700 text-white px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl font-black uppercase text-[9px] md:text-xs tracking-widest flex items-center justify-center gap-2 md:gap-3 transition-all shadow-2xl shadow-blue-900/40 border-none cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Créer un nouveau tiers"
          >
            <UserPlus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
            <span className="hidden sm:inline">Nouveau Tiers</span>
          </button>
        </div>
      </header>

      {/* 📜 MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 md:px-10 pb-6 md:pb-8 lg:pb-10" role="region" aria-label="Liste des tiers">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 md:gap-6" role="status" aria-live="polite">
            <Loader2 className="animate-spin text-blue-400 w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14" aria-hidden="true" />
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse">Indexation...</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8 pb-6 md:pb-8 lg:pb-10" role="list">
            {filtered.length > 0 ? filtered.map((t) => (
              <TierCard key={t.TR_Id} tier={t} />
            )) : (
              <div 
                className="col-span-full h-48 md:h-56 lg:h-64 flex flex-col items-center justify-center text-slate-500 bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl"
                role="status"
              >
                <Briefcase size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mb-3 md:mb-4 opacity-20" aria-hidden="true" />
                <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-center px-4">
                  {query ? 'Aucun tiers ne correspond à la recherche' : 'Aucun tiers enregistré'}
                </p>
                {!query && (
                  <button 
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="mt-2 md:mt-3 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
                  >
                    Créer votre premier tiers
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FORM MODAL */}
      <FormModal 
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        form={form}
        onFormChange={handleFormChange}
        errors={formErrors}
      />

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}