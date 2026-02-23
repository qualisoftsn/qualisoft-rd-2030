/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛡️ MODULE : DOSSIER DE PREUVES SDE (§7.5)
 * -------------------------------------------------------------------------
 * RÔLE : Archivage des éléments de conformité pour traçabilité audit.
 * RÉFÉRENTIEL : types/elite-sde (Preuve).
 * -------------------------------------------------------------------------
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
    <div className="mt-12 bg-slate-900/60 border-2 border-white/5 rounded-[4rem] p-16 text-white shadow-4xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-3 h-full bg-emerald-600 opacity-20" />

      <div className="flex justify-between items-center mb-16 relative z-10">
        <div className="text-left">
          <h4 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-6 leading-none">
            <ShieldCheck
              className="text-emerald-500"
              size={48}
              strokeWidth={2.5}
            />
            Dossier de <span className="text-emerald-500">Preuves</span>
          </h4>
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.5em] mt-4 italic">
            Conformité ISO 9001 §7.5 • Archivage Immuable
          </p>
        </div>
        <button className="bg-emerald-600 hover:bg-white hover:text-emerald-600 text-white px-10 py-5 rounded-4xl font-black text-xs uppercase transition-all flex items-center gap-4 border-none shadow-4xl cursor-pointer group active:scale-95">
          <Paperclip
            size={20}
            className="group-hover:rotate-45 transition-transform"
          />{" "}
          Valider une Preuve
        </button>
      </div>

      {/*  */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {evidences.length > 0 ? (
          evidences.map((ev) => (
            <div
              key={ev.PV_Id}
              className="bg-black/40 p-8 rounded-[3rem] border-2 border-white/5 flex items-center justify-between group transition-all hover:border-emerald-500/30 hover:bg-emerald-500/2 shadow-inner"
            >
              <div className="flex items-center gap-6">
                <div className="p-5 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-lg">
                  <FileText size={28} />
                </div>
                <div className="text-left">
                  <p className="text-lg font-black uppercase italic text-white leading-tight tracking-tighter">
                    {ev.PV_FileName}
                  </p>
                  <p className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest mt-2">
                    DÉPOSÉ LE {new Date(ev.PV_CreatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={ev.PV_FileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 bg-emerald-600 rounded-xl text-white hover:scale-110 transition-all shadow-lg"
                >
                  <ExternalLink size={20} />
                </a>
                <button className="p-4 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all border-none cursor-pointer">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-32 border-4 border-dashed border-white/5 rounded-[4rem] text-center flex flex-col items-center justify-center opacity-10 italic">
            <Zap size={60} className="mb-6" />
            <p className="text-2xl font-black uppercase tracking-[0.6em]">
              Registre de Preuves Vierge
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
