/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * ⚡ MODULE : ACTION HUB TACTIQUE (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Orchestration dynamique des titres et leviers opérationnels.
 * DESIGN : ClickUp High-Density, Glassmorphism, Zero-Scroll Header.
 * LOGIQUE : Mapping contextuel par route (Path-Aware Actions).
 * RÉVISION : 06 Mars 2026 | 22:35 GMT
 * -------------------------------------------------------------------------
 */

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Plus, FileDown, Filter, ChevronRight, 
  Zap, ShieldCheck, LayoutGrid, Target, 
  Users, MapPin, Search
} from 'lucide-react';
import { cn } from '@/core/utils/cn';
import { useAuthStore } from '@/store/authStore';

export default function ActionHub() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore() as any;

  /**
   * 🗺️ MAPPING STRATÉGIQUE DES ROUTES
   * Définit le titre, l'icône et les actions par défaut pour chaque nœud.
   */
  const context = useMemo(() => {
    const map: Record<string, any> = {
      '/dashboard': { title: 'Cockpit Stratégique', icon: LayoutGrid, color: 'text-blue-500' },
      '/workspace/sites': { title: 'Gestion des Sites', icon: MapPin, color: 'text-emerald-500', action: 'Nouveau Site' },
      '/workspace/structure': { title: 'Architecture SMI', icon: Target, color: 'text-purple-500', action: 'Ajouter Unité' },
      '/workspace/users': { title: 'Registre Citoyen', icon: Users, color: 'text-blue-400', action: 'Enrôler Agent' },
      '/workspace/tiers': { title: 'Registre des Tiers', icon: ShieldCheck, color: 'text-amber-500', action: 'Nouveau Partenaire' },
      '/admin/matrix': { title: 'Matrix Master Control', icon: Zap, color: 'text-blue-600' },
      '/admin/payments': { title: 'Closing Financier', icon: FileDown, color: 'text-emerald-400' },
      '/risks': { title: 'Registre des Risques', icon: ShieldCheck, color: 'text-rose-500', action: 'Indexer Risque' },
    };

    // Fallback pour les routes dynamiques ou non listées
    return map[pathname] || { title: 'Qualisoft Elite', icon: ActivityIcon, color: 'text-slate-400' };
  }, [pathname]);

  const Icon = context.icon;

  return (
    <div className="w-full h-24 border-b border-white/5 bg-[#0B0F1A]/60 backdrop-blur-2xl flex items-center justify-between px-8 md:px-12 shrink-0 animate-in fade-in slide-in-from-top-2 duration-500">
      
      {/* 🧭 SECTION GAUCHE : BREADCRUMBS & TITRE DYNAMIQUE */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-3 text-[8px] font-black uppercase tracking-[0.4em] text-slate-600 italic">
          <span className="hover:text-blue-500 cursor-pointer transition-colors" onClick={() => router.push('/dashboard')}>SDE-CORE</span>
          <ChevronRight size={10} className="opacity-30" />
          <span className="text-blue-500/50">{pathname.split('/')[1]?.toUpperCase() || 'ROOT'}</span>
        </div>
        
        <div className="flex items-center gap-4 min-w-0">
          <div className={cn("p-2 rounded-lg bg-white/5 border border-white/5 shrink-0", context.color)}>
            <Icon size={20} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter text-white m-0 truncate leading-none">
            {context.title}
          </h2>
        </div>
      </div>

      {/* 🛠️ SECTION DROITE : LEVIERS OPÉRATIONNELS */}
      <div className="flex items-center gap-4">
        
        {/* BOUTONS SECONDAIRES (Masqués sur petit mobile) */}
        <div className="hidden sm:flex items-center gap-3 border-r border-white/5 pr-6 mr-2">
           <ActionButton icon={Filter} tooltip="Filtrer la vue" />
           <ActionButton icon={FileDown} tooltip="Exporter (§7.5)" />
           <ActionButton icon={Search} tooltip="Recherche Matrix" className="lg:hidden" />
        </div>

        {/* ACTION PRIMAIRE CONTEXTUELLE */}
        {context.action && (
          <button className="bg-blue-600 text-white px-6 md:px-10 py-4 rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-white hover:text-blue-950 transition-all shadow-xl shadow-blue-900/20 flex items-center gap-3 border-none cursor-pointer active:scale-95 group">
            <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="hidden md:inline">{context.action}</span>
          </button>
        )}

        {/* INDICATEUR DE SÉCURITÉ (§27001) */}
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner group cursor-help transition-all hover:bg-emerald-500/10" title="Session Sécurisée TLS 1.3">
          <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
        </div>
      </div>
    </div>
  );
}

/**
 * 🛰️ COMPOSANT INTERNE : BOUTON D'ACTION ICONOGRAPHIQUE
 */
function ActionButton({ icon: Icon, tooltip, className }: any) {
  return (
    <button className={cn(
      "p-3.5 bg-white/5 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all border-none cursor-pointer relative group/btn",
      className
    )}>
      <Icon size={18} />
      {/* TOOLTIP AUTO-ADAPTATIF */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-[#0F172A] border border-white/10 px-3 py-1.5 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-all pointer-events-none whitespace-nowrap text-[7px] font-black uppercase tracking-widest text-blue-500 z-100 shadow-4xl">
        {tooltip}
      </div>
    </button>
  );
}

const ActivityIcon = ({ size, className }: any) => <Zap size={size} className={className} />;