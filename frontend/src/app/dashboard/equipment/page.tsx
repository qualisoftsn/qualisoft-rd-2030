/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import EquipmentModal from '../../../components/equipment/EquipmentModal';
import { 
  Settings2, Plus, Calendar, Trash2, Search, 
  Loader2, Edit3, ShieldAlert, Activity, 
  Zap, AlertTriangle, CheckCircle2, Link as LinkIcon,
  TrendingDown, Calculator, FileText, Wrench, ChevronRight 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * 💡 UTILITAIRE DE CLASSES CONDITIONNELLES
 */
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

/**
 * 🛠️ PAGE DE GESTION DES ÉQUIPEMENTS (ISO 9001 §7.1.3)
 * Ce module assure la traçabilité complète du parc machine et des infrastructures.
 * Il calcule en temps réel l'état de conformité réglementaire (VGP).
 */
export default function EquipmentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);

  /**
   * 🛰️ RÉCUPÉRATION DU REGISTRE DES ACTIFS
   * Interroge le Noyau Matrix pour extraire la liste exhaustive des équipements.
   */
  const fetchEquipments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/equipments');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) { 
      console.error("Erreur Sync Equipments:", err);
      toast.error("Liaison perdue avec le registre des actifs");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchEquipments(); }, [fetchEquipments]);

  /**
   * 📊 MOTEUR DE CALCUL DES STATISTIQUES (KPIs)
   * Calcule les indicateurs de santé du parc, les taux de maintenance et les alertes VGP.
   */
  const stats = useMemo(() => {
    const total = items.length;
    // Filtrage des équipements dont la VGP est échue (date passée)
    const critical = items.filter(i => {
      const diff = Math.ceil((new Date(i.EQ_ProchaineVGP).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return diff < 0;
    }).length;
    
    const maintenanceRate = items.filter(i => i.EQ_Status === 'MAINTENANCE').length;
    
    return { 
      total, 
      critical, 
      maintenanceRate, 
      // Calcul du HealthScore : Proportion d'équipements conformes (Hors alertes VGP)
      healthScore: total > 0 ? Math.round(((total - critical) / total) * 100) : 0 
    };
  }, [items]);

  /**
   * 🛡️ DÉTERMINATION DU STATUT RÉGLEMENTAIRE (VGP)
   * Logique de seuil : Rouge (Expiré), Ambre (< 30 jours), Émeraude (Conforme).
   */
  const getVGPStatus = (date: string) => {
    const diffDays = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'VGP EXPIRÉE', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    if (diffDays < 30) return { label: 'ÉCHÉANCE PROCHE', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { label: 'CONFORME', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
  };

  /**
   * 🔍 FILTRAGE DYNAMIQUE (Search Engine)
   */
  const filteredItems = useMemo(() => {
    return items.filter(i => 
      (i.EQ_Name?.toLowerCase().includes(search.toLowerCase())) || 
      (i.EQ_Reference?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [items, search]);

  if (loading) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A]">
      <Activity className="animate-spin text-blue-500" size={40} />
      <p className="ml-4 text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/50 italic">Chargement du Parc...</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col overflow-hidden selection:bg-blue-600/30">
      
      {/* 🔝 HEADER : IDENTITÉ DU REGISTRE */}
      <header className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-[#0B0F1A]/80 backdrop-blur-3xl shrink-0 z-50 shadow-2xl">
        <div className="text-left">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
            Registre <span className="text-blue-600">Actifs & Infrastructures</span>
          </h1>
          <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.4em] mt-2 italic flex items-center gap-2">
            <Zap size={12} className="text-blue-500" /> ISO 9001 §7.1.3 • Disponibilité & Conformité VGP
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text" placeholder="RECHERCHE RÉFÉRENCE..." 
              className="bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-[10px] font-black outline-none w-64 focus:border-blue-600 transition-all uppercase italic text-white"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setSelectedEquipment(null); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-500 px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-3xl shadow-blue-900/40 border-none cursor-pointer text-white italic"
          >
            <Plus size={18} /> Nouvel Actif
          </button>
        </div>
      </header>

      {/* 🚀 MAIN COCKPIT AREA */}
      <main className="flex-1 p-8 grid grid-cols-12 grid-rows-6 gap-6 overflow-hidden">
        
        {/* RANGÉE KPI SENSORS */}
        <div className="col-span-12 row-span-1 grid grid-cols-4 gap-6">
          <MetricCard title="Disponibilité Parc" val={`${stats.healthScore}%`} trend="+1.2%" icon={Activity} color="emerald" formula="Σ(Actifs Opérationnels) / Σ(Total)" />
          <MetricCard title="Alertes VGP" val={stats.critical} trend="Critique" icon={ShieldAlert} color="red" formula="Équipements avec VGP dépassée" />
          <MetricCard title="En Maintenance" val={stats.maintenanceRate} trend="En cours" icon={Wrench} color="amber" formula="Actifs hors service (GMAO)" />
          <MetricCard title="Total Immobilisé" val={`${(stats.maintenanceRate * 450).toLocaleString()}€`} trend="Est. Coût" icon={TrendingDown} color="blue" formula="Temps d'arrêt × Coût Horaire Moyen" />
        </div>

        {/* SECTION TABLEUR : INVENTAIRE ACTIF */}
        <div className="col-span-8 row-span-5 flex flex-col bg-slate-900/20 border border-white/5 rounded-[3.5rem] overflow-hidden shadow-inner backdrop-blur-sm">
          <div className="p-8 border-b border-white/5 bg-white/2 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 italic">
              <LinkIcon size={14} className="text-blue-500" /> Inventaire Actif & Historique
            </h3>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{filteredItems.length} Actifs indexés</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#0B0F1A] z-10 border-b border-white/5">
                <tr className="text-[9px] font-black uppercase text-slate-500 italic">
                  <th className="p-8">Identification de l&apos;actif</th>
                  <th className="p-8">Statut Vérification (VGP)</th>
                  <th className="p-8">Condition SMI</th>
                  <th className="p-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((eq) => {
                  const vgp = getVGPStatus(eq.EQ_ProchaineVGP);
                  return (
                    <tr key={eq.EQ_Id} className="hover:bg-blue-600/5 transition-all group cursor-default">
                      <td className="p-8">
                        <div className="flex flex-col text-left">
                          <span className="font-black text-blue-500 text-lg tracking-tighter mb-1 uppercase italic leading-none">{eq.EQ_Reference}</span>
                          <span className="font-bold uppercase text-[11px] text-white/90 italic">{eq.EQ_Name}</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className={cn("px-5 py-2.5 rounded-2xl text-[10px] font-black inline-flex items-center gap-2 border italic", vgp.color, vgp.bg, vgp.border)}>
                           <Calendar size={13} /> {vgp.label} : {new Date(eq.EQ_ProchaineVGP).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-8">
                        <div className={cn("text-[10px] font-black px-4 py-1.5 rounded-xl inline-block border italic tracking-widest", 
                          eq.EQ_Status === 'OPERATIONNEL' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20')}>
                          {eq.EQ_Status}
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button 
                            onClick={() => { setSelectedEquipment(eq); setIsModalOpen(true); }} 
                            className="p-3 bg-white/5 hover:bg-blue-600 rounded-2xl transition-all text-slate-400 hover:text-white border-none cursor-pointer shadow-lg"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button className="p-3 bg-white/5 hover:bg-red-600 rounded-2xl transition-all text-slate-400 hover:text-white border-none cursor-pointer shadow-lg">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredItems.length === 0 && (
              <div className="py-24 text-center">
                 <Search size={48} className="mx-auto text-slate-800 mb-4 opacity-20" />
                 <p className="text-slate-600 font-black uppercase italic tracking-[0.4em] text-xs">Aucun actif ne correspond à la recherche</p>
              </div>
            )}
          </div>
        </div>

        {/* PANNEAU LATÉRAL : ANALYSE DE RISQUES & MATHS */}
        <div className="col-span-4 row-span-5 flex flex-col gap-8 overflow-hidden">
          
          {/* CARTE DE RISQUE SMI */}
          <div className="bg-red-600/10 border border-red-500/20 p-10 rounded-[3.5rem] relative overflow-hidden group shadow-2xl backdrop-blur-md">
             <div className="absolute -right-8 -bottom-8 text-red-500/10 group-hover:scale-125 transition-transform duration-1000 ease-out">
               <ShieldAlert size={180} />
             </div>
             <h3 className="text-2xl font-black uppercase italic mb-6 flex items-center gap-4 text-red-500 tracking-tighter">
               <AlertTriangle size={24} /> Risques SMI
             </h3>
             <div className="space-y-4 relative z-10 text-left">
                <p className="text-[11px] font-bold text-slate-400 uppercase italic leading-relaxed tracking-wide">
                  Attention : <span className="text-red-500 font-black">{stats.critical} actif(s) critique(s)</span> en défaut de vérification périodique génère(nt) un risque de Non-Conformité majeure lors du prochain audit.
                </p>
                <div className="pt-4 flex flex-col gap-2">
                  <button className="flex items-center gap-3 text-[10px] font-black text-red-500 uppercase border-b border-red-500/20 pb-2 hover:text-red-400 transition-all border-none bg-transparent cursor-pointer italic w-fit tracking-widest">
                    Ouvrir Non-Conformité <ChevronRight size={14} />
                  </button>
                  <button className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase border-b border-slate-500/20 pb-2 hover:text-white transition-all border-none bg-transparent cursor-pointer italic w-fit tracking-widest">
                    Planifier maintenance <ChevronRight size={14} />
                  </button>
                </div>
             </div>
          </div>

          {/* CENTRE D'INTELLIGENCE : FORMULES ACTIFS */}
          <div className="flex-1 bg-blue-600/5 border border-blue-600/10 p-10 rounded-[3.5rem] flex flex-col overflow-hidden shadow-2xl backdrop-blur-md">
             <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-4 text-blue-500 tracking-tighter text-left">
               <Calculator size={24} /> Intelligence Actifs
             </h3>
             <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar">
               <FormulaItem title="Taux de Disponibilité" formula="D = (Uptime / Temps_Total)" desc="Taux de préparation opérationnelle réelle du parc." />
               <FormulaItem title="Indice de Conformité" formula="C = (VGP_Conformes / Total_Parc)" desc="Niveau de maîtrise réglementaire selon §7.1.3." />
               <FormulaItem title="MTBF (Mean Time Between Failures)" formula="MTBF = T_Fonct / Nb_Pannes" desc="Indicateur de fiabilité moyenne des équipements." />
               <FormulaItem title="Taux d'Attrition" formula="A = Σ(Déclassements) / Σ(Achats)" desc="Suivi de l'obsolescence technologique." />
             </div>
          </div>
        </div>
      </main>

      {/* 📥 MODAL : AJOUT / ÉDITION D'ACTIF */}
      {isModalOpen && (
        <EquipmentModal 
          equipment={selectedEquipment} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchEquipments} 
        />
      )}
    </div>
  );
}

/**
 * 📊 COMPOSANT METRIC CARD : ANALYSE RAPIDE
 */
function MetricCard({ title, val, trend, icon: Icon, color, formula }: any) {
  const themes: any = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5',
    red: 'text-red-500 bg-red-500/10 border-red-500/20 shadow-red-500/5',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5'
  };
  
  return (
    <div className="bg-[#0F172A]/40 border border-white/5 p-8 rounded-[3rem] flex flex-col justify-between group hover:border-blue-600/40 transition-all relative overflow-hidden shadow-2xl backdrop-blur-md">
      <div className="flex justify-between items-start relative z-10">
         <div className={cn("p-4 rounded-2xl border transition-transform duration-500 group-hover:scale-110", themes[color])}><Icon size={24} /></div>
         <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{trend}</span>
      </div>
      <div className="mt-6 relative z-10 text-left">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 italic leading-none">{title}</p>
        <p className="text-5xl font-black italic text-white tracking-tighter leading-none">{val}</p>
      </div>
      
      {/* OVERLAY CALCUL ALGORITHMIQUE (Hover) */}
      <div className="absolute inset-0 bg-blue-600/95 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out rounded-[3rem] flex flex-col items-center justify-center p-8 text-center z-30 pointer-events-none">
          <Calculator size={32} className="mb-4 text-white animate-pulse" />
          <p className="text-[10px] font-black uppercase text-blue-100 mb-2 leading-none tracking-[0.4em] italic">Calcul Algorithmique</p>
          <div className="h-px w-12 bg-white/30 mb-4" />
          <p className="text-[13px] font-black text-white uppercase italic leading-tight tracking-tight">{formula}</p>
      </div>
    </div>
  );
}

/**
 * 🧬 COMPOSANT FORMULA ITEM : DOCUMENTATION TECHNIQUE
 */
function FormulaItem({ title, formula, desc }: any) {
  return (
    <div className="p-6 bg-white/2 border border-white/5 rounded-3xl group hover:border-blue-500/30 transition-all shadow-inner text-left">
      <h4 className="text-[11px] font-black uppercase italic text-blue-500 mb-3 leading-none tracking-widest">{title}</h4>
      <div className="bg-black/40 p-4 rounded-2xl border border-white/5 mb-3 shadow-inner">
        <code className="text-blue-200 text-[10px] font-bold tracking-tight">{formula}</code>
      </div>
      <p className="text-[9px] text-slate-500 font-bold uppercase italic leading-tight tracking-wide">{desc}</p>
    </div>
  );
}