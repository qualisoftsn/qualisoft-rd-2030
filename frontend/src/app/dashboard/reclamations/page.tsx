/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Printer, Eye, X, Edit3, Save, Plus, Globe, 
  Send, AlertCircle, CheckCircle, ShieldCheck, UploadCloud, FileText, Trash2, ExternalLink 
} from 'lucide-react';

export default function ReclamationsPage() {
  const [recs, setRecs] = useState<any[]>([]);
  const [processus, setProcessus] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  const [selectedRec, setSelectedRec] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Adresse de base de ton backend pour les fichiers
  const API_BASE_URL = "https://elite.qualisoft.sn:3000"; 

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resRec, resProcs, resTiers] = await Promise.all([
        apiClient.get('/reclamations'),
        apiClient.get('/processus'),
        apiClient.get('/tiers')
      ]);
      setRecs(resRec.data);
      setProcessus(resProcs.data);
      setTiers(resTiers.data);
    } catch (err) { console.error("Erreur Sync Qualisoft"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = async () => {
    try {
      await apiClient.patch(`/reclamations/${selectedRec.REC_Id}`, selectedRec);
      setIsEditing(false); 
      fetchData();
      alert("Traitement enregistré avec succès !");
    } catch (e) { alert("Erreur lors de la mise à jour."); }
  };

  const handleLinkPAQ = async () => {
    if (!selectedRec.REC_ProcessusId) return alert("Assignez un processus d'abord.");
    try {
      await apiClient.post(`/reclamations/${selectedRec.REC_Id}/link-paq`);
      fetchData(); 
      setSelectedRec(null);
      alert("Processus informé. Statut : EN COURS.");
    } catch (e) { alert("Erreur transmission."); }
  };

  // --- LOGIQUE D'UPLOAD CORRIGÉE ---
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

      // 🚩 CRUCIAL : On met à jour l'état selectedRec avec les données du serveur
      // Cela force React à réafficher la zone avec le lien
      setSelectedRec((prev: any) => ({
        ...prev,
        REC_PreuveUrl: res.data.url,
        REC_PreuveName: res.data.filename || file.name
      }));

      alert("Fichier joint avec succès ! N'oubliez pas de sauvegarder.");
    } catch (err) {
      alert("Erreur lors de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  const isLocked = selectedRec?.REC_Status !== 'NOUVELLE';

  if (loading) return <div className="ml-72 h-screen flex items-center justify-center bg-[#0B0F1A] text-blue-500 font-black uppercase animate-pulse italic">Synchronisation...</div>;

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-10 ml-72 text-white italic relative print:bg-white print:ml-0 print:text-black">
      
      {/* HEADER PAGE */}
      <header className="mb-10 flex justify-between items-end border-b border-white/5 pb-8 no-print">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter">Pilotage <span className="text-blue-500">Réclamations</span></h1>
        <div className="flex gap-3">
          <button onClick={() => setIsCreateModalOpen(true)} className="bg-white text-slate-900 px-6 py-4 rounded-2xl font-black text-[10px] flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-xl italic">
            <Plus size={18}/> DÉCLARER UNE RÉCLAMATION
          </button>
        </div>
      </header>

      {/* TABLEAU REGISTRE */}
      <div className="bg-slate-900/40 rounded-[3rem] border border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[9px] font-black uppercase text-slate-500 italic">
            <tr><th className="p-6">Référence / Objet</th><th className="p-6">Processus</th><th className="p-6 text-center">Statut</th><th className="p-6 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {recs.map(r => (
              <tr key={r.REC_Id} className="hover:bg-white/5 transition-colors group">
                <td className="p-6">
                    <p className="text-xs font-black uppercase italic tracking-tight">{r.REC_Object}</p>
                    <p className="text-[9px] text-blue-500 font-bold mt-1">{r.REC_Reference}</p>
                </td>
                <td className="p-6 text-[10px] font-black uppercase">{r.processusLibelle}</td>
                <td className="p-6 text-center">
                    <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase ${r.REC_Status === 'TRAITEE' ? 'bg-emerald-500 text-white' : 'bg-orange-500/20 text-orange-500'}`}>
                        {r.REC_Status.replace('_', ' ')}
                    </span>
                </td>
                <td className="p-6 text-right no-print">
                  <button onClick={() => setSelectedRec(r)} className="p-3 bg-white/5 rounded-xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all"><Eye size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen && <CreateModal onClose={() => setIsCreateModalOpen(false)} onRefresh={fetchData} tiers={tiers} />}

      {/* 🚩 TIROIR DE PILOTAGE (DRAWER) */}
      {selectedRec && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-110 no-print" onClick={() => {setSelectedRec(null); setIsEditing(false);}} />
          <div className="fixed top-0 right-0 h-screen w-150 bg-[#0F172A] z-120 border-l border-white/10 p-10 flex flex-col no-print italic shadow-2xl">
            
            <div className="flex justify-between items-center mb-10">
              <button onClick={() => setIsEditing(!isEditing)} className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-2">
                {isEditing ? <><X size={14}/> ANNULER</> : <><Edit3 size={14}/> PILOTER LA RÉPONSE</>}
              </button>
              <button onClick={() => setSelectedRec(null)} className="p-3 bg-white/5 rounded-xl"><X size={18}/></button>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto pr-2 scrollbar-hide">
              {/* SECTION IDENTITÉ FIGÉE */}
              <div className={`p-8 rounded-[2.5rem] border ${isLocked ? 'bg-slate-800/40 border-white/5 opacity-60' : 'bg-white/5 border-white/10'}`}>
                <h4 className="text-[9px] font-black text-slate-500 uppercase mb-6 flex items-center gap-2 italic">
                    <ShieldCheck size={14}/> Identité {isLocked && "(Figée)"}
                </h4>
                <div className="space-y-4">
                    <input readOnly={isLocked} className="w-full bg-transparent p-2 text-xl font-black uppercase outline-none" value={selectedRec.REC_Object} onChange={e => setSelectedRec({...selectedRec, REC_Object: e.target.value})} />
                    <p className="p-2 text-[10px] font-black text-blue-500 uppercase">Responsable : {selectedRec.processusLibelle}</p>
                </div>
              </div>

              {/* 📝 SECTION PREUVES & DOCUMENTS (ZÔNE CRITIQUE) */}
              <div className="p-8 bg-blue-600/5 rounded-[2.5rem] border border-blue-500/10 space-y-6 italic">
                <h4 className="text-[9px] font-black text-blue-500 uppercase italic flex items-center gap-2">
                    <CheckCircle size={14}/> Analyse & Preuves de Traitement
                </h4>
                
                <div className="space-y-4">
                    <textarea 
                        className="w-full bg-[#0B0F1A] border border-white/10 p-5 rounded-3xl text-xs font-bold min-h-30 outline-none italic" 
                        value={selectedRec.REC_SolutionProposed || ''} 
                        onChange={e => setSelectedRec({...selectedRec, REC_SolutionProposed: e.target.value})} 
                        placeholder="Décrire ici les actions correctives..." 
                    />
                    
                    {/* --- AFFICHAGE DU FICHIER OU BOUTON UPLOAD --- */}
                    <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase text-slate-500 ml-2 italic">Document de preuve (PDF, Photo)</label>
                        
                        {selectedRec.REC_PreuveUrl ? (
                            <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in fade-in zoom-in duration-300">
                                <div className="flex items-center gap-3">
                                    <FileText size={20} className="text-emerald-500"/>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold italic truncate max-w-45 text-white">
                                            {selectedRec.REC_PreuveName || "Preuve_jointe"}
                                        </span>
                                        <a 
                                            href={`${API_BASE_URL}${selectedRec.REC_PreuveUrl}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-[8px] text-emerald-400 underline uppercase flex items-center gap-1 mt-1 font-black"
                                        >
                                            <ExternalLink size={10}/> Visualiser le document
                                        </a>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedRec({...selectedRec, REC_PreuveUrl: null, REC_PreuveName: null})} 
                                    className="p-2 text-red-500 hover:bg-white/10 rounded-lg"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        ) : (
                            <div 
                                onClick={() => fileInputRef.current?.click()} 
                                className="border-2 border-dashed border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                            >
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                                {uploading ? (
                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <UploadCloud size={24} className="text-slate-500"/>
                                        <p className="text-[9px] font-black uppercase text-slate-500 italic">Cliquer pour joindre une preuve</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="space-y-4">
                  {isEditing && (
                    <button onClick={handleUpdate} className="w-full py-5 bg-blue-600 rounded-3xl font-black uppercase text-xs italic shadow-xl">
                        <Save size={18} className="inline mr-2"/> Sauvegarder & Clôturer
                    </button>
                  )}
                  {selectedRec.REC_Status === 'NOUVELLE' && (
                    <button onClick={handleLinkPAQ} className="w-full py-5 bg-white text-slate-900 rounded-3xl font-black uppercase text-[10px] italic shadow-xl">
                        <Send size={18} className="inline mr-2"/> Informer le Processus
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

// Modal de Saisie
function CreateModal({ onClose, onRefresh, tiers }: any) {
    const [form, setForm] = useState({ REC_Object: '', REC_Description: '', REC_TierId: '' });
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        await apiClient.post('/reclamations', form);
        onRefresh(); onClose();
    };
    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-200 flex items-center justify-center p-6 italic">
            <form onSubmit={handleSubmit} className="bg-[#0F172A] w-full max-w-xl rounded-[3rem] border border-white/10 p-12 space-y-8 shadow-2xl">
                <h2 className="text-4xl font-black uppercase italic">Saisie <span className="text-blue-500">Réclamation</span></h2>
                <input required placeholder="OBJET" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-black uppercase italic" value={form.REC_Object} onChange={e => setForm({...form, REC_Object: e.target.value})} />
                <select required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-black uppercase italic" value={form.REC_TierId} onChange={e => setForm({...form, REC_TierId: e.target.value})}>
                    <option value="">-- Client --</option>{tiers.map((t: any) => <option key={t.TR_Id} value={t.TR_Id}>{t.TR_Name}</option>)}
                </select>
                <textarea required placeholder="DESCRIPTION" rows={4} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold italic" value={form.REC_Description} onChange={e => setForm({...form, REC_Description: e.target.value})} />
                <button type="submit" className="w-full py-6 bg-blue-600 rounded-4xl font-black uppercase italic shadow-xl">Enregistrer</button>
                <button type="button" onClick={onClose} className="w-full text-slate-500 font-black uppercase text-[10px]">Annuler</button>
            </form>
        </div>
    );
}