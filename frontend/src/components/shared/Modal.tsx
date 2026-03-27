/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📦 MODULE : Modal (Transactional Isolation Container)
 * RÔLE : Isolation transactionnelle pour les formulaires de saisie
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité + Focus Trap
 */

import React, { useEffect, useCallback, useRef, KeyboardEvent, MouseEvent } from 'react';
import { X, ShieldCheck, Fingerprint, AlertCircle } from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  trapFocus?: boolean;
  ariaLabel?: string;
  className?: string;
}

export interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const SIZE_CONFIG: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] md:max-w-[90vw]',
};

const DEFAULT_SIZE: NonNullable<ModalProps['size']> = 'lg';

// ============================================================================
// SOUS-COMPOSANT : MODAL HEADER
// ============================================================================

function ModalHeader({ title, subtitle, onClose }: ModalHeaderProps) {
  return (
    <header 
      className="flex items-center justify-between p-4 md:p-6 lg:p-8 xl:p-10 lg:p-12 border-b border-slate-100 bg-slate-50/50 relative overflow-hidden shrink-0"
      role="banner"
    >
      <Fingerprint 
        className="absolute -left-2 md:-left-4 -bottom-2 md:-bottom-4 text-slate-200 opacity-20 rotate-12 w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28" 
        aria-hidden="true" 
      />
      
      <div className="flex items-center gap-3 md:gap-4 lg:gap-6 relative z-10">
        <div 
          className="p-2 md:p-3 lg:p-4 bg-blue-600 rounded-lg md:rounded-xl lg:rounded-2xl text-white shadow-xl shadow-blue-500/30 shrink-0"
          aria-hidden="true"
        >
          <ShieldCheck size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
        </div>
        <div className="text-left leading-none min-w-0">
          <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-black uppercase text-slate-900 tracking-tighter m-0 truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[7px] md:text-[8px] lg:text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 md:mt-1.5 lg:mt-2 lg:mt-3 m-0">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <button 
        type="button"
        onClick={onClose}
        className="p-2 md:p-3 lg:p-4 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-lg md:rounded-xl lg:rounded-2xl transition-all shadow-sm border-none cursor-pointer relative z-10 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
        aria-label="Fermer la modale"
      >
        <X size={16} className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" aria-hidden="true" />
      </button>
    </header>
  );
}

// ============================================================================
// SOUS-COMPOSANT : MODAL FOOTER
// ============================================================================

function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <footer 
      className={cn(
        "px-4 md:px-6 lg:px-8 xl:px-10 lg:px-12 py-3 md:py-4 lg:py-5 lg:py-6 bg-slate-50/50 border-t border-slate-100 flex justify-center shrink-0",
        className
      )}
      role="contentinfo"
    >
      <p className="text-[6px] md:text-[7px] lg:text-[8px] font-black text-slate-300 uppercase tracking-widest m-0 italic">
        Qualisoft SDE Kernel Core • Session Scellée
      </p>
    </footer>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle = "Matrix Environment Secure Access",
  children,
  footer,
  size = DEFAULT_SIZE,
  closeOnOverlay = true,
  closeOnEscape = true,
  trapFocus = true,
  ariaLabel,
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  // Get focusable elements
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');
    
    return Array.from(modalRef.current.querySelectorAll<HTMLElement>(focusableSelectors));
  }, []);

  // Trap focus inside modal
  const handleTabKey = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (!trapFocus || e.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

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
  }, [trapFocus, getFocusableElements]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (closeOnEscape && e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    handleTabKey(e);
  }, [closeOnEscape, onClose, handleTabKey]);

  // Handle overlay click
  const handleOverlayClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose();
    }
  }, [closeOnOverlay, onClose]);

  // Manage focus and scroll lock
  useEffect(() => {
    if (isOpen) {
      // Store previous active element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
      
      // Focus first focusable element or modal itself
      setTimeout(() => {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          modalRef.current?.focus();
        }
      }, 0);
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen, getFocusableElements]);

  // Handle escape key globally
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc as any);
    return () => document.removeEventListener('keydown', handleEsc as any);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 md:p-6 italic font-sans animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={subtitle ? 'modal-subtitle' : undefined}
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0" 
        aria-hidden="true"
      />

      <div 
        ref={modalRef}
        className={cn(
          "bg-white w-full rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 relative z-10 max-h-[90vh] flex flex-col focus:outline-none",
          SIZE_CONFIG[size],
          className
        )}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <ModalHeader 
          title={title} 
          subtitle={subtitle} 
          onClose={onClose} 
        />

        {/* BODY: Zone de travail focalisée */}
        <div 
          className="p-4 md:p-6 lg:p-8 xl:p-10 lg:p-12 max-h-[60vh] md:max-h-[65vh] lg:max-h-[70vh] overflow-y-auto custom-scrollbar flex-1"
          role="document"
        >
          {children}
        </div>
        
        {/* FOOTER */}
        {footer ? (
          <ModalFooter className={typeof footer === 'string' ? undefined : 'hidden'}>
            {typeof footer === 'string' ? footer : null}
          </ModalFooter>
        ) : (
          <ModalFooter />
        )}
      </div>
    </div>
  );
}