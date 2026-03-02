/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : COLLECTE DES PREUVES D'AUDIT
 * -------------------------------------------------------------------------
 * RÔLE : Liaison entre les documents de la GED et un audit spécifique.
 * FIX : Intégration de Sonner, ajout d'une fonction de rafraîchissement 
 * automatique après l'ajout d'une preuve, et design rehaussé.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 13:24 GMT
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { FileText, MessageSquare, Loader2, UploadCloud, ArrowLeft, Link as LinkIcon } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';

// --- INTERFACES STRICTES ---
interface DocumentGED { DOC_Id: string; DOC_Title: string; }
interface PreuveAudit { PV_FileName?: string; PV_Commentaire?: string; }
interface AuditData { AU_Preuves?: PreuveAudit[]; }
interface PreuveFormData { documentId: string; comment: string; }

export default function AuditPreuvesPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [documents, setDocuments] = useState<DocumentGED[]>([]);
  const [preuves, setPreuves] = useState<PreuveAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [formData, setFormData] = useState<PreuveFormData>({ documentId: '', comment: '' });

  const fetchPreuvesData = useCallback(async (showLoader = true) => {
    if (!id) return;
    try {
      if (showLoader) setLoading(true);
      const [resDocs, resAudit] = await Promise.all([
        apiClient.get('/documents').catch(() => ({ data: [] })),
        apiClient.get(`/audits/${id}`).catch(() => ({ data: null }))
      ]);
      
      const docsData = resDocs.data?.data || resDocs.data;
      setDocuments(Array.isArray(docsData) ? docsData : []);
      
      setPreuves(resAudit.data?.AU_Preuves || []);
    } catch (err) { 
      toast.error("Erreur de synchronisation des preuves."); 
    } finally { 
      setLoading(false); 
    }
  }, [id]);

  useEffect(() => {
    fetchPreuvesData();
  }, [fetchPreuvesData]);

  const handleLinkPreuve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.documentId) {
      toast.error("Veuillez sélectionner un document.");
      return;
    }

    setIsLinking(true);
    const tid = toast.loading("Liaison du document en cours...");
    try {
      await apiClient.post(`/audits/${id}/preuves`, formData);
      toast.success("Preuve figée et rattachée à l'audit !", { id: tid });
      setFormData({ documentId: '', comment: '' });
      // Rafraîchissement silencieux des preuves
      fetchPreuvesData(false);
    } catch (e: any) { 
      toast.error(e.response?.data?.message || "Erreur lors de la liaison du document.", { id: tid }); 
    } finally {
      setIsLinking(false);
    }
  };

  if (loading && preuves.length === 0) return (
    <div className="h-screen flex items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase ml-0 lg:ml-72 gap-4">
      <Loader2 className="animate-spin" size={40} /> Extraction GED...
    </div>
  );

  return (
    <div className="p-6 lg:p-10 bg-[#0B0F1A] min-h-screen ml-0 lg:ml-72 text-white italic font-sans text-left selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="mb-10 lg:mb-12 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 border-b-2 border-white/5 pb-8 mt-12 lg:mt-0">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-all border-none">
            <ArrowLeft size={20}/>
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-black italic uppercase text-white tracking-tighter m-0 leading-none">
              Collecte des <span className="text-blue-600">Preuves</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-3 m-0">
              Audit ID: {id?.split('-')[0]} • Liaison documentaire GED
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* FORMULAIRE D'AJOUT */}
        <div className="xl:col-span-1 bg-slate-900/40 p-8 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] border border-white/5 h-fit shadow-2xl xl:sticky top-10">
          <h2 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3 m-0">
            <UploadCloud className="text-blue-500" size={24} /> Figer un document
          </h2>
          <form onSubmit={handleLinkPreuve} className="space-y-6">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 mb-3 block">
                Document Source (GED)
              </label>
              <div className="relative">
                <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <select 
                  required 
                  className="w-full bg-black/40 border-2 border-white/5 rounded-3xl pl-12 pr-5 py-4 text-xs font-bold text-white outline-none focus:border-blue-500 cursor-pointer transition-colors appearance-none"
                  value={formData.documentId} 
                  onChange={e => setFormData({...formData, documentId: e.target.value})}
                >
                  <option value="" className="text-slate-500">-- Sélectionner dans la GED --</option>
                  {documents.map(d => <option key={d.DOC_Id} value={d.DOC_Id} className="bg-[#0B0F1A]">{d.DOC_Title}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 mb-3 block">
                Observations Auditeur
              </label>
              <textarea 
                placeholder="Constat factuel lors de la revue du document..." 
                className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-5 text-xs font-bold text-white outline-none focus:border-blue-500 min-h-30 transition-colors resize-y"
                value={formData.comment} 
                onChange={e => setFormData({...formData, comment: e.target.value})} 
              />
            </div>
            <button 
              type="submit" 
              disabled={isLinking}
              className="w-full py-5 bg-linear-to-r from-blue-600 to-blue-800 text-white rounded-3xl font-black uppercase italic text-xs shadow-xl shadow-blue-900/20 active:scale-95 cursor-pointer hover:from-blue-500 hover:to-blue-700 transition-all border-none disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLinking ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
              {isLinking ? "Liaison..." : "Lier à l'audit"}
            </button>
          </form>
        </div>

        {/* LISTE DES PREUVES */}
        <div className="xl:col-span-2 space-y-6">
          <h2 className="text-xl font-black italic uppercase text-white mb-8 m-0 flex items-center gap-3">
             <FileText className="text-blue-500" size={24} /> Éléments collectés ({preuves.length})
          </h2>
          
          {preuves.length === 0 ? (
            <div className="p-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center flex flex-col items-center justify-center">
              <FileText size={48} className="text-slate-600 mb-4 opacity-50" />
              <p className="text-slate-500 font-black uppercase tracking-widest text-xs m-0 italic">
                Aucune preuve matérielle collectée
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {preuves.map((p, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 lg:p-8 bg-slate-900/40 rounded-4xl border border-white/5 hover:border-blue-500/30 hover:bg-white/5 transition-all group">
                  <div className="flex gap-5 items-start">
                    <div className="w-14 h-14 bg-linear-to-br from-blue-600/20 to-blue-800/20 rounded-2xl flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-white uppercase text-sm italic m-0 tracking-tight leading-tight group-hover:text-blue-300 transition-colors">
                        {p.PV_FileName || "Document lié (GED)"}
                      </h4>
                      <div className="flex items-start gap-3 mt-3 text-[10px] font-bold text-slate-400 uppercase italic tracking-widest bg-black/20 p-3 rounded-xl border border-white/5">
                        <MessageSquare size={14} className="text-blue-500 shrink-0 mt-0.5"/> 
                        <span className="leading-relaxed normal-case">
                          {p.PV_Commentaire || "Aucune observation rédigée"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors bg-white/5 px-6 py-4 rounded-xl border border-white/5 cursor-pointer shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                    Consulter
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}