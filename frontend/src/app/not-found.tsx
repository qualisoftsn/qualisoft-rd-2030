/**
 * COMPOSANT : Not Found (404)
 * RÔLE : Gère les routes inexistantes dans le périmètre App Router.
 * DESIGN : Elite (Dark Theme, High Contrast).
 */

'use client';

import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-8 font-sans italic">
      <div className="max-w-md w-full bg-slate-900/40 border-2 border-white/5 rounded-[3rem] p-12 text-center shadow-2xl animate-in fade-in zoom-in duration-500">
        
        {/* 🚨 Alerte visuelle SMI */}
        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
          <AlertCircle size={40} className="text-blue-500" />
        </div>

        <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-4">
          Nœud <span className="text-blue-500">Introuvable</span>
        </h1>
        
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10 leading-relaxed">
          La ressource demandée n&apos;existe pas ou a été déplacée dans le registre Qualisoft.
        </p>

        {/* 🔄 Réinjection dans le flux sécurisé */}
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-3 bg-blue-600 hover:bg-white hover:text-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] transition-all shadow-xl active:scale-95"
        >
          <ArrowLeft size={16} /> Retour au Dashboard
        </Link>
      </div>
    </div>
  );
}