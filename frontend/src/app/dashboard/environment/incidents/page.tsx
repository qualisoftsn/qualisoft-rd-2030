/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  AlertTriangle, Plus, Search, Filter, Download, Calendar, 
  FileText, Trash2, CheckCircle, Users, MapPin, Clock, 
  TrendingUp, Target, Flame
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import IncidentForm from './IncidentForm';

export default function EnvironmentIncidentsPage() {
  const router = useRouter();
  const params = useParams();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ENVIRONMENTAL');
  const [selectedSite, setSelectedSite] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Statistiques calculées
  const stats = useMemo(() => {
    const filtered = incidents.filter(i => 
      (selectedSite === 'ALL' || i.SSE_SiteId === selectedSite) &&
      i.SSE_Month === selectedMonth &&
      i.SSE_Year === selectedYear &&
      (filterType === 'ENVIRONMENTAL' 
        ? i.SSE_Type === 'DOMMAGE_MATERIEL' || 
          i.SSE_Description.toLowerCase().includes('environnement') ||
          i.SSE_Description.toLowerCase().includes('pollution') ||
          i.SSE_Description.toLowerCase().includes('déversement')
        : i.SSE_Type === filterType)
    );
    
    const environmentalIncidents = filtered.filter(i => 
      i.SSE_Type === 'DOMMAGE_MATERIEL' ||
      i.SSE_Description.toLowerCase().includes('environnement') ||
      i.SSE_Description.toLowerCase().includes('pollution')
    );
    
    const criticalIncidents = environmentalIncidents.filter(i => i.SSE_AvecArret).length;
    const totalIncidents = environmentalIncidents.length;
    const withInjuries = environmentalIncidents.filter(i => i.SSE_NbJoursArret > 0).length;
    
    return {
      totalIncidents,
      criticalIncidents,
      withInjuries,
      incidentProgress: totalIncidents === 0 ? 100 : Math.max(0, 100 - (criticalIncidents * 20)),
      trend: totalIncidents > 0 ? `+${totalIncidents}` : '0'
    };
  }, [incidents, selectedSite, filterType, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [selectedSite, filterType, selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incidentsRes, sitesRes, usersRes] = await Promise.all([
        apiClient.get('/sse-events'),
        apiClient.get('/sites'),
        apiClient.get('/users')
      ]);
      
      setIncidents(incidentsRes.data || []);
      setSites(sitesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error("Erreur chargement incidents:", error);
      toast.error("Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet incident ? Cette action est irréversible.')) return;
    
    try {
      await apiClient.delete(`/sse-events/${id}`);
      toast.success('Incident supprimé avec succès');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const isEnvironmental = 
      incident.SSE_Type === 'DOMMAGE_MATERIEL' ||
      incident.SSE_Description.toLowerCase().includes('environnement') ||
      incident.SSE_Description.toLowerCase().includes('pollution') ||
      incident.SSE_Description.toLowerCase().includes('déversement') ||
      incident.SSE_Description.toLowerCase().includes('contamination');
    
    const matchesType = filterType === 'ENVIRONMENTAL' 
      ? isEnvironmental 
      : incident.SSE_Type === filterType;
    
    const matchesSearch = 
      incident.SSE_Type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.SSE_Lieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.SSE_Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (incident.SSE_Reporter?.U_FirstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (incident.SSE_Reporter?.U_LastName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSite = selectedSite === 'ALL' || incident.SSE_SiteId === selectedSite;
    const matchesPeriod = 
      new Date(incident.SSE_DateEvent).getMonth() + 1 === selectedMonth &&
      new Date(incident.SSE_DateEvent).getFullYear() === selectedYear;
    
    return matchesSearch && matchesType && matchesSite && matchesPeriod && isEnvironmental;
  });

  if (loading) {
    return (
      <div className="ml-72 h-screen flex items-center justify-center bg-[#0B0F1A]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-widest">
            Chargement des incidents environnementaux...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#0B0F1A] min-h-screen ml-72 text-white font-sans">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Incidents <span className="text-red-400">Environnementaux</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 italic">
            Suivi opérationnel • ISO 14001 §8.2 • Gestion des situations d'urgence
          </p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-red-600 to-amber-700 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 hover:from-red-500 hover:to-amber-600 transition-all shadow-lg"
        >
          <Plus size={16} /> Nouvel Incident
        </button>
      </header>

      {/* STATISTIQUES RAPIDES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Total Incidents" 
          value={stats.totalIncidents} 
          icon={<AlertTriangle className="text-red-400" />}
          color="bg-red-500/10"
        />
        <StatCard 
          label="Incidents Critiques" 
          value={stats.criticalIncidents} 
          icon={<Flame className="text-amber-400" />}
          color="bg-amber-500/10"
        />
        <StatCard 
          label="Avec Arrêt de Travail" 
          value={stats.withInjuries} 
          icon={<Users className="text-blue-400" />}
          color="bg-blue-500/10"
        />
        <StatCard 
          label="Objectif Réduction" 
          value="0 incident critique" 
          icon={<Target className="text-emerald-400" />}
          color="bg-emerald-500/10"
          progress={stats.incidentProgress}
        />
      </div>

      {/* FILTRES */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Rechercher lieu, description ou collaborateur..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500/50 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500/50 outline-none min-w-[180px]"
          >
            <option value="ENVIRONMENTAL">Incidents Environnementaux</option>
            <option value="DOMMAGE_MATERIEL">Dommages Matériels</option>
            <option value="POLLUTION">Pollution/Déversement</option>
            <option value="SITUATION_DANGEREUSE">Situations Dangereuses</option>
          </select>
          
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500/50 outline-none min-w-[150px]"
          >
            <option value="ALL">Tous les Sites</option>
            {sites.map(site => (
              <option key={site.S_Id} value={site.S_Id}>{site.S_Name}</option>
            ))}
          </select>
          
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500/50 outline-none w-32"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i, 1).toLocaleString('fr-FR', { month: 'short' })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500/50 outline-none w-24"
            >
              {[2024, 2023, 2022, 2021].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <button className="bg-white/5 border border-white/10 rounded-xl p-2 hover:bg-white/10 transition-colors">
            <Download size={18} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* TABLEAU DES INCIDENTS */}
      <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5">
            <tr className="text-[10px] font-black uppercase text-slate-500 italic tracking-widest border-b border-white/5">
              <th className="p-6">Date & Lieu</th>
              <th className="p-6">Type d'Incident</th>
              <th className="p-6">Description</th>
              <th className="p-6">Reporter / Victime</th>
              <th className="p-6 text-center">Gravité</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredIncidents.map((incident) => {
              const isCritical = incident.SSE_AvecArret || 
                incident.SSE_Description.toLowerCase().includes('pollution majeure') ||
                incident.SSE_Description.toLowerCase().includes('déversement');
              
              const reporterName = incident.SSE_Reporter 
                ? `${incident.SSE_Reporter.U_FirstName} ${incident.SSE_Reporter.U_LastName}`
                : 'Anonyme';
              
              const victimName = incident.SSE_Victim 
                ? `${incident.SSE_Victim.U_FirstName} ${incident.SSE_Victim.U_LastName}`
                : 'Aucune';

              return (
                <tr key={incident.SSE_Id} className="hover:bg-white/5 transition-colors">
                  <td className="p-6">
                    <div className="space-y-1">
                      <p className="font-black">
                        {new Date(incident.SSE_DateEvent).toLocaleDateString('fr-FR')}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <MapPin size={12} />
                        <span>{incident.SSE_Lieu}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Calendar size={12} />
                        <span>{incident.SSE_Site?.S_Name || 'Site inconnu'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                      isCritical 
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {incident.SSE_Type.replace(/_/g, ' ')}
                    </span>
                    {incident.SSE_AvecArret && (
                      <div className="mt-1 flex items-center gap-1 text-[9px] text-red-400">
                        <Users size={12} />
                        <span>{incident.SSE_NbJoursArret} jour{incident.SSE_NbJoursArret > 1 ? 's' : ''} d'arrêt</span>
                      </div>
                    )}
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-medium line-clamp-2">
                      {incident.SSE_Description}
                    </p>
                  </td>
                  <td className="p-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px]">
                        <Users size={12} className="text-blue-400" />
                        <span className="font-black">{reporterName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <AlertTriangle size={12} className="text-amber-400" />
                        <span>Victime: {victimName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    {isCritical ? (
                      <span className="flex flex-col items-center justify-center gap-1 text-[10px] font-black text-red-400">
                        <AlertTriangle size={20} />
                        <span>CRITIQUE</span>
                      </span>
                    ) : (
                      <span className="flex flex-col items-center justify-center gap-1 text-[10px] font-black text-amber-400">
                        <Clock size={20} />
                        <span>Modéré</span>
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => router.push(`/dashboard/environment/incidents/${incident.SSE_Id}`)}
                        className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        <FileText size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(incident.SSE_Id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredIncidents.length === 0 && (
        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/5 mt-6">
          <AlertTriangle size={56} className="mx-auto text-slate-800 mb-4 opacity-30" />
          <p className="text-slate-600 font-black uppercase italic text-sm tracking-widest">
            Aucun incident environnemental trouvé avec ces critères
          </p>
          <p className="text-slate-500 text-xs mt-2 italic">Sélectionnez une autre période ou créez un nouvel incident</p>
        </div>
      )}

      {/* MODAL FORMULAIRE */}
      {isFormOpen && (
        <IncidentForm 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={fetchData} 
          sites={sites}
          users={users}
        />
      )}

      <footer className="mt-8 pt-6 border-t border-white/5 text-center">
        <p className="text-[8px] font-bold text-slate-600 uppercase italic tracking-[0.3em]">
          Qualisoft SMI • Gestion des Incidents Environnementaux ISO 14001 §8.2 • Réponse aux situations d'urgence
        </p>
      </footer>
    </div>
  );
}

function StatCard({ label, value, icon, color, progress }: any) {
  return (
    <div className={`${color} border border-white/10 rounded-2xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 bg-white/10 rounded-lg">{icon}</div>
        {progress !== undefined && (
          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${progress > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
      <p className="text-[9px] font-black uppercase text-slate-400">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}