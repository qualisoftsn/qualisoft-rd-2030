/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
'use client';

/**
 * 🖋️ MODULE : SignatureViewer (ISO 45001 & 9001 Compliance)
 * RÔLE : Affichage et authentification de la signature participant
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, KeyboardEvent } from 'react';
import { ShieldCheck, User, Fingerprint, Lock, ZoomIn, CheckCircle2 } from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export interface SignatureParticipant {
  U_Id?: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_Role?: string;
  signatureHash?: string; // Empreinte numérique unique du scellage
  signatureImage?: string; // Base64 ou URL de la signature manuscrite
  signedAt?: string; // Timestamp de signature
  verified?: boolean; // Statut de vérification
}

export interface SignatureViewerProps {
  participant: SignatureParticipant;
  onSignatureClick?: (participant: SignatureParticipant) => void;
  compact?: boolean;
}

export interface SignatureStatus {
  label: string;
  color: string;
  icon: React.ElementType;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const SIGNATURE_STATUS: Record<'signed' | 'pending', SignatureStatus> = {
  signed: {
    label: 'Scellé Matrix',
    color: 'text-emerald-400',
    icon: CheckCircle2
  },
  pending: {
    label: 'Attente Signature',
    color: 'text-amber-400',
    icon: Lock
  }
};

// ============================================================================
// SOUS-COMPOSANT : SEAL BADGE
// ============================================================================

interface SealBadgeProps {
  isSigned: boolean;
}

function SealBadge({ isSigned }: SealBadgeProps) {
  const status = SIGNATURE_STATUS[isSigned ? 'signed' : 'pending'];
  const Icon = status.icon;

  return (
    <div 
      className={cn(
        "absolute -top-1.5 md:-top-2 -right-1.5 md:-right-2 rounded-full p-1 md:p-1.5 shadow-lg border-2 border-[#0B0F1A] transition-all duration-500",
        isSigned 
          ? "bg-emerald-500 text-white scale-110" 
          : "bg-slate-800 text-slate-600 scale-100"
      )}
      role="status"
      aria-label={isSigned ? "Signature vérifiée" : "Signature en attente"}
    >
      <Icon size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" strokeWidth={3} aria-hidden="true" />
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : SIGNATURE IMAGE
// ============================================================================

interface SignatureImageProps {
  signatureImage: string;
  participantName: string;
  onClick?: () => void;
}

function SignatureImage({ signatureImage, participantName, onClick }: SignatureImageProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleClick = () => {
    setIsZoomed(!isZoomed);
    onClick?.();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <>
      <div 
        className="bg-white rounded-lg md:rounded-xl lg:rounded-2xl p-1 md:p-1.5 shadow-2xl ring-1 ring-white/20 group-hover/sig:scale-110 transition-transform duration-500 cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Voir la signature de ${participantName}`}
        aria-pressed={isZoomed}
      >
        <img 
          src={signatureImage} 
          alt={`Signature de ${participantName}`} 
          className="h-8 md:h-10 w-20 md:w-28 object-contain grayscale hover:grayscale-0 transition-all duration-700 contrast-150"
          loading="lazy"
        />
        <div className="sr-only">Cliquez pour zoomer sur la signature</div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu de la signature"
        >
          <div 
            className="relative max-w-2xl max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute -top-8 right-0 text-white hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded p-2"
              aria-label="Fermer l'aperçu"
            >
              <span className="sr-only">Fermer</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={signatureImage} 
              alt={`Signature de ${participantName} - Aperçu zoomé`} 
              className="max-w-full max-h-[70vh] object-contain bg-white rounded-lg md:rounded-xl p-4 md:p-8 shadow-2xl"
            />
            <div className="text-center mt-4 text-white">
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                {participantName}
              </p>
              <p className="text-[8px] md:text-[9px] text-slate-400 uppercase tracking-widest mt-1">
                Signature Authentifiée
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// SOUS-COMPOSANT : PENDING SIGNATURE
// ============================================================================

function PendingSignature() {
  return (
    <div 
      className="h-10 md:h-12 w-20 md:w-28 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-lg md:rounded-xl lg:rounded-2xl bg-black/40 group-hover:border-blue-500/20 transition-colors"
      role="status"
      aria-label="Signature en attente"
    >
      <Lock size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-700 mb-0.5 md:mb-1" aria-hidden="true" />
      <span className="text-[6px] md:text-[7px] font-black text-slate-600 uppercase tracking-widest italic">
        Wait Sync
      </span>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function SignatureViewer({ 
  participant, 
  onSignatureClick,
  compact = false 
}: SignatureViewerProps) {
  
  // Génération d'un ID de scellage visuel si le hash est absent
  const sealId = participant.signatureHash 
    ? participant.signatureHash.substring(0, 12).toUpperCase() 
    : "SDE-PENDING";

  const isSigned = !!participant.signatureImage;
  const status = SIGNATURE_STATUS[isSigned ? 'signed' : 'pending'];
  const StatusIcon = status.icon;
  const fullName = `${participant.U_FirstName} ${participant.U_LastName}`;

  const handleSignatureClick = () => {
    if (isSigned) {
      onSignatureClick?.(participant);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSignatureClick();
    }
  };

  return (
    <article 
      className={cn(
        "bg-[#0F172A]/40 border border-white/5 p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 lg:gap-6 group hover:bg-[#0F172A] hover:border-blue-500/30 transition-all duration-500 italic font-sans relative overflow-hidden focus-within:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400",
        compact && "p-2 md:p-3"
      )}
      role="article"
      aria-label={`Signature de ${fullName}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      
      {/* 🧬 BACKGROUND GLOW (Subtil) */}
      <div 
        className="absolute -left-2 md:-left-4 -bottom-2 md:-bottom-4 w-16 h-16 md:w-24 md:h-24 bg-blue-600/5 blur-2xl md:blur-3xl rounded-full pointer-events-none" 
        aria-hidden="true" 
      />

      {/* 👤 IDENTITÉ DE L'AGENT */}
      <div className="flex items-center gap-3 md:gap-4 lg:gap-5 relative z-10 w-full sm:w-auto">
        <div 
          className={cn(
            "w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center border border-white/10 shadow-xl group-hover:bg-blue-600 group-hover:border-blue-400 transition-all duration-500 shrink-0",
            compact && "w-8 h-8 md:w-10 md:h-10"
          )}
          aria-hidden="true"
        >
          <User size={16} className="w-4 h-4 md:w-5 md:h-5 text-blue-400 group-hover:text-white" />
        </div>
        
        <div className="text-left leading-none min-w-0 flex-1">
          <p 
            className={cn(
              "text-[11px] md:text-[12px] font-black uppercase italic tracking-tighter text-white m-0 truncate",
              compact && "text-[10px] md:text-[11px]"
            )}
          >
            {fullName}
          </p>
          <div className="flex items-center gap-1.5 md:gap-2 mt-1 md:mt-1.5 lg:mt-2 opacity-40 group-hover:opacity-100 transition-opacity">
            <Fingerprint size={10} className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-400" aria-hidden="true" />
            <p className="text-[7px] md:text-[8px] font-mono font-black text-slate-400 tracking-widest uppercase m-0 truncate">
              HASH: {sealId}
            </p>
          </div>
          {participant.signedAt && (
            <p className="text-[6px] md:text-[7px] text-slate-500 uppercase tracking-widest mt-0.5 md:mt-1">
              {new Date(participant.signedAt).toLocaleDateString('fr-SN')}
            </p>
          )}
        </div>
      </div>

      {/* 🖋️ ZONE DE PREUVE DIGITALE */}
      <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full sm:w-auto justify-between sm:justify-end">
        <div className="flex-col items-end gap-1 mr-1 md:mr-2 hidden md:flex">
          <span className="text-[6px] md:text-[7px] font-black text-slate-500 uppercase tracking-widest">
            Status
          </span>
          <div className="flex items-center gap-1">
            <StatusIcon size={10} className={cn("w-2.5 h-2.5 md:w-3 md:h-3", status.color)} aria-hidden="true" />
            <span className={cn("text-[7px] md:text-[8px] font-black uppercase italic", status.color)}>
              {status.label}
            </span>
          </div>
        </div>

        <div className="relative group/sig">
          {isSigned && participant.signatureImage ? (
            <SignatureImage 
              signatureImage={participant.signatureImage}
              participantName={fullName}
              onClick={handleSignatureClick}
            />
          ) : (
            <PendingSignature />
          )}
          
          {/* 🛡️ BADGE DE CERTIFICATION SDE */}
          <SealBadge isSigned={isSigned} />
        </div>
      </div>

      {/* INDICATION DE VALIDITÉ ISO BAS DE CARTE */}
      {isSigned && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" 
          aria-hidden="true" 
        />
      )}
    </article>
  );
}