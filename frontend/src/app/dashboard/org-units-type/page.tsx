/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Plus, Edit, Trash2, Loader2, Network, 
  Settings, CheckCircle, XCircle, ChevronRight,
  Layers, Palette, Info, Search, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- INTERFACES TECHNIQUES (§5.3) ---
interface OrgUnitType {
  OUT_Id: string;
  OUT_Label: string;
  OUT_Level: number;
  OUT_Description?: string;
  OUT_Color: string;
  OUT_IsActive: boolean;
}

export default function OrgUnitsTypePage() {
  const [types, setTypes] = useState<OrgUnitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États de la Modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<OrgUnitType | null>(null);

  const loadTypes = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/org-units-types');
      setTypes(res.data);
    } catch (error: any) {
      toast.error("Erreur de synchronisation du référentiel §5.3");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTypes(); }, []);

  // Filtrage intelligent
  const filteredTypes = useMemo(() => {
    return types.filter(t => 
      t.OUT_Label.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.OUT_Level - b.OUT_Level);
  }, [types, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ Suppression définitive ? Cela impactera l'arborescence des instances.")) return;
    try {
      await apiClient.delete(`/org-units-types/${id}`);
      toast.success("Type d'unité supprimé");
      loadTypes();
    } catch (e) {
      toast.error("Échec de la suppression : Entité liée existante");
    }
  };

  const openModal = (item: OrgUnitType | null = null) => {
    setEditingItem(item);
    setShowModal(true);
  };

  return (
    <div className="ml-72 min-h-screen bg-[#0B0F1A] text-white italic font-sans p-8">
      {/* HEADER STRATÉGIQUE */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Types <span className="text-purple-500">d&apos;Unités Organiques</span>
          </h1>
          <p className="text-slate-500 text-sm uppercase font-bold italic">
            ISO 9001 §5.3 : Rôles, responsabilités et autorités
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={loadTypes} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => openModal()}
            className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-black uppercase text-xs flex items-center gap-3 transition-all shadow-xl shadow-purple-900/20"
          >
            <Plus size={18} /> Nouvelle Unité
          </button>
        </div>
      </header>

      {/* BARRE DE RECHERCHE */}
      <div className="mb-8 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input 
          className="w-full bg-[#0F172A] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-purple-500/50 transition-all"
          placeholder="Rechercher dans la hiérarchie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* GRILLE DE RÉSULTATS */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="animate-spin text-purple-500 mb-4" size={40} />
          <p className="text-xs font-black uppercase text-slate-500 tracking-widest">Mapping organique en cours...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTypes.map((type) => (
            <div key={type.OUT_Id} className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 flex justify-between items-center group hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-5">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${type.OUT_Color}15`, color: type.OUT_Color }}
                >
                  <Network size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-black uppercase italic text-xl">{type.OUT_Label}</h3>
                    <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] text-slate-400 font-black italic">
                      LIV-0{type.OUT_Level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 italic max-w-md">
                    {type.OUT_Description || "Aucune spécification de rôle définie."}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => openModal(type)}
                  className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-purple-400 hover:bg-purple-400/10 transition-all"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(type.OUT_Id)}
                  className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE SAISIE INTÉGRALE */}
      {showModal && (
        <OrgUnitModal 
          item={editingItem}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); loadTypes(); }}
        />
      )}
    </div>
  );
}

// --- SOUS-COMPOSANT : MODAL DE GESTION ---
function OrgUnitModal({ item, onClose, onSuccess }: { item: OrgUnitType | null, onClose: () => void, onSuccess: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    OUT_Label: item?.OUT_Label || '',
    OUT_Level: item?.OUT_Level || 1,
    OUT_Description: item?.OUT_Description || '',
    OUT_Color: item?.OUT_Color || '#a855f7',
    OUT_IsActive: item?.OUT_IsActive ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (item) {
        await apiClient.patch(`/org-units-types/${item.OUT_Id}`, form);
        toast.success("Mise à jour du niveau hiérarchique validée");
      } else {
        await apiClient.post('/org-units-types', form);
        toast.success("Nouveau type d'unité organique déployé");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur de persistence des données");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B0F1A] border border-white/10 rounded-3xl max-w-xl w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-purple-600/20 text-purple-500 rounded-xl">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">
              {item ? "Configuration" : "Initialisation"} <span className="text-purple-500">Unité</span>
            </h2>
            <p className="text-[10px] text-slate-500 uppercase font-black">Référentiel Autorités & Responsabilités</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 italic font-bold">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase">Libellé de l&apos;unité</label>
            <input 
              required className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-purple-500 transition-all"
              placeholder="Ex: DIRECTION GÉNÉRALE, DÉPARTEMENT, SERVICE..."
              value={form.OUT_Label} onChange={e => setForm({...form, OUT_Label: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase">Niveau Hiérarchique</label>
              <input 
                type="number" min="1" max="10" required 
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-purple-500"
                value={form.OUT_Level} onChange={e => setForm({...form, OUT_Level: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase">Code Couleur</label>
              <div className="flex gap-2">
                <input 
                  type="color" className="w-12 h-12 bg-transparent border-none cursor-pointer"
                  value={form.OUT_Color} onChange={e => setForm({...form, OUT_Color: e.target.value})}
                />
                <input 
                  className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl text-xs uppercase"
                  value={form.OUT_Color} onChange={e => setForm({...form, OUT_Color: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase">Description du Périmètre</label>
            <textarea 
              rows={3} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-purple-500"
              placeholder="Définition des autorités et responsabilités rattachées..."
              value={form.OUT_Description} onChange={e => setForm({...form, OUT_Description: e.target.value})}
            />
          </div>

          <div className="flex items-center gap-3 py-2">
            <input 
              type="checkbox" id="isActive" checked={form.OUT_IsActive}
              onChange={e => setForm({...form, OUT_IsActive: e.target.checked})}
              className="w-5 h-5 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="isActive" className="text-xs uppercase text-slate-400">Cette unité est active dans le référentiel</label>
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="button" onClick={onClose}
              className="flex-1 py-4 bg-white/5 rounded-2xl font-black uppercase text-xs hover:bg-white/10 transition-all"
            >
              Annuler
            </button>
            <button 
              type="submit" disabled={saving}
              className="flex-2 py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-xl shadow-purple-900/30"
            >
              {saving ? <Loader2 className="animate-spin" /> : <><CheckCircle size={16}/> Enregistrer l&apos;Unité</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}