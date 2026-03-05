/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : RAPPORT D'AUDIT ET CLÔTURE (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Saisie des constats et auto-génération de Fiches d'Anomalies (NC).
 * FIX : Logic de détection de gravité NC, Layout ClickUp 100dvh.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 01:20 GMT
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { FileText, Plus, Trash2, Save, Loader2, ArrowLeft, ShieldAlert, CheckCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function RapportAuditPage() {
  const params = useParams();
  const id = params?.id as string; 
  const router = useRouter();
  
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [findings, setFindings] = useState<any[]>([{ FI_Description: '', FI_Type: 'CONFORMITE' }]);

  useEffect(() => {
    if (id) {
      apiClient.get(`/audits/${id}`)
        .then(res => setAudit(res.data))
        .catch(() => toast.error("Audit introuvable."))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const addFinding = () => setFindings([...findings, { FI_Description: '', FI_Type: 'CONFORMITE' }]);
  
  const updateFinding = (index: number, field: string, value: string) => {
    const next = [...findings];
    next[index][field] = value;
    setFindings(next);
  };

  const handleSubmit = async () => {
    if (findings.some(f => !f.FI_Description.trim())) return toast.error("Complétez tous les constats.");
    const tid = toast.loading("Audit des constats et scellement du rapport final...");
    try {
      setSubmitting(true);
      await apiClient.post(`/audits/${id}/submit-report`, { findings });
      toast.success("Rapport clôturé. Les NC ont été injectées dans le PAQ.", { id: tid });
      router.push('/dashboard/audits');
    } catch (err) { toast.error("Échec du scellement.", { id: tid }); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="h-full flex items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase text-xs animate-pulse tracking-widest">Initialisation du Rapport Souverain...</div>;

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="shrink-0 p-6 md:p-8 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-4 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all border-none cursor-pointer text-white">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter m-0">Rapport d&apos;<span className="text-blue-500">Audit</span></h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2 italic">REF: {audit?.AU_Reference} • Processus: {audit?.AU_Processus?.PR_Libelle}</p>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={submitting} className="w-full md:w-auto px-10 py-5 bg-emerald-600 hover:bg-white hover:text-emerald-900 text-white rounded-4xl font-black uppercase italic text-xs tracking-widest shadow-2xl transition-all border-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95">
          {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />} Clôturer & Archiver
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="bg-[#0F172A] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl">
            <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-8">
              <h2 className="text-2xl font-black uppercase italic m-0">Constats de Terrain</h2>
              <button onClick={addFinding} className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl hover:scale-110 transition-all border-none cursor-pointer"><Plus size={24} /></button>
            </div>

            <div className="space-y-8">
              {findings.map((f, i) => (
                <div key={i} className="p-6 md:p-8 bg-[#0B0F1A] border border-white/5 rounded-[2.5rem] grid grid-cols-1 xl:grid-cols-12 gap-8 hover:border-blue-500/30 transition-all">
                  <div className="xl:col-span-8 space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Détails factuels du constat</label>
                    <textarea className="w-full bg-[#0F172A] border border-white/10 rounded-2xl p-6 text-sm font-bold text-white outline-none focus:border-blue-500 min-h-30 resize-none italic" value={f.FI_Description} onChange={e => updateFinding(i, 'FI_Description', e.target.value)} placeholder="Saisissez l'observation..." />
                  </div>
                  <div className="xl:col-span-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Classification ISO</label>
                      <select className={`w-full bg-[#0F172A] border-2 rounded-2xl p-5 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer appearance-none ${f.FI_Type.includes('NC') ? 'border-red-500/30 text-red-500' : 'border-blue-500/30 text-blue-500'}`} value={f.FI_Type} onChange={e => updateFinding(i, 'FI_Type', e.target.value)}>
                        <option value="CONFORMITE" className="bg-[#0B0F1A]">✅ Conformité</option>
                        <option value="POINT_FORT" className="bg-[#0B0F1A]">⭐ Point Fort</option>
                        <option value="OBSERVATION" className="bg-[#0B0F1A]">👀 Observation</option>
                        <option value="NC_MINEURE" className="bg-[#0B0F1A]">⚠️ NC Mineure</option>
                        <option value="NC_MAJEURE" className="bg-[#0B0F1A]">🚨 NC Majeure</option>
                      </select>
                    </div>
                    <button onClick={() => setFindings(findings.filter((_, idx) => idx !== i))} disabled={findings.length === 1} className="w-full mt-4 py-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl text-[9px] font-black uppercase transition-all border-none cursor-pointer disabled:opacity-20 flex items-center justify-center gap-2">
                       <Trash2 size={16}/> Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {findings.some(f => f.FI_Type.includes('NC')) && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-[3rem] p-8 md:p-10 animate-in slide-in-from-bottom-6">
              <h3 className="text-red-500 font-black uppercase italic text-xl m-0 mb-6 flex items-center gap-4"><ShieldAlert size={32} /> Alertes Non-Conformités Détectées</h3>
              <div className="space-y-4">
                {findings.filter(f => f.FI_Type.includes('NC')).map((nc, idx) => (
                  <div key={idx} className="p-4 bg-red-500/10 rounded-2xl border border-red-500/10 text-[10px] font-bold text-white uppercase italic tracking-widest flex items-center gap-4">
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_red]"/> {nc.FI_Type} : {nc.FI_Description.substring(0, 100)}...
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}