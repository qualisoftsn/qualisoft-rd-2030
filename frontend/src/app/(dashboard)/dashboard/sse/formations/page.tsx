/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🎓 MODULE : MATRICE DES HABILITATIONS SSE (ISO 45001 §7.2)
 * RÔLE : Suivi des compétences et recyclages obligatoires
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useCallback, useEffect, useState } from "react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { GraduationCap, Clock, RefreshCw, Plus, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_Role?: string;
  U_Actif?: boolean;
}

export interface Formation {
  FOR_Id: string;
  FOR_Title: string;
  FOR_Date: string;
  FOR_Expiry?: string | null;
  FOR_Status?: string;
  FOR_User?: User;
  FOR_Type?: string;
  FOR_IsActive?: boolean;
}

export interface LoadingScreenProps {
  label: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: LoadingScreenProps) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-orange-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFormations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Formation[]>("/formations");
      const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      setFormations(data);
    } catch (error) {
      console.error('❌ Erreur chargement formations:', error);
      toast.error("RUPTURE KERNEL : Registre GPEC inaccessible."); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchFormations(); }, [fetchFormations]);

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Vérification des Habilitations §7.2..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-orange-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 bg-black/40 flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-orange-600 rounded-xl md:rounded-2xl text-white shadow-xl">
              <GraduationCap size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" strokeWidth={2.5} aria-hidden="true" />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic uppercase">
              Habilitations <span className="text-orange-400">& Compétences</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[9px] md:text-[10px] tracking-widest m-0 flex items-center gap-1.5 md:gap-2">
            <ShieldCheck size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-orange-400" aria-hidden="true" /> 
            Management des Aptitudes ISO 45001
          </p>
        </div>
        <button 
          type="button"
          className="bg-orange-600 text-white px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] shadow-xl hover:bg-white hover:text-orange-700 transition-all border-none cursor-pointer active:scale-95 uppercase flex items-center gap-2 md:gap-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
          aria-label="Créer une nouvelle habilitation"
        >
          <Plus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" strokeWidth={4} aria-hidden="true" /> 
          <span className="hidden sm:inline">Nouvelle Habilitation</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <article className="max-w-[100rem] mx-auto bg-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] border-2 border-white/5 overflow-hidden shadow-2xl" aria-labelledby="formations-title">
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse" role="table" aria-label="Registre des habilitations">
               <thead className="bg-black/40">
                 <tr className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-500 tracking-widest italic uppercase border-b border-white/5">
                   <th className="p-4 md:p-6 lg:p-8" scope="col">Collaborateur</th>
                   <th className="p-4 md:p-6 lg:p-8" scope="col">Désignation Habilitation</th>
                   <th className="p-4 md:p-6 lg:p-8" scope="col">Échéance Recyclage</th>
                   <th className="p-4 md:p-6 lg:p-8 text-right" scope="col">Statut Conformité</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {formations.length > 0 ? formations.map((f) => {
                   const isExpired = f.FOR_Expiry ? new Date(f.FOR_Expiry) < new Date() : false;
                   const initials = `${f.FOR_User?.U_FirstName?.[0] || ''}${f.FOR_User?.U_LastName?.[0] || ''}`.toUpperCase();
                   
                   return (
                     <tr key={f.FOR_Id} className="hover:bg-white/5 transition-all group italic font-black focus-within:bg-white/5 focus:outline-none" role="row">
                       <td className="p-4 md:p-6 lg:p-8" role="gridcell">
                         <div className="flex items-center gap-4 md:gap-6">
                           <div 
                             className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-orange-600/10 rounded-xl md:rounded-2xl flex items-center justify-center text-orange-400 shadow-inner group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shrink-0"
                             aria-hidden="true"
                           >
                             {initials}
                           </div>
                           <span className="text-base md:text-lg tracking-tighter uppercase text-white truncate max-w-[150px] md:max-w-[200px]">
                              {f.FOR_User?.U_FirstName} {f.FOR_User?.U_LastName || '—'}
                           </span>
                         </div>
                       </td>
                       <td className="p-4 md:p-6 lg:p-8" role="gridcell">
                          <span className="text-orange-400 text-base md:text-lg uppercase leading-none block">{f.FOR_Title || '—'}</span>
                          <p className="text-[8px] md:text-[9px] text-slate-500 mt-1 md:mt-2 tracking-widest uppercase italic m-0 opacity-60">
                            Délivré : {f.FOR_Date ? new Date(f.FOR_Date).toLocaleDateString('fr-SN') : '—'}
                          </p>
                       </td>
                       <td className="p-4 md:p-6 lg:p-8" role="gridcell">
                          <div className="flex items-center gap-2 md:gap-3">
                            {isExpired ? (
                              <AlertTriangle size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-400 animate-pulse" aria-hidden="true" />
                            ) : (
                              <Clock size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-500" aria-hidden="true" />
                            )}
                            <span className={cn(
                              "text-sm md:text-base",
                              isExpired ? "text-rose-400 underline decoration-rose-500/30" : "text-white"
                            )}>
                              {f.FOR_Expiry ? new Date(f.FOR_Expiry).toLocaleDateString('fr-SN') : 'PERMANENT'}
                            </span>
                          </div>
                       </td>
                       <td className="p-4 md:p-6 lg:p-8 text-right" role="gridcell">
                          <span className={cn(
                            "px-3 md:px-4 lg:px-6 py-1.5 md:py-2 rounded-xl text-[8px] md:text-[9px] font-black italic tracking-widest uppercase border transition-all inline-block",
                            isExpired 
                              ? "bg-rose-600/10 border-rose-500/20 text-rose-400" 
                              : "bg-emerald-600/10 border-emerald-500/20 text-emerald-400"
                          )}>
                            {isExpired ? "Action Requise" : "Conforme"}
                          </span>
                       </td>
                     </tr>
                   );
                 }) : (
                  <tr>
                    <td colSpan={4} className="p-12 md:p-16 lg:p-20 text-center opacity-30" role="status">
                      <GraduationCap size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mx-auto mb-3 md:mb-4" aria-hidden="true" />
                      <p className="text-[10px] md:text-[11px] tracking-widest uppercase">Registre Vierge</p>
                      <p className="text-[9px] md:text-[10px] text-slate-500 mt-2">Aucune habilitation enregistrée</p>
                    </td>
                  </tr>
                 )}
               </tbody>
             </table>
           </div>
        </article>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(249,115,22,0.3);border-radius:10px}:focus-visible{outline:2px solid #f97316;outline-offset:2px}`}</style>
    </div>
  );
}