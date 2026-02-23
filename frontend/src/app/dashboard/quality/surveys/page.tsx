/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 NOM ABSOLU : src/app/dashboard/quality/surveys/page.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Dashboard souverain pour le pilotage des enquêtes ISO 9001.
 * ARCHITECTURE : Zéro simulation, données issues de l'API SDE. Multi-tenant.
 * DESIGN : Full-Space Matrix, typographie massive, indicateurs dynamiques.
 * -------------------------------------------------------------------------
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  Plus, BarChart3, Link as LinkIcon, Mail, FileText, Workflow, 
  PenTool, Globe, Server, AlertOctagon, Lightbulb, Activity, Target,
  Loader2
} from 'lucide-react';
import LinkNext from 'next/link';
import { toast, Toaster } from 'sonner';
import apiClient from '@/core/api/api-client';

// --- 🏗️ TYPES STRICTS SDE ---
type TargetType = 'CLIENT' | 'SUPPLIER' | 'EMPLOYEE';

interface Campaign {
  CMP_Id: string;
  CMP_Title: string;
  CMP_Target: TargetType;
  CMP_Responses: number;
  CMP_Status: 'OUVERTE' | 'CLOTUREE' | 'BROUILLON';
}

interface SurveyStats {
  csat: number;
  totalResponses: number;
}

export default function SurveyMasterCockpit() {
  const [activeTarget, setActiveTarget] = useState<TargetType>('CLIENT');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<SurveyStats>({ csat: 0, totalResponses: 0 });
  const [loading, setLoading] = useState(true);
  
  // Matrice de configuration des piliers ISO (§9.1.2, §8.4.2, §7.1.2)
  const config = {
    CLIENT: { color: 'text-emerald-500', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', label: 'Satisfaction Clients', iso: '§9.1.2' },
    SUPPLIER: { color: 'text-blue-500', border: 'border-blue-500/30', bg: 'bg-blue-500/10', label: 'Évaluation Fournisseurs', iso: '§8.4.2' },
    EMPLOYEE: { color: 'text-purple-500', border: 'border-purple-500/30', bg: 'bg-purple-500/10', label: 'Climat Social / RH', iso: '§7.1.2' }
  };

  /**
   * 📡 SYNCHRONISATION DU NOYAU SDE
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [campRes, statsRes] = await Promise.all([
        apiClient.get(`/surveys/campaigns?target=${activeTarget}`),
        apiClient.get(`/surveys/stats?target=${activeTarget}`).catch(() => ({ data: { csat: 0, totalResponses: 0 } }))
      ]);
      
      const campData = campRes.data?.data || campRes.data;
      const statData = statsRes.data?.data || statsRes.data;

      setCampaigns(Array.isArray(campData) ? campData : []);
      setStats({
        csat: statData?.csat || 0,
        totalResponses: statData?.totalResponses || 0
      });
    } catch (error) {
      toast.error("RUPTURE DE FLUX : IMPOSSIBLE DE CHARGER LES CAMPAGNES.");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [activeTarget]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  /**
   * 🔗 ACTION : COPIER LE LIEN DE DIFFUSION
   */
  const copyLink = useCallback((id: string) => {
      navigator.clipboard.writeText(`https://qualisoft.sn/public/survey/${id}`);
      toast.success("LIEN DE DIFFUSION SCELLÉ DANS LE PRESSE-PAPIER.");
  }, []);

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-16 ml-72 text-white font-sans italic text-left selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      <div className="w-full max-w-500 mx-auto space-y-20 animate-in fade-in duration-1000">

        {/* 🛰️ HEADER SOUVERAIN */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b-4 border-white/5 pb-16">
          <div className="space-y-8">
            <div className="flex items-center gap-6">
               <span className="px-6 py-2 rounded-2xl bg-blue-600/10 border-2 border-blue-600/20 text-blue-500 text-[12px] font-black uppercase tracking-[0.5em] flex items-center gap-4 italic shadow-inner">
                  <Activity size={18} className="animate-pulse" /> ISO 9001 Compliance
               </span>
            </div>
            <h1 className="text-8xl font-black uppercase tracking-tighter leading-none text-white flex items-center gap-8">
               Survey <span className={config[activeTarget].color}>Cockpit</span>
            </h1>
            <p className="text-slate-500 font-black text-[14px] uppercase tracking-[0.8em] italic opacity-60">
              INTELLIGENCE ÉCOUTE PARTIES INTÉRESSÉES SDE
            </p>
          </div>
          
          <LinkNext href="/dashboard/quality/surveys/builder">
            <button className="bg-emerald-600 px-12 py-8 rounded-[3rem] font-black uppercase text-[13px] tracking-[0.4em] shadow-[0_30px_80px_rgba(16,185,129,0.4)] flex items-center gap-5 hover:bg-white hover:text-emerald-600 transition-all border-none cursor-pointer active:scale-95 group italic text-white">
              <Plus size={28} strokeWidth={4} className="group-hover:rotate-90 transition-transform" /> Initialiser une Campagne
            </button>
          </LinkNext>
        </header>

        {/* 🧭 SÉLECTEUR DE PILIER ISO (TRIDENT DE PERFORMANCE) */}
        <div className="flex flex-col md:flex-row gap-8">
          {(['CLIENT', 'SUPPLIER', 'EMPLOYEE'] as TargetType[]).map((t) => (
            <button 
              key={t}
              onClick={() => setActiveTarget(t)}
              className={`flex-1 p-12 rounded-[4rem] border-4 transition-all duration-700 text-left relative overflow-hidden group cursor-pointer ${
                activeTarget === t 
                  ? `bg-[#151A2D] ${config[t].border} scale-[1.02] shadow-4xl backdrop-blur-3xl` 
                  : 'bg-black/40 border-white/5 opacity-50 hover:opacity-100 hover:bg-white/5'
              }`}
            >
              <div className="flex justify-between items-start mb-6 relative z-10">
                 <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-500 italic leading-none">{config[t].iso}</p>
                 <Target size={28} className={activeTarget === t ? config[t].color : 'text-slate-600'} />
              </div>
              <p className={`text-4xl font-black uppercase italic tracking-tighter leading-none ${activeTarget === t ? config[t].color : 'text-white'}`}>
                {config[t].label}
              </p>
              {activeTarget === t && <div className={`absolute bottom-0 left-0 h-3 w-full animate-pulse ${config[t].color.replace('text', 'bg')}`} />}
            </button>
          ))}
        </div>

        {/* 📊 ANALYTICS ET REGISTRE DES FLUX */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
          
          {/* LISTE DES CAMPAGNES FILTRÉES */}
          <div className="xl:col-span-2 bg-[#151A2D] border-4 border-white/5 rounded-[5rem] p-16 backdrop-blur-3xl shadow-4xl min-h-125">
            <h3 className="text-4xl font-black uppercase italic mb-16 flex items-center gap-6 tracking-tighter text-white border-b-4 border-white/5 pb-8">
              <BarChart3 className={config[activeTarget].color} size={48} /> Registre des Campagnes SDE
            </h3>
            
            {loading ? (
               <div className="flex flex-col items-center justify-center gap-8 py-20">
                  <Loader2 className={`animate-spin ${config[activeTarget].color}`} size={80} strokeWidth={1} />
                  <span className="text-slate-500 font-black uppercase tracking-[0.5em] italic">Synchronisation...</span>
               </div>
            ) : (
               <div className="space-y-8">
                 {campaigns.length > 0 ? campaigns.map(camp => (
                    <CampaignItem 
                      key={camp.CMP_Id} 
                      title={camp.CMP_Title} 
                      responses={camp.CMP_Responses} 
                      status={camp.CMP_Status} 
                      color={config[activeTarget].color} 
                      onCopy={() => copyLink(camp.CMP_Id)} 
                    />
                 )) : (
                    <div className="p-20 text-center border-4 border-dashed border-white/5 rounded-[4rem] opacity-30">
                       <p className="text-[14px] font-black uppercase tracking-[0.5em] italic text-slate-500">Aucune campagne indexée pour ce pilier.</p>
                    </div>
                 )}
               </div>
            )}
          </div>

          {/* CALCULATEUR D'INDICE CONSOLIDÉ (FORMULE MASTER) */}
          <div className="bg-[#151A2D] border-4 border-white/5 rounded-[5rem] p-16 backdrop-blur-3xl shadow-4xl flex flex-col justify-between relative overflow-hidden">
             <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[120px] opacity-20 ${config[activeTarget].bg.replace('/10', '')}`}></div>
             <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase italic mb-12 border-b-4 border-white/5 pb-8 tracking-[0.4em] text-slate-400 leading-none">Indice Consolidé SDE</h3>
                <div className="flex items-baseline gap-4">
                  <p className={`text-[12rem] font-black italic ${config[activeTarget].color} leading-none tracking-tighter`}>
                     {stats.csat.toFixed(1)}
                  </p>
                  <span className="text-4xl font-black text-slate-600 italic">/10</span>
                </div>
                <p className="text-[12px] text-slate-500 mt-12 uppercase font-black tracking-[0.4em] leading-relaxed italic">
                  Calcul automatisé selon la pondération des facteurs critiques de succès (FCS) Qualisoft. Basé sur {stats.totalResponses} retours.
                </p>
                
                {/* RENDU DE LA FORMULE MATHÉMATIQUE ISO EN LATEX */}
                <div className="mt-12 p-10 bg-black/60 rounded-[3rem] border-2 border-white/5 font-mono text-xl text-blue-400 shadow-inner flex justify-center items-center">
                  {"$$CSAT = \\frac{\\sum (Note \\times Poids)}{N}$$"}
                </div>
             </div>
             <button className="mt-16 w-full py-10 rounded-[3.5rem] bg-white/5 border-2 border-white/10 font-black uppercase text-[13px] tracking-[0.5em] hover:bg-white hover:text-black transition-all italic relative z-10 cursor-pointer shadow-2xl active:scale-95 text-white">
                Exporter Preuve d&apos;Audit PDF
             </button>
          </div>
        </div>

        {/* 🧬 VISUALISATION DU WORKFLOW CERTIFIÉ ISO 9001 */}
        <div className="bg-[#151A2D] border-4 border-white/5 rounded-[5rem] p-20 relative overflow-hidden shadow-4xl backdrop-blur-3xl">
           <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-transparent via-slate-700 to-transparent opacity-20"></div>
           
           <div className="flex items-center gap-8 mb-20">
              <div className="p-8 bg-amber-500/10 rounded-[2.5rem] border-2 border-amber-500/20 text-amber-500 shadow-inner">
                  <Workflow size={48} />
              </div>
              <div className="text-left">
                  <h3 className="text-5xl font-black uppercase italic tracking-tighter text-white leading-none mb-4">Chaine de Valeur Écoute</h3>
                  <p className="text-[12px] text-slate-500 uppercase font-black tracking-[0.6em] italic opacity-80">Cycle de vie de la donnée certifiée • ISO 9001 §9</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
              <div className="hidden md:block absolute top-20 left-0 w-full h-1 bg-slate-800 -z-10 opacity-40"></div>
              <WorkflowStep step="01" title="Conception" icon={<PenTool size={32} />} desc="Builder §8.2" detail="Lien processus interne" color="text-blue-500" />
              <WorkflowStep step="02" title="Diffusion" icon={<Globe size={32} />} desc="Lien Souverain" detail="Collecte omnicanale" color="text-emerald-500" />
              <WorkflowStep step="03" title="Agrégation" icon={<Server size={32} />} desc="API SDE Sync" detail="Chiffrement JSON" color="text-purple-500" />
              <WorkflowStep step="04" title="Traitement" icon={<AlertOctagon size={32} />} desc="Génération NC §10.2" detail="Boucle PDCA Active" color="text-rose-500" />
           </div>

           <div className="mt-20 flex items-start gap-8 p-12 bg-amber-500/5 border-2 border-amber-500/20 rounded-[3.5rem] shadow-inner">
              <Lightbulb className="text-amber-500 mt-2 shrink-0 animate-pulse" size={40} />
              <p className="text-[14px] text-slate-400 font-bold italic leading-relaxed text-left uppercase tracking-[0.2em]">
                  <span className="text-amber-500 font-black tracking-[0.4em]">PROTOCOLE D&apos;AUDIT SDE :</span> L&apos;enquête ne constitue qu&apos;un intrant. La preuve de l&apos;amélioration continue réside dans le traitement systématique des scores critiques (&lt; 5/10) via l&apos;ouverture automatique d&apos;une <strong>Fiche de Non-Conformité</strong> dans le module Scanner.
              </p>
           </div>
        </div>
      </div>
      
      <style jsx global>{`
        ::-webkit-scrollbar { width: 0px; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>
    </div>
  );
}

/** 🛠️ COMPOSANTS ATOMIQUES DU DASHBOARD */

function WorkflowStep({ step, title, icon, desc, detail, color }: any) {
   return (
      <div className="bg-black/60 border-4 border-white/5 p-12 rounded-[4rem] hover:border-white/10 transition-all group hover:-translate-y-4 duration-500 shadow-2xl z-10 text-left backdrop-blur-md">
         <div className="flex justify-between items-start mb-10">
            <span className={`text-6xl font-black italic ${color} opacity-20 group-hover:opacity-100 transition-opacity leading-none tracking-tighter`}>{step}</span>
            <div className="p-6 rounded-4xl bg-white/5 text-white group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all shadow-xl border-2 border-white/5">{icon}</div>
         </div>
         <h4 className="text-3xl font-black uppercase italic tracking-tighter mb-6 text-white leading-none">{title}</h4>
         <p className="text-[12px] text-slate-400 font-black uppercase tracking-[0.4em] mb-4 leading-none">{desc}</p>
         <p className="text-[10px] text-slate-600 font-bold italic uppercase tracking-widest">{detail}</p>
      </div>
   )
}

function CampaignItem({ title, responses, status, color, onCopy }: any) {
  return (
    <div className="bg-black/40 border-4 border-white/5 p-10 rounded-[4rem] flex justify-between items-center group hover:bg-white/5 transition-all shadow-2xl relative overflow-hidden backdrop-blur-md">
      <div className="flex items-center gap-12 relative z-10">
        <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center bg-[#0B0F1A] shadow-inner border-2 border-white/5 ${color} transition-transform group-hover:rotate-12`}>
          <FileText size={48} />
        </div>
        <div className="text-left">
          <p className="font-black text-4xl uppercase italic tracking-tighter leading-none text-white mb-6 group-hover:text-blue-400 transition-colors">{title}</p>
          <div className="flex items-center gap-6">
             <span className="text-[12px] font-black text-emerald-500 uppercase italic tracking-[0.4em] bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">{responses} Feedbacks Capturés</span>
             <span className={`text-[12px] font-black uppercase italic tracking-[0.4em] px-4 py-2 rounded-xl border ${status === 'OUVERTE' ? 'bg-blue-600/10 text-blue-400 border-blue-600/20' : 'bg-slate-800 text-slate-400 border-white/10'}`}>{status}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-6 relative z-10">
        <button onClick={onCopy} className="p-8 bg-white/5 rounded-[2.5rem] hover:bg-blue-600 transition-all border-2 border-white/5 text-slate-400 hover:text-white cursor-pointer shadow-xl active:scale-90" title="Copier le Lien Public">
          <LinkIcon size={32} />
        </button>
        <button className="p-8 bg-white/5 rounded-[2.5rem] hover:bg-emerald-600 transition-all border-2 border-white/5 text-slate-400 hover:text-white cursor-pointer shadow-xl active:scale-90" title="Envoyer par Email">
          <Mail size={32} />
        </button>
        <LinkNext href="/dashboard/quality/surveys/scanner">
          <button className="px-12 py-8 bg-blue-600 rounded-[3rem] font-black text-[12px] uppercase border-none hover:bg-white hover:text-blue-600 transition-all italic tracking-[0.5em] cursor-pointer shadow-[0_20px_50px_rgba(37,99,235,0.3)] text-white">
            Scanner Analyse
          </button>
        </LinkNext>
      </div>
    </div>
  );
}