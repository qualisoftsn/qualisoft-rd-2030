/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛠️ MODULE : SESSION INTERACTIVE DE REVUE (WORKFLOW)
 * -------------------------------------------------------------------------
 * RÔLE : Interface de saisie des analyses et workflow de signature.
 * DESIGN : Elite High-Density, Fixed Toolbar, Split-View Matrix.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 18:15 GMT
 */

"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/core/api/api-client";
import { 
  ArrowLeft, CheckCircle2, ClipboardList, Cpu, 
  Info, Loader2, PenTool, Printer, Save, ShieldAlert, 
  Target, RefreshCw 
} from "lucide-react";
import { toast, Toaster } from "sonner";

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function RevueSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    performance: "", audit: "", risk: "", resources: "", decisions: ""
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/process-reviews/${id}`);
      const d = res.data?.data || res.data;
      setReview(d);
      setForm({
        performance: d.PRV_PerformanceAnalysis || "",
        audit: d.PRV_AuditAnalysis || "",
        risk: d.PRV_RiskAnalysis || "",
        resources: d.PRV_ResourcesAnalysis || "",
        decisions: d.PRV_Decisions || ""
      });
    } catch { toast.error("ÉCHEC DE CONNEXION SDE SESSION"); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/process-reviews/${id}`, {
        PRV_PerformanceAnalysis: form.performance,
        PRV_AuditAnalysis: form.audit,
        PRV_RiskAnalysis: form.risk,
        PRV_ResourcesAnalysis: form.resources,
        PRV_Decisions: form.decisions
      });
      toast.success("BROUILLON SCELLÉ DANS LE SMI");
    } catch { toast.error("ERREUR DE PERSISTANCE MATRIX"); }
    finally { setSaving(false); }
  };

  const handleSign = async () => {
    if (!confirm("Voulez-vous sceller cette revue ? Cette action est irréversible.")) return;
    try {
      await apiClient.post(`/process-reviews/${id}/sign`);
      toast.success("SESSION SCELLÉE & ACTIONS INJECTÉES");
      loadData();
    } catch { toast.error("ÉCHEC D'AUTHENTIFICATION DE SIGNATURE"); }
  };

  if (loading) return <LoadingScreen label="Sécurisation de la séance interactive..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30 relative">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 FIXED HEADER */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-8 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <button onClick={() => router.back()} className="flex items-center gap-3 text-[10px] text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer italic uppercase">
            <ArrowLeft size={16} /> Retour Registre Central
          </button>
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic">Revue <span className="text-blue-600">Processus</span></h1>
        </div>
        <div className="flex gap-4">
           <SignStatus label="Visa Pilote" active={review.PRV_PiloteSigned} />
           <SignStatus label="Visa Direction" active={review.PRV_RQSigned} />
        </div>
      </header>

      {/* 📝 SPLIT WORKZONE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-40">
        <div className="max-w-400 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          <AnalysisField label="1. Analyse Performance (KPI)" val={form.performance} setVal={(v: any) => setForm({...form, performance: v})} icon={Info} color="blue" disabled={review.PRV_Status === 'VALIDEE'} />
          <AnalysisField label="2. Revues Audits & NC" val={form.audit} setVal={(v: any) => setForm({...form, audit: v})} icon={ClipboardList} color="red" disabled={review.PRV_Status === 'VALIDEE'} />
          <AnalysisField label="3. Risques & Opportunités" val={form.risk} setVal={(v: any) => setForm({...form, risk: v})} icon={ShieldAlert} color="amber" disabled={review.PRV_Status === 'VALIDEE'} />
          <AnalysisField label="4. Besoins en Ressources" val={form.resources} setVal={(v: any) => setForm({...form, resources: v})} icon={Cpu} color="purple" disabled={review.PRV_Status === 'VALIDEE'} />
          <div className="lg:col-span-2">
             <AnalysisField label="5. Décisions Stratégiques & Mutations (PAQ)" val={form.decisions} setVal={(v: any) => setForm({...form, decisions: v})} icon={Target} color="emerald" full disabled={review.PRV_Status === 'VALIDEE'} large />
          </div>
        </div>
      </main>

      {/* 🚀 FLOATING ACTION BAR */}
      <div className="fixed bottom-10 left-4 lg:left-1/2 lg:-translate-x-1/2 right-4 lg:right-auto z-50 bg-[#0F172A]/95 backdrop-blur-3xl p-6 rounded-[3.5rem] border-2 border-white/10 shadow-4xl flex gap-6 items-center">
        <button onClick={() => router.push(`/dashboard/process-review/report/${id}`)} className="p-6 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 transition-all cursor-pointer text-slate-400"><Printer size={24}/></button>
        <button onClick={handleSave} disabled={saving || review.PRV_Status === 'VALIDEE'} className="flex-1 lg:flex-none px-12 py-6 bg-white/5 hover:bg-white/10 rounded-[2.5rem] text-[11px] font-black italic border-none cursor-pointer uppercase transition-all tracking-widest text-white disabled:opacity-20 flex items-center gap-3">
          {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} Sauvegarder
        </button>
        <button onClick={handleSign} disabled={review.PRV_Status === 'VALIDEE'} className={cn("flex-1 lg:flex-none px-16 py-6 rounded-[2.5rem] text-[11px] font-black italic border-none cursor-pointer uppercase transition-all tracking-widest text-white shadow-4xl flex items-center gap-3", review.PRV_Status === 'VALIDEE' ? "bg-emerald-600" : "bg-blue-600 hover:scale-105")}>
          {review.PRV_Status === 'VALIDEE' ? <CheckCircle2 size={20}/> : <PenTool size={20}/>} 
          {review.PRV_Status === 'VALIDEE' ? "Session Scellée" : "Signer & Clôturer"}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function AnalysisField({ label, val, setVal, icon: Icon, color, disabled, large }: any) {
  const c: any = { blue: "text-blue-500 border-blue-500/10", red: "text-red-500 border-red-500/10", amber: "text-amber-500 border-amber-500/10", purple: "text-purple-500 border-purple-500/10", emerald: "text-emerald-500 border-emerald-500/10" };
  return (
    <div className={cn("bg-[#151B2B] p-10 lg:p-14 rounded-[3.5rem] border-2 shadow-4xl flex flex-col gap-8 h-full transition-all", c[color])}>
       <h3 className="text-[11px] font-black tracking-[0.4em] m-0 italic flex items-center gap-4"><Icon size={20}/> {label}</h3>
       <textarea disabled={disabled} value={val} onChange={(e) => setVal(e.target.value)} className={cn("w-full flex-1 bg-black/40 border-2 border-white/5 rounded-[2.5rem] p-8 text-sm font-bold text-slate-300 outline-none focus:border-white/20 italic shadow-inner resize-none uppercase", large ? "text-xl font-black text-white lg:min-h-96" : "min-h-48")} placeholder="Saisissez votre analyse..." />
    </div>
  );
}

function SignStatus({ label, active }: any) {
  return (
    <div className={cn("px-8 py-4 rounded-3xl border-2 flex items-center gap-4 transition-all duration-700 shadow-2xl", active ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-500" : "bg-white/5 border-white/10 text-slate-600")}>
       <div className={cn("w-3 h-3 rounded-full", active ? "bg-emerald-500 shadow-[0_0_10px_emerald]" : "bg-slate-700")} />
       <span className="text-[10px] font-black tracking-widest italic">{label}</span>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-indigo-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}