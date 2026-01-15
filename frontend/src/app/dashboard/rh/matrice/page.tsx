/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Plus, X, Save, Trash2, Loader2, Star, 
  LayoutGrid, RefreshCcw, AlertCircle, Sparkles
} from 'lucide-react';

export default function MatriceCompetencesPage() {
  const [data, setData] = useState<{ users: any[], competences: any[] }>({ users: [], competences: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComp, setNewComp] = useState({ CP_Name: '', CP_NiveauRequis: 3 });
  const [tenantId, setenantId] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setenantId(user.tenantId);
    }
  }, []);

  const fetchMatrix = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/competences/matrix`);
      setData(res.data);
    } catch (err) {
      console.error("Erreur de chargement isolée");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchMatrix(); }, [fetchMatrix]);

  const handleUpdateLevel = async (userId: string, compId: string, currentLevel: number) => {
    const nextLevel = currentLevel >= 4 ? 0 : currentLevel + 1;
    try {
      await apiClient.post('/competences/evaluate', { userId, compId, level: nextLevel });
      fetchMatrix();
    } catch (err) { console.error("Erreur évaluation"); }
  };

  const handleCreateComp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/competences', newComp);
      setIsModalOpen(false);
      setNewComp({ CP_Name: '', CP_NiveauRequis: 3 });
      fetchMatrix();
    } catch (err: any) { alert("Erreur de création"); }
  };

  const handleDeleteComp = async (id: string) => {
    if (!confirm("Supprimer cette compétence ?")) return;
    try {
      await apiClient.delete(`/competences/${id}`);
      fetchMatrix();
    } catch (err) { alert("Erreur suppression"); }
  };

  const getLevelStyle = (actual: number, required: number) => {
    if (actual === 0) return 'bg-white/5 text-slate-700 border-white/5 opacity-40';
    if (actual < required) return 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse';
    if (actual === required) return 'bg-blue-600/20 text-blue-400 border-blue-500/40';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-black scale-105 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
  };

  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
      <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-widest text-center">
        Analyse GPEC en cours...<br/>Isolation des données Tenant
      </p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* HEADER : Aligné sur le Dashboard */}
      <header className="flex justify-between items-end border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 text-blue-400 mb-4 italic">
            <LayoutGrid size={16} />
            <span className="text-[11px] font-black uppercase tracking-[0.5em]">Ressources Humaines</span>
          </div>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none text-white">
            Matrice <span className="text-blue-600">GPEC</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-4 flex items-center gap-3">
             Cartographie des habilitations & Conformité ISO 9001
          </p>
        </div>

        <div className="flex gap-4">
          <button onClick={fetchMatrix} className="p-5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
            <RefreshCcw size={20} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-5 rounded-4xl font-black uppercase italic text-xs shadow-2xl shadow-blue-900/40 flex items-center gap-3 transition-all active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> Nouvelle Compétence
          </button>
        </div>
      </header>

      {/* TABLEAU DE LA MATRICE */}
      <div className="bg-slate-900/30 border border-white/5 rounded-[3.5rem] overflow-hidden shadow-3xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="p-10 text-[11px] font-black uppercase text-slate-500 sticky left-0 bg-[#0F172A] z-20 w-80 border-r border-white/5 italic">
                  Collaborateurs
                </th>
                {data.competences.map(comp => (
                  <th key={comp.CP_Id} className="p-8 border-l border-white/5 group relative min-w-40 text-center">
                    <span className="text-[10px] font-black uppercase text-slate-300 block mb-4 group-hover:text-blue-500 transition-colors italic">
                      {comp.CP_Name}
                    </span>
                    <div className="inline-block bg-blue-500/10 text-blue-500 text-[8px] font-black px-3 py-1 rounded-lg border border-blue-500/20 uppercase tracking-tighter">
                      Req: Niveau {comp.CP_NiveauRequis}
                    </div>
                    <button 
                      onClick={() => handleDeleteComp(comp.CP_Id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500 p-2 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.users.length > 0 ? data.users.map(user => (
                <tr key={user.U_Id} className="group hover:bg-blue-600/5 transition-colors">
                  <td className="p-8 sticky left-0 bg-[#0F172A] z-10 border-r border-white/5 group-hover:bg-[#161e31] transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-[10px] font-black text-blue-500 border border-white/10 italic">
                          {user.U_FirstName[0]}{user.U_LastName[0]}
                       </div>
                       <div>
                          <p className="font-black uppercase italic text-sm text-white leading-none">{user.U_FirstName} {user.U_LastName}</p>
                          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">{user.U_Role}</p>
                       </div>
                    </div>
                  </td>
                  {data.competences.map(comp => {
                    const evalUser = user.U_Competences?.find((uc: any) => uc.UC_CompetenceId === comp.CP_Id);
                    const level = evalUser?.UC_NiveauActuel || 0;
                    return (
                      <td key={comp.CP_Id} className="p-6 text-center border-l border-white/5">
                        <button 
                          onClick={() => handleUpdateLevel(user.U_Id, comp.CP_Id, level)}
                          className={`mx-auto w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all border-2 relative group/btn ${getLevelStyle(level, comp.CP_NiveauRequis)}`}
                        >
                          <span className="text-xl font-black italic">{level}</span>
                          {level > comp.CP_NiveauRequis && (
                            <div className="absolute -top-2 -right-2">
                              <Star size={14} className="text-emerald-500 fill-emerald-500 drop-shadow-lg" />
                            </div>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              )) : (
                <tr>
                  <td colSpan={data.competences.length + 1} className="p-20 text-center text-slate-600">
                    <AlertCircle className="mx-auto mb-4 opacity-20" size={48} />
                    <p className="font-black uppercase italic tracking-widest text-xs">Aucun collaborateur trouvé</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL : Aligné sur le design Elite */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-100 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-md rounded-[3rem] p-12 shadow-3xl">
            <div className="flex justify-between items-center mb-10 text-blue-500">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Nouveau <span className="text-white">Savoir</span></h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateComp} className="space-y-8 italic">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 block ml-1 tracking-widest">Désignation Technique</label>
                <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold outline-none focus:border-blue-500 transition-all text-sm" 
                  value={newComp.CP_Name} 
                  onChange={(e) => setNewComp({...newComp, CP_Name: e.target.value})}
                  placeholder="Ex: Audit Interne ISO 9001"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 block ml-1 tracking-widest">Niveau Requis (1-4)</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold outline-none text-sm appearance-none"
                  value={newComp.CP_NiveauRequis}
                  onChange={(e) => setNewComp({...newComp, CP_NiveauRequis: parseInt(e.target.value)})}
                >
                  {[1,2,3,4].map(n => <option key={n} value={n} className="bg-[#0F172A]">Niveau {n}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 py-6 rounded-2xl font-black uppercase flex items-center justify-center gap-3 hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40 active:scale-95">
                <Save size={20} /> Enregistrer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}