'use client';

import React, { useState } from 'react';
import apiClient from '@/core/api/api-client';
import { X, Save, Loader2, AlertTriangle, Users, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface IncidentFormProps {
  onClose: () => void;
  onSuccess: () => void;
  sites: any[];
  users: any[];
}

export default function IncidentForm({ onClose, onSuccess, sites, users }: IncidentFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    SSE_Type: 'DOMMAGE_MATERIEL',
    SSE_DateEvent: new Date().toISOString().slice(0, 16),
    SSE_Lieu: '',
    SSE_Description: '',
    SSE_AvecArret: false,
    SSE_NbJoursArret: 0,
    SSE_SiteId: sites[0]?.S_Id || '',
    SSE_ProcessusId: '',
    SSE_ReporterId: '',
    SSE_VictimId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validation
      if (!formData.SSE_Lieu.trim()) {
        toast.error('Le lieu est obligatoire');
        return;
      }
      if (!formData.SSE_Description.trim()) {
        toast.error('La description est obligatoire');
        return;
      }
      if (formData.SSE_AvecArret && formData.SSE_NbJoursArret <= 0) {
        toast.error('Le nombre de jours d\'arrêt doit être supérieur à 0');
        return;
      }

      await apiClient.post('/sse-events', formData);
      toast.success("Incident enregistré avec succès");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erreur création incident:", err);
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
            Nouvel <span className="text-red-600">Incident Environnemental</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Type d'incident</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-red-500 outline-none"
                value={formData.SSE_Type}
                onChange={(e) => setFormData({...formData, SSE_Type: e.target.value})}
                required
              >
                <option value="DOMMAGE_MATERIEL">Dommage Matériel Environnemental</option>
                <option value="SITUATION_DANGEREUSE">Situation Dangereuse (Risque Pollution)</option>
                <option value="PRESQU_ACCIDENT">Presqu'Accident Environnemental</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Date & Heure</label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="datetime-local"
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 font-bold text-slate-700 outline-none"
                  value={formData.SSE_DateEvent}
                  onChange={(e) => setFormData({...formData, SSE_DateEvent: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Lieu Précis</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                required
                className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 font-bold text-slate-700 outline-none"
                placeholder="Ex: Zone de stockage produits chimiques, Atelier peinture..."
                value={formData.SSE_Lieu}
                onChange={(e) => setFormData({...formData, SSE_Lieu: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Description Détaillée</label>
            <textarea 
              required
              className="w-full bg-slate-50 border-none rounded-3xl p-5 font-medium text-slate-700 h-40 outline-none"
              placeholder="Décrivez précisément l'incident : nature du dommage, produits impliqués, impacts potentiels sur l'environnement (sol, eau, air), mesures immédiates prises..."
              value={formData.SSE_Description}
              onChange={(e) => setFormData({...formData, SSE_Description: e.target.value})}
            />
            <p className="text-[9px] text-slate-500 mt-1 italic">
              ⚠️ Cette description sera utilisée pour l'analyse des causes et la mise en place d'actions correctives conformément à l'ISO 14001 §10.2
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Site Concerné</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-red-500 outline-none"
                value={formData.SSE_SiteId}
                onChange={(e) => setFormData({...formData, SSE_SiteId: e.target.value})}
                required
              >
                {sites.map(site => (
                  <option key={site.S_Id} value={site.S_Id}>{site.S_Name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Processus Impacté (optionnel)</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"
                value={formData.SSE_ProcessusId}
                onChange={(e) => setFormData({...formData, SSE_ProcessusId: e.target.value})}
              >
                <option value="">Aucun processus spécifique</option>
                {/* Processus seront chargés dynamiquement si nécessaire */}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Reporter</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"
                value={formData.SSE_ReporterId}
                onChange={(e) => setFormData({...formData, SSE_ReporterId: e.target.value})}
              >
                <option value="">Sélectionner le reporter</option>
                {users.map(user => (
                  <option key={user.U_Id} value={user.U_Id}>
                    {user.U_FirstName} {user.U_LastName} ({user.U_Email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Victime (si applicable)</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"
                value={formData.SSE_VictimId}
                onChange={(e) => setFormData({...formData, SSE_VictimId: e.target.value})}
              >
                <option value="">Aucune victime</option>
                {users.map(user => (
                  <option key={user.U_Id} value={user.U_Id}>
                    {user.U_FirstName} {user.U_LastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
            <input 
              type="checkbox"
              id="avecArret"
              className="w-6 h-6 rounded-lg text-red-600 focus:ring-red-500 border-amber-200"
              checked={formData.SSE_AvecArret}
              onChange={(e) => setFormData({...formData, SSE_AvecArret: e.target.checked})}
            />
            <label htmlFor="avecArret" className="font-black italic uppercase text-xs text-amber-800 tracking-tight leading-none">
              Cet incident a entraîné un arrêt de travail
            </label>
            {formData.SSE_AvecArret && (
              <input 
                type="number"
                min="1"
                className="w-24 bg-white border border-amber-200 rounded-xl p-2 font-bold text-red-600 ml-auto outline-none"
                placeholder="Jours"
                value={formData.SSE_NbJoursArret || ''}
                onChange={(e) => setFormData({...formData, SSE_NbJoursArret: parseInt(e.target.value) || 0})}
              />
            )}
          </div>

          <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="font-black text-red-800 text-[10px] uppercase tracking-widest mb-1">OBLIGATION RÉGLEMENTAIRE</p>
                <p className="text-[9px] text-red-700 italic">
                  Conformément à l'article L.132-3 du Code de l'Environnement, tout incident ayant un impact significatif sur l'environnement doit être déclaré aux autorités compétentes dans les 48 heures. Cochez cette case si l'incident nécessite une déclaration réglementaire.
                </p>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Enregistrer l'Incident Environnemental
          </button>
        </form>
      </div>
    </div>
  );
}