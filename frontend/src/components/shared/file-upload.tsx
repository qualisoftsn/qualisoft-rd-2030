/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : FileUpload (Digital Evidence Capture)
 * RÔLE : Capture et transfert de preuves numériques vers le SDE
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité + Security
 */

import React, { useState, useRef, useCallback, ChangeEvent, DragEvent, KeyboardEvent } from 'react';
import { 
  Upload, X, Loader2, Paperclip, ShieldCheck, AlertCircle, FileText, Image, File
} from 'lucide-react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FileData {
  url: string;
  name: string;
  size?: number;
  type?: string;
}

export interface FileUploadProps {
  onUploadSuccess: (fileData: FileData) => void;
  label?: string;
  acceptedTypes?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  endpoint?: string;
}

export interface UploadState {
  file: File | null;
  isUploading: boolean;
  isDragged: boolean;
  error: string | null;
  progress: number;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_MAX_SIZE_MB = 10;
const DEFAULT_ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png,.docx,.doc,.xlsx,.xls';
const DEFAULT_ENDPOINT = '/upload';

const FILE_TYPE_ICONS: Record<string, React.ElementType> = {
  'application/pdf': FileText,
  'image/jpeg': Image,
  'image/png': Image,
  'image/jpg': Image,
  'image/gif': Image,
  'application/msword': FileText,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileText,
  'application/vnd.ms-excel': FileText,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileText,
};

// ============================================================================
// UTILITAIRES
// ============================================================================

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (fileType: string): React.ElementType => {
  return FILE_TYPE_ICONS[fileType] || File;
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function FileUpload({ 
  onUploadSuccess, 
  label = "Joindre une preuve (Mail, Facture, PV...)", 
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  multiple = false,
  disabled = false,
  className,
  endpoint = DEFAULT_ENDPOINT
}: FileUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    isUploading: false,
    isDragged: false,
    error: null,
    progress: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((selectedFile: File): string | null => {
    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      return `Fichier trop lourd (max ${maxSizeMB}MB)`;
    }

    // Validate file type if acceptedTypes is specified
    if (acceptedTypes) {
      const allowedExtensions = acceptedTypes.split(',').map(ext => ext.trim().toLowerCase());
      const fileExtension = `.${selectedFile.name.split('.').pop()?.toLowerCase()}`;
      if (!allowedExtensions.includes(fileExtension)) {
        return `Type de fichier non autorisé (${allowedExtensions.join(', ')})`;
      }
    }

    return null;
  }, [maxSizeMB, acceptedTypes]);

  const handleFileChange = useCallback(async (selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setUploadState(prev => ({ ...prev, error: validationError }));
      toast.error(validationError);
      return;
    }

    setUploadState(prev => ({ ...prev, file: selectedFile, isUploading: true, error: null }));
    const toastId = toast.loading("Scellage documentaire en cours...");

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await apiClient.post<{ url: string; name: string }>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadState(prev => ({ ...prev, progress: percentCompleted }));
          }
        },
      });
      
      onUploadSuccess({
        url: res.data.url,
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
      });
      toast.success("DOCUMENT SCELLÉ AU REGISTRE", { id: toastId });
      setUploadState(prev => ({ ...prev, isUploading: false, progress: 100 }));
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMsg = apiError?.response?.data?.message || apiError?.message || "ERREUR KERNEL : Indexation impossible";
      setUploadState(prev => ({ ...prev, file: null, isUploading: false, error: errorMsg }));
      toast.error(errorMsg, { id: toastId });
    }
  }, [onUploadSuccess, validateFile, endpoint]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileChange(e.target.files[0]);
    }
    // Reset input value to allow re-uploading same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileChange]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setUploadState(prev => ({ ...prev, isDragged: true }));
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadState(prev => ({ ...prev, isDragged: false }));
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadState(prev => ({ ...prev, isDragged: false }));
    
    if (!disabled && e.dataTransfer.files?.[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, [disabled, handleFileChange]);

  const handleClick = useCallback(() => {
    if (!disabled && !uploadState.isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, uploadState.isUploading]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
    if (e.key === 'Escape' && uploadState.file && !uploadState.isUploading) {
      setUploadState(prev => ({ ...prev, file: null, error: null }));
    }
    if (e.key === 'Delete' && uploadState.file && !uploadState.isUploading) {
      setUploadState(prev => ({ ...prev, file: null, error: null }));
    }
  }, [handleClick, uploadState.file, uploadState.isUploading]);

  const handleRemoveFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadState(prev => ({ ...prev, file: null, error: null, progress: 0 }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const FileIcon = uploadState.file ? getFileIcon(uploadState.file.type) : Upload;

  return (
    <div className={cn("w-full space-y-3 md:space-y-4 italic font-sans text-left", className)}>
      <label 
        className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-1 md:ml-2 lg:ml-4 tracking-widest flex items-center gap-1.5 md:gap-2"
        id="file-upload-label"
      >
        <Paperclip size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-blue-500" aria-hidden="true" /> 
        {label}
      </label>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={uploadState.file ? `Fichier sélectionné: ${uploadState.file.name}` : "Zone de dépôt de fichier"}
        aria-disabled={disabled || uploadState.isUploading}
        aria-busy={uploadState.isUploading}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "relative cursor-pointer transition-all duration-500 border-2 border-dashed rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-6 md:p-8 lg:p-10 flex flex-col items-center justify-center gap-3 md:gap-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
          uploadState.isDragged && !disabled ? "border-blue-500 bg-blue-600/10 scale-[0.98]" : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-500/30 hover:shadow-xl",
          uploadState.file && !uploadState.isUploading ? "border-emerald-500/50 bg-emerald-500/5" : "",
          (uploadState.isUploading || disabled) && "cursor-not-allowed opacity-70"
        )}
      >
        <input 
          type="file" 
          className="sr-only" 
          ref={fileInputRef} 
          accept={acceptedTypes} 
          onChange={handleInputChange}
          disabled={disabled || uploadState.isUploading}
          multiple={multiple}
          aria-label="Sélectionner un fichier"
        />

        {uploadState.isUploading ? (
          <div className="flex flex-col items-center gap-3 md:gap-4 animate-in fade-in duration-300" role="status" aria-live="polite">
            <Loader2 size={32} className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 text-blue-500 animate-spin" aria-hidden="true" />
            <span className="text-[8px] md:text-[9px] font-black uppercase text-blue-500 tracking-widest animate-pulse">
              Synchronisation Kernel... {uploadState.progress > 0 && `(${uploadState.progress}%)`}
            </span>
            {uploadState.progress > 0 && (
              <div className="w-full max-w-xs h-1 md:h-1.5 bg-slate-200 rounded-full overflow-hidden" aria-hidden="true">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300" 
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
            )}
          </div>
        ) : uploadState.file ? (
          <div className="flex items-center gap-4 md:gap-6 w-full animate-in zoom-in-95 duration-500" role="status">
            <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-emerald-500/20 rounded-lg md:rounded-xl lg:rounded-2xl text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
              <FileIcon size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-sm font-black text-slate-900 truncate uppercase tracking-tighter m-0">
                {uploadState.file.name}
              </p>
              <p className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 md:gap-2 mt-1 md:mt-1.5 m-0 leading-none">
                <ShieldCheck size={10} className="w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" />
                Preuve Intègre • {formatFileSize(uploadState.file.size)}
              </p>
            </div>
            <button 
              type="button"
              onClick={handleRemoveFile}
              disabled={uploadState.isUploading}
              className="p-2 md:p-2.5 lg:p-3 bg-white border border-slate-100 rounded-lg md:rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
              aria-label="Supprimer le fichier"
            >
              <X size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <>
            <div 
              className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-blue-600/10 rounded-xl md:rounded-2xl lg:rounded-3xl text-blue-500 flex items-center justify-center shadow-inner hover:scale-105 transition-transform"
              aria-hidden="true"
            >
              <Upload size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
            </div>
            <div className="text-center">
              <p className="text-[10px] md:text-sm font-black text-slate-900 uppercase tracking-tighter m-0">
                Déposer la preuve digitale
              </p>
              <p className="text-[7px] md:text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 md:mt-2.5 m-0 opacity-60 italic">
                Périmètre : {acceptedTypes.replace(/\./g, '').toUpperCase()} (Max {maxSizeMB}MB)
              </p>
            </div>
          </>
        )}
      </div>

      {uploadState.error && (
        <div 
          className="p-2 md:p-3 bg-red-500/10 border border-red-500/30 rounded-lg md:rounded-xl flex items-start gap-2" 
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-red-500 text-[8px] md:text-[9px]">{uploadState.error}</p>
        </div>
      )}
    </div>
  );
}