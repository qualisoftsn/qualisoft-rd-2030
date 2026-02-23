/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : REGISTRE SOUVERAIN DES RISQUES §6.1
 * ARCHITECTURE : Elite SDE Matrix / Full-Space Isolation
 * DESIGN : No-Scroll Layout / High-Density Typography
 */

"use client";

import apiClient from "@/core/api/api-client";
import { 
  Activity, AlertOctagon, AlertTriangle, BarChart3, Edit3, Fingerprint, 
  LayoutGrid, Loader2, Plus, Save, ShieldCheck, Trash2, X, Zap, Target,
  RefreshCw, Scale, ChevronRight, Layers, Info, Search,
  Database
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
import { Action as IAction, Processus as IProcessus, Risk as IRisk, RiskType as IRiskType, User as IUser } from "@/types/elite-sde";

interface RiskDetailed extends IRisk {
  Processus?: IProcessus;
  Type?: IRiskType;
  Actions?: IAction[];
}

export default function RiskGridPage() {
  const [items, setItems] = useState<RiskDetailed[]>([]);
  const [processusList, setProcessusList] = useState<IProcessus[]>([]);
  const [riskTypes, setRiskTypes] = useState<IRiskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    RS_Libelle: "", RS_Activite: "", RS_Tache: "", RS_Causes: "", RS_Description: "",
    RS_Probabilite: 1, RS_Gravite: 1, RS_Maitrise: 1, RS_ProcessusId: "", RS_TypeId: "",
    RS_Status: "IDENTIFIE", RS_Mesures: "", RS_Acteurs: "", RS_NextReview: "",
    RS_Contexte: "", RS_PartiesInteressees: "", RS_ExigencesLegales: "", RS_Opportunite: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rProc, rTypes, rRisks] = await Promise.all([
        apiClient.get("/processus"), apiClient.get("/risk-types"), apiClient.get("/risks")
      ]);
      setProcessusList(rProc.data?.data || rProc.data);
      setRiskTypes(rTypes.data?.data || rTypes.data);
      setItems(rRisks.data?.data || rRisks.data);
    } catch (err) { toast.error("RUPTURE KERNEL MATRIX"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const stats = useMemo(() => {
    const critical = items.filter(r => (r.RS_Probabilite * r.RS_Gravite * (r.RS_Maitrise || 1)) >= 16).length;
    return { total: items.length, critical, rate: items.length > 0 ? Math.round(((items.length - critical) / items.length) * 100) : 100 };
  }, [items]);

  const filteredItems = useMemo(() => 
    items.filter(i => i.RS_Libelle.toLowerCase().includes(search.toLowerCase()) || i.RS_Id.toLowerCase().includes(search.toLowerCase()))
  , [items, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Scellage §6.1 en cours...");
    try {
      const payload = { ...formData, RS_Score: formData.RS_Probabilite * formData.RS_Gravite * formData.RS_Maitrise };
      if (editingId) await apiClient.patch(`/risks/${editingId}`, payload);
      else await apiClient.post("/risks", payload);
      toast.success("MATRICE SOUVERAINE MISE À JOUR", { id: tid });
      setIsModalOpen(false);
      fetchData();
    } catch (e) { toast.error("ÉCHEC DE SCELLAGE", { id: tid }); }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-red-600" size={40} />
      <span className="text-red-600 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Sync Kernel Risques...</span>
    </div>
  );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-4 overflow-hidden selection:bg-red-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE (Shrink-0) */}
      <header className="flex justify-between items-center border-b border-white/10 pb-3 mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tighter m-0 flex items-center gap-3">
            <AlertOctagon className="text-red-600" size={20} /> Registre <span className="text-red-600">Risques & Opportunités</span>
          </h1>
          <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] m-0">ISO 9001:2015 §6.1 • SDE Command Center</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-48 group">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SCANNER ID/NOM..." className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-[9px] font-black uppercase outline-none focus:border-red-600 transition-all italic" />
          </div>
          <button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="bg-red-600 hover:bg-white hover:text-red-600 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-2 border-none cursor-pointer transition-all italic">
            <Plus size={12} strokeWidth={3} /> Nouvelle Menace
          </button>
        </div>
      </header>

      {/* 📊 KPI BAR (Shrink-0) */}
      <div className="grid grid-cols-4 gap-3 mb-4 shrink-0">
        <KPIBox label="Indice de Maîtrise" value={`${stats.rate}%`} icon={<ShieldCheck size={14}/>} color="emerald" />
        <KPIBox label="Menaces Critiques" value={stats.critical} icon={<AlertTriangle size={14}/>} color="rose" />
        <KPIBox label="Risques Scellés" value={stats.total} icon={<Database size={14}/>} color="amber" />
        <KPIBox label="Efficacité PAQ" value="91.4%" icon={<Activity size={14}/>} color="blue" />
      </div>

      {/* 🧩 DATA MATRIX (Flex-1) */}
      <main className="flex-1 min-h-0 bg-[#151A2D] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 p-10 opacity-[0.01] pointer-events-none"><Zap size={300}/></div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#151A2D] z-10 shadow-sm">
              <tr className="text-[7px] text-slate-500 uppercase font-black italic tracking-[0.2em] border-b border-white/5 bg-[#0F172A]/50 backdrop-blur-md">
                <th className="px-5 py-3">Menace / Danger / Scénario</th>
                <th className="px-5 py-3 text-center">Matrice P-G-M</th>
                <th className="px-5 py-3 text-center">Score</th>
                <th className="px-5 py-3">État SDE</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map(risk => {
                const score = risk.RS_Probabilite * risk.RS_Gravite * (risk.RS_Maitrise || 1);
                return (
                  <tr key={risk.RS_Id} className="group hover:bg-red-600/5 transition-all">
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className="text-[7px] text-blue-500 font-black uppercase mb-0.5">{risk.Processus?.PR_Code || "SMI"}</span>
                        <span className="text-[10px] font-black text-white uppercase italic leading-none">{risk.RS_Libelle}</span>
                        <span className="text-[8px] text-slate-500 mt-1 line-clamp-1">{risk.RS_Description || "Aucune description tactique."}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-center gap-1 font-black">
                         <Badge val={risk.RS_Probabilite} l="P" c="border-white/10" />
                         <Badge val={risk.RS_Gravite} l="G" c="border-red-600/30 text-red-500" />
                         <Badge val={risk.RS_Maitrise} l="M" c="border-blue-600/30 text-blue-500" />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={cn("text-xl font-black italic leading-none", score >= 16 ? "text-red-600" : score >= 8 ? "text-amber-500" : "text-emerald-500")}>{score}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-black/40 border border-white/5 text-[7px] font-black uppercase text-slate-400">{risk.RS_Status}</span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <button onClick={() => { setEditingId(risk.RS_Id); setFormData(risk as any); setIsModalOpen(true); }} className="p-1.5 bg-white/5 rounded-lg text-slate-500 hover:text-blue-500 border-none cursor-pointer"><Edit3 size={14}/></button>
                      <button onClick={() => { if(confirm("Archiver?")) apiClient.delete(`/risks/${risk.RS_Id}`).then(() => fetchData()); }} className="p-1.5 bg-white/5 rounded-lg text-slate-500 hover:text-red-600 border-none cursor-pointer"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* 📟 MODALE EXPERTE (No-Scroll / Grille Optique 3x3) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-[#0B0F1A] border border-white/10 rounded-4xl w-full max-w-5xl h-[90vh] flex flex-col shadow-4xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <header className="px-8 py-5 border-b border-white/10 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-black uppercase italic m-0">Identification <span className="text-red-600">Risque Expert</span></h2>
              <X onClick={() => setIsModalOpen(false)} className="cursor-pointer text-slate-500 hover:text-red-500" size={24} />
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 grid grid-cols-3 gap-x-6 gap-y-3">
              <SDEInput label="Libellé Danger (§6.1.1)" value={formData.RS_Libelle} onChange={(v: string) => setFormData({...formData, RS_Libelle: v.toUpperCase()})} span="col-span-2" />
              
              <div className="bg-red-600/5 p-3 rounded-2xl border border-red-600/20 flex flex-col items-center justify-center">
                 <span className="text-[8px] font-black text-red-500 uppercase mb-1">Score Matrix</span>
                 <span className="text-4xl font-black text-white italic">{(formData.RS_Probabilite * formData.RS_Gravite * formData.RS_Maitrise)}</span>
                 <span className="text-[7px] text-slate-600 font-bold uppercase mt-1">Criticité SDE</span>
              </div>

              <SDESelect label="Processus Source" value={formData.RS_ProcessusId} onChange={(v: any) => setFormData({...formData, RS_ProcessusId: v})}>
                 <option value="">SÉLECTIONNER...</option>
                 {processusList.map(p => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
              </SDESelect>

              <SDESelect label="Catégorie de Risque" value={formData.RS_TypeId} onChange={(v: any) => setFormData({...formData, RS_TypeId: v})}>
                 <option value="">SÉLECTIONNER...</option>
                 {riskTypes.map(t => <option key={t.RT_Id} value={t.RT_Id}>{t.RT_Label}</option>)}
              </SDESelect>

              <div className="grid grid-cols-3 gap-2">
                <SDECounter label="P" val={formData.RS_Probabilite} set={(v: any) => setFormData({...formData, RS_Probabilite: v})} />
                <SDECounter label="G" val={formData.RS_Gravite} set={(v: any) => setFormData({...formData, RS_Gravite: v})} />
                <SDECounter label="M" val={formData.RS_Maitrise} set={(v: any) => setFormData({...formData, RS_Maitrise: v})} />
              </div>

              <SDEInput label="Activités Liées" value={formData.RS_Activite} onChange={(v: any) => setFormData({...formData, RS_Activite: v})} />
              <SDEInput label="Causes Potentielles" value={formData.RS_Causes} onChange={(v: any) => setFormData({...formData, RS_Causes: v})} />
              <SDEInput label="Description Impact" value={formData.RS_Description} onChange={(v: any) => setFormData({...formData, RS_Description: v})} />

              <SDEInput label="Mesures de Maîtrise" value={formData.RS_Mesures} onChange={(v: any) => setFormData({...formData, RS_Mesures: v})} />
              <SDEInput label="Contexte Interne" value={formData.RS_Contexte} onChange={(v: any) => setFormData({...formData, RS_Contexte: v})} />
              <SDEInput label="Exigences Légales" value={formData.RS_ExigencesLegales} onChange={(v: any) => setFormData({...formData, RS_ExigencesLegales: v})} />

              <SDEInput label="Parties Intéressées" value={formData.RS_PartiesInteressees} onChange={(v: any) => setFormData({...formData, RS_PartiesInteressees: v})} />
              <SDEInput label="Opportunités (§6.1.2)" value={formData.RS_Opportunite} onChange={(v: any) => setFormData({...formData, RS_Opportunite: v})} />
              
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Prochaine Revue</label>
                <input type="date" value={formData.RS_NextReview} onChange={e => setFormData({...formData, RS_NextReview: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-[9px] font-black text-white outline-none italic focus:border-red-600" />
              </div>
            </div>

            <footer className="px-8 py-5 border-t border-white/10 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-transparent text-slate-500 font-black uppercase text-[9px] border-none cursor-pointer">Abandonner</button>
              <button type="submit" className="px-8 py-2.5 bg-red-600 text-white rounded-xl font-black uppercase text-[9px] italic shadow-lg border-none cursor-pointer hover:bg-white hover:text-red-600 transition-all flex items-center gap-2">
                <Save size={14}/> Sceller dans la Matrice
              </button>
            </footer>
          </form>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}

// --- 🧩 COMPOSANTS ATOMIQUES D'ÉLITE ---

function KPIBox({ label, value, icon, color }: any) {
  const c: any = { emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10", rose: "text-rose-500 bg-rose-500/5 border-rose-500/10", amber: "text-amber-500 bg-amber-500/5 border-amber-500/10", blue: "text-blue-500 bg-blue-500/5 border-blue-500/10" };
  return (
    <div className={cn("p-3 rounded-xl border flex items-center justify-between shadow-inner", c[color])}>
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-black/20 rounded-lg">{icon}</div>
        <span className="text-[8px] font-black uppercase text-slate-500 italic tracking-widest leading-none">{label}</span>
      </div>
      <span className="text-xl font-black italic m-0 text-white leading-none">{value}</span>
    </div>
  );
}

function Badge({ val, l, c }: any) {
  return <span className={cn("px-1.5 py-0.5 rounded-md bg-black/40 border text-[8px] italic", c)}>{l}:{val}</span>;
}

function SDEInput({ label, value, onChange, span = "" }: any) {
  return (
    <div className={cn("space-y-1 text-left", span)}>
      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-[9px] font-black text-white outline-none italic focus:border-red-600 transition-all placeholder:opacity-20" placeholder="..." />
    </div>
  );
}

function SDESelect({ label, value, onChange, children }: any) {
  return (
    <div className="space-y-1 text-left">
      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-[9px] font-black text-white outline-none italic focus:border-red-600 appearance-none">{children}</select>
    </div>
  );
}

function SDECounter({ label, val, set }: any) {
  return (
    <div className="bg-black/30 p-2 rounded-xl border border-white/5 flex flex-col items-center">
       <span className="text-[7px] font-black text-slate-600 mb-1">{label}</span>
       <div className="flex items-center gap-2">
          <button type="button" onClick={() => set(Math.max(1, val-1))} className="text-slate-500 bg-transparent border-none font-black text-[10px] cursor-pointer hover:text-white">-</button>
          <span className="text-[11px] font-black italic text-white">{val}</span>
          <button type="button" onClick={() => set(Math.min(4, val+1))} className="text-slate-500 bg-transparent border-none font-black text-[10px] cursor-pointer hover:text-white">+</button>
       </div>
    </div>
  );
}

const cn = (...classes: any) => classes.filter(Boolean).join(" ");