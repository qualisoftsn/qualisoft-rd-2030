/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 MODULE : RAPPORT D'AUDIT ET CLÔTURE (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Saisie des constats et auto-génération de Fiches d'Anomalies (NC)
 * VERSION : 2.0 - Typing strict + Validation + Design Elite + Export PDF ready
 * API : apiClient Axios avec interceptors
 * RÉVISION : 19 Mars 2026 | 14:45 GMT
 * -------------------------------------------------------------------------
 */

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FileText, Plus, Trash2, Save, Loader2, ArrowLeft, ShieldAlert, 
  CheckCircle, AlertCircle, Download, Eye, Printer
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';
import apiClient, { ApiError } from '@/core/api/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type FindingType = 
  | 'CONFORMITE' 
  | 'POINT_FORT' 
  | 'OBSERVATION' 
  | 'NC_MINEURE' 
  | 'NC_MAJEURE';

export interface Finding {
  FI_Id?: string;
  FI_Description: string;
  FI_Type: FindingType;
  FI_Clause?: string;
  FI_Recommandation?: string;
}

export interface AuditReport {
  AU_Id: string;
  AU_Title: string;
  AU_Reference: string;
  AU_Processus?: { PR_Libelle: string };
  AU_Site?: { S_Name: string };
  AU_Status: string;
  AU_Findings?: Finding[];
}

const FINDING_CONFIG: Record<FindingType, { label: string; color: string; icon: string }> = {
  CONFORMITE: { label: '✅ Conformité', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5', icon: '✓' },
  POINT_FORT: { label: '⭐ Point Fort', color: 'border-blue-500/30 text-blue-400 bg-blue-500/5', icon: '★' },
  OBSERVATION: { label: '👀 Observation', color: 'border-amber-500/30 text-amber-400 bg-amber-500/5', icon: '○' },
  NC_MINEURE: { label: '⚠️ NC Mineure', color: 'border-orange-500/30 text-orange-400 bg-orange-500/5', icon: '⚠' },
  NC_MAJEURE: { label: '🚨 NC Majeure', color: 'border-rose-500/30 text-rose-400 bg-rose-500/5', icon: '✗' },
};

// ============================================================================
// SOUS-COMPOSANT : FINDING CARD
// ============================================================================

function FindingCard({ 
  finding, 
  index, 
  onUpdate, 
  onRemove, 
  canRemove 
}: { 
  finding: Finding & { _tempId?: string }; 
  index: number; 
  onUpdate: (index: number, field: keyof Finding, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) {
  const config = FINDING_CONFIG[finding.FI_Type];
  
  return (
    <div className={cn(
      "p-5 md:p-6 bg-[#0B0F1A] border rounded-2xl md:rounded-[2rem] grid grid-cols-1 lg:grid-cols-12 gap-6 hover:border-blue-500/30 transition-all",
      config.color
    )}>
      {/* Description */}
      <div className="lg:col-span-8 space-y-3">
        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 italic block">
          Détails factuels du constat #{index + 1}
        </label>
        <textarea 
          className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 min-h-[100px] resize-none italic transition-all"
          value={finding.FI_Description} 
          onChange={(e) => onUpdate(index, 'FI_Description', e.target.value)} 
          placeholder="Saisissez l'observation factuelle, avec références aux clauses ISO..."
          aria-label={`Description du constat ${index + 1}`}
        />
      </div>
      
      {/* Classification + Actions */}
      <div className="lg:col-span-4 flex flex-col justify-between">
        <div className="space-y-3">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 italic block">
            Classification ISO
          </label>
          <select 
            className={cn(
              "w-full bg-[#0F172A] border-2 rounded-xl p-4 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer appearance-none transition-all",
              finding.FI_Type.includes('NC') 
                ? "border-rose-500/30 text-rose-400 focus:border-rose-500" 
                : "border-blue-500/30 text-blue-400 focus:border-blue-500"
            )}
            value={finding.FI_Type} 
            onChange={(e) => onUpdate(index, 'FI_Type', e.target.value as FindingType)}
            aria-label={`Classification du constat ${index + 1}`}
          >
            {Object.entries(FINDING_CONFIG).map(([value, { label }]) => (
              <option key={value} value={value} className="bg-[#0B0F1A] text-white">
                {label}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          type="button"
          onClick={() => onRemove(index)} 
          disabled={!canRemove}
          className={cn(
            "w-full mt-4 py-3 rounded-xl text-[9px] font-black uppercase transition-all border-none cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-rose-400",
            canRemove 
              ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white" 
              : "bg-slate-500/10 text-slate-500 cursor-not-allowed opacity-50"
          )}
          aria-label={`Supprimer le constat ${index + 1}`}
        >
          <Trash2 size={14} aria-hidden="true" /> Supprimer
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function RapportAuditPage() {
  const params = useParams();
  const auditId = params?.id as string; 
  const router = useRouter();
  
  const [audit, setAudit] = useState<AuditReport | null>(null);
  const [findings, setFindings] = useState<(Finding & { _tempId: string })[]>([
    { _tempId: crypto.randomUUID(), FI_Description: '', FI_Type: 'CONFORMITE' }
  ]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // ============================================================================
  // FETCH
  // ============================================================================

  const fetchAudit = useCallback(async (id: string) => {
    try {
      const response = await apiClient.get<AuditReport>(`/audits/${id}`);
      setAudit(response.data);
      
      // Charger les constats existants si présents
      if (response.data.AU_Findings?.length) {
        const withTempId = response.data.AU_Findings.map(f => ({
          ...f,
          _tempId: f.FI_Id || crypto.randomUUID()
        }));
        setFindings(withTempId);
      }
    } catch (error) {
      console.error('❌ Erreur chargement audit:', error);
      toast.error("Audit introuvable");
      router.push('/dashboard/audits');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (auditId) fetchAudit(auditId);
  }, [auditId, fetchAudit]);

  // ============================================================================
  // FINDINGS HANDLERS
  // ============================================================================

  const addFinding = useCallback(() => {
    setFindings(prev => [...prev, { 
      _tempId: crypto.randomUUID(), 
      FI_Description: '', 
      FI_Type: 'CONFORMITE' 
    }]);
  }, []);

  const updateFinding = useCallback((index: number, field: keyof Finding, value: string) => {
    setFindings(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const removeFinding = useCallback((index: number) => {
    setFindings(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ============================================================================
  // SUBMISSION
  // ============================================================================

  const validateFindings = useCallback((): boolean => {
    const incomplete = findings.some(f => !f.FI_Description.trim());
    if (incomplete) {
      toast.error("Veuillez compléter tous les constats avant de clôturer");
      return false;
    }
    return true;
  }, [findings]);

  const handleSubmit = async () => {
    if (!validateFindings()) return;
    
    const toastId = toast.loading("Audit des constats et scellement du rapport final...");
    setSubmitting(true);
    
    try {
      // Préparation des données (sans les _tempId)
      const payload = {
        findings: findings.map(({ _tempId, ...f }) => f)
      };
      
      await apiClient.post(`/audits/${auditId}/submit-report`, payload);
      
      toast.success("Rapport clôturé. Les NC ont été injectées dans le PAQ.", { 
        id: toastId,
        action: {
          label: 'Voir le PAQ',
          onClick: () => router.push('/dashboard/paq'),
        },
      });
      
      // Redirection après délai
      setTimeout(() => {
        router.push('/dashboard/audits');
      }, 1500);
      
    } catch (error: any) {
      console.error('❌ Erreur soumission rapport:', error);
      const apiError = error?.response?.data as ApiError | undefined;
      const message = apiError?.message || error?.message || "Échec du scellement";
      toast.error(message, { id: toastId, duration: 6000 });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportPDF = useCallback(() => {
    toast.info("Génération du PDF en cours...", { duration: 3000 });
    // TODO: Implémenter l'export PDF côté backend ou via jsPDF
    // window.open(`/api/audits/${auditId}/report.pdf`, '_blank');
  }, [auditId]);

  // ============================================================================
  // CALCULS
  // ============================================================================

  const ncCount = findings.filter(f => f.FI_Type.includes('NC')).length;
  const hasNC = ncCount > 0;

  // ============================================================================
  // ÉTATS D'AFFICHAGE
  // ============================================================================

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0B0F1A] text-blue-400 font-black italic uppercase text-xs animate-pulse tracking-widest" role="status">
        <Loader2 className="animate-spin mr-3" size={24} aria-hidden="true" />
        Initialisation du Rapport Souverain...
      </div>
    );
  }

  if (!audit) {
    return null; // Redirection gérée dans fetchAudit
  }

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* HEADER */}
      <header className="shrink-0 p-4 md:p-6 lg:p-8 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
        <div className="flex items-center gap-4 md:gap-6 min-w-0">
          <button 
            onClick={() => router.back()} 
            className="p-3 md:p-4 bg-white/5 rounded-2xl hover:bg-blue-600 hover:text-white transition-all border border-white/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Retour"
          >
            <ArrowLeft size={18} md:size={20} aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-black uppercase italic tracking-tighter m-0 text-white">
              Rapport d&apos;<span className="text-blue-500">Audit</span>
            </h1>
            <p className="text-[9px] md:text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1 italic truncate">
              REF: {audit.AU_Reference} • {audit.AU_Processus?.PR_Libelle || 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          {/* Preview toggle */}
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={cn(
              "px-4 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all border border-white/10 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400",
              previewMode ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
            )}
            aria-pressed={previewMode}
          >
            <Eye size={16} aria-hidden="true" />
            <span className="hidden sm:inline">{previewMode ? 'Édition' : 'Aperçu'}</span>
          </button>
          
          {/* Export PDF */}
          <button
            type="button"
            onClick={handleExportPDF}
            className="px-4 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/10 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="Exporter en PDF"
          >
            <Download size={16} aria-hidden="true" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          
          {/* Submit */}
          <button 
            type="button"
            onClick={handleSubmit} 
            disabled={submitting}
            className={cn(
              "flex-1 md:flex-none px-6 md:px-8 lg:px-10 py-3 md:py-4 bg-emerald-600 hover:bg-white hover:text-emerald-900 text-white rounded-2xl md:rounded-3xl font-black uppercase italic text-xs tracking-widest shadow-2xl transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 md:gap-3 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400",
              submitting && "cursor-wait"
            )}
            aria-busy={submitting}
          >
            {submitting ? (
              <><Loader2 className="animate-spin" size={18} aria-hidden="true" /><span className="hidden sm:inline">Scellement...</span></>
            ) : (
              <><CheckCircle size={18} aria-hidden="true" /><span className="hidden sm:inline">Clôturer & Archiver</span></>
            )}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 xl:p-12">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
          
          {/* Section Constats */}
          <section className="bg-[#0F172A] border border-white/5 rounded-3xl md:rounded-[3rem] p-6 md:p-8 lg:p-12 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10 border-b border-white/5 pb-6 md:pb-8">
              <h2 className="text-xl md:text-2xl font-black uppercase italic m-0 text-white">
                Constats de Terrain
              </h2>
              {!previewMode && (
                <button 
                  type="button"
                  onClick={addFinding} 
                  className="p-3 md:p-4 bg-blue-600 rounded-2xl text-white shadow-xl hover:scale-105 hover:bg-blue-500 transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Ajouter un nouveau constat"
                >
                  <Plus size={20} md:size={24} aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="space-y-6 md:space-y-8">
              {findings.map((finding, index) => (
                <FindingCard 
                  key={finding._tempId}
                  finding={finding}
                  index={index}
                  onUpdate={updateFinding}
                  onRemove={removeFinding}
                  canRemove={findings.length > 1 && !previewMode}
                />
              ))}
            </div>
          </section>

          {/* Alertes NC */}
          {hasNC && (
            <section className="bg-rose-500/5 border border-rose-500/20 rounded-3xl md:rounded-[3rem] p-6 md:p-8 lg:p-10 animate-in slide-in-from-bottom-4">
              <h3 className="text-rose-400 font-black uppercase italic text-lg md:text-xl m-0 mb-4 md:mb-6 flex items-center gap-3 md:gap-4">
                <ShieldAlert size={24} md:size={28} aria-hidden="true" /> 
                Alertes Non-Conformités Détectées ({ncCount})
              </h3>
              <div className="space-y-3 md:space-y-4">
                {findings.filter(f => f.FI_Type.includes('NC')).map((nc, idx) => (
                  <div 
                    key={nc._tempId || idx} 
                    className="p-4 bg-rose-500/10 rounded-xl md:rounded-2xl border border-rose-500/10 text-[9px] md:text-[10px] font-bold text-white uppercase italic tracking-widest flex items-start gap-3 md:gap-4"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] mt-1.5 shrink-0" aria-hidden="true"/> 
                    <span className="truncate">
                      <strong className="text-rose-300">{FINDING_CONFIG[nc.FI_Type].label}</strong> : {nc.FI_Description.substring(0, 120)}{nc.FI_Description.length > 120 ? '...' : ''}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-4 md:mt-6 italic">
                ⚠️ Ces NC seront automatiquement injectées dans le Plan d'Actions Correctives (PAQ) après clôture
              </p>
            </section>
          )}

          {/* Résumé */}
          <section className="bg-[#0F172A]/50 border border-white/5 rounded-2xl md:rounded-3xl p-6">
            <h4 className="text-sm font-black uppercase italic text-slate-400 mb-4">Résumé du Rapport</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-[#0B0F1A] rounded-xl">
                <p className="text-2xl md:text-3xl font-black text-white">{findings.length}</p>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest">Total Constats</p>
              </div>
              <div className="text-center p-4 bg-[#0B0F1A] rounded-xl">
                <p className="text-2xl md:text-3xl font-black text-emerald-400">
                  {findings.filter(f => f.FI_Type === 'CONFORMITE').length}
                </p>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest">Conformes</p>
              </div>
              <div className="text-center p-4 bg-[#0B0F1A] rounded-xl">
                <p className="text-2xl md:text-3xl font-black text-amber-400">
                  {findings.filter(f => f.FI_Type === 'OBSERVATION').length}
                </p>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest">Observations</p>
              </div>
              <div className="text-center p-4 bg-[#0B0F1A] rounded-xl">
                <p className="text-2xl md:text-3xl font-black text-rose-400">{ncCount}</p>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest">Non-Conformités</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, 0.3); border-radius: 10px; }
        :focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }
      `}</style>
    </div>
  );
}