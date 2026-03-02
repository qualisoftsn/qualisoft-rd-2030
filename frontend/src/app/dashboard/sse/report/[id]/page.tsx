/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📄 MODULE : src/app/dashboard/sse/report/[id]/page.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Production de la fiche officielle d'incident pour archivage et audit.
 * USAGE : Visualisation détaillée et impression (PDF/Papier) conforme ISO.
 * PROCESSUS : Récupération granulaire via ID et mise en page "Print-Ready".
 * SÉCURITÉ : Zéro NextAuth.
 * DATE DE RÉVISION : 02 Mars 2026 | 15:13 GMT
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Printer, ShieldAlert, ArrowLeft, Loader2, 
  MapPin, Calendar, Clock, User, AlertTriangle 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface SSEEventDetails {
  SSE_Id: string;
  SSE_Type: string;
  SSE_Lieu: string;
  SSE_DateEvent: string;
  SSE_AvecArret: boolean;
  SSE_NbJoursArret: number;
  SSE_Lesions: string;
  SSE_Description: string;
  SSE_Site?: { S_Name: string };
  SSE_Victim?: { U_FirstName: string, U_LastName: string };
}

export default function SseReportPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [event, setEvent] = useState<SSEEventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 📡 SYNCHRONISATION AVEC LE REGISTRE SSE
   */
  const fetchEventDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/sse`);
      const dataArray = Array.isArray(res.data?.data || res.data) ? (res.data?.data || res.data) : [];
      const found = dataArray.find((e: any) => e.SSE_Id === id);
      
      if (found) {
        setEvent(found);
      } else {
        setError("L'identifiant fourni ne correspond à aucun enregistrement actif.");
      }
    } catch (err) {
      console.error("Erreur d'extraction du rapport:", err);
      setError("Rupture de liaison avec le serveur de rapports.");
      toast.error("Échec de la génération du document.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  /**
   * 🖨️ ACTION : DÉCLENCHEMENT DE L'IMPRESSION
   */
  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 ml-0 lg:ml-72">
      <Loader2 className="animate-spin text-orange-600 mb-6 w-12 h-12" strokeWidth={2} />
      <p className="text-slate-400 font-black uppercase italic text-[10px] tracking-[0.5em] animate-pulse text-center m-0">
        Génération du document certifié en cours...
      </p>
    </div>
  );

  if (error || !event) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-500 p-6 lg:p-10 ml-0 lg:ml-72 text-center">
      <AlertTriangle size={48} className="text-red-500 mb-6" />
      <p className="font-black italic text-xl uppercase tracking-tighter text-slate-900 m-0">Document Introuvable</p>
      <p className="text-sm mt-3 opacity-70 italic m-0">{error || "Cet incident a peut-être été révoqué du registre."}</p>
      <button 
        onClick={() => router.back()} 
        className="mt-8 flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 transition-colors border-none cursor-pointer shadow-lg"
      >
        <ArrowLeft size={16} /> Retour au registre
      </button>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 md:p-10 text-slate-900 italic font-sans selection:bg-orange-600/20 ml-0 lg:ml-72">
      <Toaster position="top-right" richColors theme="light" />
      <div className="max-w-5xl mx-auto">
        
        {/* 🛠️ BARRE D'ACTIONS (CACHÉE À L'IMPRESSION) */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 lg:mb-10 print:hidden animate-in fade-in slide-in-from-top-4 duration-700 gap-4">
          <button 
            onClick={() => router.back()} 
            className="w-full sm:w-auto flex items-center justify-center gap-3 text-slate-500 hover:text-slate-900 font-black text-[10px] lg:text-[11px] uppercase tracking-widest transition-colors border-none bg-transparent cursor-pointer p-3"
          >
            <ArrowLeft size={18} /> Retour au registre
          </button>
          
          <button 
            onClick={handlePrint} 
            className="w-full sm:w-auto bg-slate-900 hover:bg-orange-600 text-white px-8 lg:px-10 py-4 lg:py-5 rounded-2xl font-black uppercase text-[10px] lg:text-[11px] flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(0,0,0,0.15)] transition-all active:scale-95 border-none cursor-pointer tracking-[0.2em] m-0"
          >
            <Printer size={18} className="shrink-0" /> Exporter / Imprimer PDF
          </button>
        </div>

        

        {/* 📄 CORPS DU RAPPORT (VERSION "SOVEREIGN PRINT") */}
        <div className="bg-white border-4 md:border-[6px] border-slate-900 p-6 sm:p-10 md:p-16 shadow-[0_30px_80px_rgba(0,0,0,0.08)] relative overflow-hidden">
          
          {/* FILIGRANE DE SÉCURITÉ (PRINT ONLY) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 text-slate-100 text-[6rem] md:text-[8rem] font-black pointer-events-none select-none hidden print:block opacity-30 z-0">
            QUALISOFT
          </div>

          <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 md:border-b-[6px] border-slate-900 pb-8 md:pb-10 mb-8 md:mb-12 gap-6 relative z-10">
            <div className="flex items-center gap-5 md:gap-8">
              <div className="bg-orange-600 p-4 md:p-5 rounded-2xl text-white shadow-lg shrink-0">
                <ShieldAlert size={40} className="md:w-14 md:h-14" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h1 className="text-3xl md:text-5xl font-black uppercase leading-none tracking-tighter italic m-0">Fiche <span className="text-orange-600">Incident</span></h1>
                <p className="text-slate-400 font-black tracking-[0.2em] md:tracking-[0.4em] uppercase text-[8px] md:text-[10px] mt-2 md:mt-3 italic leading-none m-0">Registre Officiel • ISO 45001</p>
              </div>
            </div>
            <div className="text-left md:text-right bg-slate-50 p-5 md:p-6 border-l-4 border-orange-600 w-full md:w-auto">
              <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 italic m-0">Référence d&apos;Archive</p>
              <p className="font-black text-xl md:text-2xl leading-none tracking-tighter m-0">#{event.SSE_Id?.slice(0, 12).toUpperCase()}</p>
              <p className="text-[8px] md:text-[9px] font-bold text-orange-600 mt-2 uppercase italic tracking-tighter leading-none m-0">Document Scellé Numériquement</p>
            </div>
          </header>

          {/* MATRICE D'INFORMATIONS §9.1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16 text-left relative z-10">
            <div className="space-y-6 md:space-y-8">
              <div className="group">
                <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 block mb-1.5 md:mb-2 tracking-[0.2em] italic">Nature de l&apos;Événement</label>
                <p className="font-black text-lg md:text-xl border-b-2 border-slate-100 pb-2 md:pb-3 uppercase italic tracking-tight text-slate-900 m-0">
                  {event.SSE_Type?.replace(/_/g, ' ')}
                </p>
              </div>
              <div className="group">
                <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 block mb-1.5 md:mb-2 tracking-[0.2em] italic">Localisation & Implantation</label>
                <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2 md:pb-3">
                    <MapPin size={18} className="text-orange-600 shrink-0" />
                    <p className="font-bold text-base md:text-lg text-slate-800 uppercase italic m-0 leading-tight">
                        {event.SSE_Lieu} <span className="text-slate-400 ml-1 md:ml-2 text-sm">({event.SSE_Site?.S_Name || 'SITE MASTER'})</span>
                    </p>
                </div>
              </div>
              <div className="group">
                <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 block mb-1.5 md:mb-2 tracking-[0.2em] italic">Collaborateur / Victime</label>
                <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2 md:pb-3">
                    <User size={18} className="text-blue-600 shrink-0" />
                    <p className="font-black text-base md:text-lg text-slate-900 uppercase italic m-0 leading-tight">
                        {event.SSE_Victim ? `${event.SSE_Victim.U_FirstName} ${event.SSE_Victim.U_LastName}` : 'AUCUNE VICTIME SIGNALÉE'}
                    </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
              <div className="group">
                <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 block mb-1.5 md:mb-2 tracking-[0.2em] italic">Horodatage des Faits</label>
                <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2 md:pb-3">
                    <Calendar size={18} className="text-orange-600 shrink-0" />
                    <p className="font-black text-lg md:text-xl text-slate-900 italic tracking-tighter m-0 leading-tight">
                        {new Date(event.SSE_DateEvent).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
              </div>
              <div className="group">
                <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 block mb-1.5 md:mb-2 tracking-[0.2em] italic">Indisponibilité (Arrêt de travail)</label>
                <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2 md:pb-3">
                    <Clock size={18} className={`shrink-0 ${event.SSE_AvecArret ? "text-red-600" : "text-emerald-600"}`} />
                    <p className={`font-black text-base md:text-lg uppercase italic m-0 leading-tight ${event.SSE_AvecArret ? "text-red-600" : "text-emerald-600"}`}>
                        {event.SSE_AvecArret ? `${event.SSE_NbJoursArret} Jours prescrits` : 'Aucune interruption'}
                    </p>
                </div>
              </div>
              <div className="group">
                <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 block mb-1.5 md:mb-2 tracking-[0.2em] italic">Lésions ou Dommages</label>
                <p className="font-bold text-base md:text-lg border-b-2 border-slate-100 pb-2 md:pb-3 uppercase italic text-slate-700 m-0 leading-tight">
                    {event.SSE_Lesions || 'NÉANT'}
                </p>
              </div>
            </div>
          </div>

          {/* DÉTAILS CIRCONSTANCIELS (§10.2) */}
          <div className="mb-12 md:mb-16 bg-slate-50 p-6 md:p-10 border-2 border-slate-900 shadow-inner relative z-10 text-left">
            <div className="absolute -top-3 md:-top-4 left-6 md:left-10 bg-slate-900 text-white px-4 md:px-6 py-1 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] italic">
                Récit des événements
            </div>
            <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 block mb-4 md:mb-6 underline decoration-orange-500 underline-offset-4 md:underline-offset-8 tracking-widest italic">Description détaillée des faits</label>
            <p className="text-sm md:text-md font-bold leading-relaxed text-slate-800 uppercase italic m-0 whitespace-pre-wrap">
                {event.SSE_Description}
            </p>
          </div>

          {/* ESPACE DE VALIDATION ET SIGNATURES */}
          <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 relative z-10">
            <div className="text-center">
                <div className="w-full border-t-2 border-slate-900 mb-3 md:mb-4"></div>
                <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 tracking-[0.4em] italic leading-none m-0">Visa du déclarant / Victime</p>
                <p className="text-[7px] md:text-[8px] text-slate-400 mt-2 md:mt-2 italic font-bold m-0">Signature précédée de la mention &quot;Lu et approuvé&quot;</p>
            </div>
            <div className="text-center">
                <div className="w-full border-t-2 border-slate-900 mb-3 md:mb-4"></div>
                <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 tracking-[0.4em] italic leading-none m-0">Direction / Responsable HSE</p>
                <p className="text-[7px] md:text-[8px] text-slate-400 mt-2 md:mt-2 italic font-bold m-0">Cachet officiel de l&apos;organisation requis</p>
            </div>
          </div>

          <div className="mt-12 md:mt-20 pt-6 md:pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center opacity-50 relative z-10 gap-2">
              <p className="text-[7px] md:text-[8px] font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] italic m-0 text-center">Généré par Qualisoft Elite RD 2030 • {new Date().toLocaleString()}</p>
              <p className="text-[7px] md:text-[8px] font-bold uppercase tracking-[0.5em] italic m-0 hidden md:block">Page 1 / 1</p>
          </div>
        </div>
      </div>

      {/* 🧪 INJECTION DE STYLE POUR L'IMPRESSION PRO */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .bg-slate-50 { background: white !important; padding: 0 !important; }
          .max-w-5xl { max-width: 100% !important; margin: 0 !important; }
          .shadow-lg, .shadow-xl, .shadow-2xl, .shadow-inner { box-shadow: none !important; }
          .border-slate-900 { border-color: black !important; }
          .text-slate-900, .text-slate-800 { color: black !important; }
          .text-orange-600 { color: #ea580c !important; }
          .ml-72 { margin-left: 0 !important; }
          @page { margin: 1cm; }
        }
      `}</style>
    </div>
  );
}