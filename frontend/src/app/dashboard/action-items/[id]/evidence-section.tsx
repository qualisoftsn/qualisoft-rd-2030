/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛡️ MODULE : DOSSIER DE PREUVES SDE (§7.5)
 * -------------------------------------------------------------------------
 * RÔLE : Archivage des éléments de conformité pour traçabilité audit.
 * RÉFÉRENTIEL : types/elite-sde (Preuve).
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 12:44 GMT
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
    <div className="mt-12 bg-slate-900/60 border-2 border-white/5 rounded-[4rem] p-16 text-white shadow-4xl relative overflow-hidden font-sans italic selection:bg-emerald-600/30">
      {/* 🟢 Rayon d'énergie de fond */}
      <div className="absolute top-0 left-0 w-3 h-full bg-emerald-600 opacity-20" />

      {/* 🔝 EN-TÊTE DU DOSSIER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 relative z-10 border-b border-white/5 pb-8">
        <div className="text-left">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-6 leading-none m-0">
            <ShieldCheck
              className="text-emerald-500"
              size={48}
              strokeWidth={2.5}
            />
            Dossier de <span className="text-emerald-500">Preuves</span>
          </h2>
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.5em] mt-4 italic m-0">
            Conformité ISO 9001 §7.5 • Archivage Immuable
          </p>
        </div>
        
        <button className="bg-emerald-600 hover:bg-white hover:text-emerald-600 text-white px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-4 border-none shadow-xl shadow-emerald-900/40 cursor-pointer group active:scale-95">
          <Paperclip
            size={20}
            className="group-hover:rotate-45 transition-transform"
          />
          Valider une Preuve
        </button>
      </div>

      {/* 📂 GRILLE DES PREUVES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {evidences.length > 0 ? (
          evidences.map((ev) => (
            <div
              key={ev.PV_Id}
              className="bg-black/40 p-8 rounded-[3rem] border-2 border-white/5 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 group transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5 shadow-inner"
            >
              <div className="flex items-center gap-6 min-w-0 flex-1">
                <div className="p-5 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-lg shrink-0 border border-emerald-500/20">
                  <FileText size={28} />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-lg font-black uppercase italic text-white leading-tight tracking-tighter truncate m-0 group-hover:text-emerald-400 transition-colors">
                    {ev.PV_FileName}
                  </p>
                  <p className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest mt-2 m-0 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    DÉPOSÉ LE {new Date(ev.PV_CreatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 xl:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <a
                  href={ev.PV_FileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all shadow-lg border border-emerald-500/20 flex items-center justify-center cursor-pointer"
                  title="Ouvrir la preuve"
                >
                  <ExternalLink size={20} />
                </a>
                <button 
                  className="p-4 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-2xl transition-all border border-red-500/20 cursor-pointer shadow-lg"
                  title="Révoquer la preuve"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 border-4 border-dashed border-white/5 rounded-[4rem] text-center flex flex-col items-center justify-center opacity-30 italic group hover:opacity-100 transition-opacity hover:border-emerald-500/30 hover:bg-emerald-500/5">
            <Zap size={60} className="mb-6 text-emerald-500" />
            <p className="text-xl font-black uppercase tracking-[0.5em] m-0 text-white">
              Registre de Preuves Vierge
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 text-slate-500">
              AUCUN ÉLÉMENT DE CONFORMITÉ SCELLÉ POUR CETTE ACTION
            </p>
          </div>
        )}
      </div>
    </div>
  );
}