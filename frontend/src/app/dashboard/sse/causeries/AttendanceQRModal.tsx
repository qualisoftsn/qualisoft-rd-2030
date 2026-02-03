/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, ShieldCheck, RefreshCw, Loader2, Smartphone, Copy } from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast } from 'react-hot-toast';

interface AttendanceQRModalProps {
  causerieId: string;
  theme: string;
  onClose: () => void;
}

export default function AttendanceQRModal({ causerieId, theme, onClose }: AttendanceQRModalProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const generateToken = useCallback(async () => {
    try {
      setLoading(true);
      // Appel au endpoint backend pour créer un JWT temporaire
      const res = await apiClient.post(`/causeries/${causerieId}/generate-token`);
      setToken(res.data.token);
    } catch (e) {
      toast.error("ERREUR DE GÉNÉRATION DU JETON SÉCURISÉ");
    } finally {
      setLoading(false);
    }
  }, [causerieId]);

  useEffect(() => {
    generateToken();
  }, [generateToken]);

  // URL dynamique pour le check-in mobile
  const attendanceUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/mobile/check-in?token=${token}`
    : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(attendanceUrl);
    toast.success("LIEN COPIÉ");
  };

  return (
    <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-600 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-xl rounded-[4rem] p-16 flex flex-col items-center text-center shadow-[0_0_100px_rgba(37,99,235,0.2)] animate-in zoom-in-95 duration-500 relative">
        
        {/* BOUTON FERMETURE */}
        <button 
          onClick={onClose} 
          className="absolute top-12 right-12 p-4 bg-slate-100 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
        >
          <X size={28} />
        </button>

        {/* HEADER ÉMARTGEMENT */}
        <div className="mb-10">
          <div className="bg-blue-600/10 p-5 rounded-3xl inline-block mb-6">
            <ShieldCheck size={48} className="text-blue-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            ÉMARGEMENT <span className="text-blue-600">CERTIFIÉ</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase mt-3 italic tracking-widest px-10">
            {theme}
          </p>
        </div>

        {/* ZONE QR CODE (FOND BLANC OBLIGATOIRE POUR LE SCAN) */}
        <div className="relative p-10 bg-slate-50 rounded-[4rem] border-4 border-blue-600 shadow-inner flex flex-col items-center justify-center min-h-87.5 w-full max-w-sm">
          {loading ? (
            <div className="flex flex-col items-center gap-6">
              <Loader2 className="animate-spin text-blue-600" size={60} />
              <span className="text-[10px] font-black text-blue-600 tracking-[0.5em] animate-pulse">
                SÉCURISATION...
              </span>
            </div>
          ) : (
            <div className="p-6 bg-white rounded-3xl shadow-2xl">
              <QRCodeSVG 
                value={attendanceUrl} 
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>
          )}
        </div>

        {/* INSTRUCTIONS ELITE */}
        <div className="mt-12 space-y-6 w-full">
          <div className="flex items-center justify-center gap-3 text-slate-900">
            <Smartphone size={20} className="text-blue-600" />
            <p className="text-[10px] font-black uppercase tracking-widest italic leading-relaxed">
              SCANNEZ CE CODE POUR SIGNER <br/>LA PRÉSENCE NUMÉRIQUE
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={generateToken}
              disabled={loading}
              className="flex items-center gap-2 text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase italic disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 
              ACTUALISER LE JETON
            </button>
            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase italic"
            >
              <Copy size={14} /> 
              COPIER LE LIEN
            </button>
          </div>
        </div>

        {/* CERTIFICATION ISO */}
        <div className="mt-14 pt-10 border-t border-slate-100 w-full">
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] italic leading-none">
             SMI QUALISOFT • CRYPTO-ÉMARGEMENT §7.3 • ISO 45001
           </p>
        </div>
      </div>
    </div>
  );
}