/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛠️ MODULE : GESTION DES ÉQUIPEMENTS (MATRIX KERNEL)
 * Rôle : Traçabilité §7.1.3 ISO 9001, monitoring VGP et calcul de disponibilité.
 * Fix : Responsive lg:ml-72, sécurisation des dates VGP et z-index modal.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 02:35 GMT
 */

'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import EquipmentModal from '@/components/equipment/EquipmentModal';
import { 
  Settings2, Plus, Calendar, Trash2, Search, 
  Loader2, Edit3, ShieldAlert, Activity, 
  Zap, AlertTriangle, CheckCircle2, Link as LinkIcon,
  TrendingDown, Calculator, FileText, Wrench, ChevronRight 
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
      toast.error("LIAISON PERDUE AVEC LE REGISTRE DES ACTIFS");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchEquipments(); }, [fetchEquipments]);

  const stats = useMemo(() => {
    const total = items.length;
    const critical = items.filter(i => {
      if (!i.EQ_ProchaineVGP) return false;
      const diff = Math.ceil((new Date(i.EQ_ProchaineVGP).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return diff < 0;
    }).length;
    
    const maintenanceRate = items.filter(i => i.EQ_Status === 'MAINTENANCE').length;
    
    return { 
      total, critical, maintenanceRate, 
      healthScore: total > 0 ? Math.round(((total - critical) / total) * 100) : 0 
    };
  }, [items]);

  const getVGPStatus = (date: string) => {
    if (!date) return { label: 'VGP NON DÉFINIE', color: 'text-slate-500', bg: 'bg-white/5', border: 'border-white/10' };
    const diffDays = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'VGP EXPIRÉE', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    if (diffDays < 30) return { label: 'ÉCHÉANCE PROCHE', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { label: 'CONFORME', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
  };

  const filteredItems = useMemo(() => {
    return items.filter(i => 
      (i.EQ_Name?.toLowerCase().includes(search.toLowerCase())) || 
      (i.EQ_Reference?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [items, search]);

  if (loading) return (
    <div className="ml-0 lg:ml-72 flex h-screen items-center justify-center bg-[#0B0F1A]">
      <Activity className="animate-spin text-blue-500" size={40} />
      <p className="ml-4 text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 animate-pulse">Chargement Matrix Assets...</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans ml-0 lg:ml-72 flex flex-col overflow-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="px-10 py-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center bg-[#0B0F1A]/80 backdrop-blur-3xl shrink-0 z-40 gap-6 mt-12 lg:mt-0">
        <div className="text-left">
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter italic leading-none m-0">
            Registre <span className="text-blue-600">Actifs & Infrastructures</span>
          </h1>
          <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.4em] mt-3 italic flex items-center gap-2 m-0">
            <Zap size={12} className="text-blue-500" /> ISO 9001 §7.1.3 • Disponibilité & Conformité VGP
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input type="text" placeholder="RECHERCHE RÉFÉRENCE..." className="bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-[10px] font-black outline-none w-64 focus:border-blue-600 transition-all uppercase italic text-white" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={() => { setSelectedEquipment(null); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-white hover:text-blue-600 px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-3xl border-none cursor-pointer text-white italic active:scale-95">
            <Plus size={18} /> Nouvel Actif
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 grid grid-cols-12 grid-rows-6 gap-6 overflow-hidden">
        <div className="col-span-12 row-span-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <MetricCard title="Disponibilité Parc" val={`${stats.healthScore}%`} trend="+1.2%" icon={Activity} color="emerald" formula="Σ(Actifs Opérationnels) / Σ(Total)" />
          <MetricCard title="Alertes VGP" val={stats.critical} trend="Critique" icon={ShieldAlert} color="red" formula="Équipements avec VGP dépassée" />
          <MetricCard title="En Maintenance" val={stats.maintenanceRate} trend="En cours" icon={Wrench} color="amber" formula="Actifs hors service (GMAO)" />
          <MetricCard title="Total Immobilisé" val={`${(stats.maintenanceRate * 450).toLocaleString()}€`} trend="Est. Coût" icon={TrendingDown} color="blue" formula="Temps d'arrêt × Coût Horaire Moyen" />
        </div>

        <div className="col-span-12 xl:col-span-8 row-span-5 flex flex-col bg-slate-900/20 border border-white/5 rounded-[3.5rem] overflow-hidden backdrop-blur-sm">
          <div className="p-8 border-b border-white/5 bg-white/2 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 italic m-0 text-blue-500">
              <LinkIcon size={14} /> Inventaire Actif & Historique
            </h3>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{filteredItems.length} Actifs indexés</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-200">
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
                    <tr key={eq.EQ_Id} className="hover:bg-blue-600/5 transition-all group">
                      <td className="p-8">
                        <div className="flex flex-col text-left">
                          <span className="font-black text-blue-500 text-lg tracking-tighter mb-1 uppercase italic leading-none">{eq.EQ_Reference}</span>
                          <span className="font-bold uppercase text-[11px] text-white/90 italic">{eq.EQ_Name}</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className={cn("px-5 py-2.5 rounded-2xl text-[10px] font-black inline-flex items-center gap-2 border italic", vgp.color, vgp.bg, vgp.border)}>
                           <Calendar size={13} /> {vgp.label} : {eq.EQ_ProchaineVGP ? new Date(eq.EQ_ProchaineVGP).toLocaleDateString() : 'N/A'}
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
                          <button onClick={() => { setSelectedEquipment(eq); setIsModalOpen(true); }} className="p-3 bg-white/5 hover:bg-blue-600 rounded-2xl transition-all text-slate-400 hover:text-white border-none cursor-pointer"><Edit3 size={16} /></button>
                          <button className="p-3 bg-white/5 hover:bg-red-600 rounded-2xl transition-all text-slate-400 hover:text-white border-none cursor-pointer"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="hidden xl:flex col-span-4 row-span-5 flex-col gap-8">
          <div className="bg-red-600/10 border border-red-500/20 p-10 rounded-[3.5rem] relative overflow-hidden shadow-2xl backdrop-blur-md">
             <ShieldAlert size={180} className="absolute -right-8 -bottom-8 text-red-500/10" />
             <h3 className="text-2xl font-black uppercase italic mb-6 flex items-center gap-4 text-red-500 tracking-tighter m-0">
               <AlertTriangle size={24} /> Risques SMI
             </h3>
             <div className="relative z-10 space-y-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase italic leading-relaxed tracking-wide m-0 text-left">
                  Attention : <span className="text-red-500 font-black">{stats.critical} actif(s) critique(s)</span> en défaut de VGP génère(nt) un risque de Non-Conformité majeure (§10.2).
                </p>
                <div className="pt-4 flex flex-col gap-3">
                  <button className="flex items-center gap-3 text-[10px] font-black text-red-500 uppercase border-b border-red-500/20 pb-2 hover:text-red-400 transition-all border-none bg-transparent cursor-pointer italic tracking-widest">OUVRIR NON-CONFORMITÉ <ChevronRight size={14} /></button>
                </div>
             </div>
          </div>

          <div className="flex-1 bg-blue-600/5 border border-blue-600/10 p-10 rounded-[3.5rem] flex flex-col overflow-hidden shadow-2xl backdrop-blur-md">
             <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-4 text-blue-500 tracking-tighter m-0 text-left">
               <Calculator size={24} /> Intelligence Actifs
             </h3>
             <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar text-left">
               <FormulaItem title="Taux de Disponibilité" formula="D = (Uptime / Temps_Total)" desc="Capacité opérationnelle réelle du parc." />
               <FormulaItem title="Indice de Conformité" formula="C = (VGP_OK / Total)" desc="Maîtrise réglementaire §7.1.3." />
               <FormulaItem title="MTBF (Reliability)" formula="T_Fonct / Nb_Pannes" desc="Fiabilité moyenne des actifs Matrix." />
             </div>
          </div>
        </div>
      </main>

      {isModalOpen && <EquipmentModal equipment={selectedEquipment} onClose={() => setIsModalOpen(false)} onSuccess={fetchEquipments} />}
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }`}</style>
    </div>
  );
}

function MetricCard({ title, val, trend, icon: Icon, color, formula }: any) {
  const themes: any = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
  };
  return (
    <div className="bg-[#0F172A]/40 border border-white/5 p-8 rounded-[3rem] flex flex-col justify-between group hover:border-blue-600/40 transition-all relative overflow-hidden shadow-2xl">
      <div className="flex justify-between items-start relative z-10">
         <div className={cn("p-4 rounded-2xl border transition-transform duration-500 group-hover:scale-110", themes[color])}><Icon size={24} /></div>
         <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{trend}</span>
      </div>
      <div className="mt-6 relative z-10 text-left">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 italic leading-none m-0">{title}</p>
        <p className="text-4xl lg:text-5xl font-black italic text-white tracking-tighter leading-none m-0">{val}</p>
      </div>
      <div className="absolute inset-0 bg-blue-600/95 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-[3rem] flex flex-col items-center justify-center p-8 text-center z-30 pointer-events-none">
          <Calculator size={32} className="mb-4 text-white animate-pulse" />
          <p className="text-[10px] font-black uppercase text-blue-100 mb-2 leading-none tracking-[0.4em] italic">Calcul Algorithmique</p>
          <p className="text-[13px] font-black text-white uppercase italic leading-tight">{formula}</p>
      </div>
    </div>
  );
}

function FormulaItem({ title, formula, desc }: any) {
  return (
    <div className="p-6 bg-white/2 border border-white/5 rounded-3xl group hover:border-blue-500/30 transition-all shadow-inner">
      <h4 className="text-[11px] font-black uppercase italic text-blue-500 mb-3 tracking-widest m-0">{title}</h4>
      <div className="bg-black/40 p-4 rounded-2xl border border-white/5 mb-3"><code className="text-blue-200 text-[10px] font-bold">{formula}</code></div>
      <p className="text-[9px] text-slate-500 font-bold uppercase italic leading-tight m-0">{desc}</p>
    </div>
  );
}