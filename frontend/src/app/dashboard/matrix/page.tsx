/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : MATRIX COCKPIT (SUPER-ADMIN ONLY)
 * -------------------------------------------------------------------------
 * RÔLE : Surveillance souveraine des nœuds et protocole d'impersonation.
 * LOGIC : Mascarade via injection directe de cookie Qualisoft.
 * DESIGN : 100dvh, Design GPEC, Occupation Intégrale.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 16:15 GMT
 */

"use client";

import { useEffect, useState, useCallback } from 'react';
import { 
  Globe, Users, Zap, Search, ExternalLink, Activity, 
  Crown, RefreshCcw, Building2, Plus
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';

export default function MatrixCockpitPage() {
  const router = useRouter();
  const { setLogin, user } = useAuthStore() as any;
  
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMatrixData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/admin/matrix/tenants');
      setTenants(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("ERREUR DE LIAISON : REGISTRE MASTER INJOINABLE.");
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { 
    if (user?.U_Role === 'SUPER_ADMIN') fetchMatrixData();
    else if (user) router.replace('/dashboard');
  }, [user, fetchMatrixData, router]);

  const handleImpersonate = async (tenantId: string, tenantName: string) => {
    const tid = toast.loading(`Mascarade sur ${tenantName}...`);
    try {
      const res = await apiClient.post(`/admin/matrix/tenants/${tenantId}/impersonate`);
      const { access_token, targetUser } = res.data;
      
      // 🔐 SCELLAGE SOUVERAIN (REMPLACE NEXTAUTH)
      document.cookie = `qualisoft_token=${access_token}; path=/; max-age=3600; Secure; SameSite=Lax`;
      setLogin({ token: access_token, user: targetUser });
      
      toast.success(`ACCÈS MAÎTRE ÉTABLI : ${tenantName}`, { id: tid });
      router.push('/dashboard');
    } catch {
      toast.error("RUPTURE DE PROTOCOLE : KERNERL REJETÉ.", { id: tid });
    }
  };

  if (isLoading) return <LoadingScreen label="Accréditation Matrix Authority..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="shrink-0 p-10 lg:p-14 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center gap-10 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="text-left space-y-4">
          <div className="flex items-center gap-4 px-6 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full w-fit">
            <Crown size={18} className="text-blue-500" /><span className="text-[10px] tracking-[0.5em] text-blue-500">Matrix Authority RD-2026</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter m-0 leading-none">Matrix <span className="text-blue-600">Cockpit</span></h1>
          <p className="text-slate-500 text-xs tracking-widest flex items-center gap-4 m-0">
            <Activity size={16} className="text-emerald-500 animate-pulse" /> {tenants.length} Nœuds actifs détectés dans le cluster.
          </p>
        </div>

        <div className="flex items-center gap-5 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-96 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-all" size={20} />
            <input type="text" placeholder="SCANNER UN NŒUD..." className="w-full bg-black/40 border-2 border-white/5 rounded-3xl py-6 pl-16 pr-8 text-xs font-black italic text-white outline-none focus:border-blue-600" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button className="bg-blue-600 px-10 py-6 rounded-3xl text-[10px] flex items-center gap-3 transition-all shadow-4xl border-none text-white cursor-pointer hover:bg-white hover:text-blue-600"><Plus size={20}/> Nouveau Nœud</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-10 lg:p-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {tenants.filter(t => t.T_Name?.toLowerCase().includes(searchTerm.toLowerCase())).map(tenant => (
            <div key={tenant.T_Id} className="bg-[#151B2B] border-2 border-white/5 rounded-[4.5rem] p-12 hover:border-blue-600/40 transition-all group shadow-4xl relative overflow-hidden flex flex-col justify-between min-h-112.5">
              <div className="absolute -right-10 -top-10 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000"><Building2 size={300} /></div>
              
              <div className="relative z-10 space-y-10 text-left">
                <div className="flex justify-between items-start">
                  <span className={`px-5 py-2 rounded-full text-[9px] border tracking-widest ${tenant.T_IsActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                    ● {tenant.T_IsActive ? 'NŒUD ACTIF' : 'SUSPENDU'}
                  </span>
                  <span className="text-[10px] text-slate-700 tracking-tighter">{tenant.T_Domain}</span>
                </div>

                <div className="space-y-4">
                   <h3 className="text-4xl font-black italic m-0 tracking-tighter leading-none group-hover:text-blue-500 transition-colors uppercase truncate">{tenant.T_Name}</h3>
                   <p className="text-[10px] text-slate-500 tracking-[0.4em] m-0 italic flex items-center gap-3"><Zap size={14} className="text-amber-500" /> PLAN : {tenant.T_Plan}</p>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                   <div className="flex items-center gap-5">
                      <Users size={24} className="text-slate-700" />
                      <div className="flex flex-col"><span className="text-xl leading-none">{tenant._count?.T_Users || 0}</span><span className="text-[8px] text-slate-600 tracking-widest mt-1">COLLAB.</span></div>
                   </div>
                   <div className="flex items-center gap-5">
                      <Globe size={24} className="text-slate-700" />
                      <div className="flex flex-col"><span className="text-xl leading-none">{tenant._count?.T_Sites || 0}</span><span className="text-[8px] text-slate-600 tracking-widest mt-1">SITES</span></div>
                   </div>
                </div>
              </div>

              <div className="relative z-10 flex gap-4 pt-10">
                <button onClick={() => handleImpersonate(tenant.T_Id, tenant.T_Name)} className="flex-1 bg-blue-600 hover:bg-white hover:text-blue-600 py-6 rounded-3xl text-[10px] flex items-center justify-center gap-4 transition-all shadow-4xl border-none cursor-pointer text-white italic">
                  <Zap size={18} fill="currentColor" /> Mascarade Matrix
                </button>
                <button className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-blue-600 transition-all text-slate-500 hover:text-white cursor-pointer"><ExternalLink size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="shrink-0 p-8 border-t border-white/5 opacity-30 text-center">
         <p className="text-[10px] tracking-[0.5em] m-0 italic">Matrix Global Kernel v3.1 — Cluster Dakar-Main-01 — © 2026 SDE Sovereign</p>
      </footer>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.1); border-radius: 10px; }` }} />
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCcw className="animate-spin" size={60} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center">{label}</span>
    </div>
  );
}