/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📄 MODULE : RAPPORT D'ÉVÉNEMENT SSE (ISO 45001 §10.2)
 * RÔLE : Édition scellée pour traçabilité légale
 * VERSION : 3.0 - Typing strict + Print-Friendly + Accessibilité
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { 
  ShieldAlert, Printer, AlertTriangle, Calendar, 
  MapPin, ArrowLeft, Fingerprint, RefreshCw, ShieldCheck
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface Site {
  SI_Id: string;
  SI_Name: string;
  SI_Location?: string;
  SI_IsActive?: boolean;
}

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_Actif?: boolean;
}

export interface SSEEvent {
  SSE_Id: string;
  SSE_Type: string;
  SSE_DateEvent: string;
  SSE_Lieu: string;
  SSE_Description: string;
  SSE_AvecArret: boolean;
  SSE_NbJoursArret?: number;
  SSE_Lesions?: string;
  SSE_SiteId?: string;
  SSE_Site?: Site;
  SSE_VictimId?: string;
  SSE_Victim?: User;
  SSE_ReporterId?: string;
  SSE_Reporter?: User;
  SSE_Status: string;
  SSE_CreatedAt: string;
  SSE_UpdatedAt: string;
}

export interface DataBlockProps {
  label: string;
  val: string;
  icon: React.ElementType;
  color?: 'red' | 'slate';
}

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
// SOUS-COMPOSANT : DATA BLOCK
// ============================================================================

function DataBlock({ label, val, icon: Icon, color }: DataBlockProps) {
  return (
    <div className="text-left space-y-3 md:space-y-4">
      <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 md:gap-3 tracking-widest italic">
        <Icon size={14} className={cn("w-3.5 h-3.5 md:w-4 md:h-4", color === 'red' ? 'text-red-600' : 'text-slate-800')} aria-hidden="true" /> 
        {label}
      </label>
      <p className={cn(
        "font-black text-xl md:text-2xl lg:text-3xl uppercase italic border-b-4 border-slate-100 pb-3 md:pb-4 leading-none m-0",
        color === 'red' ? 'text-red-600' : 'text-slate-900'
      )}>
        {val || '—'}
      </p>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function SseReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<SSEEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<SSEEvent>(`/sse/${id}`);
      setEvent(res.data?.data || res.data || null);
    } catch (error) {
      console.error('❌ Erreur chargement rapport SSE:', error);
      toast.error("RUPTURE LECTURE SSE : DOCUMENT INTROUVABLE");
    } finally { 
      setLoading(false); 
    }
  }, [id]);

  useEffect(() => { if (typeof window !== 'undefined') fetchEvent(); }, [fetchEvent]);

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Extraction du rapport scellé §10.2..." />;
  }
  
  if (!event) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0B0F1A] text-red-400 font-black uppercase italic tracking-widest p-6 md:p-12 text-center" role="status">
        <div className="space-y-4 md:space-y-6 lg:space-y-8">
          <ShieldAlert size={48} className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto" aria-hidden="true" />
          <h2 className="text-2xl md:text-3xl lg:text-4xl">Document Révoqué ou Inexistant</h2>
          <button 
            type="button"
            onClick={() => router.back()} 
            className="bg-white text-slate-900 px-8 md:px-10 lg:px-12 py-3 md:py-4 lg:py-5 rounded-2xl md:rounded-3xl cursor-pointer border-none font-black italic text-[9px] md:text-[10px] hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-white"
          >
            Retourner au Registre
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6 lg:p-20 print:p-0 print:bg-white font-sans selection:bg-red-100 italic lg:pl-72 lg:ml-0 overflow-y-auto">
      <Toaster position="top-right" richColors closeButton />

      {/* 🧭 NAVIGATION (Invisible à l'impression) */}
      <nav className="max-w-5xl mx-auto flex justify-between items-center mb-6 md:mb-8 lg:mb-10 print:hidden" role="navigation" aria-label="Navigation du rapport">
        <button 
          type="button"
          onClick={() => router.back()} 
          className="flex items-center gap-2 md:gap-3 text-slate-500 font-black uppercase italic text-[9px] md:text-[10px] tracking-widest hover:text-slate-900 transition-all bg-transparent border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 rounded px-2 py-1"
          aria-label="Retour au registre SSE"
        >
          <ArrowLeft size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
          <span className="hidden sm:inline">Retour Registre</span>
        </button>
        <button 
          type="button"
          onClick={() => window.print()} 
          className="bg-slate-900 text-white px-6 md:px-8 py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl font-black uppercase italic text-[9px] md:text-[10px] flex items-center gap-2 md:gap-3 hover:bg-red-600 transition-all cursor-pointer border-none shadow-xl focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Imprimer le rapport officiel"
        >
          <Printer size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" /> 
          <span className="hidden sm:inline">Lancer Impression Officielle</span>
        </button>
      </nav>

      {/* 📄 DOCUMENT MATRICIEL */}
      <article 
        className="max-w-5xl mx-auto bg-white border-[12px] md:border-[12px] border-slate-900 p-6 md:p-8 lg:p-12 xl:p-24 shadow-2xl relative overflow-hidden text-left print:shadow-none print:border-none print:p-0"
        aria-labelledby="report-title"
      >
        
        {/* FILIGRANE SÉCURITÉ */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] opacity-[0.03] text-6xl md:text-7xl lg:text-8xl font-black pointer-events-none uppercase text-center w-[150%] select-none print:opacity-[0.05]"
          aria-hidden="true"
        >
          Document Scellé SDE Matrix • ISO 45001 Integrity
        </div>

        {/* HEADER TECHNIQUE */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-[12px] border-slate-900 pb-8 md:pb-10 lg:pb-12 mb-12 md:mb-16 relative z-10 gap-6 md:gap-8 lg:gap-10">
          <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
            <div className="bg-red-600 text-white p-4 md:p-6 lg:p-8 shadow-xl -rotate-3 shrink-0">
              <ShieldAlert size={40} className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14" strokeWidth={2.5} aria-hidden="true" />
            </div>
            <div>
              <h1 id="report-title" className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black uppercase italic leading-tight tracking-tighter m-0">
                RAPPORT <span className="text-red-600 underline underline-offset-8">SSE</span>
              </h1>
              <p className="text-slate-400 font-black tracking-widest uppercase text-[8px] md:text-[9px] lg:text-[10px] mt-4 md:mt-6 italic m-0">
                SÉCURITÉ & SANTÉ AU TRAVAIL • ISO 45001 §10.2
              </p>
            </div>
          </div>
          <div className="text-left md:text-right space-y-1 md:space-y-2">
            <div className="flex items-center md:justify-end gap-1.5 md:gap-2 text-slate-300">
              <Fingerprint size={12} className="w-3 h-3" aria-hidden="true" />
              <p className="text-[8px] md:text-[9px] font-black uppercase m-0 tracking-widest">SDE Matrix Ref</p>
            </div>
            <p className="text-xl md:text-2xl font-black uppercase tracking-tighter m-0">
              ID-{event.SSE_Id?.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </header>

        {/* 📊 GRID DES CIRCONSTANCES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-20 mb-12 md:mb-16 lg:mb-20 relative z-10">
          <div className="space-y-8 md:space-y-10 lg:space-y-12">
            <DataBlock label="Nature de l'Événement" val={event.SSE_Type} color="red" icon={AlertTriangle} />
            <DataBlock label="Localisation SDE" val={`${event.SSE_Lieu} | ${event.SSE_Site?.S_Name || 'NON SPÉCIFIÉ'}`} icon={MapPin} />
          </div>
          <div className="space-y-8 md:space-y-10 lg:space-y-12">
            <DataBlock label="Horodatage des Faits" val={new Date(event.SSE_DateEvent).toLocaleString('fr-SN')} icon={Calendar} />
            <DataBlock label="Collaborateur Déclarant" val={`${event.SSE_Victim?.U_FirstName || '—'} ${event.SSE_Victim?.U_LastName || ''}`} icon={ShieldCheck} />
          </div>
        </div>

        {/* 📝 DESCRIPTION DES FAITS */}
        <section className="mb-12 md:mb-16 lg:mb-20 relative z-10" aria-labelledby="description-label">
          <label id="description-label" className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 block mb-4 md:mb-6 lg:mb-8 tracking-widest italic">
            Analyse Circonstancielle & Faits Constatés (§8.1.2)
          </label>
          <div className="bg-slate-50 p-6 md:p-8 lg:p-12 italic text-lg md:text-xl lg:text-2xl leading-relaxed border-l-[16px] border-slate-900 min-h-[200px] md:min-h-[250px] lg:min-h-[300px] font-medium text-slate-800 shadow-inner whitespace-pre-wrap">
            {event.SSE_Description || "Aucune description textuelle consignée dans le registre."}
          </div>
        </section>

        {/* 🚑 LÉSIONS ET GRAVITÉ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10 mb-16 md:mb-20 lg:mb-24 relative z-10" aria-label="Détails des lésions et gravité">
          <article className="border-[6px] border-slate-900 p-6 md:p-8 lg:p-10 flex flex-col justify-between bg-white">
            <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 block mb-4 md:mb-6 italic tracking-widest">Gravité & Arrêt</label>
            <p className="font-black text-xl md:text-2xl lg:text-3xl uppercase italic leading-none m-0 text-slate-900">
              {event.SSE_AvecArret ? `ARRÊT DE TRAVAIL : ${event.SSE_NbJoursArret || 0} JOURS` : 'SANS INTERRUPTION'}
            </p>
          </article>
          <article className="border-[6px] border-slate-900 p-6 md:p-8 lg:p-10 flex flex-col justify-between bg-red-600/5">
            <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 block mb-4 md:mb-6 italic tracking-widest">Diagnostic Lésionnel</label>
            <p className="font-black text-lg md:text-xl lg:text-2xl uppercase italic text-red-600 leading-tight m-0">
              {event.SSE_Lesions || 'NÉANT'}
            </p>
          </article>
        </section>

        {/* 🖋️ VALIDATIONS (§5.4) */}
        <footer className="grid grid-cols-1 sm:grid-cols-3 gap-12 md:gap-16 lg:gap-20 mt-32 md:mt-40 pt-12 md:pt-16 border-t-4 border-slate-100 text-center relative z-10" aria-label="Signatures de validation">
          {['Le Déclarant', 'Le Responsable HSE', 'La Direction'].map((sign) => (
            <div key={sign} className="space-y-12 md:space-y-16">
              <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest m-0">{sign}</p>
              <div className="h-24 md:h-28 lg:h-32 border-b-2 border-slate-200 border-dashed relative">
                <span className="absolute bottom-3 md:bottom-4 left-0 right-0 text-[7px] md:text-[8px] text-slate-200 italic uppercase font-black">
                  Scellage Officiel Matrix 2026
                </span>
              </div>
            </div>
          ))}
        </footer>
      </article>

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:opacity-\\[0\\.05\\] { opacity: 0.05 !important; }
        }
      `}</style>
    </div>
  );
}