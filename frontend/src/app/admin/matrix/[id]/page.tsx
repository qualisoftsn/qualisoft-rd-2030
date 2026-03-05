/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🛰️ MODULE : COCKPIT NŒUD SOUVERAIN (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Gestion granulaire d'une instance territoriale.
 * FIX : ClickUp Style, UI 100% largeur. Modal z-index corrigé.
 * RÉVISION : 04 Mars 2026 | 22:54 GMT
 * -------------------------------------------------------------------------
 */

import { matrixApi } from "@/services/matrix.service";
import { Role } from "@/types/elite-sde";
import { 
  ArrowLeft, Edit3, Loader2, RefreshCw, Save, 
  ShieldCheck, Users, X, Zap
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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
    } catch (err) {
      toast.error("Connexion Matrix Interrompue");
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
        // L'API a émis le cookie Wildcard, on redirige simplement.
        toast.success("Tunnel Ouvert. Redirection...", { id: tid });
        window.location.href = `https://${domain}.qualisoft.sn/dashboard`;
      }
    } catch (err: any) {
      toast.error("Échec du Tunnel Souverain", { id: tid });
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Mise à jour Souveraine...");
    try {
      const payload = {
        firstName: editingUser.U_FirstName,
        lastName: editingUser.U_LastName,
        email: editingUser.U_Email,
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
      toast.success("Données Scellées avec Succès", { id: tid });
    } catch (err: any) {
      toast.error("Rejet du Kernel Matrix", { id: tid });
    }
  };

  if (loading) return (
    <div className="h-full w-full flex flex-col items-center justify-center italic bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-blue-600 mb-6" size={48} />
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse m-0">Analyse du Nœud territorial...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col italic font-sans text-slate-200 selection:bg-blue-600/30">
      <div className="flex flex-col flex-1 space-y-8 animate-in fade-in duration-700 min-h-0">
        
        {/* HEADER */}
        <div className="flex justify-between items-center shrink-0">
          <button onClick={() => router.push("/admin/matrix")} className="flex items-center gap-3 text-slate-500 hover:text-white font-black uppercase text-[10px] md:text-[11px] bg-transparent border-none cursor-pointer tracking-[0.3em] transition-all">
            <ArrowLeft size={16} /> Retour Registre
          </button>
          <button onClick={fetchTenantDetails} className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-500 hover:text-blue-500 hover:bg-white/10 cursor-pointer transition-all border-none">
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 shrink-0">
          
          {/* CARTE PRINCIPALE */}
          <div className="xl:col-span-2 bg-white/5 backdrop-blur-sm rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 p-20 opacity-5 group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none">
              <ShieldCheck size={300} />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                 <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40 shrink-0">
                    <Zap size={28} className="text-white" />
                 </div>
                 <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-none m-0 wrap-break-word">{tenant?.T_Name}</h1>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-white/5">
                <div className="space-y-2">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest m-0">Domaine de scellage</p>
                   <p className="text-lg md:text-xl font-bold text-blue-400 m-0 break-all">{tenant?.T_Domain}</p>
                </div>
                <div className="space-y-2 md:text-right">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest m-0">Leader Assigné</p>
                   <p className="text-lg md:text-xl font-bold text-amber-500 m-0">{tenant?.T_CeoName || "MASTER SYSTEM"}</p>
                </div>
              </div>

              <button onClick={handleImpersonate} className="w-full py-6 md:py-8 bg-white text-slate-950 rounded-4xl font-black uppercase text-[10px] md:text-xs tracking-[0.3em] md:tracking-[0.4em] hover:bg-blue-600 hover:text-white transition-all shadow-xl border-none cursor-pointer active:scale-95">
                Incarner Administrateur Nœud
              </button>
            </div>
          </div>

          {/* STATS RAPIDES */}
          <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl flex flex-col justify-center items-center gap-6 border-8 border-[#0B0F1A]">
            <Users className="text-blue-600" size={60} md:size={80} />
            <div className="text-center">
               <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Citoyens du Nœud</p>
               <p className="text-7xl md:text-9xl font-black italic tracking-tighter leading-none text-slate-950 m-0">{tenant?._count?.T_Users || 0}</p>
            </div>
          </div>
        </div>

        {/* REGISTRE DES UTILISATEURS (Scrollable independent) */}
        <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-[3rem] border border-white/5 overflow-hidden flex flex-col min-h-75">
          <div className="p-6 md:p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0B0F1A]/50 shrink-0">
             <h3 className="font-black uppercase text-[10px] tracking-[0.4em] text-slate-400 flex items-center gap-3 m-0">
               <ShieldCheck size={18} className="text-blue-500 shrink-0" /> Registre d&apos;Identité
             </h3>
             <button onClick={() => setEditingUser({ U_Email: "", U_FirstName: "", U_LastName: "", U_Role: Role.USER, U_IsActive: true })} 
                     className="bg-white text-slate-950 px-8 py-4 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-blue-600 hover:text-white transition-all cursor-pointer border-none w-full sm:w-auto">
               Enrôler Citoyen
             </button>
          </div>
          
          <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-150">
              <thead className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 sticky top-0 bg-[#0B0F1A]/90 backdrop-blur-md">
                <tr>
                  <th className="px-8 py-6">Identité Numérique</th>
                  <th className="px-8 py-6 text-center">Rôle Matrix</th>
                  <th className="px-8 py-6 text-right">Contrôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tenant?.T_Users?.map((user: any) => (
                  <tr key={user.U_Id} className="group hover:bg-white/5 transition-all">
                    <td className="px-8 py-6">
                      <p className="font-black uppercase text-white text-base md:text-lg tracking-tight italic m-0 mb-1">{user.U_Email}</p>
                      <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest m-0">{user.U_FirstName} {user.U_LastName}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase border whitespace-nowrap ${user.U_Role === Role.ADMIN ? "border-amber-500 text-amber-500 bg-amber-500/10" : "border-slate-700 text-slate-400"}`}>
                        {user.U_Role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => setEditingUser(user)} className="p-3 bg-[#0B0F1A] border border-white/5 rounded-xl text-slate-500 hover:text-white hover:bg-blue-600 transition-all cursor-pointer inline-flex items-center justify-center active:scale-90">
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL D'ÉDITION SOUVERAINE (Z-index maximal, centré) */}
      {editingUser && (
        <div className="fixed inset-0 bg-[#0B0F1A]/90 backdrop-blur-md z-100 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <form onSubmit={handleSaveUser} className="bg-[#0F172A] border border-white/10 w-full max-w-2xl rounded-[3rem] p-8 md:p-12 space-y-8 md:space-y-10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h2 className="text-2xl md:text-3xl font-black uppercase italic text-white tracking-tighter m-0">
                Édition <span className="text-blue-500">Souveraine</span>
              </h2>
              <button type="button" onClick={() => setEditingUser(null)} className="p-2 text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer shrink-0"><X size={28} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-left">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-2">Prénom</label>
                <input required className="w-full bg-[#0B0F1A] border border-white/5 p-4 md:p-5 rounded-2xl text-white font-black italic outline-none focus:border-blue-500 transition-colors" value={editingUser.U_FirstName || ""} onChange={(e) => setEditingUser({ ...editingUser, U_FirstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-2">Nom</label>
                <input required className="w-full bg-[#0B0F1A] border border-white/5 p-4 md:p-5 rounded-2xl text-white font-black italic outline-none focus:border-blue-500 transition-colors uppercase" value={editingUser.U_LastName || ""} onChange={(e) => setEditingUser({ ...editingUser, U_LastName: e.target.value })} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-2">Email Matrix</label>
                <input required className="w-full bg-[#0B0F1A] border border-white/5 p-4 md:p-5 rounded-2xl text-white font-black italic outline-none focus:border-blue-500 transition-colors" value={editingUser.U_Email || ""} onChange={(e) => setEditingUser({ ...editingUser, U_Email: e.target.value })} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-2">Rôle Système</label>
                <select className="w-full bg-[#0B0F1A] border border-white/5 p-4 md:p-5 rounded-2xl text-white font-black italic outline-none cursor-pointer focus:border-blue-500 transition-colors" value={editingUser.U_Role} onChange={(e) => setEditingUser({ ...editingUser, U_Role: e.target.value })}>
                  {Object.values(Role).map((r) => (
                    <option key={r} value={r} className="bg-[#0F172A]">{r}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button type="submit" className="w-full py-6 md:py-8 bg-white text-slate-950 rounded-3xl font-black uppercase text-[10px] md:text-xs tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all shadow-xl cursor-pointer border-none flex items-center justify-center gap-3 active:scale-95">
              <Save size={20} className="shrink-0" /> Sceller les Modifications
            </button>
          </form>
        </div>
      )}
    </div>
  );
}