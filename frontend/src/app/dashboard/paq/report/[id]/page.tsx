/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { Printer, ShieldAlert } from 'lucide-react';

export default function SseReport() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    apiClient.get(`/sse`).then(res => {
      const found = res.data.find((e: any) => e.SSE_Id === id);
      setEvent(found);
    });
  }, [id]);

  if (!event) return null;

  return (
    <div className="bg-white min-h-screen p-16 text-slate-900 print:p-0">
      <div className="max-w-4xl mx-auto border-2 border-slate-900 p-12">
        
        <header className="flex justify-between items-center border-b-4 border-slate-900 pb-8 mb-8">
          <div className="flex items-center gap-4">
             <div className="bg-red-600 text-white p-4">
                <ShieldAlert size={32} />
             </div>
             <div>
                <h1 className="text-3xl font-black uppercase italic">Rapport d&apos;Événement</h1>
                <p className="text-red-600 font-bold tracking-widest uppercase text-xs">SÉCURITÉ AU TRAVAIL</p>
             </div>
          </div>
          <div className="text-right text-[10px] font-bold uppercase text-slate-400">
            Réf: SSE-{event.SSE_Id.slice(0, 8)}
          </div>
        </header>

        <div className="grid grid-cols-2 gap-10 mb-10">
          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block">Type d&apos;événement</label>
              <p className="font-black text-lg uppercase italic border-b border-slate-100">{event.SSE_Type}</p>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block">Lieu de l&apos;incident</label>
              <p className="font-bold text-md border-b border-slate-100">{event.SSE_Lieu} ({event.SSE_Site?.S_Name})</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block">Date et Heure</label>
              <p className="font-bold text-md border-b border-slate-100">{new Date(event.SSE_DateEvent).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block">Victime</label>
              <p className="font-bold text-md border-b border-slate-100">{event.SSE_Victim?.U_FirstName} {event.SSE_Victim?.U_LastName || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <label className="text-[9px] font-black uppercase text-slate-400 block mb-2">Description des faits</label>
          <div className="bg-slate-50 p-6 italic text-sm leading-relaxed border border-slate-100 min-h-37.5">
            {event.SSE_Description}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 mb-20">
            <div className="border border-slate-200 p-4">
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-2">Gravité / Arrêt</label>
                <p className="font-black uppercase italic">{event.SSE_AvecArret ? `OUI - ${event.SSE_NbJoursArret} jours` : 'NON'}</p>
            </div>
            <div className="border border-slate-200 p-4">
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-2">Lésions constatées</label>
                <p className="font-bold italic">{event.SSE_Lesions || 'Aucune mentionnée'}</p>
            </div>
        </div>

        
        <footer className="grid grid-cols-3 gap-8 mt-20 pt-10 border-t border-slate-100 text-center">
            <div>
                <p className="text-[8px] font-black uppercase text-slate-400 mb-10 tracking-widest">Le Déclarant</p>
                <div className="h-20 border-b border-slate-200"></div>
            </div>
            <div>
                <p className="text-[8px] font-black uppercase text-slate-400 mb-10 tracking-widest">Le Responsable HSE</p>
                <div className="h-20 border-b border-slate-200"></div>
            </div>
            <div>
                <p className="text-[8px] font-black uppercase text-slate-400 mb-10 tracking-widest">La Direction</p>
                <div className="h-20 border-b border-slate-200"></div>
            </div>
        </footer>
      </div>
    </div>
  );
}