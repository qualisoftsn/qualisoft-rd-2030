/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📂 MODULE : GedView.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Gestion documentaire maîtrisée (Coffre-fort GED).
 * RÉVISION : 02 Mars 2026 | 18:50 GMT
 */

"use client";

import { useState } from 'react';
import { 
  FileText, Eye, Download, FileCheck, ShieldCheck, 
  ExternalLink, CheckCircle, Lock} from 'lucide-react';

export default function GedView({ process }: any) {
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const docs = process?.PR_Documents || [];

  return (
    <div className="flex gap-10 animate-in fade-in duration-1000 h-[calc(100vh-400px)] font-sans italic">
      
      {/* 📜 TABLEAU DE BORD GED */}
      <div className={`transition-all duration-700 ease-in-out ${previewDoc ? 'w-1/2' : 'w-full'}`}>
        <div className="bg-white/2 border border-white/10 rounded-[3.5rem] overflow-hidden shadow-4xl backdrop-blur-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-500 italic border-b border-white/5 bg-white/5 tracking-widest">
                <th className="p-8">Actif Documentaire</th>
                <th className="p-8 text-center">Version</th>
                <th className="p-8">Statut Diffusion</th>
                <th className="p-8 text-right">Contrôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {docs.length > 0 ? docs.map((doc: any) => (
                <tr key={doc.DOC_Id} className="hover:bg-blue-600/10 transition-all group cursor-pointer" onClick={() => setPreviewDoc(doc)}>
                  <td className="p-8">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 border border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                        <FileText size={22} />
                      </div>
                      <div className="leading-none">
                        <p className="text-[13px] font-black uppercase text-white tracking-tighter m-0">{doc.DOC_Title}</p>
                        <p className="text-[9px] font-black text-slate-500 mt-2 italic m-0 tracking-widest">REF: {doc.DOC_Reference || 'SMI_UNSTABLE'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8 text-center">
                    <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-mono font-black text-slate-400 italic border border-white/5">
                      v{doc.DOC_CurrentVersion || '1'}.0
                    </span>
                  </td>
                  <td className="p-8">
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black border uppercase tracking-[0.2em] ${
                      doc.DOC_Status === 'APPROUVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_#10b98120]' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {doc.DOC_Status || 'BROUILLON'}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 translate-x-4">
                      <button className="p-3 bg-white/10 rounded-xl text-white hover:bg-blue-600 transition-all border-none cursor-pointer shadow-2xl"><Eye size={18} /></button>
                      <button className="p-3 bg-white/10 rounded-xl text-white hover:bg-emerald-600 transition-all border-none cursor-pointer shadow-2xl"><Download size={18} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="p-32 text-center">
                  <ShieldCheck size={80} className="text-slate-800 mx-auto mb-8 opacity-10" />
                  <p className="text-[10px] font-black uppercase italic tracking-[0.6em] text-slate-600">Coffre-fort scellé vide</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🖥️ PREVIEW MATRIX SIDEBAR */}
      {previewDoc && (
        <aside className="w-1/2 bg-[#0F172A] border border-blue-500/30 rounded-[3.5rem] flex flex-col overflow-hidden animate-in slide-in-from-right-20 duration-700 shadow-4xl relative">
          <header className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-blue-600 rounded-xl text-white shadow-3xl"><FileCheck size={20} /></div>
              <div>
                <h4 className="text-xs font-black uppercase italic tracking-tighter text-white m-0 truncate w-64">{previewDoc.DOC_Title}</h4>
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1 m-0">Intégrité Matrix SDE : OK</p>
              </div>
            </div>
            <button onClick={() => setPreviewDoc(null)} className="p-3 hover:bg-red-500/20 text-slate-500 hover:text-red-500 rounded-full transition-all border-none bg-transparent cursor-pointer font-black text-lg">✕</button>
          </header>
          
          <div className="flex-1 bg-slate-950/80 flex items-center justify-center p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="w-full h-full border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center gap-8 bg-[#0B0F1A]/80 backdrop-blur-3xl relative z-10 shadow-inner">
              <div className="relative group/lock">
                <ExternalLink size={64} className="text-blue-600 opacity-20 group-hover/lock:opacity-100 transition-opacity" />
                <Lock size={28} className="absolute -bottom-2 -right-2 text-amber-500 animate-pulse" />
              </div>
              <div className="text-center space-y-6">
                <p className="text-[10px] font-black text-slate-500 uppercase italic tracking-[0.4em] m-0">Flux Documentaire Master (SDE)</p>
                <button className="px-12 py-5 bg-blue-600 hover:bg-white hover:text-blue-600 text-white text-[11px] font-black uppercase rounded-2xl transition-all shadow-3xl border-none cursor-pointer tracking-widest">Déchiffrer le Document</button>
              </div>
            </div>
          </div>

          <footer className="p-8 bg-[#0B0F1A] border-t border-white/10 flex justify-between items-center">
            <div className="flex gap-10">
              <Metadata label="Dernier Scellage" val={new Date().toLocaleDateString('fr-FR')} />
              <Metadata label="Auteur" val="ADMIN_SDE" />
            </div>
            <button className="flex items-center gap-3 text-[10px] font-black text-emerald-500 uppercase border-2 border-emerald-500/20 px-8 py-4 rounded-full bg-emerald-500/5 hover:bg-emerald-500 hover:text-white transition-all duration-500 cursor-pointer italic tracking-widest">
              <CheckCircle size={16} /> Enregistrer la lecture
            </button>
          </footer>
        </aside>
      )}
    </div>
  );
}

function Metadata({ label, val }: any) {
  return (
    <div className="text-left">
      <p className="text-[8px] font-black text-slate-600 uppercase italic m-0 mb-2 tracking-widest">{label}</p>
      <p className="text-[11px] font-black text-blue-200 uppercase italic m-0 tracking-tighter">{val}</p>
    </div>
  );
}
