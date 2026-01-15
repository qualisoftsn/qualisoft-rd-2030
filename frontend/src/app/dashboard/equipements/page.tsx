/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';

/** * 🛠 CORRECTION IMPORT
 * Si cette ligne 11 cause toujours une erreur, vérifie que le dossier 
 * 'components/equipment' existe bien au singulier.
 */
import EquipmentModal from '../../../components/equipment/EquipmentModal';

import { 
  Settings2, Plus, Calendar, Trash2, Search, 
  Loader2, Edit3, ShieldAlert 
} from 'lucide-react';

export default function EquipmentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);

  const fetchEquipments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/equipments');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) { 
      console.error("Erreur chargement équipements:", err); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchEquipments(); }, [fetchEquipments]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer définitivement cet équipement du parc ?")) return;
    try {
      await apiClient.delete(`/equipments/${id}`);
      fetchEquipments();
    } catch (err) { 
      alert("Erreur lors de la suppression."); 
    }
  };

  const openEditModal = (eq: any) => {
    setSelectedEquipment(eq);
    setIsModalOpen(true);
  };

  const getVGPStatus = (date: string) => {
    const today = new Date();
    const vgpDate = new Date(date);
    const diffDays = Math.ceil((vgpDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'EXPIRÉ', class: 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse' };
    if (diffDays < 30) return { label: 'ALERTE', class: 'bg-orange-500/20 text-orange-500 border-orange-500/30' };
    return { label: 'CONFORME', class: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' };
  };

  const filteredItems = items.filter(i => 
    (i.EQ_Name?.toLowerCase().includes(search.toLowerCase())) || 
    (i.EQ_Reference?.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A]">
      <div className="text-center space-y-4">
        <Loader2 className="animate-spin text-blue-500 mx-auto" size={40} />
        <p className="text-[10px] font-black uppercase italic text-white tracking-widest">Initialisation du parc machines...</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-8 ml-72 text-white">
      <div className="max-w-7xl mx-auto space-y-10">
        
        <header className="flex justify-between items-end border-b border-white/5 pb-8">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white leading-none">
                Parc <span className="text-blue-500">Équipements</span>
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-3 italic">
                Asset Management • Maintenance & VGP
            </p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" placeholder="Référence, Nom..." 
                className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold outline-none w-64 focus:ring-2 focus:ring-blue-600 transition-all text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setSelectedEquipment(null); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs shadow-lg flex items-center gap-3 transition-all"
            >
              <Plus size={20} /> Nouveau Matériel
            </button>
          </div>
        </header>

        <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase text-slate-500 italic">
                <th className="p-8">Référence</th>
                <th className="p-8">Désignation</th>
                <th className="p-8">Vérification VGP</th>
                <th className="p-8">Statut</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map((eq) => {
                const vgp = getVGPStatus(eq.EQ_ProchaineVGP);
                return (
                  <tr key={eq.EQ_Id} className="hover:bg-white/2 transition-colors group">
                    <td className="p-8 font-black text-blue-500 text-sm italic tracking-tighter">{eq.EQ_Reference}</td>
                    <td className="p-8">
                      <p className="font-bold uppercase text-xs text-white">{eq.EQ_Name}</p>
                      <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase italic">Mise en service: {new Date(eq.EQ_DateService).toLocaleDateString()}</p>
                    </td>
                    <td className="p-8">
                      <div className={`px-4 py-2 rounded-xl text-[10px] font-black inline-flex items-center gap-2 border ${vgp.class}`}>
                        <Calendar size={12} /> {vgp.label} : {new Date(eq.EQ_ProchaineVGP).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-8">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${eq.EQ_Status === 'OPERATIONNEL' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {eq.EQ_Status}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(eq)} className="p-3 bg-white/5 hover:bg-blue-600 rounded-xl transition-all text-slate-400 hover:text-white">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(eq.EQ_Id)} className="p-3 bg-white/5 hover:bg-red-600 rounded-xl transition-all text-slate-400 hover:text-white">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <EquipmentModal 
          equipment={selectedEquipment} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchEquipments} 
        />
      )}
    </div>
  );
}