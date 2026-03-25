/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛠️ MODULE : GESTION DES TYPOLOGIES (SDE MATRIX)
 * -------------------------------------------------------------------------
 * RÔLE : Définition des familles de processus (§4.4 ISO 9001).
 * DESIGN : Elite High-Density, ClickUp Modals, Full Workspace.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 20:45 GMT
 */

"use client";

import React, { useCallback, useEffect, useState } from "react";
import apiClient from "@/core/api/api-client";
import { 
  Edit, Layers, Plus, RefreshCw, 
  ShieldCheck, Trash2, XCircle} from "lucide-react";
import { toast, Toaster } from "sonner";

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function ProcessTypePage() {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/processus-types");
      setTypes(res.data?.data || res.data || []);
    } catch { toast.error("SYNCHRO TYPOLOGIE ÉCHOUÉE"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!confirm("ACTION CRITIQUE : SUPPRIMER CE SEGMENT ?")) return;
    try {
      await apiClient.delete(`/processus-types/${id}`);
      toast.success("SEGMENT RETIRÉ DU REGISTRE");
      loadData();
    } catch { toast.error("ÉCHEC : SEGMENT LIÉ À DES PROCESSUS ACTIFS"); }
  };

  if (loading) return <LoadingScreen label="Scanning SDE Architecture..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-8 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic flex items-center gap-5">
            <Layers className="text-blue-600" size={40} /> Référentiel <span className="text-blue-600">Structurel</span>
          </h1>
          <p className="text-slate-500 text-[9px] tracking-[0.4em] m-0 flex items-center gap-3 italic">
            <ShieldCheck size={14} className="text-emerald-500" /> ISO 9001 §4.4 : Classification des Flux
          </p>
        </div>
        <button onClick={() => { setEditingType(null); setShowModal(true); }} className="bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-5 rounded-3xl text-[10px] shadow-4xl border-none cursor-pointer text-white italic transition-all flex items-center gap-3 tracking-widest">
          <Plus size={18} /> Initialiser Segment
        </button>
      </header>

      {/* 📋 REGISTRY GRID */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-10">
        <div className="max-w-400 mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pb-20">
          {types.map((type) => (
            <div key={type.PT_Id} className="bg-[#151B2B] border-2 border-white/5 p-12 rounded-[4rem] group hover:border-blue-600/40 transition-all shadow-4xl relative overflow-hidden flex flex-col justify-between h-95 text-left">
              <div className="absolute -right-12 -top-12 opacity-[0.03] group-hover:opacity-[0.08] transition-all rotate-12 pointer-events-none text-white">
                <Layers size={220} />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-10">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-4xl border border-white/10 shrink-0" style={{ backgroundColor: `${type.PT_Color || '#3b82f6'}15`, color: type.PT_Color || '#3b82f6' }}>
                    <Layers size={32} />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => { setEditingType(type); setShowModal(true); }} className="p-3 bg-black/40 rounded-xl text-slate-500 hover:text-blue-500 transition-all cursor-pointer border border-white/5"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(type.PT_Id)} className="p-3 bg-black/40 rounded-xl text-slate-500 hover:text-red-500 transition-all cursor-pointer border border-white/5"><Trash2 size={16}/></button>
                  </div>
                </div>

                <h3 className="text-3xl font-black italic tracking-tighter m-0 group-hover:text-blue-400 transition-colors uppercase leading-none mb-6">{type.PT_Label}</h3>
                <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-1.5 rounded-full w-fit mb-8"><span className="text-[10px] text-blue-400 tracking-widest">{type.PT_Family}</span></div>
                
                <p className="text-sm font-bold text-slate-400 italic line-clamp-3 leading-relaxed m-0 flex-1">{type.PT_Description || "Aucune analyse descriptive scellée."}</p>

                <div className="flex justify-between items-center border-t border-white/5 pt-8 mt-8">
                  <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md border border-white/10" style={{ backgroundColor: type.PT_Color || '#3b82f6' }} /><span className="text-[9px] text-slate-600 tracking-widest">{type.PT_Color || '#3B82F6'}</span></div>
                  <div className={cn("px-4 py-1 rounded-xl text-[9px] tracking-widest border", type.PT_IsActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>{type.PT_IsActive ? "ACTIF" : "ARCHIVÉ"}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 📟 MODALE TYPE */}
      {showModal && (
        <ProcessTypeModal type={editingType} onClose={() => setShowModal(false)} onSuccess={loadData} />
      )}
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function ProcessTypeModal({ type, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    PT_Label: type?.PT_Label || "", PT_Description: type?.PT_Description || "",
    PT_Color: type?.PT_Color || "#3b82f6", PT_Family: type?.PT_Family || "REALISATION",
    PT_IsActive: type?.PT_IsActive ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (type) await apiClient.patch(`/processus-types/${type.PT_Id}`, formData);
      else await apiClient.post("/processus-types", formData);
      toast.success("SCELLAGE RÉUSSI");
      onSuccess();
      onClose();
    } catch { toast.error("ÉCHEC DE MUTATION"); }
  };

  return (
    <div className="fixed inset-0 z-100 flex justify-center items-center p-8">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0F172A] p-16 rounded-[4rem] border border-white/5 animate-in zoom-in-95 duration-300 shadow-4xl text-left overflow-y-auto max-h-[90vh] custom-scrollbar">
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-black italic m-0 uppercase">{type ? "Rectifier" : "Initialiser"} <span className="text-blue-600">Segment</span></h2>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white border-none cursor-pointer"><XCircle size={32}/></button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          <InputSDE label="Désignation" value={formData.PT_Label} onChange={(v: string) => setFormData({...formData, PT_Label: v.toUpperCase()})} placeholder="EX: MANAGEMENT" />
          
          <div className="grid grid-cols-2 gap-10">
            <SelectSDE label="Famille ISO" value={formData.PT_Family} onChange={(v: string) => setFormData({...formData, PT_Family: v})} options={[{id:'MANAGEMENT', label:'MANAGEMENT'}, {id:'REALISATION', label:'REALISATION'}, {id:'SUPPORT', label:'SUPPORT'}]} />
            <div className="space-y-4">
              <label className="text-[10px] text-slate-500 tracking-[0.4em] ml-6">Identité Couleur</label>
              <div className="flex gap-4">
                <input type="color" value={formData.PT_Color} onChange={(e) => setFormData({...formData, PT_Color: e.target.value})} className="w-16 h-16 rounded-2xl cursor-pointer bg-transparent border-none overflow-hidden" />
                <input value={formData.PT_Color} onChange={(e) => setFormData({...formData, PT_Color: e.target.value})} className="flex-1 bg-slate-950 border-2 border-white/5 rounded-2xl p-4 text-[10px] font-black italic uppercase text-white outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] text-slate-500 tracking-[0.4em] ml-6">Description Scope</label>
            <textarea rows={4} value={formData.PT_Description} onChange={(e) => setFormData({...formData, PT_Description: e.target.value})} className="w-full bg-slate-950 border-2 border-white/5 rounded-[2.5rem] p-8 text-sm font-bold italic text-white outline-none resize-none shadow-inner" placeholder="Finalités de ce segment..." />
          </div>

          <button type="submit" className="w-full py-8 bg-blue-600 rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.5em] italic border-none cursor-pointer mt-8 hover:bg-white hover:text-blue-600 transition-all shadow-4xl text-white">Valider la Structure</button>
        </form>
      </div>
    </div>
  );
}

function InputSDE({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-4 text-left">
      <label className="text-[10px] text-slate-500 tracking-[0.4em] ml-6">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border-2 border-white/5 rounded-4xl p-6 text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-600 transition-all shadow-inner" />
    </div>
  );
}

function SelectSDE({ label, value, onChange, options }: any) {
  return (
    <div className="space-y-4 text-left">
      <label className="text-[10px] text-slate-500 tracking-[0.4em] ml-6">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-950 border-2 border-white/5 rounded-4xl p-6 text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-600 appearance-none cursor-pointer shadow-inner">
          <option value="">SÉLECTIONNER...</option>
          {options.map((o: any) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 text-[10px]">▼</div>
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}
