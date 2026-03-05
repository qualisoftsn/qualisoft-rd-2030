/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : REGISTRE SOUVERAIN DES RISQUES (ELITE SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage des menaces et opportunités (§6.1 ISO 9001:2015).
 * DESIGN : Elite High-Density, ClickUp Industrial, 100dvh.
 * ARCHITECTURE : Zéro NextAuth (100% apiClient JWT).
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 18:35 GMT
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

// --- 🛠️ UTILITAIRES SDE ---
const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

interface RiskData {
  RS_Id?: string;
  RS_Libelle: string;
  RS_Activite: string;
  RS_Causes: string;
  RS_Description: string;
  RS_Probabilite: number;
  RS_Gravite: number;
  RS_Maitrise: number;
  RS_ProcessusId: string;
  RS_TypeId: string;
  RS_Status: string;
  RS_Mesures: string;
  RS_Acteurs: string;
  RS_NextReview: string;
  RS_Contexte: string;
  RS_PartiesInteressees: string;
  RS_ExigencesLegales: string;
  RS_Opportunite: string;
  Processus?: { PR_Libelle: string };
}

export default function RiskGridPage() {
  const [items, setItems] = useState<RiskData[]>([]);
  const [processusList, setProcessusList] = useState<any[]>([]);
  const [riskTypes, setRiskTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const defaultForm: RiskData = {
    RS_Libelle: "", RS_Activite: "", RS_Causes: "", RS_Description: "",
    RS_Probabilite: 1, RS_Gravite: 1, RS_Maitrise: 1, RS_ProcessusId: "", 
    RS_TypeId: "", RS_Status: "IDENTIFIE", RS_Mesures: "", RS_Acteurs: "", 
    RS_NextReview: "", RS_Contexte: "", RS_PartiesInteressees: "", 
    RS_ExigencesLegales: "", RS_Opportunite: ""
  };
  const [formData, setFormData] = useState<RiskData>(defaultForm);

  // --- 📡 SYNCHRONISATION KERNEL ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rProc, rTypes, rRisks] = await Promise.all([
        apiClient.get("/processus"), 
        apiClient.get("/risk-types"), 
        apiClient.get("/risks")
      ]);
      setProcessusList(rProc.data?.data || rProc.data || []);
      setRiskTypes(rTypes.data?.data || rTypes.data || []);
      setItems(rRisks.data?.data || rRisks.data || []);
    } catch { 
      toast.error("RUPTURE KERNEL MATRIX : Synchronisation impossible."); 
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const score = useMemo(() => formData.RS_Probabilite * formData.RS_Gravite * formData.RS_Maitrise, [formData]);

  const stats = useMemo(() => {
    const critical = items.filter(r => (r.RS_Probabilite * r.RS_Gravite * (r.RS_Maitrise || 1)) >= 16).length;
    return { 
      total: items.length, 
      critical, 
      rate: items.length > 0 ? Math.round(((items.length - critical) / items.length) * 100) : 100 
    };
  }, [items]);

  const filteredItems = useMemo(() => 
    items.filter(i => 
      i.RS_Libelle.toLowerCase().includes(search.toLowerCase()) || 
      (i.RS_Id && i.RS_Id.toLowerCase().includes(search.toLowerCase()))
    )
  , [items, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.RS_ProcessusId || !formData.RS_TypeId) return toast.warning("RÉFÉRENTIELS OBLIGATOIRES MANQUANTS");
    
    const tid = toast.loading("SCELLAGE DE LA MENACE...");
    try {
      if (editingId) {
        await apiClient.patch(`/risks/${editingId}`, formData);
      } else {
        await apiClient.post("/risks", formData);
      }
      toast.success("MATRICE DES RISQUES MISE À JOUR", { id: tid });
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) { 
      toast.error(err.response?.data?.message || "ÉCHEC DE MUTATION", { id: tid }); 
    }
  };

  const openModal = (risk?: RiskData) => {
    setEditingId(risk?.RS_Id || null);
    setFormData(risk || defaultForm);
    setIsModalOpen(true);
  };

  if (loading && items.length === 0) return <LoadingScreen label="Scanning Infrastructure §6.1..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-red-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-4">
            <span className="bg-red-600/10 border border-red-500/20 px-4 py-1 rounded-xl text-[9px] text-red-500 tracking-widest italic shadow-inner">ISO 9001 §6.1 Matrix</span>
            <span className="text-slate-500 text-[9px] tracking-widest uppercase">{items.length} RISQUES SCELLÉS</span>
          </div>
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic flex items-center gap-5">
            Registre <span className="text-red-600">Risques</span>
          </h1>
        </div>

        <div className="flex gap-4 w-full xl:w-auto">
          <div className="relative flex-1 xl:flex-none group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-red-500 transition-all" size={20} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="SCANNER MENACE..." 
              className="w-full xl:w-80 bg-black/40 border-2 border-white/5 rounded-[2.5rem] py-5 pl-16 pr-8 text-[11px] font-black italic text-white outline-none focus:border-red-600 shadow-inner uppercase" 
            />
          </div>
          <button onClick={() => openModal()} className="flex-1 xl:flex-none bg-red-600 hover:bg-white hover:text-red-600 px-10 py-5 rounded-3xl text-[10px] shadow-4xl border-none cursor-pointer text-white italic transition-all active:scale-95 flex items-center justify-center gap-3 tracking-widest uppercase">
            <Plus size={18} strokeWidth={3} /> Nouvelle Menace
          </button>
        </div>
      </header>

      {/* 📊 KPI BAR */}
      <div className="shrink-0 px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6 bg-[#0B1222]/50 border-b border-white/5">
        <KPIBox label="Indice de Maîtrise" value={`${stats.rate}%`} icon={<ShieldCheck size={20}/>} color="emerald" />
        <KPIBox label="Menaces Critiques" value={stats.critical} icon={<AlertTriangle size={20}/>} color="rose" />
        <KPIBox label="Risques Archivés" value={stats.total} icon={<Database size={20}/>} color="amber" />
        <KPIBox label="Efficacité PAQ" value="94.2%" icon={<Activity size={20}/>} color="blue" />
      </div>

      {/* 🧩 DATA MATRIX (Isolated Scroll) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-400 mx-auto bg-[#151A2D] border-2 border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none"><Zap size={400}/></div>
          
          <table className="w-full text-left border-collapse min-w-250">
            <thead className="sticky top-0 bg-[#151A2D] z-10 border-b-2 border-white/5">
              <tr className="text-[10px] text-slate-500 uppercase font-black italic tracking-[0.3em]">
                <th className="px-10 py-8">Danger & Scénario</th>
                <th className="px-6 py-8 text-center">Matrice P-G-M</th>
                <th className="px-6 py-8 text-center">Criticité</th>
                <th className="px-6 py-8">Processus Source</th>
                <th className="px-10 py-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-white/5">
              {filteredItems.map(risk => {
                const rScore = risk.RS_Probabilite * risk.RS_Gravite * (risk.RS_Maitrise || 1);
                return (
                  <tr key={risk.RS_Id} className="group hover:bg-red-600/5 transition-all italic">
                    <td className="px-10 py-6 max-w-xl">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-black text-white uppercase tracking-tighter truncate group-hover:text-red-500 transition-colors">{risk.RS_Libelle}</span>
                        <span className="text-[10px] text-slate-500 font-bold normal-case leading-relaxed line-clamp-2">{risk.RS_Description || "Sans description d'impact."}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex justify-center gap-3">
                         <Cotation val={risk.RS_Probabilite} l="P" c="text-slate-400" />
                         <Cotation val={risk.RS_Gravite} l="G" c="text-red-500" />
                         <Cotation val={risk.RS_Maitrise} l="M" c="text-blue-500" />
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={cn("text-3xl font-black italic tracking-tighter leading-none", rScore >= 16 ? "text-red-600" : rScore >= 8 ? "text-amber-500" : "text-emerald-500")}>{rScore}</span>
                    </td>
                    <td className="px-6 py-6">
                      <span className="px-5 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-[10px] font-black uppercase text-blue-400 italic whitespace-nowrap tracking-widest">{risk.Processus?.PR_Libelle || "QUALITÉ GLOBALE"}</span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => openModal(risk)} className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 border-none cursor-pointer transition-all"><Edit3 size={18}/></button>
                        <button className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 border-none cursor-pointer transition-all"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* 📟 MODALE EXPERTE (ClickUp Industrial) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-1000 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8">
          <form onSubmit={handleSubmit} className="bg-[#0B0F1A] border-2 border-white/10 rounded-[4rem] w-full max-w-6xl max-h-[90vh] flex flex-col shadow-4xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
            
            <header className="px-12 py-10 border-b border-white/5 flex justify-between items-center bg-black/20">
              <div className="text-left space-y-2">
                <h2 className="text-3xl font-black uppercase italic m-0 tracking-tighter">Identification <span className="text-red-600">Risque Expert</span></h2>
                <p className="text-[10px] text-slate-600 tracking-[0.4em] m-0 font-black">PROTOCOLE DE SCELLAGE §6.1.2</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-5 bg-white/5 rounded-3xl text-slate-500 hover:text-white border-none cursor-pointer transition-all"><X size={28} /></button>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* SECTION A : QUALIFICATION */}
              <div className="lg:col-span-8 space-y-10">
                 <SDEInput label="Libellé de la Menace (§6.1) *" value={formData.RS_Libelle} onChange={(v: string) => setFormData({...formData, RS_Libelle: v.toUpperCase()})} />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SDESelect label="Processus Pilote *" value={formData.RS_ProcessusId} onChange={(v: string) => setFormData({...formData, RS_ProcessusId: v})}>
                        <option value="">-- SÉLECTIONNER SOURCE --</option>
                        {processusList.map(p => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>)}
                    </SDESelect>
                    <SDESelect label="Typologie de Risque *" value={formData.RS_TypeId} onChange={(v: string) => setFormData({...formData, RS_TypeId: v})}>
                        <option value="">-- CHOISIR CATÉGORIE --</option>
                        {riskTypes.map(t => <option key={t.RT_Id} value={t.RT_Id}>{t.RT_Label}</option>)}
                    </SDESelect>
                 </div>
                 <div className="space-y-4">
                    <SDEInput label="Description de l'Impact Potentiel" value={formData.RS_Description} onChange={(v: string) => setFormData({...formData, RS_Description: v})} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <SDEInput label="Activités Liées" value={formData.RS_Activite} onChange={(v: string) => setFormData({...formData, RS_Activite: v})} />
                       <SDEInput label="Causes Racines (§10.2)" value={formData.RS_Causes} onChange={(v: string) => setFormData({...formData, RS_Causes: v})} />
                    </div>
                 </div>
              </div>

              {/* SECTION B : MATRICE PGM (Calculatrice) */}
              <div className="lg:col-span-4 flex flex-col gap-8">
                <div className="bg-red-600/5 rounded-[3.5rem] border-2 border-red-600/20 p-10 flex flex-col items-center justify-center space-y-8 shadow-inner relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 bg-red-600 text-white text-[9px] font-black italic px-4 py-1 rounded-bl-3xl">CRITICITÉ</div>
                   <span className="text-8xl font-black text-white italic tracking-tighter leading-none drop-shadow-2xl">{score}</span>
                   <div className="space-y-6 w-full">
                      <CotationBox label="Probabilité" val={formData.RS_Probabilite} set={(v:number) => setFormData({...formData, RS_Probabilite: v})} />
                      <CotationBox label="Gravité" val={formData.RS_Gravite} set={(v:number) => setFormData({...formData, RS_Gravite: v})} />
                      <CotationBox label="Maîtrise" val={formData.RS_Maitrise} set={(v:number) => setFormData({...formData, RS_Maitrise: v})} />
                   </div>
                   <div className="text-[9px] text-red-500 font-black italic tracking-widest mt-4">
                     {"$$S = P \\times G \\times M$$"}
                   </div>
                </div>

                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Revue de Conformité</label>
                  <input 
                    type="date" 
                    value={formData.RS_NextReview ? new Date(formData.RS_NextReview).toISOString().split('T')[0] : ""} 
                    onChange={e => setFormData({...formData, RS_NextReview: e.target.value})} 
                    className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-5 text-sm font-black text-white outline-none focus:border-red-600 italic uppercase" 
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

            </div>

            <footer className="px-12 py-10 border-t border-white/10 flex justify-end gap-6 bg-black/40">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-6 bg-white/5 rounded-[2.5rem] text-slate-500 font-black uppercase text-[12px] tracking-widest border-none cursor-pointer hover:bg-white hover:text-black transition-all">Abandonner</button>
              <button type="submit" className="px-16 py-6 bg-red-600 text-white rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.4em] italic shadow-4xl border-none cursor-pointer hover:bg-white hover:text-red-600 transition-all flex items-center gap-4">
                <Save size={24} strokeWidth={3}/> Sceller dans la Matrice
              </button>
            </footer>
          </form>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

// --- 🧩 COMPOSANTS ATOMIQUES SDE ---

function KPIBox({ label, value, icon, color }: any) {
  const c: any = { 
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", 
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20", 
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20", 
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20" 
  };
  return (
    <div className={cn("p-6 rounded-[2.5rem] border flex items-center justify-between shadow-2xl transition-all hover:scale-[1.02]", c[color])}>
      <div className="flex items-center gap-4">
        <div className="p-4 bg-black/40 rounded-2xl shadow-inner text-white">{icon}</div>
        <span className="text-[10px] font-black uppercase text-slate-500 italic tracking-[0.2em] m-0 text-left">{label}</span>
      </div>
      <span className="text-4xl font-black italic m-0 text-white leading-none tracking-tighter drop-shadow-md">{value}</span>
    </div>
  );
}

function Cotation({ val, l, c }: { val: number, l: string, c: string }) {
  return <span className={cn("px-4 py-2 rounded-xl bg-black/50 border border-white/5 text-[11px] font-black italic shadow-inner tracking-widest", c)}>{l}:{val}</span>;
}

function CotationBox({ label, val, set }: { label: string, val: number, set: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between bg-black/40 p-5 rounded-2xl border-2 border-white/5 w-full transition-all hover:border-white/10 shadow-inner">
       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{label}</span>
       <div className="flex items-center gap-6">
          <button type="button" onClick={() => set(Math.max(1, val - 1))} className="text-white hover:text-red-500 p-2 rounded-lg bg-transparent border-none font-black text-2xl cursor-pointer transition-all active:scale-90">-</button>
          <span className="text-2xl font-black italic text-white leading-none w-6 text-center">{val}</span>
          <button type="button" onClick={() => set(Math.min(4, val + 1))} className="text-white hover:text-red-500 p-2 rounded-lg bg-transparent border-none font-black text-2xl cursor-pointer transition-all active:scale-90">+</button>
       </div>
    </div>
  );
}

function SDEInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-3 text-left w-full">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic m-0">{label}</label>
      <input 
        value={value || ""} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-6 text-[12px] font-black text-white outline-none italic focus:border-red-600 focus:bg-white/5 transition-all uppercase shadow-inner" 
        placeholder="..." 
      />
    </div>
  );
}

function SDESelect({ label, value, onChange, children }: { label: string, value: string, onChange: (v: string) => void, children: React.ReactNode }) {
  return (
    <div className="space-y-3 text-left w-full relative">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic m-0">{label}</label>
      <select 
        value={value || ""} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-6 text-[12px] font-black text-white outline-none italic focus:border-red-600 focus:bg-white/5 appearance-none cursor-pointer shadow-inner pr-12"
      >
        {children}
      </select>
      <div className="absolute right-6 bottom-6 pointer-events-none text-red-600">▼</div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-red-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}