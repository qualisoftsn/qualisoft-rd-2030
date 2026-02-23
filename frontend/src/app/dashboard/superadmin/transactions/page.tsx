/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ NOM ABSOLU : src/app/dashboard/admin/transactions/page.tsx
 * FONCTION : Centre de commandement financier (Closing) et Support.
 * RÔLE : Arbitrage des transactions monétaires et réponses aux tickets critiques.
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  Clock,
  Loader2,
  MessageSquare,
  Send,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function MasterCommandCenter() {
  const [data, setData] = useState<any>({ tenants: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"FINANCE" | "SUPPORT">("FINANCE");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketResponse, setTicketResponse] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/transactions/pending");
      setData(res.data);
    } catch (e) {
      toast.error("Erreur Sync Master");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase ml-72">
        <Loader2 className="animate-spin mb-4" size={50} /> Synchronisation Flux
        Finance...
      </div>
    );

  return (
    <div className="h-screen overflow-hidden flex flex-col p-8 space-y-8 italic font-sans bg-[#0B0F1A] ml-72 text-left">
      <header className="flex justify-between items-end border-b border-white/5 pb-8 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-blue-400 mb-2 font-black uppercase tracking-[0.4em] text-[10px]">
            <ShieldCheck size={16} /> Control Tower
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white leading-none">
            Command <span className="text-blue-600">Master</span>
          </h1>
        </div>
        <div className="flex gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-3xl">
          <button
            onClick={() => setView("FINANCE")}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${view === "FINANCE" ? "bg-blue-600 text-white shadow-xl" : "text-slate-500"}`}
          >
            Finance
          </button>
          <button
            onClick={() => setView("SUPPORT")}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${view === "SUPPORT" ? "bg-blue-600 text-white shadow-xl" : "text-slate-500"}`}
          >
            Support ({data.stats?.openTickets})
          </button>
        </div>
      </header>

      {/* STATS STRATÉGIQUES */}
      <div className="grid grid-cols-4 gap-8 shrink-0">
        <StatCard
          title="Encaissé"
          value={`${data.stats?.totalRevenue?.toLocaleString()} XOF`}
          icon={Wallet}
          color="emerald"
          trend="Net"
        />
        <StatCard
          title="Projection"
          value={`${data.stats?.projections24Months?.toLocaleString()} XOF`}
          icon={TrendingUp}
          color="blue"
          trend="LTV"
          highlight
        />
        <StatCard
          title="En Attente"
          value={`${data.stats?.pendingRevenue?.toLocaleString()} XOF`}
          icon={Clock}
          color="orange"
          trend="Closing"
        />
        <StatCard
          title="Tickets"
          value={data.stats?.openTickets}
          icon={MessageSquare}
          color="red"
          trend="Alertes"
        />
      </div>

      <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-[3.5rem] overflow-hidden flex flex-col shadow-4xl backdrop-blur-3xl min-h-0">
        <div className="overflow-y-auto flex-1 text-left">
          {view === "FINANCE" ? (
            <table className="w-full text-left italic">
              <thead className="sticky top-0 bg-[#0B0F1A] border-b border-white/5 z-10 text-[9px] font-black uppercase text-slate-500 tracking-widest">
                <tr>
                  <th className="p-10">Structure</th>
                  <th className="p-10 text-center">Plan</th>
                  <th className="p-10 text-center">Échéance</th>
                  <th className="p-10">Montant</th>
                  <th className="p-10 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-bold uppercase italic text-sm">
                {data.tenants.map((t: any) => (
                  <tr
                    key={t.T_Id}
                    className="hover:bg-white/2 transition-all group"
                  >
                    <td className="p-10">
                      <p className="text-xl font-black tracking-tighter text-white">
                        {t.T_Name}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-2">
                        {t.T_Email}
                      </p>
                    </td>
                    <td className="p-10 text-center">
                      <span className="text-[9px] font-black px-4 py-1.5 rounded-full border border-blue-500/20 text-blue-500 bg-blue-500/10">
                        {t.T_Plan}
                      </span>
                    </td>
                    <td className="p-10 text-center">
                      {new Date(t.T_SubscriptionEndDate).toLocaleDateString()}
                    </td>
                    <td className="p-10 text-emerald-500">
                      {(t.T_Transactions?.[0]?.TX_Amount || 0).toLocaleString()}{" "}
                      XOF
                    </td>
                    <td className="p-10 text-right">
                      <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] shadow-2xl transition-all border-none cursor-pointer">
                        Activer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 space-y-6">
              {data.tenants
                .flatMap((t: any) => t.T_Tickets || [])
                .map((ticket: any) => (
                  <div
                    key={ticket.TK_Id}
                    className="bg-white/2 border border-white/5 p-10 rounded-[3rem] flex justify-between items-center hover:border-blue-500/30 transition-all"
                  >
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
                        {ticket.TK_Subject}
                      </h3>
                      <p className="text-slate-500 text-sm italic mt-2">
                        {ticket.TK_Description}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="bg-blue-600 p-6 rounded-3xl text-white shadow-3xl hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Send size={24} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL SUPPORT RESPONSE */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-999 backdrop-blur-3xl italic">
          <div className="bg-[#0B0F1A] border border-white/10 w-full max-w-2xl rounded-[4rem] p-16 shadow-4xl text-left">
            <h2 className="text-4xl font-black uppercase text-white mb-10 leading-none tracking-tighter italic">
              Réponse <span className="text-blue-600">Support</span>
            </h2>
            <textarea
              value={ticketResponse}
              onChange={(e) => setTicketResponse(e.target.value)}
              placeholder="notre RÉPONSE STRATÉGIQUE..."
              className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-white text-sm h-64 outline-none focus:border-blue-500 italic mb-10"
            />
            <button className="w-full bg-blue-600 py-8 rounded-4xl font-black uppercase italic text-xs tracking-widest shadow-3xl hover:bg-blue-500 transition-all border-none cursor-pointer">
              Transmettre la solution
            </button>
            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full mt-6 text-[10px] font-black uppercase text-slate-700 hover:text-white transition-all border-none bg-transparent cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  highlight = false,
}: any) {
  const themes: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
  };
  return (
    <div
      className={`p-8 rounded-[3rem] border transition-all shadow-4xl text-left ${highlight ? "bg-blue-600 border-blue-400 shadow-blue-500/30" : "bg-slate-900/40 border-white/5 hover:border-blue-500/30"}`}
    >
      <div className="flex justify-between items-start">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${highlight ? "bg-white text-blue-600 border-white" : themes[color]}`}
        >
          <Icon size={24} />
        </div>
        <span
          className={`text-[8px] font-black uppercase italic ${highlight ? "text-blue-100" : "text-slate-600"}`}
        >
          {trend}
        </span>
      </div>
      <div className="mt-8">
        <p
          className={`text-[10px] font-black uppercase mb-2 italic ${highlight ? "text-blue-100" : "text-slate-500"}`}
        >
          {title}
        </p>
        <span className="text-4xl font-black italic tracking-tighter text-white leading-none">
          {value}
        </span>
      </div>
    </div>
  );
}
