//* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📄 MODULE : FICHE INCIDENT OFFICIELLE (PRINT READY)
 * ---------------------------------------------------------------------------
 * RÔLE : Visualisation scellée et export audit.
 * DESIGN : Elite Sovereign Print / 100dvh.
 * DATE DE RÉVISION : 05 Mars 2026 | 19:40 GMT
 */

"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { Printer, ShieldAlert, ArrowLeft, MapPin, RefreshCw, FileText } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

export default function SseReportPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/sse`);
      const data = res.data?.data || res.data;
      const found = (Array.isArray(data) ? data : []).find((e: any) => e.SSE_Id === id);
      setEvent(found);
    } catch { 
      toast.error("RUPTURE KERNEL : Rapport inaccessible."); 
    } finally { 
      setLoading(false); 
    }
  }, [id]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  if (loading) return <LoadingScreen label="Génération du Document Certifié..." />;

  if (!event) return (
    <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center gap-6 lg:pl-72">
       <ShieldAlert size={60} className="text-rose-600" />
       <p className="text-white font-black italic uppercase tracking-widest text-xs">Identifiant scellé introuvable</p>
       <button onClick={() => router.back()} className="text-blue-500 font-black uppercase text-[10px] tracking-widest underline underline-offset-8 cursor-pointer border-none bg-transparent">Retour au registre</button>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen p-4 lg:p-10 text-slate-900 italic font-black uppercase flex flex-col selection:bg-orange-600/20 ml-0 lg:pl-72 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="light" />
      
      <div className="max-w-5xl mx-auto w-full space-y-12">
        
        {/* ACTION BAR (HIDDEN IN PRINT) */}
        <div className="flex justify-between items-center print:hidden mt-12 lg:mt-0">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-black transition-all font-black text-[11px] border-none bg-transparent cursor-pointer active:scale-95">
            <ArrowLeft size={18} /> Retour au Registre
          </button>
          <button onClick={() => window.print()} className="bg-black text-white px-10 py-5 rounded-2xl font-black text-[11px] shadow-xl hover:bg-orange-600 transition-all border-none cursor-pointer flex items-center gap-3 active:scale-95">
            <Printer size={18} /> Exporter PDF / Imprimer
          </button>
        </div>

        {/* 📄 PRINT CONTENT */}
        <div className="bg-white border-12 border-black p-6 lg:p-20 shadow-[0_40px_100px_rgba(0,0,0,0.1)] relative overflow-hidden text-left animate-in zoom-in-95 duration-700">
           
           {/* Filigrane SDE */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 opacity-[0.03] pointer-events-none select-none">
              <ShieldAlert size={600} strokeWidth={1} />
           </div>

           <header className="border-b-10 border-black pb-12 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
              <div className="flex items-center gap-8">
                 <div className="p-6 bg-orange-600 text-white rounded-3xl shadow-xl">
                    <ShieldAlert size={50} strokeWidth={3} />
                 </div>
                 <div className="space-y-2">
                    <h1 className="text-4xl lg:text-6xl font-black italic tracking-tighter m-0 leading-none uppercase">Fiche <span className="text-orange-600">Incident</span></h1>
                    <p className="text-slate-400 text-[10px] tracking-[0.5em] m-0 leading-none">Registre Officiel • ISO 45001 • RD-2026</p>
                 </div>
              </div>
              <div className="text-left md:text-right border-l-4 md:border-l-0 md:border-r-4 border-orange-600 pl-6 md:pl-0 md:pr-6 py-2">
                 <p className="text-[10px] text-slate-400 m-0 tracking-widest leading-none mb-2">RÉFÉRENCE SDE</p>
                 <p className="text-2xl lg:text-3xl font-black italic m-0 leading-none">#{event.SSE_Id?.slice(0, 10).toUpperCase()}</p>
              </div>
           </header>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 mb-16 relative z-10">
              <DataBlock label="Type d&apos;Événement" value={event.SSE_Type?.replace(/_/g, ' ')} />
              <DataBlock label="Horodatage des Faits" value={new Date(event.SSE_DateEvent).toLocaleString()} />
              <DataBlock label="Localisation Précise" value={event.SSE_Lieu} icon={<MapPin size={18} className="text-orange-600" />} />
              <DataBlock label="Statut Arrêt" value={event.SSE_AvecArret ? `${event.SSE_NbJoursArret} JOURS D'ARRÊT` : 'SANS ARRÊT'} color={event.SSE_AvecArret ? "text-rose-600" : "text-emerald-600"} />
           </div>

           <div className="bg-slate-50 p-8 lg:p-12 border-4 border-black mb-16 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                 <FileText size={20} className="text-orange-600" />
                 <p className="text-[11px] font-black text-slate-950 uppercase underline decoration-orange-600 underline-offset-8 decoration-4 tracking-widest m-0">Description Factuelle (§10.2)</p>
              </div>
              <p className="text-xl lg:text-2xl font-black italic leading-relaxed m-0 text-slate-800 uppercase text-justify">{event.SSE_Description}</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mt-24 relative z-10">
              <div className="border-t-[6px] border-black pt-6 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none m-0">Visa Direction SMI / QHSE</p>
                 <p className="text-[8px] mt-4 opacity-30 italic">Document scellé par signature numérique</p>
              </div>
              <div className="border-t-[6px] border-black pt-6 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none m-0">Visa Déclarant / Victime</p>
                 <p className="text-[8px] mt-4 opacity-30 italic">Mention &quot;Lu et approuvé&quot; obligatoire</p>
              </div>
           </div>

           <footer className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center opacity-40 italic">
              <span className="text-[8px] font-black tracking-widest uppercase">Généré par QUALISOFT ELITE SDE 2026 • Noyau Matrix</span>
              <span className="text-[8px] font-black tracking-widest uppercase">Page 01 / 01</span>
           </footer>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@media print { body { background: white !important; } .ml-72 { padding: 0 !important; margin: 0 !important; } .print\\:hidden { display: none !important; } .shadow-4xl { box-shadow: none !important; } }` }} />
    </div>
  );
}

// --- 🧩 COMPOSANTS ATOMIQUES SCELLÉS ---
function DataBlock({ label, value, icon, color = "text-black" }: any) {
  return (
    <div className="space-y-3 text-left">
      <p className="text-[11px] text-slate-400 font-black tracking-widest italic m-0 uppercase leading-none">{label}</p>
      <div className={cn("text-2xl lg:text-3xl font-black italic tracking-tighter flex items-center gap-3 leading-tight uppercase", color)}>
        {icon} {value}
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-orange-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}