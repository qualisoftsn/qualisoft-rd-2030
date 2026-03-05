/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 MODULE : GESTION DES ÉQUIPEMENTS §7.1.3 (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Traçabilité des actifs, monitoring VGP et calcul de disponibilité.
 * DESIGN : Layout 100dvh Matrix, Zéro Scroll Global, ClickUp Density.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 11:32 GMT
 */

'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import EquipmentModal from '@/components/equipment/EquipmentModal';
import { 
  Plus, Calendar, Trash2, Search, Edit3, ShieldAlert, Activity, 
  Zap, AlertTriangle, Link as LinkIcon, TrendingDown, 
  Calculator, Wrench, ChevronRight, RefreshCcw 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function EquipmentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);

  const fetchEquipments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/equipments');
      setItems(res.data?.data || res.data || []);
    } catch (err) { 
      toast.error("RUPTURE DE LIAISON : REGISTRE DES ACTIFS INACCESSIBLE");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEquipments(); }, [fetchEquipments]);

  // --- MOTEUR DE CALCUL SMI ---
  const stats = useMemo(() => {
    const total = items.length;
    const critical = items.filter(i => {
      if (!i.EQ_ProchaineVGP) return false;
      return new Date(i.EQ_ProchaineVGP).getTime() < new Date().getTime();
    }).length;
    
    const maintenanceRate = items.filter(i => i.EQ_Status === 'MAINTENANCE').length;
    
    return { 
      total, critical, maintenanceRate, 
      healthScore: total > 0 ? Math.round(((total - critical) / total) * 100) : 0 
    };
  }, [items]);

  const getVGPStatus = (date: string) => {
    if (!date) return { label: 'VGP NON DÉFINIE', color: 'text-slate-500', bg: 'bg-white/5' };
    const diffDays = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'VGP EXPIRÉE', color: 'text-rose-500', bg: 'bg-rose-500/10' };
    if (diffDays < 30) return { label: 'ÉCHÉANCE PROCHE', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { label: 'CONFORME', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  };

  if (loading) return <LoadingScreen label="Chargement Matrix Assets..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER FIXE */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2">
          <h1 className="text-3xl lg:text-5xl tracking-tighter leading-none m-0">Registre <span className="text-blue-500">Actifs</span></h1>
          <p className="text-slate-500 text-[9px] tracking-[0.4em] m-0 flex items-center gap-2">
            <Zap size={12} className="text-blue-500" /> ISO 9001 §7.1.3 • Master Asset Management
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input placeholder="RECHERCHE RÉFÉRENCE..." className="bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-black outline-none w-64 focus:border-blue-600 text-white italic" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={() => { setSelectedEquipment(null); setIsModalOpen(true); }} className="bg-blue-600 px-8 py-4 rounded-2xl text-[10px] flex items-center gap-3 transition-all border-none cursor-pointer text-white shadow-xl hover:bg-white hover:text-blue-600">
            <Plus size={18} strokeWidth={3} /> Nouvel Actif
          </button>
        </div>
      </header>

      {/* 📜 ZONE DE TRAVAIL (Scroll Isolé) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-10">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <MetricTile title="Disponibilité" val={`${stats.healthScore}%`} icon={Activity} color="emerald" formula="Σ(Actifs Opérationnels) / Σ(Total)" />
          <MetricTile title="Alertes VGP" val={stats.critical} icon={ShieldAlert} color="rose" formula="Équipements avec VGP dépassée" />
          <MetricTile title="Maintenance" val={stats.maintenanceRate} icon={Wrench} color="amber" formula="Actifs hors service (GMAO)" />
          <MetricTile title="Risque Financier" val={`${(stats.maintenanceRate * 450).toLocaleString()}€`} icon={TrendingDown} color="blue" formula="Arrêt × Coût Horaire" />
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Table Content */}
          <div className="col-span-12 xl:col-span-8 bg-[#151B2B] border-2 border-white/5 rounded-[3.5rem] overflow-hidden shadow-4xl flex flex-col min-h-125">
            <div className="p-8 border-b border-white/5 bg-black/20 flex justify-between items-center">
               <h3 className="text-sm font-black italic m-0 flex items-center gap-3"><LinkIcon size={14} className="text-blue-500"/> Inventaire des infrastructures</h3>
               <span className="text-[10px] text-slate-500">{items.length} ACTIFS RÉPERTORIÉS</span>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 text-[9px] text-slate-500 tracking-[0.2em] border-b border-white/5 font-black italic">
                    <th className="px-8 py-5">Identification</th>
                    <th className="px-8 py-5 text-center">Statut VGP</th>
                    <th className="px-8 py-5 text-center">État SMI</th>
                    <th className="px-8 py-5 text-right">Pilotage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-bold italic">
                  {items.filter(i => (i.EQ_Name+i.EQ_Reference).toLowerCase().includes(search.toLowerCase())).map(eq => {
                    const vgp = getVGPStatus(eq.EQ_ProchaineVGP);
                    return (
                      <tr key={eq.EQ_Id} className="hover:bg-blue-600/5 transition-all group">
                        <td className="px-8 py-6">
                          <p className="text-lg font-black text-blue-500 m-0 tracking-tighter leading-none">{eq.EQ_Reference}</p>
                          <p className="text-[10px] text-white/60 mt-1 m-0">{eq.EQ_Name}</p>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={cn("px-4 py-2 rounded-xl text-[9px] border", vgp.color, vgp.bg, "border-white/5")}>
                            {vgp.label} : {eq.EQ_ProchaineVGP ? new Date(eq.EQ_ProchaineVGP).toLocaleDateString() : '---'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={cn("px-4 py-2 rounded-xl text-[9px] border", eq.EQ_Status === 'OPERATIONNEL' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500", "border-white/5")}>
                            {eq.EQ_Status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right opacity-0 group-hover:opacity-100 transition-all">
                           <div className="flex justify-end gap-3">
                              <button onClick={() => { setSelectedEquipment(eq); setIsModalOpen(true); }} className="p-3 bg-white/5 text-slate-500 hover:text-white rounded-xl border-none cursor-pointer"><Edit3 size={16}/></button>
                              <button className="p-3 bg-white/5 text-slate-500 hover:text-rose-500 rounded-xl border-none cursor-pointer"><Trash2 size={16}/></button>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar Matrix (ISO Risks) */}
          <div className="col-span-12 xl:col-span-4 space-y-8">
            <div className="bg-rose-600/10 border-2 border-rose-500/20 p-10 rounded-[3.5rem] relative overflow-hidden">
               <ShieldAlert size={150} className="absolute -right-10 -bottom-10 text-rose-500/10" />
               <h3 className="text-xl font-black text-rose-500 mb-6 flex items-center gap-3 m-0 leading-none"><AlertTriangle size={24}/> Risques SMI §10.2</h3>
               <p className="text-[11px] text-slate-400 leading-relaxed m-0 font-black italic">
                 ATTENTION : <span className="text-rose-500">{stats.critical} ACTIFS</span> EN DÉFAUT DE VGP GÉNÈRENT UN RISQUE DE NON-CONFORMITÉ MAJEURE LORS DU PROCHAIN AUDIT.
               </p>
               <button className="mt-8 text-[10px] text-rose-500 bg-transparent border-none cursor-pointer underline flex items-center gap-2 font-black italic">Lancer action corrective <ChevronRight size={14}/></button>
            </div>

            <div className="bg-blue-600/5 border-2 border-blue-500/10 p-10 rounded-[3.5rem]">
               <h3 className="text-xl font-black text-blue-500 mb-8 flex items-center gap-3 m-0 leading-none"><Calculator size={24}/> Asset Intelligence</h3>
               <div className="space-y-6">
                 <div className="p-6 bg-white/2 border border-white/5 rounded-3xl">
                   <h4 className="text-[10px] text-blue-500 mb-3 m-0 font-black italic uppercase">Taux de Disponibilité</h4>
                   <code className="text-xs text-white bg-black/40 px-3 py-1 rounded-lg">D = (Uptime / Temps_Total)</code>
                 </div>
                 <div className="p-6 bg-white/2 border border-white/5 rounded-3xl">
                   <h4 className="text-[10px] text-blue-500 mb-3 m-0 font-black italic uppercase">MTBF (Reliability)</h4>
                   <code className="text-xs text-white bg-black/40 px-3 py-1 rounded-lg">T_Fonct / Nb_Pannes</code>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && <EquipmentModal equipment={selectedEquipment} onClose={() => setIsModalOpen(false)} onSuccess={fetchEquipments} />}
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.2); border-radius: 10px; }` }} />
    </div>
  );
}

// --- SHARED COMPONENTS ---
function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 lg:pl-72">
      <RefreshCcw className="animate-spin text-blue-500" size={60} strokeWidth={1} />
      <span className="text-[10px] font-black uppercase tracking-[1em] text-blue-500 animate-pulse italic text-center px-10">{label}</span>
    </div>
  );
}

function MetricTile({ title, val, icon: Icon, color, formula }: any) {
  const themes: any = { emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10", blue: "text-blue-500 bg-blue-500/5 border-blue-500/10", rose: "text-rose-500 bg-rose-500/5 border-rose-500/10", amber: "text-amber-500 bg-amber-500/5 border-amber-500/10" };
  return (
    <div className={cn("p-8 bg-[#151B2B] border-2 border-white/5 rounded-[3rem] transition-all hover:scale-105 group relative overflow-hidden shadow-2xl")}>
       <div className="flex justify-between items-start mb-6">
          <div className={cn("p-4 rounded-2xl border transition-transform group-hover:scale-110", themes[color])}><Icon size={24}/></div>
       </div>
       <p className="text-[9px] text-slate-500 mb-2 tracking-widest">{title}</p>
       <h3 className="text-4xl font-black italic tracking-tighter text-white m-0 leading-none">{val}</h3>
       <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-8 text-center pointer-events-none">
          <Calculator size={32} className="mb-4 text-white animate-pulse" />
          <p className="text-[12px] font-black text-white italic uppercase leading-tight">{formula}</p>
       </div>
    </div>
  );
}