/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : CHAMBRE FORTE (ARCHIVES SMI)
 * -------------------------------------------------------------------------
 * RÔLE : Coffre-fort numérique pour la conformité ISO 9001 (§7.5.3).
 * FIX : Correction de la structure HTML du tableau (`<tr>`/`<td>`), 
 * ajout du composant Toaster, et sécurisation du payload API.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 13:05 GMT
 */

'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Archive, RotateCcw, Search, Database, 
  FileText, GitBranch, Wrench, GraduationCap, 
  ShieldCheck, RefreshCw, Activity, LucideIcon
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- INTERFACES STRICTES ---
interface ArchiveItem {
  id: string;
  type: 'DOCUMENT' | 'PROCESSUS' | 'EQUIPEMENT' | 'FORMATION' | string;
  title: string;
  ref?: string;
  date: string;
}

interface StatCardProps {
  title: string;
  val: string | number;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'amber';
}

interface TabBtnProps {
  label: string;
  type: string;
  active: string;
  onClick: (type: string) => void;
  icon: LucideIcon;
}

export default function ArchivesPage() {
  const [data, setData] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchArchives = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/archives').catch(() => ({ data: [] }));
      
      // Sécurisation stricte : garantie que setData reçoit un tableau
      const archivesData = res.data?.data || res.data;
      setData(Array.isArray(archivesData) ? archivesData : []);
    } catch (e) { 
      toast.error("Échec de connexion à la chambre forte"); 
      setData([]);
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchArchives(); }, [fetchArchives]);

  const handleRestore = async (id: string, type: string) => {
    const tid = toast.loading("Extraction depuis le coffre-fort...");
    try {
      await apiClient.post('/archives/restore', { id, type });
      toast.success(`${type} restauré avec succès dans le SMI actif`, { id: tid });
      fetchArchives();
    } catch (e) { 
      toast.error("Échec du protocole de restauration", { id: tid }); 
    }
  };

  const filtered = useMemo(() => {
    return data.filter(item => {
      // Sécurisation des appels .toLowerCase()
      const title = item.title || '';
      const ref = item.ref || '';
      
      const matchSearch = title.toLowerCase().includes(search.toLowerCase()) || 
                          ref.toLowerCase().includes(search.toLowerCase());
      const matchTab = activeTab === 'ALL' || item.type === activeTab;
      
      return matchSearch && matchTab;
    });
  }, [data, search, activeTab]);

  if (loading) return (
    <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <RefreshCw className="animate-spin text-blue-600" size={60} strokeWidth={1.5} />
      <span className="text-blue-500 font-black italic uppercase tracking-[1em] text-[10px] animate-pulse">
        Déverrouillage du Coffre...
      </span>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col overflow-hidden selection:bg-blue-600/30">
      
      {/* Composant Toaster (Crucial pour voir les messages toast.success/error) */}
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* HEADER PANORAMIQUE */}
      <header className="px-12 py-8 border-b border-white/5 flex justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl shrink-0">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic leading-none flex items-center gap-6 m-0">
            <Archive className="text-blue-600" size={40} /> Chambre <span className="text-blue-600">Forte</span>
          </h1>
          <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.4em] mt-3 italic flex items-center gap-3 m-0">
            <ShieldCheck size={14} className="text-amber-500" /> CONSERVATION DES INFORMATIONS DOCUMENTÉES §7.5.3
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="RECHERCHER DANS L'HISTORIQUE..." 
              className="bg-white/5 border border-white/10 rounded-3xl py-4 pl-14 pr-6 text-[10px] lg:text-[11px] font-black outline-none w-72 lg:w-96 focus:border-blue-600 transition-all uppercase italic text-white shadow-inner"
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* DASHBOARD CORE */}
      <main className="flex-1 p-8 lg:p-12 grid grid-cols-12 grid-rows-6 gap-6 overflow-hidden">
        
        {/* STATS DE CONSERVATION */}
        <div className="col-span-12 row-span-1 grid grid-cols-2 lg:grid-cols-4 gap-6 shrink-0 h-auto">
          <StatCard title="Total Archivé" val={data.length} icon={Database} color="blue" />
          <StatCard title="Taux de Rétention" val="100%" icon={ShieldCheck} color="emerald" />
          <StatCard title="Dernier Retrait" val={data[0] ? new Date(data[0].date).toLocaleDateString() : 'N/A'} icon={Activity} color="amber" />
          <div className="bg-blue-600/5 border border-blue-600/20 rounded-[2.5rem] lg:rounded-[3rem] p-5 lg:p-6 flex items-center justify-center text-center shadow-inner h-full">
            <p className="text-[9px] lg:text-[10px] font-black uppercase text-blue-500 italic leading-tight m-0">
              Algorithme de purge : <br/><span className="text-white text-[11px] lg:text-[12px] mt-1 block">Désactivé (Souveraineté Totale)</span>
            </p>
          </div>
        </div>

        {/* NAVIGATION PAR TYPE (TABS) */}
        <div className="col-span-12 row-span-1 flex items-center gap-3 bg-white/5 p-3 rounded-4xl border border-white/10 shrink-0 self-start">
          <TabBtn label="Tout" type="ALL" active={activeTab} onClick={setActiveTab} icon={Archive} />
          <TabBtn label="Documents" type="DOCUMENT" active={activeTab} onClick={setActiveTab} icon={FileText} />
          <TabBtn label="Processus" type="PROCESSUS" active={activeTab} onClick={setActiveTab} icon={GitBranch} />
          <TabBtn label="Actifs" type="EQUIPEMENT" active={activeTab} onClick={setActiveTab} icon={Wrench} />
          <TabBtn label="Formations" type="FORMATION" active={activeTab} onClick={setActiveTab} icon={GraduationCap} />
        </div>

        {/* LISTE DES ARCHIVES (Tableau Strictement Formaté) */}
        <div className="col-span-12 row-span-4 bg-slate-900/20 border-2 border-white/5 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm min-h-0">
           <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-200">
                <thead className="sticky top-0 bg-[#0B0F1A] z-20 border-b-2 border-white/5">
                  <tr className="text-[9px] lg:text-[10px] font-black uppercase text-slate-500 italic tracking-[0.3em]">
                    <th className="p-6 lg:p-8 w-40">Type</th>
                    <th className="p-6 lg:p-8 w-2/5">Désignation & Référence</th>
                    <th className="p-6 lg:p-8">Date d&apos;Archivage</th>
                    <th className="p-6 lg:p-8 text-right w-56">Action Souveraine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.length > 0 ? filtered.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-blue-600/5 transition-all group">
                      
                      {/* TYPE */}
                      <td className="p-6 lg:p-8">
                        <span className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-[9px] font-black uppercase text-slate-400 italic shadow-inner whitespace-nowrap">
                          {item.type}
                        </span>
                      </td>
                      
                      {/* DÉSIGNATION & REF */}
                      <td className="p-6 lg:p-8">
                        <p className="text-base lg:text-lg font-black uppercase text-white tracking-tighter leading-none m-0 group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[9px] lg:text-[10px] font-black text-blue-500 mt-2 italic tracking-widest m-0 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {item.ref || 'SANS RÉFÉRENCE'}
                        </p>
                      </td>
                      
                      {/* DATE ARCHIVAGE */}
                      <td className="p-6 lg:p-8 text-[11px] lg:text-[12px] font-bold text-slate-400 italic tracking-widest">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      
                      {/* ACTIONS */}
                      <td className="p-6 lg:p-8 text-right">
                        <button 
                          onClick={() => handleRestore(item.id, item.type)}
                          className="px-6 py-4 bg-blue-600/10 text-blue-500 border border-blue-600/20 rounded-2xl text-[9px] lg:text-[10px] font-black uppercase italic hover:bg-blue-600 hover:text-white hover:shadow-xl hover:shadow-blue-600/20 transition-all flex items-center gap-3 ml-auto cursor-pointer"
                        >
                          <RotateCcw size={16} className="group-hover:-rotate-180 transition-transform duration-500" /> 
                          Restaurer
                        </button>
                      </td>

                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="p-20 text-center text-slate-500 font-black text-xs uppercase italic tracking-[0.4em]">
                        <Archive size={48} className="mx-auto mb-6 opacity-50" />
                        Aucune archive ne correspond à vos critères.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>
      </main>

      {/* 🧪 INJECTION CSS SÉCURISÉE */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}} />
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function StatCard({ title, val, icon: Icon, color }: StatCardProps) {
  const themes = {
    blue: {
      text: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/10 text-blue-500'
    },
    emerald: {
      text: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-500'
    },
    amber: {
      text: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/10 text-amber-500'
    }
  };

  const theme = themes[color] || themes.blue;

  return (
    <div className={`bg-[#0F172A]/60 border ${theme.border} p-6 lg:p-8 rounded-[2.5rem] lg:rounded-[3rem] flex items-center gap-6 shadow-inner h-full transition-transform hover:-translate-y-1`}>
      <div className={`p-4 lg:p-5 rounded-2xl lg:rounded-3xl ${theme.iconBg} shrink-0`}>
        <Icon size={24} className="lg:w-8 lg:h-8" />
      </div>
      <div>
        <p className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-2 m-0">
          {title}
        </p>
        <p className={`text-3xl lg:text-4xl font-black italic ${theme.text} tracking-tighter m-0 leading-none`}>
          {val}
        </p>
      </div>
    </div>
  );
}

function TabBtn({ label, type, active, onClick, icon: Icon }: TabBtnProps) {
  const isActive = active === type;
  return (
    <button 
      onClick={() => onClick(type)}
      className={`px-6 py-4 lg:px-8 lg:py-5 rounded-2xl lg:rounded-3xl text-[9px] lg:text-[10px] font-black uppercase italic flex items-center gap-3 transition-all cursor-pointer tracking-widest border-none ${
        isActive 
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
        : 'bg-transparent text-slate-500 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );
}