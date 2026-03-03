/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🚨 MODULE : SSEDetailsModal.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Rapport d'expertise scellé pour incident HSE.
 * RÉVISION : 03 Mars 2026 | 01:10 GMT
 */

"use client";

import { X, Calendar, MapPin, AlertCircle, ShieldAlert, Activity, HeartPulse } from 'lucide-react';

export default function SSEDetailsModal({ sse, isOpen, onClose }: any) {
  if (!isOpen || !sse) return null;

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-8 italic font-sans animate-in zoom-in duration-500">
      <div className="bg-white rounded-[5rem] shadow-4xl w-full max-w-3xl overflow-hidden border border-slate-100 text-left relative">
        
        {/* HEADER D'URGENCE ROUGE-ORANGE */}
        <header className="bg-linear-to-r from-orange-600 to-red-600 p-12 text-white flex justify-between items-center relative overflow-hidden">
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-5 bg-white/20 rounded-4xl backdrop-blur-md shadow-2xl animate-pulse">
                <AlertCircle size={36} />
            </div>
            <div className="leading-none">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter m-0">Rapport d&apos;Expertise</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-4 opacity-80 m-0">Index Matrix : {sse.id?.substring(0,12).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/10 hover:bg-white/30 rounded-full transition-all border-none cursor-pointer text-white relative z-10">
            <X size={32} />
          </button>
          <Activity className="absolute -right-16 -bottom-16 opacity-10 text-white rotate-12" size={320} />
        </header>

        {/* ANALYSE DES FAITS */}
        <div className="p-14 space-y-12">
          <section className="space-y-5">
            <span className="text-[11px] font-black uppercase text-orange-600 tracking-[0.4em] italic ml-4 flex items-center gap-3">
              <ShieldAlert size={14} /> Circonstances de l&apos;écart SSE
            </span>
            <div className="bg-slate-50 p-10 rounded-[3rem] border-l-8 border-orange-500 italic text-slate-800 font-bold leading-relaxed text-base shadow-inner">
               &quot;{sse.description || "Aucun récit technique scellé pour cet incident."}&quot;
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
              <div className="bg-white p-5 rounded-2xl text-slate-400 shadow-md"><Calendar size={28} /></div>
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest italic leading-none mb-3">Horodatage Scellé</p>
                <p className="text-base font-black text-slate-950 italic m-0">{new Date(sse.dateHeure).toLocaleDateString('fr-FR', { dateStyle: 'full' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
              <div className="bg-white p-5 rounded-2xl text-slate-400 shadow-md"><MapPin size={28} /></div>
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest italic leading-none mb-3">Périmètre d&apos;Impact</p>
                <p className="text-base font-black text-slate-950 italic uppercase tracking-tighter m-0">{sse.SSEEventLieu || 'ZONE_INDÉTERMINÉE'}</p>
              </div>
            </div>
          </div>

          {/* INDICATEURS DE GRAVITÉ */}
          <div className="bg-slate-950 p-10 rounded-[4rem] border border-white/10 shadow-3xl relative overflow-hidden group">
            <div className="flex items-center gap-5 mb-8 relative z-10">
              <HeartPulse size={24} className="text-red-500 animate-pulse" />
              <p className="text-[12px] uppercase font-black text-white tracking-[0.3em] italic m-0">Matrice de Sévérité RD-2026</p>
            </div>
            <div className="flex flex-wrap gap-5 relative z-10">
                <div className={`px-8 py-4 rounded-3xl text-[11px] font-black italic tracking-widest uppercase border-2 ${sse.avecArret ? 'bg-red-600/20 text-red-500 border-red-600/50 shadow-2xl shadow-red-600/20' : 'bg-emerald-600/20 text-emerald-400 border-emerald-600/50'}`}>
                 {sse.avecArret ? `🚨 IMPACT CRITIQUE : ${sse.nbJoursArret} JOURS D'ARRÊT` : '✅ CONTINUITÉ OPÉRATIONNELLE : SANS ARRÊT'}
                </div>
                <div className="px-8 py-4 bg-white/5 border-2 border-white/10 rounded-3xl text-[11px] font-black text-white uppercase tracking-widest italic">
                 Catégorie : {sse.SSEEventType?.replace(/_/g, ' ') || 'NON_IDENTIFIÉ'}
                </div>
            </div>
            <ShieldAlert className="absolute -right-4 -bottom-4 text-white opacity-5" size={120} />
          </div>
        </div>

        {/* ACTIONS DE CLÔTURE */}
        <footer className="bg-slate-50 p-10 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic m-0 leading-none">Qualisoft Elite SDE • Conformité ISO 45001 scellée</p>
          <button onClick={onClose} className="px-12 py-5 bg-slate-950 text-white rounded-3xl font-black text-[11px] uppercase italic tracking-[0.3em] hover:bg-orange-600 transition-all shadow-4xl border-none cursor-pointer active:scale-95">
            Clôturer l&apos;Expertise
          </button>
        </footer>
      </div>
    </div>
  );
}