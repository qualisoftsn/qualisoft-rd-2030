//* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { AlertTriangle, Flame, Zap, Recycle } from 'lucide-react';

interface EnvironmentalAlertsProps {
  criticalIncidents: number;
  hazardousWaste: number;
  energyOverTarget: boolean;
  recyclingBelowTarget: boolean;
}

export default function EnvironmentalAlerts({
  criticalIncidents, hazardousWaste, energyOverTarget, recyclingBelowTarget
}: EnvironmentalAlertsProps) {
  const alerts = [];

  if (criticalIncidents > 0) {
    alerts.push({
      icon: AlertTriangle,
      title: 'INCIDENTS CRITIQUES',
      description: `${criticalIncidents} ÉVÉNEMENT(S) NÉCESSITANT UNE ACTION IMMÉDIATE`,
      color: 'bg-red-500/10 border-red-500/30 text-red-400',
      priority: 'CRITICAL'
    });
  }

  if (hazardousWaste > 0) {
    alerts.push({
      icon: Flame,
      title: 'DÉCHETS DANGEREUX',
      description: `${hazardousWaste} KG DÉTECTÉS - FILIÈRE SPÉCIFIQUE REQUISE`,
      color: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      priority: 'HIGH'
    });
  }

  if (energyOverTarget) {
    alerts.push({
      icon: Zap,
      title: 'DÉRIVE ÉNERGÉTIQUE',
      description: 'CONSOMMATION > 90% DE L\'OBJECTIF MENSUEL',
      color: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      priority: 'MEDIUM'
    });
  }

  if (recyclingBelowTarget) {
    alerts.push({
      icon: Recycle,
      title: 'RECYCLAGE INSUFFISANT',
      description: 'TAUX DE RECYCLAGE INFÉRIEUR AU SEUIL ISO 14001',
      color: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      priority: 'MEDIUM'
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="mb-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-6 h-6 text-amber-400 animate-pulse" />
        <h2 className="text-xl font-black uppercase italic m-0">Alertes Environnementales Scellées</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {alerts.map((alert, idx) => {
          const Icon = alert.icon;
          return (
            <div key={idx} className={`p-6 rounded-4xl border-2 backdrop-blur-md ${alert.color} relative overflow-hidden group`}>
              <div className="flex items-start gap-4 relative z-10">
                <div className={`p-3 rounded-2xl ${alert.color.replace('text', 'bg').replace('400', '500/20')} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-1 text-left">
                  <div className="flex justify-between items-start">
                    <h3 className="font-black text-white text-[11px] m-0 tracking-widest">{alert.title}</h3>
                    <span className={`text-[7px] font-black px-2 py-0.5 rounded-full ${
                      alert.priority === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-white/20 text-white'
                    }`}>{alert.priority}</span>
                  </div>
                  <p className="text-[9px] text-white/70 italic font-bold leading-tight">{alert.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}