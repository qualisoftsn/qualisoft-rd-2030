/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { ShieldAlert, Printer, Loader2, AlertTriangle, Calendar, MapPin } from 'lucide-react';

/**
 * 📄 COMPOSANT : RAPPORT D'ÉVÉNEMENT SSE (SANTÉ, SÉCURITÉ, ENVIRONNEMENT)
 * Ce document est scellé pour la traçabilité légale et normative.
 * Aligné sur les principes de l'ISO 45001.
 */

export default function SseReport() {
  const params = useParams();
  const id = params?.id as string;
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await apiClient.get(`/sse`);
        const found = res.data.find((e: any) => e.SSE_Id === id);
        setEvent(found);
      } catch (e) {
        console.error("Erreur lecture SSE:", e);
      } finally { setLoading(false); }
    };
    fetchEvent();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white text-slate-900 italic font-black">
      <Loader2 className="animate-spin mr-3" /> COMPILATION DU RAPPORT SSE...
    </div>
  );
  
  if (!event) return (
    <div className="h-screen flex items-center justify-center bg-white text-red-600 font-black uppercase italic">
      Erreur : Document introuvable dans les archives
    </div>
  );

  return (
    <div className="bg-white min-h-screen p-16 text-slate-900 print:p-0 selection:bg-red-100 selection:text-red-900">
      <div className="max-w-4xl mx-auto border-10 border-slate-900 p-16 shadow-none animate-in fade-in duration-500 relative">
        
        {/* FILIGRANE DE SÉCURITÉ */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 opacity-[0.03] text-8xl font-black pointer-events-none uppercase">
          Document Scellé Qualisoft
        </div>

        {/* HEADER TECHNIQUE */}
        <header className="flex justify-between items-center border-b-[6px] border-slate-900 pb-10 mb-12 relative z-10">
          <div className="flex items-center gap-8">
             <div className="bg-red-600 text-white p-7 shadow-2xl"><ShieldAlert size={56} /></div>
             <div>
                <h1 className="text-5xl font-black uppercase italic leading-tight tracking-tighter">
                  RAPPORT <span className="text-red-600 italic underline decoration-[4px] underline-offset-8">D&apos;ÉVÉNEMENT</span>
                </h1>
                <p className="text-slate-500 font-black tracking-[0.4em] uppercase text-xs mt-4 italic">
                  SÉCURITÉ & SANTÉ AU TRAVAIL • RÉFÉRENTIEL SSE
                </p>
             </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest mb-1">RÉFÉRENCE UNIQUE</p>
            <p className="text-lg font-black uppercase">SSE-{event.SSE_Id?.slice(0, 8)}</p>
          </div>
        </header>

        {/* SECTION : DONNÉES DE CIRCONSTANCE */}
        <div className="grid grid-cols-2 gap-16 mb-16 relative z-10">
          <div className="space-y-10">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-[0.2em]"><AlertTriangle className="inline-block mr-1 text-red-600" size={12}/> Nature du Risque</label>
              <p className="font-black text-3xl uppercase italic border-b-4 border-slate-100 pb-3 leading-none text-red-600">{event.SSE_Type}</p>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-[0.2em]"><MapPin className="inline-block mr-1" size={12}/> Localisation</label>
              <p className="font-black text-xl uppercase italic border-b-4 border-slate-100 pb-3">{event.SSE_Lieu} | {event.SSE_Site?.S_Name}</p>
            </div>
          </div>
          <div className="space-y-10">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-[0.2em]"><Calendar className="inline-block mr-1" size={12}/> Horodatage</label>
              <p className="font-black text-xl uppercase italic border-b-4 border-slate-100 pb-3">{new Date(event.SSE_DateEvent).toLocaleString('fr-FR')}</p>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-[0.2em]">Identité Concernée</label>
              <p className="font-black text-xl uppercase italic border-b-4 border-slate-100 pb-3">{event.SSE_Victim?.U_FirstName} {event.SSE_Victim?.U_LastName || 'DÉCLARANT EXTERNE'}</p>
            </div>
          </div>
        </div>

        {/* SECTION : ANALYSE DES FAITS (§8.1 ISO 45001) */}
        <div className="mb-16 relative z-10">
          <label className="text-[10px] font-black uppercase text-slate-400 block mb-6 tracking-[0.3em] italic">Analyse Circonstancielle & Faits Constatés</label>
          <div className="bg-slate-50 p-12 italic text-xl leading-relaxed border-l-12 border-slate-900 min-h-75 font-medium shadow-inner">
            {event.SSE_Description || "Aucune description textuelle n'a été consignée."}
          </div>
        </div>

        {/* SECTION : IMPACTS & LÉSIONS */}
        <div className="grid grid-cols-2 gap-12 mb-24 relative z-10">
            <div className="border-4 border-slate-900 p-8 flex flex-col justify-between">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-4 italic">Statut Opérationnel</label>
                <p className="font-black text-2xl uppercase italic leading-tight">
                  {event.SSE_AvecArret 
                    ? `⚠️ ARRÊT DE TRAVAIL : ${event.SSE_NbJoursArret} JOURS` 
                    : 'AUCUNE INTERRUPTION DE SERVICE'
                  }
                </p>
            </div>
            <div className="border-4 border-slate-900 p-8 flex flex-col justify-between">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-4 italic">Conséquences Physiques / Matérielles</label>
                <p className="font-black text-xl uppercase italic text-red-600 leading-tight">
                  {event.SSE_Lesions || 'NÉANT - AUCUNE LÉSION SIGNALÉE'}
                </p>
            </div>
        </div>

        {/* SECTION : VALIDATIONS (§5.4 ISO 45001) */}
        <footer className="grid grid-cols-3 gap-16 mt-32 pt-16 border-t-4 border-slate-100 text-center relative z-10">
            {['Le Déclarant', 'Le Responsable HSE', 'La Direction'].map(sign => (
              <div key={sign} className="space-y-12">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">{sign}</p>
                <div className="h-28 border-b-2 border-slate-300 border-dashed relative">
                  <span className="absolute bottom-2 left-0 right-0 text-[8px] text-slate-300 italic uppercase">Signature & Cachet</span>
                </div>
              </div>
            ))}
        </footer>
      </div>

      {/* BOUTON D'IMPRESSION (MASQUÉ À L'IMPRESSION) */}
      <button 
        onClick={() => window.print()} 
        className="fixed bottom-12 right-12 bg-slate-900 hover:bg-blue-600 text-white p-8 rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] print:hidden cursor-pointer hover:scale-110 transition-all active:scale-95"
      >
        <Printer size={32} />
      </button>
    </div>
  );
}