/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * ⚖️ MODULE : VEILLE LÉGALE & RÉGLEMENTAIRE §6.1.3 (ISO 9001)
 * RÔLE : Identification des exigences et surveillance de conformité
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useEffect, useState, useCallback, useMemo, ChangeEvent, FormEvent } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { 
  Scale, AlertCircle, Plus, Edit3, Trash2, 
  CheckCircle2, RefreshCcw,
  BookOpen, Target, X, Save, Loader2
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface RegulatoryRequirement {
  RR_Id: string;
  RR_Title: string;
  RR_Description?: string;
  RR_Category: string;
  RR_Type: string;
  RR_Reference: string;
  RR_Authority: string;
  RR_DueDate: string;
  RR_Frequency?: number;
  RR_LastCompliance?: string;
  RR_Status: 'CONFORME' | 'NON_CONFORME' | 'A_EVALUER' | 'EN_ATTENTE';
  RR_Priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  RR_EvidenceUrl?: string;
  RR_Comment?: string;
  RR_IsRecurring: boolean;
  RR_IsActive: boolean;
  RR_CreatedAt: string;
  RR_UpdatedAt: string;
  RR_ProcessusId?: string;
  RR_Processus?: { PR_Id: string; PR_Code: string; PR_Libelle: string };
}

export interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_IsActive?: boolean;
}

interface RequirementFormData {
  RR_Title: string;
  RR_Source: string;
  RR_Category: string;
  RR_Reference: string;
  RR_Authority: string;
  RR_Deadline: string;
  RR_Status: RegulatoryRequirement['RR_Status'];
  RR_Priority: RegulatoryRequirement['RR_Priority'];
  RR_Observations: string;
  RR_ProcessusId: string;
  RR_IsRecurring: boolean;
  RR_Frequency?: number;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCcw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : COMPLIANCE KPI
// ============================================================================

interface ComplianceKPIProps {
  label: string;
  val: string | number;
  icon: React.ElementType;
  color: 'blue' | 'rose' | 'emerald';
  alert?: boolean;
}

function ComplianceKPI({ label, val, icon: Icon, color, alert }: ComplianceKPIProps) {
  const themes: Record<ComplianceKPIProps['color'], string> = { 
    blue: "text-blue-400 border-blue-500/20", 
    rose: "text-rose-400 border-rose-500/20", 
    emerald: "text-emerald-400 border-emerald-500/20" 
  };
  
  return (
    <article className={cn("bg-[#0F172A] p-6 md:p-8 rounded-2xl md:rounded-3xl border-2 flex items-center gap-4 md:gap-6 shadow-2xl focus-within:ring-2 focus-within:ring-blue-400", alert ? "border-rose-500/40 animate-pulse" : "border-white/5")}>
      <div className={cn("p-3 md:p-4 md:p-5 rounded-xl md:rounded-2xl bg-white/5", themes[color])}>
        <Icon size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-[8px] md:text-[9px] text-slate-500 tracking-widest m-0 mb-1 md:mb-2">{label}</p>
        <p className="text-3xl md:text-4xl font-black italic m-0 tracking-tighter leading-none">{val}</p>
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : MODAL FORM
// ============================================================================

interface RequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  processes: Processus[];
  initialData?: RegulatoryRequirement | null;
}

function RequirementModal({ isOpen, onClose, onSuccess, processes, initialData }: RequirementModalProps) {
  const [formData, setFormData] = useState<RequirementFormData>({
    RR_Title: initialData?.RR_Title || '',
    RR_Source: initialData?.RR_Authority || '',
    RR_Category: initialData?.RR_Category || '',
    RR_Reference: initialData?.RR_Reference || '',
    RR_Authority: initialData?.RR_Authority || '',
    RR_Deadline: initialData?.RR_DueDate?.split('T')[0] || '',
    RR_Status: initialData?.RR_Status || 'A_EVALUER',
    RR_Priority: initialData?.RR_Priority || 'MEDIUM',
    RR_Observations: initialData?.RR_Comment || '',
    RR_ProcessusId: initialData?.RR_ProcessusId || '',
    RR_IsRecurring: initialData?.RR_IsRecurring || false,
    RR_Frequency: initialData?.RR_Frequency || undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof RequirementFormData, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        RR_Title: initialData?.RR_Title || '',
        RR_Source: initialData?.RR_Authority || '',
        RR_Category: initialData?.RR_Category || '',
        RR_Reference: initialData?.RR_Reference || '',
        RR_Authority: initialData?.RR_Authority || '',
        RR_Deadline: initialData?.RR_DueDate?.split('T')[0] || '',
        RR_Status: initialData?.RR_Status || 'A_EVALUER',
        RR_Priority: initialData?.RR_Priority || 'MEDIUM',
        RR_Observations: initialData?.RR_Comment || '',
        RR_ProcessusId: initialData?.RR_ProcessusId || '',
        RR_IsRecurring: initialData?.RR_IsRecurring || false,
        RR_Frequency: initialData?.RR_Frequency || undefined,
      });
      setFormErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
    if (formErrors[name as keyof RequirementFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof RequirementFormData, string>> = {};
    if (!formData.RR_Title.trim()) errors.RR_Title = 'Le titre est requis';
    if (!formData.RR_Reference.trim()) errors.RR_Reference = 'La référence est requise';
    if (!formData.RR_Deadline) errors.RR_Deadline = 'La date échéance est requise';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }
    
    setIsSubmitting(true);
    const toastId = toast.loading(initialData ? "Mise à jour de l'exigence..." : "Création de l'exigence...");
    
    try {
      const payload = {
        ...formData,
        RR_DueDate: formData.RR_Deadline ? new Date(formData.RR_Deadline).toISOString() : undefined,
        RR_Authority: formData.RR_Source,
        RR_Comment: formData.RR_Observations,
      };
      
      if (initialData) {
        await apiClient.put<RegulatoryRequirement>(`/requirements/${initialData.RR_Id}`, payload);
        toast.success("Exigence mise à jour", { id: toastId });
      } else {
        await apiClient.post<RegulatoryRequirement>('/requirements', payload);
        toast.success("Exigence créée", { id: toastId });
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || apiError?.message || "Erreur", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || typeof window === 'undefined') return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl md:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <header className="sticky top-0 bg-[#0F172A]/95 backdrop-blur-md z-20 flex justify-between items-center px-5 md:px-8 py-4 md:py-6 border-b border-white/5">
          <h2 id="modal-title" className="text-lg md:text-xl font-black uppercase italic text-white m-0">{initialData ? "Modifier l'Exigence" : "Nouvelle Exigence"}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label="Fermer">
            <X size={20} className="w-5 h-5" aria-hidden="true" />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-5 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="RR_Title" className="text-[9px] text-slate-500 tracking-widest ml-2 block">Titre *</label>
              <input id="RR_Title" name="RR_Title" value={formData.RR_Title} onChange={handleChange} className={cn("w-full bg-[#0B0F1A] border rounded-xl p-3 md:p-4 text-[10px] md:text-[11px] text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30", formErrors.RR_Title ? "border-rose-500/50" : "border-white/10")} />
              {formErrors.RR_Title && <p className="text-rose-400 text-[9px] ml-2 flex items-center gap-1" role="alert"><AlertCircle size={10} className="w-2.5 h-2.5" /> {formErrors.RR_Title}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="RR_Reference" className="text-[9px] text-slate-500 tracking-widest ml-2 block">Référence *</label>
              <input id="RR_Reference" name="RR_Reference" value={formData.RR_Reference} onChange={handleChange} className={cn("w-full bg-[#0B0F1A] border rounded-xl p-3 md:p-4 text-[10px] md:text-[11px] text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30", formErrors.RR_Reference ? "border-rose-500/50" : "border-white/10")} />
              {formErrors.RR_Reference && <p className="text-rose-400 text-[9px] ml-2 flex items-center gap-1" role="alert"><AlertCircle size={10} className="w-2.5 h-2.5" /> {formErrors.RR_Reference}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="RR_Source" className="text-[9px] text-slate-500 tracking-widest ml-2 block">Source / Autorité</label>
              <input id="RR_Source" name="RR_Source" value={formData.RR_Source} onChange={handleChange} className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl p-3 md:p-4 text-[10px] md:text-[11px] text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div className="space-y-2">
              <label htmlFor="RR_Category" className="text-[9px] text-slate-500 tracking-widest ml-2 block">Catégorie</label>
              <input id="RR_Category" name="RR_Category" value={formData.RR_Category} onChange={handleChange} className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl p-3 md:p-4 text-[10px] md:text-[11px] text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="RR_Deadline" className="text-[9px] text-slate-500 tracking-widest ml-2 block">Échéance *</label>
              <input id="RR_Deadline" name="RR_Deadline" type="date" value={formData.RR_Deadline} onChange={handleChange} className={cn("w-full bg-[#0B0F1A] border rounded-xl p-3 md:p-4 text-[10px] md:text-[11px] text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30", formErrors.RR_Deadline ? "border-rose-500/50" : "border-white/10")} />
              {formErrors.RR_Deadline && <p className="text-rose-400 text-[9px] ml-2 flex items-center gap-1" role="alert"><AlertCircle size={10} className="w-2.5 h-2.5" /> {formErrors.RR_Deadline}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="RR_ProcessusId" className="text-[9px] text-slate-500 tracking-widest ml-2 block">Processus</label>
              <select id="RR_ProcessusId" name="RR_ProcessusId" value={formData.RR_ProcessusId} onChange={handleChange} className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl p-3 md:p-4 text-[10px] md:text-[11px] text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 cursor-pointer">
                <option value="" className="bg-[#0B0F1A] text-slate-500">TRANSVERSE</option>
                {processes.filter(p => p.PR_IsActive !== false).map(p => <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0B0F1A] text-white">{p.PR_Code} - {p.PR_Libelle}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="RR_Status" className="text-[9px] text-slate-500 tracking-widest ml-2 block">Statut</label>
              <select id="RR_Status" name="RR_Status" value={formData.RR_Status} onChange={handleChange} className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl p-3 md:p-4 text-[10px] md:text-[11px] text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 cursor-pointer">
                <option value="A_EVALUER" className="bg-[#0B0F1A]">À évaluer</option>
                <option value="CONFORME" className="bg-[#0B0F1A]">Conforme</option>
                <option value="NON_CONFORME" className="bg-[#0B0F1A]">Non-conforme</option>
                <option value="EN_ATTENTE" className="bg-[#0B0F1A]">En attente</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="RR_Priority" className="text-[9px] text-slate-500 tracking-widest ml-2 block">Priorité</label>
              <select id="RR_Priority" name="RR_Priority" value={formData.RR_Priority} onChange={handleChange} className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl p-3 md:p-4 text-[10px] md:text-[11px] text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 cursor-pointer">
                <option value="LOW" className="bg-[#0B0F1A]">Basse</option>
                <option value="MEDIUM" className="bg-[#0B0F1A]">Moyenne</option>
                <option value="HIGH" className="bg-[#0B0F1A]">Élevée</option>
                <option value="CRITICAL" className="bg-[#0B0F1A]">Critique</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="RR_Observations" className="text-[9px] text-slate-500 tracking-widest ml-2 block">Observations</label>
            <textarea id="RR_Observations" name="RR_Observations" value={formData.RR_Observations} onChange={handleChange} rows={3} className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl p-3 md:p-4 text-[10px] md:text-[11px] text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 resize-none" />
          </div>
          <div className="flex items-center gap-3">
            <input id="RR_IsRecurring" name="RR_IsRecurring" type="checkbox" checked={formData.RR_IsRecurring} onChange={handleChange} className="w-4 h-4 rounded border-white/10 bg-[#0B0F1A] text-blue-600 focus:ring-blue-500" />
            <label htmlFor="RR_IsRecurring" className="text-[9px] text-slate-500 tracking-widest">Exigence récurrente</label>
          </div>
          <button type="submit" disabled={isSubmitting} className={cn("w-full bg-blue-600 py-4 md:py-5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] text-white border-none shadow-xl flex items-center justify-center gap-3 uppercase italic transition-all focus:outline-none focus:ring-2 focus:ring-blue-400", isSubmitting ? "opacity-70 cursor-wait" : "hover:bg-white hover:text-blue-700 active:scale-95 cursor-pointer")} aria-busy={isSubmitting}>
            {isSubmitting ? <><Loader2 size={16} className="w-4 h-4 animate-spin" aria-hidden="true" /><span>TRAITEMENT...</span></> : <><Save size={16} className="w-4 h-4" aria-hidden="true" /><span>{initialData ? 'METTRE À JOUR' : 'INDEXER EXIGENCE'}</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function CompliancePage() {
  const [data, setData] = useState<RegulatoryRequirement[]>([]);
  const [processes, setProcesses] = useState<Processus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resReq, resProc] = await Promise.all([
        apiClient.get<RegulatoryRequirement[]>('/requirements'),
        apiClient.get<Processus[]>('/processus')
      ]);
      setData(Array.isArray(resReq.data) ? resReq.data : []);
      setProcesses(Array.isArray(resProc.data) ? resProc.data : []);
    } catch (error) {
      console.error('❌ Erreur chargement exigences:', error);
      toast.error("RUPTURE LÉGALE MATRIX");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = data.length;
    const compliant = data.filter(r => r.RR_Status === 'CONFORME').length;
    const critical = data.filter(r => r.RR_Status === 'NON_CONFORME' || (r.RR_DueDate && new Date(r.RR_DueDate) < new Date())).length;
    return { total, compliant, critical, rate: total > 0 ? Math.round((compliant/total)*100) : 0 };
  }, [data]);

  const handleEdit = (req: RegulatoryRequirement) => {
    setEditingId(req.RR_Id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmez-vous la suppression de cette exigence ?')) return;
    const toastId = toast.loading("Suppression en cours...");
    try {
      await apiClient.delete(`/requirements/${id}`);
      toast.success("Exigence supprimée", { id: toastId });
      fetchData();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError?.response?.data?.message || "Erreur", { id: toastId });
    }
  };

  const handleModalSuccess = () => {
    fetchData();
    setIsModalOpen(false);
    setEditingId(null);
  };

  const editingReq = useMemo(() => data.find(r => r.RR_Id === editingId) || null, [data, editingId]);

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Audit du Noyau Légal §6.1.3..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 mt-12 lg:mt-0 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="text-left space-y-2 w-full xl:w-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl tracking-tighter leading-none m-0">Veille <span className="text-blue-400">Légale</span></h1>
          <p className="text-slate-500 text-[8px] md:text-[9px] tracking-widest m-0 italic flex items-center gap-2">
            <Scale size={12} className="w-3 h-3 text-blue-400" aria-hidden="true" /> Identification des Exigences §6.1.3
          </p>
        </div>
        <button 
          type="button"
          onClick={() => { setEditingId(null); setIsModalOpen(true); }} 
          className="bg-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] flex items-center gap-2 md:gap-3 shadow-2xl hover:bg-white hover:text-blue-700 transition-all border-none cursor-pointer text-white italic focus:outline-none focus:ring-2 focus:ring-blue-400 w-full xl:w-auto justify-center"
          aria-label="Indexer une nouvelle exigence"
        >
          <Plus size={16} className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} aria-hidden="true" /> 
          <span className="hidden sm:inline">Indexer Exigence</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-5 md:py-6 space-y-6 md:space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 lg:gap-8" aria-label="Indicateurs de conformité">
          <ComplianceKPI label="Volume Textes" val={stats.total} icon={BookOpen} color="blue" />
          <ComplianceKPI label="Non-Conformités" val={stats.critical} icon={AlertCircle} color="rose" alert={stats.critical > 0} />
          <ComplianceKPI label="Conformité" val={`${stats.rate}%`} icon={CheckCircle2} color="emerald" />
        </section>

        <article className="bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-96 md:min-h-[500px]">
          <div className="p-5 md:p-8 border-b border-white/5 bg-black/20 flex items-center gap-3 md:gap-4 text-blue-400">
             <Target size={18} className="w-4.5 h-4.5 md:w-5 md:h-5" aria-hidden="true" /> 
             <h3 className="text-sm md:text-base font-black m-0 tracking-widest">Registre des Textes Applicables</h3>
          </div>
          <div className="overflow-x-auto flex-1" role="region" aria-label="Tableau des exigences réglementaires">
            <table className="w-full text-left border-collapse min-w-full" role="table">
              <thead>
                <tr className="bg-black/40 text-[8px] md:text-[9px] text-slate-500 tracking-widest border-b border-white/5 font-black italic">
                  <th className="px-6 md:px-8 lg:px-10 py-3 md:py-4 md:py-5" scope="col">Exigence / Source</th>
                  <th className="px-6 md:px-8 lg:px-10 py-3 md:py-4 md:py-5 text-center" scope="col">Processus</th>
                  <th className="px-6 md:px-8 lg:px-10 py-3 md:py-4 md:py-5 text-center" scope="col">Statut §9.1.2</th>
                  <th className="px-6 md:px-8 lg:px-10 py-3 md:py-4 md:py-5 text-right" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-bold italic">
                {data.length > 0 ? data.map(req => (
                  <tr key={req.RR_Id} className="hover:bg-blue-600/5 transition-all group focus-within:bg-blue-600/5">
                    <td className="px-6 md:px-8 lg:px-10 py-4 md:py-6">
                      <p className="text-sm md:text-base font-black text-white m-0 leading-none mb-1 md:mb-2">{req.RR_Title}</p>
                      <span className="text-[7px] md:text-[8px] text-blue-400 tracking-widest uppercase">{req.RR_Authority || req.RR_Reference}</span>
                    </td>
                    <td className="px-6 md:px-8 lg:px-10 py-4 md:py-6 text-center">
                      <span className="px-3 md:px-4 py-1 md:py-1.5 bg-white/5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] border border-white/5">{req.RR_Processus?.PR_Code || 'TRANSVERSE'}</span>
                    </td>
                    <td className="px-6 md:px-8 lg:px-10 py-4 md:py-6 text-center">
                      <span className={cn("px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] border", req.RR_Status === 'CONFORME' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20")}>
                        {req.RR_Status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 lg:px-10 py-4 md:py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                         <button 
                           type="button"
                           onClick={() => handleEdit(req)} 
                           className="p-2 md:p-3 bg-white/5 text-slate-400 hover:text-white rounded-lg md:rounded-xl border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                           aria-label={`Modifier ${req.RR_Title}`}
                           title="Modifier"
                         >
                           <Edit3 size={14} className="w-3.5 h-3.5" aria-hidden="true"/>
                         </button>
                         <button 
                           type="button"
                           onClick={() => handleDelete(req.RR_Id)} 
                           className="p-2 md:p-3 bg-white/5 text-slate-400 hover:text-rose-400 rounded-lg md:rounded-xl border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
                           aria-label={`Supprimer ${req.RR_Title}`}
                           title="Supprimer"
                         >
                           <Trash2 size={14} className="w-3.5 h-3.5" aria-hidden="true"/>
                         </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 md:px-8 lg:px-10 py-12 md:py-16 text-center text-slate-500" role="status">
                      <Scale size={40} className="w-10 h-10 mx-auto mb-3 md:mb-4 opacity-20" aria-hidden="true" />
                      <p className="text-[9px] md:text-[10px] font-black uppercase italic tracking-widest">Aucune exigence enregistrée</p>
                      <button type="button" onClick={() => setIsModalOpen(true)} className="mt-3 md:mt-4 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1">Indexer votre première exigence</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </main>

      <RequirementModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingId(null); }} 
        onSuccess={handleModalSuccess} 
        processes={processes}
        initialData={editingReq}
      />

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}