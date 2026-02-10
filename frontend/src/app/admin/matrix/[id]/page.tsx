"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  ArrowLeft, Building2, Key, Loader2, Edit3, X, UserPlus, Globe, Users, AlertTriangle, Check
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { matrixApi, TenantDetails, UserMatrixEntry, MatrixRole } from "@/services/matrix.service";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";

/**
 * 🛰️ INTERFACE DE FORMULAIRE SÉCURISÉE
 */
interface UserFormData {
  U_Id?: string;
  U_Email: string;
  U_FirstName: string;
  U_LastName: string;
  U_Role: MatrixRole;
  U_IsActive: boolean;
  password?: string;
}

/**
 * 🚀 COCKPIT SOUVERAIN : QUALISOFT ELITE RD 2030
 */
export default function TenantCockpit() {
  const router = useRouter();
  const params = useParams();
  
  // ✅ FIX LIGNE 53 (Approximatif) : Extraction robuste et typée du tenantId
  const tenantId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  
  const [tenant, setTenant] = useState<TenantDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSavingUser, setIsSavingUser] = useState<boolean>(false);
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserFormData | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");

  /**
   * 🏗️ SYNCHRONISATION DU REGISTRE (Ligne 53 - Fix useCallback)
   */
  const fetchTenantDetails = useCallback(async (): Promise<void> => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const data = await matrixApi.getDetails(tenantId);
      setTenant(data);
    } catch (caughtError: unknown) {
      console.error(caughtError);
      toast.error("Échec de synchronisation Matrix.");
    } finally {
      setLoading(false);
    }
  }, [tenantId]); // ✅ La dépendance est maintenant stable

  useEffect(() => {
    fetchTenantDetails();
  }, [fetchTenantDetails]);

  /**
   * 🎭 PROTOCOLE D'INCARNATION (Ligne 88 - Fix Typing Axios)
   */
  const handleImpersonate = async (): Promise<void> => {
    if (!tenantId || !tenant) return;
    if (!window.confirm(`⚠️ INCARNATION : Prendre le contrôle de [${tenant.T_Name}] ?`)) return;

    try {
      // ✅ FIX LIGNE 88 : Cast explicite de la réponse Axios
      const response = await axios.post(`/api/matrix/${tenantId}/impersonate`);
      const data = response.data as { token: string; user: Record<string, unknown> };
      
      if (data?.token) {
        const result = await signIn("credentials", { 
          redirect: false, 
          impersonationToken: data.token, 
          impersonatedUser: JSON.stringify(data.user) 
        });

        if (result?.ok) {
          toast.success("INCARNATION RÉUSSIE");
          window.location.href = "/dashboard";
        }
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("Pont d'incarnation rompu.");
    }
  };

  /**
   * 🖋️ PERSISTENCE (Ligne 105 - Fix Object Literal)
   */
  const handleSaveUser = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!editingUser || !tenantId) return;

    setIsSavingUser(true);
    try {
      if (isCreateMode) {
        // typed payload for creating a user (avoid `any`)
        type CreateUserPayload = {
          U_Email: string;
          U_FirstName: string;
          U_LastName: string;
          U_Role: MatrixRole;
          U_passwordHash?: string;
        };

        const payload: CreateUserPayload = {
          U_Email: editingUser.U_Email,
          U_FirstName: editingUser.U_FirstName,
          U_LastName: editingUser.U_LastName,
          U_Role: editingUser.U_Role,
          U_passwordHash: newPassword || "Qualisoft@2026"
        };
        await matrixApi.createUser(tenantId, payload);
        toast.success(`Collaborateur scellé.`);
      }

      setEditingUser(null);
      setIsCreateMode(false);
      setNewPassword("");
      fetchTenantDetails();

    } catch (caughtError: unknown) {
      let msg = "Erreur base de données.";
      if (axios.isAxiosError(caughtError)) {
        const axiosError = caughtError as AxiosError<{ message?: string }>;
        msg = axiosError.response?.data?.message || msg;
      }
      toast.error(msg);
    } finally {
      setIsSavingUser(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white italic">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-[10px] font-black uppercase text-slate-400">Synchronisation Matrix...</p>
    </div>
  );

  if (!tenant) return <div className="p-20 text-center font-black italic">NŒUD INTROUVABLE</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans italic selection:bg-blue-100">
      <div className="max-w-6xl mx-auto">
        
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-8 font-black uppercase text-[10px] bg-transparent border-none cursor-pointer transition-colors">
          <ArrowLeft size={14} /> Retour Registre Master
        </button>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-white mb-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Building2 size={200} /></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${tenant.T_IsActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {tenant.T_IsActive ? 'Nœud Actif' : 'Nœud Archivé'}
              </span>
              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Plan {tenant.T_Plan}</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 uppercase italic leading-none mb-3 mt-4 tracking-tighter">{tenant.T_Name}</h1>
            <p className="text-blue-600 font-black uppercase text-xs flex items-center gap-2 tracking-widest"><Globe size={14} /> {tenant.T_Domain}.qualisoft.sn</p>
          </div>
          <button onClick={handleImpersonate} className="relative z-10 flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-2xl font-black uppercase text-[11px] hover:bg-blue-600 transition-all shadow-xl cursor-pointer border-none">
            <Key size={16} /> Prise de contrôle
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
          <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-black uppercase text-xs tracking-[0.2em] text-slate-500 italic flex items-center gap-3"><Users size={16} /> Effectif ({tenant._count.T_Users})</h3>
            <button 
              onClick={() => {
                setIsCreateMode(true);
                setEditingUser({ U_Email: "", U_FirstName: "", U_LastName: "", U_Role: "USER", U_IsActive: true });
              }}
              className="flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] hover:text-slate-900 transition-colors cursor-pointer border-none bg-transparent"
            >
              <UserPlus size={14} /> Déployer Collaborateur
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b">
                  <th className="px-10 py-5">Identité</th>
                  <th className="px-10 py-5 text-center">Rôle</th>
                  <th className="px-10 py-5 text-center">Statut</th>
                  <th className="px-10 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tenant.T_Users?.map((user: UserMatrixEntry) => (
                  <tr key={user.U_Id} className="hover:bg-blue-50/30 group transition-colors">
                    <td className="px-10 py-6">
                      <div className="font-black text-slate-900 uppercase italic text-sm">{user.U_Email}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.U_FirstName} {user.U_LastName}</div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="bg-slate-900 text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest italic">{user.U_Role}</span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${user.U_IsActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {user.U_IsActive ? 'Actif' : 'Archivé'}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { 
                          setIsCreateMode(false); 
                          setEditingUser({
                            U_Id: user.U_Id,
                            U_Email: user.U_Email || "",
                            U_FirstName: user.U_FirstName || "",
                            U_LastName: user.U_LastName || "",
                            U_Role: user.U_Role as MatrixRole,
                            U_IsActive: Boolean(user.U_IsActive)
                          }); 
                        }} 
                        className="p-3 text-slate-400 hover:text-blue-600 border-none bg-transparent cursor-pointer transition-colors"
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
      </div>

      {/* --- MODAL --- */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6 italic">
          <form onSubmit={handleSaveUser} className="bg-white rounded-[3rem] w-full max-w-xl p-12 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-10">
               <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">{isCreateMode ? "Déploiement" : "Rectification"}</h2>
               <button type="button" onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-rose-600 bg-transparent border-none cursor-pointer transition-colors"><X size={28} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Prénom</label>
                  <input required value={editingUser.U_FirstName} onChange={(e) => setEditingUser({...editingUser, U_FirstName: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Nom</label>
                  <input required value={editingUser.U_LastName} onChange={(e) => setEditingUser({...editingUser, U_LastName: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase">Identifiant Email</label>
                <input type="email" required value={editingUser.U_Email} onChange={(e) => setEditingUser({...editingUser, U_Email: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-rose-500 uppercase flex items-center gap-2"><AlertTriangle size={10} /> Clé d&apos;accès Matrix</label>
                <input type="password" placeholder={isCreateMode ? "Défaut : Qualisoft@2026" : "Identité scellée"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-5 bg-rose-50/30 border-2 border-transparent rounded-2xl font-black text-slate-900 outline-none focus:border-rose-500 transition-all placeholder:text-rose-300" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Autorité Matrix</label>
                  <select value={editingUser.U_Role} onChange={(e) => setEditingUser({...editingUser, U_Role: e.target.value as MatrixRole})} className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-slate-900 outline-none appearance-none focus:border-blue-600 cursor-pointer">
                    {["SUPER_ADMIN", "ADMIN", "USER", "PILOTE", "COPILOTE", "AUDITEUR", "HSE", "SAFETY_OFFICER", "RQ", "DIRECTION", "OBSERVATEUR"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase">État</label>
                  <select value={editingUser.U_IsActive ? "1" : "0"} onChange={(e) => setEditingUser({...editingUser, U_IsActive: e.target.value === "1"})} className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-slate-900 outline-none appearance-none focus:border-blue-600 cursor-pointer">
                    <option value="1">SESSION ACTIVE</option>
                    <option value="0">SESSION ARCHIVÉE</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-6 mt-12">
              <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 bg-transparent border-none cursor-pointer hover:text-slate-900 transition-colors">Interrompre</button>
              <button type="submit" disabled={isSavingUser} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 transition-all border-none cursor-pointer shadow-xl disabled:bg-slate-200">
                {isSavingUser ? <Loader2 className="animate-spin mx-auto" size={16} /> : <><Check size={16} className="inline mr-2" /> Confirmer Scellage</>}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-20 pt-10 border-t border-slate-200 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic">Qualisoft Elite RD 2030 - Cockpit Master Souverain</p>
      </div>
    </div>
  );
}