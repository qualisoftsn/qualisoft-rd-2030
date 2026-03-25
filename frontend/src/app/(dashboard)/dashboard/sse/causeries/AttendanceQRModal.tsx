/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : ATTENDANCE QR KERNEL (ELITE SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Preuve numérique d'implication (QR Modal).
 * RÉFÉRENTIEL : ISO 45001 §7.3 Sensibilisation.
 * DESIGN : High-Contrast / Mobile-First / Zero-Scroll.
 * -------------------------------------------------------------------------
 * DATE DE RÉVISION : 05 Mars 2026 | 19:45 GMT
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, ShieldCheck, RefreshCw, Loader2, Smartphone, Copy, Fingerprint, Info, Lock } from 'lucide-react';
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

  const generateToken = useCallback(async () => {
    setLoading(true);
    const tid = toast.loading("Génération du jeton SDE...");
    try {
      const res = await apiClient.post(`/causeries/${causerieId}/generate-token`);
      const data = res.data?.data || res.data;
      setToken(data.token);
      toast.success("JETON ACTUALISÉ", { id: tid });
    } catch {
      toast.error("ÉCHEC DE CHIFFREMENT KERNEL", { id: tid });
    } finally {
      setLoading(false);
    }
  }, [causerieId]);

  useEffect(() => { generateToken(); }, [generateToken]);

  const attendanceUrl = useMemo(() => {
    if (typeof window === 'undefined' || !token) return '';
    return `${window.location.origin}/mobile/check-in?token=${token}`;
  }, [token]);

  const copyToClipboard = () => {
    if (!attendanceUrl) return;
    navigator.clipboard.writeText(attendanceUrl);
    toast.success("URL COPIÉE AU PRESSE-PAPIER");
  };

  return (
    <div className="fixed inset-0 bg-[#0B0F1A]/95 backdrop-blur-3xl z-1000 flex items-center justify-center p-4 lg:p-6 overflow-hidden">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-xl rounded-[3rem] lg:rounded-[4rem] p-8 lg:p-12 flex flex-col items-center text-center shadow-[0_0_100px_rgba(37,99,235,0.3)] animate-in zoom-in-95 duration-500 border-none italic font-black my-auto overflow-hidden">
        
        <Fingerprint size={300} className="absolute -top-20 -right-20 text-slate-100 opacity-50 pointer-events-none" />

        <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-slate-100 text-slate-400 hover:text-rose-600 rounded-2xl transition-all border-none cursor-pointer z-50 active:scale-90">
          <X size={24} strokeWidth={3} />
        </button>

        <header className="mb-10 relative z-10 w-full">
          <div className="bg-blue-600 p-4 rounded-3xl inline-block mb-6 shadow-xl shadow-blue-600/30 animate-pulse">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-950 uppercase italic tracking-tighter leading-none m-0">
            Émargement <span className="text-blue-600">Certifié</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4 text-slate-400">
             <Lock size={14} className="text-blue-500" />
             <p className="text-[10px] uppercase tracking-widest m-0 font-black">SDE Secure Token Protocol</p>
          </div>
          <p className="text-[11px] text-slate-500 font-bold uppercase italic tracking-wider mt-8 border-t border-slate-100 pt-6 line-clamp-2 px-6">
            {theme}
          </p>
        </header>

        <div className="relative p-6 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 shadow-inner flex flex-col items-center justify-center aspect-square w-full max-w-72 z-10 group transition-all hover:border-blue-500/30">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <span className="text-[10px] font-black text-blue-600 tracking-[0.4em] animate-pulse uppercase">Matrix Sync...</span>
            </div>
          ) : (
            <div className="p-4 bg-white rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-500 border-8 border-white">
              <QRCodeSVG value={attendanceUrl} size={220} level="H" includeMargin={false} style={{ width: '100%', height: 'auto' }} />
            </div>
          )}
        </div>

        <div className="mt-10 space-y-6 w-full z-10">
          <div className="flex items-center justify-center gap-4 text-slate-900 bg-blue-50/80 py-5 px-8 rounded-3xl border border-blue-100 shadow-sm">
            <Smartphone size={24} className="text-blue-600 animate-bounce" />
            <p className="text-[10px] font-black uppercase tracking-widest italic leading-tight text-left m-0">
              Flashez pour signer <br/>la présence au registre
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-8 pt-4">
            <button onClick={generateToken} disabled={loading} className="flex items-center gap-2 text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase italic border-none bg-transparent cursor-pointer disabled:opacity-30">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualiser
            </button>
            <button onClick={copyToClipboard} disabled={!token} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase italic border-none bg-transparent cursor-pointer disabled:opacity-30">
              <Copy size={16} /> Copier le lien
            </button>
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t border-slate-100 w-full z-10 opacity-50">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] italic m-0">
            Conformité §7.3 ISO 45001 • Qualisoft 2026
          </p>
        </footer>
      </div>
    </div>
  );
}
