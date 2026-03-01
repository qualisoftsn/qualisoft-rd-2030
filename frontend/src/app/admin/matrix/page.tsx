/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : CONSOLE DE CONTRÔLE MATRIX
 * -------------------------------------------------------------------------
 * RÔLE : Supervision souveraine de la Fédération Qualisoft Elite.
 * FIX : Cast explicite (as Tenant[]) pour résoudre l'erreur de typage.
 * DATE : 01 Mars 2026 | 14:15 GMT
 * -------------------------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import { matrixApi } from '@/services/matrix.service';
import { Tenant } from '@/types/elite-sde';
import { Server, Loader2, Plus, ChevronRight, Activity, ShieldCheck, Globe } from 'lucide-react';
import { useAuthStore } from '@/store/authStore'; 
import { toast } from 'sonner';
import Link from 'next/link';

export default function MatrixControlPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const loadTenants = async () => {
      try {
        setLoading(true);
        // ✅ Forçage du type pour lever l'ambiguïté TypeScript
        const data = await matrixApi.getTenants() as unknown as Tenant[];
        
        if (isMounted) {
          setTenants(data || []);
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Rupture de liaison avec le Noyau Matrix");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (isAuthenticated) {
      loadTenants();
    }

    return () => { isMounted = false; };
  }, [isAuthenticated]);

  if (!isAuthenticated || user?.U_Role !== 'SUPER_ADMIN') {
    return (
      <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center p-10 gap-6">
        <ShieldCheck className="text-red-500 animate-pulse" size={60} />
        <p className="text-red-500 font-black uppercase tracking-[0.4em] italic text-center">
          Accès Matrix Refusé : Autorité Insuffisante
        </p>
      </div>
    );
  }

  return (
    <div className="p-12 bg-[#0B0F1A] min-h-screen text-white italic font-sans selection:bg-blue-600/30">
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-12">
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3 text-blue-500 font-black uppercase tracking-[0.4em] text-[10px]">
               <Activity size={14} /> Surveillance Globale RD 2026
            </div>
            <h1 className="text-7xl font-black uppercase tracking-tighter italic leading-none">
              Matrix <span className="text-blue-600">Control</span>
            </h1>
          </div>
          
          <Link href="/admin/matrix/deploy" 
                className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-4 hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95">
            <Plus size={20} /> Déployer Nouveau Nœud
          </Link>
        </div>

        <div className="bg-slate-900/40 rounded-[3.5rem] p-1 border border-white/5 backdrop-blur-3xl shadow-3xl overflow-hidden">
          {loading ? (
            <div className="py-32 flex flex-col items-center gap-6">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest animate-pulse">Synchronisation Kernel...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                  <tr>
                    <th className="px-10 py-8">Organisation</th>
                    <th className="px-10 py-8 text-center">Plan</th>
                    <th className="px-10 py-8 text-center">Statut</th>
                    <th className="px-10 py-8 text-right">Contrôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tenants.map((t) => (
                    <tr key={t.T_Id} className="group hover:bg-white/3 transition-all">
                      <td className="px-10 py-10">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-blue-500 border border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Server size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-2xl font-black uppercase tracking-tighter text-white leading-none mb-2">{t.T_Name}</p>
                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic">{t.T_Domain}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-10 text-center">
                        <span className="px-5 py-2 bg-blue-600/10 border border-blue-600/20 text-blue-500 rounded-xl text-[9px] font-black uppercase tracking-widest">
                          {t.T_Plan}
                        </span>
                      </td>
                      <td className="px-10 py-10 text-center">
                        <div className="flex items-center justify-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${t.T_IsActive ? "bg-emerald-500 shadow-[0_0_12px_#10b981]" : "bg-red-500"}`} />
                           <span className={`text-[10px] font-black uppercase tracking-widest ${t.T_IsActive ? "text-emerald-500" : "text-red-500"}`}>
                             {t.T_SubscriptionStatus}
                           </span>
                        </div>
                      </td>
                      <td className="px-10 py-10 text-right">
                        <Link href={`/admin/matrix/${t.T_Id}`} 
                              className="inline-flex items-center justify-center w-12 h-12 bg-white/5 rounded-2xl text-slate-600 hover:text-white hover:bg-blue-600 transition-all active:scale-90">
                          <ChevronRight size={22} />
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