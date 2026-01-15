/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Settings2, Plus, Trash2, Tag, Loader2, Save } from 'lucide-react';
import apiClient from '@/core/api/api-client';

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<'units' | 'processes' | 'risks'>('units');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ label: '', color: '#2563eb' });

  const config = {
    units: { endpoint: '/org-unit-types', title: 'Types d\'Unités', label: 'Ex: Direction, Service, Atelier' },
    processes: { endpoint: '/process-types', title: 'Types de Processus', label: 'Ex: Management, Support' },
    risks: { endpoint: '/risk-types', title: 'Types de Risques', label: 'Ex: Qualité, SSE, Environnement' }
  };

 // Remplace ta fonction fetchData par celle-ci
const fetchData = async () => {
  setLoading(true);
  try {
    const res = await apiClient.get(config[activeTab].endpoint);
    setData(res.data);
  } catch (err: any) {
    console.error("Erreur de chargement:", err);
    // ✅ Si le backend n'est pas prêt, on met une liste vide pour arrêter le clignotement
    setData([]); 
    alert("Le serveur ne répond pas. Vérifie que le contrôleur est bien enregistré.");
  } finally {
    // ✅ QUOI QU'IL ARRIVE, on arrête le chargement après 500ms
    setTimeout(() => setLoading(false), 500);
  }
};
  const handleAdd = async () => {
    if (!newItem.label) return;
    try {
      await apiClient.post(config[activeTab].endpoint, { 
        [activeTab === 'units' ? 'OUT_Label' : activeTab === 'processes' ? 'PT_Label' : 'RT_Label']: newItem.label,
        ...(activeTab === 'processes' && { PT_Color: newItem.color })
      });
      setNewItem({ label: '', color: '#2563eb' });
      fetchData();
    } catch (err) { alert("Erreur lors de l'ajout"); }
  };

  return (
    <div className="p-10 bg-slate-50 min-h-screen italic font-sans">
      <div className="mb-10">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-4">
          <Settings2 className="text-blue-600" size={40} /> Paramétrage Système
        </h1>
        <p className="text-slate-500 font-medium italic">Configurez les listes de référence de votre SMI.</p>
      </div>

      {/* TABS INDICATOR */}
      <div className="flex gap-4 mb-8">
        {(['units', 'processes', 'risks'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] transition-all ${
              activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-300'
            }`}
          >
            {config[tab].title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORMULAIRE D'AJOUT */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl h-fit">
          <h2 className="text-xs font-black uppercase mb-6 flex items-center gap-2">
            <Plus size={16} className="text-blue-600" /> Ajouter un {activeTab === 'units' ? 'Type d\'unité' : 'Type'}
          </h2>
          <div className="space-y-4">
            <input
              placeholder={config[activeTab].label}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500"
              value={newItem.label}
              onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
            />
            {activeTab === 'processes' && (
              <input 
                type="color" 
                className="w-full h-10 rounded-lg cursor-pointer"
                value={newItem.color}
                onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
              />
            )}
            <button 
              onClick={handleAdd}
              className="w-full bg-slate-900 text-white font-black uppercase py-4 rounded-xl text-[10px] flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
            >
              <Save size={14} /> Valider l&apos;option
            </button>
          </div>
        </div>

        {/* LISTE DES OPTIONS EXISTANTES */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-20 text-center"><Loader2 className="animate-spin inline text-blue-600" /></div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">Libellé affiché dans les listes</th>
                  {activeTab === 'processes' && <th className="px-8 py-5">Couleur</th>}
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item) => (
                  <tr key={item.PT_Id || item.OUT_Id || item.RT_Id} className="hover:bg-slate-50 transition-all">
                    <td className="px-8 py-5 flex items-center gap-3">
                      <Tag size={14} className="text-blue-500" />
                      <span className="text-xs font-black uppercase text-slate-800 tracking-tight">
                        {item.OUT_Label || item.PT_Label || item.RT_Label}
                      </span>
                    </td>
                    {activeTab === 'processes' && (
                      <td className="px-8 py-5">
                        <div className="w-6 h-6 rounded-full border border-slate-200" style={{ backgroundColor: item.PT_Color }}></div>
                      </td>
                    )}
                    <td className="px-8 py-5 text-right">
                      <button className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}