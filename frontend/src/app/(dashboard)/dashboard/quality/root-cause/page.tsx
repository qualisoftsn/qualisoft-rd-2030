/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🔬 MODULE : ROOT CAUSE ANALYSIS (ELITE-SDE)
 * -------------------------------------------------------------------------
 * PROTOCOLE : SDE Matrix §10.2 — ISO 9001 (Non-Conformités).
 * FIX : Parsing sécurisé & Visualisation Ishikawa High-Density.
 * RÉVISION : 07 Mars 2026 | 14:25 GMT
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import {
  AlertOctagon, GitBranch, Loader2, Microscope, Save, Zap, 
  Search, RefreshCw, ChevronRight, Activity, Target
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

export default function RootCauseAnalysisPage() {
  const [ncList, setNcList] = useState<any[]>([]);
  const [selectedNc, setSelectedNc] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [whys, setWhys] = useState<string[]>(['', '', '', '', '']);
  const [ishikawa, setIshikawa] = useState({
    MAIN_DOEUVRE: '', METHODE: '', MILIEU: '', MATERIEL: '', MATIERE: '',
  });

  const loadNCs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/non-conformites');
      const data = res.data?.data || res.data || [];
      // On ne garde que les dossiers en attente d'analyse
      setNcList(data.filter((nc: any) => nc.NC_Statut === 'OUVERT' || nc.NC_Statut === 'ANALYSE'));
    } catch {
      toast.error('RUPTURE DU KERNEL : IMPOSSIBLE DE RÉCUPÉRER LES ÉCARTS');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadNCs(); }, [loadNCs]);

  const handleSelectNc = (nc: any) => {
    setSelectedNc(nc);
    try {
      // ✅ SÉCURISATION : Tentative de parsing JSON, sinon fallback texte
      const diagData = JSON.parse(nc.NC_Diagnostic || '{}');
      setWhys(diagData.whys || ['', '', '', '', '']);
      setIshikawa(diagData.ishikawa || { MAIN_DOEUVRE: '', METHODE: '', MILIEU: '', MATERIEL: '', MATIERE: '' });
    } catch {
      setWhys(['', '', '', '', '']);
      setIshikawa({ MAIN_DOEUVRE: '', METHODE: '', MILIEU: '', MATERIEL: '', MATIERE: '' });
    }
  };

  const handleSave = async () => {
    if (!selectedNc) return;
    setIsSaving(true);
    const tid = toast.loading('SCELLAGE DE L\'INVESTIGATION §10.2...');

    try {
      // ✅ STRUCTURE : On stocke en JSON propre pour la pérennité des données
      const diagnosticPayload = JSON.stringify({ whys, ishikawa });
      
      await apiClient.patch(`/non-conformites/${selectedNc.NC_Id}`, {
        NC_Diagnostic: diagnosticPayload,
        NC_Statut: 'ANALYSE',
      });

      toast.success('INVESTIGATION SCELLÉE DANS LE REGISTRE', { id: tid });
      loadNCs();
      setSelectedNc(null);
    } catch { 
      toast.error('ÉCHEC DU SCELLAGE STRATÉGIQUE', { id: tid }); 
    } finally { 
      setIsSaving(false); 
    }
  };

  if (loading && ncList.length === 0) return <LoadingMatrix label="Sync. Laboratoire de Qualité..." />;

  return (
    <div className="h-dvh bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 select-none">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE */}
      <header className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0B0F1A]/60 backdrop-blur-2xl z-50 mt-12 lg:mt-0 shrink-0">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="bg-indigo-600/20 text-indigo-500 border border-indigo-500/30 px-3 py-1 rounded-lg text-[8px] tracking-[0.3em]">ISO 9001 §10.2</span>
            <Activity size={14} className="text-indigo-500 animate-pulse" />
          </div>
          <h1 className="text-4xl lg:text-5xl tracking-tighter m-0 italic">Causes <span className="text-indigo-600">Racines</span></h1>
        </div>
        <button 
          disabled={!selectedNc || isSaving} 
          onClick={handleSave} 
          className="bg-indigo-600 hover:bg-white hover:text-indigo-950 px-10 py-5 rounded-4xl text-[10px] shadow-4xl border-none cursor-pointer text-white italic transition-all flex items-center gap-3 disabled:opacity-20 uppercase tracking-[0.4em]"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} Sceller l&apos;Analyse
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 📋 REGISTRE (Isolated Scroll) */}
        <aside className="w-full lg:w-96 bg-[#0B1222]/50 border-r border-white/5 flex flex-col shrink-0">
          <div className="p-6 bg-black/20 border-b border-white/5 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 tracking-widest italic">Files d&apos;attente ({ncList.length})</span>
            <Search size={14} className="text-slate-700" />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {ncList.map((nc) => (
              <button 
                key={nc.NC_Id} 
                onClick={() => handleSelectNc(nc)} 
                className={cn(
                  "w-full p-8 text-left transition-all border-l-4 border-y-0 border-r-0 cursor-pointer flex items-center justify-between group", 
                  selectedNc?.NC_Id === nc.NC_Id ? "bg-indigo-600/10 border-indigo-600" : "bg-transparent border-transparent hover:bg-white/5"
                )}
              >
                <div className="space-y-3 overflow-hidden">
                  <span className="text-[8px] text-slate-600 font-bold italic tracking-widest">ID-{nc.NC_Id.slice(0, 8)}</span>
                  <p className="text-sm font-black m-0 truncate group-hover:text-indigo-400 transition-colors uppercase italic">{nc.NC_Libelle}</p>
                </div>
                <ChevronRight size={18} className={cn("transition-transform", selectedNc?.NC_Id === nc.NC_Id ? "text-indigo-500 translate-x-2" : "text-slate-800")} />
              </button>
            ))}
          </div>
        </aside>

        {/* 🔬 WORKSPACE D'INVESTIGATION (Internal Scroll) */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12 relative bg-[#0B0F1A]">
          {!selectedNc ? (
            <div className="h-full flex flex-col items-center justify-center opacity-10 gap-8 italic">
              <Microscope size={120} strokeWidth={1} className="text-slate-500" />
              <p className="text-2xl tracking-[0.5em] font-black text-center uppercase">Sélectionnez un écart <br/>pour scanner les causes</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-8 duration-700 pb-20">
              {/* ÉNONCÉ DE L'ÉCART */}
              <section className="bg-indigo-600/5 border-2 border-indigo-500/20 p-10 rounded-[3rem] shadow-4xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none rotate-12">
                  <AlertOctagon size={150} />
                </div>
                <h3 className="text-indigo-500 text-[10px] tracking-widest mb-6 flex items-center gap-3 italic font-black uppercase"><Target size={18}/> Diagnostic de l&apos;Écart</h3>
                <p className="text-2xl md:text-4xl font-black italic m-0 uppercase leading-none tracking-tighter text-white">{selectedNc.NC_Libelle}</p>
                <div className="mt-8 p-6 bg-black/40 rounded-2xl text-slate-400 italic font-bold uppercase text-[10px] leading-relaxed border border-white/5">{selectedNc.NC_Description}</div>
              </section>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* 🔢 CHAÎNE DES 5 POURQUOI */}
                <section className="bg-[#151B2B] border-2 border-white/5 p-12 rounded-[4rem] shadow-4xl space-y-10 text-left">
                  <h3 className="text-indigo-500 text-[10px] tracking-widest m-0 flex items-center gap-3 italic font-black uppercase"><Zap size={18}/> Séquençage des 5 Pourquoi</h3>
                  <div className="space-y-6">
                    {whys.map((w, i) => (
                      <div key={i} className="flex items-center gap-6 group">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-[11px] font-black transition-all shrink-0", 
                          w.trim() ? "bg-indigo-600 text-white shadow-4xl" : "bg-slate-900 text-slate-700 border border-white/5"
                        )}>
                          {i + 1}
                        </div>
                        <input 
                          value={w} 
                          onChange={(e) => { const n = [...whys]; n[i] = e.target.value; setWhys(n); }} 
                          placeholder={`Cause niveau ${i + 1}...`} 
                          className="flex-1 bg-black/40 border-2 border-white/5 rounded-2xl p-5 text-[11px] font-black uppercase text-white outline-none focus:border-indigo-600 italic shadow-inner transition-all" 
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* 🐟 ISHIKAWA (5M) */}
                <section className="bg-[#151B2B] border-2 border-white/5 p-12 rounded-[4rem] shadow-4xl space-y-10 text-left">
                  <h3 className="text-emerald-500 text-[10px] tracking-widest m-0 flex items-center gap-3 italic font-black uppercase"><GitBranch size={18}/> Modèle Ishikawa (5M)</h3>
                  <div className="grid grid-cols-1 gap-6">
                    {[
                      { k: 'MAIN_DOEUVRE', l: "Main d'œuvre", icon: '👤', color: 'indigo' },
                      { k: 'METHODE', l: "Méthode / Process", icon: '⚙️', color: 'blue' },
                      { k: 'MATERIEL', l: "Équipement / Matériel", icon: '🛠️', color: 'amber' },
                      { k: 'MATIERE', l: "Matière / Intrants", icon: '📦', color: 'emerald' },
                      { k: 'MILIEU', l: "Environnement / Milieu", icon: '🌐', color: 'purple' },
                    ].map((m) => (
                      <div key={m.k} className="space-y-3">
                        <label className="text-[9px] font-black text-slate-500 ml-6 tracking-widest uppercase italic">{m.icon} {m.l}</label>
                        <textarea 
                          value={(ishikawa as any)[m.k]} 
                          onChange={(e) => setIshikawa({ ...ishikawa, [m.k]: e.target.value })} 
                          className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-6 text-[11px] font-black uppercase text-slate-300 outline-none focus:border-white/10 italic shadow-inner h-24 resize-none transition-all" 
                        />
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}
        </main>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function LoadingMatrix({ label }: { label: string }) {
  return (
    <div className="h-dvh w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-indigo-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={64} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed m-0">{label}</span>
    </div>
  );
}