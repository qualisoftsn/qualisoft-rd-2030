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

interface UserFormData {
  U_Id?: string;
  U_Email: string;
  U_FirstName: string;
  U_LastName: string;
  U_Role: MatrixRole;
  U_IsActive: boolean;
  password?: string;
}

export default function TenantCockpit() {
  const router = useRouter();
  const params = useParams();
  const tenantId = typeof params?.id === 'string' ? params.id : "";
  
  const [tenant, setTenant] = useState<TenantDetails | any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSavingUser, setIsSavingUser] = useState<boolean>(false);
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserFormData | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");

  const fetchTenantDetails = useCallback(async () => {
    if (!tenantId || tenantId === 'deploy') return;
    try {
      setLoading(true);
      const data = await matrixApi.getDetails(tenantId);
      setTenant(data);
    } catch (err) {
      console.error("Erreur Sync Matrix:", err);
      toast.error("Échec de synchronisation Matrix.");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchTenantDetails();
  }, [fetchTenantDetails]);

  /**
   * 🎭 PROTOCOLE D'INCARNATION (SCELLÉ)
   * Rôle : Transférer l'identité Super-Admin vers une session Admin locale.
   */
  const handleImpersonate = async () => {
    if (!tenantId || !tenant) return;
    
    toast.info(`Initialisation du pont vers ${tenant.T_Name}...`);

    try {
      // 🛰️ Étape 1 : Demande de jeton d'incarnation au Backend
      const data = await matrixApi.impersonate(tenantId);
      
      if (data?.token) {
        // 🔐 Étape 2 : Injection Next-Auth
        const result = await signIn("credentials", { 
          redirect: false, 
          impersonationToken: data.token, 
          impersonatedUser: JSON.stringify(data.user) 
        });

        if (result?.ok) {
          toast.success("INCARNATION RÉUSSIE : Accès Souverain.");
          // Propulsion vers le dashboard du tenant
          window.location.href = "/dashboard";
        } else {
          throw new Error("Échec du scellage de session.");
        }
      }
    } catch (err: any) {
      console.error("Impersonation Error:", err);
      const msg = err.response?.data?.message || "Pont d'incarnation rompu.";
      toast.error(msg);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !tenantId) return;

    setIsSavingUser(true);
    try {
      if (isCreateMode) {
        // ✅ CORRECTIF CRITIQUE : Mappage vers le DTO Backend (email, firstName...)
        const payload = {
          email: editingUser.U_Email,          // Backend attend "email"
          firstName: editingUser.U_FirstName,  // Backend attend "firstName"
          lastName: editingUser.U_LastName,    // Backend attend "lastName"
          role: editingUser.U_Role,            // Backend attend "role"
          password: newPassword || "Qualisoft@2026"
        };
        
        await matrixApi.createUser(tenantId, payload);
        toast.success(`Collaborateur scellé.`);
      } else {
         // Logique de mise à jour (PUT) si nécessaire plus tard
         toast.info("Mode édition non actif pour l'instant.");
      }

      setEditingUser(null);
      setIsCreateMode(false);
      setNewPassword("");
      fetchTenantDetails(); // Rafraîchir la liste
    } catch (caughtError: any) {
      // Affichage précis de l'erreur Backend (ex: "L'adresse email est obligatoire")
      toast.error(caughtError.response?.data?.message || "Erreur base de données.");
    } finally {
      setIsSavingUser(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white italic">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Calcul du Nœud...</p>
    </div>
  );

  if (!tenant) return <div className="p-20 text-center font-black italic">NŒUD INTROUVABLE</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans italic selection:bg-blue-100 pb-24">
      <div className="max-w-7xl mx-auto">
        
        <button onClick={() => router.push('/admin/matrix')} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-8 font-black uppercase text-[10px] bg-transparent border-none cursor-pointer transition-colors outline-none">
          <ArrowLeft size={14} /> Retour Registre Master
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* CARTE D'IDENTITÉ SOUVERAINE (2/3) */}
          <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group border border-slate-800 flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none text-white"><Building2 size={240} /></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${tenant.T_IsActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {tenant.T_IsActive ? 'Nœud Opérationnel' : 'Nœud Suspendu'}
                </span>
                <span className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">Plan {tenant.T_Plan}</span>
              </div>
              <h1 className="text-3xl font-black text-white uppercase italic leading-none mb-6 tracking-tighter">{tenant.T_Name}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                <div className="flex items-center gap-4 text-slate-400 font-bold uppercase text-[11px] tracking-widest">
                  <Globe className="text-blue-500" size={18} /> {tenant.T_Domain}.qualisoft.sn
                </div>
                <div className="flex items-center gap-4 text-slate-400 font-bold uppercase text-[11px] tracking-widest">
                  <UserCheck className="text-amber-500" size={18} /> DG : {tenant.T_CeoName || "Non renseigné"}
                </div>
                <div className="flex items-center gap-4 text-slate-400 font-bold uppercase text-[11px] tracking-widest">
                  <MapPin className="text-rose-500" size={18} /> {tenant.T_Address || "Dakar, Sénégal"}
                </div>
                <div className="flex items-center gap-4 text-slate-400 font-bold uppercase text-[11px] tracking-widest">
                  <Phone className="text-emerald-500" size={18} /> {tenant.T_Phone || "Non renseigné"}
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
               <button onClick={handleImpersonate} className="flex-1 flex items-center justify-center gap-3 bg-blue-600 text-white py-6 rounded-2xl font-black uppercase text-xs hover:bg-white hover:text-slate-900 transition-all shadow-xl cursor-pointer border-none group">
                <Key size={18} className="group-hover:rotate-12 transition-transform" /> Prise de contrôle
              </button>
            </div>
          </div>

          {/* STATS RAPIDES (1/3) */}
          <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 flex flex-col justify-center gap-10">
             <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Citoyens Enrôlés</p>
                <p className="text-6xl font-black text-slate-900 italic tracking-tighter">{tenant._count?.T_Users || 0}</p>
             </div>
             <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Sites Opérationnels</p>
                <p className="text-6xl font-black text-slate-900 italic tracking-tighter">{tenant._count?.T_Sites || 0}</p>
             </div>
          </div>
        </div>

        {/* TABLE COLLABORATEURS */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-white overflow-hidden">
          <div className="p-10 border-b bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-black uppercase text-xs tracking-[0.2em] text-slate-500 italic flex items-center gap-3"><Users size={16} /> Registre des Citoyens</h3>
            <button 
              onClick={() => {
                setIsCreateMode(true);
                setEditingUser({ U_Email: "", U_FirstName: "", U_LastName: "", U_Role: "USER", U_IsActive: true });
              }}
              className="flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-xl font-black uppercase text-[10px] hover:bg-blue-600 transition-all cursor-pointer border-none"
            >
              <UserPlus size={14} /> Enrôler Collaborateur
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b">
                  <th className="px-12 py-6">Identité</th>
                  <th className="px-12 py-6 text-center">Autorité</th>
                  <th className="px-12 py-6 text-center">Statut</th>
                  <th className="px-12 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tenant.T_Users?.map((user: UserMatrixEntry) => (
                  <tr key={user.U_Id} className="hover:bg-blue-50/30 group transition-colors">
                    <td className="px-12 py-8">
                      <div className="font-black text-slate-900 uppercase italic text-sm mb-1">{user.U_Email}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.U_FirstName} {user.U_LastName}</div>
                    </td>
                    <td className="px-12 py-8 text-center">
                      <span className="bg-slate-900 text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest italic">{user.U_Role}</span>
                    </td>
                    <td className="px-12 py-8 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${user.U_IsActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {user.U_IsActive ? 'ACTIF' : 'ARCHIVÉ'}
                      </span>
                    </td>
                    <td className="px-12 py-8 text-right opacity-0 group-hover:opacity-100 transition-opacity">
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

      {/* MODAL SCELLAGE */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-50 flex items-center justify-center p-6 italic animate-in fade-in duration-300">
          <form onSubmit={handleSaveUser} className="bg-white rounded-[4rem] w-full max-w-2xl p-16 shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-12">
                <div>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">{isCreateMode ? "Enrôlement" : "Rectification"}</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">SMI Core Protocol 2030</p>
                </div>
                <button type="button" onClick={() => setEditingUser(null)} className="text-slate-300 hover:text-rose-600 bg-transparent border-none cursor-pointer transition-colors"><X size={32} /></button>
            </div>
            
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Prénom</label>
                  <input required value={editingUser.U_FirstName} onChange={(e) => setEditingUser({...editingUser, U_FirstName: e.target.value})} className="w-full p-6 bg-slate-50 border-none rounded-3xl font-black text-slate-900 outline-none focus:ring-4 ring-blue-600/10 transition-all italic" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nom</label>
                  <input required value={editingUser.U_LastName} onChange={(e) => setEditingUser({...editingUser, U_LastName: e.target.value})} className="w-full p-6 bg-slate-50 border-none rounded-3xl font-black text-slate-900 outline-none focus:ring-4 ring-blue-600/10 transition-all italic" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Corporatif</label>
                <input type="email" required value={editingUser.U_Email} onChange={(e) => setEditingUser({...editingUser, U_Email: e.target.value})} className="w-full p-6 bg-slate-50 border-none rounded-3xl font-black text-slate-900 outline-none focus:ring-4 ring-blue-600/10 transition-all italic" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-2 tracking-widest ml-2 italic"><ShieldAlert size={14} /> Clé d&apos;accès Matrix</label>
                <input type="password" placeholder={isCreateMode ? "Défaut : Qualisoft@2026" : "Restreint par le PkiModule"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-6 bg-rose-50/30 border-none rounded-3xl font-black text-slate-900 outline-none focus:ring-4 ring-rose-500/10 transition-all placeholder:text-rose-200 italic" />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Autorité</label>
                  <select value={editingUser.U_Role} onChange={(e) => setEditingUser({...editingUser, U_Role: e.target.value as MatrixRole})} className="w-full p-6 bg-slate-50 border-none rounded-3xl font-black text-slate-900 outline-none cursor-pointer italic appearance-none">
                    {["SUPER_ADMIN", "ADMIN", "USER", "PILOTE", "COPILOTE", "AUDITEUR", "HSE", "SAFETY_OFFICER", "RQ", "DIRECTION", "OBSERVATEUR"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">État du Compte</label>
                  <select value={editingUser.U_IsActive ? "1" : "0"} onChange={(e) => setEditingUser({...editingUser, U_IsActive: e.target.value === "1"})} className="w-full p-6 bg-slate-50 border-none rounded-3xl font-black text-slate-900 outline-none cursor-pointer italic appearance-none">
                    <option value="1">SESSION OPÉRATIONNELLE</option>
                    <option value="0">SESSION ARCHIVÉE</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-6 mt-16">
              <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-6 font-black uppercase text-[11px] tracking-[0.3em] text-slate-400 bg-transparent border-none cursor-pointer hover:text-slate-900 transition-colors italic">Interrompre</button>
              <button type="submit" disabled={isSavingUser} className="flex-1 py-6 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:bg-blue-600 transition-all border-none cursor-pointer shadow-2xl disabled:bg-slate-200">
                {isSavingUser ? <Loader2 className="animate-spin mx-auto" size={20} /> : <><Check size={18} className="inline mr-2" /> Confirmer Scellage</>}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-20 pt-10 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-300 italic">Qualisoft Elite RD 2030 - Système de Gestion Souverain</p>
      </div>
    </div>
  );
}