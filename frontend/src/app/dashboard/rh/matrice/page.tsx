/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * NOM ABSOLU : src/app/dashboard/rh/matrice/page.tsx
 * FONCTION : Matrice de compétences avancée avec diagnostic de liaison SMI.
 * LOGIQUE : Synchronisation bidirectionnelle avec le Noyau Auth et GPEC.
 */

'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Plus, Loader2, 
  Settings2, Search, Activity, UserCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MatrixData { users: any[]; competences: any[]; }

export default function RHMasterMatrixDiagnostic() {
  const [data, setData] = useState<MatrixData>({ users: [], competences: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // 1️⃣ RÉCUPÉRATION DU CONTEXTE DE SÉCURITÉ (Tenant ID)
  useEffect(() => {
    setIsMounted(true);
    const storage = localStorage.getItem('qualisoft-auth-storage');
    if (storage) {
      try {
        const parsed = JSON.parse(storage);
        const tid = parsed.state?.user?.tenantId;
        if (tid) setTenantId(tid);
      } catch (e) { console.error("🚨 Échec lecture contexte auth"); }
    }
  }, []);

  // 2️⃣ CHARGEMENT TECHNIQUE AVEC TRACEUR DE DIAGNOSTIC
  const fetchData = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const matrixRes = await apiClient.get<MatrixData>('/competences/matrix');
      
      // Journalisation pour diagnostic technique
      console.log("📡 [NOYAU RH] Payload Matrix reçu :", matrixRes.data);

      setData({
        users: Array.isArray(matrixRes.data?.users) ? matrixRes.data.users : [],
        competences: Array.isArray(matrixRes.data?.competences) ? matrixRes.data.competences : []
      });
    } catch (error: any) {
      toast.error("Rupture de liaison noyau RH");
      console.error("🚨 [DIAGNOSTIC CRITIQUE] :", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    } finally { setLoading(false); }
  }, [tenantId]);

  useEffect(() => { if (isMounted && tenantId) fetchData(); }, [isMounted, tenantId, fetchData]);

  /** ⚡ ACTION : MISE À JOUR DU NIVEAU D'APTITUDE (§7.2) */
  const handleUpdateLevel = async (userId: string, compId: string, current: number) => {
    try {
      const next = current >= 4 ? 0 : current + 1;
      await apiClient.post('/competences/evaluate', { userId, competenceId: compId, level: next });
      await fetchData();
    } catch { toast.error("Échec de la mutation du niveau"); }
  };

  const filteredUsers = useMemo(() => 
    (data.users || []).filter(u => 
      `${u.U_FirstName} ${u.U_LastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    ), [data.users, searchTerm]);

  if (!isMounted) return null;

  return (
    <div className="p-12 bg-[#0B0F1A] min-h-screen text-white italic ml-72 font-sans selection:bg-blue-600/30">
      
      {/* HEADER DE DIAGNOSTIC */}
      <header className="flex justify-between items-end border-b border-white/5 pb-10 mb-10">
        <div className="text-left">
          <div className="flex items-center gap-4 text-blue-500 mb-4 font-black uppercase tracking-[0.5em] text-[10px] italic">
            <Activity size={18} className="animate-pulse" /> Diagnostic Matrice GPEC §7.2
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
            RH <span className="text-blue-600">Master Matrix</span>
          </h1>
        </div>
        <div className="bg-white/5 px-8 py-5 rounded-2xl border border-white/10 flex items-center gap-4 shadow-inner">
           <UserCheck className="text-blue-400" size={20} />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-400">Total Collaborateurs: {data.users.length}</span>
        </div>
      </header>

      {/* RECHERCHE ET ÉTAT DE LIAISON */}
      <div className="bg-slate-900/30 border border-white/5 rounded-[3.5rem] overflow-hidden shadow-3xl backdrop-blur-xl animate-in fade-in duration-700">
        <div className="p-10 border-b border-white/5 flex items-center gap-6">
          <Search size={22} className="text-slate-600" />
          <input 
            type="text" 
            placeholder="SCANNER LA MATRICE PAR NOM OU PRÉNOM..." 
            className="bg-transparent outline-none font-black uppercase text-[12px] w-full text-white placeholder-slate-800 italic tracking-[0.2em]" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>

        {loading ? (
          <div className="flex h-120 flex-col items-center justify-center gap-6 text-blue-500">
            <Loader2 className="animate-spin" size={60} />
            <span className="font-black uppercase text-[10px] tracking-[0.5em] italic">Lecture des données en cours...</span>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-[11px] font-black uppercase text-slate-500 italic tracking-widest">
                    <th className="p-12 sticky left-0 bg-[#0B0F1A] border-r border-white/5 z-20 shadow-xl">Structure Effectif</th>
                    {data.competences.map(c => (
                        <th key={c.CP_Id} className="p-10 border-l border-white/5 text-center min-w-50 leading-tight">
                            <span className="text-slate-200 block mb-2">{c.CP_Name}</span>
                            <span className="text-[8px] text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full">SEUIL: L{c.CP_NiveauRequis}</span>
                        </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length > 0 ? filteredUsers.map(u => (
                    <tr key={u.U_Id} className="hover:bg-blue-600/5 transition-all group">
                      <td className="p-12 sticky left-0 bg-[#0B0F1A] border-r border-white/5 z-10 group-hover:bg-slate-900/50 text-left">
                        <p className="font-black uppercase text-2xl italic tracking-tighter leading-none text-white">{u.U_FirstName} {u.U_LastName}</p>
                        <p className="text-[9px] text-slate-600 font-bold uppercase mt-3 tracking-[0.2em] italic">{u.U_Role} • {u.U_Email}</p>
                      </td>
                      {data.competences.map(c => {
                        const level = u.U_Competences?.find((uc: any) => uc.UC_CompetenceId === c.CP_Id)?.UC_NiveauActuel || 0;
                        const isCompliant = level >= c.CP_NiveauRequis;
                        return (
                          <td key={c.CP_Id} className="p-8 text-center border-l border-white/5">
                            <button 
                                onClick={() => handleUpdateLevel(u.U_Id, c.CP_Id, level)} 
                                className={`mx-auto w-16 h-16 rounded-3xl flex items-center justify-center font-black text-xl border-2 transition-all shadow-2xl active:scale-90 cursor-pointer ${
                                    isCompliant ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 hover:bg-blue-600 hover:text-white' : 'bg-white/2 text-slate-700 border-white/5 hover:border-blue-500/30'
                                }`}
                            >
                                {level}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  )) : (
                    <tr>
                        <td colSpan={50} className="p-32 text-center text-slate-600 font-black uppercase text-xs italic tracking-widest opacity-20">
                            Aucune correspondance détectée dans le noyau RH.
                        </td>
                    </tr>
                  )}
                </tbody>
              </table>
          </div>
        )}
      </div>
    </div>
  );
}