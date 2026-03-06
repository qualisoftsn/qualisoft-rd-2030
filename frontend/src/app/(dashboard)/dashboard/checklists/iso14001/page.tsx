/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 MODULE : CHECKLIST D'AUDIT ISO 14001:2015 (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Évaluation du Système de Management Environnemental (SME).
 * FIX : UI ClickUp Zero-Scroll, Intégration KPIs Verts, Compliance Sénégal.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 01:45 GMT
 */

"use client";

import apiClient from "@/core/api/api-client";
import { 
  Leaf, Target, Flame, Recycle, Zap, CheckCircle, XCircle, AlertTriangle, 
  Minus, RefreshCw, Search, Download, UploadCloud, FileText, MapPin, ChevronDown, 
  Loader2
} from "lucide-react";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { toast, Toaster } from "sonner";

export default function ISO14001ChecklistPage() {
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<string>("4");
  const [searchTerm, setSearchTerm] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/checklist?standard=ISO_14001_2015");
      setChecklistItems(res.data?.data || res.data || []);
    } catch (err) { toast.error("Échec synchronisation ISO 14001"); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredItems = useMemo(() => {
    return checklistItems.filter(i => 
      i.LC_Clause.startsWith(activeGroup) && 
      (i.LC_Title.toLowerCase().includes(searchTerm.toLowerCase()) || i.LC_Clause.includes(searchTerm))
    );
  }, [checklistItems, activeGroup, searchTerm]);

  const updateResponse = async (id: string, resp: string) => {
    setSavingId(id);
    try {
      await apiClient.post("/checklist/response", { CR_ChecklistId: id, CR_Response: resp });
      toast.success("Impact environnemental scellé.");
      fetchData();
    } catch (e) { toast.error("Échec sauvegarde."); } 
    finally { setSavingId(null); }
  };

  if (loading && checklistItems.length === 0) return (
    <div className="flex h-full w-full items-center justify-center bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-green-500" size={48} />
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] text-white italic font-sans overflow-hidden w-full selection:bg-green-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER ENVIRONNEMENT */}
      <header className="shrink-0 p-6 md:p-8 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-md z-20 flex flex-col md:flex-row justify-between items-end gap-6 mt-12 lg:mt-0">
        <div className="flex items-start gap-5">
           <div className="bg-linear-to-br from-green-600 to-emerald-800 p-4 rounded-3xl shadow-xl shadow-green-900/20 border border-green-500/20 shrink-0">
             <Leaf size={32} className="text-white" />
           </div>
           <div>
              <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter m-0 leading-none">ISO <span className="text-green-500">14001</span> Matrix</h1>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-3 italic m-0">Performance Durable & Protection de l&apos;Écosystème</p>
           </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input placeholder="ASPECTS ENVIRONNEMENTAUX..." className="w-full bg-[#0F172A] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black uppercase outline-none focus:border-green-600 text-white italic" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button className="px-6 py-3 bg-green-600 rounded-2xl font-black uppercase text-[10px] tracking-widest border-none text-white cursor-pointer hover:bg-white hover:text-green-600 transition-all shadow-xl shadow-green-900/20">Rapport</button>
        </div>
      </header>

      {/* 📜 WORKZONE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Navigation SME */}
        <aside className="w-full lg:w-80 border-r border-white/5 bg-[#0F172A]/30 overflow-y-auto shrink-0 custom-scrollbar">
           <div className="p-4 border-b border-white/5 bg-black/20 italic font-black text-[10px] text-slate-500 uppercase tracking-widest">Piliers Environnementaux</div>
           {CLAUSE_GROUPS.map(g => (
             <button key={g.id} onClick={() => setActiveGroup(g.id)} className={`w-full p-5 text-left transition-all border-none cursor-pointer flex justify-between items-center ${activeGroup === g.id ? 'bg-green-600/10 border-l-4 border-l-green-500' : 'hover:bg-white/5 border-l-4 border-l-transparent'}`}>
                <span className={`text-[10px] font-black uppercase italic ${activeGroup === g.id ? 'text-green-400' : 'text-slate-400'}`}>§{g.id}. {g.label}</span>
                <ChevronDown size={14} className={activeGroup === g.id ? "text-green-500" : "text-slate-800"} />
             </button>
           ))}
        </aside>

        {/* List Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar bg-[#0B0F1A]">
           <div className="max-w-4xl mx-auto space-y-6">
              {filteredItems.map(item => (
                <div key={item.LC_Id} className="bg-[#0F172A] border border-white/5 rounded-4xl p-6 lg:p-8 hover:border-green-500/30 transition-all flex flex-col gap-6 group">
                   <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black italic rounded">§{item.LC_Clause}</span>
                        {item.LC_SenegalSpecific && <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase flex items-center gap-2"><MapPin size={10}/> Sénégal</span>}
                      </div>
                      <h3 className="text-xl font-black uppercase italic text-white leading-tight m-0 group-hover:text-green-400 transition-colors">{item.LC_Title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed italic m-0 bg-black/40 p-5 rounded-2xl border border-white/5">{item.LC_Criteria}</p>
                   </div>
                   <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-white/5 gap-4">
                      <div className="flex bg-black/20 rounded-xl p-1 border border-white/5">
                        <RespBtn type="YES" active={item.response?.CR_Response === 'YES'} color="emerald" onClick={() => updateResponse(item.LC_Id, 'YES')} saving={savingId === item.LC_Id} />
                        <RespBtn type="NO" active={item.response?.CR_Response === 'NO'} color="red" onClick={() => updateResponse(item.LC_Id, 'NO')} saving={savingId === item.LC_Id} />
                        <RespBtn type="PARTIAL" active={item.response?.CR_Response === 'PARTIAL'} color="amber" onClick={() => updateResponse(item.LC_Id, 'PARTIAL')} saving={savingId === item.LC_Id} />
                        <RespBtn type="NA" active={item.response?.CR_Response === 'NA'} color="gray" onClick={() => updateResponse(item.LC_Id, 'NA')} saving={savingId === item.LC_Id} />
                      </div>
                      <div className="flex items-center gap-3">
                         <button className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all border-none cursor-pointer"><UploadCloud size={18}/></button>
                         <button className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all border-none cursor-pointer"><FileText size={18}/></button>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </main>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.2); border-radius: 10px; }` }} />
    </div>
  );
}

const CLAUSE_GROUPS = [
  { id: "4", label: "Contexte Organisationnel" }, { id: "5", label: "Leadership SME" }, { id: "6", label: "Planification" },
  { id: "7", label: "Support & Ressources" }, { id: "8", label: "Opérations SME" }, { id: "9", label: "Performance" }, { id: "10", label: "Amélioration" }
];

function RespBtn({ type, active, color, onClick, saving }: any) {
  const styles: any = { 
    emerald: active ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-500 hover:bg-emerald-500/10',
    red: active ? 'bg-red-600 text-white shadow-lg' : 'text-red-500 hover:bg-red-500/10',
    amber: active ? 'bg-amber-600 text-white shadow-lg' : 'text-amber-500 hover:bg-amber-500/10',
    gray: active ? 'bg-slate-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-500/10'
  };
  const icons: any = { YES: <CheckCircle size={14}/>, NO: <XCircle size={14}/>, PARTIAL: <AlertTriangle size={14}/>, NA: <Minus size={14}/> };
  return (
    <button onClick={onClick} disabled={saving} className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all border-none cursor-pointer ${styles[color]} ${saving ? 'opacity-30 animate-pulse' : ''}`}>
      {icons[type]}
    </button>
  );
}