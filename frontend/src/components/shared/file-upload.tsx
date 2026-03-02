/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : FileUpload.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Capture et transfert de preuves numériques vers le SDE.
 * PHILOSOPHIE : Traçabilité et intégrité des données (§7.5.3 ISO).
 * RÉVISION : 02 Mars 2026 | 19:10 GMT
 */

"use client";

import { useState, useRef } from 'react';
import { 
  Upload, X, Loader2, Paperclip, ShieldCheck} from 'lucide-react';
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

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;

    // Validation simple de la taille (Ex: 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      return toast.error("ÉCHEC : Fichier trop lourd (> 10MB)");
    }

    setFile(selectedFile);
    setIsUploading(true);
    const tid = toast.loading("Scellage documentaire en cours...");

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onUploadSuccess({
        url: res.data.url,
        name: selectedFile.name
      });
      toast.success("DOCUMENT SCELLÉ AU REGISTRE", { id: tid });
    } catch (err) {
      setFile(null);
      toast.error("ERREUR KERNEL : Indexation impossible", { id: tid });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full space-y-4 italic font-sans text-left">
      <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-[0.2em] flex items-center gap-2">
        <Paperclip size={14} className="text-blue-600" /> {label}
      </label>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragged(true); }}
        onDragLeave={() => setIsDragged(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragged(false); e.dataTransfer.files?.[0] && handleFileChange(e.dataTransfer.files[0]); }}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`
          relative cursor-pointer transition-all duration-500
          border-2 border-dashed rounded-[2.5rem] p-10
          flex flex-col items-center justify-center gap-4
          ${isDragged ? 'border-blue-500 bg-blue-600/10 scale-[0.98]' : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5'}
          ${file && !isUploading ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
          ${isUploading ? 'cursor-wait opacity-70' : ''}
        `}
      >
        <input type="file" className="hidden" ref={fileInputRef} accept={acceptedTypes} onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])} />

        {isUploading ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
            <Loader2 className="animate-spin text-blue-600" size={40} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest animate-pulse">Synchronisation Kernel...</span>
          </div>
        ) : file ? (
          <div className="flex items-center gap-6 w-full animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <ShieldCheck size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tighter m-0">{file.name}</p>
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 mt-2 m-0 leading-none">
                Preuve Intègre • Scellé Matrix RD-2026
              </p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer shadow-sm"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-blue-600/10 rounded-3xl text-blue-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-slate-900 uppercase tracking-tighter m-0">Déposer la preuve digitale</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3 m-0 opacity-60 italic">
                Périmètre : {acceptedTypes.replace(/\./g, '').toUpperCase()} (Max 10MB)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}