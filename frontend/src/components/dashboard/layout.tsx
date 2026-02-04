/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
// 1. IMPORT NECESSAIRE POUR LA SESSION CLIENT
import { useSession } from 'next-auth/react'; 
import apiClient from '@/core/api/api-client';

// 2. IMPORT CORRECT DE LA SIDEBAR (Chemin que tu m'as confirmé)
import Sidebar from '@/app/dashboard/sidebar'; 

import { 
  Printer, Eye, X, Edit3, Save, Plus, 
  Send, ShieldCheck, UploadCloud, FileText, Trash2, ExternalLink, Activity, Users, Search, BarChart3, Loader2, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReclamationsPage() {
  // 3. RECUPERATION DE LA SESSION ET DES DROITS
  const { data: session, status } = useSession();
  
  // Préparation des données pour la Sidebar
  const user = session?.user as any;
  const isSuperAdmin = user?.U_Role === 'SUPER_ADMIN' || user?.email === 'ab.thiongane@qualisoft.sn';

  // --- ÉTATS ---
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

  // --- FETCH DATA ---
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
      // On ne montre l'erreur que si ce n'est pas juste un chargement initial
      console.error("Erreur Sync", err);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- FILTRES ---
  const filteredRecs = useMemo(() => {
    return recs.filter(r => 
      r.REC_Object?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.REC_Reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recs, searchTerm]);

  // --- ACTIONS ---
  const handleUpdate = async () => {
    if (!selectedRec) return;
    
    if (!selectedRec.REC_SolutionProposed || selectedRec.REC_SolutionProposed.trim() === "") {
      toast.error("Le champ 'Analyse & Solutions' est obligatoire.");
      return;
    }

    if (!selectedRec.REC_TierId || !selectedRec.REC_ProcessusId) {
      toast.error("Tier et Processus obligatoires");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        REC_Object: selectedRec.REC_Object,
        REC_Description: selectedRec.REC_Description,
        REC_SolutionProposed: selectedRec.REC_SolutionProposed,
        REC_Status: selectedRec.REC_Status,
        REC_ProcessusId: selectedRec.REC_ProcessusId,
        REC_TierId: selectedRec.REC_TierId,
        REC_PreuveURL: selectedRec.REC_PreuveURL || null,
        REC_PreuveName: selectedRec.REC_PreuveName || null,
        REC_Gravity: selectedRec.REC_Gravity || 'MEDIUM',
        REC_Deadline: selectedRec.REC_Deadline ? new Date(selectedRec.REC_Deadline).toISOString() : null
      };

      await apiClient.patch(`/reclamations/${selectedRec.REC_Id}`, payload);
      
      toast.success("Mise à jour réussie");
      setIsEditing(false); 
      fetchData();
      setSelectedRec(null);
    } catch (e: any) { 
      const msg = e.response?.data?.message || "Erreur lors de la mise à jour";
      toast.error(`Échec: ${msg}`);
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
      toast.success("Fichier chargé");
    } catch (err: any) { 
      toast.error("Erreur d'upload"); 
    } finally { setUploading(false); }
  };

  // --- RENDU ---
  // Protection contre le rendu avant chargement de la session
  if (status === "loading" || loading) return <div className="h-screen flex items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase animate-pulse">Chargement Qualisoft...</div>;

  return (
    <div className="flex min-h-screen bg-[#0B0F1A]">
      
      {/* 4. CORRECTION MAJEURE : PASSAGE DES PROPS OBLIGATOIRES */}
      <Sidebar user={user} isSuperAdmin={isSuperAdmin} />

      {/* Contenu Principal - Décalage ml-72 pour ne pas être caché par la Sidebar */}
      <main className="flex-1 ml-72 p-10 text-white italic font-sans overflow-y-auto h-screen">
        
        <header className="mb-10 flex justify-between items-end border-b border-white/5 pb-8">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter">Pilotage <span className="text-blue-500">Réclamations</span></h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 italic">Management ISO 10002</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input placeholder="FILTRER LE REGISTRE..." className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-black uppercase italic outline-none focus:border-blue-500 w-64 shadow-inner"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] flex items-center gap-3 shadow-xl italic transition-all uppercase">
              <Plus size={18}/> Déclarer un écart
            </button>
          </div>
        </header>

        <div className="bg-slate-900/40 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[9px] font-black uppercase text-slate-500 italic tracking-widest">
              <tr><th className="p-8">Objet / Référence</th><th className="p-8">Processus Maître</th><th className="p-8 text-center">Statut</th><th className="p-8 text-right">Pilotage</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5 italic uppercase font-bold text-[11px]">
              {filteredRecs.map(r => (
                <tr key={r.REC_Id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-8">
                      <p className="text-xs font-black tracking-tight group-hover:text-blue-400 transition-all">{r.REC_Object}</p>
                      <p className="text-[9px] text-slate-500 mt-1 tracking-widest">{r.REC_Reference}</p>
                  </td>
                  <td className="p-8 text-blue-500">{r.REC_Processus?.PR_Libelle || "NON ASSIGNÉ"}</td>
                  <td className="p-8 text-center">
                      <span className={`px-4 py-2 rounded-xl text-[8px] font-black border ${r.REC_Status === 'REGLEE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                          {r.REC_Status?.replace('_', ' ')}
                      </span>
                  </td>
                  <td className="p-8 text-right">
                    <button onClick={() => setSelectedRec(r)} className="p-4 bg-white/5 rounded-2xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all"><Eye size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isCreateModalOpen && <CreateModal onClose={() => setIsCreateModalOpen(false)} onRefresh={fetchData} tiers={tiers} processus={processus} />}

        {selectedRec && (
          <>
            <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[110]" onClick={() => {setSelectedRec(null); setIsEditing(false);}} />
            <div className="fixed top-0 right-0 h-screen w-[45rem] bg-[#0F172A] z-[120] border-l border-white/10 p-12 flex flex-col italic shadow-4xl animate-in slide-in-from-right duration-500">
              <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Traitement <span className="text-blue-500">Opérationnel</span></h2>
                <button onClick={() => setSelectedRec(null)} className="p-4 bg-white/5 rounded-2xl hover:text-red-500 transition-all"><X size={24}/></button>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto pr-4 scrollbar-hide font-bold italic">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
                      <p className="text-[8px] font-black text-slate-500 uppercase mb-2">Statut actuel</p>
                      <select disabled={!isEditing} className="bg-transparent text-xs font-black uppercase text-blue-500 outline-none w-full" value={selectedRec.REC_Status} onChange={e => setSelectedRec({...selectedRec, REC_Status: e.target.value})}>
                          <option value="NOUVELLE">Nouvelle</option>
                          <option value="EN_COURS">En cours</option>
                          <option value="REGLEE">Réglée</option>
                      </select>
                   </div>
                   <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
                      <p className="text-[8px] font-black text-slate-500 uppercase mb-2">Référence</p>
                      <p className="text-xs font-black uppercase text-white truncate">{selectedRec.REC_Reference}</p>
                   </div>
                </div>

                <div className={`p-8 rounded-[3rem] border transition-all ${isEditing ? 'bg-blue-600/5 border-blue-500/20 shadow-inner' : 'bg-white/5 border-white/10 opacity-80'}`}>
                  <h4 className="text-[9px] font-black text-slate-500 uppercase mb-6 flex items-center gap-2 tracking-widest italic"><ShieldCheck size={14}/> Responsabilité SMI</h4>
                  <div className="space-y-6">
                      <input readOnly={!isEditing} className={`w-full bg-[#0B0F1A] p-5 rounded-2xl text-sm font-black uppercase border outline-none text-white ${isEditing ? 'border-blue-500' : 'border-transparent'}`} value={selectedRec.REC_Object} onChange={e => setSelectedRec({...selectedRec, REC_Object: e.target.value.toUpperCase()})} />
                      
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Tier Émetteur *</label>
                        <select disabled={!isEditing} className={`w-full bg-[#0B0F1A] p-5 rounded-2xl text-[10px] font-black uppercase border outline-none text-white ${isEditing ? 'border-blue-500' : 'border-transparent'}`} value={selectedRec.REC_TierId || ""} onChange={e => setSelectedRec({...selectedRec, REC_TierId: e.target.value})}>
                          <option value="">SÉLECTIONNER UN TIER</option>
                          {tiers.map((t: any) => <option key={t.TR_Id} value={t.TR_Id}>{t.TR_Name}</option>)}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Processus Maître *</label>
                        <select disabled={!isEditing} className={`w-full bg-[#0B0F1A] p-5 rounded-2xl text-[10px] font-black uppercase border outline-none text-white ${isEditing ? 'border-blue-500' : 'border-transparent'}`} value={selectedRec.REC_ProcessusId || ""} onChange={e => setSelectedRec({...selectedRec, REC_ProcessusId: e.target.value})}>
                          <option value="">ASSIGNER UN PROCESSUS</option>
                          {processus.map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Date Limite</label>
                        <input type="date" disabled={!isEditing} className={`w-full bg-[#0B0F1A] p-5 rounded-2xl text-[10px] font-black border outline-none text-white ${isEditing ? 'border-blue-500' : 'border-transparent'}`} value={selectedRec.REC_Deadline ? selectedRec.REC_Deadline.split('T')[0] : ''} onChange={e => setSelectedRec({...selectedRec, REC_Deadline: e.target.value})} />
                      </div>
                  </div>
                </div>

                <div className="p-10 bg-slate-900/40 rounded-[3.5rem] border border-white/5 space-y-6">
                  <h4 className="text-[9px] font-black text-blue-500 uppercase italic flex items-center gap-2"><BarChart3 size={16}/> Analyse & Solutions <span className="text-red-500">*</span></h4>
                  <textarea 
                    readOnly={!isEditing} 
                    className={`w-full bg-[#0B0F1A] border p-6 rounded-[2rem] text-xs font-bold min-h-32 outline-none italic leading-relaxed transition-all ${isEditing ? 'border-blue-500 shadow-inner' : 'border-white/10'}`} 
                    value={selectedRec.REC_SolutionProposed || ''} 
                    onChange={e => setSelectedRec({...selectedRec, REC_SolutionProposed: e.target.value})} 
                    placeholder="Le champ Analyse & Solutions est obligatoire pour le traitement..." 
                  />
                  
                  <div className="space-y-4">
                      <label className="text-[8px] font-black text-slate-500 uppercase italic">Preuve de Traitement (§7.5)</label>
                      {selectedRec.REC_PreuveURL ? (
                          <div className="flex items-center justify-between p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
                              <div className="flex items-center gap-4">
                                  <FileText className="text-emerald-500" size={24}/>
                                  <div className="flex flex-col font-black italic">
                                      <span className="text-[10px] truncate max-w-[15rem] text-white uppercase">{selectedRec.REC_PreuveName || "DOC_PREUVE"}</span>
                                      <a href={`${API_BASE_URL}${selectedRec.REC_PreuveURL}`} target="_blank" rel="noreferrer" className="text-[9px] text-emerald-400 underline mt-1 flex items-center gap-1"><ExternalLink size={12}/> Voir</a>
                                  </div>
                              </div>
                              {isEditing && <button onClick={() => setSelectedRec({...selectedRec, REC_PreuveURL: null})} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 size={18}/></button>}
                          </div>
                      ) : (
                          <div onClick={() => isEditing && fileInputRef.current?.click()} className={`border-2 border-dashed rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-2 transition-all ${isEditing ? 'border-white/10 cursor-pointer hover:border-blue-500/50' : 'border-white/5 opacity-40'}`}>
                              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                              <UploadCloud size={24} className="text-slate-600"/>
                              <p className="text-[8px] font-black uppercase text-slate-500 italic">Joindre une preuve</p>
                          </div>
                      )}
                  </div>
                </div>

                <div className="pt-6 flex flex-col gap-4">
                    {isEditing ? (
                      <button onClick={handleUpdate} disabled={submitting} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black uppercase text-xs italic shadow-2xl flex items-center justify-center gap-4">
                          {submitting ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} Sauvegarder le traitement
                      </button>
                    ) : (
                      <button onClick={() => setIsEditing(true)} className="w-full py-6 bg-white/5 border border-white/10 text-white rounded-[2rem] font-black uppercase text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                          <Edit3 size={20}/> Éditer le dossier
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

// --- MODAL DE CRÉATION ---
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
          toast.error("Tier et Processus obligatoires");
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
          onRefresh(); 
          onClose();
          toast.success("Réclamation enregistrée");
        } catch (err: any) { 
          toast.error("Échec de l'enregistrement");
        } finally { setSaving(false); }
    };
    
    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-6 italic font-black uppercase">
            <form onSubmit={handleSubmit} className="bg-[#0F172A] w-full max-w-2xl rounded-[4rem] border border-white/10 p-16 space-y-6 animate-in zoom-in-95">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Saisie <span className="text-blue-500">Réclamation</span></h2>
                <div className="space-y-4">
                  <input required placeholder="OBJET" className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-black italic outline-none focus:border-blue-500 text-white" value={form.REC_Object} onChange={e => setForm({...form, REC_Object: e.target.value.toUpperCase()})} />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <select required className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-black outline-none text-white text-[10px]" value={form.REC_TierId} onChange={e => setForm({...form, REC_TierId: e.target.value})}>
                      <option value="">-- CLIENT --</option>
                      {tiers.map((t: any) => <option key={t.TR_Id} value={t.TR_Id}>{t.TR_Name}</option>)}
                    </select>
                    <select required className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-black outline-none text-white text-[10px]" value={form.REC_ProcessusId} onChange={e => setForm({...form, REC_ProcessusId: e.target.value})}>
                      <option value="">-- PROCESSUS --</option>
                      {processus.map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Date Limite (optionnelle)</label>
                    <input type="date" className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-black outline-none text-white" value={form.REC_Deadline} onChange={e => setForm({...form, REC_Deadline: e.target.value})} />
                  </div>
                  
                  <textarea required placeholder="DESCRIPTION DE L'ÉCART" rows={3} className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-bold outline-none text-white italic" value={form.REC_Description} onChange={e => setForm({...form, REC_Description: e.target.value})} />
                  
                  <textarea placeholder="ANALYSE & SOLUTIONS INITIALES" rows={3} className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-bold outline-none text-white italic focus:border-blue-500" value={form.REC_SolutionProposed} onChange={e => setForm({...form, REC_SolutionProposed: e.target.value})} />
                </div>
                <div className="flex flex-col gap-4">
                  <button type="submit" disabled={saving} className="w-full py-7 bg-blue-600 hover:bg-blue-500 text-white rounded-[2.5rem] font-black uppercase flex items-center justify-center gap-3">
                    {saving ? <Loader2 className="animate-spin"/> : "Enregistrer la Réclamation"}
                  </button>
                  <button type="button" onClick={onClose} className="text-slate-500 text-[10px] uppercase tracking-widest hover:text-white transition-all text-center">Annuler</button>
                </div>
            </form>
        </div>
    );
}