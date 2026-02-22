/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🚀 MODULE : REGISTRE GLOBAL DES ACTIONS (CAPA)
 * -------------------------------------------------------------------------
 * RÔLE : Centralisation du Plan d'Amélioration Continue (§10.2).
 * ARCHITECTURE : Isolation Multi-Tenant SDE Matrix.
 * RÉFÉRENTIEL : types/elite-sde (ActionStatus, ActionPriority).
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  CheckSquare, Filter, Search, Plus, 
  ChevronRight, Clock, CheckCircle2,
  Calendar, User, AlertCircle, Zap,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';

// Importation du référentiel Elite
import { Action, ActionStatus, Priority, ActionOrigin } from '@/types/elite-sde';

const STATUS_CONFIG: Record<ActionStatus, { color: string, bg: string, icon: React.ReactNode }> = {
  [ActionStatus.A_FAIRE]: { color: "text-blue-400", bg: "bg-blue-500/10", icon: <Clock size={20} /> },
  [ActionStatus.EN_COURS]: { color: "text-amber-400", bg: "bg-amber-500/10", icon: <Zap size={20} /> },
  [ActionStatus.A_VALIDER]: { color: "text-purple-400", bg: "bg-purple-500/10", icon: <AlertCircle size={20} /> },
  [ActionStatus.TERMINEE]: { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: <CheckCircle2 size={20} /> },
  [ActionStatus.NON_EFFICACE]: { color: "text-red-400", bg: "bg-red-500/10", icon: <AlertCircle size={20} /> },
  [ActionStatus.ANNULEE]: { color: "text-slate-400", bg: "bg-slate-500/10", icon: <X size={20} /> },
  [ActionStatus.EN_RETARD]: { color: "text-red-600", bg: "bg-red-600/10", icon: <Clock size={20} className="animate-pulse" /> },
};

export default function ActionsPage() {
  const router = useRouter();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchActions = async () => {
      try {
        const res = await apiClient.get('/actions');
        setActions(res.data?.data || res.data);
      } catch (err) {
        toast.error("ÉCHEC DE SYNCHRONISATION DU PLAN D'ACTIONS");
      } finally {
        setLoading(false);
      }
    };
    fetchActions();
  }, []);

  const filteredActions = useMemo(() => 
    actions.filter(a => a.ACT_Title.toLowerCase().includes(searchTerm.toLowerCase())),
    [actions, searchTerm]
  );

  return (
    <div className="p-12 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans overflow-hidden">
      <Toaster richColors />
      <header className="flex justify-between items-end mb-16 max-w-500 mx-auto w-full">
        <div className="space-y-4">
          <h1 className="text-6xl font-black uppercase tracking-tighter leading-none italic">
            Registre <span className="text-blue-600">CAPA</span>
          </h1>
          <p className="text-slate-500 font-black uppercase text-[11px] tracking-[0.6em] italic flex items-center gap-3">
            <span className="w-3 h-3 bg-blue-600 rounded-full animate-pulse shadow-[0_0_15px_blue]" />
            Amélioration Continue • ISO 9001:2015 §10.2
          </p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/actions/new')}
          className="bg-blue-600 hover:bg-white hover:text-blue-600 px-12 py-6 rounded-4xl font-black uppercase text-xs flex items-center gap-4 transition-all shadow-4xl border-none cursor-pointer"
        >
          <Plus size={24} strokeWidth={3} /> Déployer une Action
        </button>
      </header>

      <div className="max-w-500 mx-auto w-full space-y-10">
        <div className="flex gap-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={22} />
            <input 
              type="text"
              placeholder="RECHERCHER DANS LE PLAN D'ACTIONS SDE..."
              className="w-full bg-slate-900/40 border-2 border-white/5 rounded-4xl py-6 pl-16 pr-8 text-sm font-black uppercase italic outline-none focus:border-blue-600/50 transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-slate-900/40 border-2 border-white/5 p-6 rounded-3xl text-slate-500 hover:text-white transition-all cursor-pointer">
            <Filter size={24} />
          </button>
        </div>

        <div className="grid gap-6">
          {loading ? (
             <div className="animate-pulse space-y-6">
               {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-[3rem]" />)}
             </div>
          ) : filteredActions.length === 0 ? (
            <div className="py-40 text-center bg-slate-900/10 rounded-[4rem] border-4 border-dashed border-white/5 opacity-20 italic">
               <CheckSquare size={80} className="mx-auto mb-6" />
               <p className="text-2xl font-black uppercase tracking-[0.5em]">Aucune Action Répertoriée</p>
            </div>
          ) : (
            filteredActions.map((action) => {
              const cfg = STATUS_CONFIG[action.ACT_Status as ActionStatus] || STATUS_CONFIG[ActionStatus.A_FAIRE];
              return (
                <div 
                  key={action.ACT_Id}
                  onClick={() => router.push(`/dashboard/actions/${action.ACT_Id}`)}
                  className="group bg-slate-900/30 border-2 border-white/5 p-8 rounded-[3.5rem] flex items-center justify-between hover:bg-slate-900/60 hover:border-blue-600/30 transition-all cursor-pointer shadow-2xl relative overflow-hidden"
                >
                  <div className="flex items-center gap-10 flex-1">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 transition-transform group-hover:scale-110 ${cfg.bg} ${cfg.color} border-current/10 shadow-inner`}>
                      {cfg.icon}
                    </div>

                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] font-black text-blue-500 uppercase tracking-tighter italic">
                          REF: {action.ACT_Id.substring(0,8).toUpperCase()}
                        </span>
                        <span className="text-[9px] font-black px-4 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5 uppercase italic">
                          {action.ACT_Origin}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black uppercase text-slate-100 group-hover:text-blue-500 transition-colors leading-none tracking-tighter truncate max-w-2xl">
                        {action.ACT_Title}
                      </h3>
                      <div className="flex items-center gap-8 text-slate-500 font-bold uppercase italic text-[10px] tracking-widest">
                        <div className="flex items-center gap-2"><User size={14} className="text-blue-500" /> PILOTE: SYSTEM</div>
                        <div className="flex items-center gap-2"><Calendar size={14} className="text-blue-500" /> ÉCHÉANCE: {action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString() : 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase border-2 italic tracking-widest ${
                      action.ACT_Priority === Priority.CRITICAL || action.ACT_Priority === Priority.HIGH 
                      ? 'bg-red-600 text-white border-transparent shadow-[0_10px_30px_rgba(220,38,38,0.3)]' 
                      : 'bg-slate-800 border-white/10 text-slate-400'
                    }`}>
                      {action.ACT_Priority}
                    </div>
                    <ChevronRight size={28} className="text-slate-800 group-hover:text-white group-hover:translate-x-2 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}