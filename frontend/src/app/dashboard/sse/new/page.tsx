/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldAlert, Plus, Activity, HardHat, 
  MapPin, Calendar, Trash2, Loader2, X, AlertTriangle,
  Clock, Thermometer, User, ChevronRight
} from 'lucide-react';

export default function SSEPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // État du formulaire aligné sur SseService
  const [formData, setFormData] = useState({
    SSE_Type: 'ACCIDENT',
    SSE_Lieu: '',
    SSE_Description: '',
    SSE_Lesions: '',
    SSE_AvecArret: false,
    SSE_NbJoursArret: 0,
    SSE_DateEvent: new Date().toISOString().split('T')[0],
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/sse');
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur SSE:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/sse', formData);
      setIsModalOpen(false);
      setFormData({
        SSE_Type: 'ACCIDENT', SSE_Lieu: '', SSE_Description: '',
        SSE_Lesions: '', SSE_AvecArret: false, SSE_NbJoursArret: 0,
        SSE_DateEvent: new Date().toISOString().split('T')[0]
      });
      fetchEvents();
    } catch (err) {
      alert("Erreur lors de l'enregistrement SSE");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet événement SSE ?")) return;
    try {
      await apiClient.delete(`/sse/${id}`);
      setEvents(prev => prev.filter(e => e.SSE_Id !== id));
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0B0F1A] ml-72">
      <Loader2 className="animate-spin text-orange-500" size={40} />
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-8 ml-72 text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER HSE */}
        <header className="flex justify-between items-center border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-2 text-orange-500 mb-2">
              <HardHat size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Sécurité au Travail</span>
            </div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter">Registre <span className="text-orange-500">SSE</span></h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 italic">Suivi des accidents et incidents environnementaux</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
          >
            <Plus size={18} /> Déclarer un événement
          </button>
        </header>

        {/* LISTE DES ÉVÉNEMENTS */}
        <div className="grid gap-6">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event.SSE_Id} className="bg-slate-900/40 border border-white/5 p-8 rounded-[35px] flex items-center justify-between group hover:border-orange-500/30 transition-all">
                <div className="flex items-center gap-8 flex-1">
                  <div className={`p-5 rounded-2xl border ${
                    event.SSE_AvecArret ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                  }`}>
                    <ShieldAlert size={28} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-lg bg-white/5 text-orange-400 text-[9px] font-black uppercase italic tracking-widest border border-white/10">
                        {event.SSE_Type}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 text-[10px] font-bold">
                        <Calendar size={12}/> {new Date(event.SSE_DateEvent).toLocaleDateString()}
                      </span>
                      {event.SSE_AvecArret && (
                        <span className="px-3 py-1 rounded-lg bg-red-600 text-white text-[9px] font-black uppercase italic">
                          Arrêt: {event.SSE_NbJoursArret} Jours
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-black uppercase italic tracking-tight mb-2 group-hover:text-orange-400 transition-colors">
                      {event.SSE_Lieu}
                    </h3>
                    
                    <div className="flex flex-wrap gap-6 text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
                      <span className="flex items-center gap-2">
                        <User size={14} className="text-orange-500"/> 
                        Victime: {event.SSE_Victim ? `${event.SSE_Victim.U_FirstName} ${event.SSE_Victim.U_LastName}` : 'Aucune'}
                      </span>
                      <span className="flex items-center gap-2">
                        <Thermometer size={14} className="text-orange-500"/> {event.SSE_Lesions || 'Pas de lésions signalées'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 px-4">
                  <button onClick={() => handleDelete(event.SSE_Id)} className="p-4 bg-white/5 rounded-2xl text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-900/20 border border-white/5 p-20 rounded-[4rem] text-center">
              <Activity className="mx-auto text-slate-800 mb-6" size={60} />
              <p className="text-slate-500 font-black uppercase italic text-sm tracking-[0.2em]">Aucun événement SSE répertorié.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE SIGNALEMENT SSE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-100 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-2xl rounded-[40px] p-12 shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-orange-500">Signalement SSE</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white"><X size={28} /></button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Type d&apos;événement</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold uppercase italic outline-none"
                  value={formData.SSE_Type}
                  onChange={(e) => setFormData({...formData, SSE_Type: e.target.value})}
                >
                  <option value="ACCIDENT" className="bg-slate-900">Accident du Travail</option>
                  <option value="PRESQU_ACCIDENT" className="bg-slate-900">Presqu&apos;accident</option>
                  <option value="INCIDENT_ENV" className="bg-slate-900">Incident Environnemental</option>
                  <option value="SITUATION_DANGEREUSE" className="bg-slate-900">Situation Dangereuse</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Lieu / Poste</label>
                <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none font-bold" 
                  value={formData.SSE_Lieu} onChange={(e) => setFormData({...formData, SSE_Lieu: e.target.value})} />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Date de l&apos;événement</label>
                <input type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none font-bold" 
                  value={formData.SSE_DateEvent} onChange={(e) => setFormData({...formData, SSE_DateEvent: e.target.value})} />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Lésions constatées / Description</label>
                <textarea rows={2} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none font-medium" 
                  value={formData.SSE_Description} onChange={(e) => setFormData({...formData, SSE_Description: e.target.value})} />
              </div>

              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                <input type="checkbox" className="w-5 h-5 accent-orange-500" checked={formData.SSE_AvecArret} 
                  onChange={(e) => setFormData({...formData, SSE_AvecArret: e.target.checked})} />
                <label className="text-[10px] font-black uppercase italic">Accident avec arrêt</label>
              </div>

              {formData.SSE_AvecArret && (
                <div>
                  <input type="number" placeholder="Nombre de jours" className="w-full bg-white/5 border border-orange-500/50 rounded-2xl p-4 text-sm outline-none font-bold" 
                    value={formData.SSE_NbJoursArret} onChange={(e) => setFormData({...formData, SSE_NbJoursArret: parseInt(e.target.value)})} />
                </div>
              )}

              <button type="submit" className="col-span-2 bg-orange-600 py-6 rounded-2xl font-black uppercase italic text-xs hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/20 mt-4">
                Enregistrer l&apos;événement SSE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}