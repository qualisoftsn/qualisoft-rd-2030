/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { Paperclip, FileText, Trash2, ExternalLink, ShieldCheck } from 'lucide-react';

export default function EvidenceSection({ itemId, initialEvidences = [] }: any) {
  const [evidences, setEvidences] = useState(initialEvidences);

  return (
    <div className="mt-8 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
            <ShieldCheck className="text-green-400" size={24} />
            Preuves de conformité
          </h4>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Dossier de preuve pour audit</p>
        </div>
        <button className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-green-400 transition-all flex items-center gap-2">
          <Paperclip size={16} /> Ajouter un fichier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evidences.length > 0 ? evidences.map((ev: any) => (
          <div key={ev.id} className="bg-slate-800 p-5 rounded-3xl border border-slate-700 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-700 rounded-2xl text-green-400">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm font-bold truncate max-w-37.5">{ev.evidenceTitre}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase italic">Par {ev.uploadedBy?.firstName}</p>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <a href={ev.evidenceUrl} target="_blank" className="p-2 hover:text-green-400"><ExternalLink size={18}/></a>
              <button className="p-2 hover:text-red-400"><Trash2 size={18}/></button>
            </div>
          </div>
        )) : (
          <div className="col-span-2 py-10 border-2 border-dashed border-slate-800 rounded-4xl text-center text-slate-600 font-bold uppercase italic text-xs">
            Aucun document n&apos;a été rattaché à cette action.
          </div>
        )}
      </div>
    </div>
  );
}