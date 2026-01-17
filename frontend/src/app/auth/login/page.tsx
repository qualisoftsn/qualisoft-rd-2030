/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ArrowRight, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // ✅ APPEL AU BACKEND (NestJS sur le port 9000)
      const response = await fetch("https://elite.qualisoft.sn/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          U_Email: email, // Correspond au DTO Backend
          U_Password: password, // Correspond au DTO Backend
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Identifiants incorrects");
      }

      // ✅ STOCKAGE CRITIQUE POUR LE DASHBOARD & TRIALBANNER
      // On utilise les clés 'token' et 'user' attendues par tes autres composants
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("qs_token", data.access_token); // Sécurité double clé
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ REDIRECTION VERS LE COCKPIT
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-blue-100 italic bg-white">
      {/* CÔTÉ GAUCHE : FORMULAIRE */}
      <div className="flex-1 flex flex-col justify-center px-12 lg:px-24 bg-white">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="text-center lg:text-left">
            <div className="inline-flex p-4 bg-blue-600 rounded-3xl text-white mb-6 shadow-lg shadow-blue-500/30">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              QUALI<span className="text-blue-600">SOFT</span> ELITE
            </h2>
            <p className="text-slate-500 font-medium mt-2">
              Accédez à votre cockpit de gestion Qualité & SSE
            </p>
          </div>

          {/* Alert Erreur */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[10px] font-black uppercase tracking-wider rounded-r-xl animate-bounce">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Identifiant Professionnel
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold text-slate-700 text-sm"
                  placeholder="qualisoft@qualisoft.sn"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold text-slate-700 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 active:scale-95 disabled:bg-slate-400 transition-all shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Ouvrir le cockpit <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="pt-8 text-center lg:text-left">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">
              SMQ Multi-Tenant • Management Intelligence • © 2026
            </p>
          </div>
        </div>
      </div>

      {/* CÔTÉ DROIT : VISUEL  */}
      <div className="hidden lg:flex flex-1 bg-slate-900 relative items-center justify-center p-20 overflow-hidden">
        <div className="relative z-10 text-center space-y-8">
          <div className="inline-block px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full">
            Qualisoft Elite v2.0
          </div>
          <h3 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-tight">
            Pilotez votre conformité <br />
            <span className="text-blue-500">en temps réel.</span>
          </h3>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] space-y-6 shadow-3xl max-w-sm">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
              Compte Client Actif
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center font-black text-white">
                  S
                </div>
                <div>
                  <p className="text-white text-xs font-black">
                    Qualisoft Elite
                  </p>
                  <p className="text-[9px] text-slate-500 uppercase font-bold">
                    Client Premium Elite
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 opacity-30 grayscale pointer-events-none">
              <div className="text-[9px] text-white font-black">WAVE</div>
              <div className="text-[9px] text-white font-black">OM</div>
              <div className="text-[9px] text-white font-black">VISA</div>
            </div>
          </div>
        </div>

        {/* Cercles décoratifs */}
        <div className="absolute top-0 right-0 w-lg h-128 bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-lg h-128 bg-indigo-900/20 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
