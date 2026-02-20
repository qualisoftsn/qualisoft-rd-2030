/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 CE QUE FAIT CETTE PAGE :
 * --------------------------
 * Fichier : app/dashboard/alerts/page.tsx
 * Rôle : Cockpit Centralisé des Alertes et Notifications du système SMI.
 * * Fonctionnalités clés :
 * 1. Surveillance en Temps Réel : Affiche toutes les alertes (Retards, Échéances, Rappels, Infos).
 * 2. Indicateurs Clés (KPIs) : Compteurs rapides pour les alertes non lues, critiques, en retard et le flux total.
 * 3. Filtrage Avancé : Recherche par texte et filtrage par niveau de priorité (Critique, Élevée, etc.).
 * 4. Gestion Interactive : Permet de "Marquer comme lu" pour nettoyer le flux, ou "d'Acquitter" une alerte (ce qui déclenche automatiquement la création d'une Action Corrective dans le backend).
 * * Public cible : Pilotes de processus, Responsables Qualité, Direction.
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Bell, CheckCircle, Clock, Search, 
  RefreshCw, ShieldAlert, Loader2, Zap
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast } from 'sonner';

// --- INTERFACES SCELLÉES ---
interface Alert {
  AL_Id: string;
  AL_Title: string;
  AL_Message: string;
  AL_Type: 'REMINDER' | 'DEADLINE' | 'OVERDUE' | 'INFO';
  AL_Priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  AL_Status: 'NEW' | 'UNREAD' | 'READ' | 'ACKNOWLEDGED';
  AL_TriggerDate: string;
  AL_DueDate?: string; // Rendue optionnelle car toutes les alertes n'ont pas forcément une date de fin
}

interface AlertStats {
  unread: number;
  critical: number;
  overdue: number;
  total: number;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');

  // --- TRADUCTION DES TYPES & PRIORITÉS ---
  const translateType = (type: string) => {
    const map: Record<string, string> = { 'REMINDER': 'RAPPEL', 'DEADLINE': 'ÉCHÉANCE', 'OVERDUE': 'RETARD', 'INFO': 'INFORMATION' };
    return map[type] || type;
  };

  const translatePriority = (priority: string) => {
    const map: Record<string, string> = { 'CRITICAL': 'CRITIQUE', 'HIGH': 'ÉLEVÉE', 'MEDIUM': 'MOYENNE', 'LOW': 'BASSE' };
    return map[priority] || priority;
  };

  // --- RÉCUPÉRATION DES DONNÉES (FLUX & STATS) ---
  const refreshData = useCallback(async () => {
    try {
      const [alertsRes, statsRes] = await Promise.all([
        apiClient.get<Alert[]>('/alerts'),
        apiClient.get<AlertStats>('/alerts/stats')
      ]);
      setAlerts(alertsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error("Échec de synchronisation avec le moteur d'alertes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  // --- ACTIONS INTERACTIVES ---
  const handleAcknowledge = async (id: string) => {
    try {
      // Cette action va aussi créer une Action Corrective dans le PAQ (Backend Logic)
      await apiClient.patch(`/alerts/${id}/acknowledge`, { comment: "Alerte traitée depuis le Cockpit." });
      toast.success("Alerte acquittée. Une action corrective a été générée dans le PAQ.");
      refreshData();
    } catch (err) {
      toast.error("Impossible de traiter cette alerte.");
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/alerts/${id}/read`);
      toast.success("Signal marqué comme lu.");
      refreshData();
    } catch (err) {
      toast.error("Erreur technique.");
    }
  };

  // --- MOTEUR DE RECHERCHE ---
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchesSearch = a.AL_Title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'ALL' || a.AL_Priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [alerts, searchTerm, filterPriority]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white italic ml-72">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.5em]">Synchronisation Matrix...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans italic selection:bg-blue-100 ml-72">
      
      {/* 🔝 EN-TÊTE DYNAMIQUE */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-3">
            Cockpit <span className="text-blue-600">Alertes</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Surveillance ISO 9001 & Réglementaire • Temps Réel</p>
        </div>
        
        <div className="flex gap-4">
          <button onClick={() => refreshData()} className="px-6 py-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-3 cursor-pointer">
            <RefreshCw size={14} /> Actualiser le flux
          </button>
        </div>
      </div>

      {/* 📊 INDICATEURS DE PERFORMANCE (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Non lues', val: stats?.unread || 0, color: 'text-blue-600' },
          { label: 'Critiques', val: stats?.critical || 0, color: 'text-rose-600' },
          { label: 'En retard', val: stats?.overdue || 0, color: 'text-amber-500' },
          { label: 'Flux Total', val: stats?.total || 0, color: 'text-slate-400' }
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">{kpi.label}</p>
            <p className={`text-6xl font-black italic ${kpi.color} leading-none tracking-tighter`}>{kpi.val}</p>
            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={100} /></div>
          </div>
        ))}
      </div>

      {/* 🔍 FILTRES DE PRÉCISION */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-white mb-8 flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="RECHERCHER DANS LE REGISTRE..." 
            className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-3xl font-black text-slate-900 uppercase text-[11px] tracking-widest outline-none focus:ring-4 ring-blue-600/5 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          value={filterPriority} 
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-8 py-5 bg-slate-50 border-none rounded-3xl font-black uppercase text-[10px] tracking-widest text-slate-500 outline-none cursor-pointer w-full md:w-auto"
        >
          <option value="ALL">TOUTES LES PRIORITÉS</option>
          <option value="CRITICAL">CRITIQUE</option>
          <option value="HIGH">ÉLEVÉE</option>
          <option value="MEDIUM">MOYENNE</option>
        </select>
      </div>

      {/* 📋 REGISTRE DES SIGNAUX */}
      <div className="bg-white rounded-[3rem] shadow-2xl border border-white overflow-hidden">
        <div className="divide-y divide-slate-50">
          {filteredAlerts.length > 0 ? filteredAlerts.map((alert) => (
            <div key={alert.AL_Id} className={`p-10 flex flex-col lg:flex-row gap-10 items-start lg:items-center transition-all hover:bg-slate-50/50 ${alert.AL_Status === 'NEW' || alert.AL_Status === 'UNREAD' ? 'border-l-4 border-blue-600' : ''}`}>
              
              {/* Icône de Type */}
              <div className={`shrink-0 w-20 h-20 rounded-[1.8rem] flex items-center justify-center ${
                alert.AL_Priority === 'CRITICAL' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-600'
              }`}>
                {alert.AL_Type === 'OVERDUE' ? <ShieldAlert size={32} /> : 
                 alert.AL_Type === 'DEADLINE' ? <Clock size={32} /> : <Bell size={32} />}
              </div>

              {/* Contenu */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-4">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                    {alert.AL_Title}
                  </h3>
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    alert.AL_Priority === 'CRITICAL' ? 'bg-rose-500 text-white' : 'bg-slate-900 text-white'
                  }`}>
                    {translatePriority(alert.AL_Priority)}
                  </span>
                </div>
                <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-3xl italic">{alert.AL_Message}</p>
                
                <div className="flex flex-wrap items-center gap-6 pt-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
                  <span className="flex items-center gap-2"><Clock size={12} /> {translateType(alert.AL_Type)}</span>
                  <span className="hidden md:inline">•</span>
                  <span>Déclenchement : {new Date(alert.AL_TriggerDate).toLocaleDateString()}</span>
                  {alert.AL_DueDate && (
                    <>
                      <span className="hidden md:inline">•</span>
                      <span className="text-rose-500">Échéance : {new Date(alert.AL_DueDate).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 self-end lg:self-center w-full lg:w-auto">
                {alert.AL_Status !== 'ACKNOWLEDGED' && (
                  <>
                    <button 
                      onClick={() => handleMarkAsRead(alert.AL_Id)}
                      className="p-4 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-2xl transition-all cursor-pointer border-none flex-1 lg:flex-none flex items-center justify-center"
                      title="Marquer comme lu"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button 
                      onClick={() => handleAcknowledge(alert.AL_Id)}
                      className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all cursor-pointer border-none shadow-lg flex-1 lg:flex-none text-center"
                    >
                      Acquitter
                    </button>
                  </>
                )}
                {alert.AL_Status === 'ACKNOWLEDGED' && (
                  <span className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 italic w-full lg:w-auto">
                    <CheckCircle size={14} /> Traité
                  </span>
                )}
              </div>
            </div>
          )) : (
            <div className="p-32 text-center">
              <Bell className="mx-auto text-slate-100 mb-6" size={80} />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">Registre Souverain Vierge</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-20 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.8em] text-slate-300 italic">Qualisoft Elite RD 2030 - Surveillance Intelligente</p>
      </div>
    </div>
  );
}