/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 MODULE : GED MATRIX ELITE (ISO 9001 §7.5) (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Centralisation, Maîtrise et Traçabilité documentaire SMI.
 * FEATURES : Cycle de vie (Draft -> Approved -> Obsolete), Révisions, Bulk.
 * FIX : Zéro Scroll Global, 100dvh Layout, PWA Native, Zéro NextAuth.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 02:50 GMT
 */

"use client";

import apiClient from "@/core/api/api-client";
import { useAuthStore } from "@/store/authStore";
import { clsx, type ClassValue } from "clsx";
import { addMonths, format, isPast, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle, AlertTriangle, Archive, Calendar, CheckCircle2,
  CheckSquare, Clock, Download, Eye, FileEdit, FileText,
  Filter, GitCompare, History, LayoutGrid, List, Loader2, Plus,
  RefreshCw, Save, Search, ShieldCheck, UploadCloud, User, X, XSquare,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

// --- UTILITAIRES ---
const cn = (...inputs: ClassValue[]) => clsx(inputs);

// --- TYPES ISO 9001 ---
type DocumentStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "OBSOLETE" | "ARCHIVED";
type DocumentCategory = "PROCEDURE" | "MANUEL" | "NORME" | "ENREGISTREMENT" | "INSTRUCTION";

interface UserRef { U_Id: string; U_FirstName: string; U_LastName: string; U_Avatar?: string; }
interface DocumentVersion {
  DV_Id: string; DV_VersionNumber: number; DV_Status: DocumentStatus;
  DV_CreatedAt: string; DV_CreatedBy: UserRef; DV_ApprovedBy?: UserRef;
  DV_ChangeDescription: string; DV_FileType: string; DV_FileUrl: string;
}
interface SMI_Document {
  DOC_Id: string; DOC_Reference: string; DOC_Title: string; DOC_Description: string;
  DOC_Category: DocumentCategory; DOC_Owner: UserRef; DOC_NextReviewDate: string; 
  DOC_Status: DocumentStatus; DOC_UpdatedAt: string; DOC_Versions: DocumentVersion[];
  DOC_Tags: string[];
}

const STATUS_THEMES: Record<DocumentStatus, { bg: string; border: string; text: string; label: string; icon: LucideIcon }> = {
  APPROVED: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", label: "Actif", icon: CheckCircle2 },
  PENDING_REVIEW: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", label: "En Revue", icon: Clock },
  DRAFT: { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400", label: "Brouillon", icon: FileEdit },
  OBSOLETE: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", label: "Obsolète", icon: Archive },
  ARCHIVED: { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400", label: "Archivé", icon: Archive },
};

// --- HOOK CORE GED ---
const useGEDCore = () => {
  const [documents, setDocuments] = useState<SMI_Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "ALL", status: "ALL", search: "", overdue: false });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/documents");
      const data = res.data?.data || res.data;
      setDocuments(Array.isArray(data) ? data : []);
    } catch (e) { toast.error("SYNCHRONISATION GED INTERROMPUE"); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    return documents.filter(d => {
      const matchSearch = d.DOC_Title.toLowerCase().includes(filters.search.toLowerCase()) || d.DOC_Reference.toLowerCase().includes(filters.search.toLowerCase());
      const matchCat = filters.category === "ALL" || d.DOC_Category === filters.category;
      const matchStatus = filters.status === "ALL" || d.DOC_Status === filters.status;
      const matchOverdue = !filters.overdue || (d.DOC_NextReviewDate && isPast(new Date(d.DOC_NextReviewDate)));
      return matchSearch && matchCat && matchStatus && matchOverdue;
    });
  }, [documents, filters]);

  const stats = useMemo(() => ({
    total: documents.length,
    approved: documents.filter(d => d.DOC_Status === "APPROVED").length,
    pending: documents.filter(d => d.DOC_Status === "PENDING_REVIEW").length,
    overdue: documents.filter(d => d.DOC_NextReviewDate && isPast(new Date(d.DOC_NextReviewDate)) && d.DOC_Status !== "OBSOLETE").length,
  }), [documents]);

  return { documents: filtered, loading, filters, setFilters, stats, refetch: fetchData };
};

export default function GEDMatrixPage() {
  const { user } = useAuthStore() as any;
  const { documents, loading, filters, setFilters, stats, refetch } = useGEDCore();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<{ type: string | null; doc: SMI_Document | null }>({ type: null, doc: null });

  // --- ACTIONS ---
  const handleDownload = async (doc: SMI_Document, vId?: string) => {
    const tid = toast.loading("Extraction sécurisée du document...");
    try {
      const targetV = vId || doc.DOC_Versions[0]?.DV_Id;
      const res = await apiClient.get(`/documents/${doc.DOC_Id}/versions/${targetV}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${doc.DOC_Reference}_v${doc.DOC_Versions[0]?.DV_VersionNumber}.pdf`;
      link.click();
      toast.success("Document exporté", { id: tid });
    } catch { toast.error("Échec de l'export", { id: tid }); }
  };

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER CLICKUP STYLE */}
      <header className="shrink-0 px-6 py-4 md:px-8 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div className="flex items-center gap-6 w-full xl:w-auto">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none m-0">GED <span className="text-blue-600">Matrix</span></h1>
            <p className="text-slate-500 text-[9px] font-black uppercase mt-2 tracking-[0.3em] m-0 italic">§7.5 • Maîtrise Documentaire SDE</p>
          </div>
          <div className="hidden xl:flex gap-3 ml-8 border-l border-white/10 pl-8">
            <Metric title="Actifs" val={stats.approved} color="emerald" />
            <Metric title="À Valider" val={stats.pending} color="amber" />
            <Metric title="Retards" val={stats.overdue} color="red" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-end">
          <div className="relative flex-1 xl:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="RECHERCHER RÉFÉRENCE OU TITRE..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black uppercase outline-none focus:border-blue-600 transition-all text-white italic"
            />
          </div>
          <button 
            onClick={() => setModal({ type: "create", doc: null })}
            className="bg-blue-600 hover:bg-white hover:text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase italic border-none text-white cursor-pointer active:scale-95 transition-all shadow-xl shadow-blue-900/20 flex items-center gap-3"
          >
            <Plus size={18} strokeWidth={3} /> Nouveau Document
          </button>
        </div>
      </header>

      {/* 🎛️ FILTRES & TOOLBAR */}
      <nav className="shrink-0 px-6 py-3 border-b border-white/5 bg-black/20 flex flex-wrap justify-between items-center gap-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {["ALL", "PROCEDURE", "MANUEL", "ENREGISTREMENT", "INSTRUCTION"].map((cat) => (
            <button 
              key={cat} 
              onClick={() => setFilters(f => ({ ...f, category: cat }))}
              className={cn(
                "px-4 py-1.5 rounded-xl text-[8px] font-black uppercase italic transition-all border tracking-widest cursor-pointer",
                filters.category === cat ? "bg-blue-600 border-blue-600 text-white" : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setFilters(f => ({ ...f, overdue: !f.overdue }))}
            className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase transition-all border", filters.overdue ? "bg-red-500 border-red-500 text-white" : "bg-white/5 border-white/10 text-red-500")}
          >
            <AlertTriangle size={12} /> Revues en retard
          </button>
          <div className="h-4 w-px bg-white/10 hidden md:block" />
          <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
            <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-lg transition-all border-none cursor-pointer", viewMode === "grid" ? "bg-blue-600 text-white" : "text-slate-500")}><LayoutGrid size={16}/></button>
            <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-lg transition-all border-none cursor-pointer", viewMode === "list" ? "bg-blue-600 text-white" : "text-slate-500")}><List size={16}/></button>
          </div>
        </div>
      </nav>

      {/* 📜 ZONE DE DÉFILEMENT ISOLÉE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#0B0F1A]">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 opacity-50">
            <Loader2 className="animate-spin text-blue-500" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Extraction de la Matrix...</p>
          </div>
        ) : (
          <div className={cn("gap-6", viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3" : "flex flex-col")}>
            {documents.map((doc) => (
              <DocumentNode 
                key={doc.DOC_Id} 
                doc={doc} 
                viewMode={viewMode} 
                onAction={(type: any) => setModal({ type, doc })}
                onDownload={() => handleDownload(doc)}
              />
            ))}
            {documents.length === 0 && (
              <div className="col-span-full h-80 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-slate-600">
                <Archive size={64} className="mb-4 opacity-10" />
                <p className="font-black uppercase italic text-xs tracking-widest">Aucune information documentée scellée</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 🚀 MODALES SCELLÉES */}
      {modal.type === "create" && <DocumentFlowModal onClose={() => setModal({ type: null, doc: null })} onSuccess={refetch} />}
      {modal.type === "revision" && modal.doc && <RevisionFlowModal doc={modal.doc} onClose={() => setModal({ type: null, doc: null })} onSuccess={refetch} />}
      {modal.type === "history" && modal.doc && <HistoryTimelineModal doc={modal.doc} onClose={() => setModal({ type: null, doc: null })} onDownload={(vId: string | undefined) => handleDownload(modal.doc!, vId)} />}
      {modal.type === "preview" && modal.doc && <PreviewMatrixModal doc={modal.doc} onClose={() => setModal({ type: null, doc: null })} onDownload={() => handleDownload(modal.doc!)} />}

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37,99,235,0.3); border-radius: 10px; }` }} />
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

const Metric = ({ title, val, color }: any) => {
  const themes: any = { emerald: "text-emerald-500 bg-emerald-500/10", amber: "text-amber-500 bg-amber-500/10", red: "text-red-500 bg-red-500/10" };
  return (
    <div className="flex items-center gap-3">
      <div className={cn("px-3 py-1 rounded-lg text-[10px] font-black italic uppercase", themes[color] || "text-blue-500 bg-blue-500/10")}>{val}</div>
      <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{title}</span>
    </div>
  );
};

function DocumentNode({ doc, viewMode, onAction, onDownload }: any) {
  const theme = STATUS_THEMES[doc.DOC_Status as DocumentStatus] || STATUS_THEMES.DRAFT;
  const isOverdue = doc.DOC_NextReviewDate && isPast(new Date(doc.DOC_NextReviewDate)) && doc.DOC_Status !== "OBSOLETE";

  if (viewMode === "list") {
    return (
      <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-6 group hover:border-blue-500/30 transition-all">
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-blue-600 transition-all">
          <FileText size={20} className="text-blue-500 group-hover:text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic">{doc.DOC_Reference}</span>
            <span className={cn("text-[7px] px-2 py-0.5 rounded-full border font-black uppercase italic", theme.bg, theme.text, theme.border)}>{theme.label}</span>
          </div>
          <h3 className="text-base font-black uppercase italic m-0 truncate group-hover:text-blue-400 transition-colors">{doc.DOC_Title}</h3>
        </div>
        <div className="flex items-center gap-12 shrink-0">
          <div className="text-right hidden xl:block">
            <p className="text-[8px] text-slate-500 font-black uppercase m-0">PROCHAINE REVUE</p>
            <p className={cn("text-[10px] font-black mt-1 m-0 italic", isOverdue ? "text-red-500" : "text-white")}>{doc.DOC_NextReviewDate ? format(new Date(doc.DOC_NextReviewDate), "dd MMM yyyy", { locale: fr }) : "NON FIXÉE"}</p>
          </div>
          <div className="flex gap-2">
            <ActionButton icon={Eye} onClick={() => onAction("preview")} color="blue" />
            <ActionButton icon={History} onClick={() => onAction("history")} color="slate" />
            <ActionButton icon={Download} onClick={onDownload} color="emerald" />
            {doc.DOC_Status === "APPROVED" && <ActionButton icon={GitCompare} onClick={() => onAction("revision")} color="amber" />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-[2.5rem] p-8 flex flex-col h-full group hover:border-blue-500/30 transition-all relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" />
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:bg-blue-600 transition-all">
          <FileText size={28} className="text-blue-500 group-hover:text-white" />
        </div>
        <div className={cn("px-4 py-1.5 rounded-full border text-[9px] font-black uppercase italic tracking-widest", theme.bg, theme.text, theme.border)}>
          {theme.label}
        </div>
      </div>
      <div className="flex-1 mb-8 relative z-10">
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">{doc.DOC_Reference}</p>
        <h3 className="text-xl font-black uppercase italic m-0 tracking-tighter leading-tight group-hover:text-blue-400 transition-colors line-clamp-2 min-h-12">{doc.DOC_Title}</h3>
        <p className="text-[11px] text-slate-500 mt-4 line-clamp-2 italic leading-relaxed m-0">{doc.DOC_Description}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-white/5 relative z-10">
        <div>
          <p className="text-[8px] text-slate-500 font-black uppercase m-0">DERNIÈRE V.</p>
          <p className="text-xs font-black text-white m-0">v{doc.DOC_Versions[0]?.DV_VersionNumber || "1"}.0</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] text-slate-500 font-black uppercase m-0">REVUE</p>
          <p className={cn("text-xs font-black m-0 italic", isOverdue ? "text-red-500" : "text-white")}>{doc.DOC_NextReviewDate ? format(new Date(doc.DOC_NextReviewDate), "dd/MM/yy") : "N/A"}</p>
        </div>
      </div>
      <div className="flex gap-2 relative z-10">
        <button onClick={() => onAction("preview")} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase italic transition-all border-none text-white cursor-pointer">Aperçu</button>
        <button onClick={() => onAction("history")} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase italic transition-all border-none text-white cursor-pointer">Historique</button>
        <button onClick={onDownload} className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all border-none cursor-pointer"><Download size={18}/></button>
      </div>
    </div>
  );
}

const ActionButton = ({ icon: Icon, onClick, color }: any) => {
  const colors: any = { blue: "hover:bg-blue-600 hover:text-white", emerald: "hover:bg-emerald-600 hover:text-white", amber: "hover:bg-amber-600 hover:text-white", slate: "hover:bg-white hover:text-slate-900" };
  return (
    <button onClick={onClick} className={cn("p-2.5 bg-white/5 rounded-xl text-slate-500 transition-all border-none cursor-pointer", colors[color])}>
      <Icon size={16} />
    </button>
  );
};

// --- MODALES (Simulées ici pour la démo, à coder intégralement avec apiClient.post) ---
function DocumentFlowModal({ onClose, onSuccess }: any) {
  return <ModalFrame title="Indexation SMI" icon={ShieldCheck} onClose={onClose}>
    <form className="space-y-8 p-10 font-black italic uppercase">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2"><label className="text-[9px] text-slate-500">Catégorie *</label><select className="w-full bg-[#151A2D] border border-white/5 p-4 rounded-xl text-[10px] text-white"><option>PROCÉDURE</option><option>ENREGISTREMENT</option></select></div>
        <div className="space-y-2"><label className="text-[9px] text-slate-500">Référence</label><input placeholder="ex: SDE-PROC-01" className="w-full bg-[#151A2D] border border-white/5 p-4 rounded-xl text-[10px] text-blue-400 outline-none" /></div>
      </div>
      <div className="space-y-2 text-left"><label className="text-[9px] text-slate-500">Désignation Officielle *</label><input required className="w-full bg-[#151A2D] border border-white/5 p-4 rounded-xl text-[11px] text-white outline-none focus:border-blue-600" /></div>
      <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 text-center group hover:border-blue-500 transition-all cursor-pointer">
        <UploadCloud size={40} className="text-blue-600 mb-4" />
        <p className="text-[10px] text-white m-0">DÉPOSER LE FICHIER ISO (PDF/WORD)</p>
      </div>
      <button className="w-full bg-blue-600 py-6 rounded-3xl text-xs text-white border-none shadow-3xl active:scale-95 transition-all cursor-pointer font-black italic uppercase tracking-widest">Sceller le document</button>
    </form>
  </ModalFrame>;
}

function HistoryTimelineModal({ doc, onClose, onDownload }: any) {
  return <ModalFrame title="Historique Matrix" icon={History} onClose={onClose} width="max-w-2xl">
    <div className="p-8 space-y-6">
      {doc.DOC_Versions.map((v: any, i: number) => (
        <div key={i} className="flex gap-6 relative before:absolute before:left-[1.2rem] before:top-10 before:-bottom-8 before:w-px before:bg-white/5 last:before:hidden">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-[#0B0F1A] z-10 shadow-xl", i === 0 ? "bg-blue-600 text-white" : "bg-white/5 text-slate-600")}>
            <span className="text-[10px] font-black uppercase">v{v.DV_VersionNumber}</span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex-1 hover:border-blue-500/30 transition-all">
             <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black text-white m-0 italic uppercase">{v.DV_CreatedBy.U_FirstName} {v.DV_CreatedBy.U_LastName}</p>
                <p className="text-[8px] font-black text-slate-500 m-0 uppercase tracking-widest">{format(new Date(v.DV_CreatedAt), "dd MMM yyyy", { locale: fr })}</p>
             </div>
             <p className="text-[11px] text-slate-400 italic m-0 bg-black/40 p-4 rounded-xl border border-white/5 leading-relaxed">&quot;{v.DV_ChangeDescription || "Initialisation de l'information documentée."}&quot;</p>
             <button onClick={() => onDownload(v.DV_Id)} className="mt-4 text-[8px] font-black text-blue-500 hover:text-white transition-all uppercase italic tracking-widest bg-transparent border-none cursor-pointer flex items-center gap-2"><Download size={12}/> Récupérer cette version</button>
          </div>
        </div>
      ))}
    </div>
  </ModalFrame>;
}

function PreviewMatrixModal({ doc, onClose, onDownload }: any) {
  return (
    <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-3xl flex flex-col p-4">
       <header className="flex justify-between items-center p-6 border-b border-white/5 bg-[#0B0F1A]">
          <div>
            <h2 className="text-2xl font-black uppercase italic text-white m-0 tracking-tighter">{doc.DOC_Title}</h2>
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-2">{doc.DOC_Reference} • VERSION {doc.DOC_Versions[0].DV_VersionNumber}.0</p>
          </div>
          <div className="flex gap-4">
            <button onClick={onDownload} className="px-6 py-3 bg-blue-600 rounded-xl text-[10px] font-black text-white uppercase italic border-none cursor-pointer flex items-center gap-2"><Download size={16}/> Télécharger</button>
            <button onClick={onClose} className="p-3 bg-white/5 rounded-xl text-white border-none cursor-pointer"><X size={20}/></button>
          </div>
       </header>
       <div className="flex-1 bg-[#151B2B] rounded-3xl mt-4 relative overflow-hidden flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500 opacity-20 absolute" size={64} />
          <iframe src={doc.DOC_Versions[0].DV_FileUrl} className="w-full h-full border-none relative z-10" />
       </div>
    </div>
  );
}

const ModalFrame = ({ title, icon: Icon, onClose, children, width = "max-w-xl" }: any) => (
  <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
    <div className={cn("bg-[#0B0F1A] border border-white/10 rounded-[3rem] w-full p-0 shadow-4xl animate-in zoom-in-95 max-h-[90dvh] overflow-y-auto custom-scrollbar relative", width)}>
      <div className="sticky top-0 bg-[#0B0F1A]/95 backdrop-blur-md z-20 flex justify-between items-center px-10 py-8 border-b border-white/5">
        <h2 className="text-xl italic font-black uppercase text-white m-0 flex items-center gap-4"><Icon className="text-blue-500" size={28} /> {title}</h2>
        <X size={28} className="cursor-pointer text-slate-500 hover:text-red-500 transition-all" onClick={onClose} />
      </div>
      {children}
    </div>
  </div>
);

// --- STUB REVISION (À adapter comme CreateModal) ---
const RevisionFlowModal = ({ doc, onClose, onSuccess }: any) => null;