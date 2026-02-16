/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  ArrowLeft, Building2, Key, Loader2, Edit3, X, UserPlus, 
  Globe, Users, ShieldAlert, UserCheck, ShieldCheck, Mail, Lock
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { matrixApi, TenantDetails, MatrixRole } from "@/services/matrix.service";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

/**
 * 🛰️ COCKPIT TERRITORIAL - QUALISOFT ELITE
 * Rôle : Gestion profonde d'un nœud client (Agents, Incarnation, Status)
 */

export default function TenantCockpit() {
  const router = useRouter();
  const params = useParams();
  const tenantId = typeof params?.id === 'string' ? params.id : "";
  
  const [tenant, setTenant] = useState<TenantDetails | any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSavingUser, setIsSavingUser] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>("");

  // 1. 🔄 SYNCHRONISATION DES DONNÉES DU NŒUD
  const fetchTenantDetails = useCallback(async () => {
    if (!tenantId || tenantId === 'deploy') return;
    try {
      setLoading(true);
      const data = await matrixApi.getDetails(tenantId);
      setTenant(data);
    } catch (err) {
      toast.error("ERREUR : Liaison Matrix rompue.");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchTenantDetails(); }, [fetchTenantDetails]);

  // 2. 🔑 PROTOCOLE D'INCARNATION (Impersonation)
  const handleImpersonate = async () => {
    if (!tenantId || !tenant) return;
    const toastId = toast.loading("Ouverture du tunnel souverain...");
    try {
      const data = await matrixApi.impersonate(tenantId);
      if (data?.token) {
        const result = await signIn("credentials", { 
          redirect: false, 
          impersonationToken: data.token, 
          impersonatedUser: JSON.stringify(data.user) 
        });
        if (result?.ok) {
          toast.success("INCARNATION RÉUSSIE : Accès au dashboard client.", { id: toastId });
          window.location.href = "/dashboard";
        }
      }
    } catch (err: any) {
      toast.error("PONT ROMPU : L'incarnation a échoué.", { id: toastId });
    }
  };

  // 3. 💾 SAUVEGARDE / ENRÔLEMENT AGENT (FIX BUILD ERROR)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUser(true);
    const toastId = toast.loading("Traitement Kernel...");

    try {
      const payload: any = {
        firstName: editingUser.U_FirstName,
        lastName: editingUser.U_LastName,
        email: editingUser.U_Email.toLowerCase().trim(),
        role: editingUser.U_Role as MatrixRole,
        tenantId: tenantId, // Requis pour createGlobalUser
      };

      if (newPassword) payload.password = newPassword;

      if (isCreateMode) {
        // --- CRÉATION GLOBALE ---
        if (!payload.password) payload.password = "Qualisoft@2026";
        await matrixApi.createGlobalUser(payload);
        toast.success("AGENT ENRÔLÉ : Accès créé avec succès.", { id: toastId });
      } else {
        // --- MISE À JOUR ---
        await matrixApi.updateUser(editingUser.U_Id, payload);
        toast.success("RECTIFICATION SCELLÉE : Profil agent mis à jour.", { id: toastId });
      }

      setEditingUser(null);
      setNewPassword("");
      fetchTenantDetails();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(`ERREUR : ${Array.isArray(msg) ? msg[0] : msg || "Échec de l'opération"}`, { id: toastId });
    } finally {
      setIsSavingUser(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 italic">
      <Loader2 className="animate-spin text-blue-600 mb-6" size={48} />
      <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] animate-pulse">Liaison Neuro-Cortex Matrix...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-8 font-sans italic selection:bg-blue-500/30 pb-24 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* TOP NAV */}
        <button onClick={() => router.push('/admin/matrix')} className="flex items-center gap-3 text-slate-500 hover:text-white mb-4 font-black uppercase text-[11px] bg-transparent border-none cursor-pointer transition-all outline-none group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour Control Matrix
        </button>

        {/* HEADER COCKPIT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-12 shadow-2xl border-2 border-slate-800 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
               <ShieldCheck size={200} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${tenant.T_IsActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {tenant.T_IsActive ? '● Nœud Opérationnel' : '○ Nœud Suspendu'}
                </span>
                <span className="px-5 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest italic">Plan {tenant.T_Plan}</span>
              </div>
              
              <h1 className="text-5xl font-black text-white uppercase italic leading-none mb-8 tracking-tighter drop-shadow-lg">{tenant.T_Name}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="flex items-center gap-4 text-slate-400 font-black uppercase text-[11px] tracking-widest italic">
                  <div className="p-3 bg-slate-800 rounded-xl"><Globe className="text-blue-500" size={20} /></div>
                  {tenant.T_Domain}.qualisoft.sn
                </div>
                <div className="flex items-center gap-4 text-slate-400 font-black uppercase text-[11px] tracking-widest italic">
                  <div className="p-3 bg-slate-800 rounded-xl"><UserCheck className="text-amber-500" size={20} /></div>
                  DG : {tenant.T_CeoName || "Identité Inconnue"}
                </div>
              </div>
            </div>

            <button onClick={handleImpersonate} className="mt-12 group relative flex items-center justify-center gap-4 bg-blue-600 text-white py-7 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-2xl cursor-pointer border-none overflow-hidden">
              <Key size={20} className="relative z-10" /> 
              <span className="relative z-10">Ouvrir le Tunnel d&apos;Incarnation</span>
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </button>
          </div>

          <div className="bg-white rounded-[3rem] p-12 shadow-2xl flex flex-col justify-center items-center gap-4 text-slate-900 border-4 border-slate-900">
            <Users className="text-blue-600 mb-2" size={48} />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Population Active</p>
            <p className="text-8xl font-black italic tracking-tighter leading-none">{tenant._count?.T_Users || 0}</p>
          </div>
        </div>

        {/* REGISTRE DES CITOYENS */}
        <div className="bg-slate-900/50 rounded-[3rem] shadow-2xl border-2 border-slate-800 overflow-hidden">
          <div className="p-10 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
            <h3 className="font-black uppercase text-xs tracking-[0.3em] text-slate-500 italic flex items-center gap-3">
              <Users size={20} className="text-blue-500" /> Registre des Citoyens du Nœud
            </h3>
            <button 
              onClick={() => { setIsCreateMode(true); setEditingUser({ U_Email: "", U_FirstName: "", U_LastName: "", U_Role: "USER" }); }} 
              className="bg-white text-slate-900 px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all cursor-pointer border-none shadow-lg active:scale-95"
            >
              <UserPlus size={16} className="inline mr-2" /> Enrôler Agent
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/80 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-slate-800">
                  <th className="px-12 py-8">Identité / Empreinte</th>
                  <th className="px-12 py-8 text-center">Accréditation (Role)</th>
                  <th className="px-12 py-8 text-center">Statut</th>
                  <th className="px-12 py-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {tenant.T_Users?.map((user: any) => (
                  <tr key={user.U_Id} className="hover:bg-blue-600/5 transition-colors group">
                    <td className="px-12 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-black text-blue-500 italic">
                          {user.U_LastName?.[0]}{user.U_FirstName?.[0]}
                        </div>
                        <div>
                          <div className="font-black text-white uppercase italic text-sm tracking-tight">{user.U_Email}</div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{user.U_FirstName} {user.U_LastName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-8 text-center">
                      <span className="bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest italic group-hover:border-blue-500 transition-colors">
                        {user.U_Role}
                      </span>
                    </td>
                    <td className="px-12 py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${user.U_IsActive ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                        <span className="text-[10px] font-black uppercase text-slate-400 italic">{user.U_IsActive ? 'ACTIF' : 'RÉVOQUÉ'}</span>
                      </div>
                    </td>
                    <td className="px-12 py-8 text-right">
                       <button onClick={() => { setIsCreateMode(false); setEditingUser(user); }} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-blue-600 transition-all"><Edit3 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 📑 MODALE D'ENRÔLEMENT / RECTIFICATION */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-100 flex items-center justify-center p-6 italic animate-in fade-in duration-300">
          <form onSubmit={handleSaveUser} className="bg-white rounded-[3.5rem] w-full max-w-2xl p-16 shadow-2xl border-4 border-slate-900 relative">
            <button type="button" onClick={() => setEditingUser(null)} className="absolute top-10 right-10 p-4 bg-slate-50 rounded-full hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"><X size={24} /></button>
            
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 mb-4">{isCreateMode ? "Enrôlement" : "Rectification"}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-12 italic">Mise à jour des accréditations Matrix</p>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Prénom</label>
                  <input required placeholder="Prénom" value={editingUser.U_FirstName} onChange={(e) => setEditingUser({...editingUser, U_FirstName: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 italic" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nom</label>
                  <input required placeholder="Nom" value={editingUser.U_LastName} onChange={(e) => setEditingUser({...editingUser, U_LastName: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 italic" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Identifiant Unique (Email)</label>
                <div className="relative">
                   <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input type="email" required placeholder="email@domaine.sn" value={editingUser.U_Email} onChange={(e) => setEditingUser({...editingUser, U_Email: e.target.value})} className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 italic" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Clé d&apos;accès Matrix</label>
                <div className="relative">
                   <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input type="password" placeholder={isCreateMode ? "Défaut: Qualisoft@2026" : "•••••••• (Laisser vide pour inchangé)"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-blue-50/50 border-2 border-blue-100 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 italic" />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-16">
              <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-6 font-black uppercase text-[11px] tracking-widest text-slate-400 bg-transparent hover:text-slate-900 transition-colors border-none cursor-pointer italic">Annuler</button>
              <button type="submit" disabled={isSavingUser} className="flex-2 py-6 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all border-none cursor-pointer shadow-xl flex items-center justify-center gap-3">
                {isSavingUser ? <Loader2 className="animate-spin" size={18} /> : <ShieldAlert size={18} />}
                {isSavingUser ? "PROTOCOLE EN COURS..." : "CONFIRMER SCELLAGE"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}