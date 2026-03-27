/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🌐 MODULE : VitrineManager (Content Management)
 * RÔLE : Pilotage du contenu public (Actualités, Formations, Ressources)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, ChangeEvent, FormEvent, KeyboardEvent, useCallback } from 'react';
import { 
  Plus, Save, Trash2, Edit3, Globe, Zap, 
  BookOpen, Layout, ArrowRight, Loader2, Eye, 
  AlertCircle, X, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export type ContentType = 'ACTUALITE' | 'FORMATION' | 'RESSOURCE';
export type ContentStatus = 'BROUILLON' | 'PUBLIÉ';
export type ViewMode = 'LIST' | 'EDIT';

export interface VitrineContent {
  id: string;
  title: string;
  catchPhrase: string;
  content: string;
  type: ContentType;
  status: ContentStatus;
  createdAt?: string;
  updatedAt?: string;
  authorId?: string;
}

export interface VitrineManagerProps {
  onContentChange?: (contents: VitrineContent[]) => void;
}

export interface ContentCardProps {
  content: VitrineContent;
  onEdit: (content: VitrineContent) => void;
  onDelete: (content: VitrineContent) => void;
}

export interface FormData {
  title: string;
  catch: string;
  content: string;
  type: ContentType;
}

export interface FormErrors {
  title?: string;
  catch?: string;
  content?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const CONTENT_TYPES: Array<{ value: ContentType; label: string; icon: React.ElementType }> = [
  { value: 'ACTUALITE', label: 'ACTUALITÉ IA & QHSE', icon: Globe },
  { value: 'FORMATION', label: 'PROGRAMME DE FORMATION', icon: BookOpen },
  { value: 'RESSOURCE', label: 'RESSOURCE DOCUMENTAIRE SDE', icon: Layout }
];

const DEFAULT_FORM: FormData = {
  title: '',
  catch: '',
  content: '',
  type: 'ACTUALITE'
};

const SAMPLE_CONTENTS: VitrineContent[] = [
  { 
    id: '1', 
    title: "L'IA Prédictive au Sénégal", 
    catchPhrase: "Révolution industrielle",
    content: "Contenu...",
    type: 'ACTUALITE', 
    status: 'PUBLIÉ' 
  },
  { 
    id: '2', 
    title: "Masterclass ISO 27001", 
    catchPhrase: "Cybersécurité avancée",
    content: "Contenu...",
    type: 'FORMATION', 
    status: 'BROUILLON' 
  }
];

// ============================================================================
// SOUS-COMPOSANT : CONTENT CARD
// ============================================================================

function ContentCard({ content, onEdit, onDelete }: ContentCardProps) {
  const typeConfig: Record<ContentType, { bg: string; text: string; border: string }> = {
    ACTUALITE: { bg: 'bg-blue-600/10', text: 'text-blue-400', border: 'border-blue-600/20' },
    FORMATION: { bg: 'bg-emerald-600/10', text: 'text-emerald-400', border: 'border-emerald-600/20' },
    RESSOURCE: { bg: 'bg-purple-600/10', text: 'text-purple-400', border: 'border-purple-600/20' }
  };

  const config = typeConfig[content.type];

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(content);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Supprimer "${content.title}" ?`)) {
      onDelete(content);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEdit(content);
    }
  };

  return (
    <article 
      className="p-4 md:p-6 lg:p-8 bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl hover:border-blue-500/40 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[260px] md:min-h-[280px] focus-within:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
      role="article"
      aria-label={`Contenu: ${content.title}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute -inset-px bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" aria-hidden="true" />
      
      <div className="relative z-10 flex justify-between items-start">
        <span className={cn(
          "text-[7px] md:text-[8px] font-black px-2 md:px-3 py-1 md:py-1.5 rounded-full italic uppercase border inline-block",
          config.bg, config.text, config.border
        )}>
          {content.type}
        </span>
        <div className="flex gap-1.5 md:gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            type="button"
            onClick={handleEditClick} 
            className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl text-slate-500 hover:text-white transition-colors border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={`Modifier ${content.title}`}
            title="Modifier"
          >
            <Edit3 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
          </button>
          <button 
            type="button"
            onClick={handleDeleteClick} 
            className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl text-slate-500 hover:text-red-400 transition-colors border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label={`Supprimer ${content.title}`}
            title="Supprimer"
          >
            <Trash2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-4 md:mt-6">
        <h3 className="text-lg md:text-xl font-black uppercase italic text-white leading-none tracking-tighter group-hover:text-blue-400 transition-colors truncate">
          {content.title}
        </h3>
        <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase mt-3 md:mt-4 italic tracking-widest flex items-center gap-1.5 md:gap-2">
           <Zap size={10} className={cn("w-2.5 h-2.5 md:w-3 md:h-3", content.status === 'PUBLIÉ' ? 'text-emerald-400' : 'text-slate-600')} aria-hidden="true" /> 
           {content.status}
        </p>
      </div>

      <button 
        type="button"
        onClick={handleEditClick} 
        className="relative z-10 mt-4 md:mt-6 lg:mt-8 py-3 md:py-4 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 text-[8px] md:text-[9px] font-black uppercase text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all border-none cursor-pointer italic focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label={`Éditer ${content.title}`}
      >
        Éditer le flux <ArrowRight size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" />
      </button>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function VitrineManager({ onContentChange }: VitrineManagerProps) {
  const [mode, setMode] = useState<ViewMode>('LIST');
  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<VitrineContent[]>(SAMPLE_CONTENTS);
  const [editingContent, setEditingContent] = useState<VitrineContent | null>(null);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [previewMode, setPreviewMode] = useState(false);

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.title.trim()) {
      errors.title = "Le titre est obligatoire";
    }
    
    if (!formData.catch.trim()) {
      errors.catch = "L'accroche est obligatoire";
    }
    
    if (!formData.content.trim()) {
      errors.content = "Le contenu est obligatoire";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handlePublish = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Synchronisation avec le cluster qualisoft.sn...");
    
    // Simulation API call
    setTimeout(() => {
      const newContent: VitrineContent = {
        id: editingContent?.id || Date.now().toString(),
        title: formData.title.toUpperCase(),
        catchPhrase: formData.catch.toUpperCase(),
        content: formData.content.toUpperCase(),
        type: formData.type,
        status: 'PUBLIÉ',
        updatedAt: new Date().toISOString()
      };

      if (editingContent) {
        setContents(prev => prev.map(c => c.id === editingContent.id ? newContent : c));
        toast.success("CONTENU MIS À JOUR : La vitrine a été actualisée.", { id: toastId });
      } else {
        setContents(prev => [...prev, newContent]);
        toast.success("CONTENU PUBLIÉ : La vitrine a été mise à jour.", { id: toastId });
      }
      
      onContentChange?.(contents);
      setLoading(false);
      setMode('LIST');
      setFormData(DEFAULT_FORM);
      setEditingContent(null);
      setFormErrors({});
    }, 1500);
  };

  const handleEdit = useCallback((content: VitrineContent) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      catch: content.catchPhrase,
      content: content.content,
      type: content.type
    });
    setMode('EDIT');
    setPreviewMode(false);
  }, []);

  const handleDelete = useCallback((content: VitrineContent) => {
    setContents(prev => prev.filter(c => c.id !== content.id));
    onContentChange?.(contents.filter(c => c.id !== content.id));
    toast.success("Contenu supprimé");
  }, [contents, onContentChange]);

  const handleCancel = () => {
    setMode('LIST');
    setFormData(DEFAULT_FORM);
    setEditingContent(null);
    setFormErrors({});
    setPreviewMode(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && mode === 'EDIT') {
      handleCancel();
    }
  };

  const updateForm = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const currentTypeConfig = CONTENT_TYPES.find(t => t.value === formData.type);
  const TypeIcon = currentTypeConfig?.icon || Globe;

  return (
    <div 
      className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 italic font-sans text-left"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      
      {/* 🔝 HEADER */}
      <header 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 bg-[#0F172A] p-4 md:p-6 lg:p-8 xl:p-10 rounded-2xl md:rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden"
        aria-labelledby="publisher-title"
      >
        <div className="absolute top-0 right-0 w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-blue-600/5 blur-[60px] md:blur-[80px] rounded-full" aria-hidden="true" />
        <div className="relative z-10">
          <h2 id="publisher-title" className="text-xl md:text-2xl lg:text-3xl font-black uppercase text-white tracking-tighter flex items-center gap-2 md:gap-3 lg:gap-4 m-0">
            <Globe className="text-blue-400 animate-pulse w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" /> 
            Web <span className="text-blue-400 underline">Publisher</span>
          </h2>
          <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 md:mt-2 lg:mt-3 m-0">
            Gestion du flux éditorial Qualisoft Elite
          </p>
        </div>
        {mode === 'LIST' && (
          <button 
            type="button"
            onClick={() => {
              setMode('EDIT');
              setEditingContent(null);
              setFormData(DEFAULT_FORM);
              setFormErrors({});
            }}
            className="px-4 md:px-6 lg:px-8 py-3 md:py-4 bg-blue-600 hover:bg-white hover:text-blue-700 text-white rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] lg:text-[11px] tracking-widest transition-all flex items-center gap-1.5 md:gap-2 lg:gap-3 border-none cursor-pointer shadow-xl active:scale-95 shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Créer un nouveau contenu"
          >
            <Plus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
            <span className="hidden sm:inline">Nouveau Contenu</span>
          </button>
        )}
      </header>

      {mode === 'LIST' ? (
        /* 📋 REGISTRE DES CONTENUS */
        <section 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
          role="list"
          aria-label="Liste des contenus publiés"
        >
          {contents.map((content) => (
            <ContentCard 
              key={content.id}
              content={content}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
          <button
            type="button"
            onClick={() => {
              setMode('EDIT');
              setEditingContent(null);
              setFormData(DEFAULT_FORM);
              setFormErrors({});
            }}
            className="border-2 border-dashed border-white/5 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center p-6 md:p-8 lg:p-10 lg:p-12 text-slate-600 hover:border-blue-500/20 hover:text-blue-400 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Ajouter une unité de contenu"
          >
             <Layout size={32} className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 mb-3 md:mb-4 opacity-20 group-hover:opacity-100 group-hover:animate-bounce" aria-hidden="true" />
             <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center">
               Ajouter une unité de contenu
             </span>
          </button>
        </section>
      ) : (
        /* ✍️ ÉDITEUR */
        <article 
          className="bg-[#0F172A] p-4 md:p-6 lg:p-8 xl:p-10 lg:p-12 lg:p-14 rounded-2xl md:rounded-3xl lg:rounded-[4rem] border border-white/10 space-y-4 md:space-y-5 lg:space-y-6 lg:space-y-8 lg:space-y-10 shadow-2xl relative"
          aria-labelledby="editor-title"
        >
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 id="editor-title" className="text-lg md:text-xl lg:text-2xl font-black uppercase text-white tracking-tighter m-0">
              {editingContent ? 'Modifier le Contenu' : 'Nouveau Contenu'}
            </h3>
            <button 
              type="button"
              onClick={handleCancel}
              className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl text-slate-500 hover:text-white transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Fermer l'éditeur"
            >
              <X size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={handlePublish} className="space-y-4 md:space-y-5 lg:space-y-6 lg:space-y-8 lg:space-y-10" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 lg:gap-10">
              <div className="space-y-1.5 md:space-y-2">
                <label htmlFor="content-type" className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-2 md:ml-4 lg:ml-6 tracking-widest italic leading-none block">
                  Catégorie de Publication
                </label>
                <div className="relative">
                  <select 
                    id="content-type"
                    className="w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 lg:p-6 text-[10px] md:text-xs font-black text-white uppercase italic outline-none focus:border-blue-500 cursor-pointer appearance-none pr-10 md:pr-12"
                    value={formData.type}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => updateForm('type', e.target.value as ContentType)}
                  >
                    {CONTENT_TYPES.map(type => (
                      <option key={type.value} value={type.value} className="bg-[#0B0F1A] text-white">
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 md:right-6 bottom-3 md:bottom-4 lg:bottom-5 pointer-events-none text-slate-600" aria-hidden="true">
                    <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label htmlFor="content-title" className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-2 md:ml-4 lg:ml-6 tracking-widest italic leading-none block">
                  Titre de l&apos;Unité <span className="text-red-400">*</span>
                </label>
                <input 
                  id="content-title"
                  className={cn(
                    "w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 lg:p-6 text-[10px] md:text-xs font-black text-white uppercase italic outline-none focus:border-blue-500 transition-all",
                    formErrors.title && "border-red-500/50 focus:border-red-500"
                  )} 
                  placeholder="EX: STRATÉGIE SOUVERAINE 2026..." 
                  value={formData.title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('title', e.target.value.toUpperCase())}
                  aria-required="true"
                  aria-invalid={!!formErrors.title}
                />
                {formErrors.title && (
                  <p className="text-red-400 text-[7px] md:text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                    <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.title}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label htmlFor="content-catch" className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-2 md:ml-4 lg:ml-6 tracking-widest italic leading-none block">
                Accroche Stratégique (Catchphrase) <span className="text-red-400">*</span>
              </label>
              <input 
                id="content-catch"
                className={cn(
                  "w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 lg:p-6 text-[10px] md:text-xs font-black text-blue-400 uppercase italic outline-none focus:border-blue-500 transition-all",
                  formErrors.catch && "border-red-500/50 focus:border-red-500"
                )} 
                placeholder="L'EXCELLENCE SANS COMPROMIS..." 
                value={formData.catch}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('catch', e.target.value.toUpperCase())}
                aria-required="true"
                aria-invalid={!!formErrors.catch}
              />
              {formErrors.catch && (
                <p className="text-red-400 text-[7px] md:text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.catch}
                </p>
              )}
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label htmlFor="content-body" className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-2 md:ml-4 lg:ml-6 tracking-widest italic leading-none flex items-center gap-1.5 md:gap-2">
                <BookOpen size={12} className="w-3 h-3" aria-hidden="true" /> 
                Corps du Contenu (Markdown Supporté) <span className="text-red-400">*</span>
              </label>
              <textarea 
                id="content-body"
                rows={8} 
                className={cn(
                  "w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-5 lg:p-6 lg:p-8 text-[10px] md:text-sm font-bold text-slate-300 italic outline-none focus:border-blue-500 transition-all resize-none leading-relaxed",
                  formErrors.content && "border-red-500/50 focus:border-red-500"
                )} 
                placeholder="RÉDIGEZ ICI LE CONTENU DÉTAILLÉ DE VOTRE PUBLICATION..." 
                value={formData.content}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateForm('content', e.target.value)}
                aria-required="true"
                aria-invalid={!!formErrors.content}
              />
              {formErrors.content && (
                <p className="text-red-400 text-[7px] md:text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.content}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end items-center gap-4 md:gap-6 lg:gap-8 pt-4 md:pt-6 border-t border-white/5">
              <button 
                type="button"
                onClick={handleCancel} 
                className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer tracking-widest italic focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
              >
                Annuler les modifications
              </button>
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <button 
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)} 
                  className="flex-1 sm:flex-none px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 bg-white/5 text-slate-400 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 md:gap-2 lg:gap-3 border-none cursor-pointer italic focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-pressed={previewMode}
                  aria-label={previewMode ? "Quitter la prévisualisation" : "Prévisualiser le contenu"}
                >
                  <Eye size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
                  <span className="hidden sm:inline">{previewMode ? 'Quitter' : 'Prévisualisation'}</span>
                </button>
                <button 
                  type="submit"
                  disabled={loading} 
                  className={cn(
                    "flex-1 sm:flex-none px-4 md:px-6 lg:px-8 xl:px-12 py-3 md:py-4 lg:py-5 bg-blue-600 text-white rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] shadow-xl hover:bg-white hover:text-blue-700 transition-all flex items-center justify-center gap-1.5 md:gap-2 lg:gap-3 border-none cursor-pointer italic tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                  aria-busy={loading}
                  aria-label="Publier sur la vitrine"
                >
                  {loading ? (
                    <><Loader2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">PUBLICATION...</span><span className="sm:hidden">En cours...</span></>
                  ) : (
                    <><Save size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> <span className="hidden sm:inline">PUBLIER SUR LA VITRINE</span><span className="sm:hidden">Publier</span></>
                  )}
                </button>
              </div>
            </div>
          </form>
        </article>
      )}
    </div>
  );
}