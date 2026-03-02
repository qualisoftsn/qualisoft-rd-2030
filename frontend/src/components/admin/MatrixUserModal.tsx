/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 👑 MODULE : MatrixUserModal.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Habilitation des agents (U_).
 * VERSION : 10.0.0 (Zéro NextAuth)
 * RÉVISION : 02 Mars 2026 | 18:05 GMT
 */

"use client";

import React, { useEffect, useState } from "react";
import { matrixApi, MatrixRole } from "@/services/matrix.service";
import { Loader2, Mail, Save, X } from "lucide-react";
import { toast } from "sonner";

export default function MatrixUserModal({ isOpen, onClose, onSuccess, userToEdit }: any) {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    role: "USER" as MatrixRole, tenantId: ""
  });

  useEffect(() => {
    if (isOpen) {
      matrixApi.getTenants().then(setTenants).catch(() => toast.error("Sync Tenants Échouée"));
      if (userToEdit) {
        setForm({
          firstName: userToEdit.U_FirstName || "", lastName: userToEdit.U_LastName || "",
          email: userToEdit.U_Email || "", role: userToEdit.U_Role || "USER",
          tenantId: userToEdit.tenantId || "", password: ""
        });
      }
    }
  }, [isOpen, userToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Scellage Matrix Kernel...");

    try {
      const payload = { ...form, email: form.email.toLowerCase().trim() };
      userToEdit ? await matrixApi.updateUser(userToEdit.U_Id, payload) : await matrixApi.createGlobalUser(payload);
      toast.success("PROFIL SCELLÉ : Accréditation validée.", { id: tid });
      onSuccess(); onClose();
    } catch (err: any) {
      toast.error("ERREUR : " + (err.response?.data?.message || "Rejet Kernel"), { id: tid });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-[#0B0F1A]/95 backdrop-blur-xl p-6 italic font-sans text-left">
      <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <header className="p-10 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter m-0 leading-none">
            {userToEdit ? "Rectifier Profil" : "Enrôler Citoyen"}
          </h2>
          <button onClick={onClose} className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"><X size={24} /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
            <Input label="Prénom" value={form.firstName} onChange={(v: string) => setForm({...form, firstName: v.toUpperCase()})} />
            <Input label="Nom" value={form.lastName} onChange={(v: string) => setForm({...form, lastName: v.toUpperCase()})} />
          </div>
          <Input icon={Mail} label="Email Professionnel" type="email" value={form.email} onChange={(v: any) => setForm({...form, email: v})} />
          
          <div className="space-y-3">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6 italic leading-none">Accréditation Système</label>
             <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-xs font-black uppercase italic outline-none cursor-pointer focus:border-blue-600 appearance-none"
               value={form.role} onChange={e => setForm({...form, role: e.target.value as MatrixRole})}>
               <option value="SUPER_ADMIN">👑 SUPER ADMIN</option>
               <option value="ADMIN">🏢 ADMIN TENANT</option>
               <option value="RQ">⭐ RESP. QUALITÉ (RQ)</option>
               <option value="USER">👤 COLLABORATEUR</option>
             </select>
          </div>

          {!userToEdit && (
             <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6 italic">Ancrage Organisationnel</label>
               <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-xs font-black uppercase italic outline-none cursor-pointer focus:border-blue-600 appearance-none"
                 value={form.tenantId} onChange={e => setForm({...form, tenantId: e.target.value})}>
                 <option value="">-- CHOISIR TENANT --</option>
                 {tenants.map((t: any) => <option key={t.T_Id} value={t.T_Id}>{t.T_Name}</option>)}
               </select>
             </div>
          )}

          <button disabled={loading} className="w-full bg-slate-950 text-white py-7 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.4em] hover:bg-blue-600 transition-all flex justify-center items-center gap-4 shadow-3xl active:scale-95 border-none cursor-pointer">
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />} VALIDER L&apos;ACCES MATRIX
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, icon: Icon, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6 italic leading-none">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />}
        <input {...props} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-sm font-bold italic outline-none focus:border-blue-600 transition-all ${Icon ? 'pl-16' : ''}`} onChange={e => props.onChange(e.target.value)} />
      </div>
    </div>
  );
}