/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📄 MODULE : RAPPORT D'ÉVÉNEMENT SSE (ISO 45001)
 * -------------------------------------------------------------------------
 * RÔLE : Édition scellée pour traçabilité légale §10.2.
 * DESIGN : Print-Friendly, High-Contrast Industrial, Elite-SDE.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 19:10 GMT
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  ShieldAlert, Printer, AlertTriangle, Calendar, 
  MapPin, ArrowLeft, Fingerprint, RefreshCw, ShieldCheck
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { cn } from '@/core/utils/cn';

export default function SseReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/sse/${id}`);
      setEvent(res.data?.data || res.data);
    } catch {
      toast.error("RUPTURE LECTURE SSE : DOCUMENT INTROUVABLE");
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchEvent(); }, [fetchEvent]);

  if (loading) return <LoadingScreen label="Extraction du rapport scellé §10.2..." />;
  
  if (!event) return (
    <div className="h-screen flex items-center justify-center bg-[#0B0F1A] text-red-500 font-black uppercase italic tracking-widest p-12 text-center">
      <div className="space-y-8">
        <ShieldAlert size={80} className="mx-auto" />
        <h2 className="text-4xl">Document Révoqué ou Inexistant</h2>
        <button onClick={() => router.back()} className="bg-white text-black px-12 py-5 rounded-3xl cursor-pointer border-none font-black italic">Retourner au Registre</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 lg:p-20 print:p-0 print:bg-white font-sans selection:bg-red-100 italic lg:pl-72 lg:ml-0 overflow-y-auto">
      <Toaster position="top-right" richColors />

      {/* 🧭 NAVIGATION (Invisible à l'impression) */}
      <nav className="max-w-5xl mx-auto flex justify-between items-center mb-10 print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-3 text-slate-500 font-black uppercase italic text-[10px] tracking-widest hover:text-slate-900 transition-all bg-transparent border-none cursor-pointer">
          <ArrowLeft size={16} /> Retour Registre
        </button>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-3 hover:bg-red-600 transition-all cursor-pointer border-none shadow-xl">
          <Printer size={18} /> Lancer Impression Officielle
        </button>
      </nav>

      {/* 📄 DOCUMENT MATRICIEL */}
      <article className="max-w-5xl mx-auto bg-white border-12 border-slate-900 p-12 lg:p-24 shadow-2xl relative overflow-hidden text-left print:shadow-none print:border-none print:p-0">
        
        {/* FILIGRANE SÉCURITÉ */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] opacity-[0.03] text-8xl font-black pointer-events-none uppercase text-center w-[150%] select-none print:opacity-[0.05]">
          Document Scellé SDE Matrix • ISO 45001 Integrity
        </div>

        {/* HEADER TECHNIQUE */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-8 border-slate-900 pb-12 mb-16 relative z-10 gap-10">
          <div className="flex items-center gap-10">
            <div className="bg-red-600 text-white p-8 shadow-xl -rotate-3 shrink-0"><ShieldAlert size={50} strokeWidth={2.5} /></div>
            <div>
              <h1 className="text-5xl lg:text-7xl font-black uppercase italic leading-tight tracking-tighter m-0">
                RAPPORT <span className="text-red-600 underline underline-offset-8">SSE</span>
              </h1>
              <p className="text-slate-400 font-black tracking-[0.4em] uppercase text-[10px] mt-6 italic m-0">SÉCURITÉ & SANTÉ AU TRAVAIL • ISO 45001 §10.2</p>
            </div>
          </div>
          <div className="text-left md:text-right space-y-2">
            <div className="flex items-center md:justify-end gap-2 text-slate-300"><Fingerprint size={12} /><p className="text-[9px] font-black uppercase m-0 tracking-widest">SDE Matrix Ref</p></div>
            <p className="text-2xl font-black uppercase tracking-tighter m-0">ID-{event.SSE_Id?.slice(0, 8).toUpperCase()}</p>
          </div>
        </header>

        {/* 📊 GRID DES CIRCONSTANCES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-20 relative z-10">
          <div className="space-y-12">
            <DataBlock label="Nature de l'Événement" val={event.SSE_Type} color="red" icon={AlertTriangle} />
            <DataBlock label="Localisation SDE" val={`${event.SSE_Lieu} | ${event.SSE_Site?.S_Name}`} icon={MapPin} />
          </div>
          <div className="space-y-12">
            <DataBlock label="Horodatage des Faits" val={new Date(event.SSE_DateEvent).toLocaleString()} icon={Calendar} />
            <DataBlock label="Collaborateur Déclarant" val={`${event.SSE_Victim?.U_FirstName} ${event.SSE_Victim?.U_LastName}`} icon={ShieldCheck} />
          </div>
        </div>

        {/* 📝 DESCRIPTION DES FAITS */}
        <div className="mb-20 relative z-10">
          <label className="text-[10px] font-black uppercase text-slate-400 block mb-8 tracking-[0.4em] italic">Analyse Circonstancielle & Faits Constatés (§8.1.2)</label>
          <div className="bg-slate-50 p-12 italic text-2xl leading-relaxed border-l-16 border-slate-900 min-h-75 font-medium text-slate-800 shadow-inner whitespace-pre-wrap">
            {event.SSE_Description || "Aucune description textuelle consignée dans le registre."}
          </div>
        </div>

        {/* 🚑 LÉSIONS ET GRAVITÉ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-24 relative z-10">
          <div className="border-[6px] border-slate-900 p-10 flex flex-col justify-between bg-white">
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-6 italic tracking-widest">Gravité & Arrêt</label>
            <p className="font-black text-3xl uppercase italic leading-none m-0 text-slate-900">{event.SSE_AvecArret ? `ARRÊT DE TRAVAIL : ${event.SSE_NbJoursArret || 0} JOURS` : 'SANS INTERRUPTION'}</p>
          </div>
          <div className="border-[6px] border-slate-900 p-10 flex flex-col justify-between bg-red-600/5">
            <label className="text-[10px] font-black uppercase text-slate-500 block mb-6 italic tracking-widest">Diagnostic Lésionnel</label>
            <p className="font-black text-2xl uppercase italic text-red-600 leading-tight m-0">{event.SSE_Lesions || 'NÉANT'}</p>
          </div>
        </div>

        {/* 🖋️ VALIDATIONS (§5.4) */}
        <footer className="grid grid-cols-1 sm:grid-cols-3 gap-20 mt-40 pt-16 border-t-4 border-slate-100 text-center relative z-10">
          {['Le Déclarant', 'Le Responsable HSE', 'La Direction'].map(sign => (
            <div key={sign} className="space-y-16">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] m-0">{sign}</p>
              <div className="h-32 border-b-2 border-slate-200 border-dashed relative">
                <span className="absolute bottom-4 left-0 right-0 text-[8px] text-slate-200 italic uppercase font-black">Scellage Officiel Matrix 2026</span>
              </div>
            </div>
          ))}
        </footer>
      </article>
    </div>
  );
}

function DataBlock({ label, val, icon: Icon, color }: any) {
  return (
    <div className="text-left space-y-4">
      <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-3 tracking-[0.3em] italic">
        <Icon size={14} className={color === 'red' ? 'text-red-600' : 'text-slate-800'} /> {label}
      </label>
      <p className={cn("font-black text-2xl lg:text-3xl uppercase italic border-b-4 border-slate-100 pb-4 leading-none m-0", color === 'red' ? 'text-red-600' : 'text-slate-900')}>{val}</p>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center">{label}</span>
    </div>
  );
}