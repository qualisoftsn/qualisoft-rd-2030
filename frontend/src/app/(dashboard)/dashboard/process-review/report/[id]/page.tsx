/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📄 MODULE : RAPPORT FINAL PV (ISO 9001 §9.3)
 * RÔLE : Génération du Procès-Verbal officiel pour archivage réglementaire
 * VERSION : 3.0 - Typing strict + Print-Friendly + Accessibilité
 */

import React, { useEffect, useState, use } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { Printer, ArrowLeft, FileCheck, ShieldCheck, Award, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface ProcessReview {
  PRV_Id: string;
  PRV_ProcessusId: string;
  PRV_Month: number;
  PRV_Year: number;
  PRV_Status: 'BROUILLON' | 'EN_COURS' | 'VALIDEE' | 'CLOTUREE';
  PRV_PerformanceAnalysis?: string;
  PRV_AuditAnalysis?: string;
  PRV_RiskAnalysis?: string;
  PRV_ResourcesAnalysis?: string;
  PRV_Decisions?: string;
  PRV_PiloteSigned: boolean;
  PRV_RQSigned: boolean;
  PRV_DocRef?: string;
  PRV_TenantName?: string;
  PRV_DateReview?: string;
  PRV_CreatedAt: string;
  PRV_UpdatedAt: string;
}

export interface PVSectionProps {
  title: string;
  val?: string;
  accent: 'blue' | 'red';
}

export interface SignatureBlockProps {
  label: string;
  signed: boolean;
  icon: React.ElementType;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-indigo-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : PV SECTION
// ============================================================================

function PVSection({ title, val, accent }: PVSectionProps) {
  const colors: Record<PVSectionProps['accent'], string> = { 
    blue: "bg-blue-600", 
    red: "bg-red-600" 
  };
  
  return (
    <section className="text-left page-break-inside-avoid" aria-labelledby={`section-${title}`}>
      <h3 id={`section-${title}`} className="bg-slate-900 text-white p-3 md:p-4 text-[10px] md:text-[11px] font-black uppercase mb-4 md:mb-8 italic tracking-widest flex items-center gap-3 md:gap-4 leading-none m-0">
        <span className={cn("w-1 md:w-1.5 h-3 md:h-4 rounded-full shrink-0", colors[accent])} aria-hidden="true" /> 
        {title}
      </h3>
      <div className="text-[11px] md:text-[13px] leading-relaxed pl-4 md:pl-10 border-l-4 border-slate-100 italic text-slate-800 font-bold uppercase tracking-tighter whitespace-pre-wrap m-0">
        {val || "AUCUNE DONNÉE CONSIGNÉE."}
      </div>
    </section>
  );
}

// ============================================================================
// SOUS-COMPOSANT : SIGNATURE BLOCK
// ============================================================================

function SignatureBlock({ label, signed, icon: Icon }: SignatureBlockProps) {
  return (
    <article 
      className="border-[3px] border-black p-6 md:p-8 lg:p-10 h-48 md:h-56 lg:h-64 relative rounded-tr-3xl md:rounded-tr-[4rem] flex flex-col items-center justify-center group bg-white page-break-inside-avoid"
      aria-label={`${label}: ${signed ? 'Signé' : 'En attente'}`}
    >
      <span className="absolute -top-3 md:-top-4 left-4 md:left-10 bg-white px-3 md:px-5 text-[9px] md:text-[10px] font-black uppercase italic tracking-widest">
        {label}
      </span>
      <Icon 
        className={cn(
          "w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 mb-3 md:mb-5 transition-all",
          signed ? "text-emerald-500 scale-110" : "text-slate-100"
        )} 
        aria-hidden="true" 
      />
      <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-900 italic m-0 tracking-tighter leading-none">
        {signed ? "SCELLÉ NUMÉRIQUEMENT" : "EN ATTENTE DE VISA"}
      </p>
      <p className="text-[7px] md:text-[8px] font-black text-slate-400 mt-2 md:mt-3 uppercase tracking-widest italic leading-none">
        {signed ? "ID-TOKEN: MASTER-SDE-ACK" : "SMI-VOID"}
      </p>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function RapportRevueFinalPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState<ProcessReview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      apiClient.get<ProcessReview>(`/process-reviews/${id}`)
        .then(res => setData(res.data?.data || res.data || null))
        .catch((error: unknown) => {
          console.error('❌ Erreur chargement PV:', error);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Scellage du Procès-Verbal en cours..." />;
  }

  return (
    <div className="min-h-screen bg-slate-200 print:bg-white p-0 font-sans italic selection:bg-blue-100 lg:pl-72 lg:ml-0 overflow-y-auto">
      
      {/* 🧭 TOOLBAR (Hide on print) */}
      <nav className="print:hidden sticky top-0 z-50 bg-[#0B0F1A] text-white px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 flex justify-between items-center shadow-2xl border-b border-white/5" role="navigation" aria-label="Navigation du rapport">
        <button 
          type="button"
          onClick={() => router.back()} 
          className="flex items-center gap-2 md:gap-3 lg:gap-4 text-[9px] md:text-[10px] lg:text-[11px] font-black uppercase tracking-widest hover:text-blue-400 transition-all border-none bg-transparent cursor-pointer italic text-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
          aria-label="Quitter le mode lecture"
        >
          <ArrowLeft size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
          <span className="hidden sm:inline">Quitter Mode Lecture</span>
        </button>
        <button 
          type="button"
          onClick={() => window.print()} 
          className="bg-blue-600 hover:bg-blue-500 px-6 md:px-8 lg:px-12 py-2.5 md:py-3 lg:py-5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] lg:text-[11px] uppercase italic tracking-widest flex items-center gap-2 md:gap-3 lg:gap-4 transition-all shadow-2xl border-none cursor-pointer text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Exporter le PDF officiel"
        >
          <Printer size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
          <span className="hidden sm:inline">Exporter PDF Officiel</span>
        </button>
      </nav>

      {/* 📄 FEUILLE A4 */}
      <main className="mx-auto my-8 md:my-12 lg:my-16 print:my-0 bg-white w-full max-w-[210mm] min-h-[297mm] p-6 md:p-8 lg:p-[25mm] text-black relative shadow-2xl print:shadow-none text-left border border-slate-300 print:border-none" aria-labelledby="report-title">
        
        {/* WATERMARK */}
        <div 
          className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-45 select-none z-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="text-6xl md:text-7xl lg:text-[80px] xl:text-[120px] font-black uppercase tracking-widest whitespace-nowrap">
            SMI SOUVERAIN
          </div>
        </div>

        {/* HEADER ISO */}
        <header className="border-[3px] border-black flex flex-col md:flex-row mb-12 md:mb-16 relative z-10" role="banner">
          <div className="w-full md:w-1/3 border-b-2 md:border-b-0 md:border-r-[3px] border-black p-6 md:p-8 lg:p-10 flex flex-col items-center justify-center bg-slate-50">
            <span className="font-black text-3xl md:text-4xl tracking-tighter uppercase italic text-slate-900 leading-none">Elite</span>
            <span className="text-[9px] md:text-[10px] font-black uppercase mt-2 md:mt-3 text-blue-600 tracking-widest">SDE Infrastructure</span>
          </div>
          <div className="w-full md:w-1/3 p-6 md:p-8 lg:p-10 flex flex-col items-center justify-center text-center border-b-2 md:border-b-0 md:border-r-[3px] border-black">
            <h1 id="report-title" className="font-black text-[11px] md:text-[12px] uppercase italic mb-1 md:mb-2 m-0 text-slate-900">Procès-Verbal de Revue</h1>
            <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest m-0 opacity-80 italic">ISO 9001:2015 §9.3</p>
          </div>
          <div className="w-full md:w-1/3 p-4 md:p-6 lg:p-8 text-[9px] md:text-[10px] font-black uppercase space-y-2 md:space-y-3 italic tracking-tight text-slate-800">
            <div className="flex justify-between border-b border-slate-100 pb-1 md:pb-2">
              <span>Réf :</span> 
              <span className="text-blue-600">{data?.PRV_DocRef || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1 md:pb-2">
              <span>Période :</span> 
              <span>{data?.PRV_Month || '—'}/{data?.PRV_Year || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>Date PV :</span> 
              <span>{new Date().toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </header>

        {/* ANALYSE DES FAITS */}
        <div className="space-y-12 md:space-y-16 text-justify relative z-10 mb-16 md:mb-20" role="document">
          <PVSection title="I. Performance Processus (KPI)" val={data?.PRV_PerformanceAnalysis} accent="blue" />
          <PVSection title="II. Audits & Non-Conformités" val={data?.PRV_AuditAnalysis} accent="red" />
          
          <article className="bg-blue-50/50 p-6 md:p-8 lg:p-12 border-[3px] border-blue-600/20 rounded-br-3xl md:rounded-br-[5rem] relative page-break-inside-avoid">
            <div className="absolute top-0 right-0 p-4 md:p-6 lg:p-8 opacity-10 pointer-events-none" aria-hidden="true">
              <Award size={48} className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" />
            </div>
            <h3 className="text-[11px] md:text-[12px] font-black uppercase mb-4 md:mb-6 lg:mb-8 italic text-blue-800 underline underline-offset-8 decoration-blue-700/30 tracking-widest leading-none m-0">
              III. Décisions Stratégiques & Mutations (PAQ)
            </h3>
            <div className="text-[14px] md:text-[16px] font-black italic leading-relaxed text-slate-900 uppercase tracking-tighter border-l-4 border-blue-600/30 pl-4 md:pl-6 lg:pl-8 whitespace-pre-wrap m-0">
              {data?.PRV_Decisions || "MAINTIEN DES OBJECTIFS EN L'ÉTAT."}
            </div>
          </article>
        </div>

        {/* SIGNATURES */}
        <footer className="mt-32 md:mt-40 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 lg:gap-20 relative z-10 page-break-inside-avoid" aria-label="Signatures de validation">
          <SignatureBlock label="Le Pilote Processus" signed={data?.PRV_PiloteSigned || false} icon={FileCheck} />
          <SignatureBlock label="La Direction SMI" signed={data?.PRV_RQSigned || false} icon={ShieldCheck} />
        </footer>

        <div className="absolute bottom-8 md:bottom-12 left-[20mm] md:left-[30mm] right-[20mm] md:right-[30mm] border-t-2 border-slate-100 pt-4 md:pt-6 lg:pt-8 flex flex-col sm:flex-row justify-between text-[7px] md:text-[8px] font-black text-slate-300 uppercase tracking-widest italic gap-2">
          <span>Propriété Exclusive : {data?.PRV_TenantName || "Qualisoft SDE"}</span>
          <span>SMI v3.2 - Master Integrity Scellé</span>
        </div>
      </main>

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:my-0 { margin-top: 0 !important; margin-bottom: 0 !important; }
          @page { margin: 0; size: A4; }
        }
        .page-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
      `}</style>
    </div>
  );
}