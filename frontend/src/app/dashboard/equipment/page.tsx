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
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) { 
      toast.error("Liaison perdue avec le registre des actifs");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchEquipments(); }, [fetchEquipments]);

  const stats = useMemo(() => {
    const total = items.length;
    const critical = items.filter(i => {
      const diff = Math.ceil((new Date(i.EQ_ProchaineVGP).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return diff < 0;
    }).length;
    const maintenanceRate = items.filter(i => i.EQ_Status === 'MAINTENANCE').length;
    return { total, critical, maintenanceRate, healthScore: total > 0 ? Math.round(((total - critical) / total) * 100) : 0 };
  }, [items]);

  const getVGPStatus = (date: string) => {
    const diffDays = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'VGP EXPIRÉE', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    if (diffDays < 30) return { label: 'ÉCHÉANCE PROCHE', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { label: 'CONFORME', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
  };

  const filteredItems = items.filter(i => 
    (i.EQ_Name?.toLowerCase().includes(search.toLowerCase())) || 
    (i.EQ_Reference?.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A]">
      <Activity className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col overflow-hidden">
      
      <header className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-[#0B0F1A]/80 backdrop-blur-3xl shrink-0">
        <div>
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
              className="bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-[10px] font-black outline-none w-64 focus:border-blue-600 transition-all uppercase"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setSelectedEquipment(null); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-500 px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-3xl shadow-blue-900/40"
          >
            <Plus size={18} /> Nouvel Actif
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 grid grid-cols-12 grid-rows-6 gap-6 overflow-hidden">
        
        <div className="col-span-12 row-span-1 grid grid-cols-4 gap-6">
          <MetricCard title="Disponibilité Parc" val={`${stats.healthScore}%`} trend="+1.2%" icon={Activity} color="emerald" formula="Σ(Actifs Opérationnels) / Σ(Total)" />
          <MetricCard title="Alertes VGP" val={stats.critical} trend="Critique" icon={ShieldAlert} color="red" formula="Équipements avec VGP dépassée" />
          <MetricCard title="En Maintenance" val={stats.maintenanceRate} trend="En cours" icon={Wrench} color="amber" formula="Actifs hors service" />
          <MetricCard title="Total Immobilisé" val={`${(stats.maintenanceRate * 450).toLocaleString()}€`} trend="Est. Coût" icon={TrendingDown} color="blue" formula="Temps d'arrêt × Coût Horaire" />
        </div>

        <div className="col-span-8 row-span-5 flex flex-col bg-slate-900/20 border border-white/5 rounded-[3rem] overflow-hidden shadow-inner">
          <div className="p-6 border-b border-white/5 bg-white/2 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <LinkIcon size={14} className="text-blue-500" /> Inventaire Actif
            </h3>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{filteredItems.length} Actifs listés</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#0B0F1A] z-10">
                <tr className="text-[8px] font-black uppercase text-slate-500 italic border-b border-white/5">
                  <th className="p-6 text-left">Identification</th>
                  <th className="p-6 text-left">Vérification VGP</th>
                  <th className="p-6 text-left">Statut SMI</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((eq) => {
                  const vgp = getVGPStatus(eq.EQ_ProchaineVGP);
                  return (
                    <tr key={eq.EQ_Id} className="hover:bg-blue-600/5 transition-colors group">
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="font-black text-blue-500 text-sm tracking-tighter mb-1 uppercase">{eq.EQ_Reference}</span>
                          <span className="font-bold uppercase text-[10px] text-white">{eq.EQ_Name}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className={cn("px-4 py-2 rounded-xl text-[9px] font-black inline-flex items-center gap-2 border", vgp.color, vgp.bg, vgp.border)}>
                           <Calendar size={12} /> {vgp.label} : {new Date(eq.EQ_ProchaineVGP).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className={cn("text-[9px] font-black px-3 py-1 rounded-lg inline-block border", 
                          eq.EQ_Status === 'OPERATIONNEL' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20')}>
                          {eq.EQ_Status}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setSelectedEquipment(eq); setIsModalOpen(true); }} className="p-2.5 bg-white/5 hover:bg-blue-600 rounded-xl transition-all text-slate-400 hover:text-white">
                            <Edit3 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-4 row-span-5 flex flex-col gap-6 overflow-hidden">
          <div className="bg-red-600/10 border border-red-500/20 p-8 rounded-[3rem] relative overflow-hidden group">
             <div className="absolute -right-6 -bottom-6 text-red-500/10 group-hover:scale-110 transition-transform duration-700">
               <ShieldAlert size={150} />
             </div>
             <h3 className="text-lg font-black uppercase italic mb-4 flex items-center gap-3 text-red-500">
               <AlertTriangle size={20} /> Risques SMI
             </h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase italic leading-relaxed">
               {stats.critical} actif(s) critique(s) en défaut de VGP génère(nt) un risque de Non-Conformité majeure.
             </p>
             <button className="mt-6 flex items-center gap-2 text-[9px] font-black text-red-500 uppercase border-b border-red-500/30 pb-1 hover:text-red-400 transition-colors">
               Ouvrir Non-Conformité <ChevronRight size={12} />
             </button>
          </div>

          <div className="flex-1 bg-blue-600/5 border border-blue-600/10 p-8 rounded-[3rem] flex flex-col overflow-hidden">
             <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-3 text-blue-500">
               <Calculator size={20} /> Intelligence Actifs
             </h3>
             <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
               <FormulaItem title="Disponibilité" formula="D = (Uptime / Total)" desc="Taux de préparation opérationnelle." />
               <FormulaItem title="Indice de Conformité" formula="C = (VGP_Ok / Parc)" desc="Maîtrise réglementaire §7.1.3." />
               <FormulaItem title="MTBF" formula="T / Nombre de pannes" desc="Fiabilité moyenne des équipements." />
             </div>
          </div>
        </div>
      </main>

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

function MetricCard({ title, val, trend, icon: Icon, color, formula }: any) {
  const themes: any = {
    emerald: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
    blue: 'text-blue-500 bg-blue-500/5 border-blue-500/10',
    red: 'text-red-500 bg-red-500/5 border-red-500/20',
    amber: 'text-amber-500 bg-amber-500/5 border-amber-500/10'
  };
  return (
    <div className="bg-[#0F172A]/40 border border-white/5 p-6 rounded-[2.5rem] flex flex-col justify-between group hover:border-blue-600/30 transition-all relative">
      <div className="flex justify-between items-start">
         <div className={cn("p-3 rounded-xl border", themes[color])}><Icon size={20} /></div>
         <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">{trend}</span>
      </div>
      <div className="mt-4">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 italic leading-none">{title}</p>
        <p className="text-3xl font-black italic text-white tracking-tighter">{val}</p>
      </div>
      <div className="absolute inset-0 bg-blue-600/95 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center z-20">
         <Calculator size={18} className="mb-2 text-white" />
         <p className="text-[8px] font-black uppercase text-blue-100 mb-1 leading-none tracking-widest">Calcul Algorithmique</p>
         <p className="text-[10px] font-bold text-white uppercase italic leading-tight">{formula}</p>
      </div>
    </div>
  );
}

function FormulaItem({ title, formula, desc }: any) {
  return (
    <div className="p-4 bg-white/2 border border-white/5 rounded-2xl group hover:border-blue-500/20 transition-all">
      <h4 className="text-[10px] font-black uppercase italic text-blue-500 mb-2 leading-none">{title}</h4>
      <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 mb-2">
        <code className="text-white text-[9px] font-bold tracking-tight">{formula}</code>
      </div>
      <p className="text-[8px] text-slate-500 font-bold uppercase italic leading-tight">{desc}</p>
    </div>
  );
}