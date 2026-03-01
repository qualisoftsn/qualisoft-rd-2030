/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🛰️ MODULE : COCKPIT NŒUD SOUVERAIN
 * -------------------------------------------------------------------------
 * RÔLE : Gestion granulaire d'une instance territoriale.
 * FONCTIONS : Monitoring, Modification d'Identités, Impersonation Master.
 * -------------------------------------------------------------------------
 */

import { matrixApi } from "@/services/matrix.service";
import { Role } from "@/types/elite-sde"; // ✅ Énumérations officielles
import { 
  ArrowLeft, Edit3, Globe, Loader2, RefreshCw, Save, 
  ShieldCheck, UserCheck, Users, X, Activity, Zap
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
        // ✅ On récupère le sous-domaine depuis le domaine scellé
        const domain = tenant?.T_Domain || "app.qualisoft.sn";
        const targetUrl = `https://${domain}/auth/impersonate?token=${data.token}`;
        
        toast.success("Tunnel Ouvert. Redirection...", { id: tid });
        window.location.href = targetUrl;
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
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center italic">
      <Loader2 className="animate-spin text-blue-600 mb-6" size={48} />
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Analyse du Nœud territorial...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-12 italic font-sans text-slate-200">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <button onClick={() => router.push("/admin/matrix")} className="flex items-center gap-4 text-slate-500 hover:text-white font-black uppercase text-[11px] bg-transparent border-none cursor-pointer tracking-[0.3em] transition-all">
            <ArrowLeft size={16} /> Retour Registre
          </button>
          <button onClick={fetchTenantDetails} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-blue-500 cursor-pointer transition-all">
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* CARTE PRINCIPALE */}
          <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] p-16 border border-white/5 shadow-3xl relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 p-20 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
              <ShieldCheck size={400} />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/40">
                    <Zap size={32} className="text-white" />
                 </div>
                 <h1 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">{tenant?.T_Name}</h1>
              </div>
              
              <div className="grid grid-cols-2 gap-10 py-10 border-y border-white/5">
                <div className="space-y-2">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Domaine de scellage</p>
                   <p className="text-xl font-bold text-blue-400">{tenant?.T_Domain}</p>
                </div>
                <div className="space-y-2 text-right">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Leader Assigné</p>
                   <p className="text-xl font-bold text-amber-500">{tenant?.T_CeoName || "MASTER SYSTEM"}</p>
                </div>
              </div>

              <button onClick={handleImpersonate} className="w-full py-8 bg-white text-slate-950 rounded-3xl font-black uppercase text-xs tracking-[0.4em] hover:bg-blue-600 hover:text-white transition-all shadow-3xl cursor-pointer">
                Incarner Administrateur Nœud
              </button>
            </div>
          </div>

          {/* STATS RAPIDES */}
          <div className="bg-white rounded-[4rem] p-16 shadow-3xl flex flex-col justify-center items-center gap-6 border-12 border-slate-900">
            <Users className="text-blue-600" size={80} />
            <div className="text-center">
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Citoyens du Nœud</p>
               <p className="text-9xl font-black italic tracking-tighter leading-none text-slate-950">{tenant?._count?.T_Users || 0}</p>
            </div>
          </div>
        </div>

        {/* REGISTRE DES UTILISATEURS */}
        <div className="bg-slate-900/30 backdrop-blur-3xl rounded-[4rem] border border-white/5 overflow-hidden shadow-3xl">
          <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/5">
             <h3 className="font-black uppercase text-[10px] tracking-[0.4em] text-slate-500 flex items-center gap-4">
               <ShieldCheck size={20} className="text-blue-500" /> Registre d&apos;Identité Nœud
             </h3>
             <button onClick={() => setEditingUser({ U_Email: "", U_FirstName: "", U_LastName: "", U_Role: Role.USER, U_IsActive: true })} className="bg-white text-slate-950 px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
               Enrôler Citoyen
             </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5">
                <tr>
                  <th className="px-12 py-8">Identité Numérique</th>
                  <th className="px-12 py-8 text-center">Rôle Matrix</th>
                  <th className="px-12 py-8 text-right">Contrôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tenant?.T_Users?.map((user: any) => (
                  <tr key={user.U_Id} className="group hover:bg-white/5 transition-all">
                    <td className="px-12 py-10">
                      <p className="font-black uppercase text-white text-lg tracking-tight italic">{user.U_Email}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{user.U_FirstName} {user.U_LastName}</p>
                    </td>
                    <td className="px-12 py-10 text-center">
                       <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase border ${user.U_Role === Role.ADMIN ? "border-amber-500 text-amber-500 bg-amber-500/5" : "border-slate-700 text-slate-400"}`}>
                        {user.U_Role}
                      </span>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <button onClick={() => setEditingUser(user)} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white hover:bg-blue-600 transition-all cursor-pointer">
                        <Edit3 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL D'ÉDITION SOUVERAINE */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-100 flex items-center justify-center p-8">
          <form onSubmit={handleSaveUser} className="bg-[#0F172A] border-2 border-white/10 w-full max-w-3xl rounded-[4rem] p-16 space-y-12 shadow-[0_0_100px_rgba(37,99,235,0.1)]">
            <div className="flex justify-between items-center border-b border-white/5 pb-8">
              <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter">Édition <span className="text-blue-500">Souveraine</span></h2>
              <button type="button" onClick={() => setEditingUser(null)} className="p-3 text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer"><X size={32} /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-8 text-left">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Prénom</label>
                <input required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black italic outline-none focus:border-blue-500" value={editingUser.U_FirstName || ""} onChange={(e) => setEditingUser({ ...editingUser, U_FirstName: e.target.value })} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Nom</label>
                <input required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black italic outline-none focus:border-blue-500" value={editingUser.U_LastName || ""} onChange={(e) => setEditingUser({ ...editingUser, U_LastName: e.target.value })} />
              </div>
              <div className="col-span-2 space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Email Matrix</label>
                <input required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black italic outline-none focus:border-blue-500" value={editingUser.U_Email || ""} onChange={(e) => setEditingUser({ ...editingUser, U_Email: e.target.value })} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Rôle Système</label>
                <select className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black italic outline-none cursor-pointer" value={editingUser.U_Role} onChange={(e) => setEditingUser({ ...editingUser, U_Role: e.target.value })}>
                  {Object.values(Role).map((r) => (
                    <option key={r} value={r} className="bg-slate-900">{r}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button type="submit" className="w-full py-8 bg-white text-slate-950 rounded-3xl font-black uppercase text-xs tracking-[0.4em] hover:bg-blue-600 hover:text-white transition-all shadow-3xl cursor-pointer">
              <Save size={20} className="inline mr-4" /> Sceller les Modifications
            </button>
          </form>
        </div>
      )}
    </div>
  );
}