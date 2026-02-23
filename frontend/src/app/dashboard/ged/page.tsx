/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📂 MODULE : GED (GESTION ÉLECTRONIQUE DES DOCUMENTS) - EDITION COMPACTE
 * -------------------------------------------------------------------------
 * RÔLE : Maîtrise des informations documentées (§7.5 ISO 9001).
 * DESIGN : One-Pager (No-Scroll), Densité Haute, Thème Dark Matrix.
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import { Document as IDocument, Processus as IProcessus } from "@/types/elite-sde";
import {
  Activity, Archive, CheckCircle2, Clock, Download, Eye, FileText,
  FileType, FileUp, Filter, Fingerprint, Hash, History, Loader2,
  Plus, Save, Search, ShieldCheck, Trash2, X, RefreshCw
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

// --- 🛠️ UTILITAIRES ---
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(" ");

export default function GEDPage() {
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [processus, setProcessus] = useState<IProcessus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resDoc, resPr] = await Promise.all([
        apiClient.get("/documents"),
        apiClient.get("/processus"),
      ]);
      const extract = (res: any) => res.data?.data || res.data || [];
      setDocuments(extract(resDoc));
      setProcessus(extract(resPr));
    } catch (err) {
      toast.error("ÉCHEC DU NOYAU MATRIX");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => ({
    total: documents.length,
    approved: documents.filter((d) => d.DOC_Status === "APPROUVE").length,
    review: documents.filter((d) => d.DOC_Status === "EN_REVUE").length,
    archived: documents.filter((d) => d.DOC_IsArchived).length,
  }), [documents]);

  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      const matchSearch = (d.DOC_Title || "").toLowerCase().includes(search.toLowerCase()) ||
                          (d.DOC_Reference || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "ALL" || d.DOC_Category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [documents, search, categoryFilter]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return toast.error("FICHIER MANQUANT");
    const formData = new FormData(e.currentTarget);
    formData.append("file", selectedFile);
    const tid = toast.loading("INDEXATION...");
    try {
      await apiClient.post("/documents", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("DOCUMENT SCELLÉ", { id: tid });
      setIsModalOpen(false);
      setSelectedFile(null);
      fetchData();
    } catch (err) {
      toast.error("ERREUR RÉCEPTION MATRIX", { id: tid });
    }
  };

  if (loading && documents.length === 0) return (
    <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-blue-500" size={40} />
      <p className="font-black italic uppercase tracking-[0.4em] text-blue-500">Synchronisation GED...</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col overflow-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER COMPACT */}
      <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center shrink-0 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="text-left">
          <h1 className="text-2xl tracking-tighter italic leading-none font-black uppercase m-0">
            Système <span className="text-blue-600">GED</span>
          </h1>
          <p className="text-slate-500 text-[8px] tracking-[0.3em] font-black uppercase opacity-60 m-0 mt-1">
            §7.5 • MAÎTRISE DOCUMENTAIRE
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" size={14} />
            <input
              placeholder="RECHERCHER..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] outline-none focus:border-blue-600 transition-all font-black italic uppercase text-white shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-white hover:text-slate-900 px-6 py-2 rounded-xl text-[10px] flex items-center gap-2 transition-all font-black italic uppercase border-none text-white cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} strokeWidth={3} /> Nouveau Document
          </button>
        </div>
      </header>

      {/* 📊 METRICS BAR (SHRINK-0) */}
      <div className="px-6 py-3 flex gap-3 shrink-0 bg-white/2">
        <MetricSmall title="Total" val={stats.total} icon={FileText} color="blue" />
        <MetricSmall title="Validés" val={stats.approved} icon={CheckCircle2} color="emerald" />
        <MetricSmall title="En Revue" val={stats.review} icon={History} color="amber" />
        <MetricSmall title="Archives" val={stats.archived} icon={Archive} color="slate" />
      </div>

      {/* 🗂️ FILTRES (SHRINK-0) */}
      <div className="px-6 py-2 flex justify-between items-center bg-black/20 border-y border-white/5 shrink-0">
        <div className="flex gap-2">
          {["ALL", "PROCEDURE", "MANUEL", "ENREGISTREMENT", "RAPPORT"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[9px] font-black transition-all border uppercase italic cursor-pointer tracking-widest",
                categoryFilter === cat ? "bg-blue-600 border-blue-600 text-white" : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="text-slate-500 text-[8px] font-black uppercase italic tracking-widest flex items-center gap-2">
          <Filter size={12} /> {filteredDocs.length} DOCUMENTS DÉTECTÉS
        </div>
      </div>

      {/* 📋 TABLEAU (FLEX-1 AVEC SCROLL INTERNE) */}
      <main className="flex-1 overflow-hidden p-4">
        <div className="h-full bg-[#151A2D] border border-white/5 rounded-3xl flex flex-col shadow-4xl overflow-hidden">
          <div className="overflow-y-auto custom-scrollbar h-full">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#151A2D] z-10">
                <tr className="text-[9px] text-slate-500 border-b border-white/5 italic font-black uppercase tracking-[0.2em]">
                  <th className="px-6 py-3">Référence / Titre</th>
                  <th className="px-6 py-3">Processus</th>
                  <th className="px-6 py-3">Version</th>
                  <th className="px-6 py-3">Statut SMI</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDocs.map((doc) => (
                  <tr key={doc.DOC_Id} className="hover:bg-blue-600/5 transition-all group">
                    <td className="px-6 py-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-blue-500 font-black tracking-widest uppercase">{doc.DOC_Reference}</span>
                        <span className="text-sm text-white font-black italic tracking-tighter m-0">{doc.DOC_Title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-[9px] font-black uppercase italic text-slate-400">
                        {doc.DOC_ProcessusId ? "Scellé Processus" : "Transversal"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-black text-white text-lg italic leading-none">V{doc.DOC_CurrentVersion}</span>
                    </td>
                    <td className="px-6 py-3">
                      <StatusMiniBadge status={doc.DOC_Status} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-2 bg-white/5 hover:bg-blue-600 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"><Eye size={14}/></button>
                        <button className="p-2 bg-white/5 hover:bg-emerald-600 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"><Download size={14}/></button>
                        <button className="p-2 bg-white/5 hover:bg-rose-600 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 📥 MODALE COMPACTE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-[#0B0F1A] border border-white/10 rounded-[2.5rem] w-full max-w-2xl p-8 space-y-6 shadow-4xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="text-xl italic font-black uppercase text-white m-0 flex items-center gap-3">
                <ShieldCheck className="text-blue-500" size={24} /> Indexation <span className="text-blue-500">SMI</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-500 hover:text-rose-500 cursor-pointer border-none bg-transparent transition-colors"><X size={24} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-black uppercase italic tracking-widest ml-2">Classification *</label>
                <select name="DOC_Category" className="w-full bg-[#151A2D] border border-white/5 p-3 rounded-xl text-[10px] text-white font-black uppercase outline-none focus:border-blue-600">
                  <option value="PROCEDURE">PROCÉDURE</option>
                  <option value="MANUEL">MANUEL</option>
                  <option value="RAPPORT">RAPPORT</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-black uppercase italic tracking-widest ml-2">Référence</label>
                <input name="DOC_Reference" placeholder="AUTO-REF" className="w-full bg-[#151A2D] border border-white/5 p-3 rounded-xl text-[10px] text-blue-400 font-black outline-none" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[9px] text-slate-500 font-black uppercase italic tracking-widest ml-2">Désignation Officielle *</label>
                <input required name="DOC_Title" className="w-full bg-[#151A2D] border border-white/5 p-3 rounded-xl text-[11px] text-white font-black italic uppercase outline-none focus:border-blue-600" />
              </div>
            </div>

            <div className="relative">
              <label htmlFor="ged-upload" className={cn("flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer bg-white/2", selectedFile ? "border-emerald-500" : "border-white/10 hover:border-blue-500")}>
                <FileUp size={30} className={selectedFile ? "text-emerald-500" : "text-blue-600"} />
                <p className="text-[10px] text-white font-black italic uppercase mt-2">{selectedFile ? selectedFile.name : "DÉPOSER LE FICHIER (PDF/DOCX)"}</p>
              </label>
              <input id="ged-upload" type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            </div>

            <button type="submit" className="w-full bg-blue-600 py-4 rounded-xl font-black text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-white hover:text-slate-900 transition-all border-none text-white cursor-pointer group">
              <Save size={18} /> VALIDER DANS LE SMI
            </button>
          </form>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb; }
      `}</style>
    </div>
  );
}

// --- SOUS-COMPOSANTS MINIATURISÉS ---
const MetricSmall = ({ title, val, icon: Icon, color }: any) => {
  const colors: any = { 
    blue: "text-blue-500 bg-blue-500/10", 
    emerald: "text-emerald-500 bg-emerald-500/10", 
    amber: "text-amber-500 bg-amber-500/10", 
    slate: "text-slate-400 bg-white/5" 
  };
  return (
    <div className="flex-1 bg-[#151A2D] border border-white/5 rounded-2xl p-3 flex items-center justify-between shadow-inner">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg border border-white/5", colors[color])}><Icon size={14} /></div>
        <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest m-0">{title}</p>
      </div>
      <p className="text-xl font-black text-white italic m-0">{val}</p>
    </div>
  );
};

const StatusMiniBadge = ({ status }: { status: string }) => {
  const config: any = { APPROUVE: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", EN_REVUE: "text-amber-500 bg-amber-500/10 border-amber-500/20", BROUILLON: "text-slate-500 bg-white/5" };
  return (
    <span className={cn("px-2 py-0.5 rounded text-[8px] font-black border uppercase italic whitespace-nowrap", config[status] || config.BROUILLON)}>
      {status?.replace("_", " ")}
    </span>
  );
};