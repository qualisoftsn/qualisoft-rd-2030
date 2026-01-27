"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Plus, X, Save, Trash2, Loader2, RefreshCcw, 
  Settings2, Search, Users, Award, ShieldAlert
} from 'lucide-react';

// --- INTERFACES ---
interface UserCompetence { UC_UserId: string; UC_CompetenceId: string; UC_NiveauActuel: number; }
interface Competence { CP_Id: string; CP_Name: string; CP_NiveauRequis: number; }
interface User { 
  U_Id: string; U_FirstName: string | null; U_LastName: string | null; 
  U_Email: string; U_Role: string; U_Competences: UserCompetence[]; 
}
interface Formation { FOR_Id: string; FOR_Title: string; FOR_Date: string; FOR_Status: string; FOR_UserId: string; }
interface MatrixData { users: User[]; competences: Competence[]; }

type RHView = 'MATRIX' | 'EMPLOYEES' | 'RISKS' | 'FORMATIONS';

export default function RHMasterHubPage() {
  const [data, setData] = useState<MatrixData>({ users: [], competences: [] });
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<RHView>('MATRIX');
  const [searchTerm, setSearchTerm] = useState('');
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // ÉTATS CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    U_FirstName: '', U_LastName: '', U_Email: '', U_Role: 'USER',
    CP_Name: '', CP_NiveauRequis: 3,
    FOR_Title: '', FOR_Date: '', FOR_Status: 'PLANIFIE', FOR_UserId: ''
  });

  // 1️⃣ RÉCUPÉRATION DU TENANT DEPUIS LE NOYAU AUTH
  useEffect(() => {
    setIsMounted(true);
    const storage = localStorage.getItem('qualisoft-auth-storage');
    if (storage) {
      try {
        const parsed = JSON.parse(storage);
        const tid = parsed.state?.user?.tenantId;
        if (tid) setTenantId(tid);
      } catch (e) { console.error("Échec lecture localStorage"); }
    }
  }, []);

  // 2️⃣ CHARGEMENT SÉCURISÉ AVEC DIAGNOSTIC
  const fetchData = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      
      // On force les routes complètes pour éviter toute ambiguïté
      const [matrixRes, formationsRes] = await Promise.all([
        apiClient.get<MatrixData>('/competences/matrix'),
        apiClient.get<Formation[]>('/formations').catch(() => ({ data: [] }))
      ]);

      console.log("📡 [NOYAU] Réponse Matrice :", matrixRes.data);

      setData({
        users: Array.isArray(matrixRes.data?.users) ? matrixRes.data.users : [],
        competences: Array.isArray(matrixRes.data?.competences) ? matrixRes.data.competences : []
      });
      setFormations(Array.isArray(formationsRes.data) ? formationsRes.data : []);

    } catch (error: any) {
      // DIAGNOSTIC CRITIQUE POUR ABDOUALAYE
      console.error("🚨 [ERREUR SYNCHRO] Détails :", {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { if (isMounted && tenantId) fetchData(); }, [isMounted, tenantId, fetchData]);

  // 3️⃣ ACTIONS CRUD (Logic Gates)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    try {
      let endpoint = '';
      let payload: any = { tenantId };

      if (activeView === 'EMPLOYEES') {
        endpoint = '/users';
        payload = { ...payload, U_FirstName: formData.U_FirstName, U_LastName: formData.U_LastName, U_Email: formData.U_Email, U_Role: formData.U_Role };
      } else if (activeView === 'MATRIX') {
        endpoint = '/competences';
        payload = { ...payload, CP_Name: formData.CP_Name, CP_NiveauRequis: Number(formData.CP_NiveauRequis) };
      } else {
        endpoint = '/formations';
        payload = { ...payload, FOR_Title: formData.FOR_Title, FOR_Date: formData.FOR_Date, FOR_Status: formData.FOR_Status, FOR_UserId: formData.FOR_UserId };
      }

      await apiClient.post(endpoint, payload);
      setIsModalOpen(false);
      setFormData({ U_FirstName: '', U_LastName: '', U_Email: '', U_Role: 'USER', CP_Name: '', CP_NiveauRequis: 3, FOR_Title: '', FOR_Date: '', FOR_Status: 'PLANIFIE', FOR_UserId: '' });
      await fetchData();
    } catch { alert("Erreur d'écriture dans le noyau."); }
  };

  const handleUpdateLevel = async (userId: string, compId: string, current: number) => {
    try {
      const next = current >= 4 ? 0 : current + 1;
      await apiClient.post('/competences/evaluate', { userId, competenceId: compId, level: next });
      await fetchData();
    } catch { console.error("Échec évaluation"); }
  };

  const filteredUsers = useMemo(() => (data.users || []).filter(u => `${u.U_FirstName} ${u.U_LastName}`.toLowerCase().includes(searchTerm.toLowerCase())), [data.users, searchTerm]);

  if (!isMounted) return null;

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen text-white italic ml-72">
      <header className="flex justify-between items-end border-b border-white/5 pb-10 mb-10">
        <div>
          <div className="flex items-center gap-3 text-blue-500 mb-3 font-black uppercase tracking-[0.5em] text-[10px]">
            <Settings2 size={16} /> Hub Management RH
          </div>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter">RH <span className="text-blue-600">Master Hub</span></h1>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 px-8 py-5 rounded-4xl font-black uppercase text-xs shadow-2xl flex items-center gap-3 active:scale-95 transition-all">
          <Plus size={18} strokeWidth={3} /> Nouveau Document
        </button>
      </header>

      {/* TABS NAVIGATION */}
      <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit mb-10">
        {(['MATRIX', 'EMPLOYEES', 'RISKS', 'FORMATIONS'] as RHView[]).map(v => (
          <button key={v} onClick={() => setActiveView(v)} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeView === v ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{v}</button>
        ))}
      </div>

      <div className="bg-slate-900/30 border border-white/5 rounded-[3.5rem] overflow-hidden shadow-3xl backdrop-blur-xl min-h-[500px]">
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <Search size={16} className="text-slate-500" />
          <input type="text" placeholder="RECHERCHER DANS LE NOYAU..." className="bg-transparent outline-none font-black uppercase text-[10px] w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex h-96 items-center justify-center font-black uppercase text-[10px] text-blue-500 animate-pulse tracking-widest">
            <Loader2 className="animate-spin mr-3" /> Synchronisation...
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeView === 'MATRIX' && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-[11px] font-black uppercase text-slate-500 italic">
                    <th className="p-10 sticky left-0 bg-[#0B0F1A] border-r border-white/5">Effectifs GPEC</th>
                    {data.competences.map(c => <th key={c.CP_Id} className="p-8 border-l border-white/5 text-center">{c.CP_Name}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length > 0 ? filteredUsers.map(u => (
                    <tr key={u.U_Id} className="hover:bg-blue-600/5 transition-all">
                      <td className="p-8 sticky left-0 bg-[#0B0F1A] border-r border-white/5">
                        <p className="font-black uppercase text-sm leading-none">{u.U_FirstName} {u.U_LastName}</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase mt-1.5">{u.U_Role}</p>
                      </td>
                      {data.competences.map(c => {
                        const level = u.U_Competences?.find(uc => uc.UC_CompetenceId === c.CP_Id)?.UC_NiveauActuel || 0;
                        return (
                          <td key={c.CP_Id} className="p-6 text-center border-l border-white/5">
                            <button onClick={() => handleUpdateLevel(u.U_Id, c.CP_Id, level)} className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center font-black border-2 transition-all ${level >= c.CP_NiveauRequis ? 'bg-blue-600/20 text-blue-400 border-blue-500/40' : 'bg-white/5 text-slate-700'}`}>{level}</button>
                          </td>
                        );
                      })}
                    </tr>
                  )) : (
                    <tr><td colSpan={50} className="p-20 text-center text-slate-600 font-black uppercase text-xs italic">Aucune donnée trouvée</td></tr>
                  )}
                </tbody>
              </table>
            )}
            {activeView === 'EMPLOYEES' && (
               <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredUsers.map(u => (
                 <div key={u.U_Id} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:border-blue-500 transition-all group">
                   <h3 className="text-xl font-black uppercase italic text-white leading-tight">{u.U_FirstName} {u.U_LastName}</h3>
                   <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">{u.U_Role}</p>
                 </div>
               ))}
             </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL SIMPLIFIÉ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-md rounded-[3rem] p-12 shadow-3xl">
            <h2 className="text-2xl font-black uppercase italic mb-10 text-blue-500">Ajouter <span className="text-white">{activeView}</span></h2>
            <form onSubmit={handleSave} className="space-y-6">
              <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white italic font-bold" placeholder="Nom / Libellé" value={formData.U_FirstName} onChange={e => setFormData({...formData, U_FirstName: e.target.value, CP_Name: e.target.value, FOR_Title: e.target.value})} />
              <button type="submit" className="w-full bg-blue-600 py-6 rounded-2xl font-black uppercase shadow-xl hover:bg-blue-500 transition-all">Enregistrer</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-[10px] font-black uppercase text-slate-600 mt-4">Fermer</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}