/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { X, Save, AlertCircle, Loader2 } from 'lucide-react';

export default function SseModal({ onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    SSE_Type: 'ACCIDENT_TRAVAIL',
    SSE_Lieu: '',
    SSE_Description: '',
    SSE_DateEvent: '',
    SSE_SiteId: '',
    SSE_VictimId: '',
    SSE_AvecArret: false,
    SSE_NbJoursArret: 0,
    SSE_Lesions: ''
  });

  useEffect(() => {
    Promise.all([apiClient.get('/sites'), apiClient.get('/users')])
      .then(([s, u]) => { setSites(s.data); setUsers(u.data); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/sse', formData);
      onSuccess();
      onClose();
    } catch (err) { alert("Erreur lors de l'enregistrement"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden">
        <div className="p-8 bg-red-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} />
            <h2 className="text-xl font-black uppercase italic">Déclarer un événement SSE</h2>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Type d&apos;événement</label>
            <select className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold border-none"
                    value={formData.SSE_Type} onChange={e => setFormData({...formData, SSE_Type: e.target.value})}>
              <option value="ACCIDENT_TRAVAIL">Accident de Travail</option>
              <option value="ACCIDENT_TRAJET">Accident de Trajet</option>
              <option value="PRESQU_ACCIDENT">Presqu&apos;Accident</option>
              <option value="SITUATION_DANGEREUSE">Situation Dangereuse</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Date</label>
            <input type="date" required className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold border-none"
                   value={formData.SSE_DateEvent} onChange={e => setFormData({...formData, SSE_DateEvent: e.target.value})} />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Site</label>
            <select className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold border-none"
                    value={formData.SSE_SiteId} onChange={e => setFormData({...formData, SSE_SiteId: e.target.value})}>
              <option value="">-- Choisir le site --</option>
              {sites.map((s: any) => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Lieu précis & Description</label>
            <textarea required className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold border-none min-h-20"
                      placeholder="Ex: Atelier soudure, chute de plain-pied..."
                      value={formData.SSE_Description} onChange={e => setFormData({...formData, SSE_Description: e.target.value})} />
          </div>

          <div className="flex items-center gap-4">
             <label className="text-xs font-black uppercase italic text-slate-700">Avec Arrêt ?</label>
             <input type="checkbox" className="w-6 h-6 rounded-lg border-slate-200"
                    checked={formData.SSE_AvecArret} onChange={e => setFormData({...formData, SSE_AvecArret: e.target.checked})} />
          </div>

          {formData.SSE_AvecArret && (
            <input type="number" placeholder="Nb jours d'arrêt" className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold border-none"
                   value={formData.SSE_NbJoursArret} onChange={e => setFormData({...formData, SSE_NbJoursArret: parseInt(e.target.value)})} />
          )}

          <button type="submit" disabled={loading} className="col-span-2 bg-red-600 py-5 rounded-2xl font-black uppercase italic text-white shadow-xl hover:bg-slate-900 transition-all flex justify-center gap-3">
            {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />} Enregistrer le rapport
          </button>
        </form>
      </div>
    </div>
  );
}