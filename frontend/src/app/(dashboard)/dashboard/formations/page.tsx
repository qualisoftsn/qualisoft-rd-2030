/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🎓 MODULE GPEC & COMPÉTENCES (§7.2 ISO 9001)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage des habilitations, recyclages et capital humain
 * VERSION : 2.0 - Typing strict + Design Elite + Accessibilité + CRUD activé
 * API : apiClient Axios avec interceptors (Bearer + X-Tenant-Id)
 * RÉVISION : 19 Mars 2026 | 19:00 GMT
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import apiClient, { ApiError } from "@/core/api/api-client";
import { 
  Activity, BookOpen, GraduationCap, Plus, 
  Search, ShieldCheck, X, RefreshCcw,
  Loader2, AlertCircle, CheckCircle, Calendar, User
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type FormationStatus = 'VALIDÉ' | 'PLANIFIÉ' | 'EXPIRÉ' | 'EN_ATTENTE' | 'ANNULÉ';

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email: string;
  U_Matricule?: string;
  U_Actif?: boolean;
}

export interface Formation {
  FOR_Id: string;
  FOR_Title: string;
  FOR_UserId: string;
  FOR_User?: User;
  FOR_Provider: 'INTERNE' | 'BUREAU VERITAS' | 'APAVE' | 'AUTRE';
  FOR_Date: string; // ISO date
  FOR_Expiry?: string; // ISO date for renewal
  FOR_Status: FormationStatus;
  FOR_CertificateUrl?: string;
  FOR_CreatedAt?: string;
  FOR_UpdatedAt?: string;
}

export interface FormationFormData {
  FOR_Title: string;
  FOR_UserId: string;
  FOR_Provider: Formation['FOR_Provider'];
  FOR_Date: string;
  FOR_Expiry?: string;
  FOR_Status?: FormationStatus;
}

interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  shadow?: string;
  animate?: boolean;
}

// ============================================================================
// CONSTANTES & CONFIGURATION
// ============================================================================

const STATUS_CONFIG: Record<FormationStatus, StatusConfig> = {
  'VALIDÉ': { 
    label: 'Validé', 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10', 
    border: 'border-emerald-500/20',
    shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.1)]',
  },
  'PLANIFIÉ': { 
    label: 'Planifié', 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/10', 
    border: 'border-blue-500/20',
  },
  'EXPIRÉ': { 
    label: 'Expiré', 
    color: 'text-rose-400', 
    bg: 'bg-rose-500/10', 
    border: 'border-rose-500/20',
    animate: true,
  },
  'EN_ATTENTE': { 
    label: 'En attente', 
    color: 'text-amber-400', 
    bg: 'bg-amber-500/10', 
    border: 'border-amber-500/20',
  },
  'ANNULÉ': { 
    label: 'Annulé', 
    color: 'text-slate-400', 
    bg: 'bg-slate-500/10', 
    border: 'border-slate-500/20',
  },
};

const PROVIDER_OPTIONS: Array<{ value: Formation['FOR_Provider']; label: string }> = [
  { value: 'INTERNE', label: 'Formation Interne' },
  { value: 'BUREAU VERITAS', label: 'Bureau Veritas' },
  { value: 'APAVE', label: 'APAVE' },
  { value: 'AUTRE', label: 'Autre organisme' },
];

// ============================================================================
// UTILITAIRES
// ============================================================================

const getStatusConfig = (status?: string): StatusConfig => {
  const key = (status?.toUpperCase() || 'EN_ATTENTE') as FormationStatus;
  return STATUS_CONFIG[key] || STATUS_CONFIG['EN_ATTENTE'];
};

const formatDateFR = (dateString?: string): string => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('fr-SN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

const isExpired = (expiryDate?: string): boolean => {
  if (!expiryDate) return false;
  return new Date(expiryDate).getTime() < Date.now();
};

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <Activity className="animate-spin text-blue-500" size={48} className="w-48 h-48 md:w-60 md:h-60 flex-shrink-0" strokeWidth={1} aria-hidden="true" />
      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.8em] text-blue-400 animate-pulse italic text-center px-4 md:px-10">
        {label}
      </span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : FORMATION MODAL
// ============================================================================

interface FormationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  users: User[];
  initialData?: Formation | null;
}

function FormationModal({ isOpen, onClose, onSuccess, users, initialData }: FormationModalProps) {
  const [formData, setFormData] = useState<FormationFormData>({
    FOR_Title: initialData?.FOR_Title || '',
    FOR_UserId: initialData?.FOR_UserId || '',
    FOR_Provider: initialData?.FOR_Provider || 'INTERNE',
    FOR_Date: initialData?.FOR_Date?.split('T')[0] || '',
    FOR_Expiry: initialData?.FOR_Expiry?.split('T')[0] || '',
    FOR_Status: initialData?.FOR_Status || 'PLANIFIÉ',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormationFormData, string>>>({});

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        FOR_Title: initialData?.FOR_Title || '',
        FOR_UserId: initialData?.FOR_UserId || '',
        FOR_Provider: initialData?.FOR_Provider || 'INTERNE',
        FOR_Date: initialData?.FOR_Date?.split('T')[0] || '',
        FOR_Expiry: initialData?.FOR_Expiry?.split('T')[0] || '',
        FOR_Status: initialData?.FOR_Status || 'PLANIFIÉ',
      });
      setFormErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (formErrors[name as keyof FormationFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormationFormData, string>> = {};
    
    if (!formData.FOR_Title.trim()) errors.FOR_Title = 'Le titre est requis';
    if (!formData.FOR_UserId) errors.FOR_UserId = 'Sélectionnez un collaborateur';
    if (!formData.FOR_Date) errors.FOR_Date = 'La date est requise';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }
    
    setIsSubmitting(true);
    const toastId = toast.loading(initialData ? "Mise à jour de l'habilitation..." : "Création de l'habilitation...");
    
    try {
      if (initialData) {
        await apiClient.put<Formation>(`/formations/${initialData.FOR_Id}`, formData);
        toast.success("Habilitation mise à jour avec succès", { id: toastId });
      } else {
        await apiClient.post<Formation>('/formations', formData);
        toast.success("Habilitation créée avec succès", { id: toastId });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Erreur formation:', error);
      const apiError = error?.response?.data as ApiError | undefined;
      const message = apiError?.message || error?.message || "Erreur de sauvegarde";
      toast.error(message, { id: toastId, duration: 6000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <form 
        onSubmit={handleSubmit}
        className="bg-[#0F172A] w-full max-w-2xl rounded-2xl md:rounded-3xl border-2 border-white/10 p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8 shadow-2xl relative overflow-hidden text-left"
      >
        {/* Header */}
        <header className="flex justify-between items-center border-b border-white/5 pb-4 md:pb-6">
          <h2 id="modal-title" className="text-xl md:text-2xl lg:text-3xl font-black uppercase leading-none tracking-tighter m-0 text-white">
            {initialData ? 'Modifier l\'Habilitation' : 'Planifier Session'}
          </h2>
          <button 
            type="button" 
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-white/5 rounded-xl border-none bg-transparent cursor-pointer text-slate-400 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            aria-label="Fermer"
          >
            <X size={20} className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0" aria-hidden="true" />
          </button>
        </header>
        
        {/* Form Fields */}
        <div className="space-y-5 md:space-y-6 font-black italic">
          
          {/* Titre */}
          <div className="space-y-2">
            <label htmlFor="FOR_Title" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 block">
              Intitulé de l'habilitation <span className="text-rose-400">*</span>
            </label>
            <input 
              id="FOR_Title"
              name="FOR_Title"
              required 
              placeholder="EX: HABILITATION ÉLECTRIQUE B2V..." 
              className={cn(
                "w-full bg-black/40 border-2 rounded-xl md:rounded-2xl p-4 text-sm text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30 outline-none uppercase italic placeholder:text-slate-600",
                formErrors.FOR_Title ? "border-rose-500/50" : "border-white/5"
              )}
              value={formData.FOR_Title}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!formErrors.FOR_Title}
            />
            {formErrors.FOR_Title && (
              <p className="text-rose-400 text-[9px] ml-2 flex items-center gap-1" role="alert">
                <AlertCircle size={10} aria-hidden="true" /> {formErrors.FOR_Title}
              </p>
            )}
          </div>
          
          {/* Collaborateur + Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label htmlFor="FOR_UserId" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 block">
                Collaborateur (§7.2) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" aria-hidden="true" />
                <select 
                  id="FOR_UserId"
                  name="FOR_UserId"
                  required 
                  className={cn(
                    "w-full bg-black/40 border-2 rounded-xl md:rounded-2xl pl-10 pr-4 py-4 text-[11px] md:text-[12px] text-white outline-none cursor-pointer appearance-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30",
                    formErrors.FOR_UserId ? "border-rose-500/50" : "border-white/5"
                  )}
                  value={formData.FOR_UserId}
                  onChange={handleChange}
                  aria-required="true"
                  aria-invalid={!!formErrors.FOR_UserId}
                >
                  <option value="" className="bg-[#0B0F1A] text-slate-500">CHOISIR AGENT...</option>
                  {users.filter(u => u.U_Actif !== false).map(u => (
                    <option key={u.U_Id} value={u.U_Id} className="bg-[#0B0F1A] text-white">
                      {u.U_FirstName} {u.U_LastName}
                    </option>
                  ))}
                </select>
              </div>
              {formErrors.FOR_UserId && (
                <p className="text-rose-400 text-[9px] ml-2 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} aria-hidden="true" /> {formErrors.FOR_UserId}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="FOR_Date" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 block">
                Date session <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" aria-hidden="true" />
                <input 
                  id="FOR_Date"
                  name="FOR_Date"
                  required 
                  type="date" 
                  className={cn(
                    "w-full bg-black/40 border-2 rounded-xl md:rounded-2xl pl-10 pr-4 py-4 text-[11px] md:text-[12px] text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30 outline-none",
                    formErrors.FOR_Date ? "border-rose-500/50" : "border-white/5"
                  )}
                  value={formData.FOR_Date}
                  onChange={handleChange}
                  aria-required="true"
                  aria-invalid={!!formErrors.FOR_Date}
                />
              </div>
              {formErrors.FOR_Date && (
                <p className="text-rose-400 text-[9px] ml-2 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} aria-hidden="true" /> {formErrors.FOR_Date}
                </p>
              )}
            </div>
          </div>

          {/* Organisme + Échéance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label htmlFor="FOR_Provider" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 block">
                Organisme (§7.1.6)
              </label>
              <select 
                id="FOR_Provider"
                name="FOR_Provider"
                className="w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl p-4 text-[11px] md:text-[12px] text-white outline-none cursor-pointer appearance-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                value={formData.FOR_Provider}
                onChange={handleChange}
              >
                {PROVIDER_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-[#0B0F1A] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="FOR_Expiry" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 block">
                Échéance recyclage
              </label>
              <input 
                id="FOR_Expiry"
                name="FOR_Expiry"
                type="date" 
                className="w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl p-4 text-[11px] md:text-[12px] text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30 outline-none"
                value={formData.FOR_Expiry}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {/* Statut (édition uniquement) */}
          {initialData && (
            <div className="space-y-2">
              <label htmlFor="FOR_Status" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 block">
                Statut GPEC
              </label>
              <select 
                id="FOR_Status"
                name="FOR_Status"
                className="w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl p-4 text-[11px] md:text-[12px] text-white outline-none cursor-pointer appearance-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                value={formData.FOR_Status}
                onChange={handleChange}
              >
                {Object.keys(STATUS_CONFIG).map(status => (
                  <option key={status} value={status} className="bg-[#0B0F1A] text-white">
                    {STATUS_CONFIG[status as FormationStatus].label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={cn(
            "w-full bg-blue-600 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] tracking-[0.3em] text-white border-none shadow-xl flex items-center justify-center gap-3 uppercase italic transition-all focus:outline-none focus:ring-2 focus:ring-blue-400",
            isSubmitting ? "opacity-70 cursor-wait" : "hover:bg-white hover:text-blue-700 active:scale-95 cursor-pointer"
          )}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="w-16 h-16 md:w-18 md:h-18 flex-shrink-0" className="animate-spin" aria-hidden="true" /> 
              <span>TRAITEMENT...</span>
            </>
          ) : (
            <>
              <RefreshCcw size={16} className="w-16 h-16 md:w-18 md:h-18 flex-shrink-0" aria-hidden="true" /> 
              <span>{initialData ? 'METTRE À JOUR' : 'INDEXER LE CAPITAL HUMAIN'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : FORMATION ROW
// ============================================================================

interface FormationRowProps {
  formation: Formation;
  onEdit: (f: Formation) => void;
}

function FormationRow({ formation, onEdit }: FormationRowProps) {
  const status = getStatusConfig(formation.FOR_Status);
  const expired = isExpired(formation.FOR_Expiry);

  return (
    <tr className="hover:bg-blue-600/5 transition-all group focus-within:bg-blue-600/5">
      {/* Collaborateur */}
      <td className="px-4 md:px-6 lg:px-10 py-4 md:py-6">
        <div className="flex items-center gap-3 md:gap-5">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner shrink-0">
            <GraduationCap size={18} className="w-18 h-18 md:w-22 md:h-22 flex-shrink-0" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm md:text-base font-black m-0 leading-none text-white truncate">
              {formation.FOR_User?.U_FirstName} {formation.FOR_User?.U_LastName}
            </p>
            <p className="text-[8px] md:text-[9px] text-slate-500 mt-1 md:mt-2 uppercase tracking-widest truncate">
              {formation.FOR_User?.U_Matricule || formation.FOR_User?.U_Email || 'Matricule Master'}
            </p>
          </div>
        </div>
      </td>
      
      {/* Formation */}
      <td className="px-4 md:px-6 lg:px-10 py-4 md:py-6 text-center">
        <div className="flex flex-col gap-1 items-center">
          <span className="text-[12px] md:text-[13px] text-white font-black uppercase tracking-tight truncate max-w-[200px]">
            {formation.FOR_Title}
          </span>
          <span className="text-[8px] md:text-[9px] text-blue-400 italic uppercase opacity-60 tracking-[0.2em]">
            {formation.FOR_Provider}
          </span>
          {formation.FOR_Date && (
            <span className="text-[7px] md:text-[8px] text-slate-600 mt-1">
              {formatDateFR(formation.FOR_Date)}
            </span>
          )}
        </div>
      </td>
      
      {/* Statut + Actions */}
      <td className="px-4 md:px-6 lg:px-10 py-4 md:py-6">
        <div className="flex flex-col items-end gap-2">
          <span className={cn(
            "px-3 md:px-5 py-1.5 md:py-2 rounded-xl text-[8px] md:text-[9px] font-black border uppercase italic tracking-wider inline-flex items-center gap-1.5",
            status.bg, status.color, status.border,
            status.shadow,
            status.animate && "animate-pulse"
          )}>
            {expired && <AlertCircle size={10} aria-hidden="true" />}
            {status.label}
          </span>
          
          {/* Actions (visible on hover) */}
          <div className={cn(
            "flex items-center gap-2 transition-opacity",
            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
          )}>
            <button 
              onClick={() => onEdit(formation)}
              className="p-2 bg-white/5 text-slate-400 hover:text-white hover:bg-blue-600/20 rounded-lg transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label={`Modifier ${formation.FOR_Title}`}
              title="Modifier"
            >
              <BookOpen size={14} aria-hidden="true" />
            </button>
            {formation.FOR_CertificateUrl && (
              <a 
                href={formation.FOR_CertificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
                aria-label={`Voir le certificat`}
                title="Certificat"
              >
                <ShieldCheck size={14} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function FormationsPage() {
  const router = useRouter();
  
  // États
  const [formations, setFormations] = useState<Formation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);

  // ============================================================================
  // FETCH DATA
  // ============================================================================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [fRes, uRes] = await Promise.all([
        apiClient.get<Formation[]>("/formations"),
        apiClient.get<User[]>("/users"),
      ]);
      setFormations(Array.isArray(fRes.data) ? fRes.data : []);
      setUsers(Array.isArray(uRes.data) ? uRes.data.filter(u => u.U_Actif !== false) : []);
    } catch (err) {
      console.error('❌ Erreur chargement GPEC:', err);
      toast.error("ERREUR DE LIAISON GPEC MATRIX");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ============================================================================
  // FILTRES & CALCULS
  // ============================================================================

  const filteredFormations = useMemo(() => {
    if (!search.trim()) return formations;
    const term = search.toLowerCase();
    return formations.filter(f => {
      const userName = `${f.FOR_User?.U_FirstName || ''} ${f.FOR_User?.U_LastName || ''}`.toLowerCase();
      return (
        f.FOR_Title?.toLowerCase().includes(term) || 
        userName.includes(term) ||
        f.FOR_Provider?.toLowerCase().includes(term)
      );
    });
  }, [formations, search]);

  const stats = useMemo(() => {
    const total = formations.length;
    const valide = formations.filter(f => f.FOR_Status === 'VALIDÉ').length;
    const expire = formations.filter(f => isExpired(f.FOR_Expiry)).length;
    const planifie = formations.filter(f => f.FOR_Status === 'PLANIFIÉ').length;
    
    return { total, valide, expire, planifie, tauxConformite: total > 0 ? Math.round((valide / total) * 100) : 0 };
  }, [formations]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const handleCreate = () => {
    setSelectedFormation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (formation: Formation) => {
    setSelectedFormation(formation);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchData();
  };

  const handleRefresh = async () => {
    const toastId = toast.loading("Synchronisation...");
    try {
      await fetchData();
      toast.success("Registre mis à jour", { id: toastId });
    } catch {
      toast.error("Échec de synchronisation", { id: toastId });
    }
  };

  // ============================================================================
  // ÉTATS D'AFFICHAGE
  // ============================================================================

  if (loading) {
    return <LoadingScreen label="Scellage du Capital Humain §7.2..." />;
  }

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      {/* 🔝 HEADER GPEC */}
      <header className="shrink-0 p-4 md:p-6 lg:p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-start xl:items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6">
        <div className="text-left space-y-2 md:space-y-3">
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter leading-none m-0 text-white">
            Plan <span className="text-blue-500">GPEC</span>
          </h1>
          <p className="text-slate-500 text-[8px] md:text-[9px] tracking-[0.35em] m-0 flex items-center gap-2 italic">
            <ShieldCheck size={12} className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0" className="text-emerald-400" aria-hidden="true" /> 
            ISO 9001 §7.2 • Matrice des Compétences Matrix
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Recherche */}
          <div className="relative group flex-1 xl:flex-none">
            <label htmlFor="formation-search" className="sr-only">Rechercher un agent ou un titre</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} aria-hidden="true" />
            <input 
              id="formation-search"
              type="search"
              placeholder="RECHERCHER AGENT OU TITRE..." 
              className="bg-[#0F172A] border border-white/10 rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-[8px] md:text-[9px] outline-none w-full xl:w-64 lg:w-80 text-white italic font-black focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30 placeholder:text-slate-600"
              value={search} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              aria-label="Filtrer les formations par agent ou titre"
            />
          </div>
          
          {/* Actions */}
          <button 
            onClick={handleRefresh}
            className="p-2.5 md:p-3 bg-white/5 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-white/10 text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Actualiser le registre"
            title="Synchroniser"
          >
            <RefreshCcw size={16} className="w-16 h-16 md:w-18 md:h-18 flex-shrink-0" aria-hidden="true" />
          </button>
          
          <button 
            onClick={handleCreate}
            className="bg-blue-600 px-5 md:px-7 lg:px-8 py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 md:gap-3 transition-all border-none cursor-pointer text-white shadow-xl hover:bg-white hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <Plus size={16} className="w-16 h-16 md:w-18 md:h-18 flex-shrink-0" strokeWidth={3} aria-hidden="true" /> 
            <span className="hidden sm:inline">Planifier Session</span>
          </button>
        </div>
      </header>

      {/* 📜 REGISTRE GPEC */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 xl:p-10">
        <article className="bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[400px]">
          
          {/* Table Header */}
          <div className="p-5 md:p-7 lg:p-8 md:p-10 border-b border-white/5 bg-black/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 md:gap-4 text-blue-400">
              <BookOpen size={20} className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0" aria-hidden="true" />
              <h3 className="text-sm md:text-base tracking-widest italic m-0 text-white uppercase font-black">
                Registre des Habilitations Matrix
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[8px] md:text-[9px] text-slate-500 uppercase tracking-wider">
                {filteredFormations.length} dossier{filteredFormations.length > 1 ? 's' : ''} actif{filteredFormations.length > 1 ? 's' : ''} indexé{filteredFormations.length > 1 ? 's' : ''}
              </span>
              {/* Stats rapides */}
              <div className="hidden lg:flex items-center gap-3 text-[8px] text-slate-600">
                <span className="flex items-center gap-1">
                  <CheckCircle size={10} className="text-emerald-400" aria-hidden="true" /> {stats.valide}
                </span>
                <span className="flex items-center gap-1">
                  <AlertCircle size={10} className="text-rose-400" aria-hidden="true" /> {stats.expire}
                </span>
              </div>
            </div>
          </div>
          
          {/* Table Content */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-black/40 text-[8px] md:text-[9px] text-slate-500 tracking-[0.25em] border-b border-white/5 font-black italic">
                  <th className="px-4 md:px-6 lg:px-10 py-3 md:py-4 md:py-5" scope="col">Collaborateur</th>
                  <th className="px-4 md:px-6 lg:px-10 py-3 md:py-4 md:py-5 text-center" scope="col">Formation</th>
                  <th className="px-4 md:px-6 lg:px-10 py-3 md:py-4 md:py-5 text-right" scope="col">Statut GPEC §7.2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-bold italic">
                {filteredFormations.length > 0 ? (
                  filteredFormations.map((f) => (
                    <FormationRow key={f.FOR_Id} formation={f} onEdit={handleEdit} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 md:px-6 lg:px-10 py-12 md:py-16 text-center text-slate-500">
                      <Search size={32} className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0" className="mx-auto mb-3 md:mb-4 opacity-20" aria-hidden="true" />
                      <p className="text-[9px] md:text-[10px] font-black uppercase italic tracking-widest">
                        {search ? 'Aucune formation ne correspond à la recherche' : 'Aucune habilitation enregistrée'}
                      </p>
                      {!search && (
                        <button 
                          onClick={handleCreate}
                          className="mt-3 md:mt-4 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
                        >
                          Planifier votre première session
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
        
        {/* Footer info */}
        <footer className="mt-6 md:mt-8 text-center">
          <p className="text-[8px] md:text-[9px] text-slate-600 uppercase italic tracking-[0.3em]">
            Conformité ISO 9001:2015 §7.2 • Compétences & Habilitations • Données synchronisées
          </p>
        </footer>
      </main>

      {/* 💎 MODAL GPEC */}
      <FormationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        users={users}
        initialData={selectedFormation}
      />

      {/* GLOBAL STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(59, 130, 246, 0.3); 
          border-radius: 10px; 
        }
        :focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
