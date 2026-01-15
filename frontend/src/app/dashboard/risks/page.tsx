/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  AlertOctagon, Loader2, Plus, X, Trash2, Edit3, ShieldCheck, Save, Search
} from 'lucide-react';

export default function RiskGridPage() {
  const [processusList, setProcessusList] = useState<any[]>([]);
  const [riskTypes, setRiskTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Etat du formulaire aligné sur ton Excel SE_IT
  const [formData, setFormData] = useState({
    RS_Libelle: '', 
    RS_Activite: '', 
    RS_Tache: '', 
    RS_Causes: '',
    RS_Probabilite: 1, 
    RS_Gravite: 1, 
    RS_Maitrise: 1,
    RS_ProcessusId: '', 
    RS_TypeId: '', 
    RS_Status: 'IDENTIFIE',
    RS_Mesures: '', 
    RS_Acteurs: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resProc, resTypes, resRisks] = await Promise.all([
        apiClient.get('/processus'),
        apiClient.get('/risk-types'),
        apiClient.get('/risks/heatmap')
      ]);

      // Mapping pour afficher tous les processus, même ceux sans risques (grille vide)
      const mappedData = resProc.data.map((proc: any) => ({
        ...proc,
        risks: resRisks.data.filter((r: any) => r.RS_ProcessusId === proc.PR_Id)
      }));

      setProcessusList(mappedData);
      setRiskTypes(resTypes.data);
    } catch (err) {
      console.error("Erreur de synchronisation des données");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreate = (procId: string) => {
    setEditingId(null);
    setFormData({ 
      RS_Libelle: '', RS_Activite: '', RS_Tache: '', RS_Causes: '',
      RS_Probabilite: 1, RS_Gravite: 1, RS_Maitrise: 1,
      RS_ProcessusId: procId, RS_TypeId: riskTypes[0]?.RT_Id || '',
      RS_Status: 'IDENTIFIE', RS_Mesures: '', RS_Acteurs: '' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (risk: any) => {
    setEditingId(risk.RS_Id);
    setFormData({
      RS_Libelle: risk.RS_Libelle, RS_Activite: risk.RS_Activite || '', 
      RS_Tache: risk.RS_Tache || '', RS_Causes: risk.RS_Causes || '',
      RS_Probabilite: risk.RS_Probabilite, RS_Gravite: risk.RS_Gravite, 
      RS_Maitrise: risk.RS_Maitrise || 1,
      RS_ProcessusId: risk.RS_ProcessusId, RS_TypeId: risk.RS_TypeId,
      RS_Status: risk.RS_Status, RS_Mesures: risk.RS_Mesures || '', 
      RS_Acteurs: risk.RS_Acteurs || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await apiClient.patch(`/risks/${editingId}`, formData);
      else await apiClient.post('/risks', formData);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Erreur lors de l'enregistrement. Vérifiez que le champ Maîtrise existe en base.");
    }
  };

  if (loading) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white italic text-left font-sans relative">
      
      {/* NOUVEAU TITRE DEMANDÉ */}
      <header className="mb-16 border-b border-white/5 pb-10">
        <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
          Pilotage <span className="text-red-600">Risques</span>
        </h1>
        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-4 italic">
          Grille de Management SE_IT • Calcul P x G x M
        </p>
      </header>

      <div className="space-y-24">
        {processusList.map((proc) => (
          <section key={proc.PR_Id} className="group">
            <div className="flex justify-between items-end mb-6 border-l-4 border-red-600 pl-6">
              <div>
                <span className="text-red-500 font-black text-[10px] uppercase tracking-widest">{proc.PR_Code}</span>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">{proc.PR_Libelle}</h2>
              </div>
              <button 
                onClick={() => handleOpenCreate(proc.PR_Id)}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all shadow-lg shadow-red-900/20"
              >
                <Plus size={16} strokeWidth={3} /> Identifier un risque
              </button>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-x-auto backdrop-blur-sm">
              <table className="w-full text-left min-w-300">
                <thead>
                  <tr className="bg-white/5 text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">
                    <th className="p-8">Identification (Activité / Danger)</th>
                    <th className="p-8 text-center">P</th>
                    <th className="p-8 text-center">G</th>
                    <th className="p-8 text-center">M</th>
                    <th className="p-8 text-center">Criticité</th>
                    <th className="p-8">Mesures & Acteurs</th>
                    <th className="p-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {proc.risks?.length > 0 ? proc.risks.map((risk: any) => (
                    <tr key={risk.RS_Id} className="group/row hover:bg-white/2 transition-colors">
                      <td className="p-8">
                        <span className="text-[8px] font-black text-blue-500 uppercase block mb-1">{risk.RS_Activite || 'ACTIVITÉ NON DÉFINIE'}</span>
                        <span className="text-lg font-black uppercase italic tracking-tight">{risk.RS_Libelle}</span>
                        <p className="text-[9px] text-slate-500 mt-1 uppercase italic line-clamp-1">{risk.RS_Causes}</p>
                      </td>
                      <td className="p-8 text-center font-black italic text-slate-400">P{risk.RS_Probabilite}</td>
                      <td className="p-8 text-center font-black italic text-red-500">G{risk.RS_Gravite}</td>
                      <td className="p-8 text-center font-black italic text-blue-500">M{risk.RS_Maitrise || 1}</td>
                      <td className="p-8 text-center">
                        <span className={`text-4xl font-black italic tracking-tighter ${risk.RS_Score >= 12 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                          {risk.RS_Score}
                        </span>
                      </td>
                      <td className="p-8 max-w-xs">
                         <p className="text-[10px] font-bold text-slate-400 italic mb-1 line-clamp-2">{risk.RS_Mesures}</p>
                         <p className="text-[8px] font-black text-slate-600 uppercase">{risk.RS_Acteurs}</p>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenEdit(risk)} className="p-2 bg-white/5 hover:bg-blue-600 rounded-lg"><Edit3 size={14}/></button>
                          <button onClick={async () => { if(confirm("Supprimer ?")) { await apiClient.delete(`/risks/${risk.RS_Id}`); fetchData(); } }} className="p-2 bg-white/5 hover:bg-red-600 rounded-lg"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="p-20 text-center opacity-20">
                        <ShieldCheck size={60} className="mx-auto mb-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Aucun risque pour ce processus</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      {/* MODAL DE SAISIE SE_IT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-200 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 text-left">
          <form onSubmit={handleSubmit} className="bg-[#0B0F1A] border border-white/10 p-14 rounded-[4rem] w-full max-w-5xl shadow-2xl relative animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white"><X size={32}/></button>
            <h2 className="text-5xl font-black uppercase italic mb-10 text-white">Analyse <span className="text-red-500">Risque</span></h2>

            <div className="grid grid-cols-3 gap-8 italic font-black">
              <div className="col-span-1 space-y-2">
                <label className="text-[9px] uppercase text-slate-500 ml-2">Activité liée</label>
                <input className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl text-sm text-white outline-none focus:border-red-500 uppercase" value={formData.RS_Activite} onChange={e => setFormData({...formData, RS_Activite: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[9px] uppercase text-slate-500 ml-2">Désignation du Danger / Risque</label>
                <input required className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl text-sm text-white outline-none focus:border-red-500 uppercase" value={formData.RS_Libelle} onChange={e => setFormData({...formData, RS_Libelle: e.target.value})} />
              </div>

              <div className="col-span-3 space-y-2">
                <label className="text-[9px] uppercase text-slate-500 ml-2">Causes / Evènements déclencheurs</label>
                <textarea className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl text-xs text-white outline-none focus:border-red-500 italic h-20" value={formData.RS_Causes} onChange={e => setFormData({...formData, RS_Causes: e.target.value})} />
              </div>

              <div className="space-y-4 bg-white/5 p-8 rounded-[2.5rem] border border-white/5 text-center">
                <label className="text-[9px] uppercase text-slate-400">Probabilité (P)</label>
                <input type="number" min="1" max="4" className="bg-transparent text-5xl w-full text-center outline-none" value={formData.RS_Probabilite} onChange={e => setFormData({...formData, RS_Probabilite: parseInt(e.target.value)})} />
              </div>

              <div className="space-y-4 bg-white/5 p-8 rounded-[2.5rem] border border-white/5 text-center">
                <label className="text-[9px] uppercase text-red-500">Gravité (G)</label>
                <input type="number" min="1" max="4" className="bg-transparent text-5xl w-full text-center outline-none text-red-500" value={formData.RS_Gravite} onChange={e => setFormData({...formData, RS_Gravite: parseInt(e.target.value)})} />
              </div>

              <div className="space-y-4 bg-white/5 p-8 rounded-[2.5rem] border border-white/5 text-center">
                <label className="text-[9px] uppercase text-emerald-400">Maîtrise (M)</label>
                <input type="number" min="1" max="4" className="bg-transparent text-5xl w-full text-center outline-none text-emerald-400" value={formData.RS_Maitrise} onChange={e => setFormData({...formData, RS_Maitrise: parseInt(e.target.value)})} />
              </div>

              <div className="col-span-3 p-8 bg-red-600/10 border border-red-500/30 rounded-3xl flex justify-between items-center">
                <span className="text-xs uppercase text-red-500 italic">Score de Criticité (P x G x M)</span>
                <span className="text-7xl tracking-tighter text-red-500 italic">R = {formData.RS_Probabilite * formData.RS_Gravite * formData.RS_Maitrise}</span>
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-[9px] uppercase text-slate-500 ml-2">Mesures Préventives</label>
                <textarea className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl text-xs h-24 outline-none focus:border-red-500 italic" value={formData.RS_Mesures} onChange={e => setFormData({...formData, RS_Mesures: e.target.value})} />
              </div>
              <div className="col-span-1 space-y-2">
                <label className="text-[9px] uppercase text-slate-500 ml-2">Acteurs Impliqués</label>
                <textarea className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl text-[9px] h-24 outline-none focus:border-red-500 uppercase italic" value={formData.RS_Acteurs} onChange={e => setFormData({...formData, RS_Acteurs: e.target.value})} />
              </div>

              <button type="submit" className="col-span-3 py-8 bg-red-600 hover:bg-red-500 rounded-[2.5rem] text-xs uppercase shadow-2xl tracking-[0.5em] border border-white/10 flex items-center justify-center gap-4">
                <Save size={20} /> {editingId ? 'Mettre à jour l\'analyse' : 'Enregistrer au registre SE_IT'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}