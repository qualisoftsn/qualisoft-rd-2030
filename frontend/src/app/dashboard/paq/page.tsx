/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldAlert, CheckCircle2, Clock, Users, 
  ArrowRight, Target, Loader2, LayoutGrid, 
  Plus, Save, Edit3, X, TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

/**
 * 🛠️ COMPOSANT : TABLEAU DE BORD PAQ (PLAN D'ACTIONS QUALITÉ)
 * Ce module orchestre le cycle PDCA (Plan-Do-Check-Act).
 * Il agrège les données de performance pour assurer que l'organisme 
 * réagit aux non-conformités (§10.2) et s'améliore (§10.3).
 */

export default function PAQPage() {
  // --- ÉTATS SYSTÈME ---
  const [data, setData] = useState<any>(null); // Statistiques globales
  const [paqs, setPaqs] = useState<any[]>([]); // Liste des plans annuels
  const [loading, setLoading] = useState(true);
  const [editingAction, setEditingAction] = useState<any>(null); // État de modification rapide

  /**
   * 🛰️ RÉCUPÉRATION DES FLUX DE DONNÉES
   * Utilisation de Promise.allSettled pour ne pas bloquer l'UI en cas d'échec partiel.
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resStats, resPaqs] = await Promise.all([
        apiClient.get('/paq/dashboard'),
        apiClient.get('/paq')
      ]);
      setData(resStats.data);
      setPaqs(resPaqs.data);
    } catch (error) {
      toast.error("Rupture de flux PAQ : Échec de synchronisation SMI");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * 💾 ACTION : RECTIFICATION RAPIDE
   * Permet de modifier une action critique directement depuis le dashboard d'urgence.
   */
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAction?.ACT_Id) return;
    
    try {
      await apiClient.patch(`/paq/actions/${editingAction.ACT_Id}`, editingAction);
      toast.success("Rectification validée : L'action a été mise à jour dans le registre.");
      setEditingAction(null);
      fetchData();
    } catch (err) {
      toast.error("Échec de la mutation : Vérifiez vos habilitations.");
    }
  };

  // --- ÉTATS DE CHARGEMENT ---
  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#0B0F1A] ml-72">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
      <p className="text-blue-500 font-black uppercase italic text-[10px] tracking-[0.4em] animate-pulse">
        Calcul Qualisoft Elite en cours...
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-12 ml-72 text-white font-sans italic text-left selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700">
        
        {/* 🔝 EN-TÊTE STRATÉGIQUE */}
        <header className="flex justify-between items-end border-b border-white/5 pb-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
              PILOTAGE <span className="text-blue-500">PAQ</span>
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.5em] italic">
              Surveillance Système ISO 9001:2015 • Amélioration Continue
            </p>
          </div>
          <Link href="/dashboard/paq/nouveau" className="bg-blue-600 hover:bg-white hover:text-slate-900 text-white px-10 py-6 rounded-2xl font-black uppercase italic text-xs transition-all shadow-2xl border-none flex items-center gap-3 active:scale-95">
             <Plus size={20} /> Initialiser un Plan Annuel
          </Link>
        </header>

        {/* 📊 INDICATEURS DE RÉACTIVITÉ (§10.2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard title="ACTIONS TOTALES" value={data?.total || 0} icon={Target} color="blue" subtitle="Volume SMI" />
          <StatCard title="RETARDS CRITIQUES" value={data?.enRetard?.length || 0} icon={ShieldAlert} color="red" subtitle="Alerte §10.2" />
          <StatCard title="INDICE EFFICACITÉ" value={`${data?.tauxEfficacite || 0}%`} icon={CheckCircle2} color="emerald" subtitle="Mesure §9.1.3" />
          <StatCard title="PILOTES ACTIFS" value={data?.chargeTravail?.length || 0} icon={Users} color="orange" subtitle="Ressources" />
        </div>

        {/* 🏛️ SECTION PRINCIPALE : PLANS & URGENCES */}
        <div className="grid grid-cols-12 gap-12 items-start">
          
          {/* GRILLE DES PLANS ANNUELS PAR PROCESSUS */}
          <div className="col-span-12 lg:col-span-8 space-y-10">
            <h3 className="text-2xl font-black uppercase italic flex items-center gap-4">
              <LayoutGrid className="text-blue-500" /> Cartographie des Plans
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {paqs.length > 0 ? paqs.map((paq: any) => (
                <Link href={`/dashboard/paq/${paq.PAQ_Id}`} key={paq.PAQ_Id} className="bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] hover:border-blue-500/40 transition-all group flex flex-col justify-between min-h-75 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Target size={120} /></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <span className="bg-blue-500/10 border border-blue-500/20 px-5 py-2 rounded-xl text-[11px] font-black text-blue-400 italic">EXERCICE {paq.PAQ_Year}</span>
                      <span className="text-[10px] font-black uppercase text-slate-500 italic tracking-[0.2em]">{paq._count?.PAQ_Actions || 0} ACTIONS ENREGISTRÉES</span>
                    </div>
                    <h4 className="text-3xl font-black uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors leading-tight mb-4">
                      {paq.PAQ_Processus?.PR_Libelle}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                      PILOTE : <span className="text-white">{paq.PAQ_QualityManager?.U_FirstName} {paq.PAQ_QualityManager?.U_LastName}</span>
                    </p>
                  </div>
                  <div className="flex justify-end pt-6 relative z-10">
                    <ArrowRight className="text-blue-500 group-hover:translate-x-3 transition-transform" />
                  </div>
                </Link>
              )) : (
                <div className="col-span-2 py-20 text-center border-2 border-dashed border-white/5 rounded-[3.5rem] opacity-20">
                  <p className="font-black uppercase italic tracking-widest">Aucun plan d&apos;actions n&apos;a été initialisé</p>
                </div>
              )}
            </div>
          </div>

          {/* 🧨 RADAR DES URGENCES (§10.2 - RÉACTION AUX ÉCARTS) */}
          <aside className="col-span-12 lg:col-span-4 bg-red-500/5 border border-red-500/10 p-10 rounded-[3.5rem] h-fit shadow-xl">
            <h3 className="text-xl font-black uppercase italic text-red-500 mb-10 flex items-center gap-4 leading-none">
              <ShieldAlert className="animate-pulse" /> Radar Urgences
            </h3>
            <div className="space-y-6">
               {data?.enRetard?.length > 0 ? data.enRetard.slice(0, 5).map((action: any) => (
                  <div key={action.ACT_Id} className="p-6 bg-white/2 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/5 transition-all">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-red-500 italic mb-2 tracking-widest uppercase">
                          ÉCHÉANCE : {new Date(action.ACT_Deadline).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-black uppercase italic truncate pr-4 text-white/90">{action.ACT_Title}</p>
                      </div>
                      <button 
                        onClick={() => setEditingAction(action)} 
                        className="p-3 text-slate-600 hover:text-white hover:bg-red-500/20 rounded-xl transition-all cursor-pointer bg-transparent border-none"
                      >
                        <Edit3 size={18} />
                      </button>
                  </div>
               )) : (
                <p className="text-center py-10 text-slate-600 text-[10px] font-black uppercase italic tracking-widest">
                  Félicitations : Aucun retard critique
                </p>
               )}
            </div>
          </aside>
        </div>
      </div>

      {/* 📟 MODAL DE RECTIFICATION (SIDE-DRAWER) */}
      {editingAction && (
        <>
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-100 animate-in fade-in duration-300" onClick={() => setEditingAction(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-137.5 bg-[#0F172A] z-110 p-16 animate-in slide-in-from-right duration-500 border-l border-white/10 shadow-[0_0_100px_rgba(37,99,235,0.2)]">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-16 border-b border-white/5 pb-10">
              RECTIFICATION <span className="text-blue-500">ACTION</span>
            </h2>
            <form onSubmit={handleUpdate} className="space-y-12 text-left">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">Intitulé de la mesure</label>
                <input 
                  type="text" 
                  value={editingAction.ACT_Title} 
                  onChange={e => setEditingAction({...editingAction, ACT_Title: e.target.value.toUpperCase()})} 
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl p-7 text-sm font-black uppercase italic text-white outline-none focus:border-blue-500 shadow-inner" 
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">État d&apos;avancement</label>
                <select 
                  value={editingAction.ACT_Status} 
                  onChange={e => setEditingAction({...editingAction, ACT_Status: e.target.value})} 
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl p-7 text-xs font-black uppercase italic text-white outline-none focus:border-blue-500 cursor-pointer appearance-none"
                >
                  <option value="A_FAIRE">À FAIRE</option>
                  <option value="EN_COURS">EN COURS</option>
                  <option value="TERMINEE">TERMINÉE</option>
                  <option value="ANNULEE">ANNULÉE</option>
                </select>
              </div>
              <div className="pt-10">
                <button type="submit" className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white rounded-4xl font-black uppercase italic text-[11px] tracking-[0.2em] transition-all shadow-3xl border-none cursor-pointer flex items-center justify-center gap-4 active:scale-95">
                  <Save size={20} /> Sceller la Mutation
                </button>
              </div>
            </form>
            <button onClick={() => setEditingAction(null)} className="absolute top-10 right-10 text-slate-500 hover:text-white transition-colors border-none bg-transparent cursor-pointer"><X size={32} /></button>
          </div>
        </>
      )}
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function StatCard({ title, value, icon: Icon, color, subtitle }: any) {
  const themes: any = { 
    blue: "text-blue-500 border-blue-500/20", 
    red: "text-red-500 border-red-500/20 shadow-red-500/5", 
    emerald: "text-emerald-500 border-emerald-500/20", 
    orange: "text-orange-500 border-orange-500/20" 
  };
  return (
    <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group hover:bg-slate-900/60 transition-all">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border-2 transition-transform group-hover:rotate-6 ${themes[color]}`}>
        <Icon size={32} />
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">{title}</p>
      <p className="text-6xl font-black italic tracking-tighter leading-none mb-2">{value}</p>
      <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">{subtitle}</p>
    </div>
  );
}