/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * NOM ABSOLU : src/app/dashboard/quality/surveys/page.tsx
 * FONCTION : Dashboard souverain pour le pilotage des enquêtes ISO 9001.
 * DESCRIPTION : Agrège les campagnes par piliers normatifs et calcule les indices de performance.
 */

'use client';

import { useState, useCallback } from 'react';
import { 
  Plus, BarChart3, 
  Link, Mail, FileText, Workflow, 
  PenTool, Globe, Server, AlertOctagon, Lightbulb
} from 'lucide-react';
import LinkNext from 'next/link';
import { toast } from 'react-hot-toast';

// Définition des cibles stratégiques pour le filtrage du SMI
type TargetType = 'CLIENT' | 'SUPPLIER' | 'EMPLOYEE';

export default function SurveyMasterCockpit() {
  // État pivot : Détermine quel pilier ISO est actuellement sous surveillance
  const [activeTarget, setActiveTarget] = useState<TargetType>('CLIENT');
  
  // Matrice de configuration des piliers ISO (§9.1.2, §8.4.2, §7.1.2)
  const config = {
    CLIENT: { color: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', label: 'Satisfaction Clients', iso: '§9.1.2' },
    SUPPLIER: { color: 'text-blue-500', border: 'border-blue-500/20', bg: 'bg-blue-500/10', label: 'Évaluation Fournisseurs', iso: '§8.4.2' },
    EMPLOYEE: { color: 'text-purple-500', border: 'border-purple-500/20', bg: 'bg-purple-500/10', label: 'Climat Social / RH', iso: '§7.1.2' }
  };

  /**
   * 🔗 ACTION : COPIER LE LIEN DE DIFFUSION
   * Permet la distribution rapide du point d'entrée public de l'enquête.
   */
  const copyLink = useCallback(() => {
      navigator.clipboard.writeText("https://qualisoft.sn/public/survey/DEMO-ID-2026");
      toast.success("Lien de diffusion scellé et copié");
  }, []);

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans selection:bg-blue-600/30">
      
      {/* 🛰️ HEADER SOUVERAIN */}
      <header className="mb-12 border-b border-white/5 pb-10 flex justify-between items-end animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
            Intelligence Écoute Parties Intéressées RD 2026
          </p>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
            Survey <span className={config[activeTarget].color}>Cockpit</span>
          </h1>
        </div>
        
        <LinkNext href="/dashboard/quality/surveys/builder">
          <button className="bg-emerald-600 px-10 py-6 rounded-4xl font-black uppercase text-xs shadow-[0_20px_50px_rgba(16,185,129,0.2)] flex items-center gap-3 hover:bg-emerald-500 transition-all border-none cursor-pointer active:scale-95">
            <Plus size={20} strokeWidth={4} /> Initialiser une Campagne
          </button>
        </LinkNext>
      </header>

      {/* 🧭 SÉLECTEUR DE PILIER ISO (TRIDENT DE PERFORMANCE) */}
      <div className="flex gap-6 mb-16">
        {(['CLIENT', 'SUPPLIER', 'EMPLOYEE'] as TargetType[]).map((t) => (
          <button 
            key={t}
            onClick={() => setActiveTarget(t)}
            className={`flex-1 p-10 rounded-[3.5rem] border transition-all duration-500 text-left relative overflow-hidden group ${
              activeTarget === t ? `bg-white/5 ${config[t].border} scale-[1.02] shadow-2xl` : 'bg-slate-900/40 border-white/5 opacity-40 hover:opacity-100'
            }`}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-3 italic">{config[t].iso}</p>
            <p className={`text-2xl font-black uppercase italic tracking-tighter ${activeTarget === t ? config[t].color : 'text-white'}`}>
              {config[t].label}
            </p>
            {activeTarget === t && <div className={`absolute bottom-0 left-0 h-2 w-full animate-pulse ${config[t].color.replace('text', 'bg')}`} />}
          </button>
        ))}
      </div>

      {/* 📊 ANALYTICS ET REGISTRE DES FLUX */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 mb-16">
        
        {/* LISTE DES CAMPAGNES FILTRÉES */}
        <div className="xl:col-span-2 bg-slate-900/40 border border-white/5 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl">
          <h3 className="text-3xl font-black uppercase italic mb-12 flex items-center gap-5 tracking-tighter">
            <BarChart3 className={config[activeTarget].color} size={36} /> Registre des Campagnes
          </h3>
          
          <div className="space-y-8">
            <CampaignItem title={`Audit Annuel ${activeTarget} 2026`} responses={142} status="OUVERTE" color={config[activeTarget].color} onCopy={copyLink} />
            <CampaignItem title={`Enquête Flash Q1 - Performance`} responses={56} status="CLÔTURÉE" color={config[activeTarget].color} onCopy={copyLink} />
          </div>
        </div>

        {/* CALCULATEUR D'INDICE CONSOLIDÉ (FORMULE MASTER) */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl flex flex-col justify-between relative overflow-hidden">
           <div className={`absolute -right-16 -top-16 w-56 h-56 rounded-full blur-[100px] opacity-20 ${config[activeTarget].bg.replace('/10', '')}`}></div>
           <div className="relative z-10">
              <h3 className="text-xl font-black uppercase italic mb-10 border-b border-white/5 pb-6 tracking-widest text-slate-400">Indice de Performance</h3>
              <div className="flex items-baseline gap-2">
                <p className={`text-[10rem] font-black italic ${config[activeTarget].color} leading-none tracking-tighter`}>8.7</p>
                <span className="text-2xl font-black text-slate-700">/10</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-10 uppercase font-black tracking-[0.3em] leading-relaxed italic">
                Calcul automatisé selon la pondération des facteurs critiques de succès (FCS) Qualisoft.
              </p>
              
              {/* RENDU DE LA FORMULE MATHÉMATIQUE ISO */}
              <div className="mt-10 p-8 bg-black/60 rounded-4xl border border-white/5 font-mono text-xs text-blue-400 shadow-inner">
                {'$$CSAT = \\frac{\\sum (Note \\times Poids)}{N}$$'}
              </div>
           </div>
           <button className="mt-12 w-full py-6 rounded-4xl bg-white/5 border border-white/10 font-black uppercase text-[11px] tracking-[0.3em] hover:bg-white hover:text-black transition-all italic relative z-10 cursor-pointer shadow-xl">
              Exporter Preuve d&apos;Audit PDF
           </button>
        </div>
      </div>

      {/* 🧬 VISUALISATION DU WORKFLOW CERTIFIÉ ISO 9001 */}
      <div className="bg-white/2 border border-white/5 rounded-[4rem] p-16 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-slate-700 to-transparent opacity-30"></div>
         
         <div className="flex items-center gap-6 mb-12">
            <div className="p-5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500 shadow-lg">
                <Workflow size={32} />
            </div>
            <div className="text-left">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Chaine de Valeur Écoute Client</h3>
                <p className="text-[11px] text-slate-500 uppercase font-black tracking-[0.5em] italic mt-2 opacity-60">Cycle de vie de la donnée certifiée • ISO 9001 §9</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative">
            <div className="hidden md:block absolute top-16 left-0 w-full h-0.5 bg-slate-800 -z-10 opacity-30"></div>

            <WorkflowStep step="01" title="Conception" icon={<PenTool size={24} />} desc="Builder de critères §8.2" detail="Lien processus interne" color="text-blue-400" />
            <WorkflowStep step="02" title="Diffusion" icon={<Globe size={24} />} desc="Lien Public Souverain" detail="Collecte omnicanale" color="text-emerald-400" />
            <WorkflowStep step="03" title="Agrégation" icon={<Server size={24} />} desc="Sync API SurveyManager" detail="Chiffrement JSON" color="text-purple-400" />
            <WorkflowStep step="04" title="Traitement" icon={<AlertOctagon size={24} />} desc="Génération NC §10.2" detail="Boucle PDCA Active" color="text-rose-400" />
         </div>

         <div className="mt-12 flex items-start gap-6 p-8 bg-amber-500/5 border border-amber-500/10 rounded-[2.5rem] shadow-inner">
            <Lightbulb className="text-amber-500 mt-1 shrink-0 animate-pulse" size={24} />
            <p className="text-xs text-slate-400 font-bold italic leading-relaxed text-left uppercase tracking-tighter">
                <span className="text-amber-500 font-black">PROTOCOLE D&apos;AUDIT :</span> L&apos;enquête ne constitue qu&apos;un intrant. La preuve de l&apos;amélioration continue (Étape 04) réside dans le traitement systématique des scores critiques (&lt; 5/10) via l&apos;ouverture automatique d&apos;une <strong>Fiche de Non-Conformité</strong> dans le module Qualité.
            </p>
         </div>
      </div>
    </div>
  );
}

/** 🛠️ COMPOSANTS ATOMIQUES DU DASHBOARD */

function WorkflowStep({ step, title, icon, desc, detail, color }: any) {
   return (
      <div className="bg-[#0B0F1A] border border-white/5 p-10 rounded-[3rem] hover:border-white/10 transition-all group hover:-translate-y-3 duration-500 shadow-2xl z-10 text-left">
         <div className="flex justify-between items-start mb-6">
            <span className={`text-4xl font-black italic ${color} opacity-20 group-hover:opacity-100 transition-opacity leading-none tracking-tighter`}>{step}</span>
            <div className="p-4 rounded-2xl bg-white/5 text-white group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all shadow-lg">{icon}</div>
         </div>
         <h4 className="text-xl font-black uppercase italic tracking-tighter mb-4">{title}</h4>
         <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2 leading-tight">{desc}</p>
         <p className="text-[9px] text-slate-600 font-bold italic uppercase">{detail}</p>
      </div>
   )
}

function CampaignItem({ title, responses, status, color, onCopy }: any) {
  return (
    <div className="bg-white/2 border border-white/5 p-10 rounded-[3rem] flex justify-between items-center group hover:bg-white/5 transition-all shadow-xl relative overflow-hidden">
      <div className="flex items-center gap-10 relative z-10">
        <div className={`w-20 h-20 rounded-4xl flex items-center justify-center bg-black/40 shadow-inner border border-white/5 ${color} transition-transform group-hover:rotate-6`}>
          <FileText size={36} />
        </div>
        <div className="text-left">
          <p className="font-black text-3xl uppercase italic tracking-tighter leading-none text-white mb-4 group-hover:text-blue-400 transition-colors">{title}</p>
          <div className="flex items-center gap-6">
             <span className="text-[12px] font-black text-emerald-500 uppercase italic tracking-[0.2em]">{responses} Feedbacks Capturés</span>
             <span className="w-2 h-2 rounded-full bg-slate-800" />
             <span className={`text-[12px] font-black uppercase italic tracking-[0.2em] ${status === 'OUVERTE' ? 'text-blue-400' : 'text-slate-500'}`}>{status}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-4 relative z-10">
        <button onClick={onCopy} className="p-6 bg-slate-900 rounded-3xl hover:bg-blue-600 transition-all border-none text-white cursor-pointer shadow-2xl active:scale-90" title="Copier le Lien Public">
          <Link size={24} />
        </button>
        <button className="p-6 bg-slate-900 rounded-3xl hover:bg-emerald-600 transition-all border-none text-white cursor-pointer shadow-2xl active:scale-90" title="Envoyer par Email">
          <Mail size={24} />
        </button>
        <LinkNext href="/dashboard/quality/surveys/scanner">
          <button className="px-12 py-6 bg-white/5 rounded-3xl font-black text-[11px] uppercase border border-white/10 hover:bg-white hover:text-black transition-all italic tracking-[0.3em] cursor-pointer shadow-2xl">
            Scanner Analyse
          </button>
        </LinkNext>
      </div>
    </div>
  );
}