/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🔬 MODULE : RootCauseAnalysisPage.tsx
 * ---------------------------------------------------------------------------
 * RÔLE : Investigation profonde des écarts (5 Pourquoi & Ishikawa).
 * RÉPARATION : Pivot NC_Code -> NC_Id (Correction Build Turbopack).
 * SÉCURITÉ : Zéro NextAuth (Store Zustand + apiClient).
 * RÉVISION : 03 Mars 2026 | 15:55 GMT
 * ---------------------------------------------------------------------------
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import {
  AlertOctagon, GitBranch, Info, Loader2,
  Microscope, Save, Zap, Search
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { NonConformite, NCStatus as NCStatusEnum } from '@/types/elite-sde';

// --- UTILITAIRE DE CLASSES ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

interface IshikawaData {
  MAIN_DOEUVRE: string;
  METHODE: string;
  MILIEU: string;
  MATERIEL: string;
  MATIERE: string;
}

export default function RootCauseAnalysisPage() {
  const [ncList, setNcList] = useState<NonConformite[]>([]);
  const [selectedNc, setSelectedNc] = useState<NonConformite | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [whys, setWhys] = useState<string[]>(['', '', '', '', '']);
  const [ishikawa, setIshikawa] = useState<IshikawaData>({
    MAIN_DOEUVRE: '', METHODE: '', MILIEU: '', MATERIEL: '', MATIERE: '',
  });

  // --- 📡 SYNCHRONISATION KERNEL ---
  const loadNCs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/non-conformites');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      
      // ISO Filter : Uniquement les NC en phase de détection ou analyse
      const pendingNCs = data.filter(
        (nc: NonConformite) => nc.NC_Statut !== NCStatusEnum.CLOTURE && nc.NC_Statut !== NCStatusEnum.VERIFICATION
      );
      setNcList(pendingNCs);
    } catch (err) {
      toast.error('Rupture de flux avec le Kernel.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNCs(); }, [loadNCs]);

  // --- DÉ-SÉRIALISATION DU DIAGNOSTIC ---
  const handleSelectNc = (nc: NonConformite) => {
    setSelectedNc(nc);
    const diag = nc.NC_Diagnostic || '';
    
    // Extraction des 5 Pourquoi
    const whysMatch = diag.match(/5 Pourquoi\s*:\s*([\s\S]+?)(?:\r?\n\s*\r?\n|$)/);
    const parsedWhys = whysMatch ? whysMatch[1].split(' -> ').map(w => w.trim()) : [];
    setWhys(Array.from({ length: 5 }, (_, i) => parsedWhys[i] || ''));

    // Extraction Ishikawa
    const lines = diag.split('\n');
    setIshikawa({
      MAIN_DOEUVRE: lines.find(l => l.includes('Main d\'œuvre'))?.split(': ')[1]?.trim() || '',
      METHODE: lines.find(l => l.includes('Méthode'))?.split(': ')[1]?.trim() || '',
      MILIEU: lines.find(l => l.includes('Milieu'))?.split(': ')[1]?.trim() || '',
      MATERIEL: lines.find(l => l.includes('Matériel'))?.split(': ')[1]?.trim() || '',
      MATIERE: lines.find(l => l.includes('Matière'))?.split(': ')[1]?.trim() || '',
    });
  };

  // --- SÉRIALISATION PRISMA ---
  const formatDiagnostic = () => {
    const whysText = whys.filter(w => w.trim()).length > 0 
      ? `5 Pourquoi : ${whys.filter(w => w.trim()).join(' -> ')}` 
      : '';

    const mList = [
      ishikawa.MAIN_DOEUVRE && `- Main d'œuvre : ${ishikawa.MAIN_DOEUVRE}`,
      ishikawa.METHODE && `- Méthode : ${ishikawa.METHODE}`,
      ishikawa.MILIEU && `- Milieu : ${ishikawa.MILIEU}`,
      ishikawa.MATERIEL && `- Matériel : ${ishikawa.MATERIEL}`,
      ishikawa.MATIERE && `- Matière : ${ishikawa.MATIERE}`,
    ].filter(Boolean);

    const ishikawaText = mList.length > 0 ? `Ishikawa :\n${mList.join('\n')}` : '';
    return [whysText, ishikawaText].filter(Boolean).join('\n\n');
  };

  const handleSaveAnalysis = async () => {
    if (!selectedNc) return;
    setIsSaving(true);
    const tid = toast.loading('Scellage de l\'analyse...');

    try {
      const diag = formatDiagnostic();
      await apiClient.patch(`/non-conformites/${selectedNc.NC_Id}`, {
        NC_Diagnostic: diag,
        NC_Statut: NCStatusEnum.ANALYSE,
      });

      toast.success('Investigation scellée avec succès.', { id: tid });
      loadNCs();
      setSelectedNc(null);
    } catch (err) {
      toast.error('Échec du scellage.', { id: tid });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && ncList.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 lg:p-8 font-sans italic">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* 🔝 HEADER */}
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between border-b border-slate-200 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-700 border border-indigo-100">
                ISO 9001:2015 §10.2
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                {ncList.length} Dossier(s) en attente
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter m-0">Analyse des Causes Racines</h1>
          </div>

          <button
            onClick={handleSaveAnalysis}
            disabled={!selectedNc || isSaving}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-4 text-[12px] font-black uppercase tracking-widest text-white shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-30 border-none cursor-pointer"
          >
            {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            Valider l&apos;Analyse
          </button>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* 📋 REGISTRE DE GAUCHE */}
          <div className="lg:col-span-4 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-175">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-600">Écarts à traiter</h2>
              <Search size={14} className="text-slate-400" />
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {ncList.map((nc) => {
                const isSelected = selectedNc?.NC_Id === nc.NC_Id;
                return (
                  <button
                    key={nc.NC_Id}
                    onClick={() => handleSelectNc(nc)}
                    className={cn(
                      "w-full p-6 text-left transition-all border-l-4 border-y-0 border-r-0 cursor-pointer",
                      isSelected ? "bg-indigo-50/30 border-l-indigo-600" : "bg-white border-l-transparent hover:bg-slate-50"
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        {/* ✅ CORRECTIF : Utilisation du Slice de l'ID pour remplacer NC_Code inexistant */}
                        <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-600 tracking-tighter">
                          NC-{nc.NC_Id.slice(0, 6).toUpperCase()}
                        </span>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                          nc.NC_Gravite === 'CRITIQUE' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {nc.NC_Gravite}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight m-0">{nc.NC_Libelle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 🧪 LABORATOIRE D'ANALYSE */}
          <div className="lg:col-span-8 space-y-6">
            {selectedNc ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                {/* 1. RÉSUMÉ DE L'ÉCART */}
                <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-start gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                    <AlertOctagon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 m-0 uppercase italic tracking-tight">{selectedNc.NC_Libelle}</h3>
                    <p className="mt-3 text-xs font-medium text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {selectedNc.NC_Description}
                    </p>
                  </div>
                </div>

                {/* 2. LES 5 POURQUOI */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                    <Zap size={16} className="text-indigo-600" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-700">Chaîne des 5 Pourquoi</span>
                  </div>
                  <div className="p-8 space-y-4">
                    {whys.map((why, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${why.trim() ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          0{i + 1}
                        </div>
                        <input
                          type="text"
                          value={why}
                          onChange={(e) => {
                            const n = [...whys]; n[i] = e.target.value; setWhys(n);
                          }}
                          placeholder={i === 0 ? "Pourquoi l'écart a-t-il eu lieu ?" : "Pourquoi cela est-il arrivé ?"}
                          className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all italic"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. DIAGRAMME D'ISHIKAWA */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                    <GitBranch size={16} className="text-emerald-600" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-700">Analyse des 5M (Ishikawa)</span>
                  </div>
                  
                  <div className="p-8">
                    {/* Image illustrative ISO */}
                    <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center gap-8">
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Méthode Causes-Effets</p>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">
                          Classez les causes potentielles par familles d&apos;influence pour identifier le levier d&apos;action prioritaire.
                        </p>
                      </div>
                      <div className="w-full md:w-64 h-32 bg-white rounded-xl border border-slate-100 overflow-hidden">
                        
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { k: 'MAIN_DOEUVRE', l: "Main d'œuvre", p: "Formation, fatigue, compétence..." },
                        { k: 'METHODE', l: "Méthode", p: "Instructions, procédures, modes..." },
                        { k: 'MATERIEL', l: "Matériel", p: "Outils, machines, logiciels..." },
                        { k: 'MATIERE', l: "Matière", p: "Intrants, qualité composants, data..." },
                        { k: 'MILIEU', l: "Milieu", p: "Environnement, lumière, espace..." },
                      ].map((m) => (
                        <div key={m.k} className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                             {m.l} <Info size={10} className="opacity-40" />
                          </label>
                          <textarea
                            value={(ishikawa as any)[m.k]}
                            onChange={(e) => setIshikawa({ ...ishikawa, [m.k]: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all h-20 resize-none italic"
                            placeholder={m.p}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-20 bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem] opacity-60">
                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                  <Microscope size={32} className="text-slate-300" />
                </div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest italic">Analyse en attente</h3>
                <p className="text-xs text-slate-500 font-bold max-w-xs text-center mt-3">
                  Sélectionnez un écart dans le registre pour initier l&apos;investigation des causes racines selon les exigences ISO.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}