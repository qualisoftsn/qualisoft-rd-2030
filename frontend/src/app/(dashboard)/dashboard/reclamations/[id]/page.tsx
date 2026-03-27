/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛠️ MODULE : RECLAMATION COCKPIT (ISO 10002 / ISO 9001 §8.2.1)
 * RÔLE : Traitement opérationnel, RCA, upload de preuves et lien PAQ
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useEffect, useState, useRef, useCallback, ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { 
  ArrowLeft, Edit3, Save, ShieldCheck, UploadCloud, 
  Activity, Users, BarChart3, Loader2, RefreshCw, AlertTriangle,
  CheckCircle2, X, FileText
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type ReclamationStatus = 'OUVERT' | 'EN_COURS' | 'RESOLU' | 'CLOTURE' | 'REJETE';
export type ReclamationGravity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Tier {
  TR_Id: string;
  TR_Name: string;
  TR_Type?: 'CLIENT' | 'FOURNISSEUR' | 'PARTENAIRE';
  TR_Email?: string;
  TR_Phone?: string;
}

export interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_IsActive?: boolean;
}

export interface Reclamation {
  REC_Id: string;
  REC_Reference: string;
  REC_Object: string;
  REC_Description: string;
  REC_Status: ReclamationStatus;
  REC_Gravity: ReclamationGravity;
  REC_DateReceipt: string;
  REC_DateResolution?: string;
  REC_TierId?: string;
  REC_Tier?: Tier;
  REC_ProcessusId?: string;
  REC_Processus?: Processus;
  REC_SolutionProposed?: string;
  REC_PreuveURL?: string;
  REC_AssignedTo?: string;
  REC_CreatedAt: string;
  REC_UpdatedAt: string;
}

export interface ReclamationDetailFormData {
  REC_Object: string;
  REC_SolutionProposed: string;
  REC_ProcessusId?: string;
  REC_PreuveURL?: string;
}

export interface FormErrors {
  REC_Object?: string;
  REC_SolutionProposed?: string;
  REC_ProcessusId?: string;
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
// SOUS-COMPOSANT : STATUS BADGE
// ============================================================================

interface StatusBadgeProps {
  status: ReclamationStatus;
  gravity: ReclamationGravity;
}

function StatusBadge({ status, gravity }: StatusBadgeProps) {
  const isCritical = gravity === 'CRITICAL';
  
  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3 md:gap-4 lg:gap-6 bg-slate-900/40 p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] border-2 border-white/5 w-full xl:w-auto shadow-inner" role="status" aria-label={`Statut: ${status}, Gravité: ${gravity}`}>
      <Activity size={16} className="w-4 h-4 md:w-5 md:h-5 text-blue-400" aria-hidden="true" />
      <div className="flex flex-col text-left">
        <span className="text-[8px] md:text-[9px] text-slate-700 uppercase tracking-widest leading-none">Statut Actuel</span>
        <span className="text-xs md:text-sm font-black text-blue-400 mt-0.5 md:mt-1 uppercase leading-none">{status?.replace('_', ' ')}</span>
      </div>
      <div className="hidden md:block w-px h-8 bg-white/10" aria-hidden="true" />
      <span className={cn(
        "px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black tracking-widest border uppercase",
        isCritical ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-blue-600/10 text-blue-400 border-blue-600/20"
      )}>
        GRAVITÉ : {gravity}
      </span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : UPLOAD AREA
// ============================================================================

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  fileName?: string;
}

function UploadArea({ onFileSelect, isUploading, fileName }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className="border-4 border-dashed border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3rem] p-6 md:p-8 lg:p-10 flex flex-col items-center justify-center gap-4 md:gap-6 bg-black/20 hover:bg-blue-600/5 hover:border-blue-600/30 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label="Zone de dépôt de fichier pour preuve documentaire"
      aria-busy={isUploading}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.docx,.xlsx,.jpg,.png"
        disabled={isUploading}
      />
      {isUploading ? (
        <Loader2 size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-blue-400 animate-spin" aria-hidden="true" />
      ) : (
        <UploadCloud size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-slate-800 group-hover:text-blue-400 transition-colors" aria-hidden="true" />
      )}
      <p className="text-[9px] md:text-[10px] text-slate-700 tracking-widest font-black uppercase italic m-0 text-center">
        {fileName || 'Glissez ou cliquez pour indexer une preuve documentaire'}
      </p>
      {fileName && (
        <p className="text-[8px] md:text-[9px] text-slate-500 tracking-widest">
          {fileName}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ReclamationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [selectedRec, setSelectedRec] = useState<Reclamation | null>(null);
  const [processus, setProcessus] = useState<Processus[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [proofFile, setProofFile] = useState<File | null>(null);

  const fetchDossier = useCallback(async () => {
    if (!params?.id || typeof params.id !== 'string') return;
    try {
      setLoading(true);
      const [resRec, resProcs] = await Promise.all([
        apiClient.get<Reclamation>(`/reclamations/${params.id}`),
        apiClient.get<Processus[]>('/processus')
      ]);
      const recData = resRec.data?.data || resRec.data;
      setSelectedRec(recData);
      setProcessus(Array.isArray(resProcs.data) ? resProcs.data.filter(p => p.PR_IsActive !== false) : []);
    } catch (error) {
      console.error('❌ Erreur chargement réclamation:', error);
      toast.error("DOSSIER INTROUVABLE");
      router.push('/dashboard/quality/reclamations');
    } finally { 
      setLoading(false); 
    }
  }, [params?.id, router]);

  useEffect(() => { if (typeof window !== 'undefined') fetchDossier(); }, [fetchDossier]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!selectedRec?.REC_Object?.trim()) {
      errors.REC_Object = "L'objet de la réclamation est requis";
    }
    
    if (!selectedRec?.REC_SolutionProposed?.trim()) {
      errors.REC_SolutionProposed = "La solution proposée est requise";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async () => {
    if (!selectedRec) return;
    
    if (!validateForm()) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }
    
    setSubmitting(true);
    const toastId = toast.loading("SCELLAGE OPÉRATIONNEL...");
    
    try {
      let preuveUrl = selectedRec.REC_PreuveURL;
      
      // Upload file if present
      if (proofFile && typeof window !== 'undefined') {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', proofFile);
        formData.append('fileName', proofFile.name);
        
        const uploadRes = await apiClient.post<{ fileUrl: string }>('/reclamations/upload-proof', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        preuveUrl = uploadRes.data.fileUrl;
        setUploading(false);
      }
      
      const payload: ReclamationDetailFormData = {
        REC_Object: selectedRec.REC_Object,
        REC_SolutionProposed: selectedRec.REC_SolutionProposed,
        REC_ProcessusId: selectedRec.REC_ProcessusId,
        REC_PreuveURL: preuveUrl,
      };
      
      await apiClient.patch(`/reclamations/${selectedRec.REC_Id}`, payload);
      toast.success("DOSSIER SCELLÉ DANS LE SMI", { id: toastId });
      setIsEditing(false);
      setProofFile(null);
      fetchDossier();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ÉCHEC DE PERSISTANCE", { id: toastId });
      setUploading(false);
    } finally { 
      setSubmitting(false); 
    }
  };

  const updateRec = useCallback((field: keyof Reclamation, value: string) => {
    setSelectedRec(prev => prev ? { ...prev, [field]: value } : null);
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  const handleFileSelect = (file: File) => {
    setProofFile(file);
  };

  const handleTriggerPAQ = async () => {
    if (!selectedRec) return;
    
    const toastId = toast.loading("Création de l'action corrective...");
    try {
      const res = await apiClient.post('/actions', {
        ACT_Title: `Action Corrective - ${selectedRec.REC_Reference}`,
        ACT_Description: selectedRec.REC_SolutionProposed || selectedRec.REC_Description,
        ACT_Origin: 'RECLAMATION',
        ACT_Type: 'CORRECTIVE',
        ACT_Priority: selectedRec.REC_Gravity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        ACT_Deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
      });
      
      toast.success("Action corrective créée et liée à la réclamation", { id: toastId });
      router.push(`/dashboard/improvement/actions/${res.data?.ACT_Id || res.data?.id}`);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ÉCHEC DE CRÉATION PAQ", { id: toastId });
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Extraction SDE du Dossier..." />;
  }

  if (!selectedRec) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status">
        <AlertTriangle className="text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Dossier introuvable</p>
        <button 
          type="button"
          onClick={() => router.push('/dashboard/quality/reclamations')}
          className="mt-4 text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="flex items-center gap-4 md:gap-6 w-full xl:w-auto">
          <button 
            type="button"
            onClick={() => router.push('/dashboard/quality/reclamations')} 
            className="p-2 md:p-3 lg:p-5 bg-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl text-slate-500 hover:text-white border border-white/5 cursor-pointer transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Retour à la liste des réclamations"
          >
            <ArrowLeft size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
          </button>
          <div className="text-left space-y-1 md:space-y-2 min-w-0">
            <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl tracking-tighter m-0 italic leading-none truncate">
              Traitement <span className="text-blue-400">Opérationnel</span>
            </h1>
            <p className="text-slate-700 text-[9px] md:text-[10px] tracking-widest font-black uppercase italic m-0 truncate">
              RÉF: {selectedRec.REC_Reference} • ISO 10002
            </p>
          </div>
        </div>
        
        <StatusBadge status={selectedRec.REC_Status} gravity={selectedRec.REC_Gravity} />
      </header>

      {/* 🧩 WORKSPACE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 lg:space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700 pb-24 md:pb-28 lg:pb-32">
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 lg:gap-8 items-stretch text-left">
            {/* Plaignant */}
            <article className="bg-[#0F172A] p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] border-2 border-white/5 shadow-2xl space-y-4 md:space-y-6 lg:space-y-8">
              <h4 className="text-[9px] md:text-[10px] font-black text-slate-500 tracking-widest flex items-center gap-3 md:gap-4 m-0 italic">
                <Users size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-blue-400" aria-hidden="true" /> 
                Identité du Plaignant
              </h4>
              <div className="space-y-3 md:space-y-4">
                <p className="text-2xl md:text-3xl lg:text-4xl font-black italic text-white tracking-tighter uppercase m-0 leading-tight truncate">
                  {selectedRec.REC_Tier?.TR_Name || "TIERS ANONYME"}
                </p>
                <div className="flex flex-wrap items-center gap-3 md:gap-4 lg:gap-6">
                  <span className={cn(
                    "px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black tracking-widest border uppercase",
                    selectedRec.REC_Gravity === 'CRITICAL' 
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                      : "bg-blue-600/10 text-blue-400 border-blue-600/20"
                  )}>
                    GRAVITÉ : {selectedRec.REC_Gravity}
                  </span>
                  <span className="text-[9px] md:text-[10px] text-slate-700 font-black tracking-widest">
                    {new Date(selectedRec.REC_DateReceipt).toLocaleDateString('fr-SN')}
                  </span>
                </div>
              </div>
              <div className="bg-black/40 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 text-slate-400 text-[10px] md:text-xs font-bold leading-relaxed italic uppercase shadow-inner">
                &quot;{selectedRec.REC_Description}&quot;
              </div>
            </article>

            {/* Imputation */}
            <article className={cn(
              "p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] border-2 shadow-2xl space-y-4 md:space-y-6 lg:space-y-8 transition-all duration-500",
              isEditing ? "bg-blue-600/5 border-blue-500/30" : "bg-[#0F172A] border-white/5"
            )}>
              <h4 className="text-[9px] md:text-[10px] font-black text-slate-500 tracking-widest flex items-center gap-3 md:gap-4 m-0 italic">
                <ShieldCheck size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-emerald-400" aria-hidden="true" /> 
                Imputation SMI
              </h4>
              <div className="space-y-4 md:space-y-5 lg:space-y-6">
                <div className="space-y-2 md:space-y-3">
                  <label htmlFor="rec-object" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 md:ml-4 font-black block">
                    Objet Radical {isEditing && <span className="text-rose-400">*</span>}
                  </label>
                  <input 
                    id="rec-object"
                    readOnly={!isEditing} 
                    value={selectedRec.REC_Object} 
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateRec('REC_Object', e.target.value.toUpperCase())} 
                    className={cn(
                      "w-full bg-black/40 border-2 rounded-xl md:rounded-2xl p-4 md:p-5 text-[10px] md:text-sm font-black italic uppercase outline-none focus:border-blue-500 transition-all shadow-inner",
                      isEditing ? "text-white border-white/5 focus:border-blue-500" : "text-slate-400 border-white/5 cursor-not-allowed"
                    )}
                    aria-required={isEditing}
                    aria-readonly={!isEditing}
                  />
                  {formErrors.REC_Object && isEditing && (
                    <p className="text-rose-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                      <AlertTriangle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.REC_Object}
                    </p>
                  )}
                </div>
                <div className="space-y-2 md:space-y-3">
                  <label htmlFor="rec-processus" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 md:ml-4 font-black block">
                    Processus Responsable
                  </label>
                  <select 
                    id="rec-processus"
                    disabled={!isEditing} 
                    value={selectedRec.REC_ProcessusId || ""} 
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => updateRec('REC_ProcessusId', e.target.value)} 
                    className={cn(
                      "w-full bg-black/40 border-2 rounded-xl md:rounded-2xl p-4 md:p-5 text-[10px] md:text-[11px] font-black italic uppercase outline-none focus:border-blue-500 cursor-pointer shadow-inner appearance-none",
                      isEditing ? "text-blue-400 border-white/5 focus:border-blue-500" : "text-slate-400 border-white/5 cursor-not-allowed"
                    )}
                    aria-disabled={!isEditing}
                  >
                    <option value="" className="bg-[#0B0F1A]">-- NC GLOBALE --</option>
                    {processus.map((p) => (
                      <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0B0F1A] text-white">
                        {p.PR_Libelle}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          </div>

          {/* Analyse Technique */}
          <section className="bg-[#0F172A] border-2 border-white/5 p-6 md:p-8 lg:p-12 rounded-2xl md:rounded-3xl lg:rounded-[4rem] shadow-2xl space-y-6 md:space-y-8 lg:space-y-10 text-left relative overflow-hidden" aria-labelledby="analyse-title">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 md:gap-6 lg:gap-8">
              <h4 id="analyse-title" className="text-[10px] md:text-[11px] font-black text-blue-400 tracking-widest m-0 flex items-center gap-3 md:gap-4 italic uppercase">
                <BarChart3 size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" /> 
                Analyse Technique (§10.2)
              </h4>
              <div className="bg-amber-600/10 border border-amber-500/20 px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3">
                <AlertTriangle size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400" aria-hidden="true" />
                <span className="text-[8px] md:text-[9px] text-amber-400 tracking-widest font-black uppercase italic">
                  Protocole 5 Pourquoi / Ishikawa requis
                </span>
              </div>
            </div>
            
            <div className="space-y-2 md:space-y-3">
              <label htmlFor="rec-solution" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 md:ml-4 md:ml-6 font-black block">
                Solution Proposée {isEditing && <span className="text-rose-400">*</span>}
              </label>
              <textarea 
                id="rec-solution"
                readOnly={!isEditing} 
                value={selectedRec.REC_SolutionProposed || ''} 
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateRec('REC_SolutionProposed', e.target.value)} 
                placeholder="Détailler l'investigation des causes et les mesures de rétablissement..." 
                className={cn(
                  "w-full bg-black/40 border-2 rounded-2xl md:rounded-3xl lg:rounded-[3rem] p-6 md:p-8 lg:p-10 text-[10px] md:text-sm font-black italic outline-none focus:border-blue-500 transition-all shadow-inner resize-none leading-relaxed uppercase",
                  isEditing ? "text-slate-300 border-white/5 focus:border-blue-500" : "text-slate-400 border-white/5 cursor-not-allowed"
                )}
                rows={6}
                aria-required={isEditing}
                aria-readonly={!isEditing}
              />
              {formErrors.REC_SolutionProposed && isEditing && (
                <p className="text-rose-400 text-[8px] md:text-[9px] ml-2 md:ml-4 md:ml-6 flex items-center gap-1" role="alert">
                  <AlertTriangle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.REC_SolutionProposed}
                </p>
              )}
            </div>
            
            <div className="space-y-4 md:space-y-5 lg:space-y-6">
              <h4 className="text-[9px] md:text-[10px] font-black text-emerald-400 tracking-widest ml-2 md:ml-4 md:ml-6 m-0 italic uppercase">
                Preuve Documentaire (§7.5)
              </h4>
              <UploadArea 
                onFileSelect={handleFileSelect} 
                isUploading={uploading} 
                fileName={proofFile?.name || selectedRec.REC_PreuveURL?.split('/').pop()} 
              />
            </div>
          </section>

          {/* Actions de Finalisation */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            {isEditing ? (
              <>
                <button 
                  type="button"
                  onClick={handleUpdate} 
                  disabled={submitting || uploading} 
                  className={cn(
                    "flex-1 bg-blue-600 text-white py-4 md:py-6 lg:py-8 rounded-xl md:rounded-2xl lg:rounded-[3rem] font-black uppercase text-[10px] md:text-[11px] lg:text-[12px] tracking-widest italic flex items-center justify-center gap-4 md:gap-5 lg:gap-6 border-none cursor-pointer shadow-2xl active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400",
                    (submitting || uploading) && "opacity-30 cursor-not-allowed active:scale-100"
                  )}
                  aria-busy={submitting || uploading}
                >
                  {submitting || uploading ? (
                    <><Loader2 size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">SCELLAGE EN COURS...</span></>
                  ) : (
                    <><Save size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" /> <span className="hidden sm:inline">Sceller l&apos;Analyse Opérationnelle</span></>
                  )}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormErrors({});
                    setProofFile(null);
                    fetchDossier();
                  }} 
                  className="px-8 md:px-10 lg:px-12 bg-slate-900 text-slate-500 py-4 md:py-6 lg:py-8 rounded-xl md:rounded-2xl lg:rounded-[3rem] font-black uppercase text-[10px] md:text-[11px] lg:text-[12px] tracking-widest italic border-none cursor-pointer hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button 
                  type="button"
                  onClick={() => setIsEditing(true)} 
                  className="flex-1 bg-slate-900 text-blue-400 border-2 border-blue-600/20 py-4 md:py-6 lg:py-8 rounded-xl md:rounded-2xl lg:rounded-[3rem] font-black uppercase text-[10px] md:text-[11px] lg:text-[12px] tracking-widest italic flex items-center justify-center gap-4 md:gap-5 lg:gap-6 cursor-pointer shadow-2xl hover:bg-blue-600 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <Edit3 size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" /> 
                  <span className="hidden sm:inline">Entrer en mode édition</span>
                </button>
                <button 
                  type="button"
                  onClick={handleTriggerPAQ} 
                  className="flex-1 bg-emerald-600 text-white py-4 md:py-6 lg:py-8 rounded-xl md:rounded-2xl lg:rounded-[3rem] font-black uppercase text-[10px] md:text-[11px] lg:text-[12px] tracking-widest italic flex items-center justify-center gap-4 md:gap-5 lg:gap-6 border-none cursor-pointer shadow-2xl active:scale-95 transition-all hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  aria-label="Déclencher une action corrective PAQ"
                >
                  <ShieldCheck size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" /> 
                  <span className="hidden sm:inline">Déclencher Action Corrective (PAQ)</span>
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}