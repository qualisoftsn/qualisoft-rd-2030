/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Plus, Edit, Trash2, Search, RefreshCw, 
  Settings, Layers, Palette, CheckCircle, 
  XCircle, Loader2, ChevronRight, Hash, Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * 🛠️ TYPES ET INTERFACES DU RÉFÉRENTIEL
 * Aligné sur le schéma Prisma pour garantir l'intégrité de la persistance.
 */
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

/**
 * 🌐 COMPOSANT : GESTIONNAIRE DES TYPOLOGIES (§4.4)
 * Ce composant gère les métadonnées de haut niveau qui dictent 
 * le comportement visuel et analytique de la cartographie.
 */
export default function ProcessTypePage() {
  // --- ÉTATS SYSTÈME ---
  const [types, setTypes] = useState<ProcessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<ProcessType | null>(null);

  /**
   * 📡 SYNCHRONISATION DU RÉFÉRENTIEL STRUCTUREL
   * Récupère les typologies via le protocole API interne.
   * Utilisation de useCallback pour stabiliser la référence de fonction.
   */
  const loadTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/processus-types');
      // On s'assure que les données reçues correspondent au schéma
      setTypes(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      toast.error("Rupture de flux : Impossible de synchroniser les types (§4.4)");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    loadTypes(); 
  }, [loadTypes]);

  /**
   * 🧨 SUPPRESSION DÉCISIONNELLE
   * @param id - Identifiant unique du type à supprimer.
   * Note : La suppression est bloquante si des processus y sont rattachés (Contrainte d'intégrité).
   */
  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ Action critique : Supprimer ce type de processus ? Toute cartographie liée sera orpheline.")) return;
    
    try {
      await apiClient.delete(`/processus-types/${id}`);
      toast.success("Structure retirée du registre SMI");
      loadTypes();
    } catch (e) { 
      toast.error("Échec de la désintégration : Le type est probablement utilisé."); 
    }
  };

  return (
    <div className="ml-72 min-h-screen bg-[#0B0F1A] text-white italic font-sans p-10 selection:bg-blue-600/30">
      
      {/* 🔝 EN-TÊTE STRATÉGIQUE */}
      <header className="flex justify-between items-end mb-16 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
            Référentiel <span className="text-blue-500">Structurel</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] italic">
            ISO 9001 §4.4 : Typologie et Familles de Processus
          </p>
        </div>
        <button 
          onClick={() => { setEditingType(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-white hover:text-slate-900 text-white px-8 py-5 rounded-2xl font-black uppercase italic text-xs flex items-center gap-3 transition-all shadow-2xl border-none cursor-pointer active:scale-95 shadow-blue-900/20"
        >
          <Plus size={18} /> Initialiser un Segment
        </button>
      </header>

      

      {/* --- GRILLE D'ARCHITECTURE (§4.4.1) --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="animate-spin text-blue-500 mb-6 shadow-blue-500/20" size={50} />
          <p className="font-black uppercase text-[10px] tracking-[0.4em] italic text-slate-500 animate-pulse">Scanning SMI Schema...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {types.length > 0 ? types.map((type) => (
            <div 
              key={type.PT_Id} 
              className="bg-[#0F172A]/40 border border-white/5 rounded-[2.5rem] p-10 hover:border-blue-500/40 transition-all group relative overflow-hidden shadow-2xl"
            >
              {/* Filigrane de Famille */}
              <div className="absolute -right-4 -top-4 opacity-[0.02] text-white group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                <Layers size={150} />
              </div>

              <div className="flex justify-between items-start mb-8 relative z-10">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl border border-white/5"
                  style={{ backgroundColor: `${type.PT_Color}15`, color: type.PT_Color }}
                >
                  <Layers size={32} />
                </div>
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <button onClick={() => { setEditingType(type); setShowModal(true); }} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all border-none cursor-pointer"><Edit size={18}/></button>
                  <button onClick={() => handleDelete(type.PT_Id)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all border-none cursor-pointer"><Trash2 size={18}/></button>
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tighter group-hover:text-blue-500 transition-colors">{type.PT_Label}</h3>
                <div className="flex items-center gap-2 mb-6">
                   <span className="text-[9px] font-black uppercase px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-slate-400 italic tracking-widest">
                    FAMILLE : {type.PT_Family}
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 italic mb-10 line-clamp-3 leading-relaxed font-bold">
                  {type.PT_Description || "Aucune analyse descriptive scellée pour ce segment structurel."}
                </p>

                <div className="flex items-center justify-between border-t border-white/5 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: type.PT_Color }}></div>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{type.PT_Color}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity size={12} className={type.PT_IsActive ? 'text-emerald-500' : 'text-red-500'} />
                    <span className={`text-[9px] font-black uppercase italic tracking-tighter ${type.PT_IsActive ? 'text-emerald-500' : 'text-red-500'}`}>
                      {type.PT_IsActive ? 'OPÉRATIONNEL' : 'ARCHIVÉ'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-20 italic">
               <Layers size={64} className="mx-auto mb-4" />
               <p className="font-black uppercase tracking-widest">Aucune architecture définie</p>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL D'ÉDITION SOUVERAINE --- */}
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

/**
 * 📟 COMPOSANT MODAL : CONFIGURATION SEGMENT
 * Gère l'interface de saisie pour la création et la mise à jour (PATCH/POST).
 */
function ProcessTypeModal({ type, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  
  // État local synchronisé avec les données du type
  const [formData, setFormData] = useState({
    PT_Label: type?.PT_Label || '',
    PT_Description: type?.PT_Description || '',
    PT_Color: type?.PT_Color || '#3b82f6',
    PT_Family: type?.PT_Family || 'OPERATIONNEL',
    PT_IsActive: type?.PT_IsActive ?? true
  });

  /**
   * 💾 VALIDATION ET PERSISTANCE
   * Effectue la mutation de données vers l'API Qualisoft Elite.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type) {
        await apiClient.patch(`/processus-types/${type.PT_Id}`, formData);
        toast.success("Structure modifiée avec succès");
      } else {
        await apiClient.post('/processus-types', formData);
        toast.success("Nouveau segment intégré au SMI");
      }
      onSuccess(); 
      onClose();
    } catch (e) { 
      toast.error("Échec de la mutation structurelle"); 
    }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-100 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-[#0B0F1A] border border-white/10 rounded-[3rem] max-w-xl w-full p-12 shadow-[0_50px_100px_rgba(0,0,0,0.8)] italic font-bold text-left relative overflow-hidden">
        
        {/* Décoration Modal */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12"><Settings size={150} /></div>

        <h2 className="text-4xl font-black uppercase italic mb-12 flex items-center gap-5 tracking-tighter leading-none relative z-10">
          <Settings className="text-blue-500 animate-spin-slow" size={40} /> 
          {type ? 'RECTIFIER' : 'INITIALISER'} <span className="text-blue-600">LE TYPE</span>
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-10 relative z-10 text-left">
          
          <div className="space-y-3">
            <label className="text-[10px] text-slate-500 uppercase tracking-[0.4em] ml-2 italic">Désignation du Segment (§4.4.1)</label>
            <input 
              required 
              placeholder="EX: MANAGEMENT STRATÉGIQUE"
              className="w-full bg-slate-900 border border-white/10 p-7 rounded-2xl text-sm font-black uppercase italic text-white outline-none focus:border-blue-500 shadow-inner transition-all"
              value={formData.PT_Label} 
              onChange={e => setFormData({...formData, PT_Label: e.target.value.toUpperCase()})}
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 uppercase tracking-[0.4em] ml-2 italic">Classification</label>
              <select 
                className="w-full bg-slate-900 border border-white/10 p-7 rounded-2xl text-[10px] font-black uppercase italic text-white outline-none focus:border-blue-500 cursor-pointer appearance-none shadow-inner"
                value={formData.PT_Family} 
                onChange={e => setFormData({...formData, PT_Family: e.target.value as any})}
              >
                <option value="MANAGEMENT">MANAGEMENT</option>
                <option value="OPERATIONNEL">OPÉRATIONNEL</option>
                <option value="SUPPORT">SUPPORT</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 uppercase tracking-[0.4em] ml-2 italic">Identité Visuelle</label>
              <div className="flex gap-4">
                <input 
                  type="color" 
                  className="bg-transparent border-none w-16 h-17 p-0 cursor-pointer rounded-2xl overflow-hidden shadow-lg"
                  value={formData.PT_Color} 
                  onChange={e => setFormData({...formData, PT_Color: e.target.value})}
                />
                <input 
                  className="flex-1 bg-slate-900 border border-white/10 p-4 rounded-2xl text-[10px] font-black uppercase italic text-center text-slate-400 shadow-inner"
                  value={formData.PT_Color} 
                  onChange={e => setFormData({...formData, PT_Color: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] text-slate-500 uppercase tracking-[0.4em] ml-2 italic">Définition Technique & Scope</label>
            <textarea 
              rows={4} 
              placeholder="Décrire le rôle normatif de ce type de processus..."
              className="w-full bg-slate-900 border border-white/10 p-7 rounded-2xl text-sm font-bold italic text-white outline-none focus:border-blue-500 shadow-inner transition-all resize-none"
              value={formData.PT_Description} 
              onChange={e => setFormData({...formData, PT_Description: e.target.value})}
            />
          </div>

          <div className="flex items-center gap-4 bg-white/2 p-4 rounded-2xl border border-white/5">
            <input 
              type="checkbox" 
              id="isActive" 
              checked={formData.PT_IsActive}
              onChange={e => setFormData({...formData, PT_IsActive: e.target.checked})}
              className="w-6 h-6 rounded-lg bg-blue-600 border-none cursor-pointer"
            />
            <label htmlFor="isActive" className="text-[10px] font-black uppercase italic text-slate-400 tracking-widest cursor-pointer">Segment actuellement opérationnel dans le SMI</label>
          </div>

          <div className="flex gap-6 pt-8 border-t border-white/5">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-7 bg-slate-800 hover:bg-slate-700 rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all border-none cursor-pointer italic"
            >
              Interrompre
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-2 py-7 bg-blue-600 hover:bg-blue-500 rounded-3xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-4 transition-all shadow-2xl border-none cursor-pointer italic active:scale-95 shadow-blue-900/30"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />} 
              {type ? 'SCELLER LES MODIFICATIONS' : 'INITIALISER LA STRUCTURE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- HELPERS VISUELS ---
function Save(props: any) { return <CheckCircle {...props} />; }