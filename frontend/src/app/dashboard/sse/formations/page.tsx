/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🎓 MODULE : src/app/dashboard/sse/formations/page.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Matrice des compétences et suivi des habilitations SSE.
 * RÔLE : Garantir la conformité §7.2 ISO 45001 (Compétences).
 * LOGIQUE : Alertes automatiques sur dates de péremption (Recyclage).
 * SÉCURITÉ : Responsive, Tenant-isolated, 100% apiClient.
 * DATE DE RÉVISION : 02 Mars 2026 | 15:13 GMT
 * -------------------------------------------------------------------------
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

interface SdeUser {
  U_FirstName: string;
  U_LastName: string;
}

interface Formation {
  FOR_Id: string;
  FOR_Title: string;
  FOR_Date: string;
  FOR_Expiry?: string;
  FOR_User?: SdeUser;
}

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
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
        setFormations(Array.isArray(res.data?.data || res.data) ? (res.data?.data || res.data) : []);
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
   */
  const filteredFormations = formations.filter(f => 
    f.FOR_Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${f.FOR_User?.U_FirstName} ${f.FOR_User?.U_LastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * 📊 INDICATEURS DE CONFORMITÉ (KPIs)
   */
  const expiredCount = formations.filter(f => f.FOR_Expiry && new Date(f.FOR_Expiry) < new Date()).length;
  const complianceRate = formations.length > 0 
    ? Math.round(((formations.length - expiredCount) / formations.length) * 100) 
    : 100;

  if (loading && formations.length === 0) return (
    <div className="ml-0 lg:ml-72 min-h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4 lg:gap-6 p-4">
      <Loader2 className="animate-spin text-orange-500 w-10 h-10 lg:w-12 lg:h-12" strokeWidth={2} />
      <p className="text-orange-500 font-black uppercase italic text-[9px] lg:text-[10px] tracking-[0.3em] lg:tracking-[0.5em] animate-pulse text-center m-0">
        Analyse des habilitations en cours...
      </p>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#0B0F1A] min-h-screen ml-0 lg:ml-72 text-white font-sans italic text-left selection:bg-orange-500/30 overflow-x-hidden">
      
      {/* 🔝 HEADER STRATÉGIQUE */}
      <header className="mb-8 lg:mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/5 pb-6 lg:pb-10 gap-6 animate-in fade-in duration-700">
        <div className="space-y-3 lg:space-y-4 w-full sm:w-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase italic tracking-tighter leading-none m-0">
            Compétences <span className="text-orange-500">& Habilitations</span>
          </h1>
          <p className="text-slate-500 font-black text-[9px] lg:text-[10px] uppercase tracking-[0.2em] lg:tracking-[0.4em] italic opacity-80 m-0">
            Management de la Conformité Réglementaire • Référentiel GPEC SSE
          </p>
        </div>
        <div className="flex gap-3 lg:gap-4 w-full sm:w-auto justify-end">
          <button className="bg-white/5 border border-white/10 p-3.5 lg:p-5 rounded-xl lg:rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl hover:bg-blue-600/10 cursor-pointer shrink-0">
            <FileSpreadsheet size={20} className="lg:w-6 lg:h-6" />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-500 px-6 lg:px-10 py-3.5 lg:py-5 rounded-xl lg:rounded-2xl font-black uppercase italic text-[9px] lg:text-[11px] flex items-center justify-center gap-2 lg:gap-4 shadow-[0_15px_30px_rgba(234,88,12,0.3)] transition-all active:scale-95 border-none cursor-pointer text-white m-0"
          >
            <Plus size={18} strokeWidth={3} className="shrink-0" /> <span className="whitespace-nowrap">NOUVELLE HABILITATION</span>
          </button>
        </div>
      </header>

      

      {/* 📊 MATRICE DES KPIs GPEC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8 mb-10 lg:mb-16 animate-in slide-in-from-bottom-8 duration-700">
        <HabilitationCard title="Habilitations Actives" value={formations.length} icon={GraduationCap} color="orange" subtitle="Base installée au registre" />
        <HabilitationCard title="Recyclages Urgents" value={expiredCount} icon={AlertTriangle} color="red" subtitle="Action immédiate requise" />
        <HabilitationCard title="Taux de Conformité" value={`${complianceRate}%`} icon={ShieldCheck} color="emerald" subtitle="Indice d'intégrité §7.2" />
      </div>

      {/* 🔍 BARRE DE RECHERCHE INDUSTRIELLE */}
      <div className="mb-8 lg:mb-10 relative group animate-in slide-in-from-bottom-12 duration-1000">
        <Search className="absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={20} />
        <input 
          type="text"
          placeholder="RECHERCHER UN COLLABORATEUR OU UNE COMPÉTENCE..."
          className="w-full bg-slate-900/60 border border-white/5 rounded-4xl lg:rounded-[2.5rem] py-5 lg:py-8 pl-14 lg:pl-20 pr-6 lg:pr-10 text-[10px] lg:text-xs font-black placeholder:text-slate-600 outline-none focus:border-orange-500/50 transition-all uppercase italic shadow-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 📋 TABLEAU SOUVERAIN DES COMPÉTENCES */}
      <div className="bg-slate-900/40 border border-white/5 rounded-4xl lg:rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-2xl animate-in slide-in-from-bottom-12 duration-1000">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-200">
            <thead className="bg-white/5">
              <tr className="text-[9px] lg:text-[11px] font-black uppercase text-slate-500 italic tracking-widest border-b border-white/5">
                <th className="px-6 lg:px-10 py-5 lg:py-8">Collaborateur</th>
                <th className="px-6 lg:px-10 py-5 lg:py-8">Intitulé de l&apos;Habilitation</th>
                <th className="px-6 lg:px-10 py-5 lg:py-8">Date d&apos;Échéance</th>
                <th className="px-6 lg:px-10 py-5 lg:py-8 text-right">Statut Conformité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredFormations.length > 0 ? filteredFormations.map((f) => {
                const isExpired = f.FOR_Expiry && new Date(f.FOR_Expiry) < new Date();
                return (
                  <tr key={f.FOR_Id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 lg:px-10 py-5 lg:py-6">
                      <div className="flex items-center gap-4 lg:gap-5">
                        <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-orange-600/10 flex items-center justify-center text-orange-500 font-black text-xs lg:text-sm border border-orange-500/20 shadow-inner group-hover:bg-orange-600 group-hover:text-white transition-colors shrink-0">
                          {f.FOR_User?.U_LastName?.charAt(0) || '?'}{f.FOR_User?.U_FirstName?.charAt(0) || '?'}
                        </div>
                        <span className="font-black text-sm lg:text-base uppercase tracking-tighter text-white italic truncate">{f.FOR_User?.U_FirstName} {f.FOR_User?.U_LastName}</span>
                      </div>
                    </td>
                    <td className="px-6 lg:px-10 py-5 lg:py-6">
                      <p className="text-sm lg:text-base font-black uppercase text-orange-500 italic leading-none tracking-tight m-0">{f.FOR_Title}</p>
                      <p className="text-[8px] lg:text-[9px] text-slate-500 mt-2 lg:mt-3 font-black uppercase tracking-widest opacity-80 flex items-center gap-1.5 lg:gap-2 m-0">
                         <Calendar size={12} className="shrink-0" /> Délivré : {new Date(f.FOR_Date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 lg:px-10 py-5 lg:py-6">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <Clock size={16} className={`shrink-0 ${isExpired ? "text-red-500 animate-pulse" : "text-slate-500"}`} />
                        <span className={`text-xs lg:text-sm font-black italic m-0 ${isExpired ? "text-red-500" : "text-slate-300"}`}>
                          {f.FOR_Expiry ? new Date(f.FOR_Expiry).toLocaleDateString() : 'PERMANENTE'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 lg:px-10 py-5 lg:py-6 text-right">
                      {isExpired ? (
                        <span className="inline-block bg-red-600/10 text-red-500 border border-red-500/20 px-4 py-2 lg:px-6 lg:py-2.5 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black uppercase italic tracking-widest shadow-sm whitespace-nowrap">Action Requise</span>
                      ) : (
                        <span className="inline-block bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 px-4 py-2 lg:px-6 lg:py-2.5 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black uppercase italic tracking-widest whitespace-nowrap">Conforme</span>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="py-20 lg:py-32 text-center opacity-40">
                    <UserCheck size={48} className="mx-auto text-slate-600 mb-4 lg:mb-6 lg:w-16 lg:h-16" />
                    <p className="text-slate-500 font-black uppercase italic text-xs lg:text-sm tracking-[0.2em] lg:tracking-[0.4em] m-0">Néant au registre des habilitations</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL D'AJOUT RÉFÉRENTIEL */}
      {isModalOpen && (
        <FormationModal onClose={() => setIsModalOpen(false)} onSuccess={fetchFormations} />
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(234,88,12,0.3); }
      `}</style>
    </div>
  );
}

function HabilitationCard({ title, value, icon: Icon, color, subtitle }: { title: string, value: string|number, icon: any, color: string, subtitle: string }) {
  const themes: Record<string, string> = {
    orange: "text-orange-500 bg-orange-500/5 border-orange-500/20 shadow-[0_15px_30px_rgba(234,88,12,0.1)]",
    red: "text-red-500 bg-red-500/5 border-red-500/20 shadow-[0_15px_30px_rgba(239,68,68,0.1)]",
    emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/20 shadow-[0_15px_30px_rgba(16,185,129,0.1)]"
  };

  return (
    <div className={`p-6 lg:p-10 rounded-4xl lg:rounded-[3.5rem] border ${themes[color]} backdrop-blur-3xl shadow-xl group transition-transform hover:-translate-y-2 m-0`}>
      <div className="flex justify-between items-start mb-6 lg:mb-8">
        <div className="p-4 lg:p-5 bg-black/40 rounded-xl lg:rounded-2xl border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
          <Icon size={28} strokeWidth={2.5} className="lg:w-8 lg:h-8" />
        </div>
        <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-current animate-pulse shadow-[0_0_15px_current] shrink-0"></div>
      </div>
      <p className="text-[9px] lg:text-[11px] font-black uppercase mb-2 lg:mb-3 opacity-70 tracking-[0.2em] lg:tracking-[0.3em] italic m-0 truncate">{title}</p>
      <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black italic tracking-tighter leading-none mb-3 lg:mb-4 m-0 truncate">{value}</h2>
      <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest opacity-50 m-0 truncate">{subtitle}</p>
    </div>
  );
}