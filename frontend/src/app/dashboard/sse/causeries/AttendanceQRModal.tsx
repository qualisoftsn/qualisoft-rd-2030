/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : ATTENDANCE QR KERNEL (SDE SÉCURISÉ)
 * -------------------------------------------------------------------------
 * RÔLE : Preuve numérique d'implication et de sensibilisation (QR Modal).
 * RÉFÉRENTIEL : ISO 45001 §7.3 Sensibilisation.
 * ARCHITECTURE : Jeton de session scellé généré dynamiquement.
 * DATE DE RÉVISION : 02 Mars 2026 | 14:58 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, ShieldCheck, RefreshCw, Loader2, Smartphone, 
  Copy, Fingerprint, Info, Lock 
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast } from 'sonner';

interface AttendanceQRModalProps {
  causerieId: string;
  theme: string;
  onClose: () => void;
}

export default function AttendanceQRModal({ causerieId, theme, onClose }: AttendanceQRModalProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * 🔐 GÉNÉRATION DU JETON MATRICE
   * Liaison cryptographique entre la Causerie et l'instance Client.
   */
  const generateToken = useCallback(async () => {
    setLoading(true);
    const tid = toast.loading("Génération du jeton crypté...");
    try {
      const res = await apiClient.post(`/causeries/${causerieId}/generate-token`);
      const data = res.data?.data || res.data;
      setToken(data.token);
      toast.success("JETON SDE ACTUALISÉ", { id: tid });
    } catch (e) {
      toast.error("ÉCHEC DE CHIFFREMENT KERNEL", { id: tid });
    } finally {
      setLoading(false);
    }
  }, [causerieId]);

  useEffect(() => {
    generateToken();
  }, [generateToken]);

  /**
   * 🌍 ROUTAGE SOUVERAIN (Lien pour Web Mobile / Scanner)
   */
  const attendanceUrl = useMemo(() => {
    if (typeof window === 'undefined' || !token) return '';
    return `${window.location.origin}/mobile/check-in?token=${token}`;
  }, [token]);

  const copyToClipboard = () => {
    if (!attendanceUrl) return;
    navigator.clipboard.writeText(attendanceUrl);
    toast.success("URL DE PRÉSENCE COPIÉE");
  };

  return (
    <div className="fixed inset-0 bg-[#0B0F1A]/95 backdrop-blur-2xl z-1000 flex items-center justify-center p-4 lg:p-6 overflow-y-auto">
      <div className="absolute inset-0 transition-opacity" onClick={onClose} />
      
      {/* 🛡️ MODAL SDE PRINCIPALE */}
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] lg:rounded-[3.5rem] p-6 lg:p-10 flex flex-col items-center text-center shadow-[0_0_80px_rgba(37,99,235,0.2)] animate-in zoom-in-95 duration-500 relative border border-white overflow-hidden italic font-black my-auto">
        
        {/* Décoration de fond filigrane */}
        <Fingerprint size={200} className="absolute -top-10 -right-10 text-slate-100 opacity-60 pointer-events-none lg:w-70 lg:h-70 lg:-top-16 lg:-right-16" />

        {/* ❌ FERMETURE */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 lg:top-8 lg:right-8 p-2 lg:p-3 bg-slate-50 border-none rounded-xl lg:rounded-2xl text-slate-400 hover:text-red-600 transition-all cursor-pointer z-50 shadow-sm active:scale-90"
        >
          <X size={20} strokeWidth={3} className="lg:w-6 lg:h-6" />
        </button>

        {/* 🏷️ HEADER ÉLITE */}
        <header className="mb-6 lg:mb-8 relative z-10 w-full mt-2 lg:mt-0">
          <div className="bg-blue-600 p-3 lg:p-4 rounded-2xl inline-block mb-4 shadow-xl shadow-blue-600/30 animate-pulse">
            <ShieldCheck size={28} className="text-white lg:w-8 lg:h-8" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-950 uppercase italic tracking-tighter leading-none m-0 px-8">
            Émargement <span className="text-blue-600">Certifié</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3 text-slate-400">
             <Lock size={12} className="text-blue-500" />
             <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] m-0">SDE Secure Token Protocol</p>
          </div>
          <p className="text-[10px] lg:text-[11px] text-slate-500 font-bold uppercase italic tracking-wider mt-5 lg:mt-6 px-4 lg:px-10 leading-relaxed m-0 border-t border-slate-50 pt-4 line-clamp-2" title={theme}>
            {theme}
          </p>
        </header>

        {/* 🔲 ZONE SCAN (Contraste maximal) */}
        <div className="relative p-5 lg:p-6 bg-slate-50 rounded-4xl lg:rounded-[2.5rem] border-2 border-dashed border-slate-200 shadow-inner flex flex-col items-center justify-center aspect-square w-full max-w-60 lg:max-w-70 z-10 group transition-colors hover:border-blue-500/30">
          {loading || !token ? (
            <div className="flex flex-col items-center gap-3 lg:gap-4">
              <Loader2 className="animate-spin text-blue-600" size={28} />
              <span className="text-[7px] lg:text-[8px] font-black text-blue-600 tracking-[0.4em] animate-pulse uppercase m-0">Matrix Sync...</span>
            </div>
          ) : (
            <div className="p-3 lg:p-4 bg-white rounded-2xl lg:rounded-3xl shadow-xl group-hover:scale-105 transition-transform duration-500 border border-white">
              <QRCodeSVG 
                value={attendanceUrl} 
                size={180}
                level="H" 
                includeMargin={false}
                style={{ width: '100%', height: 'auto', maxWidth: '200px' }}
              />
            </div>
          )}
        </div>

        {/* 📱 INSTRUCTIONS DE PILOTAGE */}
        <div className="mt-6 lg:mt-8 space-y-4 w-full z-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 lg:gap-4 text-slate-900 bg-blue-50/60 py-3 lg:py-4 px-4 lg:px-6 rounded-2xl border border-blue-100">
            <Smartphone size={20} className="text-blue-600 animate-bounce shrink-0" />
            <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest italic leading-tight text-center sm:text-left m-0">
              Flashez ce code pour signer <br className="hidden sm:block"/>la présence numérique au registre
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-4 lg:gap-6 pt-2">
            <button 
              onClick={generateToken}
              disabled={loading}
              className="flex items-center gap-2 text-[8px] lg:text-[9px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase italic border-none bg-transparent cursor-pointer disabled:opacity-30 m-0"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 
              Actualiser Jeton
            </button>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <button 
              onClick={copyToClipboard}
              disabled={!token}
              className="flex items-center gap-2 text-[8px] lg:text-[9px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase italic border-none bg-transparent cursor-pointer disabled:opacity-30 m-0"
            >
              <Copy size={14} /> 
              Copier l&apos;URL
            </button>
          </div>
        </div>

        {/* 📜 CERTIFICATION (FOOTER) */}
        <footer className="mt-6 lg:mt-8 pt-5 lg:pt-6 border-t border-slate-100 w-full z-10 opacity-60">
           <div className="flex items-center justify-center gap-2 lg:gap-3">
              <Info size={12} className="text-blue-500 shrink-0" />
              <p className="text-[7px] lg:text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] lg:tracking-[0.4em] italic m-0">
                Conformité §7.3 - ISO 45001 • Qualisoft RD 2026
              </p>
           </div>
        </footer>
      </div>
    </div>
  );
}