import React from 'react';
import Sidebar from '@/components/layout/sidebar'; // Ajuste l'import selon ton dossier

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // 'h-dvh' et 'overflow-hidden' empêchent le scroll global (Zero-Scroll Design)
    <div className="flex h-dvh w-full overflow-hidden bg-[#050810]">
      
      {/* La Sidebar s'occupe de sa propre largeur et de son état Mobile/Desktop */}
      <Sidebar isSuperAdmin={true} /> {/* Passe true ou false selon ton store Zustand */}

      {/* Zone de contenu principale (qui peut scroller indépendamment) */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col">
        {/* Ton Header principal pourrait venir ici si tu en as un */}
        <div className="flex-1 w-full p-4 lg:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}