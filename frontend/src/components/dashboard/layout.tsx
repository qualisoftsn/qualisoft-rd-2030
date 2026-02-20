/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🏢 MODULE : ReclamationsPage
 * -------------------------------------------------------------------------
 * FONCTION : Management des réclamations tiers (§ISO 10002).
 * RÔLE : Traitement, analyse des causes et scellage des preuves de résolution.
 * ISOLATION : Filtrage automatique par Tenant via l'apiClient scellé.
 */

'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react'; 
import apiClient from '@/core/api/api-client';
import Sidebar from '@/app/dashboard/sidebar'; 
import { 
  Printer, Eye, X, Edit3, Save, Plus, 
  Send, ShieldCheck, UploadCloud, FileText, Trash2, 
  ExternalLink, Activity, Users, Search, BarChart3, Loader2, Calendar 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReclamationsPage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const isSuperAdmin = user?.U_Role === 'SUPER_ADMIN';

  // --- ÉTATS SÉCURISÉS ---
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
   * 📡 SYNCHRONISATION MATRIX
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
      console.error("Échec Synchro SDE", err);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (status === "authenticated") fetchData(); }, [fetchData, status]);

  // --- MOTEUR DE RECHERCHE ---
  const filteredRecs = useMemo(() => {
    return recs.filter(r => 
      r.REC_Object?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.REC_Reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recs, searchTerm]);

  /**
   * 💾 SCELLAGE DES MODIFICATIONS
   */
  const handleUpdate = async () => {
    if (!selectedRec) return;
    
    if (!selectedRec.REC_SolutionProposed || selectedRec.REC_SolutionProposed.trim() === "") {
      toast.error("Analyse & Solutions requises pour clôturer l'écart.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        REC_Object: selectedRec.REC_Object,
        REC_Description: selectedRec.REC_Description,
        REC_SolutionProposed: selectedRec.REC_SolutionProposed,
        REC_Status: selectedRec.REC_Status,
        REC_ProcessusId: selectedRec.REC_ProcessusId,
        REC_TierId: selectedRec.REC_TierId,
        REC_PreuveURL: selectedRec.REC_PreuveURL,
        REC_Gravity: selectedRec.REC_Gravity || 'MEDIUM',
        REC_Deadline: selectedRec.REC_Deadline ? new Date(selectedRec.REC_Deadline).toISOString() : null
      };

      await apiClient.patch(`/reclamations/${selectedRec.REC_Id}`, payload);
      toast.success("Registre mis à jour");
      setIsEditing(false); 
      fetchData();
      setSelectedRec(null);
    } catch (e: any) { 
      toast.error("Échec du scellage des données");
    } finally { setSubmitting(false); }
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
        REC_PreuveURL: res.data.url,
        REC_PreuveName: res.data.filename || file.name
      }));
      toast.success("Document de preuve indexé");
    } catch (err: any) { 
      toast.error("Erreur d'upload infrastructure"); 
    } finally { setUploading(false); }
  };

  if (status === "loading" || loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-blue-500" size={50} />
      <span className="font-black italic uppercase tracking-widest text-blue-500">Initialisation Registre...</span>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0B0F1A] italic">
      <Sidebar user={user} isSuperAdmin={isSuperAdmin} />

      <main className="flex-1 ml-72 p-12 text-white font-sans overflow-y-auto h-screen">
        
        {/* HEADER D'ACTION */}
        <header className="mb-14 flex justify-between items-end border-b border-white/5 pb-10">
          <div>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
              Pilotage <span className="text-blue-500">Réclamations</span>
            </h1>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.5em] mt-4 italic">Management Stratégique ISO 10002</p>
          </div>
          <div className="flex gap-6">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                placeholder="FILTRER LE REGISTRE..." 
                className="bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-8 text-[11px] font-black uppercase italic outline-none focus:border-blue-500 w-80 shadow-inner transition-all"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)} 
              className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-xs flex items-center gap-4 shadow-3xl shadow-blue-600/30 transition-all active:scale-95 uppercase border-none cursor-pointer italic"
            >
              <Plus size={22} strokeWidth={3}/> Déclarer un écart
            </button>
          </div>
        </header>

        {/* TABLEAU DES RÉCLAMATIONS */}
        <div className="bg-slate-950/40 rounded-[4rem] border border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)] backdrop-blur-3xl">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] font-black uppercase text-slate-500 italic tracking-[0.2em]">
              <tr>
                <th className="p-10">Objet / Référence Scellée</th>
                <th className="p-10">Processus Impacté</th>
                <th className="p-10 text-center">Statut Flux</th>
                <th className="p-10 text-right">Contrôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 italic uppercase font-black text-xs">
              {filteredRecs.map(r => (
                <tr key={r.REC_Id} className="hover:bg-blue-600/5 transition-all group">
                  <td className="p-10">
                      <p className="text-sm font-black tracking-tight group-hover:text-blue-400 transition-all leading-none">{r.REC_Object}</p>
                      <p className="text-[9px] text-slate-600 mt-2 tracking-widest font-bold">REF: {r.REC_Reference}</p>
                  </td>
                  <td className="p-10 text-blue-500/80">{r.REC_Processus?.PR_Libelle || "NON ASSIGNÉ"}</td>
                  <td className="p-10 text-center">
                      <span className={`px-6 py-2.5 rounded-xl text-[9px] font-black border uppercase tracking-widest ${
                        r.REC_Status === 'REGLEE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                      }`}>
                          {r.REC_Status?.replace('_', ' ')}
                      </span>
                  </td>
                  <td className="p-10 text-right">
                    <button onClick={() => setSelectedRec(r)} className="p-4 bg-white/5 rounded-2xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all border-none cursor-pointer"><Eye size={20}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecs.length === 0 && (
            <div className="py-32 text-center opacity-20">
               <ShieldCheck size={80} className="mx-auto mb-4" />
               <p className="font-black uppercase tracking-[0.4em]">Aucune donnée détectée</p>
            </div>
          )}
        </div>

        {isCreateModalOpen && <CreateModal onClose={() => setIsCreateModalOpen(false)} onRefresh={fetchData} tiers={tiers} processus={processus} />}

        {/* --- DRAWER DE TRAITEMENT --- */}
        {selectedRec && (
          <>
            <div className="fixed inset-0 bg-black/98 backdrop-blur-xl z-110 animate-in fade-in duration-500" onClick={() => {setSelectedRec(null); setIsEditing(false);}} />
            <div className="fixed top-0 right-0 h-screen w-200 bg-[#0F172A] z-120 border-l border-white/10 p-16 flex flex-col italic shadow-4xl animate-in slide-in-from-right duration-700">
              <div className="flex justify-between items-center mb-14 border-b border-white/5 pb-8">
                <div>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Traitement <span className="text-blue-500">SMI</span></h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">Dossier de non-conformité opérationnel</p>
                </div>
                <button onClick={() => setSelectedRec(null)} className="p-5 bg-white/5 rounded-2xl hover:bg-red-500/20 hover:text-red-500 transition-all border-none cursor-pointer text-white"><X size={28}/></button>
              </div>

              <div className="flex-1 space-y-10 overflow-y-auto pr-6 custom-scrollbar font-bold italic">
                <div className="grid grid-cols-2 gap-6">
                   <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-3 tracking-widest">Statut du Flux</p>
                      <select 
                        disabled={!isEditing} 
                        className="bg-transparent text-sm font-black uppercase text-blue-500 outline-none w-full cursor-pointer disabled:opacity-100" 
                        value={selectedRec.REC_Status} 
                        onChange={e => setSelectedRec({...selectedRec, REC_Status: e.target.value})}
                      >
                          <option value="NOUVELLE">Nouvelle</option>
                          <option value="EN_COURS">En cours</option>
                          <option value="REGLEE">Réglée</option>
                      </select>
                   </div>
                   <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex flex-col justify-center">
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">Référence Indexée</p>
                      <p className="text-sm font-black uppercase text-white tracking-tighter truncate">{selectedRec.REC_Reference}</p>
                   </div>
                </div>

                <div className={`p-10 rounded-[3.5rem] border transition-all ${isEditing ? 'bg-blue-600/5 border-blue-500/20' : 'bg-white/5 border-white/10 opacity-60'}`}>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase mb-8 flex items-center gap-3 tracking-[0.4em] italic leading-none"><ShieldCheck size={18} className="text-blue-500"/> Responsabilité & Ancrage</h4>
                  <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-4">Objet de l&apos;écart</label>
                        <input readOnly={!isEditing} className={`w-full bg-[#0B0F1A] p-6 rounded-2xl text-sm font-black uppercase border outline-none text-white transition-all ${isEditing ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-transparent'}`} value={selectedRec.REC_Object} onChange={e => setSelectedRec({...selectedRec, REC_Object: e.target.value.toUpperCase()})} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-[9px] font-black text-slate-500 uppercase ml-4">Partie Intéressée (Tier)</label>
                          <select disabled={!isEditing} className="w-full bg-[#0B0F1A] p-6 rounded-2xl text-[10px] font-black uppercase border border-transparent outline-none text-white focus:border-blue-500 transition-all disabled:opacity-100" value={selectedRec.REC_TierId || ""} onChange={e => setSelectedRec({...selectedRec, REC_TierId: e.target.value})}>
                            {tiers.map((t: any) => <option key={t.TR_Id} value={t.TR_Id}>{t.TR_Name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] font-black text-slate-500 uppercase ml-4">Date de Résolution</label>
                          <input type="date" disabled={!isEditing} className="w-full bg-[#0B0F1A] p-6 rounded-2xl text-[10px] font-black border border-transparent outline-none text-white focus:border-blue-500 disabled:opacity-100" value={selectedRec.REC_Deadline ? selectedRec.REC_Deadline.split('T')[0] : ''} onChange={e => setSelectedRec({...selectedRec, REC_Deadline: e.target.value})} />
                        </div>
                      </div>
                  </div>
                </div>

                {/* ZONE ANALYTIQUE (§10.2) */}
                <div className="p-12 bg-slate-900/60 rounded-[4rem] border border-white/5 space-y-8">
                  <h4 className="text-[11px] font-black text-blue-500 uppercase italic flex items-center gap-3 tracking-[0.3em]"><BarChart3 size={20}/> Analyse des Causes & Solutions</h4>
                  <textarea 
                    readOnly={!isEditing} 
                    className={`w-full bg-[#0B0F1A] border p-8 rounded-[2.5rem] text-sm font-bold min-h-48 outline-none italic leading-relaxed transition-all ${isEditing ? 'border-blue-500 shadow-inner' : 'border-white/10'}`} 
                    value={selectedRec.REC_SolutionProposed || ''} 
                    onChange={e => setSelectedRec({...selectedRec, REC_SolutionProposed: e.target.value})} 
                    placeholder="Saisir l'analyse formelle et les solutions retenues..." 
                  />
                  
                  <div className="space-y-6">
                      <label className="text-[10px] font-black text-slate-600 uppercase italic tracking-widest">Documents de Preuve (§7.5)</label>
                      {selectedRec.REC_PreuveURL ? (
                          <div className="flex items-center justify-between p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] group">
                              <div className="flex items-center gap-6">
                                  <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500"><FileText size={32}/></div>
                                  <div className="flex flex-col font-black italic">
                                      <span className="text-[11px] truncate max-w-[18rem] text-white uppercase tracking-tighter">{selectedRec.REC_PreuveName || "DOCUMENT_OFFICIEL"}</span>
                                      <a href={`${API_BASE_URL}${selectedRec.REC_PreuveURL}`} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-400 underline mt-2 flex items-center gap-2"><ExternalLink size={14}/> Visualiser la preuve</a>
                                  </div>
                              </div>
                              {isEditing && <button onClick={() => setSelectedRec({...selectedRec, REC_PreuveURL: null})} className="p-4 text-red-500 hover:bg-red-500/10 rounded-2xl border-none cursor-pointer"><Trash2 size={24}/></button>}
                          </div>
                      ) : (
                          <div onClick={() => isEditing && fileInputRef.current?.click()} className={`border-3 border-dashed rounded-[3rem] p-12 flex flex-col items-center justify-center gap-4 transition-all ${isEditing ? 'border-white/10 cursor-pointer hover:border-blue-500/50 hover:bg-blue-600/5' : 'border-white/5 opacity-20'}`}>
                              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                              <UploadCloud size={40} className="text-slate-700"/>
                              <p className="text-[10px] font-black uppercase text-slate-500 italic tracking-[0.4em]">Déposer la preuve digitale</p>
                          </div>
                      )}
                  </div>
                </div>

                <div className="pt-8 flex flex-col gap-6">
                    {isEditing ? (
                      <button onClick={handleUpdate} disabled={submitting} className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white rounded-[3rem] font-black uppercase text-sm italic shadow-3xl shadow-blue-600/40 flex items-center justify-center gap-5 border-none cursor-pointer transition-all active:scale-95">
                          {submitting ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>} Sceller les modifications
                      </button>
                    ) : (
                      <button onClick={() => setIsEditing(true)} className="w-full py-8 bg-white/5 border border-white/10 text-white rounded-[3rem] font-black uppercase text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-4 border-none cursor-pointer italic shadow-xl">
                          <Edit3 size={24}/> Ouvrir le dossier en édition
                      </button>
                    )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// --- MODAL DE CRÉATION ÉLITE ---
function CreateModal({ onClose, onRefresh, tiers, processus }: any) {
    const [form, setForm] = useState({ 
      REC_Object: '', 
      REC_Description: '', 
      REC_TierId: '', 
      REC_ProcessusId: '',
      REC_Deadline: '',
      REC_SolutionProposed: '' 
    });
    const [saving, setSaving] = useState(false);
    
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!form.REC_TierId || !form.REC_ProcessusId) {
          toast.error("Ancrage Tier/Processus obligatoire");
          return;
        }

        setSaving(true);
        try {
          const payload = {
            ...form,
            REC_Object: form.REC_Object.toUpperCase(),
            REC_Deadline: form.REC_Deadline ? new Date(form.REC_Deadline).toISOString() : null,
            REC_SolutionProposed: form.REC_SolutionProposed || "" 
          };
          await apiClient.post('/reclamations', payload);
          toast.success("Réclamation enregistrée au registre SDE");
          onRefresh(); onClose();
        } catch (err: any) { 
          toast.error("Échec de l'initialisation du dossier");
        } finally { setSaving(false); }
    };
    
    return (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-200 flex items-center justify-center p-8 italic">
            <form onSubmit={handleSubmit} className="bg-[#0F172A] w-full max-w-3xl rounded-[4.5rem] border border-white/10 p-20 space-y-10 animate-in zoom-in-95 duration-500 shadow-[0_0_100px_rgba(37,99,235,0.15)] text-left">
                <div>
                  <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white leading-none">Saisie <span className="text-blue-500">Registre</span></h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-4 italic">Ouverture de dossier ISO 10002</p>
                </div>

                <div className="space-y-6">
                  <input required placeholder="OBJET DE LA RÉCLAMATION" className="w-full bg-white/5 border border-white/10 p-7 rounded-2xl font-black italic outline-none focus:border-blue-500 text-white uppercase text-sm tracking-tight transition-all" value={form.REC_Object} onChange={e => setForm({...form, REC_Object: e.target.value.toUpperCase()})} />
                  
                  <div className="grid grid-cols-2 gap-6">
                    <select required className="w-full bg-white/5 border border-white/10 p-7 rounded-2xl font-black outline-none text-white text-[11px] uppercase italic cursor-pointer focus:border-blue-500 transition-all" value={form.REC_TierId} onChange={e => setForm({...form, REC_TierId: e.target.value})}>
                      <option value="" className="bg-slate-900">-- PARTIE INTÉRESSÉE --</option>
                      {tiers.map((t: any) => <option key={t.TR_Id} value={t.TR_Id} className="bg-slate-900">{t.TR_Name}</option>)}
                    </select>
                    <select required className="w-full bg-white/5 border border-white/10 p-7 rounded-2xl font-black outline-none text-white text-[11px] uppercase italic cursor-pointer focus:border-blue-500 transition-all" value={form.REC_ProcessusId} onChange={e => setForm({...form, REC_ProcessusId: e.target.value})}>
                      <option value="" className="bg-slate-900">-- PROCESSUS --</option>
                      {processus.map((p: any) => <option key={p.PR_Id} value={p.PR_Id} className="bg-slate-900">{p.PR_Libelle}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-3 text-left">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Échéance Target (ISO)</label>
                    <input type="date" className="w-full bg-white/5 border border-white/10 p-7 rounded-2xl font-black outline-none text-white transition-all focus:border-blue-500" value={form.REC_Deadline} onChange={e => setForm({...form, REC_Deadline: e.target.value})} />
                  </div>
                  
                  <textarea required placeholder="DESCRIPTION CIRCONSTANCIELLE DE L'ÉCART" rows={4} className="w-full bg-white/5 border border-white/10 p-7 rounded-3xl font-bold outline-none text-white italic text-sm leading-relaxed transition-all focus:border-blue-500" value={form.REC_Description} onChange={e => setForm({...form, REC_Description: e.target.value})} />
                </div>

                <div className="flex flex-col gap-6 pt-4">
                  <button type="submit" disabled={saving} className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white rounded-[3rem] font-black uppercase text-xs italic shadow-3xl shadow-blue-600/40 flex items-center justify-center gap-4 border-none cursor-pointer transition-all active:scale-95">
                    {saving ? <Loader2 className="animate-spin" size={24}/> : <ShieldCheck size={24} />} Initialiser la Réclamation
                  </button>
                  <button type="button" onClick={onClose} className="text-slate-600 text-[11px] font-black uppercase tracking-[0.4em] hover:text-white transition-all text-center border-none bg-transparent cursor-pointer italic">Annuler la procédure</button>
                </div>
            </form>
        </div>
    );
}