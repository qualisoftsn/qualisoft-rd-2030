/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import apiClient from "@/core/api/api-client";
import { useAuthStore } from "@/store/authStore";
import {
  Archive, Edit, RefreshCcw, ShieldAlert, TrendingUp,
  Plus, Search, Award, GraduationCap, CheckCircle, Zap, Trash2,
  X, Mail
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

// --- 1. TYPAGE STRICT ---
type RHView = 'MATRIX' | 'EMPLOYEES' | 'RISKS' | 'FORMATIONS';

interface UserCompetence {
  UC_CompetenceId: string;
  UC_NiveauActuel: number;
}

interface User {
  U_Id: string;
  U_Email: string;
  U_FirstName: string;
  U_LastName: string;
  U_Role: string;
  U_Competences?: UserCompetence[];
}

interface Competence {
  CP_Id: string;
  CP_Name: string;
  CP_NiveauRequis: number;
}

interface Formation {
  FOR_Id: string;
  FOR_Title: string;
  FOR_Date: string;
  FOR_Status: string;
}

interface HRData {
  users: User[];
  competences: Competence[];
  formations: Formation[];
}

export default function HRIntelligenceHub() {
  const user = useAuthStore((state) => state.user);
  const tenantId = user?.tenantId;
  
  const [activeView, setActiveView] = useState<RHView>("MATRIX");
  const [data, setData] = useState<HRData>({ users: [], competences: [], formations: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'USER' | 'COMP'>('USER'); 
  
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    compName: '' 
  });

  const fetchData = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const [matrixRes, formsRes] = await Promise.all([
        apiClient.get("/competences/matrix"),
        apiClient.get("/formations").catch(() => ({ data: [] })),
      ]);
      setData({
        users: Array.isArray(matrixRes.data.users) ? matrixRes.data.users : [],
        competences: Array.isArray(matrixRes.data.competences) ? matrixRes.data.competences : [],
        formations: Array.isArray(formsRes.data) ? formsRes.data : [],
      });
    } catch (e) {
      toast.error("Erreur de synchronisation avec le serveur");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const gpecIntelligence = useMemo(() => {
    let totalGaps = 0;
    const criticalGaps: { user: User; gaps: Competence[] }[] = [];

    data.users.forEach((u: User) => {
      const userGaps = data.competences.filter((c: Competence) => {
        const currentLvl = u.U_Competences?.find((uc: UserCompetence) => uc.UC_CompetenceId === c.CP_Id)?.UC_NiveauActuel || 0;
        return currentLvl < c.CP_NiveauRequis;
      });

      if (userGaps.length > 0) {
        totalGaps += userGaps.length;
        criticalGaps.push({ user: u, gaps: userGaps });
      }
    });

    const totalPossible = data.users.length * data.competences.length;
    const coverage = totalPossible > 0
      ? (100 - (totalGaps / totalPossible) * 100).toFixed(1)
      : "100";

    return { coverage, totalGaps, criticalGaps };
  }, [data]);

  const handleEvaluate = async (userId: string, compId: string, current: number) => {
    try {
      const next = current >= 4 ? 0 : current + 1;
      await apiClient.post("/competences/evaluate", { userId, competenceId: compId, level: next });
      fetchData();
    } catch { toast.error("Échec de la mise à jour"); }
  };

  const handleAutoGeneratePlan = async () => {
    if (gpecIntelligence.totalGaps === 0) return toast.success("SMI Conforme : Aucun écart détecté.");
    
    try {
      toast.loading("Génération intelligente du plan de formation...");
      
      const promises = gpecIntelligence.criticalGaps.map((item) => {
        const missingSkills = item.gaps.map(g => g.CP_Name).join(", ");
        const title = missingSkills.length > 50 
          ? `Plan de montée en compétence (Multi-postes)` 
          : `Remise à niveau : ${missingSkills}`;

        return apiClient.post("/formations", {
          tenantId,
          FOR_Title: title,
          FOR_UserId: item.user.U_Id,
          // --- CORRECTION CRITIQUE ICI ---
          // On envoie la date ISO complète pour Prisma (format: 2026-02-02T10:00:00.000Z)
          // et non juste la date tronquée (2026-02-02)
          FOR_Date: new Date().toISOString(), 
          FOR_Status: 'PLANIFIE'
        });
      });

      await Promise.all(promises);
      toast.dismiss();
      toast.success(`${gpecIntelligence.criticalGaps.length} plans de formation générés §7.2`);
      fetchData();
      setActiveView('FORMATIONS');
    } catch { 
      toast.dismiss(); 
      toast.error("Erreur lors de la création des plans"); 
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === 'USER') {
        if (!formData.email.includes('@')) {
          return toast.error("Veuillez entrer une adresse email valide.");
        }

        await apiClient.post("/users", { 
          tenantId, 
          U_Email: formData.email, 
          U_FirstName: formData.firstName, 
          U_LastName: formData.lastName, 
          U_Role: 'USER' 
        });
      } else {
        await apiClient.post("/competences", { 
          tenantId, 
          CP_Name: formData.compName, 
          CP_NiveauRequis: 3 
        });
      }
      toast.success("Enregistrement réussi");
      setIsModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '', compName: '' });
      fetchData();
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 409 || error.response?.data?.message?.includes("Unique constraint")) {
        toast.error("Cet email existe déjà dans la base de données.");
      } else {
        toast.error("Erreur d'enregistrement");
      }
    }
  };

  const filteredUsers = useMemo(() => {
    return data.users.filter((u) =>
      `${u.U_FirstName} ${u.U_LastName} ${u.U_Email}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data.users, searchTerm]);

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen text-white italic ml-80 font-sans overflow-hidden">
      
      {/* HEADER */}
      <header className="flex justify-between items-end border-b border-white/5 pb-8 mb-8">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-none">
            RH <span className="text-blue-600">Master Hub</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-3">
            GPEC • Intelligence Opérationnelle • ISO 9001 §7.2
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleAutoGeneratePlan} className="bg-amber-600 px-6 py-4 rounded-2xl font-black uppercase text-xs shadow-xl flex items-center gap-3 hover:bg-amber-500 transition-all active:scale-95 border border-amber-500/20">
            <Zap size={18} fill="currentColor" /> IA Plan GPEC
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 px-6 py-4 rounded-2xl font-black uppercase text-xs shadow-xl flex items-center gap-3 hover:bg-blue-500 transition-all active:scale-95 border border-blue-500/20">
            <Plus size={18} strokeWidth={3} /> Ajouter
          </button>
        </div>
      </header>

      {/* CONTROLS */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
          {(['MATRIX', 'EMPLOYEES', 'RISKS', 'FORMATIONS'] as RHView[]).map((v) => (
            <button 
              key={v} 
              onClick={() => setActiveView(v)} 
              className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeView === v ? "bg-blue-600 shadow-lg text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 w-80">
          <Search size={16} className="text-slate-500" />
          <input 
            type="text" 
            placeholder="FILTRER (NOM / EMAIL)..." 
            className="bg-transparent outline-none font-black uppercase text-[10px] w-full text-white placeholder-slate-600" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] min-h-[600px] backdrop-blur-2xl overflow-hidden shadow-2xl relative">
        
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-50 bg-[#0B0F1A]/80">
            <RefreshCcw className="animate-spin text-blue-500" size={40} />
            <span className="text-blue-500 font-black uppercase tracking-[0.5em] text-xs">Chargement Matrice</span>
          </div>
        ) : (
          <div className="overflow-x-auto h-[calc(100vh-250px)] custom-scroll">
            
            {/* VUE MATRICE */}
            {activeView === "MATRIX" && (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#0B0F1A] z-20 shadow-lg">
                  <tr className="border-b border-white/5">
                    <th className="p-6 text-left sticky left-0 bg-[#0B0F1A] border-r border-white/5 z-30 w-80">
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Collaborateur</span>
                    </th>
                    {data.competences.map((c) => (
                      <th key={c.CP_Id} className="p-4 text-center min-w-[140px] border-l border-white/5">
                        <span className="block text-xs font-bold text-slate-300 mb-1 truncate">{c.CP_Name}</span>
                        <span className="text-[8px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">REQ: L{c.CP_NiveauRequis}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={data.competences.length + 1} className="p-10 text-center text-slate-500">Aucun collaborateur trouvé.</td></tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.U_Id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-6 sticky left-0 bg-[#0B0F1A] border-r border-white/5 z-10 group-hover:bg-[#0B0F1A]">
                          <p className="font-black text-sm italic text-slate-200">{u.U_FirstName} {u.U_LastName}</p>
                          <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">{u.U_Email}</p>
                        </td>
                        {data.competences.map((c) => {
                          const lvl = u.U_Competences?.find((uc) => uc.UC_CompetenceId === c.CP_Id)?.UC_NiveauActuel || 0;
                          const isGap = lvl < c.CP_NiveauRequis;
                          
                          return (
                            <td key={c.CP_Id} className="p-2 text-center border-l border-white/5">
                              <button 
                                onClick={() => handleEvaluate(u.U_Id, c.CP_Id, lvl)} 
                                className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs transition-all duration-200 border
                                  ${isGap 
                                    ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500 hover:text-white" 
                                    : "bg-blue-500/5 text-blue-400 border-blue-500/20 hover:bg-blue-500 hover:text-white"
                                  }`}
                              >
                                {lvl}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* VUE RISQUES (KPIs) */}
            {activeView === "RISKS" && (
              <div className="p-12 space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-500/20 rounded-[2rem] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={64}/></div>
                      <p className="text-blue-400 font-black uppercase tracking-widest text-xs mb-2">Indice de Maîtrise SMI</p>
                      <p className="text-7xl font-black text-white">{gpecIntelligence.coverage}%</p>
                    </div>
                    <div className="p-8 bg-gradient-to-br from-red-600/10 to-red-600/5 border border-red-500/20 rounded-[2rem] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldAlert size={64}/></div>
                      <p className="text-red-400 font-black uppercase tracking-widest text-xs mb-2">Déficits Critiques §7.2</p>
                      <p className="text-7xl font-black text-white">{gpecIntelligence.totalGaps}</p>
                    </div>
                 </div>
                 
                 <div>
                    <h3 className="text-xl font-black uppercase italic mb-6 text-slate-300">Collaborateurs en situation d'écart</h3>
                    <div className="space-y-3">
                       {gpecIntelligence.criticalGaps.length === 0 && <p className="text-slate-500 italic">Aucun écart critique.</p>}
                       {gpecIntelligence.criticalGaps.map((item, idx) => (
                         <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex justify-between items-center hover:border-red-500/40 transition-all">
                           <div>
                             <p className="font-black uppercase italic text-white text-lg">{item.user.U_FirstName} {item.user.U_LastName}</p>
                             <p className="text-[10px] font-bold text-red-400 uppercase mt-1">{item.gaps.length} compétences manquantes</p>
                           </div>
                           <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {/* VUE FORMATIONS */}
            {activeView === "FORMATIONS" && (
              <div className="p-12 space-y-4">
                {data.formations.length === 0 ? <p className="text-center text-slate-500 mt-20">Aucune formation planifiée.</p> : (
                  data.formations.map((f) => (
                    <div key={f.FOR_Id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex justify-between items-center group hover:border-emerald-500/50 transition-all">
                      <div className="flex items-center gap-4">
                         <div className={`p-2 rounded-lg ${f.FOR_Status === 'PLANIFIE' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                           <GraduationCap size={20} />
                         </div>
                         <div>
                           <p className="font-bold uppercase italic text-slate-200">{f.FOR_Title}</p>
                           <p className="text-[10px] text-slate-500 uppercase mt-1">{new Date(f.FOR_Date).toLocaleDateString()} • {f.FOR_Status}</p>
                         </div>
                      </div>
                      <button className="text-slate-600 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {/* VUE EMPLOYEES (Simple List) */}
             {activeView === "EMPLOYEES" && (
              <div className="p-12 space-y-4">
                {filteredUsers.map((u) => (
                    <div key={u.U_Id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex justify-between items-center hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                                {u.U_FirstName[0]}{u.U_LastName[0]}
                            </div>
                            <div>
                                <p className="font-black text-lg italic text-white">{u.U_FirstName} {u.U_LastName}</p>
                                <p className="text-xs text-slate-500 font-bold uppercase">{u.U_Role}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{u.U_Email}</p>
                        </div>
                    </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALE UNIVERSELLE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B0F1A] border border-white/10 w-full max-w-lg rounded-[2rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black uppercase italic text-white">
                {modalType === 'USER' ? 'Nouveau' : 'Nouvelle'} <span className="text-blue-500">{modalType === 'USER' ? 'Collaborateur' : 'Compétence'}</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-5">
              {modalType === 'USER' && (
                <>
                  <div className="relative group">
                    <label className="text-[8px] font-bold uppercase text-slate-500 mb-1 ml-1 block">Email Professionnel (Obligatoire)</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-4 top-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input 
                            required 
                            type="email" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-bold italic outline-none focus:border-blue-600 transition-colors" 
                            placeholder="nom@entreprise.sn" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                        />
                    </div>
                  </div>
                  
                  <input required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold italic outline-none focus:border-blue-600 transition-colors" placeholder="PRÉNOM" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                  <input required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold italic outline-none focus:border-blue-600 transition-colors" placeholder="NOM" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </>
              )}
              {modalType === 'COMP' && (
                <input required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold italic outline-none focus:border-blue-600 transition-colors" placeholder="INTITULÉ DE LA COMPÉTENCE" value={formData.compName} onChange={e => setFormData({...formData, compName: e.target.value})} />
              )}
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-xl border border-white/10 text-slate-400 font-bold uppercase text-xs hover:bg-white/5 transition-all">Annuler</button>
                <button type="submit" className="flex-1 bg-blue-600 py-4 rounded-xl font-bold uppercase text-white shadow-lg hover:bg-blue-500 transition-all">Valider</button>
              </div>
            </form>
            
            <div className="mt-6 pt-6 border-t border-white/5 flex justify-center">
              <button onClick={() => setModalType(modalType === 'USER' ? 'COMP' : 'USER')} className="text-[10px] font-bold uppercase text-slate-600 tracking-widest hover:text-blue-400 transition-colors">
                Changer de type ({modalType === 'USER' ? 'Créer Compétence' : 'Créer Collaborateur'})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}