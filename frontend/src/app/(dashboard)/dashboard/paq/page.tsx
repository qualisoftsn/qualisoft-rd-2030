/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛡️ MODULE : PILOTAGE DES PLANS D'ACTIONS QUALITÉ (ISO 9001 §10.3)
 * RÔLE : Pilotage du cycle d'amélioration continue
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useCallback, useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import apiClient, { type ApiError } from '@/core/api/api-client';
import {
  ArrowRight, BarChart3, CheckCircle2,
  Edit3, LayoutGrid, Plus, Printer, ShieldAlert,
  Target, Users, X, RefreshCw, Zap
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_IsActive?: boolean;
}

export interface PAQ {
  PAQ_Id: string;
  PAQ_Title: string;
  PAQ_Year: number;
  PAQ_Description?: string;
  PAQ_Status: string;
  PAQ_Budget?: number;
  PAQ_DateCloture?: string;
  PAQ_IsActive: boolean;
  PAQ_ProcessusId: string;
  PAQ_QualityManagerId: string;
  PAQ_CreatedAt: string;
  PAQ_UpdatedAt: string;
  Processus?: Processus;
}

export interface ActionItem {
  ACT_Id: string;
  ACT_Title: string;
  ACT_Deadline: string;
  ACT_Status: string;
  ACT_Priority: string;
  ACT_ResponsableId: string;
}

export interface PilotCharge {
  name: string;
  count: number;
}

export interface DashboardStats {
  total: number;
  enRetard: ActionItem[];
  tauxEfficacite: number;
  chargeTravail: PilotCharge[];
}

export interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'indigo' | 'red' | 'emerald' | 'blue';
  sub: string;
}

export interface EditingAction {
  ACT_Id: string;
  ACT_Title: string;
  ACT_Deadline: string;
  ACT_Status: string;
  ACT_Priority: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-indigo-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : KPI CARD
// ============================================================================

function KPICard({ title, value, icon: Icon, color, sub }: KPICardProps) {
  const colors: Record<KPICardProps['color'], string> = { 
    indigo: "text-indigo-400 border-indigo-500/10", 
    red: "text-red-400 border-red-500/10", 
    emerald: "text-emerald-400 border-emerald-500/10", 
    blue: "text-blue-400 border-blue-500/10" 
  };
  
  return (
    <article className={cn(
      "bg-[#0F172A] p-6 md:p-8 rounded-2xl md:rounded-3xl border-2 flex items-center gap-4 md:gap-6 shadow-2xl transition-all hover:-translate-y-1 relative overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400",
      colors[color]
    )}>
      <div className="absolute -right-2 md:-right-4 opacity-5 pointer-events-none" aria-hidden="true">
        <Icon size={64} className="w-16 h-16 md:w-20 md:h-20" />
      </div>
      <div className="p-3 md:p-4 md:p-5 rounded-xl md:rounded-2xl bg-black/40 border border-white/5 shadow-inner">
        <Icon size={20} className="w-5 h-5 md:w-7 md:h-7" aria-hidden="true" />
      </div>
      <div className="text-left relative z-10">
        <p className="text-3xl md:text-4xl font-black italic m-0 tracking-tighter text-white leading-none">{value}</p>
        <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest mt-1 md:mt-2 m-0 uppercase leading-none">{title}</p>
        <p className="text-[8px] md:text-[9px] text-slate-700 mt-0.5 md:mt-1 m-0 tracking-widest font-bold italic">{sub}</p>
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function PAQPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [paqs, setPaqs] = useState<PAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAction, setEditingAction] = useState<EditingAction | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resStats, resPaqs] = await Promise.all([
        apiClient.get<DashboardStats>('/paq/dashboard'),
        apiClient.get<PAQ[]>('/paq'),
      ]);
      setData(resStats.data?.data || resStats.data || null);
      setPaqs(Array.isArray(resPaqs.data) ? resPaqs.data : []);
    } catch (error) {
      console.error('❌ Erreur chargement PAQ:', error);
      toast.error('ÉCHEC DE SYNCHRONISATION DU REGISTRE PAQ');
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  const handleRectifyAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAction) return;
    
    const toastId = toast.loading("Rectification en cours...");
    try {
      const formData = new FormData(e.target);
      await apiClient.patch(`/actions/${editingAction.ACT_Id}`, {
        ACT_Title: formData.get('title'),
        ACT_Priority: formData.get('priority'),
        ACT_Status: formData.get('status'),
      });
      toast.success("Action rectifiée", { id: toastId });
      setEditingAction(null);
      fetchData();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "Erreur de rectification", { id: toastId });
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Synchronisation des Plans d'Actions..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-indigo-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 lg:gap-8 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <span className="bg-indigo-600/10 border border-indigo-500/20 px-3 md:px-4 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[9px] text-indigo-400 tracking-widest flex items-center gap-1.5 md:gap-2">
              <Zap size={12} className="w-3 h-3" aria-hidden="true" /> 
              ISO 9001 §10.3
            </span>
            <span className="text-slate-500 text-[8px] md:text-[9px] tracking-widest italic">
              {data?.total || 0} ACTIONS ACTIVES
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0">Plans <span className="text-indigo-400">Actions</span></h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <button 
            type="button"
            onClick={() => window.print()} 
            className="flex-1 xl:flex-none p-2.5 md:p-3 lg:p-5 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl lg:rounded-3xl border border-white/10 text-slate-400 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Imprimer le rapport PAQ"
          >
            <Printer size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
          </button>
          <button 
            type="button"
            onClick={() => router.push('/dashboard/paq/nouveau')} 
            className="flex-1 xl:flex-none bg-indigo-600 hover:bg-white hover:text-indigo-700 px-4 md:px-6 lg:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl text-[9px] md:text-[10px] flex items-center justify-center gap-2 md:gap-3 shadow-2xl border-none cursor-pointer text-white italic transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Créer un nouveau plan d'action qualité"
          >
            <Plus size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> 
            <span className="hidden sm:inline">Nouveau Plan</span>
          </button>
        </div>
      </header>

      {/* 📊 KPI DASHBOARD */}
      <section className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pb-0 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" aria-label="Statistiques des plans d'action">
        <KPICard title="Actions Totales" value={data?.total || 0} icon={Target} color="indigo" sub="Volume SMI" />
        <KPICard title="Retards Critiques" value={data?.enRetard?.length || 0} icon={ShieldAlert} color="red" sub="Alerte §10.2" />
        <KPICard title="Efficacité" value={`${data?.tauxEfficacite || 0}%`} icon={CheckCircle2} color="emerald" sub="Performance" />
        <KPICard title="Charge Pilotes" value={data?.chargeTravail?.length || 0} icon={Users} color="blue" sub="Ressources" />
      </section>

      {/* 📋 WORKZONE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pt-0 md:pt-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 lg:gap-8 pb-10 md:pb-16 lg:pb-20">
          
          {/* Liste des PAQ */}
          <section className="col-span-12 xl:col-span-8 space-y-4 md:space-y-6 text-left">
            <h2 className="text-[10px] md:text-[11px] text-slate-500 tracking-widest m-0 mb-3 md:mb-4 italic flex items-center gap-2 md:gap-3">
              <LayoutGrid size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
              Plans Annuels Scellés
            </h2>
            <article className="bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] overflow-hidden shadow-2xl divide-y divide-white/5" role="list" aria-label="Liste des plans annuels">
              {paqs.length > 0 ? paqs.map((paq) => (
                <div 
                  key={paq.PAQ_Id} 
                  onClick={() => router.push(`/dashboard/paq/${paq.PAQ_Id}`)} 
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push(`/dashboard/paq/${paq.PAQ_Id}`); }}
                  className="p-4 md:p-6 lg:p-8 hover:bg-white/5 transition-all cursor-pointer flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 group focus-within:bg-white/5 focus:outline-none"
                  role="listitem"
                  tabIndex={0}
                  aria-label={`Plan d'action: ${paq.PAQ_Title}`}
                >
                  <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                    <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-2xl md:rounded-3xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex flex-col items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                      <span className="text-[7px] md:text-[8px] font-black opacity-60">AN</span>
                      <span className="text-lg md:text-xl lg:text-2xl font-black leading-none">{paq.PAQ_Year}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg md:text-xl lg:text-2xl m-0 tracking-tighter group-hover:text-indigo-400 transition-colors uppercase italic truncate">{paq.PAQ_Title}</h3>
                      <p className="text-[8px] md:text-[9px] text-slate-500 mt-1 md:mt-2 m-0 tracking-widest uppercase truncate">{paq.Processus?.PR_Libelle || 'Global SMI'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:gap-6 lg:gap-8 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right hidden sm:block min-w-[120px]">
                      <p className="text-[9px] md:text-[10px] text-slate-500 m-0 tracking-widest italic uppercase">Taux d&apos;avancement</p>
                      <div className="w-24 md:w-32 h-1.5 bg-black/40 rounded-full mt-1 md:mt-2 overflow-hidden border border-white/5" role="progressbar" aria-valuenow={65} aria-valuemin={0} aria-valuemax={100}>
                        <div className="h-full bg-indigo-500" style={{ width: '65%' }} aria-hidden="true" />
                      </div>
                    </div>
                    <ArrowRight size={20} className="w-5 h-5 md:w-6 md:h-6 text-slate-800 group-hover:text-white group-hover:translate-x-1 md:group-hover:translate-x-2 transition-all" aria-hidden="true" />
                  </div>
                </div>
              )) : (
                <div className="p-16 md:p-20 text-center opacity-20" role="status">
                  <Target size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mx-auto mb-3 md:mb-4" aria-hidden="true" />
                  <p className="text-[10px] md:text-[11px] tracking-widest">Aucun plan d&apos;action enregistré</p>
                </div>
              )}
            </article>
          </section>

          {/* Radar Urgences & Charge */}
          <aside className="col-span-12 xl:col-span-4 space-y-4 md:space-y-6 lg:space-y-8 flex flex-col">
            <article className="bg-[#0F172A] border-2 border-red-600/20 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[3rem] shadow-2xl flex flex-col gap-4 md:gap-6 lg:gap-8 relative overflow-hidden">
               <ShieldAlert className="absolute -right-2 md:-right-4 -top-2 md:-top-4 opacity-5 text-red-600 w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28" aria-hidden="true" />
               <h3 className="text-[10px] md:text-[11px] text-red-400 tracking-widest m-0 italic flex items-center gap-2 md:gap-3 uppercase font-black">
                 <ShieldAlert size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
                 Radar Retards §10.2
               </h3>
               <div className="space-y-3 md:space-y-4" role="list" aria-label="Liste des actions en retard">
                 {data?.enRetard && data.enRetard.length > 0 ? data.enRetard.slice(0, 4).map((action) => (
                   <div key={action.ACT_Id} className="bg-black/40 border border-white/5 p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl flex justify-between items-center group hover:border-red-600/40 transition-all" role="listitem">
                     <div className="text-left min-w-0">
                       <p className="text-[9px] md:text-[10px] text-red-400 m-0 tracking-widest uppercase mb-0.5 md:mb-1 font-black">
                         Exp: {new Date(action.ACT_Deadline).toLocaleDateString('fr-SN')}
                       </p>
                       <p className="text-[10px] md:text-xs m-0 italic truncate w-32 md:w-40 text-slate-300">{action.ACT_Title}</p>
                     </div>
                     <button 
                       type="button"
                       onClick={() => setEditingAction(action)} 
                       className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl border-none cursor-pointer text-slate-600 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                       aria-label={`Rectifier l'action: ${action.ACT_Title}`}
                     >
                       <Edit3 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
                     </button>
                   </div>
                 )) : (
                   <p className="text-[9px] md:text-[10px] text-slate-600 text-center py-4">Aucun retard détecté</p>
                 )}
               </div>
            </article>

            <article className="bg-[#0F172A] border-2 border-indigo-600/10 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[3rem] shadow-2xl flex flex-col gap-4 md:gap-6 lg:gap-8 flex-1">
               <h3 className="text-[10px] md:text-[11px] text-indigo-400 tracking-widest m-0 italic flex items-center gap-2 md:gap-3 uppercase font-black">
                 <BarChart3 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
                 Charge par Pilote
               </h3>
               <div className="space-y-4 md:space-y-6" role="list" aria-label="Charge de travail par pilote">
                 {data?.chargeTravail && data.chargeTravail.map((pilot, i) => (
                    <div key={i} className="space-y-1 md:space-y-2" role="listitem">
                      <div className="flex justify-between items-end italic">
                        <span className="text-[9px] md:text-[10px] text-slate-400 tracking-widest truncate w-24 md:w-32 lg:w-40">{pilot.name}</span>
                        <span className="text-lg md:text-xl leading-none">{pilot.count}</span>
                      </div>
                      <div className="h-1 bg-black/40 rounded-full overflow-hidden" role="progressbar" aria-valuenow={(pilot.count / (data.total || 1)) * 100} aria-valuemin={0} aria-valuemax={100}>
                        <div className="h-full bg-indigo-500" style={{ width: `${(pilot.count / (data.total || 1)) * 100}%` }} aria-hidden="true" />
                      </div>
                    </div>
                 ))}
               </div>
            </article>
          </aside>
        </div>
      </main>

      {/* 📟 DRAWER DE RECTIFICATION */}
      {editingAction && typeof window !== 'undefined' && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setEditingAction(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-lg bg-[#0F172A] border-l-2 border-indigo-600/30 h-full p-6 md:p-8 lg:p-12 flex flex-col shadow-2xl animate-in slide-in-from-right duration-500 text-left overflow-y-auto">
             <header className="flex justify-between items-center mb-8 md:mb-10 lg:mb-12">
               <h2 id="drawer-title" className="text-2xl md:text-3xl tracking-tighter m-0 uppercase italic">Rectifier <span className="text-indigo-400">Action</span></h2>
               <button 
                 type="button"
                 onClick={() => setEditingAction(null)} 
                 className="p-2 md:p-3 lg:p-4 text-slate-500 hover:text-white bg-transparent border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
                 aria-label="Fermer le drawer"
               >
                 <X size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
               </button>
             </header>
             <form onSubmit={handleRectifyAction} className="space-y-6 md:space-y-8 lg:space-y-10">
                <div className="space-y-2 md:space-y-3">
                  <label htmlFor="action-title" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest block">TITRE DE L&apos;ACTION *</label>
                  <input 
                    id="action-title"
                    name="title"
                    defaultValue={editingAction.ACT_Title}
                    className="w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-5 lg:p-6 text-[10px] md:text-sm font-black text-white outline-none focus:border-indigo-600 uppercase italic"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2 md:space-y-3">
                    <label htmlFor="action-priority" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest block">PRIORITÉ</label>
                    <select 
                      id="action-priority"
                      name="priority"
                      defaultValue={editingAction.ACT_Priority}
                      className="w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-5 lg:p-6 text-[10px] md:text-xs text-white outline-none appearance-none cursor-pointer"
                    >
                      <option value="URGENT" className="bg-[#0B0F1A]">URGENT</option>
                      <option value="HAUTE" className="bg-[#0B0F1A]">HAUTE</option>
                      <option value="MOYENNE" className="bg-[#0B0F1A]">MOYENNE</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <label htmlFor="action-status" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest block">STATUT</label>
                    <select 
                      id="action-status"
                      name="status"
                      defaultValue={editingAction.ACT_Status}
                      className="w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-5 lg:p-6 text-[10px] md:text-xs text-white outline-none appearance-none cursor-pointer"
                    >
                      <option value="EN_COURS" className="bg-[#0B0F1A]">EN_COURS</option>
                      <option value="TERMINEE" className="bg-[#0B0F1A]">TERMINEE</option>
                    </select>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 py-4 md:py-5 lg:py-6 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] text-[10px] md:text-[11px] lg:text-[12px] text-white shadow-2xl border-none cursor-pointer hover:bg-white hover:text-indigo-700 transition-all font-black italic tracking-widest mt-8 md:mt-10 lg:mt-12 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  Sceller la Rectification §10.2
                </button>
             </form>
          </div>
        </div>
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.3);border-radius:10px}:focus-visible{outline:2px solid #6366f1;outline-offset:2px}`}</style>
    </div>
  );
}