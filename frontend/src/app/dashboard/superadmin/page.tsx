/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 👑 MODULE ABSOLU : SUPERADMIN HUB (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Orchestration Master-Console (Cluster, Sécurité, Finance).
 * DESIGN : 100dvh / Matrix Authority / Zero-Scroll.
 * ARCHITECTURE : Souveraine (Sans NextAuth).
 * ---------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 22:30 GMT
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  AlertOctagon, Crown, Fingerprint, Server, 
  ShieldCheck, Terminal, Wallet, RefreshCw 
} from "lucide-react";
import ConsoleView from "./components/ConsoleView";
import SecurityView from "./components/SecurityView";
import TenantsView from "./components/TenantsView";
import TransactionsView from "./components/TransactionsView";

type MasterModule = "CONSOLE" | "TENANTS" | "SECURITY" | "TRANSACTIONS";

export default function SuperAdminHub() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeModule, setActiveModule] = useState<MasterModule>("CONSOLE");

  useEffect(() => {
    setIsMounted(true);
    try {
      const storageRaw = localStorage.getItem("qualisoft-auth-storage");
      if (storageRaw) {
        const parsed = JSON.parse(storageRaw);
        if (parsed.state?.user) setCurrentUser(parsed.state.user);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) { console.error("RUPTURE KERNEL : Auth Storage corrompu."); }
  }, []);

  const isMasterAdmin = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.U_Role === "SUPER_ADMIN" || currentUser.U_Email === "ab.thiongane@qualisoft.sn";
  }, [currentUser]);

  if (!isMounted) return null;

  if (!isMasterAdmin && currentUser) {
    return <AccessDeniedScreen />;
  }

  if (!currentUser) {
    return <LoadingScreen label="Identification Master Autority..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      
      {/* 🔝 NAV MASTER SOUVERAINE */}
      <nav className="shrink-0 bg-slate-900/80 border-b border-white/5 backdrop-blur-2xl px-8 py-4 flex flex-col lg:flex-row justify-between items-center gap-6 mt-12 lg:mt-0 z-50">
        <div className="flex items-center gap-4 text-amber-500 tracking-[0.4em] text-[10px]">
          <Fingerprint size={20} className="animate-pulse" /> AUTORITÉ MASTER <Crown size={18} />
        </div>

        <div className="flex gap-2 bg-black/40 p-2 rounded-3xl border border-white/5 shadow-inner">
          <NavBtn act={activeModule === "CONSOLE"} onClick={() => setActiveModule("CONSOLE")} icon={Terminal} label="Console" />
          <NavBtn act={activeModule === "TENANTS"} onClick={() => setActiveModule("TENANTS")} icon={Server} label="Cluster" />
          <NavBtn act={activeModule === "SECURITY"} onClick={() => setActiveModule("SECURITY")} icon={ShieldCheck} label="Sécurité" />
          <NavBtn act={activeModule === "TRANSACTIONS"} onClick={() => setActiveModule("TRANSACTIONS")} icon={Wallet} label="Finance" />
        </div>
      </nav>

      {/* 🖥️ VIEWPORT DYNAMIQUE */}
      <div className="flex-1 overflow-hidden relative">
        {activeModule === "CONSOLE" && <ConsoleView />}
        {activeModule === "TENANTS" && <TenantsView />}
        {activeModule === "SECURITY" && <SecurityView />}
        {activeModule === "TRANSACTIONS" && <TransactionsView />}
      </div>
    </div>
  );
}

function NavBtn({ act, onClick, icon: Icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border-none cursor-pointer ${act ? "bg-blue-600 text-white shadow-xl" : "text-slate-500 hover:text-white"}`}>
      <Icon size={16} /> {label}
    </button>
  );
}

function AccessDeniedScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-rose-600 italic font-black uppercase lg:pl-72">
      <AlertOctagon size={100} className="animate-pulse mb-8" />
      <h2 className="text-4xl tracking-tighter">Accès Réservé à l&apos;Architecte</h2>
      <p className="text-slate-500 text-[10px] tracking-[0.5em] mt-4">Niveau d&apos;accréditation SDE-Master requis</p>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center uppercase">{label}</span>
    </div>
  );
}