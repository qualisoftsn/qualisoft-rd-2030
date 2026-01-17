/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ArrowRight, Loader2, Lock, Mail, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // État pour la modale "Invitez-moi" (Custom Backend)
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteStatus, setInviteStatus] = useState("");
  const [isInviteLoading, setIsInviteLoading] = useState(false);

  const router = useRouter();

  /**
   * ✅ LOGIN : Authentification sur l'API NestJS
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://elite.qualisoft.sn/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            U_Email: email,
            U_Password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Identifiants incorrects");
      }

      // Stockage des tokens et infos utilisateur
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("qs_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ✅ INVITE : Envoi de la demande d'accès au Backend interne (Remplace Formspree)
   */
  const handleInviteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsInviteLoading(true);
    setInviteStatus("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      company: formData.get("company"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("https://elite.qualisoft.sn/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setInviteStatus("SUCCESS");
        form.reset();
        setTimeout(() => {
          setIsInviteOpen(false);
          setInviteStatus("");
        }, 4000);
      } else {
        throw new Error("Erreur lors de l'envoi");
      }
    } catch (err) {
      setInviteStatus("ERROR");
    } finally {
      setIsInviteLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-blue-100 italic bg-white relative">
      {/* CÔTÉ GAUCHE : FORMULAIRE */}
      <div className="flex-1 flex flex-col justify-center px-12 lg:px-24 bg-white z-10">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="text-center lg:text-left">
            <div className="inline-flex mb-6 drop-shadow-xl">
              <img
                src="/QSLogo.PNG"
                alt="Qualisoft Logo"
                className="h-20 w-auto object-contain"
              />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              QUALI<span className="text-blue-600">SOFT</span> ELITE
            </h2>
            <p className="text-slate-500 font-medium mt-2">
              Accédez à votre cockpit de gestion Qualité & SSE
            </p>
          </div>

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
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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
                <>Ouvrir le cockpit <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <div className="flex flex-col items-center gap-4 pt-4">
            <div className="w-full h-px bg-slate-100 relative">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                Ou
              </span>
            </div>
            <button
              onClick={() => setIsInviteOpen(true)}
              className="group flex items-center gap-2 text-blue-600 font-black uppercase italic text-[11px] tracking-widest hover:text-slate-900 transition-colors"
            >
              Pas encore de compte ?{" "}
              <span className="underline underline-offset-4 decoration-2">Invitez-moi</span>
            </button>
          </div>

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

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] space-y-6 shadow-3xl max-w-sm mx-auto">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
              Compte Client Actif
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center font-black text-white">
                  S
                </div>
                <div>
                  <p className="text-white text-xs font-black italic">Qualisoft Elite</p>
                  <p className="text-[9px] text-slate-500 uppercase font-bold">Client Premium Elite</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-lg h-128 bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-lg h-128 bg-indigo-900/20 blur-[120px] rounded-full" />
      </div>

      {/* MODALE : "INVITEZ-MOI" (Connectée au Backend Qualisoft) */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 relative shadow-2xl animate-in zoom-in duration-300">
            <button
              onClick={() => setIsInviteOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center space-y-4 mb-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Send size={28} />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Demander un accès</h3>
              <p className="text-slate-500 text-sm italic">
                Laissez-nous vos coordonnées, nos experts vous contacteront pour une démo personnalisée.
              </p>
            </div>

            {inviteStatus === "SUCCESS" ? (
              <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl text-center font-bold italic border border-emerald-100 shadow-lg">
                ✨ Demande envoyée avec succès ! <br /> Nous revenons vers vous très vite.
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-2">Entreprise</label>
                  <input name="company" required type="text" placeholder="Ex: SAGAM" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-600 transition-all text-sm font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-2">Email Professionnel</label>
                  <input name="email" required type="email" placeholder="contact@entreprise.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-600 transition-all text-sm font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-2">Message (Optionnel)</label>
                  <textarea name="message" rows={3} placeholder="Dites-nous en plus..." className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-600 transition-all text-sm font-bold resize-none"></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={isInviteLoading}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {isInviteLoading ? <Loader2 className="animate-spin" size={20} /> : "Envoyer ma demande"}
                </button>
              </form>
            )}
            {inviteStatus === "ERROR" && (
              <p className="text-red-500 text-[10px] font-bold text-center mt-4 uppercase animate-pulse">
                Oups ! Une erreur est survenue. Veuillez réessayer.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}