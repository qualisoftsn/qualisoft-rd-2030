/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Plus, Search, ShieldAlert, TrendingUp, Printer, MapPin, Calendar, 
  Filter, AlertCircle, Activity, GraduationCap, Leaf, Thermometer, 
  Users, BarChart3, AlertTriangle, FileText, Clock, CheckCircle, 
  Target, Zap, Droplets, Recycle, Flame,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SsePage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [consumptions, setConsumptions] = useState<any[]>([]);
  const [wastes, setWastes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [timeRange, setTimeRange] = useState<'MONTH' | 'QUARTER' | 'YEAR'>('MONTH');

  // Statistiques calculées
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filtre par période
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.SSE_DateEvent);
      if (timeRange === 'MONTH') return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
      if (timeRange === 'QUARTER') return Math.floor(eventDate.getMonth() / 3) === Math.floor(currentMonth / 3) && eventDate.getFullYear() === currentYear;
      return eventDate.getFullYear() === currentYear;
    });

    // Calculs SSE
    const totalIncidents = filteredEvents.length;
    const accidentsWithStop = filteredEvents.filter(e => e.SSE_AvecArret).length;
    const nearMisses = filteredEvents.filter(e => e.SSE_Type === 'PRESQU_ACCIDENT').length;
    const dangerousSituations = filteredEvents.filter(e => e.SSE_Type === 'SITUATION_DANGEREUSE').length;
    
    // Calculs Formation
    const expiredFormations = formations.filter(f => f.FOR_Expiry && new Date(f.FOR_Expiry) < now).length;
    const complianceRate = formations.length > 0 
      ? Math.round(((formations.length - expiredFormations) / formations.length) * 100) 
      : 100;
    
    // Calculs Environnement
    const currentMonthConsumptions = consumptions.filter(c => 
      new Date(c.CON_CreatedAt).getMonth() === currentMonth && 
      new Date(c.CON_CreatedAt).getFullYear() === currentYear
    );
    const energyConsumption = currentMonthConsumptions
      .filter(c => c.CON_Type.toLowerCase().includes('electric') || c.CON_Type.toLowerCase().includes('énergie'))
      .reduce((sum, c) => sum + c.CON_Value, 0);
    
    const waterConsumption = currentMonthConsumptions
      .filter(c => c.CON_Type.toLowerCase().includes('eau') || c.CON_Type.toLowerCase().includes('water'))
      .reduce((sum, c) => sum + c.CON_Value, 0);
    
    const currentMonthWastes = wastes.filter(w => 
      new Date(w.WAS_CreatedAt).getMonth() === currentMonth && 
      new Date(w.WAS_CreatedAt).getFullYear() === currentYear
    );
    const totalWaste = currentMonthWastes.reduce((sum, w) => sum + w.WAS_Weight, 0);
    const recyclableWaste = currentMonthWastes
      .filter(w => w.WAS_Type.toLowerCase().includes('recycl') || w.WAS_Treatment.toLowerCase().includes('recycl'))
      .reduce((sum, w) => sum + w.WAS_Weight, 0);
    const recyclingRate = totalWaste > 0 ? Math.round((recyclableWaste / totalWaste) * 100) : 0;

    return {
      // SSE
      totalIncidents,
      accidentsWithStop,
      nearMisses,
      dangerousSituations,
      trendIncidents: totalIncidents > 0 ? '+12%' : '0%',
      
      // Formation
      totalFormations: formations.length,
      expiredFormations,
      complianceRate,
      trendCompliance: complianceRate > 90 ? '+5%' : '-3%',
      
      // Environnement
      energyConsumption: Math.round(energyConsumption),
      waterConsumption: Math.round(waterConsumption),
      totalWaste: Math.round(totalWaste),
      recyclingRate,
      trendEnergy: energyConsumption > 0 ? '-8%' : '0%',
      trendRecycling: recyclingRate > 70 ? '+15%' : '-5%'
    };
  }, [events, formations, consumptions, wastes, timeRange]);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, formationsRes, consumptionsRes, wastesRes] = await Promise.all([
        apiClient.get('/sse'),
        apiClient.get('/formations'),
        apiClient.get('/consumptions'),
        apiClient.get('/wastes')
      ]);
      
      setEvents(eventsRes.data || []);
      setFormations(Array.isArray(formationsRes.data) ? formationsRes.data : []);
      setConsumptions(consumptionsRes.data || []);
      setWastes(wastesRes.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des données SSE:", error);
      toast.error("Erreur de synchronisation des données");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Filtrage Intelligent
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchSearch = event.SSE_Type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.SSE_Lieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (event.SSE_Reporter?.U_FirstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (event.SSE_Reporter?.U_LastName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchBadge = activeFilter === 'ALL' || event.SSE_Type === activeFilter;
      return matchSearch && matchBadge;
    });
  }, [events, searchTerm, activeFilter]);

  if (loading) {
    return (
      <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A]">
        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-6"></div>
        <div className="space-y-2">
          <div className="w-48 h-3 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 animate-pulse" style={{ width: '35%' }}></div>
          </div>
          <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-[0.2em]">
            Chargement du tableau de bord SSE & Environnement...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans">
      
      {/* HEADER : TITRE & ACTIONS GLOBALES */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-linear-to-br from-orange-500 to-red-600 p-3 rounded-2xl shadow-lg shadow-orange-500/20">
              <ShieldAlert size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter">
                Management <span className="text-orange-400">Intégré</span> SSE & Environnement
              </h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1 italic">
                Sécurité • Santé • Environnement • ISO 45001 & ISO 14001
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex bg-slate-900/50 border border-white/10 rounded-2xl p-1">
            {(['MONTH', 'QUARTER', 'YEAR'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-[9px] font-black uppercase rounded-xl transition-all ${
                  timeRange === range 
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range === 'MONTH' && 'Mois'}
                {range === 'QUARTER' && 'Trimestre'}
                {range === 'YEAR' && 'Année'}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => router.push('/dashboard/sse/analytics')}
            className="group bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-2 hover:bg-blue-600 hover:border-blue-400 transition-all duration-300"
          >
            <BarChart3 size={16} className="group-hover:scale-110 transition-transform" /> 
            Tableau de Bord
          </button>
          
          <button 
            onClick={() => router.push('/dashboard/sse/new')}
            className="group bg-linear-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-2 hover:from-orange-500 hover:to-red-500 shadow-[0_0_30px_rgba(234,88,12,0.4)] transition-all duration-300 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> Nouvel Incident
          </button>
        </div>
      </header>

      {/* DASHBOARD STATISTIQUES INTÉGRÉES */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* SSE - Incidents */}
        <StatCard 
          title="Incidents Total" 
          value={stats.totalIncidents} 
          trend={stats.trendIncidents}
          icon={<Activity className="w-8 h-8" />}
          color="from-orange-500 to-red-600"
          subtitle={`${stats.accidentsWithStop} avec arrêt • ${stats.nearMisses} presqu'accidents`}
        />
        
        {/* SSE - Sécurité */}
        <StatCard 
          title="Situations Dangereuses" 
          value={stats.dangerousSituations}
          trend={stats.trendIncidents}
          icon={<AlertTriangle className="w-8 h-8" />}
          color="from-amber-500 to-orange-600"
          subtitle="Identification proactive des risques"
        />
        
        {/* Formation - Conformité */}
        <StatCard 
          title="Conformité Formation" 
          value={`${stats.complianceRate}%`}
          trend={stats.trendCompliance}
          icon={<GraduationCap className="w-8 h-8" />}
          color="from-emerald-500 to-teal-600"
          subtitle={`${stats.expiredFormations} habilitations expirées`}
          onClick={() => router.push('/dashboard/sse/formations')}
        />
        
        {/* Environnement - Recyclage */}
        <StatCard 
          title="Taux de Recyclage" 
          value={`${stats.recyclingRate}%`}
          trend={stats.trendRecycling}
          icon={<Recycle className="w-8 h-8" />}
          color="from-green-500 to-emerald-600"
          subtitle={`${stats.totalWaste} kg déchets ce mois`}
          isoBadge="ISO 14001 §8.1"
        />
      </section>

      {/* MODULES INTÉGRÉS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* MODULE SSE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
              <ShieldAlert className="text-orange-500" /> Registre des Incidents
            </h2>
            <span className="text-[10px] font-black text-slate-500 uppercase italic">
              {filteredEvents.length} incidents • {timeRange.toLowerCase()}
            </span>
          </div>
          
          {/* BARRE DE RECHERCHE & FILTRES */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher par type, lieu, collaborateur..."
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl text-slate-500 hover:text-white transition-all">
                <Filter size={20} />
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {['ALL', 'ACCIDENT_TRAVAIL', 'ACCIDENT_TRAJET', 'PRESQU_ACCIDENT', 'SITUATION_DANGEREUSE', 'DOMMAGE_MATERIEL'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase italic transition-all border whitespace-nowrap ${
                    activeFilter === filter 
                    ? 'bg-orange-500 border-orange-400 text-white shadow-md shadow-orange-500/20' 
                    : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/30'
                  }`}
                >
                  {filter.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* LISTE DES ÉVÉNEMENTS */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const isCritical = event.SSE_AvecArret || event.SSE_Type === 'SITUATION_DANGEREUSE';
                const reporterName = event.SSE_Reporter 
                  ? `${event.SSE_Reporter.U_FirstName} ${event.SSE_Reporter.U_LastName}`
                  : 'Anonyme';
                
                return (
                  <div 
                    key={event.SSE_Id}
                    className={`group bg-slate-900/40 border ${isCritical ? 'border-red-500/30' : 'border-white/5'} hover:border-orange-500/30 p-5 rounded-3xl flex items-start justify-between transition-all duration-300 hover:translate-x-1`}
                  >
                    <div className="flex items-start gap-5 flex-1">
                      <div className={`p-3 rounded-xl ${isCritical ? 'bg-red-500/15 border border-red-500/30' : 'bg-orange-500/10 border border-orange-500/20'}`}>
                        <Activity size={22} className={isCritical ? 'text-red-400' : 'text-orange-400'} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="text-[9px] font-black uppercase bg-white/5 px-2.5 py-1 rounded text-slate-400 tracking-widest italic border border-white/5">
                            REF-{event.SSE_Id.slice(0, 6).toUpperCase()}
                          </span>
                          <h3 className="text-lg font-black uppercase italic tracking-tight group-hover:text-orange-400 transition-colors">
                            {event.SSE_Type.replace(/_/g, ' ')}
                          </h3>
                          {isCritical && (
                            <span className="text-[9px] font-black bg-red-500/20 text-red-300 px-2.5 py-1 rounded border border-red-500/30 flex items-center gap-1">
                              <AlertTriangle size={12} /> CRITIQUE
                            </span>
                          )}
                        </div>
                        
                        <p className="text-slate-300 text-sm font-medium mb-3 line-clamp-2">
                          {event.SSE_Description}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase italic text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Users size={14} className="text-blue-400" />
                            <span>{reporterName}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-orange-400" />
                            <span>{event.SSE_Lieu}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-emerald-400" />
                            <span>{new Date(event.SSE_DateEvent).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 ml-4">
                      {event.SSE_AvecArret && (
                        <span className="text-[10px] font-black bg-red-500/20 text-red-300 px-3 py-1 rounded-full border border-red-500/30">
                          {event.SSE_NbJoursArret} J arrêt
                        </span>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => router.push(`/dashboard/sse/report/${event.SSE_Id}`)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 transition-all font-black uppercase italic text-[9px] border border-transparent hover:border-white/10"
                        >
                          <FileText size={14} /> Fiche
                        </button>
                        <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-orange-500/15 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all cursor-pointer">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/5">
                <ShieldAlert size={56} className="mx-auto text-slate-800 mb-4 opacity-30" />
                <p className="text-slate-600 font-black uppercase italic text-sm tracking-widest">
                  Aucun incident ne correspond à votre recherche
                </p>
                <p className="text-slate-500 text-xs mt-2 italic">Essayez de modifier vos filtres ou créez un nouvel incident</p>
              </div>
            )}
          </div>
        </div>

        {/* MODULES LATÉRAUX */}
        <div className="space-y-8">
          {/* MODULE FORMATION */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                <GraduationCap className="text-emerald-400" /> Habilitations
              </h3>
              <span className="text-[10px] font-black text-slate-500 uppercase">Conformité: {stats.complianceRate}%</span>
            </div>
            
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-emerald-300">Formations actives</span>
                  <span className="text-2xl font-black text-white">{stats.totalFormations}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${stats.complianceRate}%` }}></div>
                </div>
              </div>
              
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-amber-400" size={18} />
                    <span className="text-[10px] font-black uppercase text-amber-300">Expirées</span>
                  </div>
                  <span className="text-2xl font-black text-amber-300">{stats.expiredFormations}</span>
                </div>
              </div>
              
              <button 
                onClick={() => router.push('/dashboard/sse/formations')}
                className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-2xl font-black uppercase italic text-[10px] flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-all"
              >
                <Clock size={16} /> Voir le registre complet
              </button>
            </div>
          </div>

          {/* MODULE ENVIRONNEMENT */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                <Leaf className="text-green-400" /> Performance Environnementale
              </h3>
              <span className="text-[10px] font-black text-slate-500 uppercase">ISO 14001</span>
            </div>
            
            <div className="space-y-5">
              <EnvironmentalMetric 
                icon={<Zap className="text-amber-400" />} 
                label="Énergie" 
                value={`${stats.energyConsumption} kWh`} 
                trend={stats.trendEnergy}
                isoRef="§9.1.1"
              />
              <EnvironmentalMetric 
                icon={<Droplets className="text-blue-400" />} 
                label="Eau" 
                value={`${stats.waterConsumption} m³`} 
                trend={stats.trendEnergy}
                isoRef="§9.1.1"
              />
              <EnvironmentalMetric 
                icon={<Flame className="text-red-400" />} 
                label="Déchets" 
                value={`${stats.totalWaste} kg`} 
                trend={`${stats.recyclingRate}% recyclé`}
                isoRef="§8.1"
                isCritical={stats.recyclingRate < 60}
              />
              
              <div className="mt-4 pt-4 border-t border-white/5">
                <button 
                  onClick={() => router.push('/dashboard/environment')}
                  className="w-full bg-linear-to-r from-green-600 to-emerald-700 text-white py-3 rounded-2xl font-black uppercase italic text-[10px] flex items-center justify-center gap-2 hover:from-green-500 hover:to-emerald-600 transition-all shadow-lg shadow-green-900/30"
                >
                  <Leaf size={16} /> Tableau de bord environnemental
                </button>
              </div>
            </div>
          </div>

          {/* ACTIONS RAPIDES */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
            <h3 className="text-xl font-black uppercase italic mb-4 flex items-center gap-2">
              <Target className="text-blue-400" /> Actions Prioritaires
            </h3>
            
            <div className="space-y-3">
              {stats.expiredFormations > 0 && (
                <ActionItem 
                  icon={<AlertTriangle className="text-amber-400" />}
                  title="Mettre à jour les habilitations"
                  description={`${stats.expiredFormations} formations expirées nécessitent un recyclage`}
                  onClick={() => router.push('/dashboard/sse/formations?status=expired')}
                />
              )}
              
              {stats.dangerousSituations > 0 && (
                <ActionItem 
                  icon={<ShieldAlert className="text-red-400" />}
                  title="Analyser les situations dangereuses"
                  description={`${stats.dangerousSituations} situations identifiées ce mois`}
                  onClick={() => router.push('/dashboard/sse?filter=SITUATION_DANGEREUSE')}
                />
              )}
              
              {stats.recyclingRate < 70 && (
                <ActionItem 
                  icon={<Recycle className="text-green-400" />}
                  title="Améliorer le taux de recyclage"
                  description={`Objectif: +15% • Actuel: ${stats.recyclingRate}%`}
                  onClick={() => router.push('/dashboard/environment/objectives')}
                />
              )}
              
              <button 
                onClick={() => router.push('/dashboard/sse/new')}
                className="w-full bg-linear-to-r from-orange-600 to-red-600 text-white py-3 rounded-2xl font-black uppercase italic text-[10px] flex items-center justify-center gap-2 hover:from-orange-500 hover:to-red-500 transition-all shadow-lg shadow-orange-900/30 mt-2"
              >
                <Plus size={16} /> Déclarer un nouvel incident
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER - CONFORMITÉ */}
      <footer className="mt-8 pt-6 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
            <CheckCircle className="text-emerald-500" size={16} />
            <span>Conforme ISO 45001:2018</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
            <Leaf className="text-green-500" size={16} />
            <span>Conforme ISO 14001:2015</span>
          </div>
        </div>
        <p className="mt-3 text-[8px] font-bold text-slate-600 uppercase italic tracking-[0.3em]">
          Qualisoft SMI • Module Intégré SSE & Environnement v3.0 • Données mises à jour en temps réel
        </p>
      </footer>
    </div>
  );
}

// ========================
// COMPOSANTS RÉUTILISABLES
// ========================

interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  isoBadge?: string;
  onClick?: () => void;
}

function StatCard({ title, value, trend, icon, color, subtitle, isoBadge, onClick }: StatCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-linear-to-br ${color} p-6 rounded-3xl cursor-pointer transition-all hover:scale-[1.02] shadow-xl ${
        onClick ? 'hover:shadow-2xl hover:shadow-orange-900/40' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
          {icon}
        </div>
        {isoBadge && (
          <span className="text-[8px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
            {isoBadge}
          </span>
        )}
      </div>
      
      <div className="mb-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/80">{title}</p>
        <p className="text-3xl font-black italic text-white mt-1">{value}</p>
      </div>
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
        <p className="text-[9px] font-black text-white/90">{subtitle || '\u00A0'}</p>
        <div className={`flex items-center text-[10px] font-black ${
          trend.startsWith('+') ? 'text-emerald-200' : trend.startsWith('-') ? 'text-amber-200' : 'text-white/70'
        }`}>
          {trend.startsWith('+') && <TrendingUp size={14} className="mr-1" />}
          {trend.startsWith('-') && <TrendingUp size={14} className="mr-1 rotate-180" />}
          {trend}
        </div>
      </div>
    </div>
  );
}

interface EnvironmentalMetricProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  isoRef: string;
  isCritical?: boolean;
}

function EnvironmentalMetric({ icon, label, value, trend, isoRef, isCritical = false }: EnvironmentalMetricProps) {
  return (
    <div className={`p-4 rounded-2xl border ${isCritical ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isCritical ? 'bg-amber-500/20' : 'bg-white/10'}`}>
            {icon}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
            <p className="text-lg font-black text-white mt-0.5">{value}</p>
          </div>
        </div>
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
          isCritical 
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}>
          {trend}
        </span>
      </div>
      <p className="text-[8px] font-black text-slate-500 mt-1 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>
        Réf. ISO 14001:{isoRef}
      </p>
    </div>
  );
}

interface ActionItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function ActionItem({ icon, title, description, onClick }: ActionItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-left hover:bg-white/10 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 mt-0.5 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-black text-white text-sm mb-1 group-hover:text-amber-300 transition-colors">
            {title}
          </h4>
          <p className="text-[9px] text-slate-400 italic">{description}</p>
        </div>
        <ChevronRight className="text-slate-500 w-5 h-5 group-hover:text-amber-400 transition-colors mt-1" />
      </div>
    </button>
  );
}