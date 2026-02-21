//* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📱 MODULE : ATTENDANCE QR MODAL (ÉMARGEMENT CRYPTOGRAPHIQUE)
 * -------------------------------------------------------------------------
 * FONCTION : Génération d'un QR Code pour la signature numérique de présence.
 * RÔLE : Prouver la participation aux causeries SSE (ISO 45001 §7.3).
 * ISOLATION : Le jeton JWT généré est strictement scellé au TenantId actif. 
 * Un flash depuis un autre sous-domaine rejettera la transaction.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, ShieldCheck, RefreshCw, Loader2, Smartphone, Copy, Fingerprint } from 'lucide-react';
import apiClient from '@/core/api/api-client'; // 🛡️ Intercepteur scellé
import { toast } from 'react-hot-toast';

interface AttendanceQRModalProps {
  causerieId: string;
  theme: string;
  onClose: () => void;
}

export default function AttendanceQRModal({ causerieId, theme, onClose }: AttendanceQRModalProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 🔐 GÉNÉRATION DU JETON SCELLÉ
   * Demande au Kernel Matrix un jeton à usage unique ou temporaire.
   * Le backend lie ce jeton à la Causerie ET au TenantId de l'organisation.
   */
  const generateToken = useCallback(async () => {
    try {
      setLoading(true);
      // Le header x-tenant-id est automatiquement injecté par apiClient
      const res = await apiClient.post(`/causeries/${causerieId}/generate-token`);
      setToken(res.data.token);
    } catch (e) {
      console.error("Qualisoft Kernel : Échec de la génération cryptographique.", e);
      toast.error("REJET : Impossible de générer le jeton de présence.");
    } finally {
      setLoading(false);
    }
  }, [causerieId]);

  useEffect(() => {
    generateToken();
  }, [generateToken]);

  /**
   * 🌍 ROUTAGE SOUVERAIN
   * On utilise window.location.origin pour garantir que le scan mobile 
   * renvoie vers le sous-domaine exact du client (ex: https://senelec.qualisoft.sn/...)
   */
  const attendanceUrl = typeof window !== 'undefined' && token
    ? `${window.location.origin}/mobile/check-in?token=${token}`
    : '';

  const copyToClipboard = () => {
    if (!attendanceUrl) return;
    navigator.clipboard.writeText(attendanceUrl);
    toast.success("LIEN CRYPTÉ COPIÉ DANS LE PRESSE-PAPIER");
  };

  return (
    <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-2xl z-600 flex items-center justify-center p-6 italic font-sans animate-in fade-in duration-500">
      
      {/* 🛡️ CONTENEUR PRINCIPAL ELITE */}
      <div className="bg-white w-full max-w-xl rounded-[4rem] p-16 flex flex-col items-center text-center shadow-[0_0_150px_rgba(37,99,235,0.15)] animate-in zoom-in-95 duration-700 relative border border-slate-100 overflow-hidden">
        
        {/* Décoration Matrix de fond */}
        <Fingerprint size={300} className="absolute -top-20 -right-20 text-slate-50 opacity-50 pointer-events-none" />

        {/* ❌ BOUTON FERMETURE */}
        <button 
          onClick={onClose} 
          className="absolute top-10 right-10 p-4 bg-slate-50 border border-slate-100 rounded-full text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-90 cursor-pointer z-10 shadow-sm"
        >
          <X size={24} />
        </button>

        {/* 🏷️ HEADER D'ÉMARGEMENT */}
        <div className="mb-12 relative z-10 w-full">
          <div className="bg-blue-600 p-5 rounded-3xl inline-block mb-8 shadow-2xl shadow-blue-600/30 animate-pulse">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h2 className="text-4xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">
            Émargement <br/><span className="text-blue-600">Certifié</span>
          </h2>
          <div className="w-16 h-1.5 bg-blue-600 rounded-full mx-auto mt-6 mb-4" />
          <p className="text-[11px] text-slate-500 font-black uppercase italic tracking-[0.3em] px-8 leading-relaxed">
            {theme}
          </p>
        </div>

        {/* 🔲 ZONE QR CODE SÉCURISÉE (Fond blanc impératif pour lisibilité optique) */}
        <div className="relative p-10 bg-slate-50 rounded-[3rem] border-4 border-slate-100 shadow-inner flex flex-col items-center justify-center min-h-87.5 w-full max-w-sm z-10 group transition-all hover:border-blue-500/30">
          {loading || !token ? (
            <div className="flex flex-col items-center gap-6">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <span className="text-[10px] font-black text-blue-600 tracking-[0.5em] animate-pulse uppercase italic">
                Chiffrement Matrix...
              </span>
            </div>
          ) : (
            <div className="p-6 bg-white rounded-4xl shadow-2xl group-hover:scale-105 transition-transform duration-500 border border-slate-50">
              <QRCodeSVG 
                value={attendanceUrl} 
                size={220}
                level="H" // High error correction level for reliable scanning
                includeMargin={false}
              />
            </div>
          )}
        </div>

        {/* 📱 INSTRUCTIONS D'OPÉRATION */}
        <div className="mt-12 space-y-6 w-full z-10">
          <div className="flex items-center justify-center gap-4 text-slate-900 bg-blue-50/50 py-4 rounded-2xl border border-blue-100/50">
            <Smartphone size={24} className="text-blue-600 animate-bounce" />
            <p className="text-[11px] font-black uppercase tracking-widest italic leading-tight text-left">
              Flashez ce code pour signer <br/>la présence numérique au registre
            </p>
          </div>
          
          {/* ACTIONS SECONDAIRES */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <button 
              onClick={generateToken}
              disabled={loading}
              className="flex items-center gap-2 text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase italic disabled:opacity-50 border-none bg-transparent cursor-pointer"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> 
              Renouveler le jeton
            </button>
            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
            <button 
              onClick={copyToClipboard}
              disabled={!token}
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase italic border-none bg-transparent cursor-pointer disabled:opacity-50"
            >
              <Copy size={16} /> 
              Copier l&apos;URL d&apos;accès
            </button>
          </div>
        </div>

        {/* 📜 CERTIFICATION NORMATIVE (FOOTER) */}
        <div className="mt-12 pt-8 border-t border-slate-100 w-full z-10">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none flex items-center justify-center gap-2">
             <ShieldCheck size={12} />
             SMI QUALISOFT RD 2026 • PREUVE D&apos;IMPLICATION §7.3
           </p>
        </div>
      </div>
    </div>
  );
}