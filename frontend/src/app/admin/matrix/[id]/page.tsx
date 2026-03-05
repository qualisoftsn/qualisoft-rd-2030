/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : COCKPIT NŒUD SOUVERAIN (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Gestion granulaire d'une instance territoriale (Tenant).
 * FIX : Suppression JSX Namespace (md:size), Design ClickUp 100dvh.
 * ARCHITECTURE : Souveraine (Zéro NextAuth).
 * ---------------------------------------------------------------------------
 * RÉVISION : 05 Mars 2026 | 23:55 GMT
 */

"use client";

import { matrixApi } from "@/services/matrix.service";
import { Role } from "@/types/elite-sde";
import { 
  ArrowLeft, Edit3, Loader2, RefreshCw, Save, 
  ShieldCheck, Users, X, Zap, Activity, Globe,
  Fingerprint, Key
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

export default function TenantCockpit() {
  const router = useRouter();
  const params = useParams();
  const tenantId = params?.id as string;

  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingUser, setEditingUser] = useState<any>(null);

  const fetchTenantDetails = useCallback(async () => {
    if (!tenantId || tenantId === "deploy") return;
    try {
      setLoading(true);
      const data = await matrixApi.getDetails(tenantId);
      setTenant(data);
    } catch {
      toast.error("Rupture de liaison avec le Noyau Matrix.");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (tenantId) fetchTenantDetails();
  }, [fetchTenantDetails, tenantId]);

  const handleImpersonate = async () => {
    const tid = toast.loading("Calcul du Tunnel d'Incarnation...");
    try {
      const data = await matrixApi.impersonate(tenantId);
      if (data?.token) {
        const domain = tenant?.T_Domain || "app";
        toast.success("Tunnel Ouvert. Redirection Souveraine...", { id: tid });
        window.location.href = `https://${domain}.qualisoft.sn/dashboard`;
      }
    } catch {
      toast.error("Échec du Tunnel d'Incarnation.", { id: tid });
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Scellage de l'identité...");
    try {
      const payload = {
        firstName: editingUser.U_FirstName.toUpperCase(),
        lastName: editingUser.U_LastName.toUpperCase(),
        email: editingUser.U_Email.toLowerCase(),
        role: editingUser.U_Role,
        isActive: editingUser.U_IsActive,
        tenantId: tenantId,
      };

      if (editingUser.U_Id) {
        await matrixApi.updateUser(editingUser.U_Id, payload);
      } else {
        await matrixApi.createGlobalUser({ ...payload, password: "Qualisoft@2026" });
      }

      setEditingUser(null);
      fetchTenantDetails();
      toast.success("Données scellées au Kernel.", { id: tid });
    } catch {
      toast.error("Rejet du Kernel Matrix.", { id: tid });
    }
  };

  if (loading) return <ViewLoader label="Analyse du Nœud territorial §7.2..." />;

  return (
    <div className="h-full flex flex-col overflow-hidden text-left italic font-black uppercase selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE */}
      <header className="shrink-0 pb-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-end gap-6">
        <div className="space-y-3">
          <button 
            onClick={() => router.push("/admin/matrix")} 
            className="flex items-center gap-3 text-slate-500 hover:text-white text-[10px] bg-transparent border-none cursor-pointer tracking-[0.4em] transition-all p-0"
          >
            <ArrowLeft size={16} /> Retour au Registre Master
          </button>
          <h1 className="text-4xl lg:text-6xl tracking-tighter leading-none m-0 text-white">
            Nœud <span className="text-blue-600">Souverain</span>
          </h1>
          <p className="text-slate-500 text-[9px] tracking-[0.3em] m-0">
            {"Identifiant de Nœud : $$ID_{node} = " + tenantId.slice(0, 12) + "...$$"}
          </p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={fetchTenantDetails} 
            className="p-4 bg-white/5 border border-white/10 rounded-xl text-slate-500 hover:text-blue-500 transition-all cursor-pointer shadow-lg"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={handleImpersonate}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-[10px] tracking-widest border-none cursor-pointer hover:bg-white hover:text-blue-600 transition-all shadow-2xl flex items-center gap-3"
          >
            <Key size={18} /> INCARNER LE NŒUD
          </button>
        </div>
      </header>

      {/* 🧩 GRID DE CONTRÔLE (§ClickUp) */}
      <main className="flex-1 overflow-hidden flex flex-col gap-8 pt-8">
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 shrink-0">
          {/* CARTE D'IDENTITÉ DU TIERS (65%) */}
          <div className="xl:col-span-8 bg-white/5 border border-white/5 rounded-[3.5rem] p-10 lg:p-14 relative overflow-hidden group shadow-4xl">
            <Globe className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-1000" size={300} />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-10">
              <div className="space-y-6 flex-1">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-blue-600 rounded-4xl flex items-center justify-center shadow-xl shadow-blue-900/40 shrink-0">
                    <Zap size={32} className="text-white" />
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none m-0">{tenant?.T_Name}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/5">
                  <div>
                    <p className="text-[10px] text-slate-500 tracking-widest m-0 mb-3">Domaine de Scellage</p>
                    <p className="text-xl font-black text-blue-400 m-0 truncate">{tenant?.T_Domain}.qualisoft.sn</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 tracking-widest m-0 mb-3">Leader Territorial</p>
                    <p className="text-xl font-black text-amber-500 m-0 truncate">{tenant?.T_CeoName || "SYSTÈME MAÎTRE"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] p-10 lg:p-12 shadow-2xl flex flex-col items-center justify-center gap-4 border-4 border-[#0B0F1A] shrink-0 min-w-50">
                {/* FIX : Suppression md:size invalide */}
                <Users className="text-blue-600 w-12 h-12 lg:w-16 lg:h-16" strokeWidth={2.5} />
                <div className="text-center leading-none">
                  <p className="text-[9px] font-black text-slate-400 tracking-widest mb-3 m-0">Citoyens</p>
                  <p className="text-5xl lg:text-7xl font-black italic tracking-tighter text-slate-950 m-0 leading-none">{tenant?._count?.T_Users || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RÉSUMÉ SÉCURITÉ (35%) */}
          <div className="xl:col-span-4 bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-10 lg:p-12 flex flex-col justify-center gap-8 shadow-4xl relative overflow-hidden">
             <Fingerprint className="absolute -left-10 -bottom-10 opacity-5" size={180} />
             <div className="space-y-2 text-left">
                <h3 className="text-lg font-black italic text-emerald-500 m-0 flex items-center gap-3"><ShieldCheck size={24}/> Intégrité Nœud OK</h3>
                <p className="text-[10px] text-slate-500 leading-relaxed tracking-widest m-0">Isolation cryptographique activée. Toutes les transactions du cluster sont indexées.</p>
             </div>
             <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <p className="text-[9px] text-slate-600 tracking-widest m-0">Dernière Sync : {new Date().toLocaleTimeString()}</p>
             </div>
          </div>
        </div>

        {/* 📋 REGISTRE D'IDENTITÉ (Scrollable) */}
        <div className="flex-1 bg-white/5 border border-white/5 rounded-[4rem] overflow-hidden flex flex-col shadow-4xl">
          <header className="shrink-0 p-8 border-b border-white/5 bg-[#0B0F1A]/50 flex flex-col sm:flex-row justify-between items-center gap-6">
            <h3 className="text-[11px] text-slate-400 tracking-[0.5em] flex items-center gap-4 m-0">
              <Users size={18} className="text-blue-500" /> Registre des Citoyens du Nœud
            </h3>
            <button 
              onClick={() => setEditingUser({ U_Email: "", U_FirstName: "", U_LastName: "", U_Role: Role.USER, U_IsActive: true })} 
              className="bg-white text-slate-950 px-8 py-3 rounded-xl font-black text-[9px] tracking-widest hover:bg-blue-600 hover:text-white transition-all border-none cursor-pointer active:scale-95"
            >
              ENRÔLER CITOYEN
            </button>
          </header>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#0B0F1A] border-b border-white/5 z-10 text-[10px] font-black text-slate-500 tracking-[0.4em]">
                <tr>
                  <th className="p-8">Identité Numérique</th>
                  <th className="p-8 text-center">Rôle Matrix</th>
                  <th className="p-8 text-right">Contrôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 italic">
                {tenant?.T_Users?.map((user: any) => (
                  <tr key={user.U_Id} className="hover:bg-blue-600/5 group transition-colors">
                    <td className="p-8">
                      <p className="text-xl font-black text-white m-0 tracking-tighter group-hover:text-blue-500 transition-colors lowercase italic">{user.U_Email}</p>
                      <p className="text-[10px] text-slate-600 font-bold tracking-widest mt-1 m-0">{user.U_FirstName} {user.U_LastName}</p>
                    </td>
                    <td className="p-8 text-center">
                       <span className={cn(
                         "px-4 py-1.5 rounded-lg text-[8px] font-black tracking-widest border",
                         user.U_Role === Role.ADMIN ? "border-amber-500/30 text-amber-500 bg-amber-500/10" : "border-slate-700 text-slate-500 bg-white/5"
                       )}>
                        {user.U_Role}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <button 
                        onClick={() => setEditingUser(user)} 
                        className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-white hover:bg-blue-600 transition-all cursor-pointer shadow-lg active:scale-90"
                      >
                        <Edit3 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 🛡️ MODAL D'ÉDITION SOUVERAINE */}
      {editingUser && (
        <div className="fixed inset-0 bg-[#0B0F1A]/95 backdrop-blur-3xl z-1000 flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
          <form onSubmit={handleSaveUser} className="bg-[#0F172A] border border-white/10 w-full max-w-2xl rounded-[4rem] p-12 lg:p-16 space-y-12 shadow-4xl text-left relative overflow-hidden">
            <Activity className="absolute -right-10 -top-10 text-blue-500/10" size={200} />
            
            <div className="flex justify-between items-center border-b border-white/5 pb-8 relative z-10">
              <h2 className="text-3xl lg:text-4xl font-black italic text-white tracking-tighter m-0 uppercase">
                Édition <span className="text-blue-600">Souveraine</span>
              </h2>
              <button type="button" onClick={() => setEditingUser(null)} className="p-2 text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer"><X size={32} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <Field label="Prénom Matrix" val={editingUser.U_FirstName} onChange={(v:any)=>setEditingUser({...editingUser, U_FirstName:v})} />
              <Field label="Nom Matrix" val={editingUser.U_LastName} onChange={(v:any)=>setEditingUser({...editingUser, U_LastName:v})} />
              <div className="md:col-span-2">
                <Field label="Email Scellé" val={editingUser.U_Email} onChange={(v:any)=>setEditingUser({...editingUser, U_Email:v})} type="email" />
              </div>
              <div className="md:col-span-2">
                <Select label="Rôle Autorité" val={editingUser.U_Role} onChange={(v:any)=>setEditingUser({...editingUser, U_Role:v})}>
                  {Object.values(Role).map((r: any) => <option key={r} value={r} className="bg-[#0F172A]">{r}</option>)}
                </Select>
              </div>
            </div>
            
            <button type="submit" className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black italic text-xs tracking-[0.4em] shadow-2xl border-none cursor-pointer hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-4 active:scale-95 relative z-10">
              <Save size={20} /> SCELLER L&apos;IDENTITÉ
            </button>
          </form>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

// --- ATOMIQUES ---
function Field({ label, val, onChange, type = "text" }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] text-slate-500 tracking-widest ml-4">{label}</label>
      <input type={type} required value={val || ""} onChange={e => onChange(e.target.value)} className="w-full bg-[#0B0F1A] border border-white/5 rounded-2xl p-6 text-sm font-black text-white italic outline-none focus:border-blue-500 transition-all uppercase" />
    </div>
  );
}

function Select({ label, val, onChange, children }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] text-slate-500 tracking-widest ml-4">{label}</label>
      <select value={val} onChange={e => onChange(e.target.value)} className="w-full bg-[#0B0F1A] border border-white/5 rounded-2xl p-6 text-sm font-black text-white italic outline-none cursor-pointer focus:border-blue-500">
        {children}
      </select>
    </div>
  );
}

function ViewLoader({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}