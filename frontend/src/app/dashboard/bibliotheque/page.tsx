/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 MODULE : GED - GESTION ÉLECTRONIQUE DES DOCUMENTS (ISO 9001 §7.5)
 * -------------------------------------------------------------------------
 * RÔLE : Centraliser, contrôler et tracer les documents du SMI.
 * FIX : Migration vers Sonner, correction des classes dynamiques Tailwind 
 * non-compilées, sécurisation des flux API, et refonte du Responsive Design.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 13:32 GMT
 */

"use client";

import apiClient from "@/core/api/api-client";
import { clsx, type ClassValue } from "clsx";
import { addMonths, format, isPast, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle, AlertTriangle, Archive, Calendar, CheckCircle2,
  CheckSquare, Clock, Download, Eye, FileEdit, FileText,
  GitCompare, History, LayoutGrid, List, Loader2, Plus,
  RefreshCw, Search, ShieldCheck, UploadCloud, User, X, XSquare,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

// --- UTILITAIRE ---
function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// --- TYPES STRICTS ISO 9001 ---
type DocumentStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "OBSOLETE" | "ARCHIVED";
type DocumentCategory = "PROCEDURE" | "MANUEL" | "NORME" | "ENREGISTREMENT" | "INSTRUCTION";

interface UserRef { U_Id: string; U_FirstName: string; U_LastName: string; U_Avatar?: string; U_Role?: string; }

interface DocumentVersion {
  DV_Id: string; DV_VersionNumber: number; DV_Status: DocumentStatus;
  DV_CreatedAt: string; DV_CreatedBy: UserRef; DV_ApprovedBy?: UserRef;
  DV_ApprovedAt?: string; DV_ChangeDescription: string; DV_FileSize: number;
  DV_FileType: string; DV_FileName: string; DV_FileUrl: string;
}

interface SMI_Document {
  DOC_Id: string; DOC_Reference: string; DOC_Title: string; DOC_Description: string;
  DOC_Category: DocumentCategory; DOC_ProcessusId?: string; DOC_ProcessusName?: string;
  DOC_Owner: UserRef; DOC_Author?: UserRef; DOC_ReviewFrequencyMonths: number;
  DOC_NextReviewDate: string; DOC_Status: DocumentStatus; DOC_CreatedAt: string;
  DOC_UpdatedAt: string; DOC_Versions: DocumentVersion[]; DOC_Tags: string[];
  DOC_Department?: string; DOC_SiteId?: string;
}

interface FilterState {
  category: "ALL" | DocumentCategory; status: "ALL" | DocumentStatus;
  processus: string; search: string; dateRange: "all" | "month" | "quarter" | "overdue";
  tags: string[];
}

// DICTIONNAIRES DE THÈMES (Évite les bugs de compilation Tailwind)
const STATUS_THEMES: Record<DocumentStatus, { bg: string; border: string; text: string; label: string; icon: LucideIcon }> = {
  APPROVED: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", label: "Actif", icon: CheckCircle2 },
  PENDING_REVIEW: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", label: "En Attente", icon: Clock },
  DRAFT: { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400", label: "Brouillon", icon: FileEdit },
  OBSOLETE: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", label: "Obsolète", icon: Archive },
  ARCHIVED: { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400", label: "Archivé", icon: Archive },
};

// --- HOOK PERSONNALISÉ ---
const useDocumentLibrary = () => {
  const [documents, setDocuments] = useState<SMI_Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    category: "ALL", status: "ALL", processus: "ALL", search: "", dateRange: "all", tags: [],
  });

  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category !== "ALL") params.append("category", filters.category);
      if (filters.status !== "ALL") params.append("status", filters.status);
      if (filters.processus !== "ALL") params.append("processus", filters.processus);
      if (filters.search) params.append("q", filters.search);
      if (filters.dateRange !== "all") params.append("dateRange", filters.dateRange);

      const res = await apiClient.get(`/documents?${params.toString()}`);
      const data = res.data?.data || res.data;
      setDocuments(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Échec de la synchronisation de la GED.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  useEffect(() => {
    const timer = setTimeout(() => { if (filters.search !== "") fetchDocs(); }, 400);
    return () => clearTimeout(timer);
  }, [fetchDocs, filters.search]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: documents.length,
      approved: documents.filter((d) => d.DOC_Status === "APPROVED").length,
      pending: documents.filter((d) => d.DOC_Status === "PENDING_REVIEW").length,
      overdue: documents.filter((d) => d.DOC_NextReviewDate && isPast(new Date(d.DOC_NextReviewDate)) && d.DOC_Status !== "OBSOLETE").length,
      toReviewSoon: documents.filter((d) => {
        if (!d.DOC_NextReviewDate) return false;
        return isWithinInterval(new Date(d.DOC_NextReviewDate), { start: now, end: addMonths(now, 1) }) && d.DOC_Status === "APPROVED";
      }).length,
    };
  }, [documents]);

  return { documents, loading, filters, setFilters, stats, refetch: fetchDocs };
};

// --- COMPOSANT PRINCIPAL ---
export default function LibraryPage() {
  const { documents, loading, filters, setFilters, stats, refetch } = useDocumentLibrary();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  const [modalState, setModalState] = useState<{
    type: "create" | "revision" | "history" | "preview" | "approve" | null;
    doc: SMI_Document | null;
  }>({ type: null, doc: null });

  const handleDownload = async (doc: SMI_Document, versionId?: string) => {
    const targetVersionId = versionId || doc.DOC_Versions[0]?.DV_Id;
    if (!targetVersionId) return toast.error("Aucune version disponible au téléchargement.");

    const tid = toast.loading("Téléchargement en cours...");
    try {
      const res = await apiClient.get(`/documents/${doc.DOC_Id}/versions/${targetVersionId}/download`, { responseType: "blob" });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${doc.DOC_Reference}_v${doc.DOC_Versions[0]?.DV_VersionNumber}.${doc.DOC_Versions[0]?.DV_FileType || "pdf"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Téléchargement terminé", { id: tid });
    } catch (error) {
      toast.error("Échec du téléchargement", { id: tid });
    }
  };

  const handleBulkDownload = async () => {
    if (selectedDocs.size === 0) return;
    const tid = toast.loading("Préparation de l'archive ZIP en cours...");
    try {
      const res = await apiClient.post("/documents/bulk-download", { ids: Array.from(selectedDocs) }, { responseType: "blob" });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `export_ged_${format(new Date(), "yyyy-MM-dd")}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Archive créée avec succès", { id: tid });
      setSelectedDocs(new Set()); // Reset selection after download
    } catch (e) {
      toast.error("Erreur lors de la création de l'archive", { id: tid });
    }
  };

  const toggleSelection = (docId: string) => {
    const newSet = new Set(selectedDocs);
    if (newSet.has(docId)) newSet.delete(docId);
    else newSet.add(docId);
    setSelectedDocs(newSet);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-0 lg:ml-72 pb-24 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* HEADER FIXE */}
      <header className="sticky top-0 z-40 bg-[#0B0F1A]/95 backdrop-blur-2xl border-b border-white/5 px-6 lg:px-10 py-6 mt-12 lg:mt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic leading-none m-0">
              GED <span className="text-blue-600">SMI</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase mt-3 tracking-[0.3em] m-0">
              Maîtrise de l&apos;Information Documentaire ISO 9001 • §7.5
            </p>
          </div>

          <button
            onClick={() => setModalState({ type: "create", doc: null })}
            className="w-full md:w-auto bg-linear-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 px-6 py-4 rounded-4xl font-black uppercase text-xs flex justify-center items-center gap-3 transition-all shadow-xl shadow-blue-900/20 cursor-pointer border-none"
          >
            <Plus size={20} /> Nouveau Document
          </button>
        </div>

        {/* DASHBOARD STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Actifs" value={stats.approved} total={stats.total} color="blue" icon={ShieldCheck} />
          <StatCard label="En Attente" value={stats.pending} color="amber" icon={Clock} alert={stats.pending > 0} />
          <StatCard label="Retards" value={stats.overdue} color="red" icon={AlertCircle} alert={stats.overdue > 0} />
          <StatCard label="À Revoir (30j)" value={stats.toReviewSoon} color="purple" icon={Calendar} />
        </div>

        {/* BARRE D'OUTILS & FILTRES */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap lg:flex-nowrap gap-4 items-center w-full">
            {/* Recherche */}
            <div className="flex-1 relative group min-w-62.5 w-full lg:w-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={20} />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                placeholder="Recherche par référence, titre..."
                className="w-full bg-black/40 border-2 border-white/10 rounded-3xl py-4 pl-14 pr-4 text-xs font-bold uppercase outline-none focus:border-blue-500/50 transition-all text-white placeholder-slate-600"
              />
            </div>

            {/* Filtre Catégorie */}
            <select
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value as DocumentCategory | "ALL" }))}
              className="bg-black/40 border-2 border-white/10 rounded-3xl px-5 py-4 text-[10px] font-black uppercase outline-none focus:border-blue-500 text-white cursor-pointer transition-colors"
            >
              <option value="ALL">Toutes Catégories</option>
              <option value="PROCEDURE">Procédures</option>
              <option value="MANUEL">Manuels</option>
              <option value="NORME">Normes</option>
              <option value="ENREGISTREMENT">Enregistrements</option>
            </select>

            {/* Filtre Rapide : Revues en retard */}
            <button
              onClick={() => setFilters((f) => ({ ...f, dateRange: f.dateRange === "overdue" ? "all" : "overdue" }))}
              className={cn(
                "px-5 py-4 rounded-3xl text-[10px] font-black uppercase border-2 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0",
                filters.dateRange === "overdue" ? "bg-red-500/20 border-red-500 text-red-400" : "bg-black/40 border-white/10 hover:border-white/20 text-slate-300"
              )}
            >
              <AlertTriangle size={16} /> Revues en retard
            </button>

            {/* Bascule de Vue (Grille/Liste) */}
            <div className="hidden sm:flex bg-black/40 rounded-3xl p-1 border-2 border-white/10 shrink-0">
              <button onClick={() => setViewMode("grid")} className={cn("p-3 rounded-xl transition-all cursor-pointer border-none", viewMode === "grid" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white hover:bg-white/5")}>
                <LayoutGrid size={20} />
              </button>
              <button onClick={() => setViewMode("list")} className={cn("p-3 rounded-xl transition-all cursor-pointer border-none", viewMode === "list" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white hover:bg-white/5")}>
                <List size={20} />
              </button>
            </div>
          </div>

          {/* ACTIONS GROUPÉES */}
          {selectedDocs.size > 0 && (
            <div className="flex items-center gap-4 bg-blue-600/10 border-2 border-blue-500/20 rounded-3xl px-6 py-4 animate-in slide-in-from-top-4">
              <span className="text-xs font-black uppercase text-blue-400">
                {selectedDocs.size} document(s) sélectionné(s)
              </span>
              <div className="h-6 w-0.5 bg-blue-500/30 mx-2" />
              <button onClick={handleBulkDownload} className="text-xs font-black uppercase text-blue-400 hover:text-white flex items-center gap-2 cursor-pointer transition-colors border-none bg-transparent">
                <Download size={16} /> <span className="hidden sm:inline">Télécharger Archive</span>
              </button>
              <button onClick={() => setSelectedDocs(new Set())} className="ml-auto text-xs font-black uppercase text-slate-500 hover:text-white cursor-pointer transition-colors border-none bg-transparent">
                <X size={20} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ZONE PRINCIPALE : LISTE DES DOCUMENTS */}
      <main className="max-w-400 mx-auto p-6 lg:p-10">
        <div className={cn("gap-6 lg:gap-8", viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col")}>
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="animate-spin text-blue-500" size={48} />
              <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest italic animate-pulse">Synchronisation GED...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-32 text-slate-500 border-2 border-dashed border-white/5 rounded-[3rem]">
              <Archive size={64} className="mb-6 opacity-20" />
              <p className="text-sm font-black uppercase tracking-widest m-0 italic">Aucun document trouvé</p>
            </div>
          ) : (
            documents.map((doc) => (
              <DocumentCard
                key={doc.DOC_Id}
                doc={doc}
                viewMode={viewMode}
                isSelected={selectedDocs.has(doc.DOC_Id)}
                onToggleSelect={() => toggleSelection(doc.DOC_Id)}
                onDownload={() => handleDownload(doc)}
                onPreview={() => setModalState({ type: "preview", doc })}
                onHistory={() => setModalState({ type: "history", doc })}
                onRevise={() => setModalState({ type: "revision", doc })}
                onApprove={() => setModalState({ type: "approve", doc })}
              />
            ))
          )}
        </div>
      </main>

      {/* RENDER DES MODALES */}
      {modalState.type === "create" && <CreateModal onClose={() => setModalState({ type: null, doc: null })} onSuccess={refetch} />}
      {modalState.type === "revision" && modalState.doc && <RevisionModal doc={modalState.doc} onClose={() => setModalState({ type: null, doc: null })} onSuccess={refetch} />}
      {modalState.type === "history" && modalState.doc && <HistoryModal doc={modalState.doc} onClose={() => setModalState({ type: null, doc: null })} onDownload={(versionId: string | undefined) => handleDownload(modalState.doc!, versionId)} />}
      {modalState.type === "preview" && modalState.doc && <PreviewModal doc={modalState.doc} onClose={() => setModalState({ type: null, doc: null })} onDownload={() => handleDownload(modalState.doc!)} />}
      {modalState.type === "approve" && modalState.doc && (
        <ApprovalModal
          doc={modalState.doc}
          onClose={() => setModalState({ type: null, doc: null })}
          onApprove={async (approved: any) => {
            const tid = toast.loading("Enregistrement de la décision...");
            try {
              await apiClient.post(`/documents/${modalState.doc!.DOC_Id}/versions/${modalState.doc!.DOC_Versions[0].DV_Id}/approve`, { approved });
              toast.success(approved ? "Document validé et rendu actif" : "Document rejeté", { id: tid });
              refetch();
              setModalState({ type: null, doc: null });
            } catch (e) {
              toast.error("Erreur critique lors de l'approbation", { id: tid });
            }
          }}
        />
      )}
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function StatCard({ label, value, total, color, icon: Icon, alert }: { label: string; value: number; total?: number; color: "blue" | "amber" | "red" | "purple"; icon: LucideIcon; alert?: boolean; }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-600/10 border-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.05)]",
    amber: "bg-amber-600/10 border-amber-500/20 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.05)]",
    red: "bg-red-600/10 border-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.05)]",
    purple: "bg-purple-600/10 border-purple-500/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.05)]",
  };

  return (
    <div className={cn("border-2 rounded-4xl p-5 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6 relative overflow-hidden", colors[color] || colors.blue)}>
      <div className={cn("p-4 rounded-2xl bg-current bg-opacity-10 shrink-0", `text-${color}-500`)}>
        <Icon size={24} className="text-current" />
      </div>
      <div className="z-10 relative">
        <p className="text-3xl lg:text-4xl font-black italic m-0 leading-none">
          {value} <span className="text-lg opacity-50">{total ? `/${total}` : ""}</span>
        </p>
        <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-2 m-0 leading-tight">
          {label}
        </p>
      </div>
      {alert && <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-current animate-pulse shadow-[0_0_10px_currentColor]" />}
      <div className="absolute -right-6 -bottom-6 opacity-[0.03] scale-150 pointer-events-none">
        <Icon size={120} />
      </div>
    </div>
  );
}

function DocumentCard({ doc, viewMode, isSelected, onToggleSelect, onDownload, onPreview, onHistory, onRevise, onApprove }: any) {
  const latestVersion = doc.DOC_Versions[0];
  const isOverdue = doc.DOC_NextReviewDate ? isPast(new Date(doc.DOC_NextReviewDate)) && doc.DOC_Status !== "OBSOLETE" : false;
  const theme = STATUS_THEMES[doc.DOC_Status as DocumentStatus] || STATUS_THEMES.DRAFT;

  // Vue LISTE
  if (viewMode === "list") {
    return (
      <div className={cn("bg-black/40 border-2 rounded-4xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-6 transition-all hover:border-blue-500/30", isSelected ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-900/10" : "border-white/5", doc.DOC_Status === "OBSOLETE" && "opacity-50")}>
        <div className="flex items-center gap-4 w-full sm:w-auto shrink-0">
          <input type="checkbox" checked={isSelected} onChange={onToggleSelect} className="w-6 h-6 rounded border-2 border-white/20 bg-transparent checked:bg-blue-600 cursor-pointer shrink-0 accent-blue-600" />
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/20 flex items-center justify-center shrink-0">
            <FileText size={24} className="text-blue-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-lg">
              {doc.DOC_Reference}
            </span>
            <span className={cn("text-[9px] px-3 py-1 rounded-full font-black uppercase border tracking-widest flex items-center gap-1.5", theme.bg, theme.text, theme.border)}>
              <theme.icon size={12} /> {theme.label}
            </span>
            {isOverdue && <span className="text-[9px] bg-red-600 text-white px-3 py-1 rounded-full font-black uppercase shadow-lg shadow-red-900/20 tracking-widest">En Retard</span>}
          </div>
          <h3 className="text-lg lg:text-xl font-black uppercase italic text-white truncate m-0">
            {doc.DOC_Title}
          </h3>
          <p className="text-[10px] text-slate-500 truncate mt-1 m-0 italic">
            {doc.DOC_Description || "Aucune description analytique."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-[10px] font-bold text-slate-400 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-left sm:text-right">
            <p className="text-white text-xs mb-1">v{latestVersion?.DV_VersionNumber}.0</p>
            <p className="tracking-widest">{format(new Date(doc.DOC_UpdatedAt), "dd/MM/yyyy")}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onPreview} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-white border-none" title="Prévisualiser"><Eye size={18} /></button>
            <button onClick={onHistory} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-white border-none" title="Historique"><History size={18} /></button>
            <button onClick={onDownload} className="p-3 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl transition-colors cursor-pointer border-none" title="Télécharger"><Download size={18} /></button>
            {doc.DOC_Status === "APPROVED" && <button onClick={onRevise} className="p-3 bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white rounded-xl transition-colors cursor-pointer border-none" title="Réviser"><FileEdit size={18} /></button>}
            {doc.DOC_Status === "PENDING_REVIEW" && <button onClick={onApprove} className="p-3 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl transition-colors cursor-pointer border-none" title="Approuver"><CheckSquare size={18} /></button>}
          </div>
        </div>
      </div>
    );
  }

  // Vue GRILLE
  return (
    <div className={cn("bg-black/40 border-2 rounded-[2.5rem] p-8 transition-all hover:border-blue-500/30 relative group flex flex-col", isSelected ? "border-blue-500 bg-blue-500/5 shadow-xl shadow-blue-900/10" : "border-white/5", doc.DOC_Status === "OBSOLETE" && "opacity-60")}>
      <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={onToggleSelect} className={cn("p-2.5 rounded-full transition-all cursor-pointer border-none", isSelected ? "bg-blue-600 text-white shadow-lg" : "bg-white/10 hover:bg-blue-600 text-white")}>
          <CheckSquare size={18} />
        </button>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-linear-to-br from-blue-600/20 to-blue-800/20 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 shrink-0">
            <FileText size={32} />
          </div>
          <div className="min-w-0 pr-8">
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] block mb-1">
              {doc.DOC_Category}
            </span>
            <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-lg">
              {doc.DOC_Reference}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className={cn("px-3 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-widest flex items-center gap-1.5", theme.bg, theme.text, theme.border)}>
          <theme.icon size={12} /> {theme.label}
        </div>
      </div>

      <h3 className="text-xl font-black uppercase italic text-white mb-3 leading-tight line-clamp-2 min-h-12.5 m-0" title={doc.DOC_Title}>
        {doc.DOC_Title}
      </h3>

      <p className="text-xs text-slate-500 font-bold mb-8 line-clamp-2 uppercase leading-relaxed italic m-0 flex-1" title={doc.DOC_Description}>
        {doc.DOC_Description || "Aucune description analytique disponible pour ce document qualité."}
      </p>

      {/* Métadonnées ISO */}
      <div className="space-y-3 mb-8 bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
          <span className="text-slate-500 flex items-center gap-2"><User size={14} /> Pilote</span>
          <span className="text-white truncate max-w-30">{doc.DOC_Owner?.U_FirstName} {doc.DOC_Owner?.U_LastName}</span>
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
          <span className="text-slate-500 flex items-center gap-2"><RefreshCw size={14} /> Version</span>
          <span className="text-blue-400 font-black">v{latestVersion?.DV_VersionNumber}.0</span>
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
          <span className="text-slate-500 flex items-center gap-2"><Calendar size={14} /> Revue</span>
          <span className={cn(isOverdue ? "text-red-400 font-black bg-red-500/10 px-2 py-0.5 rounded" : "text-slate-300")}>
            {doc.DOC_NextReviewDate ? format(new Date(doc.DOC_NextReviewDate), "dd MMM yyyy", { locale: fr }) : "N/A"}
          </span>
        </div>
      </div>

      {/* Boutons d'Action Rapide */}
      <div className="flex flex-wrap gap-2 pt-5 border-t-2 border-white/5">
        <button onClick={onPreview} className="flex-1 min-w-15 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 cursor-pointer text-white border-none" title="Prévisualiser"><Eye size={16} /></button>
        <button onClick={onHistory} className="flex-1 min-w-15 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 cursor-pointer text-white border-none" title="Historique"><History size={16} /></button>
        <button onClick={onDownload} className="flex-1 min-w-15 py-4 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 cursor-pointer border-none" title="Télécharger"><Download size={16} /></button>
        {doc.DOC_Status === "APPROVED" && <button onClick={onRevise} className="w-full py-4 mt-1 bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 cursor-pointer border-none"><FileEdit size={16} /> Réviser</button>}
        {doc.DOC_Status === "PENDING_REVIEW" && <button onClick={onApprove} className="w-full py-4 mt-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 cursor-pointer border-none shadow-lg shadow-emerald-900/20"><CheckSquare size={16} /> Approuver</button>}
      </div>
    </div>
  );
}

// ==========================================
// MODALES ISO 9001
// ==========================================

function CreateModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void; }) {
  const [form, setForm] = useState({ DOC_Title: "", DOC_Description: "", DOC_Category: "PROCEDURE" as DocumentCategory, DOC_ReviewFrequencyMonths: 12, DOC_Tags: [] as string[] });
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragActive(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const validateAndSetFile = (f: File) => {
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(f.type)) return toast.error("Format non accepté (PDF ou DOCX uniquement).");
    if (f.size > 10 * 1024 * 1024) return toast.error("Le fichier dépasse la limite de 10MB.");
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !form.DOC_Title) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("DOC_Title", form.DOC_Title);
    formData.append("DOC_Description", form.DOC_Description);
    formData.append("DOC_Category", form.DOC_Category);
    formData.append("DOC_ReviewFrequencyMonths", form.DOC_ReviewFrequencyMonths.toString());
    form.DOC_Tags.forEach((tag) => formData.append("DOC_Tags[]", tag));

    const tid = toast.loading("Création du document en cours...");
    try {
      await apiClient.post("/documents", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Document créé et soumis pour validation.", { id: tid });
      onSuccess(); onClose();
    } catch (e) {
      toast.error("Échec de la création du document.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.DOC_Tags.includes(tagInput.trim())) {
      setForm((f) => ({ ...f, DOC_Tags: [...f.DOC_Tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#0B0F1A]/95 backdrop-blur-md p-4 lg:p-6">
      <div className="bg-[#151B2B] border-2 border-white/10 w-full max-w-2xl rounded-[3rem] p-8 lg:p-10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-8 border-b-2 border-white/5 pb-6">
          <h2 className="text-2xl lg:text-3xl font-black uppercase italic text-white flex items-center gap-4 m-0">
            <ShieldCheck className="text-blue-500" size={32} /> Nouveau Document
          </h2>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white border-none shrink-0">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
            className={cn("border-2 border-dashed rounded-[2.5rem] p-10 lg:p-14 text-center cursor-pointer transition-all", dragActive ? "border-blue-500 bg-blue-500/10 scale-[1.02]" : "border-white/20 hover:border-blue-500/50 hover:bg-white/5", file ? "bg-emerald-500/10 border-emerald-500/50" : "")}
          >
            <UploadCloud className={cn("mx-auto mb-4 transition-colors", file ? "text-emerald-500" : "text-blue-500")} size={56} />
            <p className="text-lg font-black uppercase italic text-white mb-2 m-0">{file ? file.name : "Glissez votre fichier ici"}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest m-0">PDF ou Word • Max 10MB</p>
            <input id="file-upload" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 ml-2">Titre du Document *</label>
              <input required value={form.DOC_Title} onChange={(e) => setForm((f) => ({ ...f, DOC_Title: e.target.value }))} className="w-full bg-black/40 border-2 border-white/10 rounded-3xl p-5 text-white font-black italic uppercase outline-none focus:border-blue-500 transition-all text-sm" placeholder="Ex: Procédure d'audit interne..." />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 ml-2">Catégorie ISO</label>
              <select value={form.DOC_Category} onChange={(e) => setForm((f) => ({ ...f, DOC_Category: e.target.value as DocumentCategory }))} className="w-full bg-black/40 border-2 border-white/10 rounded-3xl p-5 text-white font-black uppercase text-xs outline-none focus:border-blue-500 cursor-pointer appearance-none transition-colors">
                <option value="PROCEDURE" className="bg-[#0B0F1A]">Procédure</option>
                <option value="MANUEL" className="bg-[#0B0F1A]">Manuel Qualité</option>
                <option value="INSTRUCTION" className="bg-[#0B0F1A]">Instruction</option>
                <option value="ENREGISTREMENT" className="bg-[#0B0F1A]">Enregistrement</option>
                <option value="NORME" className="bg-[#0B0F1A]">Norme / Externe</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 ml-2">Revue (Mois)</label>
              <input type="number" min="1" max="60" value={form.DOC_ReviewFrequencyMonths} onChange={(e) => setForm((f) => ({ ...f, DOC_ReviewFrequencyMonths: parseInt(e.target.value) || 12 }))} className="w-full bg-black/40 border-2 border-white/10 rounded-3xl p-5 text-white font-black uppercase text-xs outline-none focus:border-blue-500 transition-colors" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 ml-2">Description / Finalité *</label>
              <textarea required value={form.DOC_Description} onChange={(e) => setForm((f) => ({ ...f, DOC_Description: e.target.value }))} className="w-full bg-black/40 border-2 border-white/10 rounded-3xl p-5 text-white font-bold italic outline-none focus:border-blue-500 min-h-30 resize-y transition-colors text-sm" placeholder="Décrivez l'objectif et le périmètre d'application..." />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 ml-2">Étiquettes de classement</label>
              <div className="flex flex-wrap gap-2 mb-4 bg-black/20 p-4 rounded-3xl min-h-15 border border-white/5">
                {form.DOC_Tags.length === 0 && <span className="text-slate-600 italic text-xs mt-1">Aucun tag ajouté...</span>}
                {form.DOC_Tags.map((tag) => (
                  <span key={tag} className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border border-blue-500/30">
                    {tag} <button type="button" onClick={() => setForm((f) => ({ ...f, DOC_Tags: f.DOC_Tags.filter((t) => t !== tag) }))} className="cursor-pointer hover:text-white border-none bg-transparent"><X size={14} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} className="flex-1 bg-black/40 border-2 border-white/10 rounded-3xl p-5 text-white font-black uppercase text-xs outline-none focus:border-blue-500 transition-colors" placeholder="Ex: SÉCURITÉ, AUDIT..." />
                <button type="button" onClick={addTag} className="px-8 bg-white/10 hover:bg-white/20 rounded-3xl font-black uppercase text-xs transition-colors cursor-pointer text-white border-none">Ajouter</button>
              </div>
            </div>
          </div>

          <button type="submit" disabled={!file || loading} className="w-full bg-linear-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 py-6 rounded-4xl text-xs lg:text-sm font-black uppercase italic shadow-2xl shadow-blue-900/40 transition-all flex justify-center items-center gap-3 text-white cursor-pointer border-none mt-4">
            {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />} Soumettre pour Validation
          </button>
        </form>
      </div>
    </div>
  );
}

function RevisionModal({ doc, onClose, onSuccess }: any) {
  const [changeDesc, setChangeDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !changeDesc) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("changeDescription", changeDesc);

    const tid = toast.loading("Création de la nouvelle révision...");
    try {
      await apiClient.post(`/documents/${doc.DOC_Id}/revise`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`Version ${doc.DOC_Versions[0].DV_VersionNumber + 1}.0 soumise.`, { id: tid });
      onSuccess(); onClose();
    } catch (e) {
      toast.error("Échec de la révision.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#0B0F1A]/95 backdrop-blur-md p-4 lg:p-6">
      <div className="bg-[#151B2B] border-2 border-white/10 w-full max-w-2xl rounded-[3rem] p-8 lg:p-10 shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b-2 border-white/5 pb-6">
          <h2 className="text-2xl lg:text-3xl font-black uppercase italic text-white flex items-center gap-4 m-0">
            <GitCompare className="text-amber-500" size={32} /> Révision ISO
          </h2>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer text-white border-none shrink-0"><X size={24} /></button>
        </div>

        <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-4xl p-6 mb-8 text-left">
          <p className="text-[11px] font-black text-amber-400 uppercase tracking-widest mb-3 m-0">Actuel : {doc.DOC_Reference} (v{doc.DOC_Versions[0].DV_VersionNumber}.0)</p>
          <p className="text-xs text-amber-200/80 italic font-medium m-0 leading-relaxed">
            La soumission générera la version <strong>{doc.DOC_Versions[0].DV_VersionNumber + 1}.0</strong>. L&apos;ancienne version restera active jusqu&apos;à l&apos;approbation formelle de cette révision.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-2">Motif de la modification (Requis) *</label>
            <textarea required value={changeDesc} onChange={(e) => setChangeDesc(e.target.value)} className="w-full bg-black/40 border-2 border-white/10 rounded-3xl p-5 text-white font-bold italic outline-none focus:border-amber-500 h-32 resize-y transition-colors text-sm" placeholder="Détaillez les paragraphes modifiés et la raison métier..." />
          </div>

          <div onClick={() => document.getElementById("revise-file")?.click()} className={cn("border-2 border-dashed rounded-[2.5rem] p-12 text-center transition-all cursor-pointer", file ? "border-amber-500 bg-amber-500/10" : "border-white/20 hover:border-amber-500/50 hover:bg-white/5")}>
            <UploadCloud className={cn("mx-auto mb-4 transition-colors", file ? "text-amber-500" : "text-slate-500")} size={48} />
            <p className="text-sm lg:text-base font-black uppercase text-white m-0">{file ? file.name : "Importer le fichier mis à jour"}</p>
            <input id="revise-file" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
            <button type="button" onClick={onClose} className="w-full sm:w-1/3 py-5 rounded-4xl border-2 border-white/10 font-black uppercase text-xs hover:bg-white/5 transition-all text-white cursor-pointer bg-transparent">Annuler</button>
            <button type="submit" disabled={!file || !changeDesc || loading} className="w-full sm:w-2/3 bg-linear-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 py-5 rounded-4xl font-black uppercase text-xs transition-all flex justify-center items-center gap-3 text-white cursor-pointer border-none shadow-xl shadow-amber-900/20">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />} Publier v{doc.DOC_Versions[0].DV_VersionNumber + 1}.0
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HistoryModal({ doc, onClose, onDownload }: any) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#0B0F1A]/95 backdrop-blur-md p-4 lg:p-6">
      <div className="bg-[#151B2B] border-2 border-white/10 w-full max-w-3xl rounded-[3rem] p-8 lg:p-10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-start mb-10 border-b-2 border-white/5 pb-6 sticky top-0 bg-[#151B2B] z-10 pt-2">
          <div>
            <h2 className="text-3xl font-black uppercase italic text-white flex items-center gap-4 m-0">
              <History className="text-blue-500" size={32} /> Historique des Révisions
            </h2>
            <p className="text-blue-400 text-xs font-black uppercase tracking-widest mt-3 m-0 bg-blue-500/10 inline-block px-3 py-1 rounded-lg border border-blue-500/20">
              {doc.DOC_Reference}
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer text-white border-none shrink-0"><X size={24} /></button>
        </div>

        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-10 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-white/5">
          {doc.DOC_Versions.map((version: DocumentVersion, index: number) => {
            const isLatest = index === 0;
            return (
              <div key={version.DV_Id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                {/* Timeline dot */}
                <div className={cn("flex items-center justify-center w-8 h-8 rounded-full border-4 border-[#151B2B] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-10 md:left-1/2 -translate-x-1/2", isLatest ? "bg-blue-500" : "bg-slate-600")} />
                
                {/* Card */}
                <div className="w-[calc(100%-5rem)] md:w-[calc(50%-2.5rem)] ml-20 md:ml-0 bg-black/40 border-2 border-white/5 rounded-4xl p-6 lg:p-8 hover:border-blue-500/30 transition-all text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                    <div>
                      <h3 className="text-xl font-black uppercase italic text-white m-0 flex items-center gap-3">
                        V{version.DV_VersionNumber}.0 {isLatest && <span className="bg-blue-600 text-[9px] px-2 py-0.5 rounded-full not-italic">Actuelle</span>}
                      </h3>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 m-0">
                        {format(new Date(version.DV_CreatedAt), "dd MMM yyyy • HH:mm", { locale: fr })}
                      </p>
                    </div>
                    <span className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border tracking-widest shrink-0", version.DV_Status === "APPROVED" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : version.DV_Status === "PENDING_REVIEW" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-slate-500/10 border-slate-500/30 text-slate-400")}>
                      {version.DV_Status === "APPROVED" ? "Approuvée" : version.DV_Status === "PENDING_REVIEW" ? "En Revue" : "Brouillon"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 italic mb-6 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 m-0">
                    &quot;{version.DV_ChangeDescription || "Création initiale"}&quot;
                  </p>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-4 border-t border-white/5">
                    <div className="flex flex-col gap-2">
                      <span className="flex items-center gap-2"><User size={14} className="text-slate-400"/> {version.DV_CreatedBy.U_FirstName} {version.DV_CreatedBy.U_LastName}</span>
                      {version.DV_ApprovedBy && <span className="flex items-center gap-2 text-emerald-400"><CheckCircle2 size={14} /> Validé par {version.DV_ApprovedBy.U_FirstName}</span>}
                    </div>
                    <button onClick={() => onDownload(version.DV_Id)} className="w-full sm:w-auto bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border-none shrink-0"><Download size={14} /> Fichier</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ doc, onClose, onDownload }: any) {
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const res = await apiClient.get(`/documents/${doc.DOC_Id}/preview`, { responseType: "blob" });
        const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
        setPdfUrl(url);
      } catch (e) {
        toast.error("Format non supporté pour la prévisualisation web.");
      } finally { setLoading(false); }
    };
    loadPreview();
    return () => { if (pdfUrl) window.URL.revokeObjectURL(pdfUrl); };
  }, [doc.DOC_Id, pdfUrl]);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#0B0F1A]/95 backdrop-blur-md p-2 lg:p-6">
      <div className="bg-[#151B2B] border-2 border-white/10 w-full max-w-300 h-[95vh] rounded-4xl lg:rounded-[3rem] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 lg:p-8 border-b-2 border-white/5 bg-black/20 shrink-0 gap-4">
          <div className="min-w-0 pr-4">
            <h2 className="text-xl lg:text-2xl font-black uppercase italic text-white m-0 truncate" title={doc.DOC_Title}>{doc.DOC_Title}</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2 m-0 flex items-center gap-2">
              <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">V{doc.DOC_Versions[0].DV_VersionNumber}.0</span> • {doc.DOC_Reference}
            </p>
          </div>
          <div className="flex gap-3 shrink-0 w-full sm:w-auto">
            <button onClick={onDownload} className="flex-1 sm:flex-none px-6 py-4 bg-linear-to-r from-blue-600 to-blue-800 rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-2 hover:from-blue-500 hover:to-blue-700 transition-all cursor-pointer text-white border-none shadow-lg">
              <Download size={18} /> Télécharger
            </button>
            <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors cursor-pointer text-white border-none flex items-center justify-center shrink-0">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-[#090C15] relative overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-blue-500" size={48} />
              <p className="text-xs font-black uppercase tracking-widest text-blue-500 italic animate-pulse m-0">Rendu Sécurisé ISO...</p>
            </div>
          ) : pdfUrl ? (
            <iframe src={pdfUrl} className="w-full h-full border-none" title={doc.DOC_Title} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4">
              <Eye size={48} className="opacity-20" />
              <p className="text-xs font-black uppercase tracking-widest m-0">Aperçu indisponible. Veuillez télécharger le fichier.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ApprovalModal({ doc, onClose, onApprove }: any) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async (approved: boolean) => {
    setLoading(true);
    await onApprove(approved);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#0B0F1A]/95 backdrop-blur-md p-4 lg:p-6">
      <div className="bg-[#151B2B] border-2 border-white/10 w-full max-w-xl rounded-[3rem] p-8 lg:p-10 shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b-2 border-white/5 pb-6">
          <h2 className="text-2xl lg:text-3xl font-black uppercase italic text-white flex items-center gap-4 m-0">
            <ShieldCheck className="text-emerald-500" size={32} /> Validation ISO
          </h2>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer text-white border-none shrink-0"><X size={24} /></button>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-4xl p-6 lg:p-8 mb-8 text-left">
          <h3 className="text-xl font-black uppercase italic text-white mb-4 m-0 line-clamp-2">{doc.DOC_Title}</h3>
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest m-0 flex justify-between">
              <span>Version à valider:</span> <span className="text-blue-400 font-black">v{doc.DOC_Versions[0].DV_VersionNumber}.0</span>
            </p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest m-0 flex justify-between">
              <span>Auteur initial:</span> <span className="text-white">{doc.DOC_Versions[0].DV_CreatedBy.U_FirstName} {doc.DOC_Versions[0].DV_CreatedBy.U_LastName}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => handleApprove(false)} disabled={loading} className="w-full py-5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-4xl font-black uppercase text-xs tracking-widest transition-all flex justify-center items-center gap-3 cursor-pointer disabled:opacity-50">
            <XSquare size={20} /> Rejeter
          </button>
          <button onClick={() => handleApprove(true)} disabled={loading} className="w-full py-5 bg-linear-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white rounded-4xl font-black uppercase text-xs tracking-widest transition-all flex justify-center items-center gap-3 cursor-pointer border-none shadow-xl shadow-emerald-900/20 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckSquare size={20} />} Approuver
          </button>
        </div>
      </div>
    </div>
  );
}