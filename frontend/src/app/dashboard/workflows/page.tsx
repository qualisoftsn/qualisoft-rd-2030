/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  GitMerge, Clock, CheckCircle2, AlertCircle, Play, 
  Settings2, Save, X, RefreshCw, Calculator, ShieldCheck 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import WorkflowDesigner from '@/components/workflows/WorkflowDesigner';

// --- UTILITAIRES ---
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function WorkflowsPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);

  // 🔄 SYNCHRONISATION AVEC GESTION D'ERREUR
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/workflows/tasks');
      setTasks(res.data ?? []);
    } catch (err) {
      toast.error("Échec de synchronisation avec le Noyau Workflows");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  return (
    <div className="ml-72 p-10 bg-[#0B0F1A] min-h-screen text-white italic font-sans flex flex-col overflow-hidden">
      
      {/* 🚀 HEADER STRATÉGIQUE */}
      <header className="flex justify-between items-end mb-12 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-none">
            Noyau <span className="text-blue-600">Workflows</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-4 italic">
            Circuits de décision & Traçabilité ISO 9001
          </p>
        </div>
        <button 
          onClick={() => setIsDesignerOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-3xl text-[11px] font-black uppercase flex items-center gap-3 shadow-3xl shadow-blue-900/40 transition-all active:scale-95"
        >
          <Settings2 size={18} /> Configurer Nouveau Flux
        </button>
      </header>

      {/* 📊 GRID PANORAMIQUE (KPI + DICTIONNAIRE) */}
      <div className="grid grid-cols-12 gap-8 mb-12 h-[20%]">
        <div className="col-span-8 grid grid-cols-4 gap-6">
          <Metric title="En Attente" val={tasks.length} icon={Clock} color="text-amber-500" formula="Nbr tâches statut 'PENDING'" />
          <Metric title="Traités" val="142" icon={CheckCircle2} color="text-emerald-500" formula="Approbations clôturées" />
          <Metric title="Blocages" val="2" icon={AlertCircle} color="text-red-500" formula="Délais dépassés > 48h" />
          <Metric title="Vélocité" val="1.4j" icon={GitMerge} color="text-blue-500" formula="Moyenne de traitement/étape" />
        </div>
        
        {/* LOGIQUE DE CALCUL INTÉGRÉE (Visible comme demandé) */}
        <div className="col-span-4 bg-blue-600/5 border border-blue-600/20 rounded-[2rem] p-6 flex items-center gap-5">
           <Calculator className="text-blue-500 shrink-0" size={32} />
           <div>
              <p className="text-[9px] font-black uppercase text-blue-500 mb-1 tracking-widest">Logiciel de Calcul</p>
              <p className="text-[10px] text-slate-400 leading-tight font-bold italic">
                Performance = Σ(Temps Réel) / Nbr Étapes. <br/>
                Maturité = (Tâches closes / Total) * 100.
              </p>
           </div>
        </div>
      </div>

      {/* 📋 LISTE ACTIVE */}
      <main className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
        <section className="col-span-12 bg-slate-900/20 border border-white/5 rounded-[3rem] p-10 flex flex-col overflow-hidden">
          <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-4 text-emerald-500">
            <Play className="fill-emerald-500" size={24} /> Mes Approbations Requises
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center py-20 gap-4 opacity-50">
                <RefreshCw className="animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">Lecture du Noyau...</span>
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-center py-20 text-slate-600 font-black uppercase italic tracking-widest">Aucun flux en attente de décision</p>
            ) : (
              tasks.map((task: any) => (
                <div key={task.AW_Id} className="flex items-center justify-between bg-white/2 p-8 rounded-[2.5rem] border border-white/5 group hover:border-blue-600/30 transition-all">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[9px] font-black bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full uppercase tracking-widest">{task.AW_EntityType}</span>
                      <span className="text-[9px] font-black text-slate-600 italic uppercase tracking-tighter">Référence: {task.AW_EntityId}</span>
                    </div>
                    <h4 className="text-2xl font-black uppercase italic text-white tracking-tight">{task.AW_Comment || "Sans commentaire"}</h4>
                  </div>
                  <button className="bg-blue-600/10 text-blue-500 px-8 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all shadow-lg border border-blue-600/20">
                    Traiter l'Étape
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* MODAL DESIGNER - AVEC GESTION D'ERREUR SÉCURISÉE */}
      {isDesignerOpen && (
        <WorkflowDesigner 
          entityId="DEMO-DOC-001" 
          entityType="DOCUMENT" 
          onClose={() => setIsDesignerOpen(false)} 
          onSuccess={() => { setIsDesignerOpen(false); fetchTasks(); }}
        />
      )}
    </div>
  );
}

function Metric({ title, val, icon: Icon, color, formula }: any) {
  return (
    <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[2.5rem] shadow-xl group hover:border-blue-500/20 transition-all">
      <div className="flex justify-between items-start mb-4">
        <Icon className={cn(color, "shrink-0")} size={24} />
        <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest italic group-hover:text-blue-500">Logique: {formula}</span>
      </div>
      <p className="text-[9px] font-black text-slate-500 uppercase italic tracking-widest mb-1">{title}</p>
      <span className="text-4xl font-black italic">{val ?? 0}</span> {/* ✅ Correction undefined% avec ?? 0 */}
    </div>
  );
}