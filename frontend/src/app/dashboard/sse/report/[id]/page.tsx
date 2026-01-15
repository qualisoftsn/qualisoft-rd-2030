/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { Printer, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';

export default function SseReportPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await apiClient.get(`/sse`);
        // On cherche l'événement correspondant à l'ID dans l'URL
        const found = res.data.find((e: any) => e.SSE_Id === params.id);
        setEvent(found);
      } catch (err) {
        console.error("Erreur rapport SSE:", err);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchEvent();
  }, [params.id]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-orange-500 mb-2" size={32} />
      <p className="text-slate-400 font-bold text-[10px] uppercase italic">Génération du document...</p>
    </div>
  );

  if (!event) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-slate-500">
      <p className="font-black italic">Désolé, cet incident est introuvable.</p>
      <button onClick={() => router.back()} className="mt-4 text-blue-600 underline">Retour</button>
    </div>
  );

  return (
    <div className="bg-white min-h-screen p-10 text-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase italic">
            <ArrowLeft size={16} /> Retour au registre
          </button>
          <button onClick={() => window.print()} className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] shadow-lg">
            <Printer size={16} /> Imprimer en PDF
          </button>
        </div>

        <div className="border-4 border-slate-900 p-12">
          <header className="flex justify-between items-center border-b-4 border-slate-900 pb-8 mb-10">
            <div className="flex items-center gap-5">
              <ShieldAlert size={48} className="text-orange-600" />
              <div>
                <h1 className="text-4xl font-black uppercase italic leading-none">Fiche Incident</h1>
                <p className="text-orange-600 font-black tracking-widest uppercase text-[10px] mt-2 italic">Registre Officiel SSE</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400">Référence</p>
              <p className="font-black text-xl italic leading-none">#{event.SSE_Id.slice(0, 8).toUpperCase()}</p>
            </div>
          </header>

          <div className="grid grid-cols-2 gap-10 mb-10">
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Type d&apos;événement</label>
                <p className="font-black text-lg uppercase italic border-b border-slate-100 pb-2">{event.SSE_Type.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Lieu & Site</label>
                <p className="font-bold text-md border-b border-slate-100 pb-2">{event.SSE_Lieu} ({event.SSE_Site?.S_Name || 'Site inconnu'})</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Date du signalement</label>
                <p className="font-black text-lg italic border-b border-slate-100 pb-2">{new Date(event.SSE_DateEvent).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Arrêt de travail</label>
                <p className="font-bold text-md border-b border-slate-100 pb-2">{event.SSE_AvecArret ? `${event.SSE_NbJoursArret} Jours d&apos;arrêt` : 'Aucun arrêt'}</p>
              </div>
            </div>
          </div>

          <div className="mb-10 bg-slate-50 p-8 border border-slate-100 min-h-37.5">
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-4 italic underline decoration-orange-500 underline-offset-4">Description détaillée des faits</label>
            <p className="text-sm font-medium italic leading-relaxed text-slate-700">
              {event.SSE_Description}
            </p>
          </div>

          <footer className="mt-20 grid grid-cols-2 gap-20">
            <div className="text-center">
              <p className="text-[8px] font-black uppercase text-slate-400 mb-16 tracking-widest italic">Visa du déclarant</p>
              <div className="w-full border-b border-slate-200"></div>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-black uppercase text-slate-400 mb-16 tracking-widest italic">Visa Direction / HSE</p>
              <div className="w-full border-b border-slate-200"></div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}