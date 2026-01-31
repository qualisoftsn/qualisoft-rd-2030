/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { AlertTriangle, Flame, Zap, Recycle, Droplets } from 'lucide-react';

interface EnvironmentalAlertsProps {
  criticalIncidents: number;
  hazardousWaste: number;
  energyOverTarget: boolean;
  recyclingBelowTarget: boolean;
}

export default function EnvironmentalAlerts({
  criticalIncidents,
  hazardousWaste,
  energyOverTarget,
  recyclingBelowTarget
}: EnvironmentalAlertsProps) {
  const alerts = [];

  if (criticalIncidents > 0) {
    alerts.push({
      icon: AlertTriangle,
      title: 'Incidents Environnementaux Critiques',
      description: `${criticalIncidents} incident${criticalIncidents > 1 ? 's' : ''} nécessite${criticalIncidents > 1 ? 'nt' : ''} une action immédiate`,
      color: 'bg-red-500/10 border-red-500/30 text-red-400',
      priority: 'CRITICAL'
    });
  }

  if (hazardousWaste > 0) {
    alerts.push({
      icon: Flame,
      title: 'Déchets Dangereux Détectés',
      description: `${hazardousWaste} kg de déchets dangereux nécessitent un traitement spécial`,
      color: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      priority: 'HIGH'
    });
  }

  if (energyOverTarget) {
    alerts.push({
      icon: Zap,
      title: 'Consommation Énergétique Élevée',
      description: 'La consommation dépasse 90% de l\'objectif mensuel',
      color: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      priority: 'MEDIUM'
    });
  }

  if (recyclingBelowTarget) {
    alerts.push({
      icon: Recycle,
      title: 'Taux de Recyclage Insuffisant',
      description: 'Le taux de recyclage est en dessous de l\'objectif de 75%',
      color: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      priority: 'MEDIUM'
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-amber-400" />
        <h2 className="text-xl font-black uppercase italic">Alertes Environnementales</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {alerts.map((alert, idx) => {
          const Icon = alert.icon;
          return (
            <div 
              key={idx} 
              className={`p-5 rounded-2xl border ${alert.color} animate-in fade-in slide-in-from-top-2 duration-300`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${alert.color.replace('text', 'bg').replace('400', '500/20')}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-black text-white text-sm mb-1">{alert.title}</h3>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                      alert.priority === 'CRITICAL' ? 'bg-red-500/30 text-red-300' :
                      alert.priority === 'HIGH' ? 'bg-amber-500/30 text-amber-300' :
                      'bg-blue-500/30 text-blue-300'
                    }`}>
                      {alert.priority}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/80 italic">{alert.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}