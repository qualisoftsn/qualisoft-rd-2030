/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { ArrowLeft, Printer, Save, CheckCircle2, AlertOctagon, Clock, User, Building2, Loader2 } from 'lucide-react';

export default function DetailNonConformitePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [nc, setNc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [analyse, setAnalyse] = useState('');

  const chargerDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/non-conformites/${id}`);
      setNc(res.data);
      setAnalyse(res.data.NC_Diagnostic || '');
    } catch (e) {
      router.push('/dashboard/non-conformites');
    } finally { setLoading(false); }
  }, [id, router]);

  useEffect(() => { chargerDetails(); }, [chargerDetails]);

  const sauvegarderAnalyse = async () => {
    setIsSaving(true);
    try {
      await apiClient.patch(`/non-conformites/${id}`, { 
        NC_Diagnostic: analyse, 
        NC_Statut: 'ANALYSE' // ✅ Valeur Enum Prisma
      });
      chargerDetails();
    } finally { setIsSaving(false); }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-red-600" size={40} />
      <span className="text-[10px] font-black uppercase text-red-600 mt-4 italic">Chargement Dossier NC...</span>
    </div>
  );

  return (
    <div className="px-6 py-8 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans text-left">
      <div className="mb-8 flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all">
          <ArrowLeft size={16} /> Retour au registre
        </button>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-white/10 transition-all italic">
            <Printer size={16} /> Imprimer PV
          </button>
          <button onClick={sauvegarderAnalyse} disabled={isSaving} className="px-8 py-3 bg-red-600 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg hover:bg-red-500 transition-all italic">
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Enregistrer l&apos;analyse</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-4 space-y-6 text-left">
          <div className="bg-[#151A2D] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12"><AlertOctagon size={80} /></div>
            <span className="px-4 py-1.5 bg-red-600/10 border border-red-500/20 rounded-full text-[9px] font-black text-red-500 uppercase tracking-widest mb-6 inline-block italic">Écart — {nc?.NC_Statut}</span>
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-tight mb-4 text-white italic">{nc?.NC_Libelle}</h1>
            <div className="space-y-4 pt-6 border-t border-white/5 italic">
              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400"><Clock size={16} className="text-red-500" /> Date : {new Date(nc?.NC_CreatedAt).toLocaleDateString()}</div>
              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400"><User size={16} className="text-blue-500" /> Détecteur : {nc?.NC_Detector?.U_FirstName} {nc?.NC_Detector?.U_LastName}</div>
            </div>
            <div className="mt-8 p-6 bg-black/20 rounded-2xl border border-white/5 italic">
              <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Constat</p>
              <p className="text-xs leading-relaxed text-slate-300 italic">{nc?.NC_Description}</p>
            </div>
          </div>
        </div>

        <div className="col-span-8 space-y-8 text-left">
          <div className="bg-[#151A2D] border border-white/10 rounded-[3rem] p-10 shadow-3xl flex flex-col">
            <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3"><span className="text-red-600">01.</span> Diagnostic & Causes</h2>
            <textarea value={analyse} onChange={(e) => setAnalyse(e.target.value)} placeholder="Analyse des causes racines..." className="w-full p-8 bg-black/20 border border-white/10 rounded-[2.5rem] text-sm font-bold text-white outline-none focus:border-red-500 min-h-60 leading-relaxed italic" />
          </div>

          <div className="bg-[#151A2D] border border-white/10 rounded-[3rem] p-10 shadow-3xl text-left">
            <h2 className="text-2xl font-black uppercase italic mb-10 flex items-center gap-3"><span className="text-red-600">02.</span> Actions Correctives (CAPA)</h2>
            <div className="space-y-4">
              {nc?.NC_Actions?.length > 0 ? nc.NC_Actions.map((action: any) => (
                <div key={action.ACT_Id} className="p-6 bg-black/20 border border-white/5 rounded-3xl flex items-center justify-between italic">
                  <div className="flex items-center gap-6">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    <div>
                      <p className="text-[11px] font-black uppercase text-white">{action.ACT_Title}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase italic">Échéance : {new Date(action.ACT_Deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="px-4 py-1.5 bg-slate-800 rounded-lg text-[8px] font-black uppercase italic">{action.ACT_Status}</span>
                </div>
              )) : <p className="text-[10px] text-slate-600 uppercase font-black text-center py-10 italic">Aucune action corrective associée.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}