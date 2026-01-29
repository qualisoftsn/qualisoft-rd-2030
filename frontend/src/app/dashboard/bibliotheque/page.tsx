/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// /frontend/src/app/dashboard/bibliotheque/page.tsx

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  UploadCloud, FileText, X, Save, Download, Trash2, 
  History, Search, Plus, ShieldCheck, ChevronRight, 
  AlertTriangle, FileEdit, CheckCircle2, Filter, Loader2,
  GitCompare, Eye, Clock, User, Calendar, Tag, MoreVertical,
  CheckSquare, XSquare, Archive, RefreshCw, AlertCircle,
  FileWarning, ChevronDown, LayoutGrid, List, Maximize2,
  Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, differenceInDays, addMonths, isPast, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';

// --- UTILITAIRE ---
function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// --- TYPES STRICTS ISO 9001 ---
type DocumentStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'OBSOLETE' | 'ARCHIVED';
type DocumentCategory = 'PROCEDURE' | 'MANUEL' | 'NORME' | 'ENREGISTREMENT' | 'INSTRUCTION';

interface UserRef {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Avatar?: string;
  U_Role?: string;
}

interface DocumentVersion {
  DV_Id: string;
  DV_VersionNumber: number;
  DV_Status: DocumentStatus;
  DV_CreatedAt: string;
  DV_CreatedBy: UserRef;
  DV_ApprovedBy?: UserRef;
  DV_ApprovedAt?: string;
  DV_ChangeDescription: string;
  DV_FileSize: number;
  DV_FileType: string;
  DV_FileName: string;
  DV_FileUrl: string;
}

interface SMI_Document {
  DOC_Id: string;
  DOC_Reference: string;
  DOC_Title: string;
  DOC_Description: string;
  DOC_Category: DocumentCategory;
  DOC_ProcessusId?: string;
  DOC_ProcessusName?: string;
  DOC_Owner: UserRef;
  DOC_Author?: UserRef;
  DOC_ReviewFrequencyMonths: number;
  DOC_NextReviewDate: string;
  DOC_Status: DocumentStatus;
  DOC_CreatedAt: string;
  DOC_UpdatedAt: string;
  DOC_Versions: DocumentVersion[];
  DOC_Tags: string[];
  DOC_Department?: string;
  DOC_SiteId?: string;
}

interface FilterState {
  category: 'ALL' | DocumentCategory;
  status: 'ALL' | DocumentStatus;
  processus: string;
  search: string;
  dateRange: 'all' | 'month' | 'quarter' | 'overdue';
  tags: string[];
}

// --- HOOK PERSONNALISÉ ---
const useDocumentLibrary = () => {
  const [documents, setDocuments] = useState<SMI_Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    category: 'ALL',
    status: 'ALL',
    processus: 'ALL',
    search: '',
    dateRange: 'all',
    tags: []
  });

  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category !== 'ALL') params.append('category', filters.category);
      if (filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.processus !== 'ALL') params.append('processus', filters.processus);
      if (filters.search) params.append('q', filters.search);
      if (filters.dateRange !== 'all') params.append('dateRange', filters.dateRange);
      
      const res = await apiClient.get(`/documents?${params.toString()}`);
      setDocuments(res.data);
    } catch (e) {
      toast.error("Échec de synchronisation GED");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // Debounce recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search) fetchDocs();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchDocs, filters.search]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: documents.length,
      approved: documents.filter(d => d.DOC_Status === 'APPROVED').length,
      pending: documents.filter(d => d.DOC_Status === 'PENDING_REVIEW').length,
      overdue: documents.filter(d => d.DOC_NextReviewDate && isPast(new Date(d.DOC_NextReviewDate)) && d.DOC_Status !== 'OBSOLETE').length,
      toReviewSoon: documents.filter(d => {
        if (!d.DOC_NextReviewDate) return false;
        const reviewDate = new Date(d.DOC_NextReviewDate);
        return isWithinInterval(reviewDate, { start: now, end: addMonths(now, 1) }) && d.DOC_Status === 'APPROVED';
      }).length
    };
  }, [documents]);

  return { documents, loading, filters, setFilters, stats, refetch: fetchDocs };
};

// --- COMPOSANT PRINCIPAL ---
export default function LibraryPage() {
  const { documents, loading, filters, setFilters, stats, refetch } = useDocumentLibrary();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  
  const [modalState, setModalState] = useState<{
    type: 'create' | 'revision' | 'history' | 'preview' | 'approve' | null;
    doc: SMI_Document | null;
  }>({ type: null, doc: null });

  const handleDownload = async (doc: SMI_Document, versionId?: string) => {
    try {
      const targetVersionId = versionId || doc.DOC_Versions[0]?.DV_Id;
      if (!targetVersionId) return toast.error("Aucune version disponible");

      toast.loading("Téléchargement...", { id: `dl-${doc.DOC_Id}` });
      
      const res = await apiClient.get(
        `/documents/${doc.DOC_Id}/versions/${targetVersionId}/download`,
        { responseType: 'blob' }
      );
      
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const ext = doc.DOC_Versions[0]?.DV_FileType || 'pdf';
      link.download = `${doc.DOC_Reference}_v${doc.DOC_Versions[0]?.DV_VersionNumber}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Téléchargement terminé", { id: `dl-${doc.DOC_Id}` });
    } catch (error) {
      toast.error("Échec du téléchargement", { id: `dl-${doc.DOC_Id}` });
    }
  };

  const handleBulkDownload = async () => {
    if (selectedDocs.size === 0) return;
    toast.loading("Préparation de l'archive...", { id: 'bulk' });
    try {
      const res = await apiClient.post('/documents/bulk-download', {
        ids: Array.from(selectedDocs)
      }, { responseType: 'blob' });
      
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export_ged_${format(new Date(), 'yyyy-MM-dd')}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Archive créée", { id: 'bulk' });
    } catch (e) {
      toast.error("Erreur lors de la création de l'archive", { id: 'bulk' });
    }
  };

  const toggleSelection = (docId: string) => {
    const newSet = new Set(selectedDocs);
    if (newSet.has(docId)) newSet.delete(docId);
    else newSet.add(docId);
    setSelectedDocs(newSet);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 pb-24">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#0B0F1A]/95 backdrop-blur-2xl border-b border-white/5 px-8 py-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-none">
              GED <span className="text-blue-600">SMI</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase mt-2 tracking-[0.3em]">
              Maîtrise de l&apos;Information Documentaire ISO 9001 • §7.5
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setModalState({ type: 'create', doc: null })}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-4xl font-black uppercase text-[11px] flex items-center gap-3 transition-all shadow-lg shadow-blue-900/20"
            >
              <Plus size={18} /> Nouveau Document
            </button>
          </div>
        </div>

        {/* DASHBOARD STATS */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard 
            label="Documents Actifs" 
            value={stats.approved} 
            total={stats.total}
            color="blue"
            icon={ShieldCheck}
          />
          <StatCard 
            label="En Attente" 
            value={stats.pending} 
            color="amber"
            icon={Clock}
            alert={stats.pending > 0}
          />
          <StatCard 
            label="Revue En Retard" 
            value={stats.overdue} 
            color="red"
            icon={AlertCircle}
            alert={stats.overdue > 0}
          />
          <StatCard 
            label="À Revoir (30j)" 
            value={stats.toReviewSoon} 
            color="purple"
            icon={Calendar}
          />
        </div>

        {/* BARRE D'OUTILS */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                placeholder="Recherche par référence, titre..."
                className="w-full bg-[#151B2B] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold uppercase outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
            
            <select 
              value={filters.category}
              onChange={(e) => setFilters(f => ({ ...f, category: e.target.value as any }))}
              className="bg-[#151B2B] border border-white/10 rounded-2xl px-4 py-3 text-[11px] font-black uppercase outline-none focus:border-blue-500"
            >
              <option value="ALL">Toutes Catégories</option>
              <option value="PROCEDURE">Procédures</option>
              <option value="MANUEL">Manuels</option>
              <option value="NORME">Normes</option>
              <option value="ENREGISTREMENT">Enregistrements</option>
            </select>

            <button 
              onClick={() => setFilters(f => ({ ...f, dateRange: f.dateRange === 'overdue' ? 'all' : 'overdue' }))}
              className={cn(
                "px-4 py-3 rounded-2xl text-[11px] font-black uppercase border transition-all flex items-center gap-2",
                filters.dateRange === 'overdue' 
                  ? "bg-red-500/20 border-red-500 text-red-400" 
                  : "bg-[#151B2B] border-white/10 hover:border-white/20"
              )}
            >
              <AlertTriangle size={14} />
              Revues en retard
            </button>

            <div className="flex bg-[#151B2B] rounded-2xl p-1 border border-white/10">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-2 rounded-xl transition-all", viewMode === 'grid' ? "bg-blue-600" : "hover:bg-white/5")}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-2 rounded-xl transition-all", viewMode === 'list' ? "bg-blue-600" : "hover:bg-white/5")}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* ACTIONS GROUPÉES */}
          {selectedDocs.size > 0 && (
            <div className="flex items-center gap-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl px-4 py-2 animate-in slide-in-from-top-2">
              <span className="text-[11px] font-black uppercase text-blue-400">
                {selectedDocs.size} sélectionné(s)
              </span>
              <div className="h-4 w-px bg-blue-500/30" />
              <button 
                onClick={handleBulkDownload}
                className="text-[11px] font-black uppercase text-blue-400 hover:text-white flex items-center gap-2"
              >
                <Download size={14} /> Télécharger
              </button>
              <button 
                onClick={() => setSelectedDocs(new Set())}
                className="ml-auto text-[11px] font-black uppercase text-slate-500 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-400 mx-auto p-8">
        {/* GRILLE OU LISTE */}
        <div className={cn(
          "gap-6",
          viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col"
        )}>
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
          ) : documents.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-500">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm font-black uppercase">Aucun document trouvé</p>
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
                onPreview={() => setModalState({ type: 'preview', doc })}
                onHistory={() => setModalState({ type: 'history', doc })}
                onRevise={() => setModalState({ type: 'revision', doc })}
                onApprove={() => setModalState({ type: 'approve', doc })}
              />
            ))
          )}
        </div>
      </main>

      {/* MODALES */}
      {modalState.type === 'create' && (
        <CreateModal 
          onClose={() => setModalState({ type: null, doc: null })} 
          onSuccess={refetch}
        />
      )}
      
      {modalState.type === 'revision' && modalState.doc && (
        <RevisionModal 
          doc={modalState.doc}
          onClose={() => setModalState({ type: null, doc: null })}
          onSuccess={refetch}
        />
      )}

      {modalState.type === 'history' && modalState.doc && (
        <HistoryModal 
          doc={modalState.doc}
          onClose={() => setModalState({ type: null, doc: null })}
          onDownload={(versionId) => handleDownload(modalState.doc!, versionId)}
        />
      )}

      {modalState.type === 'preview' && modalState.doc && (
        <PreviewModal 
          doc={modalState.doc}
          onClose={() => setModalState({ type: null, doc: null })}
          onDownload={() => handleDownload(modalState.doc!)}
        />
      )}

      {modalState.type === 'approve' && modalState.doc && (
        <ApprovalModal
          doc={modalState.doc}
          onClose={() => setModalState({ type: null, doc: null })}
          onApprove={async (approved) => {
            try {
              await apiClient.post(`/documents/${modalState.doc!.DOC_Id}/versions/${modalState.doc!.DOC_Versions[0].DV_Id}/approve`, {
                approved
              });
              toast.success(approved ? "Document approuvé" : "Document rejeté");
              refetch();
              setModalState({ type: null, doc: null });
            } catch (e) {
              toast.error("Erreur lors de l'approbation");
            }
          }}
        />
      )}
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function StatCard({ label, value, total, color, icon: Icon, alert }: any) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    red: "bg-red-500/10 border-red-500/20 text-red-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400"
  };

  return (
    <div className={cn("border rounded-2xl p-4 flex items-center gap-4", colors[color] || colors.blue)}>
      <div className={cn("p-3 rounded-xl bg-opacity-20", color === 'blue' ? 'bg-blue-500' : color === 'amber' ? 'bg-amber-500' : color === 'red' ? 'bg-red-500' : 'bg-purple-500')}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-black italic">{value}{total ? `/${total}` : ''}</p>
        <p className="text-[9px] font-black uppercase tracking-wider opacity-70">{label}</p>
      </div>
      {alert && <div className="ml-auto w-2 h-2 rounded-full bg-current animate-pulse" />}
    </div>
  );
}

function DocumentCard({ doc, viewMode, isSelected, onToggleSelect, onDownload, onPreview, onHistory, onRevise, onApprove }: {
  doc: SMI_Document;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onToggleSelect: () => void;
  onDownload: () => void;
  onPreview: () => void;
  onHistory: () => void;
  onRevise: () => void;
  onApprove: () => void;
}) {
  const latestVersion = doc.DOC_Versions[0];
  const isOverdue = doc.DOC_NextReviewDate ? isPast(new Date(doc.DOC_NextReviewDate)) && doc.DOC_Status !== 'OBSOLETE' : false;

  const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
    APPROVED: { color: 'emerald', label: 'Actif', icon: CheckCircle2 },
    PENDING_REVIEW: { color: 'amber', label: 'En Attente', icon: Clock },
    DRAFT: { color: 'slate', label: 'Brouillon', icon: FileEdit },
    OBSOLETE: { color: 'red', label: 'Obsolète', icon: Archive }
  };
  
  const status = statusConfig[doc.DOC_Status] || statusConfig.DRAFT;

  if (viewMode === 'list') {
    return (
      <div className={cn(
        "bg-[#151B2B] border rounded-2xl p-4 flex items-center gap-4 transition-all hover:border-blue-500/30",
        isSelected ? "border-blue-500 bg-blue-500/5" : "border-white/5",
        doc.DOC_Status === 'OBSOLETE' && "opacity-50"
      )}>
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-5 h-5 rounded border-white/20 bg-transparent checked:bg-blue-600"
        />
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
          <FileText size={24} className="text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-black text-slate-500 uppercase">{doc.DOC_Reference}</span>
            <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-opacity-20 border", 
              `bg-${status.color}-500/20 text-${status.color}-400 border-${status.color}-500/30`)}>
              {status.label}
            </span>
            {isOverdue && <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold uppercase">Revue en retard</span>}
          </div>
          <h3 className="font-black uppercase italic text-white truncate">{doc.DOC_Title}</h3>
          <p className="text-[10px] text-slate-500 truncate">{doc.DOC_Description || "Pas de description"}</p>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400">
          <div className="text-right">
            <p className="text-white">v{latestVersion?.DV_VersionNumber}.0</p>
            <p>{format(new Date(doc.DOC_UpdatedAt), 'dd/MM/yyyy')}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onPreview} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Prévisualiser">
              <Eye size={16} />
            </button>
            <button onClick={onHistory} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Historique">
              <History size={16} />
            </button>
            <button onClick={onDownload} className="p-2 hover:bg-blue-600 rounded-lg transition-colors" title="Télécharger">
              <Download size={16} />
            </button>
            {doc.DOC_Status === 'APPROVED' && (
              <button onClick={onRevise} className="p-2 hover:bg-amber-600 rounded-lg transition-colors" title="Réviser">
                <FileEdit size={16} />
              </button>
            )}
            {doc.DOC_Status === 'PENDING_REVIEW' && (
              <button onClick={onApprove} className="p-2 hover:bg-emerald-600 rounded-lg transition-colors" title="Approuver">
                <CheckSquare size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-[#151B2B] border rounded-[2.5rem] p-8 transition-all hover:border-blue-500/30 relative group",
      isSelected ? "border-blue-500 bg-blue-500/5" : "border-white/5",
      doc.DOC_Status === 'OBSOLETE' && "opacity-60"
    )}>
      <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onToggleSelect} 
          className={cn("p-2 rounded-full transition-all", isSelected ? "bg-blue-600 text-white" : "bg-white/10 hover:bg-blue-600")}
        >
          <CheckSquare size={16} />
        </button>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
            <FileText size={32} />
          </div>
          <div>
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block mb-1">{doc.DOC_Category}</span>
            <span className="text-[10px] font-bold text-slate-500">{doc.DOC_Reference}</span>
          </div>
        </div>
        <div className={cn("px-3 py-1.5 rounded-full text-[9px] font-black uppercase border bg-opacity-10", 
          status.color === 'emerald' ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" :
          status.color === 'amber' ? "bg-amber-500/20 border-amber-500/30 text-amber-400" :
          status.color === 'red' ? "bg-red-500/20 border-red-500/30 text-red-400" :
          "bg-slate-500/20 border-slate-500/30 text-slate-400"
        )}>
          <status.icon size={12} className="inline mr-1" />
          {status.label}
        </div>
      </div>

      <h3 className="text-2xl font-black uppercase italic text-white mb-3 leading-tight line-clamp-2">
        {doc.DOC_Title}
      </h3>
      
      <p className="text-[11px] text-slate-400 font-bold mb-6 line-clamp-2 uppercase">
        {doc.DOC_Description || "Aucune description analytique disponible pour ce document qualité."}
      </p>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase">
          <span className="text-slate-600 flex items-center gap-2"><User size={12} /> Pilote</span>
          <span className="text-slate-300">{doc.DOC_Owner?.U_FirstName} {doc.DOC_Owner?.U_LastName}</span>
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold uppercase">
          <span className="text-slate-600 flex items-center gap-2"><RefreshCw size={12} /> Version</span>
          <span className="text-emerald-400">v{latestVersion?.DV_VersionNumber}.0</span>
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold uppercase">
          <span className="text-slate-600 flex items-center gap-2"><Calendar size={12} /> Prochaine Revue</span>
          <span className={cn(isOverdue ? "text-red-400" : "text-slate-300")}>
            {doc.DOC_NextReviewDate ? format(new Date(doc.DOC_NextReviewDate), 'dd MMM yyyy', { locale: fr }) : 'Non définie'}
            {isOverdue && " (EN RETARD)"}
          </span>
        </div>
      </div>

      <div className="flex gap-3 pt-6 border-t border-white/5">
        <button onClick={onPreview} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase transition-all flex justify-center items-center gap-2">
          <Eye size={14} /> Voir
        </button>
        <button onClick={onHistory} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase transition-all flex justify-center items-center gap-2">
          <History size={14} /> Historique
        </button>
        <button onClick={onDownload} className="flex-1 py-3 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all flex justify-center items-center gap-2">
          <Download size={14} />
        </button>
        {doc.DOC_Status === 'APPROVED' && (
          <button onClick={onRevise} className="flex-1 py-3 bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all flex justify-center items-center gap-2">
            <FileEdit size={14} /> Réviser
          </button>
        )}
        {doc.DOC_Status === 'PENDING_REVIEW' && (
          <button onClick={onApprove} className="flex-1 py-3 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all flex justify-center items-center gap-2">
            <CheckSquare size={14} /> Approuver
          </button>
        )}
      </div>
    </div>
  );
}

function CreateModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    DOC_Title: '',
    DOC_Description: '',
    DOC_Category: 'PROCEDURE' as DocumentCategory,
    DOC_ReviewFrequencyMonths: 12,
    DOC_Tags: [] as string[]
  });
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(f.type)) {
      toast.error("Format non accepté (PDF/DOCX uniquement)");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 10MB)");
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !form.DOC_Title) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('DOC_Title', form.DOC_Title);
    formData.append('DOC_Description', form.DOC_Description);
    formData.append('DOC_Category', form.DOC_Category);
    formData.append('DOC_ReviewFrequencyMonths', form.DOC_ReviewFrequencyMonths.toString());
    form.DOC_Tags.forEach(tag => formData.append('DOC_Tags[]', tag));

    try {
      await apiClient.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Document créé et soumis pour approbation");
      onSuccess();
      onClose();
    } catch (e) {
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput && !form.DOC_Tags.includes(tagInput)) {
      setForm(f => ({ ...f, DOC_Tags: [...f.DOC_Tags, tagInput] }));
      setTagInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F1A]/95 backdrop-blur-3xl p-6">
      <div className="bg-[#151B2B] border border-white/10 w-full max-w-2xl rounded-[3rem] p-10 shadow-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black uppercase italic text-white flex items-center gap-4">
            <ShieldCheck className="text-blue-500" /> Nouveau Document ISO
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={28}/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div 
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
            className={cn(
              "border-2 border-dashed rounded-[2.5rem] p-12 text-center cursor-pointer transition-all",
              dragActive ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/30",
              file ? "bg-emerald-500/10 border-emerald-500/30" : ""
            )}
          >
            <UploadCloud className={cn("mx-auto mb-4 transition-colors", file ? "text-emerald-500" : "text-blue-500")} size={48} />
            <p className="text-lg font-black uppercase italic text-white mb-2">
              {file ? file.name : "Déposez votre fichier ici"}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase">
              PDF ou Word • Max 10MB
            </p>
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              accept=".pdf,.doc,.docx"
              onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Titre du Document *</label>
              <input 
                required
                value={form.DOC_Title}
                onChange={(e) => setForm(f => ({ ...f, DOC_Title: e.target.value }))}
                className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-5 text-white font-black italic uppercase outline-none focus:border-blue-500 transition-all"
                placeholder="ex: Procédure Gestion des Achats"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Catégorie</label>
              <select 
                value={form.DOC_Category}
                onChange={(e) => setForm(f => ({ ...f, DOC_Category: e.target.value as DocumentCategory }))}
                className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-5 text-white font-black uppercase text-xs outline-none focus:border-blue-500"
              >
                <option value="PROCEDURE">Procédure</option>
                <option value="MANUEL">Manuel Qualité</option>
                <option value="INSTRUCTION">Instruction</option>
                <option value="ENREGISTREMENT">Enregistrement</option>
                <option value="NORME">Norme</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Fréquence de Revue (mois)</label>
              <input 
                type="number"
                min="1"
                max="60"
                value={form.DOC_ReviewFrequencyMonths}
                onChange={(e) => setForm(f => ({ ...f, DOC_ReviewFrequencyMonths: parseInt(e.target.value) }))}
                className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-5 text-white font-black uppercase text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Description *</label>
              <textarea 
                required
                value={form.DOC_Description}
                onChange={(e) => setForm(f => ({ ...f, DOC_Description: e.target.value }))}
                className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-5 text-white font-black italic uppercase outline-none focus:border-blue-500 h-32 resize-none"
                placeholder="Contexte et objectif du document..."
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Tags (mots-clés)</label>
              <div className="flex gap-2 mb-3 flex-wrap">
                {form.DOC_Tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold uppercase flex items-center gap-2">
                    {tag}
                    <button type="button" onClick={() => setForm(f => ({ ...f, DOC_Tags: f.DOC_Tags.filter(t => t !== tag) }))}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 bg-[#0B0F1A] border border-white/10 rounded-2xl p-4 text-white font-black uppercase text-xs outline-none focus:border-blue-500"
                  placeholder="Ajouter un tag..."
                />
                <button type="button" onClick={addTag} className="px-6 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase text-xs transition-colors">
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!file || loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:cursor-not-allowed py-6 rounded-3xl text-[13px] font-black uppercase italic shadow-2xl shadow-blue-900/40 transition-all flex justify-center items-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
            Créer et Soumettre pour Validation
          </button>
        </form>
      </div>
    </div>
  );
}

function RevisionModal({ doc, onClose, onSuccess }: { doc: SMI_Document; onClose: () => void; onSuccess: () => void }) {
  const [changeDesc, setChangeDesc] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !changeDesc) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('changeDescription', changeDesc);

    try {
      await apiClient.post(`/documents/${doc.DOC_Id}/revise`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Version ${doc.DOC_Versions[0].DV_VersionNumber + 1}.0 créée`);
      onSuccess();
      onClose();
    } catch (e) {
      toast.error("Erreur lors de la révision");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F1A]/95 backdrop-blur-3xl p-6">
      <div className="bg-[#151B2B] border border-white/10 w-full max-w-2xl rounded-[3rem] p-10 shadow-3xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black uppercase italic text-white flex items-center gap-4">
            <GitCompare className="text-amber-500" /> Révision ISO
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X size={28}/></button>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8">
          <p className="text-[11px] font-black text-amber-400 uppercase mb-2">
            Document actuel : {doc.DOC_Reference} (v{doc.DOC_Versions[0].DV_VersionNumber}.0)
          </p>
          <p className="text-[10px] text-amber-200/60 italic">
            La nouvelle version sera soumise pour approbation avant activation. 
            L&apos;ancienne version restera active jusqu&apos;à approbation de la nouvelle.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">
              Description des modifications (obligatoire ISO 9001)
            </label>
            <textarea 
              required
              value={changeDesc}
              onChange={(e) => setChangeDesc(e.target.value)}
              className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-5 text-white font-black italic uppercase outline-none focus:border-amber-500 h-32"
              placeholder="Décrivez les changements majeurs, la raison de la mise à jour..."
            />
          </div>

          <div 
            className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-amber-500/50 transition-all cursor-pointer" 
            onClick={() => document.getElementById('revise-file')?.click()}
          >
            <UploadCloud className="mx-auto text-amber-500 mb-2" size={32} />
            <p className="text-sm font-black uppercase text-white">{file ? file.name : "Nouvelle version du fichier"}</p>
            <input 
              id="revise-file" 
              type="file" 
              className="hidden" 
              accept=".pdf,.doc,.docx" 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
            />
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-5 rounded-2xl border border-white/10 font-black uppercase text-xs hover:bg-white/5 transition-all">
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={!file || !changeDesc || loading}
              className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 py-5 rounded-2xl font-black uppercase text-xs transition-all flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              Publier v{doc.DOC_Versions[0].DV_VersionNumber + 1}.0
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HistoryModal({ doc, onClose, onDownload }: { 
  doc: SMI_Document; 
  onClose: () => void; 
  onDownload: (v: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F1A]/95 backdrop-blur-3xl p-6">
      <div className="bg-[#151B2B] border border-white/10 w-full max-w-3xl rounded-[3rem] p-10 shadow-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase italic text-white flex items-center gap-4">
              <History className="text-blue-500" /> Historique
            </h2>
            <p className="text-slate-500 text-xs font-bold uppercase mt-1">{doc.DOC_Reference}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X size={28}/></button>
        </div>

        <div className="space-y-4">
          {doc.DOC_Versions.map((version) => (
            <div key={version.DV_Id} className="bg-[#0B0F1A] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-black uppercase italic text-white">Version {version.DV_VersionNumber}.0</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">
                    {format(new Date(version.DV_CreatedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
                <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase border", 
                  version.DV_Status === 'APPROVED' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                  version.DV_Status === 'PENDING_REVIEW' ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                  "bg-slate-500/10 border-slate-500/30 text-slate-400"
                )}>
                  {version.DV_Status === 'APPROVED' ? 'Approuvée' : version.DV_Status === 'PENDING_REVIEW' ? 'En attente' : 'Brouillon'}
                </span>
              </div>

              <p className="text-sm text-slate-400 italic mb-4">
                {version.DV_ChangeDescription || "Création initiale du document"}
              </p>

              <div className="flex gap-4 text-[10px] font-bold text-slate-500 uppercase">
                <span className="flex items-center gap-2"><User size={12} /> {version.DV_CreatedBy.U_FirstName} {version.DV_CreatedBy.U_LastName}</span>
                {version.DV_ApprovedBy && (
                  <span className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 size={12} /> Approuvé par {version.DV_ApprovedBy.U_FirstName} {version.DV_ApprovedBy.U_LastName}
                  </span>
                )}
                <button 
                  onClick={() => onDownload(version.DV_Id)}
                  className="ml-auto text-blue-400 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Download size={12} /> Télécharger
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ doc, onClose, onDownload }: { doc: SMI_Document; onClose: () => void; onDownload: () => void }) {
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const res = await apiClient.get(`/documents/${doc.DOC_Id}/preview`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        setPdfUrl(url);
      } catch (e) {
        toast.error("Impossible de charger la prévisualisation");
      } finally {
        setLoading(false);
      }
    };
    loadPreview();
    return () => { if (pdfUrl) window.URL.revokeObjectURL(pdfUrl); };
  }, [doc.DOC_Id, pdfUrl]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F1A]/95 backdrop-blur-3xl p-6">
      <div className="bg-[#151B2B] border border-white/10 w-full max-w-5xl h-[90vh] rounded-[3rem] flex flex-col shadow-3xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <div>
            <h2 className="text-2xl font-black uppercase italic text-white">{doc.DOC_Title}</h2>
            <p className="text-xs text-slate-500 font-bold uppercase">Version {doc.DOC_Versions[0].DV_VersionNumber}.0 • {doc.DOC_Reference}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onDownload} className="px-6 py-3 bg-blue-600 rounded-2xl text-xs font-black uppercase flex items-center gap-2 hover:bg-blue-500 transition-colors">
              <Download size={16} /> Télécharger
            </button>
            <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 bg-[#0B0F1A] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
          ) : pdfUrl ? (
            <iframe src={pdfUrl} className="w-full h-full" title={doc.DOC_Title} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500">
              <p className="font-black uppercase">Prévisualisation non disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ApprovalModal({ doc, onClose, onApprove }: { doc: SMI_Document; onClose: () => void; onApprove: (approved: boolean) => void }) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async (approved: boolean) => {
    setLoading(true);
    await onApprove(approved);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F1A]/95 backdrop-blur-3xl p-6">
      <div className="bg-[#151B2B] border border-white/10 w-full max-w-xl rounded-[3rem] p-10 shadow-3xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black uppercase italic text-white flex items-center gap-4">
            <ShieldCheck className="text-emerald-500" /> Approbation ISO
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X size={28}/></button>
        </div>

        <div className="bg-white/5 rounded-2xl p-6 mb-8">
          <h3 className="font-black uppercase italic text-white mb-2">{doc.DOC_Title}</h3>
          <p className="text-sm text-slate-400">Version soumise : {doc.DOC_Versions[0].DV_VersionNumber}.0</p>
          <p className="text-sm text-slate-400">Auteur : {doc.DOC_Versions[0].DV_CreatedBy.U_FirstName} {doc.DOC_Versions[0].DV_CreatedBy.U_LastName}</p>
        </div>

        <div className="mb-8">
          <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Commentaire de validation (optionnel)</label>
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-5 text-white font-black italic uppercase outline-none focus:border-emerald-500 h-32"
            placeholder="Observations sur la conformité du document..."
          />
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => handleApprove(false)}
            disabled={loading}
            className="flex-1 py-5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl font-black uppercase text-xs transition-all flex justify-center items-center gap-2"
          >
            <XSquare size={18} /> Rejeter
          </button>
          <button 
            onClick={() => handleApprove(true)}
            disabled={loading}
            className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckSquare size={18} />}
            Approuver et Activer
          </button>
        </div>
      </div>
    </div>
  );
}