/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, use } from 'react';
import apiClient from '@/core/api/api-client';
import { Printer, ArrowLeft, FileCheck, ShieldCheck, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RapportRevueFinalPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // BLINDAGE NEXT.JS 16 : Récupération asynchrone sécurisée de l'ID pour Turbopack
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
        console.error("Erreur lors de la génération du rapport:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchReportData();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-100 text-slate-500 italic font-medium animate-pulse">
      Génération du procès-verbal officiel en cours...
    </div>
  );

  if (!data) return <div className="p-10 text-center">Erreur : Document introuvable.</div>;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-slate-200 min-h-screen print:bg-white font-serif">
      
      {/* BARRE DE CONTRÔLE INTERACTIVE (Invisible à l'impression) */}
      <nav className="print:hidden sticky top-0 z-50 bg-[#0B0F1A] text-white p-4 flex justify-between items-center shadow-2xl">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-blue-500 transition-all ml-4"
        >
          <ArrowLeft size={14}/> Retour à la séance
        </button>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-6">
            <span className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em]">Statut Documentaire</span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest italic">Approuvé & Certifié</span>
          </div>
          <button 
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-3 transition-all shadow-lg mr-4"
          >
            <Printer size={18}/> Imprimer / Enregistrer PDF
          </button>
        </div>
      </nav>

      {/* FEUILLE A4 - RÉGLEMENTAIRE (WYSIWYG) */}
      <div className="mx-auto my-10 print:my-0 bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] print:shadow-none w-full max-w-[210mm] min-h-[297mm] p-[20mm] text-black relative border border-slate-300 print:border-none">
        
        {/* ENTÊTE SYSTÉMIQUE DYNAMIQUE */}
        <header className="border-[1.5pt] border-black flex mb-12">
          <div className="w-1/4 border-r-[1.5pt] border-black p-6 flex flex-col items-center justify-center bg-slate-50">
             <div className="font-black text-2xl tracking-tighter uppercase italic leading-none text-slate-900">Qualisoft</div>
             <div className="text-[7px] font-bold uppercase tracking-[0.3em] mt-2 text-slate-500 text-center leading-tight">SMI Digital Edition<br/>Governance & Compliance</div>
          </div>
          <div className="w-2/4 p-6 flex flex-col items-center justify-center text-center italic border-r-[1.5pt] border-black">
             <h1 className="font-black text-base uppercase leading-tight">Procès-Verbal de Revue de Processus</h1>
             <p className="text-[9px] font-bold uppercase tracking-widest mt-2 text-slate-600">Périodicité : Mensuelle</p>
          </div>
          <div className="w-1/4 p-5 text-[9px] font-bold uppercase space-y-2 flex flex-col justify-center">
             <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-400">Réf :</span> 
                <span className="text-blue-700 font-black">{data.PRV_DocRef || "F-QLT-011"}</span>
             </div>
             <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-400">Version :</span> <span>02</span>
             </div>
             <div className="flex justify-between">
                <span className="text-slate-400">Date :</span> <span>{new Date().toLocaleDateString('fr-FR')}</span>
             </div>
          </div>
        </header>

        {/* BLOC D'IDENTIFICATION DU PROCESSUS */}
        <div className="grid grid-cols-2 border-[1.5pt] border-black mb-12 bg-slate-50/30">
          <div className="p-5 border-r-[1.5pt] border-b-[1.5pt] border-black">
            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1 tracking-widest">Processus audité</label>
            <span className="font-black uppercase text-sm italic text-slate-900">{data.PRV_Processus?.PR_Libelle}</span>
          </div>
          <div className="p-5 border-b-[1.5pt] border-black">
            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1 tracking-widest">Période d&apos;analyse</label>
            <span className="font-black text-sm italic text-slate-900">{data.PRV_Month} / {data.PRV_Year}</span>
          </div>
          <div className="p-5 border-r-[1.5pt] border-black">
            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1 tracking-widest">Pilote titulaire</label>
            <span className="font-bold text-sm italic text-slate-900">{data.PRV_Processus?.PR_PiloteName || 'Abdoulaye THIONGANE'}</span>
          </div>
          <div className="p-5">
            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1 tracking-widest">Niveau de Confidentialité</label>
            <span className="font-black text-[10px] uppercase flex items-center gap-2 italic">
              <ShieldCheck size={14} className="text-blue-600"/> Interne / Diffusion Restreinte
            </span>
          </div>
        </div>

        {/* CONTENU TECHNIQUE DU PV */}
        <div className="space-y-12">
          <section>
            <h3 className="bg-slate-100 border-l-[3pt] border-black p-2.5 text-[10px] font-black uppercase mb-5 italic flex justify-between items-center">
              <span>I. Analyse de la Performance & Indicateurs</span>
              <Award size={14} className="opacity-30" />
            </h3>
            <div className="text-[11px] whitespace-pre-wrap leading-relaxed pl-6 border-l border-slate-200 text-slate-800 italic">
              {data.PRV_PerformanceAnalysis}
            </div>
          </section>

          <section>
            <h3 className="bg-slate-100 border-l-[3pt] border-black p-2.5 text-[10px] font-black uppercase mb-5 italic">
              II. Synthèse des Audits & Non-Conformités
            </h3>
            <div className="text-[11px] whitespace-pre-wrap leading-relaxed pl-6 border-l border-slate-200 text-slate-800 italic">
              {data.PRV_AuditAnalysis}
            </div>
          </section>

          <section className="bg-slate-50 p-8 border-[1.5pt] border-black rounded-br-[4rem] relative">
            <h3 className="text-[11px] font-black uppercase mb-6 italic underline underline-offset-8 decoration-blue-600">
              III. Décisions de séance & Actions Correctives (PAQ)
            </h3>
            <div className="text-[13px] font-black whitespace-pre-wrap leading-relaxed italic text-blue-900">
              {data.PRV_Decisions || "Aucune décision majeure à consigner pour cette période d'analyse."}
            </div>
          </section>
        </div>

        {/* ESPACE DE VALIDATION ET VISAS ISO */}
        <div className="mt-24 grid grid-cols-2 gap-10">
          <div className="border-[1.5pt] border-black p-6 h-48 relative rounded-tr-[2.5rem]">
            <span className="absolute -top-3 left-6 bg-white px-3 text-[9px] font-black uppercase italic tracking-widest">Visa Pilote de Processus</span>
            {data.PRV_PiloteSigned ? (
              <div className="flex flex-col items-center justify-center h-full space-y-2">
                <FileCheck size={36} className="text-emerald-600" />
                <span className="text-[9px] font-black uppercase text-emerald-600">Signé Électroniquement</span>
                <span className="text-[7px] text-slate-400 font-bold uppercase tracking-tight italic">
                  Le {formatDate(data.PRV_UpdatedAt)}
                </span>
              </div>
            ) : <span className="text-slate-200 text-[10px] font-black italic flex items-center justify-center h-full">Signature en attente</span>}
          </div>

          <div className="border-[1.5pt] border-black p-6 h-48 relative rounded-tl-[2.5rem]">
            <span className="absolute -top-3 left-6 bg-white px-3 text-[9px] font-black uppercase italic tracking-widest">Visa Direction / RQ</span>
            {data.PRV_RQSigned ? (
              <div className="flex flex-col items-center justify-center h-full space-y-2">
                <FileCheck size={36} className="text-blue-700" />
                <span className="text-[9px] font-black uppercase text-blue-700">Approbation Qualité Confirmée</span>
                <span className="text-[7px] text-slate-400 font-bold uppercase tracking-tight italic">
                  Certifié conforme au SMI le {formatDate(new Date().toISOString())}
                </span>
              </div>
            ) : <span className="text-slate-200 text-[10px] font-black italic flex items-center justify-center h-full">Signature en attente</span>}
          </div>
        </div>

        {/* PIED DE PAGE RÉGLEMENTAIRE */}
        <footer className="absolute bottom-10 left-[20mm] right-[20mm] border-t-[1pt] border-slate-200 pt-4 flex justify-between items-center text-[7px] font-bold text-slate-400 uppercase tracking-[0.3em]">
           <span>Qualisoft SMI - Gouvernance Digitale</span>
           <span className="italic opacity-50">Copie contrôlée - Ne pas reproduire sans autorisation</span>
           <span>Réf : {data.PRV_DocRef || "F-QLT-011"}</span>
        </footer>
      </div>

      <div className="h-10 print:hidden"></div>
    </div>
  );
}