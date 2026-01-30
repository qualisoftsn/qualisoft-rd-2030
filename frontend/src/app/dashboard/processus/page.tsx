/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { Plus, Edit3, Save, X, Loader2, Target, ShieldCheck, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ProcessusPage() {
  const [items, setItems] = useState<any[]>([]);
  const [collaborateurs, setCollaborateurs] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  // État local du formulaire pour une validation réactive
  const [formData, setFormData] = useState({
    PR_Code: '',
    PR_Libelle: '',
    PR_TypeId: '',
    PR_PiloteId: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resP, resU, resT] = await Promise.all([
        apiClient.get('/processus'),
        apiClient.get('/gouvernance/auditors'), 
        apiClient.get('/processus-types') // Aligné sur le contrôleur NestJS
      ]);

      setItems(Array.isArray(resP.data) ? resP.data : []);
      setCollaborateurs(Array.isArray(resU.data) ? resU.data : []);
      setTypes(Array.isArray(resT.data) ? resT.data : []);
    } catch (e) {
      toast.error("Erreur de synchronisation (§4.4)");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Synchronisation du formulaire lors de la sélection
  useEffect(() => {
    if (selected) {
      setFormData({
        PR_Code: selected.PR_Code || '',
        PR_Libelle: selected.PR_Libelle || '',
        PR_TypeId: selected.PR_TypeId || '',
        PR_PiloteId: selected.PR_PiloteId || ''
      });
    } else {
      setFormData({ PR_Code: '', PR_Libelle: '', PR_TypeId: '', PR_PiloteId: '' });
    }
  }, [selected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (selected?.PR_Id) {
        // Mode ÉDITION
        await apiClient.patch(`/processus/${selected.PR_Id}`, formData);
        toast.success("Mise à jour du processus validée");
      } else {
        // Mode CRÉATION
        await apiClient.post('/processus', formData);
        toast.success("Nouveau processus intégré à la cartographie");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Échec de l'enregistrement technique";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 italic">
      <Loader2 className="animate-spin mb-4" size={48} />
      <span className="font-black uppercase tracking-widest text-xs">Lecture du SMI en cours...</span>
    </div>
  );

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white text-left font-sans italic">
      <header className="mb-12 flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic">
            Cartographie <span className="text-blue-600">SMI</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase mt-3 tracking-[0.3em]">
            ISO 9001 §4.4 : {items.length} Processus opérationnels
          </p>
        </div>
        <button 
          onClick={() => { setSelected(null); setIsModalOpen(true); }} 
          className="bg-blue-600 hover:bg-blue-500 transition-all px-10 py-5 rounded-3xl font-black uppercase text-xs flex items-center gap-3 shadow-2xl shadow-blue-900/20"
        >
          <Plus size={18} /> Nouveau Processus
        </button>
      </header>

      {/* TABLEAU DE BORD DES PROCESSUS */}
      <div className="bg-slate-900/40 border border-white/10 rounded-[3rem] overflow-hidden backdrop-blur-md">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[9px] font-black uppercase text-slate-500 tracking-widest">
            <tr>
              <th className="px-8 py-6">Code ID</th>
              <th className="px-8 py-6">Désignation Processus</th>
              <th className="px-8 py-6">Pilote Responsable</th>
              <th className="px-8 py-6 text-right pr-12">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-bold">
            {items.map((pr) => (
              <tr key={pr.PR_Id} className="hover:bg-white/2 transition-colors">
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-blue-600/10 text-blue-500 border border-blue-600/20 rounded-lg text-xs font-black uppercase">
                    {pr.PR_Code}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <h4 className="text-lg font-black uppercase leading-none mb-1">{pr.PR_Libelle}</h4>
                  <div className="flex items-center gap-2 text-[8px] text-slate-500 uppercase">
                    <Layers size={10} /> {pr.PR_Type?.PT_Label || 'Type non défini'}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-300">
                    <ShieldCheck size={14} className="text-blue-600" />
                    {pr.PR_Pilote?.U_FirstName} {pr.PR_Pilote?.U_LastName}
                  </div>
                </td>
                <td className="px-8 py-6 text-right pr-12">
                   <button 
                     onClick={() => { setSelected(pr); setIsModalOpen(true); }} 
                     className="p-3 bg-white/5 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-slate-400"
                   >
                     <Edit3 size={16}/>
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL : CONFIGURATION DU PROCESSUS (§4.4) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-100 flex items-center justify-center p-6">
          <div className="bg-[#0B0F1A] border border-white/10 p-12 md:p-16 rounded-[4rem] w-full max-w-2xl relative shadow-4xl animate-in zoom-in-95 duration-300">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-10 right-10 text-slate-500 hover:text-white transition-colors"
            >
              <X size={32}/>
            </button>

            <div className="mb-12">
              <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
                Config. <span className="text-blue-600 italic">SMI</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-widest">
                {selected ? 'Modification du processus existant' : 'Initialisation d\'un nouveau processus métier'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-600 uppercase ml-4 italic">Identification du code</label>
                  <input 
                    value={formData.PR_Code} 
                    onChange={e => setFormData({...formData, PR_Code: e.target.value.toUpperCase()})}
                    placeholder="EX: PR-01" 
                    className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl text-xs font-black uppercase outline-none focus:border-blue-600 transition-all" 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-600 uppercase ml-4 italic">Désignation officielle (§4.4)</label>
                  <input 
                    value={formData.PR_Libelle} 
                    onChange={e => setFormData({...formData, PR_Libelle: e.target.value})}
                    placeholder="DÉSIGNATION DU PROCESSUS" 
                    className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl text-xs font-black uppercase outline-none focus:border-blue-600 transition-all" 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-600 uppercase ml-4 italic">Famille de processus</label>
                  <select 
                    value={formData.PR_TypeId} 
                    onChange={e => setFormData({...formData, PR_TypeId: e.target.value})}
                    className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl text-xs font-black uppercase outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer" 
                    required
                  >
                    <option value="">-- TYPE ISO 9001 --</option>
                    {types.map(t => <option key={t.PT_Id} value={t.PT_Id}>{t.PT_Label}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-600 uppercase ml-4 italic">Pilote du processus (Titulaire)</label>
                  <select 
                    value={formData.PR_PiloteId} 
                    onChange={e => setFormData({...formData, PR_PiloteId: e.target.value})}
                    className="w-full p-6 bg-white/5 border border-blue-600/30 rounded-3xl text-xs font-black uppercase text-blue-400 outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer" 
                    required
                  >
                    <option value="">-- CHOISIR LE PILOTE --</option>
                    {collaborateurs.map(u => (
                      <option key={u.U_Id} value={u.U_Id}>
                        {u.U_FirstName} {u.U_LastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-8 bg-blue-600 hover:bg-blue-500 rounded-4xl font-black uppercase text-xs flex items-center justify-center gap-4 transition-all shadow-xl shadow-blue-900/40 mt-6"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Save size={20}/> 
                    {selected ? 'Valider les modifications' : 'Inscrire à la cartographie'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}