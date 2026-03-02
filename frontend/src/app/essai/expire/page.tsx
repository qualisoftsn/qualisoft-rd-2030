/**
 * 🚩 MODULE : src/app/(auth)/essai/expire/page.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Gestion de l'échéance des accès temporaires (Retention).
 * SÉCURITÉ : Révocation forcée des jetons locaux.
 * CONFORMITÉ : RGPD (Anonymisation) & ISO 27001 (Hygiène des données).
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 17:05 GMT
 */

"use client";

import React, { useEffect } from "react";
import { AlertTriangle, ArrowRight, Mail, ShieldAlert, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TrialExpiredPage() {
  const router = useRouter();

  // Protocole de purge immédiate des credentials
  useEffect(() => {
    localStorage.removeItem("trial_token");
    localStorage.removeItem("trial_expires");
    localStorage.removeItem("user");
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans flex items-center justify-center p-6 text-left selection:bg-red-500/30 overflow-hidden">
      <div className="w-full max-w-xl text-center space-y-10 lg:space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        
        {/* ICONOGRAPHIE D'ÉCHÉANCE */}
        <div className="inline-flex p-10 lg:p-12 bg-red-500/10 rounded-[4rem] border border-red-500/20 mb-4 shadow-4xl relative group">
          <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full opacity-40 group-hover:opacity-100 transition-opacity" />
          <AlertTriangle className="text-red-500 relative z-10" size={80} strokeWidth={1.5} />
        </div>

        <div className="space-y-6">
          <h1 className="text-6xl lg:text-7xl font-black uppercase italic tracking-tighter m-0 leading-none">
            Essai <span className="text-red-500">Terminé</span>
          </h1>
          <p className="text-slate-400 text-lg lg:text-xl font-bold tracking-tight m-0 max-w-md mx-auto leading-relaxed">
            Votre cycle de qualification de 14 jours est arrivé à échéance.
          </p>
          <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-[2.5rem] mt-8">
            <p className="text-slate-500 text-xs lg:text-sm leading-relaxed font-bold italic m-0">
              Conformément à nos protocoles ISO 27001, vos données ont été isolées.
              <span className="text-red-500/80 block mt-3 font-black uppercase text-[10px] tracking-[0.2em]">
                ⚠️ Purge définitive prévue sous 48 heures.
              </span>
            </p>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-10 lg:p-14 space-y-6 shadow-4xl">
          <Link
            href="/subscription/upgrade"
            className="group w-full bg-blue-600 hover:bg-white hover:text-blue-600 py-7 rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] transition-all shadow-3xl shadow-blue-900/40 flex items-center justify-center gap-4 text-white no-underline active:scale-95"
          >
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            Restaurer mes accès & Passer Pro
          </Link>

          <button
            onClick={() => router.push("/essai")}
            className="w-full bg-white/2 hover:bg-white/5 py-7 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] transition-all text-slate-500 hover:text-white border border-white/5 cursor-pointer italic"
          >
            Nouvelle demande de qualification
          </button>

          <div className="pt-10 border-t border-white/5 flex flex-wrap items-center justify-center gap-6 text-[9px] text-slate-700 font-black uppercase italic tracking-widest">
            <div className="flex items-center gap-2"><Trash2 size={14} className="text-red-500/30" /> <span>Purge J-2</span></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            <div className="flex items-center gap-2"><ShieldAlert size={14} className="text-slate-800" /> <span>ISO 27001 Compliant</span></div>
          </div>
        </div>

        {/* SUPPORT DIRECT */}
        <div className="text-[11px] text-slate-600 font-bold max-w-sm mx-auto leading-relaxed bg-white/2 py-5 px-10 rounded-full border border-white/5">
          Besoin d&apos;une extension pour votre audit ?
          <a href="mailto:commercial@qualisoft.sn" className="text-blue-500 hover:text-blue-400 block mt-3 font-black uppercase italic transition-colors items-center justify-center gap-2 no-underline tracking-widest">
            <Mail size={12} /> commercial@qualisoft.sn
          </a>
        </div>
      </div>
    </div>
  );
}