/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { ShieldAlert, Printer, Loader2, AlertTriangle, Calendar, MapPin, ArrowLeft, Fingerprint } from 'lucide-react';

/**
 * 📄 COMPOSANT : RAPPORT D'ÉVÉNEMENT SSE (SANTÉ, SÉCURITÉ, ENVIRONNEMENT)
 * -------------------------------------------------------------------------
 * RÔLE : Édition scellée pour traçabilité légale.
 * CONFORMITÉ : ISO 45001 §10.2.
 * USAGE : Document probant pour audits et instances de régulation.
 * -------------------------------------------------------------------------
 */

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
        // Filtrage direct via le Kernel Matrix
        const res = await apiClient.get(`/sse`);
        const found = res.data?.data?.find((e: any) => e.SSE_Id === id) || res.data.find((e: any) => e.SSE_Id === id);
        setEvent(found);
      } catch (e: unknown) {
        console.error("❌ Rupture Lecture SSE:", e);
      } finally { setLoading(false); }
    };
    fetchEvent();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex flex-col gap-6 items-center justify-center bg-white text-slate-900 italic font-black">
      <Loader2 className="animate-spin text-red-600" size={48} /> 
      <p className="tracking-[0.5em] uppercase text-xs">Compilation du Rapport SSE Scellé...</p>
    </div>
  );
  
  if (!event) return (
    <div className="h-screen flex items-center justify-center bg-white text-red-600 font-black uppercase italic tracking-widest">
      Erreur : Document introuvable ou accès révoqué
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen p-20 text-slate-900 print:p-0 print:bg-white selection:bg-red-100 selection:text-red-900">
      
      {/* BOUTONS DE CONTRÔLE (MASQUÉS À L'IMPRESSION) */}
      <div className="max-w-4xl mx-auto mb-10 flex justify-between items-center print:hidden">
         <button onClick={() => router.back()} className="flex items-center gap-3 text-slate-500 font-black uppercase italic text-[10px] tracking-widest hover:text-slate-900 transition-colors bg-transparent border-none cursor-pointer">
            <ArrowLeft size={18} /> Retour Registre
         </button>
         <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-3 hover:bg-red-600 transition-all cursor-pointer border-none shadow-xl">
            <Printer size={18} /> Lancer l&apos;Impression Officielle
         </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white border-[12px] border-slate-900 p-20 shadow-none relative overflow-hidden text-left">
        
        {/* FILIGRANE DE SÉCURITÉ RD 2030 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 opacity-[0.03] text-8xl font-black pointer-events-none uppercase text-center w-[150%]">
          Document Scellé Qualisoft Matrix • Isolation SDE
        </div>

        {/* HEADER TECHNIQUE (§10.2) */}
        <header className="flex justify-between items-center border-b-[8px] border-slate-900 pb-12 mb-16 relative z-10">
          <div className="flex items-center gap-10">
             <div className="bg-red-600 text-white p-8 shadow-2xl rotate-3"><ShieldAlert size={64} strokeWidth={2.5} /></div>
             <div>
                <h1 className="text-6xl font-black uppercase italic leading-tight tracking-tighter">
                  RAPPORT <span className="text-red-600 italic underline decoration-[6px] underline-offset-10">D&apos;ÉVÉNEMENT</span>
                </h1>
                <p className="text-slate-500 font-black tracking-[0.5em] uppercase text-[11px] mt-6 italic opacity-70">
                  SÉCURITÉ & SANTÉ AU TRAVAIL • RÉFÉRENTIEL ISO 45001
                </p>
             </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-3 text-slate-300 mb-2">
                <Fingerprint size={14} />
                <p className="text-[10px] font-black uppercase tracking-widest">SDE REF</p>
            </div>
            <p className="text-2xl font-black uppercase tracking-tighter">SSE-{event.SSE_Id?.slice(0, 8).toUpperCase()}</p>
          </div>
        </header>

        

        {/* SECTION : DONNÉES DE CIRCONSTANCE */}
        <div className="grid grid-cols-2 gap-20 mb-20 relative z-10">
          <div className="space-y-12">
            <div>
              <label className="text-[11px] font-black uppercase text-slate-400 block mb-3 tracking-[0.3em] italic flex items-center gap-3">
                <AlertTriangle className="text-red-600" size={14}/> Nature du Risque SSE
              </label>
              <p className="font-black text-4xl uppercase italic border-b-4 border-slate-100 pb-4 leading-none text-red-600">{event.SSE_Type}</p>
            </div>
            <div>
              <label className="text-[11px] font-black uppercase text-slate-400 block mb-3 tracking-[0.3em] italic flex items-center gap-3">
                <MapPin className="text-slate-800" size={14}/> Localisation SDE
              </label>
              <p className="font-black text-2xl uppercase italic border-b-4 border-slate-100 pb-4 leading-none">
                {event.SSE_Lieu} <span className="text-slate-300 mx-2">|</span> {event.SSE_Site?.S_Name || 'SITE NON RÉFÉRENCÉ'}
              </p>
            </div>
          </div>
          <div className="space-y-12">
            <div>
              <label className="text-[11px] font-black uppercase text-slate-400 block mb-3 tracking-[0.3em] italic flex items-center gap-3">
                <Calendar className="text-slate-800" size={14}/> Horodatage des Faits
              </label>
              <p className="font-black text-2xl uppercase italic border-b-4 border-slate-100 pb-4 leading-none">
                {new Date(event.SSE_DateEvent).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}
              </p>
            </div>
            <div>
              <label className="text-[11px] font-black uppercase text-slate-400 block mb-3 tracking-[0.3em] italic">Identité de la Victime / Déclarant</label>
              <p className="font-black text-2xl uppercase italic border-b-4 border-slate-100 pb-4 leading-none">
                {event.SSE_Victim?.U_FirstName} {event.SSE_Victim?.U_LastName || 'COLLABORATEUR EXTERNE'}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION : ANALYSE DES FAITS (§8.1) */}
        <div className="mb-20 relative z-10">
          <label className="text-[11px] font-black uppercase text-slate-400 block mb-8 tracking-[0.4em] italic">Analyse Circonstancielle & Faits Constatés (§8.1.2)</label>
          <div className="bg-slate-50 p-16 italic text-2xl leading-relaxed border-l-[16px] border-slate-900 min-h-[300px] font-medium shadow-inner text-slate-800">
            {event.SSE_Description || "Aucune description textuelle n'a été consignée dans le registre Matrix."}
          </div>
        </div>

        {/* SECTION : IMPACTS & LÉSIONS */}
        <div className="grid grid-cols-2 gap-16 mb-24 relative z-10">
            <div className="border-[6px] border-slate-900 p-10 flex flex-col justify-between group">
                <label className="text-[11px] font-black uppercase text-slate-400 block mb-6 italic tracking-widest">Gravité Opérationnelle</label>
                <div className="flex items-center gap-5">
                   <div className={`w-4 h-4 rounded-full ${event.SSE_AvecArret ? 'bg-red-600' : 'bg-emerald-600'}`} />
                   <p className="font-black text-3xl uppercase italic leading-none">
                    {event.SSE_AvecArret 
                      ? `ARRÊT DE TRAVAIL : ${event.SSE_NbJoursArret} JOURS` 
                      : 'SANS INTERRUPTION'
                    }
                  </p>
                </div>
            </div>
            <div className="border-[6px] border-slate-900 p-10 flex flex-col justify-between bg-red-600/5">
                <label className="text-[11px] font-black uppercase text-slate-400 block mb-6 italic tracking-widest">Diagnostic Lésionnel</label>
                <p className="font-black text-2xl uppercase italic text-red-600 leading-tight">
                  {event.SSE_Lesions || 'NÉANT - AUCUNE LÉSION CONSTATÉE'}
                </p>
            </div>
        </div>

        {/* SECTION : VALIDATIONS (§5.4) */}
        <footer className="grid grid-cols-3 gap-20 mt-40 pt-16 border-t-4 border-slate-100 text-center relative z-10">
            {['Le Déclarant (Victime)', 'Le Responsable HSE', 'La Direction Générale'].map(sign => (
              <div key={sign} className="space-y-16">
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em]">{sign}</p>
                <div className="h-32 border-b-2 border-slate-200 border-dashed relative">
                  <span className="absolute bottom-4 left-0 right-0 text-[9px] text-slate-200 italic uppercase font-black">Scellage Officiel RD 2030</span>
                </div>
              </div>
            ))}
        </footer>

        <div className="mt-20 text-center opacity-20">
            <p className="text-[9px] font-black uppercase tracking-[1em]">Qualisoft Elite Sovereign Infrastructure • Integrity Verified</p>
        </div>
      </div>
    </div>
  );
}