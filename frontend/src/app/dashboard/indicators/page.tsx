/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Loader2, Send, Lock, Save, Layers, CheckCircle2, RotateCcw, Activity, 
  Edit3, Trash2, Plus, X, TableProperties, LayoutDashboard, AlertTriangle, Clock,
  ShieldCheck, Unlock, ShieldAlert, Target, Info, Calculator
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  
  // Date système actuelle : 27 Janvier 2026
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [period, setPeriod] = useState({ 
    month: today.getMonth() === 0 ? 12 : today.getMonth(), 
    year: today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear() 
  });

  const [tempValues, setTempValues] = useState<{ [key: string]: number }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInd, setEditingInd] = useState<any>(null);
  
  // Formulaire étendu pour inclure le mode de calcul
  const [formInd, setFormInd] = useState({ 
    IND_Code: '', IND_Libelle: '', IND_Cible: '', IND_Unite: '%', 
    IND_ProcessusId: '', IND_Frequence: 'MENSUEL', IND_CalculMode: '' 
  });

  // --- 🛡️ GOUVERNANCE SOUVERAINE ---
  const isAdmin = useMemo(() => {
    const roles = ['ADMIN', 'RQ', 'SUPER_ADMIN'];
    return roles.includes(user?.U_Role) || user?.U_Email === 'ab.thiongane@qualisoft.sn';
  }, [user]);

  const isSaisieWindow = useMemo(() => currentDay >= 1 && currentDay <= 10, [currentDay]);

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
    } catch (err) { toast.error("Erreur de flux"); } finally { setLoading(false); }
  }, [period, activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveValue = async (id: string, val: number) => {
    if (isNaN(val)) return;
    try {
      await apiClient.post('/indicators/bulk-save', { 
        values: [{ indicatorId: id, value: val }], 
        ...period 
      });
      toast.success("Synchronisation OK", { position: 'bottom-right' });
    } catch (err) { toast.error("Action refusée"); }
  };

  const triggerWorkflow = async (action: 'submit' | 'validate' | 'reject', processId: string) => {
    try {
      await apiClient.post(`/indicators/${action}/${processId}`, { ...period });
      toast.success(`Flux : ${action}`);
      fetchData();
    } catch (err) { toast.error("Erreur de transition"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0B0F1A]"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;

  return (
    <div className="p-8 italic bg-[#0B0F1A] min-h-screen text-white pb-32 ml-72 text-left font-sans">
      
      {/* 1. HEADER DE GESTION */}
      <header className="flex justify-between items-start border-b border-white/5 pb-10 mb-12">
        <div className="space-y-4">
          <div className="flex bg-slate-900 border border-white/10 p-1 rounded-2xl w-fit">
            <button onClick={() => setActiveTab('saisie')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'saisie' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>Registre de Saisie</button>
            <button onClick={() => setActiveTab('matrice')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'matrice' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>Matrice Annuelle</button>
          </div>
          <h1 className="text-7xl font-black uppercase tracking-tighter italic">
            {MOIS.find(m => m.id === period.month)?.name} <span className="text-blue-600">{period.year}</span>
          </h1>
          <div className="flex items-center gap-3">
             <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isSaisieWindow ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {isSaisieWindow ? <Unlock size={12}/> : <Lock size={12}/>} {isSaisieWindow ? 'Fenêtre ouverte' : 'Saisie fermée (Hors délai)'}
             </span>
             {isAdmin && <span className="bg-blue-500/10 border border-blue-500/30 text-blue-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase flex items-center gap-2 shadow-inner"><ShieldCheck size={12}/> Autorité Maître Active</span>}
          </div>
        </div>

        <div className="flex bg-slate-900 border border-white/10 rounded-2xl p-1 shadow-2xl">
          <select value={period.month} onChange={(e) => setPeriod({...period, month: parseInt(e.target.value)})} className="bg-transparent p-4 text-[11px] font-black uppercase outline-none text-blue-400 cursor-pointer">{MOIS.map(m => <option key={m.id} value={m.id} className="bg-slate-900">{m.name}</option>)}</select>
          <select value={period.year} onChange={(e) => setPeriod({...period, year: parseInt(e.target.value)})} className="bg-transparent p-4 text-[11px] font-black uppercase outline-none text-white cursor-pointer">{[2025, 2026, 2027].map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}</select>
        </div>
      </header>

      {/* 2. LA GRILLE ÉLITE (SAISIE & QUALIFICATION) */}
      {activeTab === 'saisie' && (
        <div className="space-y-24">
          {groups.map((group) => {
            const status = group.indicators[0]?.entry?.IV_Status || 'BROUILLON';
            const isValide = status === 'VALIDE';
            
            // ✅ FORCE DÉBLOCAGE : (Admin) OU (Fenêtre 1-10 ET statut Brouillon)
            const canEditAction = isAdmin || (isSaisieWindow && status === 'BROUILLON');

            return (
              <section key={group.processId} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-end mb-6 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><Layers size={20}/></div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white">{group.processLabel}</h2>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase text-slate-400 italic">Statut : {status}</span>
                  </div>
                  
                  <div className="flex gap-4">
                    {isAdmin && status === 'SOUMIS' && (
                      <button onClick={() => triggerWorkflow('validate', group.processId)} className="bg-emerald-600 text-white px-8 py-3 rounded-xl text-[9px] font-black uppercase shadow-lg flex items-center gap-2 italic"><CheckCircle2 size={14}/> Accuser Réception</button>
                    )}
                    {!isAdmin && status === 'BROUILLON' && isSaisieWindow && (
                      <button onClick={() => triggerWorkflow('submit', group.processId)} className="bg-blue-600 text-white px-8 py-3 rounded-xl text-[9px] font-black uppercase shadow-lg flex items-center gap-2 italic"><Send size={14}/> Transmettre au RQ</button>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-3xl backdrop-blur-md">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/5 text-[9px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5">
                        <th className="p-8">Indicateur / Périodicité</th>
                        <th className="p-8 text-center">Objectif Cible</th>
                        <th className="p-8 text-left">Mode de Calcul</th>
                        <th className="p-8 text-center">Valeur Réelle</th>
                        <th className="p-8 text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 italic">
                      {group.indicators.map((ind: any) => {
                        // Un indicateur n'est éditable que si la fréquence correspond au mois
                        const isFreqOk = ind.doitEtreSaisi || isAdmin;
                        const finalCanType = canEditAction && isFreqOk;

                        return (
                          <tr key={ind.id} className={`group transition-all ${!isFreqOk ? 'opacity-10 pointer-events-none grayscale' : ''}`}>
                            <td className="p-8">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black text-blue-500 uppercase">{ind.code}</span>
                                <span className="text-[7px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-black border border-blue-500/20">{ind.frequence}</span>
                              </div>
                              <span className="text-base font-black text-white uppercase tracking-tight">{ind.label}</span>
                            </td>
                            <td className="p-8 text-center">
                              <div className="flex flex-col items-center">
                                <Target size={14} className="text-slate-600 mb-1" />
                                <span className="text-xl font-black text-slate-400 italic">{ind.target}{ind.unit}</span>
                              </div>
                            </td>
                            <td className="p-8 text-left max-w-xs">
                              <div className="flex items-start gap-2">
                                <Calculator size={14} className="text-blue-500 mt-1 shrink-0" />
                                <span className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">{ind.calculMode || "Formule non définie"}</span>
                              </div>
                            </td>
                            <td className="p-8 text-center">
                              <div className="relative inline-block">
                                <input 
                                  type="number" 
                                  disabled={!finalCanType} 
                                  defaultValue={ind.entry.IV_Actual} 
                                  onBlur={(e) => saveValue(ind.id, parseFloat(e.target.value))}
                                  placeholder={!ind.doitEtreSaisi ? "---" : "0.00"}
                                  className={`w-40 bg-black/40 border-2 rounded-2xl p-5 text-center font-black text-3xl outline-none transition-all shadow-inner italic ${!finalCanType ? 'border-transparent text-slate-800' : 'border-white/10 focus:border-blue-600 text-white'}`}
                                />
                                {finalCanType && <Edit3 size={14} className="absolute top-3 right-3 text-blue-500/30" />}
                              </div>
                            </td>
                            <td className="p-8 text-center">
                               <div className="flex flex-col items-center gap-1">
                                  {ind.entry.IV_Actual !== null ? (
                                    <span className={`px-3 py-1 rounded text-[8px] font-black uppercase ${ind.entry.IV_Actual >= ind.target ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                      {ind.entry.IV_Actual >= ind.target ? 'Atteint' : 'Échec'}
                                    </span>
                                  ) : (
                                    <span className="text-[8px] font-black text-slate-600 uppercase italic">En attente</span>
                                  )}
                               </div>
                            </td>
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

      {/* 3. MATRICE ANNUELLE (TABLEAU DE BORD GLOBAL) */}
      {activeTab === 'matrice' && (
        <div className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] overflow-x-auto shadow-3xl backdrop-blur-md pb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[8px] font-black uppercase text-slate-500 tracking-[0.2em]">
                <th className="p-8 sticky left-0 bg-[#0B0F1A] z-20 min-w-80 border-r border-white/5 text-blue-500">Registre Annuel Qualisoft</th>
                <th className="p-8 text-center border-r border-white/5">Cible</th>
                {MOIS.map(m => <th key={m.id} className="p-4 text-center min-w-[90px] border-r border-white/5">{m.name.substring(0,3)}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 italic text-sm">
              {annualData.map((proc: any) => (
                <React.Fragment key={proc.PR_Id}>
                  <tr className="bg-blue-600/5"><td colSpan={14} className="p-4 px-10 text-[10px] font-black uppercase text-blue-400 italic bg-linear-to-r from-blue-600/10 to-transparent">Processus : {proc.PR_Libelle}</td></tr>
                  {proc.PR_Indicators.map((ind: any) => (
                    <tr key={ind.IND_Id} className="hover:bg-white/2">
                      <td className="p-6 sticky left-0 bg-[#0F172A] border-r border-white/5">
                        <p className="text-[9px] font-black text-blue-500 mb-1">{ind.IND_Code}</p>
                        <span className="text-xs font-black text-white uppercase tracking-tight">{ind.IND_Libelle}</span>
                      </td>
                      <td className="p-6 text-center font-black text-slate-500 border-r border-white/5 bg-white/5">{ind.IND_Cible}</td>
                      {MOIS.map(m => {
                        const val = ind.IND_Values.find((v: any) => v.IV_Month === m.id);
                        return <td key={m.id} className={`p-4 text-center border-r border-white/5 font-black ${val ? (val.IV_Actual >= ind.IND_Cible ? 'text-emerald-500' : 'text-red-500') : 'text-slate-800'}`}>{val ? val.IV_Actual : '---'}</td>;
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}