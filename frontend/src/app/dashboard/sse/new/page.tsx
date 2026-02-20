/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * NOM ABSOLU : src/app/dashboard/sse/new/page.tsx
 * FONCTION : Journal de bord et terminal d'indexation SSE.
 * RÔLE : Suivi chronologique des événements HSE (§10.2).
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldAlert, Plus, Activity, HardHat, 
  MapPin, Calendar, Trash2, Loader2, X, AlertTriangle,
  Clock, Thermometer, User, ChevronRight, RefreshCcw
} from 'lucide-react';
import SSEForm from '../components/SSEForm';
import { toast } from 'react-hot-toast';

export default function SSENewPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * 📡 SYNCHRONISATION DU JOURNAL SSE
   */
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/sse');
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur de liaison journalière SSE:", err);
      toast.error("Impossible d'actualiser le journal SSE.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  /**
   * 🗑️ RÉVOCATION D'UN SIGNALEMENT
   */
  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ CONFIRMER LA SUPPRESSION DÉFINITIVE DE CET ÉVÉNEMENT ?")) return;
    try {
      await apiClient.delete(`/sse/${id}`);
      setEvents(prev => prev.filter(e => e.SSE_Id !== id));
      toast.success("Événement révoqué du registre.");
    } catch (err) { toast.error("Échec de la révocation serveur."); }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0B0F1A] ml-72 gap-6">
      <Loader2 className="animate-spin text-orange-500" size={50} />
      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 animate-pulse italic">LECTURE DU JOURNAL SSE...</span>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white font-sans text-left italic selection:bg-orange-600/30 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER SÉCURITÉ */}
        <header className="flex justify-between items-end border-b border-white/5 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-orange-500">
              <HardHat size={18} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Qualisoft Sovereign Security</span>
            </div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
                Journal <span className="text-orange-500">SSE</span>
            </h1>
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] italic opacity-70">Pilotage en temps réel des Incidents & Non-Conformités</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-600 text-white px-10 py-6 rounded-3xl font-black uppercase italic text-xs hover:bg-orange-500 transition-all shadow-[0_20px_40px_rgba(234,88,12,0.3)] flex items-center gap-4 border-none cursor-pointer active:scale-95"
          >
            <Plus size={22} strokeWidth={4} /> DÉCLARER UN ÉVÉNEMENT
          </button>
        </header>

        {/* FLUX DES ÉVÉNEMENTS RÉCENTS */}
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event.SSE_Id} className="bg-slate-900/40 border border-white/5 p-10 rounded-[4rem] flex items-center justify-between group hover:border-orange-500/30 transition-all shadow-4xl backdrop-blur-3xl">
                <div className="flex items-center gap-10 flex-1">
                  <div className={`p-6 rounded-3xl border shadow-inner ${
                    event.SSE_AvecArret ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                  }`}>
                    <ShieldAlert size={36} strokeWidth={2.5} />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-4 py-1.5 rounded-xl bg-white/5 text-orange-400 text-[10px] font-black uppercase italic tracking-widest border border-white/10 shadow-lg">
                        {event.SSE_Type.replace(/_/g, ' ')}
                      </span>
                      <span className="flex items-center gap-2 text-slate-500 text-[11px] font-black uppercase italic tracking-tight">
                        <Calendar size={14} className="text-blue-500" /> {new Date(event.SSE_DateEvent).toLocaleDateString('fr-FR')}
                      </span>
                      {event.SSE_AvecArret && (
                        <span className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase italic shadow-2xl">
                          ARRÊT : {event.SSE_NbJoursArret} JOURS
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 group-hover:text-orange-400 transition-colors leading-none">
                      {event.SSE_Lieu}
                    </h3>
                    
                    <div className="flex flex-wrap gap-10 text-slate-500 text-[10px] font-black uppercase tracking-widest italic leading-none">
                      <span className="flex items-center gap-3">
                        <User size={16} className="text-orange-500"/> 
                        VICTIME : <span className="text-white">{event.SSE_Victim ? `${event.SSE_Victim.U_FirstName} ${event.SSE_Victim.U_LastName}` : 'N/A'}</span>
                      </span>
                      <span className="flex items-center gap-3">
                        <Thermometer size={16} className="text-orange-500"/> 
                        LÉSIONS : <span className="text-slate-300">{event.SSE_Lesions || 'NON SIGNALÉES'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 px-6">
                  <button onClick={() => handleDelete(event.SSE_Id)} className="p-6 bg-white/5 rounded-3xl text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all border-none cursor-pointer shadow-inner">
                    <Trash2 size={24} />
                  </button>
                  <button onClick={() => toast.info("Dossier d'investigation ISO §10.2")} className="p-6 bg-blue-600/10 rounded-3xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all border-none cursor-pointer shadow-inner">
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-900/20 border border-white/5 p-40 rounded-[5rem] text-center backdrop-blur-3xl">
              <Activity className="mx-auto text-slate-800 mb-8 opacity-20" size={100} />
              <p className="text-slate-500 font-black uppercase italic text-sm tracking-[0.5em] opacity-50">Aucun événement SSE scellé au registre.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE SIGNALEMENT SOUVERAIN */}
      {isModalOpen && (
        <SSEForm onClose={() => setIsModalOpen(false)} onSuccess={fetchEvents} />
      )}
    </div>
  );
}