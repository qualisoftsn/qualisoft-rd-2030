/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 NOM ABSOLU : src/app/dashboard/rh/matrice/page.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Matrice de compétences avancée avec diagnostic de liaison SMI (§7.2).
 * ARCHITECTURE : Full-Space Matrix Design, liaison Auth sécurisée.
 * CONSOLIDATION : 
 * 1. Style Matrix Elite massifié (max-w-500, font-black, etc).
 * 2. Sticky Headers parfaits pour naviguer de grandes quantités de data.
 * 3. Typage et diagnostic console préservés.
 * -------------------------------------------------------------------------
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Loader2, 
  Search, Activity, UserCheck, Fingerprint
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- 🏗️ INTERFACES SCELLÉES ---
interface MatrixData { users: any[]; competences: any[]; }

export default function RHMasterMatrixDiagnostic() {
  // --- 📦 ÉTATS SCELLÉS ---
  const [data, setData] = useState<MatrixData>({ users: [], competences: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // 1️⃣ RÉCUPÉRATION DU CONTEXTE DE SÉCURITÉ (Tenant ID LocalStorage Fallback)
  useEffect(() => {
    setIsMounted(true);
    const storage = localStorage.getItem('qualisoft-auth-storage');
    if (storage) {
      try {
        const parsed = JSON.parse(storage);
        const tid = parsed.state?.user?.tenantId;
        if (tid) setTenantId(tid);
      } catch (e) { console.error("🚨 Échec lecture contexte auth SDE"); }
    }
  }, []);

  // 2️⃣ CHARGEMENT TECHNIQUE AVEC TRACEUR DE DIAGNOSTIC
  const fetchData = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const matrixRes = await apiClient.get('/competences/matrix');
      const payload = matrixRes.data?.data || matrixRes.data;
      
      // Journalisation pour diagnostic technique SDE
      console.log("📡 [NOYAU RH SDE] Payload Matrix reçu :", payload);

      setData({
        users: Array.isArray(payload?.users) ? payload.users : [],
        competences: Array.isArray(payload?.competences) ? payload.competences : []
      });
    } catch (error: any) {
      toast.error("RUPTURE DE LIAISON NOYAU RH.");
      console.error("🚨 [DIAGNOSTIC CRITIQUE SDE] :", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    } finally { 
      setLoading(false); 
    }
  }, [tenantId]);

  useEffect(() => { if (isMounted && tenantId) fetchData(); }, [isMounted, tenantId]);

  /** ⚡ ACTION : MISE À JOUR DU NIVEAU D'APTITUDE (§7.2) */
  const handleUpdateLevel = async (userId: string, compId: string, current: number) => {
    const tid = toast.loading("Mutation Matrix...");
    try {
      const next = current >= 4 ? 0 : current + 1;
      await apiClient.post('/competences/evaluate', { userId, competenceId: compId, level: next });
      toast.success("MUTATION SCELLÉE.", { id: tid });
      await fetchData();
    } catch { 
      toast.error("ÉCHEC DE LA MUTATION SDE.", { id: tid }); 
    }
  };

  const filteredUsers = useMemo(() => 
    (data.users || []).filter(u => 
      `${u.U_FirstName} ${u.U_LastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    ), [data.users, searchTerm]
  );

  if (!isMounted) return null;

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-16 ml-72 text-white font-sans italic text-left selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      <div className="w-full max-w-500 mx-auto space-y-20 animate-in fade-in duration-1000">

        {/* 🔝 HEADER DE DIAGNOSTIC */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b-4 border-white/5 pb-16">
          <div className="space-y-8">
            <div className="flex items-center gap-6 text-blue-500 bg-blue-500/5 w-fit px-8 py-3 rounded-full border border-blue-500/10 shadow-inner">
              <Activity size={24} className="animate-pulse" />
              <span className="font-black uppercase tracking-[0.5em] text-[12px] italic">Diagnostic Matrice GPEC §7.2</span>
            </div>
            <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none text-white">
              RH <span className="text-blue-600">Master Matrix</span>
            </h1>
          </div>

          <div className="bg-[#151A2D] px-10 py-8 rounded-[3rem] border-4 border-white/5 flex items-center gap-6 shadow-4xl backdrop-blur-3xl min-w-87.5 justify-between">
             <div className="flex items-center gap-6">
                <div className="p-4 bg-blue-600/20 rounded-2xl border border-blue-600/30"><UserCheck className="text-blue-500" size={28} /></div>
                <span className="text-[12px] font-black uppercase tracking-[0.4em] italic text-slate-500 leading-tight">Total<br/>Collaborateurs</span>
             </div>
             <span className="text-5xl font-black italic tracking-tighter text-white">{data.users.length}</span>
          </div>
        </header>

        {/* 🧭 RECHERCHE TACTIQUE */}
        <div className="bg-[#151A2D] border-4 border-white/5 rounded-[4rem] shadow-4xl backdrop-blur-3xl animate-in slide-in-from-bottom-10 duration-700 relative z-20 overflow-hidden">
          <div className="p-12 border-b-4 border-white/5 flex items-center gap-8 bg-black/40">
            <Search size={32} className="text-blue-600" />
            <input 
              type="text" 
              placeholder="SCANNER LA MATRICE PAR NOM OU PRÉNOM..." 
              className="bg-transparent outline-none font-black uppercase text-[16px] w-full text-white placeholder-slate-700 italic tracking-[0.4em]" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>

          {loading ? (
            <div className="flex h-150 flex-col items-center justify-center gap-10 text-blue-500 bg-[#0B0F1A]/95">
              <Loader2 className="animate-spin" size={100} strokeWidth={1} />
              <span className="font-black uppercase text-[14px] tracking-[1em] italic animate-pulse">Lecture des données Matrix...</span>
            </div>
          ) : (
            <div className="overflow-x-auto h-175 custom-scrollbar bg-[#0B0F1A]">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-black/95 backdrop-blur-3xl z-40 shadow-2xl">
                    <tr className="text-[12px] font-black uppercase text-slate-500 italic tracking-[0.4em] border-b-4 border-white/5">
                      <th className="p-12 sticky left-0 bg-black/95 border-r-4 border-white/5 z-50 min-w-100">
                        <div className="flex items-center gap-4 text-blue-500"><Fingerprint size={20} /> Structure Effectif</div>
                      </th>
                      {data.competences.map(c => (
                          <th key={c.CP_Id} className="p-10 border-l-2 border-white/5 text-center min-w-70 leading-tight">
                              <span className="text-white text-[14px] block mb-4 truncate px-4">{c.CP_Name}</span>
                              <span className="text-[10px] text-blue-400 bg-blue-600/20 border border-blue-600/30 px-5 py-2 rounded-2xl shadow-inner">SEUIL REQUIS: L{c.CP_NiveauRequis}</span>
                          </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-white/5">
                    {filteredUsers.length > 0 ? filteredUsers.map(u => (
                      <tr key={u.U_Id} className="hover:bg-white/5 transition-all group">
                        <td className="p-12 sticky left-0 bg-[#151A2D] group-hover:bg-[#1e2540] border-r-4 border-white/5 z-20 text-left transition-colors">
                          <p className="font-black uppercase text-3xl italic tracking-tighter leading-none text-white mb-3">{u.U_FirstName} {u.U_LastName}</p>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] italic flex items-center gap-4">
                            <span className="bg-white/5 px-4 py-1.5 rounded-lg border border-white/10 text-slate-400">{u.U_Role}</span> 
                            <span className="truncate max-w-50 opacity-50">{u.U_Email}</span>
                          </p>
                        </td>
                        {data.competences.map(c => {
                          const level = u.U_Competences?.find((uc: any) => uc.UC_CompetenceId === c.CP_Id)?.UC_NiveauActuel || 0;
                          const isCompliant = level >= c.CP_NiveauRequis;
                          return (
                            <td key={c.CP_Id} className="p-8 text-center border-l-2 border-white/5">
                              <button 
                                  onClick={() => handleUpdateLevel(u.U_Id, c.CP_Id, level)} 
                                  className={`mx-auto w-20 h-20 rounded-4xl flex items-center justify-center font-black text-3xl border-4 transition-all shadow-xl active:scale-90 cursor-pointer ${
                                      isCompliant 
                                        ? 'bg-blue-600/10 text-blue-500 border-blue-600/30 hover:bg-blue-600 hover:text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]' 
                                        : 'bg-black/40 text-slate-600 border-white/5 hover:border-blue-500/40 hover:text-white'
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
                          <td colSpan={50} className="p-32 text-center text-slate-600 font-black uppercase text-[12px] italic tracking-[0.5em] opacity-30">
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
      
      <style jsx global>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 20px; border: 2px solid #0b0f1a; }
        ::-webkit-scrollbar-thumb:hover { background: #2563eb; }
      `}</style>
    </div>
  );
}