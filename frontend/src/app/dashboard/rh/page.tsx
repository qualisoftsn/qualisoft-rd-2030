/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
"use client";

import apiClient from "@/core/api/api-client";
import { useAuthStore } from "@/store/authStore";
import {
  RefreshCcw, ShieldAlert, TrendingUp,
  Plus, Search, GraduationCap, Zap, Trash2,
  X, Mail, UserPlus, Award, BarChart, Activity
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

// --- UTILITAIRES ---
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

// --- 1. TYPAGE STRICT & SCELLÉ ---
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
      toast.error("Erreur de synchronisation Master");
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

    return { coverage, totalGaps, criticalGaps, totalPossible };
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
      toast.loading("IA : Génération du plan de formation...");
      const promises = gpecIntelligence.criticalGaps.map((item) => {
        const missingSkills = item.gaps.map(g => g.CP_Name).join(", ");
        const title = missingSkills.length > 50 ? `Plan GPEC : Multi-postes` : `Mise à niveau : ${missingSkills}`;
        return apiClient.post("/formations", {
          tenantId,
          FOR_Title: title,
          FOR_UserId: item.user.U_Id,
          FOR_Date: new Date().toISOString(), 
          FOR_Status: 'PLANIFIE'
        });
      });
      await Promise.all(promises);
      toast.dismiss();
      toast.success(`${gpecIntelligence.criticalGaps.length} plans scellés §7.2`);
      fetchData();
      setActiveView('FORMATIONS');
    } catch { toast.dismiss(); toast.error("Erreur plan IA"); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === 'USER') {
        if (!formData.email.includes('@')) return toast.error("Email invalide.");
        await apiClient.post("/users", { tenantId, U_Email: formData.email, U_FirstName: formData.firstName, U_LastName: formData.lastName, U_Role: 'USER' });
      } else {
        await apiClient.post("/competences", { tenantId, CP_Name: formData.compName, CP_NiveauRequis: 3 });
      }
      toast.success("Enregistrement réussi");
      setIsModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '', compName: '' });
      fetchData();
    } catch (error: any) {
      toast.error("Erreur d'écriture serveur");
    }
  };

  const filteredUsers = useMemo(() => {
    return data.users.filter((u) =>
      `${u.U_FirstName} ${u.U_LastName} ${u.U_Email}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data.users, searchTerm]);

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen text-white italic ml-80 font-sans selection:bg-blue-600/30">
      
      <header className="flex justify-between items-end border-b border-white/5 pb-10 mb-10">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none">RH <span className="text-blue-600">Master Hub</span></h1>
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] mt-4">GPEC • ISO 9001:2015 §7.2</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleAutoGeneratePlan} className="bg-amber-600 px-8 py-5 rounded-3xl font-black uppercase text-xs shadow-2xl flex items-center gap-4 hover:bg-amber-500 transition-all border-none cursor-pointer"><Zap size={20} fill="currentColor" /> IA Plan GPEC</button>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 px-8 py-5 rounded-3xl font-black uppercase text-xs shadow-2xl flex items-center gap-4 hover:bg-blue-500 transition-all border-none cursor-pointer"><Plus size={20} strokeWidth={4} /> Ajouter</button>
        </div>
      </header>

      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-3 bg-white/5 p-1.5 rounded-3xl border border-white/10">
          {(['MATRIX', 'EMPLOYEES', 'RISKS', 'FORMATIONS'] as RHView[]).map((v) => (
            <button key={v} onClick={() => setActiveView(v)} className={`px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer ${activeView === v ? "bg-blue-600 shadow-xl text-white" : "text-slate-500 hover:text-white"}`}>{v}</button>
          ))}
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-8 py-4 rounded-3xl border border-white/10 w-96 shadow-inner">
          <Search size={18} className="text-slate-500" />
          <input type="text" placeholder="RECHERCHER COLLABORATEUR..." className="bg-transparent outline-none font-black uppercase text-[10px] w-full text-white placeholder-slate-700 italic" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-slate-900/20 border border-white/5 rounded-[3.5rem] min-h-150 backdrop-blur-3xl overflow-hidden shadow-2xl relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-50 bg-[#0B0F1A]/90">
            <RefreshCcw className="animate-spin text-blue-500" size={50} />
            <span className="text-blue-500 font-black uppercase tracking-[0.6em] text-xs">Synchronisation Matrice...</span>
          </div>
        ) : (
          <div className="h-[calc(100vh-280px)] overflow-auto custom-scrollbar pr-1">
            
            {activeView === "MATRIX" && (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#0B0F1A]/95 backdrop-blur-xl z-20 shadow-xl">
                  <tr className="border-b border-white/5">
                    <th className="p-8 sticky left-0 bg-[#0B0F1A] border-r border-white/5 z-30 min-w-[320px]"><span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Collaborateur</span></th>
                    {data.competences.map((c) => (
                      <th key={c.CP_Id} className="p-6 text-center min-w-40 border-l border-white/5">
                        <span className="block text-xs font-black text-slate-200 mb-2 truncate italic">{c.CP_Name}</span>
                        <span className="text-[9px] bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full border border-blue-600/20">REQ: L{c.CP_NiveauRequis}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr key={u.U_Id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-8 sticky left-0 bg-[#0B0F1A]/95 border-r border-white/5 z-10 group-hover:bg-[#0B0F1A]">
                        <p className="font-black text-lg italic text-white leading-none">{u.U_FirstName} {u.U_LastName}</p>
                        <p className="text-[9px] text-slate-600 font-bold uppercase mt-2 tracking-widest">{u.U_Email}</p>
                      </td>
                      {data.competences.map((c) => {
                        const lvl = u.U_Competences?.find((uc) => uc.UC_CompetenceId === c.CP_Id)?.UC_NiveauActuel || 0;
                        const isGap = lvl < c.CP_NiveauRequis;
                        return (
                          <td key={c.CP_Id} className="p-4 text-center border-l border-white/5">
                            <button onClick={() => handleEvaluate(u.U_Id, c.CP_Id, lvl)} className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-300 border cursor-pointer", isGap ? "bg-rose-600/10 text-rose-500 border-rose-600/20" : "bg-blue-600/10 text-blue-400 border-blue-600/20")}>{lvl}</button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeView === "RISKS" && (
              <div className="p-16 space-y-16 animate-in fade-in duration-700">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="p-12 bg-linear-to-br from-blue-600/10 to-transparent border border-blue-600/20 rounded-[3rem] relative overflow-hidden shadow-2xl">
                      <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-xs mb-4 italic">Indice de Maîtrise GPEC</p>
                      <p className="text-8xl font-black text-white italic tracking-tighter">{gpecIntelligence.coverage}%</p>
                      <div className="mt-6 text-[10px] text-slate-500 font-bold italic uppercase tracking-widest">
                        {/* FIX: Échappement de la formule pour éviter l'erreur de build TS */}
                        {"Calcul: $$(1 - \\frac{totalGaps}{totalPossible}) \\times 100$$"}
                      </div>
                    </div>
                    <div className="p-12 bg-linear-to-br from-rose-600/10 to-transparent border border-rose-600/20 rounded-[3rem] relative overflow-hidden shadow-2xl">
                      <p className="text-rose-500 font-black uppercase tracking-[0.4em] text-xs mb-4 italic">Déficits Critiques §7.2</p>
                      <p className="text-8xl font-black text-white italic tracking-tighter">{gpecIntelligence.totalGaps}</p>
                      <div className="mt-6 text-[10px] text-slate-500 font-bold italic uppercase tracking-widest">Alerte IA: Mise à niveau requise</div>
                    </div>
                 </div>
                 <div>
                    <h3 className="text-3xl font-black uppercase italic mb-8 text-slate-400 tracking-tighter">Focus Écarts Collaborateurs</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                       {gpecIntelligence.criticalGaps.map((item, idx) => (
                         <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-3xl flex justify-between items-center hover:bg-rose-600/5 hover:border-rose-600/40 transition-all group">
                           <div>
                             <p className="font-black uppercase italic text-white text-xl">{item.user.U_FirstName} {item.user.U_LastName}</p>
                             <p className="text-[10px] font-black text-rose-500 uppercase mt-2 tracking-[0.2em]">{item.gaps.length} compétences à risque</p>
                           </div>
                           <span className="w-4 h-4 bg-rose-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.8)]"></span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {activeView === "FORMATIONS" && (
              <div className="p-16 space-y-6 animate-in slide-in-from-bottom-10 duration-700">
                {data.formations.map((f) => (
                  <div key={f.FOR_Id} className="bg-white/5 border border-white/5 p-8 rounded-4xl flex justify-between items-center group hover:bg-white/10 transition-all shadow-xl">
                    <div className="flex items-center gap-6">
                       <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", f.FOR_Status === 'PLANIFIE' ? 'bg-amber-600/20 text-amber-500' : 'bg-emerald-600/20 text-emerald-500')}>
                         <Activity size={24} />
                       </div>
                       <div>
                         <p className="font-black uppercase italic text-slate-100 text-lg leading-none">{f.FOR_Title}</p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest italic">{new Date(f.FOR_Date).toLocaleDateString()} • {f.FOR_Status}</p>
                       </div>
                    </div>
                    <button className="text-slate-700 hover:text-rose-500 p-4 hover:bg-rose-600/10 rounded-2xl transition-all border-none cursor-pointer"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            )}
            
             {activeView === "EMPLOYEES" && (
              <div className="p-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredUsers.map((u) => (
                    <div key={u.U_Id} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex justify-between items-center hover:bg-blue-600/10 hover:border-blue-600/40 transition-all shadow-xl group">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-600/20 flex items-center justify-center font-black text-xl italic shadow-inner">{u.U_FirstName[0]}{u.U_LastName[0]}</div>
                            <div>
                                <p className="font-black text-2xl italic text-white leading-none tracking-tighter">{u.U_FirstName} {u.U_LastName}</p>
                                <p className="text-[10px] text-slate-500 font-black uppercase mt-2 tracking-widest">{u.U_Role}</p>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-3">
                            <div className="p-3 bg-black/40 rounded-xl border border-white/5"><Mail size={16} className="text-slate-600" /></div>
                            <p className="text-[9px] font-black text-slate-600 uppercase italic tracking-tighter">{u.U_Email}</p>
                        </div>
                    </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#0B0F1A] border border-white/10 w-full max-w-xl rounded-[3rem] p-12 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white border-none bg-transparent cursor-pointer"><X size={32} /></button>
            <h2 className="text-4xl font-black uppercase italic text-white tracking-tighter mb-10">{modalType === 'USER' ? 'Citoyen' : 'Compétence'} <span className="text-blue-600">{modalType === 'USER' ? 'Master' : 'Stratégique'}</span></h2>
            <form onSubmit={handleSave} className="space-y-6">
              {modalType === 'USER' && (
                <>
                  <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-black italic outline-none focus:border-blue-600 text-sm" placeholder="EMAIL PROFESSIONNEL" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-black italic outline-none focus:border-blue-600 text-sm" placeholder="PRÉNOM" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-black italic outline-none focus:border-blue-600 text-sm" placeholder="NOM" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                </>
              )}
              {modalType === 'COMP' && <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-black italic outline-none focus:border-blue-600 text-sm" placeholder="INTITULÉ GPEC" value={formData.compName} onChange={e => setFormData({...formData, compName: e.target.value})} />}
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 rounded-2xl border border-white/5 text-slate-500 font-black uppercase text-xs hover:bg-white/5 cursor-pointer">Annuler</button>
                <button type="submit" className="flex-1 bg-blue-600 py-5 rounded-2xl font-black uppercase text-white shadow-2xl border-none cursor-pointer">Sceller</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}