'use client';

/**
 * 🛰️ MODULE : COCKPIT NŒUD SOUVERAIN (ELITE SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Gestion granulaire d'une instance territoriale (Tenant).
 * FIX : ClickUp Style, Tunnel d'Impersonation, Zéro JSX Namespace Errors.
 * DATE : 06 Mars 2026 | 02:50 GMT
 * -------------------------------------------------------------------------
 */

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Edit3, Loader2, RefreshCw, Save, 
  ShieldCheck, Users, X, Zap, Globe, Fingerprint, Key, Activity
} from "lucide-react";
import { matrixApi } from "@/services/matrix.service";
import { Role } from "@/types/elite-sde";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export default function TenantCockpit() {
  const router = useRouter();
  const { id: tenantId } = useParams() as { id: string };
  const { setLogin } = useAuthStore() as any;

  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);

  const fetchDetails = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const data = await matrixApi.getDetails(tenantId);
      setTenant(data);
    } catch {
      toast.error("Rupture de liaison Kernel.");
    } finally { setLoading(false); }
  }, [tenantId]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  const handleImpersonate = async () => {
    const tid = toast.loading("Calcul du Tunnel d'Incarnation...");
    try {
      const data = await matrixApi.impersonate(tenantId);
      setLogin({ token: data.access_token, user: data.user, isMaster: true });
      toast.success("Tunnel Ouvert.", { id: tid });
      window.location.href = "/dashboard";
    } catch {
      toast.error("Séquence d'incarnation rejetée.", { id: tid });
    }
  };

  if (loading) return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 italic">
      <RefreshCw className="animate-spin text-blue-600" size={60} />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 animate-pulse text-center">Analyse du Nœud territorial...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col p-6 md:p-12 bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full">
      
      {/* 🔝 TOP COMMAND BAR */}
      <header className="shrink-0 flex flex-col xl:flex-row justify-between items-end gap-6 mb-10 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <button onClick={() => router.push("/admin/matrix")} className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer uppercase tracking-widest p-0">
            <ArrowLeft size={16} /> Retour Registre Master
          </button>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none m-0 italic">
            Nœud <span className="text-blue-600">Souverain</span>
          </h1>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] m-0">ID NOEUD : {tenantId.slice(0, 18)}...</p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchDetails} className="p-5 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-blue-500 transition-all cursor-pointer"><RefreshCw size={20} /></button>
          <button onClick={handleImpersonate} className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-[10px] tracking-widest border-none cursor-pointer hover:bg-white hover:text-blue-600 transition-all shadow-2xl flex items-center gap-3">
            <Key size={18} strokeWidth={3} /> INCARNER LE NŒUD
          </button>
        </div>
      </header>

      {/* 📜 DASHBOARD CONTENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar space-y-10 pr-2">
        
        {/* ROW 1: CORE STATS */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 bg-white/5 border border-white/5 p-10 lg:p-14 rounded-[3.5rem] relative overflow-hidden group shadow-inner flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="relative z-10 space-y-8 flex-1">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-900/40 shrink-0"><Zap size={32} className="text-white" /></div>
                <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter italic m-0">{tenant?.T_Name}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/5">
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Domaine Matrix</p>
                   <p className="text-2xl font-black text-blue-400 m-0">{tenant?.T_Domain}.qualisoft.sn</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Responsable Légal</p>
                   <p className="text-2xl font-black text-amber-500 m-0">{tenant?.T_CeoName || "N/A"}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl flex flex-col items-center justify-center gap-2 border-[6px] border-[#0B0F1A] shrink-0 min-w-48 group-hover:scale-105 transition-all">
              <Users className="text-blue-600 mb-2" size={48} strokeWidth={3} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">Citoyens</p>
              <p className="text-6xl font-black italic tracking-tighter text-slate-900 m-0 leading-none">{tenant?._count?.T_Users || 0}</p>
            </div>
          </div>

          <div className="xl:col-span-4 bg-emerald-500/5 border border-emerald-500/20 rounded-[3.5rem] p-10 flex flex-col justify-center gap-6 relative overflow-hidden shadow-inner">
             <Fingerprint className="absolute -left-10 -bottom-10 opacity-5" size={200} />
             <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-black italic text-emerald-500 m-0 flex items-center gap-3 uppercase"><ShieldCheck size={24}/> Intégrité OK</h3>
                <p className="text-[11px] font-black text-slate-500 leading-relaxed uppercase tracking-[0.2em] m-0">Isolation cryptographique activée. Nœud synchronisé avec le Cluster Global RD-2030.</p>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 w-fit">
                   <p className="text-[9px] font-black text-slate-400 uppercase m-0 italic tracking-widest">Plan : {tenant?.T_Plan}</p>
                </div>
             </div>
          </div>
        </div>

        {/* ROW 2: USER REGISTRY */}
        <div className="bg-white/5 border border-white/5 rounded-[4rem] overflow-hidden flex flex-col shadow-2xl">
          <header className="p-8 border-b border-white/5 bg-[#0B0F1A]/50 flex justify-between items-center">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] flex items-center gap-4 m-0 italic">
              <Activity size={18} className="text-blue-500" /> Registre d&apos;Identité Global
            </h3>
            <button 
              onClick={() => setEditingUser({ U_Email: "", U_FirstName: "", U_LastName: "", U_Role: Role.USER, U_IsActive: true })}
              className="bg-white text-slate-950 px-8 py-3 rounded-2xl font-black text-[9px] tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all border-none cursor-pointer active:scale-95"
            >ENRÔLER CITOYEN</button>
          </header>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-180">
              <thead className="bg-[#0B0F1A] text-[10px] font-black text-slate-500 tracking-widest uppercase italic">
                <tr>
                  <th className="p-8">Identité Numérique</th>
                  <th className="p-8 text-center">Autorité</th>
                  <th className="p-8 text-right">Contrôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tenant?.T_Users?.map((user: any) => (
                  <tr key={user.U_Id} className="hover:bg-blue-600/5 group transition-colors italic">
                    <td className="p-8">
                      <p className="text-xl font-black text-white m-0 tracking-tighter group-hover:text-blue-500 transition-colors lowercase italic">{user.U_Email}</p>
                      <p className="text-[10px] text-slate-600 font-bold tracking-widest mt-1 m-0 uppercase italic">{user.U_FirstName} {user.U_LastName}</p>
                    </td>
                    <td className="p-8 text-center">
                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black tracking-widest border uppercase italic ${user.U_Role === Role.ADMIN ? "border-amber-500/30 text-amber-500 bg-amber-500/10" : "border-slate-700 text-slate-500 bg-white/5"}`}>
                        {user.U_Role}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <button onClick={() => setEditingUser(user)} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-white hover:bg-blue-600 transition-all border-none cursor-pointer active:scale-90"><Edit3 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
      `}</style>
    </div>
  );
}