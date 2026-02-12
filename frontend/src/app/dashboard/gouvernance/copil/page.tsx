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
  Globe, Lock, Calculator, ChevronRight, Info, LucideIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- UTILITAIRES DE CLASSE ---
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function CopilPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [decisions, setDecisions] = useState("");
  const [checklist, setChecklist] = useState<any[]>([]);

  // 📅 RÉFÉRENTIEL TEMPOREL SCELLÉ : 2026
  const period = useMemo(() => ({ month: new Date().getMonth() + 1, year: 2026 }), []);

  /**
   * 📡 SYNCHRONISATION AVEC LE NOYAU MASTER
   */
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
      toast.error("Rupture de liaison Noyau Master : Vérifiez votre accès Matrix");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * 🔒 SCELLAGE DE LA SESSION COPIL
   */
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.patch('/copil/decisions', { decisions, ...period });
      toast.success("Arbitrages Direction Scellés avec Succès");
    } catch (e) { 
      toast.error("Échec d'écriture dans le registre PostgreSQL"); 
    } finally { 
      setIsSaving(false); 
    }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <div className="relative">
        <Activity className="text-blue-600 animate-spin" size={64} />
        <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400/50" size={20} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 italic animate-pulse">
        Calcul de la Maturité Matrix...
      </p>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col overflow-hidden selection:bg-blue-600/30">
      
      {/* 🛰️ HEADER SOUVERAIN (8% H) */}
      <header className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-50">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-blue-600/10 border border-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
            <Globe size={24} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
              Gouvernance <span className="text-blue-600">COPIL</span>
            </h1>
            <p className="text-slate-500 font-black uppercase text-[9px] tracking-[0.4em] mt-2 italic flex items-center gap-2">
              <ShieldCheck size={12} className="text-emerald-500" /> 
              REVUE DE DIRECTION • FÉVRIER 2026 • PROTOCOLE ISO 9001 §9.3
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 hover:bg-white/10 transition-all group">
            <Download size={16} className="group-hover:translate-y-0.5 transition-transform" /> Export Souverain
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-2xl shadow-blue-900/40 border-none cursor-pointer"
          >
            {isSaving ? <Activity className="animate-spin" size={16} /> : <Save size={16} />} 
            Sceller Session
          </button>
        </div>
      </header>

      {/* 📊 MATRIX GRID (92% H) - AUCUN SCROLL SUR L'ENSEMBLE */}
      <main className="flex-1 p-8 grid grid-cols-12 grid-rows-6 gap-8 overflow-hidden">
        
        {/* LIGNE 1 : KPI FLASH (PILIERS STRATÉGIQUES) */}
        <div className="col-span-12 row-span-1 grid grid-cols-4 gap-8">
          <MetricCard 
            title="Efficacité SMI" 
            val={`${data?.stats?.processScore ?? 0}%`} 
            icon={Activity} 
            color="emerald" 
            formula="$$\frac{\sum(Perf. Réelle)}{\sum(Cibles)} \times 100$$" 
          />
          <MetricCard 
            title="Couverture Risques" 
            val={`${data?.stats?.riskCoverage ?? 0}%`} 
            icon={ShieldCheck} 
            color="blue" 
            formula="$$\frac{Actions}{Risques Actifs}$$" 
          />
          <MetricCard 
            title="Non-Conformités" 
            val={data?.stats?.openNC ?? 0} 
            icon={AlertTriangle} 
            color="red" 
            formula="$$\sum Écarts Oouverts$$" 
          />
          <MetricCard 
            title="Vélocité PAQ" 
            val={`${data?.stats?.paqProgress ?? 0}%`} 
            icon={TrendingUp} 
            color="amber" 
            formula="$$\mu(Actions Closes)$$" 
          />
        </div>

        {/* COLONNE GAUCHE (4 COL) : VIGILANCE & ARBITRAGES */}
        <div className="col-span-4 row-span-5 flex flex-col gap-8 overflow-hidden">
          <div className="flex-1 bg-slate-900/20 border border-white/5 rounded-[3rem] p-8 flex flex-col overflow-hidden backdrop-blur-sm">
            <h3 className="text-xl font-black uppercase italic mb-6 flex items-center gap-4">
              <Zap className="text-amber-500" size={22} /> Vigilance Système
            </h3>
            <div className="flex-1 overflow-y-auto pr-4 space-y-3 custom-scrollbar">
              {data?.criticalPoints?.map((p: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-5 bg-[#0B0F1A]/80 rounded-3xl border-l-4 border-red-600 hover:bg-red-600/10 transition-all group">
                  <div className="max-w-[70%]">
                    <span className="text-[8px] font-black text-slate-600 uppercase italic block tracking-[0.2em] mb-1">{p.cat}</span>
                    <h4 className="text-sm font-black uppercase italic text-white leading-tight truncate group-hover:text-red-400 transition-colors">{p.label}</h4>
                  </div>
                  <span className="text-3xl font-black italic text-red-500">{p.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[40%] bg-slate-900/20 border border-white/5 rounded-[3rem] p-8 flex flex-col backdrop-blur-sm">
            <h3 className="text-xl font-black uppercase italic mb-4 flex items-center gap-4 text-blue-500">
              <MessageSquare size={22} /> Arbitrages Direction
            </h3>
            <textarea 
              value={decisions} 
              onChange={(e) => setDecisions(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-6 text-white italic font-bold text-sm outline-none focus:border-blue-600 shadow-inner resize-none custom-scrollbar"
              placeholder="Consignez les décisions de revue pour scellage..."
            />
          </div>
        </div>

        {/* COLONNE CENTRALE (4 COL) : DICTIONNAIRE D'INTELLIGENCE SCELLÉ */}
        <div className="col-span-4 row-span-5 flex flex-col gap-8 overflow-hidden">
           <div className="flex-1 bg-blue-600/5 border border-blue-600/10 rounded-[4rem] p-10 flex flex-col overflow-hidden">
              <div className="flex items-center gap-5 mb-8">
                <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-2xl">
                  <Calculator size={28} />
                </div>
                <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter leading-none">
                  Logique <span className="text-blue-500">Calcul SMI</span>
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                  <LogicItem 
                    title="Indice de Performance" 
                    formula="$$\frac{\sum (Perf. Réelle / Cible)}{N}$$" 
                    desc="Moyenne pondérée de l'atteinte des objectifs sur l'ensemble des unités organiques."
                  />
                  <LogicItem 
                    title="Maîtrise des Risques" 
                    formula="$$\frac{Risques Mitigés}{Total Risques}$$" 
                    desc="Capacité du système à transformer les menaces critiques en actions correctives scellées."
                  />
                  <LogicItem 
                    title="Maturité Globale" 
                    formula="$$Audit + \text{Conf. §9.3}$$" 
                    desc="Algorithme certifiant le niveau d'excellence de l'instance face aux standards ISO 2026."
                  />
                  <LogicItem 
                    title="Vélocité PAQ" 
                    formula="$$\frac{Actions Closes}{Total Actions}$$" 
                    desc="Indicateur de réactivité organisationnelle face aux dérives de conformité."
                  />
              </div>

              <div className="mt-8 p-6 bg-blue-600/10 border border-blue-500/20 rounded-4xl flex items-center gap-5">
                  <Info size={24} className="text-blue-500 shrink-0" />
                  <p className="text-[10px] font-black uppercase text-slate-400 italic leading-relaxed tracking-widest">
                    Les algorithmes Qualisoft respectent scrupuleusement les exigences COFRAC 2026.
                  </p>
              </div>
           </div>
        </div>

        {/* COLONNE DROITE (4 COL) : MATURITÉ & CHECKLIST ISO 9001 */}
        <div className="col-span-4 row-span-5 flex flex-col gap-8 overflow-hidden">
          <div className="bg-blue-600 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden shrink-0 group">
            <div className="absolute -right-16 -bottom-16 text-white/5 rotate-12 group-hover:scale-125 transition-transform duration-1000">
              <ShieldCheck size={250} />
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-black uppercase italic text-white mb-6 leading-none tracking-tighter">Maturité SMI</h3>
              <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] font-black uppercase text-blue-100 italic tracking-[0.3em]">Trajectoire Elite</span>
                <span className="text-4xl font-black text-white italic leading-none">85%</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,1)] transition-all duration-1000 ease-out" style={{ width: '85%' }} />
              </div>
            </div>
          </div>

          <div className="flex-1 bg-slate-900/20 border border-white/5 p-8 rounded-[3.5rem] overflow-hidden flex flex-col backdrop-blur-sm">
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-6 italic flex items-center gap-3">
              <BarChart3 size={16} /> Exigences d&apos;Entrée §9.3
            </h4>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-5 bg-white/2 border border-white/5 rounded-2xl group hover:bg-white/5 transition-all">
                  <span className={cn("text-[10px] font-black uppercase italic tracking-tighter", item.status ? 'text-white' : 'text-slate-600')}>
                    {item.label}
                  </span>
                  <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center border transition-all", item.status ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500' : 'bg-red-500/20 border-red-500/30 text-red-500')}>
                    {item.status ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} className="animate-pulse" />}
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

// --- SOUS-COMPOSANTS DÉCISIONNELS ---

function MetricCard({ title, val, icon: Icon, color, formula }: { title: string, val: string | number, icon: LucideIcon, color: string, formula: string }) {
  const themes: any = {
    emerald: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
    blue: 'text-blue-500 bg-blue-500/5 border-blue-500/10',
    red: 'text-red-500 bg-red-500/5 border-red-500/10',
    amber: 'text-amber-500 bg-amber-500/5 border-amber-500/10'
  };
  return (
    <div className="bg-[#0F172A]/40 border border-white/5 p-6 rounded-[2.5rem] flex flex-col justify-between group hover:border-blue-500/30 transition-all cursor-help backdrop-blur-xl">
      <div className="flex justify-between items-start mb-2">
         <div className={cn("p-3 rounded-2xl border", themes[color])}><Icon size={24} /></div>
         <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic group-hover:text-blue-400 transition-colors leading-none">Sovereign KPI</span>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none italic">{title}</p>
        <p className="text-4xl font-black italic text-white tracking-tighter leading-none">{val}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="text-[10px] text-slate-600 group-hover:text-blue-500 transition-colors font-medium">{formula}</div>
      </div>
    </div>
  );
}

function LogicItem({ title, formula, desc }: { title: string, formula: string, desc: string }) {
  return (
    <div className="p-6 bg-white/2 border border-white/5 rounded-4xl group hover:border-blue-500/40 transition-all hover:bg-blue-600/5">
      <h4 className="text-sm font-black uppercase italic text-blue-500 leading-none mb-3">{title}</h4>
      <div className="bg-black/40 p-4 rounded-xl border border-white/5 mb-4 group-hover:border-blue-500/30 transition-all">
        <div className="text-white text-xs font-bold">{formula}</div>
      </div>
      <p className="text-[9px] text-slate-500 font-bold uppercase italic leading-relaxed tracking-wide">{desc}</p>
    </div>
  );
}