/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛠️ MODULE : RECLAMATION COCKPIT (ELITE SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Traitement opérationnel, RCA, upload de preuves et lien PAQ.
 * DESIGN : Elite Split-Grid, ClickUp Form Factor, 100dvh.
 * -------------------------------------------------------------------------
 * DATE : 06 Mars 2026 | 10:45 GMT
 */

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  ArrowLeft, Edit3, Save, ShieldCheck, UploadCloud, 
  Activity, Users, BarChart3, Loader2, RefreshCw, AlertTriangle
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

export default function ReclamationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [selectedRec, setSelectedRec] = useState<any>(null);
  const [processus, setProcessus] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDossier = useCallback(async () => {
    if (!params?.id) return;
    try {
      setLoading(true);
      const [resRec, resProcs] = await Promise.all([
        apiClient.get(`/reclamations/${params.id}`),
        apiClient.get('/processus')
      ]);
      setSelectedRec(resRec.data?.data || resRec.data);
      setProcessus(resProcs.data?.data || resProcs.data || []);
    } catch { 
      toast.error("DOSSIER INTROUVABLE");
      router.push('/dashboard/quality/reclamations');
    } finally { setLoading(false); }
  }, [params?.id, router]);

  useEffect(() => { fetchDossier(); }, [fetchDossier]);

  const handleUpdate = async () => {
    if (!selectedRec) return;
    setSubmitting(true);
    const tid = toast.loading("SCELLAGE OPÉRATIONNEL...");
    try {
      await apiClient.patch(`/reclamations/${selectedRec.REC_Id}`, {
        REC_Object: selectedRec.REC_Object,
        REC_SolutionProposed: selectedRec.REC_SolutionProposed,
        REC_ProcessusId: selectedRec.REC_ProcessusId,
        REC_PreuveURL: selectedRec.REC_PreuveURL,
      });
      toast.success("DOSSIER SCELLÉ DANS LE SMI", { id: tid });
      setIsEditing(false); 
      fetchDossier();
    } catch { toast.error("ÉCHEC DE PERSISTANCE", { id: tid }); }
    finally { setSubmitting(false); }
  };

  if (loading) return <LoadingScreen label="Extraction SDE du Dossier..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-6 mt-12 lg:mt-0">
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/dashboard/quality/reclamations')} className="p-5 bg-white/5 rounded-3xl text-slate-500 hover:text-white border border-white/5 cursor-pointer transition-all shadow-sm">
            <ArrowLeft size={24} />
          </button>
          <div className="text-left space-y-2">
            <h1 className="text-3xl lg:text-4xl tracking-tighter m-0 italic leading-none">Traitement <span className="text-blue-500">Opérationnel</span></h1>
            <p className="text-slate-700 text-[10px] tracking-widest font-black uppercase italic m-0">RÉF: {selectedRec.REC_Reference} • ISO 10002</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 bg-slate-900/40 p-5 rounded-[2.5rem] border-2 border-white/5 w-full xl:w-auto shadow-inner">
          <Activity size={20} className="text-blue-500" />
          <div className="flex flex-col text-left">
            <span className="text-[8px] text-slate-700 uppercase tracking-widest leading-none">Statut Actuel</span>
            <span className="text-xs font-black text-blue-400 mt-1 uppercase leading-none">{selectedRec.REC_Status?.replace('_', ' ')}</span>
          </div>
        </div>
      </header>

      {/* 🧩 WORKSPACE GRID (Isolated Scroll) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700 pb-32">
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch text-left">
            {/* Plaignant */}
            <section className="bg-[#151B2B] p-10 rounded-[3.5rem] border-2 border-white/5 shadow-4xl space-y-8">
              <h4 className="text-[10px] font-black text-slate-500 tracking-widest flex items-center gap-4 m-0 italic"><Users size={20} className="text-blue-500" /> Identité du Plaignant</h4>
              <div className="space-y-4">
                <p className="text-4xl font-black italic text-white tracking-tighter uppercase m-0 leading-tight truncate">{selectedRec.Tier?.TR_Name || "TIERS ANONYME"}</p>
                <div className="flex items-center gap-6">
                  <span className={cn("px-4 py-1.5 rounded-xl text-[9px] font-black tracking-widest border uppercase", selectedRec.REC_Gravity === 'CRITICAL' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-blue-600/10 text-blue-400 border-blue-600/20")}>GRAVITÉ : {selectedRec.REC_Gravity}</span>
                  <span className="text-[10px] text-slate-700 font-black tracking-widest">{new Date(selectedRec.REC_DateReceipt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="bg-black/40 p-6 rounded-3xl border border-white/5 text-slate-400 text-xs font-bold leading-relaxed italic uppercase shadow-inner">
                &quot;{selectedRec.REC_Description}&quot;
              </div>
            </section>

            {/* Imputation */}
            <section className={cn("p-10 rounded-[3.5rem] border-2 shadow-4xl space-y-8 transition-all duration-500", isEditing ? "bg-blue-600/5 border-blue-500/30" : "bg-[#151B2B] border-white/5")}>
              <h4 className="text-[10px] font-black text-slate-500 tracking-widest flex items-center gap-4 m-0 italic"><ShieldCheck size={20} className="text-emerald-500" /> Imputation SMI</h4>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[9px] text-slate-700 tracking-widest ml-4 font-black">Objet Radical</label>
                  <input readOnly={!isEditing} value={selectedRec.REC_Object} onChange={e => setSelectedRec({...selectedRec, REC_Object: e.target.value.toUpperCase()})} className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-5 text-sm font-black italic uppercase text-white outline-none focus:border-blue-500 transition-all shadow-inner" />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] text-slate-700 tracking-widest ml-4 font-black">Processus Responsable</label>
                  <select disabled={!isEditing} value={selectedRec.REC_ProcessusId || ""} onChange={e => setSelectedRec({...selectedRec, REC_ProcessusId: e.target.value})} className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-5 text-[10px] font-black italic uppercase text-blue-400 outline-none focus:border-blue-500 cursor-pointer shadow-inner appearance-none">
                    <option value="">-- NC GLOBALE --</option>
                    {processus.map((p) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
                  </select>
                </div>
              </div>
            </section>
          </div>

          {/* Analyse Technique */}
          <section className="bg-[#151B2B] border-2 border-white/5 p-12 rounded-[4rem] shadow-4xl space-y-10 text-left relative overflow-hidden">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
              <h4 className="text-[11px] font-black text-blue-500 tracking-[0.4em] m-0 flex items-center gap-4 italic uppercase"><BarChart3 size={24} /> Analyse Technique (§10.2)</h4>
              <div className="bg-amber-600/10 border border-amber-500/20 px-6 py-2 rounded-2xl flex items-center gap-3">
                <AlertTriangle size={14} className="text-amber-500" />
                <span className="text-[9px] text-amber-500 tracking-widest font-black uppercase italic">Protocole 5 Pourquoi / Ishikawa requis</span>
              </div>
            </div>
            
            <textarea readOnly={!isEditing} value={selectedRec.REC_SolutionProposed || ''} onChange={e => setSelectedRec({...selectedRec, REC_SolutionProposed: e.target.value})} placeholder="Détailler l'investigation des causes et les mesures de rétablissement..." className="w-full bg-black/40 border-2 border-white/5 rounded-[3rem] p-10 text-sm font-black italic text-slate-300 outline-none focus:border-blue-600 transition-all shadow-inner h-64 resize-none leading-relaxed uppercase" />
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-emerald-500 tracking-widest ml-6 m-0 italic uppercase">Preuve Documentaire (§7.5)</h4>
              <div className="border-4 border-dashed border-white/5 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-6 bg-black/20 hover:bg-blue-600/5 hover:border-blue-600/30 transition-all cursor-pointer group">
                <UploadCloud size={60} strokeWidth={1} className="text-slate-800 group-hover:text-blue-600 transition-colors" />
                <p className="text-[10px] text-slate-700 tracking-widest font-black uppercase italic m-0">Glissez ou cliquez pour indexer une preuve documentaire</p>
              </div>
            </div>
          </section>

          {/* Actions de Finalisation */}
          <div className="flex flex-col sm:flex-row gap-6">
            {isEditing ? (
              <>
                <button onClick={handleUpdate} disabled={submitting} className="flex-1 bg-blue-600 text-white py-8 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.5em] italic flex items-center justify-center gap-6 border-none cursor-pointer shadow-4xl active:scale-95 disabled:opacity-30">
                  {submitting ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>} Sceller l&apos;Analyse Opérationnelle
                </button>
                <button onClick={() => setIsEditing(false)} className="px-12 bg-slate-900 text-slate-500 py-8 rounded-[3rem] font-black uppercase text-[12px] tracking-widest italic border-none cursor-pointer hover:text-white transition-all">Annuler</button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="flex-1 bg-slate-900 text-blue-500 border-2 border-blue-600/20 py-8 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.4em] italic flex items-center justify-center gap-6 cursor-pointer shadow-4xl hover:bg-blue-600 hover:text-white transition-all">
                  <Edit3 size={24}/> Entrer en mode édition
                </button>
                <button className="flex-1 bg-emerald-600 text-white py-8 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.4em] italic flex items-center justify-center gap-6 border-none cursor-pointer shadow-4xl active:scale-95">
                  <ShieldCheck size={24}/> Déclencher Action Corrective (PAQ)
                </button>
              </>
            )}
          </div>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}