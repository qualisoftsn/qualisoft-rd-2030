/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : COPIL STRATÉGIQUE (MATRIX CORE)
 * Rôle : Analyse transverse §9.3 • Revue de Direction Digitale.
 * Fix : Normalisation des calculs LaTeX et responsive grid.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 02:40 GMT
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  Activity, AlertTriangle, BarChart3, Calculator, CheckCircle2,
  Download, Globe, Info, LucideIcon, MessageSquare, Save,
  ShieldCheck, TrendingUp, Zap, Loader2
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

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
      if (res.data) {
        setData(res.data.data || res.data);
        setDecisions(res.data.data?.decisions || "");
        setChecklist(res.data.data?.isoChecklist || []);
      }
    } catch (e) {
      toast.error("RUPTURE DE LIAISON NOYAU MASTER");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const tid = toast.loading("Scellage des arbitrages...");
    setIsSaving(true);
    try {
      await apiClient.patch("/copil/decisions", { decisions, ...period });
      toast.success("DÉCISIONS COPIL SCELLÉES", { id: tid });
    } catch (e) {
      toast.error("ÉCHEC D'ÉCRITURE REGISTRE", { id: tid });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="ml-0 lg:ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 text-blue-500">
      <Loader2 className="animate-spin" size={64} />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] italic animate-pulse">Calcul Maturité Matrix §9.3...</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans ml-0 lg:ml-72 flex flex-col overflow-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="px-10 py-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-50 shadow-2xl gap-6 mt-12 lg:mt-0">
        <div className="flex items-center gap-8 text-left">
          <div className="w-14 h-14 bg-blue-600/10 border border-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 shadow-2xl shrink-0"><Globe size={28} className="animate-pulse" /></div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter italic leading-none m-0">Gouvernance <span className="text-blue-600">COPIL</span></h1>
            <p className="text-slate-500 font-black uppercase text-[9px] tracking-[0.4em] mt-3 italic flex items-center gap-2 leading-none m-0">
              <ShieldCheck size={12} className="text-emerald-500" /> REVUE DE DIRECTION • ISO 9001 §9.3
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 hover:bg-white/10 transition-all italic text-white cursor-pointer shadow-lg border-none">
            <Download size={18} /> Export Direction
          </button>
          <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-2xl border-none cursor-pointer italic text-white active:scale-95">
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Valider Session
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 grid grid-cols-12 grid-rows-6 gap-6 lg:gap-10 overflow-hidden">
        <div className="col-span-12 row-span-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-10">
          <MetricCard title="Efficacité SMI" val={`${data?.stats?.processScore ?? 0}%`} icon={Activity} color="emerald" formula="$$\frac{\sum(Perf. Réelle)}{\sum(Cibles)} \times 100$$" />
          <MetricCard title="Couverture Risques" val={`${data?.stats?.riskCoverage ?? 0}%`} icon={ShieldCheck} color="blue" formula="$$\frac{Actions}{Risques Actifs}$$" />
          <MetricCard title="Écarts NC_" val={data?.stats?.openNC ?? 0} icon={AlertTriangle} color="red" formula="$$\sum Non-Conformités$$" />
          <MetricCard title="Vélocité PAQ" val={`${data?.stats?.paqProgress ?? 0}%`} icon={TrendingUp} color="amber" formula="$$\mu(Actions Closes)$$" />
        </div>

        <div className="col-span-12 xl:col-span-4 row-span-5 flex flex-col gap-6 lg:gap-10 overflow-hidden">
          <div className="flex-1 bg-slate-900/20 border border-white/5 rounded-[3.5rem] p-10 flex flex-col overflow-hidden backdrop-blur-sm shadow-inner group">
            <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-4 text-left m-0"><Zap className="text-amber-500" size={24} /> Vigilance Système</h3>
            <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar">
              {data?.criticalPoints?.map((p: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-6 bg-[#0B0F1A]/80 rounded-4xl border-l-4 border-red-600 hover:bg-red-600/10 transition-all shadow-lg">
                  <div className="text-left max-w-[70%]">
                    <span className="text-[9px] font-black text-slate-600 uppercase italic block tracking-[0.3em] mb-1">{p.cat}</span>
                    <h4 className="text-sm font-black uppercase italic text-white leading-tight m-0">{p.label}</h4>
                  </div>
                  <span className="text-4xl font-black italic text-red-500 tracking-tighter leading-none">{p.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[45%] bg-slate-900/20 border border-white/5 rounded-[3.5rem] p-10 flex flex-col backdrop-blur-sm shadow-inner text-left">
            <h3 className="text-2xl font-black uppercase italic mb-6 flex items-center gap-4 text-blue-500 m-0"><MessageSquare size={24} /> Arbitrages Direction</h3>
            <textarea value={decisions} onChange={(e) => setDecisions(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-3xl p-6 text-white italic font-bold text-sm outline-none focus:border-blue-600 shadow-inner resize-none custom-scrollbar uppercase leading-relaxed" placeholder="CONSIGNER LES ARBITRAGES..." />
          </div>
        </div>

        <div className="hidden xl:flex col-span-4 row-span-5 flex-col gap-10 overflow-hidden">
          <div className="flex-1 bg-blue-600/5 border border-blue-600/10 rounded-[4rem] p-10 flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center gap-6 mb-10 text-left">
              <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-2xl border border-blue-400/30 shrink-0"><Calculator size={32} /></div>
              <div>
                <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter leading-none m-0">Logique <span className="text-blue-500">Calcul SMI</span></h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase italic mt-1 tracking-widest leading-none m-0">Algorithmes de Maturité Matrix</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6 pr-6 custom-scrollbar text-left">
              <LogicItem title="Indice Performance" formula="$$\frac{\sum (Perf / Cible)}{N}$$" desc="Moyenne pondérée de l'atteinte des objectifs." />
              <LogicItem title="Maîtrise Risques" formula="$$\frac{Mitigés}{Total}$$" desc="Efficacité à transformer menaces en actions." />
              <LogicItem title="Maturité Global" formula="$$Audit + \text{Conf.}$$" desc="Algorithme d'excellence ISO 9001:2015." />
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 row-span-5 flex flex-col gap-6 lg:gap-10 overflow-hidden">
          <div className="bg-blue-600 p-10 rounded-[3.5rem] shadow-3xl relative overflow-hidden shrink-0 group">
            <div className="absolute -right-16 -bottom-16 text-white/10 rotate-12 group-hover:rotate-0 transition-all duration-700"><ShieldCheck size={280} /></div>
            <div className="relative z-10 text-left">
              <h3 className="text-3xl font-black uppercase italic text-white mb-8 leading-none tracking-tighter m-0">Maturité SMI</h3>
              <div className="flex justify-between items-end mb-4 px-2">
                <span className="text-[10px] font-black uppercase text-blue-100 italic tracking-[0.2em] leading-none">Performance Trajectoire</span>
                <span className="text-5xl font-black text-white italic leading-none tracking-tighter">85%</span>
              </div>
              <div className="h-4 bg-white/20 rounded-full overflow-hidden p-1 border border-white/10 shadow-inner">
                <div className="h-full bg-white shadow-[0_0_20px_white] transition-all duration-1000 ease-out rounded-full" style={{ width: "85%" }} />
              </div>
            </div>
          </div>

          <div className="flex-1 bg-slate-900/20 border border-white/5 p-10 rounded-[3.5rem] overflow-hidden flex flex-col backdrop-blur-sm shadow-inner text-left">
            <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] mb-8 italic flex items-center gap-4 border-b border-white/5 pb-4 leading-none m-0"><BarChart3 size={18} /> Données d&apos;entrée §9.3</h4>
            <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-6 bg-white/2 border border-white/5 rounded-3xl hover:bg-white/5 transition-all shadow-md">
                  <span className={cn("text-[11px] font-black uppercase italic tracking-tighter m-0 leading-none", item.status ? "text-white" : "text-slate-600")}>{item.label}</span>
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center border transition-all", item.status ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-500" : "bg-red-500/20 border-red-500/30 text-red-500")}>
                    {item.status ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} className="animate-pulse" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }`}</style>
    </div>
  );
}

function MetricCard({ title, val, icon: Icon, color, formula }: any) {
  const themes: any = { emerald: "text-emerald-500 bg-emerald-500/5", blue: "text-blue-500 bg-blue-500/5", red: "text-red-500 bg-red-500/5", amber: "text-amber-500 bg-amber-500/5" };
  return (
    <div className="bg-[#0F172A]/40 border border-white/5 p-8 rounded-[3rem] flex flex-col justify-between group hover:border-blue-500/30 transition-all backdrop-blur-xl shadow-2xl text-left relative overflow-hidden">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={cn("p-4 rounded-2xl border transition-all duration-500 group-hover:scale-110", themes[color])}><Icon size={28} /></div>
        <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic leading-none m-0">Master KPI</span>
      </div>
      <div className="space-y-2 relative z-10">
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none italic m-0">{title}</p>
        <p className="text-4xl lg:text-5xl font-black italic text-white tracking-tighter leading-none m-0">{val}</p>
      </div>
      <div className="mt-6 pt-5 border-t border-white/5 relative z-10">
        <div className="text-[11px] text-slate-600 font-bold tracking-tight italic m-0">{formula}</div>
      </div>
    </div>
  );
}

function LogicItem({ title, formula, desc }: any) {
  return (
    <div className="p-8 bg-white/2 border border-white/5 rounded-[2.5rem] hover:bg-blue-600/5 transition-all text-left shadow-lg">
      <h4 className="text-base font-black uppercase italic text-blue-500 leading-none mb-4 tracking-tight m-0">{title}</h4>
      <div className="bg-black/40 p-5 rounded-2xl border border-white/5 mb-5 shadow-inner"><div className="text-blue-100 text-[13px] font-black italic tracking-tight m-0">{formula}</div></div>
      <p className="text-[10px] text-slate-500 font-bold uppercase italic leading-relaxed tracking-widest m-0">{desc}</p>
    </div>
  );
}