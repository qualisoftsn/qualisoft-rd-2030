/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  ArrowLeft, Printer, Save, CheckCircle2, AlertOctagon, 
  Clock, User, Loader2, PlayCircle, Lock, ShieldCheck, 
  Plus, Calendar 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import Types
import { NonConformite, ActionCorrective } from '@/types/quality';

export default function DetailNonConformitePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [nc, setNc] = useState<NonConformite | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [analyse, setAnalyse] = useState('');
  
  // État pour la création d'action rapide
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionDeadline, setNewActionDeadline] = useState('');

  const chargerDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<NonConformite>(`/non-conformites/${id}`);
      setNc(res.data);
      setAnalyse(res.data.NC_Diagnostic || '');
    } catch (e) {
      toast.error("Impossible de charger la fiche NC");
      router.push('/dashboard/non-conformites');
    } finally { setLoading(false); }
  }, [id, router]);

  useEffect(() => { chargerDetails(); }, [chargerDetails]);

  // 1. SAUVEGARDER L'ANALYSE ET PASSER EN STATUT "ANALYSE"
  const sauvegarderAnalyse = async () => {
    setIsSaving(true);
    try {
      await apiClient.patch(`/non-conformites/${id}`, { 
        NC_Diagnostic: analyse, 
        NC_Statut: 'ANALYSE' 
      });
      toast.success("Analyse enregistrée. Workflow avancé.");
      chargerDetails();
    } catch {
      toast.error("Erreur de sauvegarde");
    } finally { setIsSaving(false); }
  };

  // 2. CRÉER UNE ACTION CORRECTIVE (CAPA) LIÉE
  const creerAction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/actions', {
        ACT_Title: newActionTitle,
        ACT_Deadline: newActionDeadline,
        ACT_Status: 'OPEN',
        ACT_OriginType: 'NC', // Lien important
        ACT_OriginId: id      // ID de la NC
      });
      toast.success("Action Corrective déclenchée");
      setIsActionModalOpen(false);
      setNewActionTitle('');
      setNewActionDeadline('');
      chargerDetails(); // Recharger pour voir la nouvelle action
    } catch {
      toast.error("Impossible de créer l'action");
    }
  };

  // 3. CLÔTURER LA NC
  const cloturerNC = async () => {
    if(!confirm("Confirmer la clôture de cette Non-Conformité ? Cela suppose que les actions sont efficaces.")) return;
    try {
      await apiClient.patch(`/non-conformites/${id}`, { NC_Statut: 'CLOSED' });
      toast.success("Dossier NC Clôturé");
      chargerDetails();
    } catch { toast.error("Erreur clôture"); }
  }

  if (loading || !nc) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-red-600" size={50} />
      <span className="text-[10px] font-black uppercase text-red-600 mt-6 italic tracking-[0.3em]">Chargement Dossier NC...</span>
    </div>
  );

  return (
    <div className="px-10 py-10 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans text-left relative">
      
      {/* HEADER DE NAVIGATION */}
      <div className="mb-10 flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all bg-white/5 px-6 py-3 rounded-2xl border border-white/5 cursor-pointer">
          <ArrowLeft size={16} /> Retour Registre
        </button>
        <div className="flex gap-4">
          {nc.NC_Statut !== 'CLOSED' && (
             <button onClick={cloturerNC} className="px-8 py-3 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 hover:bg-emerald-600 hover:text-white transition-all italic cursor-pointer">
               <ShieldCheck size={16} /> Clôturer le Dossier
             </button>
          )}
          <button onClick={() => window.print()} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 hover:bg-white/10 transition-all italic cursor-pointer">
            <Printer size={16} /> Imprimer PV
          </button>
          <button onClick={sauvegarderAnalyse} disabled={isSaving || nc.NC_Statut === 'CLOSED'} className="px-8 py-3 bg-red-600 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 shadow-xl hover:bg-red-500 transition-all italic cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Enregistrer l&apos;analyse</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        
        {/* COLONNE GAUCHE : CONTEXTE (STATIQUE) */}
        <div className="col-span-4 space-y-8 text-left">
          <div className="bg-[#151A2D] border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 p-10 opacity-[0.03] rotate-12 bg-red-500 rounded-full blur-3xl w-60 h-60 pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-8">
                <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border italic ${nc.NC_Statut === 'CLOSED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-600/10 text-red-500 border-red-500/20'}`}>
                    {nc.NC_Statut}
                </span>
                <AlertOctagon size={32} className="text-slate-700" />
            </div>
            
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-tight mb-6 text-white italic">{nc?.NC_Libelle}</h1>
            
            <div className="space-y-5 pt-8 border-t border-white/5 italic">
              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                  <Clock size={16} className="text-red-500" /> 
                  <span className="uppercase tracking-widest">Date : {new Date(nc?.NC_CreatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                  <User size={16} className="text-blue-500" /> 
                  <span className="uppercase tracking-widest">Détecteur : {nc?.NC_Detector?.U_FirstName || 'Système'}</span>
              </div>
            </div>

            <div className="mt-10 p-8 bg-black/20 rounded-4xl border border-white/5 italic">
              <p className="text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest flex items-center gap-2"><ArrowLeft size={10} className="rotate-180"/> Constat Factuel</p>
              <p className="text-xs leading-relaxed text-slate-300 italic">{nc?.NC_Description}</p>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : TRAITEMENT (DYNAMIQUE) */}
        <div className="col-span-8 space-y-8 text-left">
          
          {/* 1. DIAGNOSTIC */}
          <div className="bg-[#151A2D] border border-white/10 rounded-[3rem] p-12 shadow-2xl flex flex-col relative group">
            <div className="absolute left-0 top-12 w-1 h-16 bg-red-600 rounded-r-full"></div>
            <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-4 text-slate-200">
                <span className="text-red-600 text-4xl opacity-50">01.</span> Diagnostic & Causes
            </h2>
            <textarea 
                value={analyse} 
                onChange={(e) => setAnalyse(e.target.value)} 
                disabled={nc.NC_Statut === 'CLOSED'}
                placeholder="Rédigez ici l'analyse des causes racines (5 Pourquoi, Ishikawa)..." 
                className="w-full p-8 bg-black/20 border border-white/10 rounded-[2.5rem] text-sm font-bold text-white outline-none focus:border-red-500 min-h-50 leading-relaxed italic placeholder-slate-700 transition-all focus:bg-black/40 disabled:opacity-50" 
            />
          </div>

          {/* 2. ACTIONS CORRECTIVES (CAPA) */}
          <div className="bg-[#151A2D] border border-white/10 rounded-[3rem] p-12 shadow-2xl text-left relative">
            <div className="absolute left-0 top-12 w-1 h-16 bg-blue-600 rounded-r-full"></div>
            
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black uppercase italic flex items-center gap-4 text-slate-200">
                    <span className="text-blue-600 text-4xl opacity-50">02.</span> Plan d&apos;Actions
                </h2>
                <button onClick={() => setIsActionModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase text-white flex items-center gap-3 transition-all shadow-lg cursor-pointer">
                    <Plus size={16} strokeWidth={3} /> Nouvelle Action
                </button>
            </div>

            <div className="space-y-4">
              {nc?.NC_Actions && nc.NC_Actions.length > 0 ? nc.NC_Actions.map((action: any) => (
                <div key={action.ACT_Id} className="p-6 bg-black/20 border border-white/5 rounded-4xl flex items-center justify-between italic hover:border-blue-500/30 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className={`p-3 rounded-xl ${action.ACT_Status === 'DONE' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                        <PlayCircle size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase text-white tracking-tight">{action.ACT_Title}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase italic mt-1 flex items-center gap-2">
                        <Calendar size={12}/> Échéance : {new Date(action.ACT_Deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase italic border ${action.ACT_Status === 'DONE' ? 'bg-emerald-600 text-white border-transparent' : 'bg-slate-800 text-slate-400 border-white/5'}`}>
                      {action.ACT_Status}
                  </span>
                </div>
              )) : (
                <div className="py-12 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center">
                    <ShieldCheck className="mx-auto text-slate-700 mb-4" size={40} />
                    <p className="text-[10px] text-slate-600 uppercase font-black italic tracking-widest">Aucune action planifiée pour cet écart.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CRÉATION ACTION */}
      {isActionModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-200 flex items-center justify-center p-6">
            <div className="bg-[#151A2D] border border-white/10 rounded-[3rem] p-12 w-full max-w-lg shadow-2xl animate-in zoom-in duration-300 relative">
                <h3 className="text-2xl font-black uppercase italic text-white mb-8">Définir Action</h3>
                <form onSubmit={creerAction} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block italic tracking-widest">Libellé de l&apos;action</label>
                        <input autoFocus required value={newActionTitle} onChange={e => setNewActionTitle(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-blue-500 italic" placeholder="EX: REVOIR PROCÉDURE LOGISTIQUE..." />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block italic tracking-widest">Date limite</label>
                        <input required type="date" value={newActionDeadline} onChange={e => setNewActionDeadline(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-blue-500 italic uppercase" />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setIsActionModalOpen(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-400 transition-all cursor-pointer">Annuler</button>
                        <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-[10px] font-black uppercase text-white shadow-lg transition-all cursor-pointer">Lancer Action</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}