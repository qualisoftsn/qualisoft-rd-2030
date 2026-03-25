/**
 * 🖋️ MODULE : src/components/causeries/SignatureViewer.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Affichage et authentification de la signature participant.
 * RÔLE : Preuve de présence aux causeries sécurité (ISO 45001 & 9001).
 * DESIGN : Elite SDE - High Density / Sovereign UI.
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 18:25 GMT
 */

"use client";

import React from 'react';
import { ShieldCheck, User, Fingerprint, Lock } from 'lucide-react';

interface SignatureViewerProps {
  participant: {
    U_FirstName: string;
    U_LastName: string;
    signatureHash?: string; // Empreinte numérique unique du scellage
    signatureImage?: string; // Base64 ou URL de la signature manuscrite
  };
}

export default function SignatureViewer({ participant }: SignatureViewerProps) {
  
  // Génération d'un ID de scellage visuel si le hash est absent
  const sealId = participant.signatureHash 
    ? participant.signatureHash.substring(0, 14).toUpperCase() 
    : "SDE-PENDING-2026";

  return (
    <div className="bg-[#0F172A]/40 border border-white/5 p-5 rounded-4xl flex items-center justify-between group hover:bg-[#0F172A] hover:border-blue-500/30 transition-all duration-500 italic font-sans relative overflow-hidden">
      
      {/* 🧬 BACKGROUND GLOW (Subtil) */}
      <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-blue-600/5 blur-3xl rounded-full pointer-events-none" />

      {/* 👤 IDENTITÉ DE L'AGENT */}
      <div className="flex items-center gap-5 relative z-10">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl group-hover:bg-blue-600 group-hover:border-blue-400 transition-all duration-500">
          <User size={20} className="text-blue-500 group-hover:text-white" />
        </div>
        
        <div className="text-left leading-none">
          <p className="text-[12px] font-black uppercase italic tracking-tighter text-white m-0">
            {participant.U_FirstName} {participant.U_LastName}
          </p>
          <div className="flex items-center gap-2 mt-2 opacity-40 group-hover:opacity-100 transition-opacity">
            <Fingerprint size={12} className="text-blue-500" />
            <p className="text-[8px] font-mono font-black text-slate-400 tracking-widest uppercase m-0">
              HASH: {sealId}
            </p>
          </div>
        </div>
      </div>

      {/* 🖋️ ZONE DE PREUVE DIGITALE */}
      <div className="flex items-center gap-6 relative z-10">
        <div className="flex-col items-end gap-1 mr-2 hidden md:flex">
          <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.3em]">Status</span>
          <span className={`text-[8px] font-black uppercase italic ${participant.signatureImage ? 'text-emerald-500' : 'text-amber-600'}`}>
            {participant.signatureImage ? 'Scellé Matrix' : 'Attente Signature'}
          </span>
        </div>

        <div className="relative group/sig">
          {participant.signatureImage ? (
            <div className="bg-white rounded-2xl p-1.5 shadow-2xl ring-1 ring-white/20 group-hover/sig:scale-110 transition-transform duration-500 cursor-zoom-in">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={participant.signatureImage} 
                alt="Signature Agent" 
                className="h-10 w-28 object-contain grayscale hover:grayscale-0 transition-all duration-700 contrast-150"
              />
            </div>
          ) : (
            <div className="h-12 w-28 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-black/40 group-hover:border-blue-500/20 transition-colors">
              <Lock size={14} className="text-slate-800 mb-1" />
              <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest italic">Wait Sync</span>
            </div>
          )}
          
          {/* 🛡️ BADGE DE CERTIFICATION SDE */}
          <div className={`absolute -top-2 -right-2 rounded-full p-1 shadow-lg border-2 border-[#0B0F1A] transition-all duration-500 ${
            participant.signatureImage 
              ? "bg-emerald-500 text-white scale-110" 
              : "bg-slate-800 text-slate-600 scale-100"
          }`}>
            <ShieldCheck size={14} strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* INDICATION DE VALIDITÉ ISO BAS DE CARTE */}
      {participant.signatureImage && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-emerald-500/50 to-transparent" />
      )}
    </div>
  );
}
