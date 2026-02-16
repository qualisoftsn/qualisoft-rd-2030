/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Loader2, Globe, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function EliteLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // États du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Gestion des erreurs d'URL (Next-Auth)
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'CredentialsSignin') {
      toast.error("IDENTIFIANTS INVALIDES : Accès révoqué par le Kernel.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("ACCÈS REFUSÉ : Vérifiez vos accréditations.");
      } else {
        toast.success("AUTHENTIFICATION RÉUSSIE : Initialisation de la session...");
        // Redirection intelligente : le middleware se chargera du reste
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      toast.error("ERREUR CRITIQUE : Connexion au Neuro-Cortex impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans italic selection:bg-blue-500/30">
      
      {/* BACKGROUND DECOR (MATRIX FEEL) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        
        {/* LOGO & TITRE */}
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl mb-6 group hover:border-blue-500 transition-all duration-500">
            <ShieldCheck className="text-blue-500 group-hover:scale-110 transition-transform" size={40} />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
            Qualisoft <span className="text-blue-600">Elite</span>
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3">
            Portail d&apos;Accès Souverain RD 2030
          </p>
        </div>

        {/* FORMULAIRE SCELLÉ */}
        <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identité Numérique</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  required
                  type="email"
                  placeholder="admin@qualisoft.sn"
                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-600 transition-all placeholder:text-slate-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Code d&apos;Accès</label>
                <button type="button" className="text-[9px] font-black text-blue-500 uppercase hover:underline">Oublié ?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-600 transition-all placeholder:text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* BOUTON D'ENTRÉE */}
            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>SÉCURISER LA CONNEXION <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>

        {/* FOOTER INFO */}
        <div className="mt-10 flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-800">
                <Globe className="text-slate-500" size={14} />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nœud : Matrix-Sénégal-01</span>
            </div>
            <p className="text-[10px] text-slate-600 font-bold text-center max-w-xs leading-relaxed">
                Ce système est protégé par un cryptage de niveau souverain. Toute tentative d&apos;accès non autorisée est tracée et révoquée.
            </p>
        </div>
      </div>
    </div>
  );
}