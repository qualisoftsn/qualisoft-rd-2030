/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛡️ MODULE : DOSSIER DE PREUVES SDE (§7.5) (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Archivage des éléments de conformité pour traçabilité audit.
 * FIX : UI Responsive PWA, Design ClickUp Enterprise.
 * RÉFÉRENTIEL : types/elite-sde (Preuve).
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 00:00 GMT
 */

"use client";

import { Preuve } from "@/types/elite-sde";
import {
  ExternalLink,
  FileText,
  Paperclip,
  ShieldCheck,
  Trash2,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface EvidenceSectionProps {
  itemId: string;
  initialEvidences?: Preuve[];
}

export default function EvidenceSection({
  itemId,
  initialEvidences = [],
}: EvidenceSectionProps) {
  const [evidences] = useState<Preuve[]>(initialEvidences);

  return (
    <div className="mt-8 md:mt-12 bg-[#0B0F1A]/60 border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 lg:p-14 text-white shadow-2xl relative overflow-hidden font-sans italic selection:bg-emerald-600/30 w-full backdrop-blur-sm">
      
      {/* 🟢 Rayon d'énergie de fond Matrix */}
      <div className="absolute top-0 left-0 w-2 md:w-3 h-full bg-emerald-600/30" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none" />

      {/* 🔝 EN-TÊTE DU DOSSIER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 mb-10 md:mb-14 relative z-10 border-b border-white/10 pb-6 md:pb-8">
        <div className="text-left">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-4 md:gap-6 leading-none m-0">
            <ShieldCheck className="text-emerald-500 shrink-0 w-10 h-10 md:w-12 md:h-12" strokeWidth={2.5} />
            <span className="wrap-break-word">Dossier de <span className="text-emerald-500">Preuves</span></span>
          </h2>
          <p className="text-slate-500 text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] mt-3 md:mt-4 italic m-0">
            Conformité ISO 9001 §7.5 • Archivage Immuable
          </p>
        </div>
        
        <button className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-widest transition-all flex items-center justify-center gap-3 border-none shadow-xl shadow-emerald-900/40 cursor-pointer group active:scale-95 shrink-0">
          <Paperclip size={18} className="group-hover:-rotate-45 transition-transform" />
          Valider une Preuve
        </button>
      </div>

      {/* 📂 GRILLE DES PREUVES */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 relative z-10">
        {evidences.length > 0 ? (
          evidences.map((ev) => (
            <div
              key={ev.PV_Id}
              className="bg-black/60 p-5 md:p-8 rounded-4xl md:rounded-[2.5rem] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]"
            >
              <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1 w-full">
                <div className="p-4 md:p-5 bg-emerald-500/10 rounded-xl md:rounded-2xl text-emerald-500 border border-emerald-500/20 shrink-0">
                  <FileText size={24} className="md:w-7 md:h-7" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="text-base md:text-lg font-black uppercase italic text-white leading-tight tracking-tighter truncate m-0 group-hover:text-emerald-400 transition-colors">
                    {ev.PV_FileName}
                  </p>
                  <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase italic tracking-widest mt-1.5 md:mt-2 m-0 flex items-center gap-2 flex-wrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    <span className="truncate">DÉPOSÉ LE {new Date(ev.PV_CreatedAt).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex sm:flex-row w-full sm:w-auto gap-3 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <a
                  href={ev.PV_FileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none p-3 md:p-4 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl md:rounded-2xl transition-colors border border-emerald-500/20 flex items-center justify-center cursor-pointer"
                  title="Ouvrir la preuve"
                >
                  <ExternalLink size={18} className="md:w-5 md:h-5" />
                </a>
                <button 
                  className="flex-1 sm:flex-none p-3 md:p-4 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl md:rounded-2xl transition-colors border border-rose-500/20 cursor-pointer flex items-center justify-center"
                  title="Révoquer la preuve"
                >
                  <Trash2 size={18} className="md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 md:py-24 border-2 md:border-4 border-dashed border-white/5 rounded-[2.5rem] md:rounded-[4rem] text-center flex flex-col items-center justify-center italic group hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all cursor-pointer">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 md:mb-8 group-hover:bg-emerald-500/10 transition-colors group-hover:scale-110 duration-500">
              <Zap size={32} className="md:w-10 md:h-10 text-slate-600 group-hover:text-emerald-500 transition-colors" />
            </div>
            <p className="text-lg md:text-xl font-black uppercase tracking-[0.3em] md:tracking-[0.5em] m-0 text-slate-500 group-hover:text-white transition-colors">
              Registre de Preuves Vierge
            </p>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mt-3 md:mt-4 text-slate-600 group-hover:text-emerald-500/70 transition-colors max-w-xs md:max-w-md mx-auto leading-relaxed px-4">
              Cliquez pour importer et sceller cryptographiquement un élément de conformité.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}