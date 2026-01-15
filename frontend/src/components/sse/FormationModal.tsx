/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { X, GraduationCap, Calendar, User, Save, Loader2 } from 'lucide-react';

export default function FormationModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    FOR_Title: '',
    FOR_Date: new Date().toISOString().split('T')[0],
    FOR_Expiry: '',
    FOR_UserId: '',
    tenantId: '' // Sera récupéré du localStorage
  });

  useEffect(() => {
    // 1. Récupérer les utilisateurs pour le sélecteur
    apiClient.get('/users').then(res => setUsers(res.data));
    
    // 2. Récupérer le TenantId depuis l'utilisateur connecté
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setFormData(prev => ({ ...prev, tenantId: user.tenantId }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/formations', formData);
      onSuccess();
      onClose();
    } catch (err) {
      alert("Erreur lors de l'enregistrement de l'habilitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-100 flex items-center justify-center p-4 italic">
      <div className="bg-[#0F172A] border border-white/10 w-full max-w-xl rounded-[40px] p-10 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-900/20">
            <GraduationCap size={24} />
          </div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Nouvelle <span className="text-orange-500">Habilitation</span></h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-500 ml-2 tracking-widest">Collaborateur concerné</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <select 
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-xs font-bold italic outline-none focus:border-orange-500 transition-all appearance-none"
                value={formData.FOR_UserId}
                onChange={(e) => setFormData({...formData, FOR_UserId: e.target.value})}
              >
                <option value="">Sélectionner un employé...</option>
                {users.map(u => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-500 ml-2 tracking-widest">Intitulé de la formation / Habilitation</label>
            <input 
              required
              placeholder="ex: CACES, SST, Habilitation Électrique..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold italic outline-none focus:border-orange-500 transition-all"
              value={formData.FOR_Title}
              onChange={(e) => setFormData({...formData, FOR_Title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 ml-2 tracking-widest">Date d&apos;obtention</label>
              <input 
                type="date"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-orange-500 transition-all"
                value={formData.FOR_Date}
                onChange={(e) => setFormData({...formData, FOR_Date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 ml-2 tracking-widest">Date d&apos;expiration</label>
              <input 
                type="date"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-orange-500 transition-all text-orange-400"
                value={formData.FOR_Expiry}
                onChange={(e) => setFormData({...formData, FOR_Expiry: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 py-5 rounded-2xl font-black uppercase italic text-xs transition-all flex items-center justify-center gap-3 shadow-xl shadow-orange-900/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Enregistrer l&apos;habilitation
          </button>
        </form>
      </div>
    </div>
  );
}