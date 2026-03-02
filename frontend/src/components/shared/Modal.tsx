/**
 * 📦 MODULE : Modal.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Isolation transactionnelle pour les formulaires de saisie.
 * PHILOSOPHIE : Design Elite, focalisation maximale sur le flux métier.
 * RÉVISION : 02 Mars 2026 | 19:10 GMT
 */

"use client";

import React, { useEffect } from 'react';
import { X, ShieldCheck, Fingerprint } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // ⌨️ ACCESSIBILITÉ : Fermeture via la touche Échap
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl p-6 italic font-sans animate-in fade-in duration-500">
      
      {/* OVERLAY DE SÉCURITÉ CLIC-DEHORS */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-white w-full max-w-3xl rounded-[4rem] shadow-4xl overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100 relative z-10">
        
        {/* HEADER ELITE RD-2026 */}
        <header className="flex items-center justify-between p-12 border-b border-slate-50 bg-slate-50/50 relative overflow-hidden">
          <Fingerprint className="absolute -left-4 -bottom-4 text-slate-200 opacity-20 rotate-12" size={120} />
          
          <div className="flex items-center gap-6 relative z-10">
             <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-3xl shadow-blue-500/30">
                <ShieldCheck size={28} />
             </div>
             <div className="text-left leading-none">
                <h3 className="text-3xl font-black uppercase text-slate-900 tracking-tighter m-0">
                  {title}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 m-0">Matrix Environment Secure Access</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-4 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-2xl transition-all shadow-sm border-none cursor-pointer relative z-10"
          >
            <X size={28} />
          </button>
        </header>

        {/* BODY SCELLÉ : Zone de travail focalisée */}
        <div className="p-12 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
        
        {/* FOOTER SUBTIIL */}
        <footer className="px-12 py-6 bg-slate-50/50 border-t border-slate-50 flex justify-center">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em] m-0 italic">
              Qualisoft SDE Kernel Core • Sessions Scellée
            </p>
        </footer>
      </div>
    </div>
  );
}