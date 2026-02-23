/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/**
 * 🚩 MODULE : EXPIRATION D'ESSAI
 * -------------------------------------------------------------------------
 * FONCTION : Gestion de la fin de cycle de vie des accès temporaires.
 * RÔLE : Protection des données, anonymisation et incitation à la conversion.
 * CONFORMITÉ : RGPD (Droit à l'oubli) et ISO 27001 (Sécurité des données).
 */

"use client";

import {
  AlertTriangle,
  ArrowRight,
  Mail,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TrialExpiredPage() {
  const router = useRouter();

  /**
   * 🛡️ PROTOCOLE DE NETTOYAGE
   * Révoque immédiatement les jetons locaux pour interdire tout accès résiduel.
   */
  useEffect(() => {
    localStorage.removeItem("trial_token");
    localStorage.removeItem("trial_expires");
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans flex items-center justify-center p-6 text-left selection:bg-red-500/30">
      <div className="w-full max-w-xl text-center space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        {/* ICONOGRAPHIE D'ALERTE DÉCISIONNELLE */}
        <div className="inline-flex p-8 bg-red-500/10 rounded-[4rem] border border-red-500/20 mb-4 shadow-3xl relative group">
          <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
          <AlertTriangle
            className="text-red-500 relative z-10"
            size={80}
            strokeWidth={1.5}
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-black uppercase italic tracking-tighter mb-4 leading-none">
            Essai <span className="text-red-500">Terminé</span>
          </h1>
          <p className="text-slate-400 text-xl font-bold tracking-tight">
            notre cycle de 14 jours Qualisoft Elite est arrivé à échéance.
          </p>
          <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-3xl mt-6">
            <p className="text-slate-500 text-sm leading-relaxed font-bold italic">
              Conformément à nos protocoles de sécurité §7.5, vos données ont
              été anonymisées.
              <span className="text-red-500/80 block mt-2 font-black uppercase text-xs tracking-widest">
                ⚠️ Suppression définitive prévue sous 48 heures.
              </span>
            </p>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-10 space-y-8 shadow-4xl">
          <div className="space-y-5">
            <Link
              href="/subscription/upgrade"
              className="group w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] transition-all shadow-2xl shadow-blue-900/40 flex items-center justify-center gap-4 text-white no-underline active:scale-95"
            >
              <ArrowRight
                size={20}
                className="group-hover:translate-x-2 transition-transform"
              />
              Restaurer mes données • Devenir Pro
            </Link>

            <button
              onClick={() => router.push("/essai")}
              className="w-full bg-slate-800/50 hover:bg-slate-700 py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all text-slate-400 hover:text-white border-none cursor-pointer italic"
            >
              Démarrer un nouvel essai (autre entité)
            </button>
          </div>

          <div className="pt-8 border-t border-white/5 flex items-center justify-center gap-4 text-[10px] text-slate-600 font-black uppercase italic tracking-tighter">
            <div className="flex items-center gap-2">
              <Trash2 size={16} className="text-red-500/50" />
              <span>Purge automatique : J-2</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-800" />
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-slate-700" />
              <span>Conforme ISO 27001</span>
            </div>
          </div>
        </div>

        {/* SUPPORT COMMERCIAL DÉDIÉ */}
        <div className="text-[11px] text-slate-600 font-bold max-w-sm mx-auto leading-relaxed bg-white/2 py-4 px-8 rounded-full border border-white/5">
          Besoin d&apos;une extension de qualification ?
          <a
            href="mailto:commercial@qualisoft.sn"
            className="text-blue-500 hover:text-blue-400 ml-2 font-black uppercase italic transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <Mail size={12} /> commercial@qualisoft.sn
          </a>
        </div>
      </div>
    </div>
  );
}
