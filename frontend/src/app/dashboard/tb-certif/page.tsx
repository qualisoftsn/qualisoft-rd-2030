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

  // Données de certification simulées (à remplacer par API réelle)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // TODO: Remplacer par appel API réel vers /api/certification/status
        const mockData = await generateMockCertificationData();
        setCertificationData(mockData);
      } catch (error) {
        console.error('Erreur chargement dashboard certification:', error);
        toast.error('Erreur lors du chargement des données de certification');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !certificationData) {
    return (
      <div className="ml-72 h-screen flex items-center justify-center bg-[#0B0F1A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6"></div>
          <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-widest">
            Chargement du Tableau de Bord de Certification ISO...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-72 min-h-screen bg-[#0B0F1A] text-white font-sans p-8">
      {/* HEADER STRATÉGIQUE */}
      <header className="mb-10 border-b border-white/5 pb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-linear-to-br from-blue-600 to-emerald-600 p-4 rounded-2xl shadow-lg shadow-blue-500/20">
                <ShieldCheck size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-6xl font-black uppercase italic tracking-tighter">
                  Tableau de <span className="text-blue-500">Bord</span> Certification
                </h1>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 italic">
                  ISO 9001:2015 • ISO 14001:2015 • Conformité Réglementaire Sénégal
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-4">
              <CertificationBadge 
                standard="ISO 9001" 
                status={certificationData.iso9001.status} 
                progress={certificationData.iso9001.progress}
                nextStep={certificationData.iso9001.nextStep}
              />
              <CertificationBadge 
                standard="ISO 14001" 
                status={certificationData.iso14001.status} 
                progress={certificationData.iso14001.progress}
                nextStep={certificationData.iso14001.nextStep}
              />
              <CertificationBadge 
                standard="LÉGAL SÉNÉGAL" 
                status={certificationData.legal.status} 
                progress={certificationData.legal.progress}
                nextStep={certificationData.legal.nextStep}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all shadow-lg">
              <FileText size={18} /> Rapport Certification
            </button>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all shadow-lg">
              <Download size={18} /> Export Audit
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all shadow-lg">
              <Plus size={18} /> Plan d&apos;Actions
            </button>
          </div>
        </div>

        {/* NAVIGATION PAR NORME */}
        <div className="flex bg-slate-900/50 border border-white/10 rounded-2xl p-1 w-fit">
          {(['GLOBAL', 'QUALITY', 'ENVIRONMENT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-white text-slate-900 shadow-md shadow-blue-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'GLOBAL' && 'Vue Globale'}
              {tab === 'QUALITY' && 'ISO 9001:2015'}
              {tab === 'ENVIRONMENT' && 'ISO 14001:2015'}
            </button>
          ))}
        </div>
      </header>

      {/* SECTION 1: MATURITÉ CERTIFICATION */}
      <section className="mb-10">
        <SectionHeader 
          title="Niveau de Maturité Certification" 
          icon={<BarChart3 className="text-blue-500" />}
          description="Évaluation globale de la conformité aux exigences des normes"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <MaturityCard 
            title="ISO 9001:2015" 
            score={certificationData.iso9001.maturityScore}
            status={certificationData.iso9001.status}
            requirementsMet={certificationData.iso9001.requirementsMet}
            totalRequirements={certificationData.iso9001.totalRequirements}
            color="from-blue-500 to-cyan-600"
          />
          
          <MaturityCard 
            title="ISO 14001:2015" 
            score={certificationData.iso14001.maturityScore}
            status={certificationData.iso14001.status}
            requirementsMet={certificationData.iso14001.requirementsMet}
            totalRequirements={certificationData.iso14001.totalRequirements}
            color="from-green-500 to-emerald-600"
          />
          
          <MaturityCard 
            title="Conformité Légale Sénégal" 
            score={certificationData.legal.maturityScore}
            status={certificationData.legal.status}
            requirementsMet={certificationData.legal.requirementsMet}
            totalRequirements={certificationData.legal.totalRequirements}
            color="from-amber-500 to-orange-600"
          />
        </div>

        {/* DÉTAIL PAR CLAUSE */}
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black uppercase">Détail par Clause de Norme</h3>
            <div className="flex gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase">Filtre:</span>
              <select className="bg-white/5 border border-white/10 rounded-xl px-3 py-1 text-[10px] font-black uppercase text-white">
                <option>ISO 9001:2015</option>
                <option>ISO 14001:2015</option>
                <option>Toutes les normes</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {certificationData.clauseCompliance.map((clause: any) => (
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

      {/* SECTION 2: INDICATEURS CRITIQUES */}
      <section className="mb-10">
        <SectionHeader 
          title="Indicateurs Clés de Performance (KPI)" 
          icon={<TrendingUp className="text-emerald-500" />}
          description="Suivi des performances qualité et environnementales"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <KpiDashboard 
            title="Performance Qualité ISO 9001" 
            kpis={certificationData.qualityKpis}
            icon={<Target className="text-blue-500" />}
          />
          
          <KpiDashboard 
            title="Performance Environnementale ISO 14001" 
            kpis={certificationData.environmentKpis}
            icon={<Leaf className="text-green-500" />}
          />
        </div>
      </section>

      {/* SECTION 3: ACTIONS PRIORITAIRES */}
      <section className="mb-10">
        <SectionHeader 
          title="Actions Prioritaires pour Certification" 
          icon={<AlertTriangle className="text-amber-500" />}
          description="Éléments critiques à traiter pour atteindre la certification"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PriorityActions 
            title="Actions ISO 9001" 
            actions={certificationData.priorityActions.quality}
            color="bg-blue-500/10 border-blue-500/20"
          />
          
          <PriorityActions 
            title="Actions ISO 14001" 
            actions={certificationData.priorityActions.environment}
            color="bg-green-500/10 border-green-500/20"
          />
        </div>
      </section>

      {/* SECTION 4: CALENDRIER CERTIFICATION */}
      <section className="mb-10">
        <SectionHeader 
          title="Calendrier du Processus de Certification" 
          icon={<Calendar className="text-purple-500" />}
          description="Échéances clés et prochaines étapes"
        />
        
        <CertificationTimeline events={certificationData.timeline} />
      </section>

      {/* SECTION 5: RESSOURCES & DOCUMENTATION */}
      <section>
        <SectionHeader 
          title="Documentation de Certification" 
          icon={<FileText className="text-slate-500" />}
          description="Documents essentiels pour l'audit de certification"
        />
        
        <DocumentationLibrary documents={certificationData.documentation} />
      </section>

      <footer className="mt-12 pt-8 border-t border-white/5 text-center">
        <p className="text-[8px] font-bold text-slate-600 uppercase italic tracking-[0.3em]">
          Qualisoft SMI • Plateforme de Certification ISO 9001 & ISO 14001 • Conformité Réglementaire Sénégal
        </p>
        <p className="text-[8px] font-bold text-slate-600 uppercase italic tracking-[0.3em] mt-2">
          ANSD • Ministère de l&apos;Environnement • INNORPI • AFNOR International
        </p>
      </footer>
    </div>
  );
}

// ========================
// COMPOSANTS RÉUTILISABLES
// ========================

function CertificationBadge({ standard, status, progress, nextStep }: any) {
  const getStatusColor = () => {
    if (status === 'CERTIFIED') return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
    if (status === 'IN_PROGRESS') return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
    if (status === 'GAP_ANALYSIS') return 'bg-amber-500/20 border-amber-500/30 text-amber-400';
    return 'bg-slate-500/20 border-white/10 text-slate-400';
  };

  return (
    <div className={`p-4 rounded-2xl border ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[8px] font-black uppercase tracking-widest">{standard}</span>
        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${
              status === 'CERTIFIED' ? 'bg-emerald-500' :
              status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-amber-500'
            }`} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <p className="text-lg font-black">{progress}%</p>
      <p className="text-[9px] mt-1 text-white/70 italic line-clamp-1">{nextStep}</p>
    </div>
  );
}

function MaturityCard({ title, score, status, requirementsMet, totalRequirements, color }: any) {
  return (
    <div className={`bg-linear-to-br ${color} p-6 rounded-3xl`}>
      <h3 className="text-xl font-black mb-4">{title}</h3>
      <div className="flex items-end justify-between mb-6">
        <div className="text-5xl font-black">{score}</div>
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
          status === 'EXCELLENT' ? 'bg-white/20 text-white' :
          status === 'BON' ? 'bg-white/30 text-white' : 'bg-white/40 text-white'
        }`}>
          {status}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black">
          <span>Exigences conformes</span>
          <span>{requirementsMet}/{totalRequirements}</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-white rounded-full" 
            style={{ width: `${(requirementsMet / totalRequirements) * 100}%` }}
          ></div>
        </div>
      </div>
      <button className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white font-black py-2 rounded-xl transition-colors text-[10px] uppercase tracking-widest">
        Détails de conformité
      </button>
    </div>
  );
}

function ClauseComplianceCard({ clause, onExpand, isExpanded }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <button 
        onClick={onExpand} 
        className="w-full p-5 text-left flex justify-between items-center hover:bg-white/10 transition-colors"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-black bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
              {clause.standard} §{clause.number}
            </span>
            <h4 className="font-black">{clause.title}</h4>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{clause.description}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  clause.compliance >= 90 ? 'bg-emerald-500' :
                  clause.compliance >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                }`} 
                style={{ width: `${clause.compliance}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-black">{clause.compliance}%</span>
          </div>
          <ChevronDown 
            className={`text-slate-500 transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`} 
            size={20} 
          />
        </div>
      </button>
      
      {isExpanded && (
        <div className="p-6 bg-slate-900/30 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h5 className="text-[10px] font-black uppercase text-slate-500 mb-2">Éléments Conformes</h5>
              <ul className="space-y-2">
                {clause.compliantItems.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-[10px]">
                    <CheckCircle className="text-emerald-500" size={14} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="text-[10px] font-black uppercase text-slate-500 mb-2">Écarts Identifiés</h5>
              <ul className="space-y-2">
                {clause.gaps.map((gap: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-[10px]">
                    <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={14} />
                    <span className="text-amber-400">{gap.description}</span>
                    <span className="ml-auto bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[8px] font-black">
                      {gap.priority}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="text-[10px] font-black uppercase text-slate-500 mb-2">Actions Recommandées</h5>
              <ul className="space-y-2">
                {clause.recommendedActions.map((action: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-[10px] text-blue-400">
                    <Plus className="text-blue-500" size={14} />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2 rounded-xl transition-colors text-[10px] uppercase">
                Générer Plan d&apos;Actions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiDashboard({ title, kpis, icon }: any) {
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-white/5 rounded-lg">{icon}</div>
        <h3 className="text-xl font-black">{title}</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {kpis.map((kpi: any, idx: number) => (
          <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[9px] font-black uppercase text-slate-500">{kpi.label}</p>
                <p className="text-2xl font-black mt-1">{kpi.value}</p>
              </div>
              <div className={`p-2 rounded-full ${
                kpi.trend > 0 ? 'bg-emerald-500/20 text-emerald-400' : 
                kpi.trend < 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
              }`}>
                {kpi.trend > 0 ? <TrendingUp size={16} /> : kpi.trend < 0 ? <TrendingUp size={16} className="rotate-180" /> : <Clock size={16} />}
              </div>
            </div>
            <p className="text-[9px] text-slate-500 mt-1">{kpi.description}</p>
            {kpi.alert && (
              <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-[8px] text-amber-400 flex items-center gap-1">
                  <AlertTriangle size={12} /> {kpi.alert}
                </p>
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
    <div className={`rounded-3xl p-6 ${color}`}>
      <h3 className="text-xl font-black mb-4 flex items-center gap-2">
        <AlertTriangle className="text-amber-400" /> {title}
      </h3>
      
      <div className="space-y-3">
        {actions.map((action: any, idx: number) => (
          <div 
            key={idx} 
            className="bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-black text-white">{action.title}</h4>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                action.priority === 'CRITICAL' ? 'bg-red-500/30 text-red-300 border border-red-500/40' :
                action.priority === 'HIGH' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40' :
                'bg-blue-500/30 text-blue-300 border border-blue-500/40'
              }`}>
                {action.priority}
              </span>
            </div>
            <p className="text-[10px] text-slate-300 mb-2">{action.description}</p>
            <div className="flex items-center justify-between text-[9px] text-slate-400">
              <span className="flex items-center gap-1">
                <Users size={14} /> {action.responsible}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} /> {action.deadline}
              </span>
              <span className="flex items-center gap-1">
                <FileText size={14} /> {action.status}
              </span>
            </div>
            <button className="mt-3 w-full bg-white/20 hover:bg-white/30 text-white font-black py-2 rounded-lg transition-colors text-[10px] uppercase">
              Traiter cette action
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificationTimeline({ events }: any) {
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
      <div className="relative pl-8 border-l-2 border-blue-500/30">
        {events.map((event: any, idx: number) => (
          <div key={idx} className="mb-8 relative">
            <div className="absolute -left-5 w-3 h-3 rounded-full border-4 border-blue-500 bg-slate-900"></div>
            <div className="ml-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-black text-lg">{event.title}</h4>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                  event.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                  event.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300' :
                  event.status === 'UPCOMING' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-500/20 text-slate-300'
                }`}>
                  {event.status}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mb-2">{event.description}</p>
              <div className="flex items-center gap-4 text-[9px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={14} /> {event.date}
                </span>
                {event.responsible && (
                  <span className="flex items-center gap-1">
                    <Users size={14} /> {event.responsible}
                  </span>
                )}
              </div>
              {event.deliverables && (
                <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-[9px] font-black uppercase text-slate-500 mb-2">Livrables:</p>
                  <ul className="space-y-1 text-[10px] text-slate-400">
                    {event.deliverables.map((deliverable: string, dIdx: number) => (
                      <li key={dIdx} className="flex items-start gap-2">
                        <ChevronRight size={14} className="text-blue-500 mt-1 shrink-0" />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
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
    <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black">Bibliothèque de Documents de Certification</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un document..." 
            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:border-blue-500 outline-none text-[10px] font-black uppercase"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc: any, idx: number) => (
          <div 
            key={idx} 
            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`p-2 rounded-lg ${
                doc.category === 'MANUAL' ? 'bg-blue-500/20 text-blue-400' :
                doc.category === 'PROCEDURE' ? 'bg-emerald-500/20 text-emerald-400' :
                doc.category === 'RECORD' ? 'bg-amber-500/20 text-amber-400' : 'bg-purple-500/20 text-purple-400'
              }`}>
                <FileText size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-white line-clamp-1">{doc.title}</h4>
                <p className="text-[9px] text-slate-400 mt-1">{doc.description}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-[9px] text-slate-500 mt-3 pt-3 border-t border-white/5">
              <span className="flex items-center gap-1">
                <Users size={12} /> {doc.owner}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} /> {doc.lastUpdate}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black ${
                doc.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' :
                doc.status === 'DRAFT' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {doc.status}
              </span>
            </div>
            
            <div className="mt-3 flex gap-2">
              <button className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-black py-1.5 rounded-lg transition-colors text-[9px] uppercase">
                Télécharger
              </button>
              <button className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-black py-1.5 rounded-lg transition-colors text-[9px] uppercase">
                Versionner
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, icon, description }: any) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
        <h2 className="text-3xl font-black uppercase tracking-tighter">{title}</h2>
      </div>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
        {description}
      </p>
    </div>
  );
}

// ========================
// DONNÉES MOCK POUR DÉMO
// ========================

async function generateMockCertificationData() {
  return {
    iso9001: {
      status: 'IN_PROGRESS',
      progress: 78,
      maturityScore: 78,
      requirementsMet: 89,
      totalRequirements: 114,
      nextStep: 'Finaliser revue de direction Q3'
    },
    iso14001: {
      status: 'GAP_ANALYSIS',
      progress: 65,
      maturityScore: 65,
      requirementsMet: 68,
      totalRequirements: 105,
      nextStep: 'Mettre en place suivi consommations'
    },
    legal: {
      status: 'IN_PROGRESS',
      progress: 82,
      maturityScore: 82,
      requirementsMet: 28,
      totalRequirements: 34,
      nextStep: 'Mettre à jour registre déchets dangereux'
    },
    clauseCompliance: [
      {
        id: '4.1',
        standard: 'ISO 9001',
        number: '4.1',
        title: 'Compréhension de l\'organisation',
        description: 'Déterminer les enjeux internes et externes pertinents',
        compliance: 95,
        compliantItems: [
          'Cartographie parties intéressées complète',
          'Analyse SWOT actualisée',
          'Registre des risques organisationnels'
        ],
        gaps: [
          { description: 'Veille réglementaire non formalisée', priority: 'MOYENNE' }
        ],
        recommendedActions: [
          'Mettre en place une veille réglementaire mensuelle',
          'Documenter les impacts des changements contextuels'
        ]
      },
      {
        id: '6.1',
        standard: 'ISO 14001',
        number: '6.1',
        title: 'Actions pour traiter les risques',
        description: 'Déterminer les aspects environnementaux significatifs',
        compliance: 70,
        compliantItems: [
          'Identification aspects environnementaux',
          'Évaluation impacts environnementaux'
        ],
        gaps: [
          { description: 'Objectifs environnementaux non définis', priority: 'ÉLEVÉE' },
          { description: 'Plan d\'actions incomplet', priority: 'CRITIQUE' }
        ],
        recommendedActions: [
          'Définir 3 objectifs environnementaux annuels',
          'Attribuer des responsables et délais',
          'Mettre en place suivi indicateurs'
        ]
      }
    ],
    qualityKpis: [
      { label: 'Taux de conformité produits', value: '98.7%', trend: 2, description: 'Objectif: ≥ 98%' },
      { label: 'Réclamations clients', value: '3', trend: -1, description: 'Objectif: ≤ 5/mois', alert: 'En hausse de 33% ce mois' },
      { label: 'Actions correctives ouvertes', value: '7', trend: 0, description: 'Délai moyen: 14 jours' },
      { label: 'Audits internes réalisés', value: '8/12', trend: 1, description: 'Planning annuel' }
    ],
    environmentKpis: [
      { label: 'Consommation énergétique', value: '8,450 kWh', trend: -2, description: 'Objectif: -5% annuel' },
      { label: 'Taux de recyclage', value: '72%', trend: 3, description: 'Objectif: ≥ 75%' },
      { label: 'Déchets dangereux', value: '120 kg', trend: 0, description: 'Stockage conforme' },
      { label: 'Incidents environnementaux', value: '1', trend: -1, description: 'Zéro incident critique' }
    ],
    priorityActions: {
      quality: [
        {
          title: 'Finaliser procédure gestion non-conformités',
          description: 'Documenter le processus de traitement des écarts qualité',
          priority: 'CRITICAL',
          responsible: 'Responsable Qualité',
          deadline: '15/11/2024',
          status: 'En retard'
        },
        {
          title: 'Organiser revue de direction Q3',
          description: 'Préparer les indicateurs et décisions pour la revue',
          priority: 'HIGH',
          responsible: 'DG',
          deadline: '30/11/2024',
          status: 'À planifier'
        }
      ],
      environment: [
        {
          title: 'Mettre en place suivi consommations énergie',
          description: 'Installer compteurs et tableau de bord mensuel',
          priority: 'HIGH',
          responsible: 'Responsable HSE',
          deadline: '10/12/2024',
          status: 'En cours'
        },
        {
          title: 'Définir objectifs environnementaux 2025',
          description: 'Fixer 3 objectifs SMART avec indicateurs de suivi',
          priority: 'MEDIUM',
          responsible: 'DG',
          deadline: '15/12/2024',
          status: 'À démarrer'
        }
      ]
    },
    timeline: [
      {
        title: 'Audit interne qualité',
        description: 'Audit processus production et supply chain',
        date: '05/11/2024',
        status: 'COMPLETED',
        responsible: 'Auditeur Interne',
        deliverables: [
          'Rapport d\'audit',
          'Plan d\'actions correctives',
          'Clôture des non-conformités'
        ]
      },
      {
        title: 'Revue de direction Q3',
        description: 'Analyse performance SMQ et décisions stratégiques',
        date: '25/11/2024',
        status: 'IN_PROGRESS',
        responsible: 'Direction Générale',
        deliverables: [
          'Rapport de revue',
          'Décisions et actions',
          'Mise à jour objectifs qualité'
        ]
      },
      {
        title: 'Préparation audit certification',
        description: 'Simulation audit et vérification conformité',
        date: '10/01/2025',
        status: 'UPCOMING',
        responsible: 'Responsable Qualité',
        deliverables: [
          'Checklist préparation audit',
          'Dossier de preuves',
          'Formation équipe audit'
        ]
      },
      {
        title: 'Audit certification ISO 9001',
        description: 'Audit stage 1 avec organisme certificateur',
        date: '15/02/2025',
        status: 'UPCOMING',
        responsible: 'Direction Générale',
        deliverables: [
          'Rapport d\'audit',
          'Plan d\'actions préalables',
          'Décision certification'
        ]
      }
    ],
    documentation: [
      { 
        title: 'Manuel Qualité', 
        description: 'Politique qualité et périmètre SMQ', 
        category: 'MANUAL', 
        owner: 'RQ', 
        lastUpdate: '15/10/2024', 
        status: 'APPROVED' 
      },
      { 
        title: 'Procédure Gestion Documents', 
        description: 'Contrôle et diffusion documents qualité', 
        category: 'PROCEDURE', 
        owner: 'RQ', 
        lastUpdate: '20/10/2024', 
        status: 'APPROVED' 
      },
      { 
        title: 'Registre Aspects Environnementaux', 
        description: 'Identification et évaluation impacts', 
        category: 'RECORD', 
        owner: 'HSE', 
        lastUpdate: '05/11/2024', 
        status: 'DRAFT' 
      }
    ]
  };
}