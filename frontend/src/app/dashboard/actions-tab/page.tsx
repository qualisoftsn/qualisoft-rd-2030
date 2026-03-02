/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * ⚛️ MODULE : HUB STRATÉGIQUE DES ACTIONS (HUB-CAPA)
 * -------------------------------------------------------------------------
 * RÔLE : Super-registre et injection directe d'actions dans le Noyau.
 * RÉFÉRENTIEL : types/elite-sde (Action, User, Processus).
 * FIX : Remplacement du JSX Style, séparation des états de chargement (isSubmitting),
 * et restructuration du layout de la modale.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 12:50 GMT
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { Target, Plus, Search, X, ChevronRight, Zap, Activity, ShieldCheck, User as UserIcon, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

// Référentiel Elite
import { Action, User, Processus, ActionOrigin, ActionType, ActionStatus } from '@/types/elite-sde';

export default function ActionsHubPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [processes, setProcesses] = useState<Processus[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // 🛡️ Séparation des états de chargement
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [actionsRes, procRes, usersRes] = await Promise.all([
        apiClient.get('/actions').catch(() => ({ data: [] })), 
        apiClient.get('/processus').catch(() => ({ data: [] })), 
        apiClient.get('/users').catch(() => ({ data: [] }))
      ]);
      
      setActions(Array.isArray(actionsRes.data?.data) ? actionsRes.data.data : actionsRes.data || []);
      setProcesses(Array.isArray(procRes.data?.data) ? procRes.data.data : procRes.data || []);
      setUsers(Array.isArray(usersRes.data?.data) ? usersRes.data.data : usersRes.data || []);
    } catch (err) { 
      toast.error("RUPTURE DE LIAISON NOYAU"); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredActions = useMemo(() => 
    actions.filter(a => a.ACT_Title?.toLowerCase().includes(search.toLowerCase())),
    [actions, search]
  );

  const handleModalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    setIsSubmitting(true);
    const tid = toast.loading("DÉPLOIEMENT TACTIQUE...");
    try {
      await apiClient.post('/actions', {
        ...data,
        ACT_Status: ActionStatus.A_FAIRE,
        ACT_Type: ActionType.CORRECTIVE
      });
      toast.success("ACTION INDEXÉE DANS LE SMI", { id: tid });
      setIsModalOpen(false);
      fetchData(); // Rafraîchit la liste en arrière-plan
    } catch (err) { 
      toast.error("ERREUR DE LIAISON KERNEL", { id: tid }); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  // 🛡️ ÉCRAN DE CHARGEMENT INITIAL
  if (loading && actions.length === 0) return (
    <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] gap-8">
      <Loader2 size={48} className="text-blue-600 animate-spin" />
      <span className="text-blue-500 font-black italic uppercase tracking-[1em] text-[10px] animate-pulse">
        Initialisation Noyau CAPA...
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col font-black overflow-hidden relative selection:bg-blue-600/30">
      <Toaster richColors position="top-right" theme="dark" />
      
      {/* 🧪 INJECTION CSS SÉCURISÉE (Évite les crashs Turbopack liés au JSX Style global) */}
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { display: none !important; }
        body { overflow: hidden !important; scrollbar-width: none; }
      `}} />
      
      <header className="p-10 lg:p-16 border-b-2 border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 shrink-0 gap-8">
        <div className="flex items-center gap-6 lg:gap-10">
          <div className="p-5 lg:p-6 bg-blue-600 rounded-3xl lg:rounded-4xl shadow-2xl group transition-all hover:rotate-12 shrink-0">
            <Zap size={36} className="fill-current lg:w-12 lg:h-12" />
          </div>
          <div>
            <h1 className="text-4xl lg:text-6xl tracking-tighter leading-none italic uppercase m-0">
              NOYAU <span className="text-blue-600">ACTIONS</span>
            </h1>
            <p className="text-slate-500 text-[9px] lg:text-[11px] tracking-[0.5em] mt-3 lg:mt-4 italic flex items-center gap-3 uppercase m-0">
              <Activity size={16} className="text-blue-600 animate-pulse" /> PLAN D&apos;ACTIONS QUALITÉ • §10.2 SDE
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-600 hover:bg-white hover:text-blue-600 px-8 lg:px-14 py-5 lg:py-7 rounded-3xl lg:rounded-4xl text-[10px] lg:text-[11px] flex items-center gap-4 transition-all shadow-2xl active:scale-95 font-black uppercase border-none cursor-pointer w-full md:w-auto justify-center"
        >
          <Plus size={24} strokeWidth={4} /> DÉPLOYER CAPA
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-10 lg:p-16 space-y-12 scrollbar-hide max-w-350 mx-auto w-full">
        <div className="bg-slate-900/30 border-2 border-white/5 rounded-[3rem] lg:rounded-[5rem] overflow-hidden shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-700">
          
          {/* BARRE DE RECHERCHE */}
          <div className="p-8 lg:p-12 border-b-2 border-white/5 bg-white/5">
            <div className="relative w-full lg:w-1/2 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  placeholder="FILTRER LE REGISTRE SDE RD 2030..." 
                  className="w-full bg-black/40 border-2 border-white/10 rounded-full py-5 pl-16 pr-8 text-[10px] lg:text-[12px] outline-none focus:border-blue-600 transition-all font-black uppercase italic shadow-inner text-white placeholder:text-slate-600"
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-200">
              <thead className="text-[10px] lg:text-[12px] text-slate-500 tracking-[0.4em] border-b-2 border-white/5 italic">
                <tr>
                  <th className="p-8 lg:p-12 w-32">SOURCE</th>
                  <th className="p-8 lg:p-12 w-2/5">DÉSIGNATION TACTIQUE</th>
                  <th className="p-8 lg:p-12 text-center w-32">PILOTE</th>
                  <th className="p-8 lg:p-12 w-48">ÉCHÉANCE</th>
                  <th className="p-8 lg:p-12 text-right w-32">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredActions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-slate-500 tracking-[0.4em] uppercase text-xs">
                      Aucune action trouvée dans le périmètre.
                    </td>
                  </tr>
                ) : (
                  filteredActions.map((action) => (
                    <tr key={action.ACT_Id} className="hover:bg-blue-600/5 transition-all group cursor-default">
                      <td className="p-8 lg:p-12">
                        <span className="px-4 py-2 lg:px-6 lg:py-2 rounded-full text-[9px] lg:text-[10px] border-2 border-blue-600/20 text-blue-500 font-black italic tracking-widest bg-blue-600/5">
                          {action.ACT_Origin}
                        </span>
                      </td>
                      <td className="p-8 lg:p-12">
                        <p className="text-xl lg:text-2xl tracking-tighter leading-none italic uppercase group-hover:text-blue-500 transition-colors m-0">
                          {action.ACT_Title}
                        </p>
                        <p className="text-[9px] lg:text-[11px] text-slate-500 mt-3 font-bold normal-case line-clamp-1 italic tracking-widest opacity-60 group-hover:opacity-100 transition-opacity m-0">
                          {action.ACT_Description || "SÉCURISATION DU PROCESSUS SANS MÉTA-DESCRIPTION."}
                        </p>
                      </td>
                      <td className="p-8 lg:p-12">
                        <div className="flex justify-center">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl bg-slate-900 flex items-center justify-center text-blue-500 border-2 border-white/5 font-black italic shadow-inner group-hover:border-blue-500/30 group-hover:scale-110 transition-all">
                              <UserIcon size={24} />
                          </div>
                        </div>
                      </td>
                      <td className="p-8 lg:p-12 text-[10px] lg:text-[12px] text-slate-400 font-black italic tracking-widest">
                        {action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-8 lg:p-12 text-right">
                        <button className="p-4 lg:p-6 bg-white/5 hover:bg-blue-600 rounded-2xl lg:rounded-3xl transition-all border-none cursor-pointer group-hover:scale-110 shadow-lg text-white">
                          <ChevronRight size={24} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 🧾 MODAL D'INDEXATION HUB (FULL MATRIX) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-1000 flex items-center justify-center p-8 lg:p-16 animate-in fade-in duration-300">
          <div className="bg-[#0F172A] w-full max-w-200 rounded-[3rem] lg:rounded-[5rem] border-4 border-white/5 shadow-2xl flex flex-col max-h-[90vh] relative animate-in zoom-in-95 duration-500">
            
            {/* Header de la Modal */}
            <div className="p-10 lg:p-12 border-b-2 border-white/5 flex justify-between items-center bg-white/5 shrink-0 rounded-t-[3rem] lg:rounded-t-[5rem]">
              <h2 className="text-3xl lg:text-5xl tracking-tighter italic font-black uppercase leading-none m-0">
                NOUVELLE <span className="text-blue-600">CAPA</span>
              </h2>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="p-4 lg:p-5 hover:bg-red-600 transition-all rounded-2xl lg:rounded-3xl text-slate-500 hover:text-white border-none cursor-pointer bg-black/20"
              >
                <X size={28} />
              </button>
            </div>
            
            {/* Corps du Formulaire */}
            <form onSubmit={handleModalSubmit} className="p-10 lg:p-16 space-y-10 overflow-y-auto custom-scrollbar font-black uppercase italic text-left">
              <div className="space-y-4">
                <label className="text-[10px] lg:text-[12px] text-slate-500 ml-6 lg:ml-8 tracking-[0.5em]">DÉSIGNATION TECHNIQUE *</label>
                <input 
                  required 
                  name="ACT_Title" 
                  className="w-full bg-black/40 border-2 border-white/10 p-8 lg:p-10 rounded-4xl lg:rounded-[2.5rem] text-lg lg:text-xl text-white outline-none focus:border-blue-600 italic uppercase shadow-inner placeholder:text-slate-700" 
                  placeholder="INTITULÉ DE LA MESURE..." 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] lg:text-[12px] text-slate-500 ml-6 lg:ml-8 tracking-[0.5em]">PILOTE *</label>
                  <select 
                    required 
                    name="ACT_ResponsableId" 
                    className="w-full bg-black/40 border-2 border-white/10 p-6 lg:p-8 rounded-2xl lg:rounded-3xl text-[10px] lg:text-[12px] text-white outline-none italic uppercase appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="" className="bg-[#0F172A]">SÉLECTIONNER LE RESPONSABLE</option>
                    {users.map(u => (
                      <option key={u.U_Id} value={u.U_Id} className="bg-[#0F172A] p-2">
                        {u.U_FirstName} {u.U_LastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] lg:text-[12px] text-slate-500 ml-6 lg:ml-8 tracking-[0.5em]">ÉCHÉANCE *</label>
                  <input 
                    required 
                    name="ACT_Deadline" 
                    type="date" 
                    className="w-full bg-black/40 border-2 border-white/10 p-6 lg:p-8 rounded-2xl lg:rounded-3xl text-[10px] lg:text-[12px] text-blue-400 outline-none font-black shadow-inner uppercase color-scheme-dark cursor-pointer focus:border-blue-600" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] lg:text-[12px] text-slate-500 ml-6 lg:ml-8 tracking-[0.5em]">ORIGINE SDE</label>
                  <select 
                    name="ACT_Origin" 
                    className="w-full bg-black/40 border-2 border-white/10 p-6 lg:p-8 rounded-2xl lg:rounded-3xl text-[10px] lg:text-[12px] text-white outline-none italic uppercase appearance-none cursor-pointer shadow-inner"
                  >
                    {Object.values(ActionOrigin).map(o => (
                      <option key={o} value={o} className="bg-[#0F172A]">{o}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] lg:text-[12px] text-slate-500 ml-6 lg:ml-8 tracking-[0.5em]">PROCESSUS / PAQ CIBLE *</label>
                  <select 
                    required 
                    name="ACT_PAQId" 
                    className="w-full bg-black/40 border-2 border-white/10 p-6 lg:p-8 rounded-2xl lg:rounded-3xl text-[10px] lg:text-[12px] text-white outline-none italic uppercase appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="" className="bg-[#0F172A]">LIER AU RÉFÉRENTIEL...</option>
                    {processes.map(p => (
                      <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0F172A]">
                        {p.PR_Libelle}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 py-8 lg:py-10 rounded-[3rem] font-black text-[10px] lg:text-xs tracking-[0.8em] hover:bg-white hover:text-blue-600 transition-all shadow-2xl flex items-center justify-center gap-6 border-none cursor-pointer group active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={28} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={28} className="group-hover:animate-pulse" />
                  )}
                  {isSubmitting ? 'DÉPLOIEMENT...' : 'VALIDER & DÉPLOYER'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}