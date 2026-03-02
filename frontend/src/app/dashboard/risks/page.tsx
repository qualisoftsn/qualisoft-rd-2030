/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/**
 * 🛰️ MODULE : REGISTRE SOUVERAIN DES RISQUES (§6.1 ISO 9001:2015)
 * ---------------------------------------------------------------------------
 * DESIGN : Elite High-Density / Cockpit SDE Matrix / Responsive
 * SÉCURITÉ : Zéro NextAuth (100% apiClient)
 * DATE DE RÉVISION : 02 Mars 2026 | 14:21 GMT
 * ---------------------------------------------------------------------------
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

// --- 🛠️ TYPES ET UTILITAIRES SDE ---
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(" ");

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
    } catch (err) { 
      toast.error("RUPTURE KERNEL MATRIX: Impossible de charger les référentiels."); 
    } finally { 
      setLoading(false); 
    }
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
    if (!formData.RS_ProcessusId || !formData.RS_TypeId) return toast.warning("RÉFÉRENTIELS OBLIGATOIRES NON DÉFINIS");
    
    const tid = toast.loading("SCELLAGE DE LA MENACE §6.1...");
    try {
      if (editingId) {
        await apiClient.patch(`/risks/${editingId}`, formData);
      } else {
        await apiClient.post("/risks", formData);
      }
      toast.success("MATRICE DES RISQUES MISE À JOUR", { id: tid });
      setIsModalOpen(false);
      fetchData();
    } catch (e: any) { 
      toast.error(e.response?.data?.message || "ÉCHEC DE MUTATION", { id: tid }); 
    }
  };

  const openModal = (risk?: RiskData) => {
    if (risk) {
      setEditingId(risk.RS_Id || null);
      setFormData(risk);
    } else {
      setEditingId(null);
      setFormData(defaultForm);
    }
    setIsModalOpen(true);
  };

  if (loading && items.length === 0) return (
    <div className="ml-0 lg:ml-72 min-h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-red-600" size={48} strokeWidth={2} />
      <span className="text-red-600 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse italic">Sync Kernel Risques...</span>
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 min-h-screen lg:h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-4 lg:p-6 overflow-hidden selection:bg-red-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-4 mb-5 shrink-0 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter m-0 flex items-center gap-3 italic leading-none">
            <AlertOctagon className="text-red-600" size={28} /> Registre <span className="text-red-600">Risques</span>
          </h1>
          <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] m-0 mt-2">ISO 9001:2015 §6.1 • SDE Command Center</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative w-full sm:w-64 group">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="SCANNER MENACE..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-[10px] md:text-[11px] font-black uppercase outline-none focus:border-red-600 transition-all italic" 
            />
          </div>
          <button onClick={() => openModal()} className="w-full sm:w-auto bg-red-600 hover:bg-white hover:text-red-600 px-6 py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase flex items-center justify-center gap-2 border-none cursor-pointer transition-all italic shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            <Plus size={16} strokeWidth={4} /> Nouvelle Menace
          </button>
        </div>
      </header>

      

      {/* 📊 KPI BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5 shrink-0">
        <KPIBox label="Indice de Maîtrise" value={`${stats.rate}%`} icon={<ShieldCheck size={18}/>} color="emerald" />
        <KPIBox label="Menaces Critiques" value={stats.critical} icon={<AlertTriangle size={18}/>} color="rose" />
        <KPIBox label="Risques Scellés" value={stats.total} icon={<Database size={18}/>} color="amber" />
        <KPIBox label="Efficacité PAQ" value="94.2%" icon={<Activity size={18}/>} color="blue" />
      </div>

      {/* 🧩 DATA MATRIX (Flex-1) */}
      <main className="flex-1 min-h-100 bg-[#151A2D] border border-white/5 rounded-4xl lg:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none"><Zap size={300}/></div>
        
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-200">
            <thead className="sticky top-0 bg-[#151A2D] z-10 border-b border-white/10 shadow-sm">
              <tr className="text-[9px] text-slate-500 uppercase font-black italic tracking-widest">
                <th className="px-6 py-5">Danger & Scénario</th>
                <th className="px-6 py-5 text-center">Matrice P-G-M</th>
                <th className="px-6 py-5 text-center">Criticité</th>
                <th className="px-6 py-5">Processus Source</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map(risk => {
                const rScore = risk.RS_Probabilite * risk.RS_Gravite * (risk.RS_Maitrise || 1);
                return (
                  <tr key={risk.RS_Id} className="group hover:bg-red-600/5 transition-all italic">
                    <td className="px-6 py-4 max-w-75">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-white uppercase leading-tight truncate">{risk.RS_Libelle}</span>
                        <span className="text-[10px] text-slate-500 mt-1.5 font-medium normal-case leading-tight line-clamp-2">{risk.RS_Description || "Sans description détaillée de l'impact."}</span>
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
                      <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase text-blue-400 italic whitespace-nowrap">{risk.Processus?.PR_Libelle || "NON DÉFINI"}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                        <button onClick={() => openModal(risk)} className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 border-none cursor-pointer transition-colors"><Edit3 size={16}/></button>
                        <button className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 border-none cursor-pointer transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-600 text-[11px] font-black uppercase tracking-widest">
                    Aucune menace identifiée dans ce périmètre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* 📟 MODALE EXPERTE (Responsive Grid) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-600 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 lg:p-6">
          <form onSubmit={handleSubmit} className="bg-[#151A2D] border border-white/10 rounded-[2.5rem] lg:rounded-[3rem] w-full max-w-5xl max-h-[95vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 relative overflow-hidden italic">
            <header className="px-6 lg:px-10 py-6 border-b border-white/5 flex justify-between items-center shrink-0 bg-black/20">
              <h2 className="text-xl lg:text-2xl font-black uppercase italic m-0 tracking-tighter">
                Identification <span className="text-red-600">Risque Expert</span>
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border-none cursor-pointer transition-colors"><X size={20} /></button>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-8">
              
              {/* BLOC 1 : IDENTIFICATION */}
              <div className="lg:col-span-2 space-y-6">
                 <SDEInput label="Libellé de la Menace (§6.1) *" value={formData.RS_Libelle} onChange={(v: string) => setFormData({...formData, RS_Libelle: v.toUpperCase()})} />
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <SDESelect label="Processus Source *" value={formData.RS_ProcessusId} onChange={(v: string) => setFormData({...formData, RS_ProcessusId: v})}>
                        <option value="">CHOISIR LE PROCESSUS...</option>
                        {processusList.map(p => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>)}
                    </SDESelect>
                    <SDESelect label="Typologie de Risque *" value={formData.RS_TypeId} onChange={(v: string) => setFormData({...formData, RS_TypeId: v})}>
                        <option value="">CHOISIR LE TYPE...</option>
                        {riskTypes.map(t => <option key={t.RT_Id} value={t.RT_Id}>{t.RT_Label}</option>)}
                    </SDESelect>
                 </div>
              </div>

              {/* BLOC 2 : COTATION MATRICE */}
              <div className="bg-red-600/5 rounded-4xl border border-red-600/20 p-6 flex flex-col items-center justify-center space-y-6 shadow-inner">
                 <span className="text-[10px] font-black text-red-500 tracking-[0.3em] uppercase text-center">Indice de Criticité</span>
                 <span className="text-6xl lg:text-7xl font-black text-white italic tracking-tighter leading-none">{score}</span>
                 <div className="flex gap-3 lg:gap-4 w-full justify-center">
                    <CotationBox label="Probabilité" val={formData.RS_Probabilite} set={(v:number) => setFormData({...formData, RS_Probabilite: v})} />
                    <CotationBox label="Gravité" val={formData.RS_Gravite} set={(v:number) => setFormData({...formData, RS_Gravite: v})} />
                    <CotationBox label="Maîtrise" val={formData.RS_Maitrise} set={(v:number) => setFormData({...formData, RS_Maitrise: v})} />
                 </div>
              </div>

              {/* BLOC 3 : ANALYSE DESCRIPTIVE */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <SDEInput label="Activités / Tâches Liées" value={formData.RS_Activite} onChange={(v: string) => setFormData({...formData, RS_Activite: v})} />
                <SDEInput label="Causes & Racines (§10.2)" value={formData.RS_Causes} onChange={(v: string) => setFormData({...formData, RS_Causes: v})} />
                <div className="md:col-span-2">
                  <SDEInput label="Description de l'Impact Potentiel" value={formData.RS_Description} onChange={(v: string) => setFormData({...formData, RS_Description: v})} />
                </div>
              </div>

              {/* BLOC 4 : TRAITEMENT & CONTEXTE */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 border-t border-white/5 pt-8">
                <SDEInput label="Mesures de Maîtrise Existantes" value={formData.RS_Mesures} onChange={(v: string) => setFormData({...formData, RS_Mesures: v})} />
                <SDEInput label="Exigences Légales Impactées" value={formData.RS_ExigencesLegales} onChange={(v: string) => setFormData({...formData, RS_ExigencesLegales: v})} />
                <div className="space-y-2 text-left">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Prochaine Revue Obligatoire</label>
                  <input 
                    type="date" 
                    value={formData.RS_NextReview ? new Date(formData.RS_NextReview).toISOString().split('T')[0] : ""} 
                    onChange={e => setFormData({...formData, RS_NextReview: e.target.value})} 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[11px] font-black text-white outline-none focus:border-red-600 transition-colors" 
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

            </div>

            <footer className="px-6 lg:px-10 py-6 border-t border-white/10 flex flex-col-reverse sm:flex-row justify-end gap-4 shrink-0 bg-black/40">
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-8 py-4 bg-white/5 rounded-2xl text-slate-400 font-black uppercase text-[10px] lg:text-[11px] tracking-widest border-none cursor-pointer hover:bg-white/10 hover:text-white transition-colors">Abandonner</button>
              <button type="submit" className="w-full sm:w-auto px-10 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] lg:text-[11px] tracking-widest italic shadow-[0_10px_30px_rgba(220,38,38,0.3)] border-none cursor-pointer hover:bg-red-500 transition-all flex items-center justify-center gap-3">
                <Save size={18} strokeWidth={3}/> Sceller dans la Matrice
              </button>
            </footer>
          </form>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(220,38,38,0.5); }
      `}</style>
    </div>
  );
}

// --- 🧩 COMPOSANTS ATOMIQUES SDE ---

function KPIBox({ label, value, icon, color }: any) {
  const c: Record<string, string> = { 
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", 
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20", 
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20", 
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20" 
  };
  return (
    <div className={cn("p-4 lg:p-5 rounded-3xl border flex items-center justify-between shadow-lg", c[color])}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-black/40 rounded-xl shadow-inner">{icon}</div>
        <span className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 italic tracking-widest leading-none m-0">{label}</span>
      </div>
      <span className="text-2xl lg:text-3xl font-black italic m-0 text-white leading-none tracking-tighter">{value}</span>
    </div>
  );
}

function Cotation({ val, l, c }: { val: number, l: string, c: string }) {
  return <span className={cn("px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/5 text-[10px] italic shadow-inner", c)}>{l}:{val}</span>;
}

function CotationBox({ label, val, set }: { label: string, val: number, set: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-black/50 p-3 rounded-2xl border border-white/5 w-full">
       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
       <div className="flex items-center gap-3">
          <button type="button" onClick={() => set(Math.max(1, val - 1))} className="text-slate-400 hover:bg-white/10 p-1 rounded-md bg-transparent border-none font-black text-lg cursor-pointer transition-colors">-</button>
          <span className="text-xl font-black italic text-white leading-none w-4 text-center">{val}</span>
          <button type="button" onClick={() => set(Math.min(4, val + 1))} className="text-slate-400 hover:bg-white/10 p-1 rounded-md bg-transparent border-none font-black text-lg cursor-pointer transition-colors">+</button>
       </div>
    </div>
  );
}

function SDEInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2 text-left w-full">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">{label}</label>
      <input 
        value={value || ""} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 lg:p-5 text-[11px] lg:text-xs font-black text-white outline-none italic focus:border-red-600 focus:bg-white/5 transition-all placeholder:opacity-20 uppercase shadow-inner" 
        placeholder="..." 
      />
    </div>
  );
}

function SDESelect({ label, value, onChange, children }: { label: string, value: string, onChange: (v: string) => void, children: React.ReactNode }) {
  return (
    <div className="space-y-2 text-left w-full relative">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">{label}</label>
      <select 
        value={value || ""} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 lg:p-5 text-[11px] lg:text-xs font-black text-white outline-none italic focus:border-red-600 focus:bg-white/5 appearance-none cursor-pointer shadow-inner pr-10"
      >
        {children}
      </select>
      <div className="absolute right-4 bottom-4 pointer-events-none text-slate-500">▼</div>
    </div>
  );
}