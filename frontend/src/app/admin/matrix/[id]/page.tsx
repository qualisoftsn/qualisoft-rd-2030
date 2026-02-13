/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  ArrowLeft, Building2, Key, Loader2, Edit3, X, UserPlus, 
  Globe, Users, Check, ShieldAlert, MapPin, Phone, UserCheck
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { matrixApi, TenantDetails, UserMatrixEntry, MatrixRole } from "@/services/matrix.service";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

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

  const fetchTenantDetails = useCallback(async () => {
    if (!tenantId || tenantId === 'deploy') return;
    try {
      setLoading(true);
      const data = await matrixApi.getDetails(tenantId);
      setTenant(data);
    } catch (err) {
      toast.error("Échec de synchronisation Matrix.");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchTenantDetails(); }, [fetchTenantDetails]);

  const handleImpersonate = async () => {
    if (!tenantId || !tenant) return;
    toast.info(`Initialisation du pont souverain...`);
    try {
      const data = await matrixApi.impersonate(tenantId);
      if (data?.token) {
        const result = await signIn("credentials", { 
          redirect: false, 
          impersonationToken: data.token, 
          impersonatedUser: JSON.stringify(data.user) 
        });
        if (result?.ok) {
          toast.success("INCARNATION RÉUSSIE.");
          window.location.href = "/dashboard";
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Pont d'incarnation rompu.");
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUser(true);
    try {
      const payload = {
        email: editingUser.U_Email,
        firstName: editingUser.U_FirstName,
        lastName: editingUser.U_LastName,
        role: editingUser.U_Role,
        password: newPassword || "Qualisoft@2026"
      };
      await matrixApi.createUser(tenantId, payload);
      toast.success(`Collaborateur scellé.`);
      setEditingUser(null);
      fetchTenantDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de scellage.");
    } finally {
      setIsSavingUser(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white italic">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Synchronisation Matrix...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans italic selection:bg-blue-100 pb-24">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => router.push('/admin/matrix')} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-8 font-black uppercase text-[10px] bg-transparent border-none cursor-pointer transition-colors outline-none">
          <ArrowLeft size={14} /> Retour Registre Master
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-12 shadow-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${tenant.T_IsActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {tenant.T_IsActive ? 'Nœud Opérationnel' : 'Nœud Suspendu'}
                </span>
                <span className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">Plan {tenant.T_Plan}</span>
              </div>
              <h1 className="text-3xl font-black text-white uppercase italic leading-none mb-6 tracking-tighter">{tenant.T_Name}</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                <div className="flex items-center gap-4 text-slate-400 font-bold uppercase text-[11px] tracking-widest"><Globe className="text-blue-500" size={18} /> {tenant.T_Domain}.qualisoft.sn</div>
                <div className="flex items-center gap-4 text-slate-400 font-bold uppercase text-[11px] tracking-widest"><UserCheck className="text-amber-500" size={18} /> DG : {tenant.T_CeoName || "Non renseigné"}</div>
              </div>
            </div>
            <button onClick={handleImpersonate} className="mt-12 flex items-center justify-center gap-3 bg-blue-600 text-white py-6 rounded-2xl font-black uppercase text-xs hover:bg-white hover:text-slate-900 transition-all shadow-xl cursor-pointer border-none">
              <Key size={18} /> Prise de contrôle souveraine
            </button>
          </div>
          <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 flex flex-col justify-center gap-10">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Citoyens Enrôlés</p>
              <p className="text-6xl font-black text-slate-900 italic tracking-tighter">{tenant._count?.T_Users || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-white overflow-hidden">
          <div className="p-10 border-b bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-black uppercase text-xs tracking-[0.2em] text-slate-500 italic"><Users size={16} className="inline mr-2" /> Registre des Citoyens</h3>
            <button onClick={() => { setIsCreateMode(true); setEditingUser({ U_Email: "", U_FirstName: "", U_LastName: "", U_Role: "USER" }); }} className="bg-slate-900 text-white px-6 py-4 rounded-xl font-black uppercase text-[10px] hover:bg-blue-600 transition-all cursor-pointer border-none">
              Enrôler Collaborateur
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b">
                  <th className="px-12 py-6">Identité</th>
                  <th className="px-12 py-6 text-center">Autorité</th>
                  <th className="px-12 py-6 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tenant.T_Users?.map((user: any) => (
                  <tr key={user.U_Id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-12 py-8">
                      <div className="font-black text-slate-900 uppercase italic text-sm mb-1">{user.U_Email}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.U_FirstName} {user.U_LastName}</div>
                    </td>
                    <td className="px-12 py-8 text-center"><span className="bg-slate-900 text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest italic">{user.U_Role}</span></td>
                    <td className="px-12 py-8 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${user.U_IsActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {user.U_IsActive ? 'ACTIF' : 'ARCHIVÉ'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-50 flex items-center justify-center p-6 italic">
          <form onSubmit={handleSaveUser} className="bg-white rounded-[4rem] w-full max-w-2xl p-16 shadow-2xl">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 mb-12">{isCreateMode ? "Enrôlement" : "Rectification"}</h2>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <input required placeholder="Prénom" value={editingUser.U_FirstName} onChange={(e) => setEditingUser({...editingUser, U_FirstName: e.target.value})} className="w-full p-6 bg-slate-50 border-none rounded-3xl font-black text-slate-900 outline-none italic" />
                <input required placeholder="Nom" value={editingUser.U_LastName} onChange={(e) => setEditingUser({...editingUser, U_LastName: e.target.value})} className="w-full p-6 bg-slate-50 border-none rounded-3xl font-black text-slate-900 outline-none italic" />
              </div>
              <input type="email" required placeholder="Email Corporatif" value={editingUser.U_Email} onChange={(e) => setEditingUser({...editingUser, U_Email: e.target.value})} className="w-full p-6 bg-slate-50 border-none rounded-3xl font-black text-slate-900 outline-none italic" />
              <input type="password" placeholder="Clé d'accès Matrix" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-6 bg-rose-50/30 border-none rounded-3xl font-black text-slate-900 outline-none italic" />
            </div>
            <div className="flex gap-6 mt-16">
              <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-6 font-black uppercase text-[11px] text-slate-400 bg-transparent border-none cursor-pointer italic">Annuler</button>
              <button type="submit" disabled={isSavingUser} className="flex-1 py-6 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs hover:bg-blue-600 transition-all border-none cursor-pointer">
                {isSavingUser ? "Traitement..." : "Confirmer Scellage"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}