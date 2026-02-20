/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * NOM ABSOLU : src/app/dashboard/sse/formations/page.tsx
 * FONCTION : Matrice des compétences et suivi des habilitations SSE.
 * RÔLE : Garantir la conformité §7.2 ISO 45001 (Compétences).
 * LOGIQUE : Alertes automatiques sur dates de péremption (Recyclage).
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import FormationModal from '@/components/sse/FormationModal';
import { 
  GraduationCap, Clock, ShieldCheck, Plus, Search, 
  Loader2, AlertTriangle, FileSpreadsheet, UserCheck, 
  Calendar
} from 'lucide-react';

export default function FormationsPage() {
  const [formations, setFormations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * 📡 SYNCHRONISATION DU RÉFÉRENTIEL GPEC
   * Extraction basée sur le TenantId pour garantir l'isolation des données.
   */
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
      console.error("Erreur critique chargement habilitations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFormations(); }, [fetchFormations]);

  /**
   * 🔍 FILTRAGE MULTI-CRITÈRES
   * Recherche par titre de formation ou identité du collaborateur.
   */
  const filteredFormations = formations.filter(f => 
    f.FOR_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${f.FOR_User?.U_FirstName} ${f.FOR_User?.U_LastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * 📊 INDICATEURS DE CONFORMITÉ (KPIs)
   */
  const expiredCount = formations.filter(f => f.FOR_Expiry && new Date(f.FOR_Expiry) < new Date()).length;
  const complianceRate = formations.length > 0 
    ? Math.round(((formations.length - expiredCount) / formations.length) * 100) 
    : 100;

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <Loader2 className="animate-spin text-orange-500" size={50} />
      <p className="text-orange-500 font-black uppercase italic text-[10px] tracking-[0.5em] animate-pulse">Analyse des habilitations en cours...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans italic text-left selection:bg-orange-500/30">
      
      {/* 🔝 HEADER STRATÉGIQUE */}
      <header className="mb-12 flex justify-between items-end border-b border-white/5 pb-10">
        <div className="space-y-4">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
            Compétences <span className="text-orange-500">& Habilitations</span>
          </h1>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] italic opacity-70">
            Management de la Conformité Réglementaire • Référentiel GPEC SSE
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white/5 border border-white/10 p-5 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl hover:bg-blue-600/10 cursor-pointer">
            <FileSpreadsheet size={24} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-500 px-10 py-5 rounded-2xl font-black uppercase italic text-[11px] flex items-center gap-4 shadow-3xl shadow-orange-900/30 transition-all active:scale-95 border-none cursor-pointer text-white"
          >
            <Plus size={20} strokeWidth={4} /> NOUVELLE HABILITATION
          </button>
        </div>
      </header>

      {/* 📊 MATRICE DES KPIs GPEC */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <HabilitationCard title="Habilitations Actives" value={formations.length} icon={GraduationCap} color="orange" subtitle="Base installée au registre" />
        <HabilitationCard title="Recyclages Urgents" value={expiredCount} icon={AlertTriangle} color="red" subtitle="Action immédiate requise" />
        <HabilitationCard title="Taux de Conformité" value={`${complianceRate}%`} icon={ShieldCheck} color="emerald" subtitle="Indice d'intégrité §7.2" />
      </div>

      {/* 🔍 BARRE DE RECHERCHE INDUSTRIELLE */}
      <div className="mb-10 relative group">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={24} />
        <input 
          type="text"
          placeholder="RECHERCHER UN COLLABORATEUR OU UNE COMPÉTENCE SPÉCIFIQUE..."
          className="w-full bg-slate-900/40 border border-white/5 rounded-[2.5rem] py-8 pl-20 pr-10 text-xs font-black placeholder:text-slate-700 outline-none focus:border-orange-500/50 transition-all uppercase italic shadow-2xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 📋 TABLEAU SOUVERAIN DES COMPÉTENCES */}
      <div className="bg-slate-900/30 border border-white/5 rounded-[4rem] overflow-hidden backdrop-blur-3xl shadow-4xl">
        <table className="w-full text-left">
          <thead className="bg-white/5">
            <tr className="text-[11px] font-black uppercase text-slate-500 italic tracking-widest border-b border-white/5">
              <th className="px-10 py-8">Collaborateur</th>
              <th className="px-10 py-8">Intitulé de l&apos;Habilitation</th>
              <th className="px-10 py-8">Date d&apos;Échéance</th>
              <th className="px-10 py-8 text-right">Statut Conformité</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredFormations.length > 0 ? filteredFormations.map((f: any) => {
              const isExpired = f.FOR_Expiry && new Date(f.FOR_Expiry) < new Date();
              return (
                <tr key={f.FOR_Id} className="hover:bg-white/5 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-orange-600/10 flex items-center justify-center text-orange-500 font-black text-sm border border-orange-500/20 shadow-inner group-hover:bg-orange-600 group-hover:text-white transition-all">
                        {f.FOR_User?.U_LastName?.charAt(0)}{f.FOR_User?.U_FirstName?.charAt(0)}
                      </div>
                      <span className="font-black text-base uppercase tracking-tighter text-white italic">{f.FOR_User?.U_FirstName} {f.FOR_User?.U_LastName}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-base font-black uppercase text-orange-500 italic leading-none tracking-tight">{f.FOR_Title}</p>
                    <p className="text-[9px] text-slate-500 mt-3 font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                       <Calendar size={12} /> Délivré : {new Date(f.FOR_Date).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <Clock size={16} className={isExpired ? "text-red-500 animate-pulse" : "text-slate-500"} />
                      <span className={`text-sm font-black italic ${isExpired ? "text-red-500" : "text-slate-300"}`}>
                        {f.FOR_Expiry ? new Date(f.FOR_Expiry).toLocaleDateString() : 'PERMANENTE'}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    {isExpired ? (
                      <span className="bg-red-600/10 text-red-500 border border-red-500/20 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest shadow-lg shadow-red-900/10">Action Requise</span>
                    ) : (
                      <span className="bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest">Conforme</span>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={4} className="p-32 text-center opacity-30">
                  <UserCheck size={64} className="mx-auto text-slate-700 mb-6" />
                  <p className="text-slate-500 font-black uppercase italic text-sm tracking-[0.4em]">Néant au registre des habilitations</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL D'AJOUT RÉFÉRENTIEL */}
      {isModalOpen && (
        <FormationModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchFormations} 
        />
      )}
    </div>
  );
}

function HabilitationCard({ title, value, icon: Icon, color, subtitle }: any) {
  const themes: any = {
    orange: "text-orange-500 bg-orange-500/5 border-orange-500/20 shadow-orange-900/10",
    red: "text-red-500 bg-red-500/5 border-red-500/20 shadow-red-900/10",
    emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/20 shadow-emerald-900/10"
  };

  return (
    <div className={`p-10 rounded-[3.5rem] border ${themes[color]} backdrop-blur-3xl shadow-4xl group transition-all hover:-translate-y-2`}>
      <div className="flex justify-between items-start mb-8">
        <div className="p-5 bg-black/40 rounded-2xl border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
          <Icon size={32} strokeWidth={2.5} />
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-current animate-pulse shadow-[0_0_15px_current]"></div>
      </div>
      <p className="text-[11px] font-black uppercase mb-3 opacity-60 tracking-[0.3em] italic">{title}</p>
      <h2 className="text-6xl font-black italic tracking-tighter leading-none mb-4">{value}</h2>
      <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{subtitle}</p>
    </div>
  );
}