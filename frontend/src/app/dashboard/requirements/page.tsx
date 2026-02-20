/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client'; // Importation du client API centralisé
import { 
  Plus, Search, Filter, CheckCircle, 
  AlertTriangle, Clock, FileText, Calendar,
  Loader2, ArrowUpRight, Scale, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * ⚖️ MODULE : VEILLE RÉGLEMENTAIRE & CONFORMITÉ
 * -------------------------------------------------------------------------
 * RÔLE : Gestionnaire central des textes de lois, décrets et arrêtés.
 * CONFORMITÉ : ISO 9001, 14001, 45001 §6.1.3 (Exigences légales).
 * FONCTIONNALITÉS : Statuts de conformité, niveaux de priorité, suivi des échéances.
 */

interface Requirement {
  RR_Id: string;
  RR_Title: string;
  RR_Category: string; // ENVIRONNEMENT, SECURITE, SOCIAL...
  RR_Type: string; // LOI, DECRET, ARRETE...
  RR_Reference: string;
  RR_DueDate: string;
  RR_Status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
  RR_Priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
}

export default function RequirementsPage() {
  // --- ÉTATS DE DONNÉES ET FILTRAGE ---
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * 📡 PROTOCOLE DE SYNCHRONISATION DES EXIGENCES
   * Récupère le référentiel légal depuis le serveur.
   */
  const fetchRequirements = useCallback(async () => {
    try {
      setLoading(true);
      // Simulation ou Appel API réel
      // const res = await apiClient.get('/requirements');
      // setRequirements(res.data);

      // Données de simulation (Mock) pour le rendu immédiat Elite
      setTimeout(() => {
        setRequirements([
          {
            RR_Id: '1',
            RR_Title: 'DÉCLARATION ANNUELLE DES DÉCHETS DANGEREUX',
            RR_Category: 'ENVIRONNEMENT',
            RR_Type: 'ARRETE',
            RR_Reference: 'Arrêté n° 009876',
            RR_DueDate: '2026-03-31T00:00:00.000Z',
            RR_Status: 'PENDING',
            RR_Priority: 'HIGH'
          },
          {
            RR_Id: '2',
            RR_Title: 'RENOUVELLEMENT COMITÉ SANTÉ SÉCURITÉ (CSST)',
            RR_Category: 'SÉCURITÉ',
            RR_Type: 'CODE_TRAVAIL',
            RR_Reference: 'Art. L.184',
            RR_DueDate: '2026-02-15T00:00:00.000Z',
            RR_Status: 'COMPLIANT',
            RR_Priority: 'CRITICAL'
          }
        ]);
        setLoading(false);
      }, 800);
    } catch (e) {
      toast.error("Échec de synchronisation du référentiel légal");
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequirements(); }, [fetchRequirements]);

  /**
   * 🔍 MOTEUR DE RECHERCHE OPTIMISÉ (React Compiler Ready)
   * Filtre les textes par titre, référence ou catégorie.
   */
  const filteredRequirements = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return requirements.filter(req => 
      req.RR_Title.toLowerCase().includes(term) || 
      req.RR_Reference.toLowerCase().includes(term) ||
      req.RR_Category.toLowerCase().includes(term)
    );
  }, [requirements, searchTerm]);

  /**
   * 🎨 GÉNÉRATEUR DE STATUT VISUEL
   * Définit l'identité chromatique du statut de conformité.
   */
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'NON_COMPLIANT': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  };

  /**
   * 🚩 COMPOSANT BADGE DE PRIORITÉ
   * Rendu visuel de l'urgence selon l'impact sur le SMI.
   */
  const PriorityBadge = ({ priority }: { priority: string }) => {
    switch (priority) {
      case 'CRITICAL': return <span className="px-3 py-1 bg-rose-600 text-white text-[9px] font-black uppercase italic rounded-lg shadow-lg shadow-rose-900/20">Critique</span>;
      case 'HIGH': return <span className="px-3 py-1 bg-orange-600 text-white text-[9px] font-black uppercase italic rounded-lg">Élevée</span>;
      default: return <span className="px-3 py-1 bg-slate-800 text-slate-400 text-[9px] font-black uppercase italic rounded-lg border border-white/5">Moyenne</span>;
    }
  };

  // --- ÉCRAN DE CHARGEMENT ÉLITE ---
  if (loading && requirements.length === 0) return (
    <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-blue-500 mb-6" size={50} />
      <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] italic animate-pulse">Scanning Regulatory Core...</span>
    </div>
  );

  return (
    <div className="p-12 bg-[#0B0F1A] min-h-screen text-white italic font-sans text-left selection:bg-blue-600/30">
      
      {/* 🛰️ HEADER SOUVERAIN */}
      <header className="mb-16 flex justify-between items-end border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-blue-500 mb-2">
             <Scale size={32} strokeWidth={2.5} />
             <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none text-white">
               Exigences <span className="text-blue-600">Réglementaires</span>
             </h1>
          </div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.5em] italic">
            ISO 14001 • ISO 45001 • VEILLE JURIDIQUE SÉNÉGAL & INT.
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-white hover:text-slate-900 px-10 py-6 rounded-2xl font-black uppercase text-xs transition-all shadow-[0_20px_50px_rgba(37,99,235,0.2)] border-none cursor-pointer flex items-center gap-3 active:scale-95">
          <Plus size={20} /> Nouvelle Exigence
        </button>
      </header>

      {/* 📊 GRID DES INDICATEURS DE CONFORMITÉ (§9.1.2) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <StatCard label="Total Textes" val={requirements.length} icon={FileText} color="text-slate-400" />
        <StatCard 
            label="Conformes" 
            val={requirements.filter(r => r.RR_Status === 'COMPLIANT').length} 
            icon={CheckCircle} 
            color="text-emerald-500" 
        />
        <StatCard label="À Échéance (30j)" val={1} icon={Clock} color="text-amber-500" />
        <StatCard 
            label="Non-Conformes" 
            val={requirements.filter(r => r.RR_Status === 'NON_COMPLIANT').length} 
            icon={AlertTriangle} 
            color="text-rose-500" 
        />
      </div>

      {/* 🧭 FILTRES ET RECHERCHE TACTIQUE */}
      <div className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row gap-6 mb-12 backdrop-blur-3xl shadow-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="RECHERCHER UNE LOI, UN DÉCRET, UN ARTICLE..." 
            className="w-full pl-16 pr-8 py-5 bg-[#0B0F1A] border border-white/10 rounded-2xl text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-500 shadow-inner transition-all placeholder:text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
            <button className="flex items-center gap-3 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-slate-900 text-slate-400 font-black uppercase text-[10px] italic transition-all cursor-pointer">
              <Filter className="h-4 w-4" /> Filtres
            </button>
            <button className="flex items-center gap-3 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-slate-900 text-slate-400 font-black uppercase text-[10px] italic transition-all cursor-pointer">
              <Calendar className="h-4 w-4" /> Vue Calendrier
            </button>
        </div>
      </div>

      {/* 🏛️ REGISTRE DES EXIGENCES (CONTRÔLE DOCUMENTAIRE §7.5) */}
      <div className="bg-slate-900/40 rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-white/5 border-b border-white/5">
            <tr>
              <th className="px-10 py-8 font-black uppercase text-[10px] text-slate-500 tracking-widest italic leading-none">Référence / Titre du texte</th>
              <th className="px-10 py-8 font-black uppercase text-[10px] text-slate-500 tracking-widest italic leading-none">Catégorie</th>
              <th className="px-10 py-8 font-black uppercase text-[10px] text-slate-500 tracking-widest italic leading-none">Urgence</th>
              <th className="px-10 py-8 font-black uppercase text-[10px] text-slate-500 tracking-widest italic leading-none">Échéance</th>
              <th className="px-10 py-8 font-black uppercase text-[10px] text-slate-500 tracking-widest italic leading-none">Conformité</th>
              <th className="px-10 py-8 font-black uppercase text-[10px] text-slate-500 tracking-widest italic leading-none text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredRequirements.map((req) => (
              <tr key={req.RR_Id} className="hover:bg-white/5 transition-colors group">
                <td className="px-10 py-8">
                  <div className="text-left">
                    <p className="font-black text-white uppercase italic text-sm tracking-tighter group-hover:text-blue-400 transition-colors">{req.RR_Title}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest opacity-60 italic">{req.RR_Reference} • {req.RR_Type}</p>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase italic bg-blue-600/10 text-blue-500 border border-blue-600/20 tracking-widest leading-none">
                    {req.RR_Category}
                  </span>
                </td>
                <td className="px-10 py-8">
                  <PriorityBadge priority={req.RR_Priority} />
                </td>
                <td className="px-10 py-8 text-slate-400 font-black text-xs italic leading-none">
                  {new Date(req.RR_DueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </td>
                <td className="px-10 py-8">
                  <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black uppercase italic tracking-widest border leading-none ${getStatusStyle(req.RR_Status)}`}>
                    {req.RR_Status === 'PENDING' ? 'À TRAITER' : 
                     req.RR_Status === 'COMPLIANT' ? 'CONFORME' : 'NON CONFORME'}
                  </span>
                </td>
                <td className="px-10 py-8 text-right">
                  <button className="bg-white/5 hover:bg-blue-600 hover:text-white p-4 rounded-xl text-blue-500 font-black uppercase text-[9px] italic transition-all border-none cursor-pointer flex items-center gap-2 ml-auto shadow-inner group/btn">
                    DÉTAILS <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRequirements.length === 0 && (
          <div className="p-20 text-center text-slate-600 font-black uppercase italic tracking-widest opacity-20">
            Aucune exigence détectée dans ce périmètre.
          </div>
        )}
      </div>
    </div>
  );
}

/** 🛠️ COMPOSANTS ATOMIQUES */

function StatCard({ label, val, icon: Icon, color }: any) {
  return (
    <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-white/10 transition-all">
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Icon size={80} />
      </div>
      <div className="flex items-center justify-between relative z-10 mb-4">
        <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest italic leading-none">{label}</span>
        <Icon className={`h-5 w-5 ${color} opacity-60`} />
      </div>
      <p className={`text-4xl font-black italic tracking-tighter relative z-10 ${color}`}>{val}</p>
    </div>
  );
}