/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🔄 MODULE : TenantSwitcher (Multi-Tenant Navigation)
 * RÔLE : Commutation instantanée entre instances organisationnelles
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, useEffect, KeyboardEvent, useRef } from 'react';
import { Building2, ChevronDown, CheckCircle2, ShieldCheck } from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export interface TenantData {
  id: string;
  name: string;
  color: string;
  domain?: string;
}

export interface TenantSwitcherProps {
  currentTenant: string;
  onSwitch: (tenantId: string) => void;
  tenants?: TenantData[];
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_TENANTS: TenantData[] = [
  { id: 'QUALI', name: 'Qualisoft Corporate', color: 'bg-blue-600' },
  { id: 'SENELEC', name: 'SENELEC SA', color: 'bg-yellow-500' },
  { id: 'PAD', name: 'Port de Dakar', color: 'bg-emerald-500' }
];

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function TenantSwitcher({ currentTenant, onSwitch, tenants = DEFAULT_TENANTS }: TenantSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const active = tenants.find(t => t.id === currentTenant);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape as any);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape as any);
    };
  }, [isOpen]);

  const handleSwitch = (tenantId: string) => {
    onSwitch(tenantId);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown();
    }
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
    if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      // Focus first option
      const firstOption = document.querySelector('[role="option"]') as HTMLElement;
      firstOption?.focus();
    }
  };

  const handleOptionKeyDown = (e: KeyboardEvent<HTMLButtonElement>, tenantId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSwitch(tenantId);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      // Navigate between options
      const options = Array.from(document.querySelectorAll('[role="option"]')) as HTMLElement[];
      const currentIndex = options.findIndex(opt => opt === e.currentTarget);
      let nextIndex = e.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1;
      
      if (nextIndex < 0) nextIndex = options.length - 1;
      if (nextIndex >= options.length) nextIndex = 0;
      
      options[nextIndex]?.focus();
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center gap-3 md:gap-4 lg:gap-5 px-4 md:px-5 lg:px-6 py-3 md:py-4 bg-[#0F172A] border border-white/5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] w-full md:w-64 lg:w-80 shadow-xl animate-pulse">
        <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl bg-slate-700 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="h-2 md:h-2.5 bg-slate-700 rounded mb-1.5 md:mb-2 w-20" />
          <div className="h-3 md:h-3.5 bg-slate-700 rounded w-32" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative italic font-sans text-left shrink-0" 
      ref={dropdownRef}
      role="navigation" 
      aria-label="Sélecteur de tenant"
    >
      <button 
        type="button"
        className={cn(
          "flex items-center gap-3 md:gap-4 lg:gap-5 px-4 md:px-5 lg:px-6 py-3 md:py-4 bg-[#0F172A] border border-white/5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] hover:border-blue-600 transition-all cursor-pointer w-full md:w-64 lg:w-80 shadow-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-400",
          isOpen && "border-blue-600"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Tenant actuel: ${active?.name || 'Choisir Instance'}`}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
      >
        <div className={cn(
          "w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-xl border border-white/10 shrink-0",
          active?.color || 'bg-slate-800'
        )}>
          <Building2 size={16} className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1 md:mb-1.5 lg:mb-2 italic flex items-center gap-1 md:gap-1.5 lg:gap-2 m-0">
            <ShieldCheck size={10} className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-400" aria-hidden="true" /> 
            <span className="hidden sm:inline">Instance Active</span>
            <span className="sm:hidden">Instance</span>
          </p>
          <p className="text-[11px] md:text-[12px] lg:text-[13px] font-black text-white uppercase tracking-tighter truncate m-0 italic leading-none">
            {active?.name || "Choisir Instance..."}
          </p>
        </div>
        <ChevronDown 
          size={16} 
          className={cn(
            "w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-slate-600 transition-transform shrink-0",
            isOpen && "rotate-180"
          )} 
          aria-hidden="true" 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div 
            className="absolute top-full left-0 mt-1 md:mt-1.5 lg:mt-2 w-full md:w-64 lg:w-80 bg-white rounded-xl md:rounded-2xl lg:rounded-[2.5rem] shadow-2xl opacity-100 visible translate-y-0 transition-all z-50 p-3 md:p-4 border border-slate-100"
            role="listbox"
            aria-label="Liste des tenants disponibles"
          >
            <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest p-3 md:p-4 border-b border-slate-50 mb-2 md:mb-3 italic m-0">
              Infrastructures Déployées
            </p>
            <div className="space-y-1" role="list">
              {tenants.map((t) => (
                <button 
                  key={t.id} 
                  type="button"
                  onClick={() => handleSwitch(t.id)}
                  onKeyDown={(e) => handleOptionKeyDown(e, t.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 md:p-4 rounded-lg md:rounded-xl transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
                    currentTenant === t.id 
                      ? 'bg-blue-50 text-blue-900' 
                      : 'bg-transparent text-slate-600 hover:bg-slate-50'
                  )}
                  role="option"
                  aria-selected={currentTenant === t.id}
                  aria-label={`Basculer vers ${t.name}`}
                  tabIndex={0}
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className={cn(
                      "w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0",
                      t.color,
                      currentTenant === t.id && 'animate-pulse'
                    )} aria-hidden="true" />
                    <span className="text-[10px] md:text-[11px] font-black uppercase italic truncate">
                      {t.name}
                    </span>
                  </div>
                  {currentTenant === t.id && (
                    <CheckCircle2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600 shrink-0" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-3 md:mt-4 p-3 md:p-4 bg-slate-50 rounded-lg md:rounded-xl flex items-center gap-2 md:gap-3">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-600" aria-hidden="true" />
              <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest italic m-0 leading-none">
                <span className="hidden sm:inline">Sovereign Tenant Isolation</span>
                <span className="sm:hidden">Isolation</span>
              </p>
            </div>
          </div>

          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        </>
      )}
    </div>
  );
}