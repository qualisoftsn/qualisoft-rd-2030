/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { 
  FileText, Eye, Download, History, 
  FileCheck, AlertCircle, Search, Plus, ExternalLink
} from 'lucide-react';

export default function GedView({ process }: any) {
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  const docs = process?.PR_Documents || [];

  return (
    <div className="flex gap-8 animate-in fade-in duration-500 h-full">
      
      {/* 📜 LISTE DES DOCUMENTS DU PROCESSUS */}
      <div className={`flex-1 transition-all duration-500 ${previewDoc ? 'w-1/2' : 'w-full'}`}>
        <div className="bg-white/2 border border-white/5 rounded-[2.5rem] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[8px] font-black uppercase text-slate-500 italic border-b border-white/5 bg-white/2">
                <th className="p-6">Référence & Titre</th>
                <th className="p-6">Version</th>
                <th className="p-6">Statut ISO</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {docs.length > 0 ? docs.map((doc: any) => (
                <tr key={doc.DOC_Id} className="hover:bg-blue-600/5 transition-all group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-600/10 rounded-xl text-blue-500">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase text-white leading-none">{doc.DOC_Title}</p>
                        <p className="text-[8px] font-black text-slate-500 mt-2 italic tracking-widest">{doc.DOC_Reference || 'SANS RÉF.'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-[10px] font-black text-slate-400 italic">
                    v{doc.DOC_CurrentVersion}.0
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-lg text-[8px] font-black border uppercase ${
                      doc.DOC_Status === 'APPROUVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {doc.DOC_Status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => setPreviewDoc(doc)}
                        className="p-2.5 bg-white/5 hover:bg-blue-600 rounded-xl text-slate-400 hover:text-white transition-all"
                      >
                        <Eye size={14} />
                      </button>
                      <button className="p-2.5 bg-white/5 hover:bg-emerald-600 rounded-xl text-slate-400 hover:text-white transition-all">
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <FileText size={48} />
                      <p className="text-[10px] font-black uppercase italic tracking-[0.3em]">Aucune documentation rattachée</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🖥️ TIROIR DE PRÉVISUALISATION (STYLE CLIQUEUP) */}
      {previewDoc && (
        <div className="w-1/2 bg-[#0F172A] border border-blue-500/20 rounded-[3rem] flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-500 shadow-3xl">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg"><FileCheck size={16} /></div>
              <h4 className="text-[10px] font-black uppercase italic tracking-tighter">Prévisualisation : {previewDoc.DOC_Title}</h4>
            </div>
            <button onClick={() => setPreviewDoc(null)} className="text-slate-500 hover:text-white font-black text-xs px-2">✕</button>
          </div>
          
          <div className="flex-1 bg-slate-900/50 flex items-center justify-center p-8">
            {/* ICI : Intégration de ton viewer PDF (Iframe ou PDF.js) */}
            <div className="w-full h-full border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-4">
              <ExternalLink size={40} className="text-blue-500 opacity-30" />
              <p className="text-[9px] font-black text-slate-600 uppercase italic">Chargement du flux PDF sécurisé...</p>
              <button className="mt-4 px-6 py-2 bg-blue-600 text-[10px] font-black uppercase rounded-xl">Ouvrir dans un nouvel onglet</button>
            </div>
          </div>

          <div className="p-6 bg-[#0B1222] border-t border-white/5 flex justify-between items-center">
             <div className="flex gap-4">
                <HistoryItem label="Révisé le" val="12/01/2026" />
                <HistoryItem label="Par" val="A. THIONGANE" />
             </div>
             <button className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase border border-emerald-500/20 px-4 py-2 rounded-xl bg-emerald-500/5">
                Valider la lecture
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryItem({ label, val }: any) {
  return (
    <div>
      <p className="text-[7px] font-black text-slate-600 uppercase italic leading-none mb-1">{label}</p>
      <p className="text-[9px] font-black text-slate-300 uppercase italic leading-none">{val}</p>
    </div>
  );
}