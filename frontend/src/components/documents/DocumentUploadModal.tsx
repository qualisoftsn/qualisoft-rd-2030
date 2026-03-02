/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📂 MODULE : DocumentUploadModal.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Indexation et archivage scellé au coffre-fort (§7.5 ISO).
 * SÉCURITÉ : Transport Multipart scellé au TenantId via Master Kernel.
 * RÉVISION : 02 Mars 2026 | 19:15 GMT
 */

"use client";

import React, { useEffect, useState } from "react";
import { 
  AlertCircle, CheckCircle2, Loader2, ShieldCheck, Upload, X 
} from "lucide-react";
import apiClient from "@/core/api/api-client";
import { toast } from "sonner";

interface ProcessusEntry {
  PR_Id: string;
  PR_Libelle: string;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function DocumentUploadModal({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [processus, setProcessus] = useState<ProcessusEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    DOC_Title: "",
    DOC_Description: "",
    DOC_Category: "PROCEDURE",
    DOC_ProcessusId: "",
  });

  // 📡 SYNCHRONISATION DU RÉFÉRENTIEL PROCESSUS
  useEffect(() => {
    apiClient.get("/processus")
      .then((res) => setProcessus(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error("ERREUR : Liaison processus rompue."));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!form.DOC_Title) {
        setForm(p => ({ ...p, DOC_Title: file.name.split(".")[0].toUpperCase() }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return toast.error("Document source manquant.");

    setLoading(true);
    const tid = toast.loading("Scellage et indexation GED en cours...");

    const data = new FormData();
    data.append("file", selectedFile);
    data.append("DOC_Title", form.DOC_Title);
    data.append("DOC_Description", form.DOC_Description);
    data.append("DOC_Category", form.DOC_Category);
    data.append("DOC_ProcessusId", form.DOC_ProcessusId);

    try {
      await apiClient.post("/documents/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("DOCUMENT INDEXÉ DANS LE COFFRE-FORT", { id: tid });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Rejet de l'indexation Matrix", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0B0F1A]/95 backdrop-blur-2xl z-100 flex items-center justify-center p-6 italic font-sans text-left">
      <div className="bg-[#0F172A] w-full max-w-4xl rounded-[4rem] shadow-4xl border border-white/10 overflow-hidden animate-in zoom-in duration-500">
        
        {/* HEADER SOUVERAIN */}
        <header className="p-10 border-b border-white/5 flex justify-between items-center bg-white/2 relative">
          <div className="absolute top-0 left-10 w-32 h-1 bg-blue-600 shadow-[0_0_15px_#2563eb]" />
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white m-0">
              Indexation <span className="text-blue-500">Documentaire</span>
            </h2>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3 m-0">
              Qualisoft RD 2026 • Coffre-fort numérique scellé
            </p>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-red-500/20 transition-all border-none cursor-pointer">
            <X size={28} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-12 space-y-12">
          {/* ZONE DE DÉPÔT BIOMÉTRIQUE */}
          <div className="relative group">
            <input type="file" required={!selectedFile} onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
            <div className={`border-4 border-dashed rounded-[3rem] p-12 text-center transition-all duration-500 ${selectedFile ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/10 bg-white/2 group-hover:border-blue-500/30"}`}>
              {selectedFile ? (
                <div className="flex items-center justify-center gap-8 animate-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-500 shadow-xl"><CheckCircle2 size={40} /></div>
                  <div>
                    <p className="text-xl font-black text-white uppercase italic tracking-tighter m-0 truncate max-w-md">{selectedFile.name}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 m-0">Version V1.0 • {(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto text-blue-500 shadow-inner group-hover:scale-110 transition-transform"><Upload size={32} /></div>
                  <p className="text-sm font-black uppercase text-slate-300 tracking-[0.2em] m-0">Sélectionnez le fichier source</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold m-0">PDF, Word, Excel • Max 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <InputBlock label="Titre Qualité du Document" value={form.DOC_Title} onChange={(v: any) => setForm({...form, DOC_Title: v})} placeholder="EX: PROCÉDURE GESTION DÉCHETS" />
              <SelectBlock label="Catégorie Normative" value={form.DOC_Category} onChange={(v: any) => setForm({...form, DOC_Category: v})}>
                <option value="PROCEDURE">Procédure Opérationnelle</option>
                <option value="MANUEL">Manuel SMI / Qualité</option>
                <option value="ENREGISTREMENT">Enregistrement (Preuve)</option>
                <option value="RAPPORT">Rapport d&apos;Audit</option>
              </SelectBlock>
            </div>

            <div className="space-y-8">
              <SelectBlock label="Ancrage Processus (Lien Fort)" value={form.DOC_ProcessusId} onChange={(v: any) => setForm({...form, DOC_ProcessusId: v})} required>
                <option value="">-- Assigner un processus --</option>
                {processus.map(p => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
              </SelectBlock>
              
              <div className="p-6 bg-blue-600/5 border border-blue-500/20 rounded-4xl flex gap-5 relative overflow-hidden group">
                <ShieldCheck size={60} className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity" />
                <AlertCircle size={24} className="text-blue-500 shrink-0" />
                <p className="text-[10px] text-slate-400 leading-relaxed font-black italic uppercase tracking-tighter m-0 relative z-10">
                  Conformité ISO : Statut initial <span className="text-blue-500">BROUILLON</span>. Circuit de validation requis pour passage en <span className="text-emerald-500">DIFFUSÉ</span>.
                </p>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading || !selectedFile} className="w-full bg-blue-600 text-white p-7 rounded-[2.5rem] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-5 hover:bg-white hover:text-blue-600 transition-all shadow-3xl border-none cursor-pointer active:scale-95 disabled:opacity-30">
            {loading ? <Loader2 className="animate-spin" size={24} /> : <><ShieldCheck size={24} /> <span>Indexer au Coffre-fort (V1.0)</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}

function InputBlock({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-4">
      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 ml-4">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-sm font-black text-white focus:ring-2 focus:ring-blue-600 outline-none uppercase transition-all shadow-inner" />
    </div>
  );
}

function SelectBlock({ label, value, onChange, children, required }: any) {
  return (
    <div className="space-y-4">
      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 ml-4">{label}</label>
      <select required={required} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-[#161e31] border border-white/5 rounded-2xl p-6 text-sm font-black text-white outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer italic uppercase appearance-none">{children}</select>
    </div>
  );
}