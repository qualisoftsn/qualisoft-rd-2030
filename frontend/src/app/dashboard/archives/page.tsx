/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : CHAMBRE FORTE (ARCHIVES SMI) (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Coffre-fort numérique pour la conformité ISO 9001 (§7.5.3).
 * FIX : UI ClickUp 100dvh (Zéro Scroll Global), PWA Ready (retrait ml-72).
 * SÉCURITÉ : Validation API stricte. Zéro NextAuth.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 00:25 GMT
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
      const title = item.title || '';
      const ref = item.ref || '';
      const matchSearch = title.toLowerCase().includes(search.toLowerCase()) || 
                          ref.toLowerCase().includes(search.toLowerCase());
      const matchTab = activeTab === 'ALL' || item.type === activeTab;
      return matchSearch && matchTab;
    });
  }, [data, search, activeTab]);

  if (loading) return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#0B0F1A] gap-6 text-white italic">
      <RefreshCw className="animate-spin text-blue-600" size={48} strokeWidth={2} />
      <span className="text-blue-500 font-black uppercase tracking-[0.5em] md:tracking-[1em] text-[10px] md:text-xs animate-pulse m-0">
        Déverrouillage du Coffre...
      </span>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 EN-TÊTE FIXE */}
      <header className="shrink-0 p-6 md:p-8 lg:px-12 border-b border-white/5 bg-[#0B0F1A]/90 backdrop-blur-md z-20 flex flex-col xl:flex-row justify-between xl:items-end gap-6 md:gap-8">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter italic leading-none flex items-center gap-4 md:gap-6 m-0 truncate">
            <Archive className="text-blue-600 shrink-0 md:w-10 md:h-10" size={32} /> 
            <span>Chambre <span className="text-blue-600">Forte</span></span>
          </h1>
          <p className="text-slate-500 font-bold text-[8px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.4em] mt-3 md:mt-4 italic flex items-center gap-2 md:gap-3 m-0 truncate">
            <ShieldCheck size={12} className="text-amber-500 shrink-0" /> 
            <span>CONSERVATION DES INFORMATIONS DOCUMENTÉES §7.5.3</span>
          </p>
        </div>
        
        <div className="flex gap-4 w-full xl:w-auto mt-2 xl:mt-0 shrink-0 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="relative w-full xl:w-80">
            <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="RECHERCHER DANS L'HISTORIQUE..." 
              className="w-full bg-[#0F172A] border border-white/10 rounded-2xl md:rounded-3xl py-3 md:py-4 pl-12 md:pl-14 pr-4 md:pr-6 text-[9px] md:text-[10px] font-black outline-none focus:border-blue-500 transition-all uppercase italic text-white shadow-inner placeholder:text-slate-600"
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* 📜 ZONE DE DÉFILEMENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-12">
        <div className="max-w-400 mx-auto space-y-6 md:space-y-8 flex flex-col min-h-full">
          
          {/* 📊 STATS DE CONSERVATION */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 shrink-0">
            <StatCard title="Total Archivé" val={data.length} icon={Database} color="blue" />
            <StatCard title="Taux Rétention" val="100%" icon={ShieldCheck} color="emerald" />
            <StatCard title="Dernier Retrait" val={data[0] ? new Date(data[0].date).toLocaleDateString() : 'N/A'} icon={Activity} color="amber" />
            <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl md:rounded-4xl p-4 md:p-6 flex items-center justify-center text-center shadow-inner h-full min-h-25">
              <p className="text-[8px] md:text-[9px] font-black uppercase text-blue-500 italic leading-tight m-0">
                Algorithme de purge : <br/><span className="text-white text-[10px] md:text-[11px] mt-1.5 md:mt-2 block">Désactivé (Souveraineté)</span>
              </p>
            </div>
          </div>

          {/* 📑 NAVIGATION PAR TYPE (TABS) */}
          <div className="flex gap-2 md:gap-3 bg-[#0F172A] p-2 rounded-2xl md:rounded-3xl border border-white/5 shrink-0 overflow-x-auto custom-scrollbar pb-2 md:pb-2">
            <TabBtn label="Tout" type="ALL" active={activeTab} onClick={setActiveTab} icon={Archive} />
            <TabBtn label="Documents" type="DOCUMENT" active={activeTab} onClick={setActiveTab} icon={FileText} />
            <TabBtn label="Processus" type="PROCESSUS" active={activeTab} onClick={setActiveTab} icon={GitBranch} />
            <TabBtn label="Actifs" type="EQUIPEMENT" active={activeTab} onClick={setActiveTab} icon={Wrench} />
            <TabBtn label="Formations" type="FORMATION" active={activeTab} onClick={setActiveTab} icon={GraduationCap} />
          </div>

          {/* 📋 LISTE DES ARCHIVES (Tableau) */}
          <div className="bg-[#0F172A]/80 border border-white/5 rounded-4xl md:rounded-[3rem] overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm flex-1 min-h-100">
             <div className="flex-1 overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-175">
                  <thead className="sticky top-0 bg-[#0B0F1A]/95 backdrop-blur-md z-20 border-b border-white/10">
                    <tr className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 italic tracking-[0.2em] md:tracking-[0.3em]">
                      <th className="p-4 md:p-6 lg:p-8 w-32 md:w-40 whitespace-nowrap">Type</th>
                      <th className="p-4 md:p-6 lg:p-8">Désignation & Référence</th>
                      <th className="p-4 md:p-6 lg:p-8 w-32 md:w-48 whitespace-nowrap">Date d&apos;Archivage</th>
                      <th className="p-4 md:p-6 lg:p-8 text-right w-32 md:w-48 whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.length > 0 ? filtered.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-white/5 transition-all group cursor-default">
                        
                        <td className="p-4 md:p-6 lg:p-8">
                          <span className="bg-[#0B0F1A] px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-white/5 text-[8px] md:text-[9px] font-black uppercase text-slate-400 italic shadow-inner whitespace-nowrap">
                            {item.type}
                          </span>
                        </td>
                        
                        <td className="p-4 md:p-6 lg:p-8">
                          <p className="text-sm md:text-base lg:text-lg font-black uppercase text-white tracking-tighter leading-none m-0 group-hover:text-blue-400 transition-colors line-clamp-2">
                            {item.title}
                          </p>
                          <p className="text-[8px] md:text-[9px] font-black text-slate-500 mt-1.5 md:mt-2 italic tracking-widest m-0 flex items-center gap-2 truncate">
                            <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-slate-500 group-hover:bg-blue-500 transition-colors shrink-0" />
                            {item.ref || 'SANS RÉFÉRENCE'}
                          </p>
                        </td>
                        
                        <td className="p-4 md:p-6 lg:p-8 text-[9px] md:text-[10px] font-bold text-slate-400 italic tracking-widest whitespace-nowrap">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        
                        <td className="p-4 md:p-6 lg:p-8 text-right">
                          <button 
                            onClick={() => handleRestore(item.id, item.type)}
                            className="px-4 md:px-5 py-2.5 md:py-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] font-black uppercase italic hover:bg-blue-600 hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-2 md:gap-3 ml-auto cursor-pointer active:scale-95 m-0 whitespace-nowrap"
                          >
                            <RotateCcw size={14} className="group-hover:-rotate-180 transition-transform duration-500 md:w-4 md:h-4" /> 
                            <span className="hidden sm:inline">Restaurer</span>
                          </button>
                        </td>

                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="p-16 md:p-24 text-center text-slate-500 font-black text-[10px] md:text-xs uppercase italic tracking-[0.2em] md:tracking-[0.4em]">
                          <Archive size={40} className="mx-auto mb-4 md:mb-6 opacity-30 md:w-12 md:h-12" />
                          Aucune archive ne correspond à vos critères.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}} />
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function StatCard({ title, val, icon: Icon, color }: StatCardProps) {
  const themes = {
    blue: {
      text: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/10 text-blue-400'
    },
    emerald: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-400'
    },
    amber: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/10 text-amber-400'
    }
  };

  const theme = themes[color] || themes.blue;

  return (
    <div className={`bg-[#0F172A] border ${theme.border} p-4 md:p-6 rounded-2xl md:rounded-4xl flex items-center gap-3 md:gap-5 shadow-inner h-full min-h-25 transition-transform hover:-translate-y-1`}>
      <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${theme.iconBg} shrink-0`}>
        <Icon size={20} className="md:w-6 md:h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1.5 md:mb-2 m-0 truncate">
          {title}
        </p>
        <p className={`text-xl md:text-2xl lg:text-3xl font-black italic ${theme.text} tracking-tighter m-0 leading-none truncate`}>
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
      className={`px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] font-black uppercase italic flex items-center justify-center gap-2 md:gap-3 transition-all cursor-pointer tracking-widest border-none shrink-0 m-0 ${
        isActive 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
        : 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={14} className="md:w-4 md:h-4 shrink-0" /> <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}