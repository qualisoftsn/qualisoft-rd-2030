/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { use, useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { 
  ArrowLeft, ShieldCheck, Printer, Save, Clock, User, Activity, 
  Archive, Microscope, Plus, Hammer, Calendar, Loader2, Zap, 
  Fingerprint, AlertOctagon, Target, Info
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { 
  ActionOrigin, ActionStatus, ActionType, Action as IAction, 
  NCStatus, Priority 
} from '@/types/elite-sde';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function DetailNonConformitePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  // --- 📦 ÉTATS KERNEL ---
  const [nc, setNc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [analyse, setAnalyse] = useState("");
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [newAction, setNewAction] = useState({ title: "", deadline: "" });

  const chargerDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/non-conformites/${id}`);
      const data = res.data?.data || res.data;
      if (!data) throw new Error();
      setNc(data);
      setAnalyse(data.NC_Diagnostic || "");
    } catch {
      toast.error("RUPTURE DE LIAISON SDE.");
      router.push("/dashboard/non-conformites");
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { chargerDetails(); }, [chargerDetails]);

  const sauvegarderAnalyse = async () => {
    if (!analyse.trim()) return toast.error("DIAGNOSTIC RCA OBLIGATOIRE.");
    setIsSaving(true);
    const tid = toast.loading("Scellage RCA...");
    try {
      await apiClient.patch(`/non-conformites/${id}`, { NC_Diagnostic: analyse, NC_Statut: NCStatus.ANALYSE });
      toast.success("ANALYSE VALIDÉE", { id: tid });
      chargerDetails();
    } catch { toast.error("ÉCHEC MUTATION", { id: tid }); }
    finally { setIsSaving(false); }
  };

  const creerAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Génération CAPA...");
    try {
      await apiClient.post("/actions", {
        ACT_Title: newAction.title.toUpperCase(),
        ACT_Deadline: newAction.deadline,
        ACT_Status: ActionStatus.A_FAIRE,
        ACT_Origin: ActionOrigin.NON_CONFORMITE,
        ACT_Type: ActionType.CORRECTIVE,
        ACT_Priority: Priority.HIGH,
        ACT_NCId: id,
      });
      if (nc.NC_Statut !== NCStatus.ACTION_EN_COURS && nc.NC_Statut !== NCStatus.CLOTURE) {
        await apiClient.patch(`/non-conformites/${id}`, { NC_Statut: NCStatus.ACTION_EN_COURS });
      }
      toast.success("ACTION INDEXÉE", { id: tid });
      setIsActionModalOpen(false);
      setNewAction({ title: "", deadline: "" });
      chargerDetails();
    } catch { toast.error("ERREUR CAPA"); }
  };

  const cloturerNC = async () => {
    if (!confirm("SCELLAGE FINAL : Confirmer la clôture ?")) return;
    const tid = toast.loading("Verrouillage...");
    try {
      await apiClient.patch(`/non-conformites/${id}`, { NC_Statut: NCStatus.CLOTURE });
      toast.success("DOSSIER ARCHIVÉ", { id: tid });
      chargerDetails();
    } catch { toast.error("ÉCHEC VÉRIFICATION"); }
  };

  if (loading || !nc) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-red-600" size={40} />
      <span className="text-[9px] font-black uppercase text-red-600 tracking-[0.5em] animate-pulse">Accessing NC-{id.slice(0,8)}...</span>
    </div>
  );

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-6 overflow-hidden selection:bg-red-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE (Shrink-0) */}
      <header className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"><ArrowLeft size={18}/></button>
          <div>
             <div className="flex items-center gap-3 mb-1">
                <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border", nc.NC_Statut === NCStatus.CLOTURE ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-600/10 text-red-600 border-red-600/20 animate-pulse")}>
                  SMI STATUS : {nc.NC_Statut}
                </span>
                <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">NC-{nc.NC_Code || id.slice(0,8).toUpperCase()}</span>
             </div>
             <h1 className="text-2xl font-black uppercase m-0 tracking-tighter italic">Investigation Unit §10.2</h1>
          </div>
        </div>

        <div className="flex gap-3">
          {nc.NC_Statut !== NCStatus.CLOTURE && (
            <button onClick={cloturerNC} className="bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 cursor-pointer hover:bg-emerald-600 hover:text-white transition-all italic"><ShieldCheck size={14}/> Clôturer</button>
          )}
          <button onClick={() => window.print()} className="p-2 bg-white/5 rounded-xl border border-white/10 text-slate-400 cursor-pointer"><Printer size={16}/></button>
          <button disabled={isSaving || nc.NC_Statut === NCStatus.CLOTURE} onClick={sauvegarderAnalyse} className="bg-red-600 px-6 py-2 rounded-xl text-[9px] font-black uppercase text-white flex items-center gap-2 border-none cursor-pointer hover:bg-white hover:text-red-600 transition-all italic disabled:opacity-30">
            {isSaving ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} Valider RCA
          </button>
        </div>
      </header>

      {/* 📊 GRID CORE (Flex-1) */}
      <main className="flex-1 min-h-0 grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* COL 1 : CONTEXTE FACTUEL (3/12) */}
        <div className="col-span-3 flex flex-col gap-6 overflow-hidden">
          <div className="bg-[#151A2D] border border-white/5 p-6 rounded-4xl shadow-2xl relative overflow-hidden group shrink-0">
             <Target className="absolute -right-4 -top-4 text-red-600/5 rotate-12" size={120} />
             <h3 className="text-[9px] font-black uppercase text-slate-500 mb-6 tracking-widest flex items-center gap-2 italic"><Info size={14} className="text-red-600"/> Données de Base</h3>
             <div className="space-y-4">
                <DataField icon={<Clock size={12}/>} label="Détection" value={new Date(nc.NC_CreatedAt).toLocaleDateString()} />
                <DataField icon={<User size={12}/>} label="Déclarant" value={nc.Detector ? `${nc.Detector.U_FirstName} ${nc.Detector.U_LastName}` : 'SDE_SYSTEM'} />
                <DataField icon={<Activity size={12}/>} label="Processus" value={nc.Processus?.PR_Libelle || "TRANSVERSAL"} />
                <DataField icon={<Archive size={12}/>} label="Origine" value={nc.NC_Source} />
             </div>
          </div>

          <div className="flex-1 bg-black/40 border border-white/5 p-6 rounded-4xl overflow-y-auto custom-scrollbar italic shadow-inner">
             <p className="text-[8px] font-black uppercase text-slate-600 mb-4 tracking-widest leading-none flex items-center gap-2"><Fingerprint size={12}/> Exposé Factuel</p>
             <p className="text-[11px] leading-relaxed text-slate-300 font-medium uppercase tracking-wider">&quot;{nc.NC_Description}&quot;</p>
          </div>
        </div>

        {/* COL 2 : INVESTIGATION RCA (5/12) */}
        <div className="col-span-5 bg-[#151A2D] border border-white/5 rounded-[2.5rem] flex flex-col shadow-4xl overflow-hidden">
           <header className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="text-[10px] font-black uppercase italic flex items-center gap-3 m-0"><Microscope size={14} className="text-red-600"/> Diagnostic RCA §10.2.1.b</h3>
              <span className="text-[7px] text-slate-500 font-bold uppercase tracking-[0.3em]">Analyse Causes-Racines</span>
           </header>
           <div className="flex-1 p-6 relative">
              <textarea 
                value={analyse} onChange={(e) => setAnalyse(e.target.value)} 
                disabled={nc.NC_Statut === NCStatus.CLOTURE}
                placeholder="DÉBUTER L'ANALYSE (5P, ISHIKAWA)..."
                className="w-full h-full bg-transparent border-none text-[13px] font-medium text-white outline-none italic leading-relaxed placeholder:text-slate-800 resize-none uppercase tracking-wide custom-scrollbar"
              />
              <div className="absolute bottom-4 right-6 opacity-5 font-black text-4xl select-none">RCA_ENGINE</div>
           </div>
        </div>

        {/* COL 3 : RÉSOLUTION CAPA (4/12) */}
        <div className="col-span-4 bg-[#151A2D] border border-white/5 rounded-[2.5rem] flex flex-col shadow-4xl overflow-hidden">
           <header className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="text-[10px] font-black uppercase italic flex items-center gap-3 m-0"><Hammer size={14} className="text-blue-600"/> Actions CAPA §10.2.1.c</h3>
              <button 
                onClick={() => setIsActionModalOpen(true)} disabled={nc.NC_Statut === NCStatus.CLOTURE}
                className="bg-blue-600 p-1.5 rounded-lg text-white border-none cursor-pointer hover:bg-white hover:text-blue-600 transition-all disabled:opacity-20"
              ><Plus size={14}/></button>
           </header>

           <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {nc.Actions?.length > 0 ? nc.Actions.map((action: IAction) => (
                <div key={action.ACT_Id} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-blue-600/30 transition-all">
                   <div className="flex items-center gap-4">
                      <div className={cn("p-2 rounded-lg border", action.ACT_Status === ActionStatus.TERMINEE ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-white/5 text-blue-600 border-white/10")}>
                        <Hammer size={14} className={action.ACT_Status === ActionStatus.A_FAIRE ? "animate-pulse" : ""}/>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white uppercase italic leading-none mb-1">{action.ACT_Title}</span>
                        <span className="text-[7px] font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={8}/> {new Date(action.ACT_Deadline!).toLocaleDateString()} • {action.ACT_Id.slice(0,6)}</span>
                      </div>
                   </div>
                   <span className={cn("px-2 py-0.5 rounded text-[7px] font-black uppercase italic", action.ACT_Status === ActionStatus.TERMINEE ? "bg-emerald-600 text-white" : "bg-black/60 text-slate-600 border border-white/5")}>{action.ACT_Status}</span>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10"><Zap size={32} className="mb-2"/><p className="text-[8px] font-black uppercase">Aucune Action CAPA</p></div>
              )}
           </div>
        </div>
      </main>

      {/* 🚀 MODAL CAPA (Overlay) */}
      {isActionModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <form onSubmit={creerAction} className="bg-[#151A2D] border border-white/10 rounded-[3rem] p-8 w-full max-w-lg shadow-4xl italic">
             <h3 className="text-xl font-black uppercase italic text-white mb-6 border-b border-white/5 pb-4">Nouvelle <span className="text-blue-600">CAPA</span></h3>
             <div className="space-y-4">
                <div className="space-y-1 text-left">
                   <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Mesure Corrective *</label>
                   <input required value={newAction.title} onChange={e => setNewAction({...newAction, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-black text-white outline-none italic focus:border-blue-600 placeholder:opacity-20" placeholder="INTITULÉ DE L'ACTION..." />
                </div>
                <div className="space-y-1 text-left">
                   <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Échéance SDE</label>
                   <input type="date" required value={newAction.deadline} onChange={e => setNewAction({...newAction, deadline: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-black text-white outline-none italic focus:border-blue-600 uppercase" />
                </div>
             </div>
             <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setIsActionModalOpen(false)} className="flex-1 py-3 bg-transparent text-slate-500 font-black uppercase text-[9px] border-none cursor-pointer">Annuler</button>
                <button type="submit" className="flex-2 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[9px] italic shadow-lg border-none cursor-pointer active:scale-95">Générer Action Corrective</button>
             </div>
          </form>
        </div>
      )}

      {/* 🧩 FOOTER (§10.2.2) */}
      <footer className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-30 shrink-0 italic">
        <div className="flex items-center gap-4">
          <Fingerprint size={24} className="text-red-600" />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] m-0 leading-none mb-1">CAPA Sovereign Hub</p>
            <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest m-0 leading-none italic">Elite Matrix v4.0 • ISO 9001 Integration</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]" />
          <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_10px_blue]" />
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

function DataField({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-slate-500 border border-white/5">{icon}</div>
      <div className="text-left">
        <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest m-0 leading-none mb-1 italic">{label}</p>
        <p className="text-[11px] font-black text-white uppercase italic leading-none m-0">{value}</p>
      </div>
    </div>
  );
}