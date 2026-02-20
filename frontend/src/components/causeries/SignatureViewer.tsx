/* eslint-disable @next/next/no-img-element */
//* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🖋️ MODULE : SignatureViewer
 * -------------------------------------------------------------------------
 * FONCTION : Affichage et vérification de la signature d'un participant.
 * RÔLE : Preuve de participation aux causeries sécurité (HSE/SMI).
 * CONFORMITÉ : ISO 9001 & 45001 (Preuve de sensibilisation).
 */

'use client';

import React from 'react';
import { ShieldCheck, User, Fingerprint } from 'lucide-react';

interface SignatureViewerProps {
  participant: {
    U_FirstName: string;
    U_LastName: string;
    signatureHash?: string; 
    signatureImage?: string; 
  };
}

export default function SignatureViewer({ participant }: SignatureViewerProps) {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center justify-between group hover:bg-white/10 hover:border-blue-500/30 transition-all duration-500">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/20">
          <User size={18} className="text-blue-400" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-black uppercase italic tracking-tight text-white leading-none">
            {participant.U_FirstName} {participant.U_LastName}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <Fingerprint size={10} className="text-slate-600" />
            <p className="text-[8px] font-mono text-slate-500 tracking-tighter uppercase">
              ID: {participant.signatureHash?.substring(0, 16) || 'SCELLEMENT_SMI'}...
            </p>
          </div>
        </div>
      </div>

      {/* ZONE DE CAPTURE DE SIGNATURE */}
      <div className="relative">
        {participant.signatureImage ? (
          <div className="bg-white rounded-xl p-1 shadow-inner ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-500">
            <img 
              src={participant.signatureImage} 
              alt="Preuve Digitale" 
              className="h-10 w-24 object-contain grayscale hover:grayscale-0 transition-all contrast-125"
            />
          </div>
        ) : (
          <div className="h-10 w-24 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-black/20">
            <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">Wait Sign</span>
          </div>
        )}
        
        {/* Badge de Certification Matrix */}
        <div className="absolute -top-2 -right-2 bg-[#0B0F1A] rounded-full p-0.5">
          <ShieldCheck size={16} className={participant.signatureImage ? "text-emerald-500" : "text-slate-700"} />
        </div>
      </div>
    </div>
  );
}