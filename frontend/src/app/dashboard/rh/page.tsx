/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import apiClient from "@/core/api/api-client";
import { useAuthStore } from "@/store/authStore";
import {
  RefreshCcw, ShieldAlert, TrendingUp,
  Plus, Search, GraduationCap, Zap, Trash2,
  X, Mail, UserPlus, Award, BarChart, Activity, Settings2
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

/**
 * 🛠️ CONFIGURATION ÉLITE
 * Centralisation des vues et types pour la gestion de la compétence §7.2.
 */
type RHView = 'MATRIX' | 'EMPLOYEES' | 'RISKS' | 'FORMATIONS';

interface HRData {
  users: any[];
  competences: any[];
  formations: any[];
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
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', compName: '' });

  /**
   * 📡 SYNCHRONISATION DU NOYAU
   */
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
      toast.error("Rupture de flux : Erreur Master Hub");
    } finally { setLoading(false); }
  }, [tenantId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * 🧠 MOTEUR ANALYTIQUE GPEC
   * Calcul des écarts critiques et du taux de couverture global.
   */
  const gpecIntelligence = useMemo(() => {
    let totalGaps = 0;
    const criticalGaps: any[] = [];

    data.users.forEach((u) => {
      const userGaps = data.competences.filter((c) => {
        const currentLvl = u.U_Competences?.find((uc: any) => uc.UC_CompetenceId === c.CP_Id)?.UC_NiveauActuel || 0;
        return currentLvl < c.CP_NiveauRequis;
      });
      if (userGaps.length > 0) {
        totalGaps += userGaps.length;
        criticalGaps.push({ user: u, gaps: userGaps });
      }
    });

    const totalPossible = data.users.length * data.competences.length;
    const coverage = totalPossible > 0 ? (100 - (totalGaps / totalPossible) * 100).toFixed(1) : "100";
    return { coverage, totalGaps, criticalGaps, totalPossible };
  }, [data]);

  const handleEvaluate = async (userId: string, compId: string, current: number) => {
    try {
      const next = current >= 4 ? 0 : current + 1;
      await apiClient.post("/competences/evaluate", { userId, competenceId: compId, level: next });
      fetchData();
    } catch { toast.error("Échec évaluation"); }
  };

  /**
   * 🤖 IA PLAN GPEC
   * Génération automatique des plans de formation pour combler les écarts (§10.2).
   */
  const handleAutoGeneratePlan = async () => {
    if (gpecIntelligence.totalGaps === 0) return toast.success("Conformité totale détectée.");
    try {
      toast.loading("IA : Génération du plan directeur...");
      const promises = gpecIntelligence.criticalGaps.map((item) => {
        const title = `Mise à niveau GPEC : ${item.gaps.map((g: any) => g.CP_Name).join(", ")}`.slice(0, 80);
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
      toast.success("Plans de formation scellés §7.2");
      fetchData();
      setActiveView('FORMATIONS');
    } catch { toast.dismiss(); toast.error("Erreur Plan IA"); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === 'USER') {
        await apiClient.post("/users", { tenantId, U_Email: formData.email, U_FirstName: formData.firstName, U_LastName: formData.lastName, U_Role: 'USER' });
      } else {
        await apiClient.post("/competences", { tenantId, CP_Name: formData.compName, CP_NiveauRequis: 3 });
      }
      toast.success("Données scellées");
      setIsModalOpen(false);
      fetchData();
    } catch { toast.error("Erreur d'écriture"); }
  };

  const filteredUsers = useMemo(() => {
    return data.users.filter((u) =>
      `${u.U_FirstName} ${u.U_LastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data.users, searchTerm]);

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen text-white italic ml-80 font-sans selection:bg-blue-600/30">
      
      <header className="flex justify-between items-end border-b border-white/5 pb-10 mb-10">
        <div className="text-left">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">RH <span className="text-blue-600">Master Hub</span></h1>
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] mt-4">Intelligence GPEC • ISO 9001 §7.2</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleAutoGeneratePlan} className="bg-amber-600 px-8 py-5 rounded-3xl font-black uppercase text-xs shadow-2xl flex items-center gap-4 hover:bg-amber-500 transition-all border-none cursor-pointer"><Zap size={20} fill="currentColor" /> IA Plan GPEC</button>
          <button onClick={() => { setModalType('USER'); setIsModalOpen(true); }} className="bg-blue-600 px-8 py-5 rounded-3xl font-black uppercase text-xs shadow-2xl flex items-center gap-4 hover:bg-blue-500 transition-all border-none cursor-pointer"><Plus size={20} strokeWidth={4} /> Nouveau Vecteur</button>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex gap-3 bg-white/5 p-2 rounded-3xl border border-white/10">
          {(['MATRIX', 'EMPLOYEES', 'RISKS', 'FORMATIONS'] as RHView[]).map((v) => (
            <button key={v} onClick={() => setActiveView(v)} className={`px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer ${activeView === v ? "bg-blue-600 shadow-xl text-white" : "text-slate-500 hover:text-white"}`}>{v}</button>
          ))}
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-8 py-4 rounded-3xl border border-white/10 w-96 shadow-inner">
          <Search size={18} className="text-slate-500" />
          <input type="text" placeholder="RECHERCHER DANS LE REGISTRE..." className="bg-transparent outline-none font-black uppercase text-[10px] w-full text-white italic" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* RENDERER DYNAMIQUE */}
      <div className="bg-slate-900/20 border border-white/5 rounded-[4rem] min-h-150 backdrop-blur-3xl overflow-hidden shadow-2xl relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#0B0F1A]/90 z-50">
            <RefreshCcw className="animate-spin text-blue-500" size={50} />
            <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-xs italic">Sync Matrix Core...</span>
          </div>
        ) : (
          <div className="h-[calc(100vh-320px)] overflow-auto custom-scrollbar">
            {activeView === "MATRIX" && (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#0B0F1A]/95 backdrop-blur-xl z-20 shadow-2xl">
                  <tr className="border-b border-white/5">
                    <th className="p-10 sticky left-0 bg-[#0B0F1A] border-r border-white/5 z-30 min-w-[320px]"><span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Collaborateur</span></th>
                    {data.competences.map((c) => (
                      <th key={c.CP_Id} className="p-8 text-center min-w-44 border-l border-white/5 text-xs font-black uppercase italic">{c.CP_Name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr key={u.U_Id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-10 sticky left-0 bg-[#0B0F1A]/95 border-r border-white/5 z-10 font-black text-xl italic uppercase tracking-tighter">{u.U_FirstName} {u.U_LastName}</td>
                      {data.competences.map((c) => {
                        const lvl = u.U_Competences?.find((uc: any) => uc.UC_CompetenceId === c.CP_Id)?.UC_NiveauActuel || 0;
                        const isGap = lvl < c.CP_NiveauRequis;
                        return (
                          <td key={c.CP_Id} className="p-4 text-center border-l border-white/5">
                            <button onClick={() => handleEvaluate(u.U_Id, c.CP_Id, lvl)} className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border cursor-pointer transition-all ${isGap ? "bg-rose-600/10 text-rose-500 border-rose-600/20" : "bg-blue-600/10 text-blue-400 border-blue-600/20"}`}>{lvl}</button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeView === "RISKS" && (
              <div className="p-20 space-y-16 text-left animate-in fade-in duration-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="p-12 bg-linear-to-br from-blue-600/10 to-transparent border border-blue-600/20 rounded-[3rem] shadow-2xl relative">
                      <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] mb-4 italic">Indice de Maîtrise GPEC</p>
                      <p className="text-8xl font-black text-white italic tracking-tighter">{gpecIntelligence.coverage}%</p>
                      
                      {/* --- FIX : FORMULE SCELLÉE DANS UNE CHAÎNE POUR ÉVITER L'ERREUR "NAME GAPS" --- */}
                      <div className="mt-8 p-6 bg-black/40 rounded-2xl border border-white/5 text-[10px] text-slate-500 font-bold uppercase italic tracking-widest">
                        {"Formule ISO 9001 : $$Coverage = (1 - \\frac{totalGaps}{totalPossible}) \\times 100$$"}
                      </div>
                    </div>
                    
                    <div className="p-12 bg-linear-to-br from-rose-600/10 to-transparent border border-rose-600/20 rounded-[3rem] shadow-2xl relative">
                      <p className="text-rose-500 font-black uppercase tracking-[0.4em] text-[10px] mb-4 italic">Déficits Critiques §7.2</p>
                      <p className="text-8xl font-black text-white italic tracking-tighter">{gpecIntelligence.totalGaps}</p>
                      <div className="mt-8 text-[11px] font-black text-rose-500 uppercase tracking-widest italic">Alerte IA : Mise à niveau requise</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-3xl font-black uppercase italic mb-10 text-slate-400 tracking-tighter">Collaborateurs sous le seuil d&apos;aptitude</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                       {gpecIntelligence.criticalGaps.map((item, idx) => (
                         <div key={idx} className="bg-white/5 border border-white/10 p-10 rounded-3xl flex justify-between items-center group transition-all">
                           <div className="text-left">
                             <p className="font-black uppercase italic text-white text-2xl tracking-tighter">{item.user.U_FirstName} {item.user.U_LastName}</p>
                             <p className="text-[10px] font-black text-rose-500 uppercase mt-2 tracking-widest italic">{item.gaps.length} écarts détectés</p>
                           </div>
                           <span className="w-5 h-5 bg-rose-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.8)]"></span>
                         </div>
                       ))}
                    </div>
                  </div>
              </div>
            )}

            {activeView === "FORMATIONS" && (
              <div className="p-20 space-y-6 animate-in slide-in-from-bottom-10 duration-700 text-left">
                {data.formations.map((f) => (
                  <div key={f.FOR_Id} className="bg-white/5 border border-white/5 p-8 rounded-4xl flex justify-between items-center group hover:bg-white/10 transition-all shadow-xl">
                    <div className="flex items-center gap-8">
                       <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-amber-600/20 text-amber-500"><GraduationCap size={28} /></div>
                       <div>
                         <p className="font-black uppercase italic text-slate-100 text-xl leading-none tracking-tighter">{f.FOR_Title}</p>
                         <p className="text-[11px] text-slate-500 font-black uppercase mt-3 italic">{new Date(f.FOR_Date).toLocaleDateString()} • {f.FOR_Status}</p>
                       </div>
                    </div>
                    <button className="text-slate-700 hover:text-rose-500 p-4 border-none bg-transparent cursor-pointer transition-all"><Trash2 size={24} /></button>
                  </div>
                ))}
              </div>
            )}

            {activeView === "EMPLOYEES" && (
              <div className="p-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left animate-in fade-in duration-700">
                {filteredUsers.map((u) => (
                  <div key={u.U_Id} className="bg-[#0B0F1A] border border-white/10 p-10 rounded-[3rem] shadow-2xl group hover:border-blue-600/40 transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-500 border border-blue-600/30 flex items-center justify-center font-black text-2xl italic mb-8">{u.U_FirstName[0]}{u.U_LastName[0]}</div>
                    <h3 className="text-2xl font-black uppercase italic text-white leading-none tracking-tighter">{u.U_FirstName} {u.U_LastName}</h3>
                    <p className="text-[11px] text-slate-500 font-black uppercase mt-4 tracking-widest italic">{u.U_Role}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL SOUVERAIN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-100 flex items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="bg-[#0B0F1A] border border-white/10 w-full max-w-xl rounded-[4rem] p-16 shadow-3xl text-left">
            <h2 className="text-4xl font-black uppercase italic text-white tracking-tighter mb-10">
              Définir {modalType === 'USER' ? 'Collaborateur' : 'Compétence'}
            </h2>
            <form onSubmit={handleSave} className="space-y-6">
              {modalType === 'USER' ? (
                <>
                  <input required type="email" className="w-full bg-[#0F172A] border border-white/10 rounded-2xl p-6 text-white font-black italic outline-none focus:border-blue-600" placeholder="EMAIL" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <input required className="w-full bg-[#0F172A] border border-white/10 rounded-2xl p-6 text-white font-black italic outline-none focus:border-blue-600" placeholder="PRÉNOM" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    <input required className="w-full bg-[#0F172A] border border-white/10 rounded-2xl p-6 text-white font-black italic outline-none focus:border-blue-600" placeholder="NOM" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                </>
              ) : (
                <input required className="w-full bg-[#0F172A] border border-white/10 rounded-2xl p-6 text-white font-black italic outline-none focus:border-blue-600" placeholder="INTITULÉ GPEC" value={formData.compName} onChange={e => setFormData({...formData, compName: e.target.value})} />
              )}
              <div className="flex gap-4 pt-10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-7 rounded-3xl border border-white/5 text-slate-500 font-black uppercase text-[11px] italic cursor-pointer">Annuler</button>
                <button type="submit" className="flex-1 bg-blue-600 py-7 rounded-3xl font-black uppercase text-white shadow-2xl border-none cursor-pointer italic active:scale-95">Sceller</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}