/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * ⚙️ MODULE : ADMINISTRATION STRUCTURELLE (ISO 9001 §4.4)
 * RÔLE : Configuration des référentiels (Unités, Processus, Risques)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useEffect, useState, useCallback, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { Loader2, Plus, Save, Settings2, Trash2, RefreshCw, Layers, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type TabType = "units" | "processes" | "risks";

export interface OrgUnitType {
  OUT_Id: string;
  OUT_Label: string;
  OUT_Description?: string;
  OUT_IsActive?: boolean;
}

export interface ProcessType {
  PT_Id: string;
  PT_Label: string;
  PT_Color?: string;
  PT_Category?: string;
  PT_IsActive?: boolean;
}

export interface RiskType {
  RT_Id: string;
  RT_Label: string;
  RT_Category?: string;
  RT_IsActive?: boolean;
}

export type ReferenceItem = OrgUnitType | ProcessType | RiskType;

export interface TabConfig {
  endpoint: string;
  title: string;
  label: string;
  key: keyof ReferenceItem;
  idKey: keyof ReferenceItem;
}

export interface FormData {
  label: string;
  color: string;
}

export interface FormErrors {
  label?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const TAB_CONFIGS: Record<TabType, TabConfig> = {
  units: { endpoint: "/org-unit-types", title: "Unités d'Organisation", label: "EX: DIRECTION, ATELIER", key: "OUT_Label", idKey: "OUT_Id" },
  processes: { endpoint: "/process-types", title: "Types de Processus", label: "EX: MÉTIER, SUPPORT", key: "PT_Label", idKey: "PT_Id" },
  risks: { endpoint: "/risk-types", title: "Typologies de Risques", label: "EX: QUALITÉ, ENVIRONNEMENT", key: "RT_Label", idKey: "RT_Id" },
};

const DEFAULT_FORM: FormData = { label: "", color: "#2563eb" };

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : TAB BUTTON
// ============================================================================

interface TabButtonProps {
  tab: TabType;
  activeTab: TabType;
  onClick: (tab: TabType) => void;
  title: string;
}

function TabButton({ tab, activeTab, onClick, title }: TabButtonProps) {
  return (
    <button 
      type="button"
      onClick={() => onClick(tab)} 
      className={cn(
        "px-4 md:px-6 lg:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] transition-all border-none cursor-pointer italic uppercase whitespace-nowrap tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400",
        activeTab === tab ? "bg-blue-600 text-white shadow-xl" : "bg-white text-slate-400 hover:text-blue-400"
      )}
      role="tab"
      aria-selected={activeTab === tab}
      aria-controls={`${tab}-panel`}
    >
      {title}
    </button>
  );
}

// ============================================================================
// SOUS-COMPOSANT : DATA ROW
// ============================================================================

interface DataRowProps {
  item: ReferenceItem;
  idKey: keyof ReferenceItem;
  labelKey: keyof ReferenceItem;
  isProcessTab: boolean;
  onDelete: (id: string) => void;
}

function DataRow({ item, idKey, labelKey, isProcessTab, onDelete }: DataRowProps) {
  const id = item[idKey] as string;
  const label = item[labelKey] as string;
  const color = isProcessTab ? (item as ProcessType).PT_Color : undefined;

  return (
    <tr className="group hover:bg-blue-50/30 transition-all italic focus-within:bg-blue-50/30 focus:outline-none" role="row">
      <td className="p-4 md:p-6" role="gridcell">
        <div className="flex items-center gap-3 md:gap-4 lg:gap-5">
          {isProcessTab && color && (
            <div 
              className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl border-2 border-white shadow-sm shrink-0" 
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
          )}
          <span className="text-[11px] md:text-sm font-black text-slate-800 uppercase tracking-tighter truncate">
            {label}
          </span>
        </div>
      </td>
      <td className="p-4 md:p-6 text-right" role="gridcell">
        <button 
          type="button"
          onClick={() => onDelete(id)} 
          className="p-2 md:p-3 lg:p-4 bg-white border border-slate-100 rounded-lg md:rounded-xl lg:rounded-2xl text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all border-none cursor-pointer opacity-100 lg:opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label={`Supprimer ${label}`}
          title="Supprimer"
        >
          <Trash2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
        </button>
      </td>
    </tr>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("units");
  const [data, setData] = useState<ReferenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const config = TAB_CONFIGS[activeTab];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<ReferenceItem[]>(config.endpoint);
      const content = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      setData(content);
    } catch (error) {
      console.error('❌ Erreur chargement référentiel:', error);
      toast.error("ÉCHEC KERNEL : Synchronisation référentiel interrompue.");
    } finally { 
      setLoading(false); 
    }
  }, [activeTab, config.endpoint]);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.label.trim()) {
      errors.label = "Le libellé est obligatoire";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      toast.warning("Libellé obligatoire.");
      return;
    }
    
    setSubmitting(true);
    const toastId = toast.loading("Injection système...");
    try {
      const payload: Record<string, string> = { [config.key]: formData.label.toUpperCase().trim() };
      if (activeTab === "processes" && formData.color) {
        payload.PT_Color = formData.color;
      }
      await apiClient.post(config.endpoint, payload);
      setFormData(DEFAULT_FORM);
      setFormErrors({});
      fetchData();
      toast.success("Référentiel SMI mis à jour.", { id: toastId });
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "Erreur d'écriture serveur.", { id: toastId });
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ Impact potentiel sur la traçabilité. Confirmer la révocation ?")) return;
    const toastId = toast.loading("Révocation en cours...");
    try {
      await apiClient.delete(`${config.endpoint}/${id}`);
      fetchData();
      toast.success("Option révoquée.", { id: toastId });
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "Contrainte d'intégrité : Option utilisée dans un processus actif.", { id: toastId });
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setFormData(DEFAULT_FORM);
    setFormErrors({});
  };

  const handleFormKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const updateForm = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  if (loading && data.length === 0 && typeof window !== 'undefined') {
    return <LoadingScreen label="Synchronisation Configuration SMI..." />;
  }

  const tabs: TabType[] = ["units", "processes", "risks"];

  return (
    <div className="h-screen bg-slate-50 text-slate-900 italic font-sans flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/20">
      <Toaster position="top-right" richColors closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-slate-200 bg-white flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <span className="bg-blue-600 text-white px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black italic shadow-lg uppercase tracking-widest">
              ISO 9001 §4.4
            </span>
            <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl tracking-tighter leading-none m-0 italic flex items-center gap-3 md:gap-4 uppercase">
              <Settings2 className="text-blue-400 w-8 h-8 md:w-10 md:h-10" aria-hidden="true" /> 
              Paramétrage <span className="text-blue-400">Structure</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[9px] md:text-[10px] tracking-widest m-0">
            Architecture Normative • Configuration des Référentiels SMI
          </p>
        </div>
        <nav 
          className="flex overflow-x-auto gap-2 md:gap-3 w-full xl:w-auto p-2 bg-slate-100 rounded-xl md:rounded-2xl lg:rounded-3xl border border-slate-200" 
          role="tablist" 
          aria-label="Navigation des onglets de configuration"
        >
          {tabs.map((tab) => (
            <TabButton 
              key={tab} 
              tab={tab} 
              activeTab={activeTab} 
              onClick={handleTabChange} 
              title={TAB_CONFIGS[tab].title} 
            />
          ))}
        </nav>
      </header>

      {/* 🧩 MAIN CONTENT */}
      <main className="flex-1 overflow-hidden px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
        
        {/* FORMULAIRE */}
        <section className="lg:col-span-4 bg-white p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3rem] border-2 border-slate-100 shadow-xl flex flex-col gap-6 md:gap-8 lg:gap-10" aria-labelledby="form-title">
          <h2 id="form-title" className="text-base md:text-lg font-black italic m-0 flex items-center gap-3 md:gap-4 text-slate-900 uppercase">
            <Plus className="text-blue-400 w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" /> 
            Ajouter <span className="text-blue-400">{activeTab}</span>
          </h2>
          <form onSubmit={handleAdd} onKeyDown={handleFormKeyDown} className="space-y-4 md:space-y-5 lg:space-y-6">
            <div className="space-y-2 md:space-y-3 text-left">
              <label htmlFor="item-label" className="text-[9px] md:text-[10px] font-black text-slate-400 ml-2 md:ml-4 tracking-widest italic uppercase block">
                Libellé Radical *
              </label>
              <input 
                id="item-label"
                placeholder={config.label} 
                className={cn(
                  "w-full bg-slate-50 border-2 rounded-2xl md:rounded-3xl p-4 md:p-5 lg:p-6 text-[11px] md:text-sm font-black text-slate-900 outline-none focus:border-blue-500 italic uppercase shadow-inner",
                  formErrors.label ? "border-red-500/50" : "border-slate-100"
                )}
                value={formData.label} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('label', e.target.value)}
                aria-required="true"
                aria-invalid={!!formErrors.label}
              />
              {formErrors.label && (
                <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.label}
                </p>
              )}
            </div>
            {activeTab === "processes" && (
              <div className="space-y-2 md:space-y-3 text-left">
                <label htmlFor="item-color" className="text-[9px] md:text-[10px] font-black text-slate-400 ml-2 md:ml-4 tracking-widest italic uppercase block">
                  Identité Visuelle
                </label>
                <input 
                  id="item-color"
                  type="color" 
                  className="w-full h-12 md:h-14 lg:h-16 rounded-xl md:rounded-2xl lg:rounded-3xl cursor-pointer bg-white border-2 border-slate-100 p-1 md:p-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400" 
                  value={formData.color} 
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('color', e.target.value)}
                  aria-label="Sélecteur de couleur"
                />
              </div>
            )}
            <button 
              type="submit"
              disabled={submitting} 
              className={cn(
                "w-full py-4 md:py-5 lg:py-6 bg-slate-900 text-white rounded-xl md:rounded-2xl lg:rounded-3xl font-black text-[10px] md:text-[11px] tracking-widest italic shadow-xl border-none cursor-pointer hover:bg-blue-600 transition-all flex items-center justify-center gap-3 md:gap-4 uppercase focus:outline-none focus:ring-2 focus:ring-blue-400",
                submitting && "opacity-50 cursor-not-allowed"
              )}
              aria-busy={submitting}
            >
              {submitting ? (
                <><Loader2 size={16} className="w-4 h-4 md:w-5 md:h-5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">INJECTION...</span></>
              ) : (
                <><Save size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> <span className="hidden sm:inline">Injecter dans le Noyau</span></>
              )}
            </button>
          </form>
        </section>

        {/* REGISTRE */}
        <section className="lg:col-span-8 bg-white rounded-2xl md:rounded-3xl lg:rounded-[3rem] border-2 border-slate-100 shadow-xl overflow-hidden flex flex-col" aria-labelledby="registry-title">
          <header className="p-4 md:p-6 lg:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 id="registry-title" className="text-[11px] md:text-sm font-black italic m-0 uppercase flex items-center gap-2 md:gap-3 tracking-widest">
              <Layers className="text-blue-400 w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" aria-hidden="true" /> 
              Référentiel Actif
            </h2>
            <button 
              type="button"
              onClick={fetchData} 
              disabled={loading}
              className="p-2 md:p-3 bg-white border border-slate-200 rounded-lg md:rounded-xl text-slate-400 hover:text-blue-400 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              aria-label="Actualiser le référentiel"
            >
              <RefreshCw size={16} className={cn("w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5", loading ? "animate-spin" : "")} aria-hidden="true" />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6" role="region" aria-label="Liste des éléments du référentiel">
            <table className="w-full text-left border-collapse" role="table">
              <tbody className="divide-y divide-slate-50">
                {data.length > 0 ? data.map((item) => (
                  <DataRow 
                    key={item[config.idKey] as string} 
                    item={item} 
                    idKey={config.idKey} 
                    labelKey={config.key} 
                    isProcessTab={activeTab === "processes"}
                    onDelete={handleDelete} 
                  />
                )) : (
                  <tr>
                    <td colSpan={2} className="p-8 md:p-12 lg:p-16 text-center text-slate-500" role="status">
                      <Layers size={48} className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 opacity-20" aria-hidden="true" />
                      <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                        Aucun élément dans ce référentiel
                      </p>
                      <p className="text-[9px] md:text-[10px] text-slate-400 mt-2">
                        Utilisez le formulaire pour ajouter un élément
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}