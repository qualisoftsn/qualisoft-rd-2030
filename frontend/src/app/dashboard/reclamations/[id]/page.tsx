/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Printer, Eye, X, Edit3, Save, Plus, Globe, 
  Send, AlertCircle, CheckCircle, ShieldCheck, UploadCloud, 
  FileText, Trash2, ExternalLink, Activity, Users, Search, BarChart3, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReclamationsPage() {
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
      toast.error("Échec de synchronisation avec le noyau Qualisoft."); 
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredRecs = useMemo(() => {
    return recs.filter(r => 
      r.REC_Object?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.REC_Reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recs, searchTerm]);

  // --- 🛡️ CORRECTIF MAJEUR : MISE À JOUR SÉCURISÉE ---
  const handleUpdate = async () => {
    if (!selectedRec) return;
    setSubmitting(true);
    try {
      /**
       * 🚩 ASSAINISSEMENT DU PAYLOAD (Crucial pour éviter l'erreur 500)
       * On extrait uniquement les valeurs scalaires et les IDs.
       * On ne renvoie JAMAIS les objets de relation (REC_Processus, etc.) au serveur.
       */
      const payload = {
        REC_Object: selectedRec.REC_Object,
        REC_Description: selectedRec.REC_Description,
        REC_SolutionProposed: selectedRec.REC_SolutionProposed,
        REC_Status: selectedRec.REC_Status,
        REC_Deadline: selectedRec.REC_Deadline,
        REC_ProcessusId: selectedRec.REC_ProcessusId,
        REC_TierId: selectedRec.REC_TierId,
        REC_PreuveUrl: selectedRec.REC_PreuveUrl,
        REC_PreuveName: selectedRec.REC_PreuveName,
        REC_Gravity: selectedRec.REC_Gravity || 'MEDIUM',
      };

      await apiClient.patch(`/reclamations/${selectedRec.REC_Id}`, payload);
      
      toast.success("Mise à jour opérationnelle validée.");
      setIsEditing(false); 
      fetchData();
    } catch (e: any) { 
      console.error("Erreur de mise à jour:", e.response?.data);
      toast.error(e.response?.data?.message || "Erreur lors de la mise à jour (Code 500)."); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleLinkPAQ = async () => {
    if (!selectedRec.REC_ProcessusId) return toast.error("Assignation processus requise.");
    try {
      await apiClient.post(`/reclamations/${selectedRec.REC_Id}/link-paq`);
      toast.success("Workflow PAQ déclenché.");
      fetchData(); 
      setSelectedRec(null);
    } catch (e) { toast.error("Échec de transmission au PAQ."); }
  };

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
        REC_PreuveUrl: res.data.url,
        REC_PreuveName: res.data.filename || file.name
      }));
      toast.success("Document de preuve indexé.");
    } catch (err) { toast.error("Erreur lors de l'upload du fichier."); }
    finally { setUploading(false); }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-blue-500" size={48} />
      <p className="text-blue-500 font-black uppercase text-[10px] tracking-widest italic animate-pulse">Synchronisation SMI...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-10 ml-72 text-white italic font-sans print:bg-white print:ml-0 print:text-black">
      
      {/* HEADER */}
      <header className="mb-10 flex justify-between items-end border-b border-white/5 pb-8 no-print">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">Pilotage <span className="text-blue-500">Réclamations</span></h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 italic">Excellence SMI — ISO 10002 : Satisfaction Client</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input placeholder="FILTRER LE REGISTRE..." className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-black uppercase italic outline-none focus:border-blue-500 transition-all w-64 shadow-inner"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-blue-900/20 italic">
            <Plus size={18}/> DÉCLARER UN ÉCART
          </button>
        </div>
      </header>

      {/* TABLEAU */}
      <div className="bg-slate-900/40 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[9px] font-black uppercase text-slate-500 italic">
            <tr><th className="p-8">Identité</th><th className="p-8">Processus</th><th className="p-8">Émetteur</th><th className="p-8 text-center">Statut</th><th className="p-8 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-bold italic">
            {filteredRecs.map(r => (
              <tr key={r.REC_Id} className="hover:bg-white/5 transition-colors group">
                <td className="p-8">
                    <p className="text-xs font-black uppercase tracking-tight group-hover:text-blue-400 transition-all">{r.REC_Object}</p>
                    <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">{r.REC_Reference}</p>
                </td>
                <td className="p-8 text-[10px] font-black uppercase text-blue-500">{r.REC_Processus?.PR_Libelle || r.processusLibelle || "NON ATTRIBUÉ"}</td>
                <td className="p-8 text-[10px] font-black uppercase text-slate-400">{r.REC_Tier?.TR_Name || "TIERS ANONYME"}</td>
                <td className="p-8 text-center">
                    <span className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase border ${r.REC_Status === 'REGLEE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                        {r.REC_Status?.replace('_', ' ')}
                    </span>
                </td>
                <td className="p-8 text-right no-print">
                  <button onClick={() => setSelectedRec(r)} className="p-4 bg-white/5 rounded-2xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-inner"><Eye size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen && <CreateModal onClose={() => setIsCreateModalOpen(false)} onRefresh={fetchData} tiers={tiers} processus={processus} />}

      {/* TIROIR DE PILOTAGE */}
      {selectedRec && (
        <>
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110]" onClick={() => {setSelectedRec(null); setIsEditing(false);}} />
          <div className="fixed top-0 right-0 h-screen w-[45rem] bg-[#0F172A] z-[120] border-l border-white/10 p-12 flex flex-col italic shadow-4xl animate-in slide-in-from-right duration-500">
            
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Traitement <span className="text-blue-500">Opérationnel</span></h2>
              <button onClick={() => setSelectedRec(null)} className="p-4 bg-white/5 rounded-2xl hover:bg-red-500/10 hover:text-red-500 transition-all shadow-inner"><X size={24}/></button>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto pr-4 scrollbar-hide">
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-2">Statut</p>
                    <div className="flex items-center gap-3"><Activity size={16} className="text-blue-500" /><span className="text-xs font-black uppercase text-blue-500">{selectedRec.REC_Status?.replace('_', ' ')}</span></div>
                 </div>
                 <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-2">Émetteur</p>
                    <div className="flex items-center gap-3"><Users size={16} className="text-slate-400" /><span className="text-xs font-black uppercase text-white truncate">{selectedRec.REC_Tier?.TR_Name}</span></div>
                 </div>
              </div>

              <div className={`p-8 rounded-[3rem] border transition-all ${isEditing ? 'bg-blue-600/5 border-blue-500/20' : 'bg-white/5 border-white/10 opacity-80'}`}>
                <h4 className="text-[9px] font-black text-slate-500 uppercase mb-6 flex items-center gap-2"><ShieldCheck size={14}/> Responsabilité</h4>
                <div className="space-y-6">
                    <input readOnly={!isEditing} className={`w-full bg-[#0B0F1A] p-5 rounded-2xl text-sm font-black uppercase border transition-all outline-none ${isEditing ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-transparent'}`} value={selectedRec.REC_Object} onChange={e => setSelectedRec({...selectedRec, REC_Object: e.target.value.toUpperCase()})} />
                    <select disabled={!isEditing} className={`w-full bg-[#0B0F1A] p-5 rounded-2xl text-[10px] font-black uppercase border transition-all outline-none ${isEditing ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-transparent'}`} value={selectedRec.REC_ProcessusId || ""} onChange={e => setSelectedRec({...selectedRec, REC_ProcessusId: e.target.value})}>
                        <option value="">-- ASSIGNER UN PROCESSUS --</option>
                        {processus.map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
                    </select>
                </div>
              </div>

              <div className="p-10 bg-slate-900/40 rounded-[3.5rem] border border-white/5 space-y-8">
                <h4 className="text-[9px] font-black text-blue-500 uppercase italic flex items-center gap-2 tracking-widest"><BarChart3 size={16}/> Analyse & Solution</h4>
                <div className="space-y-6">
                    <textarea readOnly={!isEditing} className="w-full bg-[#0B0F1A] border border-white/10 p-6 rounded-[2rem] text-xs font-bold min-h-32 outline-none italic focus:border-blue-500 transition-all shadow-inner" value={selectedRec.REC_SolutionProposed || ''} onChange={e => setSelectedRec({...selectedRec, REC_SolutionProposed: e.target.value})} placeholder="Décrire ici l'analyse des causes racines et les actions correctives prises..." />
                    
                    <div className="space-y-4">
                        <label className="text-[8px] font-black text-slate-500 uppercase ml-2 italic">Preuve de Traitement (§7.5)</label>
                        {selectedRec.REC_PreuveUrl ? (
                            <div className="flex items-center justify-between p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl shadow-lg">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-500"><FileText size={24}/></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black italic truncate max-w-[15rem] text-white">{selectedRec.REC_PreuveName || "DOCUMENT"}</span>
                                        <a href={`${API_BASE_URL}${selectedRec.REC_PreuveUrl}`} target="_blank" rel="noreferrer" className="text-[9px] text-emerald-400 underline uppercase flex items-center gap-2 mt-2 font-black hover:text-emerald-300 transition-all"><ExternalLink size={12}/> Visualiser</a>
                                    </div>
                                </div>
                                {isEditing && <button onClick={() => setSelectedRec({...selectedRec, REC_PreuveUrl: null})} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={20}/></button>}
                            </div>
                        ) : (
                            <div onClick={() => isEditing && fileInputRef.current?.click()} className={`border-2 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-4 transition-all ${isEditing ? 'border-white/10 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5' : 'border-white/5 opacity-40 cursor-not-allowed'}`}>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                                {uploading ? <Loader2 className="animate-spin text-blue-500" size={32} /> : <><UploadCloud size={32} className="text-slate-600"/><p className="text-[9px] font-black uppercase text-slate-500 italic">Cliquer pour joindre une preuve</p></>}
                            </div>
                        )}
                    </div>
                </div>
              </div>

              <div className="pt-10 flex flex-col gap-4 no-print">
                  {isEditing ? (
                    <button onClick={handleUpdate} disabled={submitting} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black uppercase text-xs italic shadow-2xl flex items-center justify-center gap-3 transition-all">
                        {submitting ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} Valider le traitement opérationnel
                    </button>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="w-full py-6 bg-white/5 border border-white/10 text-white rounded-[2rem] font-black uppercase text-xs italic hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                        <Edit3 size={20}/> Ouvrir le dossier de pilotage
                    </button>
                  )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- MODAL CRÉATION ---
function CreateModal({ onClose, onRefresh, tiers, processus }: any) {
    const [form, setForm] = useState({ REC_Object: '', REC_Description: '', REC_TierId: '', REC_ProcessusId: '' });
    const [saving, setSaving] = useState(false);
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setSaving(true);
        try {
          await apiClient.post('/reclamations', form);
          onRefresh(); onClose();
          toast.success("Écart client enregistré.");
        } catch (err) { toast.error("Échec de l'enregistrement."); }
        finally { setSaving(false); }
    };
    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-6 italic font-black">
            <form onSubmit={handleSubmit} className="bg-[#0F172A] w-full max-w-2xl rounded-[4rem] border border-white/10 p-16 space-y-8 shadow-4xl animate-in zoom-in-95">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">Saisie <span className="text-blue-500">Réclamation</span></h2>
                <div className="space-y-4">
                  <input required placeholder="OBJET" className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-black uppercase italic outline-none focus:border-blue-500 transition-all" value={form.REC_Object} onChange={e => setForm({...form, REC_Object: e.target.value.toUpperCase()})} />
                  <div className="grid grid-cols-2 gap-4">
                    <select required className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-black uppercase outline-none" value={form.REC_TierId} onChange={e => setForm({...form, REC_TierId: e.target.value})}><option value="">-- CLIENT --</option>{tiers.map((t: any) => <option key={t.TR_Id} value={t.TR_Id}>{t.TR_Name}</option>)}</select>
                    <select required className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-black uppercase outline-none" value={form.REC_ProcessusId} onChange={e => setForm({...form, REC_ProcessusId: e.target.value})}><option value="">-- PROCESSUS --</option>{processus.map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}</select>
                  </div>
                  <textarea required placeholder="DESCRIPTION" rows={4} className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all" value={form.REC_Description} onChange={e => setForm({...form, REC_Description: e.target.value})} />
                </div>
                <div className="flex flex-col gap-4">
                  <button type="submit" disabled={saving} className="w-full py-7 bg-blue-600 rounded-[2.5rem] font-black uppercase shadow-2xl flex items-center justify-center gap-3">{saving ? <Loader2 className="animate-spin"/> : "Enregistrer l'Écart"}</button>
                  <button type="button" onClick={onClose} className="text-slate-500 text-[10px] uppercase tracking-widest hover:text-white transition-all">Abandonner</button>
                </div>
            </form>
        </div>
    );
}