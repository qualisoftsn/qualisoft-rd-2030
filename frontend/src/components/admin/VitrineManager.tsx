// src/components/admin/VitrineManager.tsx
'use client';

import React, { useState } from 'react';
import { Plus, Save, Trash2, Edit3, Globe, Zap, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function VitrineManager() {
  const [mode, setMode] = useState<'LIST' | 'EDIT'>('LIST');
  const [contentType, setContentType] = useState('ACTUALITE');

  // Formulaire type pour une "Formation" ou "Actu IA"
  const [formData, setFormData] = useState({
    title: '',
    catch: '',
    content: '',
    type: 'ACTUALITE'
  });

  const handleSave = () => {
    toast.success("Contenu synchronisé avec qualisoft.sn");
    setMode('LIST');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
      
      {/* HEADER MANAGER */}
      <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-4xl border border-slate-800">
        <div>
          <h2 className="text-xl font-black uppercase text-white italic flex items-center gap-3">
            <Globe className="text-blue-500" /> Web <span className="text-blue-500 underline">Publisher</span>
          </h2>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Édition en direct sur qualisoft.sn</p>
        </div>
        {mode === 'LIST' && (
          <button 
            onClick={() => setMode('EDIT')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] hover:bg-blue-500 transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Nouveau Contenu
          </button>
        )}
      </div>

      {mode === 'LIST' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* EXEMPLE DE CARTE DE GESTION */}
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-4xl hover:border-blue-500/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[9px] font-black px-3 py-1 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-full italic">IA & STRATÉGIE</span>
              <div className="flex gap-2">
                <button className="p-2 text-slate-500 hover:text-white"><Edit3 size={16} /></button>
                <button className="p-2 text-slate-500 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
            <h3 className="text-lg font-black uppercase italic text-white mb-2">L'IA Prédictive au Sénégal</h3>
            <p className="text-xs text-slate-500 italic line-clamp-2">Comment Qualisoft déploie ses modèles de NLP pour les entreprises locales...</p>
          </div>
        </div>
      ) : (
        /* FORMULAIRE D'ÉDITION ÉLITE */
        <div className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800 space-y-8 italic">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Type de contenu</label>
              <select className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-5 py-4 text-xs font-bold text-white outline-none focus:border-blue-600">
                <option>ACTUALITE</option>
                <option>FORMATION</option>
                <option>RESSOURCE DOCUMENTAIRE</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Titre de la page</label>
              <input 
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-5 py-4 text-xs font-bold text-white outline-none focus:border-blue-600"
                placeholder="Ex: Formation ISO 27001..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Accroche (Catchphrase)</label>
            <input 
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-5 py-4 text-xs font-bold text-blue-400 outline-none focus:border-blue-600"
              placeholder="L'agilité sans compromis..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Corps du texte (Markdown supporté)</label>
            <textarea 
              rows={8}
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-5 py-4 text-xs font-bold text-slate-300 outline-none focus:border-blue-600 resize-none"
              placeholder="Rédigez ici le contenu détaillé..."
            />
          </div>

          <div className="flex justify-end gap-4">
            <button onClick={() => setMode('LIST')} className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all">Annuler</button>
            <button onClick={handleSave} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center gap-2">
              <Save size={16} /> Publier sur la vitrine
            </button>
          </div>
        </div>
      )}
    </div>
  );
}