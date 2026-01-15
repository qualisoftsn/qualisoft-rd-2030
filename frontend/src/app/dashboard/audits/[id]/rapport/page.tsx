/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  FileText, Plus, Trash2, Save, Loader2, ArrowLeft, ShieldAlert 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RapportAuditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [findings, setFindings] = useState<any[]>([{ FI_Description: '', FI_Type: 'CONFORMITE' }]);
  const [ncs, setNcs] = useState<any[]>([]);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const res = await apiClient.get(`/audits/${id}`);
        setAudit(res.data);
      } catch (err) { console.error("Erreur chargement rapport"); } 
      finally { setLoading(false); }
    };
    fetchAudit();
  }, [id]);

  const addFinding = () => setFindings([...findings, { FI_Description: '', FI_Type: 'CONFORMITE' }]);
  const removeFinding = (idx: number) => setFindings(findings.filter((_, i) => i !== idx));

  const updateFinding = (index: number, field: string, value: string) => {
    const newFindings = [...findings];
    newFindings[index][field] = value;
    setFindings(newFindings);

    if (field === 'FI_Type' && (value === 'NC_MINEURE' || value === 'NC_MAJEURE')) {
      if (!ncs.find(n => n.index === index)) {
        setNcs([...ncs, { 
          index, 
          NC_Libelle: `Écart: ${audit?.AU_Title}`, 
          NC_Description: newFindings[index].FI_Description,
          NC_Gravite: value === 'NC_MAJEURE' ? 'MAJEURE' : 'MINEURE'
        }]);
      }
    }
  };

  const handleSubmitReport = async () => {
    try {
      setSubmitting(true);
      await apiClient.post(`/audits/${id}/submit-report`, { findings, nonConformites: ncs });
      toast.success("Rapport clôturé et transmis !");
      router.push('/dashboard/audits');
    } catch (err) { toast.error("Erreur lors de la clôture."); } 
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A]"><Loader2 className="animate-spin text-blue-500" size={40}/></div>;

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white font-sans italic text-left">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex justify-between items-center border-b border-white/5 pb-10">
          <div className="flex items-center gap-6 text-left">
            <button onClick={() => router.back()} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-slate-400"><ArrowLeft size={20} /></button>
            <div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">Rapport d&apos;<span className="text-blue-500">Audit</span></h1>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em] mt-2 italic">Réf: {audit?.AU_Reference} • {audit?.AU_Processus?.PR_Libelle}</p>
            </div>
          </div>
          <button onClick={handleSubmitReport} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-3xl font-black uppercase italic text-xs shadow-2xl flex items-center gap-3 active:scale-95 disabled:opacity-50 transition-all">
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={18} />} Clôturer Rapport
          </button>
        </header>

        <div className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-10 space-y-8">
          <div className="flex justify-between items-center border-b border-white/5 pb-6">
            <h2 className="text-xl font-black uppercase italic flex items-center gap-3 text-white"><FileText className="text-blue-500" /> Constats terrain</h2>
            <button onClick={addFinding} className="bg-blue-600 p-3 rounded-xl transition-all text-white shadow-xl"><Plus size={20} /></button>
          </div>

          <div className="space-y-6">
            {findings.map((f, index) => (
              <div key={index} className="grid grid-cols-12 gap-6 p-8 bg-white/2 border border-white/5 rounded-[2.5rem] items-start transition-all hover:border-blue-500/20">
                <div className="col-span-8 space-y-3">
                  <label className="text-[8px] font-black text-slate-500 uppercase italic ml-2">Description factuelle (Preuve / Écart)</label>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xs font-bold text-white outline-none focus:border-blue-500 min-h-24 italic"
                            value={f.FI_Description} onChange={(e) => updateFinding(index, 'FI_Description', e.target.value)} placeholder="..." />
                </div>
                <div className="col-span-3 space-y-3">
                  <label className="text-[8px] font-black text-slate-500 uppercase italic ml-2">Classification</label>
                  <select className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-[10px] font-black uppercase outline-none text-blue-400 italic"
                          value={f.FI_Type} onChange={(e) => updateFinding(index, 'FI_Type', e.target.value)}>
                    <option value="CONFORMITE">Conformité</option>
                    <option value="POINT_FORT">Point Fort</option>
                    <option value="OBSERVATION">Observation</option>
                    <option value="NC_MINEURE">NC Mineure</option>
                    <option value="NC_MAJEURE">NC Majeure</option>
                  </select>
                </div>
                <div className="col-span-1 pt-12 text-right">
                  <button onClick={() => removeFinding(index)} className="text-slate-700 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {ncs.length > 0 && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-[3rem] p-10 space-y-6 animate-in slide-in-from-bottom-4 text-left">
            <h3 className="text-red-500 font-black uppercase italic flex items-center gap-3 text-sm">
              <ShieldAlert size={20}/> Génération automatique de {ncs.length} Non-Conformité(s)
            </h3>
            <div className="grid gap-4">
              {ncs.map((nc, i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-bold italic text-slate-300">&quot;{nc.NC_Description.substring(0, 120)}...&quot;</p>
                  <span className="bg-red-600 text-[8px] font-black px-4 py-1.5 rounded-full uppercase italic text-white shadow-xl">{nc.NC_Gravite}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}