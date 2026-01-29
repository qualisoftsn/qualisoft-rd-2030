/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Archive, RotateCcw, Search, Database, 
  FileText, GitBranch, Wrench, GraduationCap, 
  AlertTriangle, Filter, Trash2, ShieldCheck,
  RefreshCw, Calculator, Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ArchivesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchArchives = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/archives');
      setData(res.data || []);
    } catch (e) { toast.error("Échec de connexion à la chambre forte"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchArchives(); }, []);

  const handleRestore = async (id: string, type: string) => {
    try {
      await apiClient.post('/archives/restore', { id, type });
      toast.success(`${type} restauré avec succès`);
      fetchArchives();
    } catch (e) { toast.error("Erreur de restauration"); }
  };

  const filtered = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.ref?.toLowerCase().includes(search.toLowerCase());
      const matchTab = activeTab === 'ALL' || item.type === activeTab;
      return matchSearch && matchTab;
    });
  }, [data, search, activeTab]);

  if (loading) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A]">
      <RefreshCw className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col overflow-hidden">
      
      {/* HEADER PANORAMIQUE */}
      <header className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-[#0B0F1A]/80 backdrop-blur-3xl shrink-0">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none flex items-center gap-4">
            <Archive className="text-blue-600" size={32} /> Chambre <span className="text-blue-600">Forte</span>
          </h1>
          <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.4em] mt-2 italic flex items-center gap-2">
            <ShieldCheck size={12} className="text-amber-500" /> CONSERVATION DES INFORMATIONS DOCUMENTÉES §7.5.3
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text" placeholder="RECHERCHER DANS L'HISTORIQUE..." 
              className="bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-[10px] font-black outline-none w-80 focus:border-blue-600 transition-all uppercase italic"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* DASHBOARD CORE */}
      <main className="flex-1 p-8 grid grid-cols-12 grid-rows-6 gap-6 overflow-hidden">
        
        {/* STATS DE CONSERVATION */}
        <div className="col-span-12 row-span-1 grid grid-cols-4 gap-6">
          <StatCard title="Total Archivé" val={data.length} icon={Database} color="blue" />
          <StatCard title="Taux de Rétention" val="100%" icon={ShieldCheck} color="emerald" />
          <StatCard title="Dernier Retrait" val={data[0] ? new Date(data[0].date).toLocaleDateString() : 'N/A'} icon={Activity} color="amber" />
          <div className="bg-blue-600/5 border border-blue-600/20 rounded-[2.5rem] p-5 flex items-center justify-center text-center">
            <p className="text-[9px] font-black uppercase text-blue-500 italic leading-tight">
              Algorithme de purge : <br/><span className="text-white text-[11px]">Désactivé (Souveraineté Totale)</span>
            </p>
          </div>
        </div>

        {/* NAVIGATION PAR TYPE (TABS) */}
        <div className="col-span-12 row-span-1 flex items-center gap-3 bg-white/2 p-2 rounded-3xl border border-white/5">
          <TabBtn label="Tout" type="ALL" active={activeTab} onClick={setActiveTab} icon={Archive} />
          <TabBtn label="Documents" type="DOCUMENT" active={activeTab} onClick={setActiveTab} icon={FileText} />
          <TabBtn label="Processus" type="PROCESSUS" active={activeTab} onClick={setActiveTab} icon={GitBranch} />
          <TabBtn label="Actifs" type="EQUIPEMENT" active={activeTab} onClick={setActiveTab} icon={Wrench} />
          <TabBtn label="Formations" type="FORMATION" active={activeTab} onClick={setActiveTab} icon={GraduationCap} />
        </div>

        {/* LISTE DES ARCHIVES */}
        <div className="col-span-12 row-span-4 bg-slate-900/20 border border-white/5 rounded-[3rem] overflow-hidden flex flex-col shadow-inner">
           <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#0B0F1A] z-20 border-b border-white/5">
                  <tr className="text-[8px] font-black uppercase text-slate-600 italic">
                    <th className="p-6">Type</th>
                    <th className="p-6">Désignation & Référence</th>
                    <th className="p-6">Date d&apos;Archivage</th>
                    <th className="p-6 text-right">Action Souveraine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-600/5 transition-all group">
                      <td className="p-6">
                        <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-[9px] font-black uppercase text-slate-400">
                          {item.type}
                        </span>
                      </td>
                      <td className="p-6">
                        <p className="text-sm font-black uppercase text-white tracking-tighter leading-none">{item.title}</p>
                        <p className="text-[8px] font-black text-blue-500 mt-2 italic">{item.ref || 'SANS RÉFÉRENCE'}</p>
                      </td>
                      <td className="p-6">
                        <p className="text-[10px] font-bold text-slate-400 italic">{new Date(item.date).toLocaleString()}</p>
                      </td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => handleRestore(item.id, item.type)}
                          className="px-6 py-2.5 bg-blue-600/10 text-blue-500 border border-blue-600/20 rounded-xl text-[9px] font-black uppercase italic hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 ml-auto"
                        >
                          <RotateCcw size={14} /> Restaurer l&apos;entité
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      </main>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function StatCard({ title, val, icon: Icon, color }: any) {
  const themes: any = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
  };
  return (
    <div className="bg-[#0F172A]/40 border border-white/5 p-5 rounded-[2.5rem] flex items-center gap-6">
      <div className={`p-4 rounded-2xl ${themes[color]}`}><Icon size={20} /></div>
      <div>
        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">{title}</p>
        <p className="text-3xl font-black italic text-white tracking-tighter">{val}</p>
      </div>
    </div>
  );
}

function TabBtn({ label, type, active, onClick, icon: Icon }: any) {
  const isActive = active === type;
  return (
    <button 
      onClick={() => onClick(type)}
      className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase italic flex items-center gap-2 transition-all ${isActive ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
    >
      <Icon size={14} /> {label}
    </button>
  );
}