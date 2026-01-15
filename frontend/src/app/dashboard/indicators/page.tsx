/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Loader2, Send, Lock, Save, Layers, CheckCircle2, RotateCcw, Activity, 
  Edit3, Trash2, Plus, X, TableProperties, LayoutDashboard, AlertTriangle, Clock
} from 'lucide-react';

const MOIS = [
  { id: 1, name: 'Janvier' }, { id: 2, name: 'Février' }, { id: 3, name: 'Mars' },
  { id: 4, name: 'Avril' }, { id: 5, name: 'Mai' }, { id: 6, name: 'Juin' },
  { id: 7, name: 'Juillet' }, { id: 8, name: 'Août' }, { id: 9, name: 'Septembre' },
  { id: 10, name: 'Octobre' }, { id: 11, name: 'Novembre' }, { id: 12, name: 'Décembre' }
];

export default function IndicatorsPage() {
  const [activeTab, setActiveTab] = useState<'saisie' | 'matrice'>('saisie');
  const [groups, setGroups] = useState<any[]>([]);
  const [annualData, setAnnualData] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [period, setPeriod] = useState({ month: new Date().getMonth() + 1, year: currentYear });
  const [tempValues, setTempValues] = useState<{ [key: string]: number }>({});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInd, setEditingInd] = useState<any>(null);
  const [formInd, setFormInd] = useState({ IND_Code: '', IND_Libelle: '', IND_Cible: '', IND_Unite: '%', IND_ProcessusId: '', IND_Frequence: 'MENSUEL' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resGrid, resProc] = await Promise.all([
        apiClient.get(`/indicators/monthly-grid`, { params: { ...period } }),
        apiClient.get('/processus')
      ]);
      setGroups(resGrid.data);
      setProcesses(resProc.data);
      if (activeTab === 'matrice') {
        const resAnn = await apiClient.get(`/indicators/annual-matrix`, { params: { year: period.year } });
        setAnnualData(resAnn.data);
      }
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [period, activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBulkSave = async (processId: string) => {
    const valuesToSave = Object.keys(tempValues).map(id => ({ indicatorId: id, value: tempValues[id] }));
    if (valuesToSave.length === 0) return;
    try {
      await apiClient.post('/indicators/bulk-save', { values: valuesToSave, ...period });
      setTempValues({});
      fetchData();
    } catch (err) { alert("Action impossible (Délai dépassé ou verrouillage)."); }
  };

  const triggerWorkflow = async (action: 'submit' | 'validate' | 'reject', processId: string) => {
    if (!confirm(`Confirmer l'opération ?`)) return;
    try {
      if (action === 'submit') await handleBulkSave(processId);
      await apiClient.post(`/indicators/${action}/${processId}`, { ...period });
      fetchData();
    } catch (err) { alert("Erreur."); }
  };

  const handleSaveIndicator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInd) await apiClient.put(`/indicators/${editingInd.id}`, formInd);
      else await apiClient.post('/indicators', formInd);
      setIsModalOpen(false);
      setEditingInd(null);
      setFormInd({ IND_Code: '', IND_Libelle: '', IND_Cible: '', IND_Unite: '%', IND_ProcessusId: '', IND_Frequence: 'MENSUEL' });
      fetchData();
    } catch (err) { alert("Erreur d'enregistrement."); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0B0F1A] text-white italic font-black uppercase tracking-widest"><Loader2 className="animate-spin mr-3 text-blue-500" /> Pilotage IP...</div>;

  const isRQ = user?.U_Role === 'ADMIN';

  return (
    <div className="p-8 space-y-12 italic bg-[#0B0F1A] min-h-screen text-white pb-32">
      {/* HEADER */}
      <header className="flex justify-between items-end border-b border-white/5 pb-10">
        <div className="space-y-6">
          <div className="flex bg-slate-900 border border-white/10 p-1 rounded-2xl w-fit">
            <button onClick={() => setActiveTab('saisie')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'saisie' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><LayoutDashboard size={14} /> Saisie</button>
            <button onClick={() => setActiveTab('matrice')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'matrice' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><TableProperties size={14} /> Matrice</button>
          </div>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter">
            {activeTab === 'saisie' ? MOIS.find(m => m.id === period.month)?.name : 'Analyse'} <span className="text-blue-600">{period.year}</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-900 border border-white/10 rounded-2xl p-1 shadow-inner">
            <select value={period.month} onChange={(e) => setPeriod({...period, month: parseInt(e.target.value)})} className="bg-transparent p-4 text-[11px] font-black uppercase outline-none text-blue-400 cursor-pointer">{MOIS.map(m => <option key={m.id} value={m.id} className="bg-slate-900">{m.name}</option>)}</select>
            <select value={period.year} onChange={(e) => setPeriod({...period, year: parseInt(e.target.value)})} className="bg-transparent p-4 text-[11px] font-black uppercase outline-none text-white cursor-pointer">{[currentYear-1, currentYear, currentYear+1].map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}</select>
          </div>
          {isRQ && (
            <button onClick={() => { setEditingInd(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-3 shadow-2xl active:scale-95 transition-all">
              <Plus size={18} /> NOUVEL IP
            </button>
          )}
        </div>
      </header>

      {/* VUE SAISIE */}
      {activeTab === 'saisie' && (
        <div className="space-y-20">
          {groups.map((group) => {
            const isLate = group.isDeadlineExceeded;
            const status = group.indicators[0]?.entry?.IV_Status || 'BROUILLON';
            const isValide = status === 'VALIDE';
            const canSubmit = (isRQ || !isLate) && status === 'BROUILLON';

            return (
              <section key={group.processId} className="space-y-6">
                <div className="flex justify-between items-center px-8">
                  <div className="flex items-center gap-4">
                    <Layers size={22} className="text-blue-600" />
                    <h2 className="text-2xl font-black uppercase italic tracking-widest">{group.processLabel}</h2>
                    {isLate && !isValide && <div className="text-red-500 text-[10px] font-black uppercase flex items-center gap-2 px-4 py-1 rounded-full bg-red-500/10 border border-red-500/20 animate-pulse"><AlertTriangle size={12}/> Délai dépassé</div>}
                  </div>
                  <div className="flex gap-4">
                    {canSubmit && <button onClick={() => triggerWorkflow('submit', group.processId)} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg"><Send size={14} className="inline mr-2" /> Transmettre</button>}
                    {isRQ && status === 'SOUMIS' && (
                      <div className="flex gap-3">
                        <button onClick={() => triggerWorkflow('reject', group.processId)} className="bg-red-600/10 text-red-500 border border-red-500/20 px-6 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all"><RotateCcw size={14} className="inline mr-2" /> Renvoyer</button>
                        <button onClick={() => triggerWorkflow('validate', group.processId)} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all"><CheckCircle2 size={14} className="inline mr-2" /> Valider</button>
                      </div>
                    )}
                    {(isValide || (isLate && !isRQ)) && <div className="bg-white/5 text-slate-500 border border-white/10 px-8 py-3 rounded-xl font-black text-[10px] uppercase italic"><Lock size={14} className="inline mr-2" /> Verrouillé</div>}
                  </div>
                </div>

                <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-hidden backdrop-blur-md shadow-2xl">
                  <table className="w-full text-left">
                    <thead><tr className="bg-white/5 text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]"><th className="p-8">IP / Périodicité</th><th className="p-8 text-center">Cible</th><th className="p-8 text-center">Réalisé</th>{isRQ && <th className="p-8 text-right">Actions</th>}</tr></thead>
                    <tbody className="divide-y divide-white/5">
                      {group.indicators.map((ind: any) => {
                        const canType = isRQ || (!isLate && ind.doitEtreSaisi && status === 'BROUILLON');
                        return (
                          <tr key={ind.id} className={`group ${!ind.doitEtreSaisi && !isRQ ? 'opacity-30 bg-black/10' : ''}`}>
                            <td className="p-8">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black text-blue-500 uppercase">{ind.code}</span>
                                <span className="flex items-center gap-1 text-[7px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-black">
                                    <Clock size={8} /> {ind.frequence}
                                </span>
                              </div>
                              <span className="text-sm font-black text-white uppercase italic tracking-tight">{ind.label}</span>
                            </td>
                            <td className="p-8 text-center font-black text-slate-500 italic">{ind.target} {ind.unit}</td>
                            <td className="p-8 text-center">
                              <input 
                                type="number" 
                                disabled={!canType} 
                                defaultValue={ind.entry.IV_Actual} 
                                placeholder={!ind.doitEtreSaisi ? "HORS PÉR." : "---"}
                                onChange={(e) => setTempValues({...tempValues, [ind.id]: parseFloat(e.target.value)})}
                                className={`w-36 bg-slate-950/50 border ${!canType ? 'border-transparent text-slate-600' : 'border-white/10 focus:border-blue-600'} rounded-2xl p-4 text-center font-black text-2xl outline-none transition-all shadow-inner`}
                              />
                            </td>
                            {isRQ && (
                              <td className="p-8 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => { setEditingInd(ind); setFormInd({ IND_Code: ind.code, IND_Libelle: ind.label, IND_Cible: ind.target, IND_Unite: ind.unit, IND_ProcessusId: group.processId, IND_Frequence: ind.frequence }); setIsModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"><Edit3 size={16}/></button>
                                  <button onClick={() => { if(confirm("Supprimer l'IP ?")) apiClient.delete(`/indicators/${ind.id}`).then(() => fetchData()); }} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* VUE MATRICE ANNUELLE */}
      {activeTab === 'matrice' && (
        <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-x-auto shadow-2xl pb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[8px] font-black uppercase text-slate-500 tracking-[0.2em]">
                <th className="p-8 sticky left-0 bg-[#0B0F1A] z-20 min-w-75 border-r border-white/5 text-left text-blue-500">Registre Annuel IP</th>
                <th className="p-8 text-center border-r border-white/5 bg-white/5">Cible</th>
                {MOIS.map(m => <th key={m.id} className="p-4 text-center min-w-25 border-r border-white/5">{m.name.substring(0,3)}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {annualData.map((proc: any) => (
                <React.Fragment key={proc.PR_Id}>
                  <tr className="bg-blue-600/10"><td colSpan={14} className="p-4 px-8 text-[11px] font-black uppercase text-blue-400 tracking-widest italic">{proc.PR_Libelle}</td></tr>
                  {proc.PR_Indicators.map((ind: any) => (
                    <tr key={ind.IND_Id} className="hover:bg-white/2 group">
                      <td className="p-6 sticky left-0 bg-[#0F172A] border-r border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-blue-500">{ind.IND_Code}</span>
                            <span className="text-[7px] bg-white/5 px-2 py-0.5 rounded text-slate-500 uppercase font-black">{ind.IND_Frequence}</span>
                        </div>
                        <span className="text-[11px] font-black text-white uppercase italic">{ind.IND_Libelle}</span>
                      </td>
                      <td className="p-6 text-center font-black text-slate-500 italic border-r border-white/5 bg-white/5">{ind.IND_Cible}</td>
                      {MOIS.map(m => {
                        const val = ind.IND_Values.find((v: any) => v.IV_Month === m.id);
                        return <td key={m.id} className={`p-4 text-center border-r border-white/5 font-black text-sm ${val ? 'text-white' : 'text-slate-800'}`}>{val ? val.IV_Actual : '---'}</td>;
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL GESTION IP (RQ Uniquement) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-300 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-10 shadow-full animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-10">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">{editingInd ? 'Modifier' : 'Nouveau'} <span className="text-blue-600">IP</span></h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveIndicator} className="space-y-6">
              {!editingInd && (
                <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black italic outline-none" value={formInd.IND_ProcessusId} onChange={(e) => setFormInd({...formInd, IND_ProcessusId: e.target.value})} required>
                  <option value="" className="bg-slate-900 text-slate-400 font-black">PROCESSUS PROPRIÉTAIRE</option>
                  {processes.map(p => <option key={p.PR_Id} value={p.PR_Id} className="bg-slate-900">{p.PR_Libelle}</option>)}
                </select>
              )}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest px-1">Périodicité de l&apos;IP</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black uppercase outline-none focus:border-blue-600" value={formInd.IND_Frequence} onChange={(e) => setFormInd({...formInd, IND_Frequence: e.target.value})} required>
                  {['MENSUEL', 'TRIMESTRIEL', 'SEMESTRIEL', 'ANNUEL'].map(f => <option key={f} value={f} className="bg-slate-900 text-white font-black">{f}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input className="bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black uppercase outline-none focus:border-blue-600" placeholder="CODE IP" value={formInd.IND_Code} onChange={(e) => setFormInd({...formInd, IND_Code: e.target.value})} required />
                <input className="bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black uppercase outline-none focus:border-blue-600" placeholder="UNITÉ" value={formInd.IND_Unite} onChange={(e) => setFormInd({...formInd, IND_Unite: e.target.value})} required />
              </div>
              <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black italic outline-none focus:border-blue-600" placeholder="LIBELLÉ DE L'INDICATEUR" value={formInd.IND_Libelle} onChange={(e) => setFormInd({...formInd, IND_Libelle: e.target.value})} required />
              <input type="number" step="0.01" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black text-2xl outline-none focus:border-blue-600" placeholder="VALEUR CIBLE" value={formInd.IND_Cible} onChange={(e) => setFormInd({...formInd, IND_Cible: e.target.value})} required />
              <div className="flex gap-4 pt-6"><button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-5 rounded-xl font-black uppercase text-[10px] border border-white/10 hover:bg-white/5">Annuler</button><button type="submit" className="flex-1 p-5 rounded-xl font-black uppercase text-[10px] bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/40">Enregistrer l&apos;IP</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}