/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🚀 MODULE : WelcomeModal (Instance Onboarding)
 * RÔLE : Onboarding visuel et confirmation de scellage d'instance
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { ArrowRight, Rocket, ShieldCheck, Sparkles, CheckCircle2, X } from "lucide-react";
import React, { useEffect, useCallback, KeyboardEvent, useRef, useState } from "react";
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface WelcomeModalProps {
  userName: string;
  onClose: () => void;
  className?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export interface ModalContent {
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_CONTENT: ModalContent = {
  title: 'Bienvenue',
  subtitle: 'Instance Elite Scellée & Opérationnelle',
  description: 'Votre cockpit de pilotage est désormais synchronisé avec le Siège Social. Les actifs scellés et les protocoles de sécurité Matrix sont actifs.',
  ctaLabel: 'ACCÉDER AU COCKPIT',
};

const DEFAULT_AUTO_CLOSE_DELAY = 0; // Disabled by default

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Sanitize user name to prevent XSS
 */
const sanitizeUserName = (name: string): string => {
  return name
    .replace(/[<>]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .substring(0, 50); // Limit length
};

const getFirstName = (fullName: string): string => {
  const sanitized = sanitizeUserName(fullName);
  return sanitized.split(' ')[0] || 'Agent';
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function WelcomeModal({ 
  userName, 
  onClose, 
  className,
  autoClose = false,
  autoCloseDelay = DEFAULT_AUTO_CLOSE_DELAY
}: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const firstName = getFirstName(userName);

  // Focus trap and focus management
  useEffect(() => {
    // Store previous active element
    previousActiveElement.current = document.activeElement as HTMLElement;
    
    // Focus the close button when modal opens
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    return () => {
      clearTimeout(timer);
      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, []);

  // Auto-close functionality
  useEffect(() => {
    if (autoClose && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape as any);
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus trap within modal
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation
  }, [onClose]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClose();
    }
  }, [handleClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6 lg:p-8 italic font-sans animate-in fade-in duration-500"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      onKeyDown={handleKeyDown}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0" 
        onClick={handleClose}
        aria-hidden="true"
      />
      
      <article 
        ref={modalRef}
        className={cn(
          "bg-white p-6 md:p-8 lg:p-10 lg:p-12 xl:p-16 rounded-2xl md:rounded-3xl lg:rounded-[5rem] shadow-2xl max-w-sm md:max-w-md lg:max-w-xl text-center border border-slate-100 relative overflow-hidden animate-in zoom-in-95 duration-500",
          className
        )}
      >
        {/* Decorative Sparkles */}
        <Sparkles 
          className="absolute -top-4 md:-top-6 lg:-top-10 -right-4 md:-right-6 lg:-right-10 text-blue-500 opacity-10 rotate-12 w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-52 xl:h-52" 
          aria-hidden="true" 
        />

        {/* Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          onKeyDown={handleKeyDown}
          className="absolute top-3 md:top-4 lg:top-6 right-3 md:right-4 lg:right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg md:rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Fermer la fenêtre de bienvenue"
        >
          <X size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
        </button>

        {/* Rocket Icon */}
        <div 
          className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-blue-600 rounded-2xl md:rounded-3xl lg:rounded-[3rem] flex items-center justify-center text-white mx-auto mb-6 md:mb-8 lg:mb-10 shadow-xl shadow-blue-600/40 animate-bounce"
          aria-hidden="true"
        >
          <Rocket size={32} className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
        </div>

        {/* Title */}
        <h2 
          id="modal-title"
          className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-900 mb-4 md:mb-5 lg:mb-6 uppercase italic tracking-tighter leading-none"
        >
          {DEFAULT_CONTENT.title}, <br /> 
          <span className="text-blue-500">Agent {firstName}</span>
        </h2>

        {/* Status Badge */}
        <div 
          className="flex items-center justify-center gap-2 md:gap-2.5 lg:gap-3 mb-6 md:mb-8 lg:mb-10"
          role="status"
          aria-live="polite"
        >
          <ShieldCheck size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-emerald-500" aria-hidden="true" />
          <p className="text-[7px] md:text-[8px] lg:text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {DEFAULT_CONTENT.subtitle}
          </p>
        </div>

        {/* Description */}
        <p 
          id="modal-description"
          className="text-slate-600 mb-8 md:mb-10 lg:mb-12 text-[10px] md:text-sm font-bold leading-relaxed italic px-4 md:px-5 lg:px-6"
        >
          {DEFAULT_CONTENT.description}
        </p>

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleClose}
          onKeyDown={handleKeyDown}
          className="w-full bg-slate-950 text-white py-4 md:py-5 lg:py-6 lg:py-8 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black uppercase italic tracking-widest hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-2 md:gap-3 lg:gap-4 lg:gap-5 active:scale-95 border-none cursor-pointer text-[8px] md:text-[9px] lg:text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={DEFAULT_CONTENT.ctaLabel}
        >
          {DEFAULT_CONTENT.ctaLabel} 
          <ArrowRight size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
        </button>

        {/* Additional Info */}
        <div className="mt-4 md:mt-5 lg:mt-6 flex items-center justify-center gap-1.5 md:gap-2">
          <CheckCircle2 size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-500" aria-hidden="true" />
          <p className="text-[6px] md:text-[7px] lg:text-[8px] font-black text-slate-400 uppercase tracking-widest">
            Protocole de sécurité Matrix actif
          </p>
        </div>
      </article>
    </div>
  );
}