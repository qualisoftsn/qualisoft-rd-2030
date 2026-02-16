/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Building2, Key, Loader2, Edit3, X, UserPlus, Globe, Users, ShieldAlert, UserCheck, ShieldCheck, Mail, Lock, RefreshCw } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { matrixApi, TenantDetails, MatrixRole } from "@/services/matrix.service";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function TenantCockpit() {
  const router = useRouter();
  const params = useParams();
  const tenantId = typeof params?.id === 'string' ? params.id : "";
  const [tenant, setTenant] = useState<TenantDetails | any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState<string>("");

  const fetchTenantDetails = useCallback(async () => {
    if (!tenantId || tenantId === 'deploy') return;
    try { setLoading(true); const data = await matrixApi.getDetails(tenantId); setTenant(data); }
    catch (err) { toast.error("ÉCHEC SYNC MATRIX"); } finally { setLoading(false); }
  }, [tenantId]);

  useEffect(() => { fetchTenantDetails(); }, [fetchTenantDetails]);

  const handleImpersonate = async () => {
    const tid = toast.loading("Tunnel d'incarnation...");
    try {
      const data = await matrixApi.impersonate(tenantId);
      if (data?.token) {
        const result = await signIn("credentials", { redirect: false, impersonationToken: data.token, impersonatedUser: JSON.stringify(data.user) });
        if (result?.ok) window.location.href = "/dashboard";
      }
    } catch (err) { toast.error("PONT ROMPU", { id: tid }); }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Traitement Kernel...");
    try {
      const payload: any = { firstName: editingUser.U_FirstName, lastName: editingUser.U_LastName, email: editingUser.U_Email.toLowerCase().trim(), role: editingUser.U_Role, tenantId };
      if (newPassword) payload.password = newPassword;
      if (editingUser.U_Id) await matrixApi.updateUser(editingUser.U_Id, payload);
      else await matrixApi.createGlobalUser(payload);
      setEditingUser(null); setNewPassword(""); fetchTenantDetails(); toast.success("SCELLÉ", { id: tid });
    } catch (err: any) { toast.error("REJET KERNEL", { id: tid }); }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center italic font-black uppercase tracking-widest text-slate-500"><Loader2 className="animate-spin text-blue-600 mb-6" size={48} /> Sync Neuro-Cortex Matrix...</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-8 font-sans italic selection:bg-blue-600/30 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="flex justify-between items-center"><button onClick={() => router.push('/admin/matrix')} className="flex items-center gap-3 text-slate-500 hover:text-white font-black uppercase text-[11px] bg-transparent border-none cursor-pointer group"><ArrowLeft size={16} /> Retour Matrix</button><button onClick={fetchTenantDetails} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-blue-500 cursor-pointer"><RefreshCw size={16} /></button></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-12 shadow-2xl border-2 border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-white"><ShieldCheck size={220} /></div>
            <div className="relative z-10"><h1 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-8">{tenant.T_Name}</h1><div className="grid grid-cols-2 gap-10 mt-12 text-slate-400 uppercase text-[11px] font-black italic"><div className="flex items-center gap-4"><Globe className="text-blue-500" /> {tenant.T_Domain}.qualisoft.sn</div><div className="flex items-center gap-4"><UserCheck className="text-amber-500" /> DG : {tenant.T_CeoName || "Inconnu"}</div></div></div>
            <button onClick={handleImpersonate} className="mt-12 bg-blue-600 text-white py-7 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-white hover:text-slate-900 transition-all border-none cursor-pointer">Activer Tunnel d&apos;Incarnation</button>
          </div>
          <div className="bg-white rounded-[3rem] p-12 shadow-2xl flex flex-col justify-center items-center gap-4 text-slate-900 border-8 border-slate-900"><Users className="text-blue-600" size={60} /><p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Citoyens Actifs</p><p className="text-9xl font-black italic tracking-tighter">{tenant._count?.T_Users || 0}</p></div>
        </div>

        <div className="bg-slate-900/40 rounded-[3rem] shadow-2xl border-2 border-slate-800 overflow-hidden backdrop-blur-sm">
          <div className="p-10 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center"><h3 className="font-black uppercase text-xs tracking-widest text-slate-500 italic flex items-center gap-4"><Users size={22} className="text-blue-600" /> Registre d&apos;Identité</h3><button onClick={() => setEditingUser({ U_Email: "", U_FirstName: "", U_LastName: "", U_Role: "USER" })} className="bg-white text-slate-900 px-8 py-4 rounded-xl font-black uppercase text-[10px] border-none cursor-pointer">Enrôler Citoyen</button></div>
          <table className="w-full text-left"><thead><tr className="bg-slate-950/60 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-slate-800"><th className="px-12 py-8">Identité</th><th className="px-12 py-8 text-center">Accréditation</th><th className="px-12 py-8 text-right">Actions</th></tr></thead><tbody>
              {tenant.T_Users?.map((user: any) => (<tr key={user.U_Id} className="hover:bg-blue-600/5 transition-all"><td className="px-12 py-8"><div className="font-black text-white uppercase italic text-sm">{user.U_Email}</div><div className="text-[10px] font-bold text-slate-500 uppercase mt-1">{user.U_FirstName} {user.U_LastName}</div></td><td className="px-12 py-8 text-center"><span className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-[9px] font-black text-slate-300">{user.U_Role}</span></td><td className="px-12 py-8 text-right"><button onClick={() => setEditingUser(user)} className="p-3 bg-slate-800 rounded-xl text-slate-500 hover:text-white border-none cursor-pointer"><Edit3 size={16} /></button></td></tr>))}
          </tbody></table>
        </div>
      </div>
    </div>
  );
}