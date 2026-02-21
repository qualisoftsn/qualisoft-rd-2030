/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
/**
 * 🚨 MODULE : SSE DETAILS MODAL
 * -------------------------------------------------------------------------
 * FONCTION : Visualisation approfondie d'un incident scellé.
 * RÔLE : Expertise post-événement (§10.2 ISO 45001).
 * PHILOSOPHIE : Clarté, impact visuel, traçabilité Elite.
 */

import { X, Calendar, MapPin, AlertCircle, ShieldAlert, Activity } from 'lucide-react';

interface SSEDetailsModalProps {
  sse: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function SSEDetailsModal({ sse, isOpen, onClose }: SSEDetailsModalProps) {
  if (!isOpen || !sse) return null;

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-6 italic font-sans animate-in zoom-in duration-500">
      <div className="bg-white rounded-[4rem] shadow-4xl w-full max-w-2xl overflow-hidden border border-slate-100 text-left">
        
        {/* HEADER D'EXPERTISE */}
        <div className="bg-orange-600 p-10 text-white flex justify-between items-center relative overflow-hidden">
          <div className="flex items-center gap-5 relative z-10">
            <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md">
                <AlertCircle size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Rapport d&apos;Expertise <br/><span className="text-slate-900">Incident SSE</span></h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-3 opacity-80 italic">ID_SCELLÉ: {sse.id?.substring(0,8).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/30 rounded-full transition-all border-none cursor-pointer text-white relative z-10">
            <X size={28} />
          </button>
          <Activity className="absolute -right-10 -bottom-10 opacity-10 text-white rotate-12" size={240} />
        </div>

        {/* CONTENT ÉLITE */}
        <div className="p-12 space-y-10">
          <div className="space-y-4">
            <span className="text-[11px] font-black uppercase text-orange-600 tracking-[0.3em] italic ml-2">Circonstances de l&apos;événement</span>
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border-l-4 border-orange-500 italic text-slate-700 font-bold leading-relaxed text-sm shadow-inner">
               &quot;{sse.description || "Aucun détail complémentaire n'a été indexé pour cet événement."}&quot;
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-3xl">
              <div className="bg-white p-4 rounded-2xl text-slate-400 shadow-sm"><Calendar size={22} /></div>
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest italic leading-none mb-2">Horodatage scellé</p>
                <p className="text-sm font-black text-slate-950 italic">{new Date(sse.dateHeure).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-3xl">
              <div className="bg-white p-4 rounded-2xl text-slate-400 shadow-sm"><MapPin size={22} /></div>
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest italic leading-none mb-2">Zone d&apos;impact</p>
                <p className="text-sm font-black text-slate-950 italic uppercase tracking-tighter">{sse.SSEEventLieu || 'PERIMETRE_GLOBAL'}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-8 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-6">
              <ShieldAlert size={20} className="text-orange-500" />
              <p className="text-[11px] uppercase font-black text-white tracking-[0.2em] italic">Analyse de Gravité Matrix</p>
            </div>
            <div className="flex flex-wrap gap-4 relative z-10">
                <div className={`px-6 py-3 rounded-2xl text-[10px] font-black italic tracking-widest uppercase border-2 ${sse.avecArret ? 'bg-red-600/20 text-red-400 border-red-600/50 animate-pulse' : 'bg-emerald-600/20 text-emerald-400 border-emerald-600/50'}`}>
                 {sse.avecArret ? `🚨 IMPACT CRITIQUE : ARRÊT DE ${sse.nbJoursArret} JOURS` : '✅ SANS ARRÊT DE TRAVAIL'}
                </div>
                <div className="px-6 py-3 bg-white/5 border-2 border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest italic">
                 {sse.SSEEventType?.replace(/_/g, ' ') || 'ÉVÉNEMENT_NON_CLASSÉ'}
                </div>
            </div>
            <Activity className="absolute right-0 bottom-0 text-white opacity-5 translate-x-4 translate-y-4" size={100} />
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-slate-50 p-8 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Qualisoft RD 2026 • Document certifié conforme</p>
          <button onClick={onClose} className="px-10 py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase italic tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl active:scale-95 border-none cursor-pointer">
            Fermer l&apos;Expertise
          </button>
        </div>
      </div>
    </div>
  );
}