/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : ANALYSEUR DE SEGMENT HIÉRARCHIQUE (ISO 9001 §5.3)
 * RÔLE : Analyse granulaire d'une Unité Organique SMI
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Users, ArrowLeft, ShieldCheck, MapPin, 
  RefreshCw, Briefcase, Network, Calendar, Edit3
} from 'lucide-react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface OrgUnitType {
  OUT_Id: string;
  OUT_Label: string;
  OUT_Description?: string;
}

export interface Site {
  SI_Id: string;
  SI_Name: string;
  SI_Location?: string;
  SI_IsActive?: boolean;
}

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_Role?: string;
  U_Actif?: boolean;
}

export interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_Description?: string;
  PR_IsActive?: boolean;
}

export interface OrgUnit {
  OU_Id: string;
  OU_Name: string;
  OU_Code: string;
  OU_Type?: OrgUnitType;
  OU_ParentId?: string;
  OU_SiteId?: string;
  OU_Site?: Site;
  OU_IsActive: boolean;
  OU_CreatedAt: string;
  OU_Users?: User[];
  OU_Processus?: Processus[];
  OU_Children?: OrgUnit[];
}

export interface NodeStatProps {
  label: string;
  val: number;
  icon: React.ElementType;
  color: 'blue' | 'amber' | 'emerald';
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : NODE STAT
// ============================================================================

function NodeStat({ label, val, icon: Icon, color }: NodeStatProps) {
  const colors: Record<NodeStatProps['color'], string> = { 
    blue: "text-blue-400", 
    amber: "text-amber-400", 
    emerald: "text-emerald-400" 
  };
  
  return (
    <article className="bg-[#0F172A] border-2 border-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl flex items-center gap-4 md:gap-6 md:gap-8 shadow-2xl transition-all hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-400">
       <div className={cn(
         "w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-2xl md:rounded-3xl bg-white/5 flex items-center justify-center border border-white/5",
         colors[color]
       )}>
         <Icon size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden="true" />
       </div>
       <div className="text-left space-y-0.5 md:space-y-1">
          <p className="text-3xl md:text-4xl font-black italic m-0 tracking-tighter leading-none text-white">{val}</p>
          <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest m-0 uppercase italic">{label}</p>
       </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function UnitDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [unit, setUnit] = useState<OrgUnit | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<OrgUnit>(`/org-units/${id}`);
      setUnit(res.data?.data || res.data || null);
    } catch (error) {
      console.error('❌ Erreur chargement unité:', error);
      toast.error("NODE INTROUVABLE DANS LA MATRIX");
      router.push("/dashboard/organization");
    } finally { 
      setLoading(false); 
    }
  }, [id, router]);

  useEffect(() => { if (typeof window !== 'undefined') fetchDetail(); }, [fetchDetail]);

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Scan du Node Organisationnel..." />;
  }

  if (!unit) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status">
        <ShieldCheck className="text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Unité introuvable</p>
        <button 
          type="button"
          onClick={() => router.push("/dashboard/organization")}
          className="mt-4 text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
        >
          Retour au cockpit
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 mt-12 lg:mt-0">
        <button 
          type="button"
          onClick={() => router.push("/dashboard/organization")} 
          className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer italic tracking-widest mb-4 md:mb-6 lg:mb-8 uppercase focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
          aria-label="Retour au cockpit architecture"
        >
          <ArrowLeft size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
          <span className="hidden sm:inline">Cockpit Architecture</span>
        </button>
        
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 md:gap-8 lg:gap-10">
          <div className="space-y-3 md:space-y-4 text-left w-full xl:w-auto">
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <span className="bg-blue-600/10 border border-blue-500/20 px-3 md:px-4 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[9px] text-blue-400 tracking-widest">
                {unit.OU_Type?.OUT_Label || 'UNITÉ'}
              </span>
              {unit.OU_IsActive && (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 md:px-4 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[9px] flex items-center gap-1.5 md:gap-2 tracking-widest">
                  <ShieldCheck size={12} className="w-3 h-3" aria-hidden="true" /> 
                  Conforme §5.3
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic">
              {unit.OU_Name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-[8px] md:text-[9px] lg:text-[10px] text-slate-500 tracking-widest uppercase italic">
               <span className="flex items-center gap-1.5 md:gap-2">
                 <MapPin size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-400" aria-hidden="true" /> 
                 {unit.OU_Site?.S_Name || 'NON DÉPLOYÉ'}
               </span>
               <span className="flex items-center gap-1.5 md:gap-2">
                 <Calendar size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" /> 
                 Créé le {new Date(unit.OU_CreatedAt).toLocaleDateString('fr-SN')}
               </span>
            </div>
          </div>
          <button 
            type="button"
            className="bg-blue-600 hover:bg-white hover:text-blue-700 px-4 md:px-6 lg:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl text-[9px] md:text-[10px] transition-all border-none cursor-pointer italic font-black uppercase shadow-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full xl:w-auto"
            aria-label="Modifier cette unité organisationnelle"
          >
            <Edit3 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 inline mr-1.5 md:mr-2" aria-hidden="true" />
            Éditer Node Matrix
          </button>
        </div>
      </header>

      {/* 📊 KPI ROW */}
      <section className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pb-0 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8" aria-label="Statistiques de l'unité">
         <NodeStat label="Citoyens Rattachés" val={unit.OU_Users?.length || 0} icon={Users} color="blue" />
         <NodeStat label="Périmètre Processus" val={unit.OU_Processus?.length || 0} icon={Briefcase} color="amber" />
         <NodeStat label="Nodes Enfants" val={unit.OU_Children?.length || 0} icon={Network} color="emerald" />
      </section>

      {/* 🧩 SPLIT VIEW */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pt-0 md:pt-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 lg:gap-8 pb-10 md:pb-16 lg:pb-20">
          
          {/* Registre Équipe */}
          <aside className="col-span-12 xl:col-span-4 bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-4 md:p-6 lg:p-10 shadow-2xl flex flex-col gap-4 md:gap-6 lg:gap-8 h-[500px] md:h-[500px]">
             <h3 className="text-[10px] md:text-[11px] text-blue-400 tracking-widest m-0 italic flex items-center gap-2 md:gap-3">
               <Users size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
               Registre Équipe
             </h3>
             <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-4 space-y-3 md:space-y-4" role="list" aria-label="Liste des membres de l'équipe">
               {unit.OU_Users && unit.OU_Users.length > 0 ? unit.OU_Users.map((u) => (
                 <article 
                   key={u.U_Id} 
                   className="bg-black/40 border border-white/5 p-4 md:p-5 rounded-2xl md:rounded-3xl flex items-center gap-3 md:gap-4 lg:gap-5 group cursor-pointer hover:border-blue-500/40 transition-all focus-within:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                   role="listitem"
                   tabIndex={0}
                   aria-label={`${u.U_FirstName} ${u.U_LastName} - ${u.U_Role || 'Utilisateur'}`}
                 >
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600/10 text-blue-400 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-[10px] md:text-xs border border-blue-500/20 shrink-0">
                      {u.U_FirstName?.[0]}{u.U_LastName?.[0]}
                    </div>
                    <div className="text-left min-w-0">
                       <p className="text-[10px] md:text-xs m-0 leading-none mb-0.5 md:mb-1 text-white group-hover:text-blue-400 truncate">{u.U_FirstName} {u.U_LastName}</p>
                       <p className="text-[7px] md:text-[8px] text-slate-600 m-0 uppercase italic tracking-widest truncate">{u.U_Role || 'Utilisateur'}</p>
                    </div>
                 </article>
               )) : (
                 <div className="h-full flex flex-col items-center justify-center text-slate-600" role="status">
                   <Users size={32} className="w-8 h-8 md:w-10 md:h-10 mb-2 md:mb-3 opacity-20" aria-hidden="true" />
                   <p className="text-[8px] md:text-[9px] tracking-widest">Aucun membre</p>
                 </div>
               )}
             </div>
          </aside>

          {/* Maillage Processus */}
          <section className="col-span-12 xl:col-span-8 bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-4 md:p-6 lg:p-10 shadow-2xl flex flex-col gap-4 md:gap-6 lg:gap-8 h-[500px] md:h-[500px]">
             <h3 className="text-[10px] md:text-[11px] text-amber-400 tracking-widest m-0 italic flex items-center gap-2 md:gap-3">
               <Briefcase size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
               Maillage Processus
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 overflow-y-auto custom-scrollbar pr-1 md:pr-2 lg:pr-4" role="list" aria-label="Liste des processus">
                {unit.OU_Processus && unit.OU_Processus.length > 0 ? unit.OU_Processus.map((p) => (
                  <article 
                    key={p.PR_Id} 
                    className="bg-black/40 border border-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] flex flex-col justify-between hover:border-amber-500/40 transition-all cursor-pointer group shadow-inner focus-within:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    role="listitem"
                    tabIndex={0}
                    aria-label={`Processus: ${p.PR_Libelle}`}
                    onClick={() => router.push(`/dashboard/processus/${p.PR_Id}`)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push(`/dashboard/processus/${p.PR_Id}`); }}
                  >
                     <span className="px-3 md:px-4 py-1 md:py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-[8px] md:text-[9px] tracking-widest w-fit mb-4 md:mb-6 italic">
                       {p.PR_Code}
                     </span>
                     <h4 className="text-lg md:text-xl lg:text-2xl tracking-tighter leading-none m-0 group-hover:text-amber-400 transition-colors uppercase truncate">
                       {p.PR_Libelle}
                     </h4>
                  </article>
                )) : (
                  <div className="col-span-full h-full flex flex-col items-center justify-center text-slate-600" role="status">
                    <Briefcase size={32} className="w-8 h-8 md:w-10 md:h-10 mb-2 md:mb-3 opacity-20" aria-hidden="true" />
                    <p className="text-[8px] md:text-[9px] tracking-widest">Aucun processus</p>
                  </div>
                )}
             </div>
          </section>

        </div>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}