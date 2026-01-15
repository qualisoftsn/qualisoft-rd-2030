/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  CheckSquare, Filter, Search, Plus, 
  ChevronRight, Clock, CheckCircle2, AlertCircle,
  Tag, Calendar, User
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ActionsPage() {
  const router = useRouter();
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchActions = async () => {
      try {
        const res = await apiClient.get('/actions');
        setActions(res.data);
      } catch (err) {
        console.error("Erreur chargement actions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActions();
  }, []);

  // Filtrage dynamique
  const filteredActions = actions.filter(action => 
    action.ACT_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.ACT_Description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#0B0F1A] min-h-screen text-white italic font-sans">
      
      {/* HEADER ACTIONS */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
            Actions <span className="text-blue-600 font-black">Correctives</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-4">
            Traitement et suivi du Plan d&apos;Amélioration Continue
          </p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/actions/new')}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-lg shadow-blue-900/40"
        >
          <Plus size={18} /> Nouvelle Action
        </button>
      </header>

      {/* BARRE DE RECHERCHE ET FILTRES */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Rechercher une action (Réf, titre, description)..."
            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-blue-600 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-slate-900/50 border border-white/5 px-6 rounded-2xl text-slate-400 hover:text-white transition-all">
          <Filter size={18} />
        </button>
      </div>

      {/* LISTE DES ACTIONS */}
      <div className="space-y-4">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 bg-white/5 rounded-4xl" />)}
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/20 rounded-[3rem] border border-dashed border-white/10">
            <CheckSquare size={48} className="mx-auto text-slate-700 mb-4 opacity-20" />
            <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Aucune action trouvée</p>
          </div>
        ) : (
          filteredActions.map((action: any) => (
            <div 
              key={action.ACT_Id}
              onClick={() => router.push(`/dashboard/actions/${action.ACT_Id}`)}
              className="group bg-slate-900/40 border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between hover:bg-slate-900/60 hover:border-blue-500/30 transition-all cursor-pointer shadow-xl"
            >
              <div className="flex items-center gap-6 flex-1">
                {/* STATUS ICON */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                  action.ACT_Status === 'CLOTUREE' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                  : 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                }`}>
                  {action.ACT_Status === 'CLOTUREE' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">
                      {action.ACT_Code || `ACT-${action.ACT_Id.substring(0,4)}`}
                    </span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                      action.ACT_Origin === 'COPIL' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'bg-slate-800 text-slate-400'
                    }`}>
                      Origine: {action.ACT_Origin}
                    </span>
                  </div>
                  <h3 className="text-sm font-black uppercase text-slate-100 group-hover:text-blue-400 transition-colors truncate max-w-xl">
                    {action.ACT_Title}
                  </h3>
                  <div className="flex items-center gap-4 text-slate-500">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase">
                      <User size={12} /> {action.ACT_Responsable?.U_FirstName || 'Non assigné'}
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase">
                      <Calendar size={12} /> Échéance: {action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border ${
                  action.ACT_Priority === 'HIGH' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-slate-800 border-white/5 text-slate-400'
                }`}>
                  {action.ACT_Priority}
                </div>
                <ChevronRight size={20} className="text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}