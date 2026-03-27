/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : SURVEY SCANNER (ISO 9001 §9.1.2)
 * RÔLE : Analyse et traitement des réponses aux enquêtes
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useState, useCallback, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { 
  Plus, BarChart3, Link as LinkIcon, Mail, FileText, Workflow, 
  PenTool, Globe, Server, AlertOctagon, Target,
  X, RefreshCw, CheckCircle2, Download, Upload
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { useRouter } from 'next/navigation';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type TargetType = 'CLIENT' | 'SUPPLIER' | 'EMPLOYEE';
export type ScanStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';

export interface SurveyCampaign {
  CMP_Id: string;
  CMP_Title: string;
  CMP_Target: TargetType;
  CMP_Status: 'OUVERTE' | 'FERMEE' | 'EN_COURS';
  CMP_Responses: number;
  CMP_CreatedAt: string;
  CMP_ClosedAt?: string;
  CMP_CreatedById?: string;
}

export interface SurveyStats {
  csat: number;
  totalResponses: number;
}

export interface ScanResult {
  id: string;
  campaignId: string;
  score: number;
  comments?: string;
  submittedAt: string;
  status: ScanStatus;
}

export interface TargetConfig {
  color: string;
  bg: string;
  border: string;
  label: string;
  iso: string;
}

export interface CampaignRowProps {
  camp: SurveyCampaign;
  color: string;
  onCopy: () => void;
  onScan: () => void;
}

export interface WorkflowStepProps {
  step: string;
  title: string;
  icon: React.ReactNode;
  color: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const TARGET_CONFIG: Record<TargetType, TargetConfig> = {
  CLIENT: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Clients', iso: '§9.1.2' },
  SUPPLIER: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Fournisseurs', iso: '§8.4.2' },
  EMPLOYEE: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'RH / Social', iso: '§7.1.2' }
};

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : CAMPAIGN ROW
// ============================================================================

function CampaignRow({ camp, color, onCopy, onScan }: CampaignRowProps) {
  return (
    <article 
      className="bg-[#0B1222]/50 border-2 border-white/5 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[3rem] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 md:gap-6 lg:gap-8 group hover:bg-white/5 hover:border-white/10 transition-all shadow-2xl text-left italic focus-within:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
      role="article"
      aria-label={`Campagne: ${camp.CMP_Title}`}
    >
      <div className="flex items-center gap-4 md:gap-6 lg:gap-8 w-full xl:w-auto">
        <div className={cn("w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center bg-black/40 border-2 border-white/5 shadow-inner shrink-0", color)}>
          <FileText size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-lg md:text-xl lg:text-2xl uppercase text-white m-0 group-hover:text-blue-400 transition-colors truncate tracking-tighter">{camp.CMP_Title}</p>
          <div className="flex flex-wrap items-center gap-3 md:gap-4 lg:gap-6 mt-2 md:mt-3 lg:mt-4">
             <span className="text-[9px] md:text-[10px] font-black text-emerald-400 tracking-widest bg-emerald-500/10 px-3 md:px-4 py-1 md:py-1.5 rounded-xl border border-emerald-500/20">{camp.CMP_Responses} RETOURS</span>
             <span className={cn(
               "text-[9px] md:text-[10px] font-black px-3 md:px-4 py-1 md:py-1.5 rounded-xl border tracking-widest",
               camp.CMP_Status === 'OUVERTE' ? "bg-blue-600/10 text-blue-400 border-blue-600/20" : "bg-slate-800 text-slate-500 border-white/5"
             )}>
               {camp.CMP_Status}
             </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 md:gap-3 lg:gap-4 w-full xl:w-auto justify-end">
        <button 
          type="button"
          onClick={onCopy} 
          className="p-2 md:p-3 lg:p-4 bg-white/5 rounded-lg md:rounded-xl border border-white/5 text-slate-500 hover:text-blue-400 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Copier le lien de la campagne"
          title="Copier le lien"
        >
          <LinkIcon size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
        </button>
        <button 
          type="button"
          className="p-2 md:p-3 lg:p-4 bg-white/5 rounded-lg md:rounded-xl border border-white/5 text-slate-500 hover:text-purple-400 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="Envoyer par email"
          title="Envoyer"
        >
          <Mail size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
        </button>
        <button 
          type="button"
          onClick={onScan} 
          className="bg-blue-600 text-white px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 rounded-lg md:rounded-xl lg:rounded-2xl font-black text-[9px] md:text-[10px] lg:text-[11px] uppercase border-none cursor-pointer hover:bg-white hover:text-blue-700 transition-all shadow-2xl italic tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Scanner les résultats"
        >
          Scanner
        </button>
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : WORKFLOW STEP
// ============================================================================

function WorkflowStep({ step, title, icon, color }: WorkflowStepProps) {
  return (
    <article className="p-4 md:p-6 bg-black/30 border border-white/5 rounded-2xl md:rounded-3xl flex items-center justify-between group hover:bg-white/5 transition-all shadow-inner focus-within:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400">
      <div className="flex items-center gap-4 md:gap-6">
        <span className={cn("text-3xl md:text-4xl font-black italic opacity-10 group-hover:opacity-100 transition-opacity", color)}>{step}</span>
        <p className="text-[10px] md:text-[11px] lg:text-[12px] font-black uppercase italic text-white m-0 tracking-widest">{title}</p>
      </div>
      <div className="p-2 md:p-3 bg-white/5 text-slate-600 group-hover:bg-white group-hover:text-slate-900 rounded-xl md:rounded-2xl transition-all shadow-inner">
        {icon}
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : SCAN UPLOAD AREA
// ============================================================================

interface ScanUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

function ScanUploadArea({ onFileSelect, isProcessing }: ScanUploadProps) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className="border-2 border-dashed border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 text-center hover:border-blue-500/30 transition-all cursor-pointer bg-black/20"
      role="button"
      tabIndex={0}
      aria-label="Zone de dépôt de fichier"
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          document.getElementById('scan-file-input')?.click();
        }
      }}
    >
      <input
        id="scan-file-input"
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept=".csv,.xlsx,.xls"
        disabled={isProcessing}
      />
      <Upload size={32} className="w-8 h-8 md:w-10 md:h-10 text-blue-400 mx-auto mb-3 md:mb-4" aria-hidden="true" />
      <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2">
        {isProcessing ? 'TRAITEMENT EN COURS...' : 'DÉPOSER LES RÉPONSES (CSV/EXCEL)'}
      </p>
      <p className="text-[8px] md:text-[9px] text-slate-600 tracking-widest">
        Formats supportés: .csv, .xlsx, .xls
      </p>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : SCAN RESULTS TABLE
// ============================================================================

interface ScanResultsProps {
  results: ScanResult[];
  targetConfig: TargetConfig;
}

function ScanResultsTable({ results, targetConfig }: ScanResultsProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse" role="table" aria-label="Résultats du scan">
        <thead>
          <tr className="text-[8px] md:text-[9px] text-slate-500 tracking-widest border-b border-white/5 font-black italic">
            <th className="p-3 md:p-4" scope="col">ID</th>
            <th className="p-3 md:p-4" scope="col">Score</th>
            <th className="p-3 md:p-4" scope="col">Statut</th>
            <th className="p-3 md:p-4" scope="col">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {results.map((result) => (
            <tr key={result.id} className="hover:bg-white/5 transition-all">
              <td className="p-3 md:p-4 text-[9px] md:text-[10px] font-mono text-slate-400">{result.id.slice(0, 8)}</td>
              <td className="p-3 md:p-4">
                <span className={cn(
                  "text-[10px] md:text-[11px] font-black",
                  result.score >= 8 ? "text-emerald-400" : result.score >= 5 ? "text-amber-400" : "text-rose-400"
                )}>
                  {result.score}/10
                </span>
              </td>
              <td className="p-3 md:p-4">
                <span className={cn(
                  "text-[8px] md:text-[9px] px-2 md:px-3 py-1 rounded-lg border tracking-widest uppercase",
                  result.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  result.status === 'PROCESSING' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                  result.status === 'ERROR' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                  "bg-slate-500/10 text-slate-400 border-slate-500/20"
                )}>
                  {result.status}
                </span>
              </td>
              <td className="p-3 md:p-4 text-[8px] md:text-[9px] text-slate-500">
                {new Date(result.submittedAt).toLocaleDateString('fr-SN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function SurveyScannerPage() {
  const router = useRouter();
  const [activeTarget, setActiveTarget] = useState<TargetType>('CLIENT');
  const [campaigns, setCampaigns] = useState<SurveyCampaign[]>([]);
  const [stats, setStats] = useState<SurveyStats>({ csat: 0, totalResponses: 0 });
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [campRes, statsRes] = await Promise.all([
        apiClient.get<SurveyCampaign[]>(`/surveys/campaigns?target=${activeTarget}`),
        apiClient.get<SurveyStats>(`/surveys/stats?target=${activeTarget}`).catch(() => ({ data: { csat: 0, totalResponses: 0 } }))
      ]);
      setCampaigns(Array.isArray(campRes.data) ? campRes.data : []);
      setStats({
        csat: statsRes.data?.data?.csat || 0,
        totalResponses: statsRes.data?.data?.totalResponses || 0
      });
    } catch (error) {
      console.error('❌ Erreur chargement surveys:', error);
      toast.error("RUPTURE DE FLUX MATRIX : SYNCHRONISATION ÉCHOUÉE.");
    } finally { 
      setLoading(false); 
    }
  }, [activeTarget]);

  useEffect(() => { if (typeof window !== 'undefined') fetchDashboardData(); }, [fetchDashboardData]);

  const copyLink = (id: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`https://qualisoft.sn/public/survey/${id}`);
      toast.success("LIEN SCELLÉ DANS LE PRESSE-PAPIER.");
    }
  };

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    const toastId = toast.loading("Analyse des réponses en cours...");
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target', activeTarget);
      
      const res = await apiClient.post<ScanResult[]>('/surveys/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setScanResults(res.data || []);
      setShowResults(true);
      toast.success("Scan terminé avec succès", { id: toastId });
      fetchDashboardData();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ÉCHEC DU SCAN", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportResults = () => {
    if (scanResults.length === 0) return;
    
    const csv = [
      ['ID', 'Score', 'Statut', 'Date'].join(','),
      ...scanResults.map(r => [r.id, r.score, r.status, r.submittedAt].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scan-results-${activeTarget}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Résultats exportés");
  };

  const targets: TargetType[] = ['CLIENT', 'SUPPLIER', 'EMPLOYEE'];

  if (loading && campaigns.length === 0 && typeof window !== 'undefined') {
    return <LoadingScreen label="Synchronisation Matrix §9.1..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <div className="flex items-center gap-3 md:gap-4">
            <span className="bg-blue-600/10 border border-blue-500/20 px-3 md:px-4 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[9px] text-blue-400 tracking-widest italic shadow-inner">
              ISO 9001 Compliance Matrix
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic flex items-center gap-3 md:gap-4 lg:gap-5">
            Survey <span className={TARGET_CONFIG[activeTarget].color}>Scanner</span>
          </h1>
        </div>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <button 
            type="button"
            onClick={fetchDashboardData} 
            disabled={loading}
            className="p-2.5 md:p-3 lg:p-5 bg-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl hover:bg-white/10 hover:text-blue-400 border border-white/10 transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            aria-label="Actualiser les données"
          >
            <RefreshCw size={20} className={cn("w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8", loading ? "animate-spin" : "")} aria-hidden="true" />
          </button>
          <button 
            type="button"
            onClick={() => router.push('/dashboard/quality/surveys')} 
            className="bg-slate-700 hover:bg-white hover:text-slate-900 px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl text-[9px] md:text-[10px] shadow-2xl border-none cursor-pointer text-white italic transition-all active:scale-95 flex items-center justify-center gap-2 md:gap-3 tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Retour au cockpit surveys"
          >
            <ArrowLeft size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
            <span className="hidden sm:inline">Retour Cockpit</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 gap-4 md:gap-6 lg:gap-8">
        {/* Target Selection */}
        <nav className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 shrink-0" role="tablist" aria-label="Sélection de la cible">
          {targets.map((t) => (
            <button 
              key={t} 
              type="button"
              onClick={() => setActiveTarget(t)} 
              className={cn(
                "p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
                activeTarget === t 
                  ? `bg-[#151A2D] ${TARGET_CONFIG[t].border} shadow-2xl` 
                  : "bg-slate-900/40 border-white/5 opacity-40 hover:opacity-100"
              )}
              role="tab"
              aria-selected={activeTarget === t}
              aria-controls={`${t.toLowerCase()}-panel`}
            >
              <div className="flex justify-between items-center mb-3 md:mb-4 relative z-10">
                <span className="text-[9px] md:text-[10px] text-slate-500 tracking-widest italic m-0">{TARGET_CONFIG[t].iso}</span>
                <Target size={16} className={cn("w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5", activeTarget === t ? TARGET_CONFIG[t].color : 'text-slate-700')} aria-hidden="true" />
              </div>
              <p className={cn("text-2xl md:text-3xl font-black italic m-0 tracking-tighter relative z-10", activeTarget === t ? TARGET_CONFIG[t].color : "text-white")}>
                {TARGET_CONFIG[t].label}
              </p>
            </button>
          ))}
        </nav>

        <div className="flex-1 min-h-0 flex flex-col xl:grid xl:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
          {/* Left: Upload & Results */}
          <section className="xl:col-span-8 bg-[#151A2D] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] flex flex-col overflow-hidden shadow-2xl" aria-labelledby="scanner-title">
            <header className="p-4 md:p-6 lg:p-8 border-b-2 border-white/5 flex justify-between items-center bg-slate-900/30">
              <h3 id="scanner-title" className="text-lg md:text-xl font-black italic flex items-center gap-3 md:gap-4 m-0 tracking-tighter uppercase">
                <BarChart3 className={TARGET_CONFIG[activeTarget].color} size={20} aria-hidden="true" /> 
                <span className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7">
                  <BarChart3 className={TARGET_CONFIG[activeTarget].color} aria-hidden="true" />
                </span>
                Scanner de Réponses
              </h3>
              {showResults && (
                <button
                  type="button"
                  onClick={handleExportResults}
                  className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl hover:bg-white/10 transition-all border border-white/5 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Exporter les résultats"
                >
                  <Download size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" />
                </button>
              )}
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8">
              {!showResults ? (
                <ScanUploadArea onFileSelect={handleFileSelect} isProcessing={isProcessing} />
              ) : (
                <div className="space-y-4 md:space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[11px] md:text-[12px] font-black text-slate-400 tracking-widest uppercase">
                      {scanResults.length} réponses analysées
                    </h4>
                    <button
                      type="button"
                      onClick={() => { setShowResults(false); setScanResults([]); }}
                      className="text-[9px] md:text-[10px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
                    >
                      Nouveau Scan
                    </button>
                  </div>
                  <ScanResultsTable results={scanResults} targetConfig={TARGET_CONFIG[activeTarget]} />
                </div>
              )}
            </div>
          </section>

          {/* Right: Stats & Workflow */}
          <aside className="xl:col-span-4 flex flex-col gap-4 md:gap-6 lg:gap-8 overflow-hidden">
            <article className="bg-[#151A2D] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-6 md:p-8 lg:p-10 relative overflow-hidden shadow-2xl shrink-0 text-left">
              <div className={cn("absolute -right-6 md:-right-8 lg:-right-12 -top-6 md:-top-8 lg:-top-12 w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full blur-[100px] opacity-10", TARGET_CONFIG[activeTarget].color.replace('text', 'bg'))} aria-hidden="true" />
              <h3 className="text-[10px] md:text-[11px] font-black text-slate-500 tracking-widest mb-6 md:mb-8 lg:mb-10 m-0 relative z-10 italic uppercase">
                Indice Consolidé SDE
              </h3>
              <div className="flex items-baseline gap-3 md:gap-4 relative z-10 mb-6 md:mb-8 lg:mb-10">
                <p className={cn("text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black italic leading-none tracking-tighter m-0 drop-shadow-2xl", TARGET_CONFIG[activeTarget].color)}>
                  {stats.csat.toFixed(1)}
                </p>
                <span className="text-2xl md:text-3xl font-black text-slate-700 italic">/10</span>
              </div>
              
              <div className="bg-black/40 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 shadow-inner relative z-10 text-center">
                <div className="text-blue-400 font-mono text-[12px] md:text-[14px] m-0 overflow-x-auto">
                  {"$$CSAT = \\frac{\\sum (Score \\times Poids)}{N_{total}}$$"}
                </div>
              </div>
            </article>

            <article className="flex-1 bg-[#151A2D] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-6 md:p-8 lg:p-10 flex flex-col shadow-2xl text-left">
              <h3 className="text-[10px] md:text-[11px] font-black text-slate-500 tracking-widest mb-6 md:mb-8 lg:mb-10 m-0 flex items-center gap-3 md:gap-4 italic uppercase">
                <Workflow size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
                Chaine de Valeur §9
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 md:space-y-4 lg:space-y-6 pr-1 md:pr-2" role="list">
                <WorkflowStep step="01" title="Upload" icon={<Upload size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />} color="text-blue-400" />
                <WorkflowStep step="02" title="Validation" icon={<CheckCircle2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />} color="text-emerald-400" />
                <WorkflowStep step="03" title="Calcul CSAT" icon={<BarChart3 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />} color="text-purple-400" />
                <WorkflowStep step="04" title="Alertes NC" icon={<AlertOctagon size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />} color="text-rose-400" />
              </div>
              <div className="mt-6 md:mt-8 lg:mt-10 p-4 md:p-6 bg-amber-500/5 border-2 border-amber-500/10 rounded-2xl md:rounded-3xl">
                <p className="text-[9px] md:text-[10px] text-slate-400 font-black tracking-widest leading-relaxed m-0 italic uppercase">
                  <span className="text-amber-400">Alerte Matrix :</span> Tout score &lt; 5/10 déclenche l&apos;ouverture automatique d&apos;une Fiche NC.
                </p>
              </div>
            </article>
          </aside>
        </div>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}