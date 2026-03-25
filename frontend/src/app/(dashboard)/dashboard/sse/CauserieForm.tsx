/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📝 MODULE : CAUSERIE PROGRAMMATION FORM (ELITE SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Programmation des sensibilisations §7.3.
 * DESIGN : 100dvh Isolated Scroll / Matrix Command.
 */

"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/core/api/api-client";
import { Calendar, Loader2, Save, ShieldAlert, Target, Users, X } from "lucide-react";
import { toast } from "sonner";

export default function CauserieForm({ onClose, onRefresh }: { onClose: () => void, onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    CS_Theme: "", CS_Date: new Date().toISOString().split("T")[0],
    CS_AnimateurId: "", CS_Description: "", CS_Type: "SÉCURITÉ",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient.get("/users");
        setUsers(res.data?.data || res.data || []);
      } catch { toast.error("ERREUR KERNEL : Annuaire inaccessible."); }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Scellage de la session...");
    try {
      await apiClient.post("/causeries", formData);
      toast.success("SESSION SCELLÉE AU REGISTRE", { id: tid });
      onRefresh();
      onClose();
    } catch {
      toast.error("REJET KERNEL : Transaction refusée.", { id: tid });
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-600 flex items-center justify-center bg-slate-950/90 backdrop-blur-3xl p-4 overflow-hidden italic font-black uppercase">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-[#0F172A] border border-blue-500/20 w-full max-w-2xl rounded-[3rem] lg:rounded-[4rem] shadow-4xl flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95">
        
        <header className="p-8 lg:p-10 border-b border-white/5 bg-black/40 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6 text-left">
            <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-600/20">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-black italic tracking-tighter text-white m-0">Programmer <span className="text-blue-500">Sensibilisation</span></h2>
              <p className="text-[10px] text-slate-500 tracking-[0.4em] mt-2 m-0">ISO 45001 • Prévention Participative</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-600 rounded-2xl transition-all border-none cursor-pointer text-slate-400 hover:text-white"><X size={24}/></button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 lg:p-14 space-y-10 overflow-y-auto custom-scrollbar flex-1 text-left">
          <div className="space-y-4">
            <label className="text-[11px] text-blue-500 tracking-widest ml-4 flex items-center gap-2"><Target size={14}/> Thème de la causerie *</label>
            <input required autoFocus placeholder="EX: PORT DES EPI, RISQUES CHIMIQUES..." className="w-full bg-black/40 border-2 border-white/10 rounded-4xl p-6 text-xs font-black text-white outline-none focus:border-blue-500 shadow-inner uppercase" value={formData.CS_Theme} onChange={(e) => setFormData({ ...formData, CS_Theme: e.target.value.toUpperCase() })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[11px] text-slate-500 tracking-widest ml-4 flex items-center gap-2"><Calendar size={14}/> Date d&apos;exécution</label>
              <input type="date" required className="w-full bg-black/40 border-2 border-white/10 rounded-4xl p-6 text-xs font-black text-white outline-none focus:border-blue-500 shadow-inner" value={formData.CS_Date} onChange={(e) => setFormData({ ...formData, CS_Date: e.target.value })} />
            </div>

            <div className="space-y-4">
              <label className="text-[11px] text-slate-500 tracking-widest ml-4">Périmètre ISO</label>
              <select className="w-full bg-black/40 border-2 border-white/10 rounded-4xl p-6 text-xs font-black text-white outline-none focus:border-blue-500 cursor-pointer appearance-none shadow-inner" value={formData.CS_Type} onChange={(e) => setFormData({ ...formData, CS_Type: e.target.value })}>
                <option value="SÉCURITÉ">SANTÉ & SÉCURITÉ (45001)</option>
                <option value="ENVIRONNEMENT">ENVIRONNEMENT (14001)</option>
                <option value="QUALITÉ">QUALITÉ (9001)</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] text-slate-500 tracking-widest ml-4 flex items-center gap-2"><Users size={14}/> Animateur Référent</label>
            <select required className="w-full bg-black/40 border-2 border-white/10 rounded-4xl p-6 text-xs font-black text-white outline-none focus:border-blue-500 cursor-pointer appearance-none shadow-inner" value={formData.CS_AnimateurId} onChange={(e) => setFormData({ ...formData, CS_AnimateurId: e.target.value })}>
              <option value="">-- CHOISIR UN ANIMATEUR --</option>
              {users.map((u) => (
                <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName} — [{u.U_Role}]</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-8 rounded-4xl font-black text-xs tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-white hover:text-blue-600 transition-all shadow-4xl cursor-pointer active:scale-95 disabled:opacity-50 border-none mt-6">
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />} Programmer dans le Registre
          </button>
        </form>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}
