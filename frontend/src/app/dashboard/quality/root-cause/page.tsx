/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🔬 MODULE : ANALYSE DES CAUSES RACINES (ELITE-SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Investigation profonde des écarts (5 Pourquoi & Ishikawa).
 * DESIGN : 100dvh, Split-Pane High-Density, ClickUp Style.
 * PROTOCOLE : SDE Matrix §10.2 — ISO 9001.
 * ---------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 21:30 GMT
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import {
  AlertOctagon, GitBranch, Loader2,
  Microscope, Save, Zap, Search, RefreshCw, ChevronRight
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

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
      // Filtre : Uniquement les NC nécessitant une analyse
      setNcList(data.filter((nc: any) => nc.NC_Statut !== 'CLOTURE' && nc.NC_Statut !== 'VERIFICATION'));
    } catch {
      toast.error('RUPTURE DE FLUX KERNEL');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadNCs(); }, [loadNCs]);

  const handleSelectNc = (nc: any) => {
    setSelectedNc(nc);
    const diag = nc.NC_Diagnostic || '';
    
    // Dé-sérialisation intelligente
    const whysMatch = diag.match(/5 Pourquoi\s*:\s*([\s\S]+?)(?:\n\n|$)/);
    const parsedWhys = whysMatch ? whysMatch[1].split(' -> ').map((w: string) => w.trim()) : [];
    setWhys(Array.from({ length: 5 }, (_, i) => parsedWhys[i] || ''));

    const lines = diag.split('\n');
    setIshikawa({
      MAIN_DOEUVRE: lines.find((l: string) => l.includes('Main d\'œuvre'))?.split(': ')[1] || '',
      METHODE: lines.find((l: string) => l.includes('Méthode'))?.split(': ')[1] || '',
      MILIEU: lines.find((l: string) => l.includes('Milieu'))?.split(': ')[1] || '',
      MATERIEL: lines.find((l: string) => l.includes('Matériel'))?.split(': ')[1] || '',
      MATIERE: lines.find((l: string) => l.includes('Matière'))?.split(': ')[1] || '',
    });
  };

  const handleSave = async () => {
    if (!selectedNc) return;
    setIsSaving(true);
    const tid = toast.loading('SCELLAGE DE L\'INVESTIGATION...');

    try {
      const diag = `5 Pourquoi : ${whys.filter(w => w.trim()).join(' -> ')}\n\nIshikawa :\n- Main d'œuvre : ${ishikawa.MAIN_DOEUVRE}\n- Méthode : ${ishikawa.METHODE}\n- Milieu : ${ishikawa.MILIEU}\n- Matériel : ${ishikawa.MATERIEL}\n- Matière : ${ishikawa.MATIERE}`;
      
      await apiClient.patch(`/non-conformites/${selectedNc.NC_Id}`, {
        NC_Diagnostic: diag,
        NC_Statut: 'ANALYSE',
      });

      toast.success('ANALYSE SCELLÉE DANS LA MATRIX', { id: tid });
      loadNCs();
      setSelectedNc(null);
    } catch { toast.error('ÉCHEC DU SCELLAGE', { id: tid }); }
    finally { setIsSaving(false); }
  };

  if (loading && ncList.length === 0) return <LoadingScreen label="Synchronisation Laboratoire §10.2..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-indigo-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-4">
            <span className="bg-indigo-600/10 border border-indigo-500/20 px-4 py-1 rounded-xl text-[9px] text-indigo-500 tracking-widest">ISO 9001 §10.2</span>
            <span className="text-slate-500 text-[9px] tracking-widest uppercase">{ncList.length} DOSSIER(S) À INVESTIGUER</span>
          </div>
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic">Causes <span className="text-indigo-600">Racines</span></h1>
        </div>
        <button disabled={!selectedNc || isSaving} onClick={handleSave} className="bg-indigo-600 hover:bg-white hover:text-indigo-600 px-10 py-5 rounded-3xl text-[10px] shadow-4xl border-none cursor-pointer text-white italic transition-all flex items-center gap-3 disabled:opacity-20 uppercase tracking-widest">
          {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} Valider l&apos;Analyse
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* 📋 REGISTRE DES ÉCARTS (Isolated Scroll) */}
        <aside className="w-full lg:w-96 bg-[#0B1222] border-r border-white/5 flex flex-col shrink-0 overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-black/20 flex items-center justify-between">
            <h2 className="text-[10px] tracking-widest text-slate-500 m-0">Écarts en suspens</h2>
            <Search size={14} className="text-slate-700" />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {ncList.map((nc) => (
              <button key={nc.NC_Id} onClick={() => handleSelectNc(nc)} className={cn("w-full p-8 text-left transition-all border-l-4 border-y-0 border-r-0 cursor-pointer flex items-center justify-between group", selectedNc?.NC_Id === nc.NC_Id ? "bg-indigo-600/10 border-indigo-600" : "bg-transparent border-transparent hover:bg-white/5")}>
                <div className="space-y-4 overflow-hidden">
                  <span className="text-[9px] px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-slate-500">ID-{nc.NC_Id.slice(0, 6)}</span>
                  <p className="text-sm font-black m-0 truncate group-hover:text-indigo-400 transition-colors uppercase italic">{nc.NC_Libelle}</p>
                </div>
                <ChevronRight size={18} className={cn("transition-transform", selectedNc?.NC_Id === nc.NC_Id ? "text-indigo-500 translate-x-2" : "text-slate-800")} />
              </button>
            ))}
          </div>
        </aside>

        {/* 🔬 WORKSPACE D'INVESTIGATION */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-10 relative">
          {!selectedNc ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 gap-8 italic">
              <Microscope size={120} strokeWidth={1} className="text-slate-700" />
              <p className="text-2xl tracking-[0.3em] font-black text-center uppercase">Sélectionnez un écart <br/> pour démarrer le scan</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-10 duration-500 pb-32">
              {/* Énoncé */}
              <section className="bg-rose-600/5 border-2 border-rose-600/20 p-10 rounded-[3rem] shadow-4xl text-left">
                <h3 className="text-rose-600 text-[10px] tracking-widest mb-6 flex items-center gap-3 italic"><AlertOctagon size={18}/> Diagnostic de l&apos;Écart</h3>
                <p className="text-2xl font-black italic m-0 uppercase leading-tight">{selectedNc.NC_Libelle}</p>
                <div className="mt-8 p-6 bg-black/40 rounded-2xl text-slate-400 italic font-bold uppercase text-[11px] leading-relaxed border border-white/5">{selectedNc.NC_Description}</div>
              </section>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">
                {/* 5 Pourquoi */}
                <section className="bg-[#151B2B] border-2 border-white/5 p-12 rounded-[3.5rem] shadow-4xl space-y-10 text-left">
                  <h3 className="text-indigo-500 text-[10px] tracking-widest m-0 flex items-center gap-3 italic font-black uppercase"><Zap size={18}/> Chaîne des 5 Pourquoi</h3>
                  <div className="space-y-6">
                    {whys.map((w, i) => (
                      <div key={i} className="flex items-center gap-6">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all", w.trim() ? "bg-indigo-600 shadow-4xl" : "bg-slate-900 text-slate-700")}>0{i+1}</div>
                        <input value={w} onChange={(e) => { const n = [...whys]; n[i] = e.target.value; setWhys(n); }} placeholder="Analyser la cause..." className="flex-1 bg-black/40 border-2 border-white/5 rounded-2xl p-4 text-[11px] font-black uppercase text-white outline-none focus:border-indigo-600 italic shadow-inner" />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Ishikawa */}
                <section className="bg-[#151B2B] border-2 border-white/5 p-12 rounded-[3.5rem] shadow-4xl space-y-10 text-left h-full">
                  <h3 className="text-emerald-500 text-[10px] tracking-widest m-0 flex items-center gap-3 italic font-black uppercase"><GitBranch size={18}/> Analyse des 5M (Ishikawa)</h3>
                  <div className="grid grid-cols-1 gap-6">
                    {[
                      { k: 'MAIN_DOEUVRE', l: "Main d'œuvre", color: 'indigo' },
                      { k: 'METHODE', l: "Méthode", color: 'blue' },
                      { k: 'MATERIEL', l: "Matériel", color: 'amber' },
                      { k: 'MATIERE', l: "Matière", color: 'emerald' },
                      { k: 'MILIEU', l: "Milieu", color: 'purple' },
                    ].map((m) => (
                      <div key={m.k} className="space-y-3">
                        <label className="text-[9px] font-black text-slate-500 ml-4 tracking-widest">{m.l}</label>
                        <textarea value={(ishikawa as any)[m.k]} onChange={(e) => setIshikawa({ ...ishikawa, [m.k]: e.target.value })} className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-5 text-[11px] font-black uppercase text-slate-300 outline-none focus:border-white/20 italic shadow-inner h-20 resize-none" />
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

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-indigo-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed">{label}</span>
    </div>
  );
}