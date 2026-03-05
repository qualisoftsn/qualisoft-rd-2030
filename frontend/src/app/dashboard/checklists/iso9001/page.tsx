/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : CHECKLIST D'AUDIT ISO 9001:2015 (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Évaluation de la conformité du Système de Management de la Qualité.
 * FIX : UI ClickUp 100dvh (Zéro Scroll Global), PWA Ready, Matrix Scaling.
 * SÉCURITÉ : Synchronisation SDE Souveraine, Zéro NextAuth.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 01:32 GMT
 */

'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import {
  CheckCircle2, Download, RefreshCw, Search, Target, XCircle,
  Layers, Loader2, ExternalLink, Check, X, Minus, HelpCircle, ChevronRight
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- TYPES ---
type ResponseType = 'YES' | 'NO' | 'PARTIAL' | 'NA';

interface ChecklistItem {
  LC_Id: string; LC_Clause: string; LC_Title: string; LC_Criteria: string; LC_IsMandatory: boolean;
  response?: { CR_Response: ResponseType; CR_IsCompliant: boolean; };
}

export default function ISO9001ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeClause, setActiveClause] = useState<string>('4');
  const [searchTerm, setSearchTerm] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/checklist?standard=ISO9001');
      const data = res.data?.data || res.data;
      setItems(Array.isArray(data) ? data : []);
    } catch (err) { toast.error('Échec synchronisation ISO 9001'); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = items.length;
    const compliant = items.filter(i => i.response?.CR_Response === 'YES').length;
    const rate = total > 0 ? Math.round((compliant / total) * 100) : 0;
    return { total, compliant, rate, nonCompliant: items.filter(i => i.response?.CR_Response === 'NO').length };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(i =>
      i.LC_Clause.startsWith(activeClause) &&
      (i.LC_Title.toLowerCase().includes(searchTerm.toLowerCase()) || i.LC_Clause.includes(searchTerm))
    );
  }, [items, activeClause, searchTerm]);

  const updateResponse = async (id: string, resp: ResponseType) => {
    setSavingId(id);
    try {
      await apiClient.post('/checklist/response', { LC_Id: id, CR_Response: resp });
      toast.success(`Point §${id} mis à jour.`);
      fetchData();
    } catch (e) { toast.error("Erreur de sauvegarde."); } 
    finally { setSavingId(null); }
  };

  if (loading && items.length === 0) return (
    <div className="flex h-full w-full items-center justify-center bg-[#0B0F1A]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse text-blue-500">Extraction Clause §9001...</span>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] text-white italic font-sans overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 EN-TÊTE FIXE */}
      <header className="shrink-0 p-6 md:p-8 lg:px-10 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-md z-20 flex flex-col md:flex-row justify-between items-end gap-6 mt-12 lg:mt-0">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest italic rounded-full">SMI CORE</span>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest italic rounded-full">{stats.rate}% Conformité</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter m-0 leading-none">Checklist <span className="text-blue-500">ISO 9001</span></h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] m-0">Évaluation Systémique des Clauses Qualité</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input placeholder="FILTRER EXIGENCE..." className="w-full bg-[#0F172A] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black uppercase outline-none focus:border-blue-500 text-white italic" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={fetchData} className="p-3 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all border-none text-white cursor-pointer"><RefreshCw size={20} className={loading ? "animate-spin" : ""} /></button>
        </div>
      </header>

      {/* 📊 KPI BAR FIXE */}
      <div className="shrink-0 px-6 lg:px-10 py-4 bg-black/20 border-b border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPIStat title="Total" value={stats.total} icon={Layers} color="gray" />
        <KPIStat title="Conforme" value={stats.compliant} icon={CheckCircle2} color="emerald" />
        <KPIStat title="Écarts" value={stats.nonCompliant} icon={XCircle} color="red" />
        <KPIStat title="Score" value={`${stats.rate}%`} icon={Target} color="blue" />
      </div>

      {/* 📜 ZONE DE TRAVAIL (Isolated Scroll) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Navigation Clauses */}
        <aside className="w-full lg:w-80 border-r border-white/5 bg-[#0F172A]/30 overflow-y-auto custom-scrollbar shrink-0">
          <div className="p-4 border-b border-white/5 bg-black/20 sticky top-0 z-10">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest m-0">Structure de la Norme</p>
          </div>
          <div className="divide-y divide-white/5">
            {CLAUSES_9001.map((c) => (
              <button key={c.id} onClick={() => setActiveClause(c.id)} className={`w-full p-5 text-left transition-all border-none cursor-pointer flex justify-between items-center group ${activeClause === c.id ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : 'hover:bg-white/5 border-l-4 border-l-transparent'}`}>
                <div className="min-w-0">
                  <p className={`text-[10px] font-black uppercase italic truncate m-0 ${activeClause === c.id ? 'text-blue-400' : 'text-slate-300'}`}>§{c.id}. {c.title}</p>
                </div>
                <ChevronRight size={14} className={activeClause === c.id ? "text-blue-500" : "text-slate-700"} />
              </button>
            ))}
          </div>
        </aside>

        {/* Checklist Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-6">
          <div className="max-w-5xl mx-auto space-y-4">
            {filteredItems.length > 0 ? filteredItems.map((item) => (
              <div key={item.LC_Id} className="bg-[#0F172A] border border-white/5 rounded-4xl p-6 lg:p-8 hover:border-blue-500/30 transition-all flex flex-col md:flex-row justify-between items-center gap-6 group">
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[9px] font-black italic rounded">§{item.LC_Clause}</span>
                    {item.LC_IsMandatory && <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black uppercase">Obligatoire</span>}
                  </div>
                  <h3 className="text-lg font-black uppercase italic text-white m-0 tracking-tight group-hover:text-blue-400 transition-colors leading-tight">{item.LC_Title}</h3>
                  <p className="text-[11px] text-slate-400 italic m-0 border-l border-white/10 pl-4">{item.LC_Criteria}</p>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0 w-full md:w-auto">
                   <ResponseBadge response={item.response?.CR_Response} />
                   <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                      <RespBtn type="YES" active={item.response?.CR_Response === 'YES'} color="emerald" onClick={() => updateResponse(item.LC_Id, 'YES')} saving={savingId === item.LC_Id} />
                      <RespBtn type="NO" active={item.response?.CR_Response === 'NO'} color="red" onClick={() => updateResponse(item.LC_Id, 'NO')} saving={savingId === item.LC_Id} />
                      <RespBtn type="PARTIAL" active={item.response?.CR_Response === 'PARTIAL'} color="amber" onClick={() => updateResponse(item.LC_Id, 'PARTIAL')} saving={savingId === item.LC_Id} />
                      <RespBtn type="NA" active={item.response?.CR_Response === 'NA'} color="gray" onClick={() => updateResponse(item.LC_Id, 'NA')} saving={savingId === item.LC_Id} />
                   </div>
                </div>
              </div>
            )) : (
              <div className="h-64 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-slate-700">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase italic tracking-widest">Aucune exigence ne correspond au filtre Matrix</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37,99,235,0.2); border-radius: 10px; }` }} />
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

const CLAUSES_9001 = [
  { id: '4', title: 'Contexte' }, { id: '5', title: 'Leadership' }, { id: '6', title: 'Planification' },
  { id: '7', title: 'Support' }, { id: '8', title: 'Opérations' }, { id: '9', title: 'Performance' }, { id: '10', title: 'Amélioration' }
];

function KPIStat({ title, value, icon: Icon, color }: any) {
  const themes: any = { emerald: "text-emerald-400", blue: "text-blue-400", red: "text-red-400", gray: "text-slate-500" };
  return (
    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-current bg-opacity-10 ${themes[color]}`}><Icon size={18} /></div>
      <div>
        <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest m-0">{title}</p>
        <p className="text-xl font-black italic text-white m-0 leading-none mt-1">{value}</p>
      </div>
    </div>
  );
}

function ResponseBadge({ response }: { response?: ResponseType }) {
  if (!response) return <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest italic">Non éval.</span>;
  const config: any = { YES: 'text-emerald-400', NO: 'text-red-400', PARTIAL: 'text-amber-400', NA: 'text-slate-400' };
  return <span className={`text-[9px] font-black uppercase tracking-tighter ${config[response]}`}>{response === 'YES' ? 'CONFORME' : response === 'NO' ? 'ÉCART' : response}</span>;
}

function RespBtn({ type, active, color, onClick, saving }: any) {
  const styles: any = { 
    emerald: active ? 'bg-emerald-600 text-white' : 'text-emerald-500 hover:bg-emerald-500/10',
    red: active ? 'bg-red-600 text-white' : 'text-red-500 hover:bg-red-500/10',
    amber: active ? 'bg-amber-600 text-white' : 'text-amber-500 hover:bg-amber-500/10',
    gray: active ? 'bg-slate-600 text-white' : 'text-slate-500 hover:bg-slate-500/10'
  };
  const icons: any = { YES: <Check size={14}/>, NO: <X size={14}/>, PARTIAL: <Minus size={14}/>, NA: <HelpCircle size={14}/> };
  return (
    <button onClick={onClick} disabled={saving} className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all border-none cursor-pointer ${styles[color]} ${saving ? 'opacity-30' : ''}`}>
      {saving && active ? <Loader2 size={14} className="animate-spin" /> : icons[type]}
    </button>
  );
}