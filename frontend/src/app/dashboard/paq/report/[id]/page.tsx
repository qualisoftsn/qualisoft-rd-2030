/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { ShieldAlert, Printer } from 'lucide-react';

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
      <div className="max-w-4xl mx-auto border-[6px] border-slate-900 p-16 shadow-none">
        <header className="flex justify-between items-center border-b-[6px] border-slate-900 pb-10 mb-12">
          <div className="flex items-center gap-6">
             <div className="bg-red-600 text-white p-6 shadow-lg"><ShieldAlert size={48} /></div>
             <div>
                <h1 className="text-4xl font-black uppercase italic leading-none">RAPPORT D&apos;ÉVÉNEMENT</h1>
                <p className="text-red-600 font-black tracking-[0.3em] uppercase text-sm mt-2">SÉCURITÉ & SANTÉ AU TRAVAIL</p>
             </div>
          </div>
          <p className="text-right text-[11px] font-black uppercase text-slate-300">RÉF: SSE-{event.SSE_Id.slice(0, 8)}</p>
        </header>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div className="space-y-6">
            <div><label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Nature du Risque</label><p className="font-black text-2xl uppercase italic border-b-2 border-slate-100 pb-2">{event.SSE_Type}</p></div>
            <div><label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Lieu Exact</label><p className="font-bold text-lg border-b-2 border-slate-100 pb-2">{event.SSE_Lieu} | {event.SSE_Site?.S_Name}</p></div>
          </div>
          <div className="space-y-6">
            <div><label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Horodatage</label><p className="font-bold text-lg border-b-2 border-slate-100 pb-2">{new Date(event.SSE_DateEvent).toLocaleString()}</p></div>
            <div><label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Agent Concerné</label><p className="font-bold text-lg border-b-2 border-slate-100 pb-2">{event.SSE_Victim?.U_FirstName} {event.SSE_Victim?.U_LastName || 'NON SPÉCIFIÉ'}</p></div>
          </div>
        </div>

        <div className="mb-12">
          <label className="text-[10px] font-black uppercase text-slate-400 block mb-4">Analyse des Faits</label>
          <div className="bg-slate-50 p-10 italic text-lg leading-relaxed border-l-8 border-slate-900 min-h-64 font-medium">{event.SSE_Description}</div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-24">
            <div className="border-2 border-slate-900 p-6">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Impact / Arrêt de travail</label>
                <p className="font-black text-xl uppercase italic">{event.SSE_AvecArret ? `⚠️ OUI - ${event.SSE_NbJoursArret} JOURS` : 'AUCUN ARRÊT'}</p>
            </div>
            <div className="border-2 border-slate-900 p-6">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Lésions / Dommages</label>
                <p className="font-bold italic text-lg">{event.SSE_Lesions || 'Aucune lésion déclarée'}</p>
            </div>
        </div>

        <footer className="grid grid-cols-3 gap-12 mt-24 pt-12 border-t-2 border-slate-100 text-center">
            {['Le Déclarant', 'Le Responsable HSE', 'La Direction'].map(sign => (
              <div key={sign}><p className="text-[9px] font-black uppercase text-slate-400 mb-16 tracking-widest">{sign}</p><div className="h-24 border-b-2 border-slate-200 border-dashed"></div></div>
            ))}
        </footer>
      </div>
      <button onClick={() => window.print()} className="fixed bottom-10 right-10 bg-slate-900 text-white p-6 rounded-full shadow-2xl print:hidden cursor-pointer hover:scale-110 transition-transform"><Printer size={28} /></button>
    </div>
  );
}