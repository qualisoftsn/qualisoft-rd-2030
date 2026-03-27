/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 👥 MODULE : REGISTRE DES TIERS (ISO 9001/14001 §4.2)
 * RÔLE : Centralisation des Parties Intéressées (PI)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useCallback, useEffect, useState, useMemo, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import {
  Briefcase, ChevronRight, Mail,
  MessageSquare, Plus, Search, ShieldCheck, Target, Users, X, RefreshCw, AlertCircle
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type TierType = 'CLIENT' | 'FOURNISSEUR' | 'PARTENAIRE' | 'AUTRE';

export interface TierStats {
  reclamations?: number;
  actions?: number;
  audits?: number;
}

export interface Tier {
  TR_Id: string;
  TR_Name: string;
  TR_Email?: string;
  TR_Type: TierType;
  TR_Phone?: string;
  TR_Address?: string;
  TR_IsActive?: boolean;
  TR_CreatedAt?: string;
  stats?: TierStats;
}

export interface TierFormData {
  TR_Name: string;
  TR_Email: string;
  TR_Type: TierType;
}

export interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}

export interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: 'blue' | 'emerald';
}

export interface ViewLoaderProps {
  label: string;
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
  { value: 'PARTENAIRE', label: 'PARTENAIRE' },
  { value: 'AUTRE', label: 'AUTRE' }
];

const DEFAULT_FORM: TierFormData = {
  TR_Name: "",
  TR_Email: "",
  TR_Type: "CLIENT"
};

// ============================================================================
// SOUS-COMPOSANT : VIEW LOADER
// ============================================================================

function ViewLoader({ label }: ViewLoaderProps) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : STAT CARD
// ============================================================================

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses: Record<StatCardProps['color'], string> = {
    blue: "text-blue-400",
    emerald: "text-emerald-400"
  };

  return (
    <article 
      className="bg-white/5 p-6 md:p-8 lg:p-10 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] border border-white/5 shadow-inner focus-within:ring-2 focus-within:ring-blue-400"
      role="article"
      aria-label={`${label}: ${value}`}
      tabIndex={0}
    >
      <Icon className={cn(colorClasses[color], "mb-4 md:mb-6 w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8")} aria-hidden="true" />
      <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest font-black m-0 mb-2 md:mb-3">{label}</p>
      <p className="text-3xl md:text-4xl lg:text-5xl font-black italic text-white m-0 leading-none">{value}</p>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : FIELD
// ============================================================================

function Field({ label, value, onChange, type = "text", required, error, placeholder }: FieldProps) {
  return (
    <div className="space-y-2 md:space-y-3">
      <label className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 md:ml-4 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input 
        type={type} 
        required={required}
        value={value} 
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} 
        placeholder={placeholder}
        className={cn(
          "w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-[10px] md:text-sm font-black text-white italic outline-none focus:border-blue-500 transition-all uppercase",
          error && "border-red-500/50"
        )}
        aria-required={required}
        aria-invalid={!!error}
      />
      {error && (
        <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : SELECT
// ============================================================================

function Select({ label, value, onChange, children, required, error }: SelectProps) {
  return (
    <div className="space-y-2 md:space-y-3">
      <label className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 md:ml-4 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <select 
          value={value} 
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)} 
          required={required}
          className={cn(
            "w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-[10px] md:text-sm font-black text-white italic outline-none cursor-pointer appearance-none pr-10 md:pr-12",
            error && "border-red-500/50"
          )}
          aria-required={required}
          aria-invalid={!!error}
        >
          {children}
        </select>
        <div className="absolute right-4 md:right-6 bottom-4 md:bottom-5 lg:bottom-6 pointer-events-none text-slate-600" aria-hidden="true">
          <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : TIER CARD
// ============================================================================

interface TierCardProps {
  tier: Tier;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
}

function TierCard({ tier, onClick, onKeyDown }: TierCardProps) {
  const isClient = tier.TR_Type === 'CLIENT';

  return (
    <article 
      className="bg-slate-900/40 border border-white/5 p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] relative group hover:border-blue-500/40 transition-all cursor-pointer shadow-2xl overflow-hidden focus-within:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`Tiers: ${tier.TR_Name}`}
    >
      <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-blue-600/10 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all mb-4 md:mb-6 lg:mb-8 shrink-0">
        {isClient ? (
          <Users size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
        ) : (
          <Briefcase size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
        )}
      </div>
      <h3 className="text-xl md:text-2xl font-black tracking-tighter m-0 mb-4 md:mb-6 truncate">{tier.TR_Name}</h3>
      <div className="flex justify-between items-center border-t border-white/5 pt-4 md:pt-6">
        <span className="text-[8px] md:text-[9px] px-3 md:px-4 py-1 md:py-1.5 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-500/20 tracking-widest">
          {tier.TR_Type}
        </span>
        <ChevronRight size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 text-slate-800 group-hover:text-blue-400 group-hover:translate-x-1 md:group-hover:translate-x-2 transition-all" aria-hidden="true" />
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : DETAIL DRAWER
// ============================================================================

interface DetailDrawerProps {
  tier: Tier;
  isOpen: boolean;
  onClose: () => void;
}

function DetailDrawer({ tier, isOpen, onClose }: DetailDrawerProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      onKeyDown={handleKeyDown}
    >
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-xl md:max-w-2xl bg-[#0B0F1A] border-l border-white/10 h-full p-6 md:p-8 lg:p-16 shadow-2xl animate-in slide-in-from-right flex flex-col overflow-hidden">
        <button 
          type="button"
          onClick={onClose} 
          className="self-end p-2 md:p-3 lg:p-4 text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
          aria-label="Fermer"
        >
          <X size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
        </button>
        <div className="flex-1 overflow-y-auto custom-scrollbar text-left space-y-8 md:space-y-10 lg:space-y-12 pr-2 md:pr-4">
           <div>
             <h2 id="drawer-title" className="text-3xl md:text-4xl lg:text-5xl font-black italic m-0 tracking-tighter text-white uppercase leading-none truncate">{tier.TR_Name}</h2>
             <p className="text-blue-400 text-[10px] md:text-sm font-bold mt-3 md:mt-4 lowercase flex items-center gap-2 md:gap-3">
               <Mail size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
               {tier.TR_Email || "N/A"}
             </p>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 lg:gap-8" role="list">
             <StatCard icon={MessageSquare} label="Réclamations" value={tier.stats?.reclamations || 0} color="blue" />
             <StatCard icon={Target} label="Actions PAQ" value={tier.stats?.actions || 0} color="emerald" />
           </div>
        </div>
      </div>
    </div>
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
  editingId: string | null;
  errors: FormErrors;
}

function FormModal({ isOpen, onClose, onSubmit, form, onFormChange, editingId, errors }: FormModalProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      <form onSubmit={onSubmit} className="bg-[#0B0F1A] border border-white/10 p-6 md:p-8 lg:p-12 xl:p-16 rounded-2xl md:rounded-3xl lg:rounded-[4rem] w-full max-w-2xl animate-in zoom-in-95 text-left max-h-[90vh] overflow-y-auto">
        <h2 id="modal-title" className="text-2xl md:text-3xl lg:text-4xl font-black italic text-white mb-8 md:mb-10 lg:mb-12 m-0 leading-none">
          Registre <span className="text-blue-400">Tiers</span>
        </h2>
        <div className="space-y-4 md:space-y-6 lg:space-y-8">
          <Field 
            label="Raison Sociale" 
            value={form.TR_Name} 
            onChange={(v) => onFormChange('TR_Name', v)} 
            required
            error={errors.TR_Name}
            placeholder="EX: SOCIÉTÉ XYZ"
          />
          <Field 
            label="Email" 
            value={form.TR_Email} 
            onChange={(v) => onFormChange('TR_Email', v)} 
            type="email"
            error={errors.TR_Email}
            placeholder="contact@exemple.com"
          />
          <Select 
            label="Type Stratégique" 
            value={form.TR_Type} 
            onChange={(v) => onFormChange('TR_Type', v)}
          >
            {TIER_TYPES.map(t => (
              <option key={t.value} value={t.value} className="bg-[#0B0F1A] text-white">{t.label}</option>
            ))}
          </Select>
          <button 
            type="submit" 
            className="w-full py-4 md:py-6 lg:py-8 bg-blue-600 text-white rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black text-[10px] md:text-xs tracking-widest border-none cursor-pointer hover:bg-white hover:text-blue-700 transition-all shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {editingId ? 'METTRE À JOUR' : 'VALIDER AU REGISTRE MASTER'}
          </button>
          <button 
            type="button"
            onClick={onClose} 
            className="w-full text-[9px] md:text-[10px] text-slate-500 font-black border-none bg-transparent cursor-pointer hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
          >
            ANNULER
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function TiersPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TierFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Tier[]>("/tiers");
      setTiers(Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []));
    } catch (error) {
      console.error('❌ Erreur chargement tiers:', error);
      toast.error("Échec de synchronisation du registre.");
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
    
    const toastId = toast.loading("Scellage du registre...");
    try {
      const payload = { ...form, TR_Name: form.TR_Name.toUpperCase() };
      if (editingId) {
        await apiClient.patch(`/tiers/${editingId}`, payload);
        toast.success("Tiers mis à jour.", { id: toastId });
      } else {
        await apiClient.post("/tiers", payload);
        toast.success("Nouveau tiers enregistré.", { id: toastId });
      }
      setIsModalOpen(false);
      setForm(DEFAULT_FORM);
      setFormErrors({});
      setEditingId(null);
      fetchData();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "Erreur d'écriture Master.", { id: toastId });
    }
  };

  const filtered = useMemo(() => tiers.filter(t => 
    t.TR_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.TR_Type.toLowerCase().includes(searchTerm.toLowerCase())
  ), [tiers, searchTerm]);

  const handleTierClick = (tier: Tier) => {
    setSelectedTier(tier);
    setIsDetailOpen(true);
  };

  const handleTierKeyDown = (e: KeyboardEvent<HTMLDivElement>, tier: Tier) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTierClick(tier);
    }
  };

  const handleOpenModal = (tier?: Tier) => {
    if (tier) {
      setEditingId(tier.TR_Id);
      setForm({
        TR_Name: tier.TR_Name,
        TR_Email: tier.TR_Email || "",
        TR_Type: tier.TR_Type
      });
    } else {
      setEditingId(null);
      setForm(DEFAULT_FORM);
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setFormErrors({});
  };

  const handleFormChange = (field: keyof TierFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading && tiers.length === 0 && typeof window !== 'undefined') {
    return <ViewLoader label="Intelligence Tiers SDE..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 bg-black/40 flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-1 md:space-y-2 w-full xl:w-auto">
          <div className="flex items-center gap-2 md:gap-3 text-blue-400 text-[9px] md:text-[10px] tracking-widest">
            <ShieldCheck size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
            QUALISOFT SOVEREIGN SECURITY
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic">
            Intelligence <span className="text-blue-400">Tiers</span>
          </h1>
          <p className="text-slate-500 text-[8px] md:text-[9px] tracking-widest m-0" role="img" aria-label="Couverture des parties intéressées: 100%">
            Couverture PI : 100%
          </p>
        </div>
        <button 
          type="button"
          onClick={() => handleOpenModal()} 
          className="bg-blue-600 text-white px-4 md:px-6 lg:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] border-none cursor-pointer hover:bg-white hover:text-blue-700 transition-all shadow-xl flex items-center gap-2 md:gap-3 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full xl:w-auto justify-center"
          aria-label="Créer un nouveau tiers"
        >
          <Plus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" strokeWidth={3} aria-hidden="true" /> 
          <span className="hidden sm:inline">NOUVEAU TIERS</span>
        </button>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 gap-4 md:gap-6 lg:gap-8">
        <div className="shrink-0 relative max-w-xl md:max-w-2xl">
          <label htmlFor="tiers-search" className="sr-only">Rechercher un tiers</label>
          <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
          <input 
            id="tiers-search"
            value={searchTerm} 
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} 
            placeholder="RECHERCHER DANS LE REGISTRE..." 
            className="w-full bg-slate-900/40 border border-white/5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] py-3 md:py-4 lg:py-6 pl-10 md:pl-16 pr-4 md:pr-6 lg:pr-8 text-[9px] md:text-[10px] font-black italic text-white focus:border-blue-500 outline-none transition-all"
            aria-label="Filtrer les tiers par nom ou type"
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8" role="list" aria-label="Liste des tiers">
            {filtered.length > 0 ? filtered.map((tier) => (
              <TierCard 
                key={tier.TR_Id} 
                tier={tier} 
                onClick={() => handleTierClick(tier)}
                onKeyDown={(e) => handleTierKeyDown(e, tier)}
              />
            )) : (
              <div className="col-span-full h-32 md:h-40 flex flex-col items-center justify-center text-slate-500" role="status">
                <Users size={48} className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 opacity-20" aria-hidden="true" />
                <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                  {searchTerm ? 'Aucun tiers ne correspond à la recherche' : 'Aucun tiers enregistré'}
                </p>
                {!searchTerm && (
                  <button 
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="mt-2 md:mt-3 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
                  >
                    Créer votre premier tiers
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* DETAIL DRAWER */}
      {selectedTier && (
        <DetailDrawer 
          tier={selectedTier} 
          isOpen={isDetailOpen} 
          onClose={() => { setIsDetailOpen(false); setSelectedTier(null); }} 
        />
      )}

      {/* FORM MODAL */}
      <FormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        form={form}
        onFormChange={handleFormChange}
        editingId={editingId}
        errors={formErrors}
      />

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}