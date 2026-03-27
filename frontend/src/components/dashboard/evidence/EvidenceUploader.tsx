/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
'use client';

/**
 * 🛰️ MODULE : EvidenceUploader (Document Evidence Management)
 * RÔLE : Collecte et indexation de preuves documentaires/visuelles
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité + Security
 */

import React, { useState, useCallback, ChangeEvent, DragEvent, KeyboardEvent } from 'react';
import { 
  UploadCloud, File, X, CheckCircle2, Loader2, 
  MessageSquare, Paperclip, ShieldCheck, AlertCircle,
  FileText, Image, Film, Archive
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export type ContextType = 'NC' | 'ACTION' | 'AUDIT' | 'DOCUMENT';

export interface EvidenceUploaderProps {
  contextId: string;
  contextType: ContextType;
  onSuccess?: () => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export interface UploadResponse {
  url: string;
  filename: string;
  size?: number;
  mimeType?: string;
}

export interface EvidencePayload {
  PV_FileUrl: string;
  PV_FileName: string;
  PV_Commentaire: string;
  PV_FileSize?: number;
  PV_MimeType?: string;
  PV_NCId?: string;
  PV_ActionId?: string;
  PV_AuditId?: string;
  PV_DocumentId?: string;
}

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export interface FileWithPreview extends File {
  preview?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_MAX_SIZE_MB = 10;

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  'pdf': ['application/pdf'],
  'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  'document': ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  'spreadsheet': ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  'archive': ['application/zip', 'application/x-rar-compressed'],
  'video': ['video/mp4', 'video/quicktime'],
};

const ALLOWED_TYPES = Object.values(ALLOWED_MIME_TYPES).flat();

const getFileIcon = (mimeType: string): React.ElementType => {
  if (mimeType.includes('pdf')) return FileText;
  if (mimeType.includes('image')) return Image;
  if (mimeType.includes('video')) return Film;
  if (mimeType.includes('zip') || mimeType.includes('rar')) return Archive;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ============================================================================
// SOUS-COMPOSANT : FILE PREVIEW
// ============================================================================

interface FilePreviewProps {
  file: FileWithPreview;
  onRemove: () => void;
  disabled: boolean;
}

function FilePreview({ file, onRemove, disabled }: FilePreviewProps) {
  const FileIcon = getFileIcon(file.type);
  const preview = file.preview || URL.createObjectURL(file);

  return (
    <div 
      className="flex items-center gap-3 md:gap-4 bg-white p-3 md:p-4 rounded-lg md:rounded-xl border border-blue-500/20 animate-in fade-in slide-in-from-top-2"
      role="status"
      aria-label={`Fichier sélectionné: ${file.name}`}
    >
      {file.type.startsWith('image/') ? (
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl overflow-hidden shrink-0 border border-slate-200">
          <img 
            src={preview} 
            alt={`Aperçu de ${file.name}`} 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20">
          <FileIcon size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] md:text-xs font-black text-slate-900 truncate uppercase italic">
          {file.name}
        </p>
        <p className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest">
          {formatFileSize(file.size)}
        </p>
      </div>
      <button 
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="p-1.5 md:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors bg-transparent border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`Supprimer ${file.name}`}
        disabled={disabled}
      >
        <X size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function EvidenceUploader({ 
  contextId, 
  contextType, 
  onSuccess,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  allowedTypes = ALLOWED_TYPES
}: EvidenceUploaderProps) {
  const [file, setFile] = useState<FileWithPreview | null>(null);
  const [comment, setComment] = useState('');
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null
  });
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = useCallback((selectedFile: File): boolean => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      toast.error(`FICHIER TROP VOLUMINEUX : Limite fixée à ${maxSizeMB} Mo.`);
      return false;
    }

    // Check file type
    if (!allowedTypes.includes(selectedFile.type) && !selectedFile.type.startsWith('image/')) {
      toast.error("TYPE DE FICHIER NON AUTORISÉ : PDF, Images, Documents uniquement.");
      return false;
    }

    return true;
  }, [maxSizeMB, allowedTypes]);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0] as FileWithPreview;
      if (validateFile(selectedFile)) {
        // Create preview for images
        if (selectedFile.type.startsWith('image/')) {
          selectedFile.preview = URL.createObjectURL(selectedFile);
        }
        setFile(selectedFile);
        setUploadState(prev => ({ ...prev, error: null }));
      }
    }
  }, [validateFile]);

  const handleDragOver = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0] as FileWithPreview;
      if (validateFile(droppedFile)) {
        if (droppedFile.type.startsWith('image/')) {
          droppedFile.preview = URL.createObjectURL(droppedFile);
        }
        setFile(droppedFile);
        setUploadState(prev => ({ ...prev, error: null }));
      }
    }
  }, [validateFile]);

  const handleRemoveFile = useCallback(() => {
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFile(null);
    setUploadState(prev => ({ ...prev, error: null }));
  }, [file]);

  const handleUpload = async () => {
    if (!file) return;

    setUploadState(prev => ({ ...prev, isUploading: true, progress: 0, error: null }));
    const toastId = toast.loading("Téléchargement de la preuve vers le Kernel...");

    try {
      // ÉTAPE 1 : Envoi du binaire vers le stockage statique
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await apiClient.post<UploadResponse>(
        '/files/upload', 
        formData, 
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadState(prev => ({ ...prev, progress: percentCompleted }));
            }
          }
        }
      );

      const { url, filename } = uploadRes.data;

      // ÉTAPE 2 : Indexation de la preuve avec ses métadonnées
      const evidencePayload: EvidencePayload = {
        PV_FileUrl: url,
        PV_FileName: filename,
        PV_Commentaire: comment.trim(),
        PV_FileSize: file.size,
        PV_MimeType: file.type,
      };

      // Liaison dynamique selon le contexte
      switch (contextType) {
        case 'NC':
          evidencePayload.PV_NCId = contextId;
          break;
        case 'ACTION':
          evidencePayload.PV_ActionId = contextId;
          break;
        case 'AUDIT':
          evidencePayload.PV_AuditId = contextId;
          break;
        case 'DOCUMENT':
          evidencePayload.PV_DocumentId = contextId;
          break;
      }

      await apiClient.post('/evidences', evidencePayload);

      toast.success("PREUVE SCELLÉE : Document indexé avec succès.", { id: toastId });
      
      // Cleanup
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      setFile(null);
      setComment('');
      setUploadState({ isUploading: false, progress: 0, error: null });
      
      onSuccess?.();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMsg = apiError?.response?.data?.message || apiError?.message || "ÉCHEC DE TRANSMISSION : Le Kernel a rejeté le flux.";
      toast.error(errorMsg, { id: toastId });
      setUploadState(prev => ({ ...prev, error: errorMsg }));
    } finally {
      setUploadState(prev => ({ ...prev, isUploading: false }));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && file && !uploadState.isUploading) {
      e.preventDefault();
      handleUpload();
    }
    if (e.key === 'Escape' && file) {
      handleRemoveFile();
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
    };
  }, [file]);

  return (
    <article 
      className={cn(
        "bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 transition-all hover:border-blue-500/30 group focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-400",
        isDragOver && "border-blue-500 bg-blue-50/50"
      )}
      role="region"
      aria-label="Zone de téléchargement de preuves"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="space-y-4 md:space-y-5 lg:space-y-6">
        
        {/* --- ZONE DE DÉPÔT --- */}
        {!file ? (
          <label 
            className={cn(
              "flex flex-col items-center justify-center cursor-pointer space-y-3 md:space-y-4 py-4 md:py-6 rounded-lg md:rounded-xl transition-all",
              isDragOver ? "bg-blue-50 border-2 border-blue-500 border-dashed" : ""
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            htmlFor="file-upload"
          >
            <div className={cn(
              "p-3 md:p-4 bg-white rounded-xl md:rounded-2xl shadow-sm transition-transform",
              isDragOver ? "scale-110" : "group-hover:scale-105"
            )}>
              <UploadCloud size={24} className={cn("w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8", isDragOver ? "text-blue-600" : "text-blue-500")} aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-[10px] md:text-sm font-black text-slate-900 uppercase italic tracking-tighter">
                Déposer la preuve documentaire
              </p>
              <p className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 md:mt-1">
                PDF, JPG, PNG, DOCX (MAX. {maxSizeMB} MO)
              </p>
            </div>
            <input 
              id="file-upload"
              type="file" 
              className="sr-only" 
              onChange={handleFileChange}
              accept={allowedTypes.join(',')}
              aria-label="Sélectionner un fichier à télécharger"
            />
          </label>
        ) : (
          <FilePreview 
            file={file} 
            onRemove={handleRemoveFile}
            disabled={uploadState.isUploading}
          />
        )}

        {/* --- MÉTADONNÉES (COMMENTAIRE) --- */}
        {file && (
          <div className="space-y-3 md:space-y-4 animate-in fade-in duration-500">
            <div className="relative">
              <MessageSquare className="absolute left-3 md:left-4 top-3 md:top-4 w-4 h-4 md:w-4.5 md:h-4.5 text-slate-400" aria-hidden="true" />
              <textarea
                value={comment}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                placeholder="Ajouter un commentaire ou une observation sur cette preuve..."
                className="w-full bg-white border border-slate-200 rounded-lg md:rounded-xl py-3 md:py-4 pl-8 md:pl-10 md:pr-4 lg:pr-6 text-[10px] md:text-xs font-bold text-slate-900 outline-none focus:border-blue-500 transition-all italic h-20 md:h-24 resize-none"
                aria-label="Commentaire sur la preuve"
                disabled={uploadState.isUploading}
              />
            </div>

            {/* Upload Progress */}
            {uploadState.isUploading && (
              <div className="space-y-2" role="progressbar" aria-valuenow={uploadState.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Progression du téléchargement">
                <div className="flex justify-between text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500">
                  <span>Progression</span>
                  <span>{uploadState.progress}%</span>
                </div>
                <div className="h-1.5 md:h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadState.progress}%` }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {uploadState.error && (
              <div className="p-2 md:p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2" role="alert">
                <AlertCircle size={12} className="w-3 h-3 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-red-500 text-[8px] md:text-[9px]">{uploadState.error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={uploadState.isUploading || !file}
              className={cn(
                "w-full py-3 md:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
                uploadState.isUploading && "cursor-wait"
              )}
              aria-busy={uploadState.isUploading}
              aria-label={uploadState.isUploading ? "Téléchargement en cours" : "Sceller la preuve"}
            >
              {uploadState.isUploading ? (
                <><Loader2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">Indexation...</span><span className="sm:hidden">En cours...</span></>
              ) : (
                <><ShieldCheck size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> <span className="hidden sm:inline">Sceller la Preuve</span><span className="sm:hidden">Sceller</span></>
              )}
            </button>
          </div>
        )}
      </div>

      {/* FOOTER DE CONFORMITÉ */}
      <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-3">
        <div className="flex items-center gap-1.5 md:gap-2 opacity-40">
           <Paperclip size={10} className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-500" aria-hidden="true" />
           <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-500">
             Module de Preuve V.2026 — {contextType}
           </span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2 text-emerald-500 italic">
          <CheckCircle2 size={10} className="w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" />
          <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">Audit Ready</span>
        </div>
      </div>
    </article>
  );
}