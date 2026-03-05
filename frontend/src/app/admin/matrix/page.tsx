/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : CONSOLE DE CONTRÔLE MATRIX (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Supervision souveraine de la Fédération Qualisoft Elite.
 * FIX : ClickUp Style - Zéro scroll body, Responsive Table.
 * RÉVISION : 04 Mars 2026 | 22:54 GMT
 * -------------------------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import { matrixApi } from '@/services/matrix.service';
import { Tenant } from '@/types/elite-sde';
import { Server, Loader2, Plus, ChevronRight, Activity, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore'; 
import { toast } from 'sonner';
import Link from 'next/link';

export default function MatrixControlPage() {
  const { isAuthenticated, user } = useAuthStore() as any;
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadTenants = async () => {
      try {
        setLoading(true);
        const data = await matrixApi.getTenants() as unknown as Tenant[];
        if (isMounted) setTenants(data || []);
      } catch (error) {
        if (isMounted) toast.error("Rupture de liaison avec le Noyau Matrix");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (isAuthenticated) loadTenants();
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  if (!isAuthenticated || user?.U_Role !== 'SUPER_ADMIN') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-10 gap-6">
        <ShieldCheck className="text-red-500 animate-pulse" size={60} />
        <p className="text-red-500 font-black uppercase tracking-[0.4em] italic text-center m-0">
          Accès Matrix Refusé
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col text-white italic font-sans selection:bg-blue-600/30">
      <div className="flex flex-col h-full space-y-8 md:space-y-12 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/5 pb-8 shrink-0">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-3 text-blue-500 font-black uppercase tracking-[0.4em] text-[9px] md:text-[10px]">
               <Activity size={14} /> Surveillance Globale RD 2026
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none m-0">
              Matrix <span className="text-blue-600">Control</span>
            </h1>
          </div>
          
          <Link href="/admin/matrix/deploy" 
                className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 shrink-0">
            <Plus size={18} /> Nouveau Nœud
          </Link>
        </div>

        {/* TABLE CONTAINER - FLUID HEIGHT */}
        <div className="flex-1 bg-white/5 rounded-4xl md:rounded-[3.5rem] border border-white/5 backdrop-blur-sm shadow-3xl overflow-hidden flex flex-col min-h-0">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse m-0">Synchronisation Kernel...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-200">
                <thead className="bg-[#0B0F1A]/50 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-6 md:px-10 py-6 md:py-8 whitespace-nowrap">Organisation</th>
                    <th className="px-6 md:px-10 py-6 md:py-8 text-center whitespace-nowrap">Plan</th>
                    <th className="px-6 md:px-10 py-6 md:py-8 text-center whitespace-nowrap">Statut</th>
                    <th className="px-6 md:px-10 py-6 md:py-8 text-right whitespace-nowrap">Contrôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tenants.map((t) => (
                    <tr key={t.T_Id} className="group hover:bg-white/5 transition-all">
                      <td className="px-6 md:px-10 py-6 md:py-8">
                        <div className="flex items-center gap-4 md:gap-6">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#0B0F1A] rounded-2xl flex items-center justify-center text-blue-500 border border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                            <Server size={18} />
                          </div>
                          <div className="text-left">
                            <p className="text-lg md:text-xl font-black uppercase tracking-tighter text-white leading-none m-0 mb-1">{t.T_Name}</p>
                            <p className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest italic m-0">{t.T_Domain}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 md:px-10 py-6 md:py-8 text-center">
                        <span className="px-4 py-2 bg-blue-600/10 border border-blue-600/20 text-blue-400 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                          {t.T_Plan}
                        </span>
                      </td>
                      <td className="px-6 md:px-10 py-6 md:py-8 text-center">
                        <div className="flex items-center justify-center gap-2 md:gap-3">
                           <div className={`w-2 h-2 rounded-full shrink-0 ${t.T_IsActive ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-red-500"}`} />
                           <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${t.T_IsActive ? "text-emerald-500" : "text-red-500"}`}>
                             {t.T_SubscriptionStatus}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 md:px-10 py-6 md:py-8 text-right">
                        <Link href={`/admin/matrix/${t.T_Id}`} 
                              className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-[#0B0F1A] border border-white/5 rounded-2xl text-slate-500 hover:text-white hover:bg-blue-600 transition-all active:scale-90 shrink-0">
                          <ChevronRight size={20} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}