/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // 🛡️ On utilise la session officielle, pas le localStorage
import Link from "next/link";
import { 
  ArrowRight, Crown, Fingerprint, Rocket, UserCog, X, Zap 
} from "lucide-react";

// Configuration Elite
const SUPER_ADMIN_EMAIL = "ab.thiongane@qualisoft.sn";
const MASTER_KEY = "QUALISOFT_2030_ADMIN";

export default function LandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession(); // 🛰️ Status: loading, authenticated, unauthenticated
  
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterKey, setMasterKey] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [tenantName, setTenantName] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    
    // 1. Détection du Territoire
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    const isSubdomain = parts.length > 2 && !['www', 'app', 'elite', 'localhost'].includes(parts[0]);
    const currentSub = isSubdomain ? parts[0].toLowerCase() : null;
    
    if (currentSub) setTenantName(currentSub.toUpperCase());

    // 2. 🚨 LOGIQUE D'AIGUILLAGE (L'essence de ton problème)
    // Si on est sur un sous-domaine (ex: pad.qualisoft.sn)
    if (currentSub && status !== "loading") {
      if (status === "unauthenticated") {
        router.replace("/auth/login"); // ⚡ Redirection éclair vers le Login
      } else if (status === "authenticated") {
        router.replace("/dashboard");  // ⚡ Redirection éclair vers le Dashboard
      }
    }

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [status, router]);

  // Accès Master (Super Admin ou Clé)
  const isSuperAdmin = session?.user?.email === SUPER_ADMIN_EMAIL || (session?.user as any)?.U_Role === "SUPER_ADMIN";

  const handleMasterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuperAdmin || masterKey === MASTER_KEY) {
      window.location.href = "/admin/matrix";
    } else {
      alert("ACCÈS RÉVOQUÉ");
      setMasterKey("");
    }
  };

  // Empêche le flash de contenu avant la détection
  if (!isMounted || (tenantName && status === "loading")) {
    return <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
      <Zap className="animate-pulse text-blue-600" size={48} />
    </div>;
  }

  // Si on est sur un tenant et qu'on redirige, on n'affiche pas la Landing
  if (tenantName) return null;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-blue-600/30 font-sans italic">
      {/* CONSERVER ICI TON DESIGN DE LANDING PAGE ACTUEL 
          Il ne s'affichera QUE sur qualisoft.sn ou localhost 
      */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-[#0B0F1A]/95 border-b border-white/5 py-4" : "bg-transparent py-6"} px-12 flex items-center justify-between`}>
         {/* ... ton code de nav ... */}
      </nav>

      <section className="relative pt-64 pb-32 px-6 text-center">
         {/* ... ton code de Hero ... */}
      </section>

      {/* MODAL MASTER RESTE DISPONIBLE POUR TOI */}
      {showMasterModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6">
           {/* ... ton code modal ... */}
        </div>
      )}
    </div>
  );
}