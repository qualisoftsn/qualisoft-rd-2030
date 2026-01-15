/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import FileUpload from '@/components/shared/file-upload';
import { 
  ArrowLeft, Printer, Save, CheckCircle2, AlertOctagon, 
  Clock, User, Activity, Building2, FileText, 
  Search, Plus, Trash2, Loader2, MessageSquare, ShieldAlert
} from 'lucide-react';

export default function DetailNonConformitePage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [nc, setNc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- ÉTATS D'ÉDITION ---
  const [analyse, setAnalyse] = useState('');
  const [planAction, setPlanAction] = useState<any[]>([]);

  const chargerDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/non-conformites/${id}`);
      const data = res.data?.data || res.data;
      setNc(data);
      setAnalyse(data.NC_Diagnostic || '');
    } catch (e) {
      console.error("Échec du chargement du dossier NC");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { chargerDetails(); }, [chargerDetails]);

  const sauvegarderTraitement = async () => {
    setIsSaving(true);
    try {
      await apiClient.patch(`/non-conformites/${id}`, {
        NC_Diagnostic: analyse,
        NC_Statut: 'TRAITEMENT'
      });
      // Notification de succès simulée ou via bannière
      chargerDetails();
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-red-600" size={40} />
      <span className="text-[10px] font-black uppercase tracking-widest text-red-600 mt-4">Ouverture du dossier...</span>
    </div>
  );

  return (
    <div className="px-6 py-8 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans text-left selection:bg-red-600/30">
      
      {/* BARRE D'ACTIONS SUPÉRIEURE */}
      <div className="mb-8 flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all">
          <ArrowLeft size={16} /> Retour au registre
        </button>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-white/10 transition-all">
            <Printer size={16} /> Imprimer le PV
          </button>
          <button onClick={sauvegarderTraitement} disabled={isSaving} className="px-8 py-3 bg-red-600 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-red-900/20 hover:bg-red-500 transition-all">
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Enregistrer l&apos;analyse</>}
          </button>
        </div>
      </div>

      {/* GRILLE PRINCIPALE DU DOSSIER NC */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* COLONNE GAUCHE : IDENTITÉ & CONSTAT (L'ÉCART) */}
        <div className="col-span-4 space-y-6">
          <div className="bg-[#151A2D] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
               <AlertOctagon size={80} />
            </div>
            
            <span className="px-4 py-1.5 bg-red-600/10 border border-red-500/20 rounded-full text-[9px] font-black text-red-500 uppercase tracking-widest mb-6 inline-block">
              Fiche d&apos;Écart — {nc?.NC_Statut}
            </span>
            
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-tight mb-4 text-white">
              {nc?.NC_Libelle}
            </h1>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                <Clock size={16} className="text-red-500" /> Détecté le : {new Date(nc?.NC_CreatedAt).toLocaleDateString('fr-FR')}
              </div>
              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                <User size={16} className="text-blue-500" /> Détecteur : {nc?.NC_Detector?.U_FirstName} {nc?.NC_Detector?.U_LastName}
              </div>
              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                <Building2 size={16} className="text-emerald-500" /> Site : {nc?.NC_Site?.S_Name || 'Siège Dakar'}
              </div>
            </div>

            <div className="mt-8 p-6 bg-black/20 rounded-2xl border border-white/5 italic">
              <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Description des faits</p>
              <p className="text-xs leading-relaxed text-slate-300">{nc?.NC_Description}</p>
            </div>
          </div>

          <div className="bg-[#151A2D] border border-blue-500/20 rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-[11px] font-black uppercase text-blue-500 mb-6 flex items-center gap-2 tracking-widest">
               Responsabilité SMI
            </h3>
            <div className="flex items-center gap-4 p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl">
               <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-black">
                 {nc?.NC_Processus?.PR_Pilote?.U_FirstName?.charAt(0)}
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase text-white">{nc?.NC_Processus?.PR_Pilote?.U_FirstName} {nc?.NC_Processus?.PR_Pilote?.U_LastName}</p>
                 <p className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">Pilote : {nc?.NC_Processus?.PR_Libelle}</p>
               </div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : TRAITEMENT & ACTIONS (LA RÉSOLUTION) */}
        <div className="col-span-8 space-y-8">
          
          {/* ZONE D'ANALYSE DES CAUSES */}
          <div className="bg-[#151A2D] border border-white/10 rounded-[3rem] p-10 shadow-3xl">
            <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3">
              <span className="text-red-600">01.</span> Diagnostic & Analyse des Causes
            </h2>
            <textarea 
              value={analyse}
              onChange={(e) => setAnalyse(e.target.value)}
              placeholder="Effectuez ici l'analyse (5 Pourquoi, Ishikawa...) pour identifier la cause racine..."
              className="w-full p-8 bg-black/20 border border-white/10 rounded-[2.5rem] text-sm font-bold text-white outline-none focus:border-red-500 transition-all min-h-50 resize-none leading-relaxed"
            />
          </div>

          {/* ZONE PLAN D'ACTION & PREUVES */}
          <div className="bg-[#151A2D] border border-white/10 rounded-[3rem] p-10 shadow-3xl">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
                <span className="text-red-600">02.</span> Plan d&apos;Actions & Preuves de clôture
              </h2>
              <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase hover:bg-red-600 transition-all flex items-center gap-2">
                <Plus size={14} /> Ajouter une action
              </button>
            </div>

            {/* TABLEAU DES ACTIONS LIÉES */}
            <div className="space-y-4">
              {nc?.NC_Actions?.length > 0 ? (
                nc.NC_Actions.map((action: any) => (
                  <div key={action.ACT_Id} className="p-6 bg-black/20 border border-white/5 rounded-3xl flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                      <div className="p-3 bg-white/5 rounded-xl text-slate-500">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase text-white">{action.ACT_Title}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Échéance : {new Date(action.ACT_Deadline).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="px-4 py-1.5 bg-slate-800 rounded-lg text-[8px] font-black uppercase">{action.ACT_Status}</span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center border border-dashed border-white/10 rounded-[2.5rem]">
                  <p className="text-[10px] font-black uppercase text-slate-700 tracking-widest">Aucune action corrective engagée pour le moment.</p>
                </div>
              )}
            </div>

            {/* SECTION UPLOAD PREUVES GLOBALES */}
            <div className="mt-10 pt-10 border-t border-white/5">
              <FileUpload 
                label="Joindre les preuves de clôture (Factures, PV de réunion, Photos...)"
                onUploadSuccess={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}