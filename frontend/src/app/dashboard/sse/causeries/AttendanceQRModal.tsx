/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, ShieldCheck, RefreshCw, Loader2 } from 'lucide-react';
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

  // ✅ Correction : 2 arguments passés correctement & suppression du résidu syntaxique });
  const generateToken = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.post(`/causeries/${causerieId}/generate-token`);
      setToken(res.data.token);
    } catch (e) {
      toast.error("Erreur de génération du jeton");
    } finally {
      setLoading(false);
    }
  }, [causerieId]);

  useEffect(() => {
    generateToken();
  }, [causerieId, generateToken]);

  // URL dynamique que le smartphone va scanner
  const attendanceUrl = `${window.location.origin}/mobile/check-in?token=${token}`;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-250 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg rounded-[4rem] p-12 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-300 relative">
        {/* Bouton de fermeture */}
        <button 
          onClick={onClose} 
          className="absolute top-10 right-10 p-3 bg-slate-100 rounded-full text-slate-500 hover:bg-rose-100 hover:text-rose-500 transition-all active:scale-90"
        >
          <X size={24} />
        </button>

        {/* En-tête du Modal */}
        <div className="mb-8">
          <div className="bg-blue-600/10 p-4 rounded-3xl inline-block mb-4">
            <ShieldCheck size={40} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
            Émargement Certifié
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 italic">
            {theme}
          </p>
        </div>

        {/* Zone du QR Code */}
        <div className="relative p-6 bg-slate-50 rounded-[3rem] border-4 border-blue-600 shadow-inner min-h-75 flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <span className="text-[10px] font-black text-blue-600 animate-pulse">
                GÉNÉRATION...
              </span>
            </div>
          ) : (
            <div className="p-4 bg-white rounded-2xl">
              <QRCodeSVG 
                value={attendanceUrl} 
                size={240}
                level="H"
                includeMargin={false}
              />
            </div>
          )}
        </div>

        {/* Instructions et Actions */}
        <div className="mt-8 space-y-4">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed italic">
            Les participants doivent scanner ce code<br/>pour signer numériquement leur présence
          </p>
          
          <button 
            onClick={generateToken}
            disabled={loading}
            className="flex items-center gap-2 text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase italic mx-auto disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 
            Actualiser le jeton de sécurité
          </button>
        </div>

        {/* Footer de certification */}
        <div className="mt-10 pt-8 border-t border-slate-100 w-full">
           <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.3em] italic">
             SMI QUALISOFT • SÉCURITÉ CRYPTOGRAPHIQUE SHA-256
           </p>
        </div>
      </div>
    </div>
  );
}