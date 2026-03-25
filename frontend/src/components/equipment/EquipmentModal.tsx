/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🚜 MODULE : EquipmentModal.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Enregistrement et suivi VGP du matériel.
 * SÉCURITÉ : Scellage au registre SDE via Master Kernel.
 * RÉVISION : 02 Mars 2026 | 19:15 GMT
 */

"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Settings2, ShieldCheck, X, Calendar } from "lucide-react";
import apiClient from "@/core/api/api-client";
import { toast } from "sonner";

interface Props {
  equipment?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EquipmentModal({ equipment, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    EQ_Reference: "",
    EQ_Name: "",
    EQ_DateService: new Date().toISOString().split("T")[0],
    EQ_ProchaineVGP: new Date().toISOString().split("T")[0],
    EQ_Status: "OPERATIONNEL",
  });

  useEffect(() => {
    if (equipment) {
      setForm({
        EQ_Reference: equipment.EQ_Reference || "",
        EQ_Name: equipment.EQ_Name || "",
        EQ_DateService: equipment.EQ_DateService ? new Date(equipment.EQ_DateService).toISOString().split("T")[0] : "",
        EQ_ProchaineVGP: equipment.EQ_ProchaineVGP ? new Date(equipment.EQ_ProchaineVGP).toISOString().split("T")[0] : "",
        EQ_Status: equipment.EQ_Status || "OPERATIONNEL",
      });
    }
  }, [equipment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Scellage de l'actif matériel...");

    try {
      if (equipment) {
        await apiClient.patch(`/equipments/${equipment.EQ_Id}`, form);
        toast.success("REGISTRE MATÉRIEL MIS À JOUR", { id: tid });
      } else {
        await apiClient.post("/equipments", form);
        toast.success("ACTIF ENRÔLÉ AVEC SUCCÈS", { id: tid });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Rejet de l'enregistrement Kernel", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0B0F1A]/95 backdrop-blur-md z-100 flex items-center justify-center p-4 italic font-sans text-left">
      <div className="bg-[#0F172A] border border-white/10 w-full max-w-xl rounded-[3rem] overflow-hidden shadow-4xl animate-in zoom-in duration-300">
        
        <header className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-blue-600/20 rounded-xl"><Settings2 className="text-blue-500" size={24} /></div>
            <div>
              <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter m-0 leading-none">
                {equipment ? "Rectifier" : "Nouvel"} <span className="text-blue-500">Matériel</span>
              </h2>
              <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-2 m-0 italic">Inventaire Souverain RD 2026</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all border-none cursor-pointer"><X size={24} /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <Input label="Référence / SN" value={form.EQ_Reference} onChange={(v: string) => setForm({...form, EQ_Reference: v.toUpperCase()})} placeholder="EX: SN-2025-CH01" />
            <Input label="Désignation" value={form.EQ_Name} onChange={(v: any) => setForm({...form, EQ_Name: v})} placeholder="EX: CHARIOT TOYOTA" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 block ml-4 tracking-widest">Mise en Service</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                <input type="date" required value={form.EQ_DateService} onChange={e => setForm({...form, EQ_DateService: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-xs text-white font-black outline-none focus:border-blue-500 italic" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase block ml-4 tracking-widest text-orange-500">Échéance VGP</label>
              <div className="relative">
                <ShieldCheck size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" />
                <input type="date" required value={form.EQ_ProchaineVGP} onChange={e => setForm({...form, EQ_ProchaineVGP: e.target.value})} className="w-full bg-white/5 border border-orange-500/30 rounded-2xl p-4 pl-12 text-xs text-orange-500 font-black outline-none focus:border-orange-500 italic" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 block ml-4 tracking-widest">Statut Opérationnel Matrix</label>
            <select value={form.EQ_Status} onChange={e => setForm({...form, EQ_Status: e.target.value})} className="w-full bg-[#161e31] border border-white/10 rounded-2xl p-5 text-sm text-white font-black outline-none cursor-pointer uppercase italic appearance-none">
              <option value="OPERATIONNEL">✅ Opérationnel (Actif)</option>
              <option value="EN_MAINTENANCE">🛠️ En Maintenance</option>
              <option value="HS">🚨 Hors Service / Réforme</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 py-6 rounded-3xl font-black uppercase italic text-white flex items-center justify-center gap-4 hover:bg-white hover:text-blue-600 transition-all shadow-xl active:scale-95 border-none cursor-pointer">
            {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />} <span>{equipment ? "Valider les modifications" : "Enregistrer au Registre SDE"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase text-slate-500 block ml-4 tracking-widest">{label}</label>
      <input required value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white font-black outline-none focus:border-blue-600 transition-all italic uppercase" />
    </div>
  );
}
