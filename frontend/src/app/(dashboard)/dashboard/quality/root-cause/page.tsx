/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🔬 MODULE : ROOT CAUSE ANALYSIS (ISO 9001 §10.2)
 * RÔLE : Analyse des causes racines des non-conformités
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useCallback, useEffect, useState, ChangeEvent, KeyboardEvent } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import {
  AlertOctagon, GitBranch, Loader2, Microscope, Save, Zap, 
  Search, RefreshCw, ChevronRight, Activity, Target, ArrowLeft
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type NCStatus = 'OUVERT' | 'ANALYSE' | 'ACTION' | 'CLOTURE';

export interface NonConformite {
  NC_Id: string;
  NC_Libelle: string;
  NC_Description: string;
  NC_Statut: NCStatus;
  NC_Diagnostic?: string;
  NC_CreatedAt: string;
  NC_UpdatedAt: string;
}

export interface IshikawaData {
  MAIN_DOEUVRE: string;
  METHODE: string;
  MILIEU: string;
  MATERIEL: string;
  MATIERE: string;
}

export interface DiagnosticData {
  whys: string[];
  ishikawa: IshikawaData;
}

export interface IshikawaCategory {
  key: keyof IshikawaData;
  label: string;
  icon: string;
  color: 'indigo' | 'blue' | 'amber' | 'emerald' | 'purple';
}

// ============================================================================
// CONSTANTES
// ============================================================================

const ISHIKAWA_CATEGORIES: IshikawaCategory[] = [
  { key: 'MAIN_DOEUVRE', label: "Main d'œuvre", icon: '👤', color: 'indigo' },
  { key: 'METHODE', label: "Méthode / Process", icon: '⚙️', color: 'blue' },
  { key: 'MATERIEL', label: "Équipement / Matériel", icon: '🛠️', color: 'amber' },
  { key: 'MATIERE', label: "Matière / Intrants", icon: '📦', color: 'emerald' },
  { key: 'MILIEU', label: "Environnement / Milieu", icon: '🌐', color: 'purple' },
];

const DEFAULT_WHYS: string[] = ['', '', '', '', ''];
const DEFAULT_ISHIKAWA: IshikawaData = {
  MAIN_DOEUVRE: '',
  METHODE: '',
  MILIEU: '',
  MATERIEL: '',
  MATIERE: '',
};

// ============================================================================
// SOUS-COMPOSANT : LOADING MATRIX
// ============================================================================

function LoadingMatrix({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-indigo-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : WHY INPUT ROW
// ============================================================================

interface WhyInputProps {
  index: number;
  value: string;
  onChange: (value: string) => void;
}

function WhyInputRow({ index, value, onChange }: WhyInputProps) {
  return (
    <div className="flex items-center gap-4 md:gap-6" role="listitem">
      <div 
        className={cn(
          "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-[10px] md:text-[11px] font-black transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-400",
          value.trim() ? "bg-indigo-600 text-white shadow-2xl" : "bg-slate-900 text-slate-700 border border-white/5"
        )}
        aria-label={`Pourquoi ${index + 1}`}
      >
        {index + 1}
      </div>
      <label htmlFor={`why-${index}`} className="sr-only">
        Cause niveau {index + 1}
      </label>
      <input 
        id={`why-${index}`}
        value={value} 
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} 
        placeholder={`Cause niveau ${index + 1}...`} 
        className="flex-1 bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 text-[10px] md:text-[11px] font-black uppercase text-white outline-none focus:border-indigo-500 italic shadow-inner transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
        aria-required="true"
      />
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : ISHIKAWA INPUT
// ============================================================================

interface IshikawaInputProps {
  category: IshikawaCategory;
  value: string;
  onChange: (value: string) => void;
}

function IshikawaInput({ category, value, onChange }: IshikawaInputProps) {
  return (
    <div className="space-y-2 md:space-y-3" role="listitem">
      <label 
        htmlFor={`ishikawa-${category.key}`} 
        className="text-[8px] md:text-[9px] font-black text-slate-500 ml-4 md:ml-6 tracking-widest uppercase italic block"
      >
        <span aria-hidden="true">{category.icon}</span> {category.label}
      </label>
      <textarea 
        id={`ishikawa-${category.key}`}
        value={value} 
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)} 
        className="w-full bg-black/40 border-2 border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-5 lg:p-6 text-[10px] md:text-[11px] font-black uppercase text-slate-300 outline-none focus:border-white/10 italic shadow-inner h-20 md:h-24 resize-none transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder={`Analyse ${category.label.toLowerCase()}...`}
        aria-label={`Analyse ${category.label}`}
      />
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function RootCauseAnalysisPage() {
  const [ncList, setNcList] = useState<NonConformite[]>([]);
  const [selectedNc, setSelectedNc] = useState<NonConformite | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [whys, setWhys] = useState<string[]>(DEFAULT_WHYS);
  const [ishikawa, setIshikawa] = useState<IshikawaData>(DEFAULT_ISHIKAWA);

  const loadNCs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<NonConformite[]>('/non-conformites');
      const data = Array.isArray(res.data) ? res.data : [];
      // On ne garde que les dossiers en attente d'analyse
      setNcList(data.filter((nc) => nc.NC_Statut === 'OUVERT' || nc.NC_Statut === 'ANALYSE'));
    } catch (error) {
      console.error('❌ Erreur chargement NC:', error);
      toast.error('RUPTURE DU KERNEL : IMPOSSIBLE DE RÉCUPÉRER LES ÉCARTS');
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') loadNCs(); }, [loadNCs]);

  const parseDiagnostic = useCallback((diagnostic?: string): DiagnosticData => {
    if (!diagnostic) {
      return { whys: DEFAULT_WHYS, ishikawa: DEFAULT_ISHIKAWA };
    }
    try {
      const parsed = JSON.parse(diagnostic) as DiagnosticData;
      return {
        whys: Array.isArray(parsed.whys) ? parsed.whys : DEFAULT_WHYS,
        ishikawa: parsed.ishikawa || DEFAULT_ISHIKAWA,
      };
    } catch {
      // Fallback: texte brut dans le premier why
      return {
        whys: [diagnostic, ...DEFAULT_WHYS.slice(1)],
        ishikawa: DEFAULT_ISHIKAWA,
      };
    }
  }, []);

  const handleSelectNc = (nc: NonConformite) => {
    setSelectedNc(nc);
    const diagnostic = parseDiagnostic(nc.NC_Diagnostic);
    setWhys(diagnostic.whys);
    setIshikawa(diagnostic.ishikawa);
  };

  const handleWhyChange = useCallback((index: number, value: string) => {
    setWhys(prev => {
      const newWhys = [...prev];
      newWhys[index] = value;
      return newWhys;
    });
  }, []);

  const handleIshikawaChange = useCallback((key: keyof IshikawaData, value: string) => {
    setIshikawa(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    if (!selectedNc) return;
    
    // Validation minimale
    if (whys.every(w => !w.trim())) {
      toast.warning("Veuillez remplir au moins une cause racine");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('SCELLAGE DE L\'INVESTIGATION §10.2...');

    try {
      const diagnosticPayload: DiagnosticData = { whys, ishikawa };
      
      await apiClient.patch(`/non-conformites/${selectedNc.NC_Id}`, {
        NC_Diagnostic: JSON.stringify(diagnosticPayload),
        NC_Statut: 'ANALYSE',
      });

      toast.success('INVESTIGATION SCELLÉE DANS LE REGISTRE', { id: toastId });
      loadNCs();
      setSelectedNc(null);
      setWhys(DEFAULT_WHYS);
      setIshikawa(DEFAULT_ISHIKAWA);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || 'ÉCHEC DU SCELLAGE STRATÉGIQUE', { id: toastId });
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setSelectedNc(null);
    }
  };

  if (loading && ncList.length === 0 && typeof window !== 'undefined') {
    return <LoadingMatrix label="Sync. Laboratoire de Qualité..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full select-none">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0B0F1A]/60 backdrop-blur-2xl z-50 mt-12 lg:mt-0 shrink-0">
        <div className="space-y-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] tracking-widest">
              ISO 9001 §10.2
            </span>
            <Activity size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-indigo-400 animate-pulse" aria-hidden="true" />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter m-0 italic">
            Causes <span className="text-indigo-400">Racines</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-start sm:justify-end">
          {selectedNc && (
            <button 
              type="button"
              onClick={() => setSelectedNc(null)} 
              className="p-2.5 md:p-3 bg-white/5 rounded-xl md:rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Retour à la liste"
            >
              <ArrowLeft size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" />
            </button>
          )}
          <button 
            type="button"
            disabled={!selectedNc || isSaving} 
            onClick={handleSave} 
            className={cn(
              "bg-indigo-600 hover:bg-white hover:text-indigo-700 px-4 md:px-6 lg:px-8 lg:px-10 py-2.5 md:py-3 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] text-[9px] md:text-[10px] shadow-2xl border-none cursor-pointer text-white italic transition-all flex items-center gap-2 md:gap-3 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-400",
              (!selectedNc || isSaving) && "opacity-20 cursor-not-allowed hover:bg-indigo-600 hover:text-white"
            )}
            aria-busy={isSaving}
            aria-label="Enregistrer l'analyse"
          >
            {isSaving ? (
              <><Loader2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">Scellage...</span></>
            ) : (
              <><Save size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" /> <span className="hidden sm:inline">Sceller l&apos;Analyse</span></>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 📋 REGISTRE */}
        <aside 
          className="w-full lg:w-72 md:w-80 lg:w-96 bg-[#0B1222]/50 border-r border-white/5 flex flex-col shrink-0" 
          role="navigation"
          aria-label="Liste des non-conformités"
        >
          <div className="p-4 md:p-6 bg-black/20 border-b border-white/5 flex justify-between items-center">
            <span className="text-[9px] md:text-[10px] text-slate-500 tracking-widest italic">
              Files d&apos;attente ({ncList.length})
            </span>
            <Search size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-700" aria-hidden="true" />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar" role="list">
            {ncList.length > 0 ? ncList.map((nc) => (
              <button 
                key={nc.NC_Id} 
                type="button"
                onClick={() => handleSelectNc(nc)} 
                onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectNc(nc);
                  }
                }}
                className={cn(
                  "w-full p-4 md:p-6 lg:p-8 text-left transition-all border-l-4 border-y-0 border-r-0 cursor-pointer flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-indigo-400",
                  selectedNc?.NC_Id === nc.NC_Id 
                    ? "bg-indigo-600/10 border-indigo-500" 
                    : "bg-transparent border-transparent hover:bg-white/5"
                )}
                role="listitem"
                aria-label={`Non-conformité: ${nc.NC_Libelle}`}
                aria-pressed={selectedNc?.NC_Id === nc.NC_Id}
              >
                <div className="space-y-2 md:space-y-3 overflow-hidden min-w-0">
                  <span className="text-[8px] md:text-[9px] text-slate-600 font-bold italic tracking-widest block truncate">
                    ID-{nc.NC_Id.slice(0, 8)}
                  </span>
                  <p className="text-[10px] md:text-sm font-black m-0 truncate group-hover:text-indigo-400 transition-colors uppercase italic">
                    {nc.NC_Libelle}
                  </p>
                </div>
                <ChevronRight 
                  size={16} 
                  className={cn(
                    "w-4 h-4 md:w-4.5 md:h-4.5 transition-transform shrink-0",
                    selectedNc?.NC_Id === nc.NC_Id 
                      ? "text-indigo-400 translate-x-1 md:translate-x-2" 
                      : "text-slate-800"
                  )} 
                  aria-hidden="true" 
                />
              </button>
            )) : (
              <div className="p-6 md:p-8 text-center text-slate-600" role="status">
                <p className="text-[9px] md:text-[10px] tracking-widest italic">Aucun écart en attente</p>
              </div>
            )}
          </div>
        </aside>

        {/* 🔬 WORKSPACE */}
        <main 
          className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-12 py-4 md:py-6 lg:py-12 relative bg-[#0B0F1A]" 
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {!selectedNc ? (
            <div className="h-full flex flex-col items-center justify-center opacity-10 gap-4 md:gap-6 lg:gap-8 italic" role="status">
              <Microscope size={80} className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 text-slate-500" strokeWidth={1} aria-hidden="true" />
              <p className="text-xl md:text-2xl lg:text-3xl tracking-widest font-black text-center uppercase px-4">
                Sélectionnez un écart
                <br />
                <span className="text-slate-600 text-base md:text-lg lg:text-xl font-black">pour scanner les causes</span>
              </p>
            </div>
          ) : (
            <div className="max-w-[100rem] mx-auto space-y-8 md:space-y-10 lg:space-y-12 animate-in fade-in slide-in-from-right-8 duration-700 pb-16 md:pb-20">
              {/* ÉNONCÉ DE L'ÉCART */}
              <section className="bg-indigo-600/5 border-2 border-indigo-500/20 p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3rem] shadow-2xl relative overflow-hidden" aria-labelledby="nc-title">
                <div className="absolute top-0 right-0 p-6 md:p-8 lg:p-10 opacity-5 pointer-events-none rotate-12" aria-hidden="true">
                  <AlertOctagon size={100} className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36" />
                </div>
                <h3 id="nc-title" className="text-indigo-400 text-[9px] md:text-[10px] tracking-widest mb-4 md:mb-6 flex items-center gap-2 md:gap-3 italic font-black uppercase">
                  <Target size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
                  Diagnostic de l&apos;Écart
                </h3>
                <p className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black italic m-0 uppercase leading-none tracking-tighter text-white truncate">
                  {selectedNc.NC_Libelle}
                </p>
                <div className="mt-4 md:mt-6 lg:mt-8 p-4 md:p-6 bg-black/40 rounded-xl md:rounded-2xl text-slate-400 italic font-bold uppercase text-[9px] md:text-[10px] leading-relaxed border border-white/5 line-clamp-3">
                  {selectedNc.NC_Description}
                </div>
              </section>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
                {/* 🔢 5 POURQUOI */}
                <section className="bg-[#0F172A] border-2 border-white/5 p-6 md:p-8 lg:p-12 rounded-2xl md:rounded-3xl lg:rounded-[4rem] shadow-2xl space-y-6 md:space-y-8 lg:space-y-10 text-left" aria-labelledby="whys-title">
                  <h3 id="whys-title" className="text-indigo-400 text-[9px] md:text-[10px] tracking-widest m-0 flex items-center gap-2 md:gap-3 italic font-black uppercase">
                    <Zap size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
                    Séquençage des 5 Pourquoi
                  </h3>
                  <div className="space-y-4 md:space-y-5 lg:space-y-6" role="list">
                    {whys.map((w, i) => (
                      <WhyInputRow 
                        key={i} 
                        index={i} 
                        value={w} 
                        onChange={(value) => handleWhyChange(i, value)} 
                      />
                    ))}
                  </div>
                </section>

                {/* 🐟 ISHIKAWA (5M) */}
                <section className="bg-[#0F172A] border-2 border-white/5 p-6 md:p-8 lg:p-12 rounded-2xl md:rounded-3xl lg:rounded-[4rem] shadow-2xl space-y-6 md:space-y-8 lg:space-y-10 text-left" aria-labelledby="ishikawa-title">
                  <h3 id="ishikawa-title" className="text-emerald-400 text-[9px] md:text-[10px] tracking-widest m-0 flex items-center gap-2 md:gap-3 italic font-black uppercase">
                    <GitBranch size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
                    Modèle Ishikawa (5M)
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:gap-5 lg:gap-6" role="list">
                    {ISHIKAWA_CATEGORIES.map((m) => (
                      <IshikawaInput 
                        key={m.key} 
                        category={m} 
                        value={ishikawa[m.key]} 
                        onChange={(value) => handleIshikawaChange(m.key, value)} 
                      />
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.3);border-radius:10px}:focus-visible{outline:2px solid #6366f1;outline-offset:2px}`}</style>
    </div>
  );
}