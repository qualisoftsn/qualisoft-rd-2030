/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📄 MODULE : FICHE INCIDENT OFFICIELLE (PRINT READY) (ISO 45001)
 * RÔLE : Visualisation scellée et export audit
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité + Print-Ready
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { Printer, ShieldAlert, ArrowLeft, MapPin, RefreshCw, FileText, AlertCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface SSEEvent {
  SSE_Id: string;
  SSE_Type: string;
  SSE_Lieu: string;
  SSE_DateEvent: string;
  SSE_AvecArret: boolean;
  SSE_NbJoursArret?: number;
  SSE_Description: string;
  SSE_Severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  SSE_Status?: string;
  SSE_DeclaredBy?: string;
  SSE_DeclaredAt?: string;
}

export interface DataBlockProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  color?: 'black' | 'rose' | 'emerald';
}

export interface LoadingScreenProps {
  label: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: LoadingScreenProps) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-orange-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : DATA BLOCK
// ============================================================================

function DataBlock({ label, value, icon, color = 'black' }: DataBlockProps) {
  const colorClasses: Record<string, string> = {
    black: "text-slate-900",
    rose: "text-rose-600",
    emerald: "text-emerald-600"
  };

  return (
    <article className="space-y-2 md:space-y-3 text-left" role="article" aria-label={`${label}: ${value}`}>
      <p className="text-[10px] md:text-[11px] text-slate-400 font-black tracking-widest italic m-0 uppercase leading-none">{label}</p>
      <div className={cn(
        "text-xl md:text-2xl lg:text-3xl font-black italic tracking-tighter flex items-center gap-2 md:gap-3 leading-tight uppercase",
        colorClasses[color] || colorClasses.black
      )}>
        {icon && <span aria-hidden="true">{icon}</span>} 
        {value || '—'}
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function SseReportPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [event, setEvent] = useState<SSEEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<SSEEvent[]>(`/sse`);
      const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      const found = data.find((e: SSEEvent) => e.SSE_Id === id) || null;
      setEvent(found);
    } catch (error) {
      console.error('❌ Erreur chargement rapport SSE:', error);
      toast.error("RUPTURE KERNEL : Rapport inaccessible."); 
    } finally { 
      setLoading(false); 
    }
  }, [id]);

  useEffect(() => { if (typeof window !== 'undefined') fetchDetails(); }, [fetchDetails]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Génération du Document Certifié..." />;
  }

  if (!event) {
    return (
      <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center gap-4 md:gap-6" role="status">
         <ShieldAlert size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-rose-400" aria-hidden="true" />
         <p className="text-white font-black italic uppercase tracking-widest text-[10px] md:text-xs text-center px-4">Identifiant scellé introuvable</p>
         <button 
           type="button"
           onClick={() => router.back()} 
           className="text-blue-400 hover:text-blue-300 font-black uppercase text-[9px] md:text-[10px] tracking-widest underline underline-offset-8 cursor-pointer border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
           aria-label="Retour au registre SSE"
         >
           Retour au registre
         </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-6 lg:p-10 text-slate-900 italic font-black uppercase flex flex-col selection:bg-orange-600/20 ml-0 lg:pl-72 overflow-x-hidden print:p-0 print:bg-white">
      <Toaster position="top-right" richColors theme="light" closeButton />
      
      <div className="max-w-[100rem] mx-auto w-full space-y-8 md:space-y-10 lg:space-y-12">
        
        {/* ACTION BAR (HIDDEN IN PRINT) */}
        <div className="flex justify-between items-center print:hidden mt-8 md:mt-10 lg:mt-12">
          <button 
            type="button"
            onClick={() => router.back()} 
            className="flex items-center gap-1.5 md:gap-2 text-slate-500 hover:text-slate-900 transition-all font-black text-[10px] md:text-[11px] border-none bg-transparent cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
            aria-label="Retour au registre SSE"
          >
            <ArrowLeft size={16} className="w-4 h-4" aria-hidden="true" /> 
            <span className="hidden sm:inline">Retour au Registre</span>
          </button>
          <button 
            type="button"
            onClick={handlePrint} 
            className="bg-slate-900 text-white px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] shadow-xl hover:bg-orange-600 transition-all border-none cursor-pointer flex items-center gap-2 md:gap-3 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400"
            aria-label="Exporter en PDF ou imprimer"
          >
            <Printer size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" /> 
            <span className="hidden sm:inline">Exporter PDF / Imprimer</span>
          </button>
        </div>

        {/* 📄 PRINT CONTENT */}
        <article className="bg-white border-[12px] md:border-[12px] border-slate-900 p-4 md:p-6 lg:p-12 xl:p-20 shadow-[0_40px_100px_rgba(0,0,0,0.1)] print:shadow-none relative overflow-hidden text-left animate-in zoom-in-95 duration-700 print:border-0 print:p-0" aria-labelledby="report-title">
           
           {/* Filigrane SDE */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 opacity-[0.03] pointer-events-none select-none print:opacity-[0.05]" aria-hidden="true">
              <ShieldAlert size={300} className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px]" strokeWidth={1} />
           </div>

           <header className="border-b-[10px] border-slate-900 pb-8 md:pb-10 lg:pb-12 mb-8 md:mb-10 lg:mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 relative z-10" role="banner">
              <div className="flex items-center gap-4 md:gap-6 lg:gap-8">
                 <div className="p-4 md:p-5 lg:p-6 bg-orange-600 text-white rounded-2xl md:rounded-3xl shadow-xl" aria-hidden="true">
                    <ShieldAlert size={40} className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14" strokeWidth={3} />
                 </div>
                 <div className="space-y-1 md:space-y-2">
                    <h1 id="report-title" className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl xl:text-6xl font-black italic tracking-tighter m-0 leading-none uppercase">
                      Fiche <span className="text-orange-600">Incident</span>
                    </h1>
                    <p className="text-slate-400 text-[8px] md:text-[9px] lg:text-[10px] tracking-widest m-0 leading-none">Registre Officiel • ISO 45001 • RD-2026</p>
                 </div>
              </div>
              <div className="text-left md:text-right border-l-4 md:border-l-0 md:border-r-4 border-orange-600 pl-4 md:pl-0 md:pr-4 lg:pr-6 py-2">
                 <p className="text-[9px] md:text-[10px] text-slate-400 m-0 tracking-widest leading-none mb-1 md:mb-2">RÉFÉRENCE SDE</p>
                 <p className="text-xl md:text-2xl lg:text-3xl font-black italic m-0 leading-none">#{event.SSE_Id?.slice(0, 10).toUpperCase()}</p>
              </div>
           </header>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10 xl:gap-20 mb-12 md:mb-14 lg:mb-16 relative z-10" role="list" aria-label="Détails de l'incident">
              <DataBlock label="Type d&apos;Événement" value={event.SSE_Type?.replace(/_/g, ' ') || '—'} />
              <DataBlock label="Horodatage des Faits" value={new Date(event.SSE_DateEvent).toLocaleString('fr-SN')} />
              <DataBlock label="Localisation Précise" value={event.SSE_Lieu || '—'} icon={<MapPin size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-orange-600" />} />
              <DataBlock 
                label="Statut Arrêt" 
                value={event.SSE_AvecArret ? `${event.SSE_NbJoursArret || 0} JOURS D'ARRÊT` : 'SANS ARRÊT'} 
                color={event.SSE_AvecArret ? "rose" : "emerald"} 
              />
           </div>

           <section className="bg-slate-50 p-6 md:p-8 lg:p-10 xl:p-12 border-[4px] border-slate-900 mb-12 md:mb-14 lg:mb-16 relative z-10" aria-labelledby="description-title">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-5 lg:mb-6">
                 <FileText size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-orange-600" aria-hidden="true" />
                 <p id="description-title" className="text-[10px] md:text-[11px] font-black text-slate-950 uppercase underline decoration-orange-600 underline-offset-8 decoration-4 tracking-widest m-0">Description Factuelle (§10.2)</p>
              </div>
              <p className="text-base md:text-lg lg:text-xl xl:text-2xl font-black italic leading-relaxed m-0 text-slate-800 uppercase text-justify">
                {event.SSE_Description || 'Aucune description disponible'}
              </p>
           </section>

           <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-12 xl:gap-20 mt-16 md:mt-20 lg:mt-24 relative z-10" aria-label="Signatures">
              <div className="border-t-[6px] border-slate-900 pt-4 md:pt-5 lg:pt-6 text-center" role="region" aria-label="Signature Direction">
                 <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none m-0">Visa Direction SMI / QHSE</p>
                 <p className="text-[8px] md:text-[9px] mt-3 md:mt-4 opacity-30 italic">Document scellé par signature numérique</p>
              </div>
              <div className="border-t-[6px] border-slate-900 pt-4 md:pt-5 lg:pt-6 text-center" role="region" aria-label="Signature Déclarant">
                 <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none m-0">Visa Déclarant / Victime</p>
                 <p className="text-[8px] md:text-[9px] mt-3 md:mt-4 opacity-30 italic">Mention &quot;Lu et approuvé&quot; obligatoire</p>
              </div>
           </section>

           <footer className="mt-16 md:mt-20 pt-6 md:pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2 opacity-40 italic print:opacity-60" role="contentinfo">
              <span className="text-[7px] md:text-[8px] font-black tracking-widest uppercase">Généré par QUALISOFT ELITE SDE 2026 • Noyau Matrix</span>
              <span className="text-[7px] md:text-[8px] font-black tracking-widest uppercase">Page 01 / 01</span>
           </footer>
        </article>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .lg\\:pl-72 { padding-left: 0 !important; margin-left: 0 !important; }
          .print\\:hidden { display: none !important; }
          .shadow-\\[0_40px_100px_rgba\\(0\\,0\\,0\\,0\\.1\\)\\] { box-shadow: none !important; }
          .border-\\[12px\\] { border: 12px solid black !important; }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>
    </div>
  );
}