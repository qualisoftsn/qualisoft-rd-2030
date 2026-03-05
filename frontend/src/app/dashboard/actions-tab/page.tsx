/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * ⚛️ MODULE : HUB STRATÉGIQUE DES ACTIONS (HUB-CAPA) (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Super-registre et injection directe d'actions dans le Noyau via Modale.
 * FIX : UI ClickUp (100dvh, Scroll Localisé), Modale PWA Ready (retrait ml-72).
 * SÉCURITÉ : Zéro NextAuth, Sécurisation du parsing des Arrays.
 * RÉVISION : 05 Mars 2026 | 00:07 GMT
 * -------------------------------------------------------------------------
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
    const tid = toast.loading("DÉPLOIEMENT TACTIQUE EN COURS...");
    
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
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <Loader2 size={48} className="text-blue-600 animate-spin" strokeWidth={3} />
      <span className="text-blue-500 font-black italic uppercase tracking-[0.5em] md:tracking-[1em] text-[10px] md:text-xs animate-pulse">
        Initialisation Noyau CAPA...
      </span>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col bg-[#0B0F1A] text-white italic font-sans font-black overflow-hidden relative selection:bg-blue-600/30">
      <Toaster richColors position="top-right" theme="dark" />
      
      {/* 🔝 EN-TÊTE FIXE (Zéro Scroll) */}
      <header className="p-6 md:p-8 lg:p-12 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-30 shrink-0 gap-6 md:gap-8">
        <div className="flex items-center gap-4 md:gap-6 lg:gap-8 w-full md:w-auto">
          <div className="p-4 md:p-5 lg:p-6 bg-blue-600 rounded-2xl md:rounded-3xl shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all hover:rotate-12 shrink-0">
            <Zap size={28} className="fill-current md:w-8 md:h-8 lg:w-10 lg:h-10" />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl tracking-tighter leading-none italic uppercase m-0 truncate">
              NOYAU <span className="text-blue-600">ACTIONS</span>
            </h1>
            <p className="text-slate-500 text-[8px] md:text-[9px] lg:text-[10px] tracking-[0.3em] md:tracking-[0.4em] mt-2 lg:mt-3 italic flex items-center gap-2 md:gap-3 uppercase m-0 flex-wrap">
              <Activity size={14} className="text-blue-600 animate-pulse shrink-0" /> 
              <span>PLAN D&apos;ACTIONS QUALITÉ • §10.2 SDE</span>
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-600 hover:bg-white hover:text-blue-600 px-6 md:px-8 lg:px-10 py-4 md:py-5 lg:py-6 rounded-2xl md:rounded-3xl text-[10px] md:text-[11px] flex items-center gap-3 md:gap-4 transition-all shadow-xl shadow-blue-900/20 active:scale-95 font-black uppercase border-none cursor-pointer w-full md:w-auto justify-center shrink-0"
        >
          <Plus size={20} strokeWidth={4} className="md:w-6 md:h-6" /> DÉPLOYER CAPA
        </button>
      </header>

      {/* 📜 ZONE DE DÉFILEMENT (Registre) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 w-full">
          
          <div className="bg-[#0F172A]/80 border border-white/5 rounded-4xl md:rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-700">
            
            {/* BARRE DE RECHERCHE */}
            <div className="p-6 md:p-8 lg:p-10 border-b border-white/5 bg-white/5">
              <div className="relative w-full md:w-2/3 lg:w-1/2 group">
                  <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    placeholder="FILTRER LE REGISTRE SDE RD 2030..." 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl md:rounded-full py-4 md:py-5 pl-12 md:pl-14 pr-6 text-[9px] md:text-[10px] lg:text-[11px] outline-none focus:border-blue-500 transition-all font-black uppercase italic shadow-inner text-white placeholder:text-slate-600"
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                  />
              </div>
            </div>
            
            {/* TABLEAU DES ACTIONS */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-200">
                <thead className="text-[9px] md:text-[10px] text-slate-500 tracking-[0.3em] md:tracking-[0.4em] border-b border-white/5 italic bg-black/20">
                  <tr>
                    <th className="p-6 md:p-8 w-32 md:w-40">SOURCE</th>
                    <th className="p-6 md:p-8">DÉSIGNATION TACTIQUE</th>
                    <th className="p-6 md:p-8 text-center w-24 md:w-32">PILOTE</th>
                    <th className="p-6 md:p-8 w-32 md:w-48">ÉCHÉANCE</th>
                    <th className="p-6 md:p-8 text-right w-24 md:w-32">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredActions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-16 md:p-20 text-center text-slate-600 tracking-[0.3em] md:tracking-[0.4em] uppercase text-[10px] md:text-xs">
                        Aucune action trouvée dans le périmètre.
                      </td>
                    </tr>
                  ) : (
                    filteredActions.map((action) => (
                      <tr key={action.ACT_Id} className="hover:bg-blue-600/5 transition-all group">
                        <td className="p-6 md:p-8">
                          <span className="px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[8px] md:text-[9px] border border-blue-500/20 text-blue-400 font-black italic tracking-widest bg-blue-500/10 inline-block whitespace-nowrap shadow-inner">
                            {action.ACT_Origin}
                          </span>
                        </td>
                        <td className="p-6 md:p-8">
                          <p className="text-base md:text-xl tracking-tighter leading-none italic uppercase text-white group-hover:text-blue-400 transition-colors m-0">
                            {action.ACT_Title}
                          </p>
                          <p className="text-[8px] md:text-[9px] text-slate-500 mt-2 md:mt-3 font-bold normal-case line-clamp-1 italic tracking-widest opacity-60 group-hover:opacity-100 transition-opacity m-0">
                            {action.ACT_Description || "SÉCURISATION DU PROCESSUS SANS MÉTA-DESCRIPTION."}
                          </p>
                        </td>
                        <td className="p-6 md:p-8">
                          <div className="flex justify-center">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-900 flex items-center justify-center text-blue-500 border border-white/5 font-black italic shadow-inner group-hover:border-blue-500/30 group-hover:scale-110 transition-all">
                                <UserIcon size={20} className="md:w-6 md:h-6" />
                            </div>
                          </div>
                        </td>
                        <td className="p-6 md:p-8 text-[9px] md:text-[10px] text-slate-400 font-black italic tracking-widest whitespace-nowrap">
                          {action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-6 md:p-8 text-right">
                          <button className="p-3 md:p-4 bg-white/5 hover:bg-blue-600 rounded-xl md:rounded-2xl transition-all border-none cursor-pointer group-hover:scale-110 shadow-lg text-slate-400 hover:text-white active:scale-95">
                            <ChevronRight size={20} className="md:w-6 md:h-6" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* 🧾 MODAL D'INDEXATION HUB (FULL MATRIX) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-100 flex items-center justify-center p-4 md:p-8 lg:p-12 animate-in fade-in duration-300">
          <div className="bg-[#0F172A] w-full max-w-4xl rounded-4xl md:rounded-[3rem] border border-blue-500/20 shadow-[0_0_50px_rgba(37,99,235,0.1)] flex flex-col max-h-[95vh] md:max-h-[90vh] relative animate-in zoom-in-95 duration-500 overflow-hidden">
            
            {/* Rayon d'énergie de la modale */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Header de la Modal */}
            <div className="p-6 md:p-8 lg:p-10 border-b border-white/10 flex justify-between items-center bg-[#0B0F1A]/50 shrink-0 relative z-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl tracking-tighter italic font-black uppercase leading-none m-0 text-white flex items-center gap-3">
                <Target className="text-blue-500" size={32} />
                NOUVELLE <span className="text-blue-500">CAPA</span>
              </h2>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="p-3 md:p-4 hover:bg-rose-600 transition-all rounded-xl md:rounded-2xl text-slate-400 hover:text-white border border-transparent hover:border-rose-500/50 cursor-pointer bg-white/5"
                aria-label="Fermer la fenêtre"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Corps du Formulaire */}
            <form onSubmit={handleModalSubmit} className="p-6 md:p-8 lg:p-10 space-y-8 overflow-y-auto custom-scrollbar font-black uppercase italic text-left relative z-10 flex-1">
              
              <div className="space-y-3 md:space-y-4">
                <label className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-[0.3em] md:tracking-[0.4em]">DÉSIGNATION TECHNIQUE *</label>
                <input 
                  required name="ACT_Title" 
                  className="w-full bg-black/40 border border-white/10 p-5 md:p-6 lg:p-8 rounded-2xl md:rounded-4xl text-sm md:text-base lg:text-lg text-white outline-none focus:border-blue-500 italic uppercase shadow-inner placeholder:text-slate-600 transition-colors" 
                  placeholder="INTITULÉ DE LA MESURE CORRECTIVE OU PRÉVENTIVE..." 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-3 md:space-y-4">
                  <label className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-[0.3em] md:tracking-[0.4em]">PILOTE D&apos;EXÉCUTION *</label>
                  <select 
                    required name="ACT_ResponsableId" 
                    className="w-full bg-black/40 border border-white/10 p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] lg:text-xs text-white outline-none focus:border-blue-500 italic uppercase appearance-none cursor-pointer shadow-inner transition-colors"
                  >
                    <option value="" disabled selected className="text-slate-600">SÉLECTIONNER LE RESPONSABLE</option>
                    {users.filter(u => u.U_IsActive).map(u => (
                      <option key={u.U_Id} value={u.U_Id} className="bg-[#0F172A] text-white">
                        {u.U_FirstName} {u.U_LastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <label className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-[0.3em] md:tracking-[0.4em]">ÉCHÉANCE *</label>
                  <input 
                    required name="ACT_Deadline" type="date" min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-black/40 border border-white/10 p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] lg:text-xs text-blue-400 outline-none font-black shadow-inner uppercase cursor-pointer focus:border-blue-500 transition-colors" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-3 md:space-y-4">
                  <label className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-[0.3em] md:tracking-[0.4em]">ORIGINE SDE</label>
                  <select 
                    name="ACT_Origin" 
                    className="w-full bg-black/40 border border-white/10 p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] lg:text-xs text-white outline-none focus:border-blue-500 italic uppercase appearance-none cursor-pointer shadow-inner transition-colors"
                  >
                    {Object.values(ActionOrigin).map(o => (
                      <option key={o} value={o} className="bg-[#0F172A]">{o.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <label className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-[0.3em] md:tracking-[0.4em]">PROCESSUS LIÉ (OPTIONNEL)</label>
                  <select 
                    name="ACT_PAQId" 
                    className="w-full bg-black/40 border border-white/10 p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] lg:text-xs text-white outline-none focus:border-blue-500 italic uppercase appearance-none cursor-pointer shadow-inner transition-colors"
                  >
                    <option value="" className="text-slate-600">AUCUN RÉFÉRENTIEL SPÉCIFIQUE...</option>
                    {processes.map(p => (
                      <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0F172A] text-white">
                        {p.PR_Libelle}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="pt-6 md:pt-8 sticky bottom-0 bg-[#0F172A]/90 backdrop-blur-md pb-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 py-5 md:py-6 lg:py-8 rounded-4xl md:rounded-[3rem] font-black text-[10px] md:text-xs tracking-[0.4em] md:tracking-[0.6em] hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-4 border-none cursor-pointer group active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={24} className="animate-spin md:w-7 md:h-7" />
                  ) : (
                    <ShieldCheck size={24} className="group-hover:animate-pulse md:w-7 md:h-7" />
                  )}
                  {isSubmitting ? 'DÉPLOIEMENT...' : 'VALIDER & DÉPLOYER'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🧪 INJECTION CSS SCROLLBAR SOUVERAINE */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}} />
    </div>
  );
}