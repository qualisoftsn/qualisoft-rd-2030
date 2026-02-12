/* eslint-disable @typescript-eslint/no-explicit-any */
/* NOM ABSOLU : src/app/dashboard/quality/surveys/page.tsx
  FONCTION : Dashboard de gestion des campagnes d'enquêtes ISO 9001
  CORRECTIF : Échappement des formules LaTeX pour éviter les erreurs de build
*/

'use client';

import { useState } from 'react';
import { 
  Plus, BarChart3, 
  Link, Mail, FileText, Workflow, 
  PenTool, Globe, Server, AlertOctagon, Lightbulb
} from 'lucide-react';
import LinkNext from 'next/link';
import { toast } from 'react-hot-toast';

// Typage pour la rigueur Master
type TargetType = 'CLIENT' | 'SUPPLIER' | 'EMPLOYEE';

export default function SurveyMasterCockpit() {
  const [activeTarget, setActiveTarget] = useState<TargetType>('CLIENT');
  
  // Configuration dynamique des piliers ISO
  const config = {
    CLIENT: { color: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', label: 'Satisfaction Clients', iso: '§9.1.2' },
    SUPPLIER: { color: 'text-blue-500', border: 'border-blue-500/20', bg: 'bg-blue-500/10', label: 'Évaluation Fournisseurs', iso: '§8.4.2' },
    EMPLOYEE: { color: 'text-purple-500', border: 'border-purple-500/20', bg: 'bg-purple-500/10', label: 'Climat Social / RH', iso: '§7.1.2' }
  };

  const copyLink = () => {
     // Simulation de la copie
     navigator.clipboard.writeText("https://qualisoft.sn/public/survey/DEMO-ID");
     toast.success("Lien de diffusion copié dans le presse-papier");
  };

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans selection:bg-blue-600/30">
      
      {/* 🛰️ HEADER SOUVERAIN */}
      <header className="mb-12 border-b border-white/5 pb-10 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">
            Intelligence Écoute Parties Intéressées RD 2026
          </p>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
            Survey <span className={config[activeTarget].color}>Cockpit</span>
          </h1>
        </div>
        
        <LinkNext href="/dashboard/quality/surveys/builder">
          <button className="bg-emerald-600 px-8 py-5 rounded-4xl font-black uppercase text-xs shadow-2xl flex items-center gap-3 hover:bg-emerald-500 transition-all border-none cursor-pointer">
            <Plus size={20} strokeWidth={4} /> Créer une Enquête
          </button>
        </LinkNext>
      </header>

      {/* 🧭 SELECTEUR DE PILIER ISO (TRIDENT) */}
      <div className="flex gap-6 mb-12">
        {(['CLIENT', 'SUPPLIER', 'EMPLOYEE'] as TargetType[]).map((t) => (
          <button 
            key={t}
            onClick={() => setActiveTarget(t)}
            className={`flex-1 p-8 rounded-[3rem] border transition-all duration-500 text-left relative overflow-hidden group ${
              activeTarget === t ? `bg-white/5 ${config[t].border} scale-105 shadow-2xl` : 'bg-slate-900/40 border-white/5 opacity-40 hover:opacity-100'
            }`}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">{config[t].iso}</p>
            <p className={`text-2xl font-black uppercase italic ${activeTarget === t ? config[t].color : 'text-white'}`}>
              {config[t].label}
            </p>
            {activeTarget === t && <div className={`absolute bottom-0 left-0 h-1.5 w-full ${config[t].color.replace('text', 'bg')}`} />}
          </button>
        ))}
      </div>

      {/* 📊 ANALYTICS ET HISTORIQUE */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 mb-12">
        
        {/* LISTE DES CAMPAGNES DYNAMIQUES */}
        <div className="xl:col-span-2 bg-slate-900/40 border border-white/5 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl">
          <h3 className="text-3xl font-black uppercase italic mb-10 flex items-center gap-4 tracking-tighter">
            <BarChart3 className={config[activeTarget].color} size={32} /> Registre des Campagnes
          </h3>
          
          <div className="space-y-6">
            <CampaignItem title={`Audit Annuel ${activeTarget} 2026`} responses={142} status="OUVERTE" color={config[activeTarget].color} onCopy={copyLink} />
            <CampaignItem title={`Enquête Flash Q1 - Performance`} responses={56} status="CLÔTURÉE" color={config[activeTarget].color} onCopy={copyLink} />
          </div>
        </div>

        {/* CALCULATEUR DE SCORE MASTER */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl flex flex-col justify-between relative overflow-hidden">
           <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[80px] opacity-20 ${config[activeTarget].bg.replace('/10', '')}`}></div>
           <div>
              <h3 className="text-xl font-black uppercase italic mb-8 border-b border-white/5 pb-4 tracking-tighter relative z-10">Indice Consolidé</h3>
              <p className={`text-8xl font-black italic ${config[activeTarget].color} leading-none tracking-tighter relative z-10`}>8.7</p>
              <p className="text-[10px] text-slate-500 mt-6 uppercase font-bold tracking-[0.2em] leading-relaxed italic relative z-10">
                Calculé selon la pondération des facteurs critiques de succès (FCS).
              </p>
              
              {/* --- CORRECTION ICI : FORMULE ÉCHAPPÉE --- */}
              <div className="mt-8 p-6 bg-black/40 rounded-3xl border border-white/5 font-mono text-[10px] text-blue-400 relative z-10">
                {"$$CSAT = \\frac{\\sum (Note \\times Poids)}{N}$$"}
              </div>
              {/* ----------------------------------------- */}

           </div>
           <button className="mt-12 w-full py-5 rounded-3xl bg-white/5 border border-white/10 font-black uppercase text-[11px] tracking-widest hover:bg-white/10 transition-all italic relative z-10 cursor-pointer">
              Exporter Preuve d&apos;Audit PDF
           </button>
        </div>
      </div>

      {/* 🧬 WORKFLOW OPÉRATIONNEL VISUEL (NOUVELLE SECTION) */}
      <div className="mt-16 bg-white/2 border border-white/5 rounded-[3rem] p-12 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-slate-700 to-transparent opacity-50"></div>
         
         <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
               <Workflow size={24} />
            </div>
            <div>
               <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Workflow Certifié ISO 9001</h3>
               <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest italic">Cycle de vie de la donnée d&apos;enquête • Ne pas rompre la chaîne</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Ligne de connexion visuelle */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-800 -z-10"></div>

            {/* ÉTAPE 1 : CONCEPTION */}
            <WorkflowStep 
               step="01" 
               title="Conception" 
               icon={<PenTool size={20} />} 
               desc="Définition des critères via le Builder" 
               detail="Lien avec processus interne"
               color="text-blue-400"
            />

            {/* ÉTAPE 2 : DIFFUSION */}
            <WorkflowStep 
               step="02" 
               title="Diffusion" 
               icon={<Globe size={20} />} 
               desc="Génération du lien Public Unique" 
               detail="Accessible sans login"
               color="text-emerald-400"
            />

            {/* ÉTAPE 3 : COLLECTE */}
            <WorkflowStep 
               step="03" 
               title="Collecte Auto" 
               icon={<Server size={20} />} 
               desc="Centralisation via API SurveyManager" 
               detail="Stockage sécurisé JSON"
               color="text-purple-400"
            />

            {/* ÉTAPE 4 : ACTION */}
            <WorkflowStep 
               step="04" 
               title="Amélioration" 
               icon={<AlertOctagon size={20} />} 
               desc="Déclenchement NC si Note < 5" 
               detail="Boucle ISO §10.2"
               color="text-rose-400"
            />
         </div>

         <div className="mt-8 flex items-start gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
            <Lightbulb className="text-amber-500 mt-1 shrink-0" size={18} />
            <p className="text-[11px] text-slate-400 font-bold italic leading-relaxed">
               <span className="text-amber-500 uppercase">Rappel Auditeur :</span> L&apos;enquête ne s&apos;arrête pas à la note. L&apos;analyse des commentaires (Étape 04) est obligatoire pour valider l&apos;exigence d&apos;amélioration continue. Utilisez le <strong>Scanner de Résultats</strong> pour traiter les retours.
            </p>
         </div>
      </div>

    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function WorkflowStep({ step, title, icon, desc, detail, color }: any) {
   return (
      <div className="bg-[#0B0F1A] border border-white/5 p-6 rounded-4xl hover:border-white/10 transition-all group hover:-translate-y-2 duration-500 shadow-xl z-10">
         <div className="flex justify-between items-start mb-4">
            <span className={`text-3xl font-black italic ${color} opacity-30 group-hover:opacity-100 transition-opacity`}>{step}</span>
            <div className={`p-3 rounded-xl bg-white/5 text-white group-hover:scale-110 transition-transform`}>{icon}</div>
         </div>
         <h4 className="text-lg font-black uppercase italic tracking-tight mb-2">{title}</h4>
         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{desc}</p>
         <p className="text-[9px] text-slate-600 italic">{detail}</p>
      </div>
   )
}

function CampaignItem({ title, responses, status, color, onCopy }: any) {
  return (
    <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] flex justify-between items-center group hover:bg-white/10 transition-all shadow-xl">
      <div className="flex items-center gap-8">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-black/40 shadow-inner ${color}`}>
          <FileText size={28} />
        </div>
        <div>
          <p className="font-black text-2xl uppercase italic tracking-tighter leading-none text-white">{title}</p>
          <div className="flex items-center gap-4 mt-3">
             <span className="text-[11px] font-black text-emerald-500 uppercase italic tracking-widest">{responses} Feedbacks reçus</span>
             <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
             <span className="text-[11px] font-black text-slate-500 uppercase italic tracking-widest">{status}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <button onClick={onCopy} className="p-5 bg-slate-800 rounded-2xl hover:bg-blue-600 transition-all border-none text-white cursor-pointer shadow-lg group-hover:scale-105" title="Copier le Lien Public">
          <Link size={20} />
        </button>
        <button className="p-5 bg-slate-800 rounded-2xl hover:bg-emerald-600 transition-all border-none text-white cursor-pointer shadow-lg group-hover:scale-105" title="Envoyer par Email">
          <Mail size={20} />
        </button>
        <LinkNext href="/dashboard/quality/surveys/scanner">
          <button className="px-10 py-5 bg-white/10 rounded-2xl font-black text-[11px] uppercase border border-white/10 hover:bg-white hover:text-black transition-all italic tracking-widest cursor-pointer shadow-lg">
            Analyse Scanner
          </button>
        </LinkNext>
      </div>
    </div>
  );
}