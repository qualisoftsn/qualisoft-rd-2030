/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  ArrowLeft, Save, Paperclip, MessageSquare, 
  CheckCircle2, Clock, ShieldAlert, Loader2, Send
} from 'lucide-react';

export default function DetailReclamationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [rec, setRec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient.get(`/reclamations`).then(res => {
      const current = res.data.find((r: any) => r.REC_Id === id);
      setRec(current);
      setLoading(false);
    });
  }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await apiClient.patch(`/reclamations/${id}`, rec);
      router.refresh();
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A]"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white font-sans italic">
      <div className="max-w-5xl mx-auto space-y-10">
        
        <header className="flex justify-between items-center border-b border-white/5 pb-10">
          <div className="flex items-center gap-6 text-left">
            <button onClick={() => router.back()} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-blue-500 font-black text-xs uppercase tracking-widest leading-none mb-1">{rec?.REC_Reference}</p>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">{rec?.REC_Object}</h1>
            </div>
          </div>
          <button 
            onClick={handleUpdate}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs flex items-center gap-3 transition-all"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={18} />} Enregistrer le traitement
          </button>
        </header>

        <div className="grid grid-cols-3 gap-8 text-left">
          {/* INFOS GÉNÉRALES */}
          <div className="col-span-2 space-y-8">
            <section className="bg-slate-900/40 p-10 rounded-[3rem] border border-white/5">
              <h3 className="text-sm font-black uppercase text-blue-400 mb-6 flex items-center gap-2 italic">
                <MessageSquare size={16} /> Description de l&apos;Écart
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/5 mb-8">
                {rec?.REC_Description}
              </p>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Solution Proposée & Analyse</label>
                <textarea 
                  className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 text-sm font-bold outline-none focus:border-blue-500 min-h-37.5"
                  value={rec?.REC_SolutionProposed || ''}
                  onChange={(e) => setRec({...rec, REC_SolutionProposed: e.target.value})}
                  placeholder="Décrivez ici l'analyse des causes et la solution immédiate apportée..."
                />
              </div>
            </section>

            <section className="bg-emerald-500/5 p-10 rounded-[3rem] border border-emerald-500/10">
              <h3 className="text-sm font-black uppercase text-emerald-500 mb-6 flex items-center gap-2 italic">
                <CheckCircle2 size={16} /> Retour & Satisfaction Client
              </h3>
              <textarea 
                className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 text-sm font-bold outline-none focus:border-emerald-500 min-h-25"
                value={rec?.REC_ClientFeedback || ''}
                onChange={(e) => setRec({...rec, REC_ClientFeedback: e.target.value})}
                placeholder="Commentaires du client après résolution..."
              />
            </section>
          </div>

          {/* WORKFLOW & STATUT */}
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 space-y-6">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-500 uppercase italic">Statut de Traitement</p>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase text-blue-500 outline-none"
                  value={rec?.REC_Status}
                  onChange={(e) => setRec({...rec, REC_Status: e.target.value})}
                >
                  <option value="NOUVELLE">Nouvelle</option>
                  <option value="EN_COURS">En cours d&apos;analyse</option>
                  <option value="REGLEE">Réglée / Clôturée</option>
                  <option value="REPORTEE">Reportée</option>
                  <option value="SANS_OBJET">Sans Objet</option>
                </select>
              </div>

              <div className="h-px bg-white/5"></div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold italic uppercase">
                  <span className="text-slate-500">Source:</span>
                  <span className="text-slate-100">{rec?.REC_Source}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold italic uppercase">
                  <span className="text-slate-500">Tier:</span>
                  <span className="text-blue-400 underline">{rec?.REC_Tier?.TR_Name}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold italic uppercase">
                  <span className="text-slate-500">Délai:</span>
                  <span className={new Date(rec?.REC_Deadline) < new Date() ? 'text-red-500' : 'text-slate-300'}>
                    {rec?.REC_Deadline ? new Date(rec.REC_Deadline).toLocaleDateString() : 'Non défini'}
                  </span>
                </div>
              </div>

              <button className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase italic hover:bg-white/10 transition-all">
                <Paperclip size={14} /> Joindre une preuve (PV)
              </button>
            </div>

            <div className="bg-blue-600/5 p-8 rounded-[3rem] border border-blue-500/10">
               <p className="text-[9px] font-black text-blue-500 uppercase italic mb-2 tracking-widest">Action PAQ liée</p>
               <p className="text-[10px] font-bold text-slate-400 italic leading-relaxed">
                 Cette réclamation est pilotée par le plan d&apos;action du processus 
                 <span className="text-blue-400"> {rec?.REC_Processus?.PR_Libelle}</span>.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}