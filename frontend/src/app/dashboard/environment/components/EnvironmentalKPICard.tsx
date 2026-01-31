//* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EnvironmentalKPICardProps {
  title: string;
  value: string | number;
  target?: string | number;
  progress?: number;
  trend: string;
  icon: LucideIcon;
  color: string;
  isoRef?: string;
  alert?: boolean;
  onClick?: () => void;
}

export default function EnvironmentalKPICard({
  title,
  value,
  target,
  progress,
  trend,
  icon: Icon,
  color,
  isoRef,
  alert = false,
  onClick
}: EnvironmentalKPICardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-linear-to-br ${color} p-6 rounded-3xl cursor-pointer transition-all hover:scale-[1.02] shadow-xl ${
        onClick ? 'hover:shadow-2xl hover:shadow-green-900/40' : ''
      } ${alert ? 'ring-2 ring-amber-400/50 animate-pulse' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
          <Icon className="w-8 h-8" />
        </div>
        {isoRef && (
          <span className="text-[8px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
            {isoRef}
          </span>
        )}
      </div>
      
      <div className="mb-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/80">{title}</p>
        <p className="text-3xl font-black italic text-white mt-1">{value}</p>
        {target && (
          <p className="text-[10px] font-bold text-white/70 mt-1">
            Objectif: {target}
          </p>
        )}
      </div>
      
      {progress !== undefined && (
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mt-2">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              progress > 90 ? 'bg-amber-400' : 'bg-white'
            }`} 
            style={{ width: `${Math.min(100, progress)}%` }}
          ></div>
        </div>
      )}
      
      <div className={`flex items-center justify-between mt-3 pt-3 border-t border-white/20 ${
        alert ? 'border-amber-400/30' : ''
      }`}>
        <p className={`text-[9px] font-black ${
          alert ? 'text-amber-200' : 'text-white/90'
        }`}>
          {alert ? '⚠️ Seuil critique' : 'Performance'}
        </p>
        <div className={`flex items-center text-[10px] font-black ${
          trend.startsWith('+') ? 'text-emerald-200' : 
          trend.startsWith('-') ? 'text-amber-200' : 'text-white/70'
        }`}>
          {trend.startsWith('+') && <TrendingUp className="mr-1" size={14} />}
          {trend.startsWith('-') && <TrendingDown className="mr-1" size={14} />}
          {trend}
        </div>
      </div>
    </div>
  );
}

function TrendingUp({ size, className }: { size: number; className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      className={className}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function TrendingDown({ size, className }: { size: number; className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      className={className}
    >
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}