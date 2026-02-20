/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// NOM DU FICHIER : frontend/app/dashboard/reclamations/[id]/page.tsx
/**
 * 🛠️ FONCTION : Cockpit de pilotage d'un dossier de réclamation spécifique.
 * RÔLE : Analyse des causes racines, archivage des preuves (upload) et 
 * interface de transition vers le PAQ (Plan d'Actions Qualité).
 */

'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Printer, Eye, X, Edit3, Save, Plus, Globe, 
  Send, AlertCircle, CheckCircle, ShieldCheck, UploadCloud, 
  FileText, Trash2, ExternalLink, Activity, Users, Search, BarChart3, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReclamationsDetailPage() {
  const [recs, setRecs] = useState<any[]>([]);
  const [processus, setProcessus] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  const [selectedRec, setSelectedRec] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = "https://elite.qualisoft.sn:3000"; 

  /**
   * 📡 SYNCHRONISATION DES RÉFÉRENTIELS
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resRec, resProcs, resTiers] = await Promise.all([
        apiClient.get('/reclamations'),
        apiClient.get('/processus'),
        apiClient.get('/tiers')
      ]);
      const extract = (res: any) => res.data?.data || res.data || [];
      setRecs(extract(resRec));
      setProcessus(extract(resProcs));
      setTiers(extract(resTiers));
    } catch (err) { 
      toast.error("Échec de synchronisation SMI"); 
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredRecs = useMemo(() => {
    return recs.filter(r => 
      r.REC_Object?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.REC_Reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recs, searchTerm]);

  /**
   * 🛡️ ACTION : MISE À JOUR SÉCURISÉE (CLEAN PAYLOAD)
   * On assainit l'objet avant envoi pour éviter d'envoyer les relations (REC_Processus, etc.)
   * ce qui prévient les erreurs d'injection SQL ou de structure DTO côté serveur (Error 500).
   */
  const handleUpdate = async () => {
    if (!selectedRec) return;
    setSubmitting(true);
    try {
      const payload = {
        REC_Object: selectedRec.REC_Object,
        REC_Description: selectedRec.REC_Description,
        REC_SolutionProposed: selectedRec.REC_SolutionProposed,
        REC_Status: selectedRec.REC_Status,
        REC_Deadline: selectedRec.REC_Deadline,
        REC_ProcessusId: selectedRec.REC_ProcessusId,
        REC_TierId: selectedRec.REC_TierId,
        REC_PreuveURL: selectedRec.REC_PreuveURL,
        REC_PreuveName: selectedRec.REC_PreuveName,
        REC_Gravity: selectedRec.REC_Gravity || 'MEDIUM',
      };

      await apiClient.patch(`/reclamations/${selectedRec.REC_Id}`, payload);
      toast.success("Traitement opérationnel validé.");
      setIsEditing(false); 
      fetchData();
    } catch (e: any) { 
      toast.error(e.response?.data?.message || "Erreur de persistance du dossier."); 
    } finally { setSubmitting(false); }
  };

  /**
   * 🔗 ACTION : INTERFAÇAGE PAQ (§10.2)
   * Déclenche la création automatique d'une action corrective dans le PAQ.
   */
  const handleLinkPAQ = async () => {
    if (!selectedRec.REC_ProcessusId) return toast.error("Assignation processus requise pour imputation PAQ.");
    try {
      await apiClient.post(`/reclamations/${selectedRec.REC_Id}/link-paq`);
      toast.success("Workflow de correction PAQ initié.");
      fetchData(); 
      setSelectedRec(null);
    } catch (e) { toast.error("Échec de transmission au Plan d'Actions."); }
  };

  /**
   * 📂 GESTION DES PREUVES (§7.5)
   * Téléchargement de documents justificatifs (Photos, Emails, PV).
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
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
      toast.success("Preuve documentaire archivée.");
    } catch (err) { toast.error("Échec du téléversement."); }
    finally { setUploading(false); }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-blue-500" size={50} />
      <p className="text-blue-500 font-black uppercase text-[10px] tracking-widest italic animate-pulse">Chargement du Cockpit...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-12 ml-72 text-white italic font-sans selection:bg-blue-600/30">
      
      {/* 🔝 HEADER */}
      <header className="mb-12 flex justify-between items-end border-b border-white/5 pb-10">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Pilotage <span className="text-blue-600">Réclamations</span></h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4 italic">Management de la Satisfaction Client — ISO 10002</p>
        </div>
        <div className="flex gap-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              placeholder="FILTRER LE REGISTRE..." 
              className="bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-8 text-[11px] font-black uppercase italic outline-none focus:border-blue-500 transition-all w-80 shadow-inner"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-[10px] flex items-center gap-4 transition-all shadow-2xl shadow-blue-900/40 border-none cursor-pointer italic"
          >
            <Plus size={20}/> DÉCLARER UN ÉCART
          </button>
        </div>
      </header>

      {/* 📊 TABLEAU DES RÉCLAMATIONS */}
      <div className="bg-slate-900/40 rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-3xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] font-black uppercase text-slate-500 italic tracking-[0.2em]">
            <tr><th className="p-10">Identité de l&apos;écart</th><th className="p-10">Processus</th><th className="p-10">Tiers Émetteur</th><th className="p-10 text-center">Statut</th><th className="p-10 text-right">Pilotage</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-bold italic">
            {filteredRecs.map(r => (
              <tr key={r.REC_Id} className="hover:bg-white/5 transition-all group">
                <td className="p-10">
                    <p className="text-sm font-black uppercase tracking-tight group-hover:text-blue-400 transition-all">{r.REC_Object}</p>
                    <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">{r.REC_Reference}</p>
                </td>
                <td className="p-10 text-[11px] font-black uppercase text-blue-500 italic">{r.REC_Processus?.PR_Libelle || "NON ATTRIBUÉ"}</td>
                <td className="p-10 text-[11px] font-black uppercase text-slate-400 italic">{r.REC_Tier?.TR_Name || "ANONYME"}</td>
                <td className="p-10 text-center">
                    <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase border ${r.REC_Status === 'REGLEE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                        {r.REC_Status?.replace('_', ' ')}
                    </span>
                </td>
                <td className="p-10 text-right">
                  <button onClick={() => setSelectedRec(r)} className="p-5 bg-white/5 rounded-2xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-inner border-none cursor-pointer"><Eye size={22}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen && <CreateModal onClose={() => setIsCreateModalOpen(false)} onRefresh={fetchData} tiers={tiers} processus={processus} />}

      {/* 📟 TIROIR DE PILOTAGE OPÉRATIONNEL (DRAWER) */}
      {selectedRec && (
        <>
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-110 animate-in fade-in duration-300" onClick={() => {setSelectedRec(null); setIsEditing(false);}} />
          <div className="fixed top-0 right-0 h-screen w-3xl bg-[#0F172A] z-120 border-l border-white/10 p-16 flex flex-col italic shadow-4xl animate-in slide-in-from-right duration-500">
            
            <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">Traitement <span className="text-blue-500">Opérationnel</span></h2>
              <button onClick={() => setSelectedRec(null)} className="p-5 bg-white/5 rounded-2xl hover:bg-red-500/10 hover:text-red-500 transition-all border-none cursor-pointer text-white"><X size={28}/></button>
            </div>

            <div className="flex-1 space-y-10 overflow-y-auto pr-6 scrollbar-hide">
              {/* CARTES KPI RAPIDES */}
              <div className="grid grid-cols-2 gap-6">
                 <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-inner">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-3 tracking-widest italic leading-none">Statut Actuel</p>
                    <div className="flex items-center gap-4"><Activity size={18} className="text-blue-500" /><span className="text-sm font-black uppercase text-blue-500 italic">{selectedRec.REC_Status?.replace('_', ' ')}</span></div>
                 </div>
                 <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-inner">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-3 tracking-widest italic leading-none">Plaignant / Émetteur</p>
                    <div className="flex items-center gap-4"><Users size={18} className="text-slate-400" /><span className="text-sm font-black uppercase text-white truncate italic">{selectedRec.REC_Tier?.TR_Name}</span></div>
                 </div>
              </div>

              {/* SECTION IMPUTATION & RESPONSABILITÉ */}
              <div className={`p-10 rounded-[3.5rem] border transition-all duration-500 ${isEditing ? 'bg-blue-600/5 border-blue-500/20' : 'bg-white/5 border-white/10 opacity-80'}`}>
                <h4 className="text-[10px] font-black text-slate-500 uppercase mb-8 flex items-center gap-3 italic tracking-widest"><ShieldCheck size={18} className="text-blue-500"/> Qualification de l&apos;écart</h4>
                <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-600 uppercase italic ml-4">Objet de la plainte (Radical)</label>
                      <input readOnly={!isEditing} className={`w-full bg-[#0B0F1A] p-6 rounded-3xl text-base font-black uppercase border transition-all outline-none italic ${isEditing ? 'border-blue-500 shadow-inner' : 'border-transparent'}`} value={selectedRec.REC_Object} onChange={e => setSelectedRec({...selectedRec, REC_Object: e.target.value.toUpperCase()})} />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-600 uppercase italic ml-4">Processus Responsable (Imputation)</label>
                      <select disabled={!isEditing} className={`w-full bg-[#0B0F1A] p-6 rounded-3xl text-[11px] font-black uppercase border transition-all outline-none italic cursor-pointer appearance-none ${isEditing ? 'border-blue-500 shadow-inner' : 'border-transparent'}`} value={selectedRec.REC_ProcessusId || ""} onChange={e => setSelectedRec({...selectedRec, REC_ProcessusId: e.target.value})}>
                          <option value="">-- DÉSIGNER UN PROCESSUS PILOTE --</option>
                          {processus.map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
                      </select>
                    </div>
                </div>
              </div>

              {/* SECTION ANALYSE & PREUVES (§7.5) */}
              <div className="p-12 bg-slate-900/40 rounded-[4rem] border border-white/5 space-y-10 shadow-2xl backdrop-blur-3xl">
                <h4 className="text-[10px] font-black text-blue-500 uppercase italic flex items-center gap-4 tracking-[0.3em] leading-none underline underline-offset-8 decoration-blue-500/30"><BarChart3 size={20}/> Analyse des causes & Preuves</h4>
                
                <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-600 uppercase italic ml-4">Analyse technique & Solution de remédiation</label>
                      <textarea readOnly={!isEditing} className="w-full bg-[#0B0F1A] border border-white/10 p-8 rounded-[2.5rem] text-xs font-bold min-h-48 outline-none italic focus:border-blue-500 transition-all shadow-inner leading-relaxed" value={selectedRec.REC_SolutionProposed || ''} onChange={e => setSelectedRec({...selectedRec, REC_SolutionProposed: e.target.value})} placeholder="Décrire ici l'analyse des causes racines (5 Pourquoi, Ishikawa...) et les mesures palliatives..." />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-4 italic tracking-widest">Preuve de Traitement Scellée (§7.5)</label>
                        {selectedRec.REC_PreuveURL ? (
                            <div className="flex items-center justify-between p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] shadow-xl animate-in zoom-in-95">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-emerald-500/20 rounded-2xl text-emerald-500 shadow-lg"><FileText size={32}/></div>
                                    <div className="flex flex-col gap-2 text-left">
                                        <span className="text-[11px] font-black italic truncate max-w-[18rem] text-white uppercase tracking-tight">{selectedRec.REC_PreuveName || "DOC_SMI_PREUVE"}</span>
                                        <a href={`${API_BASE_URL}${selectedRec.REC_PreuveURL}`} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-400 underline uppercase flex items-center gap-2 font-black hover:text-emerald-200 transition-all italic"><ExternalLink size={14}/> Consulter la pièce jointe</a>
                                    </div>
                                </div>
                                {isEditing && <button onClick={() => setSelectedRec({...selectedRec, REC_PreuveURL: null, REC_PreuveName: null})} className="p-4 text-red-500 hover:bg-red-500/20 rounded-2xl transition-all border-none cursor-pointer"><Trash2 size={24}/></button>}
                            </div>
                        ) : (
                            <div onClick={() => isEditing && fileInputRef.current?.click()} className={`border-2 border-dashed rounded-[3.5rem] p-12 flex flex-col items-center justify-center gap-5 transition-all ${isEditing ? 'border-white/10 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 shadow-inner' : 'border-white/5 opacity-40 cursor-not-allowed'}`}>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                                {uploading ? <Loader2 className="animate-spin text-blue-500" size={40} /> : <><UploadCloud size={48} className="text-slate-700"/><p className="text-[11px] font-black uppercase text-slate-600 italic tracking-widest">Indexation de preuve documentaire</p></>}
                            </div>
                        )}
                    </div>
                </div>
              </div>

              {/* ACTIONS DE FINALISATION */}
              <div className="pt-10 flex flex-col gap-6">
                  {isEditing ? (
                    <button onClick={handleUpdate} disabled={submitting} className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white rounded-[2.5rem] font-black uppercase text-xs italic shadow-[0_20px_50px_rgba(37,99,235,0.3)] flex items-center justify-center gap-4 transition-all border-none cursor-pointer active:scale-95">
                        {submitting ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>} Valider le pilotage opérationnel
                    </button>
                  ) : (
                    <div className="flex gap-4">
                      <button onClick={() => setIsEditing(true)} className="flex-1 py-7 bg-white/5 border border-white/10 text-white rounded-[2.5rem] font-black uppercase text-xs italic hover:bg-white/10 transition-all flex items-center justify-center gap-4 border-none cursor-pointer shadow-xl">
                          <Edit3 size={22}/> Modifier l&apos;analyse
                      </button>
                      <button onClick={handleLinkPAQ} className="flex-1 py-7 bg-emerald-600 text-white rounded-[2.5rem] font-black uppercase text-xs italic hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 border-none cursor-pointer shadow-xl shadow-emerald-900/20">
                          <CheckCircle size={22}/> Transmettre au PAQ
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- MODAL DE CRÉATION RAPIDE ---
function CreateModal({ onClose, onRefresh, tiers, processus }: any) {
    const [form, setForm] = useState({ REC_Object: '', REC_Description: '', REC_TierId: '', REC_ProcessusId: '' });
    const [saving, setSaving] = useState(false);
    
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setSaving(true);
        try {
          await apiClient.post('/reclamations', form);
          onRefresh(); onClose();
          toast.success("Réclamation enregistrée.");
        } catch (err) { toast.error("Échec de la saisie."); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-200 flex items-center justify-center p-8 animate-in zoom-in duration-300">
            <form onSubmit={handleSubmit} className="bg-[#0F172A] w-full max-w-3xl rounded-[4rem] border border-white/10 p-16 space-y-12 shadow-[0_60px_120px_rgba(0,0,0,0.6)] text-left italic">
                <header>
                  <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-4">Saisie <span className="text-blue-500">Incident</span></h2>
                  <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] italic">Capture d&apos;entrée SMI — ISO 10002</p>
                </header>

                <div className="space-y-8 text-left">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-600 uppercase italic ml-4 leading-none tracking-widest">Objet succinct du litige</label>
                    <input required placeholder="INTITULÉ DE LA PLAINTE" className="w-full bg-white/5 border border-white/10 p-8 rounded-3xl font-black uppercase italic text-lg text-white outline-none focus:border-blue-600 transition-all shadow-inner" value={form.REC_Object} onChange={e => setForm({...form, REC_Object: e.target.value.toUpperCase()})} />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-600 uppercase italic ml-4 leading-none tracking-widest">Client / Tiers</label>
                      <select required className="w-full bg-white/5 border border-white/10 p-8 rounded-3xl font-black uppercase italic text-xs text-white outline-none appearance-none cursor-pointer shadow-inner" value={form.REC_TierId} onChange={e => setForm({...form, REC_TierId: e.target.value})}>
                        <option value="">-- CHOISIR --</option>
                        {tiers.map((t: any) => <option key={t.TR_Id} value={t.TR_Id}>{t.TR_Name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-600 uppercase italic ml-4 leading-none tracking-widest">Processus Imputé</label>
                      <select required className="w-full bg-white/5 border border-white/10 p-8 rounded-3xl font-black uppercase italic text-xs text-white outline-none appearance-none cursor-pointer shadow-inner" value={form.REC_ProcessusId} onChange={e => setForm({...form, REC_ProcessusId: e.target.value})}>
                        <option value="">-- ASSIGNATION --</option>
                        {processus.map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-600 uppercase italic ml-4 leading-none tracking-widest">Description des faits</label>
                    <textarea required placeholder="DÉTAILLER LES ÉVÈNEMENTS..." rows={4} className="w-full bg-white/5 border border-white/10 p-8 rounded-3xl font-bold text-sm text-white outline-none focus:border-blue-500 transition-all shadow-inner resize-none italic" value={form.REC_Description} onChange={e => setForm({...form, REC_Description: e.target.value})} />
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <button type="submit" disabled={saving} className="w-full py-8 bg-blue-600 rounded-[2.5rem] font-black uppercase text-xs italic tracking-widest shadow-2xl flex items-center justify-center gap-4 border-none cursor-pointer hover:bg-blue-500 transition-all active:scale-95 shadow-blue-900/30">
                    {saving ? <Loader2 className="animate-spin" size={20}/> : <Plus size={20}/>} Enregistrer l&apos;Écart Client
                  </button>
                  <button type="button" onClick={onClose} className="text-slate-600 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all border-none bg-transparent cursor-pointer italic leading-none">Abandonner la saisie</button>
                </div>
            </form>
        </div>
    );
}