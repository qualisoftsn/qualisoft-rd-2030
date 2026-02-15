/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { ShieldCheck, User } from 'lucide-react';

interface SignatureViewerProps {
  participant: {
    U_FirstName: string;
    U_LastName: string;
    signatureHash?: string; // Le hash SHA-256 stocké
    signatureImage?: string; // L'image en Base64 ou URL
  };
}

export default function SignatureViewer({ participant }: SignatureViewerProps) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 rounded-full">
          <User size={16} className="text-blue-400" />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase text-white">
            {participant.U_FirstName} {participant.U_LastName}
          </p>
          <p className="text-[8px] font-mono text-slate-500 tracking-tighter">
            HASH: {participant.signatureHash?.substring(0, 16) || 'CERTIFIÉ_SMI'}...
          </p>
        </div>
      </div>

      {/* Affichage de la signature capturée */}
      <div className="relative">
        {participant.signatureImage ? (
          <img 
            src={participant.signatureImage} 
            alt="Signature" 
            className="h-10 w-20 object-contain bg-white/80 rounded-lg p-1 grayscale hover:grayscale-0 transition-all"
          />
        ) : (
          <div className="h-10 w-20 flex items-center justify-center border border-dashed border-white/20 rounded-lg">
            <span className="text-[7px] text-slate-600">EN ATTENTE</span>
          </div>
        )}
        <div className="absolute -top-1 -right-1">
          <ShieldCheck size={14} className="text-emerald-500 fill-[#0B0F1A]" />
        </div>
      </div>
    </div>
  );
}