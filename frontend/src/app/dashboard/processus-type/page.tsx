/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Plus, Edit, Trash2, Search, RefreshCw, 
  Settings, Layers, Palette, CheckCircle, 
  XCircle, Loader2, ChevronRight, Hash
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- TYPES BASÉS SUR TON SCHEMA PRISMA ---
type ProcessFamily = 'MANAGEMENT' | 'OPERATIONNEL' | 'SUPPORT';

interface ProcessType {
  PT_Id: string;
  PT_Label: string;
  PT_Description?: string;
  PT_Color: string;
  PT_Family: ProcessFamily;
  PT_IsActive: boolean;
  tenantId: string;
}

export default function ProcessTypePage() {
  const [types, setTypes] = useState<ProcessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<ProcessType | null>(null);

  const loadTypes = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/processus-types');
      setTypes(res.data);
    } catch (e) {
      toast.error("Erreur de synchronisation des types (§4.4)");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadTypes(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ Supprimer ce type de processus ? Cela impactera les processus liés.")) return;
    try {
      await apiClient.delete(`/processus-types/${id}`);
      toast.success("Type supprimé du référentiel");
      loadTypes();
    } catch (e) { toast.error("Échec de la suppression"); }
  };

  return (
    <div className="ml-72 min-h-screen bg-[#0B0F1A] text-white italic font-sans p-8">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Référentiel <span className="text-blue-500">Types de Processus</span>
          </h1>
          <p className="text-slate-500 text-sm uppercase font-bold italic">ISO 9001 §4.4 : Système de management et ses processus</p>
        </div>
        <button 
          onClick={() => { setEditingType(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-black uppercase text-xs flex items-center gap-3 transition-all shadow-xl shadow-blue-900/20"
        >
          <Plus size={18} /> Nouveau Type
        </button>
      </header>

      {/* --- GRID DES TYPES --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
          <p className="font-black uppercase text-xs italic text-slate-500">Lecture du schéma...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {types.map((type) => (
            <div key={type.PT_Id} className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 hover:border-blue-500/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: `${type.PT_Color}20`, color: type.PT_Color }}
                >
                  <Layers size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setEditingType(type); setShowModal(true); }} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-blue-400"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(type.PT_Id)} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
              </div>

              <h3 className="text-xl font-black uppercase italic mb-1">{type.PT_Label}</h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-white/5 rounded text-slate-400 mb-4 inline-block">
                Famille: {type.PT_Family}
              </span>
              
              <p className="text-xs text-slate-500 italic mb-6 line-clamp-2">
                {type.PT_Description || "Aucune description technique définie pour ce type."}
              </p>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.PT_Color }}></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{type.PT_Color}</span>
                </div>
                <span className={`text-[10px] font-black uppercase italic ${type.PT_IsActive ? 'text-green-500' : 'text-red-500'}`}>
                  {type.PT_IsActive ? 'Opérationnel' : 'Archivé'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProcessTypeModal 
          type={editingType} 
          onClose={() => setShowModal(false)} 
          onSuccess={loadTypes} 
        />
      )}
    </div>
  );
}

// --- MODAL CRUD ---
function ProcessTypeModal({ type, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    PT_Label: type?.PT_Label || '',
    PT_Description: type?.PT_Description || '',
    PT_Color: type?.PT_Color || '#3b82f6',
    PT_Family: type?.PT_Family || 'OPERATIONNEL',
    PT_IsActive: type?.PT_IsActive ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type) {
        await apiClient.patch(`/processus-types/${type.PT_Id}`, formData);
        toast.success("Mise à jour validée");
      } else {
        await apiClient.post('/processus-types', formData);
        toast.success("Nouveau type enregistré");
      }
      onSuccess(); onClose();
    } catch (e) { toast.error("Échec de l'opération"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl max-w-lg w-full p-8 shadow-2xl italic font-bold">
        <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
          <Settings className="text-blue-500" /> {type ? 'Modifier le Type' : 'Nouveau Type §4.4'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase">Libellé du Type</label>
            <input 
              required className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm outline-none focus:border-blue-500"
              value={formData.PT_Label} onChange={e => setFormData({...formData, PT_Label: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase">Famille</label>
              <select 
                className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm outline-none"
                value={formData.PT_Family} onChange={e => setFormData({...formData, PT_Family: e.target.value as any})}
              >
                <option value="MANAGEMENT">MANAGEMENT</option>
                <option value="OPERATIONNEL">OPÉRATIONNEL</option>
                <option value="SUPPORT">SUPPORT</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase">Couleur Identitaire</label>
              <div className="flex gap-2">
                <input 
                  type="color" className="bg-transparent border-none w-10 h-10 p-0 cursor-pointer"
                  value={formData.PT_Color} onChange={e => setFormData({...formData, PT_Color: e.target.value})}
                />
                <input 
                  className="flex-1 bg-white/5 border border-white/10 p-2 rounded-lg text-xs uppercase"
                  value={formData.PT_Color} onChange={e => setFormData({...formData, PT_Color: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase">Description Technique</label>
            <textarea 
              rows={3} className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm outline-none focus:border-blue-500"
              value={formData.PT_Description} onChange={e => setFormData({...formData, PT_Description: e.target.value})}
            />
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" id="isActive" checked={formData.PT_IsActive}
              onChange={e => setFormData({...formData, PT_IsActive: e.target.checked})}
              className="w-4 h-4 rounded bg-blue-600 border-none"
            />
            <label htmlFor="isActive" className="text-xs uppercase text-slate-400">Type actuellement opérationnel</label>
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/5">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-800 rounded-xl font-black uppercase text-xs">Annuler</button>
            <button type="submit" disabled={loading} className="flex-2 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : "Enregistrer le Schéma"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}