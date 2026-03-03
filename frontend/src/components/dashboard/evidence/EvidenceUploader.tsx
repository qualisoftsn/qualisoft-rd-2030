/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : EvidenceUploader.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Collecte et indexation de preuves documentaires/visuelles.
 * CONTEXTE : Polyvalent (Liaison NC, Action, Audit, Document).
 * RÉVISION : 04 Mars 2026 | 06:15 GMT
 */

'use client';

import React, { useState, useCallback } from 'react';
import { 
  UploadCloud, File, X, CheckCircle2, Loader2, 
  MessageSquare, Paperclip, ShieldCheck 
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/core/api/api-client';

interface EvidenceUploaderProps {
  contextId: string; // L'ID de l'objet lié (NC_Id, ACT_Id, etc.)
  contextType: 'NC' | 'ACTION' | 'AUDIT' | 'DOCUMENT';
  onSuccess?: () => void;
}

export default function EvidenceUploader({ contextId, contextType, onSuccess }: EvidenceUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * 📁 GESTION DE LA SÉLECTION
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) { // Limite 10MB
        toast.error("FICHIER TROP VOLUMINEUX : Limite fixée à 10 Mo.");
        return;
      }
      setFile(selectedFile);
    }
  };

  /**
   * 🚀 PROTOCOLE D'UPLOAD ET D'INDEXATION
   * Procédure en 2 étapes : 
   * 1. Upload physique du fichier sur le serveur.
   * 2. Création de l'entrée "Preuve" liée dans la Matrix.
   */
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const tid = toast.loading("Téléchargement de la preuve vers le Kernel...");

    try {
      // ÉTAPE 1 : Envoi du binaire vers le stockage statique
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await apiClient.post<{ url: string; filename: string }>(
        '/files/upload', 
        formData, 
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const { url, filename } = uploadRes.data;

      // ÉTAPE 2 : Indexation de la preuve avec ses métadonnées
      const evidencePayload: any = {
        PV_FileUrl: url,
        PV_FileName: filename,
        PV_Commentaire: comment.trim(),
      };

      // Liaison dynamique selon le contexte
      if (contextType === 'NC') evidencePayload.PV_NCId = contextId;
      if (contextType === 'ACTION') evidencePayload.PV_ActionId = contextId;
      if (contextType === 'AUDIT') evidencePayload.PV_AuditId = contextId;
      if (contextType === 'DOCUMENT') evidencePayload.PV_DocumentId = contextId;

      await apiClient.post('/evidences', evidencePayload);

      toast.success("PREUVE SCELLÉE : Document indexé avec succès.", { id: tid });
      setFile(null);
      setComment('');
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("ÉCHEC DE TRANSMISSION : Le Kernel a rejeté le flux.", { id: tid });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-4xl p-8 transition-all hover:border-indigo-300 group">
      <div className="space-y-6">
        
        {/* --- ZONE DE DÉPÔT --- */}
        {!file ? (
          <label className="flex flex-col items-center justify-center cursor-pointer space-y-4 py-6">
            <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
              <UploadCloud className="text-indigo-600" size={32} />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">
                Déposer la preuve documentaire
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                PDF, JPG, PNG (MAX. 10 MO)
              </p>
            </div>
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>
        ) : (
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-2">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <File size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 truncate uppercase italic">{file.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button 
              onClick={() => setFile(null)}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* --- MÉTADONNÉES (COMMENTAIRE) --- */}
        {file && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 text-slate-400" size={16} />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ajouter un commentaire ou une observation sur cette preuve..."
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all italic h-24"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 border-none cursor-pointer"
            >
              {isUploading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <ShieldCheck size={16} />
              )}
              {isUploading ? "Indexation..." : "Sceller la preuve"}
            </button>
          </div>
        )}
      </div>

      {/* FOOTER DE CONFORMITÉ */}
      <div className="mt-6 pt-6 border-t border-slate-200/60 flex items-center justify-between">
        <div className="flex items-center gap-2 opacity-40">
           <Paperclip size={12} className="text-slate-500" />
           <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
             Module de Preuve V.2026 — {contextType}
           </span>
        </div>
        <div className="flex items-center gap-2 text-emerald-600 italic">
          <ShieldCheck size={12} />
          <span className="text-[8px] font-black uppercase tracking-widest">Audit Ready</span>
        </div>
      </div>
    </div>
  );
}