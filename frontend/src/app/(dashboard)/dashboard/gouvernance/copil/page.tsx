/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : COPIL STRATÉGIQUE (MATRIX CORE) §9.3
 * -------------------------------------------------------------------------
 * RÔLE : Revue de Direction Digitale et Calcul IPE (Indice de Performance).
 * DESIGN : 100dvh, Layout Multi-Grille, Zéro Scroll Global.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 14:48 GMT
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "@/core/api/api-client";
import { 
  Activity, AlertTriangle, BarChart3, CheckCircle2, 
  Download, Globe, MessageSquare, Save, ShieldCheck, 
  TrendingUp, Loader2 
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

export default function CopilPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [decisions, setDecisions] = useState("");
  const [checklist, setChecklist] = useState<any[]>([]);

  const period = useMemo(() => ({ month: new Date().getMonth() + 1, year: 2026 }), []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/copil/analysis", { params: period });
      setData(res.data?.data || res.data);
      setDecisions(res.data?.data?.decisions || "");
      setChecklist(res.data?.data?.isoChecklist || []);
    } catch (e) { toast.error("RUPTURE NOYAU MASTER COPIL"); }
    finally { setLoading(false); }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingScreen label="Scrututation Noyau §9.3..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-50 gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-3"><Globe size={24} className="text-blue-500 animate-pulse" /><h1 className="text-3xl lg:text-4xl tracking-tighter m-0 leading-none">COPIL <span className="text-blue-600">Stratégique</span></h1></div>
          <p className="text-slate-500 text-[9px] tracking-[0.4em] m-0"><ShieldCheck size={12} className="text-emerald-500" /> REVUE DE DIRECTION • ISO 9001 §9.3</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-[10px] flex items-center gap-3 hover:bg-white/10 border-none italic text-white cursor-pointer"><Download size={18} /> Export Direction</button>
          <button onClick={() => {}} className="bg-blue-600 px-10 py-4 rounded-2xl text-[10px] flex items-center gap-3 shadow-2xl border-none transition-all hover:bg-white hover:text-blue-600 italic cursor-pointer">
            <Save size={18} /> Valider Session
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
          <MetricCard title="Efficacité SMI" val={`${data?.stats?.processScore ?? 88}%`} icon={Activity} color="emerald" formula="$$\frac{\sum(Perf. Réelle)}{\sum(Cibles)} \times 100$$" />
          <MetricCard title="Couverture" val={`${data?.stats?.riskCoverage ?? 94}%`} icon={ShieldCheck} color="blue" formula="$$\frac{Actions}{Risques Actifs}$$" />
          <MetricCard title="Écarts NC" val={data?.stats?.openNC ?? 3} icon={AlertTriangle} color="rose" formula="$$\sum Non-Conformités$$" />
          <MetricCard title="Vélocité PAQ" val={`${data?.stats?.paqProgress ?? 72}%`} icon={TrendingUp} color="amber" formula="$$\mu(Actions Closes)$$" />
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 xl:col-span-8 bg-[#151B2B] border-2 border-white/5 rounded-[4rem] p-12 flex flex-col gap-10">
             <div className="flex items-center gap-4 text-blue-500 border-b border-white/5 pb-6">
                <MessageSquare size={24}/><h3 className="text-xl m-0 tracking-widest">Arbitrages Direction</h3>
             </div>
             <textarea value={decisions} onChange={(e) => setDecisions(e.target.value)} className="flex-1 bg-black/40 border-2 border-white/5 rounded-[3rem] p-10 text-white italic font-black text-sm outline-none focus:border-blue-600 shadow-inner resize-none min-h-75 leading-relaxed" placeholder="CONSIGNER LES ARBITRAGES ICI..." />
          </div>

          <div className="col-span-12 xl:col-span-4 flex flex-col gap-8">
            <div className="bg-blue-600 p-10 rounded-[3.5rem] shadow-4xl relative overflow-hidden group">
               <ShieldCheck size={200} className="absolute -right-10 -bottom-10 text-white/10 rotate-12" />
               <h3 className="text-2xl text-white mb-8 m-0 tracking-tighter">Performance SMI</h3>
               <span className="text-6xl font-black italic text-white leading-none">85%</span>
               <div className="mt-8 h-3 w-full bg-white/20 rounded-full overflow-hidden p-1 border border-white/10"><div className="h-full bg-white shadow-[0_0_20px_white] rounded-full" style={{ width: "85%" }} /></div>
            </div>

            <div className="bg-[#151B2B] border border-white/5 p-10 rounded-[3.5rem] flex-1 overflow-hidden flex flex-col">
               <h4 className="text-[11px] text-slate-500 tracking-[0.4em] mb-6 border-b border-white/5 pb-4 m-0 flex items-center gap-3"><BarChart3 size={16}/> Données d&apos;entrée §9.3</h4>
               <div className="overflow-y-auto custom-scrollbar space-y-4">
                 {checklist.map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-6 bg-white/2 rounded-3xl border border-white/5">
                     <span className="text-[10px] font-black italic tracking-tighter m-0">{item.label}</span>
                     {item.status ? <CheckCircle2 size={16} className="text-emerald-500"/> : <AlertTriangle size={16} className="text-rose-500 animate-pulse"/>}
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.1); border-radius: 10px; }` }} />
    </div>
  );
}

function MetricCard({ title, val, icon: Icon, color, formula }: any) {
  const themes: any = { emerald: "text-emerald-500 bg-emerald-500/5", blue: "text-blue-500 bg-blue-500/5", rose: "text-rose-500 bg-rose-500/5", amber: "text-amber-500 bg-amber-500/5" };
  return (
    <div className="bg-[#151B2B] border-2 border-white/5 p-8 rounded-[3rem] flex flex-col justify-between group hover:border-blue-600/30 transition-all shadow-4xl relative overflow-hidden">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={cn("p-4 rounded-2xl border transition-all duration-500 group-hover:scale-110", themes[color])}><Icon size={28} /></div>
      </div>
      <div className="space-y-2 relative z-10">
        <p className="text-[10px] text-slate-500 mb-1 italic m-0 tracking-widest">{title}</p>
        <p className="text-5xl font-black italic text-white tracking-tighter leading-none m-0">{val}</p>
      </div>
      <div className="mt-6 pt-5 border-t border-white/5 relative z-10 text-[11px] text-slate-600 italic font-bold">
        {formula}
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 lg:pl-72">
      <Loader2 className="animate-spin text-blue-500" size={60} strokeWidth={1} />
      <span className="text-[10px] font-black uppercase tracking-[1em] text-blue-500 animate-pulse italic text-center px-10">{label}</span>
    </div>
  );
}
