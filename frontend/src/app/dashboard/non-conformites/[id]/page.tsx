/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛠️ MODULE : DOSSIER DÉTAILLÉ DE NON-CONFORMITÉ (NC) — ELITE CORE SDE
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage expert du cycle Correctif/Préventif (§10.2 ISO 9001).
 * RÉFÉRENTIEL : types/elite-sde.ts (SCELLAGE PRISMA STRICT).
 * WORKFLOW : DETECTION -> ANALYSE -> ACTION_EN_COURS -> VERIFICATION -> CLOTURE.
 * DESIGN : Cockpit Matrix Full-Space (max-w-500).
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  ArrowLeft, Printer, Save, CheckCircle2, AlertOctagon, 
  Clock, User, Loader2, PlayCircle, Lock, ShieldCheck, 
  Plus, Calendar, FileText, Activity, Zap, Fingerprint, Target
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- 🏗️ RÉFÉRENTIEL ÉLITE-SDE (PRISMA SCHEMA) ---
import { 
  NonConformite as INonConformite, 
  Action as IAction,
  NCStatus,
  ActionStatus,
  ActionOrigin,
  ActionType,
  Priority
} from '@/types/elite-sde';

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export default function DetailNonConformitePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  // --- 📦 ÉTATS DU DOSSIER EXPERT (Relations mappées : Processus, Detector, Actions) ---
  const [nc, setNc] = useState<any>(null); 
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [analyse, setAnalyse] = useState<string>('');
  
  // --- 📟 WORKFLOW CAPA (ISO 9001:2015) ---
  const [isActionModalOpen, setIsActionModalOpen] = useState<boolean>(false);
  const [newActionTitle, setNewActionTitle] = useState<string>('');
  const [newActionDeadline, setNewActionDeadline] = useState<string>('');

  /**
   * 📡 CHARGEMENT DE LA FICHE NC SDE
   * @description Récupération du dossier avec inclusion des relations SDE.
   */
  const chargerDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/non-conformites/${id}`);
      const data = res.data?.data || res.data;
      setNc(data);
      setAnalyse(data.NC_Diagnostic || '');
    } catch (e: unknown) {
      toast.error("RUPTURE DE LIAISON : DOSSIER NC INTROUVABLE.");
      router.push('/dashboard/non-conformites');
    } finally { 
      setLoading(false); 
    }
  }, [id, router]);

  useEffect(() => { chargerDetails(); }, [chargerDetails]);

  /**
   * 💾 PHASE 01 : ENREGISTREMENT DU DIAGNOSTIC (§10.2.1 b)
   * @description Scelle l'analyse des causes racines et fait progresser le statut vers 'ANALYSE'.
   */
  const sauvegarderAnalyse = async () => {
    if (!analyse.trim()) return toast.error("Le diagnostic est une exigence normative obligatoire.");

    setIsSaving(true);
    const tid = toast.loading("Archivage du diagnostic Causes-Racines...");
    try {
      // ✅ SCELLAGE SDE : NC_Statut (Enum NCStatus.ANALYSE)
      await apiClient.patch(`/non-conformites/${id}`, { 
        NC_Diagnostic: analyse, 
        NC_Statut: NCStatus.ANALYSE 
      });
      toast.success("Analyse des causes validée.", { id: tid });
      chargerDetails();
    } catch {
      toast.error("ERREUR DE MUTATION SDE.", { id: tid });
    } finally { 
      setIsSaving(false); 
    }
  };

  /**
   * ⚡ PHASE 02 : DÉCLENCHEMENT ACTION CORRECTIVE (§10.2.1 c)
   * @description Indexation d'une action liée au dossier NC (Traçabilité SDE).
   */
  const creerAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Indexation du plan d'action...");
    try {
      await apiClient.post('/actions', {
        ACT_Title: newActionTitle,
        ACT_Deadline: newActionDeadline,
        ACT_Status: ActionStatus.A_FAIRE,
        ACT_Origin: ActionOrigin.NON_CONFORMITE,
        ACT_Type: ActionType.CORRECTIVE,
        ACT_Priority: Priority.HIGH,
        ACT_NCId: id
      });
      // ✅ Transition automatique vers ACTION_EN_COURS si première action
      if (nc.NC_Statut === NCStatus.ANALYSE || nc.NC_Statut === NCStatus.DETECTION) {
          await apiClient.patch(`/non-conformites/${id}`, { NC_Statut: NCStatus.ACTION_EN_COURS });
      }
      toast.success("Action Corrective indexée avec succès.", { id: tid });
      setIsActionModalOpen(false);
      setNewActionTitle('');
      setNewActionDeadline('');
      chargerDetails();
    } catch {
      toast.error("ÉCHEC DU DÉCLENCHEMENT CAPA.", { id: tid });
    }
  };

  /**
   * 🛡️ PHASE 03 : SCELLAGE DÉFINITIF DU DOSSIER (§10.2.2)
   * @description Verrouillage immuable après vérification de l'efficacité.
   */
  const cloturerNC = async () => {
    if(!confirm("ALERTE SCELLAGE : Cette action verrouille le diagnostic de manière immuable. Confirmer la clôture ?")) return;
    
    const tid = toast.loading("Scellage final du dossier NC...");
    try {
      await apiClient.patch(`/non-conformites/${id}`, { NC_Statut: NCStatus.CLOTURE });
      toast.success("Dossier NC officiellement scellé et archivé.", { id: tid });
      chargerDetails();
    } catch { 
      toast.error("ERREUR DE VÉRIFICATION FINALE.", { id: tid }); 
    }
  };

  if (loading || !nc) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-8">
      <Loader2 className="animate-spin text-red-600" size={60} strokeWidth={1.5} />
      <span className="text-[11px] font-black uppercase text-red-600 italic tracking-[0.5em] animate-pulse">
        Accès au coffre NC-{id.slice(0, 8).toUpperCase()}...
      </span>
    </div>
  );

  return (
    <div className="p-16 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans text-left relative selection:bg-red-500/30 overflow-x-hidden">
      <Toaster position="top-right" richColors />
      
      {/* 🔝 HEADER EXPERT (FULL WIDTH max-w-500) */}
      <div className="mb-16 flex justify-between items-center w-full max-w-500 mx-auto border-b border-white/5 pb-12">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-6 text-[11px] font-black uppercase text-slate-500 hover:text-white transition-all bg-white/5 px-10 py-5 rounded-2xl border border-white/5 cursor-pointer shadow-xl"
        >
          <ArrowLeft size={18} /> Retour Registre NC
        </button>
        
        <div className="flex gap-8">
          {nc.NC_Statut !== NCStatus.CLOTURE && (
             <button 
              onClick={cloturerNC} 
              className="px-12 py-5 bg-emerald-600/10 border-2 border-emerald-500/20 text-emerald-500 rounded-4xl text-[11px] font-black uppercase flex items-center gap-5 hover:bg-emerald-600 hover:text-white transition-all italic cursor-pointer shadow-2xl"
             >
               <ShieldCheck size={20} /> Clôturer le Dossier
             </button>
          )}
          <button 
            onClick={() => window.print()} 
            className="px-10 py-5 bg-white/5 border-2 border-white/10 rounded-4xl text-[11px] font-black uppercase flex items-center gap-5 hover:bg-white/10 transition-all italic cursor-pointer"
          >
            <Printer size={20} /> Imprimer PV Officiel
          </button>
          <button 
            onClick={sauvegarderAnalyse} 
            disabled={isSaving || nc.NC_Statut === NCStatus.CLOTURE} 
            className="px-14 py-5 bg-red-600 rounded-4xl text-[11px] font-black uppercase flex items-center gap-6 shadow-[0_20px_50px_rgba(220,38,38,0.3)] hover:bg-white hover:text-red-600 transition-all italic cursor-pointer border-none disabled:opacity-30"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Sceller l&apos;Analyse RCA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-16 w-full max-w-500 mx-auto items-start">
        
        {/* 📋 COLONNE GAUCHE : CONTEXTE DE DÉTECTION (STATIQUE) */}
        <div className="col-span-12 lg:col-span-4 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="bg-[#151A2D] border-2 border-white/5 rounded-[5rem] p-16 shadow-4xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 p-10 opacity-[0.05] rotate-12 bg-red-600 rounded-full blur-3xl w-80 h-80" />
            
            <div className="flex justify-between items-center mb-16 relative z-10">
                <div className={cn(
                  "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] border italic shadow-inner",
                  nc.NC_Statut === NCStatus.CLOTURE ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-600/10 text-red-600 border-red-600/20 animate-pulse'
                )}>
                    STATUS : {nc.NC_Statut}
                </div>
                <AlertOctagon size={44} className="text-red-600 opacity-20" />
            </div>
            
            <h1 className="text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-12 text-white italic">
              {nc?.NC_Libelle}
            </h1>
            
            <div className="space-y-10 pt-12 border-t-2 border-white/5 relative z-10 text-left">
              <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-red-600/10 rounded-2xl flex items-center justify-center shadow-lg"><Clock size={24} className="text-red-600" /></div>
                  <div className="text-left">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic mb-1">DÉTECTION SDE</p>
                      <p className="text-lg font-black text-slate-300 uppercase italic leading-none">{new Date(nc?.NC_CreatedAt).toLocaleDateString()}</p>
                  </div>
              </div>
              <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center shadow-lg"><User size={24} className="text-blue-600" /></div>
                  <div className="text-left">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic mb-1">DÉCLARANT SMI</p>
                      {/* ✅ SCELLAGE SDE : Relation Detector */}
                      <p className="text-lg font-black text-slate-300 uppercase italic leading-none">{nc?.Detector?.U_FirstName} {nc?.Detector?.U_LastName || 'KERNEL'}</p>
                  </div>
              </div>
              <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-emerald-600/10 rounded-2xl flex items-center justify-center shadow-lg"><Activity size={24} className="text-emerald-600" /></div>
                  <div className="text-left">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic mb-1">PROCESSUS LIÉ (§4.4)</p>
                      {/* ✅ SCELLAGE SDE : Relation Processus */}
                      <p className="text-lg font-black text-blue-400 uppercase italic leading-none">{nc?.Processus?.PR_Libelle || 'TRANSVERSAL'}</p>
                  </div>
              </div>
            </div>

            <div className="mt-16 p-12 bg-black/40 rounded-[4rem] border-2 border-white/5 italic shadow-inner relative text-left group/box">
              <Fingerprint className="absolute top-8 right-10 text-slate-800 group-hover/box:text-red-600 transition-colors" size={32} />
              <p className="text-[11px] font-black uppercase text-slate-500 mb-8 tracking-[0.5em] flex items-center gap-4 italic leading-none">
                <Target size={14} className="text-red-600"/> Constat Factuel Déclaré
              </p>
              <p className="text-[17px] leading-relaxed text-slate-300 italic font-medium">
                {nc?.NC_Description}
              </p>
            </div>
          </div>
        </div>

        {/* ⚙️ COLONNE DROITE : RÉSOLUTION CAPA (DYNAMIQUE) */}
        <div className="col-span-12 lg:col-span-8 space-y-12 animate-in fade-in slide-in-from-right-8 duration-1000">
          
          {/* RCA (§10.2.1 b) */}
          <div className="bg-[#151A2D] border-2 border-white/5 rounded-[6rem] p-16 shadow-4xl relative group">
            <div className="absolute left-0 top-16 w-2 h-24 bg-red-600 rounded-r-full shadow-[0_0_20px_rgba(220,38,38,0.6)]" />
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-4xl font-black uppercase italic flex items-center gap-8 text-white tracking-tighter">
                  <span className="text-red-600 text-7xl opacity-20 leading-none">01.</span> Diagnostic & Causes
              </h2>
              <div className="text-[11px] font-black uppercase text-slate-500 tracking-[0.5em] bg-white/5 px-8 py-3 rounded-full border border-white/5 italic leading-none shadow-inner">Méthode Ishikawa / 5P</div>
            </div>
            <textarea 
                value={analyse} 
                onChange={(e) => setAnalyse(e.target.value)} 
                disabled={nc.NC_Statut === NCStatus.CLOTURE}
                placeholder="Rédiger ici l'analyse structurée des causes racines (Root Cause Analysis)..." 
                className="w-full p-14 bg-black/40 border-4 border-white/5 rounded-[4rem] text-xl font-medium text-white outline-none focus:border-red-600 min-h-87.5 leading-relaxed italic placeholder-slate-900 transition-all focus:bg-black/60 disabled:opacity-30 shadow-inner resize-none text-left" 
            />
          </div>

          {/* CAPA (§10.2.1 c) */}
          <div className="bg-[#151A2D] border-2 border-white/5 rounded-[6rem] p-16 shadow-4xl relative group">
            <div className="absolute left-0 top-16 w-2 h-24 bg-blue-600 rounded-r-full shadow-[0_0_20px_rgba(37,99,235,0.6)]" />
            
            <div className="flex justify-between items-center mb-16">
                <h2 className="text-4xl font-black uppercase italic flex items-center gap-8 text-white tracking-tighter leading-none">
                    <span className="text-blue-600 text-7xl opacity-20 leading-none">02.</span> Plan Correctif
                </h2>
                <button 
                  onClick={() => setIsActionModalOpen(true)} 
                  disabled={nc.NC_Statut === NCStatus.CLOTURE}
                  className="bg-blue-600 hover:bg-white hover:text-blue-600 disabled:opacity-20 px-12 py-5 rounded-[2.5rem] text-[11px] font-black uppercase text-white flex items-center gap-5 transition-all shadow-4xl active:scale-95 cursor-pointer border-none italic"
                >
                    <Plus size={24} strokeWidth={3} /> Lancer CAPA
                </button>
            </div>

            <div className="grid gap-10">
              {/* ✅ SCELLAGE SDE : Relation Actions */}
              {nc?.Actions?.length > 0 ? nc.Actions.map((action: IAction) => (
                <div key={action.ACT_Id} className="p-12 bg-black/40 border-2 border-white/5 rounded-[4.5rem] flex items-center justify-between italic hover:border-blue-600/40 transition-all group/item shadow-inner">
                  <div className="flex items-center gap-10">
                    <div className={cn(
                      "w-22 h-22 rounded-4xl flex items-center justify-center shadow-2xl transition-all border",
                      action.ACT_Status === ActionStatus.TERMINEE ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-900 text-slate-700 border-white/10'
                    )}>
                        <PlayCircle size={44} className={action.ACT_Status === ActionStatus.A_FAIRE ? 'animate-pulse text-blue-600' : ''} />
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-black uppercase text-white tracking-tighter leading-none mb-4 group-hover/item:text-blue-400 transition-colors italic">
                        {action.ACT_Title}
                      </p>
                      <div className="flex items-center gap-6 text-[11px] font-black text-slate-500 uppercase italic tracking-[0.3em] leading-none">
                        <Calendar size={18} className="text-blue-600"/> ÉCHÉANCE : {new Date(action.ACT_Deadline!).toLocaleDateString()}
                        <span className="text-slate-800">•</span>
                        <span className="text-blue-600/50">REF: {action.ACT_Id.slice(0, 8).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "px-10 py-4 rounded-2xl text-[12px] font-black uppercase italic border tracking-[0.5em] shadow-lg",
                    action.ACT_Status === ActionStatus.TERMINEE ? 'bg-emerald-600 text-white border-transparent' : 'bg-[#0F172A] text-slate-600 border-white/5'
                  )}>
                      {action.ACT_Status}
                  </div>
                </div>
              )) : (
                <div className="py-32 border-4 border-dashed border-white/5 rounded-[6rem] text-center flex flex-col items-center justify-center opacity-20 italic">
                    <Activity className="text-slate-500 mb-10" size={80} />
                    <p className="text-[14px] text-slate-600 uppercase font-black italic tracking-[0.6em] leading-relaxed">
                      Plan CAPA Vierge pour ce Dossier.<br/>L&apos;indexation d&apos;actions est requise pour la clôture.
                    </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 MODAL CAPA SDE (FULL BLUR) */}
      {isActionModalOpen && (
        <div className="fixed inset-0 bg-[#0B0F1A]/98 backdrop-blur-3xl z-200 flex items-center justify-center p-12 animate-in fade-in duration-500">
            <div className="bg-[#151A2D] border-2 border-white/10 rounded-[6rem] p-24 w-full max-w-2xl shadow-4xl text-left animate-in zoom-in-95 duration-700 italic">
                <header className="mb-16 border-b-2 border-white/5 pb-12">
                  <h3 className="text-5xl font-black uppercase italic text-white tracking-tighter leading-[0.8] mb-6">Initialiser CAPA</h3>
                  <p className="text-slate-600 text-[12px] font-black uppercase tracking-[0.6em] italic leading-none">Correction de l&apos;Écart NC-{id.slice(0, 8).toUpperCase()}</p>
                </header>
                <form onSubmit={creerAction} className="space-y-12 text-left">
                    <div className="space-y-6 text-left">
                        <label className="text-[13px] font-black uppercase text-slate-500 ml-10 block italic tracking-[0.4em]">Désignation de la mesure (§10.2.1)</label>
                        <input autoFocus required value={newActionTitle} onChange={e => setNewActionTitle(e.target.value.toUpperCase())} className="w-full bg-black/40 border-4 border-white/10 rounded-[2.5rem] p-10 text-xl font-black italic text-white outline-none focus:border-blue-600 shadow-inner" placeholder="EX: RÉVISION PROTOCOLE DE SÉCURITÉ..." />
                    </div>
                    <div className="space-y-6 text-left">
                        <label className="text-[13px] font-black uppercase text-slate-500 ml-10 block italic tracking-[0.4em]">Échéance SDE Matrix</label>
                        <input required type="date" value={newActionDeadline} onChange={e => setNewActionDeadline(e.target.value)} className="w-full bg-black/40 border-4 border-white/10 rounded-[2.5rem] p-10 text-xl font-black italic text-white outline-none focus:border-blue-600 shadow-inner uppercase cursor-pointer" />
                    </div>
                    <div className="flex gap-10 pt-16">
                        <button type="button" onClick={() => setIsActionModalOpen(false)} className="flex-1 py-8 bg-white/5 hover:bg-white/10 rounded-[2.5rem] text-[12px] font-black uppercase text-slate-500 transition-all border-none cursor-pointer">Annuler</button>
                        <button type="submit" className="flex-[2.5] py-8 bg-blue-600 hover:bg-white hover:text-blue-600 rounded-[2.5rem] text-[12px] font-black uppercase text-white shadow-4xl transition-all border-none active:scale-95 cursor-pointer leading-none">Sceller l&apos;Action Corrective</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* 🧩 FOOTER TRAÇABILITÉ RD 2030 */}
      <footer className="mt-40 pt-16 border-t-2 border-white/5 flex justify-between items-center opacity-20 w-full max-w-500 mx-auto">
          <div className="flex items-center gap-6">
              <Fingerprint size={24} className="text-red-600" />
              <p className="text-[11px] font-black uppercase tracking-[0.8em] text-slate-500 italic">Sovereign Data Registry • Qualisoft RD 2030 Matrix</p>
          </div>
          <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-red-600" />
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              <div className="w-2 h-2 rounded-full bg-emerald-600" />
          </div>
      </footer>
    </div>
  );
}