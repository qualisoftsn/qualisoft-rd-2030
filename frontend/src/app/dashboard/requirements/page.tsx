'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText,
  Calendar
} from 'lucide-react';

// Types pour l'affichage (Miroir de ton DTO)
interface Requirement {
  RR_Id: string;
  RR_Title: string;
  RR_Category: string; // ENVIRONNEMENT, SECURITE...
  RR_Type: string; // LOI, DECRET...
  RR_Reference: string;
  RR_DueDate: string;
  RR_Status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
  RR_Priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
}

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Simulation de chargement des données (Remplacer par fetch('/api/requirements'))
  useEffect(() => {
    // TODO: Connecter au vrai backend
    // fetch(`${process.env.NEXT_PUBLIC_API_URL}/requirements`, { headers: { Authorization: `Bearer ${token}` } })
    
    // Mock Data pour voir le rendu immédiatement
    setTimeout(() => {
      setRequirements([
        {
          RR_Id: '1',
          RR_Title: 'Déclaration annuelle des déchets dangereux',
          RR_Category: 'ENVIRONNEMENT',
          RR_Type: 'ARRETE',
          RR_Reference: 'Arrêté n° 009876',
          RR_DueDate: '2026-03-31T00:00:00.000Z',
          RR_Status: 'PENDING',
          RR_Priority: 'HIGH'
        },
        {
          RR_Id: '2',
          RR_Title: 'Renouvellement Comité Santé Sécurité (CSST)',
          RR_Category: 'SECURITE',
          RR_Type: 'CODE_TRAVAIL',
          RR_Reference: 'Art. L.184',
          RR_DueDate: '2026-02-15T00:00:00.000Z',
          RR_Status: 'COMPLIANT',
          RR_Priority: 'MEDIUM'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return 'bg-green-100 text-green-800';
      case 'NON_COMPLIANT': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return <span className="text-xs font-bold text-red-600 px-2 py-1 bg-red-50 rounded border border-red-200">Critique</span>;
      case 'HIGH': return <span className="text-xs font-bold text-orange-600 px-2 py-1 bg-orange-50 rounded border border-orange-200">Élevée</span>;
      default: return <span className="text-xs text-gray-500">Moyenne</span>;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Exigences Réglementaires
          </h1>
          <p className="text-gray-500 mt-1">Suivi de la conformité légale (Sénégal & International)</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
          <Plus className="h-4 w-4" />
          Nouvelle Exigence
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Total Textes</span>
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{requirements.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Conformes</span>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {requirements.filter(r => r.RR_Status === 'COMPLIANT').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">À Échéance (30j)</span>
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-2">1</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Non-Conformes</span>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2">0</p>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher une loi, un décret..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700">
          <Filter className="h-4 w-4" />
          Filtres
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700">
          <Calendar className="h-4 w-4" />
          Vue Calendrier
        </button>
      </div>

      {/* Tableau des exigences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-700">Référence / Titre</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Catégorie</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Priorité</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Échéance</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Statut</th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Chargement...</td></tr>
            ) : requirements.map((req) => (
              <tr key={req.RR_Id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{req.RR_Title}</p>
                    <p className="text-xs text-gray-500">{req.RR_Reference} • {req.RR_Type}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {req.RR_Category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {getPriorityBadge(req.RR_Priority)}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(req.RR_DueDate).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(req.RR_Status)}`}>
                    {req.RR_Status === 'PENDING' ? 'À traiter' : 
                     req.RR_Status === 'COMPLIANT' ? 'Conforme' : 'Non Conforme'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}