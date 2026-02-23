/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : REGISTRE SOUVERAIN DES RISQUES (§6.1 ISO 9001:2015)
 * DESIGN : Elite High-Density / No-Scroll Cockpit / SDE Matrix
 */

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "@/core/api/api-client";
import { 
  Activity, AlertOctagon, AlertTriangle, Edit3, Fingerprint, 
  Loader2, Plus, Save, ShieldCheck, Trash2, X, Zap, Target,
  RefreshCw, ChevronRight, Search, Database, Scale
} from "lucide-react";
import { toast, Toaster } from "sonner";

// --- 🛠️ UTILITAIRE SDE ---
const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export default function RiskGridPage() {
  const [items, setItems] = useState<any[]>([]);
  const [processusList, setProcessusList] = useState<any[]>([]);
  const [riskTypes, setRiskTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    RS_Libelle: "", RS_Activite: "", RS_Causes: "", RS_Description: "",
    RS_Probabilite: 1, RS_Gravite: 1, RS_Maitrise: 1, RS_ProcessusId: "", 
    RS_TypeId: "", RS_Status: "IDENTIFIE", RS_Mesures: "", RS_Acteurs: "", 
    RS_NextReview: "", RS_Contexte: "", RS_PartiesInteressees: "", 
    RS_ExigencesLegales: "", RS_Opportunite: ""
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rProc, rTypes, rRisks] = await Promise.all([
        apiClient.get("/processus"), apiClient.get("/risk-types"), apiClient.get("/risks")
      ]);
      // Scellage des listes avec fallback pour éviter les listes vides
      setProcessusList(rProc.data?.data || rProc.data || []);
      setRiskTypes(rTypes.data?.data || rTypes.data || []);
      setItems(rRisks.data?.data || rRisks.data || []);
    } catch (err) { toast.error("RUPTURE KERNEL MATRIX"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const score = useMemo(() => formData.RS_Probabilite * formData.RS_Gravite * formData.RS_Maitrise, [formData]);

  const stats = useMemo(() => {
    const critical = items.filter(r => (r.RS_Probabilite * r.RS_Gravite * (r.RS_Maitrise || 1)) >= 16).length;
    return { total: items.length, critical, rate: items.length > 0 ? Math.round(((items.length - critical) / items.length) * 100) : 100 };
  }, [items]);

  const filteredItems = useMemo(() => 
    items.filter(i => i.RS_Libelle.toLowerCase().includes(search.toLowerCase()) || i.RS_Id.toLowerCase().includes(search.toLowerCase()))
  , [items, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.RS_ProcessusId || !formData.RS_TypeId) return toast.warning("RÉFÉRENTIELS OBLIGATOIRES");
    
    const tid = toast.loading("SCELLAGE §6.1...");
    try {
      if (editingId) await apiClient.patch(`/risks/${editingId}`, formData);
      else await apiClient.post("/risks", formData);
      toast.success("MATRICE MISE À JOUR", { id: tid });
      setIsModalOpen(false);
      fetchData();
    } catch (e) { toast.error("ÉCHEC DE MUTATION", { id: tid }); }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-red-600" size={40} />
      <span className="text-red-600 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse italic">Sync Kernel Risques...</span>
    </div>
  );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-4 overflow-hidden selection:bg-red-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE (Shrink-0) */}
      <header className="flex justify-between items-center border-b border-white/10 pb-3 mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter m-0 flex items-center gap-3 italic">
            <AlertOctagon className="text-red-600" size={24} /> Registre <span className="text-red-600">Risques</span>
          </h1>
          <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] m-0">ISO 9001:2015 §6.1 • SDE Command Center</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-56 group">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SCANNER MENACE..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] font-black uppercase outline-none focus:border-red-600 transition-all italic" />
          </div>
          <button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="bg-red-600 hover:bg-white hover:text-red-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border-none cursor-pointer transition-all italic shadow-lg">
            <Plus size={16} strokeWidth={4} /> Nouvelle Menace
          </button>
        </div>
      </header>

      {/* 📊 KPI BAR (Shrink-0) */}
      <div className="grid grid-cols-4 gap-4 mb-4 shrink-0">
        <KPIBox label="Indice de Maîtrise" value={`${stats.rate}%`} icon={<ShieldCheck size={16}/>} color="emerald" />
        <KPIBox label="Menaces Critiques" value={stats.critical} icon={<AlertTriangle size={16}/>} color="rose" />
        <KPIBox label="Risques Scellés" value={stats.total} icon={<Database size={16}/>} color="amber" />
        <KPIBox label="Efficacité PAQ" value="94.2%" icon={<Activity size={16}/>} color="blue" />
      </div>

      {/* 🧩 DATA MATRIX (Flex-1) */}
      <main className="flex-1 min-h-0 bg-[#151A2D] border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 p-10 opacity-[0.01] pointer-events-none"><Zap size={400}/></div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#151A2D] z-10 border-b border-white/10">
              <tr className="text-[8px] text-slate-500 uppercase font-black italic tracking-widest bg-[#151A2D]">
                <th className="px-6 py-4 italic">Danger & Scénario</th>
                <th className="px-6 py-4 text-center italic">Matrice P-G-M</th>
                <th className="px-6 py-4 text-center italic">Criticité</th>
                <th className="px-6 py-4 italic">Processus Source</th>
                <th className="px-6 py-4 text-right italic">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map(risk => {
                const rScore = risk.RS_Probabilite * risk.RS_Gravite * (risk.RS_Maitrise || 1);
                return (
                  <tr key={risk.RS_Id} className="group hover:bg-red-600/5 transition-all italic">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-white uppercase leading-none">{risk.RS_Libelle}</span>
                        <span className="text-[9px] text-slate-500 mt-2 font-medium normal-case leading-tight line-clamp-1">{risk.RS_Description || "Sans description de l'impact."}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2 font-black">
                         <Cotation val={risk.RS_Probabilite} l="P" c="text-slate-400" />
                         <Cotation val={risk.RS_Gravite} l="G" c="text-red-500" />
                         <Cotation val={risk.RS_Maitrise} l="M" c="text-blue-500" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn("text-2xl font-black italic leading-none tracking-tighter", rScore >= 16 ? "text-red-600" : rScore >= 8 ? "text-amber-500" : "text-emerald-500")}>{rScore}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black uppercase text-blue-500 italic">{risk.Processus?.PR_Libelle || "NON DÉFINI"}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setEditingId(risk.RS_Id); setFormData(risk); setIsModalOpen(true); }} className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-blue-500 border-none cursor-pointer"><Edit3 size={14}/></button>
                        <button className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-red-500 border-none cursor-pointer"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* 📟 MODALE EXPERTE (No-Scroll Grid 3x3) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-600 bg-black/98 backdrop-blur-2xl flex items-center justify-center p-6">
          <form onSubmit={handleSubmit} className="bg-[#151A2D] border border-white/10 rounded-[3rem] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-4xl animate-in zoom-in-95 duration-300 relative overflow-hidden italic">
            <header className="px-10 py-6 border-b border-white/5 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-black uppercase italic m-0 tracking-tighter">Identification <span className="text-red-600">Risque Expert</span></h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 rounded-xl text-slate-500 hover:text-white border-none cursor-pointer"><X size={20} /></button>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 grid grid-cols-3 gap-x-8 gap-y-6">
              
              {/* BLOC 1 : IDENTIFICATION IDENTITÉ */}
              <div className="col-span-2 space-y-6">
                 <SDEInput label="Libellé du Risque (§6.1)" value={formData.RS_Libelle} onChange={(v: string) => setFormData({...formData, RS_Libelle: v.toUpperCase()})} />
                 <div className="grid grid-cols-2 gap-6">
                    <SDESelect label="Processus Source" value={formData.RS_ProcessusId} onChange={(v: any) => setFormData({...formData, RS_ProcessusId: v})}>
                        <option value="">CHOISIR PROCESSUS...</option>
                        {processusList.map(p => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>)}
                    </SDESelect>
                    <SDESelect label="Type de Risque" value={formData.RS_TypeId} onChange={(v: any) => setFormData({...formData, RS_TypeId: v})}>
                        <option value="">CHOISIR TYPE...</option>
                        {riskTypes.map(t => <option key={t.RT_Id} value={t.RT_Id}>{t.RT_Label}</option>)}
                    </SDESelect>
                 </div>
              </div>

              {/* BLOC 2 : COTATION (Matrix Visual) */}
              <div className="bg-red-600/5 rounded-3xl border border-red-600/10 p-6 flex flex-col items-center justify-center space-y-4">
                 <span className="text-[10px] font-black text-red-500 tracking-[0.4em] uppercase">Score de Criticité</span>
                 <span className="text-7xl font-black text-white italic tracking-tighter leading-none">{score}</span>
                 <div className="flex gap-4">
                    <CotationBox label="P" val={formData.RS_Probabilite} set={(v:any) => setFormData({...formData, RS_Probabilite: v})} />
                    <CotationBox label="G" val={formData.RS_Gravite} set={(v:any) => setFormData({...formData, RS_Gravite: v})} />
                    <CotationBox label="M" val={formData.RS_Maitrise} set={(v:any) => setFormData({...formData, RS_Maitrise: v})} />
                 </div>
              </div>

              {/* BLOC 3 : ANALYSE & DÉTAILS */}
              <SDEInput label="Activités / Tâches Liées" value={formData.RS_Activite} onChange={(v: any) => setFormData({...formData, RS_Activite: v})} />
              <SDEInput label="Causes & Racines (§10.2)" value={formData.RS_Causes} onChange={(v: any) => setFormData({...formData, RS_Causes: v})} />
              <SDEInput label="Description de l'Impact" value={formData.RS_Description} onChange={(v: any) => setFormData({...formData, RS_Description: v})} />

              {/* BLOC 4 : CONTEXTE SDE */}
              <SDEInput label="Mesures de Maîtrise" value={formData.RS_Mesures} onChange={(v: any) => setFormData({...formData, RS_Mesures: v})} />
              <SDEInput label="Exigences Légales" value={formData.RS_ExigencesLegales} onChange={(v: any) => setFormData({...formData, RS_ExigencesLegales: v})} />
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Prochaine Revue</label>
                <input type="date" value={formData.RS_NextReview} onChange={e => setFormData({...formData, RS_NextReview: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-black text-white outline-none focus:border-red-600" />
              </div>

            </div>

            <footer className="px-10 py-6 border-t border-white/5 flex justify-end gap-4 shrink-0 bg-black/20">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 bg-white/5 rounded-xl text-slate-500 font-black uppercase text-[10px] border-none cursor-pointer hover:text-white">Annuler</button>
              <button type="submit" className="px-10 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] italic shadow-2xl border-none cursor-pointer hover:bg-white hover:text-red-600 transition-all flex items-center gap-2">
                <Save size={18} strokeWidth={3}/> Sceller dans la Matrice
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

// --- 🧩 COMPOSANTS ATOMIQUES SDE ---

function KPIBox({ label, value, icon, color }: any) {
  const c: any = { 
    emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10", 
    rose: "text-rose-500 bg-rose-500/5 border-rose-500/10", 
    amber: "text-amber-500 bg-amber-500/5 border-amber-500/10", 
    blue: "text-blue-500 bg-blue-500/5 border-blue-500/10" 
  };
  return (
    <div className={cn("p-4 rounded-2xl border flex items-center justify-between shadow-xl", c[color])}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-black/40 rounded-xl">{icon}</div>
        <span className="text-[9px] font-black uppercase text-slate-500 italic tracking-widest leading-none m-0">{label}</span>
      </div>
      <span className="text-2xl font-black italic m-0 text-white leading-none tracking-tighter">{value}</span>
    </div>
  );
}

function Cotation({ val, l, c }: any) {
  return <span className={cn("px-2 py-1 rounded-md bg-black/40 border border-white/5 text-[10px] italic", c)}>{l}:{val}</span>;
}

function CotationBox({ label, val, set }: any) {
  return (
    <div className="flex flex-col items-center gap-2 bg-black/40 p-3 rounded-2xl border border-white/5">
       <span className="text-[10px] font-black text-slate-500">{label}</span>
       <div className="flex items-center gap-3">
          <button type="button" onClick={() => set(Math.max(1, val - 1))} className="text-slate-400 bg-transparent border-none font-black text-sm cursor-pointer hover:text-white">-</button>
          <span className="text-xl font-black italic text-white leading-none">{val}</span>
          <button type="button" onClick={() => set(Math.min(4, val + 1))} className="text-slate-400 bg-transparent border-none font-black text-sm cursor-pointer hover:text-white">+</button>
       </div>
    </div>
  );
}

function SDEInput({ label, value, onChange }: any) {
  return (
    <div className="space-y-1 text-left">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-black text-white outline-none italic focus:border-red-600 transition-all placeholder:opacity-20 uppercase" placeholder="..." />
    </div>
  );
}

function SDESelect({ label, value, onChange, children }: any) {
  return (
    <div className="space-y-1 text-left">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-black text-white outline-none italic focus:border-red-600 appearance-none cursor-pointer">{children}</select>
    </div>
  );
}