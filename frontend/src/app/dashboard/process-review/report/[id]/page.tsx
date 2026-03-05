/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📄 MODULE : RAPPORT FINAL PV (MODÈLE A4 PRINTABLE)
 * -------------------------------------------------------------------------
 * RÔLE : Génération du Procès-Verbal officiel pour archivage réglementaire.
 * DESIGN : Print-Ready, Elite High-Contrast, Professional Typography.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 19:15 GMT
 */

"use client";

import React, { useEffect, useState, use } from 'react';
import apiClient from '@/core/api/api-client';
import { Printer, ArrowLeft, FileCheck, ShieldCheck, Award, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/core/utils/cn';

export default function RapportRevueFinalPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      apiClient.get(`/process-reviews/${id}`)
        .then(res => setData(res.data?.data || res.data))
        .catch(() => console.error("CRASH PV SDE"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <LoadingScreen label="Scellage du Procès-Verbal en cours..." />;

  return (
    <div className="min-h-screen bg-slate-200 print:bg-white p-0 font-sans italic selection:bg-blue-100 lg:pl-72 lg:ml-0 overflow-y-auto">
      
      {/* 🧭 TOOLBAR SOUVERAINE (Hide on print) */}
      <nav className="print:hidden sticky top-0 z-50 bg-[#0B0F1A] text-white p-8 flex justify-between items-center shadow-4xl border-b border-white/5">
        <button onClick={() => router.back()} className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest hover:text-blue-500 transition-all border-none bg-transparent cursor-pointer italic text-white">
          <ArrowLeft size={16} /> Quitter Mode Lecture
        </button>
        <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 px-12 py-5 rounded-2xl font-black text-[11px] uppercase italic tracking-widest flex items-center gap-4 transition-all shadow-4xl border-none cursor-pointer text-white">
          <Printer size={18} /> Exporter PDF Officiel
        </button>
      </nav>

      {/* 📄 FEUILLE A4 RÉGLEMENTAIRE */}
      <div className="mx-auto my-16 print:my-0 bg-white w-full max-w-[210mm] min-h-[297mm] p-[25mm] text-black relative shadow-2xl print:shadow-none text-left border border-slate-300 print:border-none">
        
        {/* SDE WATERMARK */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-45 select-none z-0">
          <div className="text-[120px] font-black uppercase tracking-[0.2em] whitespace-nowrap">SMI SOUVERAIN</div>
        </div>

        {/* HEADER ISO */}
        <header className="border-[3px] border-black flex flex-col md:flex-row mb-16 relative z-10">
          <div className="w-full md:w-1/3 border-b-2 md:border-b-0 md:border-r-[3px] border-black p-10 flex flex-col items-center justify-center bg-slate-50">
            <span className="font-black text-4xl tracking-tighter uppercase italic text-slate-900 leading-none">Elite</span>
            <span className="text-[10px] font-black uppercase mt-3 text-blue-600 tracking-widest">SDE Infrastructure</span>
          </div>
          <div className="w-full md:w-1/3 p-10 flex flex-col items-center justify-center text-center border-b-2 md:border-b-0 md:border-r-[3px] border-black">
            <h1 className="font-black text-[12px] uppercase italic mb-2 m-0 text-slate-900">Procès-Verbal de Revue</h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest m-0 opacity-80 italic">ISO 9001:2015 §9.3</p>
          </div>
          <div className="w-full md:w-1/3 p-8 text-[10px] font-black uppercase space-y-3 italic tracking-tight text-slate-800">
            <div className="flex justify-between border-b border-slate-100 pb-2"><span>Réf :</span> <span className="text-blue-600">{data?.PRV_DocRef}</span></div>
            <div className="flex justify-between border-b border-slate-100 pb-2"><span>Période :</span> <span>{data?.PRV_Month}/{data?.PRV_Year}</span></div>
            <div className="flex justify-between"><span>Date PV :</span> <span>{new Date().toLocaleDateString('fr-FR')}</span></div>
          </div>
        </header>

        {/* ANALYSE DES FAITS */}
        <div className="space-y-16 text-justify relative z-10 mb-20">
          <PVSection title="I. Performance Processus (KPI)" val={data?.PRV_PerformanceAnalysis} accent="blue" />
          <PVSection title="II. Audits & Non-Conformités" val={data?.PRV_AuditAnalysis} accent="red" />
          
          <div className="bg-blue-50/50 p-12 border-[3px] border-blue-600/20 rounded-br-[5rem] relative page-break-inside-avoid">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Award size={80} /></div>
            <h3 className="text-[12px] font-black uppercase mb-8 italic text-blue-800 underline underline-offset-8 decoration-blue-700/30 tracking-widest leading-none m-0">III. Décisions Stratégiques & Mutations (PAQ)</h3>
            <div className="text-[16px] font-black italic leading-relaxed text-slate-900 uppercase tracking-tighter border-l-4 border-blue-600/30 pl-8 whitespace-pre-wrap m-0">
              {data?.PRV_Decisions || "MAINTIEN DES OBJECTIFS EN L'ÉTAT."}
            </div>
          </div>
        </div>

        {/* SIGNATURES */}
        <footer className="mt-40 grid grid-cols-2 gap-20 relative z-10 page-break-inside-avoid">
          <SignatureBlock label="Le Pilote Processus" signed={data?.PRV_PiloteSigned} icon={FileCheck} />
          <SignatureBlock label="La Direction SMI" signed={data?.PRV_RQSigned} icon={ShieldCheck} />
        </footer>

        <div className="absolute bottom-12 left-[30mm] right-[30mm] border-t-2 border-slate-100 pt-8 flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest italic">
          <span>Propriété Exclusive : {data?.PRV_TenantName || "Qualisoft SDE"}</span>
          <span>SMI v3.2 - Master Integrity Scellé</span>
        </div>
      </div>
    </div>
  );
}

function PVSection({ title, val, accent }: any) {
  const colors: any = { blue: "bg-blue-600", red: "bg-red-600" };
  return (
    <section className="text-left page-break-inside-avoid">
      <h3 className="bg-slate-900 text-white p-4 text-[11px] font-black uppercase mb-8 italic tracking-[0.3em] flex items-center gap-4 leading-none m-0">
        <span className={cn("w-1.5 h-4 rounded-full shrink-0", colors[accent])}></span> {title}
      </h3>
      <div className="text-[13px] leading-relaxed pl-10 border-l-4 border-slate-100 italic text-slate-800 font-bold uppercase tracking-tighter whitespace-pre-wrap m-0">
        {val || "AUCUNE DONNÉE CONSIGNÉE."}
      </div>
    </section>
  );
}

function SignatureBlock({ label, signed, icon: Icon }: any) {
  return (
    <div className="border-[3px] border-black p-10 h-64 relative rounded-tr-[4rem] flex flex-col items-center justify-center group bg-white">
      <span className="absolute -top-4 left-10 bg-white px-5 text-[10px] font-black uppercase italic tracking-widest">{label}</span>
      <Icon className={cn("mb-5 transition-all", signed ? "text-emerald-500 scale-110" : "text-slate-100")} size={48} />
      <p className="text-[9px] font-black uppercase text-slate-900 italic m-0 tracking-tighter leading-none">{signed ? "SCELLÉ NUMÉRIQUEMENT" : "EN ATTENTE DE VISA"}</p>
      <p className="text-[7px] font-black text-slate-400 mt-3 uppercase tracking-widest italic leading-none">{signed ? "ID-TOKEN: MASTER-SDE-ACK" : "SMI-VOID"}</p>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-indigo-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}