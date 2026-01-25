import React from 'react';
import { ShieldCheck, Server, Users, Activity, LogOut } from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Sidebar de Contrôle Global */}
      <aside className="w-72 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl p-8 flex flex-col shadow-2xl">
        <div className="mb-12 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">
            Quali<span className="text-blue-500">soft</span> <span className="text-slate-500 not-italic font-light">Elite</span>
          </span>
        </div>

        <nav className="flex-1 space-y-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-4">Administration Système</p>
          <a href="/super-admin/monitoring" className="flex items-center gap-3 p-4 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 font-bold transition-all">
            <Activity className="h-5 w-5" /> Monitoring Instances
          </a>
          <a href="#" className="flex items-center gap-3 p-4 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all group">
            <Server className="h-5 w-5 group-hover:text-blue-400" /> Infrastructure & Logs
          </a>
          <a href="#" className="flex items-center gap-3 p-4 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all group">
            <Users className="h-5 w-5 group-hover:text-blue-400" /> Gestion des Licences
          </a>
        </nav>

        <div className="pt-8 border-t border-slate-800 mt-auto">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
            <div className="h-10 w-10 rounded-full bg-linear-to-tr from-blue-600 to-blue-400 flex items-center justify-center font-black shadow-inner">
              AT
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">Abdoulaye THIONGANE</p>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Super Admin</p>
            </div>
            <button className="text-slate-500 hover:text-red-400 transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Zone de travail dynamique */}
      <main className="flex-1 overflow-auto bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.07)_0%,rgba(0,0,0,0)_50%)]">
        <div className="max-w-7xl mx-auto p-12">
          {children}
        </div>
      </main>
    </div>
  );
}