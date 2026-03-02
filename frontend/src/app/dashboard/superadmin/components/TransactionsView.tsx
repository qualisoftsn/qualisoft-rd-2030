/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import apiClient from "@/core/api/api-client";
import { Clock, Loader2, MessageSquare, Send, ShieldCheck, TrendingUp, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { TenantMaster } from '../page';

export default function TransactionsView() {
  const [data, setData] = useState<{ tenants: TenantMaster[], stats: any }>({ tenants: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"FINANCE" | "SUPPORT">("FINANCE");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketResponse, setTicketResponse] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/transactions/pending");
      setData(res.data || { tenants: [], stats: { totalRevenue: 125000000, projections24Months: 350000000, pendingRevenue: 25000000, openTickets: 5 } });
    } catch (e) {
      toast.error("Erreur Sync Flux Financiers");
      // Fallback Data pour démo visuelle si pas d'API
      setData({ tenants: [], stats: { totalRevenue: 125000000, projections24Months: 350000000, pendingRevenue: 25000000, openTickets: 5 } });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-indigo-500 font-black italic uppercase">
      <Loader2 className="animate-spin w-12 h-12 mb-4" /> <span className="tracking-[0.5em] text-[10px]">Synchronisation Flux Finance...</span>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 lg:p-12 text-left flex flex-col min-h-[calc(100vh-80px)]">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-white/5 pb-8 lg:pb-10 mb-8 lg:mb-10 shrink-0 gap-6 animate-in fade-in">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-2 font-black uppercase tracking-[0.3em] lg:tracking-[0.4em] text-[9px] lg:text-[10px] m-0">
            <ShieldCheck size={16} className="shrink-0" /> Control Tower
          </div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter text-white leading-none m-0">
            Command <span className="text-indigo-600">Master</span>
          </h1>
        </div>
        <div className="flex gap-2 bg-white/5 p-1.5 lg:p-2 rounded-xl lg:rounded-2xl border border-white/10 backdrop-blur-3xl w-full sm:w-auto">
          <button onClick={() => setView("FINANCE")} className={`flex-1 sm:flex-none px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all border-none m-0 ${view === "FINANCE" ? "bg-indigo-600 text-white shadow-xl" : "text-slate-500 bg-transparent hover:text-white"}`}>
            Finance
          </button>
          <button onClick={() => setView("SUPPORT")} className={`flex-1 sm:flex-none px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all border-none m-0 ${view === "SUPPORT" ? "bg-indigo-600 text-white shadow-xl" : "text-slate-500 bg-transparent hover:text-white"}`}>
            Support ({data.stats?.openTickets || 0})
          </button>
        </div>
      </header>

      {/* STATS STRATÉGIQUES */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-8 shrink-0 mb-8 lg:mb-12 animate-in slide-in-from-bottom-8">
        <StatCard title="Encaissé" value={`${(data.stats?.totalRevenue || 0).toLocaleString('fr-FR')} XOF`} icon={Wallet} color="emerald" trend="Net" />
        <StatCard title="Projection" value={`${(data.stats?.projections24Months || 0).toLocaleString('fr-FR')} XOF`} icon={TrendingUp} color="blue" trend="LTV" highlight />
        <StatCard title="En Attente" value={`${(data.stats?.pendingRevenue || 0).toLocaleString('fr-FR')} XOF`} icon={Clock} color="orange" trend="Closing" />
        <StatCard title="Tickets" value={(data.stats?.openTickets || 0).toString()} icon={MessageSquare} color="red" trend="Alertes" />
      </div>

      <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-4xl lg:rounded-[3.5rem] overflow-hidden flex flex-col shadow-2xl lg:shadow-4xl backdrop-blur-3xl min-h-100 animate-in slide-in-from-bottom-12">
        <div className="overflow-x-auto flex-1 text-left custom-scrollbar">
          {view === "FINANCE" ? (
            <table className="w-full text-left italic min-w-200">
              <thead className="sticky top-0 bg-[#0B0F1A] border-b border-white/5 z-10 text-[9px] lg:text-[10px] font-black uppercase text-slate-500 tracking-widest">
                <tr>
                  <th className="p-6 lg:p-10">Structure</th>
                  <th className="p-6 lg:p-10 text-center">Plan</th>
                  <th className="p-6 lg:p-10 text-center">Échéance</th>
                  <th className="p-6 lg:p-10">Montant</th>
                  <th className="p-6 lg:p-10 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-bold uppercase italic text-xs lg:text-sm">
                {data.tenants.map((t) => (
                  <tr key={t.T_Id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-6 lg:p-10">
                      <p className="text-lg lg:text-xl font-black tracking-tighter text-white m-0 leading-none truncate" title={t.T_Name}>{t.T_Name}</p>
                      <p className="text-[9px] lg:text-[10px] text-slate-500 mt-1.5 lg:mt-2 m-0 truncate">{t.T_Email}</p>
                    </td>
                    <td className="p-6 lg:p-10 text-center">
                      <span className="text-[8px] lg:text-[9px] font-black px-3 py-1 lg:px-4 lg:py-1.5 rounded-full border border-indigo-500/20 text-indigo-400 bg-indigo-500/10">
                        {t.T_Plan}
                      </span>
                    </td>
                    <td className="p-6 lg:p-10 text-center text-slate-300">
                      {new Date(t.T_SubscriptionEndDate).toLocaleDateString()}
                    </td>
                    <td className="p-6 lg:p-10 text-emerald-400 font-black">
                      {(t.T_Transactions?.[0]?.TX_Amount || 0).toLocaleString('fr-FR')} XOF
                    </td>
                    <td className="p-6 lg:p-10 text-right">
                      <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-xl lg:rounded-2xl font-black uppercase text-[9px] lg:text-[10px] shadow-lg transition-all border-none cursor-pointer m-0">
                        Activer
                      </button>
                    </td>
                  </tr>
                ))}
                {data.tenants.length === 0 && <tr><td colSpan={5} className="p-16 text-center text-slate-600 font-black uppercase tracking-widest text-[10px]">Aucune transaction en attente.</td></tr>}
              </tbody>
            </table>
          ) : (
            <div className="p-6 lg:p-12 space-y-4 lg:space-y-6">
              {data.tenants.flatMap((t) => t.T_Tickets || []).map((ticket: any) => (
                <div key={ticket.TK_Id} className="bg-white/5 border border-white/5 p-6 lg:p-10 rounded-4xl lg:rounded-[3rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:border-indigo-500/30 transition-colors shadow-lg">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tighter text-white m-0 leading-tight">{ticket.TK_Subject}</h3>
                    <p className="text-slate-500 text-xs lg:text-sm italic mt-2 m-0 line-clamp-2">{ticket.TK_Description}</p>
                  </div>
                  <button onClick={() => setSelectedTicket(ticket)} className="w-full sm:w-auto bg-indigo-600 p-4 lg:p-6 rounded-xl lg:rounded-3xl text-white shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:scale-105 transition-transform cursor-pointer border-none flex justify-center m-0 shrink-0">
                    <Send size={20} className="lg:w-6 lg:h-6" />
                  </button>
                </div>
              ))}
              {data.tenants.flatMap((t) => t.T_Tickets || []).length === 0 && <p className="text-slate-600 font-black uppercase tracking-widest text-[10px] text-center pt-10">Aucun ticket ouvert.</p>}
            </div>
          )}
        </div>
      </div>

      {/* MODAL SUPPORT RESPONSE */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-999 backdrop-blur-3xl italic overflow-y-auto">
          <div className="absolute inset-0" onClick={() => setSelectedTicket(null)} />
          <div className="relative bg-[#0B0F1A] border border-white/10 w-full max-w-2xl rounded-[2.5rem] lg:rounded-[4rem] p-8 lg:p-16 shadow-[0_0_100px_rgba(79,70,229,0.15)] text-left my-auto animate-in zoom-in-95">
            <h2 className="text-3xl lg:text-4xl font-black uppercase text-white mb-8 lg:mb-10 leading-none tracking-tighter italic m-0">
              Réponse <span className="text-indigo-600">Support</span>
            </h2>
            <textarea
              value={ticketResponse}
              onChange={(e) => setTicketResponse(e.target.value)}
              placeholder="NOTRE RÉPONSE STRATÉGIQUE..."
              className="w-full bg-white/5 border border-white/10 rounded-3xl lg:rounded-3xl p-6 lg:p-8 text-white text-xs lg:text-sm h-48 lg:h-64 outline-none focus:border-indigo-500 italic mb-6 lg:mb-10 resize-none shadow-inner"
            />
            <button className="w-full bg-indigo-600 py-5 lg:py-8 rounded-3xl lg:rounded-4xl font-black uppercase italic text-[10px] lg:text-xs tracking-widest shadow-[0_15px_30px_rgba(79,70,229,0.4)] hover:bg-indigo-500 transition-colors border-none cursor-pointer text-white m-0">
              Transmettre la solution
            </button>
            <button onClick={() => setSelectedTicket(null)} className="w-full mt-4 lg:mt-6 text-[9px] lg:text-[10px] font-black uppercase text-slate-600 hover:text-white transition-colors border-none bg-transparent cursor-pointer m-0">
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, trend, highlight = false }: { title: string, value: string|number, icon: any, color: string, trend: string, highlight?: boolean }) {
  const themes: Record<string, string> = { blue: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20", emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", orange: "text-orange-500 bg-orange-500/10 border-orange-500/20", red: "text-red-500 bg-red-500/10 border-red-500/20" };
  return (
    <div className={`p-6 lg:p-8 rounded-4xl lg:rounded-[3rem] border transition-colors shadow-xl text-left m-0 ${highlight ? "bg-indigo-600 border-indigo-400 shadow-[0_15px_30px_rgba(79,70,229,0.3)]" : "bg-slate-900/40 border-white/5 hover:border-indigo-500/30"}`}>
      <div className="flex justify-between items-start mb-6 lg:mb-8">
        <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center border shadow-inner shrink-0 ${highlight ? "bg-white text-indigo-600 border-white" : themes[color]}`}>
          <Icon size={20} className="lg:w-6 lg:h-6" />
        </div>
        <span className={`text-[7px] lg:text-[8px] font-black uppercase italic shrink-0 ${highlight ? "text-indigo-100" : "text-slate-600"}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className={`text-[9px] lg:text-[10px] font-black uppercase mb-1 lg:mb-2 italic leading-none m-0 ${highlight ? "text-indigo-200" : "text-slate-500"}`}>
          {title}
        </p>
        <span className="text-2xl sm:text-3xl lg:text-4xl font-black italic tracking-tighter text-white leading-none m-0 truncate block">
          {value}
        </span>
      </div>
    </div>
  );
}