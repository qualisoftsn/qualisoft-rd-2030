/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛡️ NOM ABSOLU : src/app/dashboard/tb-certif/page.tsx
 * FONCTION : Dashboard de Pilotage de la Certification et Conformité SMI.
 * RÔLE : Monitoring §9.1 (Surveillance) et §10.2 (Amélioration continue).
 * RÉFÉRENTIELS : ISO 9001, ISO 14001, Législation Environnementale Sénégal.
 */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldCheck, TrendingUp, Target, AlertTriangle, 
  CheckCircle, Clock, FileText, Users, 
  BarChart3, PieChart, Calendar, Download,
  Leaf, Zap, Droplets, Flame, Recycle,
  ChevronRight, ChevronDown, Plus, Search, Activity, Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CertificationDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [certificationData, setCertificationData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'QUALITY' | 'ENVIRONMENT' | 'GLOBAL'>('GLOBAL');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  /**
   * 📡 SYNCHRONISATION DU NOYAU MASTER CERTIFICATION
   * Agrégation des données d'audit, des indicateurs et du référentiel documentaire.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulation de la liaison avec le Noyau de Certification Qualisoft
        const mockData = await generateMockCertificationData();
        setCertificationData(mockData);
      } catch (error) {
        console.error('Erreur liaison Matrix Certification:', error);
        toast.error('Échec de synchronisation du statut de certification');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /**
   * 📊 LOGIQUE DE FILTRAGE DES CLAUSES
   * Permet d'isoler les exigences selon la norme sélectionnée dans l'UI.
   */
  const filteredClauses = useMemo(() => {
    if (!certificationData) return [];
    if (activeTab === 'GLOBAL') return certificationData.clauseCompliance;
    const standardMap: any = { QUALITY: 'ISO 9001', ENVIRONMENT: 'ISO 14001' };
    return certificationData.clauseCompliance.filter((c: any) => c.standard === standardMap[activeTab]);
  }, [activeTab, certificationData]);

  if (loading || !certificationData) {
    return (
      <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
        <div className="relative">
           <div className="w-24 h-24 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
           <ShieldCheck size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500/50" />
        </div>
        <p className="text-blue-500 font-black uppercase italic text-[10px] tracking-[0.5em] animate-pulse">
          Audit de conformité des référentiels en cours...
        </p>
      </div>
    );
  }

  return (
    <div className="ml-72 min-h-screen bg-[#0B0F1A] text-white font-sans p-10 italic text-left selection:bg-blue-600/30 overflow-x-hidden">
      
      {/* 🚀 HEADER STRATÉGIQUE §9.1 ISO 9001 (Surveillance & Mesure) */}
      <header className="mb-14 border-b border-white/5 pb-12">
        <div className="flex flex-col xl:flex-row justify-between items-start gap-10 mb-10">
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="bg-linear-to-br from-blue-600 to-emerald-600 p-6 rounded-[2.5rem] shadow-3xl shadow-blue-500/20 group hover:rotate-6 transition-transform">
                <ShieldCheck size={48} className="text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-3">
                  Statut <span className="text-blue-600">Certification</span>
                </h1>
                <p className="text-slate-500 font-black text-[11px] uppercase tracking-[0.4em] italic leading-none">
                  ISO 9001 • ISO 14001 • Conformité Environnementale Sénégal
                </p>
              </div>
            </div>
            
            {/* BADGES DE PROGRESSION GLOBALE */}
            <div className="flex flex-wrap gap-5 mt-8">
              <CertificationBadge standard="ISO 9001" status={certificationData.iso9001.status} progress={certificationData.iso9001.progress} nextStep={certificationData.iso9001.nextStep} />
              <CertificationBadge standard="ISO 14001" status={certificationData.iso14001.status} progress={certificationData.iso14001.progress} nextStep={certificationData.iso14001.nextStep} />
              <CertificationBadge standard="LÉGAL SÉNÉGAL" status={certificationData.legal.status} progress={certificationData.legal.progress} nextStep={certificationData.legal.nextStep} />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button className="bg-white/5 border border-white/10 hover:bg-blue-600 text-white px-8 py-5 rounded-3xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-2xl cursor-pointer"><FileText size={18} /> Rapport Audit</button>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-5 rounded-3xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-3xl cursor-pointer border-none"><Download size={18} /> Preuves Export</button>
            <button className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-5 rounded-3xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-2xl cursor-pointer border-none"><Plus size={18} /> Correction Gap</button>
          </div>
        </div>

        {/* 🧭 NAVIGATION TACTIQUE PAR RÉFÉRENTIEL */}
        <div className="flex bg-slate-900/40 border border-white/5 rounded-3xl p-1.5 w-fit backdrop-blur-3xl shadow-inner">
          {(['GLOBAL', 'QUALITY', 'ENVIRONMENT'] as const).map((tab) => (
            <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`px-10 py-4 text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl border-none cursor-pointer italic ${activeTab === tab ? 'bg-white text-slate-900 shadow-2xl scale-105' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
            >
              {tab === 'GLOBAL' && 'Console Intégrée'}
              {tab === 'QUALITY' && 'Management Qualité'}
              {tab === 'ENVIRONMENT' && 'Management Environnemental'}
            </button>
          ))}
        </div>
      </header>

      {/* 📊 SECTION 1: MATURITÉ DES SYSTÈMES (§4 Context & §9 Evaluation) */}
      <section className="mb-16">
        <SectionHeader title="Maturité SMI Sovereign" icon={<Globe className="text-blue-500" />} description="Mesure de l'alignement avec les exigences normatives scellées" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
          <MaturityCard title="Système Qualité" score={certificationData.iso9001.maturityScore} status={certificationData.iso9001.status} requirementsMet={certificationData.iso9001.requirementsMet} totalRequirements={certificationData.iso9001.totalRequirements} color="from-blue-600/20 via-blue-700/40 to-blue-900/60" borderColor="border-blue-500/30" />
          <MaturityCard title="Système Environnement" score={certificationData.iso14001.maturityScore} status={certificationData.iso14001.status} requirementsMet={certificationData.iso14001.requirementsMet} totalRequirements={certificationData.iso14001.totalRequirements} color="from-emerald-600/20 via-emerald-700/40 to-emerald-900/60" borderColor="border-emerald-500/30" />
          <MaturityCard title="Conformité Légale" score={certificationData.legal.maturityScore} status={certificationData.legal.status} requirementsMet={certificationData.legal.requirementsMet} totalRequirements={certificationData.legal.totalRequirements} color="from-amber-600/20 via-amber-700/40 to-amber-900/60" borderColor="border-amber-500/30" />
        </div>

        <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-12 backdrop-blur-3xl shadow-4xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 relative z-10">
            <h3 className="text-3xl font-black uppercase tracking-tighter italic">Analyse Granulaire des Clauses</h3>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
               <span className="text-[10px] font-black text-slate-500 uppercase italic">Filtre Référentiel :</span>
               <select className="bg-black/40 border border-white/10 rounded-2xl px-8 py-4 text-[11px] font-black uppercase text-white italic cursor-pointer outline-none hover:border-blue-500 transition-all shadow-inner">
                 <option>ISO 9001:2015</option>
                 <option>ISO 14001:2015</option>
                 <option>SMI Intégré</option>
               </select>
            </div>
          </div>
          
          <div className="space-y-6 relative z-10">
            {filteredClauses.map((clause: any) => (
              <ClauseComplianceCard 
                key={clause.id} 
                clause={clause} 
                onExpand={() => setExpandedSection(expandedSection === clause.id ? null : clause.id)} 
                isExpanded={expandedSection === clause.id} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* 📈 SECTION 2: PERFORMANCE OPÉRATIONNELLE (§9.1) */}
      <section className="mb-16">
        <SectionHeader title="Flux de Performance (KPI)" icon={<Activity className="text-emerald-500" />} description="Pilotage en temps réel des processus et impacts critiques" />
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          <KpiDashboard title="Processus Qualité" kpis={certificationData.qualityKpis} icon={<Target className="text-blue-500" />} />
          <KpiDashboard title="Processus Environnementaux" kpis={certificationData.environmentKpis} icon={<Leaf className="text-emerald-500" />} />
        </div>
      </section>

      {/* ⚠️ SECTION 3: RÉSOLUTION DES ÉCARTS D'AUDIT (§10.2 Non-conformité) */}
      <section className="mb-16">
        <SectionHeader title="Priorités de Levée de Gaps" icon={<AlertTriangle className="text-amber-500" />} description="Traitement des non-conformités et opportunités d'amélioration" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <PriorityActions title="Gaps ISO 9001 (Qualité)" actions={certificationData.priorityActions.quality} color="bg-blue-900/10 border-blue-500/20" />
          <PriorityActions title="Gaps ISO 14001 (Env.)" actions={certificationData.priorityActions.environment} color="bg-emerald-900/10 border-emerald-500/20" />
        </div>
      </section>

      {/* 📅 SECTION 4: TRAJECTOIRE DE CERTIFICATION */}
      <section className="mb-16">
        <SectionHeader title="Jalons & Chronologie Audit" icon={<Calendar className="text-purple-500" />} description="Suivi du calendrier de certification et des audits de surveillance" />
        <CertificationTimeline events={certificationData.timeline} />
      </section>

      {/* 📂 SECTION 5: RÉFÉRENTIEL DE PREUVES */}
      <section>
        <SectionHeader title="Bibliothèque de Preuves Scellées" icon={<FileText className="text-slate-500" />} description="Accès direct aux documents maîtres pour les auditeurs externes" />
        <DocumentationLibrary documents={certificationData.documentation} />
      </section>

      <footer className="mt-24 pt-12 border-t border-white/5 text-center space-y-4 opacity-50">
        <p className="text-[11px] font-black text-slate-500 uppercase italic tracking-[0.6em]">Qualisoft SMI Sovereign • Management Intelligence • RD 2026</p>
        <p className="text-[10px] font-bold text-slate-700 uppercase italic tracking-[0.4em]">AFNOR • INNORPI • MINISTÈRE DE L&apos;ENVIRONNEMENT SÉNÉGAL</p>
      </footer>
    </div>
  );
}

// --- SOUS-COMPOSANTS RÉUTILISABLES (PROTOTYPES ÉLITE) ---

function CertificationBadge({ standard, status, progress, nextStep }: any) {
  const themes: any = { 
    CERTIFIED: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-900/20', 
    IN_PROGRESS: 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-blue-900/20', 
    GAP_ANALYSIS: 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-amber-900/20' 
  };
  return (
    <div className={`p-6 rounded-4xl border backdrop-blur-3xl shadow-2xl transition-all hover:-translate-y-1 ${themes[status] || 'bg-slate-500/10 border-white/10 text-slate-400'}`}>
      <div className="flex items-center justify-between mb-4 gap-10">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] italic leading-none">{standard}</span>
        <div className="w-24 h-2 bg-black/40 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-current rounded-full transition-all duration-1000 shadow-[0_0_10px_currentColor]" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <p className="text-3xl font-black italic tracking-tighter leading-none mb-3">{progress}%</p>
      <div className="flex items-center gap-2 opacity-60">
        <Activity size={12} />
        <p className="text-[9px] font-bold italic line-clamp-1 uppercase tracking-tight">{nextStep}</p>
      </div>
    </div>
  );
}

function MaturityCard({ title, score, status, requirementsMet, totalRequirements, color, borderColor }: any) {
  return (
    <div className={`bg-linear-to-br ${color} ${borderColor} border p-10 rounded-[3.5rem] shadow-4xl group hover:scale-[1.02] transition-all duration-500 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform">
          <ShieldCheck size={120} />
      </div>
      <h3 className="text-3xl font-black uppercase italic mb-8 tracking-tighter text-white relative z-10 leading-none">{title}</h3>
      <div className="flex items-end justify-between mb-10 relative z-10">
        <div className="text-5xl font-black tracking-tighter italic leading-none text-white">{score}<span className="text-lg opacity-40 ml-1">%</span></div>
        <span className="px-5 py-2.5 rounded-2xl bg-black/30 border border-white/10 text-white text-[10px] font-black uppercase italic backdrop-blur-3xl shadow-xl leading-none">Status: {status}</span>
      </div>
      <div className="space-y-4 relative z-10">
        <div className="flex justify-between text-[11px] font-black italic tracking-widest uppercase text-white/70">
          <span>Couverture Exigences</span>
          <span>{requirementsMet} / {totalRequirements}</span>
        </div>
        <div className="w-full bg-black/30 rounded-full h-3.5 overflow-hidden shadow-inner p-0.5 border border-white/5">
          <div className="h-full bg-white rounded-full transition-all duration-2000 shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ width: `${(requirementsMet / totalRequirements) * 100}%` }} />
        </div>
      </div>
      <button className="mt-10 w-full bg-white text-black hover:bg-black hover:text-white font-black py-5 rounded-4xl transition-all text-[11px] uppercase tracking-[0.3em] border-none cursor-pointer italic shadow-3xl active:scale-95">Extraire Preuves</button>
    </div>
  );
}

function ClauseComplianceCard({ clause, onExpand, isExpanded }: any) {
  return (
    <div className={`bg-white/2 border rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-2xl ${isExpanded ? 'border-blue-500/30 ring-1 ring-blue-500/10' : 'border-white/5 hover:border-white/10'}`}>
      <button onClick={onExpand} className="w-full p-10 text-left flex justify-between items-center hover:bg-white/3 transition-colors border-none bg-transparent cursor-pointer">
        <div className="space-y-3">
          <div className="flex items-center gap-5">
            <span className="text-[10px] font-black bg-blue-600/10 text-blue-500 px-4 py-2 rounded-xl border border-blue-600/20 italic tracking-widest shadow-lg">{clause.standard} §{clause.number}</span>
            <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none text-white">{clause.title}</h4>
          </div>
          <p className="text-[12px] text-slate-500 italic line-clamp-1 font-bold">{clause.description}</p>
        </div>
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-6">
            <div className="w-40 h-3 bg-black/40 rounded-full overflow-hidden shadow-inner p-0.5 border border-white/5">
              <div className={`h-full rounded-full transition-all duration-1000 ${clause.compliance >= 90 ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : clause.compliance >= 70 ? 'bg-blue-600 shadow-[0_0_12px_#3b82f6]' : 'bg-amber-500'}`} style={{ width: `${clause.compliance}%` }} />
            </div>
            <span className="text-2xl font-black italic tracking-tighter w-14 text-right text-white leading-none">{clause.compliance}%</span>
          </div>
          <div className={`p-3 bg-white/5 rounded-2xl transition-transform duration-500 ${isExpanded ? 'rotate-180 bg-blue-600/20 text-blue-400' : 'text-slate-600'}`}>
            <ChevronDown size={24} />
          </div>
        </div>
      </button>
      
      {isExpanded && (
        <div className="p-12 bg-black/40 border-t border-white/5 animate-in slide-in-from-top-4 duration-700">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            <div className="space-y-6">
              <h5 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] flex items-center gap-3 italic border-b border-white/5 pb-4"><CheckCircle size={16} className="text-emerald-500" /> Preuves de Conformité</h5>
              <ul className="space-y-4">
                {clause.compliantItems.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-4 text-[12px] font-black italic leading-snug group">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shadow-[0_0_10px_#10b981] group-hover:scale-150 transition-transform" />
                    <span className="text-slate-200 uppercase tracking-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h5 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] flex items-center gap-3 italic border-b border-white/5 pb-4"><AlertTriangle size={16} className="text-amber-500" /> Analyse d&apos;Écarts (Gaps)</h5>
              <div className="space-y-4">
                {clause.gaps.map((gap: any, idx: number) => (
                  <div key={idx} className="bg-amber-600/5 border border-amber-600/20 p-5 rounded-3xl space-y-3 shadow-inner">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black bg-amber-600 text-black px-3 py-1 rounded-full italic leading-none">{gap.priority}</span>
                        <AlertTriangle size={14} className="text-amber-600" />
                    </div>
                    <p className="text-[12px] font-black text-amber-500/80 italic leading-tight uppercase">{gap.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h5 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] flex items-center gap-3 italic border-b border-white/5 pb-4"><Zap size={16} className="text-blue-500" /> Plan d&apos;Actions Prédictif</h5>
              <ul className="space-y-4">
                {clause.recommendedActions.map((action: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-4 text-[12px] font-black text-blue-400 italic leading-snug group">
                    <Zap className="mt-0.5 shrink-0 text-blue-600 group-hover:scale-125 transition-transform" size={16} />
                    <span className="uppercase tracking-tight">{action}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-4xl transition-all text-[11px] uppercase italic border-none cursor-pointer shadow-4xl active:scale-95">Sceller Plan d&apos;Actions</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiDashboard({ title, kpis, icon }: any) {
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-12 backdrop-blur-3xl shadow-4xl relative overflow-hidden">
      <div className="flex items-center gap-6 mb-12 border-b border-white/5 pb-8">
        <div className="p-5 bg-black/40 rounded-2xl border border-white/5 shadow-inner text-current">{icon}</div>
        <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
        {kpis.map((kpi: any, idx: number) => (
          <div key={idx} className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/5 transition-all group shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] italic mb-3 leading-none">{kpi.label}</p>
                <p className="text-4xl font-black italic tracking-tighter text-white leading-none group-hover:text-blue-500 transition-colors">{kpi.value}</p>
              </div>
              <div className={`p-4 rounded-2xl shadow-inner ${kpi.trend > 0 ? 'bg-emerald-600/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-600/10 text-rose-500 border border-rose-500/20'}`}>
                {kpi.trend > 0 ? <TrendingUp size={24} /> : <TrendingUp size={24} className="rotate-180" />}
              </div>
            </div>
            <p className="text-[11px] text-slate-600 font-bold italic line-clamp-1 uppercase tracking-tight">{kpi.description}</p>
            {kpi.alert && (
              <div className="mt-6 p-4 bg-amber-600/10 border border-amber-600/20 rounded-2xl flex items-center gap-4 animate-pulse">
                <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-500 font-black italic uppercase leading-tight">{kpi.alert}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PriorityActions({ title, actions, color }: any) {
  return (
    <div className={`rounded-[4rem] p-12 border backdrop-blur-3xl shadow-4xl text-left ${color}`}>
      <h3 className="text-3xl font-black uppercase italic mb-12 flex items-center gap-6 tracking-tighter leading-none text-white">
        <AlertTriangle className="text-amber-500" size={32} /> {title}
      </h3>
      <div className="space-y-6">
        {actions.map((action: any, idx: number) => (
          <div key={idx} className="bg-black/30 border border-white/5 rounded-[3rem] p-8 hover:bg-black/50 transition-all group shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <h4 className="text-xl font-black uppercase italic text-white group-hover:text-blue-500 transition-colors leading-none tracking-tight flex-1 mr-6">{action.title}</h4>
              <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase italic tracking-widest border shadow-xl leading-none ${action.priority === 'CRITICAL' ? 'bg-rose-600 text-white border-rose-400' : 'bg-blue-600 text-white border-blue-400'}`}>{action.priority}</span>
            </div>
            <p className="text-[12px] text-slate-400 font-bold italic mb-8 leading-relaxed line-clamp-2 uppercase tracking-tight">{action.description}</p>
            <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/5 text-[10px] font-black text-slate-500 uppercase italic tracking-tighter leading-none">
              <span className="flex items-center gap-3"><Users size={16} className="text-blue-500" /> Pilote : {action.responsible}</span>
              <span className="flex items-center gap-3"><Clock size={16} className="text-amber-500" /> Échéance : {action.deadline}</span>
              <span className="px-4 py-1.5 bg-white/5 rounded-full border border-white/5 text-blue-400">{action.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificationTimeline({ events }: any) {
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-[4.5rem] p-16 backdrop-blur-3xl shadow-4xl text-left relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-blue-600/10 -translate-y-1/2 hidden lg:block"></div>
      <div className="relative pl-12 lg:pl-0 lg:border-l-0 border-l-4 border-blue-600/20 space-y-16 lg:space-y-0 lg:flex lg:gap-12 py-4">
        {events.map((event: any, idx: number) => (
          <div key={idx} className="relative lg:flex-1 group animate-in slide-in-from-bottom-10 duration-1000">
            <div className="absolute -left-14 lg:left-1/2 lg:-top-16 lg:-translate-x-1/2 w-8 h-8 rounded-full border-[6px] border-[#0B0F1A] bg-blue-600 shadow-[0_0_25px_#2563eb] z-20 group-hover:scale-125 transition-transform" />
            <div className="bg-white/2 border border-white/5 p-10 rounded-[3rem] hover:bg-white/5 transition-all shadow-3xl hover:-translate-y-2 duration-500">
              <div className="flex justify-between items-start mb-6">
                <div>
                   <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white group-hover:text-blue-500 leading-none mb-3">{event.title}</h4>
                   <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-tight">{event.description}</p>
                </div>
                <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase italic border shadow-inner ${event.status === 'COMPLETED' ? 'bg-emerald-600/10 text-emerald-500 border-emerald-600/20' : 'bg-blue-600/10 text-blue-400 border-blue-600/20 animate-pulse'}`}>{event.status}</span>
              </div>
              <div className="flex flex-col gap-4 text-[11px] font-black text-slate-600 uppercase italic mb-8 border-b border-white/5 pb-6">
                <span className="flex items-center gap-4"><Calendar size={18} className="text-blue-500" /> Échéance : {event.date}</span>
                <span className="flex items-center gap-4"><Users size={18} className="text-purple-500" /> Auditeur/Pilote : {event.responsible}</span>
              </div>
              {event.deliverables && (
                <div className="space-y-5">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] flex items-center gap-3"><Recycle size={16} className="text-emerald-500" /> Livrables Requis :</p>
                  <div className="flex flex-wrap gap-3">
                    {event.deliverables.map((deliverable: string, dIdx: number) => (
                      <span key={dIdx} className="bg-black/50 border border-white/5 px-5 py-2.5 rounded-2xl text-[10px] font-black italic text-slate-300 shadow-xl group-hover:border-blue-500/20 transition-all uppercase tracking-tight">
                        {deliverable}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentationLibrary({ documents }: any) {
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-[4.5rem] p-16 backdrop-blur-3xl shadow-4xl relative overflow-hidden text-left">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-16 gap-10 relative z-10">
        <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-white">Référentiel de Preuves d&apos;Audit</h3>
        <div className="relative w-full xl:w-140 group">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={28} />
          <input type="text" placeholder="RECHERCHER DANS LE COFFRE-FORT NUMÉRIQUE..." className="w-full bg-black/40 border border-white/10 rounded-[2.5rem] pl-20 pr-10 py-7 text-white focus:border-blue-600 outline-none text-[12px] font-black uppercase italic shadow-inner tracking-widest" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 relative z-10">
        {documents.map((doc: any, idx: number) => (
          <div key={idx} className="bg-white/2 border border-white/5 rounded-[3.5rem] p-10 hover:border-blue-500/30 hover:bg-white/3 transition-all cursor-pointer group shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileText size={100} />
            </div>
            <div className="flex items-start gap-6 mb-8 relative z-10">
              <div className={`p-5 rounded-2xl shadow-2xl ${doc.category === 'MANUAL' ? 'bg-blue-600 text-white' : doc.category === 'PROCEDURE' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                <FileText size={36} strokeWidth={2.5} />
              </div>
              <div className="flex-1 space-y-3">
                <h4 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter leading-none">{doc.title}</h4>
                <p className="text-[11px] text-slate-500 font-bold italic line-clamp-2 leading-relaxed uppercase tracking-tight">{doc.description}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-[11px] font-black text-slate-600 uppercase italic pt-8 border-t border-white/5 mb-10 relative z-10 leading-none">
              <span className="flex items-center gap-3"><Users size={16} className="text-blue-500" /> Pilote : {doc.owner}</span>
              <span className="flex items-center gap-3"><Calendar size={16} className="text-slate-500" /> {doc.lastUpdate}</span>
            </div>
            
            <div className="flex gap-4 relative z-10">
              <button className="flex-1 bg-white text-black hover:bg-blue-600 hover:text-white font-black py-5 rounded-4xl transition-all text-[11px] uppercase italic border-none cursor-pointer shadow-3xl active:scale-95">Visualiser</button>
              <button className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-8 rounded-4xl transition-all border border-white/5 cursor-pointer shadow-inner"><Download size={24} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, icon, description }: any) {
  return (
    <div className="mb-12 animate-in slide-in-from-left-8 duration-700 text-left">
      <div className="flex items-center gap-6 mb-4">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner">{icon}</div>
        <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">{title}</h2>
      </div>
      <p className="text-slate-500 text-[12px] font-black uppercase tracking-[0.5em] italic ml-1 opacity-70 leading-none">{description}</p>
    </div>
  );
}

// --- GÉNÉRATEUR DE DONNÉES MOCK (CONFIGURATION SOUVERAINE RD 2026) ---

async function generateMockCertificationData() {
  return {
    iso9001: { status: 'IN_PROGRESS', progress: 78, maturityScore: 78, requirementsMet: 89, totalRequirements: 114, nextStep: 'Validation de la revue de direction Q1 2026' },
    iso14001: { status: 'GAP_ANALYSIS', progress: 65, maturityScore: 65, requirementsMet: 68, totalRequirements: 105, nextStep: 'Finalisation du registre des AES' },
    legal: { status: 'IN_PROGRESS', progress: 82, maturityScore: 82, requirementsMet: 28, totalRequirements: 34, nextStep: 'Dépôt du rapport annuel au Ministère' },
    clauseCompliance: [
      { id: '4.1', standard: 'ISO 9001', number: '4.1', title: 'Contexte de l\'organisation', description: 'Surveillance des enjeux internes/externes (§4.1)', compliance: 95, compliantItems: ['Analyse SWOT Matrix v2.6', 'Cartographie dynamique des parties intéressées', 'Registre des enjeux scellé'], gaps: [{ description: 'Veille réglementaire ISO manuelle', priority: 'MOYENNE' }], recommendedActions: ['Activer l\'Intelligence Réglementaire', 'Lier les enjeux aux risques process'] },
      { id: '6.1', standard: 'ISO 14001', number: '6.1', title: 'Actions face aux risques', description: 'Détermination des impacts environnementaux (AES)', compliance: 70, compliantItems: ['Inventaire des flux énergétiques', 'Calculateur carbone Scope 1/2'], gaps: [{ description: 'Plan de secours environnemental Site B manquant', priority: 'CRITICAL' }], recommendedActions: ['Générer plan de secours Site B', 'Simuler incident environnemental'] }
    ],
    qualityKpis: [
      { label: 'Indice Conformité Produit', value: '98.7%', trend: 2, description: 'Cible SMI : ≥ 98.0%' },
      { label: 'Incidence Clients', value: '3', trend: -1, description: 'Seuil critique : 5/mois', alert: 'Tendance haussière sur Zone Thiès' },
      { label: 'Temps de Levée NC', value: '14.2j', trend: 1, description: 'Objectif GPEC : < 15j' },
      { label: 'Efficacité SMI', value: '92%', trend: 1, description: 'Taux de réussite audits internes' }
    ],
    environmentKpis: [
      { label: 'Intensité Énergétique', value: '8.45 MWh', trend: -2, description: 'Réduction vs N-1 : -4.2%' },
      { label: 'Valorisation Déchets', value: '72%', trend: 3, description: 'Cible 2026 : 75.0%' },
      { label: 'Consommation Eau / FTE', value: '12.4 L', trend: 0, description: 'Stabilité opérationnelle' },
      { label: 'Zero Incident Majeur', value: '100%', trend: 1, description: 'Statut : Intégrité Totale' }
    ],
    priorityActions: {
      quality: [
        { title: 'Automatisation Flux NC', description: 'Sceller le flux d\'approbation numérique pour les non-conformités process §10.2.', priority: 'CRITICAL', responsible: 'RQ Master', deadline: '28/02/2026', status: 'À DÉMARRER' },
        { title: 'Revue Direction Q1', description: 'Préparer les data-viz pour l\'arbitrage budgétaire Qualité.', priority: 'HIGH', responsible: 'DG / RQ', deadline: '05/03/2026', status: 'EN COURS' }
      ],
      environment: [
        { title: 'Monitoring Capteurs Énergie', description: 'Liaison temps réel entre compteurs et API Analytics.', priority: 'HIGH', responsible: 'Lead HSE', deadline: '15/03/2026', status: 'PHASE TESTS' }
      ]
    },
    timeline: [
      { title: 'Audit à Blanc Qualité', description: 'Simulation complète avant certification AFNOR.', date: '12/03/2026', status: 'UPCOMING', responsible: 'Expert Externe', deliverables: ['Rapport Audit §9', 'Liste Écarts Critiques'] },
      { title: 'Audit Étape 1 ISO 14001', description: 'Vérification documentaire organisme tiers.', date: '25/04/2026', status: 'UPCOMING', responsible: 'Direction / HSE', deliverables: ['Dossier AES', 'Politique SMI'] }
    ],
    documentation: [
      { title: 'Manuel SMI Intégré', description: 'Cadre normatif unifié ISO 9001 & 14001 v2.6', category: 'MANUAL', owner: 'RQ Master', lastUpdate: '10/01/2026', status: 'APPROVED' },
      { title: 'Registre AES Sénégal', description: 'Analyse impacts environnementaux sites Dakar/Thiès', category: 'PROCEDURE', owner: 'Responsable HSE', lastUpdate: '05/02/2026', status: 'DRAFT' }
    ]
  };
}