/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📄 MODULE : RAPPORT FINAL PV (MODÈLE A4 PRINTABLE)
 * -------------------------------------------------------------------------
 * RÔLE : Génération du Procès-Verbal officiel pour archivage réglementaire.
 * ARCHITECTURE : Zéro NextAuth, Calibration CSS Print A4 Stricte.
 * DATE : 02 Mars 2026 | 13:01 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useEffect, useState, use } from 'react';
import apiClient from '@/core/api/api-client';
import { Printer, ArrowLeft, FileCheck, ShieldCheck, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RapportRevueFinalPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      apiClient.get(`/process-reviews/${id}`)
        .then(res => setData(res.data?.data || res.data))
        .catch(err => console.error("Crash PV :", err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 italic font-black">
      <div className="w-16 h-16 lg:w-24 lg:h-24 border-4 lg:border-8 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-6 lg:mb-8 shadow-xl" />
      <span className="uppercase tracking-[0.3em] lg:tracking-[0.5em] text-xs lg:text-sm animate-pulse text-center px-4">SCELLAGE DU PROCÈS-VERBAL EN COURS...</span>
    </div>
  );

  return (
    <div className="bg-slate-200 min-h-screen print:bg-white print:m-0 print:p-0 font-sans italic selection:bg-blue-100">
      
      {/* BARRE D'OUTILS SOUVERAINE (MASQUÉE À L'IMPRESSION) */}
      <nav className="print:hidden sticky top-0 z-50 bg-[#0B0F1A] text-white p-6 lg:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b border-white/5">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-3 lg:gap-4 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] hover:text-blue-500 transition-all border-none bg-transparent cursor-pointer italic m-0"
        >
          <ArrowLeft size={16} className="lg:w-4.5 lg:h-4.5" /> Quitter le mode lecture
        </button>
        <div className="flex flex-row items-center gap-6 lg:gap-10 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-left sm:text-right hidden sm:block">
            <p className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase italic tracking-widest mb-1 leading-none m-0">CODE RÉFÉRENTIEL</p>
            <p className="text-[10px] lg:text-[11px] font-black text-blue-500 uppercase italic leading-none m-0">{data?.PRV_DocRef || 'F-QLT-011'}</p>
          </div>
          <button 
            onClick={() => window.print()} 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 px-8 py-4 lg:px-12 lg:py-5 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-[11px] uppercase italic tracking-widest flex items-center justify-center gap-3 lg:gap-4 transition-all shadow-lg border-none cursor-pointer m-0"
          >
            <Printer size={16} className="lg:w-5 lg:h-5" /> Exporter Qualité PDF
          </button>
        </div>
      </nav>

      {/* 📑 FEUILLE A4 RÉGLEMENTAIRE (MASTER SMI) EXACTEMENT CONSERVÉE */}
      <div className="mx-auto my-8 lg:my-16 print:my-0 bg-white w-full max-w-[210mm] min-h-[297mm] p-[15mm] lg:p-[30mm] print:p-[20mm] text-black relative shadow-2xl print:shadow-none border border-slate-300 print:border-none text-left overflow-hidden">
        
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-45 select-none z-0">
            <div className="text-[60px] lg:text-[120px] font-black uppercase tracking-widest whitespace-nowrap">SMI MASTER</div>
        </div>

        <header className="border-2 lg:border-[3px] border-black flex flex-col sm:flex-row mb-10 lg:mb-16 relative z-10">
          <div className="w-full sm:w-1/3 border-b-2 sm:border-b-0 sm:border-r-2 lg:border-r-[3px] border-black p-6 lg:p-10 flex flex-col items-center justify-center bg-slate-50">
             <div className="font-black text-3xl lg:text-4xl tracking-tighter uppercase italic leading-none m-0 text-slate-900">Qualisoft</div>
             <div className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest mt-2 lg:mt-3 text-blue-600 m-0">SMI Sovereign Edition</div>
          </div>
          <div className="w-full sm:w-1/3 p-6 lg:p-10 flex flex-col items-center justify-center text-center border-b-2 sm:border-b-0 sm:border-r-2 lg:border-r-[3px] border-black">
             <h1 className="font-black text-[10px] lg:text-[11px] uppercase leading-[1.3] italic mb-1 lg:mb-2 tracking-tight m-0 text-slate-900">Procès-Verbal <br/> Revue de Processus</h1>
             <p className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest italic opacity-80 m-0">SMI ISO 9001:2015</p>
          </div>
          <div className="w-full sm:w-1/3 p-6 lg:p-8 text-[9px] lg:text-[10px] font-black uppercase space-y-2 lg:space-y-3 italic tracking-tight text-slate-800">
             <div className="flex justify-between border-b border-slate-100 pb-1.5 lg:pb-2 m-0"><span>Réf :</span> <span className="text-blue-600">{data?.PRV_DocRef || 'F-QLT-011'}</span></div>
             <div className="flex justify-between border-b border-slate-100 pb-1.5 lg:pb-2 m-0"><span>Version :</span> <span>002-S</span></div>
             <div className="flex justify-between m-0"><span>Date PV :</span> <span>{new Date().toLocaleDateString('fr-FR')}</span></div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 border-2 lg:border-[3px] border-black mb-10 lg:mb-16 relative z-10">
          <div className="p-6 lg:p-8 border-b-2 lg:border-b-[3px] sm:border-r-2 lg:border-r-[3px] border-black text-left">
            <p className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase mb-2 lg:mb-3 italic tracking-[0.2em] m-0">Périmètre du Processus</p>
            <span className="font-black uppercase text-lg lg:text-xl text-slate-900 leading-none m-0">{data?.PRV_Processus?.PR_Libelle || 'NON DÉFINI'}</span>
          </div>
          <div className="p-6 lg:p-8 border-b-2 lg:border-b-[3px] border-black text-left">
            <p className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase mb-2 lg:mb-3 italic tracking-[0.2em] m-0">Période de Surveillance</p>
            <span className="font-black text-lg lg:text-xl text-slate-900 italic leading-none uppercase m-0">{data?.PRV_Month?.toString().padStart(2, '0')} / {data?.PRV_Year}</span>
          </div>
          <div className="p-6 lg:p-8 border-b-2 lg:border-b-0 sm:border-r-2 lg:border-r-[3px] border-black bg-slate-50/80 text-left">
            <p className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase mb-2 lg:mb-3 italic tracking-[0.2em] m-0">Pilote Rapporteur</p>
            <span className="font-black text-sm lg:text-base text-slate-900 uppercase italic leading-none m-0">{data?.PRV_Processus?.PR_PiloteName || 'RESPONSABLE PROCESSUS'}</span>
          </div>
          <div className="p-6 lg:p-8 text-left">
            <p className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase mb-2 lg:mb-3 italic tracking-[0.2em] m-0">Habilitation de Données</p>
            <span className="font-black text-[9px] lg:text-[10px] uppercase flex items-center gap-2 lg:gap-3 italic text-emerald-600 leading-none tracking-tight m-0">
              <ShieldCheck size={14} className="lg:w-4 lg:h-4 shrink-0" /> Document Scellé - Souverain
            </span>
          </div>
        </div>

        <div className="space-y-10 lg:space-y-16 text-justify relative z-10 mb-16 lg:mb-20">
          <section className="text-left page-break-inside-avoid">
            <h3 className="bg-slate-900 text-white p-3 lg:p-4 text-[10px] lg:text-[11px] font-black uppercase mb-4 lg:mb-8 italic tracking-[0.2em] lg:tracking-[0.3em] flex items-center gap-3 lg:gap-4 leading-none m-0">
              <span className="w-1.5 h-3 lg:h-4 bg-blue-500 rounded-full shrink-0"></span> I. État d&apos;avancement & Performance (KPI)
            </h3>
            <div className="text-[11px] lg:text-[13px] leading-relaxed pl-6 lg:pl-10 border-l-[3px] lg:border-l-4 border-slate-200 italic text-slate-800 font-bold uppercase tracking-tighter whitespace-pre-wrap m-0">
              {data?.PRV_PerformanceAnalysis || "Aucun écart signalé sur la période."}
            </div>
          </section>

          <section className="text-left page-break-inside-avoid">
            <h3 className="bg-slate-900 text-white p-3 lg:p-4 text-[10px] lg:text-[11px] font-black uppercase mb-4 lg:mb-8 italic tracking-[0.2em] lg:tracking-[0.3em] flex items-center gap-3 lg:gap-4 leading-none m-0">
               <span className="w-1.5 h-3 lg:h-4 bg-red-600 rounded-full shrink-0"></span> II. Revue des Audits & Non-Conformités
            </h3>
            <div className="text-[11px] lg:text-[13px] leading-relaxed pl-6 lg:pl-10 border-l-[3px] lg:border-l-4 border-slate-200 italic text-slate-800 font-bold uppercase tracking-tighter whitespace-pre-wrap m-0">
              {data?.PRV_AuditAnalysis || "Analyse de NC non complétée."}
            </div>
          </section>

          <section className="bg-blue-50/50 p-6 lg:p-12 border-2 lg:border-[3px] border-blue-600/20 rounded-br-[3rem] lg:rounded-br-[5rem] relative text-left page-break-inside-avoid">
            <div className="absolute top-0 right-0 p-4 lg:p-8 opacity-10 pointer-events-none"><Award size={60} className="lg:w-20 lg:h-20" /></div>
            <h3 className="text-[10px] lg:text-[12px] font-black uppercase mb-6 lg:mb-8 italic text-blue-800 underline decoration-2 lg:decoration-[3px] underline-offset-[6px] lg:underline-offset-10 decoration-blue-700/30 tracking-widest leading-none m-0">
              III. Décisions Stratégiques & Plan d&apos;Action Qualité (PAQ)
            </h3>
            <div className="text-[13px] lg:text-[16px] font-black italic leading-relaxed text-slate-900 uppercase tracking-tighter border-l-[3px] lg:border-l-4 border-blue-600/30 pl-4 lg:pl-8 whitespace-pre-wrap m-0 relative z-10">
              {data?.PRV_Decisions || "Maintien des objectifs en l'état."}
            </div>
          </section>
        </div>

        <div className="mt-16 lg:mt-32 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-16 relative z-10 text-left page-break-inside-avoid">
          <div className="border-2 lg:border-[3px] border-black p-6 lg:p-10 h-48 lg:h-64 relative rounded-tr-[3rem] lg:rounded-tr-[4rem] group hover:bg-slate-50 transition-colors">
            <span className="absolute -top-3 lg:-top-4 left-6 lg:left-10 bg-white px-3 lg:px-5 text-[8px] lg:text-[10px] font-black uppercase italic tracking-[0.2em] lg:tracking-[0.3em] m-0">Visa Pilote Processus</span>
            <div className="flex flex-col items-center justify-center h-full gap-4 lg:gap-5 opacity-50 lg:opacity-40">
              <FileCheck size={40} className={`lg:w-12 lg:h-12 ${data?.PRV_PiloteSigned ? "text-emerald-500 opacity-100" : "text-slate-300"}`} />
              <div className="text-center">
                <p className="text-[8px] lg:text-[9px] font-black uppercase text-slate-900 italic leading-none m-0">{data?.PRV_PiloteSigned ? 'SCELLÉ NUMÉRIQUEMENT' : 'EN ATTENTE DE SIGNATURE'}</p>
                <p className="text-[7px] lg:text-[8px] font-black uppercase text-slate-500 mt-1.5 lg:mt-2 tracking-widest leading-none italic m-0">ID-TOKEN: QLS-P-0442-X</p>
              </div>
            </div>
          </div>
          <div className="border-2 lg:border-[3px] border-black p-6 lg:p-10 h-48 lg:h-64 relative rounded-tl-[3rem] lg:rounded-tl-[4rem] bg-slate-50/80 group hover:bg-white transition-colors">
            <span className="absolute -top-3 lg:-top-4 left-6 lg:left-10 bg-white px-3 lg:px-5 text-[8px] lg:text-[10px] font-black uppercase italic tracking-[0.2em] lg:tracking-[0.3em] m-0">Visa Direction SMI</span>
            <div className="flex flex-col items-center justify-center h-full gap-4 lg:gap-5 opacity-50 lg:opacity-40">
              <ShieldCheck size={40} className={`lg:w-12 lg:h-12 ${data?.PRV_RQSigned ? "text-blue-600 opacity-100" : "text-slate-300"}`} />
              <div className="text-center">
                <p className="text-[8px] lg:text-[9px] font-black uppercase text-slate-900 italic leading-none m-0">{data?.PRV_RQSigned ? 'CERTIFIÉ CONFORME' : 'VISA DIRECTION REQUIS'}</p>
                <p className="text-[7px] lg:text-[8px] font-black uppercase text-slate-500 mt-1.5 lg:mt-2 tracking-widest leading-none italic m-0">ID-TOKEN: QLS-D-9912-A</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="absolute bottom-6 lg:bottom-12 left-[15mm] lg:left-[30mm] right-[15mm] lg:right-[30mm] border-t lg:border-t-2 border-slate-200 pt-4 lg:pt-8 flex flex-col sm:flex-row justify-between text-center sm:text-left text-[7px] lg:text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] lg:tracking-[0.5em] italic gap-2">
           <span className="m-0">PROPRIÉTÉ EXCLUSIVE : {data?.PRV_TenantName || "QUALISOFT ELITE SENEGAL"}</span>
           <span className="m-0">PAGE 01 / 01 - QUALISOFT SMI v2.4</span>
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          html, body { background: white !important; margin: 0; padding: 0; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}