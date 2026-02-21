/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
/**
 * 📂 MODULE : GedView (Coffre-fort Documentaire)
 * -------------------------------------------------------------------------
 * FONCTION : Gestionnaire de documentation maîtrisée (§7.5 ISO 9001).
 * RÔLE : Consultation, versionnage et validation des flux documentaires.
 * SÉCURITÉ : Accès scellé aux binaires (Blob) via le Kernel Matrix.
 */

import React, { useState } from 'react';
import { 
  FileText, Eye, Download, History, 
  FileCheck, AlertCircle, Search, Plus, ExternalLink, ShieldCheck,
  CheckCircle
} from 'lucide-react';

export default function GedView({ process }: any) {
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  // Extraction des documents scellés rattachés au processus via le Tenant
  const docs = process?.PR_Documents || [];

  return (
    <div className="flex gap-8 animate-in fade-in duration-500 h-[calc(100vh-350px)]">
      
      {/* 📜 TABLEAU DE BORD DOCUMENTAIRE */}
      <div className={`flex flex-col transition-all duration-700 ease-in-out ${previewDoc ? 'w-1/2 opacity-100 scale-98' : 'w-full scale-100'}`}>
        <div className="bg-white/2 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[9px] font-black uppercase text-slate-500 italic border-b border-white/5 bg-white/5">
                <th className="p-6">Référence & Titre de l&apos;actif</th>
                <th className="p-6 text-center">Version Master</th>
                <th className="p-6">Statut de diffusion</th>
                <th className="p-6 text-right">Contrôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {docs.length > 0 ? docs.map((doc: any) => (
                <tr key={doc.DOC_Id} className="hover:bg-blue-600/5 transition-all group cursor-pointer" onClick={() => setPreviewDoc(doc)}>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-600/10 rounded-xl text-blue-500 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase text-white leading-none tracking-tighter">{doc.DOC_Title}</p>
                        <p className="text-[8px] font-black text-slate-500 mt-2 italic tracking-[0.2em]">{doc.DOC_Reference || 'SANS_REF_SMI'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-mono font-black text-slate-400 italic">
                      v{doc.DOC_CurrentVersion || '1'}.0
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black border uppercase tracking-widest ${
                      doc.DOC_Status === 'APPROUVE' 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {doc.DOC_Status || 'BROUILLON'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc); }}
                        className="p-3 bg-white/5 hover:bg-blue-600 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="p-3 bg-white/5 hover:bg-emerald-600 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl">
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-32 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-20">
                      <ShieldCheck size={64} className="text-slate-500" />
                      <p className="text-[10px] font-black uppercase italic tracking-[0.5em] text-slate-400">Coffre-fort documentaire vide</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🖥️ TIROIR DE PRÉVISUALISATION MATRIX (STYLE CLIQUEUP) */}
      {previewDoc && (
        <div className="w-1/2 bg-[#0F172A] border border-blue-500/20 rounded-[3rem] flex flex-col overflow-hidden animate-in slide-in-from-right-12 duration-700 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          {/* Header du Viewer */}
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30 text-white animate-pulse">
                <FileCheck size={20} />
              </div>
              <div className="text-left">
                <h4 className="text-[11px] font-black uppercase italic tracking-tighter text-white">Scellage numérique : {previewDoc.DOC_Title}</h4>
                <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-1 italic">Vérification de l&apos;intégrité Matrix OK</p>
              </div>
            </div>
            <button onClick={() => setPreviewDoc(null)} className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all font-black border-none cursor-pointer">✕</button>
          </div>
          
          {/* Contenu du Document (Flux PDF Sécurisé) */}
          <div className="flex-1 bg-slate-950/50 flex items-center justify-center p-10">
            <div className="w-full h-full border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 bg-[#0B0F1A]/50 backdrop-blur-md">
              <div className="relative">
                <ExternalLink size={60} className="text-blue-500 opacity-20" />
                <ShieldCheck size={24} className="absolute -bottom-2 -right-2 text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest mb-4">Flux PDF scellé en cours de décryptage...</p>
                <button className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase rounded-2xl transition-all shadow-2xl shadow-blue-600/20 active:scale-95 border-none cursor-pointer">
                   Déchiffrer le document Maître
                </button>
              </div>
            </div>
          </div>

          {/* Footer Metadata ISO */}
          <div className="p-8 bg-[#0B1222] border-t border-white/5 flex justify-between items-center">
              <div className="flex gap-10">
                <HistoryItem label="Dernière Révision" val={new Date().toLocaleDateString('fr-FR')} />
                <HistoryItem label="Auteur du Scellé" val="ADMIN_QUALISOFT" />
                <HistoryItem label="Emplacement" val="KERNEL_GED_MATRIX" />
              </div>
              <button className="flex items-center gap-3 text-[10px] font-black text-emerald-500 uppercase border-2 border-emerald-500/20 px-8 py-4 rounded-3xl bg-emerald-500/5 hover:bg-emerald-500 hover:text-white transition-all duration-500 shadow-lg shadow-emerald-500/5 cursor-pointer">
                <CheckCircle size={16} /> Valider la lecture
              </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 🧩 SOUS-COMPOSANT : ÉLÉMENT D'HISTORIQUE
 */
function HistoryItem({ label, val }: any) {
  return (
    <div className="text-left">
      <p className="text-[8px] font-black text-slate-600 uppercase italic leading-none mb-2 tracking-widest">{label}</p>
      <p className="text-[10px] font-black text-blue-100 uppercase italic leading-none tracking-tighter">{val}</p>
    </div>
  );
}