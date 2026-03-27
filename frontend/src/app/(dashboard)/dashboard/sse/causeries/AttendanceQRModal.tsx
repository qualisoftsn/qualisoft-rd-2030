/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : ATTENDANCE QR KERNEL (ISO 45001 §7.3)
 * RÔLE : Preuve numérique d'implication (QR Modal)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, useEffect, useCallback, useMemo, KeyboardEvent } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, ShieldCheck, RefreshCw, Loader2, Smartphone, Copy, Fingerprint, Info, Lock, AlertCircle } from 'lucide-react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface AttendanceQRModalProps {
  causerieId: string;
  theme: string;
  onClose: () => void;
}

export interface TokenData {
  token: string;
  expiresAt?: string;
}

export interface LoadingStateProps {
  label: string;
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function AttendanceQRModal({ causerieId, theme, onClose }: AttendanceQRModalProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const generateToken = useCallback(async () => {
    setLoading(true);
    const toastId = toast.loading("Génération du jeton SDE...");
    try {
      const res = await apiClient.post<TokenData>(`/causeries/${causerieId}/generate-token`);
      const data = res.data?.data || res.data;
      setToken(data.token || null);
      toast.success("JETON ACTUALISÉ", { id: toastId });
    } catch (error) {
      console.error('❌ Erreur génération token:', error);
      toast.error("ÉCHEC DE CHIFFREMENT KERNEL", { id: toastId });
    } finally {
      setLoading(false);
    }
  }, [causerieId]);

  useEffect(() => { 
    if (typeof window !== 'undefined') {
      generateToken(); 
    }
  }, [generateToken]);

  const attendanceUrl = useMemo(() => {
    if (typeof window === 'undefined' || !token) return '';
    return `${window.location.origin}/mobile/check-in?token=${token}`;
  }, [token]);

  const copyToClipboard = async () => {
    if (!attendanceUrl) return;
    
    try {
      await navigator.clipboard.writeText(attendanceUrl);
      setCopySuccess(true);
      toast.success("URL COPIÉE AU PRESSE-PAPIER");
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      toast.error("Échec de la copie");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Close on Escape
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape as any);
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-[#0B0F1A]/95 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 lg:p-8 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      <div 
        className="absolute inset-0" 
        onClick={onClose} 
        aria-hidden="true"
      />
      
      <article className="relative bg-white w-full max-w-xl rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-6 md:p-8 lg:p-12 flex flex-col items-center text-center shadow-[0_0_100px_rgba(37,99,235,0.3)] animate-in zoom-in-95 duration-500 border-none italic font-black my-auto overflow-hidden" role="document">
        
        <Fingerprint 
          size={200} 
          className="absolute -top-10 md:-top-16 lg:-top-20 -right-10 md:-right-16 lg:-right-20 w-[150px] h-[150px] md:w-[200px] md:h-[200px] lg:w-[300px] lg:h-[300px] text-slate-100 opacity-50 pointer-events-none" 
          aria-hidden="true" 
        />

        <button 
          type="button"
          onClick={onClose} 
          className="absolute top-4 md:top-6 lg:top-8 right-4 md:right-6 lg:right-8 p-2 md:p-3 bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl md:rounded-2xl transition-all border-none cursor-pointer z-50 active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Fermer"
        >
          <X size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" strokeWidth={3} aria-hidden="true" />
        </button>

        <header className="mb-6 md:mb-8 lg:mb-10 relative z-10 w-full">
          <div className="bg-blue-600 p-3 md:p-4 rounded-2xl md:rounded-3xl inline-block mb-4 md:mb-6 shadow-xl shadow-blue-600/30 animate-pulse" aria-hidden="true">
            <ShieldCheck size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" />
          </div>
          <h2 id="modal-title" className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none m-0">
            Émargement <span className="text-blue-600">Certifié</span>
          </h2>
          <div className="flex items-center justify-center gap-1.5 md:gap-2 mt-3 md:mt-4 text-slate-400">
             <Lock size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-500" aria-hidden="true" />
             <p className="text-[8px] md:text-[9px] lg:text-[10px] uppercase tracking-widest m-0 font-black">SDE Secure Token Protocol</p>
          </div>
          <p className="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase italic tracking-wider mt-6 md:mt-8 border-t border-slate-100 pt-4 md:pt-6 line-clamp-2 px-4 md:px-6">
            {theme}
          </p>
        </header>

        <div 
          className="relative p-4 md:p-6 bg-slate-50 rounded-2xl md:rounded-3xl lg:rounded-[3rem] border-4 border-dashed border-slate-200 shadow-inner flex flex-col items-center justify-center aspect-square w-full max-w-64 md:max-w-72 z-10 group transition-all hover:border-blue-500/30 focus-within:border-blue-500/30"
          role="img"
          aria-label="QR Code pour émargement"
          tabIndex={0}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-3 md:gap-4" role="status" aria-live="polite">
              <Loader2 size={32} className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 animate-spin text-blue-600" aria-hidden="true" />
              <span className="text-[9px] md:text-[10px] font-black text-blue-600 tracking-widest animate-pulse uppercase">Matrix Sync...</span>
            </div>
          ) : token ? (
            <div className="p-3 md:p-4 bg-white rounded-2xl md:rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-500 border-4 md:border-8 border-white">
              <QRCodeSVG 
                value={attendanceUrl} 
                size={180} 
                level="H" 
                includeMargin={false} 
                className="w-[180px] h-[180px] md:w-[200px] md:h-[200px] lg:w-[220px] lg:h-[220px]"
                aria-label={`QR Code pour ${theme}`}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 md:gap-4 text-slate-400" role="status">
              <AlertCircle size={32} className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10" aria-hidden="true" />
              <span className="text-[9px] md:text-[10px] font-black tracking-widest uppercase">Échec génération QR</span>
            </div>
          )}
        </div>

        <div className="mt-6 md:mt-8 lg:mt-10 space-y-4 md:space-y-5 lg:space-y-6 w-full z-10">
          <article className="flex items-center justify-center gap-3 md:gap-4 text-slate-900 bg-blue-50/80 py-4 md:py-5 px-6 md:px-8 rounded-2xl md:rounded-3xl border border-blue-100 shadow-sm">
            <Smartphone size={20} className="w-5 h-5 md:w-6 md:h-6 text-blue-600 animate-bounce" aria-hidden="true" />
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic leading-tight text-left m-0">
              Flashez pour signer <br/>la présence au registre
            </p>
          </article>
          
          <div className="flex items-center justify-center gap-4 md:gap-6 lg:gap-8 pt-3 md:pt-4" role="group" aria-label="Actions QR">
            <button 
              type="button"
              onClick={generateToken} 
              disabled={loading} 
              className={cn(
                "flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase italic border-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1",
                loading && "opacity-30 cursor-not-allowed"
              )}
              aria-busy={loading}
              aria-label="Actualiser le QR code"
            >
              <RefreshCw size={14} className={cn("w-3.5 h-3.5 md:w-4 md:h-4", loading ? 'animate-spin' : '')} aria-hidden="true" /> 
              Actualiser
            </button>
            <button 
              type="button"
              onClick={copyToClipboard} 
              disabled={!token} 
              className={cn(
                "flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black transition-colors uppercase italic border-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1",
                copySuccess ? "text-emerald-600" : "text-slate-400 hover:text-slate-900",
                !token && "opacity-30 cursor-not-allowed"
              )}
              aria-label="Copier le lien d'émargement"
              aria-disabled={!token}
            >
              <Copy size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
              {copySuccess ? 'Copié !' : 'Copier le lien'}
            </button>
          </div>
        </div>

        <footer className="mt-8 md:mt-10 lg:mt-12 pt-6 md:pt-8 border-t border-slate-100 w-full z-10 opacity-50" role="contentinfo">
          <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest italic m-0">
            Conformité §7.3 ISO 45001 • Qualisoft 2026
          </p>
        </footer>
      </article>
    </div>
  );
}