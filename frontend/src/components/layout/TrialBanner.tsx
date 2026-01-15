/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React from 'react';
import { Zap, Plus, Download, Search, Bell, HelpCircle, LayoutDashboard } from 'lucide-react';

export default function EliteTrialBanner() {
  return (
    <div className="ml-72 bg-linear-to-r from-blue-700 to-indigo-900 p-3 flex justify-between items-center px-8 border-b border-white/10 shadow-2xl">
      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-2 rounded-lg animate-pulse">
          <Zap size={16} className="text-white" />
        </div>
        <p className="text-[10px] font-black uppercase text-white tracking-[0.2em] italic">
          Mode Pilotage Elite Actif • <span className="text-blue-200">Version 2026.1</span>
        </p>
      </div>

      <div className="flex items-center gap-6">
        {/* COMMANDES PRÉCISES */}
        <div className="flex bg-black/20 rounded-xl p-1 border border-white/5">
          <button className="flex items-center gap-2 px-4 py-1.5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase text-white transition-all border-r border-white/10">
            <Plus size={14} /> Action
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase text-white transition-all">
            <Download size={14} /> Rapport
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-white/60 border-l border-white/10 pl-6">
          <Search size={18} className="hover:text-white cursor-pointer" />
          <Bell size={18} className="hover:text-white cursor-pointer" />
          <HelpCircle size={18} className="hover:text-white cursor-pointer" />
        </div>
      </div>
    </div>
  );
}