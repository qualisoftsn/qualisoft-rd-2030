/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * ⚛️ MODULE : HUB STRATÉGIQUE DES ACTIONS (HUB-CAPA)
 * -------------------------------------------------------------------------
 * RÔLE : Super-registre et injection directe d'actions dans le Noyau.
 * RÉFÉRENTIEL : types/elite-sde (Action, User, Processus).
 * DESIGN : Cockpit Matrix Full-Space (max-w-500).
 * -------------------------------------------------------------------------
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { Target, Plus, Search, X, CheckCircle2, ChevronRight, Zap, Activity, ShieldCheck, User as UserIcon } from 'lucide-react';
import { toast, Toaster } from 'sonner';

// Référentiel Elite
import { Action, User, Processus, ActionOrigin, Priority, ActionType, ActionStatus } from '@/types/elite-sde';

export default function ActionsHubPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [processes, setProcesses] = useState<Processus[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [actionsRes, procRes, usersRes] = await Promise.all([
        apiClient.get('/actions'), 
        apiClient.get('/processus'), 
        apiClient.get('/users')
      ]);
      setActions(actionsRes.data?.data || actionsRes.data);
      setProcesses(procRes.data?.data || procRes.data);
      setUsers(usersRes.data?.data || usersRes.data);
    } catch (err) { toast.error("RUPTURE DE LIAISON NOYAU"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredActions = useMemo(() => 
    actions.filter(a => a.ACT_Title.toLowerCase().includes(search.toLowerCase())),
    [actions, search]
  );

  const handleModalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    setLoading(true);
    const tid = toast.loading("DÉPLOIEMENT TACTIQUE...");
    try {
      await apiClient.post('/actions', {
        ...data,
        ACT_Status: ActionStatus.A_FAIRE,
        ACT_Type: ActionType.CORRECTIVE
      });
      toast.success("ACTION INDEXÉE DANS LE SMI", { id: tid });
      setIsModalOpen(false);
      fetchData();
    } catch (err) { toast.error("ERREUR DE LIAISON KERNEL", { id: tid }); }
    finally { setLoading(false); }
  };

  if (loading && actions.length === 0) return (
    <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] gap-8">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-blue-500 font-black italic uppercase tracking-[1em] text-[10px] animate-pulse">Initialisation Noyau CAPA...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col font-black overflow-hidden relative">
      <Toaster richColors position="top-right" />
      <style jsx global>{`
        ::-webkit-scrollbar { display: none !important; }
        body { overflow: hidden !important; scrollbar-width: none; }
      `}</style>
      
      <header className="p-16 border-b-2 border-white/5 flex justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 shrink-0">
        <div className="flex items-center gap-10">
          <div className="p-6 bg-blue-600 rounded-4xl shadow-4xl group transition-all hover:rotate-12">
            <Zap size={48} className="fill-current" />
          </div>
          <div>
            <h1 className="text-6xl tracking-tighter leading-none italic uppercase">NOYAU <span className="text-blue-600">ACTIONS</span></h1>
            <p className="text-slate-500 text-[11px] tracking-[0.5em] mt-4 italic flex items-center gap-4 uppercase">
              <Activity size={18} className="text-blue-600 animate-pulse" /> PLAN D&apos;ACTIONS QUALITÉ • §10.2 SDE
            </p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-white hover:text-blue-600 px-14 py-7 rounded-4xl text-[11px] flex items-center gap-5 transition-all shadow-4xl active:scale-95 font-black uppercase border-none cursor-pointer">
          <Plus size={28} strokeWidth={4} /> DÉPLOYER CAPA
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-16 space-y-12 scrollbar-hide max-w-500 mx-auto w-full">
        <div className="bg-slate-900/30 border-2 border-white/5 rounded-[5rem] overflow-hidden shadow-4xl backdrop-blur-md">
          <div className="p-12 border-b-2 border-white/5 flex justify-between items-center bg-white/2">
            <div className="relative w-125 group">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={24} />
                <input 
                  placeholder="FILTRER LE REGISTRE SDE RD 2030..." 
                  className="w-full bg-black/40 border-2 border-white/10 rounded-4xl py-6 pl-20 pr-8 text-[12px] outline-none focus:border-blue-600 transition-all font-black uppercase italic shadow-inner"
                  value={search} onChange={(e) => setSearch(e.target.value)}
                />
            </div>
          </div>
          
          <table className="w-full text-left">
            <thead className="text-[12px] text-slate-500 tracking-[0.4em] border-b-2 border-white/5 italic">
              <tr>
                <th className="p-12">SOURCE</th>
                <th className="p-12 w-2/5">DÉSIGNATION TACTIQUE</th>
                <th className="p-12 text-center">PILOTE</th>
                <th className="p-12">ÉCHÉANCE</th>
                <th className="p-12 text-right">SDE REF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredActions.map((action) => (
                <tr key={action.ACT_Id} className="hover:bg-blue-600/5 transition-all group cursor-default">
                  <td className="p-12">
                    <span className="px-6 py-2 rounded-full text-[10px] border-2 border-blue-600/20 text-blue-500 font-black italic tracking-widest bg-blue-600/5">
                      {action.ACT_Origin}
                    </span>
                  </td>
                  <td className="p-12">
                    <p className="text-2xl tracking-tighter leading-none italic uppercase group-hover:text-blue-500 transition-colors">{action.ACT_Title}</p>
                    <p className="text-[11px] text-slate-600 mt-4 font-bold normal-case line-clamp-1 italic tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                      {action.ACT_Description || "SÉCURISATION DU PROCESSUS SANS MÉTA-DESCRIPTION."}
                    </p>
                  </td>
                  <td className="p-12">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-[14px] text-blue-500 border-2 border-white/5 font-black italic shadow-inner group-hover:border-blue-500/30 group-hover:scale-110 transition-all">
                          <UserIcon size={28} />
                      </div>
                    </div>
                  </td>
                  <td className="p-12 text-[12px] text-slate-400 font-black italic tracking-widest">
                    {action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-12 text-right">
                    <button className="p-6 bg-white/5 hover:bg-blue-600 rounded-3xl transition-all border-none cursor-pointer group-hover:scale-110 shadow-lg">
                      <ChevronRight size={28} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* 🧾 MODAL D'INDEXATION HUB (FULL MATRIX) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-1000 flex items-center justify-center p-16 animate-in fade-in duration-500">
          <div className="bg-[#0F172A] w-full max-w-2xl rounded-[6rem] border-4 border-white/5 shadow-4xl flex flex-col max-h-[90vh] relative animate-in zoom-in-95 duration-700">
            <div className="p-16 border-b-2 border-white/5 flex justify-between items-center bg-white/2 shrink-0">
              <h2 className="text-5xl tracking-tighter italic font-black uppercase leading-none">NOUVELLE <span className="text-blue-600">CAPA</span></h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-6 hover:bg-red-600 transition-all rounded-3xl text-slate-500 hover:text-white border-none cursor-pointer"><X size={40} /></button>
            </div>
            <form onSubmit={handleModalSubmit} className="p-16 space-y-10 overflow-y-auto font-black uppercase italic custom-scrollbar text-left">
              <div className="space-y-4">
                <label className="text-[12px] text-slate-500 ml-8 tracking-[0.5em]">DÉSIGNATION TECHNIQUE *</label>
                <input required name="ACT_Title" className="w-full bg-black/40 border-2 border-white/10 p-10 rounded-[2.5rem] text-xl text-white outline-none focus:border-blue-600 italic uppercase shadow-inner" placeholder="INTITULÉ DE LA MESURE..." />
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[12px] text-slate-500 ml-8 tracking-[0.5em]">PILOTE *</label>
                  <select required name="ACT_ResponsableId" className="w-full bg-black/40 border-2 border-white/10 p-8 rounded-2xl text-[12px] text-white outline-none italic uppercase appearance-none cursor-pointer shadow-inner">
                    <option value="">SÉLECTIONNER</option>
                    {users.map(u => <option key={u.U_Id} value={u.U_Id} className="bg-[#0F172A]">{u.U_FirstName} {u.U_LastName}</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[12px] text-slate-500 ml-8 tracking-[0.5em]">ÉCHÉANCE *</label>
                  <input required name="ACT_Deadline" type="date" className="w-full bg-black/40 border-2 border-white/10 p-8 rounded-2xl text-[12px] text-white outline-none font-black shadow-inner uppercase" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[12px] text-slate-500 ml-8 tracking-[0.5em]">ORIGINE SDE</label>
                  <select name="ACT_Origin" className="w-full bg-black/40 border-2 border-white/10 p-8 rounded-2xl text-[12px] text-white outline-none italic uppercase appearance-none cursor-pointer shadow-inner">
                    {Object.values(ActionOrigin).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[12px] text-slate-500 ml-8 tracking-[0.5em]">PAQ CIBLE *</label>
                  <select required name="ACT_PAQId" className="w-full bg-black/40 border-2 border-white/10 p-8 rounded-2xl text-[12px] text-white outline-none italic uppercase appearance-none cursor-pointer shadow-inner">
                    <option value="">LIER AU PAQ...</option>
                    {processes.map(p => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 py-12 rounded-[3.5rem] font-black text-xs tracking-[0.8em] hover:bg-white hover:text-blue-600 transition-all shadow-4xl flex items-center justify-center gap-6 border-none cursor-pointer group active:scale-95">
                <ShieldCheck size={32} className="group-hover:animate-pulse" /> VALIDER & DÉPLOYER
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}