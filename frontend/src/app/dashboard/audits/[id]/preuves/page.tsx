/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : COLLECTE DES PREUVES D'AUDIT (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Liaison immuable entre GED et Mission d'Audit.
 * FIX : Layout PWA, Synchronisation GED en temps réel.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 01:15 GMT
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { FileText, MessageSquare, Loader2, UploadCloud, ArrowLeft, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';

export default function AuditPreuvesPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [documents, setDocuments] = useState<any[]>([]);
  const [preuves, setPreuves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [formData, setFormData] = useState({ documentId: '', comment: '' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resDocs, resAudit] = await Promise.all([
        apiClient.get('/documents'),
        apiClient.get(`/audits/${id}`)
      ]);
      setDocuments(resDocs.data?.data || resDocs.data || []);
      setPreuves(resAudit.data?.AU_Preuves || []);
    } catch (err) { toast.error("Échec d'extraction GED."); } 
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { if(id) fetchData(); }, [id, fetchData]);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLinking(true);
    const tid = toast.loading("Scellage de la preuve dans le dossier d'audit...");
    try {
      await apiClient.post(`/audits/${id}/preuves`, formData);
      toast.success("Document rattaché avec succès.", { id: tid });
      setFormData({ documentId: '', comment: '' });
      fetchData();
    } catch (e: any) { toast.error("Erreur de liaison.", { id: tid }); }
    finally { setIsLinking(false); }
  };

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="shrink-0 p-6 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-md flex items-center gap-6">
        <button onClick={() => router.back()} className="p-4 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all border-none cursor-pointer text-white">
          <ArrowLeft size={20}/>
        </button>
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter m-0">Collecte des <span className="text-blue-600">Preuves</span></h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2 m-0">AUDIT ID: {id?.substring(0,8)} • SÉCURITÉ GED ISO 9001</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        <aside className="w-full xl:w-96 p-8 bg-[#0F172A]/30 border-r border-white/5 overflow-y-auto">
          <h2 className="text-lg font-black uppercase italic mb-8 flex items-center gap-3"><UploadCloud className="text-blue-500" size={24} /> Figer un Document</h2>
          <form onSubmit={handleLink} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 block">Source Documentaire</label>
              <select required className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-4 text-[11px] font-bold text-white outline-none focus:border-blue-500 appearance-none cursor-pointer" value={formData.documentId} onChange={e => setFormData({...formData, documentId: e.target.value})}>
                <option value="">-- Sélectionner dans la GED --</option>
                {documents.map(d => <option key={d.DOC_Id} value={d.DOC_Id} className="bg-[#0B0F1A]">{d.DOC_Title}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 block">Observations Constatées</label>
              <textarea placeholder="Description factuelle du document revu..." className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-5 text-xs font-bold text-white outline-none focus:border-blue-500 min-h-37.5 resize-none italic" value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} />
            </div>
            <button type="submit" disabled={isLinking || !formData.documentId} className="w-full py-5 bg-blue-600 hover:bg-white hover:text-blue-900 text-white rounded-3xl font-black uppercase italic text-xs shadow-xl transition-all border-none cursor-pointer disabled:opacity-30">
              {isLinking ? <Loader2 size={16} className="animate-spin" /> : "Lier à l'Audit Materiel"}
            </button>
          </form>
        </aside>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          <h2 className="text-xl font-black italic uppercase mb-8 flex items-center gap-3"><FileText className="text-blue-500" size={24} /> Éléments Probants ({preuves.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {preuves.length > 0 ? preuves.map((p, i) => (
              <div key={i} className="p-6 bg-[#0F172A] rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all flex flex-col justify-between group">
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 shrink-0 border border-blue-500/10">
                    <FileText size={22} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-white uppercase truncate m-0 group-hover:text-blue-400 transition-colors">{p.PV_FileName || "Document GED"}</h4>
                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mt-1">Rattaché le {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="p-4 bg-[#0B0F1A] rounded-xl border border-white/5 text-[11px] text-slate-400 leading-relaxed italic mb-6">
                   <MessageSquare size={14} className="text-blue-500 mb-2" />
                   {p.PV_Commentaire || "Aucun commentaire rédigé."}
                </div>
                <button className="w-full py-3 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-blue-600 hover:text-white transition-all border-none cursor-pointer flex items-center justify-center gap-2">
                  <ExternalLink size={14} /> Consulter l&apos;original
                </button>
              </div>
            )) : (
              <div className="col-span-full h-40 border border-dashed border-white/5 rounded-3xl flex items-center justify-center text-slate-600 italic uppercase font-black text-[10px] tracking-widest">
                Aucune preuve scellée pour le moment
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}