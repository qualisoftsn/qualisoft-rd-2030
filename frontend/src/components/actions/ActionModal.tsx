/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { X, Save, Loader2, Target } from 'lucide-react';

export default function ActionModal({ onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [paqs, setPaqs] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    ACT_Title: '',
    ACT_Description: '',
    ACT_Priority: 'MEDIUM',
    ACT_Deadline: '',
    ACT_ResponsableId: '',
    ACT_PAQId: '', // Obligatoire selon ton schéma
    ACT_Origin: 'AUDIT'
  });

  useEffect(() => {
    // Charger les responsables et les PAQ (Plans d'Actions Qualité)
    Promise.all([
      apiClient.get('/users'),
      apiClient.get('/paq') // Assure-toi que cette route existe
    ]).then(([resUsers, resPaqs]) => {
      setUsers(resUsers.data);
      setPaqs(resPaqs.data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/actions', formData);
      onSuccess();
      onClose();
    } catch (err) {
      alert("Vérifiez que le responsable et le PAQ sont sélectionnés");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-blue-50/30">
          <h2 className="text-xl font-black uppercase italic text-slate-900">Nouvelle Action</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <input required placeholder="Titre de l'action" className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                 value={formData.ACT_Title} onChange={e => setFormData({...formData, ACT_Title: e.target.value})} />

          <div className="grid grid-cols-2 gap-4">
            <select required className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-bold"
                    value={formData.ACT_ResponsableId} onChange={e => setFormData({...formData, ACT_ResponsableId: e.target.value})}>
              <option value="">-- Responsable --</option>
              {users.map(u => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
            </select>
            <select required className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-bold"
                    value={formData.ACT_PAQId} onChange={e => setFormData({...formData, ACT_PAQId: e.target.value})}>
              <option value="">-- Lier au PAQ --</option>
              {paqs.map(p => <option key={p.PAQ_Id} value={p.PAQ_Id}>{p.PAQ_Title}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input type="date" required className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-bold"
                   value={formData.ACT_Deadline} onChange={e => setFormData({...formData, ACT_Deadline: e.target.value})} />
            <select className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-bold"
                    value={formData.ACT_Priority} onChange={e => setFormData({...formData, ACT_Priority: e.target.value})}>
              <option value="LOW">Basse</option>
              <option value="MEDIUM">Moyenne</option>
              <option value="HIGH">Haute</option>
              <option value="CRITICAL">Critique</option>
            </select>
          </div>

          <textarea placeholder="Description de l'action..." className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-bold min-h-25"
                    value={formData.ACT_Description} onChange={e => setFormData({...formData, ACT_Description: e.target.value})} />

          <button type="submit" disabled={loading} className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase italic text-white flex items-center justify-center gap-3 shadow-xl">
            {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />} Enregistrer l&apos;action
          </button>
        </form>
      </div>
    </div>
  );
}