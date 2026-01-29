/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import DocumentUploadModal from '@/components/documents/DocumentUploadModal';
import { 
  FileText, Plus, Search, FolderTree, 
  Download, History, ShieldCheck, Loader2, 
  Archive, MoreVertical, LayoutGrid, List,
  Clock, User, Eye, CheckCircle2, AlertCircle,
  Lock, Unlock, FileBarChart, Calendar, 
  ChevronRight, X, QrCode, Share2, Trash2,
  Edit3, Printer, ArrowUpDown
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ============================================================================
// TYPES ISO 9001:2015 STRICTS
// ============================================================================

type DocumentStatus = 'BROUILLON' | 'EN_REVUE' | 'APPROUVE' | 'OBSOLETE' | 'ARCHIVE';
type ConfidentialityLevel = 'PUBLIC' | 'INTERNE' | 'CONFIDENTIEL' | 'SECRET';
type DocumentCategory = 'MANUEL' | 'PROCEDURE' | 'CONSIGNE' | 'ENREGISTREMENT' | 'FORMULAIRE' | 'PLAN' | 'RAPPORT';

interface DocumentVersion {
  id: string;
  version: number;
  fileUrl: string;
  fileName: string;
  size: number;
  createdAt: string;
  createdBy: string;
  status: 'ACTIVE' | 'SUPERSEDED';
  changeDescription?: string;
}

interface ApprovalStep {
  role: string;
  user: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date?: string;
  comment?: string;
}

interface DocumentMetadata {
  reference: string; // Ex: PROC-QSE-001-2024
  title: string;
  category: DocumentCategory;
  processus?: string;
  confidentiality: ConfidentialityLevel;
  retentionPeriod: number; // En années (ISO 9001 §7.5.3.2)
  legalBasis?: string; // Base légale de conservation
  author: string;
  approver?: string;
  approvalDate?: string;
  nextReviewDate?: string; // Date de revue périodique obligatoire
  distributionList: string[]; // Liste de diffusion ISO
  version: number;
  language: string;
  creationDate: string;
  modificationDate: string;
}

interface DocumentISO {
  DOC_Id: string;
  metadata: DocumentMetadata;
  versions: DocumentVersion[];
  currentVersion: DocumentVersion;
  status: DocumentStatus;
  isArchived: boolean;
  accessLog?: {
    user: string;
    action: 'VIEW' | 'DOWNLOAD' | 'PRINT';
    timestamp: string;
  }[];
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function GEDPage() {
  const [docs, setDocs] = useState<DocumentISO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DocumentISO | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filtres avancés ISO 9001
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'ALL' as DocumentCategory | 'ALL',
    status: 'ALL' as DocumentStatus | 'ALL',
    confidentiality: 'ALL' as ConfidentialityLevel | 'ALL',
    processus: 'ALL' as string | 'ALL'
  });

  const [sortBy, setSortBy] = useState<'date' | 'ref' | 'title'>('date');
  const [showObsolete, setShowObsolete] = useState(false);

  // Chargement des documents avec métadonnées ISO
  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/documents/iso');
      setDocs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur GED ISO:", err);
      // Données mockées pour démo conformité ISO
      setDocs([
        {
          DOC_Id: '1',
          metadata: {
            reference: 'MAN-QSE-001-2024',
            title: 'Manuel Qualité',
            category: 'MANUEL',
            confidentiality: 'PUBLIC',
            retentionPeriod: 10,
            author: 'Direction QSE',
            approver: 'DG',
            approvalDate: '2024-01-15',
            nextReviewDate: '2025-01-15',
            distributionList: ['Tous les collaborateurs'],
            version: 3,
            language: 'FR',
            creationDate: '2023-01-10',
            modificationDate: '2024-01-15',
            processus: 'Management'
          },
          status: 'APPROUVE',
          isArchived: false,
          currentVersion: {
            id: 'v3',
            version: 3,
            fileUrl: '/docs/manuel.pdf',
            fileName: 'manuel-qualite-v3.pdf',
            size: 2450000,
            createdAt: '2024-01-15',
            createdBy: 'Direction QSE',
            status: 'ACTIVE'
          },
          versions: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  // Filtrage et tri ISO 9001
  const filteredDocs = useMemo(() => {
    return docs
      .filter(doc => {
        const matchesSearch = 
          doc.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.metadata.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.metadata.author.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = filters.category === 'ALL' || doc.metadata.category === filters.category;
        const matchesStatus = filters.status === 'ALL' || doc.status === filters.status;
        const matchesConfidentiality = filters.confidentiality === 'ALL' || doc.metadata.confidentiality === filters.confidentiality;
        const matchesProcessus = filters.processus === 'ALL' || doc.metadata.processus === filters.processus;
        const matchesObsolete = showObsolete || doc.status !== 'OBSOLETE';

        return matchesSearch && matchesCategory && matchesStatus && matchesConfidentiality && matchesProcessus && matchesObsolete;
      })
      .sort((a, b) => {
        if (sortBy === 'date') return new Date(b.metadata.modificationDate).getTime() - new Date(a.metadata.modificationDate).getTime();
        if (sortBy === 'ref') return a.metadata.reference.localeCompare(b.metadata.reference);
        return a.metadata.title.localeCompare(b.metadata.title);
      });
  }, [docs, searchQuery, filters, sortBy, showObsolete]);

  // Statistiques conformité ISO
  const stats = useMemo(() => ({
    total: docs.length,
    approved: docs.filter(d => d.status === 'APPROUVE').length,
    pendingReview: docs.filter(d => d.status === 'EN_REVUE').length,
    obsolete: docs.filter(d => d.status === 'OBSOLETE').length,
    expiringSoon: docs.filter(d => {
      if (!d.metadata.nextReviewDate) return false;
      const daysUntil = Math.ceil((new Date(d.metadata.nextReviewDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 30 && daysUntil > 0;
    }).length
  }), [docs]);

  // Styles visuels conformité
  const getStatusConfig = (status: DocumentStatus) => {
    const configs = {
      BROUILLON: { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: Edit3, label: 'Brouillon' },
      EN_REVUE: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Eye, label: 'En Revue' },
      APPROUVE: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2, label: 'Approuvé' },
      OBSOLETE: { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: AlertCircle, label: 'Obsolète' },
      ARCHIVE: { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: Archive, label: 'Archivé' }
    };
    return configs[status] || configs.BROUILLON;
  };

  const getConfidentialityColor = (level: ConfidentialityLevel) => {
    const colors = {
      PUBLIC: 'text-emerald-400',
      INTERNE: 'text-blue-400',
      CONFIDENTIEL: 'text-amber-400',
      SECRET: 'text-red-400'
    };
    return colors[level];
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0B0F1A] ml-72 font-black italic text-blue-500 uppercase tracking-[0.3em]">
      <Loader2 className="animate-spin mr-3" size={24} />
      Chargement du système documentaire ISO...
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-8 ml-72 text-white relative overflow-hidden">
      {/* Background décoratif */}
      <div className="absolute top-0 right-0 w-200 h-200 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-400 mx-auto space-y-8 relative z-10">
        
        {/* HEADER STRATÉGIQUE ISO 9001 */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest">
                ISO 9001:2015 §7.5
              </span>
              {stats.expiringSoon > 0 && (
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                  <AlertCircle size={10} /> {stats.expiringSoon} doc. à réviser
                </span>
              )}
            </div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">
              Gestion <span className="text-blue-500">Documentaire</span>
            </h1>
            <p className="text-slate-500 font-bold text-[11px] uppercase tracking-[0.3em] italic">
              Contrôle de l&apos;Information Documentée
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 rounded-2xl p-1 border border-white/10">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <List size={18} />
              </button>
            </div>
            
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs shadow-lg shadow-blue-500/20 flex items-center gap-3 transition-all hover:scale-105"
            >
              <Plus size={20} /> Nouveau Document
            </button>
          </div>
        </header>

        {/* KPI CONFORMITÉ ISO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Documents Actifs', value: stats.total, icon: FileText, color: 'blue' },
            { label: 'Approuvés', value: stats.approved, icon: CheckCircle2, color: 'emerald' },
            { label: 'En Revue', value: stats.pendingReview, icon: Eye, color: 'amber' },
            { label: 'À Réviser (30j)', value: stats.expiringSoon, icon: Clock, color: stats.expiringSoon > 0 ? 'red' : 'slate' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-white/20 transition-colors">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color === 'red' ? 'text-red-400' : 'text-white'}`}>{stat.value}</p>
              </div>
              <stat.icon size={20} className={`text-${stat.color}-500 opacity-50`} />
            </div>
          ))}
        </div>

        {/* BARRE DE RECHERCHE AVANCÉE ISO */}
        <div className="bg-slate-900/50 border border-white/10 rounded-4xl p-6 space-y-4 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text"
                placeholder="Rechercher par titre, référence (ex: PROC-001), ou auteur..."
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-slate-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="date">Trier par Date</option>
              <option value="ref">Trier par Référence</option>
              <option value="title">Trier par Titre</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Filtres ISO:</span>
            
            {[
              { key: 'category', label: 'Catégorie', options: ['ALL', 'MANUEL', 'PROCEDURE', 'CONSIGNE', 'ENREGISTREMENT'] },
              { key: 'status', label: 'Statut', options: ['ALL', 'BROUILLON', 'EN_REVUE', 'APPROUVE', 'OBSOLETE'] },
              { key: 'confidentiality', label: 'Confidentialité', options: ['ALL', 'PUBLIC', 'INTERNE', 'CONFIDENTIEL'] }
            ].map((filter) => (
              <select
                key={filter.key}
                value={filters[filter.key as keyof typeof filters]}
                onChange={(e) => setFilters(prev => ({ ...prev, [filter.key]: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[11px] font-bold text-white outline-none focus:border-blue-500/50 uppercase tracking-wider"
              >
                <option value="ALL">{filter.label}</option>
                {filter.options.slice(1).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ))}

            <label className="flex items-center gap-2 ml-auto cursor-pointer group">
              <div className={`w-4 h-4 rounded border ${showObsolete ? 'bg-red-500 border-red-500' : 'border-slate-600'} flex items-center justify-center transition-colors`}>
                {showObsolete && <AlertCircle size={12} className="text-white" />}
              </div>
              <input 
                type="checkbox" 
                checked={showObsolete}
                onChange={(e) => setShowObsolete(e.target.checked)}
                className="hidden"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                Afficher Obsolètes
              </span>
            </label>
          </div>
        </div>

        {/* GRILLE/LISTE DOCUMENTS ISO */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-3'}>
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => {
              const statusConfig = getStatusConfig(doc.status);
              const daysUntilReview = doc.metadata.nextReviewDate 
                ? Math.ceil((new Date(doc.metadata.nextReviewDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;
              const isUrgentReview = daysUntilReview !== null && daysUntilReview <= 30 && daysUntilReview > 0;

              return (
                <div 
                  key={doc.DOC_Id} 
                  onClick={() => setSelectedDoc(doc)}
                  className={`group relative bg-slate-900/40 border ${isUrgentReview ? 'border-amber-500/30' : 'border-white/5'} hover:border-blue-500/30 transition-all cursor-pointer overflow-hidden ${viewMode === 'grid' ? 'rounded-[2.5rem] p-8' : 'rounded-2xl p-4 flex items-center gap-6'}`}
                >
                  {/* Indicateur statut latéral */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusConfig(doc.status).color.split(' ')[0].replace('/10', '')}`} />
                  
                  <div className={`relative z-10 flex-1 ${viewMode === 'grid' ? 'space-y-4' : 'flex items-center gap-6'}`}>
                    
                    {/* En-tête Card */}
                    <div className={`flex justify-between items-start ${viewMode === 'list' ? 'w-96' : ''}`}>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase italic border ${statusConfig.color} flex items-center gap-1`}>
                            <statusConfig.icon size={10} />
                            {statusConfig.label}
                          </span>
                          <span className={`text-[9px] font-black uppercase flex items-center gap-1 ${getConfidentialityColor(doc.metadata.confidentiality)}`}>
                            {doc.metadata.confidentiality === 'CONFIDENTIEL' && <Lock size={10} />}
                            {doc.metadata.confidentiality}
                          </span>
                        </div>
                        <h3 className="text-lg font-black uppercase italic tracking-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                          {doc.metadata.title}
                        </h3>
                        <p className="text-[10px] font-bold text-blue-400/80 uppercase tracking-wider font-mono">
                          {doc.metadata.reference}
                        </p>
                      </div>
                      
                      {viewMode === 'grid' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); /* menu */ }}
                          className="text-slate-600 hover:text-white transition-colors p-2"
                        >
                          <MoreVertical size={18} />
                        </button>
                      )}
                    </div>

                    {/* Métadonnées ISO */}
                    <div className={`${viewMode === 'grid' ? 'space-y-3 pt-4 border-t border-white/5' : 'flex items-center gap-6 flex-1'}`}>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                        <FolderTree size={14} className="text-blue-500" />
                        {doc.metadata.processus || 'Management'}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                        <History size={14} className="text-blue-500" />
                        V{doc.metadata.version}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                        <User size={14} className="text-blue-500" />
                        {doc.metadata.author}
                      </div>
                      {isUrgentReview && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-400 font-black uppercase animate-pulse">
                          <Clock size={12} />
                          Révision dans {daysUntilReview}j
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className={`${viewMode === 'grid' ? 'pt-4 flex gap-3' : 'flex gap-2'}`}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); /* download */ }}
                        className={`flex-1 bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-500 text-white rounded-xl flex items-center justify-center gap-2 transition-all text-[10px] font-black uppercase italic ${viewMode === 'grid' ? 'py-3' : 'py-2 px-4'}`}
                      >
                        <Download size={14} />
                        {viewMode === 'grid' && 'Télécharger'}
                      </button>
                      <button className={`bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all ${viewMode === 'grid' ? 'p-3' : 'p-2'}`}>
                        <History size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-32 text-center bg-slate-900/20 rounded-[4rem] border-2 border-dashed border-white/5">
              <FileText className="mx-auto text-slate-800 mb-6" size={80} />
              <p className="text-slate-500 font-black uppercase italic text-sm tracking-[0.2em]">
                {searchQuery ? 'Aucun document conforme aux critères ISO' : 'Maître documentaire vide'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PANEL LATÉRAL DÉTAILS DOCUMENT ISO */}
      {selectedDoc && (
        <div className="fixed inset-0 z-100 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDoc(null)} />
          <div className="relative w-full max-w-2xl bg-[#0B0F1A] border-l border-white/10 h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
            
            {/* Header Panel */}
            <div className="sticky top-0 bg-[#0B0F1A]/95 backdrop-blur border-b border-white/10 p-8 flex justify-between items-start z-10">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight text-white mb-2">
                  {selectedDoc.metadata.title}
                </h2>
                <p className="text-[11px] font-mono text-blue-400 uppercase tracking-wider">
                  {selectedDoc.metadata.reference}
                </p>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Workflow d'approbation ISO */}
              <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-blue-500" />
                  Workflow d&apos;Approbation (ISO 9001 §7.5.3.2)
                </h3>
                <div className="flex items-center justify-between">
                  {['BROUILLON', 'EN_REVUE', 'APPROUVE'].map((step, idx) => {
                    const isActive = ['BROUILLON', 'EN_REVUE', 'APPROUVE'].indexOf(selectedDoc.status) >= idx;
                    const isCurrent = selectedDoc.status === step;
                    return (
                      <div key={step} className="flex items-center">
                        <div className={`flex flex-col items-center gap-2 ${isActive ? 'text-white' : 'text-slate-600'}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isCurrent ? 'border-blue-500 bg-blue-500/20 text-blue-400' : isActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700'}`}>
                            {idx + 1}
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-wider">{step.replace('_', ' ')}</span>
                        </div>
                        {idx < 2 && <div className={`w-16 h-0.5 mx-2 ${isActive ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Métadonnées ISO complètes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">
                    Identification (§7.5.2)
                  </h3>
                  <MetadataItem label="Auteur" value={selectedDoc.metadata.author} icon={User} />
                  <MetadataItem label="Approbateur" value={selectedDoc.metadata.approver || 'En attente'} icon={CheckCircle2} />
                  <MetadataItem label="Date Approbation" value={selectedDoc.metadata.approvalDate ? format(new Date(selectedDoc.metadata.approvalDate), 'dd/MM/yyyy') : '-'} icon={Calendar} />
                  <MetadataItem label="Langue" value={selectedDoc.metadata.language} icon={FileText} />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">
                    Contrôle (§7.5.3.2)
                  </h3>
                  <MetadataItem 
                    label="Prochaine Revue" 
                    value={selectedDoc.metadata.nextReviewDate ? format(new Date(selectedDoc.metadata.nextReviewDate), 'dd/MM/yyyy') : 'Non planifiée'} 
                    icon={Clock}
                    urgent={selectedDoc.metadata.nextReviewDate ? new Date(selectedDoc.metadata.nextReviewDate) < new Date() : false}
                  />
                  <MetadataItem label="Durée Conservation" value={`${selectedDoc.metadata.retentionPeriod} ans`} icon={Archive} />
                  <MetadataItem label="Format" value="PDF/A (Archivage)" icon={FileBarChart} />
                  <MetadataItem label="Taille" value={`${(selectedDoc.currentVersion.size / 1024).toFixed(0)} Ko`} icon={FileText} />
                </div>
              </div>

              {/* Historique des versions */}
              <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <History size={14} className="text-blue-500" />
                  Historique des Révisions (§7.5.3.2)
                </h3>
                <div className="space-y-3">
                  {[selectedDoc.currentVersion, ...selectedDoc.versions].slice(0, 3).map((version, idx) => (
                    <div key={version.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                      <div>
                        <p className="text-sm font-black text-white">Version {version.version}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{format(new Date(version.createdAt), 'dd MMM yyyy', {locale: fr})} par {version.createdBy}</p>
                      </div>
                      {idx === 0 && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase border border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Liste de distribution ISO */}
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <Share2 size={14} className="text-blue-500" />
                  Liste de Distribution
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDoc.metadata.distributionList.map((item, idx) => (
                    <span key={idx} className="px-4 py-2 bg-white/5 rounded-full text-[10px] font-bold text-slate-300 border border-white/10">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* QR Code et Actions */}
              <div className="pt-6 border-t border-white/10 flex gap-4">
                <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black uppercase italic text-xs flex items-center justify-center gap-2 transition-all">
                  <Download size={16} /> Télécharger Version Courante
                </button>
                <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-colors">
                  <QrCode size={20} />
                </button>
                <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-colors">
                  <Printer size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isUploadModalOpen && (
        <DocumentUploadModal 
          onClose={() => setIsUploadModalOpen(false)} 
          onSuccess={() => fetchDocs()} 
        />
      )}
    </div>
  );
}

// Composant helper pour les métadonnées
function MetadataItem({ label, value, icon: Icon, urgent }: { label: string, value: string, icon: any, urgent?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
        <Icon size={14} className="text-blue-500" />
        {label}
      </div>
      <span className={`text-xs font-black ${urgent ? 'text-red-400' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}