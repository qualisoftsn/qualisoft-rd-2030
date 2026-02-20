/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState, use } from 'react';
import apiClient from '@/core/api/api-client';
import { Printer, ArrowLeft, FileCheck, ShieldCheck, Award, Lock, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * 📄 MODULE : RAPPORT FINAL PV (MODÈLE A4)
 * -------------------------------------------------------------------------
 * RÔLE : 
 * Génère le Procès-Verbal officiel pour archivage réglementaire.
 * Structure alignée sur les audits de certification ISO 9001.
 * -------------------------------------------------------------------------
 */

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
        console.error("Crash du moteur de rendu PDF :", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchReportData();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 italic font-black">
      <div className="w-24 h-24 border-8 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-8 shadow-2xl shadow-blue-600/20" />
      <span className="uppercase tracking-[0.5em] text-sm animate-pulse">SCELLAGE DU PROCÈS-VERBAL EN COURS...</span>
    </div>
  );

  return (
    <div className="bg-slate-200 min-h-screen print:bg-white font-sans italic selection:bg-blue-100">
      
      {/* BARRE D'OUTILS SOUVERAINE (MASQUÉE À L'IMPRESSION) */}
      <nav className="print:hidden sticky top-0 z-50 bg-[#0B0F1A] text-white p-8 flex justify-between items-center shadow-[0_15px_40px_rgba(0,0,0,0.5)] border-b border-white/5">
        <button 
            onClick={() => router.back()} 
            className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] hover:text-blue-500 transition-all border-none bg-transparent cursor-pointer italic"
        >
          <ArrowLeft size={18}/> Quitter le mode lecture
        </button>
        <div className="flex items-center gap-10">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-500 uppercase italic tracking-widest mb-1 leading-none text-left">CODE RÉFÉRENTIEL</p>
            <p className="text-[11px] font-black text-blue-500 uppercase italic leading-none text-left">{data?.PRV_DocRef}</p>
          </div>
          <button 
            onClick={() => window.print()} 
            className="bg-blue-600 hover:bg-blue-500 px-12 py-5 rounded-2xl font-black text-[11px] uppercase italic tracking-widest flex items-center gap-4 transition-all shadow-2xl shadow-blue-900/30 border-none cursor-pointer"
          >
            <Printer size={20}/> Exporter Qualité PDF
          </button>
        </div>
      </nav>

      {/* 📑 FEUILLE A4 RÉGLEMENTAIRE (MASTER SMI) */}
      <div className="mx-auto my-16 print:my-0 bg-white w-full max-w-[210mm] min-h-[297mm] p-[30mm] text-black relative shadow-[0_50px_100px_rgba(0,0,0,0.15)] print:shadow-none border border-slate-300 print:border-none text-left">
        
        {/* FILIGRANE DE SÉCURITÉ */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-45">
            <div className="text-[120px] font-black uppercase tracking-widest">SMI MASTER</div>
        </div>

        {/* ENTÊTE ISO 9001 (CADRE OFFICIEL) */}
        <header className="border-[3px] border-black flex mb-16 relative z-10">
          <div className="w-1/3 border-r-[3px] border-black p-10 flex flex-col items-center justify-center bg-slate-50">
             <div className="font-black text-4xl tracking-tighter uppercase italic leading-none">Qualisoft</div>
             <div className="text-[10px] font-black uppercase tracking-widest mt-3 text-blue-600">SMI Sovereign Edition</div>
          </div>
          <div className="w-1/3 p-10 flex flex-col items-center justify-center text-center border-r-[3px] border-black">
             <h1 className="font-black text-[11px] uppercase leading-[1.3] italic mb-2 tracking-tight">Procès-Verbal <br/> Revue de Processus</h1>
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic opacity-60">SMI ISO 9001:2015</p>
          </div>
          <div className="w-1/3 p-8 text-[10px] font-black uppercase space-y-3 italic tracking-tight">
             <div className="flex justify-between border-b border-slate-100 pb-2"><span>Réf :</span> <span className="text-blue-600">{data?.PRV_DocRef}</span></div>
             <div className="flex justify-between border-b border-slate-100 pb-2"><span>Version :</span> <span>002-S</span></div>
             <div className="flex justify-between"><span>Date PV :</span> <span>{new Date().toLocaleDateString('fr-FR')}</span></div>
          </div>
        </header>

        {/* SECTION : CARTOGRAPHIE & IDENTIFICATION */}
        <div className="grid grid-cols-2 border-[3px] border-black mb-16 relative z-10">
          <div className="p-8 border-r-[3px] border-b-[3px] border-black text-left">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-3 italic tracking-[0.2em]">Périmètre du Processus</p>
            <span className="font-black uppercase text-xl text-slate-900 leading-none">{data?.PRV_Processus?.PR_Libelle}</span>
          </div>
          <div className="p-8 border-b-[3px] border-black text-left">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-3 italic tracking-[0.2em]">Période de Surveillance</p>
            <span className="font-black text-xl text-slate-900 italic leading-none uppercase">{data?.PRV_Month} / {data?.PRV_Year}</span>
          </div>
          <div className="p-8 border-r-[3px] border-black bg-slate-50/50 text-left">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-3 italic tracking-[0.2em]">Pilote Rapporteur</p>
            <span className="font-black text-base text-slate-900 uppercase italic leading-none">{data?.PRV_Processus?.PR_PiloteName || 'RESPONSABLE PROCESSUS'}</span>
          </div>
          <div className="p-8 text-left">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-3 italic tracking-[0.2em]">Habilitation de Données</p>
            <span className="font-black text-[10px] uppercase flex items-center gap-3 italic text-emerald-600 leading-none tracking-tight">
              <ShieldCheck size={16}/> Document Scellé - Classe Souveraine
            </span>
          </div>
        </div>

        {/* SECTION : CORP DU RAPPORT (§9.3.2) */}
        <div className="space-y-16 text-justify relative z-10 mb-20">
          <section className="text-left">
            <h3 className="bg-slate-900 text-white p-4 text-[11px] font-black uppercase mb-8 italic tracking-[0.3em] flex items-center gap-4 leading-none">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span> I. État d&apos;avancement & Performance (KPI)
            </h3>
            <div className="text-[13px] leading-relaxed pl-10 border-l-4 border-slate-100 italic text-slate-800 font-bold uppercase tracking-tighter">
              {data?.PRV_PerformanceAnalysis || "Aucun écart de performance signalé sur le tableau de bord (§9.1.3)."}
            </div>
          </section>

          <section className="text-left">
            <h3 className="bg-slate-900 text-white p-4 text-[11px] font-black uppercase mb-8 italic tracking-[0.3em] flex items-center gap-4 leading-none">
               <span className="w-1.5 h-4 bg-red-600 rounded-full"></span> II. Revue des Risques & Non-Conformités
            </h3>
            <div className="text-[13px] leading-relaxed pl-10 border-l-4 border-slate-100 italic text-slate-800 font-bold uppercase tracking-tighter">
              {data?.PRV_RiskAnalysis || "Analyse de risques statique. Aucune menace critique identifiée sur la période (§6.1)."}
            </div>
          </section>

          <section className="bg-blue-600/5 p-12 border-[3px] border-blue-600/20 rounded-br-[5rem] relative text-left">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Award size={80} /></div>
            <h3 className="text-[12px] font-black uppercase mb-8 italic text-blue-700 underline decoration-[3px] underline-offset-10 decoration-blue-700/30 tracking-widest leading-none">
              III. Décisions Stratégiques & Plan d&apos;Action Qualité (PAQ)
            </h3>
            <div className="text-[16px] font-black italic leading-relaxed text-slate-950 uppercase tracking-tighter border-l-4 border-blue-600/30 pl-8">
              {data?.PRV_Decisions || "Conformité validée. Poursuite des objectifs SMI sans mesure corrective immédiate."}
            </div>
          </section>
        </div>

        {/* SECTION : VISAS & SIGNATURES DIGITALES */}
        <div className="mt-32 grid grid-cols-2 gap-16 relative z-10 text-left">
          <div className="border-[3px] border-black p-10 h-64 relative rounded-tr-[4rem] group hover:bg-slate-50 transition-colors">
            <span className="absolute -top-4 left-10 bg-white px-5 text-[10px] font-black uppercase italic tracking-[0.3em]">Visa Pilote Processus</span>
            <div className="flex flex-col items-center justify-center h-full gap-5 opacity-40">
              <FileCheck size={48} className={data?.PRV_PiloteSigned ? "text-emerald-500 opacity-100" : "text-slate-200"} />
              <div className="text-center">
                <p className="text-[9px] font-black uppercase text-slate-900 italic leading-none">{data?.PRV_PiloteSigned ? 'SCELLÉ NUMÉRIQUEMENT' : 'EN ATTENTE DE SIGNATURE'}</p>
                <p className="text-[8px] font-black uppercase text-slate-400 mt-2 tracking-widest leading-none italic">ID-TOKEN: QLS-P-0442-X</p>
              </div>
            </div>
          </div>
          <div className="border-[3px] border-black p-10 h-64 relative rounded-tl-[4rem] bg-slate-50/80 group hover:bg-white transition-colors">
            <span className="absolute -top-4 left-10 bg-white px-5 text-[10px] font-black uppercase italic tracking-[0.3em]">Visa Direction SMI</span>
            <div className="flex flex-col items-center justify-center h-full gap-5 opacity-40">
              <ShieldCheck size={48} className={data?.PRV_RQSigned ? "text-blue-600 opacity-100" : "text-slate-200"} />
              <div className="text-center">
                <p className="text-[9px] font-black uppercase text-slate-900 italic leading-none">{data?.PRV_RQSigned ? 'CERTIFIÉ CONFORME' : 'VISA DIRECTION REQUIS'}</p>
                <p className="text-[8px] font-black uppercase text-slate-400 mt-2 tracking-widest leading-none italic">ID-TOKEN: QLS-D-9912-A</p>
              </div>
            </div>
          </div>
        </div>

        {/* PIED DE PAGE RÉGLEMENTAIRE */}
        <footer className="absolute bottom-12 left-[30mm] right-[30mm] border-t-2 border-slate-100 pt-8 flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] italic">
           <span>PROPRIÉTÉ EXCLUSIVE : {data?.PRV_TenantName || "QUALISOFT ELITE SENEGAL"}</span>
           <span>PAGE 01 / 01 - QUALISOFT SMI v2.4</span>
        </footer>
      </div>
    </div>
  );
}