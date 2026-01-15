/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { ShieldCheck, FileText, Hash, MessageSquare, Loader2, UploadCloud, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuditPreuvesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [preuves, setPreuves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ documentId: '', comment: '' });

  useEffect(() => {
    const fetchPreuvesData = async () => {
      try {
        const [resDocs, resAudit] = await Promise.all([
          apiClient.get('/documents'),
          apiClient.get(`/audits/${params.id}`) // Assure-toi que cet endpoint renvoie l'audit et ses preuves liées
        ]);
        setDocuments(resDocs.data || []);
        setPreuves(resAudit.data?.AU_Preuves || []);
      } catch (err) { console.error("Erreur Sync Preuves"); } finally { setLoading(false); }
    };
    fetchPreuvesData();
  }, [params.id]);

  const handleLinkPreuve = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/audits/${params.id}/preuves`, formData);
      alert("Preuve figée avec succès !");
      setFormData({ documentId: '', comment: '' });
      // Rafraîchir...
    } catch (e) { alert("Erreur lors de la liaison"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase"><Loader2 className="animate-spin mr-3" /> Extraction GED...</div>;

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans text-left">
      <header className="mb-10 flex justify-between items-center border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 text-slate-400"><ArrowLeft size={20}/></button>
          <div>
            <h1 className="text-4xl font-black italic uppercase text-white tracking-tighter">Collecte des <span className="text-blue-600">Preuves</span></h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Audit ID: {params.id.split('-')[0]} • Liaison documentaire GED</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 h-fit">
          <h2 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3"><UploadCloud className="text-blue-500" /> Figer un document</h2>
          <form onSubmit={handleLinkPreuve} className="space-y-6">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-500 ml-4 mb-2 block">Document Source</label>
              <select required className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-bold text-white outline-none focus:border-blue-500"
                      value={formData.documentId} onChange={e => setFormData({...formData, documentId: e.target.value})}>
                <option value="">-- Sélectionner dans la GED --</option>
                {documents.map(d => <option key={d.DOC_Id} value={d.DOC_Id} className="bg-slate-900">{d.DOC_Title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-500 ml-4 mb-2 block">Observations</label>
              <textarea placeholder="Constat lors de la revue du document..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-bold text-white outline-none focus:border-blue-500 min-h-25"
                        value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} />
            </div>
            <button className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase italic text-xs shadow-xl active:scale-95">Lier à l&apos;audit</button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-black italic uppercase text-white mb-6">Éléments de preuve collectés</h2>
          {preuves.length === 0 ? (
            <div className="p-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center text-slate-600 font-black uppercase italic">Aucune preuve collectée</div>
          ) : (
            preuves.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-slate-900/40 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 shadow-sm"><FileText size={24} /></div>
                  <div>
                    <h4 className="font-black text-white uppercase text-sm italic">{p.PV_FileName || "Document lié"}</h4>
                    <div className="flex items-center gap-4 mt-1 text-[9px] font-bold text-slate-500 uppercase italic">
                      <span className="flex items-center gap-1"><MessageSquare size={12} className="text-blue-500"/> {p.PV_Commentaire || "Sans observation"}</span>
                    </div>
                  </div>
                </div>
                <button className="text-[9px] font-black uppercase text-blue-500 hover:text-white transition-colors underline">Consulter</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}