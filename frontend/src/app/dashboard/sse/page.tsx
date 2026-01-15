/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Plus, 
  Search, 
  ShieldAlert, 
  TrendingUp, 
  Printer, 
  MapPin, 
  Calendar, 
  ChevronRight,
  Filter,
  AlertCircle,
  Activity
} from 'lucide-react';

export default function SsePage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/sse');
      setEvents(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données SSE:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Filtrage Intelligent
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchSearch = event.SSE_Type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.SSE_Lieu.toLowerCase().includes(searchTerm.toLowerCase());
      const matchBadge = activeFilter === 'ALL' || event.SSE_Type === activeFilter;
      return matchSearch && matchBadge;
    });
  }, [events, searchTerm, activeFilter]);

  if (loading) {
    return (
      <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A]">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-[0.2em]">Synchronisation SMI...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans">
      
      {/* HEADER : TITRE & ACTIONS GLOBALES */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <ShieldAlert size={24} className="text-white" />
            </div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter">
              Registre <span className="text-orange-500 underline decoration-white/10 underline-offset-8">SSE</span>
            </h1>
          </div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] ml-1">
            Sécurité, Santé & Environnement • Management Intégré
          </p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/dashboard/sse/analytics')}
            className="group bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-2 hover:bg-blue-600 hover:border-blue-400 transition-all duration-300"
          >
            <TrendingUp size={16} className="group-hover:scale-110 transition-transform" /> 
            Analyses & KPI
          </button>
          
          <button 
            onClick={() => router.push('/dashboard/sse/new')}
            className="group bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-2 hover:bg-orange-500 shadow-[0_0_30px_rgba(234,88,12,0.3)] transition-all duration-300"
          >
            <Plus size={18} strokeWidth={3} /> Signaler un incident
          </button>
        </div>
      </header>

      {/* BARRE DE RECHERCHE & FILTRES RAPIDES */}
      <section className="space-y-6 mb-10">
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher par type, lieu ou site..."
              className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl text-slate-500 hover:text-white transition-all">
            <Filter size={20} />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {['ALL', 'ACCIDENT_TRAVAIL', 'ACCIDENT_TRAJET', 'PRESQU_ACCIDENT', 'SITUATION_DANGEREUSE'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase italic transition-all border ${
                activeFilter === filter 
                ? 'bg-orange-500 border-orange-400 text-white' 
                : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/30'
              }`}
            >
              {filter.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </section>

      {/* LISTE DES ÉVÉNEMENTS */}
      <section className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div 
              key={event.SSE_Id}
              className="group bg-slate-900/40 border border-white/5 hover:border-orange-500/30 p-6 rounded-4xl flex items-center justify-between transition-all duration-500 hover:translate-x-2"
            >
              <div className="flex items-center gap-6 flex-1">
                <div className={`p-4 rounded-2xl ${event.SSE_AvecArret ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                  <Activity size={24} />
                </div>

                <div className="max-w-md">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black uppercase bg-white/5 px-2 py-0.5 rounded text-slate-500 tracking-widest italic border border-white/5">
                      REF-{event.SSE_Id.slice(0, 5).toUpperCase()}
                    </span>
                    <h3 className="text-lg font-black uppercase italic tracking-tight group-hover:text-orange-500 transition-colors">
                      {event.SSE_Type.replace(/_/g, ' ')}
                    </h3>
                  </div>
                  <p className="text-slate-500 text-xs font-medium line-clamp-1 italic">
                    {event.SSE_Description}
                  </p>
                </div>

                <div className="flex gap-8 ml-auto px-10 border-x border-white/5">
                  <div className="flex flex-col items-center">
                    <MapPin size={14} className="text-orange-500 mb-1" />
                    <span className="text-[10px] font-black uppercase italic tracking-tighter">{event.SSE_Lieu}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Calendar size={14} className="text-blue-500 mb-1" />
                    <span className="text-[10px] font-black uppercase italic">
                      {new Date(event.SSE_DateEvent).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.push(`/dashboard/sse/report/${event.SSE_Id}`)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 transition-all font-black uppercase italic text-[9px] border border-transparent hover:border-white/10"
                >
                  <Printer size={16} /> Fiche PDF
                </button>
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-600/10 text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all cursor-pointer">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-slate-900/20 rounded-[40px] border border-dashed border-white/5">
            <ShieldAlert size={48} className="mx-auto text-slate-800 mb-4" />
            <p className="text-slate-600 font-black uppercase italic text-xs tracking-widest">
              Aucun incident ne correspond à votre recherche
            </p>
          </div>
        )}
      </section>

      {/* FOOTER STATS RAPIDE */}
      <footer className="mt-12 pt-10 border-t border-white/5 flex gap-12 items-center">
        <div className="flex items-center gap-3">
          <span className="text-4xl font-black italic text-orange-500 leading-none">{events.length}</span>
          <span className="text-[8px] font-black uppercase text-slate-500 leading-tight tracking-widest">Registre<br/>Total</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-4xl font-black italic text-red-500 leading-none">
            {events.filter(e => e.SSE_AvecArret).length}
          </span>
          <span className="text-[8px] font-black uppercase text-slate-500 leading-tight tracking-widest">Accidents<br/>Arrêt</span>
        </div>
        <div className="ml-auto">
           <p className="text-[8px] font-bold text-slate-600 uppercase italic tracking-[0.3em]">Qualisoft SMI • Module HSE v2.0</p>
        </div>
      </footer>
    </div>
  );
}