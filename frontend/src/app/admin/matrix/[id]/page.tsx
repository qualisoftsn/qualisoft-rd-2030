/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { matrixApi } from "@/services/matrix.service";
import {
  ArrowLeft,
  Edit3,
  Globe,
  Loader2,
  RefreshCw,
  Save,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState, use } from "react";
import { toast } from "sonner";

export default function TenantCockpit({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const tenantId = resolvedParams.id;

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
      toast.error("LIAISON MATRIX INTERROMPUE");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (tenantId) fetchTenantDetails();
  }, [fetchTenantDetails, tenantId]);

  const handleImpersonate = async () => {
    const tid = toast.loading("Ouverture Tunnel d'Incarnation...");
    try {
      const data = await matrixApi.impersonate(tenantId);

      if (data?.access_token) {
        const targetSlug = data.targetUser?.tenant?.T_Domain?.split(".")[0].toLowerCase() || "app";
        // On redirige vers ton endpoint d'incarnation custom
        window.location.href = `https://${targetSlug}.qualisoft.sn/auth/impersonate?token=${data.access_token}`;
      } else {
        throw new Error("Payload d'incarnation vide.");
      }
    } catch (err: any) {
      toast.error(err.message || "ÉCHEC DU TUNNEL", { id: tid });
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
        await matrixApi.createGlobalUser({ ...payload, password: "Qualisoft@2030" });
      }

      setEditingUser(null);
      fetchTenantDetails();
      toast.success("DONNÉES SCELLÉES", { id: tid });
    } catch (err: any) {
      toast.error("REJET DU KERNEL", { id: tid });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center italic text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">
      <Loader2 className="animate-spin mb-4 text-blue-600" size={32} /> Analyse du Nœud Matrix...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-8 font-sans italic text-slate-200">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <button onClick={() => router.push("/admin/matrix")} className="flex items-center gap-3 text-slate-500 hover:text-white font-black uppercase text-[11px] bg-transparent border-none cursor-pointer tracking-widest">
            <ArrowLeft size={16} /> Retour au Registre
          </button>
          <button onClick={fetchTenantDetails} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-blue-500 cursor-pointer">
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-12 shadow-2xl border-2 border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-white"><ShieldCheck size={220} /></div>
            <div className="relative z-10">
              <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-8">{tenant?.T_Name}</h1>
              <div className="grid grid-cols-2 gap-10 mt-12 text-slate-400 uppercase text-[11px] font-black italic">
                <div className="flex items-center gap-4"><Globe className="text-blue-500" /> {tenant?.T_Domain}</div>
                <div className="flex items-center gap-4"><UserCheck className="text-amber-500" /> Leader : {tenant?.T_CeoName || "Inconnu"}</div>
              </div>
            </div>
            <button onClick={handleImpersonate} className="mt-12 w-full bg-blue-600 text-white py-7 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-white hover:text-slate-900 transition-all border-none cursor-pointer">
              Incarner Administrateur Nœud
            </button>
          </div>
          <div className="bg-white rounded-[3rem] p-12 shadow-2xl flex flex-col justify-center items-center gap-4 text-slate-900 border-8 border-slate-900">
            <Users className="text-blue-600" size={60} />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Utilisateurs</p>
            <p className="text-9xl font-black italic tracking-tighter leading-none">{tenant?._count?.T_Users || 0}</p>
          </div>
        </div>

        <div className="bg-slate-900/40 rounded-[3rem] shadow-2xl border-2 border-slate-800 overflow-hidden">
          <div className="p-10 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
            <h3 className="font-black uppercase text-xs tracking-widest text-slate-500 italic flex items-center gap-4">
              <Users size={22} className="text-blue-600" /> Registre d&apos;Identité
            </h3>
            <button onClick={() => setEditingUser({ U_Email: "", U_FirstName: "", U_LastName: "", U_Role: "USER", U_IsActive: true })} className="bg-white text-slate-900 px-8 py-4 rounded-xl font-black uppercase text-[10px] border-none cursor-pointer">
              Enrôler Citoyen
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/60 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-slate-800 italic">
                <th className="px-12 py-8">Identité</th>
                <th className="px-12 py-8 text-center">Rôle Matrix</th>
                <th className="px-12 py-8 text-right">Contrôle</th>
              </tr>
            </thead>
            <tbody>
              {tenant?.T_Users?.map((user: any) => (
                <tr key={user.U_Id} className="hover:bg-blue-600/5 transition-all border-b border-slate-800/30">
                  <td className="px-12 py-8">
                    <p className="font-black uppercase text-white italic text-sm">{user.U_Email}</p>
                    <span className="text-[10px] text-slate-500 font-bold tracking-widest">{user.U_FirstName} {user.U_LastName}</span>
                  </td>
                  <td className="px-12 py-8 text-center">
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border ${user.U_Role === "ADMIN" ? "border-amber-500 text-amber-500 bg-amber-500/5" : "border-slate-700 text-slate-400 bg-slate-950"}`}>
                      {user.U_Role}
                    </span>
                  </td>
                  <td className="px-12 py-8 text-right">
                    <button onClick={() => setEditingUser(user)} className="p-3 bg-slate-800 rounded-xl text-slate-500 hover:text-white border-none cursor-pointer">
                      <Edit3 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <form onSubmit={handleSaveUser} className="bg-slate-900 border-2 border-slate-800 w-full max-w-2xl rounded-[3rem] p-12 space-y-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-6">
              <h2 className="text-2xl font-black uppercase italic text-white">Édition Souveraine</h2>
              <button type="button" onClick={() => setEditingUser(null)} className="p-2 text-slate-500 hover:text-white bg-transparent border-none cursor-pointer"><X size={24} /></button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Prénom</label>
                <input required className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white font-black italic outline-none" value={editingUser.U_FirstName || ""} onChange={(e) => setEditingUser({ ...editingUser, U_FirstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Nom</label>
                <input required className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white font-black italic outline-none" value={editingUser.U_LastName || ""} onChange={(e) => setEditingUser({ ...editingUser, U_LastName: e.target.value })} />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Email</label>
                <input required className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white font-black italic outline-none" value={editingUser.U_Email || ""} onChange={(e) => setEditingUser({ ...editingUser, U_Email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4">Rôle Matrix</label>
                <select className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white font-black italic appearance-none cursor-pointer" value={editingUser.U_Role} onChange={(e) => setEditingUser({ ...editingUser, U_Role: e.target.value })}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-6 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs hover:bg-blue-600 hover:text-white transition-all border-none cursor-pointer">
              <Save size={18} /> Sceller les Modifications
            </button>
          </form>
        </div>
      )}
    </div>
  );
}