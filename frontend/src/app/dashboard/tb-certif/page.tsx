/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldCheck, TrendingUp, Target, AlertTriangle, 
  CheckCircle, Clock, FileText, Users, 
  BarChart3, PieChart, Calendar, Download,
  Leaf, Zap, Droplets, Flame, Recycle,
  ChevronRight, ChevronDown, Plus, Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CertificationDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [certificationData, setCertificationData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'QUALITY' | 'ENVIRONMENT' | 'GLOBAL'>('GLOBAL');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // --- 1. SYNCHRONISATION DES DONNÉES DE CERTIFICATION ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulation de la liaison avec le Noyau Master Certification
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

  if (loading || !certificationData) {
    return (
      <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
        <div className="relative">
           <div className="w-20 h-20 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
           <ShieldCheck size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500/50" />
        </div>
        <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-[0.5em] animate-pulse">
          Audit en temps réel des référentiels ISO...
        </p>
      </div>
    );
  }

  return (
    <div className="ml-72 min-h-screen bg-[#0B0F1A] text-white font-sans p-8 italic selection:bg-blue-600/30">
      
      {/* 🚀 HEADER STRATÉGIQUE §9.1 ISO 9001 */}
      <header className="mb-10 border-b border-white/5 pb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="bg-linear-to-br from-blue-600 to-emerald-600 p-5 rounded-4xl shadow-2xl shadow-blue-500/20">
                <ShieldCheck size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
                  Tableau de <span className="text-blue-600">Bord</span> Certification
                </h1>
                <p className="text-slate-500 font-bold text-[11px] uppercase tracking-[0.4em] mt-3 italic">
                  ISO 9001:2015 • ISO 14001:2015 • Conformité Légale Sénégal
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <CertificationBadge standard="ISO 9001" status={certificationData.iso9001.status} progress={certificationData.iso9001.progress} nextStep={certificationData.iso9001.nextStep} />
              <CertificationBadge standard="ISO 14001" status={certificationData.iso14001.status} progress={certificationData.iso14001.progress} nextStep={certificationData.iso14001.nextStep} />
              <CertificationBadge standard="LÉGAL SÉNÉGAL" status={certificationData.legal.status} progress={certificationData.legal.progress} nextStep={certificationData.legal.nextStep} />
            </div>
          </div>
          
          <div className="flex gap-4">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-5 rounded-3xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-xl border-none cursor-pointer"><FileText size={18} /> Rapport Certification</button>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-5 rounded-3xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-xl border-none cursor-pointer"><Download size={18} /> Export Audit</button>
            <button className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-5 rounded-3xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-xl border-none cursor-pointer"><Plus size={18} /> Plan d&apos;Actions</button>
          </div>
        </div>

        {/* 🧭 NAVIGATION PAR NORME */}
        <div className="flex bg-slate-900/50 border border-white/10 rounded-3xl p-1.5 w-fit backdrop-blur-md">
          {(['GLOBAL', 'QUALITY', 'ENVIRONMENT'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl border-none cursor-pointer ${activeTab === tab ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-white'}`}>
              {tab === 'GLOBAL' && 'Vue Globale'}
              {tab === 'QUALITY' && 'ISO 9001:2015'}
              {tab === 'ENVIRONMENT' && 'ISO 14001:2015'}
            </button>
          ))}
        </div>
      </header>

      {/* 📊 SECTION 1: MATURITÉ ET CONFORMITÉ (§10 ISO) */}
      <section className="mb-12">
        <SectionHeader title="Maturité du SMI Elite" icon={<BarChart3 className="text-blue-500" />} description="Évaluation dynamique des exigences normatives et réglementaires" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <MaturityCard title="Qualité ISO 9001" score={certificationData.iso9001.maturityScore} status={certificationData.iso9001.status} requirementsMet={certificationData.iso9001.requirementsMet} totalRequirements={certificationData.iso9001.totalRequirements} color="from-blue-600 to-blue-800" />
          <MaturityCard title="Environnement ISO 14001" score={certificationData.iso14001.maturityScore} status={certificationData.iso14001.status} requirementsMet={certificationData.iso14001.requirementsMet} totalRequirements={certificationData.iso14001.totalRequirements} color="from-emerald-600 to-emerald-800" />
          <MaturityCard title="Réglementation Sénégal" score={certificationData.legal.maturityScore} status={certificationData.legal.status} requirementsMet={certificationData.legal.requirementsMet} totalRequirements={certificationData.legal.totalRequirements} color="from-amber-600 to-amber-800" />
        </div>

        <div className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-10 backdrop-blur-3xl shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Analyse Détaillée par Clause</h3>
            <select className="bg-black/20 border border-white/10 rounded-2xl px-6 py-3 text-[10px] font-black uppercase text-white italic cursor-pointer outline-none">
              <option>ISO 9001:2015</option>
              <option>ISO 14001:2015</option>
              <option>Multi-référentiels</option>
            </select>
          </div>
          
          <div className="space-y-5">
            {certificationData.clauseCompliance.map((clause: any) => (
              <ClauseComplianceCard key={clause.id} clause={clause} onExpand={() => setExpandedSection(expandedSection === clause.id ? null : clause.id)} isExpanded={expandedSection === clause.id} />
            ))}
          </div>
        </div>
      </section>

      {/* 📈 SECTION 2: PERFORMANCE DÉCISIONNELLE */}
      <section className="mb-12">
        <SectionHeader title="Indicateurs de Performance (KPI)" icon={<TrendingUp className="text-emerald-500" />} description="Pilotage des processus clés et impacts environnementaux" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <KpiDashboard title="Performance Qualité" kpis={certificationData.qualityKpis} icon={<Target className="text-blue-500" />} />
          <KpiDashboard title="Performance Environnementale" kpis={certificationData.environmentKpis} icon={<Leaf className="text-emerald-500" />} />
        </div>
      </section>

      {/* ⚠️ SECTION 3: MITIGATION DES RISQUES CERTIFICATION */}
      <section className="mb-12">
        <SectionHeader title="Actions Prioritaires Audit" icon={<AlertTriangle className="text-amber-500" />} description="Traitement des non-conformités et opportunités critiques" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <PriorityActions title="Levée de Gaps ISO 9001" actions={certificationData.priorityActions.quality} color="bg-blue-600/5 border-blue-600/10" />
          <PriorityActions title="Levée de Gaps ISO 14001" actions={certificationData.priorityActions.environment} color="bg-emerald-600/5 border-emerald-600/10" />
        </div>
      </section>

      {/* 📅 SECTION 4: TRAJECTOIRE CERTIFICATION */}
      <section className="mb-12">
        <SectionHeader title="Chronologie du Processus" icon={<Calendar className="text-purple-500" />} description="Suivi des jalons d'audit et décisions de certification" />
        <CertificationTimeline events={certificationData.timeline} />
      </section>

      {/* 📂 SECTION 5: MASTER DOCUMENTS */}
      <section>
        <SectionHeader title="Bibliothèque de Preuves Audit" icon={<FileText className="text-slate-500" />} description="Documentation scellée pour l'examen des auditeurs" />
        <DocumentationLibrary documents={certificationData.documentation} />
      </section>

      <footer className="mt-20 pt-10 border-t border-white/5 text-center space-y-3">
        <p className="text-[10px] font-black text-slate-600 uppercase italic tracking-[0.5em]">Qualisoft SMI Elite • Système de Management Intégré • RD 2026</p>
        <p className="text-[9px] font-bold text-slate-700 uppercase italic tracking-[0.3em]">ANSD • Ministère de l&apos;Environnement Sénégal • INNORPI • AFNOR INTERNATIONAL</p>
      </footer>
    </div>
  );
}

// --- SOUS-COMPOSANTS RÉUTILISABLES ---

function CertificationBadge({ standard, status, progress, nextStep }: any) {
  const themes: any = { CERTIFIED: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', IN_PROGRESS: 'bg-blue-500/10 border-blue-500/20 text-blue-400', GAP_ANALYSIS: 'bg-amber-500/10 border-amber-500/20 text-amber-400' };
  return (
    <div className={`p-5 rounded-3xl border backdrop-blur-sm ${themes[status] || 'bg-slate-500/10 border-white/10 text-slate-400'}`}>
      <div className="flex items-center justify-between mb-3 gap-6">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">{standard}</span>
        <div className="w-20 h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-current rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <p className="text-2xl font-black italic tracking-tighter leading-none">{progress}%</p>
      <p className="text-[9px] mt-2 font-bold opacity-60 italic line-clamp-1">{nextStep}</p>
    </div>
  );
}

function MaturityCard({ title, score, status, requirementsMet, totalRequirements, color }: any) {
  return (
    <div className={`bg-linear-to-br ${color} p-8 rounded-[3rem] shadow-2xl group hover:scale-105 transition-all duration-500`}>
      <h3 className="text-2xl font-black uppercase italic mb-6 tracking-tight group-hover:translate-x-2 transition-transform">{title}</h3>
      <div className="flex items-end justify-between mb-8">
        <div className="text-3xl font-black tracking-tighter italic leading-none">{score}</div>
        <span className="px-4 py-2 rounded-2xl bg-white/20 text-white text-[10px] font-black uppercase italic backdrop-blur-md">Status: {status}</span>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-[11px] font-black italic tracking-widest uppercase">
          <span>Conformité Exigences</span>
          <span>{requirementsMet}/{totalRequirements}</span>
        </div>
        <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden shadow-inner">
          <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${(requirementsMet / totalRequirements) * 100}%` }} />
        </div>
      </div>
      <button className="mt-8 w-full bg-white/10 hover:bg-white text-white hover:text-black font-black py-4 rounded-2xl transition-all text-[10px] uppercase tracking-[0.2em] border-none cursor-pointer italic shadow-lg">Détails Conformité</button>
    </div>
  );
}

function ClauseComplianceCard({ clause, onExpand, isExpanded }: any) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-4xl overflow-hidden hover:border-white/10 transition-all shadow-xl">
      <button onClick={onExpand} className="w-full p-8 text-left flex justify-between items-center hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-xl border border-blue-600/20 italic tracking-widest">{clause.standard} §{clause.number}</span>
            <h4 className="text-lg font-black uppercase italic tracking-tight">{clause.title}</h4>
          </div>
          <p className="text-[11px] text-slate-500 italic line-clamp-1">{clause.description}</p>
        </div>
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="w-32 h-2.5 bg-black/20 rounded-full overflow-hidden shadow-inner">
              <div className={`h-full rounded-full transition-all duration-700 ${clause.compliance >= 90 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : clause.compliance >= 70 ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-amber-500'}`} style={{ width: `${clause.compliance}%` }} />
            </div>
            <span className="text-xl font-black italic tracking-tighter w-12 text-right">{clause.compliance}%</span>
          </div>
          <ChevronDown className={`text-slate-600 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} size={24} />
        </div>
      </button>
      
      {isExpanded && (
        <div className="p-10 bg-black/20 border-t border-white/5 animate-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-5">
              <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] flex items-center gap-2 italic"><CheckCircle size={14} className="text-emerald-500" /> Preuves de Conformité</h5>
              <ul className="space-y-3">
                {clause.compliantItems.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-[11px] font-bold italic leading-snug">
                    <ChevronRight className="text-emerald-500 mt-0.5" size={12} />
                    <span className="text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-5">
              <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] flex items-center gap-2 italic"><AlertTriangle size={14} className="text-amber-500" /> Écarts Détectés</h5>
              <ul className="space-y-3">
                {clause.gaps.map((gap: any, idx: number) => (
                  <li key={idx} className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                       <span className="text-[11px] font-black text-amber-400 italic flex-1">{gap.description}</span>
                       <span className="text-[8px] font-black bg-amber-500 text-black px-2 py-0.5 rounded-full italic">{gap.priority}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-5">
              <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] flex items-center gap-2 italic"><Plus size={14} className="text-blue-500" /> Actions de Levée</h5>
              <ul className="space-y-3">
                {clause.recommendedActions.map((action: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-[11px] font-bold text-blue-400 italic">
                    <Zap className="mt-0.5 shrink-0" size={12} />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-5 w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all text-[10px] uppercase italic border-none cursor-pointer shadow-lg">Générer Plan d&apos;Actions</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiDashboard({ title, kpis, icon }: any) {
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-10 backdrop-blur-2xl shadow-xl">
      <div className="flex items-center gap-5 mb-10">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner">{icon}</div>
        <h3 className="text-2xl font-black uppercase italic tracking-tighter">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {kpis.map((kpi: any, idx: number) => (
          <div key={idx} className="bg-white/5 border border-white/5 rounded-4xl p-6 hover:bg-white/10 transition-all group shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">{kpi.label}</p>
                <p className="text-3xl font-black italic tracking-tighter mt-1 group-hover:text-blue-400 transition-colors">{kpi.value}</p>
              </div>
              <div className={`p-3 rounded-2xl shadow-inner ${kpi.trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : kpi.trend < 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-400'}`}>
                {kpi.trend > 0 ? <TrendingUp size={20} /> : kpi.trend < 0 ? <TrendingUp size={20} className="rotate-180" /> : <Clock size={20} />}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold italic line-clamp-1">{kpi.description}</p>
            {kpi.alert && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3 animate-pulse">
                <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                <p className="text-[9px] text-amber-400 font-black italic uppercase leading-none">{kpi.alert}</p>
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
    <div className={`rounded-[3.5rem] p-10 border ${color} shadow-2xl backdrop-blur-md`}>
      <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-4 tracking-tighter"><AlertTriangle className="text-amber-500" /> {title}</h3>
      <div className="space-y-4">
        {actions.map((action: any, idx: number) => (
          <div key={idx} className="bg-black/20 border border-white/5 rounded-4xl p-6 hover:bg-black/40 transition-all group shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-md font-black uppercase italic text-white group-hover:text-blue-400 transition-colors leading-tight max-w-[70%]">{action.title}</h4>
              <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase italic tracking-widest border ${action.priority === 'CRITICAL' ? 'bg-rose-600/10 text-rose-500 border-rose-600/20' : 'bg-blue-600/10 text-blue-400 border-blue-600/20'}`}>{action.priority}</span>
            </div>
            <p className="text-[11px] text-slate-400 font-bold italic mb-6 leading-relaxed line-clamp-2">{action.description}</p>
            <div className="flex items-center justify-between pt-5 border-t border-white/5 text-[10px] font-black text-slate-500 uppercase italic tracking-tighter">
              <span className="flex items-center gap-2"><Users size={14} className="text-blue-500" /> {action.responsible}</span>
              <span className="flex items-center gap-2"><Clock size={14} className="text-amber-500" /> {action.deadline}</span>
              <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-blue-400">{action.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificationTimeline({ events }: any) {
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl">
      <div className="relative pl-12 border-l-4 border-blue-600/20 space-y-12 py-4">
        {events.map((event: any, idx: number) => (
          <div key={idx} className="relative animate-in slide-in-from-left-10 duration-700">
            <div className="absolute -left-13.5 w-6 h-6 rounded-full border-4 border-[#0B0F1A] bg-blue-600 shadow-[0_0_20px_#2563eb]" />
            <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/10 transition-all shadow-xl group">
              <div className="flex justify-between items-start mb-5">
                <div>
                   <h4 className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors">{event.title}</h4>
                   <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-2">{event.description}</p>
                </div>
                <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase italic tracking-widest border ${event.status === 'COMPLETED' ? 'bg-emerald-600/10 text-emerald-400 border-emerald-600/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-blue-600/10 text-blue-400 border-blue-600/20 animate-pulse'}`}>{event.status}</span>
              </div>
              <div className="flex items-center gap-8 text-[11px] font-black text-slate-600 uppercase italic mb-8 border-b border-white/5 pb-5">
                <span className="flex items-center gap-3"><Calendar size={18} className="text-blue-500" /> Échéance : {event.date}</span>
                <span className="flex items-center gap-3"><Users size={18} className="text-purple-500" /> Pilote : {event.responsible}</span>
              </div>
              {event.deliverables && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] flex items-center gap-2"><Recycle size={14} className="text-emerald-500" /> Livrables Critiques Audit :</p>
                  <div className="flex flex-wrap gap-3">
                    {event.deliverables.map((deliverable: string, dIdx: number) => (
                      <span key={dIdx} className="bg-black/40 border border-white/5 px-5 py-2.5 rounded-2xl text-[10px] font-bold italic text-slate-300 shadow-md">
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
    <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
        <h3 className="text-3xl font-black uppercase italic tracking-tighter">Référentiel de Preuves Audit</h3>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
          <input type="text" placeholder="RECHERCHER UN DOCUMENT SCELLÉ..." className="w-full bg-black/20 border border-white/10 rounded-3xl pl-16 pr-8 py-5 text-white focus:border-blue-600 outline-none text-[11px] font-black uppercase italic shadow-inner" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {documents.map((doc: any, idx: number) => (
          <div key={idx} className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 hover:border-blue-600/30 hover:bg-white/10 transition-all cursor-pointer group shadow-xl">
            <div className="flex items-start gap-5 mb-6">
              <div className={`p-4 rounded-2xl shadow-inner ${doc.category === 'MANUAL' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : doc.category === 'PROCEDURE' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' : 'bg-amber-600/10 text-amber-400 border border-amber-600/20'}`}>
                <FileText size={32} />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors uppercase italic tracking-tight line-clamp-1">{doc.title}</h4>
                <p className="text-[10px] text-slate-500 font-bold italic line-clamp-2 leading-relaxed">{doc.description}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-[10px] font-black text-slate-600 uppercase italic pt-6 border-t border-white/5 mb-6">
              <span className="flex items-center gap-2"><Users size={14} /> Pilote: {doc.owner}</span>
              <span className="flex items-center gap-2"><Calendar size={14} /> MAJ: {doc.lastUpdate}</span>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all text-[10px] uppercase italic border-none cursor-pointer shadow-lg">Visualiser</button>
              <button className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-5 rounded-2xl transition-all border border-white/5 cursor-pointer"><Download size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, icon, description }: any) {
  return (
    <div className="mb-8 animate-in slide-in-from-left-5 duration-500">
      <div className="flex items-center gap-5 mb-3">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-inner">{icon}</div>
        <h2 className="text-4xl font-black uppercase italic tracking-tighter">{title}</h2>
      </div>
      <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] italic ml-1">{description}</p>
    </div>
  );
}

// --- GÉNÉRATEUR DE DONNÉES MOCK (RD 2026) ---

async function generateMockCertificationData() {
  return {
    iso9001: { status: 'IN_PROGRESS', progress: 78, maturityScore: 78, requirementsMet: 89, totalRequirements: 114, nextStep: 'Validation de la revue de direction Q1 2026' },
    iso14001: { status: 'GAP_ANALYSIS', progress: 65, maturityScore: 65, requirementsMet: 68, totalRequirements: 105, nextStep: 'Finalisation du registre des aspects environnementaux' },
    legal: { status: 'IN_PROGRESS', progress: 82, maturityScore: 82, requirementsMet: 28, totalRequirements: 34, nextStep: 'Dépôt du rapport annuel au Ministère' },
    clauseCompliance: [
      { id: '4.1', standard: 'ISO 9001', number: '4.1', title: 'Contexte de l\'organisation', description: 'Identification des enjeux internes et externes critiques', compliance: 95, compliantItems: ['Analyse SWOT Matrix v2.6', 'Cartographie des parties intéressées dynamique', 'Registre des risques stratégiques scellé'], gaps: [{ description: 'Veille réglementaire ISO non automatisée', priority: 'MOYENNE' }], recommendedActions: ['Activer le module Intelligence Réglementaire', 'Documenter l\'impact du climat local sur les opérations'] },
      { id: '6.1', standard: 'ISO 14001', number: '6.1', title: 'Actions face aux risques', description: 'Détermination des aspects environnementaux significatifs (AES)', compliance: 70, compliantItems: ['Inventaire des flux énergétiques', 'Calculateur carbone Scope 1/2 opérationnel'], gaps: [{ description: 'Objectifs de réduction eau non formalisés', priority: 'ÉLEVÉE' }, { description: 'Absence de plan de secours environnemental sur site B', priority: 'CRITIQUE' }], recommendedActions: ['Définir les KPIs de réduction d\'eau 2026', 'Attribuer les budgets de mitigation HSE', 'Simuler un incident environnemental majeur'] }
    ],
    qualityKpis: [
      { label: 'Indice Conformité Produit', value: '98.7%', trend: 2, description: 'Objectif Qualisoft: ≥ 98%' },
      { label: 'Incidence Clients', value: '3', trend: -1, description: 'Seuil critique: 5/mois', alert: 'Hausse anormale sur le secteur Nord' },
      { label: 'Vitesse Levée NC', value: '14j', trend: 1, description: 'Délai moyen de traitement' },
      { label: 'Efficacité Audits', value: '92%', trend: 1, description: 'Taux de levée des actions d\'audit' }
    ],
    environmentKpis: [
      { label: 'Intensité Énergétique', value: '8,45 MWh', trend: -2, description: 'Optimisation continue en cours' },
      { label: 'Taux Recyclage Global', value: '72%', trend: 3, description: 'Cible 2026: 75%' },
      { label: 'Consommation Eau / FTE', value: '12 L', trend: 0, description: 'Stable sur 3 mois' },
      { label: 'Zero Incident Majeur', value: '100%', trend: 1, description: 'Status Conformité Totale' }
    ],
    priorityActions: {
      quality: [
        { title: 'Scellage de la procédure NC', description: 'Intégrer le flux d\'approbation automatisé pour les non-conformités process.', priority: 'CRITICAL', responsible: 'RQ Master', deadline: '20/02/2026', status: 'À DÉMARRER' },
        { title: 'Revue Direction Q1', description: 'Préparer les data-viz pour l\'arbitrage budgétaire de la direction.', priority: 'HIGH', responsible: 'DG / RQ', deadline: '05/03/2026', status: 'EN COURS' }
      ],
      environment: [
        { title: 'Monitoring Capteurs Énergie', description: 'Liaison temps réel entre les compteurs et l\'API Analytics Qualisoft.', priority: 'HIGH', responsible: 'Lead HSE', deadline: '15/03/2026', status: 'TESTS' }
      ]
    },
    timeline: [
      { title: 'Audit à Blanc Qualité', description: 'Simulation complète avant audit de certification AFNOR.', date: '12/03/2026', status: 'UPCOMING', responsible: 'Expert Externe', deliverables: ['Rapport de conformité §10', 'Liste des écarts critiques'] },
      { title: 'Audit Étape 1 ISO 14001', description: 'Vérification documentaire par l\'organisme certificateur.', date: '25/04/2026', status: 'UPCOMING', responsible: 'Direction', deliverables: ['Dossier AES', 'Politique Environnementale'] }
    ],
    documentation: [
      { title: 'Manuel SMI Intégré', description: 'Cadre normatif unifié ISO 9001 & 14001 v2.6', category: 'MANUAL', owner: 'RQ', lastUpdate: '10/01/2026', status: 'APPROVED' },
      { title: 'Registre AES Sénégal', description: 'Analyse des impacts environnementaux site Dakar/Thiès', category: 'RECORD', owner: 'HSE', lastUpdate: '05/02/2026', status: 'DRAFT' }
    ]
  };
}