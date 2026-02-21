/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛰️ MODULE : FILE UPLOAD (SCELLAGE DOCUMENTAIRE)
 * -------------------------------------------------------------------------
 * FONCTION : Capture et transfert de preuves numériques vers le SDE.
 * RÔLE : Assurer la disponibilité des preuves (§7.5.3 ISO 9001).
 * ISOLATION : Le binaire est routé vers le bucket privé du Tenant.
 */

import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle2, Loader2, Paperclip, ShieldCheck } from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast } from 'sonner';

interface FileUploadProps {
  onUploadSuccess: (fileData: { url: string; name: string }) => void;
  label?: string;
  acceptedTypes?: string;
}

export default function FileUpload({ 
  onUploadSuccess, 
  label = "Joindre une preuve (Mail, Facture, PV...)", 
  acceptedTypes = ".pdf,.jpg,.jpeg,.png,.docx" 
}: FileUploadProps) {
  
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragged, setIsDragged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 🚀 TRANSFÈRE AU KERNEL
   * Exécute l'upload physique via le canal API scellé.
   */
  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsUploading(true);
    const tid = toast.loading("Téléchargement vers le SDE...");

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // APPEL RÉEL AU BACKEND QUALISOFT
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setIsUploading(false);
      onUploadSuccess({
        url: res.data.url, // URL réelle retournée par NestJS
        name: selectedFile.name
      });
      toast.success("DOCUMENT SCELLÉ", { id: tid });
    } catch (err) {
      setIsUploading(false);
      setFile(null);
      toast.error("ÉCHEC DE L'INDEXATION", { id: tid });
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragged(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full space-y-3 italic">
      <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest flex items-center gap-2">
        <Paperclip size={12} className="text-blue-500" /> {label}
      </label>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragged(true); }}
        onDragLeave={() => setIsDragged(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer transition-all duration-500
          border-2 border-dashed rounded-[2.5rem] p-8
          flex flex-col items-center justify-center gap-4
          ${isDragged ? 'border-blue-500 bg-blue-600/10 scale-[0.98]' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/30'}
          ${file && !isUploading ? 'border-emerald-500/50 bg-emerald-500/5 shadow-lg shadow-emerald-500/5' : ''}
        `}
      >
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          accept={acceptedTypes}
          onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <span className="text-[10px] font-black uppercase text-blue-500 animate-pulse tracking-widest">Initialisation du flux...</span>
          </div>
        ) : file ? (
          <div className="flex items-center gap-6 w-full animate-in zoom-in-95">
            <div className="p-4 bg-emerald-500/20 rounded-2xl text-emerald-500 shadow-xl shadow-emerald-500/10">
              <File size={24} />
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-xs font-black text-white truncate italic uppercase tracking-tighter">{file.name}</p>
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 mt-1">
                <ShieldCheck size={12} /> Scellé Matrix V1.0 - Prêt pour Archivage
              </p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="p-3 bg-white/5 hover:bg-red-500/20 rounded-xl text-slate-500 hover:text-red-500 transition-all border-none cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 bg-blue-600/10 rounded-3xl text-blue-500 shadow-inner group-hover:scale-110 transition-transform">
              <Upload size={36} />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-white italic uppercase tracking-tighter leading-none mb-2">Déposer la preuve digitale</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-60">
                Périmètre autorisé : {acceptedTypes.replace(/\./g, '').toUpperCase()}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}