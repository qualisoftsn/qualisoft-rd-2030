/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Target, Zap, CheckCircle2, AlertTriangle, 
  TrendingUp, Activity, BarChart3, Save, 
  Download, ShieldCheck, MessageSquare,
  Globe, Lock, Calculator, ChevronRight, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- UTILITAIRES ---
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function CopilPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [decisions, setDecisions] = useState("");
  const [checklist, setChecklist] = useState<any[]>([]);

  const period = useMemo(() => ({ month: new Date().getMonth() + 1, year: 2026 }), []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/copil/analysis', { params: period });
      if (res.data?.data) {
        setData(res.data.data);
        setDecisions(res.data.data.decisions || "");
        setChecklist(res.data.data.isoChecklist || []);
      }
    } catch (e) {
      toast.error("Rupture de liaison Noyau Master");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.patch('/copil/decisions', { decisions, ...period });
      toast.success("Arbitrages Direction Sauvegardés");
    } catch (e) { toast.error("Échec d'écriture"); }
    finally { setIsSaving(false); }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Activity className="text-blue-600 animate-spin" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 italic">Génération du Cockpit Global...</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col overflow-hidden">
      
      {/* 🚀 HEADER STRATÉGIQUE (8% H) */}
      <header className="px-8 py-4 border-b border-white/5 flex justify-between items-center bg-[#0B0F1A]/80 backdrop-blur-3xl">
        <div className="flex items-center gap-5">
          <div className="w-10 h-10 bg-blue-600/10 border border-blue-600/20 rounded-xl flex items-center justify-center text-blue-500 shadow-2xl">
            <Globe size={20} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
              Gouvernance <span className="text-blue-600">COPIL</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[8px] tracking-[0.4em] mt-1 italic flex items-center gap-2">
              <ShieldCheck size={10} className="text-emerald-500" /> REVUE DE DIRECTION • JANVIER 2026 • ISO 9001 §9.3
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-white/10 transition-all">
            <Download size={14} /> Export PDF
          </button>
          <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl font-black uppercase text-[9px] flex items-center gap-2 transition-all shadow-3xl shadow-blue-900/40">
            {isSaving ? <Activity className="animate-spin" size={14} /> : <Save size={14} />} 
            Sceller Session
          </button>
        </div>
      </header>

      {/* 📊 GRID TOTAL (92% H) - AUCUN SCROLL */}
      <main className="flex-1 p-6 grid grid-cols-12 grid-rows-6 gap-6 overflow-hidden">
        
        {/* LIGNE 1 : KPI FLASH (1 RANGÉE) */}
        <div className="col-span-12 row-span-1 grid grid-cols-4 gap-6">
          <MetricCard title="Efficacité SMI" val={`${data?.stats?.processScore ?? 0}%`} icon={Activity} color="emerald" formula="Σ(Pérf.Réelle) / Σ(Cibles) × 100" />
          <MetricCard title="Couverture Risques" val={`${data?.stats?.riskCoverage ?? 0}%`} icon={ShieldCheck} color="blue" formula="Actions / Risques Actifs" />
          <MetricCard title="Non-Conformités" val={data?.stats?.openNC ?? 0} icon={AlertTriangle} color="red" formula="Écarts ouverts cumulés" />
          <MetricCard title="Avancement PAQ" val={`${data?.stats?.paqProgress ?? 0}%`} icon={TrendingUp} color="amber" formula="Moyenne des actions closes" />
        </div>

        {/* COLONNE GAUCHE (4 COL) : VIGILANCE & ARBITRAGES */}
        <div className="col-span-4 row-span-5 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 bg-slate-900/20 border border-white/5 rounded-[2.5rem] p-6 flex flex-col overflow-hidden">
            <h3 className="text-lg font-black uppercase italic mb-4 flex items-center gap-3">
              <Zap className="text-amber-500" size={18} /> Vigilance Système
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {data?.criticalPoints?.map((p: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-4 bg-[#0B0F1A]/60 rounded-2xl border-l-4 border-red-600 hover:bg-red-600/5 transition-all">
                  <div className="max-w-[70%]">
                    <span className="text-[7px] font-black text-slate-600 uppercase italic block tracking-widest">{p.cat}</span>
                    <h4 className="text-sm font-black uppercase italic text-white leading-tight truncate">{p.label}</h4>
                  </div>
                  <span className="text-2xl font-black italic text-red-500">{p.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[40%] bg-slate-900/20 border border-white/5 rounded-[2.5rem] p-6 flex flex-col">
            <h3 className="text-lg font-black uppercase italic mb-3 flex items-center gap-3 text-blue-500">
              <MessageSquare size={18} /> Arbitrages & Ressources
            </h3>
            <textarea 
              value={decisions} onChange={(e) => setDecisions(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 text-white italic font-bold text-sm outline-none focus:border-blue-600 shadow-inner resize-none scrollbar-hide"
              placeholder="Consignez les décisions de revue..."
            />
          </div>
        </div>

        {/* COLONNE CENTRALE (4 COL) : LE DICTIONNAIRE D'INTELLIGENCE (FIXE ET VISIBLE) */}
        <div className="col-span-4 row-span-5 flex flex-col gap-6 overflow-hidden">
           <div className="flex-1 bg-blue-600/5 border border-blue-600/10 rounded-[3rem] p-8 flex flex-col overflow-hidden">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg">
                  <Calculator size={22} />
                </div>
                <h3 className="text-xl font-black uppercase italic text-white tracking-tighter">
                  Logique de <span className="text-blue-500">Calcul SMI</span>
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
                 <LogicItem 
                   title="Indice de Performance" 
                   formula="Σ (Performance Réelle / Cible) / N" 
                   desc="Calculé sur l'ensemble des processus. Évalue la conformité des résultats par rapport aux objectifs stratégiques."
                 />
                 <LogicItem 
                   title="Taux de Maîtrise Risques" 
                   formula="Risques Mitigés / Total Risques" 
                   desc="Mesure la capacité du SMI à transformer les menaces identifiées en plans d'actions préventives concrets."
                 />
                 <LogicItem 
                   title="Maturité Globale" 
                   formula="Score Audit + Conformité §9.3" 
                   desc="Algorithme pondéré certifiant le niveau d'excellence de l'instance COPIL actuelle face aux auditeurs."
                 />
                 <LogicItem 
                   title="Vélocité PAQ" 
                   formula="Actions Closes / Total Actions" 
                   desc="Indique la réactivité de l'organisation face aux Non-Conformités et aux opportunités d'amélioration."
                 />
              </div>

              <div className="mt-6 p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center gap-4">
                 <Info size={18} className="text-blue-500 shrink-0" />
                 <p className="text-[8px] font-black uppercase text-slate-400 italic leading-tight tracking-widest">
                   Les algorithmes respectent scrupuleusement les recommandations de calcul COFRAC 2026.
                 </p>
              </div>
           </div>
        </div>

        {/* COLONNE DROITE (4 COL) : MATURITÉ & CHECKLIST ISO */}
        <div className="col-span-4 row-span-5 flex flex-col gap-6 overflow-hidden">
          <div className="bg-blue-600 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden shrink-0 group">
            <div className="absolute -right-10 -bottom-10 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><ShieldCheck size={180} /></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black uppercase italic text-white mb-4 leading-none tracking-tighter">Maturité SMI</h3>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[8px] font-black uppercase text-blue-100 italic tracking-widest">Trajectoire 2026</span>
                <span className="text-2xl font-black text-white italic">85%</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-1000" style={{ width: '85%' }} />
              </div>
            </div>
          </div>

          <div className="flex-1 bg-slate-900/20 border border-white/5 p-6 rounded-[2.5rem] overflow-hidden flex flex-col">
            <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] mb-4 italic flex items-center gap-2">
              <BarChart3 size={14} /> Exigences d&apos;Entrée §9.3
            </h4>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3.5 bg-white/2 border border-white/5 rounded-xl group hover:bg-white/5 transition-all">
                  <span className={cn("text-[9px] font-black uppercase italic tracking-tighter", item.status ? 'text-white' : 'text-slate-600')}>{item.label}</span>
                  <div className={cn("w-5 h-5 rounded-lg flex items-center justify-center border", item.status ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500')}>
                    {item.status ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} className="animate-pulse" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function MetricCard({ title, val, icon: Icon, color, formula }: any) {
  const themes: any = {
    emerald: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
    blue: 'text-blue-500 bg-blue-500/5 border-blue-500/10',
    red: 'text-red-500 bg-red-500/5 border-red-500/10',
    amber: 'text-amber-500 bg-amber-500/5 border-amber-500/10'
  };
  return (
    <div className="bg-[#0F172A]/40 border border-white/5 p-4 rounded-4xl flex flex-col justify-between group hover:border-blue-500/30 transition-all cursor-help">
      <div className="flex justify-between items-start">
         <div className={cn("p-2.5 rounded-xl border", themes[color])}><Icon size={18} /></div>
         <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest italic group-hover:text-blue-400 transition-colors">KPI Noyau Master</span>
      </div>
      <div className="mt-2">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 italic leading-none">{title}</p>
        <p className="text-3xl font-black italic text-white tracking-tighter">{val}</p>
      </div>
      <div className="mt-2 pt-2 border-t border-white/5">
        <p className="text-[7px] font-bold text-slate-600 italic group-hover:text-blue-500 transition-colors leading-none">Formule: {formula}</p>
      </div>
    </div>
  );
}

function LogicItem({ title, formula, desc }: any) {
  return (
    <div className="p-4 bg-white/2 border border-white/5 rounded-2xl group hover:border-blue-500/30 transition-all">
      <h4 className="text-xs font-black uppercase italic text-blue-500 leading-none mb-2">{title}</h4>
      <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 mb-2 group-hover:border-blue-500/30 transition-all">
        <code className="text-white text-[9px] font-bold tracking-tight">{formula}</code>
      </div>
      <p className="text-[8px] text-slate-500 font-bold uppercase italic leading-tight tracking-tight">{desc}</p>
    </div>
  );
}