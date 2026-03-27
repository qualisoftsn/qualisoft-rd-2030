/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📄 MODULE : DocumentViewer (GED Document Preview)
 * RÔLE : Visualisation et métadonnées des documents
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, useCallback, KeyboardEvent } from 'react';
import { 
  FileText, Download, Eye, Share2, Clock, User, 
  ShieldCheck, AlertTriangle, CheckCircle, XCircle,
  Maximize2, Minimize2, ChevronLeft, ChevronRight,
  Printer, ExternalLink, Info
} from 'lucide-react';
import { cn } from '@/core/utils/cn';
import { toast } from 'sonner';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export type DocumentType = 'PDF' | 'WORD' | 'EXCEL' | 'IMAGE' | 'OTHER';
export type DocumentStatus = 'BROUILLON' | 'EN_REVISION' | 'EN_APPROBATION' | 'APPROUVE' | 'OBSOLETE' | 'REJETE';

export interface DocumentVersion {
  versionId: string;
  versionNumber: string;
  createdAt: string;
  createdBy: string;
  status: DocumentStatus;
  comment?: string;
}

export interface DocumentData {
  DOC_Id: string;
  DOC_Title: string;
  DOC_Reference?: string;
  DOC_Type: DocumentType;
  DOC_Status: DocumentStatus;
  DOC_Version: string;
  DOC_FileUrl: string;
  DOC_FileName: string;
  DOC_FileSize: number;
  DOC_Description?: string;
  DOC_Category?: string;
  DOC_ProcessusId?: string;
  DOC_ProcessusName?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  versions?: DocumentVersion[];
}

export interface DocumentViewerProps {
  document: DocumentData;
  onClose?: () => void;
  onVersionChange?: (versionId: string) => void;
  onShare?: (documentId: string) => void;
  onDownload?: (documentId: string) => void;
  className?: string;
  compact?: boolean;
}

export interface StatusBadgeProps {
  status: DocumentStatus;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// CONSTANTES
// ============================================================================

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  BROUILLON: { label: 'Brouillon', color: 'text-slate-500', bgColor: 'bg-slate-500/10', icon: FileText },
  EN_REVISION: { label: 'En Révision', color: 'text-amber-500', bgColor: 'bg-amber-500/10', icon: Clock },
  EN_APPROBATION: { label: 'En Approbation', color: 'text-blue-500', bgColor: 'bg-blue-500/10', icon: ShieldCheck },
  APPROUVE: { label: 'Approuvé', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', icon: CheckCircle },
  OBSOLETE: { label: 'Obsolète', color: 'text-slate-400', bgColor: 'bg-slate-400/10', icon: XCircle },
  REJETE: { label: 'Rejeté', color: 'text-red-500', bgColor: 'bg-red-500/10', icon: AlertTriangle },
};

const TYPE_CONFIG: Record<DocumentType, { label: string; icon: React.ElementType; color: string }> = {
  PDF: { label: 'PDF', icon: FileText, color: 'text-red-500' },
  WORD: { label: 'Word', icon: FileText, color: 'text-blue-500' },
  EXCEL: { label: 'Excel', icon: FileText, color: 'text-emerald-500' },
  IMAGE: { label: 'Image', icon: Eye, color: 'text-purple-500' },
  OTHER: { label: 'Autre', icon: FileText, color: 'text-slate-500' },
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('fr-SN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Date invalide';
  }
};

// ============================================================================
// SOUS-COMPOSANT : STATUS BADGE
// ============================================================================

function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-[6px] md:text-[7px] px-1.5 md:px-2 py-0.5 md:py-1',
    md: 'text-[7px] md:text-[8px] px-2 md:px-3 py-1 md:py-1.5',
    lg: 'text-[8px] md:text-[9px] px-3 md:px-4 py-1.5 md:py-2',
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1 md:gap-1.5 font-black uppercase tracking-widest rounded-lg md:rounded-xl",
        config.bgColor, config.color, sizeClasses[size]
      )}
      role="status"
      aria-label={`Statut: ${config.label}`}
    >
      <Icon size={10} className={size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3 md:w-3.5 md:h-3.5' : 'w-4 h-4'} aria-hidden="true" />
      {config.label}
    </span>
  );
}

// ============================================================================
// SOUS-COMPOSANT : VERSION HISTORY
// ============================================================================

interface VersionHistoryProps {
  versions?: DocumentVersion[];
  currentVersionId: string;
  onVersionSelect: (versionId: string) => void;
}

function VersionHistory({ versions = [], currentVersionId, onVersionSelect }: VersionHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  if (versions.length === 0) return null;

  return (
    <div className="space-y-2 md:space-y-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2 md:p-3 bg-slate-50 hover:bg-slate-100 rounded-lg md:rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-expanded={expanded}
        aria-label="Historique des versions"
      >
        <div className="flex items-center gap-2">
          <Clock size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-500" aria-hidden="true" />
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-600">
            Historique ({versions.length})
          </span>
        </div>
        {expanded ? (
          <Minimize2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-500" aria-hidden="true" />
        ) : (
          <Maximize2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-500" aria-hidden="true" />
        )}
      </button>

      {expanded && (
        <div className="space-y-1 md:space-y-1.5 max-h-40 md:max-h-48 overflow-y-auto custom-scrollbar" role="list">
          {versions.map((version, index) => (
            <button
              key={version.versionId}
              type="button"
              onClick={() => onVersionSelect(version.versionId)}
              className={cn(
                "w-full flex items-center justify-between p-2 md:p-2.5 rounded-lg md:rounded-xl transition-all text-left focus:outline-none focus:ring-2 focus:ring-blue-400",
                version.versionId === currentVersionId
                  ? "bg-blue-500/10 border border-blue-500/20"
                  : "bg-slate-50 hover:bg-slate-100 border border-transparent"
              )}
              role="listitem"
              aria-label={`Version ${version.versionNumber}`}
              aria-current={version.versionId === currentVersionId ? 'true' : undefined}
            >
              <div className="flex items-center gap-2 min-w-0">
                <StatusBadge status={version.status} size="sm" />
                <span className="text-[8px] md:text-[9px] font-black text-slate-700 truncate">
                  v{version.versionNumber}
                </span>
              </div>
              <span className="text-[7px] md:text-[8px] text-slate-500 whitespace-nowrap">
                {formatDate(version.createdAt)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function DocumentViewer({ 
  document, 
  onClose,
  onVersionChange,
  onShare,
  onDownload,
  className,
  compact = false
}: DocumentViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'info'>('preview');

  const typeConfig = TYPE_CONFIG[document.DOC_Type];
  const TypeIcon = typeConfig.icon;
  const statusConfig = STATUS_CONFIG[document.DOC_Status];

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload(document.DOC_Id);
    } else {
      // Fallback: direct download
      const link = document.createElement('a');
      link.href = document.DOC_FileUrl;
      link.download = document.DOC_FileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Téléchargement lancé');
    }
  }, [onDownload, document]);

  const handleShare = useCallback(() => {
    if (onShare) {
      onShare(document.DOC_Id);
    } else {
      // Fallback: copy link
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(window.location.origin + document.DOC_FileUrl);
        toast.success('Lien copié dans le presse-papier');
      }
    }
  }, [onShare, document]);

  const handleVersionChange = useCallback((versionId: string) => {
    onVersionChange?.(versionId);
  }, [onVersionChange]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose?.();
    }
    if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setIsFullscreen(!isFullscreen);
    }
  };

  const handlePrint = useCallback(() => {
    window.print();
    toast.info('Ouverture de la fenêtre d\'impression');
  }, []);

  return (
    <article 
      className={cn(
        "bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-xl overflow-hidden italic font-sans",
        isFullscreen && "fixed inset-4 md:inset-8 lg:inset-12 z-50",
        className
      )}
      role="region"
      aria-label={`Visualiseur de document: ${document.DOC_Title}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* HEADER */}
      <header className="p-3 md:p-4 lg:p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <div className={cn("p-2 md:p-2.5 rounded-lg md:rounded-xl", typeConfig.color, "bg-white/50")}>
            <TypeIcon size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm md:text-base lg:text-lg font-black text-slate-900 uppercase tracking-tighter truncate m-0">
              {document.DOC_Title}
            </h2>
            <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1 flex-wrap">
              <span className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                v{document.DOC_Version}
              </span>
              <span className="text-[6px] md:text-[7px] text-slate-400">•</span>
              <StatusBadge status={document.DOC_Status} size="sm" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 md:p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg md:rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Fermer"
            >
              <XCircle size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 md:p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg md:rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? (
              <Minimize2 size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
            ) : (
              <Maximize2 size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* TABS */}
      <div className="flex border-b border-slate-200" role="tablist" aria-label="Onglets du visualiseur">
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={cn(
            "flex-1 py-2 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400",
            activeTab === 'preview'
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-500/5"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          )}
          role="tab"
          aria-selected={activeTab === 'preview'}
          aria-controls="preview-panel"
        >
          <Eye size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 inline mr-1 md:mr-1.5" aria-hidden="true" />
          Aperçu
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={cn(
            "flex-1 py-2 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400",
            activeTab === 'info'
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-500/5"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          )}
          role="tab"
          aria-selected={activeTab === 'info'}
          aria-controls="info-panel"
        >
          <Info size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 inline mr-1 md:mr-1.5" aria-hidden="true" />
          Informations
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-3 md:p-4 lg:p-6">
        {activeTab === 'preview' ? (
          <div 
            id="preview-panel"
            role="tabpanel"
            aria-labelledby="preview-tab"
            className="space-y-4 md:space-y-6"
          >
            {/* Document Preview */}
            <div className="bg-slate-100 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 min-h-[300px] md:min-h-[400px] flex items-center justify-center">
              {document.DOC_Type === 'IMAGE' ? (
                <img 
                  src={document.DOC_FileUrl} 
                  alt={document.DOC_Title}
                  className="max-w-full max-h-[400px] md:max-h-[500px] object-contain rounded-lg shadow-lg"
                />
              ) : document.DOC_Type === 'PDF' ? (
                <iframe 
                  src={document.DOC_FileUrl}
                  title={`Aperçu de ${document.DOC_Title}`}
                  className="w-full h-[400px] md:h-[500px] rounded-lg border border-slate-200"
                  aria-label={`Aperçu PDF de ${document.DOC_Title}`}
                />
              ) : (
                <div className="text-center space-y-4">
                  <TypeIcon size={48} className={cn("w-12 h-12 md:w-14 md:h-14 mx-auto", typeConfig.color)} aria-hidden="true" />
                  <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">
                    Aperçu non disponible pour ce type de fichier
                  </p>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 text-[9px] md:text-[10px] text-blue-600 hover:text-blue-700 font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-2"
                  >
                    <Download size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" />
                    Télécharger pour visualiser
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 md:gap-3">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <Download size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Télécharger</span>
                <span className="sm:hidden">DL</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <Share2 size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Partager</span>
                <span className="sm:hidden">Share</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <Printer size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Imprimer</span>
                <span className="sm:hidden">Print</span>
              </button>
              <button
                type="button"
                onClick={() => window.open(document.DOC_FileUrl, '_blank', 'noopener,noreferrer')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <ExternalLink size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Ouvrir</span>
                <span className="sm:hidden">Open</span>
              </button>
            </div>

            {/* Version History */}
            {document.versions && document.versions.length > 1 && (
              <VersionHistory 
                versions={document.versions}
                currentVersionId={document.DOC_Id}
                onVersionSelect={handleVersionChange}
              />
            )}
          </div>
        ) : (
          <div 
            id="info-panel"
            role="tabpanel"
            aria-labelledby="info-tab"
            className="space-y-4 md:space-y-6"
          >
            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <InfoRow label="Référence" value={document.DOC_Reference || 'N/A'} />
              <InfoRow label="Type" value={typeConfig.label} />
              <InfoRow label="Catégorie" value={document.DOC_Category || 'N/A'} />
              <InfoRow label="Processus" value={document.DOC_ProcessusName || 'N/A'} />
              <InfoRow label="Taille" value={formatFileSize(document.DOC_FileSize)} />
              <InfoRow label="Version" value={`v${document.DOC_Version}`} />
              <InfoRow label="Créé le" value={formatDate(document.createdAt)} />
              <InfoRow label="Créé par" value={document.createdBy || 'N/A'} />
              <InfoRow label="Mis à jour le" value={formatDate(document.updatedAt)} />
              <InfoRow label="Mis à jour par" value={document.updatedBy || 'N/A'} />
            </div>

            {/* Description */}
            {document.DOC_Description && (
              <div className="space-y-1.5 md:space-y-2">
                <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Description
                </h4>
                <p className="text-[10px] md:text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl">
                  {document.DOC_Description}
                </p>
              </div>
            )}

            {/* Compliance Notice */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl md:rounded-2xl p-3 md:p-4">
              <div className="flex items-start gap-2 md:gap-3">
                <ShieldCheck size={16} className="w-4 h-4 md:w-5 md:h-5 text-indigo-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-[8px] md:text-[9px] font-black text-indigo-900 uppercase tracking-widest m-0">
                    Conformité ISO 9001:2015
                  </p>
                  <p className="text-[7px] md:text-[8px] text-indigo-700 mt-0.5 md:mt-1 leading-relaxed">
                    Ce document fait partie du Système de Management de la Qualité. Toute modification doit suivre la procédure de contrôle documentaire.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : INFO ROW
// ============================================================================

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="space-y-0.5 md:space-y-1">
      <p className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="text-[9px] md:text-[10px] font-bold text-slate-700 truncate" title={value}>
        {value}
      </p>
    </div>
  );
}