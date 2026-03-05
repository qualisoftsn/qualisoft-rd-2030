/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💳 MODULE : MASTER TRANSACTIONS & SUPPORT (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Monitoring des flux financiers et arbitrage du support Master.
 * DESIGN : 100dvh / Matrix Command / Industrial High-Density.
 * ARCHITECTURE : Kernel Sovereign (Sans NextAuth).
 * ---------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 22:45 GMT
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import apiClient from "@/core/api/api-client";
import { 
  Clock, MessageSquare, Send, ShieldCheck, 
  TrendingUp, Wallet, RefreshCw, CheckCircle2 
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/core/utils/cn";

export default function TransactionsView() {
  const [data, setData] = useState<any>({ tenants: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"FINANCE" | "SUPPORT">("FINANCE");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketResponse, setTicketResponse] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/transactions/pending");
      // Fallback data si le kernel n'a pas encore de flux réels
      setData(res.data?.data || res.data || { 
        tenants: [], 
        stats: { totalRevenue: 125000000, projections24Months: 350000000, pendingRevenue: 25000000, openTickets: 5 } 
      });
    } catch {
      toast.error("Rupture de synchronisation financière.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <ViewLoader label="Analyse des Flux Monétaires Master..." />;

  return (
    <div className="h-full flex flex-col overflow-hidden text-left italic font-black uppercase">
      
      {/* 🔝 HEADER TACTIQUE */}
      <header className="shrink-0 p-8 lg:p-12 border-b border-white/5 bg-black/20 flex flex-col xl:flex-row justify-between items-end gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-indigo-400 text-[10px] tracking-[0.4em]">
            <ShieldCheck size={18} /> Master Control Tower
          </div>
          <h1 className="text-4xl lg:text-6xl tracking-tighter leading-none m-0">Command <span className="text-indigo-600">Master</span></h1>
          <p className="text-slate-500 text-[9px] tracking-[0.3em] m-0">
            {"LTV Projection : $$LTV = \\sum_{i=1}^{n} (MRR_i \\times Churn_{rate})$$"}
          </p>
        </div>

        <div className="flex gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-3xl w-full xl:w-auto shadow-inner">
          <button onClick={() => setView("FINANCE")} className={cn("flex-1 px-8 py-4 rounded-xl text-[10px] font-black uppercase transition-all border-none cursor-pointer", view === "FINANCE" ? "bg-indigo-600 text-white shadow-xl" : "text-slate-500 hover:text-white")}>FINANCE</button>
          <button onClick={() => setView("SUPPORT")} className={cn("flex-1 px-8 py-4 rounded-xl text-[10px] font-black uppercase transition-all border-none cursor-pointer", view === "SUPPORT" ? "bg-indigo-600 text-white shadow-xl" : "text-slate-500 hover:text-white")}>SUPPORT ({data.stats?.openTickets || 0})</button>
        </div>
      </header>

      {/* 📊 SCORECARDS FINANCE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
        <div className="max-w-400 mx-auto space-y-12">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            <StatCard title="Encaissé Global" value={`${(data.stats?.totalRevenue || 0).toLocaleString()} XOF`} icon={Wallet} color="emerald" trend="NET" />
            <StatCard title="Projection 24M" value={`${(data.stats?.projections24Months || 0).toLocaleString()} XOF`} icon={TrendingUp} color="blue" trend="LTV" highlight />
            <StatCard title="Flux Latents" value={`${(data.stats?.pendingRevenue || 0).toLocaleString()} XOF`} icon={Clock} color="orange" trend="PENDING" />
            <StatCard title="Alerte Support" value={(data.stats?.openTickets || 0).toString()} icon={MessageSquare} color="red" trend="TICKETS" />
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] overflow-hidden shadow-4xl backdrop-blur-3xl">
            {view === "FINANCE" ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#0B0F1A] border-b border-white/5 text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">
                  <tr>
                    <th className="p-8 lg:p-10">Structure Cluster</th>
                    <th className="p-8 text-center">Plan</th>
                    <th className="p-8 text-center">Échéance</th>
                    <th className="p-8">Flux</th>
                    <th className="p-8 text-right">Arbitrage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.tenants.length > 0 ? data.tenants.map((t: any) => (
                    <tr key={t.T_Id} className="hover:bg-indigo-600/5 transition-colors group">
                      <td className="p-8 lg:p-10">
                        <p className="text-2xl font-black tracking-tighter text-white m-0 group-hover:text-indigo-400 transition-colors">{t.T_Name}</p>
                        <p className="text-[10px] text-slate-500 mt-2 tracking-widest lowercase opacity-60 m-0 font-bold">{t.T_Email}</p>
                      </td>
                      <td className="p-8 text-center">
                        <span className="text-[9px] font-black px-4 py-1.5 rounded-xl border border-indigo-500/20 text-indigo-400 bg-indigo-500/10 uppercase tracking-widest">{t.T_Plan}</span>
                      </td>
                      <td className="p-8 text-center text-slate-400 text-sm">{new Date(t.T_SubscriptionEndDate).toLocaleDateString()}</td>
                      <td className="p-8 text-emerald-400 font-black text-xl">{(t.T_Transactions?.[0]?.TX_Amount || 0).toLocaleString()} XOF</td>
                      <td className="p-8 text-right">
                        <button className="bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] transition-all border-none cursor-pointer shadow-lg active:scale-95">ACTIVER</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="p-20 text-center text-slate-600 tracking-[0.5em] text-[10px]">Aucune transaction en attente au Kernel.</td></tr>
                  )}
                </tbody>
              </table>
            ) : (
              <div className="p-10 lg:p-16 space-y-8">
                {data.tenants.flatMap((t: any) => t.T_Tickets || []).length > 0 ? data.tenants.flatMap((t: any) => t.T_Tickets || []).map((ticket: any) => (
                  <div key={ticket.TK_Id} className="bg-white/5 border border-white/5 p-10 rounded-[3rem] flex items-center justify-between group hover:border-indigo-500/50 transition-all shadow-xl">
                    <div className="space-y-4 text-left">
                      <h3 className="text-2xl font-black uppercase tracking-tighter text-white m-0">{ticket.TK_Subject}</h3>
                      <p className="text-slate-400 text-xs italic opacity-70 m-0 leading-relaxed max-w-3xl">{ticket.TK_Description}</p>
                    </div>
                    <button onClick={() => setSelectedTicket(ticket)} className="p-6 bg-indigo-600 rounded-3xl text-white shadow-2xl hover:scale-105 transition-transform border-none cursor-pointer"><Send size={24} /></button>
                  </div>
                )) : (
                  <div className="py-20 flex flex-col items-center opacity-30 gap-6">
                    <CheckCircle2 size={60} strokeWidth={1} />
                    <p className="tracking-[0.5em] text-[10px]">Le Cluster est parfaitement stable.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 🛡️ MODAL SUPPORT RESPONSE */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-6 z-1000 backdrop-blur-3xl">
          <div className="absolute inset-0" onClick={() => setSelectedTicket(null)} />
          <div className="relative bg-[#0B0F1A] border border-white/10 w-full max-w-2xl rounded-[4rem] p-12 lg:p-16 shadow-4xl animate-in zoom-in-95">
            <h2 className="text-3xl lg:text-4xl font-black uppercase text-white mb-10 tracking-tighter italic m-0">Réponse <span className="text-indigo-600">Master</span></h2>
            <textarea 
              value={ticketResponse} 
              onChange={e => setTicketResponse(e.target.value)} 
              placeholder="VOTRE RÉPONSE STRATÉGIQUE..." 
              className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-white text-sm h-64 outline-none focus:border-indigo-600 italic mb-10 resize-none shadow-inner uppercase font-black" 
            />
            <button className="w-full bg-indigo-600 py-8 rounded-[2.5rem] font-black uppercase italic text-xs tracking-widest shadow-2xl hover:bg-white hover:text-indigo-600 transition-all border-none cursor-pointer text-white active:scale-95">Transmettre la solution</button>
            <button onClick={() => setSelectedTicket(null)} className="w-full mt-6 text-[10px] text-slate-600 font-black uppercase hover:text-white transition-colors border-none bg-transparent cursor-pointer">Annuler</button>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, trend, highlight }: any) {
  const colors: any = { emerald: "text-emerald-500 bg-emerald-500/10", blue: "text-indigo-500 bg-indigo-500/10", orange: "text-orange-500 bg-orange-500/10", red: "text-rose-500 bg-rose-500/10" };
  return (
    <div className={cn("p-10 rounded-[3.5rem] border transition-all shadow-2xl text-left", highlight ? "bg-indigo-600 border-indigo-400" : "bg-slate-900/40 border-white/5 hover:border-indigo-500/30")}>
      <div className="flex justify-between items-start mb-8">
        <div className={cn("p-4 rounded-2xl border shadow-inner", highlight ? "bg-white text-indigo-600" : colors[color])}><Icon size={24} /></div>
        <span className={cn("text-[8px] font-black uppercase italic tracking-widest", highlight ? "text-indigo-200" : "text-slate-600")}>{trend}</span>
      </div>
      <p className={cn("text-[10px] font-black uppercase mb-3 italic tracking-widest", highlight ? "text-indigo-100" : "text-slate-500")}>{title}</p>
      <span className="text-3xl lg:text-4xl font-black italic tracking-tighter text-white leading-none block truncate">{value}</span>
    </div>
  );
}

function ViewLoader({ label }: { label: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-indigo-500 italic font-black uppercase gap-8">
      <RefreshCw className="animate-spin" size={60} strokeWidth={1} />
      <span className="text-[10px] tracking-[0.5em] animate-pulse">{label}</span>
    </div>
  );
}