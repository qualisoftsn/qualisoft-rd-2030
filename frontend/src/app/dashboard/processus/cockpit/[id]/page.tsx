/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/core/api/api-client';

// --- IMPORTATION DES MODULES DU COCKPIT ---
import GedView from '@/components/processus/GedView';

import { 
  GitBranch, FileText, CheckSquare, BarChart3, RefreshCcw, 
  Target, ShieldAlert, GraduationCap, Users, 
  Leaf, HardHat, Bell, Truck, Settings2,
  Plus, Search, Filter, MoreVertical, LayoutGrid, 
  Activity, Clock, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- TYPES DE MODULES ---
type ModuleType = 'ID' | 'GED' | 'ACTIONS' | 'KPI' | 'RISQUES' | 'REVIEWS' | 'EQUIPEMENTS' | 'RH' | 'SSE' | 'ENV' | 'TIERS';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function ProcessCockpit() {
  const { id } = useParams();
  const [process, setProcess] = useState<any>(null);
  const [activeModule, setActiveModule] = useState<ModuleType>('ID');
  const [loading, setLoading] = useState(true);

  const fetchProcessData = useCallback(async () => {
    try {
      setLoading(true);
      // Récupération des données 360° incluant documents, risques, indicateurs
      const res = await apiClient.get(`/processus/${id}`);
      setProcess(res.data);
    } catch (err) {
      toast.error("Échec de connexion au cockpit opérationnel");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProcessData(); }, [fetchProcessData]);

  if (loading) return (
    <div className="h-screen bg-[#0B0F1A] flex items-center justify-center ml-72">
      <Activity className="animate-spin text-blue-500" size={32} />
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col overflow-hidden">
      
      {/* 🚀 HEADER : IDENTITÉ SOUVERAINE (§4.4) */}
      <header className="px-8 py-5 border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-3xl flex justify-between items-center shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-900/40">
            <GitBranch size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded uppercase tracking-widest">{process?.PR_Code}</span>
              <h1 className="text-2xl font-black uppercase tracking-tighter italic leading-none">{process?.PR_Libelle}</h1>
            </div>
            <p className="text-slate-500 font-bold text-[8px] uppercase tracking-[0.4em] mt-2 italic flex items-center gap-2">
              Pilote : {process?.PR_Pilote?.U_FirstName} {process?.PR_Pilote?.U_LastName} • Famille : {process?.PR_Type?.PT_Family}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3 mr-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0B0F1A] bg-slate-800 flex items-center justify-center text-[9px] font-black italic text-slate-400 uppercase">U{i}</div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-[#0B0F1A] bg-blue-600 flex items-center justify-center text-[9px] font-black italic">+</div>
          </div>
          <button className="p-3 bg-white/5 hover:bg-blue-600/20 rounded-xl transition-all border border-white/5 group">
            <Bell size={18} className="text-slate-500 group-hover:text-blue-500" />
          </button>
          <button className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-black uppercase text-[10px] italic shadow-xl transition-all active:scale-95">
            Action de Pilotage
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* 🛠 NAVIGATION INTERNE (STYLE SUPABASE) */}
        <nav className="w-64 bg-[#0B1222] border-r border-white/5 flex flex-col p-4 gap-1 overflow-y-auto custom-scrollbar shrink-0">
          <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 px-4 italic">Gouvernance & Management</p>
          <NavBtn active={activeModule === 'ID'} icon={LayoutGrid} label="Identité §4.4" onClick={() => setActiveModule('ID')} />
          <NavBtn active={activeModule === 'GED'} icon={FileText} label="Documentation §7.5" onClick={() => setActiveModule('GED')} />
          <NavBtn active={activeModule === 'ACTIONS'} icon={CheckSquare} label="Plan d'Actions (PAQ)" onClick={() => setActiveModule('ACTIONS')} />
          <NavBtn active={activeModule === 'KPI'} icon={BarChart3} label="Tableau de Bord KPI" onClick={() => setActiveModule('KPI')} />
          <NavBtn active={activeModule === 'RISQUES'} icon={ShieldAlert} label="Analyse des Risques" onClick={() => setActiveModule('RISQUES')} />
          
          <div className="my-6 border-t border-white/5 mx-4" />
          
          <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 px-4 italic">Support & Conformité</p>
          <NavBtn active={activeModule === 'RH'} icon={Users} label="RH & Compétences" onClick={() => setActiveModule('RH')} />
          <NavBtn active={activeModule === 'EQUIPEMENTS'} icon={Settings2} label="Parc Équipements" onClick={() => setActiveModule('EQUIPEMENTS')} />
          <NavBtn active={activeModule === 'REVIEWS'} icon={RefreshCcw} label="Revues de Processus" onClick={() => setActiveModule('REVIEWS')} />
          <NavBtn active={activeModule === 'SSE'} icon={HardHat} label="Sécurité (SSE)" onClick={() => setActiveModule('SSE')} />
          <NavBtn active={activeModule === 'ENV'} icon={Leaf} label="Environnement / RSE" onClick={() => setActiveModule('ENV')} />
          <NavBtn active={activeModule === 'TIERS'} icon={Truck} label="Parties Intéressées" onClick={() => setActiveModule('TIERS')} />
        </nav>

        {/* 📺 ZONE DE TRAVAIL (THE WORKSPACE) */}
        <main className="flex-1 bg-[#0B0F1A] overflow-hidden flex flex-col">
          
          {/* BARRE D'OUTILS CONTEXTUELLE */}
          <div className="px-8 py-4 border-b border-white/5 flex justify-between items-center bg-white/2 shrink-0">
            <div className="flex items-center gap-4">
              <h3 className="text-[10px] font-black uppercase italic tracking-[0.2em] text-blue-500">{activeModule} HUB</h3>
              <div className="h-4 w-px bg-white/10" />
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={14} />
                <input type="text" placeholder="RECHERCHER DANS CE MODULE..." className="bg-transparent text-[9px] font-black outline-none pl-10 pr-4 py-1 uppercase italic w-64 placeholder:text-slate-700" />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-white/5 rounded-lg text-slate-600 hover:text-white transition-colors"><Filter size={15} /></button>
              <button className="p-2 hover:bg-white/5 rounded-lg text-slate-600 hover:text-white transition-colors"><MoreVertical size={15} /></button>
              <button className="ml-4 flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600 border border-blue-600/30 px-5 py-2 rounded-xl text-[9px] font-black uppercase italic transition-all active:scale-95">
                <Plus size={14} /> Nouveau
              </button>
            </div>
          </div>

          {/* RENDU DES MODULES DYNAMIQUES */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
             {activeModule === 'ID' && <IdentityView process={process} />}
             {activeModule === 'GED' && <GedView process={process} />}
             
             {/* PLACEHOLDERS POUR LES MODULES FUTURS */}
             {activeModule === 'ACTIONS' && <Placeholder module="Plan d'Actions" icon={CheckSquare} />}
             {activeModule === 'KPI' && <Placeholder module="Indicateurs de Performance" icon={BarChart3} />}
             {activeModule === 'RISQUES' && <Placeholder module="Matrice des Risques" icon={ShieldAlert} />}
             {activeModule === 'RH' && <Placeholder module="Matrice des Compétences" icon={GraduationCap} />}
             {activeModule === 'EQUIPEMENTS' && <Placeholder module="Gestion des Infrastructures" icon={Settings2} />}
             {activeModule === 'REVIEWS' && <Placeholder module="Revues & Audits" icon={RefreshCcw} />}
          </div>

        </main>
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS INTERNES ---

function NavBtn({ active, icon: Icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-500 group relative",
        active ? "bg-blue-600 text-white shadow-2xl shadow-blue-900/20 translate-x-2" : "text-slate-500 hover:text-white hover:bg-white/2"
      )}
    >
      <Icon size={16} className={cn("transition-transform duration-500", active ? "scale-110" : "group-hover:scale-110 group-hover:text-blue-500")} />
      <span className="text-[10px] font-black uppercase italic tracking-tight">{label}</span>
      {active && <div className="absolute left-0 w-1 h-4 bg-white rounded-full shadow-[0_0_10px_white]" />}
    </button>
  );
}

function IdentityView({ process }: any) {
  return (
    <div className="grid grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="col-span-8 space-y-10">
        <section className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] shadow-inner relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 text-blue-500/5 group-hover:scale-110 transition-transform duration-1000"><Target size={200} /></div>
          <h2 className="text-sm font-black uppercase italic mb-8 flex items-center gap-3 relative z-10">
             <Target className="text-blue-500" /> Finalités & Objectifs (§6.2)
          </h2>
          <p className="text-xs leading-relaxed text-slate-300 font-bold uppercase italic relative z-10">
            {process?.PR_Objectifs || "Aucun objectif stratégique n'a été formalisé pour ce processus. La définition d'objectifs mesurables est une exigence du chapitre 6.2 de l'ISO 9001:2015."}
          </p>
        </section>

        <div className="grid grid-cols-2 gap-10">
          <IdentityCard title="Ressources Matérielles" icon={Settings2} content={process?.PR_Ressources} />
          <IdentityCard title="Surveillance & Mesure" icon={Activity} content={process?.PR_Surveillance} />
        </div>
      </div>

      <div className="col-span-4 space-y-8">
        <div className="bg-blue-600/10 border border-blue-500/20 p-10 rounded-[3.5rem] relative overflow-hidden">
          <h3 className="text-[10px] font-black uppercase text-blue-500 mb-6 tracking-[0.2em] italic">Efficacité du Processus</h3>
          <div className="space-y-6">
             <ProgressItem label="Conformité Documentaire" val={85} />
             <ProgressItem label="Réalisation Actions" val={42} color="bg-amber-500" />
             <ProgressItem label="Atteinte Objectifs" val={92} color="bg-emerald-500" />
          </div>
        </div>

        <div className="bg-white/2 border border-white/5 p-10 rounded-[3.5rem] space-y-8">
           <InfoItem label="Version de la Fiche" val={`V${process?.PR_Version || 1}.0`} />
           <InfoItem label="Date de Révision" val={new Date(process?.PR_DateRevision || Date.now()).toLocaleDateString()} icon={Calendar} />
           <InfoItem label="Prochaine Revue" val="15 MARS 2026" icon={Clock} />
        </div>
      </div>
    </div>
  );
}

function IdentityCard({ title, icon: Icon, content }: any) {
  return (
    <div className="bg-white/2 border border-white/5 p-8 rounded-[3rem] group hover:border-blue-600/30 transition-all duration-500 shadow-sm">
       <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-blue-600 transition-colors"><Icon size={20} className="text-blue-500 group-hover:text-white" /></div>
          <h4 className="text-[11px] font-black uppercase italic text-slate-400">{title}</h4>
       </div>
       <p className="text-[10px] font-bold text-white uppercase italic leading-relaxed opacity-80">
          {content || "Donnée non renseignée dans la fiche d'identité."}
       </p>
    </div>
  );
}

function ProgressItem({ label, val, color = "bg-blue-500" }: any) {
  return (
    <div>
      <div className="flex justify-between text-[8px] font-black uppercase italic mb-2 tracking-widest">
        <span>{label}</span>
        <span>{val}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${val}%` }} />
      </div>
    </div>
  );
}

function InfoItem({ label, val, icon: Icon }: any) {
  return (
    <div className="flex items-center gap-4">
      {Icon && <Icon size={16} className="text-slate-600" />}
      <div>
        <p className="text-[8px] font-black text-slate-600 uppercase italic mb-1 tracking-widest">{label}</p>
        <p className="text-[11px] font-black text-white uppercase italic leading-none">{val}</p>
      </div>
    </div>
  );
}

function Placeholder({ module, icon: Icon }: any) {
  return (
    <div className="h-full flex flex-col items-center justify-center opacity-20 gap-6">
       <Icon size={80} strokeWidth={1} />
       <div className="text-center">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">{module}</h2>
          <p className="text-[10px] font-bold uppercase italic tracking-[0.3em]">Déploiement du module en cours...</p>
       </div>
    </div>
  );
}