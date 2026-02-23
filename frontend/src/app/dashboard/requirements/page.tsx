/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client'; // Importation du client API centralisé SDE
import { 
  Plus, Search, Filter, CheckCircle, 
  AlertTriangle, Clock, FileText, Calendar,
  Loader2, ArrowUpRight, Scale, ShieldCheck,
  Activity, Fingerprint
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

/**
 * ⚖️ MODULE SDE : VEILLE RÉGLEMENTAIRE & CONFORMITÉ
 * -------------------------------------------------------------------------
 * RÔLE : Gestionnaire central multi-tenant des textes de lois, décrets et arrêtés.
 * CONFORMITÉ : ISO 9001, 14001, 45001 §6.1.3 (Exigences légales).
 * ARCHITECTURE : Connexion stricte au backend Matrix (Zéro simulation).
 * DESIGN : Cockpit Full-Space (max-w-500 / ml-72).
 * -------------------------------------------------------------------------
 */

// --- 🏗️ INTERFACES SCELLÉES SDE ---
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

// --- UTILITAIRE ---
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export default function RequirementsPage() {
  // --- 📦 ÉTATS DE DONNÉES ET FILTRAGE ---
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- ÉTATS FILTRAGE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  /**
   * 📡 PROTOCOLE DE SYNCHRONISATION DES EXIGENCES SDE
   * Récupère le référentiel légal depuis le serveur du Tenant.
   */
  const fetchRequirements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/requirements');
      const data = res.data?.data || res.data;
      setRequirements(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("ÉCHEC DE CONNEXION : RÉFÉRENTIEL LÉGAL INACCESSIBLE.");
      setRequirements([]); // Sécurité : pas de fausses données en production
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequirements(); }, []);

  /**
   * 🔍 MOTEUR DE RECHERCHE ET FILTRAGE COMBINÉ (Moteur React Compiler)
   * Filtre par texte (titre, ref) ET par menus déroulants (catégorie, statut).
   */
  const filteredRequirements = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return requirements.filter(req => {
      const matchText = req.RR_Title.toLowerCase().includes(term) || req.RR_Reference.toLowerCase().includes(term);
      const matchCat = selectedCategory === 'ALL' || req.RR_Category === selectedCategory;
      const matchStat = selectedStatus === 'ALL' || req.RR_Status === selectedStatus;
      return matchText && matchCat && matchStat;
    });
  }, [requirements, searchTerm, selectedCategory, selectedStatus]);

  /**
   * 📊 STATISTIQUES DYNAMIQUES
   */
  const stats = useMemo(() => {
    const now = new Date();
    const limit30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return {
      total: requirements.length,
      compliant: requirements.filter(r => r.RR_Status === 'COMPLIANT').length,
      nonCompliant: requirements.filter(r => r.RR_Status === 'NON_COMPLIANT').length,
      pending30d: requirements.filter(r => {
        if (r.RR_Status === 'COMPLIANT') return false;
        const due = new Date(r.RR_DueDate);
        return due >= now && due <= limit30Days;
      }).length
    };
  }, [requirements]);

  /**
   * 🎨 GÉNÉRATEURS DE STATUT VISUEL MATRIX
   */
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
      case 'NON_COMPLIANT': return 'bg-rose-500/10 text-rose-500 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]';
      default: return 'bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return 'CONFORME';
      case 'NON_COMPLIANT': return 'NON CONFORME';
      default: return 'À TRAITER';
    }
  };

  const PriorityBadge = ({ priority }: { priority: string }) => {
    switch (priority) {
      case 'CRITICAL': return <span className="px-4 py-2 bg-rose-600 text-white text-[10px] font-black uppercase italic rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.6)]">Critique</span>;
      case 'HIGH': return <span className="px-4 py-2 bg-orange-600/20 border-2 border-orange-600/40 text-orange-500 text-[10px] font-black uppercase italic rounded-xl">Élevée</span>;
      default: return <span className="px-4 py-2 bg-slate-800 border-2 border-white/5 text-slate-400 text-[10px] font-black uppercase italic rounded-xl">Moyenne</span>;
    }
  };

  // --- ÉCRAN DE CHARGEMENT ÉLITE ---
  if (loading) return (
    <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] gap-12">
      <div className="relative flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={120} strokeWidth={1} />
        <Scale className="absolute text-blue-600/20 animate-pulse" size={48} />
      </div>
      <p className="text-blue-500 font-black uppercase italic text-[14px] tracking-[1.5em]">
        Scan du Référentiel Légal...
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-16 ml-72 text-white font-sans italic text-left selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      <div className="w-full max-w-500 mx-auto space-y-20 animate-in fade-in duration-1000">
        
        {/* 🛰️ HEADER SOUVERAIN (§6.1.3) */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b-4 border-white/5 pb-16">
          <div className="space-y-8">
            <div className="flex items-center gap-6">
               <span className="px-6 py-2 rounded-2xl bg-blue-600/10 border-2 border-blue-600/20 text-blue-500 text-[12px] font-black uppercase tracking-[0.5em] flex items-center gap-4 italic shadow-inner">
                  <Fingerprint size={18} className="animate-pulse" /> ISO Compliance Matrix
               </span>
               <span className="px-6 py-2 rounded-2xl bg-amber-500/10 text-amber-500 text-[12px] font-black uppercase tracking-[0.5em] border-2 border-amber-500/20 italic shadow-inner">
                  Veille Juridique
               </span>
            </div>
            <h1 className="text-8xl font-black uppercase tracking-tighter italic leading-none text-white flex items-center gap-8">
               <div className="p-6 bg-blue-600 rounded-[2.5rem] shadow-[0_0_50px_rgba(37,99,235,0.4)]">
                 <Scale size={56} strokeWidth={2.5} className="text-white" />
               </div>
               Exigences <span className="text-blue-600">Légales</span>
            </h1>
            <p className="text-slate-500 font-black text-[14px] uppercase tracking-[0.8em] italic opacity-60">
              ISO 14001 • ISO 45001 • REGISTRE RÉGLEMENTAIRE SDE
            </p>
          </div>

          <div className="flex gap-8">
            <button className="bg-transparent border-4 border-white/5 hover:bg-white/5 text-slate-400 px-12 py-8 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.4em] transition-all cursor-pointer flex items-center gap-4 italic">
              <FileText size={24} /> Rapport de Conformité
            </button>
            <button className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-14 py-8 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.4em] transition-all shadow-[0_30px_80px_rgba(37,99,235,0.4)] border-none cursor-pointer flex items-center gap-5 active:scale-95 group italic">
              <Plus size={28} strokeWidth={4} className="group-hover:rotate-90 transition-transform" /> Nouvelle Exigence
            </button>
          </div>
        </header>

        {/* 📊 GRID DES INDICATEURS DE CONFORMITÉ (§9.1.2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <StatCard label="Base Documentaire" val={stats.total} icon={FileText} color="text-blue-500" bg="bg-blue-600/10" border="border-blue-600/20" />
          <StatCard label="Statut : Conformes" val={stats.compliant} icon={CheckCircle} color="text-emerald-500" bg="bg-emerald-500/10" border="border-emerald-500/20" />
          <StatCard label="Échéance Critique (30j)" val={stats.pending30d} icon={Clock} color="text-amber-500" bg="bg-amber-500/10" border="border-amber-500/20" />
          <StatCard label="Alerte : Non-Conformes" val={stats.nonCompliant} icon={AlertTriangle} color="text-rose-500" bg="bg-rose-500/10" border="border-rose-500/20" />
        </div>

        {/* 🧭 FILTRES ET RECHERCHE TACTIQUE (FULL SPACE) */}
        <div className="bg-[#151A2D] p-10 rounded-[4rem] border-4 border-white/5 flex flex-col xl:flex-row gap-10 backdrop-blur-3xl shadow-4xl relative z-20">
          
          <div className="relative flex-2">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-500" />
            <input 
              type="text" 
              placeholder="RECHERCHER UNE LOI, UN DÉCRET, UN ARTICLE..." 
              className="w-full pl-24 pr-10 py-10 bg-black/60 border-4 border-white/5 rounded-[3rem] text-[16px] font-black uppercase italic text-white outline-none focus:border-blue-600 shadow-inner transition-all placeholder:text-slate-700 tracking-widest"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-1 gap-6">
              <select 
                className="flex-1 bg-black/60 border-4 border-white/5 rounded-[3rem] px-10 py-10 text-[14px] font-black uppercase italic text-slate-400 outline-none focus:border-blue-600 shadow-inner transition-all appearance-none cursor-pointer tracking-widest"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="ALL">TOUS DOMAINES</option>
                <option value="ENVIRONNEMENT">ENVIRONNEMENT</option>
                <option value="SÉCURITÉ">SÉCURITÉ (SST)</option>
                <option value="QUALITÉ">QUALITÉ</option>
                <option value="SOCIAL">SOCIAL / RH</option>
              </select>

              <select 
                className="flex-1 bg-black/60 border-4 border-white/5 rounded-[3rem] px-10 py-10 text-[14px] font-black uppercase italic text-slate-400 outline-none focus:border-blue-600 shadow-inner transition-all appearance-none cursor-pointer tracking-widest"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">TOUS STATUTS</option>
                <option value="COMPLIANT">CONFORME</option>
                <option value="PENDING">À TRAITER</option>
                <option value="NON_COMPLIANT">NON CONFORME</option>
              </select>
          </div>
        </div>

        {/* 🏛️ REGISTRE DES EXIGENCES (CONTRÔLE DOCUMENTAIRE §7.5) */}
        <div className="bg-[#151A2D] rounded-[5rem] border-4 border-white/5 overflow-hidden shadow-4xl backdrop-blur-3xl animate-in slide-in-from-bottom-10 duration-1000">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-black/60 border-b-4 border-white/5">
                <tr>
                  <th className="px-12 py-10 font-black uppercase text-[12px] text-slate-500 tracking-[0.5em] italic leading-none">Référence / Titre du texte</th>
                  <th className="px-12 py-10 font-black uppercase text-[12px] text-slate-500 tracking-[0.5em] italic leading-none">Domaine SDE</th>
                  <th className="px-12 py-10 font-black uppercase text-[12px] text-slate-500 tracking-[0.5em] italic leading-none text-center">Urgence</th>
                  <th className="px-12 py-10 font-black uppercase text-[12px] text-slate-500 tracking-[0.5em] italic leading-none">Échéance</th>
                  <th className="px-12 py-10 font-black uppercase text-[12px] text-slate-500 tracking-[0.5em] italic leading-none text-center">Conformité</th>
                  <th className="px-12 py-10 font-black uppercase text-[12px] text-slate-500 tracking-[0.5em] italic leading-none text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-white/5">
                {filteredRequirements.map((req) => (
                  <tr key={req.RR_Id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-12 py-10">
                      <div className="text-left space-y-3">
                        <p className="text-[12px] text-blue-500 font-black uppercase tracking-[0.4em] italic leading-none">
                          {req.RR_Reference} • {req.RR_Type}
                        </p>
                        <p className="font-black text-white uppercase italic text-xl tracking-tighter group-hover:text-blue-400 transition-colors leading-tight">
                          {req.RR_Title}
                        </p>
                      </div>
                    </td>
                    <td className="px-12 py-10">
                      <span className="inline-flex items-center px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase italic bg-slate-800 text-slate-300 border-2 border-white/10 tracking-widest leading-none shadow-inner">
                        {req.RR_Category}
                      </span>
                    </td>
                    <td className="px-12 py-10 text-center">
                      <PriorityBadge priority={req.RR_Priority} />
                    </td>
                    <td className="px-12 py-10">
                       <div className="flex items-center gap-4 text-slate-400 font-black text-[13px] uppercase tracking-[0.3em] italic leading-none">
                          <Calendar size={18} className="opacity-50" />
                          {new Date(req.RR_DueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                       </div>
                    </td>
                    <td className="px-12 py-10 text-center">
                      <span className={cn("inline-flex items-center px-6 py-3 rounded-3xl text-[10px] font-black uppercase italic tracking-[0.4em] border-2 leading-none", getStatusStyle(req.RR_Status))}>
                        {getStatusLabel(req.RR_Status)}
                      </span>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <button className="bg-black/40 hover:bg-blue-600 hover:text-white px-6 py-4 rounded-2xl text-blue-500 font-black uppercase text-[11px] tracking-widest italic transition-all border-2 border-white/5 cursor-pointer flex items-center gap-3 ml-auto shadow-inner group/btn">
                        DÉTAILS <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredRequirements.length === 0 && (
                   <tr>
                     <td colSpan={6} className="p-32 text-center text-slate-500 font-black uppercase italic tracking-[0.5em] opacity-40">
                       Aucune exigence légale identifiée dans ce périmètre de recherche.
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
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

/** 🛠️ COMPOSANT ATOMIQUE : STAT CARD HAUTE FIDÉLITÉ */
function StatCard({ label, val, icon: Icon, color, bg, border }: any) {
  return (
    <div className="bg-[#151A2D] border-4 border-white/5 p-12 rounded-[4rem] shadow-4xl relative overflow-hidden group hover:bg-black/40 transition-all backdrop-blur-3xl text-left">
      <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
          <Icon size={150} />
      </div>
      <div className="flex items-center justify-between relative z-10 mb-10">
        <span className="text-slate-500 text-[12px] font-black uppercase tracking-[0.5em] italic leading-none">{label}</span>
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-inner", bg, border)}>
           <Icon className={cn("h-6 w-6", color)} />
        </div>
      </div>
      <p className={cn("text-7xl font-black italic tracking-tighter relative z-10 leading-none", color)}>{val}</p>
    </div>
  );
}