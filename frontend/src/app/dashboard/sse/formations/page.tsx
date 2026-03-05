/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🎓 MODULE : MATRICE DES HABILITATIONS SSE (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Suivi des compétences et recyclages obligatoires.
 * DESIGN : ClickUp High-Density / 100dvh.
 * DATE DE RÉVISION : 05 Mars 2026 | 19:35 GMT
 */

"use client";

import React, { useCallback, useEffect, useState } from "react";
import apiClient from "@/core/api/api-client";
import { GraduationCap, Clock, RefreshCw, Plus, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

export default function FormationsPage() {
  const [formations, setFormations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFormations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/formations");
      const data = res.data?.data || res.data;
      setFormations(Array.isArray(data) ? data : []);
    } catch { 
      toast.error("RUPTURE KERNEL : Registre GPEC inaccessible."); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchFormations(); }, [fetchFormations]);

  if (loading) return <LoadingScreen label="Vérification des Habilitations §7.2..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-orange-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="shrink-0 p-8 border-b border-white/5 bg-black/40 flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-600 rounded-2xl text-white shadow-xl">
              <GraduationCap size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic uppercase">
              Habilitations <span className="text-orange-500">& Compétences</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] m-0 flex items-center gap-2">
            <ShieldCheck size={14} className="text-orange-500" /> Management des Aptitudes ISO 45001
          </p>
        </div>
        <button className="bg-orange-600 text-white px-10 py-5 rounded-2xl font-black text-[10px] shadow-4xl hover:bg-white hover:text-orange-600 transition-all border-none cursor-pointer active:scale-95 uppercase">
          <Plus size={18} strokeWidth={4} className="mr-2 inline" /> Nouvelle Habilitation
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-400 mx-auto bg-white/5 rounded-[4rem] border-2 border-white/5 overflow-hidden shadow-4xl">
           <table className="w-full text-left border-collapse">
             <thead className="bg-black/40">
               <tr className="text-[10px] font-black text-slate-500 tracking-[0.3em] italic uppercase border-b border-white/5">
                 <th className="p-8">Collaborateur</th>
                 <th className="p-8">Désignation Habilitation</th>
                 <th className="p-8">Échéance Recyclage</th>
                 <th className="p-8 text-right">Statut Conformité</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
               {formations.length > 0 ? formations.map((f) => {
                 const isExpired = f.FOR_Expiry && new Date(f.FOR_Expiry) < new Date();
                 return (
                   <tr key={f.FOR_Id} className="hover:bg-white/5 transition-all group italic font-black">
                     <td className="p-8">
                       <div className="flex items-center gap-6">
                         <div className="w-14 h-14 bg-orange-600/10 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
                           {f.FOR_User?.U_FirstName?.[0]}{f.FOR_User?.U_LastName?.[0]}
                         </div>
                         <span className="text-lg tracking-tighter uppercase text-white truncate max-w-50">
                            {f.FOR_User?.U_FirstName} {f.FOR_User?.U_LastName}
                         </span>
                       </div>
                     </td>
                     <td className="p-8">
                        <span className="text-orange-500 text-base uppercase leading-none">{f.FOR_Title}</span>
                        <p className="text-[9px] text-slate-500 mt-2 tracking-widest uppercase italic m-0 opacity-60">Délivré : {new Date(f.FOR_Date).toLocaleDateString()}</p>
                     </td>
                     <td className="p-8">
                        <div className="flex items-center gap-3">
                          {isExpired ? <AlertTriangle size={16} className="text-rose-500 animate-pulse" /> : <Clock size={16} className="text-slate-500" />}
                          <span className={cn("text-sm", isExpired ? "text-rose-500 underline decoration-rose-500/30" : "text-white")}>
                            {f.FOR_Expiry ? new Date(f.FOR_Expiry).toLocaleDateString() : 'PERMANENT'}
                          </span>
                        </div>
                     </td>
                     <td className="p-8 text-right">
                        <span className={cn("px-6 py-2 rounded-xl text-[9px] font-black italic tracking-widest uppercase border transition-all", 
                          isExpired ? "bg-rose-600/10 border-rose-500/20 text-rose-500" : "bg-emerald-600/10 border-emerald-500/20 text-emerald-500"
                        )}>
                          {isExpired ? "Action Requise" : "Conforme"}
                        </span>
                     </td>
                   </tr>
                 );
               }) : (
                <tr>
                  <td colSpan={4} className="p-20 text-center opacity-30">
                    <GraduationCap size={48} className="mx-auto mb-4" />
                    <p className="text-[10px] tracking-widest uppercase">Registre Vierge</p>
                  </td>
                </tr>
               )}
             </tbody>
           </table>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-orange-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}