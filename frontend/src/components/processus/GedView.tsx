/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📂 MODULE : GedView (Document Management System)
 * RÔLE : Gestion documentaire maîtrisée (Coffre-fort GED)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, KeyboardEvent, useCallback } from 'react';
import { 
  FileText, Eye, Download, FileCheck, ShieldCheck, 
  ExternalLink, CheckCircle, Lock, X, Calendar, User
} from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type DocumentStatus = 'BROUILLON' | 'EN_REVISION' | 'APPROUVE' | 'OBSOLETE' | 'REJETE';

export interface Document {
  DOC_Id: string;
  DOC_Title: string;
  DOC_Reference?: string;
  DOC_CurrentVersion?: string;
  DOC_Status: DocumentStatus;
  DOC_FileUrl?: string;
  DOC_FileName?: string;
  DOC_FileSize?: number;
  DOC_CreatedAt?: string;
  DOC_UpdatedAt?: string;
  DOC_Author?: string;
  DOC_ProcessusId?: string;
}

export interface Processus {
  PR_Id: string;
  PR_Libelle: string;
  PR_Code?: string;
  PR_Documents?: Document[];
}

export interface GedViewProps {
  process?: Processus | null;
  onDocumentPreview?: (doc: Document) => void;
  onDocumentDownload?: (doc: Document) => void;
  className?: string;
}

export interface MetadataProps {
  label: string;
  value: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; bg: string; border: string; shadow: string }> = {
  BROUILLON: { label: 'BROUILLON', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', shadow: '' },
  EN_REVISION: { label: 'EN RÉVISION', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', shadow: '' },
  APPROUVE: { label: 'APPROUVÉ', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]' },
  OBSOLETE: { label: 'OBSOLÈTE', color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', shadow: '' },
  REJETE: { label: 'REJETÉ', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', shadow: '' },
};

// ============================================================================
// SOUS-COMPOSANT : METADATA
// ============================================================================

function Metadata({ label, value }: MetadataProps) {
  return (
    <div className="text-left" role="group" aria-label={label}>
      <p className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase italic m-0 mb-1 md:mb-2 tracking-widest">
        {label}
      </p>
      <p className="text-[10px] md:text-[11px] font-black text-blue-300 uppercase italic m-0 tracking-tighter truncate max-w-[150px]">
        {value}
      </p>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : DOCUMENT PREVIEW SIDEBAR
// ============================================================================

interface DocumentPreviewProps {
  document: Document;
  onClose: () => void;
  onDownload?: (doc: Document) => void;
}

function DocumentPreview({ document, onClose, onDownload }: DocumentPreviewProps) {
  const status = STATUS_CONFIG[document.DOC_Status] || STATUS_CONFIG.BROUILLON;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleDownload = useCallback(() => {
    onDownload?.(document);
  }, [document, onDownload]);

  return (
    <aside 
      className="w-full lg:w-1/2 bg-[#0F172A] border border-blue-500/30 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] flex flex-col overflow-hidden animate-in slide-in-from-right-20 duration-700 shadow-2xl relative"
      role="complementary"
      aria-label={`Aperçu du document: ${document.DOC_Title}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <header className="p-4 md:p-6 lg:p-8 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 md:gap-4 text-left min-w-0">
          <div className="p-2 md:p-3 bg-blue-600 rounded-lg md:rounded-xl text-white shadow-xl shrink-0">
            <FileCheck size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs md:text-sm font-black uppercase italic tracking-tighter text-white m-0 truncate max-w-[200px] md:max-w-[250px]">
              {document.DOC_Title}
            </h4>
            <p className="text-[8px] md:text-[9px] font-black text-blue-400 uppercase tracking-widest mt-0.5 md:mt-1 m-0">
              Intégrité Matrix SDE : OK
            </p>
          </div>
        </div>
        <button 
          type="button"
          onClick={onClose}
          className="p-2 md:p-3 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg md:rounded-full transition-all border-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Fermer l'aperçu"
        >
          <X size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
        </button>
      </header>
      
      <div className="flex-1 bg-slate-950/80 flex items-center justify-center p-6 md:p-8 lg:p-12 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
          aria-hidden="true"
        />
        <div className="w-full h-full border-2 border-dashed border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3rem] flex flex-col items-center justify-center gap-6 md:gap-8 bg-[#0B0F1A]/80 backdrop-blur-md relative z-10 shadow-inner p-4 md:p-6">
          <div className="relative group/lock" aria-hidden="true">
            <ExternalLink size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-blue-500 opacity-20 group-hover/lock:opacity-100 transition-opacity" />
            <Lock size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 absolute -bottom-1 md:-bottom-2 -right-1 md:-right-2 text-amber-400 animate-pulse" />
          </div>
          <div className="text-center space-y-4 md:space-y-6">
            <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-500 uppercase italic tracking-widest m-0">
              Flux Documentaire Master (SDE)
            </p>
            <button 
              type="button"
              onClick={handleDownload}
              className="px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 bg-blue-600 hover:bg-blue-500 text-white text-[9px] md:text-[10px] lg:text-[11px] font-black uppercase rounded-xl md:rounded-2xl transition-all shadow-xl border-none cursor-pointer tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label={`Télécharger ${document.DOC_Title}`}
            >
              Télécharger le Document
            </button>
          </div>
        </div>
      </div>

      <footer className="p-4 md:p-6 lg:p-8 bg-[#0B0F1A] border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:gap-6 shrink-0">
        <div className="flex flex-wrap gap-4 md:gap-6 lg:gap-10" role="list" aria-label="Métadonnées du document">
          <Metadata 
            label="Dernier Scellage" 
            value={document.DOC_UpdatedAt ? new Date(document.DOC_UpdatedAt).toLocaleDateString('fr-SN') : new Date().toLocaleDateString('fr-SN')} 
          />
          <Metadata 
            label="Auteur" 
            value={document.DOC_Author || 'ADMIN_SDE'} 
          />
          <Metadata 
            label="Version" 
            value={`v${document.DOC_CurrentVersion || '1'}.0`} 
          />
        </div>
        <button 
          type="button"
          className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black text-emerald-400 uppercase border-2 border-emerald-500/20 px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 rounded-full md:rounded-full bg-emerald-500/5 hover:bg-emerald-500 hover:text-white transition-all duration-500 cursor-pointer italic tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full sm:w-auto justify-center"
          aria-label="Enregistrer la lecture du document"
        >
          <CheckCircle size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
          <span className="hidden sm:inline">Enregistrer la lecture</span>
          <span className="sm:hidden">Lecture OK</span>
        </button>
      </footer>
    </aside>
  );
}

// ============================================================================
// SOUS-COMPOSANT : DOCUMENT TABLE ROW
// ============================================================================

interface DocumentRowProps {
  document: Document;
  onPreview: (doc: Document) => void;
  onDownload: (doc: Document) => void;
}

function DocumentRow({ document, onPreview, onDownload }: DocumentRowProps) {
  const status = STATUS_CONFIG[document.DOC_Status] || STATUS_CONFIG.BROUILLON;

  const handleKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPreview(document);
    }
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview(document);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(document);
  };

  return (
    <tr 
      className="hover:bg-blue-600/10 transition-all group cursor-pointer focus-within:bg-blue-600/10 focus:outline-none"
      role="row"
      tabIndex={0}
      onClick={handlePreviewClick}
      onKeyDown={handleKeyDown}
      aria-label={`Document: ${document.DOC_Title}`}
    >
      <td className="p-4 md:p-6 lg:p-8" role="gridcell">
        <div className="flex items-center gap-3 md:gap-4 lg:gap-5">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-lg md:rounded-xl flex items-center justify-center text-blue-400 border border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner shrink-0">
            <FileText size={16} className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" aria-hidden="true" />
          </div>
          <div className="leading-none min-w-0">
            <p className="text-[11px] md:text-[12px] lg:text-[13px] font-black uppercase text-white tracking-tighter m-0 truncate max-w-[200px] md:max-w-[250px]">
              {document.DOC_Title}
            </p>
            <p className="text-[8px] md:text-[9px] font-black text-slate-500 mt-1 md:mt-1.5 lg:mt-2 italic m-0 tracking-widest truncate">
              REF: {document.DOC_Reference || 'SMI_UNSTABLE'}
            </p>
          </div>
        </div>
      </td>
      <td className="p-4 md:p-6 lg:p-8 text-center" role="gridcell">
        <span className="px-3 md:px-4 py-1 md:py-1.5 bg-white/5 rounded-full text-[9px] md:text-[10px] font-mono font-black text-slate-400 italic border border-white/5 whitespace-nowrap">
          v{document.DOC_CurrentVersion || '1'}.0
        </span>
      </td>
      <td className="p-4 md:p-6 lg:p-8" role="gridcell">
        <span 
          className={cn(
            "px-3 md:px-4 py-1 md:py-1.5 lg:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black border uppercase tracking-widest whitespace-nowrap inline-block",
            status.bg, status.color, status.border, status.shadow
          )}
          role="status"
          aria-label={`Statut: ${status.label}`}
        >
          {status.label}
        </span>
      </td>
      <td className="p-4 md:p-6 lg:p-8 text-right" role="gridcell">
        <div className="flex justify-end gap-2 md:gap-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 translate-x-2 md:translate-x-4">
          <button 
            type="button"
            onClick={handlePreviewClick}
            className="p-2 md:p-3 bg-white/10 rounded-lg md:rounded-xl text-white hover:bg-blue-600 transition-all border-none cursor-pointer shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={`Aperçu de ${document.DOC_Title}`}
          >
            <Eye size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" aria-hidden="true" />
          </button>
          <button 
            type="button"
            onClick={handleDownloadClick}
            className="p-2 md:p-3 bg-white/10 rounded-lg md:rounded-xl text-white hover:bg-emerald-600 transition-all border-none cursor-pointer shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label={`Télécharger ${document.DOC_Title}`}
          >
            <Download size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ============================================================================
// SOUS-COMPOSANT : EMPTY STATE
// ============================================================================

function GedEmptyState() {
  return (
    <tr role="row">
      <td colSpan={4} className="p-16 md:p-20 lg:p-24 lg:p-32 text-center" role="status">
        <ShieldCheck size={64} className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-slate-700 mx-auto mb-6 md:mb-8 opacity-10" aria-hidden="true" />
        <p className="text-[9px] md:text-[10px] font-black uppercase italic tracking-widest text-slate-600">
          Coffre-fort scellé vide
        </p>
      </td>
    </tr>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function GedView({ 
  process, 
  onDocumentPreview,
  onDocumentDownload,
  className 
}: GedViewProps) {
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const docs = process?.PR_Documents || [];

  const handlePreview = useCallback((doc: Document) => {
    setPreviewDoc(doc);
    onDocumentPreview?.(doc);
  }, [onDocumentPreview]);

  const handleDownload = useCallback((doc: Document) => {
    onDocumentDownload?.(doc);
    // Fallback: direct download if no handler
    if (doc.DOC_FileUrl) {
      const link = document.createElement('a');
      link.href = doc.DOC_FileUrl;
      link.download = doc.DOC_FileName || `${doc.DOC_Title}.pdf`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [onDocumentDownload]);

  const handleClosePreview = useCallback(() => {
    setPreviewDoc(null);
  }, []);

  return (
    <div 
      className={cn(
        "flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10 animate-in fade-in duration-1000 min-h-[400px] md:min-h-[500px] lg:min-h-[600px] font-sans italic",
        className
      )}
      role="region"
      aria-label="Gestion documentaire"
    >
      {/* 📜 TABLEAU DE BORD GED */}
      <div className={cn(
        "transition-all duration-700 ease-in-out",
        previewDoc ? "w-full lg:w-1/2" : "w-full"
      )}>
        <div className="bg-white/2 border border-white/10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] overflow-hidden shadow-xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" role="table">
              <thead>
                <tr className="text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase text-slate-500 italic border-b border-white/5 bg-white/5 tracking-widest" role="row">
                  <th className="p-4 md:p-6 lg:p-8 text-left" scope="col" role="columnheader">Actif Documentaire</th>
                  <th className="p-4 md:p-6 lg:p-8 text-center" scope="col" role="columnheader">Version</th>
                  <th className="p-4 md:p-6 lg:p-8 text-left" scope="col" role="columnheader">Statut Diffusion</th>
                  <th className="p-4 md:p-6 lg:p-8 text-right" scope="col" role="columnheader">Contrôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5" role="rowgroup">
                {docs.length > 0 ? (
                  docs.map((doc) => (
                    <DocumentRow 
                      key={doc.DOC_Id}
                      document={doc}
                      onPreview={handlePreview}
                      onDownload={handleDownload}
                    />
                  ))
                ) : (
                  <GedEmptyState />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 🖥️ PREVIEW MATRIX SIDEBAR */}
      {previewDoc && (
        <DocumentPreview 
          document={previewDoc}
          onClose={handleClosePreview}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}