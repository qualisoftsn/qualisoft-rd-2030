/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🎓 MODULE : FormationModal.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Enregistrement des qualifications et recyclages (§7.2 ISO).
 * PHILOSOPHIE : Preuve de compétence scellée au Tenant.
 * RÉVISION : 02 Mars 2026 | 19:25 GMT
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { GraduationCap, Loader2, ShieldCheck, User, X, Calendar } from "lucide-react";
import apiClient from "@/core/api/api-client";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function FormationModal({ onClose, onSuccess }: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    FOR_Title: "",
    FOR_Date: new Date().toISOString().split("T")[0],
    FOR_Expiry: "",
    FOR_UserId: "",
  });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await apiClient.get("/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("ERREUR KERNEL : Liaison RH impossible");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.FOR_UserId) return toast.error("Veuillez assigner un collaborateur");
    
    setLoading(true);
    const tid = toast.loading("Scellage de l'habilitation...");

    try {
      await apiClient.post("/formations", formData);
      toast.success("COMPÉTENCE INDEXÉE AU DOSSIER RH", { id: tid });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("ÉCHEC : Le Kernel a rejeté le certificat", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0B0F1A]/95 backdrop-blur-2xl z-200 flex items-center justify-center p-6 italic font-sans animate-in zoom-in duration-300">
      <div className="bg-[#0F172A] border border-white/10 w-full max-w-xl rounded-[4rem] p-12 relative shadow-4xl text-left overflow-hidden">
        
        {/* FILIGRANE DÉCORATIF */}
        <GraduationCap className="absolute -right-10 -bottom-10 text-orange-600 opacity-5 rotate-12" size={240} />

        <header className="flex items-center justify-between mb-12 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-orange-900/40 animate-pulse">
              <GraduationCap size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none text-white m-0">
                Nouvelle <span className="text-orange-500">Habilitation</span>
              </h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3 m-0">
                Vérification des aptitudes §7.2
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 hover:bg-red-500/20 rounded-2xl text-slate-500 hover:text-white transition-all border-none cursor-pointer">
            <X size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          {/* SÉLECTEUR COLLABORATEUR */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest leading-none">Agent Matrix Assigné</label>
            <div className="relative group">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={20} />
              <select
                required
                className="w-full bg-white/5 border-2 border-white/5 rounded-3xl p-6 pl-16 text-sm font-black italic outline-none focus:border-orange-500 transition-all appearance-none text-white cursor-pointer shadow-inner"
                value={formData.FOR_UserId}
                onChange={(e) => setFormData({ ...formData, FOR_UserId: e.target.value })}
              >
                <option value="" className="bg-slate-900">SÉLECTIONNER UN PROFIL</option>
                {users.map((u) => (
                  <option key={u.U_Id} value={u.U_Id} className="bg-slate-900">
                    {u.U_FirstName} {u.U_LastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DÉSIGNATION FORMATION */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest leading-none">Libellé de la Certification</label>
            <input
              required
              placeholder="EX: CACES R489, HABILITATION ELECTRIQUE B2V..."
              className="w-full bg-white/5 border-2 border-white/5 rounded-3xl p-6 text-sm font-black italic outline-none focus:border-orange-500 transition-all text-white uppercase tracking-tight shadow-inner"
              value={formData.FOR_Title}
              onChange={(e) => setFormData({ ...formData, FOR_Title: e.target.value.toUpperCase() })}
            />
          </div>

          {/* DATES SCELLÉES */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest">Date d&apos;obtention</label>
              <div className="relative">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="date"
                  required
                  className="w-full bg-white/5 border-2 border-white/5 rounded-2xl p-5 pl-14 text-xs font-black text-white outline-none focus:border-orange-500"
                  value={formData.FOR_Date}
                  onChange={(e) => setFormData({ ...formData, FOR_Date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-orange-500/60 ml-5 tracking-widest text-right block">Date de recyclage</label>
              <div className="relative">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" size={16} />
                <input
                  type="date"
                  className="w-full bg-white/5 border-2 border-orange-500/20 rounded-2xl p-5 pl-14 text-xs font-black text-orange-400 outline-none focus:border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.05)]"
                  value={formData.FOR_Expiry}
                  onChange={(e) => setFormData({ ...formData, FOR_Expiry: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-white hover:text-orange-600 py-8 rounded-[2.5rem] font-black uppercase italic text-xs tracking-[0.4em] transition-all flex items-center justify-center gap-5 shadow-3xl border-none cursor-pointer text-white active:scale-95 disabled:opacity-30"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={24} />}
            Sceller au Registre des Compétences
          </button>
        </form>
      </div>
    </div>
  );
}
