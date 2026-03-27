/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 MODULE : COLLECTE DES PREUVES D'AUDIT (ISO 9001 §9.2)
 * -------------------------------------------------------------------------
 * RÔLE : Liaison immuable entre GED et Mission d'Audit
 * VERSION : 3.0 - Typing strict Prisma + Design Elite + Accessibilité + CRUD complet
 * API : apiClient Axios avec interceptors (Bearer + X-Tenant-Id)
 * RÉVISION : 19 Mars 2026 | Production OVH
 * -------------------------------------------------------------------------
 */

import React, { useState, useEffect, useCallback, FormEvent, ChangeEvent, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  FileText, MessageSquare, Loader2, UploadCloud, ArrowLeft, 
  Link as LinkIcon, ExternalLink, AlertCircle, CheckCircle2, X, Search,
  ShieldCheck
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';
import apiClient, { type ApiError } from '@/core/api/api-client';

// ============================================================================
// TYPES & INTERFACES (Strict Typing - Prisma aligned)
// ============================================================================

// Basé sur model Document du schema.prisma
export interface DocumentGED {
  DOC_Id: string;
  DOC_Title: string;
  DOC_Type: 'PROCEDURE' | 'ENREGISTREMENT' | 'RAPPORT' | 'PREUVE' | 'AUTRE';
  DOC_Version?: string;
  DOC_UpdatedAt?: string; // ISO string
  DOC_Size?: number;      // en bytes
  DOC_Url?: string;
}

// Basé sur model Preuve du schema.prisma
export interface PreuveAudit {
  PV_Id: string;
  PV_AuditId: string;
  PV_DocumentId: string;
  PV_Commentaire: string;
  PV_CreatedAt: string; // ISO string
  PV_CreatedBy?: string;
  document?: DocumentGED; // Relation eager-loaded
}

// Résumé d'audit pour l'en-tête
export interface AuditSummary {
  AU_Id: string;
  AU_Title: string;
  AU_Reference: string;
  AU_Status: string;
}

export interface LinkForm {
  documentId: string;
  comment: string;
}

// ============================================================================
// UTILITAIRES (Pure Functions - SSR Safe)
// ============================================================================

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

const formatDateFR = (dateString?: string): string => {
  if (!dateString) return 'Date inconnue';
  try {
    return new Date(dateString).toLocaleDateString('fr-SN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit'
    });
  } catch {
    return dateString;
  }
};

interface DocTypeBadge {
  label: string;
  color: string;
}

const getDocTypeBadge = (type: DocumentGED['DOC_Type']): DocTypeBadge => {
  const config: Record<string, DocTypeBadge> = {
    PROCEDURE: { label: 'Procédure', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    ENREGISTREMENT: { label: 'Enregistrement', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    RAPPORT: { label: 'Rapport', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    PREUVE: { label: 'Preuve', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    AUTRE: { label: 'Autre', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  };
  return config[type] || config.AUTRE;
};

// ============================================================================
// SOUS-COMPOSANT : DOCUMENT CARD (pour la GED)
// ============================================================================

interface DocumentCardProps {
  doc: DocumentGED;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function DocumentCard({ doc, isSelected, onSelect }: DocumentCardProps) {
  const badge = getDocTypeBadge(doc.DOC_Type);
  
  return (
    <button
      type="button"
      onClick={() => onSelect(doc.DOC_Id)}
      className={cn(
        "w-full p-4 text-left bg-[#0B0F1A] border rounded-xl md:rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-400",
        isSelected 
          ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-900/20" 
          : "border-white/10 hover:border-white/30 hover:bg-white/5"
      )}
      aria-pressed={isSelected}
      aria-label={`Sélectionner le document: ${doc.DOC_Title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={14} className="w-3.5 h-3.5 text-blue-400 shrink-0" aria-hidden="true" />
            <h4 className="text-[10px] font-black text-white uppercase truncate">
              {doc.DOC_Title}
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("text-[7px] font-black px-2 py-0.5 rounded border uppercase tracking-wider", badge.color)}>
              {badge.label}
            </span>
            {doc.DOC_Version && (
              <span className="text-[7px] text-slate-500 font-mono">v{doc.DOC_Version}</span>
            )}
          </div>
        </div>
        {isSelected && (
          <CheckCircle2 size={16} className="w-4 h-4 text-blue-400 shrink-0" aria-hidden="true" />
        )}
      </div>
      <div className="flex items-center justify-between mt-3 text-[8px] text-slate-500">
        <span>{formatDateFR(doc.DOC_UpdatedAt)}</span>
        <span>{formatFileSize(doc.DOC_Size)}</span>
      </div>
    </button>
  );
}

// ============================================================================
// SOUS-COMPOSANT : PREUVE CARD
// ============================================================================

interface PreuveCardProps {
  preuve: PreuveAudit;
  onUnlink: (id: string) => void;
}

function PreuveCard({ preuve, onUnlink }: PreuveCardProps) {
  const doc = preuve.document;
  
  return (
    <article 
      className="p-5 bg-[#0F172A] rounded-2xl md:rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all flex flex-col gap-4 focus-within:border-blue-500/30"
      role="article"
      aria-labelledby={`preuve-title-${preuve.PV_Id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/10" aria-hidden="true">
            <FileText size={18} className="w-4.5 h-4.5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h4 id={`preuve-title-${preuve.PV_Id}`} className="text-sm font-black text-white uppercase truncate">
              {doc?.DOC_Title || 'Document GED'}
            </h4>
            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mt-0.5">
              Rattaché le {formatDateFR(preuve.PV_CreatedAt)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onUnlink(preuve.PV_Id)}
          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
          aria-label={`Retirer la preuve: ${doc?.DOC_Title}`}
          title="Détacher ce document"
        >
          <X size={16} className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
      
      {/* Commentaire */}
      {preuve.PV_Commentaire && (
        <div className="p-4 bg-[#0B0F1A] rounded-xl border border-white/5 text-[10px] text-slate-400 leading-relaxed italic">
          <MessageSquare size={14} className="w-3.5 h-3.5 text-blue-400 mb-2 inline-block" aria-hidden="true" />
          <p>{preuve.PV_Commentaire}</p>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/5">
        {doc?.DOC_Url && (
          <a
            href={doc.DOC_Url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all no-underline flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <ExternalLink size={14} className="w-3.5 h-3.5" aria-hidden="true" /> Consulter l'original
          </a>
        )}
        <span className={cn(
          "text-[7px] font-black px-2 py-1 rounded border uppercase tracking-wider",
          getDocTypeBadge(doc?.DOC_Type || 'AUTRE').color
        )}>
          {getDocTypeBadge(doc?.DOC_Type || 'AUTRE').label}
        </span>
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL : AUDIT PREUVES PAGE
// ============================================================================

export default function AuditPreuvesPage() {
  const router = useRouter();
  const params = useParams();
  const auditId = params?.id as string;

  // États des données
  const [audit, setAudit] = useState<AuditSummary | null>(null);
  const [documents, setDocuments] = useState<DocumentGED[]>([]);
  const [preuves, setPreuves] = useState<PreuveAudit[]>([]);
  
  // États UI
  const [loading, setLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Formulaire
  const [formData, setFormData] = useState<LinkForm>({ documentId: '', comment: '' });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof LinkForm, string>>>({});

  // ============================================================================
  // FETCH DATA (CRUD: READ)
  // ============================================================================

  const fetchAudit = useCallback(async (id: string): Promise<AuditSummary | null> => {
    try {
      const response = await apiClient.get<AuditSummary>(`/audits/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur chargement audit:', error);
      return null;
    }
  }, []);

  const fetchDocuments = useCallback(async (): Promise<DocumentGED[]> => {
    try {
      const response = await apiClient.get<DocumentGED[]>('/documents?limit=50');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('❌ Erreur chargement documents:', error);
      return [];
    }
  }, []);

  const fetchPreuves = useCallback(async (auditId: string): Promise<PreuveAudit[]> => {
    try {
      const response = await apiClient.get<PreuveAudit[]>(`/audits/${auditId}/preuves`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('❌ Erreur chargement preuves:', error);
      return [];
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!auditId) return;
    
    setLoading(true);
    try {
      const [auditData, docsData, preuvesData] = await Promise.allSettled([
        fetchAudit(auditId),
        fetchDocuments(),
        fetchPreuves(auditId),
      ]);

      if (auditData.status === 'fulfilled' && auditData.value) {
        setAudit(auditData.value);
      } else {
        toast.error("Audit introuvable");
        router.push('/dashboard/audits');
      }
      
      if (docsData.status === 'fulfilled') setDocuments(docsData.value);
      if (preuvesData.status === 'fulfilled') setPreuves(preuvesData.value);
      
    } catch (error) {
      console.error('❌ Erreur globale:', error);
      toast.error("Échec d'extraction GED");
    } finally {
      setLoading(false);
    }
  }, [auditId, fetchAudit, fetchDocuments, fetchPreuves, router]);

  useEffect(() => {
    if (auditId && typeof window !== 'undefined') {
      fetchData();
    }
  }, [auditId, fetchData]);

  // ============================================================================
  // FORM HANDLERS (CRUD: CREATE, DELETE)
  // ============================================================================

  const handleSelectDocument = useCallback((docId: string) => {
    setFormData(prev => ({ ...prev, documentId: docId }));
    if (formErrors.documentId) {
      setFormErrors(prev => ({ ...prev, documentId: undefined }));
    }
  }, [formErrors]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof LinkForm]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [formErrors]);

  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<keyof LinkForm, string>> = {};
    if (!formData.documentId) errors.documentId = 'Sélectionnez un document';
    if (!formData.comment.trim()) errors.comment = 'Ajoutez une observation';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleLink = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Veuillez compléter tous les champs");
      return;
    }
    
    setIsLinking(true);
    const toastId = toast.loading("Scellage de la preuve dans le dossier d'audit...");
    
    try {
      await apiClient.post<PreuveAudit>(`/audits/${auditId}/preuves`, formData);
      
      toast.success("Document rattaché avec succès", { id: toastId });
      setFormData({ documentId: '', comment: '' });
      await fetchPreuves(auditId).then(setPreuves);
      
    } catch (error: unknown) {
      console.error('❌ Erreur liaison preuve:', error);
      const apiError = error as { response?: { data?: ApiError }; message?: string };
      const message = apiError?.response?.data?.message || apiError?.message || "Erreur de liaison";
      toast.error(message, { id: toastId, duration: 6000 });
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = async (preuveId: string) => {
    if (!confirm('Confirmez-vous le détachement de cette preuve ?')) return;
    
    setIsUnlinking(preuveId);
    const toastId = toast.loading("Détachement en cours...");
    
    try {
      await apiClient.delete(`/audits/${auditId}/preuves/${preuveId}`);
      toast.success("Preuve détachée", { id: toastId });
      setPreuves(prev => prev.filter(p => p.PV_Id !== preuveId));
    } catch (error: unknown) {
      console.error('❌ Erreur détachement:', error);
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      const message = apiError?.response?.data?.message || "Erreur de détachement";
      toast.error(message, { id: toastId });
    } finally {
      setIsUnlinking(null);
    }
  };

  // Filtrage des documents (memoized)
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => 
      doc.DOC_Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.DOC_Type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  // ============================================================================
  // ÉTATS D'AFFICHAGE
  // ============================================================================

  if (loading && typeof window !== 'undefined') {
    return (
      <div 
        className="h-full flex items-center justify-center bg-[#0B0F1A] text-blue-400 font-black italic uppercase gap-4" 
        role="status" 
        aria-live="polite"
      >
        <Loader2 className="animate-spin w-10 h-10" aria-hidden="true" />
        <span>Chargement du dossier d'audit...</span>
      </div>
    );
  }

  if (!audit && typeof window !== 'undefined') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0B0F1A] text-slate-400 p-8">
        <AlertCircle size={48} className="w-12 h-12 mb-4 text-amber-400" aria-hidden="true" />
        <p className="text-lg font-black uppercase italic mb-4">Audit introuvable</p>
        <button 
          type="button"
          onClick={() => router.push('/dashboard/audits')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Retour au registre
        </button>
      </div>
    );
  }

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* HEADER */}
      <header className="shrink-0 px-4 md:px-6 py-4 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 flex items-center gap-4 md:gap-6">
        <button 
          type="button"
          onClick={() => router.back()} 
          className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl hover:bg-blue-600 hover:text-white transition-all border border-white/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Retour à la liste des audits"
        >
          <ArrowLeft size={18} className="w-4.5 h-4.5 md:w-5 md:h-5" aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-black uppercase italic tracking-tighter m-0 text-white truncate">
            Collecte des <span className="text-blue-500">Preuves</span>
          </h1>
          <p className="text-[9px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 m-0 truncate">
            {audit?.AU_Reference} • {audit?.AU_Title}
          </p>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        
        {/* COLONNE GAUCHE : SÉLECTION GED */}
        <aside className="w-full xl:w-80 lg:w-96 p-4 md:p-6 bg-[#0F172A]/50 border-r border-white/5 overflow-y-auto custom-scrollbar shrink-0" aria-label="Sélection de documents GED">
          <h2 className="text-lg font-black uppercase italic mb-4 md:mb-6 flex items-center gap-3 m-0 text-white">
            <UploadCloud className="text-blue-400 w-5 h-5 md:w-6 md:h-6" aria-hidden="true" /> 
            Lier un Document
          </h2>
          
          {/* Formulaire de liaison */}
          <form onSubmit={handleLink} className="space-y-4 md:space-y-5 mb-6 md:mb-8" noValidate>
            {/* Recherche */}
            <div className="relative">
              <label htmlFor="doc-search" className="sr-only">Rechercher un document</label>
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none w-3.5 h-3.5" aria-hidden="true" />
              <input
                id="doc-search"
                type="search"
                placeholder="Filtrer la GED..."
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-slate-600"
                aria-label="Rechercher un document dans la GED"
              />
            </div>
            
            {/* Liste des documents */}
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2" role="listbox" aria-label="Documents disponibles">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map(doc => (
                  <DocumentCard 
                    key={doc.DOC_Id} 
                    doc={doc} 
                    isSelected={formData.documentId === doc.DOC_Id}
                    onSelect={handleSelectDocument}
                  />
                ))
              ) : (
                <p className="text-center text-[9px] text-slate-500 py-4 italic" role="status">
                  {searchQuery ? 'Aucun document correspondant' : 'Aucun document disponible'}
                </p>
              )}
            </div>
            {formErrors.documentId && (
              <p className="text-rose-400 text-[9px] flex items-center gap-1" role="alert">
                <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.documentId}
              </p>
            )}
            
            {/* Commentaire */}
            <div className="space-y-2">
              <label htmlFor="comment" className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 block">
                Observation <span className="text-rose-400" aria-hidden="true">*</span>
              </label>
              <textarea 
                id="comment"
                name="comment"
                placeholder="Description factuelle du document revu..." 
                className={cn(
                  "w-full bg-[#0B0F1A] border rounded-xl p-4 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0F172A] resize-none min-h-[100px] italic",
                  formErrors.comment 
                    ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30" 
                    : "border-white/10 focus:border-blue-500 focus:ring-blue-500/30"
                )}
                value={formData.comment} 
                onChange={handleInputChange}
                aria-required="true"
                aria-invalid={!!formErrors.comment}
                aria-describedby={formErrors.comment ? "comment-error" : undefined}
              />
              {formErrors.comment && (
                <p id="comment-error" className="text-rose-400 text-[9px] flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.comment}
                </p>
              )}
            </div>
            
            {/* Submit */}
            <button 
              type="submit" 
              disabled={isLinking || !formData.documentId}
              className={cn(
                "w-full py-4 bg-blue-600 hover:bg-white hover:text-blue-900 text-white rounded-xl md:rounded-2xl font-black uppercase italic text-xs shadow-xl transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-400",
                isLinking && "cursor-wait"
              )}
              aria-busy={isLinking}
            >
              {isLinking ? (
                <>
                  <Loader2 size={16} className="animate-spin w-4 h-4" aria-hidden="true" /> Liaison...
                </>
              ) : (
                <>
                  <LinkIcon size={16} className="w-4 h-4" aria-hidden="true" /> Lier à l'Audit
                </>
              )}
            </button>
          </form>
          
          {/* Info sécurité */}
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl md:rounded-2xl text-[8px] text-slate-500 uppercase tracking-widest italic">
            <ShieldCheck size={12} className="w-3 h-3 inline mr-2 text-blue-400" aria-hidden="true" />
            Liaison immuable • Audit trail activé
          </div>
        </aside>

        {/* COLONNE DROITE : PREUVES LIÉES */}
        <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-5 md:py-6" aria-label="Preuves liées à l'audit">
          <div className="flex items-center justify-between mb-5 md:mb-6">
            <h2 className="text-xl md:text-2xl font-black uppercase italic flex items-center gap-3 m-0 text-white">
              <FileText className="text-blue-400 w-6 h-6 md:w-7 md:h-7" aria-hidden="true" /> 
              Éléments Probants 
              <span className="text-slate-500 font-normal not-italic text-base">({preuves.length})</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" role="list">
            {preuves.length > 0 ? (
              preuves.map((preuve) => (
                <PreuveCard 
                  key={preuve.PV_Id} 
                  preuve={preuve} 
                  onUnlink={handleUnlink}
                />
              ))
            ) : (
              <div 
                className="col-span-full h-40 md:h-48 border-2 border-dashed border-white/10 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center text-slate-500" 
                role="status" 
                aria-live="polite"
              >
                <FileText size={40} className="w-10 h-10 mb-3 opacity-20" aria-hidden="true" />
                <p className="uppercase font-black text-xs tracking-widest m-0 text-center px-4">
                  Aucune preuve scellée pour le moment
                </p>
                <p className="text-[9px] text-slate-600 mt-2 text-center">
                  Sélectionnez un document dans la GED pour commencer
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(37, 99, 235, 0.3); 
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