/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛠️ MODULE : COCKPIT RÉCLAMATION DÉTAILLÉE (ISO 10002 / §10.2)
 * -------------------------------------------------------------------------
 * RÔLE : Traitement opérationnel, RCA, upload de preuves et lien PAQ.
 * ARCHITECTURE : Page complète dynamique (remplace le drawer de l'ancienne version).
 * DATE : 02 Mars 2026 | 14:15 GMT
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  X, Edit3, Save, Globe, ArrowLeft,
  AlertCircle, CheckCircle, ShieldCheck, UploadCloud, 
  FileText, Trash2, ExternalLink, Activity, Users, BarChart3, Loader2
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://elite.qualisoft.sn:3000";

export default function ReclamationDetailPage() {
  const router = useRouter();
  const params = useParams(); // params.id
  const { isAuthenticated } = useAuthStore() as any;

  const [processus, setProcessus] = useState<any[]>([]);
  const [selectedRec, setSelectedRec] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 📡 CHARGEMENT DU DOSSIER SPÉCIFIQUE
   */
  useEffect(() => {
    const fetchDossier = async () => {
      if (!params?.id) return;
      try {
        setLoading(true);
        const [resRec, resProcs] = await Promise.all([
          apiClient.get(`/reclamations/${params.id}`),
          apiClient.get('/processus')
        ]);
        setSelectedRec(resRec.data?.data || resRec.data);
        setProcessus(resProcs.data?.data || resProcs.data || []);
      } catch (err) { 
        toast.error("Dossier introuvable ou erreur de synchronisation.");
        router.push('/reclamations');
      } finally { 
        setLoading(false); 
      }
    };
    if (isAuthenticated) fetchDossier();
  }, [params?.id, isAuthenticated, router]);

  /**
   * 🛡️ ACTION : MISE À JOUR SÉCURISÉE (CLEAN PAYLOAD)
   */
  const handleUpdate = async () => {
    if (!selectedRec) return;
    setSubmitting(true);
    const tid = toast.loading("Mise à jour du dossier en cours...");
    try {
      const payload = {
        REC_Object: selectedRec.REC_Object,
        REC_SolutionProposed: selectedRec.REC_SolutionProposed,
        REC_ProcessusId: selectedRec.REC_ProcessusId,
        REC_PreuveURL: selectedRec.REC_PreuveURL,
        REC_PreuveName: selectedRec.REC_PreuveName,
      };

      await apiClient.patch(`/reclamations/${selectedRec.REC_Id}`, payload);
      toast.success("Traitement opérationnel scellé.", { id: tid });
      setIsEditing(false); 
    } catch (e: any) { 
      toast.error(e.response?.data?.message || "Erreur de persistance du dossier.", { id: tid }); 
    } finally { 
      setSubmitting(false); 
    }
  };

  /**
   * 🔗 ACTION : INTERFAÇAGE PAQ (§10.2)
   */
  const handleLinkPAQ = async () => {
    if (!selectedRec?.REC_ProcessusId) return toast.warning("Une assignation processus est requise pour créer une Action Corrective.");
    const tid = toast.loading("Ouverture du workflow d'action corrective...");
    try {
      await apiClient.post(`/reclamations/${selectedRec.REC_Id}/link-paq`);
      toast.success("Action Corrective initiée dans le PAQ.", { id: tid });
      // Rafraîchir l'état si l'API modifie le statut
      const resRec = await apiClient.get(`/reclamations/${params.id}`);
      setSelectedRec(resRec.data?.data || resRec.data);
    } catch (e) { 
      toast.error("Échec de la transmission au Plan d'Actions.", { id: tid }); 
    }
  };

  /**
   * 📂 GESTION DES PREUVES (§7.5)
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const tid = toast.loading("Indexation de la preuve documentaire...");
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedRec((prev: any) => ({
        ...prev,
        REC_PreuveURL: res.data.url,
        REC_PreuveName: res.data.filename || file.name
      }));
      toast.success("Preuve archivée dans le SMI.", { id: tid });
    } catch (err) { 
      toast.error("Échec du téléversement sécurisé.", { id: tid }); 
    } finally { 
      setUploading(false); 
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading || !selectedRec) return (
    <div className="ml-0 lg:ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <Loader2 className="animate-spin text-blue-500 w-12 h-12" strokeWidth={2} />
      <p className="text-blue-500 font-black uppercase text-[10px] tracking-[0.4em] italic animate-pulse m-0">Extraction du Dossier...</p>
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 min-h-screen bg-[#0B0F1A] p-4 sm:p-6 lg:p-12 text-white italic font-sans selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* 🔝 HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-white/5 pb-6 lg:pb-10 gap-6">
          <div className="flex items-center gap-5 lg:gap-8">
            <button 
              onClick={() => router.push('/reclamations')} 
              className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 cursor-pointer text-slate-300 shadow-sm"
              title="Retour au registre"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl lg:text-4xl font-black uppercase italic tracking-tighter m-0 leading-tight">
                Traitement <span className="text-blue-500">Opérationnel</span>
              </h1>
              <p className="text-slate-500 text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.4em] mt-2 m-0 italic">
                Réf: {selectedRec.REC_Reference} • ISO 10002
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-white/5 w-full md:w-auto shrink-0">
             <Activity size={18} className="text-blue-500 ml-2" />
             <div className="flex flex-col pr-4">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Statut Actuel</span>
                <span className="text-xs font-black uppercase text-blue-400">{selectedRec.REC_Status?.replace('_', ' ')}</span>
             </div>
          </div>
        </header>

        {/* 📊 IDENTITÉ DE LA RÉCLAMATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <div className="bg-slate-900/40 p-6 lg:p-8 rounded-4xl lg:rounded-[2.5rem] border-2 border-white/5 shadow-xl backdrop-blur-md">
            <h4 className="text-[10px] font-black text-slate-500 uppercase mb-5 flex items-center gap-3 italic tracking-widest m-0">
              <Users size={16} className="text-blue-500" /> Plaignant / Émetteur
            </h4>
            <div className="space-y-4">
              <p className="text-lg lg:text-xl font-black text-white uppercase italic m-0 truncate">
                {selectedRec.Tier?.TR_Name || "TIERS NON RENSEIGNÉ"}
              </p>
              <div className="flex items-center gap-3">
                 <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase border tracking-widest ${
                   selectedRec.REC_Gravity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 
                   selectedRec.REC_Gravity === 'HIGH' ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' : 
                   'bg-blue-500/10 text-blue-400 border-blue-500/30'
                 }`}>
                   GRAVITÉ : {selectedRec.REC_Gravity}
                 </span>
                 <span className="text-[10px] text-slate-400 font-bold tracking-widest">
                   {new Date(selectedRec.REC_DateReceipt).toLocaleDateString('fr-FR')}
                 </span>
              </div>
            </div>
          </div>

          <div className={`p-6 lg:p-8 rounded-4xl lg:rounded-[2.5rem] border-2 transition-all duration-500 shadow-xl backdrop-blur-md ${isEditing ? 'bg-blue-600/5 border-blue-500/30' : 'bg-slate-900/40 border-white/5'}`}>
            <h4 className="text-[10px] font-black text-slate-500 uppercase mb-5 flex items-center gap-3 italic tracking-widest m-0">
              <ShieldCheck size={16} className="text-blue-500"/> Qualification & Imputation
            </h4>
            <div className="space-y-5">
               <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-600 uppercase italic ml-2">Objet (Radical)</label>
                 <input 
                   readOnly={!isEditing} 
                   className={`w-full bg-[#0B0F1A] p-4 lg:p-5 rounded-xl text-sm font-black uppercase border-2 transition-colors outline-none italic ${isEditing ? 'border-blue-500/50 focus:border-blue-500 shadow-inner' : 'border-transparent text-slate-300'}`} 
                   value={selectedRec.REC_Object} 
                   onChange={e => setSelectedRec({...selectedRec, REC_Object: e.target.value.toUpperCase()})} 
                 />
               </div>
               
               <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-600 uppercase italic ml-2">Processus Responsable</label>
                 <div className="relative">
                   <select 
                     disabled={!isEditing} 
                     className={`w-full bg-[#0B0F1A] p-4 lg:p-5 rounded-xl text-[10px] lg:text-[11px] font-black uppercase border-2 transition-colors outline-none italic cursor-pointer appearance-none ${isEditing ? 'border-blue-500/50 focus:border-blue-500 shadow-inner' : 'border-transparent text-slate-300'}`} 
                     value={selectedRec.REC_ProcessusId || ""} 
                     onChange={e => setSelectedRec({...selectedRec, REC_ProcessusId: e.target.value})}
                   >
                     <option value="">-- NON ASSIGNÉ (NC GLOBALE) --</option>
                     {processus.map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
                   </select>
                   {isEditing && <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500">▼</div>}
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* 📝 DESCRIPTION DES FAITS */}
        <div className="bg-slate-900/30 p-6 lg:p-8 rounded-4xl border-2 border-white/5 shadow-md">
           <h4 className="text-[10px] font-black text-slate-500 uppercase mb-4 italic tracking-widest m-0">Description initiale</h4>
           <p className="text-sm text-slate-300 leading-relaxed font-medium bg-[#0B0F1A] p-6 rounded-2xl border border-white/5 m-0 italic">
             &quot;{selectedRec.REC_Description}&quot;
           </p>
        </div>

        

        {/* 🔬 SECTION ANALYSE & PREUVES (§7.5 / §10.2) */}
        <div className="p-8 lg:p-12 bg-slate-900/50 rounded-[2.5rem] lg:rounded-[4rem] border-2 border-white/5 space-y-8 lg:space-y-10 shadow-2xl backdrop-blur-xl relative">
          <h4 className="text-[11px] lg:text-xs font-black text-blue-500 uppercase italic flex items-center gap-4 tracking-[0.3em] leading-none m-0">
            <BarChart3 size={20} className="shrink-0" /> Root Cause Analysis & Preuves
          </h4>
          
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase italic ml-4 tracking-widest">
                Analyse technique & Mesures Correctives
              </label>
              <textarea 
                readOnly={!isEditing} 
                className={`w-full bg-[#0B0F1A] border-2 p-6 lg:p-8 rounded-4xl lg:rounded-[2.5rem] text-sm font-bold min-h-48 outline-none italic transition-colors shadow-inner leading-relaxed resize-none ${isEditing ? 'border-blue-500/50 focus:border-blue-500 text-white' : 'border-white/5 text-slate-300'}`} 
                value={selectedRec.REC_SolutionProposed || ''} 
                onChange={e => setSelectedRec({...selectedRec, REC_SolutionProposed: e.target.value})} 
                placeholder="Décrire l'analyse des causes racines (ex: 5 Pourquoi, Ishikawa) et les mesures correctives immédiates..." 
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase ml-4 italic tracking-widest flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" /> Preuve Documentaire (§7.5)
              </label>
              
              {selectedRec.REC_PreuveURL ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 lg:p-8 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-4xl lg:rounded-[2.5rem] shadow-xl gap-6">
                  <div className="flex items-center gap-5 w-full sm:w-auto">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-inner shrink-0">
                      <FileText size={28} />
                    </div>
                    <div className="flex flex-col gap-2 min-w-0">
                      <span className="text-xs lg:text-sm font-black italic text-white uppercase tracking-wider truncate">
                        {selectedRec.REC_PreuveName || "DOCUMENT PREUVE ATTACHÉ"}
                      </span>
                      <a 
                        href={`${API_BASE_URL}${selectedRec.REC_PreuveURL}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] lg:text-[11px] text-emerald-400 hover:text-emerald-300 underline underline-offset-4 uppercase flex items-center gap-2 font-black transition-colors italic w-fit"
                      >
                        <ExternalLink size={14}/> Consulter l&apos;archive
                      </a>
                    </div>
                  </div>
                  {isEditing && (
                    <button 
                      onClick={() => setSelectedRec({...selectedRec, REC_PreuveURL: null, REC_PreuveName: null})} 
                      className="p-4 bg-slate-900 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-colors border border-rose-500/20 shadow-sm shrink-0 self-end sm:self-auto"
                      title="Supprimer la preuve"
                    >
                      <Trash2 size={20}/>
                    </button>
                  )}
                </div>
              ) : (
                <div 
                  onClick={() => isEditing && fileInputRef.current?.click()} 
                  className={`border-4 border-dashed rounded-[2.5rem] lg:rounded-[3rem] p-10 lg:p-14 flex flex-col items-center justify-center gap-6 transition-all ${isEditing ? 'border-white/10 cursor-pointer hover:border-blue-500/40 hover:bg-blue-500/5 shadow-inner' : 'border-white/5 opacity-40 cursor-not-allowed bg-slate-900/50'}`}
                >
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
                  {uploading ? (
                    <Loader2 className="animate-spin text-blue-500 w-12 h-12" strokeWidth={2} />
                  ) : (
                    <>
                      <UploadCloud size={56} className={isEditing ? "text-blue-500/50" : "text-slate-600"} strokeWidth={1.5} />
                      <p className="text-[10px] lg:text-[11px] font-black uppercase text-slate-400 italic tracking-[0.3em] text-center m-0">
                        {isEditing ? "Cliquez pour indexer un justificatif" : "Mode consultation (Upload verrouillé)"}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🔘 ACTIONS DE FINALISATION */}
        <div className="pt-6 lg:pt-8 flex flex-col gap-4">
          {isEditing ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleUpdate} 
                disabled={submitting} 
                className="flex-1 py-6 lg:py-8 bg-blue-600 hover:bg-blue-500 text-white rounded-4xl lg:rounded-[2.5rem] font-black uppercase text-[10px] lg:text-[11px] tracking-[0.2em] lg:tracking-[0.4em] italic shadow-[0_15px_30px_rgba(37,99,235,0.3)] flex items-center justify-center gap-4 transition-all border-none cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />} 
                Valider l&apos;Analyse Opérationnelle
              </button>
              <button 
                onClick={() => setIsEditing(false)} 
                disabled={submitting}
                className="py-6 lg:py-8 px-8 bg-slate-800 hover:bg-slate-700 text-white rounded-4xl lg:rounded-[2.5rem] font-black uppercase text-[10px] lg:text-[11px] tracking-[0.2em] italic transition-colors border-none cursor-pointer disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setIsEditing(true)} 
                className="flex-1 py-6 lg:py-8 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white rounded-4xl lg:rounded-[2.5rem] font-black uppercase text-[10px] lg:text-[11px] tracking-[0.2em] lg:tracking-[0.3em] italic transition-all flex items-center justify-center gap-4 cursor-pointer shadow-lg m-0"
              >
                <Edit3 size={20} /> Entrer en Mode Édition
              </button>
              <button 
                onClick={handleLinkPAQ} 
                className="flex-1 py-6 lg:py-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-4xl lg:rounded-[2.5rem] font-black uppercase text-[10px] lg:text-[11px] tracking-[0.2em] lg:tracking-[0.3em] italic transition-all flex items-center justify-center gap-4 border-none cursor-pointer shadow-[0_15px_30px_rgba(16,185,129,0.3)] m-0 active:scale-95"
              >
                <CheckCircle size={20} /> Déclencher Action Corrective (PAQ)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}