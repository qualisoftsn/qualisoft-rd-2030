'use client';

import React, { useState } from 'react';
import apiClient from '@/core/api/api-client';
import { X, Save, Loader2 } from 'lucide-react';

interface SSEFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function SSEForm({ onClose, onSuccess }: SSEFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    SSE_Description: '',
    SSE_Lieu: '',
    SSE_Type: 'ACCIDENT_TRAVAIL', // Aligné sur SSEType Enum
    SSE_DateEvent: new Date().toISOString().slice(0, 16), 
    SSE_AvecArret: false,
    SSE_NbJoursArret: 0,
    SSE_Lesions: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 🚀 Envoi avec les clés exactes demandées par Prisma
      await apiClient.post('/sse', formData);
      onSuccess(); 
      onClose();   
    } catch (err) {
      console.error("Erreur de création SSE:", err);
      alert("Erreur lors de l'enregistrement de l'incident. Vérifiez les champs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
            Nouveau Signalement <span className="text-orange-600">SSE</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Nature de l&apos;incident</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.SSE_Type}
                onChange={(e) => setFormData({...formData, SSE_Type: e.target.value})}
              >
                <option value="ACCIDENT_TRAVAIL">Accident du Travail</option>
                <option value="ACCIDENT_TRAJET">Accident de Trajet</option>
                <option value="PRESQU_ACCIDENT">Presqu&apos;accident</option>
                <option value="SITUATION_DANGEREUSE">Situation Dangereuse</option>
                <option value="DOMMAGE_MATERIEL">Dommage Matériel</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Date & Heure</label>
              <input 
                type="datetime-local"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"
                value={formData.SSE_DateEvent}
                onChange={(e) => setFormData({...formData, SSE_DateEvent: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Description & Lésions</label>
            <textarea 
              className="w-full bg-slate-50 border-none rounded-3xl p-5 font-medium text-slate-700 h-24 outline-none"
              placeholder="Décrivez les faits et les lésions éventuelles..."
              value={formData.SSE_Description}
              onChange={(e) => setFormData({...formData, SSE_Description: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Lieu précis</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"
                placeholder="Ex: Chantier Dakar, Zone B"
                value={formData.SSE_Lieu}
                onChange={(e) => setFormData({...formData, SSE_Lieu: e.target.value})}
                required
              />
            </div>

            <div className="flex items-center gap-4 bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
              <input 
                type="checkbox"
                id="avecArret"
                className="w-6 h-6 rounded-lg text-orange-600 focus:ring-orange-500 border-orange-200"
                checked={formData.SSE_AvecArret}
                onChange={(e) => setFormData({...formData, SSE_AvecArret: e.target.checked})}
              />
              <label htmlFor="avecArret" className="font-black italic uppercase text-xs text-orange-800 tracking-tight leading-none">Accident avec arrêt</label>
              {formData.SSE_AvecArret && (
                <input 
                  type="number"
                  className="w-16 bg-white border border-orange-200 rounded-xl p-2 font-bold text-orange-600 ml-auto outline-none"
                  value={formData.SSE_NbJoursArret}
                  onChange={(e) => setFormData({...formData, SSE_NbJoursArret: parseInt(e.target.value)})}
                />
              )}
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Enregistrer dans le Registre
          </button>
        </form>
      </div>
    </div>
  );
}