/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  CheckCircle2, XCircle, Loader2, ShieldCheck, RefreshCcw, 
  TrendingUp, Clock, Wallet, MessageSquare, Send, ImageIcon, 
  Search, ArrowRightCircle, Mail
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MasterCommandCenter() {
  const [data, setData] = useState<any>({ tenants: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [view, setView] = useState<'FINANCE' | 'SUPPORT'>('FINANCE');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketResponse, setTicketResponse] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/transactions/pending'); 
      setData(res.data);
    } catch (e) { toast.error("Erreur Sync Master"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (tenantId: string, action: string) => {
    if(!confirm(`Exécuter Closing : ${action} ?`)) return;
    setIsProcessing(tenantId);
    try {
      await apiClient.post(`/admin/tenant/${tenantId}/status`, { action });
      toast.success("Succès ! Facture et Email envoyés.");
      fetchData();
    } catch (e) { toast.error("Erreur Opération"); } finally { setIsProcessing(null); }
  };

  const handleReplyTicket = async () => {
    try {
      await apiClient.post(`/admin/tickets/${selectedTicket.TK_Id}/answer`, { response: ticketResponse });
      toast.success("Réponse transmise !");
      setSelectedTicket(null); setTicketResponse(''); fetchData();
    } catch (e) { toast.error("Erreur Support"); }
  };

  if (loading) return <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase animate-pulse ml-72"><Loader2 className="animate-spin mb-4" size={40}/>Sync Master Intelligence...</div>;

  return (
    <div className="h-screen overflow-hidden flex flex-col p-8 space-y-8 italic font-sans bg-[#0B0F1A] ml-72 text-left">
      <header className="flex justify-between items-end border-b border-white/5 pb-8 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-blue-400 mb-2 font-black uppercase tracking-[0.4em] text-[10px]"><ShieldCheck size={16}/> Control Tower</div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">Master <span className="text-blue-600">Command</span></h1>
        </div>
        <div className="flex gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/10">
          <button onClick={() => setView('FINANCE')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'FINANCE' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Finance</button>
          <button onClick={() => setView('SUPPORT')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'SUPPORT' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Support ({data.stats?.openTickets})</button>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-6 shrink-0">
        <StatCard title="Encaissé" value={`${data.stats?.totalRevenue?.toLocaleString()} XOF`} icon={Wallet} color="emerald" trend="Net" />
        <StatCard title="Projection 24M" value={`${data.stats?.projections24Months?.toLocaleString()} XOF`} icon={TrendingUp} color="blue" trend="LTV" highlight />
        <StatCard title="En Attente" value={`${data.stats?.pendingRevenue?.toLocaleString()} XOF`} icon={Clock} color="orange" trend="Closing" />
        <StatCard title="Tickets" value={data.stats?.openTickets} icon={MessageSquare} color="red" trend="Alertes" />
      </div>

      <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-hidden flex flex-col min-h-0">
        {view === 'FINANCE' ? (
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-[#0B0F1A] border-b border-white/5 z-10">
                <tr className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
                  <th className="p-8">Structure</th><th className="p-8 text-center">Plan</th><th className="p-8 text-center">Contrat</th><th className="p-8">Flux</th><th className="p-8 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.tenants.map((t: any) => (
                  <tr key={t.T_Id} className="hover:bg-white/2">
                    <td className="p-8"><p className="text-xl font-black uppercase text-white leading-none tracking-tighter">{t.T_Name}</p><p className="text-[10px] text-slate-400 mt-2 font-bold uppercase italic">{t.T_CeoName} • {t.T_Phone}</p></td>
                    <td className="p-8 text-center"><span className="text-[9px] font-black uppercase px-4 py-1.5 rounded-full border border-blue-500/20 text-blue-500 bg-blue-500/10">{t.T_Plan}</span></td>
                    <td className="p-8 text-center"><p className="text-xs font-black text-white italic">{t.T_SubscriptionEndDate ? new Date(t.T_SubscriptionEndDate).toLocaleDateString() : '---'}</p><p className="text-[8px] font-black uppercase text-slate-600 mt-1">Tacite: {t.T_TacitRenewal ? 'OUI' : 'NON'}</p></td>
                    <td className="p-8"><p className="text-xs font-black text-emerald-500">{(t.T_Transactions?.[0]?.TX_Amount || 0).toLocaleString()} XOF</p><p className="text-[9px] text-slate-500 uppercase italic">{t.T_Transactions?.[0]?.TX_Reference}</p></td>
                    <td className="p-8 text-right">
                      {t.T_SubscriptionStatus !== 'ACTIVE' ? (
                        <button onClick={() => handleAction(t.T_Id, 'ACTIVATE')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] shadow-2xl flex items-center gap-2 ml-auto"><ArrowRightCircle size={14} /> Activer</button>
                      ) : <div className="flex justify-end gap-2"><button className="p-3 bg-white/5 rounded-xl text-slate-500"><Mail size={16}/></button><button onClick={() => handleAction(t.T_Id, 'DEACTIVATE')} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-red-500"><XCircle size={16}/></button></div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 space-y-6 overflow-y-auto">
             {data.tenants.flatMap((t: any) => t.T_Tickets || []).map((ticket: any) => (
               <div key={ticket.TK_Id} className="bg-white/2 border border-white/5 p-8 rounded-[2.5rem] flex justify-between items-center group hover:border-blue-500/30 transition-all">
                 <div className="space-y-2"><h3 className="text-2xl font-black uppercase italic text-white leading-none">{ticket.TK_Subject}</h3><p className="text-slate-400 text-xs italic line-clamp-2 max-w-3xl">{ticket.TK_Description}</p></div>
                 <button onClick={() => setSelectedTicket(ticket)} className="bg-blue-600 hover:bg-blue-500 p-6 rounded-3xl text-white shadow-2xl"><Send size={24} /></button>
               </div>
             ))}
          </div>
        )}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B0F1A] border border-white/10 w-full max-w-2xl rounded-[3rem] p-12 shadow-3xl italic text-left animate-in zoom-in duration-300">
            <h2 className="text-4xl font-black uppercase italic text-white mb-8">Réponse <span className="text-blue-600">Support</span></h2>
            <div className="bg-white/5 p-6 rounded-2xl mb-8 border border-white/5"><p className="text-[9px] font-black uppercase text-blue-500 mb-2 tracking-widest italic">Message Client :</p><p className="text-white text-sm font-bold italic leading-relaxed">&quot;{selectedTicket.TK_Description}&quot;</p></div>
            <textarea value={ticketResponse} onChange={(e) => setTicketResponse(e.target.value)} placeholder="Réponse stratégique..." className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-white text-sm outline-none focus:border-blue-500 h-48 mb-8 italic" />
            <button onClick={handleReplyTicket} className="w-full bg-blue-600 py-6 rounded-3xl font-black uppercase italic tracking-tighter flex justify-center items-center gap-4 text-white shadow-2xl"><Send size={20} /> Envoyer Solution</button>
            <button onClick={() => setSelectedTicket(null)} className="w-full mt-4 text-[10px] font-black uppercase text-slate-600 hover:text-white transition-colors tracking-widest">Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, trend, highlight = false }: any) {
  const colorMap: any = { blue: "text-blue-500 bg-blue-500/10 border-blue-500/20", emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", orange: "text-orange-500 bg-orange-500/10 border-orange-500/20", red: "text-red-500 bg-red-500/10 border-red-500/20" };
  return (
    <div className={`border p-6 rounded-[2.5rem] transition-all shadow-2xl ${highlight ? 'bg-blue-600 border-blue-400' : 'bg-slate-900/40 border-white/5 hover:border-blue-500/30'}`}>
      <div className="flex justify-between items-start"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${highlight ? 'bg-white text-blue-600 border-white' : colorMap[color]}`}><Icon size={22} /></div><span className={`text-[7px] font-black uppercase tracking-tighter italic ${highlight ? 'text-blue-200' : 'text-slate-600'}`}>{trend}</span></div>
      <div className="mt-6"><p className={`text-[8px] font-black uppercase mb-1 italic ${highlight ? 'text-blue-100' : 'text-slate-500'}`}>{title}</p><span className={`text-3xl font-black italic tracking-tighter text-white`}>{value}</span></div>
    </div>
  );
}