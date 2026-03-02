/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 👑 MODULE ABSOLU : src/app/dashboard/superadmin/page.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Hub Central SuperAdmin (Master Console).
 * RÔLE : Orchestration SPA des modules Console, Cluster, Sécurité et Finance.
 * SÉCURITÉ : Zéro NextAuth. Vérification stricte des rôles via LocalStorage/Store.
 * DATE DE RÉVISION : 02 Mars 2026 | 15:36 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import {
  AlertOctagon,
  Crown,
  Fingerprint,
  Loader2,
  Server,
  ShieldCheck,
  Terminal,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ConsoleView from "./components/ConsoleView";
import SecurityView from "./components/SecurityView";
import TenantsView from "./components/TenantsView";
import TransactionsView from "./components/TransactionsView";

// --- TYPES GLOBAUX PARTAGÉS ---
export interface SdeUser {
  U_Id: string;
  U_Email: string;
  U_Role: string;
  U_FirstName?: string;
}
export interface TenantMaster {
  T_Id: string;
  T_Name: string;
  T_Email: string;
  T_CeoName?: string;
  T_SubscriptionStatus: string;
  T_Plan: string;
  T_SubscriptionEndDate: string;
  _count?: { T_Users: number; T_Sites: number };
  T_Transactions?: any[];
  T_Tickets?: any[];
}

type MasterModule = "CONSOLE" | "TENANTS" | "SECURITY" | "TRANSACTIONS";

export default function SuperAdminHub() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<SdeUser | null>(null);
  const [activeModule, setActiveModule] = useState<MasterModule>("CONSOLE");

  // 🛡️ INITIALISATION SÉCURISÉE SANS NEXTAUTH
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    try {
      const storageRaw = localStorage.getItem("qualisoft-auth-storage");
      if (storageRaw) {
        const parsed = JSON.parse(storageRaw);
        if (parsed.state?.user) setCurrentUser(parsed.state.user);
      }
    } catch (e) {
      console.error("Erreur de décryptage du token local.");
    }
  }, []);

  // 🔐 VÉRIFICATION DES DROITS ARCHITECTE
  const isMasterAdmin = useMemo(() => {
    if (!currentUser) return false;
    return (
      currentUser.U_Role === "SUPER_ADMIN" ||
      currentUser.U_Email === "ab.thiongane@qualisoft.sn"
    );
  }, [currentUser]);

  if (!isMounted) return null;

  if (!isMasterAdmin && currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-red-600 uppercase font-black italic ml-0 lg:ml-72 p-6 text-center">
        <AlertOctagon size={80} className="mb-6 lg:mb-8 animate-pulse" />
        <h2 className="text-2xl lg:text-4xl tracking-tighter leading-none">
          ACCÈS RÉSERVÉ <br />À L&apos;ARCHITECTE
        </h2>
        <p className="text-slate-500 text-[10px] mt-4 tracking-[0.4em]">
          Niveau d&apos;habilitation insuffisant
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase ml-0 lg:ml-72 p-6">
        <Loader2 className="animate-spin mb-4" size={50} />
        <span className="tracking-[0.4em] lg:tracking-[0.8em] text-[10px]">
          Identification Master...
        </span>
      </div>
    );
  }

  // Rendu dynamique du module sélectionné
  const renderModule = () => {
    switch (activeModule) {
      case "CONSOLE":
        return <ConsoleView />;
      case "TENANTS":
        return <TenantsView />;
      case "SECURITY":
        return <SecurityView />;
      case "TRANSACTIONS":
        return <TransactionsView />;
      default:
        return <ConsoleView />;
    }
  };

  return (
    <div className="bg-[#0B0F1A] min-h-screen ml-0 lg:ml-72 flex flex-col italic font-sans selection:bg-blue-600/30">
      {/* BARRE DE NAVIGATION MASTER SOUVERAINE */}
      <nav className="bg-slate-900/80 border-b border-white/5 backdrop-blur-2xl sticky top-0 z-50 px-4 sm:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-2xl">
        <div className="flex items-center gap-3 text-amber-500 font-black uppercase tracking-[0.3em] lg:tracking-[0.5em] text-[9px] lg:text-[11px]">
          <Fingerprint size={18} className="shrink-0" /> Autorité Master{" "}
          <Crown size={16} className="animate-pulse shrink-0" />
        </div>

        <div className="flex gap-2 bg-black/40 p-1.5 lg:p-2 rounded-2xl lg:rounded-3xl border border-white/5 overflow-x-auto w-full sm:w-auto custom-scrollbar-hide">
          <NavButton
            active={activeModule === "CONSOLE"}
            onClick={() => setActiveModule("CONSOLE")}
            icon={Terminal}
            label="Console"
          />
          <NavButton
            active={activeModule === "TENANTS"}
            onClick={() => setActiveModule("TENANTS")}
            icon={Server}
            label="Cluster"
          />
          <NavButton
            active={activeModule === "SECURITY"}
            onClick={() => setActiveModule("SECURITY")}
            icon={ShieldCheck}
            label="Sécurité"
          />
          <NavButton
            active={activeModule === "TRANSACTIONS"}
            onClick={() => setActiveModule("TRANSACTIONS")}
            icon={Wallet}
            label="Finance"
          />
        </div>
      </nav>

      {/* CONTENU DYNAMIQUE */}
      <div className="flex-1 overflow-x-hidden">{renderModule()}</div>

      <style jsx global>{`
        .custom-scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// Sous-composant pour la navigation Master
function NavButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-none cursor-pointer ${
        active
          ? "bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.4)]"
          : "text-slate-500 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon size={14} className="shrink-0" /> {label}
    </button>
  );
}
