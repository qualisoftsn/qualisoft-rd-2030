/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { Plus, Edit3, Save, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ProcessusPage() {
  const [items, setItems] = useState<any[]>([]);
  const [collaborateurs, setCollaborateurs] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resP, resU, resT] = await Promise.all([
        apiClient.get('/processus'),
        apiClient.get('/gouvernance/auditors'), // Liste des pilotes
        apiClient.get('/process-types')
      ]);

      setItems(Array.isArray(resP.data) ? resP.data : []);
      setCollaborateurs(Array.isArray(resU.data) ? resU.data : []);
      setTypes(Array.isArray(resT.data) ? resT.data : []);
    } catch (e) {
      toast.error("Erreur de chargement des données.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      if (selected?.PR_Id) {
        await apiClient.patch(`/processus/${selected.PR_Id}`, payload);
      } else {
        await apiClient.post('/processus', payload);
      }
      setIsModalOpen(false);
      loadData();
      toast.success("Opération réussie");
    } catch (err) {
      toast.error("Échec de l'enregistrement");
    }
  };

  if (loading) return <div className="ml-72 h-screen flex items-center justify-center bg-[#0B0F1A] text-blue-500 font-bold">CHARGEMENT...</div>;

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white text-left font-sans italic">
      <header className="mb-12 flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic">Cartographie <span className="text-blue-600">SMI</span></h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase mt-3">{items.length} Processus détectés</p>
        </div>
        <button onClick={() => { setSelected(null); setIsModalOpen(true); }} className="bg-blue-600 px-10 py-5 rounded-3xl font-black uppercase text-xs">
          + Nouveau Processus
        </button>
      </header>

      {/* Tableau avec rubriques PR_Code et PR_Libelle */}
      <div className="bg-slate-900/40 border border-white/10 rounded-[3rem] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[9px] font-black uppercase text-slate-500 tracking-widest">
            <tr>
              <th className="px-8 py-6">Code</th>
              <th className="px-8 py-6">Désignation</th>
              <th className="px-8 py-6">Pilote Titulaire</th>
              <th className="px-8 py-6 text-right pr-12">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((pr) => (
              <tr key={pr.PR_Id} className="hover:bg-white/2">
                <td className="px-8 py-6 text-blue-500 font-black uppercase">{pr.PR_Code}</td>
                <td className="px-8 py-6">
                  <h4 className="text-lg font-black uppercase leading-none">{pr.PR_Libelle}</h4>
                  <p className="text-[8px] text-slate-600 uppercase mt-2">{pr.PR_Type?.PT_Label}</p>
                </td>
                <td className="px-8 py-6 text-xs font-black uppercase">
                  {pr.PR_Pilote?.U_FirstName} {pr.PR_Pilote?.U_LastName}
                </td>
                <td className="px-8 py-6 text-right pr-12">
                   <button onClick={() => { setSelected(pr); setIsModalOpen(true); }} className="p-3 bg-white/5 rounded-xl"><Edit3 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal avec PR_TypeId et PR_PiloteId */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-200 flex items-center justify-center">
          <form onSubmit={handleSubmit} className="bg-[#0B0F1A] border border-white/10 p-16 rounded-[4rem] w-full max-w-2xl relative shadow-4xl">
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white"><X size={32}/></button>
            <h2 className="text-5xl font-black uppercase italic mb-12">Config. <span className="text-blue-600 italic">SMI</span></h2>
            <div className="space-y-8">
                <input name="PR_Code" defaultValue={selected?.PR_Code} placeholder="CODE" className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase" required />
                <input name="PR_Libelle" defaultValue={selected?.PR_Libelle} placeholder="DÉSIGNATION" className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase" required />
                
                <select name="PR_TypeId" defaultValue={selected?.PR_TypeId} className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase" required>
                  <option value="">-- TYPE ISO --</option>
                  {types.map(t => <option key={t.PT_Id} value={t.PT_Id}>{t.PT_Label}</option>)}
                </select>

                <select name="PR_PiloteId" defaultValue={selected?.PR_PiloteId} className="w-full p-6 bg-white/5 border border-blue-600/30 rounded-2xl text-xs font-black uppercase text-blue-400" required>
                  <option value="">-- PILOTE RESPONSABLE --</option>
                  {collaborateurs.map(u => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
                </select>

                <button type="submit" className="w-full py-8 bg-blue-600 rounded-3xl font-black uppercase text-xs flex items-center justify-center gap-3">
                  <Save size={20}/> Valider la Cartographie
                </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}