/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📄 MODULE : RAPPORT D'ÉVÉNEMENT SSE (SANTÉ, SÉCURITÉ, ENVIRONNEMENT)
 * -------------------------------------------------------------------------
 * RÔLE : Édition scellée pour traçabilité légale.
 * CONFORMITÉ : ISO 45001 §10.2.
 * ARCHITECTURE : Zéro NextAuth, Light Print-Friendly Mode.
 * DATE : 02 Mars 2026 | 12:43 GMT
 * -------------------------------------------------------------------------
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { ShieldAlert, Printer, Loader2, AlertTriangle, Calendar, MapPin, ArrowLeft, Fingerprint } from 'lucide-react';

export default function SseReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await apiClient.get(`/sse`);
        // Recherche stricte dans le tableau renvoyé par l'API
        const found = res.data?.data?.find((e: any) => e.SSE_Id === id) || res.data.find((e: any) => e.SSE_Id === id);
        setEvent(found);
      } catch (e: unknown) {
        console.error("❌ Rupture Lecture SSE:", e);
      } finally { setLoading(false); }
    };
    fetchEvent();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex flex-col gap-6 items-center justify-center bg-slate-50 text-slate-900 italic font-black">
      <Loader2 className="animate-spin text-red-600" size={48} /> 
      <p className="tracking-[0.5em] uppercase text-xs">Compilation du Rapport SSE Scellé...</p>
    </div>
  );
  
  if (!event) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 text-red-600 font-black uppercase italic tracking-widest text-center px-6">
      Erreur : Document introuvable ou accès révoqué
    </div>
  );

  // Sécurisation de la date d'événement
  const eventDate = event.SSE_DateEvent ? new Date(event.SSE_DateEvent) : null;
  const formattedEventDate = eventDate && !isNaN(eventDate.getTime()) 
    ? eventDate.toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' }) 
    : "DATE INCONNUE";

  return (
    <div className="bg-slate-50 min-h-screen p-6 lg:p-20 text-slate-900 print:p-0 print:bg-white selection:bg-red-100 selection:text-red-900 font-sans">
      
      {/* BOUTONS DE CONTRÔLE (MASQUÉS À L'IMPRESSION) */}
      <div className="max-w-4xl mx-auto mb-10 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
         <button onClick={() => router.back()} className="flex items-center gap-3 text-slate-500 font-black uppercase italic text-[10px] tracking-widest hover:text-slate-900 transition-colors bg-transparent border-none cursor-pointer">
            <ArrowLeft size={16} /> Retour Registre
         </button>
         <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase italic text-[10px] flex items-center gap-3 hover:bg-red-600 transition-all cursor-pointer border-none shadow-lg">
            <Printer size={16} /> Lancer l&apos;Impression Officielle
         </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white border-8 lg:border-12 border-slate-900 p-10 lg:p-20 shadow-xl print:shadow-none print:border-none relative overflow-hidden text-left">
        
        {/* FILIGRANE DE SÉCURITÉ RD 2030 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] opacity-[0.03] text-6xl lg:text-8xl font-black pointer-events-none uppercase text-center w-[150%] select-none">
          Document Scellé Qualisoft Matrix • Isolation SDE
        </div>

        {/* HEADER TECHNIQUE (§10.2) */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-[6px] border-slate-900 pb-8 lg:pb-12 mb-10 lg:mb-16 relative z-10 gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-10">
             <div className="bg-red-600 text-white p-6 lg:p-8 shadow-xl -rotate-3 shrink-0"><ShieldAlert size={48} strokeWidth={2.5} /></div>
             <div>
                <h1 className="text-4xl lg:text-6xl font-black uppercase italic leading-tight tracking-tighter m-0">
                  RAPPORT <span className="text-red-600 italic underline decoration-[4px] lg:decoration-[6px] underline-offset-8">D&apos;ÉVÉNEMENT</span>
                </h1>
                <p className="text-slate-500 font-black tracking-[0.2em] lg:tracking-[0.5em] uppercase text-[9px] lg:text-[11px] mt-4 lg:mt-6 italic m-0">
                  SÉCURITÉ & SANTÉ AU TRAVAIL • RÉFÉRENTIEL ISO 45001
                </p>
             </div>
          </div>
          <div className="text-left md:text-right w-full md:w-auto bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-lg">
            <div className="flex items-center md:justify-end gap-2 text-slate-400 mb-1">
                <Fingerprint size={12} />
                <p className="text-[9px] font-black uppercase tracking-widest m-0">SDE REF</p>
            </div>
            <p className="text-xl lg:text-2xl font-black uppercase tracking-tighter m-0">SSE-{event.SSE_Id?.slice(0, 8).toUpperCase()}</p>
          </div>
        </header>

        {/* SECTION : DONNÉES DE CIRCONSTANCE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 mb-16 lg:mb-20 relative z-10">
          <div className="space-y-8 lg:space-y-12">
            <div>
              <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-400 block mb-2 lg:mb-3 tracking-[0.2em] lg:tracking-[0.3em] italic items-center gap-2">
                <AlertTriangle className="text-red-600" size={12}/> Nature du Risque SSE
              </label>
              <p className="font-black text-2xl lg:text-4xl uppercase italic border-b-2 lg:border-b-4 border-slate-100 pb-3 lg:pb-4 leading-none text-red-600 m-0">{event.SSE_Type}</p>
            </div>
            <div>
              <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-400 block mb-2 lg:mb-3 tracking-[0.2em] lg:tracking-[0.3em] italic items-center gap-2">
                <MapPin className="text-slate-800" size={12}/> Localisation SDE
              </label>
              <p className="font-black text-xl lg:text-2xl uppercase italic border-b-2 lg:border-b-4 border-slate-100 pb-3 lg:pb-4 leading-none m-0">
                {event.SSE_Lieu || 'NON PRÉCISÉ'} <span className="text-slate-300 mx-2">|</span> {event.SSE_Site?.S_Name || 'SITE NON RÉFÉRENCÉ'}
              </p>
            </div>
          </div>
          <div className="space-y-8 lg:space-y-12">
            <div>
              <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-400 block mb-2 lg:mb-3 tracking-[0.2em] lg:tracking-[0.3em] italic items-center gap-2">
                <Calendar className="text-slate-800" size={12}/> Horodatage des Faits
              </label>
              <p className="font-black text-xl lg:text-2xl uppercase italic border-b-2 lg:border-b-4 border-slate-100 pb-3 lg:pb-4 leading-none m-0 text-slate-800">
                {formattedEventDate}
              </p>
            </div>
            <div>
              <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-400 block mb-2 lg:mb-3 tracking-[0.2em] lg:tracking-[0.3em] italic">Identité de la Victime / Déclarant</label>
              <p className="font-black text-xl lg:text-2xl uppercase italic border-b-2 lg:border-b-4 border-slate-100 pb-3 lg:pb-4 leading-none m-0">
                {event.SSE_Victim?.U_FirstName} {event.SSE_Victim?.U_LastName || 'COLLABORATEUR EXTERNE'}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION : ANALYSE DES FAITS (§8.1) */}
        <div className="mb-16 lg:mb-20 relative z-10">
          <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-400 block mb-4 lg:mb-8 tracking-[0.2em] lg:tracking-[0.4em] italic">Analyse Circonstancielle & Faits Constatés (§8.1.2)</label>
          <div className="bg-slate-50 p-8 lg:p-16 italic text-lg lg:text-2xl leading-relaxed border-l-8 lg:border-l-16 border-slate-900 min-h-50 lg:min-h-75 font-medium shadow-inner text-slate-800 whitespace-pre-wrap">
            {event.SSE_Description || "Aucune description textuelle n'a été consignée dans le registre Matrix."}
          </div>
        </div>

        {/* SECTION : IMPACTS & LÉSIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 mb-16 lg:mb-24 relative z-10">
            <div className="border-4 lg:border-[6px] border-slate-900 p-6 lg:p-10 flex flex-col justify-between bg-white">
                <label className="text-[9px] lg:text-[11px] font-black uppercase text-slate-400 block mb-4 lg:mb-6 italic tracking-widest">Gravité Opérationnelle</label>
                <div className="flex items-center gap-3 lg:gap-5">
                   <div className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full shrink-0 ${event.SSE_AvecArret ? 'bg-red-600' : 'bg-emerald-600'}`} />
                   <p className="font-black text-xl lg:text-3xl uppercase italic leading-none m-0 text-slate-900">
                    {event.SSE_AvecArret 
                      ? `ARRÊT DE TRAVAIL : ${event.SSE_NbJoursArret || 0} JOURS` 
                      : 'SANS INTERRUPTION'
                    }
                  </p>
                </div>
            </div>
            <div className="border-4 lg:border-[6px] border-slate-900 p-6 lg:p-10 flex flex-col justify-between bg-red-600/5">
                <label className="text-[9px] lg:text-[11px] font-black uppercase text-slate-500 block mb-4 lg:mb-6 italic tracking-widest">Diagnostic Lésionnel</label>
                <p className="font-black text-lg lg:text-2xl uppercase italic text-red-600 leading-tight m-0">
                  {event.SSE_Lesions || 'NÉANT - AUCUNE LÉSION CONSTATÉE'}
                </p>
            </div>
        </div>

        {/* SECTION : VALIDATIONS (§5.4) */}
        <footer className="grid grid-cols-1 sm:grid-cols-3 gap-12 lg:gap-20 mt-20 lg:mt-40 pt-10 lg:pt-16 border-t-2 lg:border-t-4 border-slate-100 text-center relative z-10 page-break-inside-avoid">
            {['Le Déclarant (Victime)', 'Le Responsable HSE', 'La Direction Générale'].map(sign => (
              <div key={sign} className="space-y-8 lg:space-y-16">
                <p className="text-[9px] lg:text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] lg:tracking-[0.4em] m-0">{sign}</p>
                <div className="h-24 lg:h-32 border-b-2 border-slate-200 border-dashed relative">
                  <span className="absolute bottom-2 lg:bottom-4 left-0 right-0 text-[7px] lg:text-[9px] text-slate-200 italic uppercase font-black">Scellage Officiel RD 2030</span>
                </div>
              </div>
            ))}
        </footer>

        <div className="mt-16 lg:mt-20 text-center opacity-30 print:opacity-50">
            <p className="text-[7px] lg:text-[9px] font-black uppercase tracking-[0.5em] lg:tracking-[1em] text-slate-500 m-0">Qualisoft Elite Sovereign Infrastructure • Integrity Verified</p>
        </div>
      </div>
    </div>
  );
}