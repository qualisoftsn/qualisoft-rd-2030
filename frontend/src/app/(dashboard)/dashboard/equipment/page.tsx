/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 MODULE : GESTION DES ÉQUIPEMENTS §7.1.3 (ISO 9001)
 * RÔLE : Traçabilité des actifs, monitoring VGP et calcul de disponibilité
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité + CRUD
 * API : apiClient Axios avec interceptors (Bearer + X-Tenant-Id)
 */

import React, { useEffect, useState, useCallback, useMemo, ChangeEvent, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Calendar, Trash2, Search, Edit3, ShieldAlert, Activity, 
  Zap, AlertTriangle, Link as LinkIcon, TrendingDown, 
  Calculator, Wrench, ChevronRight, RefreshCcw, Loader2,
  CheckCircle, XCircle, Info
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';
import apiClient, { type ApiError } from '@/core/api/api-client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type EquipmentStatus = 'OPERATIONNEL' | 'MAINTENANCE' | 'HORS_SERVICE' | 'REFORME';
export type VGPStatus = 'CONFORME' | 'ECHEANCE_PROCHE' | 'EXPIREE' | 'NON_DEFINIE';

export interface Equipment {
  EQ_Id: string;
  EQ_Reference: string;
  EQ_Name: string;
  EQ_Description?: string;
  EQ_Status: EquipmentStatus;
  EQ_ProchaineVGP?: string;
  EQ_DerniereVGP?: string;
  EQ_SiteId?: string;
  EQ_Site?: { S_Name: string };
  EQ_Categorie?: string;
  EQ_CoutAchat?: number;
  EQ_DateAcquisition?: string;
  EQ_CreatedAt?: string;
  EQ_UpdatedAt?: string;
}

export interface EquipmentStats {
  total: number;
  critical: number;
  maintenance: number;
  operational: number;
  healthScore: number;
  financialRisk: number;
}

export interface VGPStatusConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const STATUS_CONFIG: Record<EquipmentStatus, { label: string; color: string; bg: string }> = {
  OPERATIONNEL: { label: 'Opérationnel', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  MAINTENANCE: { label: 'Maintenance', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  HORS_SERVICE: { label: 'Hors Service', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  REFORME: { label: 'Réformé', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
};

const VGP_CONFIG: Record<VGPStatus, VGPStatusConfig> = {
  CONFORME: { label: 'Conforme', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
  ECHEANCE_PROCHE: { label: 'Échéance Proche', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertTriangle },
  EXPIREE: { label: 'VGP Expirée', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: XCircle },
  NON_DEFINIE: { label: 'Non Définie', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Info },
};

const METRIC_COLORS = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10', progress: 'bg-emerald-500' },
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/5', border: 'border-blue-500/10', progress: 'bg-blue-500' },
  rose: { text: 'text-rose-400', bg: 'bg-rose-500/5', border: 'border-rose-500/10', progress: 'bg-rose-500' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/10', progress: 'bg-amber-500' },
};

// ============================================================================
// UTILITAIRES
// ============================================================================

const formatDateFR = (dateString?: string): string => {
  if (!dateString) return '—';
  try { return new Date(dateString).toLocaleDateString('fr-SN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return dateString; }
};

const getVGPStatus = (date?: string): { config: VGPStatusConfig; dateStr: string } => {
  if (!date) return { config: VGP_CONFIG.NON_DEFINIE, dateStr: '—' };
  const now = new Date();
  const vgpDate = new Date(date);
  const diffDays = Math.ceil((vgpDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { config: VGP_CONFIG.EXPIREE, dateStr: formatDateFR(date) };
  if (diffDays < 30) return { config: VGP_CONFIG.ECHEANCE_PROCHE, dateStr: formatDateFR(date) };
  return { config: VGP_CONFIG.CONFORME, dateStr: formatDateFR(date) };
};

const calculateFinancialRisk = (maintenanceCount: number, hourlyCost = 450): number => maintenanceCount * hourlyCost * 8;

// ============================================================================
// FALLBACK : EQUIPMENT MODAL
// ============================================================================

interface EquipmentModalProps {
  equipment: Equipment | null;
  onClose: () => void;
  onSuccess: () => void;
}

function EquipmentModalFallback({ equipment, onClose, onSuccess }: EquipmentModalProps) {
  const [formData, setFormData] = useState<Partial<Equipment>>({
    EQ_Reference: equipment?.EQ_Reference || '',
    EQ_Name: equipment?.EQ_Name || '',
    EQ_Description: equipment?.EQ_Description || '',
    EQ_Status: equipment?.EQ_Status || 'OPERATIONNEL',
    EQ_ProchaineVGP: equipment?.EQ_ProchaineVGP || '',
    EQ_Categorie: equipment?.EQ_Categorie || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading(equipment ? "Mise à jour de l'actif..." : "Création de l'actif...");
    try {
      if (equipment) await apiClient.put(`/equipments/${equipment.EQ_Id}`, formData);
      else await apiClient.post('/equipments', formData);
      toast.success(equipment ? "Actif mis à jour" : "Actif créé", { id: toastId });
      onSuccess(); onClose();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || apiError?.message || "Erreur", { id: toastId });
    } finally { setIsSubmitting(false); }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl md:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 id="modal-title" className="text-xl font-black uppercase italic text-white">{equipment ? "Modifier l'Actif" : "Nouvel Actif"}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label="Fermer">
            <XCircle size={20} className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 block">Référence *</label>
              <input name="EQ_Reference" value={formData.EQ_Reference} onChange={handleChange} required className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" placeholder="EQ-2026-001" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 block">Nom *</label>
              <input name="EQ_Name" value={formData.EQ_Name} onChange={handleChange} required className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" placeholder="Compresseur Principal" />
            </div>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 block">Description</label>
            <textarea name="EQ_Description" value={formData.EQ_Description} onChange={handleChange} rows={3} className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 resize-none" placeholder="Description technique..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 block">Statut</label>
              <select name="EQ_Status" value={formData.EQ_Status} onChange={handleChange} className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 cursor-pointer">
                {Object.entries(STATUS_CONFIG).map(([value, { label }]) => <option key={value} value={value} className="bg-[#0B0F1A]">{label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 block">Prochaine VGP</label>
              <input name="EQ_ProchaineVGP" type="date" value={formData.EQ_ProchaineVGP?.split('T')[0] || ''} onChange={handleChange} className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-3 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-400">Annuler</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
              {isSubmitting ? <Loader2 size={14} className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : null}
              {equipment ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : METRIC TILE
// ============================================================================

interface MetricTileProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: keyof typeof METRIC_COLORS;
  formula?: string;
  onClick?: () => void;
}

function MetricTile({ title, value, icon: Icon, color, formula, onClick }: MetricTileProps) {
  const theme = METRIC_COLORS[color];
  return (
    <article className={cn("p-5 md:p-7 bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl transition-all hover:scale-[1.02] group relative overflow-hidden shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]", onClick && "cursor-pointer", theme.border)} onClick={onClick} tabIndex={onClick ? 0 : -1} role={onClick ? "button" : "article"} aria-label={`${title}: ${value}`}>
      <div className={cn("p-3 md:p-4 rounded-xl md:rounded-2xl border transition-transform group-hover:scale-110 shrink-0", theme.bg, theme.text, theme.border)}>
        <Icon size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
      </div>
      <div className="mt-4 md:mt-5">
        <p className="text-[8px] md:text-[9px] text-slate-500 uppercase tracking-widest m-0">{title}</p>
        <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white m-0 leading-none mt-1 md:mt-2">{value}</h3>
      </div>
      {formula && (
        <div className="absolute inset-0 bg-blue-600/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-6 text-center pointer-events-none">
          <Calculator size={28} className="w-7 h-7 md:w-8 md:h-8 mb-3 text-white animate-pulse" aria-hidden="true" />
          <p className="text-[10px] md:text-[11px] font-black text-white italic uppercase leading-tight">{formula}</p>
        </div>
      )}
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : EQUIPMENT ROW
// ============================================================================

interface EquipmentRowProps {
  equipment: Equipment;
  onEdit: (eq: Equipment) => void;
  onDelete: (id: string) => void;
}

function EquipmentRow({ equipment, onEdit, onDelete }: EquipmentRowProps) {
  const vgp = getVGPStatus(equipment.EQ_ProchaineVGP);
  const status = STATUS_CONFIG[equipment.EQ_Status];
  return (
    <tr className="hover:bg-blue-600/5 transition-all group focus-within:bg-blue-600/5">
      <td className="px-6 md:px-8 py-4 md:py-6">
        <p className="text-base md:text-lg font-black text-blue-400 m-0 tracking-tighter leading-none">{equipment.EQ_Reference}</p>
        <p className="text-[9px] md:text-[10px] text-slate-400 mt-1 m-0 truncate max-w-[200px]">{equipment.EQ_Name}</p>
        {equipment.EQ_Site?.S_Name && <p className="text-[8px] text-slate-600 mt-0.5">{equipment.EQ_Site.S_Name}</p>}
      </td>
      <td className="px-6 md:px-8 py-4 md:py-6 text-center">
        <span className={cn("inline-flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-wider border", vgp.config.bg, vgp.config.color, vgp.config.border)}>
          <vgp.config.icon size={10} className="w-2.5 h-2.5" aria-hidden="true" />
          <span className="hidden sm:inline">{vgp.config.label}</span> : {vgp.dateStr}
        </span>
      </td>
      <td className="px-6 md:px-8 py-4 md:py-6 text-center">
        <span className={cn("px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-wider border", status.bg, status.color, "border-white/5")}>{status.label}</span>
      </td>
      <td className="px-6 md:px-8 py-4 md:py-6 text-right">
        <div className={cn("flex justify-end gap-2 transition-opacity", "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100")}>
          <button onClick={() => onEdit(equipment)} className="p-2 md:p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-blue-600/20 rounded-lg transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label={`Modifier ${equipment.EQ_Reference}`} title="Modifier">
            <Edit3 size={14} className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button onClick={() => onDelete(equipment.EQ_Id)} className="p-2 md:p-3 bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400" aria-label={`Supprimer ${equipment.EQ_Reference}`} title="Supprimer">
            <Trash2 size={14} className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function EquipmentsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEquipments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Equipment[]>('/equipments');
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Erreur chargement équipements:', error);
      toast.error("RUPTURE DE LIAISON : REGISTRE DES ACTIFS INACCESSIBLE");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchEquipments(); }, [fetchEquipments]);

  const stats = useMemo((): EquipmentStats => {
    const total = items.length;
    const critical = items.filter(i => i.EQ_ProchaineVGP && new Date(i.EQ_ProchaineVGP).getTime() < Date.now()).length;
    const maintenance = items.filter(i => i.EQ_Status === 'MAINTENANCE').length;
    const operational = items.filter(i => i.EQ_Status === 'OPERATIONNEL').length;
    const healthScore = total > 0 ? Math.round(((total - critical) / total) * 100) : 0;
    const financialRisk = calculateFinancialRisk(maintenance);
    return { total, critical, maintenance, operational, healthScore, financialRisk };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const term = search.toLowerCase();
    return items.filter(i => i.EQ_Reference?.toLowerCase().includes(term) || i.EQ_Name?.toLowerCase().includes(term) || i.EQ_Categorie?.toLowerCase().includes(term) || i.EQ_Site?.S_Name?.toLowerCase().includes(term));
  }, [items, search]);

  const handleCreate = () => { setSelectedEquipment(null); setIsModalOpen(true); };
  const handleEdit = (equipment: Equipment) => { setSelectedEquipment(equipment); setIsModalOpen(true); };

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmez-vous la suppression de cet actif ?')) return;
    setDeletingId(id);
    const toastId = toast.loading("Suppression en cours...");
    try {
      await apiClient.delete(`/equipments/${id}`);
      toast.success("Actif supprimé", { id: toastId });
      await fetchEquipments();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "Erreur", { id: toastId });
    } finally { setDeletingId(null); }
  };

  const handleModalSuccess = () => fetchEquipments();

  if (loading && typeof window !== 'undefined') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
        <RefreshCcw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">Chargement Matrix Assets...</span>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b border-white/5 flex flex-col xl:flex-row justify-between items-start xl:items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6">
        <div className="text-left space-y-2 md:space-y-3">
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter leading-none m-0 text-white">Registre <span className="text-blue-500">Actifs</span></h1>
          <p className="text-slate-500 text-[8px] md:text-[9px] tracking-widest m-0 flex items-center gap-2">
            <Zap size={10} className="w-2.5 h-2.5 text-blue-400" aria-hidden="true" /> ISO 9001 §7.1.3 • Master Asset Management
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative group flex-1 xl:flex-none">
            <label htmlFor="equipment-search" className="sr-only">Rechercher un équipement</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none w-4 h-4" aria-hidden="true" />
            <input id="equipment-search" type="search" placeholder="RECHERCHE RÉFÉRENCE..." className="bg-[#0F172A] border border-white/10 rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-10 md:pl-12 pr-4 md:pr-6 text-[8px] md:text-[9px] font-black outline-none w-full xl:w-64 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white italic placeholder:text-slate-600" value={search} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} aria-label="Filtrer les équipements" />
          </div>
          <button onClick={handleCreate} className="bg-blue-600 px-5 md:px-7 lg:px-8 py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 md:gap-3 transition-all border-none cursor-pointer text-white shadow-xl hover:bg-white hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <Plus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" strokeWidth={3} aria-hidden="true" /> <span className="hidden sm:inline">Nouvel Actif</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-5 md:py-6 space-y-6 md:space-y-8 lg:space-y-10">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6" aria-label="Indicateurs de performance">
          <MetricTile title="Disponibilité" value={`${stats.healthScore}%`} icon={Activity} color="emerald" formula="Σ(Actifs Opérationnels) / Σ(Total)" onClick={() => router.push('/dashboard/equipments/availability')} />
          <MetricTile title="Alertes VGP" value={stats.critical} icon={ShieldAlert} color="rose" formula="Équipements avec VGP dépassée" onClick={() => router.push('/dashboard/equipments?vgp=expired')} />
          <MetricTile title="Maintenance" value={stats.maintenance} icon={Wrench} color="amber" formula="Actifs hors service (GMAO)" onClick={() => router.push('/dashboard/equipments/maintenance')} />
          <MetricTile title="Risque Financier" value={`${new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(stats.financialRisk)}`} icon={TrendingDown} color="blue" formula="Arrêt × Coût Horaire Estimé" />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
          <section className="xl:col-span-8 bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[400px]">
            <div className="p-5 md:p-7 lg:p-8 border-b border-white/5 bg-black/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-base md:text-lg font-black italic m-0 flex items-center gap-2 md:gap-3 text-white">
                <LinkIcon size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400" aria-hidden="true"/> Inventaire des Infrastructures
              </h3>
              <span className="text-[8px] md:text-[9px] text-slate-500 uppercase tracking-wider">{filteredItems.length} actif{filteredItems.length > 1 ? 's' : ''}</span>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse" role="table">
                <thead>
                  <tr className="bg-black/40 text-[8px] md:text-[9px] text-slate-500 tracking-widest border-b border-white/5 font-black italic">
                    <th className="px-4 md:px-6 lg:px-8 py-3 md:py-4 md:py-5" scope="col">Identification</th>
                    <th className="px-4 md:px-6 lg:px-8 py-3 md:py-4 md:py-5 text-center" scope="col">Statut VGP</th>
                    <th className="px-4 md:px-6 lg:px-8 py-3 md:py-4 md:py-5 text-center" scope="col">État SMI</th>
                    <th className="px-4 md:px-6 lg:px-8 py-3 md:py-4 md:py-5 text-right" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-bold italic">
                  {filteredItems.length > 0 ? filteredItems.map(eq => <EquipmentRow key={eq.EQ_Id} equipment={eq} onEdit={handleEdit} onDelete={handleDelete} />) : (
                    <tr><td colSpan={4} className="px-6 md:px-8 py-12 md:py-16 text-center text-slate-500" role="status">
                      <Search size={40} className="w-10 h-10 mx-auto mb-4 opacity-20" aria-hidden="true" />
                      <p className="text-[9px] md:text-[10px] font-black uppercase italic tracking-widest">{search ? 'Aucun résultat' : 'Aucun équipement enregistré'}</p>
                      {!search && <button onClick={handleCreate} className="mt-4 text-[8px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1">Créer votre premier actif</button>}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="xl:col-span-4 space-y-6 md:space-y-8">
            <article className="bg-rose-500/5 border-2 border-rose-500/20 p-5 md:p-7 lg:p-8 rounded-2xl md:rounded-3xl relative overflow-hidden">
              <ShieldAlert size={120} className="absolute -right-8 md:-right-10 -bottom-8 md:-bottom-10 text-rose-500/10 pointer-events-none w-30 h-30 md:w-37.5 md:h-37.5" aria-hidden="true" />
              <h3 className="text-lg md:text-xl font-black text-rose-400 mb-4 md:mb-5 flex items-center gap-2 md:gap-3 m-0 leading-none">
                <AlertTriangle size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true"/> Risques SMI §10.2
              </h3>
              <p className="text-[10px] md:text-[11px] text-slate-400 leading-relaxed m-0 font-black italic">ATTENTION : <span className="text-rose-400">{stats.critical} actif{stats.critical > 1 ? 's' : ''}</span> en défaut de VGP génère{stats.critical > 1 ? 'nt' : ''} un risque de non-conformité.</p>
              <button onClick={() => router.push('/dashboard/actions/correctives?source=vgp')} className="mt-6 md:mt-8 text-[9px] md:text-[10px] text-rose-400 hover:text-rose-300 bg-transparent border-none cursor-pointer underline flex items-center gap-1.5 md:gap-2 font-black italic focus:outline-none focus:ring-2 focus:ring-rose-400 rounded px-2 py-1">
                Lancer action corrective <ChevronRight size={12} className="w-3 h-3" aria-hidden="true"/>
              </button>
            </article>

            <article className="bg-blue-500/5 border-2 border-blue-500/10 p-5 md:p-7 lg:p-8 rounded-2xl md:rounded-3xl">
              <h3 className="text-lg md:text-xl font-black text-blue-400 mb-5 md:mb-6 flex items-center gap-2 md:gap-3 m-0 leading-none">
                <Calculator size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true"/> Asset Intelligence
              </h3>
              <div className="space-y-4 md:space-y-5">
                <div className="p-4 md:p-5 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl">
                  <h4 className="text-[9px] md:text-[10px] text-blue-400 mb-2 md:mb-3 m-0 font-black italic uppercase">Taux de Disponibilité</h4>
                  <code className="text-[10px] md:text-xs text-slate-300 bg-black/40 px-2 md:px-3 py-1 md:py-1.5 rounded-lg block">D = Uptime / Temps_Total</code>
                </div>
                <div className="p-4 md:p-5 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl">
                  <h4 className="text-[9px] md:text-[10px] text-blue-400 mb-2 md:mb-3 m-0 font-black italic uppercase">MTBF (Fiabilité)</h4>
                  <code className="text-[10px] md:text-xs text-slate-300 bg-black/40 px-2 md:px-3 py-1 md:py-1.5 rounded-lg block">MTBF = T_Fonct / Nb_Pannes</code>
                </div>
                <div className="p-4 md:p-5 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl">
                  <h4 className="text-[9px] md:text-[10px] text-blue-400 mb-2 md:mb-3 m-0 font-black italic uppercase">Coût Total de Possession</h4>
                  <code className="text-[10px] md:text-xs text-slate-300 bg-black/40 px-2 md:px-3 py-1 md:py-1.5 rounded-lg block">TCO = Achat + Maintenance + Arrêts</code>
                </div>
              </div>
            </article>
          </aside>
        </div>
      </main>

      {isModalOpen && <EquipmentModalFallback equipment={selectedEquipment} onClose={() => setIsModalOpen(false)} onSuccess={handleModalSuccess} />}

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}