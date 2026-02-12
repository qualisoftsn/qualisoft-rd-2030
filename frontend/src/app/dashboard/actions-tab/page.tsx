/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { Target, Plus, Search, Activity, Gauge, AlertCircle, Layers, Clock, X, CheckCircle2, Loader2, Calculator, TrendingUp, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function ActionsHubPage() {
  const { user } = useAuthStore();
  const [actions, setActions] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [actionsRes, procRes, usersRes] = await Promise.all([
        apiClient.get('/actions'), apiClient.get('/processus'), apiClient.get('/users')
      ]);
      setActions(actionsRes.data || []);
      setProcesses(procRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) { toast.error("ERREUR DE LIAISON NOYAU"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredActions = useMemo(() => {
    return actions.filter(a => (a.ACT_Title || "").toLowerCase().includes(search.toLowerCase()));
  }, [actions, search]);

  if (loading) return <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase tracking-[0.5em]">Initialisation...</div>;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col uppercase font-black overflow-hidden relative">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none !important; }
        body { overflow: hidden !important; -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <header className="p-10 border-b border-white/5 flex justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-md z-40 shrink-0">
        <div>
          <h1 className="text-4xl tracking-tighter leading-none italic">NOYAU <span className="text-blue-600">ACTIONS</span></h1>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] mt-3 italic flex items-center gap-2">
            <Target size={14} className="text-blue-500" /> PLAN D&apos;ACTIONS QUALITÉ • §10.2
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-10 py-5 rounded-2xl text-[10px] flex items-center gap-3 transition-all active:scale-95 shadow-2xl shadow-blue-900/40 font-black">
          <Plus size={20} strokeWidth={3} /> NOUVELLE ACTION
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
        <div className="bg-slate-900/20 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <div className="relative w-96 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  placeholder="FILTRER LE REGISTRE..." 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-16 text-[11px] outline-none focus:border-blue-600 transition-all font-black uppercase italic"
                  value={search} onChange={(e) => setSearch(e.target.value)}
                />
            </div>
          </div>
          
          <table className="w-full text-left">
            <thead className="text-[11px] text-slate-600 tracking-widest border-b border-white/5 italic">
              <tr>
                <th className="p-10">ORIGINE</th>
                <th className="p-10">DÉSIGNATION</th>
                <th className="p-10 text-center">PILOTE</th>
                <th className="p-10">ÉCHÉANCE</th>
                <th className="p-10 text-right">DOSSIER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredActions.map((action) => (
                <tr key={action.ACT_Id} className="hover:bg-blue-600/5 transition-all group">
                  <td className="p-10"><span className="px-4 py-1.5 rounded-full text-[9px] border border-blue-500/20 text-blue-500">{action.ACT_Origin}</span></td>
                  <td className="p-10 max-w-lg">
                    <p className="text-base tracking-tighter leading-none italic">{action.ACT_Title}</p>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium normal-case line-clamp-1 italic">{action.ACT_Description || "SANS DESCRIPTION"}</p>
                  </td>
                  <td className="p-10">
                    <div className="flex justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-[12px] text-blue-500 border border-blue-600/20 font-black italic">
                         {action.ACT_Responsable?.U_FirstName?.[0]}{action.ACT_Responsable?.U_LastName?.[0]}
                      </div>
                    </div>
                  </td>
                  <td className="p-10 text-[11px] text-slate-400 font-black italic">{new Date(action.ACT_Deadline).toLocaleDateString()}</td>
                  <td className="p-10 text-right">
                    <button className="p-4 bg-white/5 hover:bg-blue-600 rounded-2xl transition-all"><ChevronRight size={20} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[1000] flex items-center justify-center p-8">
          <div className="bg-[#0F172A] w-full max-w-2xl rounded-[4rem] border border-white/10 shadow-4xl flex flex-col max-h-[90vh]">
            <div className="p-12 border-b border-white/5 flex justify-between items-center bg-white/2 shrink-0">
              <h2 className="text-4xl tracking-tighter italic font-black uppercase">NOUVELLE <span className="text-blue-600">ACTION</span></h2>
              <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all rounded-full"><X size={28} /></button>
            </div>
            <form onSubmit={async (e: any) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries());
              setLoading(true);
              const tid = toast.loading("DÉPLOIEMENT...");
              try {
                await apiClient.post('/actions', data);
                toast.success("ACTION INDEXÉE", { id: tid });
                setIsModalOpen(false);
                fetchData();
              } catch (err) { toast.error("ERREUR DE LIAISON", { id: tid }); }
              finally { setLoading(false); }
            }} className="p-12 space-y-8 overflow-y-auto font-black uppercase italic">
              <div className="space-y-3">
                <label className="text-[11px] text-slate-500 ml-6 tracking-[0.2em]">DÉSIGNATION TECHNIQUE *</label>
                <input required name="ACT_Title" className="w-full bg-white/5 border border-white/10 p-7 rounded-[2rem] text-sm text-white outline-none focus:border-blue-600 italic uppercase" placeholder="INTITULÉ..." />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] text-slate-500 ml-6 tracking-[0.2em]">PILOTE *</label>
                  <select required name="ACT_ResponsableId" className="w-full bg-white/5 border border-white/10 p-7 rounded-[2rem] text-[11px] text-white outline-none italic">
                    <option value="">SÉLECTIONNER</option>
                    {users.map(u => <option key={u.U_Id} value={u.U_Id} className="bg-[#0F172A]">{u.U_FirstName} {u.U_LastName}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] text-slate-500 ml-6 tracking-[0.2em]">ÉCHÉANCE *</label>
                  <input required name="ACT_Deadline" type="date" className="w-full bg-white/5 border border-white/10 p-7 rounded-[2rem] text-sm text-white outline-none font-black" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] text-slate-500 ml-6 tracking-[0.2em]">ORIGINE</label>
                  <select name="ACT_Origin" className="w-full bg-white/5 border border-white/10 p-7 rounded-[2rem] text-[11px] text-white outline-none italic">
                    <option value="AUTRE">AUTRE / INTERNE</option>
                    <option value="AUDIT">AUDIT</option>
                    <option value="NON_CONFORMITE">NON-CONFORMITÉ</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] text-slate-500 ml-6 tracking-[0.2em]">PROCESSUS *</label>
                  <select required name="PAQ_ProcessusId" className="w-full bg-white/5 border border-white/10 p-7 rounded-[2rem] text-[11px] text-white outline-none italic">
                    <option value="">LIER AU PAQ...</option>
                    {processes.map(p => <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0F172A]">{p.PR_Code} - {p.PR_Libelle}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 py-10 rounded-[3rem] font-black text-xs tracking-[0.6em] hover:bg-blue-500 transition-all shadow-3xl flex items-center justify-center gap-4">
                <CheckCircle2 size={24} /> VALIDER & DIFFUSER
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}