/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛠️ MODULE : SCELLAGE ACTION CORRECTIVE §10.2 (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Indexation du cycle PDCA et décomposition des jalons.
 * DESIGN : Step-Wizard Matrix, 100dvh (Zéro Scroll Global), PWA Ready.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 15:58 GMT
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, ArrowRight, CheckCircle2, Layers, Loader2, 
  Plus, Save, ShieldCheck, Target, X, RefreshCcw 
} from "lucide-react";
import { toast, Toaster } from "sonner";
import apiClient from "@/core/api/api-client";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export default function NewActionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [paqs, setPaqs] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    ACT_Title: "", 
    ACT_Description: "", 
    ACT_Priority: "MEDIUM",
    ACT_Origin: "AUTRE", 
    ACT_Type: "CORRECTIVE", 
    ACT_ResponsableId: "",
    ACT_PAQId: "", 
    ACT_Deadline: "",
    tasks: [] as { titre: string; responsableId: string }[],
  });

  // --- SYNCHRONISATION KERNEL ---
  const loadInitialData = useCallback(async () => {
    try {
      setFetching(true);
      const [uRes, pRes] = await Promise.all([
        apiClient.get("/users"),
        apiClient.get("/paq")
      ]);
      setUsers(uRes.data?.data || uRes.data || []);
      setPaqs(pRes.data?.data || pRes.data || []);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("ÉCHEC DE SYNCHRONISATION DES RÉFÉRENTIELS");
    } finally { setFetching(false); }
  }, []);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  // --- SCELLAGE FINAL ---
  const handleSubmit = async () => {
    if (!formData.ACT_Title || !formData.ACT_ResponsableId || !formData.ACT_Deadline) {
      return toast.error("PROTOCOLE INCOMPLET : CHAMPS OBLIGATOIRES MANQUANTS");
    }
    
    setLoading(true);
    const tid = toast.loading("Scellage de l'action dans le noyau §10.2...");
    try {
      await apiClient.post("/actions", {
        ...formData,
        ACT_Deadline: new Date(formData.ACT_Deadline).toISOString()
      });
      toast.success("ACTION SCELLÉE AVEC SUCCÈS AU REGISTRE", { id: tid });
      router.push("/dashboard/improvement?tab=actions");
    } catch {
      toast.error("ERREUR DE SCELLAGE CRITIQUE", { id: tid });
    } finally { setLoading(false); }
  };

  const steps = [
    { id: 1, title: "Identification", icon: Target },
    { id: 2, title: "Rattachement", icon: Layers },
    { id: 3, title: "Décomposition", icon: CheckCircle2 },
  ];

  if (fetching) return <LoadingScreen label="Synchronisation des Référentiels..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER FIXE */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 mt-12 lg:mt-0 bg-[#0B0F1A]/95 backdrop-blur-xl z-40">
        <button onClick={() => router.back()} className="flex items-center gap-3 text-slate-500 hover:text-white transition-all text-[10px] bg-transparent border-none cursor-pointer italic tracking-widest">
          <ArrowLeft size={16} /> Retour au registre
        </button>
        <div className="text-center md:text-right">
          <h1 className="text-3xl lg:text-4xl tracking-tighter m-0 leading-none">Nouvelle Action <span className="text-blue-600">PDCA</span></h1>
          <p className="text-slate-500 text-[9px] tracking-[0.4em] m-0 mt-2">Conformité ISO 9001 §10.2 • Matrix Scellage</p>
        </div>
      </header>

      {/* 📜 WORKZONE (Scroll Isolé) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-12">
          
          {/* STEPPER MATRIX */}
          <div className="flex justify-between relative px-10">
            <div className="absolute top-6 left-20 right-20 h-0.5 bg-white/5 -z-10">
               <div className="h-full bg-blue-600 transition-all duration-700" style={{ width: `${(step - 1) * 50}%` }} />
            </div>
            {steps.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-4 relative z-10">
                <div className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500",
                  step > s.id ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]" : 
                  step === s.id ? "bg-blue-600 border-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-110" : 
                  "bg-slate-900 border-white/10 text-slate-600"
                )}>
                  {step > s.id ? <CheckCircle2 size={28} /> : <s.icon size={24} />}
                </div>
                <span className={cn("text-[9px] tracking-widest", step >= s.id ? "text-white" : "text-slate-600")}>{s.title}</span>
              </div>
            ))}
          </div>

          {/* FORM CONTAINER */}
          <div className="bg-[#151B2B] border-2 border-white/5 rounded-[4rem] p-10 lg:p-16 shadow-4xl text-left backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
               <ShieldCheck size={200} />
            </div>

            {step === 1 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-500 ml-6 tracking-widest">DÉSIGNATION DE L&apos;ACTION *</label>
                  <input autoFocus value={formData.ACT_Title} onChange={(e) => setFormData({ ...formData, ACT_Title: e.target.value.toUpperCase() })} placeholder="OPTIMISATION DES FLUX DE PRODUCTION..." className="w-full bg-black/40 border-2 border-white/5 p-6 rounded-3xl text-sm font-black italic text-white outline-none focus:border-blue-600 transition-all" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-500 ml-6 tracking-widest">ANALYSE DES CAUSES (ISHIKAWA / 5P)</label>
                  <textarea rows={4} value={formData.ACT_Description} onChange={(e) => setFormData({ ...formData, ACT_Description: e.target.value })} className="w-full bg-black/40 border-2 border-white/5 p-6 rounded-3xl text-sm font-bold text-slate-400 outline-none focus:border-blue-600 resize-none italic" placeholder="DÉTAILLER L'ANALYSE D'IMPACT..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] text-slate-500 ml-6 tracking-widest">PRIORITÉ</label>
                      <select value={formData.ACT_Priority} onChange={(e) => setFormData({...formData, ACT_Priority: e.target.value})} className="w-full bg-black/40 border-2 border-white/5 p-6 rounded-3xl text-[11px] text-white outline-none cursor-pointer appearance-none">
                        <option value="LOW">BASSE</option>
                        <option value="MEDIUM">MOYENNE</option>
                        <option value="HIGH">HAUTE</option>
                        <option value="CRITICAL">CRITIQUE</option>
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] text-slate-500 ml-6 tracking-widest">TYPE D&apos;ACTION</label>
                      <select value={formData.ACT_Type} onChange={(e) => setFormData({...formData, ACT_Type: e.target.value})} className="w-full bg-black/40 border-2 border-white/5 p-6 rounded-3xl text-[11px] text-white outline-none cursor-pointer appearance-none">
                        <option value="CORRECTIVE">CORRECTIVE</option>
                        <option value="PREVENTIVE">PRÉVENTIVE</option>
                      </select>
                   </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-6 duration-500">
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-500 ml-6 tracking-widest">RATTACHEMENT PAQ ANNUEL *</label>
                  <select value={formData.ACT_PAQId} onChange={(e) => setFormData({ ...formData, ACT_PAQId: e.target.value })} className="w-full bg-black/40 border-2 border-white/5 p-6 rounded-3xl text-[11px] text-white outline-none cursor-pointer appearance-none italic">
                    <option value="">CHOISIR LE PLAN D&apos;ACTION...</option>
                    {paqs.map((paq) => <option key={paq.PAQ_Id} value={paq.PAQ_Id}>PAQ {paq.PAQ_Year} - {paq.PAQ_Title}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] text-slate-500 ml-6 tracking-widest">RESPONSABLE SMI (§5.3) *</label>
                    <select value={formData.ACT_ResponsableId} onChange={(e) => setFormData({ ...formData, ACT_ResponsableId: e.target.value })} className="w-full bg-black/40 border-2 border-white/5 p-6 rounded-3xl text-[11px] text-white outline-none cursor-pointer appearance-none">
                      <option value="">CHOISIR PILOTE...</option>
                      {users.map((u) => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] text-slate-500 ml-6 tracking-widest">ÉCHÉANCE TARGET *</label>
                    <input type="date" value={formData.ACT_Deadline} onChange={(e) => setFormData({ ...formData, ACT_Deadline: e.target.value })} className="w-full bg-black/40 border-2 border-white/5 p-6 rounded-3xl text-[11px] text-blue-500 outline-none font-black italic" />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center border-b border-white/5 pb-6">
                   <h3 className="text-xl font-black m-0 tracking-tighter">Décomposition des Jalons</h3>
                   <button type="button" onClick={() => setFormData({ ...formData, tasks: [...formData.tasks, { titre: "", responsableId: formData.ACT_ResponsableId }] })} className="bg-blue-600/10 border border-blue-500/20 text-blue-500 p-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer"><Plus size={24} /></button>
                </div>
                <div className="space-y-4 max-h-75 overflow-y-auto custom-scrollbar pr-4">
                  {formData.tasks.map((task, idx) => (
                    <div key={idx} className="flex gap-4 p-5 bg-black/20 rounded-3xl border border-white/5 items-center group">
                      <input value={task.titre} onChange={(e) => { const nt = [...formData.tasks]; nt[idx].titre = e.target.value.toUpperCase(); setFormData({...formData, tasks: nt}); }} placeholder={`IDENTIFIER JALON ${idx+1}...`} className="flex-1 bg-transparent border-none text-[12px] font-black text-white italic outline-none" />
                      <button type="button" onClick={() => setFormData({...formData, tasks: formData.tasks.filter((_, i) => i !== idx)})} className="p-2 text-slate-600 hover:text-rose-500 transition-colors bg-transparent border-none cursor-pointer"><X size={18} /></button>
                    </div>
                  ))}
                  {formData.tasks.length === 0 && <p className="text-center text-slate-700 py-10 italic">Aucun jalon défini. Cliquez sur + pour ajouter.</p>}
                </div>
              </div>
            )}

            {/* NAV ACTIONS */}
            <div className="mt-16 flex justify-between gap-6 border-t border-white/5 pt-10">
              <button disabled={step === 1} onClick={() => setStep(s => s - 1)} className="flex items-center gap-3 px-10 py-5 rounded-3xl text-[10px] font-black text-slate-500 hover:text-white border-none bg-transparent transition-all cursor-pointer disabled:opacity-0">
                <ArrowLeft size={16} /> Précédent
              </button>
              {step < 3 ? (
                <button onClick={() => setStep(s => s + 1)} className="bg-blue-600 text-white px-12 py-5 rounded-3xl text-[10px] flex items-center gap-4 transition-all border-none cursor-pointer hover:bg-white hover:text-blue-600 shadow-4xl">
                  Suivant <ArrowRight size={18} />
                </button>
              ) : (
                <button disabled={loading} onClick={handleSubmit} className="bg-emerald-600 text-white px-12 py-5 rounded-3xl text-[10px] flex items-center gap-4 transition-all border-none cursor-pointer hover:bg-white hover:text-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Sceller l&apos;Action Corrective
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.1); border-radius: 10px; }` }} />
    </div>
  );
}

// --- SOUS-COMPOSANT SDE ---
function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 lg:pl-72 text-blue-500">
      <RefreshCcw className="animate-spin" size={60} strokeWidth={1} />
      <span className="text-[10px] font-black uppercase tracking-[1em] animate-pulse italic">{label}</span>
    </div>
  );
}