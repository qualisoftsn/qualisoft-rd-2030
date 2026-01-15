/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import FormationModal from '@/components/sse/FormationModal';
import { 
  GraduationCap, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Search, 
  Loader2, 
  AlertTriangle,
  FileSpreadsheet,
  UserCheck
} from 'lucide-react';

export default function FormationsPage() {
  const [formations, setFormations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. RÉCUPÉRATION DES DONNÉES
  const fetchFormations = useCallback(async () => {
    try {
      setLoading(true);
      const savedUser = localStorage.getItem('user');
      const tenantId = savedUser ? JSON.parse(savedUser).tenantId : null;

      if (tenantId) {
        const res = await apiClient.get(`/formations?tenantId=${tenantId}`);
        setFormations(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error("Erreur chargement formations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFormations();
  }, [fetchFormations]);

  // 2. FILTRAGE
  const filteredFormations = formations.filter(f => 
    f.FOR_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${f.FOR_User?.U_FirstName} ${f.FOR_User?.U_LastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. CALCULS DES KPI
  const expiredCount = formations.filter(f => f.FOR_Expiry && new Date(f.FOR_Expiry) < new Date()).length;
  const complianceRate = formations.length > 0 
    ? Math.round(((formations.length - expiredCount) / formations.length) * 100) 
    : 100;

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
      <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-widest">Analyse des habilitations...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans italic">
      
      {/* HEADER */}
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
            Compétences <span className="text-orange-500">& Sécurité</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-3 italic">
            Management des habilitations et conformité réglementaire
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white/5 border border-white/10 p-4 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl">
            <FileSpreadsheet size={20} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-500 px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-3 shadow-lg shadow-orange-900/20 transition-all active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> Nouvelle Habilitation
          </button>
        </div>
      </header>

      {/* KPI DASHBOARD */}
      
      <div className="grid grid-cols-3 gap-6 mb-12">
        <KPICard title="Habilitations Actives" value={formations.length} icon={GraduationCap} color="orange" />
        <KPICard title="Recyclages Urgents" value={expiredCount} icon={AlertTriangle} color="red" />
        <KPICard title="Conformité Globale" value={`${complianceRate}%`} icon={ShieldCheck} color="emerald" />
      </div>

      {/* FILTRE ET RECHERCHE */}
      <div className="mb-8 relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Rechercher un collaborateur ou une compétence..."
          className="w-full bg-slate-900/40 border border-white/5 rounded-4xl py-5 pl-16 pr-8 text-sm font-bold outline-none focus:border-orange-500/50 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLEAU DES COMPÉTENCES */}
      <div className="bg-slate-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left">
          <thead className="bg-white/5">
            <tr className="text-[10px] font-black uppercase text-slate-500 italic tracking-widest border-b border-white/5">
              <th className="p-8">Collaborateur</th>
              <th className="p-8">Habilitation / Formation</th>
              <th className="p-8">Échéance</th>
              <th className="p-8 text-right">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredFormations.length > 0 ? filteredFormations.map((f: any) => {
              const isExpired = f.FOR_Expiry && new Date(f.FOR_Expiry) < new Date();
              return (
                <tr key={f.FOR_Id} className="hover:bg-white/5 transition-all group">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-500 font-black text-xs border border-orange-500/20">
                        {f.FOR_User?.U_LastName?.charAt(0)}{f.FOR_User?.U_FirstName?.charAt(0)}
                      </div>
                      <span className="font-bold text-sm uppercase tracking-tight">{f.FOR_User?.U_FirstName} {f.FOR_User?.U_LastName}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <p className="text-sm font-black uppercase text-orange-400 italic leading-none">{f.FOR_Title}</p>
                    <p className="text-[9px] text-slate-500 mt-2 font-bold uppercase">Délivré le {new Date(f.FOR_Date).toLocaleDateString()}</p>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className={isExpired ? "text-red-500" : "text-slate-500"} />
                      <span className={`text-xs font-black ${isExpired ? "text-red-500" : "text-slate-300"}`}>
                        {f.FOR_Expiry ? new Date(f.FOR_Expiry).toLocaleDateString() : 'Permanente'}
                      </span>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    {isExpired ? (
                      <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase italic shadow-lg shadow-red-900/10">Action Requise</span>
                    ) : (
                      <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase italic">Conforme</span>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={4} className="p-20 text-center">
                  <UserCheck size={48} className="mx-auto text-slate-800 mb-4" />
                  <p className="text-slate-600 font-black uppercase italic text-xs tracking-widest">Aucune donnée de compétence trouvée</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <FormationModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchFormations} 
        />
      )}
    </div>
  );
}

// COMPOSANT KPI CARD
function KPICard({ title, value, icon: Icon, color }: any) {
  const colors: any = {
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
  };

  return (
    <div className={`p-8 rounded-[2.5rem] border ${colors[color]} backdrop-blur-md`}>
      <div className="flex justify-between items-start mb-6">
        <Icon size={28} />
        <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
      </div>
      <p className="text-[9px] font-black uppercase mb-1 opacity-60 tracking-widest">{title}</p>
      <p className="text-4xl font-black italic tracking-tighter">{value}</p>
    </div>
  );
}