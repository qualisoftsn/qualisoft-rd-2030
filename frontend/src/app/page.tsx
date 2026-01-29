/* eslint-disable @typescript-eslint/no-unused-vars */
// File: frontend/src/app/page.tsx (Landing page - inchangé, mais vérifié)
/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable @next/next/no-img-element */
"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Crown,
  Fingerprint,
  Key,
  Rocket,
  ShieldCheck,
  UserCog,
  X,
  Zap,
  Lock
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

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
        console.error("Landing: Erreur", e);
      } finally {
        setIsMounted(true);
      }
    };

    syncSession();
    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMasterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSuperAdmin) {
      setShowMasterModal(false);
      window.location.href = "/admin/super-dashboard";
      return;
    }

    if (masterKey === MASTER_KEY) {
      setShowMasterModal(false);
      localStorage.setItem("master_access", "true");
      
      if (user) {
        const storageRaw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storageRaw) {
          const parsed = JSON.parse(storageRaw);
          if (parsed.state?.user) {
            parsed.state.user.U_Role = 'SUPER_ADMIN';
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
            window.dispatchEvent(new Event('storage'));
          }
        }
      }
      window.location.href = "/dashboard";
    } else {
      alert("ACCÈS REFUSÉ");
      setMasterKey("");
    }
  };

  if (!isMounted) return <div className="min-h-screen bg-[#0B0F1A]" />;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-blue-600/30 font-sans italic overflow-x-hidden">
      
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-[#0B0F1A]/95 backdrop-blur-2xl border-b border-white/5 py-4" : "bg-transparent py-6"} px-6 md:px-12 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shadow-lg ${isSuperAdmin ? "bg-amber-500" : "bg-blue-600"}`}>
            <span className="font-black text-xl text-white not-italic">{isSuperAdmin ? "M" : "Q"}</span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter hidden md:block">
            Qualisoft <span className={isSuperAdmin ? "text-amber-500" : "text-blue-600"}>ELITE</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          {isSuperAdmin && (
            <button onClick={() => window.location.href = "/admin/super-dashboard"} className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-500">
              <UserCog size={16} /> <span className="hidden sm:inline">Master</span>
            </button>
          )}

          <button onClick={() => setShowMasterModal(true)} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-amber-500">
            <Crown size={14} /> <span className="hidden sm:inline">Key</span>
          </button>

          {!user ? (
            <>
              <Link href="/auth/login" className="text-[10px] font-black uppercase text-slate-300">Login</Link>
              <Link href="/essai" className="px-6 py-3 bg-blue-600 rounded-2xl text-[10px] font-black uppercase">
                Essai
              </Link>
            </>
          ) : (
            <button onClick={() => window.location.href = isSuperAdmin ? "/admin/super-dashboard" : "/dashboard"} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase ${isSuperAdmin ? "bg-amber-600" : "bg-emerald-600"}`}>
              Dashboard
            </button>
          )}
        </div>
      </nav>

      <section className="relative pt-48 pb-32 px-6 text-center">
        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter italic mb-10">
          Digitalisez <br /><span className="text-blue-600">l&apos;Excellence</span>
        </h1>
        
        {!user ? (
          <div className="flex justify-center gap-4">
            <Link href="/essai" className="px-12 py-6 bg-blue-600 rounded-4xl text-xs font-black uppercase">Essai Gratuit</Link>
            <Link href="/auth/login" className="px-12 py-6 bg-slate-800 rounded-4xl text-xs font-black uppercase">Connexion</Link>
          </div>
        ) : (
          <button onClick={() => window.location.href = "/dashboard"} className="px-12 py-6 bg-emerald-600 rounded-4xl text-xs font-black uppercase">
            Accéder à la Plateforme
          </button>
        )}
      </section>

      {showMasterModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 p-6">
          <div className="bg-[#0F172A] border border-amber-500/20 w-full max-w-md rounded-[3rem] p-12 relative text-center">
            <button onClick={() => setShowMasterModal(false)} className="absolute top-10 right-10 text-slate-600"><X size={28} /></button>
            <Fingerprint size={40} className="text-amber-500 mx-auto mb-8" />
            <h2 className="text-3xl font-black uppercase italic mb-6">Accès <span className="text-amber-500">Master</span></h2>
            
            {isSuperAdmin ? (
              <button onClick={handleMasterSubmit} className="w-full py-6 bg-amber-500 text-slate-950 rounded-4xl font-black uppercase">
                Console Admin
              </button>
            ) : (
              <form onSubmit={handleMasterSubmit} className="space-y-6">
                <input type="password" value={masterKey} onChange={(e) => setMasterKey(e.target.value)} placeholder="CLÉ MASTER" className="w-full bg-white/5 border border-white/10 p-6 rounded-4xl text-white text-center uppercase" />
                <button type="submit" className="w-full py-6 bg-amber-500 text-slate-950 rounded-4xl font-black uppercase">Déverrouiller</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}