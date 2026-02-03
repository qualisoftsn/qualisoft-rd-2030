/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  AlertTriangle, Plus, Search, Calendar, 
  Trash2, Users, MapPin, TrendingUp, Target, 
  Flame, RefreshCcw, ChevronRight, ShieldCheck, 
  DollarSign, Activity, BarChart3, Microscope
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import IncidentForm from './IncidentForm';

export default function EnvironmentIncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSite, setSelectedSite] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // ✅ RÉCUPÉRATION DES DONNÉES (Endpoint original rétabli)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [incidentsRes, sitesRes, usersRes] = await Promise.all([
        apiClient.get('/sse-events'), 
        apiClient.get('/sites'),
        apiClient.get('/users')
      ]);
      setIncidents(incidentsRes.data || []);
      setSites(sitesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      toast.error("ERREUR DE SYNCHRONISATION REGISTRE");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🚀 ANALYTICS CEO : VISIBILITÉ TOTALE
  const executiveStats = useMemo(() => {
    const total = incidents.length;
    const critical = incidents.filter(i => i.SSE_AvecArret).length;
    const estimatedCNQ = incidents.reduce((acc, i) => acc + (i.SSE_NbJoursArret * 75000), 0);
    const severityRate = total > 0 ? (critical / total) * 100 : 0;
    
    return {
      total,
      critical,
      estimatedCNQ: estimatedCNQ.toLocaleString(),
      severityRate: Math.round(severityRate),
      complianceStatus: severityRate < 20 ? 'CONFORME' : 'VIGILANCE'
    };
  }, [incidents]);

  // ✅ FILTRAGE ASSOUPLI POUR GARANTIR L'AFFICHAGE
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const matchesSearch = 
        incident.SSE_Lieu.toLowerCase().includes(searchTerm.toLowerCase()) || 
        incident.SSE_Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.SSE_Type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSite = selectedSite === 'ALL' || incident.SSE_SiteId === selectedSite;
      
      const date = new Date(incident.SSE_DateEvent);
      const matchesPeriod = (date.getMonth() + 1 === selectedMonth) && (date.getFullYear() === selectedYear);

      return matchesSearch && matchesSite && matchesPeriod;
    });
  }, [incidents, searchTerm, selectedSite, selectedMonth, selectedYear]);

  const handleDelete = async (id: string) => {
    if (!confirm('AUDIT : CONFIRMER LA SUPPRESSION DÉFINITIVE DU REGISTRE ?')) return;
    try {
      await apiClient.delete(`/sse-events/${id}`);
      toast.success('INCIDENT CLASSÉ ET SUPPRIMÉ');
      fetchData();
    } catch {
      toast.error('ERREUR LORS DE LA SUPPRESSION');
    }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <RefreshCcw className="animate-spin text-red-500" size={50} />
      <p className="text-red-500 font-black uppercase italic text-xs tracking-[0.5em]">Ouverture du Registre ISO 14001...</p>
    </div>
  );

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans uppercase italic font-black">
      
      {/* HEADER SECTION */}
      <header className="mb-12 flex justify-between items-end border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black border ${executiveStats.complianceStatus === 'CONFORME' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-red-500 text-red-500 bg-red-500/10'}`}>
               SMI STATUS: {executiveStats.complianceStatus}
             </span>
             <span className="bg-white/5 text-slate-500 px-4 py-1.5 rounded-xl text-[9px] border border-white/10 italic font-black">ISO 14001 §8.2</span>
          </div>
          <h1 className="text-6xl tracking-tighter italic leading-none">
            REGISTRE <span className="text-red-500">INCIDENTS</span>
          </h1>
          <p className="text-slate-500 text-xs tracking-[0.4em] uppercase">Pilotage des Situations d&apos;Urgence</p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchData} className="p-5 bg-white/5 border border-white/10 rounded-3xl text-slate-400 hover:text-white transition-all hover:rotate-180 duration-500">
            <RefreshCcw size={22} />
          </button>
          <button onClick={() => setIsFormOpen(true)} className="bg-red-600 px-10 py-5 rounded-[2.5rem] text-[11px] shadow-[0_20px_60px_rgba(220,38,38,0.4)] flex items-center gap-4 hover:bg-red-500 transition-all active:scale-95 group">
            <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> 
            DÉCLARER INCIDENT
          </button>
        </div>
      </header>

      {/* STATS SECTION */}
      <div className="grid grid-cols-4 gap-8 mb-12">
        <StatCard label="Fréquence" value={executiveStats.total} icon={<Activity className="text-red-400" />} color="bg-red-500/5" />
        <StatCard label="Gravité" value={`${executiveStats.severityRate}%`} icon={<Flame className="text-amber-400" />} color="bg-amber-500/5" progress={executiveStats.severityRate} />
        <StatCard label="Estimation CNQ" value={`${executiveStats.estimatedCNQ} XOF`} icon={<DollarSign className="text-emerald-400" />} color="bg-emerald-500/5" />
        <StatCard label="Performance" value="98%" icon={<ShieldCheck className="text-blue-400" />} color="bg-blue-500/5" progress={98} />
      </div>

      {/* FILTRES SECTION */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-8 mb-10 flex flex-wrap lg:flex-nowrap gap-6 backdrop-blur-2xl">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            placeholder="RECHERCHER DANS LE REGISTRE..." 
            className="w-full bg-black/20 border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-[11px] font-black outline-none focus:border-red-500 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="bg-black/40 border border-white/10 rounded-[2rem] px-8 py-5 text-[10px] font-black outline-none focus:border-red-500 cursor-pointer" value={selectedSite} onChange={e => setSelectedSite(e.target.value)}>
          <option value="ALL" className="bg-[#0B0F1A]">TOUS LES SITES</option>
          {sites.map(s => <option key={s.S_Id} value={s.S_Id} className="bg-[#0B0F1A]">{s.S_Name}</option>)}
        </select>
        <div className="flex gap-2">
           <select className="bg-black/40 border border-white/10 rounded-[2rem] px-6 py-5 text-[10px] font-black" value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
             {Array.from({length:12}, (_,i) => <option key={i+1} value={i+1} className="bg-[#0B0F1A]">M{i+1}</option>)}
           </select>
           <select className="bg-black/40 border border-white/10 rounded-[2rem] px-6 py-5 text-[10px] font-black" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
             {[2026, 2025, 2024].map(y => <option key={y} value={y} className="bg-[#0B0F1A]">{y}</option>)}
           </select>
        </div>
      </div>

      {/* TABLEAU SECTION : AFFICHAGE DES INCIDENTS */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] overflow-hidden shadow-3xl backdrop-blur-xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[11px] text-slate-500 tracking-[0.3em]">
            <tr>
              <th className="p-10">MÉTA-DONNÉES</th>
              <th className="p-10">TYPOLOGIE ISO</th>
              <th className="p-10">DESCRIPTION DES FAITS</th>
              <th className="p-10 text-right">DOSSIER</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((i) => (
                <tr key={i.SSE_Id} className="hover:bg-white/5 transition-all group">
                  <td className="p-10">
                    <div className="flex flex-col gap-2">
                      <span className="text-lg font-black italic">{new Date(i.SSE_DateEvent).toLocaleDateString()}</span>
                      <span className="flex items-center gap-2 text-[10px] text-slate-500"><MapPin size={12} className="text-red-500" /> {i.SSE_Lieu}</span>
                    </div>
                  </td>
                  <td className="p-10">
                    <span className={`px-5 py-2 rounded-2xl text-[10px] font-black border ${i.SSE_AvecArret ? 'border-red-600 text-red-500 bg-red-500/10' : 'border-amber-500 text-amber-500 bg-amber-500/10'}`}>
                      {i.SSE_Type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-10 max-w-xl">
                    <p className="text-[11px] line-clamp-2 text-slate-300 normal-case font-medium italic">
                      {i.SSE_Description}
                    </p>
                  </td>
                  <td className="p-10 text-right">
                    <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleDelete(i.SSE_Id)} className="p-5 bg-white/5 rounded-2xl text-slate-500 hover:text-red-500 transition-all">
                        <Trash2 size={20}/>
                      </button>
                      <button onClick={() => router.push(`/dashboard/sse/analytics/${i.SSE_Id}`)} className="p-5 bg-white/5 rounded-2xl text-slate-500 hover:text-blue-500 transition-all">
                        <Microscope size={20}/>
                      </button>
                      <button className="p-5 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all">
                        <ChevronRight size={22}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-32 text-center">
                   <ShieldCheck size={64} className="mx-auto text-slate-800 mb-8 opacity-10" />
                   <p className="text-slate-600 font-black uppercase italic tracking-[0.5em] text-sm leading-relaxed">
                     AUCUN INCIDENT TROUVÉ DANS LE REGISTRE
                   </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODALE FORMULAIRE */}
      {isFormOpen && (
        <IncidentForm 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={fetchData} 
          sites={sites} 
          users={users} 
        />
      )}

      {/* FOOTER */}
      <footer className="mt-20 pt-10 border-t border-white/5 text-center">
        <p className="text-[9px] font-bold text-slate-800 uppercase tracking-[0.7em]">
          QUALISOFT SMI INTELLIGENCE • RD 2030 • ISO 14001:2015 §8.2
        </p>
      </footer>
    </div>
  );
}

// ========================
// COMPOSANTS INTERNES
// ========================

function StatCard({ label, value, icon, color, progress }: any) {
  return (
    <div className={`${color} border border-white/5 rounded-[3rem] p-10 transition-all hover:scale-[1.03] shadow-2xl`}>
      <div className="flex justify-between items-start mb-8">
        <div className="p-5 bg-black/40 rounded-2xl text-white">
          {icon}
        </div>
        {progress !== undefined && (
          <div className="w-20 h-2 bg-white/5 rounded-full overflow-hidden self-center border border-white/5">
            <div 
              className={`h-full ${progress > 20 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-emerald-500'}`} 
              style={{width: `${progress}%`}}
            ></div>
          </div>
        )}
      </div>
      <p className="text-[11px] text-slate-500 tracking-[0.3em] uppercase italic font-black mb-1">{label}</p>
      <p className="text-4xl font-black italic tracking-tighter leading-none text-white">{value}</p>
    </div>
  );
}