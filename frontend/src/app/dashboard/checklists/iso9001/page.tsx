/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : CHECKLIST D'AUDIT SOUVERAINE ISO 9001:2015
 * -------------------------------------------------------------------------
 * RÔLE : Évaluation exhaustive de la conformité (§4 à §10).
 * DESIGN : Elite Sovereign, One-Pager (No-Scroll), Densité SDE Matrix.
 * PERFORMANCE : Calcul dynamique des KPIs, Intégration GED Preuves.
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  AlertTriangle, CheckCircle, ChevronRight, Clock, Download, FileText,
  RefreshCw, Search, ShieldCheck, Target, UploadCloud, XCircle, 
  Settings, Layers, Users, Activity, Loader2, Save, ExternalLink
} from "lucide-react";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { toast, Toaster } from "sonner";

// --- 🏗️ INTERFACES SCELLÉES ---
type ResponseType = "YES" | "NO" | "PARTIAL" | "NA";

interface ChecklistItem {
  LC_Id: string;
  LC_Clause: string;
  LC_Title: string;
  LC_Description: string;
  LC_Criteria: string;
  response?: {
    CR_Response: ResponseType;
    CR_Comment?: string;
    CR_Evidence?: string;
    CR_IsCompliant: boolean;
  };
}

export default function ISO9001ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeClause, setActiveClause] = useState<string>("4");
  const [searchTerm, setSearchTerm] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  // --- 🛰️ SYNCHRONISATION MATRIX ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ChecklistItem[]>("/checklist?standard=ISO9001");
      setItems(res.data || []);
    } catch (err) {
      toast.error("ÉCHEC DE CONNEXION AU RÉFÉRENTIEL ISO.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- 🧠 MOTEUR DE CALCUL DE CONFORMITÉ ---
  const stats = useMemo(() => {
    const total = items.length;
    const compliant = items.filter(i => i.response?.CR_Response === "YES").length;
    const nonCompliant = items.filter(i => i.response?.CR_Response === "NO").length;
    const rate = total > 0 ? Math.round((compliant / total) * 100) : 0;
    return { total, compliant, nonCompliant, rate };
  }, [items]);

  // --- 📑 FILTRAGE ET GROUPEMENT ---
  const filteredItems = useMemo(() => {
    return items.filter(i => 
      i.LC_Clause.startsWith(activeClause) &&
      (i.LC_Title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       i.LC_Clause.includes(searchTerm))
    );
  }, [items, activeClause, searchTerm]);

  // --- 💾 SAUVEGARDE DE RÉPONSE ---
  const updateResponse = async (id: string, resp: ResponseType) => {
    setSavingId(id);
    try {
      await apiClient.post("/checklist/response", { LC_Id: id, CR_Response: resp });
      toast.success(`SÉQUENCE §${id} SCELLÉE.`);
      fetchData();
    } catch (e) {
      toast.error("ERREUR DE TRANSMISSION SDE.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return (
    <div className="ml-80 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-blue-500" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Audit du Référentiel ISO 9001...</p>
    </div>
  );

  function cn(arg0: string, arg1: string): string | undefined {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="ml-80 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-5 overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE (SHRINK-0) */}
      <header className="flex justify-between items-center border-b border-white/10 pb-4 mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter m-0 flex items-center gap-3">
            <ShieldCheck className="text-blue-600" size={26} /> Checklist <span className="text-blue-600">ISO 9001:2015</span>
          </h1>
          <p className="text-slate-500 text-[8px] tracking-[0.3em] font-black uppercase m-0 mt-1 italic">
            Management de la Qualité • Évaluation de la Conformité SDE
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative w-64 group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" />
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] font-black uppercase outline-none focus:border-blue-600 transition-all italic"
              placeholder="RECHERCHER CLAUSE..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchData} className="p-2 bg-white/5 rounded-xl hover:text-blue-500 border-none cursor-pointer transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      {/* 📊 MATRICE DE PERFORMANCE (SHRINK-0) */}
      <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
        <KPIBox label="Indice de Conformité" value={`${stats.rate}%`} icon={<Target size={18}/>} color="blue" />
        <KPIBox label="Exigences Conformes" value={stats.compliant} icon={<CheckCircle size={18}/>} color="emerald" />
        <KPIBox label="Écarts Détectés" value={stats.nonCompliant} icon={<XCircle size={18}/>} color="rose" />
        <KPIBox label="Total Exigences" value={stats.total} icon={<Layers size={18}/>} color="slate" />
      </div>

      {/* 🧩 CORPS DU COCKPIT (FLEX-1) */}
      <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
        
        {/* Navigation Latérale Clauses (25%) */}
        <div className="w-[25%] flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2 shrink-0">
          {[
            { id: "4", t: "Contexte de l'organisation", d: "Enjeux & Parties Intéressées" },
            { id: "5", t: "Leadership", d: "Politique & Responsabilités" },
            { id: "6", t: "Planification", d: "Risques & Opportunités" },
            { id: "7", t: "Support", d: "Ressources & Info. Documentée" },
            { id: "8", t: "Réalisation", d: "Opérationnel & Production" },
            { id: "9", t: "Évaluation", d: "Audit & Revue de Direction" },
            { id: "10", t: "Amélioration", d: "Non-Conformités & Correction" }
          ].map(clause => (
            <button
              key={clause.id}
              onClick={() => setActiveClause(clause.id)}
              className={cn(
                "w-full p-3 rounded-2xl border transition-all text-left flex items-center justify-between group cursor-pointer",
                activeClause === clause.id ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/20" : "bg-white/2 border-white/5 hover:border-blue-500/30"
              )}
            >
              <div className="min-w-0">
                <p className={cn("text-xs font-black uppercase m-0 italic", activeClause === clause.id ? "text-white" : "text-blue-400")}>§{clause.id} {clause.t}</p>
                <p className="text-[7px] font-bold uppercase tracking-widest text-slate-500 m-0 mt-1 truncate">{clause.d}</p>
              </div>
              <ChevronRight size={14} className={cn("shrink-0", activeClause === clause.id ? "text-white" : "text-slate-700")} />
            </button>
          ))}
        </div>

        {/* Tableau des Points de Contrôle (75%) */}
        <div className="flex-1 bg-[#151A2D] border border-white/5 rounded-4xl flex flex-col shadow-4xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none"><ShieldCheck size={250}/></div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#151A2D] z-20 shadow-sm">
                <tr className="text-[8px] text-slate-500 uppercase font-black italic tracking-[0.2em] border-b border-white/5">
                  <th className="px-6 py-4">Exigence Normative</th>
                  <th className="px-6 py-4">Critère d&apos;Acceptation</th>
                  <th className="px-6 py-4 text-center">Verdict SDE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map(item => (
                  <tr key={item.LC_Id} className="group hover:bg-blue-600/5 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-blue-500 tracking-widest">§{item.LC_Clause}</span>
                        <span className="text-xs font-black text-white uppercase italic leading-tight">{item.LC_Title}</span>
                        <p className="text-[9px] text-slate-500 font-bold m-0 line-clamp-1">{item.LC_Description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[9px] font-medium text-slate-400 leading-relaxed italic m-0 line-clamp-2 max-w-xs">{item.LC_Criteria}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        <VerdictBtn label="YES" active={item.response?.CR_Response === "YES"} color="emerald" onClick={() => updateResponse(item.LC_Id, "YES")} loading={savingId === item.LC_Id}/>
                        <VerdictBtn label="NO" active={item.response?.CR_Response === "NO"} color="rose" onClick={() => updateResponse(item.LC_Id, "NO")} loading={savingId === item.LC_Id}/>
                        <VerdictBtn label="PART" active={item.response?.CR_Response === "PARTIAL"} color="amber" onClick={() => updateResponse(item.LC_Id, "PARTIAL")} loading={savingId === item.LC_Id}/>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer de Clause (Shrink-0) */}
          <div className="shrink-0 p-4 bg-black/40 border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${stats.rate}%` }} />
               </div>
               <span className="text-[9px] font-black text-blue-500 italic uppercase">Taux de Maillage : {stats.rate}%</span>
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase italic border-none cursor-pointer shadow-lg flex items-center gap-2">
              <Download size={14}/> Rapport §{activeClause}
            </button>
          </div>
        </div>
      </div>

      {/* 📊 BARRE DE SANTÉ FINALE (SHRINK-0) */}
      <footer className="shrink-0 mt-4 flex justify-between items-center text-[8px] font-black uppercase text-slate-600 tracking-[0.4em] italic">
        <div className="flex items-center gap-3">
          <Activity size={14} className="text-blue-500 animate-pulse" /> Système Matrix Opérationnel — ISO 9001 Protocol v4.0
        </div>
        <div>Qualisoft SDE — Dakar, Sénégal — 2026</div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb; }
      `}</style>
    </div>
  );
}

// --- 🧩 COMPOSANTS ATOMIQUES SDE ---

function KPIBox({ label, value, icon, color }: any) {
  const themes: any = { 
    blue: "text-blue-500 bg-blue-500/5 border-blue-500/10", 
    emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10", 
    rose: "text-rose-500 bg-rose-500/5 border-rose-500/10",
    slate: "text-slate-400 bg-white/5 border-white/10"
  };
  function cn(arg0: string, arg1: any): string | undefined {
    throw new Error("Function not implemented.");
  }

  return (
    <div className={cn("p-4 rounded-2xl border flex items-center justify-between shadow-inner", themes[color])}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-black/20 rounded-lg">{icon}</div>
        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest m-0">{label}</span>
      </div>
      <span className="text-2xl font-black italic m-0 text-white">{value}</span>
    </div>
  );
}

function VerdictBtn({ label, active, color, onClick, loading }: any) {
  const colors: any = {
    emerald: active ? "bg-emerald-600 text-white border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-emerald-500/5 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10",
    rose: active ? "bg-rose-600 text-white border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" : "bg-rose-500/5 text-rose-500 border-rose-500/20 hover:bg-rose-500/10",
    amber: active ? "bg-amber-600 text-white border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "bg-amber-500/5 text-amber-500 border-amber-500/20 hover:bg-amber-500/10",
  };
  function cn(arg0: string, arg1: any): string | undefined {
    throw new Error("Function not implemented.");
  }

  return (
    <button 
      disabled={loading}
      onClick={onClick}
      className={cn("w-10 py-2 rounded-lg text-[8px] font-black border transition-all cursor-pointer uppercase italic leading-none", colors[color])}
    >
      {label}
    </button>
  );
}