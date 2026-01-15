//* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle2, Loader2, Paperclip } from 'lucide-react';

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

  // Simulation d'upload (À connecter à votre service S3 ou Backend Upload)
  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsUploading(true);

    // TODO: Appel à apiClient.post('/upload', formData) 
    // Pour l'instant, on simule une réussite pour ne pas bloquer votre workflow
    setTimeout(() => {
      setIsUploading(false);
      onUploadSuccess({
        url: `/uploads/temp/${selectedFile.name}`, // URL simulée
        name: selectedFile.name
      });
    }, 1500);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragged(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full space-y-2">
      <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest flex items-center gap-2">
        <Paperclip size={12} className="text-blue-500" /> {label}
      </label>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragged(true); }}
        onDragLeave={() => setIsDragged(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer transition-all duration-300
          border-2 border-dashed rounded-[2.5rem] p-8
          flex flex-col items-center justify-center gap-4
          ${isDragged ? 'border-blue-500 bg-blue-500/10 scale-[0.98]' : 'border-white/10 bg-white/5 hover:bg-white/8'}
          ${file && !isUploading ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
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
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <span className="text-[10px] font-black uppercase text-blue-500 animate-pulse">Téléchargement...</span>
          </div>
        ) : file ? (
          <div className="flex items-center gap-4 w-full">
            <div className="p-4 bg-emerald-500/20 rounded-2xl text-emerald-500">
              <File size={24} />
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-xs font-black text-white truncate italic">{file.name}</p>
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter flex items-center gap-1">
                <CheckCircle2 size={10} /> Document prêt pour archivage
              </p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="p-2 hover:bg-red-500/20 rounded-xl text-slate-500 hover:text-red-500 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <>
            <div className="p-5 bg-blue-600/10 rounded-3xl text-blue-500 shadow-inner">
              <Upload size={32} />
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-white italic uppercase tracking-tighter">Glissez le fichier ici</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">ou cliquez pour parcourir ({acceptedTypes})</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}