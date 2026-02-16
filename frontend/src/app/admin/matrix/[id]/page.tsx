/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  ArrowLeft, Building2, Key, Loader2, Edit3, X, UserPlus, 
  Globe, Users, ShieldAlert, UserCheck, ShieldCheck, Mail, Lock, RefreshCw
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { matrixApi, TenantDetails, MatrixRole } from "@/services/matrix.service";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

/**
 * 🛰️ COCKPIT TERRITORIAL - QUALISOFT ELITE RD 2030
 * Rôle : Kernel de gestion d'instance souveraine.
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

  // 1. 🔄 SYNCHRONISATION DU NŒUD
  const fetchTenantDetails = useCallback(async () => {
    if (!tenantId || tenantId === 'deploy') return;
    try {
      setLoading(true);
      const data = await matrixApi.getDetails(tenantId);
      setTenant(data);
    } catch (err) {
      toast.error("ÉCHEC LIAISON : Le Neuro-Cortex Matrix est inaccessible.");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchTenantDetails(); }, [fetchTenantDetails]);

  // 2. 🔑 PROTOCOLE D'INCARNATION (Tunnel Souverain)
  const handleImpersonate = async () => {
    if (!tenantId || !tenant) return;
    const toastId = toast.loading("Initialisation du tunnel d'incarnation...");
    try {
      const data = await matrixApi.impersonate(tenantId);
      if (data?.token) {
        // Switch de contexte NextAuth vers l'instance client
        const result = await signIn("credentials", { 
          redirect: false, 
          impersonationToken: data.token, 
          impersonatedUser: JSON.stringify(data.user) 
        });
        
        if (result?.ok) {
          toast.success("INCARNATION SCELLÉE : Accès au dashboard client autorisé.", { id: toastId });
          // Hard navigation pour forcer la mise à jour du store et du middleware
          window.location.href = "/dashboard";
        } else {
          throw new Error("Rejet du protocole d'authentification.");
        }
      }
    } catch (err: any) {
      toast.error("PONT ROMPU : L'incarnation a été révoquée par le Kernel.", { id: toastId });
    }
  };

  // 3. 💾 GESTION DES CITOYENS (Enrôlement & Rectification)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUser(true);
    const toastId = toast.loading("Traitement Kernel en cours...");

    try {
      const payload: any = {
        firstName: editingUser.U_FirstName,
        lastName: editingUser.U_LastName,
        email: editingUser.U_Email.toLowerCase().trim(),
        role: editingUser.U_Role as MatrixRole,
        tenantId: tenantId, 
      };

      if (newPassword) payload.password = newPassword;

      if (isCreateMode) {
        if (!payload.password) payload.password = "Qualisoft@2026";
        await matrixApi.createGlobalUser(payload);
        toast.success("CITOYEN ENRÔLÉ : Identité numérique créée.", { id: toastId });
      } else {
        await matrixApi.updateUser(editingUser.U_Id, payload);
        toast.success("RECTIFICATION SCELLÉE : Profil mis à jour.", { id: toastId });
      }

      setEditingUser(null);
      setNewPassword("");
      fetchTenantDetails();
    } catch (err: any) {
      // 🛡️ DÉCODEUR ÉLITE : Traduction des erreurs NestJS/Prisma
      const raw = err.response?.data?.message;
      const cleanMsg = Array.isArray(raw) ? raw.join(' | ') : (typeof raw === 'string' ? raw : "Rejet du scellage.");
      toast.error(`ERREUR : ${cleanMsg}`, { id: toastId });
    } finally {
      setIsSavingUser(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 italic">
      <Loader2 className="animate-spin text-blue-600 mb-6" size={48} />
      <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] animate-pulse">Synchronisation Matrix...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-8 font-sans italic selection:bg-blue-600/30 pb-24 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* NAV & ACTIONS RAPIDES */}
        <div className="flex justify-between items-center">
          <button onClick={() => router.push('/admin/matrix')} className="flex items-center gap-3 text-slate-500 hover:text-white font-black uppercase text-[11px] bg-transparent border-none cursor-pointer transition-all outline-none group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour Control Matrix
          </button>
          <button onClick={fetchTenantDetails} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-blue-500 transition-all cursor-pointer">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* HEADER : ÉTAT DU NŒUD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-12 shadow-2xl border-2 border-slate-800 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
               <ShieldCheck size={220} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${tenant.T_IsActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {tenant.T_IsActive ? '● Nœud Opérationnel' : '○ Nœud Suspendu'}
                </span>
                <span className="px-5 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest italic">Plan {tenant.T_Plan}</span>
              </div>
              
              <h1 className="text-5xl font-black text-white uppercase italic leading-none mb-8 tracking-tighter drop-shadow-2xl">{tenant.T_Name}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">
                <div className="flex items-center gap-5 text-slate-400 font-black uppercase text-[11px] tracking-[0.2em] italic">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner"><Globe className="text-blue-500" size={20} /></div>
                  {tenant.T_Domain}.qualisoft.sn
                </div>
                <div className="flex items-center gap-5 text-slate-400 font-black uppercase text-[11px] tracking-[0.2em] italic">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner"><UserCheck className="text-amber-500" size={20} /></div>
                  Directeur : {tenant.T_CeoName || "Anonyme"}
                </div>
              </div>
            </div>

            <button onClick={handleImpersonate} className="mt-12 group relative flex items-center justify-center gap-4 bg-blue-600 text-white py-7 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-white hover:text-slate-900 transition-all shadow-2xl cursor-pointer border-none overflow-hidden active:scale-95">
              <Key size={20} className="relative z-10 group-hover:rotate-12 transition-transform" /> 
              <span className="relative z-10">Activer le Tunnel d&apos;Incarnation</span>
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
            </button>
          </div>

          <div className="bg-white rounded-[3rem] p-12 shadow-2xl flex flex-col justify-center items-center gap-4 text-slate-900 border-8 border-slate-900 group">
            <Users className="text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-500" size={60} />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] italic">Citoyens Actifs</p>
            <p className="text-9xl font-black italic tracking-tighter leading-none">{tenant._count?.T_Users || 0}</p>
          </div>
        </div>

        {/* REGISTRE : GESTION DES UTILISATEURS */}
        
        <div className="bg-slate-900/40 rounded-[3rem] shadow-2xl border-2 border-slate-800 overflow-hidden backdrop-blur-sm">
          <div className="p-10 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
            <h3 className="font-black uppercase text-xs tracking-[0.4em] text-slate-500 italic flex items-center gap-4">
              <Users size={22} className="text-blue-600" /> Registre d&apos;Identité du Nœud
            </h3>
            <button 
              onClick={() => { setIsCreateMode(true); setEditingUser({ U_Email: "", U_FirstName: "", U_LastName: "", U_Role: "USER" }); }} 
              className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all cursor-pointer border-none shadow-xl active:scale-95 flex items-center gap-2"
            >
              <UserPlus size={16} /> Enrôler Citoyen
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/60 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-slate-800">
                  <th className="px-12 py-8">Identité / Empreinte Digitale</th>
                  <th className="px-12 py-8 text-center">Rôle & Accréditation</th>
                  <th className="px-12 py-8 text-center">Status Kernel</th>
                  <th className="px-12 py-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {tenant.T_Users?.map((user: any) => (
                  <tr key={user.U_Id} className="hover:bg-blue-600/5 transition-all group">
                    <td className="px-12 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center font-black text-blue-500 italic border border-slate-800 shadow-inner group-hover:border-blue-500/50 transition-colors">
                          {user.U_LastName?.[0]}{user.U_FirstName?.[0]}
                        </div>
                        <div>
                          <div className="font-black text-white uppercase italic text-sm tracking-tight">{user.U_Email}</div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">{user.U_FirstName} {user.U_LastName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-8 text-center">
                      <span className="bg-slate-950 border border-slate-800 text-slate-300 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] italic group-hover:border-blue-600 transition-colors">
                        {user.U_Role}
                      </span>
                    </td>
                    <td className="px-12 py-8 text-center">
                      <div className="inline-flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-full border border-slate-800 shadow-inner">
                        <span className={`w-2 h-2 rounded-full ${user.U_IsActive ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`} />
                        <span className="text-[9px] font-black uppercase text-slate-500 italic tracking-widest">{user.U_IsActive ? 'ACTIVE' : 'RÉVOQUÉ'}</span>
                      </div>
                    </td>
                    <td className="px-12 py-8 text-right">
                       <button onClick={() => { setIsCreateMode(false); setEditingUser(user); }} className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-white hover:bg-blue-600 transition-all hover:shadow-lg"><Edit3 size={16} /></button>
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
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-100 flex items-center justify-center p-6 italic animate-in fade-in duration-500">
          <form onSubmit={handleSaveUser} className="bg-white rounded-[4rem] w-full max-w-2xl p-16 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-8 border-slate-900 relative">
            <button type="button" onClick={() => setEditingUser(null)} className="absolute top-12 right-12 p-4 bg-slate-100 rounded-full hover:bg-red-500 hover:text-white transition-all cursor-pointer border-none"><X size={24} /></button>
            
            <h2 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900 mb-4">{isCreateMode ? "Enrôlement" : "Rectification"}</h2>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-14 italic border-l-4 border-blue-600 pl-4">Protocole de mise à jour des accréditations Matrix</p>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Prénom Citoyen</label>
                  <input required placeholder="Prénom" value={editingUser.U_FirstName} onChange={(e) => setEditingUser({...editingUser, U_FirstName: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all italic text-sm" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Nom Citoyen</label>
                  <input required placeholder="Nom" value={editingUser.U_LastName} onChange={(e) => setEditingUser({...editingUser, U_LastName: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all italic text-sm" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Empreinte Unique (Email)</label>
                <div className="relative group">
                   <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                   <input type="email" required placeholder="email@domaine.sn" value={editingUser.U_Email} onChange={(e) => setEditingUser({...editingUser, U_Email: e.target.value})} className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all italic text-sm" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Clé de Cryptage (Password)</label>
                <div className="relative group">
                   <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                   <input type="password" placeholder={isCreateMode ? "Défaut: Qualisoft@2026" : "•••••••• (Laisser vide pour inchangé)"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-16 pr-6 py-6 bg-blue-50/30 border-2 border-blue-100 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all italic text-sm" />
                </div>
              </div>
            </div>

            <div className="flex gap-6 mt-16">
              <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-7 font-black uppercase text-[12px] tracking-widest text-slate-400 bg-transparent hover:text-slate-900 transition-colors border-none cursor-pointer italic">Révoquer</button>
              <button type="submit" disabled={isSavingUser} className="flex-2 py-7 bg-slate-900 text-white rounded-4xl font-black uppercase text-xs tracking-[0.3em] hover:bg-blue-600 transition-all border-none cursor-pointer shadow-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50">
                {isSavingUser ? <Loader2 className="animate-spin" size={20} /> : <ShieldAlert size={20} />}
                {isSavingUser ? "PROTOCOLE..." : "SCELLER LE PROFIL"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}