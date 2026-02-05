/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react'; 
import apiClient from '@/core/api/api-client';
// 🟢 ATTENTION : Vérifie que ce chemin est correct. 
// Si ton fichier Sidebar est dans components, garde '@components/Sidebar'
// Si l'erreur persiste, essaie : '@/app/dashboard/sidebar'
import Sidebar from '@/app/dashboard/sidebar'; 

import { 
  Printer, Eye, X, Edit3, Save, Plus, 
  Send, ShieldCheck, UploadCloud, FileText, Trash2, ExternalLink, Activity, Users, Search, BarChart3, Loader2, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReclamationsPage() {
  const { data: session, status } = useSession();
  
  // Préparation des données Sidebar
  const user = session?.user as any;
  const isSuperAdmin = user?.U_Role === 'SUPER_ADMIN' || user?.email === 'ab.thiongane@qualisoft.sn';

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

  const API_BASE_URL = "https://elite.qualisoft.sn:3001";

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
      // Silencieux au premier chargement pour éviter le spam
      console.error(err);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredRecs = useMemo(() => {
    return recs.filter(r => 
      r.REC_Object?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.REC_Reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recs, searchTerm]);

  const handleUpdate = async () => {
    if (!selectedRec) return;
    if (!selectedRec.REC_SolutionProposed || selectedRec.REC_SolutionProposed.trim() === "") {
      toast.error("Analyse & Solutions obligatoire.");
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
      toast.error("Erreur mise à jour");
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

  if (status === "loading" || loading) return <div className="h-screen flex items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase animate-pulse">Chargement...</div>;

  return (
    <div className="flex min-h-screen bg-[#0B0F1A]">
      {/* SIDEBAR INTÉGRÉE AVEC PROPS */}
      <Sidebar user={user} isSuperAdmin={isSuperAdmin} />

      <main className="flex-1 ml-72 p-10 text-white italic font-sans overflow-y-auto h-screen">
        <header className="mb-10 flex justify-between items-end border-b border-white/5 pb-8">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter">Pilotage <span className="text-blue-500">Réclamations</span></h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 italic">Management ISO 10002</p>
          </div>
          <div className="flex gap-4">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input placeholder="FILTRER..." className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-black uppercase italic outline-none focus:border-blue-500 w-64"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
             <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] flex items-center gap-3 uppercase">
               <Plus size={18}/> Déclarer
             </button>
          </div>
        </header>

        <div className="bg-slate-900/40 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[9px] font-black uppercase text-slate-500 italic tracking-widest">
              <tr><th className="p-8">Objet</th><th className="p-8">Processus</th><th className="p-8 text-center">Statut</th><th className="p-8 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5 italic uppercase font-bold text-[11px]">
              {filteredRecs.map(r => (
                <tr key={r.REC_Id} className="hover:bg-white/5 transition-colors">
                  <td className="p-8">
                      <p className="text-xs font-black">{r.REC_Object}</p>
                      <p className="text-[9px] text-slate-500 mt-1">{r.REC_Reference}</p>
                  </td>
                  <td className="p-8 text-blue-500">{r.REC_Processus?.PR_Libelle || "-"}</td>
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
            <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[110]" onClick={() => {setSelectedRec(null); setIsEditing(false);}}>
               {/* Contenu du tiroir simplifié pour la lisibilité */}
               <div className="fixed top-0 right-0 h-screen w-[45rem] bg-[#0F172A] z-[120] border-l border-white/10 p-12 flex flex-col italic shadow-4xl" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                    <h2 className="text-3xl font-black uppercase italic text-white">Détails <span className="text-blue-500">Dossier</span></h2>
                    <button onClick={() => setSelectedRec(null)} className="p-4 bg-white/5 rounded-2xl hover:text-red-500"><X size={24}/></button>
                  </div>
                  <div className="flex-1 space-y-6 overflow-y-auto pr-4">
                     <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
                        <label className="text-[8px] font-black text-slate-500 uppercase">Objet</label>
                        <input readOnly={!isEditing} className="w-full bg-transparent text-sm font-black text-white outline-none mt-2" value={selectedRec.REC_Object} onChange={e => setSelectedRec({...selectedRec, REC_Object: e.target.value})} />
                     </div>
                     
                     <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
                        <label className="text-[8px] font-black text-slate-500 uppercase">Analyse & Solutions</label>
                        <textarea readOnly={!isEditing} className="w-full bg-transparent text-xs font-bold text-white outline-none mt-2 h-32" value={selectedRec.REC_SolutionProposed} onChange={e => setSelectedRec({...selectedRec, REC_SolutionProposed: e.target.value})} />
                     </div>
                     
                     {/* Boutons d'action */}
                     {isEditing ? (
                        <button onClick={handleUpdate} disabled={submitting} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black uppercase text-xs">
                           {submitting ? "Sauvegarde..." : "Enregistrer"}
                        </button>
                     ) : (
                        <button onClick={() => setIsEditing(true)} className="w-full py-6 bg-white/5 hover:bg-white/10 text-white rounded-[2rem] font-black uppercase text-xs">
                           Modifier
                        </button>
                     )}
                  </div>
               </div>
            </div>
        )}
      </main>
    </div>
  );
}

function CreateModal({ onClose, onRefresh, tiers, processus }: any) {
    const [form, setForm] = useState({ REC_Object: '', REC_Description: '', REC_TierId: '', REC_ProcessusId: '', REC_Deadline: '', REC_SolutionProposed: '' });
    const [saving, setSaving] = useState(false);
    
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setSaving(true);
        try {
          await apiClient.post('/reclamations', { ...form, REC_Object: form.REC_Object.toUpperCase(), REC_Deadline: form.REC_Deadline ? new Date(form.REC_Deadline).toISOString() : null });
          onRefresh(); onClose(); toast.success("Enregistré");
        } catch (err: any) { toast.error("Erreur"); } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-6 italic font-black uppercase">
            <form onSubmit={handleSubmit} className="bg-[#0F172A] w-full max-w-lg rounded-[3rem] border border-white/10 p-10 space-y-6">
                <h2 className="text-3xl font-black text-white">Nouvelle <span className="text-blue-500">Réclamation</span></h2>
                <input required placeholder="OBJET" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-black text-white outline-none" value={form.REC_Object} onChange={e => setForm({...form, REC_Object: e.target.value.toUpperCase()})} />
                
                <div className="grid grid-cols-2 gap-4">
                    <select required className="bg-white/5 border border-white/10 p-5 rounded-2xl text-[10px] text-white outline-none" value={form.REC_TierId} onChange={e => setForm({...form, REC_TierId: e.target.value})}>
                        <option value="">CLIENT</option>
                        {tiers.map((t: any) => <option key={t.TR_Id} value={t.TR_Id}>{t.TR_Name}</option>)}
                    </select>
                    <select required className="bg-white/5 border border-white/10 p-5 rounded-2xl text-[10px] text-white outline-none" value={form.REC_ProcessusId} onChange={e => setForm({...form, REC_ProcessusId: e.target.value})}>
                        <option value="">PROCESSUS</option>
                        {processus.map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
                    </select>
                </div>

                <textarea required placeholder="DESCRIPTION" rows={3} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-white outline-none" value={form.REC_Description} onChange={e => setForm({...form, REC_Description: e.target.value})} />
                
                <button type="submit" disabled={saving} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black uppercase text-xs">
                    {saving ? "..." : "VALIDER"}
                </button>
                <button type="button" onClick={onClose} className="w-full text-slate-500 text-[10px] uppercase">Annuler</button>
            </form>
        </div>
    );
}