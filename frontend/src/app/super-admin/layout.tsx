/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🏰 MODULE : SUPER-ADMIN LAYOUT (SOVEREIGN SHELL)
 * -------------------------------------------------------------------------
 * FONCTION : Conteneur maître pour l'administration globale.
 * RÔLE : Fournir la navigation master et sécuriser l'accès aux outils système.
 * NAVIGATION : Monitoring, Infrastructure, Licences.
 */

import React from 'react';
import { 
  ShieldCheck, Server, Users, Activity, 
  LogOut, LayoutDashboard, Settings, Lock 
} from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600/30 overflow-hidden">
      
      {/* 🛡️ SIDEBAR DE CONTRÔLE GLOBAL : MATRICE QUALISOFT */}
      <aside className="w-80 border-r border-slate-800 bg-slate-900/40 backdrop-blur-3xl p-10 flex flex-col shadow-2xl relative z-20">
        
        {/* LOGO SOUVERAIN */}
        <div className="mb-16 flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-2xl shadow-blue-500/40 border border-white/10 group">
            <ShieldCheck className="h-7 w-7 text-white group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-2xl font-black tracking-tighter uppercase italic leading-none">
              Quali<span className="text-blue-500">soft</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mt-1">Matrix Elite</span>
          </div>
        </div>

        {/* NAVIGATION MASTER */}
        <nav className="flex-1 space-y-4 text-left">
          <p className="text-[10px] uppercase tracking-[0.4em] text-slate-600 font-black mb-6 italic">Administration Système Master</p>
          
          <a href="/super-admin/monitoring" className="flex items-center gap-4 p-5 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 font-black uppercase text-[11px] tracking-widest transition-all shadow-lg italic">
            <Activity className="h-5 w-5" /> Monitoring Instances
          </a>
          
          <a href="#" className="flex items-center gap-4 p-5 rounded-2xl text-slate-500 hover:bg-white/5 hover:text-white transition-all group font-black uppercase text-[11px] tracking-widest italic">
            <Server className="h-5 w-5 group-hover:text-blue-400 transition-colors" /> Infrastructure & Logs
          </a>
          
          <a href="#" className="flex items-center gap-4 p-5 rounded-2xl text-slate-500 hover:bg-white/5 hover:text-white transition-all group font-black uppercase text-[11px] tracking-widest italic">
            <Users className="h-5 w-5 group-hover:text-blue-400 transition-colors" /> Gestion des Licences
          </a>

          <a href="#" className="flex items-center gap-4 p-5 rounded-2xl text-slate-500 hover:bg-white/5 hover:text-white transition-all group font-black uppercase text-[11px] tracking-widest italic">
            <Settings className="h-5 w-5 group-hover:text-blue-400 transition-colors" /> Paramètres Matrix
          </a>
        </nav>

        {/* PROFIL SUPER-ADMIN & LOGOUT */}
        <div className="pt-10 border-t border-slate-800 mt-auto">
          <div className="flex items-center gap-4 p-5 rounded-4xl bg-slate-800/20 border border-slate-700/30 hover:border-slate-500/50 transition-all group">
            <div className="h-12 w-12 rounded-2xl bg-linear-to-tr from-blue-700 to-blue-400 flex items-center justify-center font-black shadow-2xl border border-white/10 group-hover:scale-105 transition-transform">
              AT
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-black truncate uppercase italic tracking-tighter">A. THIONGANE</p>
              <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mt-1 italic">Master Admin</p>
            </div>
            <button className="text-slate-600 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer" title="Se déconnecter de Matrix">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 🌌 ZONE DE TRAVAIL : LE COCKPIT DYNAMIQUE */}
      <main className="flex-1 overflow-y-auto relative bg-[#050810] scrollbar-hide">
        {/* EFFET DE PROFONDEUR RADIALE */}
        <div className="absolute top-0 left-0 right-0 h-125 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.1)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto p-16 relative z-10">
          {children}
        </div>

        {/* FILIGRANE DE SÉCURITÉ (§7.5 ISO) */}
        <div className="fixed bottom-10 right-10 opacity-5 pointer-events-none flex items-center gap-3">
          <Lock size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.5em]">Qualisoft Elite Master Guard Active</span>
        </div>
      </main>
    </div>
  );
}