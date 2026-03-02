/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🔬 MODULE : ANALYSE DES CAUSES RACINES (ROOT CAUSE ANALYSIS)
 * ---------------------------------------------------------------------------
 * RÔLE : Traitement des non-conformités (ISO 9001 §10.2.1.b) via 5 Pourquoi & 5M.
 * ARCHITECTURE : Zéro NextAuth (100% apiClient), ClickUp Style Design.
 * CONFORMITÉ : Sérialisation 100% compatible Prisma (champ NC_Diagnostic).
 * DATE DE RÉVISION : 02 Mars 2026 | 13:48 GMT
 * ---------------------------------------------------------------------------
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import {
  AlertOctagon,
  FileSearch,
  GitBranch,
  Info,
  Loader2,
  Microscope,
  Save,
  Target,
  Zap,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import type { NonConformite } from '@/types/elite-sde';
import { NCStatus as NCStatusEnum } from '@/types/elite-sde';

// --- UTILITAIRE DE CLASSES ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

// --- STRUCTURE DE DONNÉES LOCALES ---
interface IshikawaData {
  MAIN_DOEUVRE: string;
  METHODE: string;
  MILIEU: string;
  MATERIEL: string;
  MATIERE: string;
}

export default function RootCauseAnalysisPage() {
  // --- ÉTATS SCELLÉS ---
  const [ncList, setNcList] = useState<NonConformite[]>([]);
  const [selectedNc, setSelectedNc] = useState<NonConformite | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // États de l'investigation
  const [whys, setWhys] = useState<string[]>(['', '', '', '', '']);
  const [ishikawa, setIshikawa] = useState<IshikawaData>({
    MAIN_DOEUVRE: '', METHODE: '', MILIEU: '', MATERIEL: '', MATIERE: '',
  });

  // --- 📡 SYNCHRONISATION MATRIX ---
  const loadNCs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/non-conformites');
      const data = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      
      // Filtre de conformité ISO : Uniquement les NC ouvertes nécessitant une analyse
      const openNCs = data.filter(
        (nc: NonConformite) => nc.NC_Statut !== NCStatusEnum.CLOTURE && nc.NC_Statut !== NCStatusEnum.VERIFICATION
      );
      setNcList(openNCs);
    } catch (err: unknown) {
      console.error('[ROOT_CAUSE] Rupture de flux:', err);
      toast.error('Échec de la synchronisation des non-conformités.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNCs();
  }, [loadNCs]);

  // --- SÉLECTION & DÉ-SÉRIALISATION ---
  const handleSelectNc = (nc: NonConformite) => {
    setSelectedNc(nc);
    const diagnostic = nc.NC_Diagnostic || '';
    setWhys(parseWhysFromDiagnostic(diagnostic));
    setIshikawa(parseIshikawaFromDiagnostic(diagnostic));
  };

  const parseWhysFromDiagnostic = (diagnostic: string): string[] => {
    const whysMatch = diagnostic.match(/5 Pourquoi\s*:\s*([\s\S]+?)(?:\r?\n\s*\r?\n|$)/);
    const parsedArray = whysMatch && whysMatch[1] ? whysMatch[1].split(' -> ').map(w => w.trim()) : [];
    // Garantir un tableau de 5 éléments
    return Array.from({ length: 5 }, (_, i) => parsedArray[i] || '');
  };

  const parseIshikawaFromDiagnostic = (diagnostic: string): IshikawaData => {
    const ishikawaMatch = diagnostic.match(/Ishikawa\s*:\s*([\s\S]+?)(?=\n\s*\n|\n[A-Z].*?:|$)/);
    if (ishikawaMatch && ishikawaMatch[1]) {
      const lines = ishikawaMatch[1].split('\n');
      return {
        MAIN_DOEUVRE: lines.find(l => l.includes('Main d\'œuvre'))?.split(/:\s*(.+)/)[1]?.trim() || '',
        METHODE: lines.find(l => l.includes('Méthode'))?.split(/:\s*(.+)/)[1]?.trim() || '',
        MILIEU: lines.find(l => l.includes('Milieu'))?.split(/:\s*(.+)/)[1]?.trim() || '',
        MATERIEL: lines.find(l => l.includes('Matériel'))?.split(/:\s*(.+)/)[1]?.trim() || '',
        MATIERE: lines.find(l => l.includes('Matière'))?.split(/:\s*(.+)/)[1]?.trim() || '',
      };
    }
    return { MAIN_DOEUVRE: '', METHODE: '', MILIEU: '', MATERIEL: '', MATIERE: '' };
  };

  // --- SÉRIALISATION POUR PRISMA ---
  const formatDiagnostic = (): string => {
    const filteredWhys = whys.filter(w => w.trim());
    const whysText = filteredWhys.length > 0 ? `5 Pourquoi: ${filteredWhys.join(' -> ')}` : '';

    const mList = [];
    if (ishikawa.MAIN_DOEUVRE) mList.push(`- Main d'œuvre: ${ishikawa.MAIN_DOEUVRE}`);
    if (ishikawa.METHODE) mList.push(`- Méthode: ${ishikawa.METHODE}`);
    if (ishikawa.MILIEU) mList.push(`- Milieu: ${ishikawa.MILIEU}`);
    if (ishikawa.MATERIEL) mList.push(`- Matériel: ${ishikawa.MATERIEL}`);
    if (ishikawa.MATIERE) mList.push(`- Matière: ${ishikawa.MATIERE}`);
    
    const ishikawaText = mList.length > 0 ? `Ishikawa:\n${mList.join('\n')}` : '';

    return [whysText, ishikawaText].filter(Boolean).join('\n\n');
  };

  // --- 💾 SAUVEGARDE DE L'INVESTIGATION ---
  const handleSaveAnalysis = async () => {
    if (!selectedNc) return toast.warning('Veuillez sélectionner une non-conformité.');
    if (!whys[0].trim()) return toast.warning('Le premier "Pourquoi" est obligatoire pour l\'investigation.');

    setIsSaving(true);
    const tid = toast.loading('Scellage de l\'investigation dans le Kernel...');
    
    try {
      const diagnostic = formatDiagnostic();
      await apiClient.patch(`/non-conformites/${selectedNc.NC_Id}`, {
        NC_Diagnostic: diagnostic,
        NC_Statut: NCStatusEnum.ANALYSE,
      });

      toast.success('Analyse des causes racines validée.', { id: tid });
      loadNCs(); // Refresh to update status
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Échec de la validation de l\'analyse.', { id: tid });
    } finally {
      setIsSaving(false);
    }
  };

  // --- ÉCRAN DE CHARGEMENT ---
  if (loading && ncList.length === 0) {
    return (
      <div className="ml-0 lg:ml-72 flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" strokeWidth={2} />
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600 animate-pulse">Initialisation Matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-0 lg:ml-72 bg-[#F8FAFC] min-h-screen p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-7xl space-y-6 lg:space-y-8">
        
        {/* 🔝 HEADER STRATÉGIQUE (ClickUp Style) */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-indigo-100/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-800 border border-indigo-200">
                ISO 9001:2015 §10.2.1.b
              </span>
              <span className="rounded-md bg-slate-200/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-300">
                {ncList.length} Investigation{ncList.length > 1 ? 's' : ''} Active{ncList.length > 1 ? 's' : ''}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight m-0">Analyse des Causes Racines</h1>
            <p className="text-sm text-slate-500 font-medium max-w-2xl m-0 leading-relaxed">
              Identification des causes fondamentales des écarts via les méthodologies reconnues des 5 Pourquoi et du diagramme d&apos;Ishikawa (5M).
            </p>
          </div>

          <button
            onClick={handleSaveAnalysis}
            disabled={!selectedNc || isSaving || !whys[0]?.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 text-[13px] font-black uppercase tracking-wide text-white shadow-[0_8px_16px_rgba(79,70,229,0.2)] hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-full sm:w-auto shrink-0"
          >
            {isSaving ? (
              <><Loader2 className="mr-3 h-4 w-4 animate-spin" /> Validation...</>
            ) : (
              <><Save className="mr-3 h-4 w-4" /> Sceller l&apos;Analyse</>
            )}
          </button>
        </header>

        {/* 🧪 LABORATOIRE D'ANALYSE */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          
          {/* COLONNE 1 : SÉLECTION DE LA NC (Sidebar interne) */}
          <div className="lg:col-span-4 flex flex-col h-[calc(100vh-14rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 shrink-0">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Registre des Écarts</h2>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
              {ncList.length > 0 ? (
                ncList.map((nc) => {
                  const isSelected = selectedNc?.NC_Id === nc.NC_Id;
                  const graviteColors = {
                    CRITIQUE: 'text-rose-700 bg-rose-50 border-rose-200',
                    MAJEURE: 'text-amber-700 bg-amber-50 border-amber-200',
                    MINEURE: 'text-blue-700 bg-blue-50 border-blue-200'
                  };
                  const gColor = graviteColors[nc.NC_Gravite as keyof typeof graviteColors] || graviteColors.MINEURE;

                  return (
                    <button
                      key={nc.NC_Id}
                      onClick={() => handleSelectNc(nc)}
                      className={cn(
                        'w-full px-5 py-4 text-left transition-all duration-200 cursor-pointer border-l-4',
                        isSelected
                          ? 'bg-indigo-50/50 border-l-indigo-600'
                          : 'bg-white border-l-transparent hover:bg-slate-50'
                      )}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600 border border-slate-200 tracking-wider">
                            {nc.NC_Code || `NC-${nc.NC_Id.slice(0, 6).toUpperCase()}`}
                          </span>
                          <span className={cn('rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border', gColor)}>
                            {nc.NC_Gravite}
                          </span>
                        </div>
                        <p className={cn('text-sm font-bold line-clamp-2 leading-snug', isSelected ? 'text-indigo-900' : 'text-slate-700')}>
                          {nc.NC_Libelle}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                           <FileSearch className="h-3 w-3" />
                           {new Date(nc.NC_CreatedAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-10 text-center flex flex-col items-center justify-center h-full opacity-60">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <AlertOctagon className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Registre Vide</h3>
                  <p className="mt-2 text-xs text-slate-500 font-medium">Toutes les non-conformités ont été analysées ou clôturées.</p>
                </div>
              )}
            </div>
          </div>

          {/* COLONNES 2-3 : FORMULAIRE D'ANALYSE */}
          <div className="lg:col-span-8 space-y-6">
            {selectedNc ? (
              <>
                {/* CONTEXTE DE LA NC */}
                <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 sm:p-8 animate-in fade-in duration-300">
                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 text-rose-600">
                      <AlertOctagon className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-black text-slate-900 leading-tight">{selectedNc.NC_Libelle}</h2>
                      <p className="mt-2 text-sm font-medium text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                        &quot;{selectedNc.NC_Description}&quot;
                      </p>
                    </div>
                  </div>
                </div>

                {/* MÉTHODE DES 5 POURQUOI */}
                <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                  <div className="border-b border-slate-100 bg-slate-50/50 px-6 sm:px-8 py-5 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Zap className="h-5 w-5" /></div>
                    <div>
                      <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Méthodologie des 5 Pourquoi</h2>
                      <p className="text-[11px] font-medium text-slate-500 mt-1">Identifiez la cause racine par investigation en cascade.</p>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8 space-y-5">
                    {whys.map((why, index) => (
                      <div key={index} className="flex gap-4 items-start group">
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-black text-xs transition-colors",
                          why.trim() ? "bg-indigo-600 text-white shadow-md" : "bg-slate-100 text-slate-400 border border-slate-200"
                        )}>
                          0{index + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block">
                            Pourquoi {index === 0 ? 'l\'écart s\'est-il produit' : 'cela est-il arrivé'} ?
                          </label>
                          <input
                            type="text"
                            value={why}
                            onChange={(e) => {
                              const newWhys = [...whys];
                              newWhys[index] = e.target.value;
                              setWhys(newWhys);
                            }}
                            className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 transition-colors hover:border-indigo-300 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-600/10"
                            placeholder={index === 0 ? 'Ex: Le technicien n\'a pas suivi le protocole...' : 'Ex: Le protocole n\'était pas affiché au poste...'}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DIAGRAMME D'ISHIKAWA (5M) */}
                <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                  <div className="border-b border-slate-100 bg-slate-50/50 px-6 sm:px-8 py-5 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><GitBranch className="h-5 w-5" /></div>
                    <div>
                      <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Diagramme d&apos;Ishikawa (5M)</h2>
                      <p className="text-[11px] font-medium text-slate-500 mt-1">Catégorisation des facteurs d&apos;influence.</p>
                    </div>
                  </div>
                  
                  <div className="p-6 sm:p-8">
                    {/* Apport Pédagogique Visuel */}
                    <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-1">
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-600 mb-2">Comprendre la méthode</p>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Le diagramme de causes et effets classe les causes potentielles par familles. Documentez chaque dimension pertinente ci-dessous pour cartographier l&apos;origine du dysfonctionnement.</p>
                      </div>
                      <div className="w-full md:w-64 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                        

[Image of Ishikawa fishbone diagram]

                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {[
                        { key: 'MAIN_DOEUVRE', label: 'Main d\'œuvre', placeholder: 'Compétence, formation, fatigue...' },
                        { key: 'METHODE', label: 'Méthode', placeholder: 'Procédure, instructions, modes opératoires...' },
                        { key: 'MATERIEL', label: 'Matériel', placeholder: 'Machine, outil, maintenance, logiciel...' },
                        { key: 'MATIERE', label: 'Matière', placeholder: 'Intrants, qualité des composants, données...' },
                        { key: 'MILIEU', label: 'Milieu', placeholder: 'Environnement physique, lumière, espace...' },
                      ].map((factor) => (
                        <div key={factor.key} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-700">
                              {factor.label}
                            </label>
                            <div className="group relative cursor-help">
                              <Info className="h-4 w-4 text-slate-400 hover:text-indigo-500 transition-colors" />
                              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-48 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-[10px] font-medium text-white shadow-xl group-hover:block">
                                {factor.placeholder}
                                <div className="absolute left-1/2 top-full -mt-1 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-800"></div>
                              </div>
                            </div>
                          </div>
                          <textarea
                            value={(ishikawa as any)[factor.key]}
                            onChange={(e) => setIshikawa({ ...ishikawa, [factor.key]: e.target.value })}
                            rows={2}
                            className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 transition-colors hover:border-indigo-300 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-600/10 custom-scrollbar resize-none"
                            placeholder={factor.placeholder}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-16 text-center flex flex-col items-center justify-center min-h-125">
                <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 shadow-inner border border-slate-100">
                  <Microscope className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">En attente d&apos;investigation</h3>
                <p className="mt-2 text-sm text-slate-500 font-medium max-w-sm">
                  Sélectionnez une fiche de non-conformité dans le registre de gauche pour démarrer l&apos;analyse des causes profondes.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}