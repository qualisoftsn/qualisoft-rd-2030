/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/app/dashboard/sidebar';
import { Bell, Search, User as UserIcon } from 'lucide-react';

/**
 * ✅ COMPOSANT ISOLÉ POUR LE PROFIL (ANTI-ERREUR & DYNAMIQUE)
 */
function TopUserNav() {
  const [user, setUser] = useState<{ firstName: string; lastName: string; role: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser({
          firstName: parsed.U_FirstName || 'Utilisateur',
          lastName: parsed.U_LastName || '',
          role: parsed.U_Role || 'ADMIN'
        });
      } catch (e) {
        console.error("Erreur de lecture session");
      }
    }
  }, []);

  if (!user) return <div className="w-32 h-8 bg-slate-100 animate-pulse rounded-lg" />;

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <div className="flex items-center gap-3 cursor-pointer group">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase italic">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
          {user.role === 'ADMIN' ? 'Responsable Qualité' : user.role} • ELITE
        </p>
      </div>
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border border-blue-700 text-white font-black shadow-md transition-transform group-hover:scale-105">
        {initials || <UserIcon size={20} />}
      </div>
    </div>
  );
}

/**
 * 🚀 LAYOUT PRINCIPAL DYNAMISÉ
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* 1. SIDEBAR - Fixée à gauche */}
      <Sidebar />

      {/* 2. ZONE DE CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col pl-72 min-w-0">
        
        {/* TOP BAR / HEADER DE NAVIGATION */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
          
          {/* BARRE DE RECHERCHE */}
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Rechercher un processus, un audit, une NC..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* ACTIONS & PROFIL */}
          <div className="flex items-center gap-6">
            {/* NOTIFICATIONS */}
            <button className="relative text-slate-500 hover:text-blue-600 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>
            
            {/* SÉPARATEUR */}
            <div className="h-8 w-px bg-slate-200" />

            {/* ✅ PROFIL DYNAMIQUE (REMONTÉE DE AWA DIOP ICI) */}
            <TopUserNav />
          </div>
        </header>

        {/* CONTENU DE LA PAGE (DYNAMIQUE) */}
        <main className="p-8">
          <div className="max-w-400 mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}