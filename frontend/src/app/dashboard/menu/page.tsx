/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { 
  useAuthStore 
} from '@/store/authStore';
import { 
  Search, Info, ChevronRight, LayoutGrid, Target, LineChart, 
  Presentation, Users2, Map as MapIcon, GitBranch, Workflow, 
  Activity, Users, Award, GraduationCap, UserCircle, ClipboardCheck, 
  AlertTriangle, AlertOctagon, Truck, Contact, FolderOpen, BookOpen, 
  FileSearch, Users as UsersIcon, Settings2, Crown, Terminal, Database,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

/**
 * -------------------------------------------------------------------------
 * 🛰️ MODULE : HUB DE COMMANDEMENT SÉCURISÉ (NAVIGATION MATRIX)
 * -------------------------------------------------------------------------
 * RÔLE : 
 * Point d'accès universel aux fonctions du SMI Qualisoft. Ce hub centralise
 * tous les modules de l'entreprise en filtrant les accès dynamiquement.
 * * * CORRECTION TECHNIQUE (DÉPENDANCES) :
 * - `menuGroups` est désormais encapsulé dans un `useMemo` pour éviter les 
 * re-déclarations inutiles qui provoquaient l'erreur de compilation.
 * - `hasAccess` est stabilisé via `useCallback`.
 * * * CONFORMITÉ ISO 9001 §7.2 & §7.5 :
 * - Gestion des habilitations d'accès aux informations documentées.
 * - Traçabilité des accès aux modules sensibles (Direction / RH / QSE).
 * -------------------------------------------------------------------------
 */

// --- DÉFINITION DES TYPES DE STRUCTURE ---

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  access: "ALL" | "DIRECTION" | "QSE" | "RH" | "MANAGER" | "ADMIN" | "SUPERADMIN";
  description: string;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: MenuItem[];
}

export default function DashboardMenuHub() {
  // --- 🔐 ÉTAT AUTH & NAVIGATION ---
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  
  // Normalisation du rôle pour la logique de sécurité
  const userRole = useMemo(() => user?.U_Role?.toUpperCase() || "", [user]);
  const isSuperAdmin = useMemo(() => userRole === "SUPERADMIN", [userRole]);

  /**
   * 🛡️ LOGIQUE DE DROITS D'ACCÈS (RBAC)
   * Définit les périmètres de visibilité selon le profil métier.
   */
  const roles = useMemo(() => ({
    isDirection: ["DIRECTEUR", "DG", "PRESIDENT", "DIRECTEUR_GENERAL", "RQ"].includes(userRole) || isSuperAdmin,
    isQSE: ["RQ", "RESPONSABLE_QUALITE", "QSE", "AUDITEUR"].includes(userRole) || isSuperAdmin,
    isRH: ["RH", "DRH", "RESPONSABLE_RH"].includes(userRole) || isSuperAdmin,
    isManager: ["MANAGER", "CHEF_EQUIPE", "RESPONSABLE"].includes(userRole) || isSuperAdmin,
    isAdmin: ["ADMIN", "ADMINISTRATEUR"].includes(userRole) || isSuperAdmin,
  }), [userRole, isSuperAdmin]);

  /**
   * Fonction de validation d'accès (Stabilisée pour useMemo)
   */
  const hasAccess = useCallback((item: MenuItem): boolean => {
    if (isSuperAdmin) return true;
    switch (item.access) {
      case "ALL": return true;
      case "DIRECTION": return roles.isDirection;
      case "QSE": return roles.isQSE;
      case "RH": return roles.isRH;
      case "MANAGER": return roles.isManager;
      case "ADMIN": return roles.isAdmin;
      case "SUPERADMIN": return isSuperAdmin;
      default: return false;
    }
  }, [roles, isSuperAdmin]);

  /**
   * 🗄️ RÉFÉRENTIEL DES GROUPES DE FONCTIONS
   * Stabilisé par useMemo pour corriger l'erreur de dépendances.
   */
  const menuGroups = useMemo((): MenuGroup[] => {
    const baseGroups: MenuGroup[] = [
      {
        id: "pilotage", label: "Pilotage & Direction", icon: LayoutGrid,
        items: [
          { title: "Cockpit SMI", path: "/dashboard", icon: LayoutGrid, access: "ALL", description: "Vue synthétique des indicateurs critiques et alertes" },
          { title: "Objectifs & Kpis", path: "/dashboard/objectifs", icon: LineChart, access: "ALL", description: "Suivi des indicateurs de performance (§9.1)" },
          { title: "Revues Direction", path: "/dashboard/management-review", icon: Presentation, access: "DIRECTION", description: "Comptes-rendus et décisions stratégiques (§9.3)" },
          { title: "Instances COPIL", path: "/dashboard/gouvernance/copil", icon: Users2, access: "MANAGER", description: "Comités de pilotage et décisions tactiques" },
        ]
      },
      {
        id: "processus", label: "Processus & Flux", icon: GitBranch,
        items: [
          { title: "Cartographie", path: "/dashboard/direction", icon: MapIcon, access: "ALL", description: "Vision macro des processus et interactions" },
          { title: "Fiches Processus", path: "/dashboard/processus", icon: GitBranch, access: "ALL", description: "SWOT et fiches d'identité des processus" },
          { title: "Workflows", path: "/dashboard/workflows", icon: Workflow, access: "MANAGER", description: "Gestion des circuits de validation documentaires" },
          { title: "Mesures", path: "/dashboard/indicators", icon: Activity, access: "ALL", description: "Saisie des données de performance opérationnelle" },
        ]
      },
      {
        id: "organisation", label: "Organisation & RH", icon: Users,
        items: [
          { title: "Organigramme", path: "/dashboard/org-units", icon: LayoutGrid, access: "ALL", description: "Structure des unités organiques et hiérarchiques" },
          { title: "Compétences", path: "/dashboard/rh", icon: Award, access: "RH", description: "Référentiels et matrices de compétences (§7.2)" },
          { title: "Formations", path: "/dashboard/formations", icon: GraduationCap, access: "RH", description: "Plan annuel et suivi des acquis de formation" },
          { title: "Population", path: "/dashboard/collaborateurs", icon: UserCircle, access: "RH", description: "Dossiers collaborateurs et habilitations" },
        ]
      },
      {
        id: "conformite", label: "Audits & Amélioration", icon: ClipboardCheck,
        items: [
          { title: "Audits Internes", path: "/dashboard/audits", icon: ClipboardCheck, access: "QSE", description: "Programme et réalisation des audits internes (§9.2)" },
          { title: "Non-Conformités", path: "/dashboard/non-conformites", icon: AlertTriangle, access: "ALL", description: "Gestion des écarts et actions correctives" },
          { title: "Risques", path: "/dashboard/risks", icon: AlertOctagon, access: "MANAGER", description: "Analyse et traitement des risques (§6.1)" },
          { title: "Actions (PAQ)", path: "/dashboard/improvement", icon: Target, access: "ALL", description: "Plan d'Amélioration Qualité centralisé" },
        ]
      },
      {
        id: "tiers", label: "Tiers & Relations", icon: Truck,
        items: [
          { title: "Fournisseurs", path: "/dashboard/tiers", icon: Truck, access: "ALL", description: "Évaluation et suivi de la performance prestataires (§8.4)" },
          { title: "Réclamations", path: "/dashboard/reclamations", icon: Contact, access: "ALL", description: "Satisfaction client et retours d'expérience (§9.1.2)" },
        ]
      },
      {
        id: "documents", label: "GED & Traçabilité", icon: FolderOpen,
        items: [
          { title: "GED Qualité", path: "/dashboard/ged", icon: FolderOpen, access: "ALL", description: "Maîtrise de l'information documentée (§7.5)" },
          { title: "Bibliothèque", path: "/dashboard/bibliotheque", icon: BookOpen, access: "ALL", description: "Accès aux normes et référentiels réglementaires" },
          { title: "Archives", path: "/dashboard/archives", icon: FileSearch, access: "QSE", description: "Traçabilité historique et rétention des preuves" },
        ]
      }
    ];

    // Injection dynamique des modules d'administration souveraine
    if (isSuperAdmin) {
      baseGroups.push({
        id: "superadmin", label: "Console Souveraine", icon: Crown,
        items: [
          { title: "Master Console", path: "/dashboard/superadmin/console", icon: Terminal, access: "SUPERADMIN", description: "Monitoring infrastructure et logs système" },
          { title: "Tenants Matrix", path: "/dashboard/superadmin/tenants", icon: Database, access: "SUPERADMIN", description: "Gestion Multi-Tenant et isolation des données" },
        ]
      });
    }

    return baseGroups;
  }, [isSuperAdmin]);

  /**
   * 🔍 MOTEUR DE RECHERCHE ET FILTRAGE DE SÉCURITÉ
   * Cette section est la cible du correctif (Lignes 160-170).
   */
  const filteredGroups = useMemo(() => {
    return menuGroups.map(group => ({
      ...group,
      items: group.items.filter(item => 
        hasAccess(item) && 
        (item.title.toLowerCase().includes(search.toLowerCase()) || 
         item.description.toLowerCase().includes(search.toLowerCase()))
      )
    })).filter(group => group.items.length > 0);
  }, [search, menuGroups, hasAccess]);

  // --- RENDU UI HUB (INDUSTRIAL DARK DESIGN) ---

  return (
    <main className="min-h-screen bg-[#0B0F1A] ml-72 p-10 font-sans italic relative overflow-hidden text-left">
      
      {/* EFFETS DE FOND AMBIANTS */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-blue-600/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-75 h-75 bg-indigo-600/5 blur-[100px] rounded-full -z-10" />

      {/* HEADER PRINCIPAL DU CENTRE DE COMMANDEMENT */}
      <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-6 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-3xl shadow-blue-900/40 border border-blue-400/20">
            <LayoutGrid className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic text-white leading-none">
              Centre de <span className="text-blue-600">Commandement</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-3">
              Explorateur de fonctions Qualisoft SMI • Pilotage Intégré ISO 9001:2015
            </p>
          </div>
        </div>

        {/* INPUT DE RECHERCHE DYNAMIQUE */}
        <div className="mt-10 relative max-w-2xl group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Rechercher une fonction, un processus, un module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0F172A]/80 border border-white/10 rounded-4xl py-6 pl-16 pr-8 text-sm font-black uppercase italic text-white outline-none focus:border-blue-500 focus:bg-[#0F172A] transition-all shadow-2xl placeholder:text-slate-700"
          />
        </div>
      </header>

      {/* GRILLE DES GROUPES FONCTIONNELS FILTRÉS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-32">
        {filteredGroups.map((group) => (
          <div key={group.id} className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            {/* Header de section (Groupe) */}
            <div className="flex items-center gap-4 px-2">
              <group.icon size={18} className="text-blue-500" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                {group.label}
              </h2>
              <div className="flex-1 h-px bg-linear-to-r from-white/10 to-transparent" />
            </div>

            {/* Liste des modules rattachés au groupe */}
            <div className="grid gap-4">
              {group.items.map((item, idx) => (
                <Link 
                  key={idx}
                  href={item.path}
                  className="group bg-[#0F172A]/40 border border-white/5 p-6 rounded-4xl hover:bg-blue-600 hover:border-blue-400 hover:translate-x-2 transition-all duration-500 relative overflow-hidden shadow-lg"
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex gap-5">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5">
                        <item.icon size={20} className="text-blue-400 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase italic text-white leading-none mb-2">
                          {item.title}
                        </h3>
                        <p className="text-[9px] font-bold uppercase text-slate-500 mt-1 leading-relaxed group-hover:text-white/80 max-w-50">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" size={18} />
                  </div>
                  
                  {/* Effet visuel au survol (Watermark) */}
                  <div className="absolute top-0 right-0 -mr-10 -mt-10 w-28 h-28 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 🔐 BARRE DE STATUS DE CONFORMITÉ (Habilitations) */}
      <footer className="fixed bottom-0 left-72 right-0 p-10 bg-linear-to-t from-[#0B0F1A] via-[#0B0F1A]/90 to-transparent pointer-events-none z-20">
        <div className="max-w-7xl mx-auto flex justify-end">
           <div className="bg-blue-600/10 border border-blue-600/20 backdrop-blur-2xl rounded-2xl px-8 py-4 pointer-events-auto flex items-center gap-4 shadow-3xl">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
             <Info size={16} className="text-blue-400" />
             <span className="text-[10px] font-black uppercase italic text-slate-400 tracking-[0.2em]">
               Vérification des habilitations §7.2 effectuée • Accès Scellé • Qualisoft Node-Elite
             </span>
           </div>
        </div>
      </footer>
    </main>
  );
}