/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛠️ MODULE : SCELLAGE ACTION (PDCA CYCLE)
 * Rôle : Indexation des actions correctives (§10.2).
 * Design : Step-Wizard Dark Matrix.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 02:41 GMT
 */

"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Layers, Loader2, Plus, Save, ShieldCheck, Target, X } from "lucide-react";
import { toast, Toaster } from "sonner";
import apiClient from "@/core/api/api-client";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export default function NewActionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [paqs, setPaqs] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    ACT_Title: "", ACT_Description: "", ACT_Priority: "MEDIUM",
    ACT_Origin: "AUTRE", ACT_Type: "CORRECTIVE", ACT_ResponsableId: "",
    ACT_PAQId: "", ACT_Deadline: "",
    tasks: [] as { titre: string; responsableId: string }[],
  });

  useEffect(() => {
    apiClient.get("/users").then(res => setUsers(res.data?.data || res.data || []));
    apiClient.get("/paq").then(res => setPaqs(res.data?.data || res.data || []));
  }, []);

  const handleSubmit = async () => {
    if (!formData.ACT_Title || !formData.ACT_ResponsableId || !formData.ACT_Deadline) {
      return toast.error("DONNÉES DE SCELLAGE INCOMPLÈTES");
    }
    setLoading(true);
    const tid = toast.loading("Scellage Matrix en cours...");
    try {
      await apiClient.post("/actions", {
        ...formData,
        ACT_Deadline: new Date(formData.ACT_Deadline).toISOString()
      });
      toast.success("ACTION SCELLÉE AU REGISTRE §10.2", { id: tid });
      router.push("/dashboard/improvement?tab=actions");
    } catch {
      toast.error("ÉCHEC DU PROTOCOLE DE SCELLAGE", { id: tid });
    } finally { setLoading(false); }
  };

  const steps = [
    { id: 1, title: "Identification", icon: Target },
    { id: 2, title: "Rattachement", icon: Layers },
    { id: 3, title: "Décomposition", icon: CheckCircle2 },
  ];

  return (
    <div className="ml-0 lg:ml-72 bg-[#0B0F1A] min-h-screen p-6 lg:p-12 italic font-sans text-white">
      <Toaster position="top-right" richColors theme="dark" />

      <div className="mx-auto max-w-3xl animate-in zoom-in-95 duration-500">
        <button onClick={() => router.back()} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer mb-12">
          <ArrowLeft size={16} /> Retour au registre
        </button>

        <header className="mb-16 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white m-0 italic">Nouvelle Action <span className="text-blue-600">Corrective</span></h1>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500 italic m-0">Conformité ISO 9001:2015 §10.2 • Matrix PDCA</p>
        </header>

        <div className="mb-16 flex justify-between relative px-4">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex flex-col items-center flex-1 relative z-10">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-700", 
                step > s.id ? "bg-emerald-500 border-emerald-500 text-white" : 
                step === s.id ? "bg-blue-600 border-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "bg-slate-900 border-white/10 text-slate-600")}>
                {step > s.id ? <CheckCircle2 size={24} /> : <span className="text-lg font-black">{s.id}</span>}
              </div>
              <p className={cn("mt-4 text-[9px] font-black uppercase tracking-widest", step >= s.id ? "text-white" : "text-slate-600")}>{s.title}</p>
              {idx < steps.length - 1 && <div className={cn("absolute h-0.5 top-6 left-1/2 w-full -z-10", step > s.id ? "bg-emerald-500" : "bg-white/5")} />}
            </div>
          ))}
        </div>

        <div className="bg-slate-900/50 border border-white/10 rounded-[4rem] p-10 lg:p-14 shadow-4xl backdrop-blur-md text-left">
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Désignation Officielle *</label><input autoFocus value={formData.ACT_Title} onChange={(e) => setFormData({ ...formData, ACT_Title: e.target.value.toUpperCase() })} placeholder="OPTIMISATION FLUX..." className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl text-sm font-black italic text-white outline-none focus:border-blue-600" /></div>
              <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Analyse des Causes (Ishikawa / 5 Pourquoi)</label><textarea rows={4} value={formData.ACT_Description} onChange={(e) => setFormData({ ...formData, ACT_Description: e.target.value })} className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl text-sm font-bold italic text-slate-400 outline-none focus:border-blue-600 resize-none uppercase" /></div>
              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Priorité Matrix</label><select value={formData.ACT_Priority} onChange={(e) => setFormData({...formData, ACT_Priority: e.target.value})} className="w-full bg-[#0F172A] border border-white/10 p-6 rounded-3xl font-black italic text-white outline-none appearance-none cursor-pointer"><option value="LOW">Basse</option><option value="MEDIUM">Moyenne</option><option value="HIGH">Haute</option><option value="CRITICAL">Critique</option></select></div>
                 <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Type d&apos;Action</label><select value={formData.ACT_Type} onChange={(e) => setFormData({...formData, ACT_Type: e.target.value})} className="w-full bg-[#0F172A] border border-white/10 p-6 rounded-3xl font-black italic text-white outline-none appearance-none cursor-pointer"><option value="CORRECTIVE">Corrective</option><option value="PREVENTIVE">Préventive</option></select></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-6 duration-500">
              <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Rattachement PAQ (§10.2) *</label><select value={formData.ACT_PAQId} onChange={(e) => setFormData({ ...formData, ACT_PAQId: e.target.value })} className="w-full bg-[#0F172A] border border-white/10 p-6 rounded-3xl font-black italic text-white outline-none cursor-pointer appearance-none">{paqs.map((paq) => <option key={paq.PAQ_Id} value={paq.PAQ_Id}>PAQ {paq.PAQ_Year} - {paq.PAQ_Title}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Responsable SMI *</label><select value={formData.ACT_ResponsableId} onChange={(e) => setFormData({ ...formData, ACT_ResponsableId: e.target.value })} className="w-full bg-[#0F172A] border border-white/10 p-6 rounded-3xl font-black italic text-white outline-none cursor-pointer appearance-none">{users.map((u) => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}</select></div>
                <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Échéance Target *</label><input type="date" value={formData.ACT_Deadline} onChange={(e) => setFormData({ ...formData, ACT_Deadline: e.target.value })} className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl font-black text-blue-500 outline-none" /></div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
               <div className="flex justify-between items-center mb-10"><h3 className="text-xl font-black m-0 uppercase italic tracking-tighter">Décomposition Jalons</h3><button type="button" onClick={() => setFormData({ ...formData, tasks: [...formData.tasks, { titre: "", responsableId: formData.ACT_ResponsableId }] })} className="bg-blue-600/10 border border-blue-500/20 text-blue-500 p-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer"><Plus size={20} /></button></div>
               <div className="space-y-4">
                  {formData.tasks.map((task, idx) => (
                    <div key={idx} className="flex gap-4 p-5 bg-white/2 rounded-3xl border border-white/5 animate-in slide-in-from-left-4 duration-500"><input value={task.titre} onChange={(e) => { const nt = [...formData.tasks]; nt[idx].titre = e.target.value.toUpperCase(); setFormData({...formData, tasks: nt}); }} placeholder={`JALON ${idx+1}...`} className="flex-1 bg-transparent border-none text-[12px] font-black text-white italic outline-none" /><X size={16} className="text-slate-600 cursor-pointer hover:text-red-500" onClick={() => setFormData({...formData, tasks: formData.tasks.filter((_, i) => i !== idx)})} /></div>
                  ))}
               </div>
            </div>
          )}

          <div className="mt-16 flex justify-between gap-6 border-t border-white/5 pt-10">
            <button disabled={step === 1} onClick={() => setStep(s => s - 1)} className="flex items-center gap-3 px-10 py-5 rounded-3xl text-[10px] font-black uppercase italic tracking-widest text-slate-500 hover:text-white border-none bg-transparent transition-all cursor-pointer disabled:opacity-0"><ArrowLeft size={16} /> Précédent</button>
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-4 bg-blue-600 text-white px-12 py-5 rounded-3xl text-[10px] font-black uppercase italic tracking-widest transition-all border-none cursor-pointer active:scale-95">Suivant <ArrowRight size={18} /></button>
            ) : (
              <button disabled={loading} onClick={handleSubmit} className="flex items-center gap-4 bg-emerald-600 text-white px-12 py-5 rounded-3xl text-[10px] font-black uppercase italic tracking-widest transition-all border-none cursor-pointer active:scale-95 shadow-3xl shadow-emerald-900/40">{loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Sceller l&apos;Action Corrective</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}