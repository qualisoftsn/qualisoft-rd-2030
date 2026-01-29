'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Clock, ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function TrialExpiredPage() {
  const router = useRouter();

  useEffect(() => {
    // Nettoyage automatique du localStorage
    localStorage.removeItem('trial_token');
    localStorage.removeItem('trial_expires');
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-lg text-center space-y-8">
        <div className="inline-flex p-6 bg-red-500/10 rounded-[3rem] border border-red-500/20 mb-4">
          <AlertTriangle className="text-red-500" size={64} />
        </div>

        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-4">
            Essai <span className="text-red-500">Terminé</span>
          </h1>
          <p className="text-slate-400 text-lg font-bold mb-2">
            Votre période d'essai de 14 jours est expirée.
          </p>
          <p className="text-slate-600 text-sm">
            Pour des raisons de confidentialité, vos données ont été anonymisées et seront définitivement supprimées sous 48 heures.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-white/10 rounded-[3rem] p-8 space-y-6">
          <div className="space-y-4">
            <Link 
              href="/subscription/upgrade" 
              className="block w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              <ArrowRight size={18} /> Récupérer mes données - Devenir Pro
            </Link>
            
            <button 
              onClick={() => router.push('/essai')}
              className="block w-full bg-slate-800 hover:bg-slate-700 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all text-slate-300"
            >
              Nouvel essai avec un autre email
            </button>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-slate-600 font-black uppercase">
            <Trash2 size={14} />
            <span>Suppression automatique des données dans 48h</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-700 max-w-sm mx-auto">
          Besoin d'une extension ? Contactez notre équipe commerciale à 
          <a href="mailto:commercial@qualisoft.sn" className="text-blue-500 hover:text-blue-400 ml-1">
            commercial@qualisoft.sn
          </a>
        </div>
      </div>
    </div>
  );
}