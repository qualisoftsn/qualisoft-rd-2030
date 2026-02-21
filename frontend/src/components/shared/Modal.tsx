"use client";
/**
 * 📦 MODULE : MODAL (CONTENEUR SOUVERAIN)
 * -------------------------------------------------------------------------
 * FONCTION : Encapsulation des formulaires de saisie (§7.5).
 * RÔLE : Fournir une interface isolée et focalisée pour les transactions SMI.
 * PHILOSOPHIE : Design Elite, fondations Matrix, typographie Black-Italic.
 */

import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-xl p-6 italic font-sans animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100">
        
        {/* HEADER ELITE */}
        <div className="flex items-center justify-between p-10 border-b border-slate-50 bg-slate-50/50">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                <ShieldCheck size={24} />
             </div>
             <div>
                <h3 className="text-2xl font-black italic uppercase text-slate-900 tracking-tighter leading-none">
                  {title}
                </h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Matrix Environment Access</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-4 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all text-slate-400 hover:text-slate-900 border-none cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* BODY SCELLÉ */}
        <div className="p-10 max-h-[85vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}