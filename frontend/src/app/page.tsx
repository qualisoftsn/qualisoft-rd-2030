/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, CheckCircle2, Crown, Fingerprint, 
  Rocket, ShieldCheck, UserCog, X, Zap, Globe
} from "lucide-react";

const SUPER_ADMIN_EMAIL = "ab.thiongane@qualisoft.sn";
const MASTER_KEY = "QUALISOFT_2030_ADMIN";
const AUTH_STORAGE_KEY = "qualisoft-auth-storage";

export default function LandingPage() {
  const router = useRouter();
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterKey, setMasterKey] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [tenantName, setTenantName] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    // 🌐 DÉTECTION DU SOUS-DOMAINE (Fidélisation)
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'elite') {
      setTenantName(parts[0].toUpperCase());
    }

    const syncSession = () => {
      try {
        const storageRaw = localStorage.getItem(AUTH_STORAGE_KEY);
        const masterAccess = localStorage.getItem('master_access') === 'true';
        
        if (storageRaw) {
          const parsed = JSON.parse(storageRaw);
          const userData = parsed.state?.user;
          
          if (userData) {
            setUser(userData);
            const isSuper = 
              userData.U_Email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
              userData.U_Role === "SUPER_ADMIN" ||
              masterAccess;
            setIsSuperAdmin(isSuper);
          }
        }
      } catch (e) {
        console.error("Erreur Sync Session:", e);
      }
    };

    syncSession();
    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMasterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuperAdmin || masterKey === MASTER_KEY) {
      localStorage.setItem("master_access", "true");
      setShowMasterModal(false);
      window.location.href = "/admin/matrix";
    } else {
      alert("CLÉ INVALIDE - ACCÈS RÉVOQUÉ");
      setMasterKey("");
    }
  };

  if (!isMounted) return <div className="min-h-screen bg-[#0B0F1A]" />;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-blue-600/30 font-sans italic overflow-x-hidden">
      
      {/* NAVIGATION SOUVERAINE */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-[#0B0F1A]/95 backdrop-blur-2xl border-b border-white/5 py-4" : "bg-transparent py-6"} px-6 md:px-12 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shadow-lg ${isSuperAdmin ? "bg-amber-500" : "bg-blue-600"}`}>
            <span className="font-black text-xl text-white not-italic">{isSuperAdmin ? "M" : "Q"}</span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter hidden md:block">
            Qualisoft {tenantName ? <span className="text-emerald-500">| {tenantName}</span> : <span className={isSuperAdmin ? "text-amber-500" : "text-blue-600"}>ELITE</span>}
          </h1>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          {isSuperAdmin && (
            <button onClick={() => window.location.href = "/admin/matrix"} className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-500 group">
              <UserCog size={16} className="group-hover:rotate-12 transition-transform" /> <span className="hidden sm:inline">Matrix Control</span>
            </button>
          )}

          <button onClick={() => setShowMasterModal(true)} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-amber-500 transition-colors">
            <Crown size={14} /> <span className="hidden sm:inline">Master Key</span>
          </button>

          {!user ? (
            <>
              <Link href="/auth/login" className="text-[10px] font-black uppercase text-slate-300 hover:text-white">Login</Link>
              <Link href="/essai" className="px-6 py-3 bg-blue-600 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-blue-600/20 hover:scale-105 transition-all">
                Essai Gratuit
              </Link>
            </>
          ) : (
            <button onClick={() => window.location.href = "/dashboard"} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg transition-all hover:scale-105 ${isSuperAdmin ? "bg-amber-600 shadow-amber-600/20" : "bg-emerald-600 shadow-emerald-600/20"}`}>
              Tableau de Bord
            </button>
          )}
        </div>
      </nav>

      {/* HERO SECTION ÉLITE */}
      <section className="relative pt-64 pb-32 px-6 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-blue-600/5 rounded-full blur-[120px] -z-10" />
        
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 animate-bounce">
          <Zap size={14} className="text-blue-400" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Qualisoft Matrix RD-2030</span>
        </div>

        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter italic mb-10 leading-[0.85]">
          {tenantName ? <>{tenantName} <br /><span className="text-emerald-400">Souverain</span></> : <>Digitalisez <br /><span className="text-blue-600">l&apos;Excellence</span></>}
        </h1>

        <p className="max-w-2xl mx-auto text-slate-500 text-sm md:text-lg font-medium mb-12 leading-relaxed">
          Propulsez votre conformité ISO 9001, 14001 et 45001 dans une nouvelle ère. 
          Performance brute, pilotage temps réel, sécurité scellée.
        </p>
        
        {!user ? (
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/essai" className="px-12 py-6 bg-blue-600 rounded-3xl text-xs font-black uppercase hover:bg-white hover:text-blue-600 transition-all shadow-xl shadow-blue-600/20">
              Démarrer l&apos;expérience
            </Link>
            <Link href="/auth/login" className="px-12 py-6 bg-white/5 border border-white/10 rounded-3xl text-xs font-black uppercase hover:bg-white/10 transition-all">
              Accès Client
            </Link>
          </div>
        ) : (
          <button onClick={() => window.location.href = "/dashboard"} className="px-12 py-6 bg-emerald-600 rounded-3xl text-xs font-black uppercase hover:scale-105 transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-3 mx-auto">
            Accéder à {tenantName || 'votre espace'} <ArrowRight size={18} />
          </button>
        )}
      </section>

      {/* MASTER MODAL */}
      {showMasterModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-in fade-in duration-300">
          <div className="bg-[#0F172A] border border-amber-500/20 w-full max-w-md rounded-[3.5rem] p-12 relative text-center shadow-2xl shadow-amber-500/10">
            <button onClick={() => setShowMasterModal(false)} className="absolute top-10 right-10 text-slate-600 hover:text-white"><X size={28} /></button>
            <div className="w-20 h-20 bg-amber-500/10 rounded-4xl flex items-center justify-center mx-auto mb-8 border border-amber-500/20">
              <Fingerprint size={40} className="text-amber-500" />
            </div>
            <h2 className="text-3xl font-black uppercase italic mb-2">Accès <span className="text-amber-500">Master</span></h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-10">Authentification Biométrique Master-Key</p>
            
            {isSuperAdmin ? (
              <button onClick={handleMasterSubmit} className="w-full py-6 bg-amber-500 text-slate-950 rounded-4xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-amber-500/20">
                Console Master
              </button>
            ) : (
              <form onSubmit={handleMasterSubmit} className="space-y-6">
                <input 
                  type="password" 
                  autoFocus
                  value={masterKey} 
                  onChange={(e) => setMasterKey(e.target.value)} 
                  placeholder="CLÉ DE SÉCURITÉ" 
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-4xl text-white text-center uppercase font-black outline-none focus:border-amber-500 transition-all" 
                />
                <button type="submit" className="w-full py-6 bg-amber-500 text-slate-950 rounded-4xl font-black uppercase tracking-widest hover:bg-white transition-all">
                  Déverrouiller
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}