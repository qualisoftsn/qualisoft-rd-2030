/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 COMPOSANT : ALERTES ENVIRONNEMENTALES SDE
 * -------------------------------------------------------------------------
 * RÔLE : Monitoring temps réel des dérives IPE (§9.1 ISO 14001).
 * DESIGN : Cartes de priorité Matrix, Glow dynamique, Mobile Ready.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 05:12 GMT
 */

'use client';

import React from 'react';
import { AlertTriangle, Flame, Zap, Recycle, ShieldAlert } from 'lucide-react';

export default function EnvironmentalAlerts({ 
  criticalIncidents, hazardousWaste, energyOverTarget, recyclingBelowTarget 
}: any) {
  const alerts = [
    { 
      show: criticalIncidents > 0, 
      icon: ShieldAlert, 
      title: 'INCIDENT CRITIQUE', 
      desc: `${criticalIncidents} ÉVÉNEMENT(S) À TRAITER IMMÉDIATEMENT`, 
      color: 'rose', 
      priority: 'CRITICAL' 
    },
    { 
      show: hazardousWaste > 0, 
      icon: Flame, 
      title: 'DÉCHETS DANGEREUX', 
      desc: 'DÉTECTION DE MATIÈRES À FILIÈRE SPÉCIFIQUE', 
      color: 'amber', 
      priority: 'HIGH' 
    },
    { 
      show: energyOverTarget, 
      icon: Zap, 
      title: 'DÉRIVE ÉLECTRIQUE', 
      desc: 'SEUIL DE CONSOMMATION > 90% OBJECTIF', 
      color: 'amber', 
      priority: 'MEDIUM' 
    },
    { 
      show: recyclingBelowTarget, 
      icon: Recycle, 
      title: 'DÉFAUT RECYCLAGE', 
      desc: 'TAUX INFÉRIEUR AU STANDARD ISO 14001', 
      color: 'blue', 
      priority: 'LOW' 
    }
  ].filter(a => a.show);

  if (alerts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-500">
      {alerts.map((alert, idx) => {
        const themes: any = {
          rose: "border-rose-500/30 bg-rose-500/5 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.1)]",
          amber: "border-amber-500/30 bg-amber-500/5 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]",
          blue: "border-blue-500/30 bg-blue-500/5 text-blue-500 shadow-[0_0_20_rgba(59,130,246,0.1)]"
        };
        return (
          <div key={idx} className={`p-6 rounded-4xl border-2 backdrop-blur-md flex items-start gap-4 transition-all hover:scale-105 ${themes[alert.color]}`}>
            <div className="p-3 bg-white/5 rounded-2xl shadow-inner"><alert.icon size={20} className="animate-pulse" /></div>
            <div className="space-y-1">
              <div className="flex justify-between items-center w-full">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white m-0 italic">{alert.title}</h4>
                <span className="text-[7px] font-black px-1.5 py-0.5 rounded-lg bg-white/10">{alert.priority}</span>
              </div>
              <p className="text-[9px] font-bold uppercase italic text-slate-400 m-0 leading-tight">{alert.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}