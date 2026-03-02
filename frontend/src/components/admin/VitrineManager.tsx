/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🌐 MODULE : VitrineManager.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage du contenu public (Actualités, Formations, Ressources).
 * CIBLE : Portail qualisoft.sn (§8.2 ISO 9001 - Communication).
 * DESIGN : Sovereign Master Theme (High-Density).
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 18:12 GMT
 */

"use client";

import React, { useState } from 'react';
import { 
  Plus, Save, Trash2, Edit3, Globe, Zap, 
  BookOpen, Layout, ArrowRight, Loader2, Eye 
} from 'lucide-react';
import { toast } from 'sonner';

type ContentType = 'ACTUALITE' | 'FORMATION' | 'RESSOURCE';

interface VitrineContent {
  id: string;
  title: string;
  catchPhrase: string;
  type: ContentType;
  status: 'BROUILLON' | 'PUBLIÉ';
}

export default function VitrineManager() {
  const [mode, setMode] = useState<'LIST' | 'EDIT'>('LIST');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    catch: '',
    content: '',
    type: 'ACTUALITE' as ContentType
  });

  const handlePublish = async () => {
    setLoading(true);
    const tid = toast.loading("Synchronisation avec le cluster qualisoft.sn...");
    
    // Simulation du push vers le CDN de la vitrine
    setTimeout(() => {
      setLoading(false);
      toast.success("CONTENU PUBLIÉ : La vitrine a été mise à jour.", { id: tid });
      setMode('LIST');
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 italic font-sans text-left">
      
      {/* 🔝 HEADER PUBLISHER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0F172A] p-8 lg:p-10 rounded-[3rem] border border-white/5 shadow-4xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full" />
        <div className="relative z-10">
          <h2 className="text-3xl font-black uppercase text-white tracking-tighter flex items-center gap-4 m-0">
            <Globe className="text-blue-500 animate-pulse" size={32} /> Web <span className="text-blue-500 underline">Publisher</span>
          </h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3 m-0">Gestion du flux éditorial Qualisoft Elite</p>
        </div>
        {mode === 'LIST' && (
          <button 
            onClick={() => setMode('EDIT')}
            className="px-8 py-4 bg-blue-600 hover:bg-white hover:text-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all flex items-center gap-3 border-none cursor-pointer shadow-3xl active:scale-95 shrink-0"
          >
            <Plus size={18} /> Nouveau Contenu
          </button>
        )}
      </header>

      {mode === 'LIST' ? (
        /* 📋 REGISTRE DES CONTENUS PUBLIÉS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ContentCard 
            title="L'IA Prédictive au Sénégal" 
            type="ACTUALITE" 
            status="PUBLIÉ"
            onEdit={() => setMode('EDIT')} 
          />
          <ContentCard 
            title="Masterclass ISO 27001" 
            type="FORMATION" 
            status="BROUILLON"
            onEdit={() => setMode('EDIT')} 
          />
          <div className="border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center p-12 text-slate-700 hover:border-blue-500/20 hover:text-blue-500 transition-all cursor-pointer group" onClick={() => setMode('EDIT')}>
             <Layout size={40} className="mb-4 opacity-20 group-hover:opacity-100 group-hover:animate-bounce" />
             <span className="text-[10px] font-black uppercase tracking-widest">Ajouter une unité de contenu</span>
          </div>
        </div>
      ) : (
        /* ✍️ ÉDITEUR HAUTE-DENSITÉ */
        <div className="bg-[#0F172A] p-10 lg:p-14 rounded-[4rem] border border-white/10 space-y-10 shadow-4xl relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-6 tracking-widest italic leading-none">Catégorie de Publication</label>
              <select className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-6 text-xs font-black text-white uppercase italic outline-none focus:border-blue-600 cursor-pointer appearance-none">
                <option value="ACTUALITE">ACTUALITÉ IA & QHSE</option>
                <option value="FORMATION">PROGRAMME DE FORMATION</option>
                <option value="RESSOURCE">RESSOURCE DOCUMENTAIRE SDE</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-6 tracking-widest italic leading-none">Titre de l&apos;Unité</label>
              <input className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-6 text-xs font-black text-white uppercase italic outline-none focus:border-blue-600 transition-all" placeholder="EX: STRATÉGIE SOUVERAINE 2026..." />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-6 tracking-widest italic leading-none">Accroche Stratégique (Catchphrase)</label>
            <input className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-6 text-xs font-black text-blue-400 uppercase italic outline-none focus:border-blue-600 transition-all" placeholder="L'EXCELLENCE SANS COMPROMIS..." />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-6 tracking-widest italic leading-none flex items-center gap-2"><BookOpen size={12}/> Corps du Contenu (Markdown Supporté)</label>
            <textarea rows={10} className="w-full bg-black/40 border-2 border-white/5 rounded-[2.5rem] p-8 text-sm font-bold text-slate-300 italic outline-none focus:border-blue-600 transition-all resize-none leading-relaxed" placeholder="RÉDIGEZ ICI LE CONTENU DÉTAILLÉ DE VOTRE PUBLICATION..." />
          </div>

          <div className="flex justify-end items-center gap-8 pt-6">
            <button onClick={() => setMode('LIST')} className="text-[10px] font-black uppercase text-slate-600 hover:text-white transition-all bg-transparent border-none cursor-pointer tracking-widest italic">Annuler les modifications</button>
            <div className="flex gap-4">
               <button className="px-8 py-5 bg-white/5 text-slate-300 rounded-2xl font-black uppercase text-[10px] hover:bg-white/10 transition-all flex items-center gap-3 border-none cursor-pointer italic"><Eye size={16}/> Prévisualisation</button>
               <button onClick={handlePublish} disabled={loading} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-3xl hover:bg-white hover:text-blue-600 transition-all flex items-center gap-3 border-none cursor-pointer italic tracking-widest">
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Publier sur la Vitrine
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 🎨 SOUS-COMPOSANT : CARTE DE CONTENU
 */
function ContentCard({ title, type, status, onEdit }: any) {
  return (
    <div className="p-8 bg-[#0F172A] border border-white/5 rounded-[3rem] hover:border-blue-500/40 transition-all group relative overflow-hidden flex flex-col justify-between min-h-70">
      <div className="absolute -inset-px bg-linear-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="relative z-10 flex justify-between items-start">
        <span className={`text-[8px] font-black px-3 py-1.5 rounded-full italic uppercase border ${type === 'ACTUALITE' ? 'bg-blue-600/10 text-blue-400 border-blue-600/20' : 'bg-emerald-600/10 text-emerald-400 border-emerald-600/20'}`}>
          {type}
        </span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={onEdit} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors border-none cursor-pointer"><Edit3 size={16}/></button>
          <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 transition-colors border-none cursor-pointer"><Trash2 size={16}/></button>
        </div>
      </div>

      <div className="relative z-10 mt-6">
        <h3 className="text-xl font-black uppercase italic text-white leading-none tracking-tighter group-hover:text-blue-500 transition-colors">{title}</h3>
        <p className="text-[10px] text-slate-600 font-bold uppercase mt-4 italic tracking-widest flex items-center gap-2">
           <Zap size={10} className={status === 'PUBLIÉ' ? 'text-emerald-500' : 'text-slate-700'} /> {status}
        </p>
      </div>

      <button onClick={onEdit} className="relative z-10 mt-8 py-4 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-center gap-3 text-[9px] font-black uppercase text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all border-none cursor-pointer italic">
        Éditer le flux <ArrowRight size={14} />
      </button>
    </div>
  );
}