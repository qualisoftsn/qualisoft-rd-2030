/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : HR INTELLIGENCE HUB (SDE COMMAND CENTER)
 * -------------------------------------------------------------------------
 * RÔLE : Centralisation de la gestion des compétences (GPEC) et formations (ISO 9001 §7.2).
 * ARCHITECTURE : Multi-Tenant, liaison stricte noyau SDE (apiClient).
 * CONSOLIDATION : 
 * 1. Design Full-Space Matrix.
 * 2. Moteur IA de génération de plans de formation activé.
 * 3. Formules mathématiques isolées.
 * 4. Zéro simulation, production mode strict.
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "@/core/api/api-client";
import { useAuthStore } from "@/store/authStore";
import {
  GraduationCap, Plus, RefreshCcw, Search,
  Trash2, Zap, Users, Target, ShieldCheck,
  Activity, Fingerprint, Loader2, X
} from "lucide-react";
import { toast, Toaster } from "sonner"; // Upgrade to Sonner for SDE standard

// --- 🏗️ TYPES STRICTS MATRIX SDE ---
type RHView = "MATRIX" | "EMPLOYEES" | "RISKS" | "FORMATIONS";

interface HRData {
  users: any[];
  competences: any[];
  formations: any[];
}

export default function HRIntelligenceHub() {
  const user = useAuthStore((state) => state.user);
  const tenantId = user?.tenantId;

  // --- 📦 ÉTATS SCELLÉS ---
  const [activeView, setActiveView] = useState<RHView>("MATRIX");
  const [data, setData] = useState<HRData>({ users: [], competences: [], formations: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- ÉTATS MODAL DE SCELLAGE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"USER" | "COMP">("USER");
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", compName: "" });

  /**
   * 📡 SYNCHRONISATION DU NOYAU MATRIX (PROD MODE)
   */
  const fetchData = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const [matrixRes, formsRes] = await Promise.all([
        apiClient.get("/competences/matrix"),
        apiClient.get("/formations").catch(() => ({ data: [] })),
      ]);
      
      const matrixPayload = matrixRes.data?.data || matrixRes.data;
      const formsPayload = formsRes.data?.data || formsRes.data;

      setData({
        users: Array.isArray(matrixPayload.users) ? matrixPayload.users : [],
        competences: Array.isArray(matrixPayload.competences) ? matrixPayload.competences : [],
        formations: Array.isArray(formsPayload) ? formsPayload : [],
      });
    } catch (e) {
      toast.error("RUPTURE DE FLUX : NOYAU RH INACCESSIBLE.");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * 🧠 MOTEUR ANALYTIQUE GPEC (ISO 9001 §7.2)
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

  /**
   * ⚡ ACTION : MUTATION DE COMPÉTENCE SDE
   */
  const handleEvaluate = async (userId: string, compId: string, current: number) => {
    const tid = toast.loading("Mutation du niveau d'aptitude...");
    try {
      const next = current >= 4 ? 0 : current + 1;
      await apiClient.post("/competences/evaluate", { userId, competenceId: compId, level: next });
      toast.success("NIVEAU SCELLÉ.", { id: tid });
      fetchData(); // Sync Matrix
    } catch {
      toast.error("ÉCHEC DE MUTATION SDE.", { id: tid });
    }
  };

  /**
   * 🤖 IA PLAN GPEC : GÉNÉRATION AUTOMATIQUE DES PLANS
   */
  const handleAutoGeneratePlan = async () => {
    if (gpecIntelligence.totalGaps === 0) return toast.success("SMI OPTIMAL : ZÉRO ÉCART DÉTECTÉ.");
    
    const tid = toast.loading("IA SDE : Compilation du plan directeur GPEC...");
    try {
      const promises = gpecIntelligence.criticalGaps.map((item) => {
        const title = `PLAN GPEC : ${item.gaps.map((g: any) => g.CP_Name).join(", ")}`.slice(0, 80);
        return apiClient.post("/formations", {
          tenantId,
          FOR_Title: title.toUpperCase(),
          FOR_UserId: item.user.U_Id,
          FOR_Date: new Date().toISOString(),
          FOR_Status: "PLANIFIE",
        });
      });
      
      await Promise.all(promises);
      toast.success("PLANS DE FORMATION SCELLÉS (§7.2).", { id: tid });
      fetchData();
      setActiveView("FORMATIONS");
    } catch {
      toast.error("ERREUR CRITIQUE IA PLAN.", { id: tid });
    }
  };

  /**
   * 💾 SCELLAGE DES NOUVELLES DONNÉES (USER/COMP)
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Écriture dans le noyau SDE...");
    try {
      if (modalType === "USER") {
        await apiClient.post("/users", {
          tenantId,
          U_Email: formData.email,
          U_FirstName: formData.firstName.toUpperCase(),
          U_LastName: formData.lastName.toUpperCase(),
          U_Role: "USER",
        });
      } else {
        await apiClient.post("/competences", {
          tenantId,
          CP_Name: formData.compName.toUpperCase(),
          CP_NiveauRequis: 3,
        });
      }
      toast.success("VECTEUR SCELLÉ DANS LA MATRIX.", { id: tid });
      setIsModalOpen(false);
      setFormData({ firstName: "", lastName: "", email: "", compName: "" }); // Reset
      fetchData();
    } catch {
      toast.error("ERREUR DE SCELLAGE.", { id: tid });
    }
  };

  // --- FILTRAGE COLLABORATEURS ---
  const filteredUsers = useMemo(() => {
    return data.users.filter((u) =>
      `${u.U_FirstName} ${u.U_LastName}`.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [data.users, searchTerm]);

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-16 ml-72 text-white font-sans italic text-left selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      <div className="w-full max-w-500 mx-auto space-y-16 animate-in fade-in duration-1000">
        
        {/* 🔝 EN-TÊTE STRATÉGIQUE (§7.2) */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b-4 border-white/5 pb-16">
          <div className="space-y-8">
            <div className="flex items-center gap-6 text-blue-500 bg-blue-500/5 w-fit px-8 py-3 rounded-full border border-blue-500/10 shadow-inner">
              <Activity size={24} className="animate-pulse" />
              <span className="text-[12px] font-black uppercase tracking-[0.5em]">Intelligence GPEC • ISO 9001 §7.2</span>
            </div>
            <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none text-white">
              RH <span className="text-blue-600">Master Hub</span>
            </h1>
          </div>
          
          <div className="flex gap-8">
            <button
              onClick={handleAutoGeneratePlan}
              className="bg-amber-600 hover:bg-white hover:text-amber-600 text-slate-900 px-10 py-6 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.5em] shadow-[0_20px_60px_rgba(245,158,11,0.4)] flex items-center gap-5 transition-all border-none cursor-pointer active:scale-95 group italic"
            >
              <Zap size={24} className="group-hover:scale-110 transition-transform" /> IA Plan GPEC
            </button>
            <button
              onClick={() => { setModalType("USER"); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-10 py-6 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.5em] shadow-[0_20px_60px_rgba(37,99,235,0.4)] flex items-center gap-5 transition-all border-none cursor-pointer active:scale-95 group italic"
            >
              <Plus size={28} strokeWidth={4} className="group-hover:rotate-90 transition-transform" /> Nouveau Vecteur
            </button>
          </div>
        </header>

        {/* 🧭 NAVIGATION TABS & MOTEUR DE RECHERCHE */}
        <div className="bg-[#151A2D] p-10 rounded-[4rem] border-4 border-white/5 flex flex-col xl:flex-row justify-between items-center gap-10 backdrop-blur-3xl shadow-4xl relative z-20">
          <div className="flex gap-4 bg-black/40 p-3 rounded-[3rem] border-2 border-white/5 shadow-inner w-full xl:w-auto overflow-x-auto custom-scrollbar">
            {(["MATRIX", "EMPLOYEES", "RISKS", "FORMATIONS"] as RHView[]).map((v) => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`px-12 py-6 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.5em] transition-all border-none cursor-pointer italic whitespace-nowrap ${
                  activeView === v 
                    ? "bg-blue-600 shadow-[0_10px_30px_rgba(37,99,235,0.5)] text-white" 
                    : "text-slate-500 hover:text-white hover:bg-white/5 bg-transparent"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-6 bg-black/60 px-10 py-8 rounded-[3rem] border-4 border-white/5 w-full xl:w-125 shadow-inner">
            <Search size={24} className="text-blue-500" />
            <input
              type="text"
              placeholder="SCANNER LE REGISTRE..."
              className="bg-transparent outline-none font-black uppercase text-[14px] w-full text-white italic tracking-[0.4em] placeholder:text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 🖥️ RENDERER DYNAMIQUE DES VUES */}
        <div className="bg-[#151A2D] border-4 border-white/5 rounded-[5rem] min-h-175 backdrop-blur-3xl overflow-hidden shadow-4xl relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-[#0B0F1A]/95 z-50 backdrop-blur-md">
              <Loader2 className="animate-spin text-blue-600" size={100} strokeWidth={1} />
              <span className="text-blue-500 font-black uppercase tracking-[1em] text-[14px] italic animate-pulse">
                Sync Matrix Core...
              </span>
            </div>
          ) : (
            <div className="h-200 overflow-auto custom-scrollbar">
              
              {/* VUE 1 : MATRICE SDE */}
              {activeView === "MATRIX" && (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-black/90 backdrop-blur-3xl z-30 shadow-2xl border-b-4 border-white/5">
                    <tr>
                      <th className="p-12 sticky left-0 bg-black/90 border-r-4 border-white/5 z-40 min-w-100">
                        <span className="text-[12px] font-black uppercase text-blue-500 tracking-[0.5em] italic">Collaborateur SDE</span>
                      </th>
                      {data.competences.map((c) => (
                        <th key={c.CP_Id} className="p-10 text-center min-w-62.5 border-l-2 border-white/5">
                           <span className="text-[14px] font-black uppercase italic text-white leading-tight block mb-2">{c.CP_Name}</span>
                           <span className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Seuil: {c.CP_NiveauRequis}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-white/5">
                    {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                      <tr key={u.U_Id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-12 sticky left-0 bg-[#151A2D] group-hover:bg-[#1e2540] border-r-4 border-white/5 z-20 transition-colors">
                          <p className="font-black text-2xl italic uppercase tracking-tighter text-white">{u.U_FirstName} {u.U_LastName}</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic mt-2">{u.U_Role}</p>
                        </td>
                        {data.competences.map((c) => {
                          const lvl = u.U_Competences?.find((uc: any) => uc.UC_CompetenceId === c.CP_Id)?.UC_NiveauActuel || 0;
                          const isGap = lvl < c.CP_NiveauRequis;
                          return (
                            <td key={c.CP_Id} className="p-6 text-center border-l-2 border-white/5">
                              <button
                                onClick={() => handleEvaluate(u.U_Id, c.CP_Id, lvl)}
                                className={`mx-auto w-20 h-20 rounded-4xl flex items-center justify-center font-black text-3xl border-4 cursor-pointer transition-all shadow-xl active:scale-90 ${
                                  isGap 
                                    ? "bg-rose-600/10 text-rose-500 border-rose-600/30 hover:bg-rose-600 hover:text-white shadow-[0_0_20px_rgba(244,63,94,0.1)]" 
                                    : "bg-blue-600/10 text-blue-400 border-blue-600/30 hover:bg-blue-600 hover:text-white"
                                }`}
                              >
                                {lvl}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    )) : (
                       <tr><td colSpan={50} className="p-32 text-center text-slate-600 font-black uppercase text-sm italic tracking-[0.5em]">Aucun vecteur détecté.</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* VUE 2 : RISQUES & ANALYTIQUES GPEC */}
              {activeView === "RISKS" && (
                <div className="p-24 space-y-20 text-left animate-in fade-in duration-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {/* INDICE GPEC */}
                    <div className="p-16 bg-blue-600/5 border-4 border-blue-600/20 rounded-[5rem] shadow-inner relative overflow-hidden backdrop-blur-3xl">
                      <Target size={200} className="absolute -bottom-10 -right-10 text-blue-600 opacity-5" />
                      <p className="text-blue-500 font-black uppercase tracking-[0.5em] text-[12px] mb-8 italic flex items-center gap-4 relative z-10">
                         <Activity size={20} /> Indice de Maîtrise GPEC
                      </p>
                      <p className="text-9xl font-black text-white italic tracking-tighter relative z-10">
                        {gpecIntelligence.coverage}%
                      </p>
                      <div className="mt-12 p-8 bg-black/60 rounded-[2.5rem] border-2 border-white/5 text-[12px] text-slate-400 font-black uppercase italic tracking-[0.3em] shadow-inner relative z-10">
                        { "$$Coverage = (1 - \\frac{totalGaps}{totalPossible}) \\times 100$$" }
                      </div>
                    </div>

                    {/* DÉFICITS CRITIQUES */}
                    <div className="p-16 bg-rose-600/5 border-4 border-rose-600/20 rounded-[5rem] shadow-inner relative overflow-hidden backdrop-blur-3xl">
                      <ShieldCheck size={200} className="absolute -bottom-10 -right-10 text-rose-600 opacity-5" />
                      <p className="text-rose-500 font-black uppercase tracking-[0.5em] text-[12px] mb-8 italic flex items-center gap-4 relative z-10">
                         <ShieldCheck size={20} /> Déficits Critiques §7.2
                      </p>
                      <p className="text-9xl font-black text-white italic tracking-tighter relative z-10">
                        {gpecIntelligence.totalGaps}
                      </p>
                      <div className="mt-12 text-[14px] font-black text-rose-500 uppercase tracking-[0.5em] italic relative z-10 bg-rose-500/10 w-fit px-6 py-3 rounded-2xl border border-rose-500/20">
                        Alerte IA : Mise à niveau requise
                      </div>
                    </div>
                  </div>

                  {/* LISTE DES ALERTES COMPÉTENCES */}
                  <div>
                    <h3 className="text-4xl font-black uppercase italic mb-12 text-white tracking-tighter border-b-4 border-white/5 pb-6">
                      Collaborateurs sous seuil d&apos;aptitude
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {gpecIntelligence.criticalGaps.map((item, idx) => (
                        <div key={idx} className="bg-black/40 border-2 border-white/5 p-12 rounded-[3.5rem] flex justify-between items-center group transition-all hover:border-rose-500/40 shadow-xl">
                          <div className="text-left">
                            <p className="font-black uppercase italic text-white text-3xl tracking-tighter leading-none mb-4">
                              {item.user.U_FirstName} {item.user.U_LastName}
                            </p>
                            <p className="text-[12px] font-black text-rose-500 uppercase tracking-[0.4em] italic bg-rose-500/10 w-fit px-4 py-2 rounded-xl border border-rose-500/20">
                              {item.gaps.length} écarts détectés
                            </p>
                          </div>
                          <span className="w-8 h-8 bg-rose-600 rounded-full animate-pulse shadow-[0_0_30px_rgba(225,29,72,0.8)] border-4 border-black"></span>
                        </div>
                      ))}
                      {gpecIntelligence.criticalGaps.length === 0 && (
                          <div className="col-span-2 p-20 text-center border-4 border-dashed border-white/5 rounded-[4rem] opacity-30">
                              <p className="text-[14px] font-black uppercase tracking-[0.5em] italic text-emerald-500">Aucune faille détectée.</p>
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* VUE 3 : FORMATIONS PLANIFIÉES */}
              {activeView === "FORMATIONS" && (
                <div className="p-24 space-y-10 animate-in slide-in-from-bottom-10 duration-700 text-left">
                  {data.formations.map((f) => (
                    <div key={f.FOR_Id} className="bg-black/40 border-4 border-white/5 p-10 rounded-[4rem] flex justify-between items-center group hover:bg-white/5 hover:border-amber-500/30 transition-all shadow-2xl backdrop-blur-md">
                      <div className="flex items-center gap-10">
                        <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center bg-amber-600/20 text-amber-500 border-2 border-amber-600/30 shadow-inner group-hover:scale-110 transition-transform">
                          <GraduationCap size={40} />
                        </div>
                        <div>
                          <p className="font-black uppercase italic text-white text-3xl leading-none tracking-tighter mb-4 group-hover:text-amber-400 transition-colors">
                            {f.FOR_Title}
                          </p>
                          <p className="text-[12px] text-slate-400 font-black uppercase tracking-[0.5em] italic flex items-center gap-4">
                            <span className="bg-white/10 px-4 py-1.5 rounded-xl text-white">{new Date(f.FOR_Date).toLocaleDateString()}</span>
                            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 py-1.5 rounded-xl">{f.FOR_Status}</span>
                          </p>
                        </div>
                      </div>
                      <button className="text-slate-600 hover:text-rose-500 p-6 bg-white/5 rounded-4xl border-none cursor-pointer transition-all active:scale-90 hover:bg-rose-500/10">
                        <Trash2 size={32} />
                      </button>
                    </div>
                  ))}
                  {data.formations.length === 0 && (
                      <div className="p-32 text-center border-4 border-dashed border-white/5 rounded-[4rem] opacity-30">
                          <p className="text-[14px] font-black uppercase tracking-[0.5em] italic text-slate-500">Aucun plan de formation SDE scellé.</p>
                      </div>
                  )}
                </div>
              )}

              {/* VUE 4 : EFFECTIFS SDE */}
              {activeView === "EMPLOYEES" && (
                <div className="p-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-left animate-in fade-in duration-700">
                  {filteredUsers.map((u) => (
                    <div key={u.U_Id} className="bg-black/60 border-4 border-white/5 p-16 rounded-[4.5rem] shadow-4xl group hover:border-blue-600/40 transition-all backdrop-blur-md">
                      <div className="w-24 h-24 rounded-[2.5rem] bg-blue-600/20 text-blue-500 border-2 border-blue-600/30 flex items-center justify-center font-black text-4xl italic mb-10 shadow-inner group-hover:scale-110 transition-transform">
                        {u.U_FirstName[0]}{u.U_LastName[0]}
                      </div>
                      <h3 className="text-3xl font-black uppercase italic text-white leading-none tracking-tighter mb-4 group-hover:text-blue-400 transition-colors">
                        {u.U_FirstName} {u.U_LastName}
                      </h3>
                      <p className="text-[12px] text-slate-500 font-black uppercase tracking-[0.5em] italic">
                        <span className="bg-white/5 px-4 py-1.5 rounded-lg border border-white/10">{u.U_Role}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 📟 MODAL DE SCELLAGE SOUVERAIN (FULL SPACE MASTER) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-100 flex items-center justify-center p-16 animate-in fade-in duration-500">
          <div className="bg-[#151A2D] border-4 border-blue-600/30 w-full max-w-4xl rounded-[6rem] p-24 shadow-[0_0_150px_rgba(37,99,235,0.2)] text-left relative overflow-hidden">
            
            <button onClick={() => setIsModalOpen(false)} className="absolute top-16 right-16 p-6 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 rounded-[2.5rem] transition-all cursor-pointer border-none">
                <X size={32} strokeWidth={3} />
            </button>

            <h2 className="text-6xl font-black uppercase italic text-white tracking-tighter mb-16 flex items-center gap-6 leading-none">
              <div className="p-6 bg-blue-600 rounded-4xl shadow-[0_0_30px_rgba(37,99,235,0.6)] text-white"><Plus size={40} strokeWidth={4} /></div>
              Définir {modalType === "USER" ? "Collaborateur" : "Compétence"}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-10 relative z-10">
              {modalType === "USER" ? (
                <>
                  <input
                    required type="email" placeholder="EMAIL PROFESSIONNEL"
                    className="w-full bg-black/60 border-4 border-white/5 rounded-[3.5rem] p-10 text-white font-black italic text-2xl outline-none focus:border-blue-600 shadow-inner uppercase tracking-widest placeholder:text-slate-700"
                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-10">
                    <input
                      required className="w-full bg-black/60 border-4 border-white/5 rounded-[3.5rem] p-10 text-white font-black italic text-2xl outline-none focus:border-blue-600 shadow-inner uppercase tracking-widest placeholder:text-slate-700"
                      placeholder="PRÉNOM" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                    <input
                      required className="w-full bg-black/60 border-4 border-white/5 rounded-[3.5rem] p-10 text-white font-black italic text-2xl outline-none focus:border-blue-600 shadow-inner uppercase tracking-widest placeholder:text-slate-700"
                      placeholder="NOM" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <input
                  required className="w-full bg-black/60 border-4 border-white/5 rounded-[3.5rem] p-10 text-white font-black italic text-2xl outline-none focus:border-blue-600 shadow-inner uppercase tracking-widest placeholder:text-slate-700"
                  placeholder="INTITULÉ DE LA COMPÉTENCE" value={formData.compName} onChange={(e) => setFormData({ ...formData, compName: e.target.value })}
                />
              )}
              
              <div className="flex gap-8 pt-12">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-10 rounded-[3.5rem] border-4 border-white/5 text-slate-500 hover:text-white hover:bg-white/5 font-black uppercase text-[14px] tracking-[0.5em] italic cursor-pointer transition-all bg-transparent">
                  Annuler
                </button>
                <button type="submit" className="flex-2 bg-blue-600 py-10 rounded-[3.5rem] font-black uppercase text-white shadow-[0_30px_80px_rgba(37,99,235,0.4)] hover:bg-white hover:text-blue-600 border-none cursor-pointer italic text-2xl tracking-[0.4em] active:scale-95 transition-all flex justify-center items-center gap-4 group/btn">
                  Sceller <Zap size={28} className="group-hover/btn:scale-125 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 20px; }
        ::-webkit-scrollbar-thumb:hover { background: #2563eb; }
      `}</style>
    </div>
  );
}