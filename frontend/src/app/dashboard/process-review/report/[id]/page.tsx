/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState, use } from 'react';
import apiClient from '@/core/api/api-client';
import { Printer, ArrowLeft, FileCheck, ShieldCheck, Award, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReportProps {
  params: Promise<{ id: string }>;
}

export default function RapportRevueFinalPage({ params }: ReportProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const res = await apiClient.get(`/process-reviews/${id}`);
        setData(res.data);
      } catch (err) {
        console.error("Crash du moteur de rendu PDF");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchReportData();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 italic font-black">
      <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6" />
      <span className="uppercase tracking-[0.4em]">Certification du PV...</span>
    </div>
  );

  return (
    <div className="bg-slate-200 min-h-screen print:bg-white font-sans italic">
      <nav className="print:hidden sticky top-0 z-50 bg-[#0B0F1A] text-white p-6 flex justify-between items-center shadow-2xl">
        <button onClick={() => router.back()} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:text-blue-500 transition-all">
          <ArrowLeft size={16}/> Quitter le mode lecture
        </button>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-500 uppercase italic">Code Documentaire</p>
            <p className="text-[10px] font-bold text-blue-500 uppercase italic">{data?.PRV_DocRef}</p>
          </div>
          <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 transition-all shadow-xl shadow-blue-900/20">
            <Printer size={18}/> Exporter Qualité PDF
          </button>
        </div>
      </nav>

      {/* FEUILLE A4 RÉGLEMENTAIRE */}
      <div className="mx-auto my-12 print:my-0 bg-white w-full max-w-[210mm] min-h-[297mm] p-[25mm] text-black relative shadow-2xl print:shadow-none border border-slate-300 print:border-none">
        
        {/* ENTÊTE ISO 9001 */}
        <header className="border-2 border-black flex mb-12">
          <div className="w-1/3 border-r-2 border-black p-8 flex flex-col items-center justify-center bg-slate-50">
             <div className="font-black text-3xl tracking-tighter uppercase italic leading-none">Qualisoft</div>
             <div className="text-[8px] font-black uppercase tracking-widest mt-2 text-blue-600">SMI Master Edition</div>
          </div>
          <div className="w-1/3 p-8 flex flex-col items-center justify-center text-center border-r-2 border-black">
             <h1 className="font-black text-xs uppercase leading-tight italic">Procès-Verbal de Revue de Processus</h1>
             <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">Système de Management Intégré</p>
          </div>
          <div className="w-1/3 p-6 text-[9px] font-bold uppercase space-y-2">
             <div className="flex justify-between border-b border-slate-100 pb-1"><span>Réf :</span> <span className="font-black text-blue-600">{data?.PRV_DocRef}</span></div>
             <div className="flex justify-between border-b border-slate-100 pb-1"><span>Version :</span> <span>002</span></div>
             <div className="flex justify-between"><span>Date :</span> <span>{new Date().toLocaleDateString('fr-FR')}</span></div>
          </div>
        </header>

        {/* IDENTIFICATION */}
        <div className="grid grid-cols-2 border-2 border-black mb-12">
          <div className="p-6 border-r-2 border-b-2 border-black">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-2 italic tracking-widest">Processus Piloté</p>
            <span className="font-black uppercase text-base text-slate-900">{data?.PRV_Processus?.PR_Libelle}</span>
          </div>
          <div className="p-6 border-b-2 border-black">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-2 italic tracking-widest">Période d&apos;Analyse</p>
            <span className="font-black text-base text-slate-900 italic">{data?.PRV_Month} / {data?.PRV_Year}</span>
          </div>
          <div className="p-6 border-r-2 border-black bg-slate-50/50">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-2 italic tracking-widest">Responsable de Revue</p>
            <span className="font-bold text-sm text-slate-900">{data?.PRV_Processus?.PR_PiloteName || 'Abdoulaye THIONGANE'}</span>
          </div>
          <div className="p-6">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-2 italic tracking-widest">Protection des données</p>
            <span className="font-black text-[9px] uppercase flex items-center gap-2 italic text-emerald-600">
              <ShieldCheck size={14}/> Document de Classe A - Confidentiel
            </span>
          </div>
        </div>

        {/* CONTENU */}
        <div className="space-y-12 text-justify">
          <section>
            <h3 className="bg-slate-900 text-white p-3 text-[10px] font-black uppercase mb-6 italic tracking-widest">
              I. État d&apos;avancement des actions & Indicateurs (KPI)
            </h3>
            <div className="text-[11px] leading-relaxed pl-8 border-l-2 border-slate-100 italic text-slate-700 font-medium">
              {data?.PRV_PerformanceAnalysis || "Aucune donnée de performance saisie."}
            </div>
          </section>

          <section>
            <h3 className="bg-slate-900 text-white p-3 text-[10px] font-black uppercase mb-6 italic tracking-widest">
              II. Revue des risques & Opportunités
            </h3>
            <div className="text-[11px] leading-relaxed pl-8 border-l-2 border-slate-100 italic text-slate-700 font-medium">
              {data?.PRV_RiskAnalysis || "Aucun risque majeur identifié sur cette période."}
            </div>
          </section>

          <section className="bg-blue-600/5 p-10 border-2 border-blue-600/20 rounded-br-[4rem] relative">
            <h3 className="text-[11px] font-black uppercase mb-6 italic text-blue-700 underline decoration-2 underline-offset-8">
              III. Décisions Stratégiques & Plan d&apos;Action Qualité (PAQ)
            </h3>
            <div className="text-[14px] font-black italic leading-relaxed text-slate-900">
              {data?.PRV_Decisions || "Le processus est jugé conforme. Aucune action corrective immédiate requise."}
            </div>
            <Award className="absolute right-8 top-8 text-blue-600/10" size={60} />
          </section>
        </div>

        {/* VISAS FINAUX */}
        <div className="mt-24 grid grid-cols-2 gap-12">
          <div className="border-2 border-black p-8 h-56 relative rounded-tr-[3rem]">
            <span className="absolute -top-3 left-8 bg-white px-4 text-[9px] font-black uppercase italic tracking-widest">Visa Pilote</span>
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <FileCheck size={40} className={data?.PRV_PiloteSigned ? "text-emerald-500" : "text-slate-100"} />
              <p className="text-[8px] font-black uppercase text-slate-400">Authentification Digitale Qualisoft</p>
            </div>
          </div>
          <div className="border-2 border-black p-8 h-56 relative rounded-tl-[3rem] bg-slate-50/50">
            <span className="absolute -top-3 left-8 bg-white px-4 text-[9px] font-black uppercase italic tracking-widest">Visa Direction</span>
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <ShieldCheck size={40} className={data?.PRV_RQSigned ? "text-blue-600" : "text-slate-100"} />
              <p className="text-[8px] font-black uppercase text-slate-400">Approbation SMI Certifiée</p>
            </div>
          </div>
        </div>

        <footer className="absolute bottom-10 left-[25mm] right-[25mm] border-t border-slate-200 pt-6 flex justify-between text-[7px] font-black text-slate-400 uppercase tracking-[0.4em]">
           <span>Propriété de {data?.PRV_TenantName || "QUALISOFT"}</span>
           <span className="italic">Page 1 sur 1 - Généré via Qualisoft Elite v2030</span>
        </footer>
      </div>
    </div>
  );
}