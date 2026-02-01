/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  CheckSquare,
  RefreshCw,
  MessageSquare,
  Plus,
  ChevronRight
} from 'lucide-react';

// Définition des types pour les alertes
interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'REMINDER' | 'DEADLINE' | 'OVERDUE' | 'INFO';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'READ' | 'ACKNOWLEDGED';
  date: string;
  source: string;
}

export default function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      title: 'Audit Interne QSE',
      message: 'Rappel : L\'audit interne QSE démarre demain à 09h00.',
      type: 'REMINDER',
      priority: 'HIGH',
      status: 'NEW',
      date: '2025-05-14T09:00:00',
      source: 'Audit'
    },
    {
      id: '2',
      title: 'Renouvellement Permis Environnemental',
      message: 'Le permis d\'exploitation expire dans 30 jours.',
      type: 'DEADLINE',
      priority: 'CRITICAL',
      status: 'READ',
      date: '2025-06-12T00:00:00',
      source: 'Réglementaire'
    },
    {
      id: '3',
      title: 'Action Corrective #AC-2024-045',
      message: 'L\'action corrective assignée est en retard de 3 jours.',
      type: 'OVERDUE',
      priority: 'MEDIUM',
      status: 'NEW',
      date: '2025-05-10T14:30:00',
      source: 'Action'
    },
    {
      id: '4',
      title: 'Nouveau Document Qualité',
      message: 'La procédure "Gestion des déchets" v2.0 a été publiée.',
      type: 'INFO',
      priority: 'LOW',
      status: 'READ',
      date: '2025-05-12T10:15:00',
      source: 'Document'
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'OVERDUE': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'DEADLINE': return <Clock className="h-5 w-5 text-orange-500" />;
      case 'REMINDER': return <Bell className="h-5 w-5 text-blue-500" />;
      default: return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            Centre d&apos;Alertes
          </h1>
          <p className="text-gray-500 mt-1">Gérez vos notifications, rappels et urgences QSE.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 shadow-sm transition">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition">
            <CheckSquare className="h-4 w-4" />
            Tout marquer comme lu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm font-medium">Non lues</span>
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {alerts.filter(a => a.status === 'NEW').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm font-medium">Critiques</span>
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {alerts.filter(a => a.priority === 'CRITICAL').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm font-medium">En Retard</span>
            <span className="h-2 w-2 rounded-full bg-orange-500"></span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {alerts.filter(a => a.type === 'OVERDUE').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm font-medium">Total (Mois)</span>
            <span className="h-2 w-2 rounded-full bg-gray-300"></span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{alerts.length}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher une alerte..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select className="px-4 py-2 border rounded-lg bg-gray-50 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
            <option value="ALL">Toutes les priorités</option>
            <option value="CRITICAL">Critique</option>
            <option value="HIGH">Élevée</option>
            <option value="MEDIUM">Moyenne</option>
          </select>
          <button className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-4 hover:bg-gray-50 transition flex items-start gap-4 ${alert.status === 'NEW' ? 'bg-blue-50/30' : ''}`}
            >
              <div className="mt-1 p-2 bg-gray-100 rounded-lg">
                {getTypeIcon(alert.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`text-sm font-semibold ${alert.status === 'NEW' ? 'text-gray-900' : 'text-gray-700'}`}>
                      {alert.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{alert.message}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {new Date(alert.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(alert.priority)}`}>
                    {alert.priority}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                    Source : {alert.source}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button title="Marquer comme lu" className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition">
                  <CheckCircle className="h-4 w-4" />
                </button>
                <button title="Voir détails" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition">
                  <Eye className="h-4 w-4" />
                </button>
                <button title="Plus d'options" className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {alerts.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Aucune alerte</h3>
              <p className="text-gray-500 mt-1">Vous êtes à jour ! Tout semble calme pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}